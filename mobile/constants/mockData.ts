import { Category, ShopPreview } from '../types';

export const MOCK_LOCATION = 'Vellakovil';

export const MOCK_USER_NAME = 'Aswin';

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'grocery',
    name: 'Grocery',
    icon: 'cart-outline',
  },
  {
    id: 'food',
    name: 'Food',
    icon: 'fast-food-outline',
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    icon: 'medical-outline',
  },
  {
    id: 'bakery',
    name: 'Bakery',
    icon: 'cafe-outline',
  },
  {
    id: 'fruits_veg',
    name: 'Fruits & Vegetables',
    icon: 'nutrition-outline',
  },
  {
    id: 'daily_needs',
    name: 'Daily Needs',
    icon: 'grid-outline',
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: 'hardware-chip-outline',
  },
  {
    id: 'more',
    name: 'More',
    icon: 'ellipsis-horizontal-circle-outline',
  },
];

export const MOCK_NEARBY_SHOPS: ShopPreview[] = [
  {
    id: 'shop_1',
    name: 'Fresh Mart',
    description: 'Fresh organic groceries, farm-fresh produce & daily essentials',
    address: 'Main Road, Vellakovil',
    category: 'Grocery',
    rating: 4.7,
    reviewCount: 142,
    distanceKm: 0.8,
    estimatedPrepTimeMinutes: 15,
    isOpen: true,
  },
  {
    id: 'shop_2',
    name: 'Green Bites',
    description: 'Healthy snacks, fresh juices, salads & quick deli bites',
    address: 'Near Bus Stand, Vellakovil',
    category: 'Restaurant',
    rating: 4.5,
    reviewCount: 98,
    distanceKm: 1.2,
    estimatedPrepTimeMinutes: 20,
    isOpen: true,
  },
  {
    id: 'shop_3',
    name: 'Bake House',
    description: 'Warm oven-baked pastries, sourdough bread & artisan cakes',
    address: 'Kovai Road, Vellakovil',
    category: 'Bakery',
    rating: 4.6,
    reviewCount: 210,
    distanceKm: 1.5,
    estimatedPrepTimeMinutes: 25,
    isOpen: true,
  },
];
