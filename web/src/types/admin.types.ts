import type { User, Role, AccountStatus } from './auth.types';
import type { Shop, ShopCategory, ShopStatus } from './shop.types';
import type { OrderStatus } from './order.types';
import type { ComplaintType, ComplaintStatus } from './complaint.types';

export interface AdminUserSummary {
  totalUsers: number;
  totalCustomers: number;
  totalShopOwners: number;
  totalAdmins: number;
  suspendedUsers: number;
}

export interface AdminShopSummary {
  totalShops: number;
  pendingShops: number;
  activeShops: number;
  suspendedShops: number;
  inactiveShops: number;
}

export interface AdminProductSummary {
  totalProducts: number;
  availableProducts: number;
  unavailableProducts: number;
}

export interface AdminOrderSummary {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  preparingOrders: number;
  readyForPickupOrders: number;
  collectedOrders: number;
  rejectedOrders: number;
  cancelledOrders: number;
}

export interface AdminComplaintSummary {
  totalComplaints: number;
  pendingComplaints: number;
  validComplaints: number;
  invalidComplaints: number;
  dismissedComplaints: number;
}

export interface AdminDashboardSummary {
  users: AdminUserSummary;
  shops: AdminShopSummary;
  products: AdminProductSummary;
  orders: AdminOrderSummary;
  complaints: AdminComplaintSummary;
}

export interface AdminRecentOrder {
  orderId: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  shopId: string;
  shopName?: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export interface AdminRecentOrderPageResponse {
  content: AdminRecentOrder[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AdminRecentComplaint {
  complaintId: string;
  orderId: string;
  complaintType: ComplaintType;
  status: ComplaintStatus;
  complainantRole: Role;
  reportedUserRole: Role;
  createdAt: string;
  reviewedAt?: string;
}

export interface AdminRecentComplaintPageResponse {
  content: AdminRecentComplaint[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AdminUser {
  userId?: string;
  id?: string;
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
  accountStatus: AccountStatus;
  validComplaintCount?: number;
  createdAt?: string;
}


export interface AdminUserPageResponse {
  content: AdminUser[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AdminShop {
  id: string;
  shopName: string;
  name?: string;
  ownerId?: string;
  ownerName?: string;
  category: ShopCategory;
  city: string;
  phone: string;
  status: ShopStatus;
  validComplaintCount?: number;
  createdAt?: string;
}

export interface AdminShopPageResponse {
  content: AdminShop[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
