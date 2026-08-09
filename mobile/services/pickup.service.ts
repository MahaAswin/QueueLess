import { api } from './api';
import { CreatePickupSlotRequest, PickupSlotResponse, PickupQrResponse } from '../types';

export const PickupService = {
  /**
   * Request a pickup slot for an order.
   * Endpoint: POST /api/orders/{orderId}/pickup-slot
   */
  async requestPickupSlot(
    orderId: string,
    request: CreatePickupSlotRequest
  ): Promise<PickupSlotResponse> {
    const response = await api.post<PickupSlotResponse>(
      `/api/orders/${orderId}/pickup-slot`,
      request
    );
    return response.data;
  },

  /**
   * Fetch the pickup slot for an order.
   * Endpoint: GET /api/orders/{orderId}/pickup-slot
   * Returns null if no pickup slot exists yet (404).
   */
  async getSlotByOrder(orderId: string): Promise<PickupSlotResponse | null> {
    try {
      const response = await api.get<PickupSlotResponse>(
        `/api/orders/${orderId}/pickup-slot`
      );
      return response.data;
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
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
    const response = await api.patch<PickupSlotResponse>(
      `/api/pickup-slots/${slotId}/customer-accept`
    );
    return response.data;
  },

  /**
   * Reject a shop's counter-proposed pickup slot.
   * Endpoint: PATCH /api/pickup-slots/{slotId}/customer-reject
   */
  async customerRejectSlot(slotId: string): Promise<PickupSlotResponse> {
    const response = await api.patch<PickupSlotResponse>(
      `/api/pickup-slots/${slotId}/customer-reject`
    );
    return response.data;
  },

  /**
   * Retrieve / generate a customer pickup QR code for a READY_FOR_PICKUP order.
   * Endpoint: GET /api/orders/{orderId}/pickup-qr
   */
  async getPickupQR(orderId: string): Promise<PickupQrResponse> {
    const response = await api.get<PickupQrResponse>(
      `/api/orders/${orderId}/pickup-qr`
    );
    return response.data;
  },
};
