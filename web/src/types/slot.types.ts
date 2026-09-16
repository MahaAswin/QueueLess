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

