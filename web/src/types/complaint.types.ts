export type ComplaintStatus =
  | 'SUBMITTED'
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'VALID'
  | 'INVALID'
  | 'RESOLVED'
  | 'DISMISSED';

export type ComplaintType =
  | 'SHOP_DELAY'
  | 'SHOP_WRONG_ORDER'
  | 'SHOP_ORDER_REFUSAL'
  | 'SHOP_OTHER'
  | 'CUSTOMER_NO_SHOW'
  | 'CUSTOMER_ABUSE'
  | 'CUSTOMER_FRAUD'
  | 'CUSTOMER_OTHER'
  | 'ORDER_ISSUE'
  | 'SLOT_ISSUE'
  | 'QUALITY_ISSUE'
  | 'BEHAVIOR_ISSUE'
  | 'OTHER';

export const COMPLAINT_STATUS_META: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; description: string }
> = {
  SUBMITTED: {
    label: 'Submitted',
    variant: 'warning',
    description: 'Complaint has been submitted and is awaiting review.',
  },
  PENDING: {
    label: 'Pending',
    variant: 'warning',
    description: 'Complaint is pending review.',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    variant: 'info',
    description: 'Complaint is actively being investigated.',
  },
  VALID: {
    label: 'Valid',
    variant: 'success',
    description: 'Complaint was verified and deemed valid.',
  },
  RESOLVED: {
    label: 'Resolved',
    variant: 'success',
    description: 'Complaint has been resolved.',
  },
  INVALID: {
    label: 'Invalid',
    variant: 'neutral',
    description: 'Complaint was found to be invalid or unsubstantiated.',
  },
  DISMISSED: {
    label: 'Dismissed',
    variant: 'neutral',
    description: 'Complaint was dismissed.',
  },
};

export const COMPLAINT_TYPE_LABELS: Record<string, string> = {
  SHOP_DELAY: 'Shop Delay',
  SHOP_WRONG_ORDER: 'Wrong Order Item(s)',
  SHOP_ORDER_REFUSAL: 'Shop Refused Order',
  SHOP_OTHER: 'Shop Issue (Other)',
  CUSTOMER_NO_SHOW: 'Customer No Show',
  CUSTOMER_ABUSE: 'Customer Abuse',
  CUSTOMER_FRAUD: 'Customer Fraud',
  CUSTOMER_OTHER: 'Customer Issue (Other)',
  ORDER_ISSUE: 'Order Issue',
  SLOT_ISSUE: 'Slot Issue',
  QUALITY_ISSUE: 'Quality Issue',
  BEHAVIOR_ISSUE: 'Behavior Issue',
  OTHER: 'General Concern',
};

export interface EvidenceResponse {
  evidenceId: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'TEXT' | 'OTHER';
  fileUrl: string;
  description?: string;
  createdAt: string;
}

export interface CreateComplaintRequest {
  type: ComplaintType;
  description: string;
}

export interface ReviewComplaintRequest {
  status: ComplaintStatus;
  reviewNote?: string;
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
  evidenceItems?: EvidenceResponse[];
  reviewNote?: string;
  reviewedByAdminEmail?: string;
  reviewedAt?: string;
  createdAt: string;
}

