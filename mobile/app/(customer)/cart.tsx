import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cartStore';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';


export default function CartScreen() {
  const router = useRouter();
  const {
    cart,
    loading,
    itemLoading,
    error,
    fetchCart,
    updateQuantity,
    removeItem,
    clearCart,
    resetError,
  } = useCartStore();

  const [refreshing, setRefreshing] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Refresh cart whenever the cart screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCart();
    setRefreshing(false);
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear Cart', style: 'destructive', onPress: () => clearCart() },
      ]
    );
  };

  const handleRemoveItem = (itemId: string, productName: string) => {
    Alert.alert(
      'Remove Item',
      `Remove "${productName}" from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeItem(itemId) },
      ]
    );
  };

  const handleQuantityMinus = (itemId: string, currentQty: number, productName: string) => {
    if (currentQty <= 1) {
      handleRemoveItem(itemId, productName);
    } else {
      updateQuantity(itemId, currentQty - 1);
    }
  };

  const handleQuantityPlus = (itemId: string, currentQty: number) => {
    updateQuantity(itemId, currentQty + 1);
  };

  if (loading && !refreshing && !cart) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LoadingState message="Loading your express cart..." />
      </SafeAreaView>
    );
  }

  const items = cart?.items || [];
  const isCartEmpty = items.length === 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header Bar */}
      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>My Cart</Text>
        {!isCartEmpty && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearCart}
            accessibilityLabel="Clear cart"
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={16} color={Colors.error} />
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error Alert */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={Colors.error} />
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity onPress={resetError}>
            <Ionicons name="close" size={16} color={Colors.error} />
          </TouchableOpacity>
        </View>
      )}

      {isCartEmpty ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            iconName="cart-outline"
            title="Your cart is empty"
            message="Find something you love from a nearby shop."
            actionTitle="Explore Shops"
            onActionPress={() => router.push('/(customer)/shops')}
          />
        </View>
      ) : (
        <View style={styles.flex1}>
          <ScrollView
            style={styles.flex1}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[Colors.primaryDeep]}
                tintColor={Colors.primaryDeep}
              />
            }
          >
            {/* Shop Identification Banner */}
            {cart?.shopName && (
              <View style={styles.shopCard}>
                <View style={styles.shopIconBg}>
                  <Ionicons name="storefront" size={20} color={Colors.primaryDeep} />
                </View>
                <View style={styles.shopTextContainer}>
                  <Text style={styles.shopSubTitle}>ORDER FROM</Text>
                  <Text style={styles.shopTitle}>{cart.shopName}</Text>
                </View>
              </View>
            )}

            {/* Cart Items List */}
            {items.map((item) => {
              const isItemUpdating = itemLoading[item.itemId];
              const hasImageError = imageErrors[item.itemId];

              return (
                <View key={item.itemId} style={[styles.itemCard, Theme.shadows.soft]}>
                  {/* Item Image */}
                  <View style={styles.imageWrapper}>
                    {item.imageUrl && !hasImageError ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.itemImage}
                        resizeMode="cover"
                        onError={() =>
                          setImageErrors((prev) => ({ ...prev, [item.itemId]: true }))
                        }
                      />
                    ) : (
                      <View style={styles.placeholderItemImage}>
                        <Ionicons name="cube-outline" size={24} color={Colors.primaryDeep} />
                      </View>
                    )}
                  </View>

                  {/* Item Info */}
                  <View style={styles.itemInfo}>
                    <View style={styles.itemTitleRow}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.productName}
                      </Text>
                      <TouchableOpacity
                        style={styles.removeIconButton}
                        onPress={() => handleRemoveItem(item.itemId, item.productName)}
                        disabled={isItemUpdating}
                      >
                        <Ionicons name="close-circle" size={18} color={Colors.secondaryText} />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.unitPrice}>
                      ₹{(item.price || 0).toFixed(2)} each
                    </Text>

                    {/* Quantity Controls & Subtotal */}
                    <View style={styles.bottomRow}>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => handleQuantityMinus(item.itemId, item.quantity, item.productName)}
                          disabled={isItemUpdating}
                        >
                          <Ionicons name="remove" size={16} color={Colors.primaryDeep} />
                        </TouchableOpacity>

                        {isItemUpdating ? (
                          <ActivityIndicator size="small" color={Colors.primaryDeep} style={styles.qtyLoader} />
                        ) : (
                          <Text style={styles.qtyText}>{item.quantity}</Text>
                        )}

                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => handleQuantityPlus(item.itemId, item.quantity)}
                          disabled={isItemUpdating}
                        >
                          <Ionicons name="add" size={16} color={Colors.primaryDeep} />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.itemSubtotal}>
                        ₹{(item.subtotal || 0).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Order Summary Card */}
            <View style={[styles.summaryCard, Theme.shadows.soft]}>
              <Text style={styles.summaryTitle}>Order Summary</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal ({cart?.totalItemCount || 0} items)</Text>
                <Text style={styles.summaryValue}>
                  ₹{(cart?.subtotal || 0).toFixed(2)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Express Pickup Fee</Text>
                <Text style={styles.freeBadgeText}>FREE</Text>
              </View>

              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Estimated Total</Text>
                <Text style={styles.totalValue}>
                  ₹{(cart?.subtotal || 0).toFixed(2)}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Checkout CTA Bar */}
          <View style={styles.footer}>
            <View style={styles.footerPriceRow}>
              <View>
                <Text style={styles.footerTotalLabel}>Estimated Total</Text>
                <Text style={styles.footerTotalValue}>
                  ₹{(cart?.subtotal || 0).toFixed(2)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={() => router.push('/(customer)/checkout')}
                activeOpacity={0.85}
              >

                <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: 4,
  },
  clearText: {
    color: Colors.error,
    fontSize: Typography.fontSize.xs + 1,
    fontFamily: Typography.fontFamily.bold,
    marginLeft: 4,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    padding: Theme.spacing.sm,
    marginHorizontal: Theme.spacing.md,
    marginTop: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorBannerText: {
    color: Colors.error,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    marginHorizontal: Theme.spacing.xs,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  shopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shopIconBg: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.lightSage,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  shopTextContainer: {
    flex: 1,
  },
  shopSubTitle: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.secondaryText,
    letterSpacing: 0.5,
  },
  shopTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageWrapper: {
    width: 72,
    height: 72,
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
    marginRight: Theme.spacing.md,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  placeholderItemImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.lightSage,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    flex: 1,
    marginRight: Theme.spacing.xs,
  },
  removeIconButton: {
    padding: 2,
  },
  unitPrice: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginVertical: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.xs,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightSage,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qtyLoader: {
    marginHorizontal: Theme.spacing.sm,
  },
  qtyText: {
    marginHorizontal: Theme.spacing.md,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  itemSubtotal: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Theme.spacing.xs,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginBottom: Theme.spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.xs + 1,
    color: Colors.secondaryText,
  },
  summaryValue: {
    fontSize: Typography.fontSize.xs + 1,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
  },
  freeBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Theme.spacing.sm,
    marginTop: Theme.spacing.sm,
  },
  totalLabel: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  totalValue: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
  footer: {
    backgroundColor: Colors.white,
    padding: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerTotalLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
  },
  footerTotalValue: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
  checkoutButton: {
    backgroundColor: Colors.primaryDeep,
    paddingHorizontal: Theme.spacing.lg,
    height: 48,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    marginRight: Theme.spacing.xs,
  },
});
