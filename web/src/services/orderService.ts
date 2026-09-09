import { apiClient } from '../api/axiosClient';
import type { Order, OrderPageResponse, OrderStatus } from '../types/order.types';

export const orderService = {
  // Customer Endpoints
  async checkout(): Promise<Order> {
    const response = await apiClient.post<Order>('/api/orders');
    return response.data;
  },

  async getCustomerOrders(page = 0, size = 20): Promise<OrderPageResponse> {
    const response = await apiClient.get<OrderPageResponse>('/api/orders', {
      params: { page, size },
    });
    return response.data;
  },

  async getCustomerOrderById(orderId: string): Promise<Order> {
    const response = await apiClient.get<Order>(`/api/orders/${orderId}`);
    return response.data;
  },

  async cancelOrder(orderId: string): Promise<Order> {
    const response = await apiClient.post<Order>(`/api/orders/${orderId}/cancel`);
    return response.data;
  },

  // Shop Owner Endpoints
  async getShopOrders(status?: OrderStatus, page = 0, size = 20): Promise<OrderPageResponse> {
    const response = await apiClient.get<OrderPageResponse>('/api/shop/orders', {
      params: { status, page, size },
    });
    return response.data;
  },

  async getShopOrderById(orderId: string): Promise<Order> {
    const response = await apiClient.get<Order>(`/api/shop/orders/${orderId}`);
    return response.data;
  },

  async confirmOrder(orderId: string): Promise<Order> {
    const response = await apiClient.patch<Order>(`/api/shop/orders/${orderId}/confirm`);
    return response.data;
  },

  async rejectOrder(orderId: string): Promise<Order> {
    const response = await apiClient.patch<Order>(`/api/shop/orders/${orderId}/reject`);
    return response.data;
  },

  async startPreparingOrder(orderId: string): Promise<Order> {
    const response = await apiClient.patch<Order>(`/api/shop/orders/${orderId}/preparing`);
    return response.data;
  },

  async markOrderReady(orderId: string): Promise<Order> {
    const response = await apiClient.patch<Order>(`/api/shop/orders/${orderId}/ready`);
    return response.data;
  },
};
