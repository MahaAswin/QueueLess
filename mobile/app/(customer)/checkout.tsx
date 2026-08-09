import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cartStore';
import { OrderService } from '../../services/order.service';
import { OrderResponse } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, loading, fetchCart } = useCartStore();

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Refresh cart on focus
  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart])
  );

  const handleConfirmOrder = async () => {
    if (submitting) return; // Prevent duplicate submissions

    if (!cart || !cart.items || cart.items.length === 0) {
      setErrorMsg('Your cart is empty. Please add items before checking out.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      // Call backend POST /api/orders
      const response = await OrderService.createOrder();
      setCreatedOrder(response);

      // Refresh cart state so cart store reflects backend clear
      await fetchCart();
    } catch (err: any) {
      console.warn('[CheckoutScreen] Order creation failed:', err);
      setSubmitting(false);

      const message = err.response?.data?.message || err.message || '';
      
      if (err.response?.status === 400 && message.toLowerCase().includes('stock')) {
        setErrorMsg('Some items in your cart exceed available stock. Please review your cart.');
      } else if (err.response?.status === 400 && message.toLowerCase().includes('unavailable')) {
        setErrorMsg('One or more products in your cart are no longer available.');
      } else if (err.response?.status === 400 && message.toLowerCase().includes('shop')) {
        setErrorMsg('The shop is currently unavailable to accept new orders.');
      } else {
        setErrorMsg('Unable to place your order. Please check your connection and try again.');
      }
    }
  };

  // If order was successfully created, show Order Confirmed view
  if (createdOrder) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.successContainer}>
          <ScrollView contentContainerStyle={styles.successContent} showsVerticalScrollIndicator={false}>
            <View style={styles.successIconWrapper}>
              <Ionicons name="checkmark-circle" size={80} color={Colors.primaryDeep} />
            </View>

            <Text style={styles.successTitle}>Order Confirmed!</Text>
            <Text style={styles.orderIdBadge}>Order #{createdOrder.id.slice(0, 8).toUpperCase()}</Text>

            <Text style={styles.successSubtext}>
              Your order has been placed successfully.
            </Text>

            {/* Order Details Card */}
            <View style={[styles.card, Theme.shadows.soft]}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="storefront" size={20} color={Colors.primaryDeep} />
                <Text style={styles.cardShopTitle}>{createdOrder.shopName || 'Partner Shop'}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.successSummaryRow}>
                <Text style={styles.summaryLabel}>Total Items</Text>
                <Text style={styles.summaryValue}>{createdOrder.items?.length || 0} items</Text>
              </View>

              <View style={styles.successSummaryRow}>
                <Text style={styles.summaryLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>
                  ₹{(typeof createdOrder.totalAmount === 'number' ? createdOrder.totalAmount : parseFloat(createdOrder.totalAmount || 0)).toFixed(2)}
                </Text>
              </View>

              <View style={styles.successSummaryRow}>
                <Text style={styles.summaryLabel}>Status</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{createdOrder.status || 'PENDING'}</Text>
                </View>
              </View>
            </View>

            {/* Pickup Time Placeholder Card */}
            <View style={[styles.card, styles.pickupCard, Theme.shadows.soft]}>
              <View style={styles.pickupHeaderRow}>
                <Ionicons name="time-outline" size={24} color={Colors.primaryDeep} />
                <View style={styles.pickupHeaderInfo}>
                  <Text style={styles.pickupCardTitle}>Choose Pickup Time Next</Text>
                  <Text style={styles.pickupCardSub}>
                    QueueLess zero-wait express pickup allows you to select a convenient pickup time slot.
                  </Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.successActions}>
              <Button
                title="Choose Pickup Time →"
                onPress={() => router.push(`/(customer)/order/${createdOrder.id}/pickup` as any)}
                style={styles.primaryCta}
              />
              <Button
                title="View My Orders"
                onPress={() => router.push('/(customer)/orders')}
                variant="outline"
                style={styles.secondaryCta}
              />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && !cart) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LoadingState message="Preparing checkout..." />
      </SafeAreaView>
    );
  }

  const items = cart?.items || [];
  const isCartEmpty = items.length === 0;

  if (isCartEmpty) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>
        <EmptyState
          iconName="cart-outline"
          title="Your cart is empty"
          message="Please add items to your cart before proceeding to checkout."
          actionTitle="Explore Shops"
          onActionPress={() => router.push('/(customer)/shops')}
        />
      </SafeAreaView>
    );
  }

  const totalAmount = cart?.subtotal || 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Back to cart"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Error Alert */}
      {errorMsg && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={Colors.error} />
          <Text style={styles.errorBannerText}>{errorMsg}</Text>
          <TouchableOpacity onPress={() => setErrorMsg(null)}>
            <Ionicons name="close" size={16} color={Colors.error} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section 1: Shop Information */}
        <View style={[styles.card, Theme.shadows.soft]}>
          <Text style={styles.sectionHeaderTitle}>SHOP DETAILS</Text>
          <View style={styles.shopRow}>
            <View style={styles.shopIconBg}>
              <Ionicons name="storefront" size={22} color={Colors.primaryDeep} />
            </View>
            <View style={styles.shopInfo}>
              <Text style={styles.shopTitle}>{cart?.shopName || 'Partner Shop'}</Text>
              <Text style={styles.shopSub}>QueueLess Express Pickup</Text>
            </View>
          </View>
        </View>

        {/* Section 2: Order Items */}
        <View style={[styles.card, Theme.shadows.soft]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>ORDER ITEMS ({items.length})</Text>
            <TouchableOpacity onPress={() => router.push('/(customer)/cart')}>
              <Text style={styles.editCartLink}>Edit Cart</Text>
            </TouchableOpacity>
          </View>

          {items.map((item) => {
            const hasImageError = imageErrors[item.itemId];
            return (
              <View key={item.itemId} style={styles.itemRow}>
                <View style={styles.itemImageWrapper}>
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
                      <Ionicons name="cube-outline" size={20} color={Colors.primaryDeep} />
                    </View>
                  )}
                </View>

                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.productName}
                  </Text>
                  <Text style={styles.itemQuantityPrice}>
                    {item.quantity} × ₹{(item.price || 0).toFixed(2)}
                  </Text>
                </View>

                <Text style={styles.itemSubtotal}>
                  ₹{(item.subtotal || 0).toFixed(2)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Section 3: Price Summary */}
        <View style={[styles.card, Theme.shadows.soft]}>
          <Text style={styles.sectionHeaderTitle}>PRICE SUMMARY</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{totalAmount.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Express Pickup Fee</Text>
            <Text style={styles.freeBadgeText}>FREE</Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Section 4: Pickup Information Placeholder */}
        <View style={[styles.card, styles.pickupPlaceholderCard, Theme.shadows.soft]}>
          <View style={styles.pickupHeaderRow}>
            <Ionicons name="time-outline" size={22} color={Colors.primaryDeep} />
            <View style={styles.pickupHeaderInfo}>
              <Text style={styles.pickupPlaceholderTitle}>Pickup Time Selection</Text>
              <Text style={styles.pickupPlaceholderSub}>
                Choose your pickup time slot after placing this order.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Section 5: Confirm Order Action Footer */}
      <View style={styles.footer}>
        <View style={styles.footerPriceRow}>
          <View>
            <Text style={styles.footerTotalLabel}>Total Amount</Text>
            <Text style={styles.footerTotalValue}>₹{totalAmount.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.confirmButton, submitting && styles.disabledConfirmButton]}
            onPress={handleConfirmOrder}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <Text style={styles.confirmButtonText}>Confirm Order</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.white} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
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
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
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
  scrollContent: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Theme.spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  sectionHeaderTitle: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.secondaryText,
    letterSpacing: 0.5,
    marginBottom: Theme.spacing.xs,
  },
  editCartLink: {
    fontSize: Typography.fontSize.xs + 1,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
  },
  shopIconBg: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.lightSage,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  shopInfo: {
    flex: 1,
  },
  shopTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  shopSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemImageWrapper: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.sm,
    overflow: 'hidden',
    marginRight: Theme.spacing.sm,
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
  itemDetails: {
    flex: 1,
    marginRight: Theme.spacing.xs,
  },
  itemName: {
    fontSize: Typography.fontSize.sm + 1,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  itemQuantityPrice: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: Typography.fontSize.sm + 1,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
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
  pickupPlaceholderCard: {
    backgroundColor: Colors.lightSage,
    borderColor: Colors.sage,
  },
  pickupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickupHeaderInfo: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
  },
  pickupPlaceholderTitle: {
    fontSize: Typography.fontSize.sm + 1,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
  pickupPlaceholderSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
    lineHeight: 16,
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
  confirmButton: {
    backgroundColor: Colors.primaryDeep,
    paddingHorizontal: Theme.spacing.lg,
    height: 48,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
  },
  disabledConfirmButton: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    marginRight: Theme.spacing.xs,
  },
  // Success View Styles
  successContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  successContent: {
    padding: Theme.spacing.lg,
    alignItems: 'center',
    paddingBottom: Theme.spacing.xxl,
  },
  successIconWrapper: {
    marginVertical: Theme.spacing.md,
  },
  successTitle: {
    fontSize: Typography.fontSize.xxl || 24,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginBottom: Theme.spacing.xs,
  },
  orderIdBadge: {
    backgroundColor: Colors.lightSage,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.full,
    fontSize: Typography.fontSize.xs + 1,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
    marginBottom: Theme.spacing.md,
  },
  successSubtext: {
    fontSize: Typography.fontSize.sm + 1,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  cardShopTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginLeft: Theme.spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Theme.spacing.sm,
  },
  successSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
    width: '100%',
  },
  statusBadge: {
    backgroundColor: '#DEF7EC',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
  },
  statusText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
    color: '#03543F',
  },
  pickupCard: {
    width: '100%',
    backgroundColor: Colors.lightSage,
    borderColor: Colors.sage,
  },
  pickupCardTitle: {
    fontSize: Typography.fontSize.sm + 1,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
  pickupCardSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
    lineHeight: 16,
  },
  successActions: {
    width: '100%',
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.md,
  },
  primaryCta: {},
  secondaryCta: {},
});
