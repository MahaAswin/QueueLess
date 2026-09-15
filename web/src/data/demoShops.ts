import type { Shop } from '../types/shop.types';
import type { Product } from '../types/product.types';

/**
 * ============================================================================
 * TEMPORARY MANUAL DEMO DATA FOR QUEUELESS CUSTOMER WEB EXPERIENCE
 * ============================================================================
 * 
 * TODO: Remove or disable this temporary demo fallback once backend seed
 * data is permanently available in the production database.
 * 
 * This module provides realistic demo shops and catalog products for
 * development, UI testing, and zero-downtime offline demonstrations.
 */

export const DEMO_SHOPS: Shop[] = [
  {
    id: 'demo-shop-1',
    name: 'Campus Cafe',
    shopName: 'Campus Cafe',
    description: 'Fresh south-Indian breakfast, snacks, hot beverages and fresh juices with rapid express counter pickup.',
    category: 'RESTAURANT',
    address: 'Student Activity Center, North Block',
    city: 'Campus Campus',
    phone: '+91 98765 43210',
    email: 'campuscafe@queueless.local',
    status: 'ACTIVE',
    openingTime: '07:30',
    closingTime: '21:00',
    rating: 4.8,
    totalOrdersCount: 1420,
    imageUrl: '',
  },
  {
    id: 'demo-shop-2',
    name: 'Green Leaf Restaurant',
    shopName: 'Green Leaf Restaurant',
    description: 'Wholesome vegetarian thalis, paneer specialties, Chinese favorites, and fresh hot chapatis.',
    category: 'RESTAURANT',
    address: 'Commercial Avenue, Ground Floor',
    city: 'Campus Campus',
    phone: '+91 98765 43211',
    email: 'greenleaf@queueless.local',
    status: 'ACTIVE',
    openingTime: '11:00',
    closingTime: '22:30',
    rating: 4.6,
    totalOrdersCount: 980,
    imageUrl: '',
  },
  {
    id: 'demo-shop-3',
    name: 'Fresh Bites',
    shopName: 'Fresh Bites',
    description: 'Gourmet burgers, crispy french fries, grilled sandwiches, and chilled refreshing milkshakes.',
    category: 'RESTAURANT',
    address: 'Food Court, Level 2, Food Plaza',
    city: 'Campus Campus',
    phone: '+91 98765 43212',
    email: 'freshbites@queueless.local',
    status: 'ACTIVE',
    openingTime: '10:00',
    closingTime: '22:00',
    rating: 4.7,
    totalOrdersCount: 840,
    imageUrl: '',
  },
  {
    id: 'demo-shop-4',
    name: 'Brew Corner',
    shopName: 'Brew Corner',
    description: 'Artisanal espresso, frothy cappuccinos, cold brews, and freshly baked fudge brownies.',
    category: 'BAKERY',
    address: 'Library Plaza, West Wing',
    city: 'Campus Campus',
    phone: '+91 98765 43213',
    email: 'brewcorner@queueless.local',
    status: 'ACTIVE',
    openingTime: '08:00',
    closingTime: '20:00',
    rating: 4.9,
    totalOrdersCount: 1150,
    imageUrl: '',
  },
  {
    id: 'demo-shop-5',
    name: 'Student Tiffin Center',
    shopName: 'Student Tiffin Center',
    description: 'Traditional hot tiffin items: ghee pongal, fluffy pooris, layered parottas, and chutneys.',
    category: 'RESTAURANT',
    address: 'Hostel Complex Gate 3',
    city: 'Campus Campus',
    phone: '+91 98765 43214',
    email: 'tiffincenter@queueless.local',
    status: 'ACTIVE',
    openingTime: '07:00',
    closingTime: '21:30',
    rating: 4.5,
    totalOrdersCount: 2100,
    imageUrl: '',
  },
  {
    id: 'demo-shop-6',
    name: 'Quick Mart',
    shopName: 'Quick Mart',
    description: 'Packaged snacks, beverages, dairy essentials, biscuits, and daily packaged convenience goods.',
    category: 'GROCERY',
    address: 'Residential Arcade, Shop #4',
    city: 'Campus Campus',
    phone: '+91 98765 43215',
    email: 'quickmart@queueless.local',
    status: 'ACTIVE',
    openingTime: '06:30',
    closingTime: '23:00',
    rating: 4.6,
    totalOrdersCount: 650,
    imageUrl: '',
  },
];

