export type PickupSlotStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'COUNTER_PROPOSED'
  | 'CUSTOMER_ACCEPTED'
  | 'CUSTOMER_REJECTED'
  | 'SHOP_REJECTED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface CreatePickupSlotRequest {
  pickupDate: string; // YYYY-MM-DD
  startTime: string;  // HH:mm:ss or HH:mm
  endTime: string;    // HH:mm:ss or HH:mm
}

export interface PickupSlotResponse {
  slotId: string;
  orderId: string;
  pickupDate: string;
  requestedStartTime: string;
  requestedEndTime: string;
  proposedDate?: string | null;
  proposedStartTime?: string | null;
  proposedEndTime?: string | null;
  finalPickupDate?: string | null;
  finalStartTime?: string | null;
  finalEndTime?: string | null;
  status: PickupSlotStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlotOption {
  id: string;
  startTime: string; // e.g. "09:00:00"
  endTime: string;   // e.g. "09:30:00"
  displayLabel: string; // e.g. "9:00 AM – 9:30 AM"
  isAvailable: boolean;
}

export interface PickupQrResponse {
  orderId: string;
  pickupToken: string;
  expiresAt: string; // ISO LocalDateTime string e.g. "2026-08-09T19:42:00"
}
