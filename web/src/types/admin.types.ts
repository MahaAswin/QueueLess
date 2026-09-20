import type { Role, AccountStatus } from './auth.types';
import type { ShopCategory, ShopStatus } from './shop.types';
import type { OrderStatus, OrderPickupSlotInfo } from './order.types';
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
  totalRevenue?: number;
}

export interface AdminComplaintSummary {
  totalComplaints: number;
  submittedComplaints: number;
  pendingComplaints?: number;
  underReviewComplaints: number;
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
  page?: number;
  number?: number;
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
  page?: number;
  number?: number;
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
  page?: number;
  number?: number;
  size: number;
}

export interface AdminShop {
  shopId?: string;
  id?: string;
  shopName: string;
  name?: string;
  description?: string;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  category: ShopCategory;
  phone: string;
  address?: string;
  city: string;
  latitude?: number;
  longitude?: number;
  openingTime?: string;
  closingTime?: string;
  status: ShopStatus;
  validComplaintCount?: number;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminShopPageResponse {
  content: AdminShop[];
  totalElements: number;
  totalPages: number;
  page?: number;
  number?: number;
  size: number;
}

export interface AdminOrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface AdminOrder {
  orderId: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shopId: string;
  shopName?: string;
  shopCategory?: string;
  totalAmount: number;
  status: OrderStatus;
  pickupSlot?: OrderPickupSlotInfo;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminOrderDetail extends AdminOrder {
  shopAddress?: string;
  shopCity?: string;
  shopPhone?: string;
  ownerName?: string;
  ownerEmail?: string;
  items: AdminOrderItem[];
}

export interface AdminOrderPageResponse {
  content: AdminOrder[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  hasNext: boolean;
}

export interface AdminOrderFilterParams {
  status?: OrderStatus;
  shopId?: string;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export interface AdminComplaintPageResponse {
  content: import('./complaint.types').ComplaintResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  hasNext: boolean;
}

export interface AdminComplaintFilterParams {
  status?: ComplaintStatus;
  type?: ComplaintType;
  search?: string;
  page?: number;
  size?: number;
}
