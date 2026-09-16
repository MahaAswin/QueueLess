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
  | 'PRODUCE'
  | 'HOUSEHOLD'
  | 'OTHER';

export interface Product {
  id: string;
  shopId: string;
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

