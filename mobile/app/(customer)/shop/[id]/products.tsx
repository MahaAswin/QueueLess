import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ProductService } from '../../../../services/product.service';
import { ShopService } from '../../../../services/shop.service';
import { ProductResponse, ShopResponse } from '../../../../types';
import { ProductCard } from '../../../../components/ProductCard';
import { SearchBar } from '../../../../components/SearchBar';
import { LoadingState } from '../../../../components/LoadingState';
import { EmptyState } from '../../../../components/EmptyState';
import { ErrorState } from '../../../../components/ErrorState';
import { Colors } from '../../../../constants/colors';
import { Typography } from '../../../../constants/typography';
import { Theme } from '../../../../constants/theme';

export default function ShopProductsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [shop, setShop] = useState<ShopResponse | null>(null);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchShopAndProducts = useCallback(async () => {
    if (!id) return;
    try {
      setErrorMsg(null);
      const [shopData, productsData] = await Promise.all([
        ShopService.getShopById(id),
        ProductService.getProductsByShop(id),
      ]);
      setShop(shopData);
      setProducts(productsData);
    } catch (err: any) {
      console.warn('[ShopProductsScreen] Error loading products:', err);
      setErrorMsg('Unable to load products. Please check backend connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchShopAndProducts();
  }, [fetchShopAndProducts]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchShopAndProducts();
  };

  const filteredProducts = products.filter((prod) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      prod.name.toLowerCase().includes(q) ||
      (prod.description && prod.description.toLowerCase().includes(q)) ||
      (prod.category && prod.category.toLowerCase().includes(q))
    );
  });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {shop?.shopName || 'Shop Products'}
          </Text>
          <Text style={styles.headerSubtitle}>
            Catalog ({filteredProducts.length} items)
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products in this shop"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {loading && !refreshing && products.length === 0 ? (
        <View style={styles.flex1}>
          {renderHeader()}
          <LoadingState message="Loading product catalog..." />
        </View>
      ) : errorMsg && products.length === 0 ? (
        <View style={styles.flex1}>
          {renderHeader()}
          <ErrorState
            title="Connection Error"
            message={errorMsg}
            onRetry={fetchShopAndProducts}
          />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ProductCard product={item} />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              title="No products available"
              message={
                searchQuery
                  ? `No products matching "${searchQuery}".`
                  : "This shop hasn't added any products to their catalog yet."
              }
              iconName="cube-outline"
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primaryDeep]}
              tintColor={Colors.primaryDeep}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex1: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.xs,
    paddingBottom: Theme.spacing.xs,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
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
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: Theme.spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
  },
  searchSection: {
    marginBottom: Theme.spacing.xs,
  },
  listContent: {
    paddingBottom: Theme.spacing.xxl,
  },
  cardWrapper: {
    paddingHorizontal: Theme.spacing.md,
  },
});
