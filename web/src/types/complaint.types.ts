export type ComplaintStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';

export type ComplaintType =
  | 'ORDER_ISSUE'
  | 'SLOT_ISSUE'
  | 'QUALITY_ISSUE'
  | 'BEHAVIOR_ISSUE'
  | 'OTHER';

export interface CreateComplaintRequest {
  type: ComplaintType;
  description: string;
}

export interface ComplaintResponse {
  complaintId: string;
  orderId: string;
  complainantId: string;
  complainantName: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedShopId?: string;
  reportedShopName?: string;
  type: ComplaintType;
  description: string;
  status: ComplaintStatus;
  evidenceCount?: number;
  reviewNote?: string;
  reviewedByAdminEmail?: string;
  reviewedAt?: string;
  createdAt: string;
}
