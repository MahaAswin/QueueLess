import { apiClient } from '../api/axiosClient';
import type {
  CustomerPickupOtpResponse,
  ShopVerifyOtpRequest,
  ShopVerifiedPickupResponse,
} from '../types/otp.types';
import type { Order } from '../types/order.types';

export const pickupOtpService = {
  /**
   * Request or fetch the active customer pickup OTP.
   * Endpoint: GET /api/orders/{orderId}/pickup-otp
   */
  async getCustomerOtp(orderId: string): Promise<CustomerPickupOtpResponse> {
    const response = await apiClient.get<CustomerPickupOtpResponse>(
      `/api/orders/${orderId}/pickup-otp`
    );
    return response.data;
  },

  /**
   * Shop Owner verifies customer's 6-digit pickup OTP.
   * Endpoint: POST /api/shop/pickup/verify-otp
   */
  async verifyPickupOtp(otp: string): Promise<ShopVerifiedPickupResponse> {
    const payload: ShopVerifyOtpRequest = { otp: otp.trim() };
    const response = await apiClient.post<ShopVerifiedPickupResponse>(
      '/api/shop/pickup/verify-otp',
      payload
    );
    return response.data;
  },

  /**
   * Shop Owner explicitly marks the verified order as completed / collected.
   * Endpoint: PATCH /api/shop/orders/{orderId}/complete
   */
  async completeShopOrder(orderId: string): Promise<Order> {
    const response = await apiClient.patch<Order>(
      `/api/shop/orders/${orderId}/complete`
    );
    return response.data;
  },
};
