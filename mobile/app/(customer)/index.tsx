import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from '../../components/SearchBar';
import { SectionHeader } from '../../components/SectionHeader';
import { CategoryCard } from '../../components/CategoryCard';
import { ShopCard } from '../../components/ShopCard';
import { Avatar } from '../../components/Avatar';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

const MOCK_CATEGORIES = [
  { id: '1', name: 'All Shops', icon: 'grid-outline' as const },
  { id: '2', name: 'Coffee & Bakery', icon: 'cafe-outline' as const },
  { id: '3', name: 'Fast Food', icon: 'fast-food-outline' as const },
  { id: '4', name: 'Grocery', icon: 'cart-outline' as const },
  { id: '5', name: 'Pharmacy', icon: 'medical-outline' as const },
];

const MOCK_SHOPS = [
  {
    id: 's1',
    name: 'Green Leaf Organic Café',
    description: 'Fresh coffee, healthy artisan sandwiches & matcha bowls',
    address: '142 Market Street, Downtown',
    category: 'Coffee & Tea' as const,
    rating: 4.9,
    reviewCount: 184,
    distanceKm: 0.4,
    estimatedPrepTimeMinutes: 8,
    isOpen: true,
  },
  {
    id: 's2',
    name: 'Artisan Oven Bakery',
    description: 'Fresh sourdough, warm croissants, & morning pastries',
    address: '88 Baker Avenue',
    category: 'Bakery' as const,
    rating: 4.8,
    reviewCount: 230,
    distanceKm: 0.9,
    estimatedPrepTimeMinutes: 5,
    isOpen: true,
  },
];

export default function CustomerHomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = React.useState('1');
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Welcome back 👋</Text>
          <Text style={styles.headerTitle}>QueueLess Express</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(customer)/profile')}>
          <Avatar name="Alex Johnson" size={44} />
        </TouchableOpacity>
      </View>

      {/* Active Ticket Banner Mock */}
      <View style={[styles.banner, Theme.shadows.medium]}>
        <View style={styles.bannerHeader}>
          <View style={styles.bannerTag}>
            <Ionicons name="flash-outline" size={14} color={Colors.white} />
            <Text style={styles.bannerTagText}>Active Pickup Slot</Text>
          </View>
          <Text style={styles.bannerTime}>12:30 PM Slot</Text>
        </View>

        <Text style={styles.bannerTitle}>Green Leaf Organic Café</Text>
        <Text style={styles.bannerSubtitle}>2 items • Ready for Express Counter Collection</Text>

        <TouchableOpacity style={styles.bannerAction} onPress={() => router.push('/(customer)/qr')}>
          <Ionicons name="qr-code-outline" size={18} color={Colors.primaryDeep} />
          <Text style={styles.bannerActionText}>Show Pickup QR Code</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search nearby shops or items..." />

      {/* Categories */}
      <View style={styles.section}>
        <SectionHeader title="Categories" subtitle="Find shops by service type" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {MOCK_CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.id}
              name={cat.name}
              iconName={cat.icon}
              isSelected={selectedCategory === cat.id}
              onPress={() => setSelectedCategory(cat.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Nearby Shops */}
      <View style={styles.section}>
        <SectionHeader title="Nearby Express Shops" subtitle="Zero wait pickup ready" onActionPress={() => router.push('/(customer)/shops')} />
        {MOCK_SHOPS.map((shop) => (
          <ShopCard key={shop.id} shop={shop} onPress={() => router.push(`/(customer)/shop/${shop.id}` as any)} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Theme.spacing.md,
    paddingTop: Theme.spacing.xl + 10,
    paddingBottom: Theme.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  greetingText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.secondaryText,
    fontFamily: Typography.fontFamily.medium,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryDeep,
  },
  banner: {
    backgroundColor: Colors.primaryDeep,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  bannerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
  },
  bannerTagText: {
    color: Colors.white,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: 4,
  },
  bannerTime: {
    color: Colors.sage,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  bannerTitle: {
    color: Colors.white,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 2,
  },
  bannerSubtitle: {
    color: Colors.lightSage,
    fontSize: Typography.fontSize.xs,
    marginBottom: Theme.spacing.md,
  },
  bannerAction: {
    backgroundColor: Colors.white,
    paddingVertical: Theme.spacing.sm + 2,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerActionText: {
    color: Colors.primaryDeep,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    fontSize: Typography.fontSize.sm,
    marginLeft: Theme.spacing.xs,
  },
  section: {
    marginTop: Theme.spacing.md,
  },
  categoryList: {
    paddingRight: Theme.spacing.md,
  },
});
