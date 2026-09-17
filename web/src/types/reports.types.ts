export type DateRangePreset = 'today' | '7d' | '30d' | '90d' | 'all' | 'custom';

export interface OverviewMetrics {
  totalUsers: number;
  totalCustomers: number;
  totalShopOwners: number;
  totalShops: number;
  activeShops: number;
  pendingShops: number;
  suspendedShops: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  totalOrderValue: number;
  collectedOrderValue: number;
  averageOrderValue: number;
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
}

export interface OrderStatusMetric {
  status: string;
  count: number;
  totalValue: number;
  percentage: number;
}

export interface TimeSeriesPoint {
  date: string; // YYYY-MM-DD
  orderCount: number;
  completedCount: number;
  cancelledCount: number;
  orderValue: number;
}

export interface TopShopMetric {
  shopId: string;
  shopName: string;
  category: string;
  status: string;
  validComplaintCount: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalOrderValue: number;
}

export interface AdminReportsOverviewResponse {
  overview: OverviewMetrics;
  orderStatusDistribution: OrderStatusMetric[];
  ordersOverTime: TimeSeriesPoint[];
  topShops: TopShopMetric[];
  complaintsByType: Record<string, number>;
  complaintsByStatus: Record<string, number>;
  userRoleDistribution: Record<string, number>;
}
