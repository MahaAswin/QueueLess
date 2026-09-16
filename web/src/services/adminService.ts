import { apiClient } from '../api/axiosClient';
import type {
  AdminDashboardSummary,
  AdminRecentOrderPageResponse,
  AdminRecentComplaintPageResponse,
  AdminUserPageResponse,
  AdminShopPageResponse,
  AdminShop,
} from '../types/admin.types';
import type { Role, AccountStatus } from '../types/auth.types';
import type { ShopCategory, ShopStatus } from '../types/shop.types';

export const adminService = {
  /**
   * Fetch platform-wide summary metrics for Admin dashboard.
   * Endpoint: GET /api/admin/dashboard/summary
   */
  async getDashboardSummary(): Promise<AdminDashboardSummary> {
    const response = await apiClient.get<AdminDashboardSummary>(
      '/api/admin/dashboard/summary'
    );
    return response.data;
  },

  /**
   * Fetch recent platform orders for Admin monitoring.
   * Endpoint: GET /api/admin/orders/recent
   */
  async getRecentOrders(page = 0, size = 10): Promise<AdminRecentOrderPageResponse> {
    const response = await apiClient.get<AdminRecentOrderPageResponse>(
      '/api/admin/orders/recent',
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  /**
   * Fetch recent platform complaints for Admin review.
   * Endpoint: GET /api/admin/complaints/recent
   */
  async getRecentComplaints(
    page = 0,
    size = 10
  ): Promise<AdminRecentComplaintPageResponse> {
    const response = await apiClient.get<AdminRecentComplaintPageResponse>(
      '/api/admin/complaints/recent',
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  /**
   * Fetch pending shop outlet registrations.
   * Endpoint: GET /api/admin/shops/pending
   */
  async getPendingShops(page = 0, size = 10): Promise<AdminShopPageResponse> {
    const response = await apiClient.get<AdminShopPageResponse>(
      '/api/admin/shops/pending',
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  /**
   * Activate and approve a pending shop outlet.
   * Endpoint: PATCH /api/admin/shops/{shopId}/activate
   */
  async activateShop(shopId: string): Promise<AdminShop> {
    const response = await apiClient.patch<AdminShop>(
      `/api/admin/shops/${shopId}/activate`
    );
    return response.data;
  },

  /**
   * Fetch registered users with role and status filters.
   * Endpoint: GET /api/admin/users
   */
  async getUsers(params?: {
    role?: Role;
    accountStatus?: AccountStatus;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<AdminUserPageResponse> {
    const response = await apiClient.get<AdminUserPageResponse>(
      '/api/admin/users',
      { params }
    );
    return response.data;
  },

  /**
   * Fetch registered shops with status, category, and city filters.
   * Endpoint: GET /api/admin/shops
   */
  async getShops(params?: {
    status?: ShopStatus;
    category?: ShopCategory;
    city?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<AdminShopPageResponse> {
    const response = await apiClient.get<AdminShopPageResponse>(
      '/api/admin/shops',
      { params }
    );
    return response.data;
  },
};