export const DEMO_PRODUCTS: Record<string, Product[]> = {
  'demo-shop-1': [
    {
      id: 'demo-prod-1-1',
      shopId: 'demo-shop-1',
      name: 'Masala Dosa',
      description: 'Crispy golden crepe filled with spiced potato masala, served with coconut chutney & sambar.',
      price: 50,
      category: 'OTHER',
      available: true,
      stockQuantity: 40,
      preparationTimeMinutes: 8,
    },
    {
      id: 'demo-prod-1-2',
      shopId: 'demo-shop-1',
      name: 'Idli (2 Pcs)',
      description: 'Steamed fluffy rice & lentil cakes served with traditional hot sambar and spicy podi.',
      price: 35,
      category: 'OTHER',
      available: true,
      stockQuantity: 50,
      preparationTimeMinutes: 4,
    },
    {
      id: 'demo-prod-1-3',
      shopId: 'demo-shop-1',
      name: 'Medu Vada (1 Pc)',
      description: 'Golden crispy lentil doughnut fritter with crunchy exterior and soft fluffy interior.',
      price: 30,
      category: 'SNACKS',
      available: true,
      stockQuantity: 30,
      preparationTimeMinutes: 5,
    },
    {
      id: 'demo-prod-1-4',
      shopId: 'demo-shop-1',
      name: 'Veg Sandwich',
      description: 'Toasted bread loaded with fresh cucumber, tomato, onion, mint chutney and cheese spread.',
      price: 60,
      category: 'SNACKS',
      available: true,
      stockQuantity: 25,
      preparationTimeMinutes: 7,
    },
    {
      id: 'demo-prod-1-5',
      shopId: 'demo-shop-1',
      name: 'Special Masala Tea',
      description: 'Aromatic strong milk tea infused with crushed cardamom, ginger and premium tea leaves.',
      price: 15,
      category: 'BEVERAGES',
      available: true,
      stockQuantity: 100,
      preparationTimeMinutes: 3,
    },
    {
      id: 'demo-prod-1-6',
      shopId: 'demo-shop-1',
      name: 'Filter Coffee',
      description: 'Authentic South-Indian degree filter coffee brewed with chicory blend and frothy fresh milk.',
      price: 25,
      category: 'BEVERAGES',
      available: true,
      stockQuantity: 80,
      preparationTimeMinutes: 3,
    },
    {
      id: 'demo-prod-1-7',
      shopId: 'demo-shop-1',
      name: 'Fresh Lime Juice',
      description: 'Freshly squeezed sweet and salted lemon cooler with refreshing crushed mint and ice.',
      price: 30,
      category: 'BEVERAGES',
      available: true,
      stockQuantity: 40,
      preparationTimeMinutes: 4,
    },
  ],
  'demo-shop-2': [
    {
      id: 'demo-prod-2-1',
      shopId: 'demo-shop-2',
      name: 'Executive Veg Meals',
      description: 'Complete platter with steamed rice, sambar, rasam, kootu, poriyal, curd, papad & dessert.',
      price: 120,
      category: 'OTHER',
      available: true,
      stockQuantity: 30,
      preparationTimeMinutes: 10,
    },
    {
      id: 'demo-prod-2-2',
      shopId: 'demo-shop-2',
      name: 'Paneer Fried Rice',
      description: 'Wok-tossed basmati rice with fried cottage cheese cubes, bell peppers and oriental sauces.',
      price: 110,
      category: 'OTHER',
      available: true,
      stockQuantity: 20,
      preparationTimeMinutes: 12,
    },
    {
      id: 'demo-prod-2-3',
      shopId: 'demo-shop-2',
      name: 'Gobi Manchurian Dry',
      description: 'Crisp batter-coated cauliflower florets tossed with garlic, ginger, scallions and soy glaze.',
      price: 90,
      category: 'SNACKS',
      available: true,
      stockQuantity: 25,
      preparationTimeMinutes: 10,
    },
    {
      id: 'demo-prod-2-4',
      shopId: 'demo-shop-2',
      name: 'Phulka Chapati (1 Pc)',
      description: 'Soft whole wheat flatbread made fresh on iron tawa with subtle ghee brushing.',
      price: 15,
      category: 'OTHER',
      available: true,
      stockQuantity: 80,
      preparationTimeMinutes: 3,
    },
    {
      id: 'demo-prod-2-5',
      shopId: 'demo-shop-2',
      name: 'Lemon Rice',
      description: 'Tangy tempered rice flavored with fresh lemon juice, mustard seeds, curry leaves & peanuts.',
      price: 70,
      category: 'OTHER',
      available: true,
      stockQuantity: 35,
      preparationTimeMinutes: 5,
    },
  ],
  'demo-shop-3': [
    {
      id: 'demo-prod-3-1',
      shopId: 'demo-shop-3',
      name: 'Crispy Veg Burger',
      description: 'Herb seasoned potato patty with crisp lettuce, sliced tomato, pickles and tangy burger sauce.',
      price: 80,
      category: 'SNACKS',
      available: true,
      stockQuantity: 25,
      preparationTimeMinutes: 8,
    },
    {
      id: 'demo-prod-3-2',
      shopId: 'demo-shop-3',
      name: 'Peri-Peri French Fries',
      description: 'Golden salted potato fries tossed in fiery African peri-peri spice dust.',
      price: 60,
      category: 'SNACKS',
      available: true,
      stockQuantity: 35,
      preparationTimeMinutes: 6,
    },
    {
      id: 'demo-prod-3-3',
      shopId: 'demo-shop-3',
      name: 'Grilled Cheese Sandwich',
      description: 'Triple-decker sandwich loaded with melted cheddar, mozzarella, and herbs.',
      price: 75,
      category: 'SNACKS',
      available: true,
      stockQuantity: 20,
      preparationTimeMinutes: 7,
    },
    {
      id: 'demo-prod-3-4',
      shopId: 'demo-shop-3',
      name: 'Iced Cold Coffee',
      description: 'Blended chilled milk with bold espresso shot, vanilla syrup and chocolate drizzle.',
      price: 70,
      category: 'BEVERAGES',
      available: true,
      stockQuantity: 40,
      preparationTimeMinutes: 4,
    },
  ],
  'demo-shop-4': [
    {
      id: 'demo-prod-4-1',
      shopId: 'demo-shop-4',
      name: 'Classic Cappuccino',
      description: 'Rich dark espresso topped with steamed milk and a velvety layer of thick milk foam.',
      price: 90,
      category: 'BEVERAGES',
      available: true,
      stockQuantity: 50,
      preparationTimeMinutes: 5,
    },
    {
      id: 'demo-prod-4-2',
      shopId: 'demo-shop-4',
      name: 'Caramel Cafe Latte',
      description: 'Smooth espresso with abundant steamed milk and sweetened caramel syrup drizzle.',
      price: 100,
      category: 'BEVERAGES',
      available: true,
      stockQuantity: 45,
      preparationTimeMinutes: 5,
    },
    {
      id: 'demo-prod-4-3',
      shopId: 'demo-shop-4',
      name: 'Signature Cold Brew',
      description: 'Slow-steeped 16-hour artisan coffee poured over crystal ice cubes for maximum clarity.',
      price: 110,
      category: 'BEVERAGES',
      available: true,
      stockQuantity: 30,
      preparationTimeMinutes: 2,
    },
    {
      id: 'demo-prod-4-4',
      shopId: 'demo-shop-4',
      name: 'Dark Chocolate Brownie',
      description: 'Warm, gooey dark cocoa fudge brownie with toasted walnut crust.',
      price: 60,
      category: 'BAKERY',
      available: true,
      stockQuantity: 20,
      preparationTimeMinutes: 2,
    },
  ],
  'demo-shop-5': [
    {
      id: 'demo-prod-5-1',
      shopId: 'demo-shop-5',
      name: 'Ghee Ven Pongal',
      description: 'Steaming hot rice and yellow moong dal cooked with pure desi ghee, black pepper & cashews.',
      price: 45,
      category: 'OTHER',
      available: true,
      stockQuantity: 40,
      preparationTimeMinutes: 5,
    },
    {
      id: 'demo-prod-5-2',
      shopId: 'demo-shop-5',
      name: 'Poori Masala (2 Pcs)',
      description: 'Puffed golden pooris served with spiced yellow potato-onion bhaji.',
      price: 50,
      category: 'OTHER',
      available: true,
      stockQuantity: 30,
      preparationTimeMinutes: 6,
    },
    {
      id: 'demo-prod-5-3',
      shopId: 'demo-shop-5',
      name: 'Tiffin Chapati with Kurma (2 Pcs)',
      description: 'Two soft chapatis served with aromatic South-Indian vegetable coconut kurma.',
      price: 40,
      category: 'OTHER',
      available: true,
      stockQuantity: 45,
      preparationTimeMinutes: 4,
    },
    {
      id: 'demo-prod-5-4',
      shopId: 'demo-shop-5',
      name: 'Malabar Parotta with Salna (2 Pcs)',
      description: 'Flaky, layered golden parottas served with rich spicy street-style vegetable salna.',
      price: 50,
      category: 'OTHER',
      available: true,
      stockQuantity: 50,
      preparationTimeMinutes: 5,
    },
  ],
  'demo-shop-6': [
    {
      id: 'demo-prod-6-1',
      shopId: 'demo-shop-6',
      name: 'Mineral Water (1 Litre)',
      description: 'Packaged purified drinking water with added minerals.',
      price: 20,
      category: 'BEVERAGES',
      available: true,
      stockQuantity: 120,
      preparationTimeMinutes: 1,
    },
    {
      id: 'demo-prod-6-2',
      shopId: 'demo-shop-6',
      name: 'Packaged Mango Fruit Juice (250ml)',
      description: 'Sweet and chilled alphonso mango fruit drink tetra pack.',
      price: 40,
      category: 'BEVERAGES',
      available: true,
      stockQuantity: 60,
      preparationTimeMinutes: 1,
    },
    {
      id: 'demo-prod-6-3',
      shopId: 'demo-shop-6',
      name: 'Classic Potato Chips (Salted)',
      description: 'Crispy thin-sliced potato chips lightly seasoned with rock salt.',
      price: 30,
      category: 'SNACKS',
      available: true,
      stockQuantity: 50,
      preparationTimeMinutes: 1,
    },
    {
      id: 'demo-prod-6-4',
      shopId: 'demo-shop-6',
      name: 'Chocolate Cream Biscuits',
      description: 'Crunchy chocolate cookie sandwich filled with rich cocoa cream.',
      price: 25,
      category: 'SNACKS',
      available: true,
      stockQuantity: 40,
      preparationTimeMinutes: 1,
    },
  ],
};

