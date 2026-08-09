import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ProductService } from '../../../../services/product.service';
import { ShopService } from '../../../../services/shop.service';
import { ProductResponse, ShopResponse, BackendProductCategory } from '../../../../types';
import { ProductCard, formatProductCategory } from '../../../../components/ProductCard';
import { SearchBar } from '../../../../components/SearchBar';
import { LoadingState } from '../../../../components/LoadingState';
import { EmptyState } from '../../../../components/EmptyState';
import { ErrorState } from '../../../../components/ErrorState';
import { Colors } from '../../../../constants/colors';
import { Typography } from '../../../../constants/typography';
import { Theme } from '../../../../constants/theme';

type SortOption = 'DEFAULT' | 'PRICE_LOW_HIGH' | 'PRICE_HIGH_LOW' | 'NAME_ASC';

export default function ShopProductsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [shop, setShop] = useState<ShopResponse | null>(null);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & Filter & Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('DEFAULT');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchShopAndProducts = useCallback(async () => {
    if (!id) return;
    try {
      setErrorMsg(null);
      const [shopData, productsData] = await Promise.all([
        ShopService.getShopById(id),
        ProductService.getProductsByShop(id),
      ]);
      setShop(shopData);
      setProducts(productsData);
    } catch (err: any) {
      console.warn('[ShopProductsScreen] Error loading products:', err);
      const status = err.response?.status;
      if (status === 404) {
        setErrorMsg('Shop or products not found.');
      } else {
        setErrorMsg('Unable to load products. Please check connection.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchShopAndProducts();
  }, [fetchShopAndProducts]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchShopAndProducts();
  };

  // Derive categories present in backend products for this shop
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [products]);

  // Filter & Sort pipeline
  const processedProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== 'ALL') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Search query filter
    if (debouncedQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(debouncedQuery) ||
          (p.description && p.description.toLowerCase().includes(debouncedQuery)) ||
          (p.category && p.category.toLowerCase().includes(debouncedQuery))
      );
    }

    // Sort
    switch (sortBy) {
      case 'PRICE_LOW_HIGH':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'PRICE_HIGH_LOW':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'NAME_ASC':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'DEFAULT':
      default:
        break;
    }

    return result;
  }, [products, selectedCategory, debouncedQuery, sortBy]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Back to shop details"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {shop?.shopName || 'Shop Catalog'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {processedProducts.length} {processedProducts.length === 1 ? 'item' : 'items'} available
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products in shop..."
        />
      </View>

      {/* Category Chips Bar */}
      {categoriesList.length > 1 && (
        <View style={styles.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContent}
          >
            {categoriesList.map((cat) => {
              const isActive = selectedCategory === cat;
              const label = cat === 'ALL' ? 'All Items' : formatProductCategory(cat);
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, isActive && styles.activeCategoryChip]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.categoryChipText, isActive && styles.activeCategoryChipText]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Sorting Options Bar */}
      <View style={styles.sortBar}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortChipsContainer}>
          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'DEFAULT' && styles.activeSortChip]}
            onPress={() => setSortBy('DEFAULT')}
          >
            <Text style={[styles.sortChipText, sortBy === 'DEFAULT' && styles.activeSortChipText]}>Featured</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'PRICE_LOW_HIGH' && styles.activeSortChip]}
            onPress={() => setSortBy('PRICE_LOW_HIGH')}
          >
            <Text style={[styles.sortChipText, sortBy === 'PRICE_LOW_HIGH' && styles.activeSortChipText]}>Price: Low → High</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'PRICE_HIGH_LOW' && styles.activeSortChip]}
            onPress={() => setSortBy('PRICE_HIGH_LOW')}
          >
            <Text style={[styles.sortChipText, sortBy === 'PRICE_HIGH_LOW' && styles.activeSortChipText]}>Price: High → Low</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'NAME_ASC' && styles.activeSortChip]}
            onPress={() => setSortBy('NAME_ASC')}
          >
            <Text style={[styles.sortChipText, sortBy === 'NAME_ASC' && styles.activeSortChipText]}>Name: A → Z</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {loading && !refreshing && products.length === 0 ? (
        <View style={styles.flex1}>
          {renderHeader()}
          <LoadingState message="Loading catalog..." />
        </View>
      ) : errorMsg && products.length === 0 ? (
        <View style={styles.flex1}>
          {renderHeader()}
          <ErrorState
            title="Catalog Error"
            message={errorMsg}
            onRetry={fetchShopAndProducts}
          />
        </View>
      ) : (
        <FlatList
          data={processedProducts}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ProductCard product={item} />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              title="No products found"
              message={
                searchQuery
                  ? `No products match your search "${searchQuery}".`
                  : selectedCategory !== 'ALL'
                  ? `No products found under ${formatProductCategory(selectedCategory)}.`
                  : "This shop has no products available in their catalog yet."
              }
              iconName="cube-outline"
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
  flex1: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.xs,
    paddingBottom: Theme.spacing.xs,
  },
  topBar: {
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
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: Theme.spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
  },
  searchSection: {
    marginBottom: Theme.spacing.xs,
  },
  categorySection: {
    marginVertical: Theme.spacing.xs,
  },
  categoriesScrollContent: {
    gap: Theme.spacing.xs,
    paddingRight: Theme.spacing.md,
  },
  categoryChip: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeCategoryChip: {
    backgroundColor: Colors.primaryDeep,
    borderColor: Colors.primaryDeep,
  },
  categoryChipText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
  },
  activeCategoryChipText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
    marginTop: 4,
  },
  sortLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.secondaryText,
    marginRight: Theme.spacing.xs,
  },
  sortChipsContainer: {
    gap: Theme.spacing.xs,
    paddingRight: Theme.spacing.md,
  },
  sortChip: {
    paddingHorizontal: Theme.spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeSortChip: {
    backgroundColor: Colors.lightSage,
    borderColor: Colors.primaryDeep,
  },
  sortChipText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.secondaryText,
  },
  activeSortChipText: {
    color: Colors.primaryDeep,
    fontFamily: Typography.fontFamily.bold,
  },
  listContent: {
    paddingBottom: Theme.spacing.xxl,
  },
  cardWrapper: {
    paddingHorizontal: Theme.spacing.md,
  },
});

