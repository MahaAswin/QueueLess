import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ShopOwnerService } from '../../services/shopOwner.service';
import { OrderResponse, ShopResponse } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

export default function ShopOwnerDashboard() {
  const router = useRouter();

  const [shop, setShop] = useState<ShopResponse | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [shopsData, ordersPage] = await Promise.all([
        ShopOwnerService.getMyShops(),
        ShopOwnerService.getShopOrders(undefined, 0, 50),
      ]);

      if (shopsData && shopsData.length > 0) {
        setShop(shopsData[0]);
      }
      setOrders(ordersPage.content || []);
    } catch (err) {
      console.error('[ShopOwnerDashboard] Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  // Quick Action: Confirm Order
  const handleConfirmOrder = async (orderId: string) => {
    try {
      setActionLoadingId(orderId);
      await ShopOwnerService.confirmOrder(orderId);
      fetchDashboardData(true);
    } catch (err) {
      console.warn('[ShopOwnerDashboard] Failed to confirm order:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick Action: Start Preparing
  const handleStartPreparing = async (orderId: string) => {
    try {
      setActionLoadingId(orderId);
      await ShopOwnerService.startPreparing(orderId);
      fetchDashboardData(true);
    } catch (err) {
      console.warn('[ShopOwnerDashboard] Failed to start preparing:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <LoadingState message="Loading shop dashboard..." />
      </SafeAreaView>
    );
  }

  // Calculate stats strictly from real backend orders list
  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.status === 'READY_FOR_PICKUP');
  const completedOrders = orders.filter((o) => o.status === 'COLLECTED');

  const actionNeededOrders = [...pendingOrders, ...orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PREPARING')];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchDashboardData(true)}
            colors={[Colors.primaryDeep]}
            tintColor={Colors.primaryDeep}
          />
        }
      >
        {/* Shop Header */}
        <View style={styles.shopHeaderRow}>
          <View style={styles.shopTextWrapper}>
            <Text style={styles.shopCategoryTag}>{shop?.category?.replace(/_/g, ' ') || 'EXPRESS SHOP'}</Text>
            <Text style={styles.shopNameText}>{shop?.shopName || 'My Express Shop'}</Text>
          </View>
          <View style={[styles.statusBadge, shop?.status === 'ACTIVE' ? styles.statusBadgeOpen : styles.statusBadgeClosed]}>
            <View style={[styles.statusDot, shop?.status === 'ACTIVE' ? styles.statusDotOpen : styles.statusDotClosed]} />
            <Text style={styles.statusBadgeText}>{shop?.status === 'ACTIVE' ? 'OPEN' : 'CLOSED'}</Text>
          </View>
        </View>

        {/* Operational Metrics Cards Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, Theme.shadows.soft]}>
            <View style={[styles.statIconBox, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="time-outline" size={20} color="#0284C7" />
            </View>
            <Text style={styles.statNumber}>{pendingOrders.length}</Text>
            <Text style={styles.statLabel}>New Orders</Text>
          </View>

          <View style={[styles.statCard, Theme.shadows.soft]}>
            <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="restaurant-outline" size={20} color="#D97706" />
            </View>
            <Text style={styles.statNumber}>{preparingOrders.length}</Text>
            <Text style={styles.statLabel}>Preparing</Text>
          </View>

          <View style={[styles.statCard, Theme.shadows.soft]}>
            <View style={[styles.statIconBox, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="bag-check-outline" size={20} color="#15803D" />
            </View>
            <Text style={styles.statNumber}>{readyOrders.length}</Text>
            <Text style={styles.statLabel}>Ready Pickup</Text>
          </View>

          <View style={[styles.statCard, Theme.shadows.soft]}>
            <View style={[styles.statIconBox, { backgroundColor: Colors.lightSage }]}>
              <Ionicons name="checkmark-done-outline" size={20} color={Colors.primaryDeep} />
            </View>
            <Text style={styles.statNumber}>{completedOrders.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Primary Action Button Bar */}
        <TouchableOpacity
          style={[styles.scannerCtaCard, Theme.shadows.medium]}
          onPress={() => router.push('/(shop-owner)/scanner')}
          activeOpacity={0.85}
        >
          <View style={styles.scannerIconBox}>
            <Ionicons name="qr-code-outline" size={28} color={Colors.white} />
          </View>
          <View style={styles.scannerTextWrapper}>
            <Text style={styles.scannerCtaTitle}>Scan Customer QR Pass</Text>
            <Text style={styles.scannerCtaSub}>Verify customer express token & mark order collected</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={Colors.white} />
        </TouchableOpacity>

        {/* Active Incoming Orders Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Active Orders ({actionNeededOrders.length})</Text>
          <TouchableOpacity onPress={() => router.push('/(shop-owner)/orders')}>
            <Text style={styles.viewAllText}>View All →</Text>
          </TouchableOpacity>
        </View>

        {actionNeededOrders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-circle-outline" size={36} color={Colors.primaryDeep} />
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySub}>No active orders requiring immediate preparation.</Text>
          </View>
        ) : (
          actionNeededOrders.slice(0, 5).map((ord) => {
            const isPending = ord.status === 'PENDING';
            const isConfirmed = ord.status === 'CONFIRMED';
            const isPreparing = ord.status === 'PREPARING';
            const isBusy = actionLoadingId === ord.id;

            return (
              <TouchableOpacity
                key={ord.id}
                style={[styles.orderCard, Theme.shadows.soft]}
                onPress={() => router.push(`/(shop-owner)/order/${ord.id}` as any)}
                activeOpacity={0.85}
              >
                <View style={styles.orderCardHeader}>
                  <Text style={styles.orderIdText}>Order #{ord.id.slice(0, 8).toUpperCase()}</Text>
                  <View style={styles.orderStatusBadge}>
                    <Text style={styles.orderStatusText}>{ord.status.replace(/_/g, ' ')}</Text>
                  </View>
                </View>

                <Text style={styles.customerName}>
                  Customer: {ord.customerName || 'Walk-in Customer'}
                </Text>
                <Text style={styles.orderDetailsText}>
                  {ord.items?.length || 0} items • ₹
                  {(typeof ord.totalAmount === 'number'
                    ? ord.totalAmount
                    : parseFloat(ord.totalAmount || '0')
                  ).toFixed(2)}
                </Text>

                {/* Quick Action Button */}
                <View style={styles.cardActionRow}>
                  {isPending ? (
                    <Button
                      title="Accept Order"
                      onPress={() => handleConfirmOrder(ord.id)}
                      loading={isBusy}
                      style={styles.actionBtn}
                    />
                  ) : isConfirmed ? (
                    <Button
                      title="Start Preparing"
                      onPress={() => handleStartPreparing(ord.id)}
                      loading={isBusy}
                      style={styles.actionBtn}
                    />
                  ) : isPreparing ? (
                    <Button
                      title="Mark Ready for Pickup"
                      onPress={() => router.push(`/(shop-owner)/order/${ord.id}` as any)}
                      style={styles.actionBtn}
                    />
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
  shopHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  shopTextWrapper: { flex: 1 },
  shopCategoryTag: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
    letterSpacing: 0.8,
  },
  shopNameText: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.full,
  },
  statusBadgeOpen: { backgroundColor: '#DCFCE7' },
  statusBadgeClosed: { backgroundColor: '#FEE2E2' },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusDotOpen: { backgroundColor: '#16A34A' },
  statusDotClosed: { backgroundColor: '#DC2626' },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.xs + 2,
    marginBottom: Theme.spacing.md,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.xs,
  },
  statNumber: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  scannerCtaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryDeep,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  scannerIconBox: {
    width: 46,
    height: 46,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.sm,
  },
  scannerTextWrapper: { flex: 1 },
  scannerCtaTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
  },
  scannerCtaSub: {
    fontSize: Typography.fontSize.xs - 1,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  viewAllText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginTop: Theme.spacing.xs,
  },
  emptySub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginTop: 2,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  orderIdText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  orderStatusBadge: {
    backgroundColor: Colors.lightSage,
    paddingHorizontal: Theme.spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.full,
  },
  orderStatusText: {
    fontSize: 9,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
  customerName: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text,
    fontFamily: Typography.fontFamily.semibold,
  },
  orderDetailsText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  cardActionRow: {
    marginTop: Theme.spacing.sm,
  },
  actionBtn: {
    width: '100%',
  },
});
