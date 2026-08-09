export type NotificationType =
  | 'ORDER_PLACED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_REJECTED'
  | 'ORDER_CANCELLED'
  | 'PICKUP_SLOT_REQUESTED'
  | 'PICKUP_SLOT_ACCEPTED'
  | 'PICKUP_SLOT_REJECTED'
  | 'PICKUP_SLOT_COUNTER_PROPOSED'
  | 'PICKUP_SLOT_CUSTOMER_ACCEPTED'
  | 'PICKUP_SLOT_CUSTOMER_REJECTED'
  | 'ORDER_PREPARING'
  | 'ORDER_READY_FOR_PICKUP'
  | 'ORDER_COLLECTED'
  | 'COMPLAINT_SUBMITTED'
  | 'COMPLAINT_REVIEWED'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_REINSTATED'
  | 'SHOP_SUSPENDED'
  | 'SHOP_REINSTATED';

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedOrderId?: string | null;
  relatedShopId?: string | null;
  read: boolean;
  createdAt: string; // ISO Instant e.g. "2026-08-09T18:00:00Z"
  readAt?: string | null;
}

export interface NotificationPageResponse {
  content: NotificationResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
