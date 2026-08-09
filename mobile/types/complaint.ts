export type ComplaintType =
  | 'SHOP_DELAY'
  | 'SHOP_WRONG_ORDER'
  | 'SHOP_ORDER_REFUSAL'
  | 'SHOP_OTHER'
  | 'CUSTOMER_NO_SHOW'
  | 'CUSTOMER_ABUSE'
  | 'CUSTOMER_FRAUD'
  | 'CUSTOMER_OTHER';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VALID'
  | 'INVALID'
  | 'DISMISSED';

export type EvidenceType =
  | 'IMAGE'
  | 'VIDEO'
  | 'DOCUMENT'
  | 'TEXT'
  | 'OTHER';

export interface CreateComplaintRequest {
  type: ComplaintType;
  description: string;
}

export interface AddEvidenceRequest {
  type: EvidenceType;
  fileUrl: string;
  description?: string;
}

export interface EvidenceResponse {
  evidenceId: string;
  type: EvidenceType;
  fileUrl: string;
  description?: string | null;
  createdAt: string; // ISO Instant e.g. "2026-08-09T18:00:00Z"
}

export interface ComplaintResponse {
  complaintId: string;
  orderId: string;
  complainantId: string;
  complainantName: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedShopId?: string | null;
  reportedShopName?: string | null;
  type: ComplaintType;
  description: string;
  status: ComplaintStatus;
  evidenceCount: number;
  evidenceItems: EvidenceResponse[];
  reviewNote?: string | null;
  reviewedByAdminEmail?: string | null;
  reviewedAt?: string | null; // ISO LocalDateTime
  createdAt: string; // ISO Instant
}
