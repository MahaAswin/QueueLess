export type PickupSlotStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'COUNTER_PROPOSED'
  | 'CUSTOMER_ACCEPTED'
  | 'CUSTOMER_REJECTED'
  | 'SHOP_REJECTED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'REJECTED';

export interface SlotStatusMeta {
  label: string;
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  description: string;
}

export const SLOT_STATUS_META: Record<PickupSlotStatus, SlotStatusMeta> = {
  REQUESTED: {
    label: 'Requested',
    variant: 'warning',
    description: 'Awaiting shop review',
  },
  ACCEPTED: {
    label: 'Accepted',
    variant: 'success',
    description: 'Confirmed by shop',
  },
  COUNTER_PROPOSED: {
    label: 'Counter-Proposed',
    variant: 'info',
    description: 'Awaiting customer response',
  },
  CUSTOMER_ACCEPTED: {
    label: 'Agreed by Customer',
    variant: 'success',
    description: 'Customer accepted proposed time',
  },
  CUSTOMER_REJECTED: {
    label: 'Declined by Customer',
    variant: 'error',
    description: 'Customer declined proposed time',
  },
  SHOP_REJECTED: {
    label: 'Rejected by Shop',
    variant: 'error',
    description: 'Shop rejected slot request',
  },
  REJECTED: {
    label: 'Rejected',
    variant: 'error',
    description: 'Slot request rejected',
  },
  EXPIRED: {
    label: 'Expired',
    variant: 'neutral',
    description: 'Slot window passed',
  },
  CANCELLED: {
    label: 'Cancelled',
    variant: 'neutral',
    description: 'Slot cancelled with order',
  },
};

export interface CreatePickupSlotRequest {
  pickupDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss or HH:mm
  endTime: string; // HH:mm:ss or HH:mm
}

export interface CounterProposalRequest {
  pickupDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss or HH:mm
  endTime: string; // HH:mm:ss or HH:mm
}

export interface PickupSlotResponse {
  id?: string;
  slotId?: string;
  orderId: string;
  shopId?: string;
  shopName?: string;
  customerName?: string;
  pickupDate: string;
  requestedStartTime: string;
  requestedEndTime: string;
  proposedDate?: string;
  proposedStartTime?: string;
  proposedEndTime?: string;
  finalPickupDate?: string;
  finalStartTime?: string;
  finalEndTime?: string;
  agreedStartTime?: string;
  agreedEndTime?: string;
  status: PickupSlotStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimeSlotOption {
  id: string;
  startTime: string; // e.g. "10:30:00"
  endTime: string; // e.g. "11:00:00"
  displayLabel: string; // e.g. "10:30 AM – 11:00 AM"
  isAvailable: boolean;
}

export interface PickupQrResponse {
  orderId: string;
  pickupToken?: string;
  qrPayload?: string;
  verificationCode?: string;
  expiresAt?: string;
  status?: string;
}

export interface PickupVerificationRequest {
  pickupToken: string;
}

export interface PickupVerificationResponse {
  success: boolean;
  message: string;
  orderId: string;
  status: string;
  shopName?: string;
  collectedAt?: string;
}

export type PickupSlotFilter =
  | 'ALL'
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'COUNTER_PROPOSED'
  | 'REJECTED';

export type PickupDateFilter = 'TODAY' | 'TOMORROW' | 'ALL_DATES' | 'CUSTOM';
