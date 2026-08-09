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

export type ShopCategory = 'Bakery' | 'Coffee & Tea' | 'Grocery' | 'Pharmacy' | 'Restaurant' | 'Fast Food' | 'Fruits & Vegetables' | 'Daily Needs' | 'Electronics' | 'Other';

export interface Category {
  id: string;
  name: string;
  icon: string;
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
