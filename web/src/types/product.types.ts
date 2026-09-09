export type ProductCategory =
  | 'DAIRY'
  | 'SNACKS'
  | 'BEVERAGES'
  | 'BAKERY'
  | 'PRODUCE'
  | 'MEAT'
  | 'PERSONAL_CARE'
  | 'HOUSEHOLD'
  | 'MEDICINE'
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
  preparationTimeMinutes?: number;
}
