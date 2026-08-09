import { api } from './api';
import { OrderResponse, OrderPageResponse } from '../types';

export const OrderService = {
  /**
   * Create an order from the customer's current backend cart.
   * Endpoint: POST /api/orders
   */
  async createOrder(): Promise<OrderResponse> {
    const response = await api.post<OrderResponse>('/api/orders');
    return response.data;
  },

  /**
   * Fetch single order details by ID.
   * Endpoint: GET /api/orders/{orderId}
   */
  async getOrderById(orderId: string): Promise<OrderResponse> {
    const response = await api.get<OrderResponse>(`/api/orders/${orderId}`);
    return response.data;
  },

  /**
   * Fetch current customer's order history.
   * Endpoint: GET /api/orders?page={page}&size={size}
   */
  async getCustomerOrders(page: number = 0, size: number = 20): Promise<OrderPageResponse> {
    const response = await api.get<OrderPageResponse>('/api/orders', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Cancel a pending order.
   * Endpoint: POST /api/orders/{orderId}/cancel
   */
  async cancelOrder(orderId: string): Promise<OrderResponse> {
    const response = await api.post<OrderResponse>(`/api/orders/${orderId}/cancel`);
    return response.data;
  },
};
