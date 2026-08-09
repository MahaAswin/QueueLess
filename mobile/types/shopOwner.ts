import { OrderStatus } from './order';
import { ShopStatus } from './index';

export interface PickupVerificationRequest {
  pickupToken: string;
}

export interface PickupVerificationResponse {
  success: boolean;
  message: string;
  orderId: string;
  status: OrderStatus;
  shopName: string;
  collectedAt: string; // ISO LocalDateTime e.g. "2026-08-09T19:45:00"
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  available?: boolean;
  stockQuantity?: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  imageUrl?: string;
  available?: boolean;
  stockQuantity?: number;
}

export interface UpdateAvailabilityRequest {
  available: boolean;
}

export interface UpdateStockRequest {
  stockQuantity: number;
}

export interface UpdateShopRequest {
  shopName?: string;
  description?: string;
  address?: string;
  phone?: string;
  category?: string;
  active?: boolean;
  status?: ShopStatus;
}
