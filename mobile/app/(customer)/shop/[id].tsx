import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ShopService } from '../../../services/shop.service';
import { ProductService } from '../../../services/product.service';
import { ShopResponse, ProductResponse } from '../../../types';
import { ProductCard } from '../../../components/ProductCard';
import { LoadingState } from '../../../components/LoadingState';
import { ErrorState } from '../../../components/ErrorState';
import { Button } from '../../../components/Button';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { Theme } from '../../../constants/theme';

export default function ShopDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [shop, setShop] = useState<ShopResponse | null>(null);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadShopDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setErrorMsg(null);

      const shopData = await ShopService.getShopById(id);
      setShop(shopData);

      try {
        const productData = await ProductService.getProductsByShop(id);
        setProducts(productData);
      } catch {
        setProducts([]);
      }
    } catch (err: any) {
      console.warn('[ShopDetailsScreen] Error loading shop:', err);
      const status = err.response?.status;
      if (status === 404) {
        setErrorMsg('Shop not found or is no longer available.');
      } else {
        setErrorMsg('Unable to load shop details. Please check connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShopDetails();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LoadingState message="Loading shop details..." />
      </SafeAreaView>
    );
  }

  if (errorMsg || !shop) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <ErrorState
          title="Shop Unavailable"
          message={errorMsg || 'Failed to load shop information.'}
          onRetry={loadShopDetails}
        />
      </SafeAreaView>
    );
  }

  const isAvailable = shop.status === 'ACTIVE';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {shop.shopName}
          </Text>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-social-outline" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Hero Image / Placeholder Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerPlaceholder}>
            <Ionicons name="storefront" size={48} color={Colors.primaryDeep} />
          </View>
          <View
            style={[
              styles.statusBadge,
              isAvailable ? styles.openBadge : styles.closedBadge,
            ]}
          >
            <Text style={styles.statusBadgeText}>
              {isAvailable ? 'OPEN NOW' : shop.status}
            </Text>
          </View>
        </View>

        {/* Identity & Metadata Section */}
        <View style={styles.identityCard}>
          <Text style={styles.shopTitle}>{shop.shopName}</Text>
          <Text style={styles.categorySub}>{shop.category} • Express Pickup</Text>

          {shop.description ? (
            <Text style={styles.descriptionText}>{shop.description}</Text>
          ) : null}

          <View style={styles.infoRowGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={18} color={Colors.primaryDeep} />
              <Text style={styles.infoItemText}>
                {shop.address}{shop.city ? `, ${shop.city}` : ''}
              </Text>
            </View>

            {shop.openingTime && shop.closingTime ? (
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={18} color={Colors.primaryDeep} />
                <Text style={styles.infoItemText}>
                  {shop.openingTime} - {shop.closingTime}
                </Text>
              </View>
            ) : null}

            {shop.phone ? (
              <View style={styles.infoItem}>
                <Ionicons name="call-outline" size={18} color={Colors.primaryDeep} />
                <Text style={styles.infoItemText}>{shop.phone}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Action / Ordering Warning Banner */}
        {!isAvailable && (
          <View style={styles.warningCard}>
            <Ionicons name="alert-circle" size={20} color={Colors.error} />
            <Text style={styles.warningText}>
              This shop is currently {shop.status.toLowerCase()}. Pre-ordering is disabled.
            </Text>
          </View>
        )}

        {/* Products Section Header */}
        <View style={styles.productsHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Shop Products</Text>
            <Text style={styles.sectionSubtitle}>
              {products.length} {products.length === 1 ? 'item' : 'items'} available
            </Text>
          </View>

          <TouchableOpacity
            style={styles.viewAllProductsButton}
            onPress={() => router.push(`/(customer)/shop/${shop.id}/products` as any)}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.primaryDeep} />
          </TouchableOpacity>
        </View>

        {/* Products Preview List */}
        {products.length > 0 ? (
          products.slice(0, 5).map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))
        ) : (
          <View style={styles.emptyProductsCard}>
            <Ionicons name="cube-outline" size={32} color={Colors.secondaryText} />
            <Text style={styles.emptyProductsTitle}>No products listed yet</Text>
            <Text style={styles.emptyProductsSub}>
              This shop hasn't added products to their inventory catalog yet.
            </Text>
          </View>
        )}

        {/* Full Products CTA Button */}
        {products.length > 0 && (
          <Button
            title={`Browse All ${products.length} Products`}
            onPress={() => router.push(`/(customer)/shop/${shop.id}/products` as any)}
            style={styles.fullProductsCta}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Theme.spacing.xs,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    height: 140,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Theme.spacing.md,
  },
  bannerPlaceholder: {
    flex: 1,
    backgroundColor: Colors.lightSage,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: Theme.spacing.sm,
    right: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.full,
  },
  openBadge: {
    backgroundColor: Colors.primaryDeep,
  },
  closedBadge: {
    backgroundColor: Colors.secondaryText,
  },
  statusBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 0.5,
  },
  identityCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Theme.spacing.md,
  },
  shopTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginBottom: 2,
  },
  categorySub: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.secondaryText,
    marginBottom: Theme.spacing.sm,
  },
  descriptionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: Theme.spacing.md,
  },
  infoRowGrid: {
    gap: Theme.spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Theme.spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItemText: {
    fontSize: Typography.fontSize.xs + 1,
    color: Colors.text,
    marginLeft: Theme.spacing.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  warningText: {
    color: Colors.error,
    fontSize: Typography.fontSize.xs + 1,
    fontFamily: Typography.fontFamily.medium,
    marginLeft: 8,
    flex: 1,
  },
  productsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
    marginTop: Theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
  },
  viewAllProductsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: Typography.fontSize.xs + 1,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
    marginRight: 2,
  },
  emptyProductsCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Theme.spacing.md,
  },
  emptyProductsTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginTop: Theme.spacing.xs,
  },
  emptyProductsSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginTop: 2,
  },
  fullProductsCta: {
    marginTop: Theme.spacing.xs,
  },
});
