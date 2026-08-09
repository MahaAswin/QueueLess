import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SectionHeader } from '../../components/SectionHeader';
import { ShopCard } from '../../components/ShopCard';
import { SearchBar } from '../../components/SearchBar';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';

const MOCK_ALL_SHOPS = [
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
  {
    id: 's3',
    name: 'Metro Pharmacy & Health',
    description: 'Prescription pickup & daily wellness essentials',
    address: '101 Central Boulevard',
    category: 'Pharmacy' as const,
    rating: 4.7,
    reviewCount: 96,
    distanceKm: 1.2,
    estimatedPrepTimeMinutes: 3,
    isOpen: true,
  },
];

export default function ShopsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredShops = MOCK_ALL_SHOPS.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <SectionHeader title="Explore Shops" subtitle="Select a shop to schedule your express pickup" />
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search by shop name or category..." />
      <View style={styles.listContainer}>
        {filteredShops.map((shop) => (
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
  listContainer: {
    marginTop: Theme.spacing.md,
  },
});
