import type { ShopCategory } from '../../../types/shop.types';

export interface CategoryTheme {
  category: ShopCategory;
  label: string;
  tag: string;
  iconEmoji: string;
  bgPastel: string;
  borderPastel: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  iconBg: string;
  illustration3d: string;
  slogan: string;
  sloganIcon: string;
  prepStageVerb: string;
}

export const CATEGORY_THEMES: Record<ShopCategory, CategoryTheme> = {
  GROCERY: {
    category: 'GROCERY',
    label: 'Grocery Store',
    tag: 'Grocery Store',
    iconEmoji: '🛒',
    bgPastel: '#EAFBF1', // Mint Green from reference
    borderPastel: '#C6F6D5',
    accentColor: '#10B981',
    badgeBg: '#DCFCE7',
    badgeText: '#047857',
    iconBg: '#DCFCE7',
    illustration3d: '/assets/categories/grocery.jpg',
    slogan: 'Fresh essentials, no waiting!',
    sloganIcon: '🌱',
    prepStageVerb: 'Picking',
  },
  BAKERY: {
    category: 'BAKERY',
    label: 'Bakery & Snacks',
    tag: 'Bakery & Snacks',
    iconEmoji: '🧁',
    bgPastel: '#FFF5EE', // Peach from reference
    borderPastel: '#FED7AA',
    accentColor: '#F59E0B',
    badgeBg: '#FEF3C7',
    badgeText: '#B45309',
    iconBg: '#FEF3C7',
    illustration3d: '/assets/categories/bakery.jpg',
    slogan: 'Freshly baked. Quickly yours!',
    sloganIcon: '❤️',
    prepStageVerb: 'Preparing',
  },
  PHARMACY: {
    category: 'PHARMACY',
    label: 'Pharmacy',
    tag: 'Pharmacy',
    iconEmoji: '💊',
    bgPastel: '#EDF7FF', // Sky Blue from reference
    borderPastel: '#BAE6FD',
    accentColor: '#3B82F6',
    badgeBg: '#E0F2FE',
    badgeText: '#0369A1',
    iconBg: '#E0F2FE',
    illustration3d: '/assets/categories/pharmacy.jpg',
    slogan: 'Your health. Our priority.',
    sloganIcon: '💙',
    prepStageVerb: 'Preparing',
  },
  STATIONERY: {
    category: 'STATIONERY',
    label: 'Stationery & Books',
    tag: 'Stationery & Books',
    iconEmoji: '📖',
    bgPastel: '#F5F2FF', // Lavender / Violet from reference
    borderPastel: '#DDD6FE',
    accentColor: '#6366F1',
    badgeBg: '#EDE9FE',
    badgeText: '#4F46E5',
    iconBg: '#EDE9FE',
    illustration3d: '/assets/categories/stationery.jpg',
    slogan: 'Learn more. Wait less.',
    sloganIcon: '🌱',
    prepStageVerb: 'Packing',
  },
  RESTAURANT: {
    category: 'RESTAURANT',
    label: 'Food & Beverages',
    tag: 'Food & Beverages',
    iconEmoji: '🍴',
    bgPastel: '#FFF1F2', // Rose / Coral from reference
    borderPastel: '#FECDD3',
    accentColor: '#F43F5E',
    badgeBg: '#FFE4E6',
    badgeText: '#BE123C',
    iconBg: '#FFE4E6',
    illustration3d: '/assets/categories/restaurant.jpg',
    slogan: 'Good food, brighter days!',
    sloganIcon: '❤️',
    prepStageVerb: 'Preparing',
  },
  MEAT_SHOP: {
    category: 'MEAT_SHOP',
    label: 'Meat & Seafood',
    tag: 'Meat & Seafood',
    iconEmoji: '🥩',
    bgPastel: '#FFF1F2',
    borderPastel: '#FECDD3',
    accentColor: '#E11D48',
    badgeBg: '#FFE4E6',
    badgeText: '#9F1239',
    iconBg: '#FFE4E6',
    illustration3d: '/assets/categories/grocery.jpg',
    slogan: 'Fresh cuts, quick pickup!',
    sloganIcon: '🌱',
    prepStageVerb: 'Packing',
  },
  OTHER: {
    category: 'OTHER',
    label: 'General Store',
    tag: 'General Store',
    iconEmoji: '🏪',
    bgPastel: '#FEFCE8', // Soft Butter Yellow from reference
    borderPastel: '#FEF08A',
    accentColor: '#EAB308',
    badgeBg: '#FEF9C3',
    badgeText: '#854D0E',
    iconBg: '#FEF9C3',
    illustration3d: '/assets/categories/general.jpg',
    slogan: 'Everyday needs, made easier.',
    sloganIcon: '🌱',
    prepStageVerb: 'Packing',
  },
};

/**
 * Infer category from shop metadata or shop name keywords if category is absent.
 */
export const resolveCategory = (
  category?: ShopCategory | string | null,
  shopName?: string | null
): ShopCategory => {
  if (category && category.toUpperCase() in CATEGORY_THEMES) {
    return category.toUpperCase() as ShopCategory;
  }

  if (!shopName) return 'OTHER';
  const name = shopName.toLowerCase();

  if (
    name.includes('grocery') ||
    name.includes('mart') ||
    name.includes('supermarket') ||
    name.includes('kirana') ||
    name.includes('provisions')
  ) {
    return 'GROCERY';
  }
  if (
    name.includes('cafe') ||
    name.includes('bake') ||
    name.includes('coffee') ||
    name.includes('tea') ||
    name.includes('cake') ||
    name.includes('pastry') ||
    name.includes('daily bake')
  ) {
    return 'BAKERY';
  }
  if (
    name.includes('pharmacy') ||
    name.includes('med') ||
    name.includes('chem') ||
    name.includes('health') ||
    name.includes('drug') ||
    name.includes('healthplus')
  ) {
    return 'PHARMACY';
  }
  if (
    name.includes('station') ||
    name.includes('book') ||
    name.includes('xerox') ||
    name.includes('print') ||
    name.includes('pen') ||
    name.includes('paper')
  ) {
    return 'STATIONERY';
  }
  if (
    name.includes('meat') ||
    name.includes('chicken') ||
    name.includes('fish') ||
    name.includes('mutton') ||
    name.includes('seafood')
  ) {
    return 'MEAT_SHOP';
  }
  if (
    name.includes('restaurant') ||
    name.includes('food') ||
    name.includes('kitchen') ||
    name.includes('canteen') ||
    name.includes('diner') ||
    name.includes('burger') ||
    name.includes('pizza') ||
    name.includes('biryani') ||
    name.includes('dhaba')
  ) {
    return 'RESTAURANT';
  }

  return 'OTHER';
};

/**
 * Returns the resolved CategoryTheme for an order/shop.
 */
export const getCategoryTheme = (
  category?: ShopCategory | string | null,
  shopName?: string | null
): CategoryTheme => {
  const cat = resolveCategory(category, shopName);
  return CATEGORY_THEMES[cat] || CATEGORY_THEMES.OTHER;
};
