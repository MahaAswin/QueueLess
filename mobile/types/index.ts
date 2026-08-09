export type UserRole = 'CUSTOMER' | 'SHOP_OWNER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  trustScore?: number;
  isSuspended?: boolean;
  avatarUrl?: string;
  createdAt?: string;
}

export type BackendShopCategory =
  | 'GROCERY'
  | 'PHARMACY'
  | 'RESTAURANT'
  | 'BAKERY'
  | 'STATIONERY'
  | 'MEAT_SHOP'
  | 'OTHER';

export type ShopStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface ShopOwnerSummary {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
}

export interface ShopResponse {
  id: string;
  owner?: ShopOwnerSummary;
  shopName: string;
  description?: string;
  category: BackendShopCategory;
  phone?: string;
  address: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  openingTime?: string; // HH:mm
  closingTime?: string; // HH:mm
  status: ShopStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type BackendProductCategory =
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

export interface ProductResponse {
  id: string;
  shopId: string;
  shopName?: string;
  name: string;
  description?: string;
  price: number;
  stockQuantity?: number;
  category: BackendProductCategory;
  imageUrl?: string;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// UI Compatibility Types
export type ShopCategory = BackendShopCategory | string;

export interface Category {
  id: string;
  name: string;
  icon: string;
  backendCategory?: BackendShopCategory;
}

export interface ShopPreview {
  id: string;
  name: string;
  description?: string;
  address: string;
  category: ShopCategory;
  imageUrl?: string;
  rating: number;
  reviewCount?: number;
  distanceKm: number;
  estimatedPrepTimeMinutes: number;
  isOpen: boolean;
}

export interface Shop {
  id: string;
  name: string;
  description?: string;
  address: string;
  category: ShopCategory;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  distanceKm?: number;
  estimatedPrepTimeMinutes?: number;
  isOpen: boolean;
  openHours?: string;
  latitude?: number;
  longitude?: number;
  ownerId?: string;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  preparationTimeMinutes: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  specialInstructions?: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface PickupSlot {
  id: string;
  shopId: string;
  startTime: string; // e.g. "12:30 PM"
  endTime: string;   // e.g. "12:45 PM"
  maxOrders: number;
  currentOrders: number;
  isAvailable: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  shopId: string;
  shopName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  pickupSlot: PickupSlot;
  qrCodeUrl?: string;
  qrCodeValue?: string;
  createdAt: string;
  estimatedPickupTime?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: 'ORDER_UPDATE' | 'PICKUP_REMINDER' | 'SYSTEM';
  createdAt: string;
}

export interface Complaint {
  id: string;
  orderId: string;
  userId: string;
  shopId: string;
  issueType: string;
  description: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
}
