import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LocationHeader } from '../../components/LocationHeader';
import { GreetingHeader } from '../../components/GreetingHeader';
import { SearchBar } from '../../components/SearchBar';
import { QueueHeroCard } from '../../components/QueueHeroCard';
import { SectionHeader } from '../../components/SectionHeader';
import { CategoryCard } from '../../components/CategoryCard';
import { ShopCard } from '../../components/ShopCard';
import { PickupValueCard } from '../../components/PickupValueCard';
import { EmptyState } from '../../components/EmptyState';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/colors';
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


  const handleCategoryPress = (id: string) => {
    setSelectedCategoryId((prev) => (prev === id ? null : id));
  };

  const filteredShops = MOCK_NEARBY_SHOPS.filter((shop) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (shop.description && shop.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      !selectedCategoryId ||
      selectedCategoryId === 'more' ||
      shop.category.toLowerCase().includes(selectedCategoryId.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 1 & 2. Location Header & Actions */}
        <LocationHeader
          locationName={MOCK_LOCATION}
          userName={userName}
          onLocationPress={() => {
            /* Location selection modal/action UI placeholder */
          }}
          onNotificationPress={() => router.push('/(customer)/notifications')}
          onProfilePress={() => router.push('/(customer)/profile')}
        />

        {/* 3. Greeting Header */}
        <GreetingHeader userName={userName} greetingTime="Good morning" />

        {/* 4. Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search shops or products"
        />

        {/* 5. QueueLess Hero Card */}
        <QueueHeroCard
          onStartOrdering={() => router.push('/(customer)/shops')}
        />

        {/* 6. Shop by Category */}
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

        {/* 7. Nearby Shops */}
        <View style={styles.section}>
          <SectionHeader
            title="Nearby Shops"
            actionText="See all"
            onActionPress={() => router.push('/(customer)/shops')}
          />

          {filteredShops.length > 0 ? (
            filteredShops.map((shop) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                onPress={() => router.push(`/(customer)/shop/${shop.id}` as any)}
                onOrderPress={() => router.push(`/(customer)/shop/${shop.id}` as any)}
              />
            ))
          ) : (
            <EmptyState
              title="No shops found"
              message={`No shops matching "${searchQuery}". Try a different search.`}
              iconName="search-outline"
            />
          )}
        </View>

        {/* 8. Pickup Value Reinforcement */}
        <PickupValueCard />
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
    paddingTop: Theme.spacing.xs,
    paddingBottom: Theme.spacing.xl,
  },
  section: {
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },
  categoryList: {
    paddingVertical: Theme.spacing.xs,
    paddingRight: Theme.spacing.md,
  },
});
