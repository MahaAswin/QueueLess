import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ShopOwnerService } from '../../../services/shopOwner.service';
import { OrderResponse, OrderStatus } from '../../../types';
import { LoadingState } from '../../../components/LoadingState';
import { EmptyState } from '../../../components/EmptyState';
import { Button } from '../../../components/Button';
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

const formatDate = (isoStr?: string | null): string => {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoStr;
  }
};

const getStatusBadgeStyle = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING':
      return { bg: '#E0F2FE', text: '#0284C7', label: 'PENDING' };
    case 'CONFIRMED':
      return { bg: '#E0E7FF', text: '#3730A3', label: 'CONFIRMED' };
    case 'PREPARING':
      return { bg: '#FEF3C7', text: '#D97706', label: 'PREPARING' };
    case 'READY_FOR_PICKUP':
      return { bg: '#DCFCE7', text: '#15803D', label: 'READY FOR PICKUP' };
    case 'COLLECTED':
      return { bg: Colors.lightSage, text: Colors.primaryDeep, label: 'COLLECTED' };
    case 'CANCELLED':
      return { bg: '#FEE2E2', text: '#DC2626', label: 'CANCELLED' };
    default:
      return { bg: Colors.lightSage, text: Colors.primaryDeep, label: status };
  }
};

