import { PickupSlotResponse } from './pickup';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'COLLECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderResponse {
  id: string;
  customerId: string;
  customerName: string;
  shopId: string;
  shopName: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItemResponse[];
  pickupSlot?: PickupSlotResponse | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderPageResponse {
  content: OrderResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}
