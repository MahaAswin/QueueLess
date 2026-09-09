export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  shopId: string;
  shopName?: string;
  shopPhone?: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  pickupSlot?: {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface OrderPageResponse {
  content: Order[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
