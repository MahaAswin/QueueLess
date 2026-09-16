export type ProductCategory =
  | 'GROCERY'
  | 'FRUITS_VEGETABLES'
  | 'DAIRY'
  | 'BEVERAGES'
  | 'SNACKS'
  | 'MEDICINE'
  | 'PERSONAL_CARE'
  | 'BAKERY'
  | 'RESTAURANT'
  | 'STATIONERY'
  | 'MEAT'
  | 'OTHER';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'GROCERY',
  'FRUITS_VEGETABLES',
  'DAIRY',
  'BEVERAGES',
  'SNACKS',
  'MEDICINE',
  'PERSONAL_CARE',
  'BAKERY',
  'RESTAURANT',
  'STATIONERY',
  'MEAT',
  'OTHER',
];

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  GROCERY: 'Grocery',
  FRUITS_VEGETABLES: 'Fruits & Vegetables',
  DAIRY: 'Dairy',
  BEVERAGES: 'Beverages',
  SNACKS: 'Snacks',
  MEDICINE: 'Medicine',
  PERSONAL_CARE: 'Personal Care',
  BAKERY: 'Bakery',
  RESTAURANT: 'Restaurant & Prepared',
  STATIONERY: 'Stationery',
  MEAT: 'Meat & Poultry',
  OTHER: 'Other',
};

export interface Product {
  id: string;
  shopId: string;
  shopName?: string;
  name: string;
  description?: string;
  price: number;
  category: ProductCategory;
  imageUrl?: string;
  available: boolean;
  stockQuantity: number;
  unit?: string;
  preparationTimeMinutes?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  category: ProductCategory;
  imageUrl?: string;
  stockQuantity: number;
  unit?: string;
  available?: boolean;
  preparationTimeMinutes?: number;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  category?: ProductCategory;
  imageUrl?: string;
  available?: boolean;
  stockQuantity?: number;
  unit?: string;
  preparationTimeMinutes?: number;
}

export type ProductAvailabilityFilter = 'ALL' | 'AVAILABLE' | 'UNAVAILABLE';
export type ProductStockFilter = 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
export type ProductSortOption =
  | 'NAME_ASC'
  | 'NAME_DESC'
  | 'PRICE_ASC'
  | 'PRICE_DESC'
  | 'STOCK_ASC'
  | 'STOCK_DESC'
  | 'NEWEST';
