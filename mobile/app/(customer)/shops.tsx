import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from '../../components/SearchBar';
import { ShopCard } from '../../components/ShopCard';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { ShopService } from '../../services/shop.service';
import { ShopResponse, BackendShopCategory } from '../../types';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

interface CategoryFilterItem {
  id: string;
  name: string;
  backendCategory?: BackendShopCategory;
  icon: keyof typeof Ionicons.glyphMap;
}

const CATEGORY_FILTERS: CategoryFilterItem[] = [
  { id: 'ALL', name: 'All Shops', icon: 'grid-outline' },
  { id: 'GROCERY', name: 'Grocery', backendCategory: 'GROCERY', icon: 'cart-outline' },
  { id: 'RESTAURANT', name: 'Food', backendCategory: 'RESTAURANT', icon: 'fast-food-outline' },
  { id: 'PHARMACY', name: 'Pharmacy', backendCategory: 'PHARMACY', icon: 'medical-outline' },
  { id: 'BAKERY', name: 'Bakery', backendCategory: 'BAKERY', icon: 'cafe-outline' },
  { id: 'STATIONERY', name: 'Stationery', backendCategory: 'STATIONERY', icon: 'book-outline' },
  { id: 'MEAT_SHOP', name: 'Meat', backendCategory: 'MEAT_SHOP', icon: 'nutrition-outline' },
  { id: 'OTHER', name: 'Other', backendCategory: 'OTHER', icon: 'ellipsis-horizontal-circle-outline' },
];

export default function ShopListingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialCategory = (params.category as string) || 'ALL';

  const [shops, setShops] = useState<ShopResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  const fetchShops = useCallback(async (query: string, categoryId: string) => {
    try {
      setErrorMsg(null);
      let data: ShopResponse[] = [];

      if (query.trim()) {
        data = await ShopService.searchShops(query);
        if (categoryId !== 'ALL') {
          const target = CATEGORY_FILTERS.find((c) => c.id === categoryId)?.backendCategory;
          if (target) {
            data = data.filter((s) => s.category === target);
          }
        }
      } else if (categoryId !== 'ALL') {
        const target = CATEGORY_FILTERS.find((c) => c.id === categoryId)?.backendCategory;
        if (target) {
          data = await ShopService.getShopsByCategory(target);
        } else {
          data = await ShopService.getActiveShops();
        }
      } else {
        data = await ShopService.getActiveShops();
      }

      setShops(data);
    } catch (err: any) {
      console.warn('[ShopListingScreen] Error fetching shops:', err);
      setErrorMsg('Unable to load shops. Please check connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      fetchShops(searchQuery, selectedCategory);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, fetchShops]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchShops(searchQuery, selectedCategory);
  };

  const renderHeader = () => (
    <View style={styles.listHeaderContainer}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Explore Shops</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search shops by name or category"
        />
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {CATEGORY_FILTERS.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryPill, isSelected && styles.selectedPill]}
              onPress={() => setSelectedCategory(cat.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={cat.icon}
                size={16}
                color={isSelected ? Colors.white : Colors.primaryDeep}
                style={styles.pillIcon}
              />
              <Text style={[styles.pillText, isSelected && styles.selectedPillText]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {loading && !refreshing && shops.length === 0 ? (
        <View style={styles.centerContainer}>
          {renderHeader()}
          <LoadingState message="Loading available shops..." />
        </View>
      ) : errorMsg && shops.length === 0 ? (
        <View style={styles.centerContainer}>
          {renderHeader()}
          <ErrorState
            title="Connection Error"
            message={errorMsg}
            onRetry={() => fetchShops(searchQuery, selectedCategory)}
          />
        </View>
      ) : (
        <FlatList
          data={shops}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ShopCard
                shop={item}
                onPress={() => router.push(`/(customer)/shop/${item.id}` as any)}
              />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              title="No shops found"
              message={
                searchQuery
                  ? `No shops matching "${searchQuery}".`
                  : 'No shops available in this category currently.'
              }
              iconName="storefront-outline"
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primaryDeep]}
              tintColor={Colors.primaryDeep}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
  },
  listHeaderContainer: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.xs,
    paddingBottom: Theme.spacing.xs,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
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
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  searchSection: {
    marginBottom: Theme.spacing.sm,
  },
  categoryScroll: {
    paddingVertical: Theme.spacing.xs,
    paddingRight: Theme.spacing.md,
    gap: Theme.spacing.xs + 2,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs + 2,
    borderRadius: Theme.borderRadius.full,
  },
  selectedPill: {
    backgroundColor: Colors.primaryDeep,
    borderColor: Colors.primaryDeep,
  },
  pillIcon: {
    marginRight: 6,
  },
  pillText: {
    fontSize: Typography.fontSize.xs + 1,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
  },
  selectedPillText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
  },
  listContent: {
    paddingBottom: Theme.spacing.xxl,
  },
  cardWrapper: {
    paddingHorizontal: Theme.spacing.md,
  },
});
