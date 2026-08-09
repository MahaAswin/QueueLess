import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader } from '@/components/SectionHeader';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Theme } from '@/constants/theme';
import { useCartStore } from '@/store/cartStore';
import { CartItem } from '@/types';

const MOCK_PRODUCTS = [
  {
    id: 'p1',
    shopId: 's1',
    name: 'Iced Oat Vanilla Matcha',
    description: 'Japanese ceremonial grade matcha paired with creamy oat milk & organic vanilla',
    price: 5.5,
    category: 'Beverages',
    isAvailable: true,
    preparationTimeMinutes: 4,
  },
  {
    id: 'p2',
    shopId: 's1',
    name: 'Avocado Artisan Toast',
    description: 'Fresh smashed avocado, microgreens, radish, & chili flakes on toasted sourdough',
    price: 8.9,
    category: 'Food',
    isAvailable: true,
    preparationTimeMinutes: 7,
  },
  {
    id: 'p3',
    shopId: 's1',
    name: 'Cold Brew Coffee (Large)',
    description: '16hr slow-steeped organic single-origin Ethiopian cold brew coffee',
    price: 4.8,
    category: 'Beverages',
    isAvailable: true,
    preparationTimeMinutes: 2,
  },
];

export default function ShopDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addItem, items, getTotalItems, getTotalAmount } = useCartStore();

  const getQuantityInCart = (productId: string) => {
    const item = items.find((i: CartItem) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const totalItems = getTotalItems();
  const totalAmount = getTotalAmount();

  return (
    <View style={styles.flex}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.primaryDeep} />
          <Text style={styles.backText}>Back to Shops</Text>
        </TouchableOpacity>

        <Text style={styles.shopTitle}>Green Leaf Organic Café</Text>
        <Text style={styles.shopMeta}>Coffee & Tea • 142 Market Street • 4.9 ★ (184 reviews)</Text>

        <SectionHeader title="Menu Items" subtitle="Select products to add to your express order" />

        {MOCK_PRODUCTS.map((prod) => (
          <ProductCard
            key={prod.id}
            product={prod}
            quantity={getQuantityInCart(prod.id)}
            onAddPress={() => addItem(prod)}
          />
        ))}
      </ScrollView>

      {totalItems > 0 && (
        <View style={styles.cartFooter}>
          <View>
            <Text style={styles.cartFooterItems}>{totalItems} Item{totalItems > 1 ? 's' : ''} Selected</Text>
            <Text style={styles.cartFooterTotal}>${totalAmount.toFixed(2)}</Text>
          </View>
          <Button
            title="Choose Pickup Slot →"
            onPress={() => router.push('/(customer)/pickup-slot')}
            size="medium"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: {
    padding: Theme.spacing.md,
    paddingTop: Theme.spacing.xl + 10,
    paddingBottom: Theme.spacing.xxl + 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  backText: {
    color: Colors.primaryDeep,
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.sm,
    marginLeft: Theme.spacing.xs,
  },
  shopTitle: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  shopMeta: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginBottom: Theme.spacing.lg,
  },
  cartFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Theme.shadows.medium,
  },
  cartFooterItems: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
  },
  cartFooterTotal: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryDeep,
  },
});
