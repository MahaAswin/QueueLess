export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'COLLECTED'
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

export interface OrderPickupSlotInfo {
  id?: string;
  slotId?: string;
  pickupDate?: string;
  startTime?: string;
  endTime?: string;
  requestedStartTime?: string;
  requestedEndTime?: string;
  proposedDate?: string;
  proposedStartTime?: string;
  proposedEndTime?: string;
  finalPickupDate?: string;
  finalStartTime?: string;
  finalEndTime?: string;
  agreedStartTime?: string;
  agreedEndTime?: string;
  status?: string;
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
  pickupSlot?: OrderPickupSlotInfo;
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
