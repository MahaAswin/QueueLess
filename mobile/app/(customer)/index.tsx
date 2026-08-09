import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { LocationHeader } from '../../components/LocationHeader';
import { GreetingHeader } from '../../components/GreetingHeader';
import { SearchBar } from '../../components/SearchBar';
import { QueueHeroCard } from '../../components/QueueHeroCard';
import { SectionHeader } from '../../components/SectionHeader';
import { CategoryCard } from '../../components/CategoryCard';
import { ShopCard } from '../../components/ShopCard';
import { PickupValueCard } from '../../components/PickupValueCard';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { ShopService } from '../../services/shop.service';
import { OrderService } from '../../services/order.service';
import { NotificationService } from '../../services/notification.service';
import { ShopResponse, OrderResponse } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';
import {
  MOCK_LOCATION,
  MOCK_USER_NAME,
  MOCK_CATEGORIES,
  MOCK_NEARBY_SHOPS,
} from '../../constants/mockData';

export default function CustomerHomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const userName = user?.name || MOCK_USER_NAME;
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiShops, setApiShops] = useState<ShopResponse[]>([]);
  const [activeOrder, setActiveOrder] = useState<OrderResponse | null>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);

  useEffect(() => {
    async function loadLiveData() {
      try {
        const liveShops = await ShopService.getActiveShops();
        if (liveShops && liveShops.length > 0) {
          setApiShops(liveShops);
        }
      } catch (err) {
        console.log('[CustomerHomeScreen] Live shops unavailable, using default view:', err);
      }

      try {
        const orderHistory = await OrderService.getCustomerOrders(0, 10);
        if (orderHistory?.content) {
          const active = orderHistory.content.find(
            (o) =>
              o.status === 'PENDING' ||
              o.status === 'CONFIRMED' ||
              o.status === 'ACCEPTED' ||
              o.status === 'PREPARING' ||
              o.status === 'READY_FOR_PICKUP'
          );
          setActiveOrder(active || null);
        }
      } catch (orderErr) {
        console.log('[CustomerHomeScreen] No active order loaded:', orderErr);
      }

      try {
        const countData = await NotificationService.getUnreadCount();
        setUnreadNotificationsCount(countData.unreadCount || 0);
      } catch (notifErr) {
        console.log('[CustomerHomeScreen] Unread notifications count unavailable:', notifErr);
      }
    }

    loadLiveData();
  }, []);

  const displayShops = apiShops.length > 0 ? apiShops : MOCK_NEARBY_SHOPS;

  const handleCategoryPress = (id: string) => {
    const isSelected = selectedCategoryId === id;
    setSelectedCategoryId(isSelected ? null : id);
    if (!isSelected) {
      const categoryMap: Record<string, string> = {
        grocery: 'GROCERY',
        food: 'RESTAURANT',
        pharmacy: 'PHARMACY',
        bakery: 'BAKERY',
        fruits_veg: 'GROCERY',
        daily_needs: 'GROCERY',
        electronics: 'OTHER',
        more: 'ALL',
      };
      const backendCat = categoryMap[id] || 'ALL';
      router.push({
        pathname: '/(customer)/shops',
        params: { category: backendCat },
      } as any);
    }
  };

  const filteredShops = displayShops.filter((shop) => {
    const name = 'shopName' in shop ? shop.shopName : shop.name;
    const category = shop.category;
    const description = shop.description || '';

    const matchesSearch =
      searchQuery.trim() === '' ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategoryId ||
      selectedCategoryId === 'more' ||
      category.toLowerCase().includes(selectedCategoryId.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Location Header */}
        <LocationHeader
          locationName={MOCK_LOCATION}
          userName={userName}
          unreadCount={unreadNotificationsCount}
          onLocationPress={() => {}}
          onNotificationPress={() => router.push('/(customer)/notifications')}
          onProfilePress={() => router.push('/(customer)/profile')}
        />

        {/* Greeting Header */}
        <GreetingHeader userName={userName} greetingTime="Good morning" />

        {/* Active Order Tracker Widget */}
        {activeOrder && (
          <TouchableOpacity
            style={[styles.activeOrderCard, Theme.shadows.soft]}
            onPress={() => router.push(`/(customer)/order/${activeOrder.id}` as any)}
            activeOpacity={0.85}
          >
            <View style={styles.activeOrderHeader}>
              <View style={styles.activeOrderBadgeRow}>
                <Ionicons name="flash" size={16} color={Colors.primaryDeep} />
                <Text style={styles.activeOrderBadgeText}>ACTIVE EXPRESS ORDER</Text>
              </View>
              <StatusBadge status={activeOrder.status} />
            </View>

            <Text style={styles.activeOrderShopName}>{activeOrder.shopName || 'Partner Shop'}</Text>

            <View style={styles.activeOrderFooter}>
              <Text style={styles.activeOrderItems}>
                {activeOrder.items?.length || 0} item{activeOrder.items?.length !== 1 ? 's' : ''} • ₹
                {(typeof activeOrder.totalAmount === 'number'
                  ? activeOrder.totalAmount
                  : parseFloat(activeOrder.totalAmount || '0')
                ).toFixed(2)}
              </Text>
              <TouchableOpacity
                style={styles.trackBtnRow}
                onPress={() =>
                  router.push(
                    (activeOrder.status === 'READY_FOR_PICKUP'
                      ? `/(customer)/order/${activeOrder.id}/pickup-qr`
                      : `/(customer)/order/${activeOrder.id}`) as any
                  )
                }
              >
                <Text style={styles.trackBtnText}>
                  {activeOrder.status === 'READY_FOR_PICKUP' ? 'Show Pickup QR' : 'Track Order'}
                </Text>
                <Ionicons
                  name={activeOrder.status === 'READY_FOR_PICKUP' ? 'qr-code-outline' : 'arrow-forward'}
                  size={14}
                  color={Colors.primaryDeep}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search shops or products"
        />

        {/* QueueLess Hero Card */}
        <QueueHeroCard onStartOrdering={() => router.push('/(customer)/shops')} />

        {/* Shop by Category */}
        <View style={styles.section}>
          <SectionHeader
            title="Shop by Category"
            actionText="View all"
            onActionPress={() => router.push('/(customer)/shops')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {MOCK_CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.id}
                name={cat.name}
                iconName={cat.icon}
                isSelected={selectedCategoryId === cat.id}
                onPress={() => handleCategoryPress(cat.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Nearby Shops */}
        <View style={styles.section}>
          <SectionHeader
            title="Express Pickup Shops"
            subtitle="Order ahead & collect with zero queue"
            actionText="See all"
            onActionPress={() => router.push('/(customer)/shops')}
          />

          {filteredShops.length === 0 ? (
            <EmptyState
              icon="storefront-outline"
              title="No Shops Found"
              message="No partner shops match your search criteria. Try clearing search filters."
              actionTitle="Clear Search"
              onActionPress={() => {
                setSearchQuery('');
                setSelectedCategoryId(null);
              }}
            />
          ) : (
            filteredShops.map((shop) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                onPress={() => router.push(`/(customer)/shop/${shop.id}` as any)}
              />
            ))
          )}
        </View>

        {/* QueueLess Express Promise Card */}
        <View style={styles.section}>
          <PickupValueCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  section: {
    marginTop: Theme.spacing.lg,
  },
  categoryList: {
    paddingVertical: Theme.spacing.xs,
    gap: Theme.spacing.sm,
  },
  activeOrderCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginVertical: Theme.spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.sage,
  },
  activeOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  activeOrderBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeOrderBadgeText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  activeOrderShopName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginVertical: 2,
  },
  activeOrderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
    paddingTop: Theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  activeOrderItems: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
  },
  trackBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackBtnText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
    marginRight: 4,
  },
});
