import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { OrderService } from '../../services/order.service';
import { OrderResponse, OrderStatus } from '../../types';
import { SectionHeader } from '../../components/SectionHeader';
import { OrderCard } from '../../components/OrderCard';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

type FilterTab = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export default function OrdersScreen() {
  const router = useRouter();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setErrorMsg(null);

      const response = await OrderService.getCustomerOrders(0, 50);
      setOrders(response.content || []);
    } catch (err: any) {
      console.error('[OrdersScreen] Error fetching customer orders:', err);
      const msg = err.response?.data?.message || 'Unable to load your orders. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'ACTIVE') {
      return (
        order.status === 'PENDING' ||
        order.status === 'CONFIRMED' ||
        order.status === 'ACCEPTED' ||
        order.status === 'PREPARING' ||
        order.status === 'READY_FOR_PICKUP'
      );
    }
    if (activeFilter === 'COMPLETED') {
      return order.status === 'COLLECTED' || order.status === 'COMPLETED';
    }
    if (activeFilter === 'CANCELLED') {
      return order.status === 'CANCELLED' || order.status === 'REJECTED';
    }
    return true;
  });

  const getFilterCount = (tab: FilterTab) => {
    if (tab === 'ALL') return orders.length;
    if (tab === 'ACTIVE') {
      return orders.filter(
        (o) =>
          o.status === 'PENDING' ||
          o.status === 'CONFIRMED' ||
          o.status === 'ACCEPTED' ||
          o.status === 'PREPARING' ||
          o.status === 'READY_FOR_PICKUP'
      ).length;
    }
    if (tab === 'COMPLETED') {
      return orders.filter((o) => o.status === 'COLLECTED' || o.status === 'COMPLETED').length;
    }
    if (tab === 'CANCELLED') {
      return orders.filter((o) => o.status === 'CANCELLED' || o.status === 'REJECTED').length;
    }
    return 0;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchOrders(true)}
            colors={[Colors.primaryDeep]}
            tintColor={Colors.primaryDeep}
          />
        }
      >
        <SectionHeader
          title="My Orders"
          subtitle="Track active express slots & view past collection passes"
        />

        {/* Filter Chips Bar */}
        <View style={styles.filterBar}>
          {(['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as FilterTab[]).map((tab) => {
            const isSelected = activeFilter === tab;
            const count = getFilterCount(tab);

            let label = 'All';
            if (tab === 'ACTIVE') label = 'Active';
            if (tab === 'COMPLETED') label = 'Completed';
            if (tab === 'CANCELLED') label = 'Cancelled';

            return (
              <TouchableOpacity
                key={tab}
                style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                onPress={() => setActiveFilter(tab)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
                  {label} {count > 0 ? `(${count})` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading && !refreshing ? (
          <LoadingState message="Loading your orders..." />
        ) : errorMsg ? (
          <EmptyState
            title="Error Loading Orders"
            message={errorMsg}
            actionTitle="Try Again"
            onActionPress={() => fetchOrders()}
          />
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            title={activeFilter === 'ALL' ? 'No orders yet' : `No ${activeFilter.toLowerCase()} orders`}
            message="Your next order will appear here. Discover partner shops nearby to place an express order."
            actionTitle="Explore Shops"
            onActionPress={() => router.push('/(customer)/shops')}
          />
        ) : (
          <View style={styles.listContainer}>
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={() => router.push(`/(customer)/order/${order.id}` as any)}
                onShowQR={() => router.push(`/(customer)/order/${order.id}` as any)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  filterBar: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.md,
    gap: Theme.spacing.xs,
  },
  filterChip: {
    paddingHorizontal: Theme.spacing.sm + 2,
    paddingVertical: Theme.spacing.xs + 2,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipSelected: {
    backgroundColor: Colors.primaryDeep,
    borderColor: Colors.primaryDeep,
  },
  filterChipText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
  },
  filterChipTextSelected: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
  },
  listContainer: {
    marginTop: Theme.spacing.xs,
  },
});
