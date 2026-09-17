import { useState, useEffect, useCallback } from 'react';
import { adminOrderService } from '../../../services/adminOrderService';
import { adminService } from '../../../services/adminService';
import type {
  AdminOrder,
  AdminOrderDetail,
  AdminOrderSummary,
  AdminShop,
} from '../../../types/admin.types';
import type { OrderStatus } from '../../../types/order.types';

export type DatePreset = 'ALL' | 'TODAY' | '7DAYS' | '30DAYS' | 'CUSTOM';

export const useAdminOrders = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(15);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [shopFilter, setShopFilter] = useState<'ALL' | string>('ALL');
  const [dateFilter, setDateFilter] = useState<DatePreset>('ALL');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const [availableShops, setAvailableShops] = useState<AdminShop[]>([]);
  const [summary, setSummary] = useState<AdminOrderSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Load registered shops for filter dropdown once
  useEffect(() => {
    let mounted = true;
    const loadShops = async () => {
      try {
        const resp = await adminService.getShops({ size: 100 });
        if (mounted && resp?.content) {
          setAvailableShops(resp.content);
        }
      } catch {
        // Silently fallback if shop list fails
      }
    };
    loadShops();
    return () => {
      mounted = false;
    };
  }, []);

  // Compute ISO date range based on dateFilter preset
  const getDateRange = useCallback(() => {
    const now = new Date();
    if (dateFilter === 'TODAY') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return { from: startOfDay.toISOString(), to: endOfDay.toISOString() };
    }
    if (dateFilter === '7DAYS') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { from: sevenDaysAgo.toISOString(), to: now.toISOString() };
    }
    if (dateFilter === '30DAYS') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { from: thirtyDaysAgo.toISOString(), to: now.toISOString() };
    }
    if (dateFilter === 'CUSTOM') {
      const from = customFrom ? new Date(customFrom).toISOString() : undefined;
      const to = customTo ? new Date(customTo + 'T23:59:59.999Z').toISOString() : undefined;
      return { from, to };
    }
    return { from: undefined, to: undefined };
  }, [dateFilter, customFrom, customTo]);

  // Fetch orders from server
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { from, to } = getDateRange();
      const statusParam = statusFilter === 'ALL' ? undefined : statusFilter;
      const shopParam = shopFilter === 'ALL' ? undefined : shopFilter;

      const [orderPageResp, summaryResp] = await Promise.all([
        adminOrderService.getAdminOrders({
          status: statusParam,
          shopId: shopParam,
          search: debouncedSearch || undefined,
          from,
          to,
          page: currentPage,
          size: pageSize,
        }),
        adminOrderService.getOrderSummary().catch(() => null),
      ]);

      setOrders(orderPageResp.content || []);
      setTotalElements(orderPageResp.totalElements || 0);
      setTotalPages(orderPageResp.totalPages || 0);
      if (summaryResp) {
        setSummary(summaryResp);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load platform orders from server.'
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, shopFilter, getDateRange, currentPage, pageSize]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Fetch order details when selected
  const fetchOrderDetail = useCallback(async (orderId: string) => {
    setSelectedOrderId(orderId);
    setDetailLoading(true);
    setDetailError(null);
    try {
      const detail = await adminOrderService.getAdminOrderById(orderId);
      setSelectedOrder(detail);
    } catch (err: any) {
      setDetailError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load order details.'
      );
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeDetails = () => {
    setSelectedOrderId(null);
    setSelectedOrder(null);
    setDetailError(null);
  };

  return {
    orders,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    search,
    setSearch,
    statusFilter,
    setStatusFilter: (st: 'ALL' | OrderStatus) => {
      setStatusFilter(st);
      setCurrentPage(0);
    },
    shopFilter,
    setShopFilter: (sp: 'ALL' | string) => {
      setShopFilter(sp);
      setCurrentPage(0);
    },
    dateFilter,
    setDateFilter: (df: DatePreset) => {
      setDateFilter(df);
      setCurrentPage(0);
    },
    customFrom,
    setCustomFrom: (cf: string) => {
      setCustomFrom(cf);
      setCurrentPage(0);
    },
    customTo,
    setCustomTo: (ct: string) => {
      setCustomTo(ct);
      setCurrentPage(0);
    },
    availableShops,
    summary,
    loading,
    error,
    selectedOrderId,
    selectedOrder,
    detailLoading,
    detailError,
    fetchOrderDetail,
    closeDetails,
    setPage: setCurrentPage,
    refetch: fetchOrders,
  };
};
