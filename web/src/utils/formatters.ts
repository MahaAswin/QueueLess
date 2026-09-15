import type { OrderStatus } from '../types/order.types';

/**
 * Formats a numeric price into INR currency format (e.g. "₹120.00")
 */
export const formatCurrency = (amount?: number | string | null): string => {
  if (amount === undefined || amount === null || amount === '') return '₹0.00';
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0;
  return `₹${num.toFixed(2)}`;
};

/**
 * Formats an order UUID into a clean short reference code (e.g. "#4F89A12B")
 */
export const formatOrderId = (id?: string | null): string => {
  if (!id) return '#ORDER';
  const clean = id.replace(/-/g, '').slice(0, 8).toUpperCase();
  return `#${clean}`;
};

/**
 * Formats an ISO date-time into a readable long format (e.g. "Mon, Oct 12, 2026, 02:30 PM")
 */
export const formatDateLong = (dateStr?: string | null): string => {
  if (!dateStr) return 'Recently placed';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

/**
 * Formats an ISO date into a short format (e.g. "Oct 12, 2026")
 */
export const formatDateShort = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

/**
 * Formats a local time string ("14:30:00" or "14:30") to "2:30 PM"
 */
export const formatTimeLabel = (timeStr?: string | null): string => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
};

export interface OrderStatusMeta {
  label: string;
  badgeVariant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  description: string;
  stepIndex: number; // 0 to 4 in standard lifecycle
}

/**
 * Centralized mapping for Order Status metadata
 */
export const getOrderStatusMeta = (status: OrderStatus): OrderStatusMeta => {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Order Placed',
        badgeVariant: 'warning',
        description: 'Your order was sent to the shop and is awaiting acceptance.',
        stepIndex: 0,
      };
    case 'CONFIRMED':
    case 'ACCEPTED':
      return {
        label: 'Confirmed by Shop',
        badgeVariant: 'info',
        description: 'The shop confirmed your order and will begin preparation.',
        stepIndex: 1,
      };
    case 'PREPARING':
      return {
        label: 'Preparing Basket',
        badgeVariant: 'warning',
        description: 'Your items are being freshly packed for express pickup.',
        stepIndex: 2,
      };
    case 'READY_FOR_PICKUP':
      return {
        label: 'Ready for Pickup',
        badgeVariant: 'success',
        description: 'Your order is ready at the QueueLess pickup counter.',
        stepIndex: 3,
      };
    case 'COLLECTED':
    case 'COMPLETED':
      return {
        label: 'Order Completed',
        badgeVariant: 'neutral',
        description: 'Order was collected and verified at the counter.',
        stepIndex: 4,
      };
    case 'CANCELLED':
      return {
        label: 'Order Cancelled',
        badgeVariant: 'error',
        description: 'This order was cancelled.',
        stepIndex: -1,
      };
    case 'REJECTED':
      return {
        label: 'Order Rejected',
        badgeVariant: 'error',
        description: 'The shop was unable to accept this order.',
        stepIndex: -1,
      };
    default:
      return {
        label: status,
        badgeVariant: 'neutral',
        description: 'Order status update pending.',
        stepIndex: 0,
      };
  }
};

/**
 * Formats an ISO date-time into friendly relative time (e.g. "Just now", "5m ago", "2h ago", "Yesterday")
 */
export const formatRelativeTime = (dateStr?: string | null): string => {
  if (!dateStr) return 'Just now';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 0) return 'Just now';
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 45) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export interface NotificationMeta {
  category: 'ORDER' | 'SLOT' | 'COMPLAINT' | 'ACCOUNT' | 'SYSTEM';
  badgeVariant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  color: string;
  bgColor: string;
}

/**
 * Returns UI metadata (category, color, badge variant) for a given NotificationType
 */
export const getNotificationMeta = (type: string): NotificationMeta => {
  switch (type) {
    case 'ORDER_PLACED':
    case 'ORDER_CONFIRMED':
    case 'ORDER_PREPARING':
      return {
        category: 'ORDER',
        badgeVariant: 'info',
        color: '#0D5C3A',
        bgColor: '#E8F5EE',
      };
    case 'ORDER_READY_FOR_PICKUP':
    case 'ORDER_COLLECTED':
      return {
        category: 'ORDER',
        badgeVariant: 'success',
        color: '#0D5C3A',
        bgColor: '#DCFCE7',
      };
    case 'ORDER_REJECTED':
    case 'ORDER_CANCELLED':
      return {
        category: 'ORDER',
        badgeVariant: 'error',
        color: '#DC2626',
        bgColor: '#FEE2E2',
      };
    case 'PICKUP_SLOT_REQUESTED':
    case 'PICKUP_SLOT_COUNTER_PROPOSED':
      return {
        category: 'SLOT',
        badgeVariant: 'warning',
        color: '#D97706',
        bgColor: '#FEF3C7',
      };
    case 'PICKUP_SLOT_ACCEPTED':
    case 'PICKUP_SLOT_CUSTOMER_ACCEPTED':
      return {
        category: 'SLOT',
        badgeVariant: 'success',
        color: '#0D5C3A',
        bgColor: '#E8F5EE',
      };
    case 'PICKUP_SLOT_REJECTED':
    case 'PICKUP_SLOT_CUSTOMER_REJECTED':
      return {
        category: 'SLOT',
        badgeVariant: 'error',
        color: '#DC2626',
        bgColor: '#FEE2E2',
      };
    case 'COMPLAINT_SUBMITTED':
    case 'COMPLAINT_REVIEWED':
      return {
        category: 'COMPLAINT',
        badgeVariant: 'warning',
        color: '#7C3AED',
        bgColor: '#F5F3FF',
      };
    case 'ACCOUNT_SUSPENDED':
    case 'SHOP_SUSPENDED':
      return {
        category: 'ACCOUNT',
        badgeVariant: 'error',
        color: '#DC2626',
        bgColor: '#FEE2E2',
      };
    case 'ACCOUNT_REINSTATED':
    case 'SHOP_REINSTATED':
      return {
        category: 'ACCOUNT',
        badgeVariant: 'success',
        color: '#0D5C3A',
        bgColor: '#E8F5EE',
      };
    default:
      return {
        category: 'SYSTEM',
        badgeVariant: 'neutral',
        color: '#475569',
        bgColor: '#F1F5F9',
      };
  }
};

