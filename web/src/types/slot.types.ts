export type PickupSlotStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COUNTER_PROPOSED'
  | 'CUSTOMER_ACCEPTED'
  | 'CUSTOMER_REJECTED';

export interface CreatePickupSlotRequest {
  pickupDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss or HH:mm
  endTime: string; // HH:mm:ss or HH:mm
}

export interface PickupSlotResponse {
  id: string;
  orderId: string;
  shopId?: string;
  shopName?: string;
  pickupDate: string;
  requestedStartTime: string;
  requestedEndTime: string;
  agreedStartTime?: string;
  agreedEndTime?: string;
  status: PickupSlotStatus;
  counterProposalStartTime?: string;
  counterProposalEndTime?: string;
  counterProposalReason?: string;
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
  qrPayload: string;
  verificationCode: string;
  status: string;
}
