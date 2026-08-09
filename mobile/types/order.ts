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
  pickupSlot?: {
    id: string;
    shopId: string;
    startTime: string;
    endTime: string;
    maxOrders: number;
    currentOrders: number;
    isAvailable: boolean;
  } | null;
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
