import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  AppState,
  AppStateStatus,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { OrderService } from '../../../services/order.service';
import { OrderResponse } from '../../../types';
import { SectionHeader } from '../../../components/SectionHeader';
import { StatusBadge } from '../../../components/StatusBadge';
import { OrderStatusTracker } from '../../../components/order/OrderStatusTracker';
import { Button } from '../../../components/Button';
import { LoadingState } from '../../../components/LoadingState';
import { EmptyState } from '../../../components/EmptyState';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { Theme } from '../../../constants/theme';

const formatTimeLabel = (timeStr?: string | null): string => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
};

const formatDateLong = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

const formatDateShort = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
  } catch {
    return dateStr;
  }
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const fetchOrder = useCallback(
    async (silent = false) => {
      if (!id) return;
      try {
        if (!silent) {
          setLoading(true);
        }
        setErrorMsg(null);

        const data = await OrderService.getOrderById(id);
        setOrder(data);
      } catch (err: any) {
        console.error('[OrderDetailScreen] Error fetching order:', err);
        const msg = err.response?.data?.message || 'Failed to load order details.';
        if (!silent) {
          setErrorMsg(msg);
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
        setRefreshing(false);
      }
    },
    [id]
  );

  // Live polling setup (10s) for active orders
  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    pollTimerRef.current = setInterval(() => {
      fetchOrder(true);
    }, 10000);
  }, [fetchOrder, stopPolling]);

  useFocusEffect(
    useCallback(() => {
      fetchOrder();

      return () => {
        stopPolling();
      };
    }, [fetchOrder, stopPolling])
  );

  // Monitor order status changes to start/stop polling
  useEffect(() => {
    if (!order) return;
    const isActive =
      order.status === 'PENDING' ||
      order.status === 'CONFIRMED' ||
      order.status === 'ACCEPTED' ||
      order.status === 'PREPARING' ||
      order.status === 'READY_FOR_PICKUP';

    if (isActive) {
      startPolling();
    } else {
      stopPolling();
    }
  }, [order?.status, startPolling, stopPolling]);

  // AppState listener to refresh when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        fetchOrder(true);
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [fetchOrder]);

  // Handle Order Cancellation (allowed only when PENDING)
  const handleCancelOrder = () => {
    if (!order || cancelling || order.status !== 'PENDING') return;

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? Stock will be released back to the shop.',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              const updated = await OrderService.cancelOrder(order.id);
              setOrder(updated);
              Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.');
            } catch (err: any) {
              console.error('[OrderDetailScreen] Cancel failed:', err);
              const msg =
                err.response?.data?.message ||
                'Unable to cancel this order. Only pending orders can be cancelled.';
              Alert.alert('Cancellation Error', msg);
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <LoadingState message="Loading live order status..." />
      </SafeAreaView>
    );
  }

  if (errorMsg || !order) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <EmptyState
          title="Order Not Found"
          message={errorMsg || 'Could not find the requested order.'}
          actionTitle="Back to Orders"
          onActionPress={() => router.push('/(customer)/orders')}
        />
      </SafeAreaView>
    );
  }

  const slot = order.pickupSlot;
  const finalDate = slot?.finalPickupDate || slot?.pickupDate;
  const finalStart = slot?.finalStartTime || slot?.requestedStartTime;
  const finalEnd = slot?.finalEndTime || slot?.requestedEndTime;
  const isPendingCancelable = order.status === 'PENDING';
  const totalAmount = typeof order.totalAmount === 'number' ? order.totalAmount : parseFloat(order.totalAmount || '0');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchOrder(true);
            }}
            colors={[Colors.primaryDeep]}
            tintColor={Colors.primaryDeep}
          />
        }
      >
        {/* Back Navigation */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(customer)/orders')}>
          <Ionicons name="arrow-back" size={20} color={Colors.primaryDeep} />
          <Text style={styles.backText}>My Orders</Text>
        </TouchableOpacity>

        {/* Order Header */}
        <SectionHeader
          title={`Order #${order.id.slice(0, 8).toUpperCase()}`}
          subtitle={`Placed on ${formatDateLong(order.createdAt)}`}
        />

        {/* Shop Info Card */}
        <View style={[styles.card, Theme.shadows.soft]}>
          <View style={styles.rowBetween}>
            <View style={styles.shopInfoGroup}>
              <Ionicons name="storefront" size={22} color={Colors.primaryDeep} />
              <Text style={styles.shopName}>{order.shopName || 'Partner Shop'}</Text>
            </View>
            <StatusBadge status={order.status} />
          </View>
        </View>

        {/* Visual Order Status Tracker */}
        <Text style={styles.sectionTitle}>Live Order Tracker</Text>
        <OrderStatusTracker status={order.status} pickupSlot={slot} />

        {/* Pickup Information Card */}
        <Text style={styles.sectionTitle}>Express Pickup Information</Text>
        <View style={[styles.card, Theme.shadows.soft]}>
          {slot ? (
            <View style={styles.timeBlock}>
              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={22} color={Colors.primaryDeep} />
                <View style={styles.timeTextWrapper}>
                  <Text style={styles.pickupDateText}>{formatDateShort(finalDate)}</Text>
                  <Text style={styles.timeText}>
                    {formatTimeLabel(finalStart)} – {formatTimeLabel(finalEnd)}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.rowBetween}>
                <Text style={styles.slotStatusLabel}>Slot Status</Text>
                <View style={styles.slotStatusBadge}>
                  <Text style={styles.slotStatusBadgeText}>
                    {slot.status.replace(/_/g, ' ')}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.noSlotContainer}>
              <Ionicons name="calendar-outline" size={28} color={Colors.secondaryText} />
              <View style={styles.noSlotTextWrapper}>
                <Text style={styles.noSlotTitle}>Pickup time not scheduled</Text>
                <Text style={styles.noSlotSub}>Select a convenient time window for zero-wait express pickup.</Text>
              </View>
              <Button
                title="Schedule Pickup Time"
                onPress={() => router.push(`/(customer)/order/${order.id}/pickup` as any)}
                style={styles.scheduleBtn}
              />
            </View>
          )}
        </View>

        {/* Express QR Ticket Action */}
        {(order.status === 'READY_FOR_PICKUP' || order.status === 'CONFIRMED' || order.status === 'PREPARING') && (
          <TouchableOpacity
            style={[styles.qrTicketCard, Theme.shadows.soft]}
            onPress={() => router.push(`/(customer)/order/${order.id}/pickup-qr` as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="qr-code-outline" size={28} color={Colors.white} />
            <View style={styles.qrTextWrapper}>
              <Text style={styles.qrCardTitle}>
                {order.status === 'READY_FOR_PICKUP' ? 'Show Pickup QR Ticket' : 'View Express QR Pass'}
              </Text>
              <Text style={styles.qrCardSub}>
                {order.status === 'READY_FOR_PICKUP'
                  ? 'Tap to open your secure scannable QR pass'
                  : 'Pass will activate when order is ready'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        )}

        {/* Items Ordered Card */}
        <Text style={styles.sectionTitle}>Items Ordered ({order.items?.length || 0})</Text>
        <View style={[styles.card, Theme.shadows.soft]}>
          {order.items?.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemMainInfo}>
                <Text style={styles.itemName}>
                  {item.quantity}x {item.productName}
                </Text>
                <Text style={styles.itemUnitPrice}>
                  ₹{(item.unitPrice || 0).toFixed(2)} each
                </Text>
              </View>

              <Text style={styles.itemPrice}>
                ₹{(item.subtotal || item.unitPrice * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalPrice}>₹{totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Order Actions */}
        <View style={styles.actionsContainer}>
          {isPendingCancelable && (
            <Button
              title="Cancel Order"
              variant="outline"
              onPress={handleCancelOrder}
              loading={cancelling}
              style={styles.cancelButton}
            />
          )}

          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => router.push(`/(customer)/complaint/create?orderId=${order.id}` as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="help-buoy-outline" size={18} color={Colors.primaryDeep} />
            <Text style={styles.helpButtonText}>Need Help? Report an Issue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
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
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs + 2,
  },
  card: {
    backgroundColor: Colors.white,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shopInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  shopName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginLeft: Theme.spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Theme.spacing.md,
  },
  timeBlock: {
    paddingVertical: Theme.spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeTextWrapper: {
    marginLeft: Theme.spacing.sm,
  },
  pickupDateText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    fontFamily: Typography.fontFamily.medium,
  },
  timeText: {
    fontSize: Typography.fontSize.md,
    color: Colors.primaryDeep,
    fontFamily: Typography.fontFamily.bold,
    marginTop: 2,
  },
  slotStatusLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
  },
  slotStatusBadge: {
    backgroundColor: Colors.lightSage,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.sm,
  },
  slotStatusBadgeText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
  noSlotContainer: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
  },
  noSlotTextWrapper: {
    alignItems: 'center',
    marginVertical: Theme.spacing.xs,
  },
  noSlotTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  noSlotSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginTop: 2,
  },
  scheduleBtn: {
    marginTop: Theme.spacing.sm,
    width: '100%',
  },
  qrTicketCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryDeep,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.md,
  },
  qrTextWrapper: {
    flex: 1,
    marginLeft: Theme.spacing.md,
  },
  qrCardTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
  },
  qrCardSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.sage,
    marginTop: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Theme.spacing.xs,
  },
  itemMainInfo: {
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  itemName: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
  },
  itemUnitPrice: {
    fontSize: Typography.fontSize.xs - 1,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryDeep,
    fontFamily: Typography.fontFamily.bold,
  },
  totalLabel: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  totalPrice: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
  actionsContainer: {
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
  },
  cancelButton: {
    borderColor: Colors.error,
    marginBottom: Theme.spacing.sm,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Colors.lightSage,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.sage,
  },
  helpButtonText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
    marginLeft: Theme.spacing.xs,
  },
});