export default function ShopOrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOrderDetails = useCallback(async (isRefresh = false) => {
    if (!orderId) {
      setErrorMsg('Invalid order reference.');
      setLoading(false);
      return;
    }
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setErrorMsg(null);

      const data = await ShopOwnerService.getShopOrderById(orderId);
      setOrder(data);
    } catch (err: any) {
      console.error('[ShopOrderDetailScreen] Error fetching order:', err);
      const msg =
        err.response?.data?.message ||
        'Unable to load order details. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // Transition Handlers
  const handleConfirm = async () => {
    if (!orderId || updatingStatus) return;
    try {
      setUpdatingStatus(true);
      await ShopOwnerService.confirmOrder(orderId);
      fetchOrderDetails(true);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to confirm order.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleReject = async () => {
    if (!orderId || updatingStatus) return;
    Alert.alert(
      'Reject Order',
      'Are you sure you want to reject this incoming order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject Order',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdatingStatus(true);
              await ShopOwnerService.rejectOrder(orderId);
              fetchOrderDetails(true);
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to reject order.');
            } finally {
              setUpdatingStatus(false);
            }
          },
        },
      ]
    );
  };

  const handleStartPreparing = async () => {
    if (!orderId || updatingStatus) return;
    try {
      setUpdatingStatus(true);
      await ShopOwnerService.startPreparing(orderId);
      fetchOrderDetails(true);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to start preparing.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleMarkReady = async () => {
    if (!orderId || updatingStatus) return;
    try {
      setUpdatingStatus(true);
      await ShopOwnerService.markOrderReadyForPickup(orderId);
      fetchOrderDetails(true);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to mark ready.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading && !refreshing) {
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
          actionTitle="Back to Shop Orders"
          onActionPress={() => router.push('/(shop-owner)/orders')}
        />
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusBadgeStyle(order.status);
  const slot = order.pickupSlot;
  const startTime = slot?.finalStartTime || slot?.requestedStartTime;
  const endTime = slot?.finalEndTime || slot?.requestedEndTime;
  const totalAmount =
    typeof order.totalAmount === 'number'
      ? order.totalAmount
      : parseFloat(order.totalAmount || '0');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchOrderDetails(true)}
            colors={[Colors.primaryDeep]}
            tintColor={Colors.primaryDeep}
          />
        }
      >
        {/* Navigation Header */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.primaryDeep} />
          <Text style={styles.backText}>Orders</Text>
        </TouchableOpacity>

        {/* Order Header Card */}
        <View style={[styles.mainCard, Theme.shadows.medium]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.orderIdTitle}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusConfig.text }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
          <Text style={styles.createdAtText}>Created on {formatDate(order.createdAt)}</Text>
        </View>

        {/* Customer Information */}
        <View style={[styles.infoCard, Theme.shadows.soft]}>
          <Text style={styles.infoTitle}>Customer Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color={Colors.primaryDeep} />
            <Text style={styles.infoText}>{order.customerName || 'Walk-in Customer'}</Text>
          </View>
        </View>

        {/* Express Pickup Window */}
        {startTime && (
          <View style={[styles.infoCard, Theme.shadows.soft]}>
            <Text style={styles.infoTitle}>Express Pickup Window</Text>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={18} color={Colors.primaryDeep} />
              <Text style={styles.infoText}>
                {formatTimeLabel(startTime)} – {formatTimeLabel(endTime)}
              </Text>
            </View>
          </View>
        )}

        {/* Order Items Table */}
        <Text style={styles.sectionTitle}>Items ({order.items?.length || 0})</Text>
        <View style={[styles.itemsCard, Theme.shadows.soft]}>
          {order.items?.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemTextWrapper}>
                <Text style={styles.itemName}>
                  {item.quantity}x {item.productName}
                </Text>
                <Text style={styles.itemUnit}>₹{(item.unitPrice || 0).toFixed(2)} each</Text>
              </View>
              <Text style={styles.itemSubtotal}>
                ₹{(item.subtotal || item.unitPrice * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalPrice}>₹{totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Contextual Actions Bar */}
        <View style={styles.actionsContainer}>
          {order.status === 'PENDING' && (
            <View style={styles.btnColumn}>
              <Button
                title="Accept Order"
                onPress={handleConfirm}
                loading={updatingStatus}
                style={styles.primaryBtn}
              />
              <Button
                title="Reject Order"
                variant="outline"
                onPress={handleReject}
                loading={updatingStatus}
                style={styles.rejectBtn}
              />
            </View>
          )}

          {order.status === 'CONFIRMED' && (
            <Button
              title="Start Preparing Order"
              onPress={handleStartPreparing}
              loading={updatingStatus}
              style={styles.primaryBtn}
            />
          )}

          {order.status === 'PREPARING' && (
            <Button
              title="Mark Ready for Pickup"
              onPress={handleMarkReady}
              loading={updatingStatus}
              style={styles.primaryBtn}
            />
          )}

          {order.status === 'READY_FOR_PICKUP' && (
            <Button
              title="Scan Customer Pickup QR Pass"
              onPress={() => router.push('/(shop-owner)/scanner')}
              style={styles.primaryBtn}
            />
          )}

          {order.status === 'COLLECTED' && (
            <View style={styles.completedBanner}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
              <Text style={styles.completedBannerText}>Pickup Verified & Order Completed</Text>
            </View>
          )}

          {order.status === 'CANCELLED' && (
            <View style={styles.cancelledBanner}>
              <Ionicons name="close-circle" size={24} color={Colors.error} />
              <Text style={styles.cancelledBannerText}>This order was cancelled</Text>
            </View>
          )}
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
    marginBottom: Theme.spacing.sm,
  },
  backText: {
    color: Colors.primaryDeep,
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.sm,
    marginLeft: Theme.spacing.xs,
  },
  mainCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Theme.spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderIdTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.full,
  },
  statusBadgeText: {
    fontSize: 9,
    fontFamily: Typography.fontFamily.bold,
  },
  createdAtText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Theme.spacing.md,
  },
  infoTitle: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.secondaryText,
    marginBottom: Theme.spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text,
    marginLeft: Theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginBottom: Theme.spacing.xs,
  },
  itemsCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Theme.spacing.lg,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xs,
  },
  itemTextWrapper: { flex: 1 },
  itemName: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text,
  },
  itemUnit: {
    fontSize: Typography.fontSize.xs - 1,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Theme.spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    width: '100%',
  },
  btnColumn: {
    gap: Theme.spacing.xs,
  },
  primaryBtn: {
    width: '100%',
  },
  rejectBtn: {
    borderColor: Colors.error,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lightSage,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.sage,
  },
  completedBannerText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.success,
    marginLeft: Theme.spacing.xs,
  },
  cancelledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  cancelledBannerText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.error,
    marginLeft: Theme.spacing.xs,
  },
});