/**
 * Helper to fetch all demo shops
 */
export const getDemoShops = (): Shop[] => {
  return DEMO_SHOPS;
};

/**
 * Helper to find a demo shop by ID or slug (supports e.g. 'demo-1', 'demo-shop-1', '1')
 */
export const getDemoShopById = (id: string): Shop | undefined => {
  if (!id) return undefined;
  const cleanId = id.trim().toLowerCase();
  return DEMO_SHOPS.find(
    (s) =>
      s.id.toLowerCase() === cleanId ||
      s.id.toLowerCase() === `demo-shop-${cleanId}` ||
      s.id.toLowerCase() === `demo-${cleanId}` ||
      s.name.toLowerCase().includes(cleanId)
  );
};

/**
 * Helper to fetch demo products for a shop ID
 */
export const getDemoProductsByShopId = (shopId: string): Product[] => {
  const shop = getDemoShopById(shopId);
  if (!shop) {
    // If shopId matches direct key
    return DEMO_PRODUCTS[shopId] || [];
  }
  return DEMO_PRODUCTS[shop.id] || [];
};

/**
 * Helper to find a demo product across all demo catalogs
 */
export const getDemoProductById = (productId: string): Product | undefined => {
  for (const shopProducts of Object.values(DEMO_PRODUCTS)) {
    const found = shopProducts.find((p) => p.id === productId);
    if (found) return found;
  }
  return undefined;
};
