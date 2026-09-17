import { apiClient } from '../api/axiosClient';
import type {
  AdminOrderPageResponse,
  AdminOrderDetail,
  AdminOrderSummary,
  AdminOrderFilterParams,
} from '../types/admin.types';

export const adminOrderService = {
  /**
   * Fetch paginated orders across all shops with server-side filters and search.
   * Endpoint: GET /api/admin/orders
   */
  async getAdminOrders(params?: AdminOrderFilterParams): Promise<AdminOrderPageResponse> {
    const response = await apiClient.get<AdminOrderPageResponse>('/api/admin/orders', {
      params,
    });
    return response.data;
  },

  /**
   * Fetch full details for a single order.
   * Endpoint: GET /api/admin/orders/{orderId}
   */
  async getAdminOrderById(orderId: string): Promise<AdminOrderDetail> {
    const response = await apiClient.get<AdminOrderDetail>(`/api/admin/orders/${orderId}`);
    return response.data;
  },

  /**
   * Fetch operational order summary metrics.
   * Endpoint: GET /api/admin/orders/summary
   */
  async getOrderSummary(): Promise<AdminOrderSummary> {
    const response = await apiClient.get<AdminOrderSummary>('/api/admin/orders/summary');
    return response.data;
  },
};
