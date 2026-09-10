export type NotificationType =
  | 'ORDER_PLACED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_REJECTED'
  | 'ORDER_PREPARING'
  | 'ORDER_READY_FOR_PICKUP'
  | 'ORDER_COMPLETED'
  | 'ORDER_CANCELLED'
  | 'SLOT_PROPOSED'
  | 'SLOT_ACCEPTED'
  | 'SLOT_REJECTED'
  | 'COMPLAINT_UPDATE'
  | 'SYSTEM';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedOrderId?: string;
  relatedShopId?: string;
  read: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationPageResponse {
  content: NotificationItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
