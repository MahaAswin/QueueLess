import { api } from './api';
import {
  AddEvidenceRequest,
  ComplaintResponse,
  CreateComplaintRequest,
  EvidenceResponse,
} from '../types';

export const ComplaintService = {
  /**
   * Create a customer complaint for an order.
   * Endpoint: POST /api/orders/{orderId}/complaints
   */
  async createCustomerComplaint(
    orderId: string,
    request: CreateComplaintRequest
  ): Promise<ComplaintResponse> {
    const response = await api.post<ComplaintResponse>(
      `/api/orders/${orderId}/complaints`,
      request
    );
    return response.data;
  },

  /**
   * Get all complaints filed by the authenticated customer.
   * Endpoint: GET /api/complaints/my
   */
  async getMyComplaints(): Promise<ComplaintResponse[]> {
    const response = await api.get<ComplaintResponse[]>('/api/complaints/my');
    return response.data;
  },

  /**
   * Get complaint details by complaint ID.
   * Endpoint: GET /api/complaints/{complaintId}
   */
  async getComplaintById(complaintId: string): Promise<ComplaintResponse> {
    const response = await api.get<ComplaintResponse>(
      `/api/complaints/${complaintId}`
    );
    return response.data;
  },

  /**
   * Add evidence to an existing SUBMITTED complaint.
   * Endpoint: POST /api/complaints/{complaintId}/evidence
   */
  async addEvidence(
    complaintId: string,
    request: AddEvidenceRequest
  ): Promise<EvidenceResponse> {
    const response = await api.post<EvidenceResponse>(
      `/api/complaints/${complaintId}/evidence`,
      request
    );
    return response.data;
  },
};
