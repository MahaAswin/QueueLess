export type ShopCategory =
  | 'GROCERY'
  | 'RESTAURANT'
  | 'PHARMACY'
  | 'BAKERY'
  | 'STATIONERY'
  | 'MEAT_SHOP'
  | 'OTHER';

export type ShopStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export interface Shop {
  id: string;
  name: string;
  shopName?: string;
  description?: string;
  category: ShopCategory;
  address: string;
  city: string;
  phone: string;
  email?: string;
  status: ShopStatus;
  openingTime?: string;
  closingTime?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  totalOrdersCount?: number;
  imageUrl?: string;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateShopPayload {
  name: string;
  description?: string;
  category: ShopCategory;
  address: string;
  city: string;
  phone: string;
}

export interface UpdateShopPayload {
  name?: string;
  description?: string;
  category?: ShopCategory;
  address?: string;
  city?: string;
  phone?: string;
  status?: ShopStatus;
}
