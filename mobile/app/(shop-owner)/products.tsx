import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Image,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ShopOwnerService } from '../../services/shopOwner.service';
import { ProductResponse, ShopResponse } from '../../types';
import { SectionHeader } from '../../components/SectionHeader';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

export default function ShopOwnerProductsScreen() {
  const [shop, setShop] = useState<ShopResponse | null>(null);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchShopProducts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const shops = await ShopOwnerService.getMyShops();
      if (shops && shops.length > 0) {
        const myShop = shops[0];
        setShop(myShop);
        const prods = await ShopOwnerService.getShopProducts(myShop.id);
        setProducts(prods || []);
      }
    } catch (err) {
      console.error('[ShopOwnerProductsScreen] Error loading shop products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchShopProducts();
    }, [fetchShopProducts])
  );

  const handleToggleAvailability = async (productId: string, currentVal: boolean) => {
    try {
      setUpdatingId(productId);
      const updated = await ShopOwnerService.updateProductAvailability(productId, !currentVal);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? updated : p))
      );
    } catch (err) {
      console.warn('[ShopOwnerProductsScreen] Failed to toggle availability:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.contentWrapper}>
        <SectionHeader
          title="Inventory & Products"
          subtitle={shop?.shopName ? `Manage catalog for ${shop.shopName}` : 'Product availability & stock'}
        />

        {loading && !refreshing ? (
          <LoadingState message="Loading catalog..." />
        ) : products.length === 0 ? (
          <EmptyState
            icon="cube-outline"
            title="No products in catalog"
            message="Your shop catalog is currently empty."
          />
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchShopProducts(true)}
                colors={[Colors.primaryDeep]}
                tintColor={Colors.primaryDeep}
              />
            }
            renderItem={({ item }) => {
              const isUpdating = updatingId === item.id;
              const isAvailable = item.available ?? true;

              return (
                <View style={[styles.card, Theme.shadows.soft]}>
                  {item.imageUrl && (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('file:')) ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="fast-food-outline" size={24} color={Colors.primaryDeep} />
                    </View>
                  )}

                  <View style={styles.productTextWrapper}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>₹{(item.price || 0).toFixed(2)}</Text>
                    {item.stockQuantity !== undefined && item.stockQuantity !== null && (
                      <Text style={styles.stockText}>Stock: {item.stockQuantity} units</Text>
                    )}
                  </View>

                  <View style={styles.switchWrapper}>
                    <Text style={[styles.switchLabel, isAvailable ? styles.switchOpen : styles.switchOff]}>
                      {isAvailable ? 'In Stock' : 'Out of Stock'}
                    </Text>
                    <Switch
                      value={isAvailable}
                      onValueChange={() => handleToggleAvailability(item.id, isAvailable)}
                      disabled={isUpdating}
                      trackColor={{ false: Colors.border, true: Colors.sage }}
                      thumbColor={isAvailable ? Colors.primaryDeep : '#9CA3AF'}
                    />
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentWrapper: { flex: 1, paddingHorizontal: Theme.spacing.md },
  listContainer: { paddingBottom: Theme.spacing.xxl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: Theme.borderRadius.md,
    marginRight: Theme.spacing.sm,
  },
  imagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.lightSage,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.sm,
  },
  productTextWrapper: { flex: 1 },
  productName: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  productPrice: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.primaryDeep,
    marginTop: 2,
  },
  stockText: {
    fontSize: 10,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  switchWrapper: {
    alignItems: 'flex-end',
    marginLeft: Theme.spacing.xs,
  },
  switchLabel: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 2,
  },
  switchOpen: { color: Colors.success },
  switchOff: { color: Colors.secondaryText },
});
