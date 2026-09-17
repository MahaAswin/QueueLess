import { apiClient } from '../api/axiosClient';
import type {
  AdminComplaintPageResponse,
  AdminComplaintSummary,
  AdminComplaintFilterParams,
} from '../types/admin.types';
import type {
  ComplaintResponse,
  ReviewComplaintRequest,
} from '../types/complaint.types';

export const adminComplaintService = {
  /**
   * Fetch paginated complaints across all users and shops with server-side filters and search.
   * Endpoint: GET /api/admin/complaints
   */
  async getAdminComplaints(
    params?: AdminComplaintFilterParams
  ): Promise<AdminComplaintPageResponse> {
    const response = await apiClient.get<AdminComplaintPageResponse>(
      '/api/admin/complaints',
      { params }
    );
    return response.data;
  },

  /**
   * Fetch full details and evidence items for a single complaint.
   * Endpoint: GET /api/admin/complaints/{complaintId}
   */
  async getComplaintById(complaintId: string): Promise<ComplaintResponse> {
    const response = await apiClient.get<ComplaintResponse>(
      `/api/admin/complaints/${complaintId}`
    );
    return response.data;
  },

  /**
   * Fetch operational complaint summary metrics.
   * Endpoint: GET /api/admin/complaints/summary
   */
  async getComplaintSummary(): Promise<AdminComplaintSummary> {
    const response = await apiClient.get<AdminComplaintSummary>(
      '/api/admin/complaints/summary'
    );
    return response.data;
  },

  /**
   * Review a complaint and transition its resolution status.
   * Endpoint: PATCH /api/admin/complaints/{complaintId}/review
   */
  async reviewComplaint(
    complaintId: string,
    payload: ReviewComplaintRequest
  ): Promise<ComplaintResponse> {
    const response = await apiClient.patch<ComplaintResponse>(
      `/api/admin/complaints/${complaintId}/review`,
      payload
    );
    return response.data;
  },
};
