import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ShopOwnerService } from '../../services/shopOwner.service';
import { OrderResponse, OrderStatus } from '../../types';
import { SectionHeader } from '../../components/SectionHeader';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

type FilterTab = 'ALL' | 'PENDING' | 'PREPARING' | 'READY_FOR_PICKUP' | 'COLLECTED' | 'CANCELLED';

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

const getStatusBadgeStyle = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING':
      return { bg: '#E0F2FE', text: '#0284C7', label: 'PENDING' };
    case 'CONFIRMED':
      return { bg: '#E0E7FF', text: '#3730A3', label: 'CONFIRMED' };
    case 'PREPARING':
      return { bg: '#FEF3C7', text: '#D97706', label: 'PREPARING' };
    case 'READY_FOR_PICKUP':
      return { bg: '#DCFCE7', text: '#15803D', label: 'READY PICKUP' };
    case 'COLLECTED':
      return { bg: Colors.lightSage, text: Colors.primaryDeep, label: 'COLLECTED' };
    case 'CANCELLED':
      return { bg: '#FEE2E2', text: '#DC2626', label: 'CANCELLED' };
    default:
      return { bg: Colors.lightSage, text: Colors.primaryDeep, label: status };
  }
};

export default function ShopOwnerOrdersScreen() {
  const router = useRouter();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const backendStatus = activeTab === 'ALL' ? undefined : (activeTab as OrderStatus);
      const ordersPage = await ShopOwnerService.getShopOrders(backendStatus, 0, 50);
      setOrders(ordersPage.content || []);
    } catch (err) {
      console.error('[ShopOwnerOrdersScreen] Error loading shop orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const handleConfirmOrder = async (orderId: string) => {
    try {
      setActionLoadingId(orderId);
      await ShopOwnerService.confirmOrder(orderId);
      fetchOrders(true);
    } catch (err) {
      console.warn('[ShopOwnerOrdersScreen] Failed to confirm order:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStartPreparing = async (orderId: string) => {
    try {
      setActionLoadingId(orderId);
      await ShopOwnerService.startPreparing(orderId);
      fetchOrders(true);
    } catch (err) {
      console.warn('[ShopOwnerOrdersScreen] Failed to start preparing:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      setActionLoadingId(orderId);
      await ShopOwnerService.markOrderReadyForPickup(orderId);
      fetchOrders(true);
    } catch (err) {
      console.warn('[ShopOwnerOrdersScreen] Failed to mark ready:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.contentWrapper}>
        <SectionHeader
          title="Shop Orders"
          subtitle="Manage incoming orders and pickup transitions"
        />

        {/* Status Filter Tabs */}
        <FlatList
          horizontal
          data={[
            { key: 'ALL', label: 'All' },
            { key: 'PENDING', label: 'Pending' },
            { key: 'PREPARING', label: 'Preparing' },
            { key: 'READY_FOR_PICKUP', label: 'Ready' },
            { key: 'COLLECTED', label: 'Completed' },
            { key: 'CANCELLED', label: 'Cancelled' },
          ]}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabsContainer}
          renderItem={({ item }) => {
            const isSelected = activeTab === item.key;
            return (
              <TouchableOpacity
                style={[styles.tabButton, isSelected && styles.tabButtonActive]}
                onPress={() => setActiveTab(item.key as FilterTab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {loading && !refreshing ? (
          <LoadingState message="Loading orders..." />
        ) : orders.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No orders found"
            message={`No orders matching "${activeTab.replace(/_/g, ' ')}" status.`}
          />
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchOrders(true)}
                colors={[Colors.primaryDeep]}
                tintColor={Colors.primaryDeep}
              />
            }
            renderItem={({ item }) => {
              const statusConfig = getStatusBadgeStyle(item.status);
              const slot = item.pickupSlot;
              const startTime = slot?.finalStartTime || slot?.requestedStartTime;
              const endTime = slot?.finalEndTime || slot?.requestedEndTime;
              const isBusy = actionLoadingId === item.id;

              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.card, Theme.shadows.soft]}
                  onPress={() => router.push(`/(shop-owner)/order/${item.id}` as any)}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.orderIdText}>Order #{item.id.slice(0, 8).toUpperCase()}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusConfig.text }]}>
                        {statusConfig.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.customerText}>Customer: {item.customerName || 'Customer'}</Text>
                  <Text style={styles.itemsSummary}>
                    {item.items?.length || 0} items • ₹
                    {(typeof item.totalAmount === 'number'
                      ? item.totalAmount
                      : parseFloat(item.totalAmount || '0')
                    ).toFixed(2)}
                  </Text>

                  {startTime && (
                    <View style={styles.slotBadge}>
                      <Ionicons name="time-outline" size={14} color={Colors.primaryDeep} />
                      <Text style={styles.slotBadgeText}>
                        Pickup: {formatTimeLabel(startTime)} – {formatTimeLabel(endTime)}
                      </Text>
                    </View>
                  )}

                  {/* Contextual Action Button */}
                  <View style={styles.actionRow}>
                    {item.status === 'PENDING' ? (
                      <Button
                        title="Accept Order"
                        onPress={() => handleConfirmOrder(item.id)}
                        loading={isBusy}
                        style={styles.cardBtn}
                      />
                    ) : item.status === 'CONFIRMED' ? (
                      <Button
                        title="Start Preparing"
                        onPress={() => handleStartPreparing(item.id)}
                        loading={isBusy}
                        style={styles.cardBtn}
                      />
                    ) : item.status === 'PREPARING' ? (
                      <Button
                        title="Mark Ready for Pickup"
                        onPress={() => handleMarkReady(item.id)}
                        loading={isBusy}
                        style={styles.cardBtn}
                      />
                    ) : item.status === 'READY_FOR_PICKUP' ? (
                      <Button
                        title="Scan Pickup QR"
                        variant="outline"
                        onPress={() => router.push('/(shop-owner)/scanner')}
                        style={styles.cardBtn}
                      />
                    ) : null}
                  </View>
                </TouchableOpacity>
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
  tabsScroll: {
    maxHeight: 44,
    marginBottom: Theme.spacing.md,
  },
  tabsContainer: {
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  tabButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs + 2,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabButtonActive: {
    backgroundColor: Colors.primaryDeep,
    borderColor: Colors.primaryDeep,
  },
  tabText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.secondaryText,
  },
  tabTextActive: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
  },
  listContainer: {
    paddingBottom: Theme.spacing.xxl,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  orderIdText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.full,
  },
  statusBadgeText: {
    fontSize: 9,
    fontFamily: Typography.fontFamily.bold,
  },
  customerText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text,
  },
  itemsSummary: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  slotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightSage,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.md,
    alignSelf: 'flex-start',
    marginTop: Theme.spacing.xs,
  },
  slotBadgeText: {
    fontSize: Typography.fontSize.xs - 1,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
    marginLeft: 4,
  },
  actionRow: {
    marginTop: Theme.spacing.sm,
  },
  cardBtn: {
    width: '100%',
  },
});
