import type { User } from './auth.types';
import type { Shop } from './shop.types';
import type { Order } from './order.types';

export interface AdminDashboardSummary {
  totalUsers: number;
  totalCustomers: number;
  totalShopOwners: number;
  totalShops: number;
  activeShops: number;
  pendingShops: number;
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  openComplaints: number;
}

export interface AdminUserPageResponse {
  content: User[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AdminShopPageResponse {
  content: Shop[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AdminRecentOrderPageResponse {
  content: Order[];
  totalElements: number;
  totalPages: number;
}
