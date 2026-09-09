import { apiClient } from '../api/axiosClient';
import type { AdminDashboardSummary, AdminUserPageResponse, AdminShopPageResponse, AdminRecentOrderPageResponse } from '../types/admin.types';
import type { Shop } from '../types/shop.types';
import type { Role, AccountStatus } from '../types/auth.types';

export const adminService = {
  async getDashboardSummary(): Promise<AdminDashboardSummary> {
    const response = await apiClient.get<AdminDashboardSummary>('/api/admin/dashboard/summary');
    return response.data;
  },

  async getRecentOrders(page = 0, size = 10): Promise<AdminRecentOrderPageResponse> {
    const response = await apiClient.get<AdminRecentOrderPageResponse>('/api/admin/orders/recent', {
      params: { page, size },
    });
    return response.data;
  },

  async getUsers(params?: { role?: Role; accountStatus?: AccountStatus; search?: string; page?: number; size?: number }): Promise<AdminUserPageResponse> {
    const response = await apiClient.get<AdminUserPageResponse>('/api/admin/users', { params });
    return response.data;
  },

  async getShops(params?: { status?: string; category?: string; city?: string; search?: string; page?: number; size?: number }): Promise<AdminShopPageResponse> {
    const response = await apiClient.get<AdminShopPageResponse>('/api/admin/shops', { params });
    return response.data;
  },

  async getPendingShops(page = 0, size = 10): Promise<AdminShopPageResponse> {
    const response = await apiClient.get<AdminShopPageResponse>('/api/admin/shops/pending', {
      params: { page, size },
    });
    return response.data;
  },

  async activateShop(shopId: string): Promise<Shop> {
    const response = await apiClient.patch<Shop>(`/api/admin/shops/${shopId}/activate`);
    return response.data;
  },
};
