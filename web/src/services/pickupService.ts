import { apiClient } from '../api/axiosClient';
import type {
  CreatePickupSlotRequest,
  CounterProposalRequest,
  PickupSlotResponse,
  PickupQrResponse,
  PickupVerificationRequest,
  PickupVerificationResponse,
} from '../types/slot.types';

export const pickupService = {
  /**
   * Request a pickup slot for an order.
   * Endpoint: POST /api/orders/{orderId}/pickup-slot
   */
  async requestPickupSlot(
    orderId: string,
    payload: CreatePickupSlotRequest
  ): Promise<PickupSlotResponse> {
    const response = await apiClient.post<PickupSlotResponse>(
      `/api/orders/${orderId}/pickup-slot`,
      payload
    );
    return response.data;
  },

  /**
   * Fetch the pickup slot for an order.
   * Endpoint: GET /api/orders/{orderId}/pickup-slot
   */
  async getSlotByOrder(orderId: string): Promise<PickupSlotResponse | null> {
    try {
      const response = await apiClient.get<PickupSlotResponse>(
        `/api/orders/${orderId}/pickup-slot`
      );
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Accept a shop's counter-proposed pickup slot.
   * Endpoint: PATCH /api/pickup-slots/{slotId}/customer-accept
   */
  async customerAcceptSlot(slotId: string): Promise<PickupSlotResponse> {
    const response = await apiClient.patch<PickupSlotResponse>(
      `/api/pickup-slots/${slotId}/customer-accept`
    );
    return response.data;
  },

  /**
   * Reject a shop's counter-proposed pickup slot.
   * Endpoint: PATCH /api/pickup-slots/{slotId}/customer-reject
   */
  async customerRejectSlot(slotId: string): Promise<PickupSlotResponse> {
    const response = await apiClient.patch<PickupSlotResponse>(
      `/api/pickup-slots/${slotId}/customer-reject`
    );
    return response.data;
  },

  /**
   * Retrieve pickup verification QR token.
   * Endpoint: GET /api/orders/{orderId}/pickup-qr
   */
  async getPickupQR(orderId: string): Promise<PickupQrResponse> {
    const response = await apiClient.get<PickupQrResponse>(
      `/api/orders/${orderId}/pickup-qr`
    );
    return response.data;
  },

  // ==========================================
  // Shop Owner Endpoints
  // ==========================================

  /**
   * Fetch all pickup slots for the shop owner.
   * Endpoint: GET /api/shop/pickup-slots
   */
  async getShopPickupSlots(): Promise<PickupSlotResponse[]> {
    const response = await apiClient.get<PickupSlotResponse[]>('/api/shop/pickup-slots');
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Accept a customer's requested pickup slot.
   * Endpoint: PATCH /api/pickup-slots/{slotId}/accept
   */
  async acceptSlot(slotId: string): Promise<PickupSlotResponse> {
    const response = await apiClient.patch<PickupSlotResponse>(
      `/api/pickup-slots/${slotId}/accept`
    );
    return response.data;
  },

  /**
   * Reject a customer's requested pickup slot.
   * Endpoint: PATCH /api/pickup-slots/{slotId}/reject
   */
  async rejectSlot(slotId: string): Promise<PickupSlotResponse> {
    const response = await apiClient.patch<PickupSlotResponse>(
      `/api/pickup-slots/${slotId}/reject`
    );
    return response.data;
  },

  /**
   * Propose an alternate pickup slot time.
   * Endpoint: PATCH /api/pickup-slots/{slotId}/counter-propose
   */
  async counterProposeSlot(
    slotId: string,
    payload: CounterProposalRequest
  ): Promise<PickupSlotResponse> {
    const response = await apiClient.patch<PickupSlotResponse>(
      `/api/pickup-slots/${slotId}/counter-propose`,
      payload
    );
    return response.data;
  },

  /**
   * Verify a customer's pickup QR token and complete the order.
   * Endpoint: POST /api/shop/pickup/verify
   */
  async verifyPickup(
    payload: PickupVerificationRequest
  ): Promise<PickupVerificationResponse> {
    const response = await apiClient.post<PickupVerificationResponse>(
      '/api/shop/pickup/verify',
      payload
    );
    return response.data;
  },
};

