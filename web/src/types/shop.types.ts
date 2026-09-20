export type ShopCategory =
  | 'GROCERY'
  | 'RESTAURANT'
  | 'PHARMACY'
  | 'BAKERY'
  | 'STATIONERY'
  | 'MEAT_SHOP'
  | 'OTHER';

export const SHOP_CATEGORIES: ShopCategory[] = [
  'GROCERY',
  'RESTAURANT',
  'PHARMACY',
  'BAKERY',
  'STATIONERY',
  'MEAT_SHOP',
  'OTHER',
];

export const SHOP_CATEGORY_LABELS: Record<ShopCategory, string> = {
  GROCERY: 'Grocery & Supermarket',
  RESTAURANT: 'Restaurant & Dining',
  PHARMACY: 'Pharmacy & Medical',
  BAKERY: 'Bakery & Confectionery',
  STATIONERY: 'Stationery & Books',
  MEAT_SHOP: 'Meat & Poultry',
  OTHER: 'Other Retail',
};

export type ShopStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export const SHOP_STATUS_META: Record<
  ShopStatus,
  { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; description: string }
> = {
  ACTIVE: {
    label: 'Active & Open',
    variant: 'success',
    description: 'Shop is live and accepting customer orders.',
  },
  INACTIVE: {
    label: 'Temporarily Inactive',
    variant: 'neutral',
    description: 'Shop is hidden from customer discoveries.',
  },
  PENDING: {
    label: 'Pending Approval',
    variant: 'warning',
    description: 'Shop is pending platform verification.',
  },
  SUSPENDED: {
    label: 'Suspended by Admin',
    variant: 'error',
    description: 'Outlet is suspended due to compliance review.',
  },
};

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
  shopName?: string;
  name?: string;
  description?: string;
  category: ShopCategory;
  phone: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  openingTime: string;
  closingTime: string;
  imageUrl?: string;
}

export interface UpdateShopPayload {
  shopName?: string;
  name?: string;
  description?: string;
  category?: ShopCategory;
  phone?: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  openingTime?: string;
  closingTime?: string;
  imageUrl?: string;
  status?: ShopStatus;
}

export interface NearbyShop extends Shop {
  distanceMeters: number;
  distanceFormatted?: string;
  isOpen?: boolean;
  averageWaitMinutes?: number;
}

export interface NearbyShopsResponse {
  shops: NearbyShop[];
  radiusMeters: number;
  count: number;
  userLatitude: number;
  userLongitude: number;
}

export interface RadiusOption {
  value: number;
  label: string;
}

export const RADIUS_OPTIONS: RadiusOption[] = [
  { value: 50, label: '50 m' },
  { value: 100, label: '100 m' },
  { value: 500, label: '500 m' },
  { value: 1000, label: '1 km' },
  { value: 2000, label: '2 km' },
  { value: 5000, label: '5 km' },
];

