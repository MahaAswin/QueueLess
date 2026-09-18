import { apiClient } from '../api/axiosClient';
import type { ComplaintResponse, CreateComplaintRequest } from '../types/complaint.types';

export const complaintService = {
  /**
   * Submit a customer complaint for an order.
   * Endpoint: POST /api/orders/{orderId}/complaints
   */
  async createCustomerComplaint(
    orderId: string,
    payload: CreateComplaintRequest
  ): Promise<ComplaintResponse> {
    const response = await apiClient.post<ComplaintResponse>(
      `/api/orders/${orderId}/complaints`,
      payload
    );
    return response.data;
  },

  /**
   * Fetch all complaints submitted by the customer.
   * Endpoint: GET /api/complaints/my
   */
  async getMyComplaints(): Promise<ComplaintResponse[]> {
    const response = await apiClient.get<ComplaintResponse[]>('/api/complaints/my');
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Fetch a single complaint by ID.
   * Endpoint: GET /api/complaints/{complaintId}
   */
  async getComplaintById(complaintId: string): Promise<ComplaintResponse> {
    const response = await apiClient.get<ComplaintResponse>(`/api/complaints/${complaintId}`);
    return response.data;
  },

  /**
   * Fetch all complaints relevant to the shop owner.
   * Endpoint: GET /api/shop/complaints/my
   */
  async getShopComplaints(): Promise<ComplaintResponse[]> {
    const response = await apiClient.get<ComplaintResponse[]>('/api/shop/complaints/my');
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Submit a shop owner complaint for an order.
   * Endpoint: POST /api/shop/orders/{orderId}/complaints
   */
  async createShopOwnerComplaint(
    orderId: string,
    payload: CreateComplaintRequest
  ): Promise<ComplaintResponse> {
    const response = await apiClient.post<ComplaintResponse>(
      `/api/shop/orders/${orderId}/complaints`,
      payload
    );
    return response.data;
  },
};
