import { apiClient } from '../api/axiosClient';
import type {
  AdminDashboardSummary,
  AdminRecentOrderPageResponse,
  AdminRecentComplaintPageResponse,
  AdminUserPageResponse,
  AdminShopPageResponse,
  AdminShop,
  AdminUser,
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
   * Fetch a single user's details.
   * Endpoint: GET /api/admin/users/{userId}
   */
  async getUserDetails(userId: string): Promise<AdminUser> {
    const response = await apiClient.get<AdminUser>(`/api/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Suspend a customer or shop owner account.
   * Endpoint: PATCH /api/admin/users/{userId}/suspend
   */
  async suspendUser(userId: string): Promise<void> {
    await apiClient.patch(`/api/admin/users/${userId}/suspend`);
  },

  /**
   * Reinstate a suspended user account.
   * Endpoint: PATCH /api/admin/users/{userId}/reinstate
   */
  async reinstateUser(userId: string): Promise<void> {
    await apiClient.patch(`/api/admin/users/${userId}/reinstate`);
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

  /**
   * Fetch a single shop's full details.
   * Endpoint: GET /api/admin/shops/{shopId}
   */
  async getShopDetails(shopId: string): Promise<AdminShop> {
    const response = await apiClient.get<AdminShop>(`/api/admin/shops/${shopId}`);
    return response.data;
  },

  /**
   * Reject a pending shop outlet (sets status to INACTIVE).
   * Endpoint: PATCH /api/admin/shops/{shopId}/reject
   */
  async rejectShop(shopId: string): Promise<AdminShop> {
    const response = await apiClient.patch<AdminShop>(
      `/api/admin/shops/${shopId}/reject`
    );
    return response.data;
  },

  /**
   * Suspend a shop outlet for platform compliance review.
   * Endpoint: PATCH /api/admin/shops/{shopId}/suspend
   */
  async suspendShop(shopId: string): Promise<void> {
    await apiClient.patch(`/api/admin/shops/${shopId}/suspend`);
  },

  /**
   * Reinstate a suspended shop outlet back to active status.
   * Endpoint: PATCH /api/admin/shops/{shopId}/reinstate
   */
  async reinstateShop(shopId: string): Promise<void> {
    await apiClient.patch(`/api/admin/shops/${shopId}/reinstate`);
  },
};

