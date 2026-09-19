import type { OrderStatus } from './order.types';
import type { PickupSlotResponse } from './slot.types';

export interface CustomerPickupOtpResponse {
  orderId: string;
  otp: string;
  expiresAt: string;
  status: OrderStatus;
  shopName?: string;
}

export interface ShopVerifyOtpRequest {
  otp: string;
}

export interface VerifiedCustomerSummary {
  id: string;
  fullName: string;
  phone: string;
  email: string;
}

export interface VerifiedOrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface ShopVerifiedPickupResponse {
  orderId: string;
  orderStatus: OrderStatus;
  customer: VerifiedCustomerSummary;
  shopName: string;
  items: VerifiedOrderItem[];
  totalAmount: number;
  pickupSlot?: PickupSlotResponse | null;
  verifiedAt: string;
  verified: boolean;
  message: string;
}
