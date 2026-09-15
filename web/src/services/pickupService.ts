import { apiClient } from '../api/axiosClient';
import type {
  CreatePickupSlotRequest,
  PickupSlotResponse,
  PickupQrResponse,
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
};
