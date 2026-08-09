import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { OrderService } from '../../../services/order.service';
import { OrderResponse } from '../../../types';
import { SectionHeader } from '../../../components/SectionHeader';
import { StatusBadge } from '../../../components/StatusBadge';
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

const formatDateShort = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await OrderService.getOrderById(id);
      setOrder(data);
    } catch (err: any) {
      console.error('[OrderDetailScreen] Error fetching order:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <LoadingState message="Loading order details..." />
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(customer)/orders')}>
          <Ionicons name="arrow-back" size={20} color={Colors.primaryDeep} />
          <Text style={styles.backText}>Back to Orders</Text>
        </TouchableOpacity>

        <SectionHeader
          title="Order Details"
          subtitle={`Order #${order.id.slice(0, 8).toUpperCase()}`}
        />

        {/* Shop Info Card */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.shopName}>{order.shopName || 'Partner Shop'}</Text>
            <StatusBadge status={order.status} />
          </View>
        </View>

        {/* Express Pickup Time Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Express Pickup Time</Text>
          {slot ? (
            <View style={styles.timeBlock}>
              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={20} color={Colors.primaryDeep} />
                <Text style={styles.timeText}>
                  {formatDateShort(finalDate)} • {formatTimeLabel(finalStart)} – {formatTimeLabel(finalEnd)}
                </Text>
              </View>
              <View style={styles.slotStatusTag}>
                <Text style={styles.slotStatusTagText}>
                  Slot Status: {slot.status.replace('_', ' ')}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.noSlotContainer}>
              <Text style={styles.noSlotText}>No pickup time selected yet.</Text>
              <Button
                title="Schedule Pickup Time"
                onPress={() => router.push(`/(customer)/order/${order.id}/pickup` as any)}
                style={styles.scheduleBtn}
              />
            </View>
          )}
        </View>

        {/* Items Ordered Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items Ordered</Text>
          {order.items?.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.quantity}x {item.productName}
              </Text>
              <Text style={styles.itemPrice}>
                ₹{(item.subtotal || item.unitPrice * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalPrice}>₹{(order.totalAmount || 0).toFixed(2)}</Text>
          </View>
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
  shopName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  cardTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginBottom: Theme.spacing.xs,
  },
  timeBlock: {
    marginTop: Theme.spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryDeep,
    marginLeft: Theme.spacing.xs,
    fontFamily: Typography.fontFamily.bold,
  },
  slotStatusTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.lightSage,
    paddingHorizontal: Theme.spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
    marginTop: Theme.spacing.xs,
  },
  slotStatusTagText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
  noSlotContainer: {
    marginTop: Theme.spacing.xs,
  },
  noSlotText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginBottom: Theme.spacing.xs,
  },
  scheduleBtn: {
    marginTop: Theme.spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  itemName: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
  },
  itemPrice: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryDeep,
    fontFamily: Typography.fontFamily.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Theme.spacing.sm,
  },
  totalLabel: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  totalPrice: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
});
