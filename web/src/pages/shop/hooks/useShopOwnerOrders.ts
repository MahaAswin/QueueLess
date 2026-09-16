import { useState, useEffect, useCallback, useMemo } from 'react';
import { orderService } from '../../../services/orderService';
import type { Order, OrderStatus } from '../../../types/order.types';

export type PickupTimeFilter = 'ALL' | 'TODAY' | 'UPCOMING' | 'PAST';
export type OrderSortOption = 'NEWEST' | 'OLDEST' | 'PICKUP_TIME';

export const useShopOwnerOrders = (initialStatus?: OrderStatus) => {
  const [allFetchedOrders, setAllFetchedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & State
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');
  const [pickupFilter, setPickupFilter] = useState<PickupTimeFilter>('ALL');
  const [sortBy, setSortBy] = useState<OrderSortOption>('NEWEST');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Action status per order
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getShopOrders(statusFilter, page, 50);
      setAllFetchedOrders(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || (res.content ? res.content.length : 0));
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Failed to load store orders. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Status transitions
  const handleConfirmOrder = async (orderId: string) => {
    setActionLoadingId(orderId);
    try {
      await orderService.confirmOrder(orderId);
      await fetchOrders();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to confirm order.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to decline this order? Stock will be restored.')) {
      return;
    }
    setActionLoadingId(orderId);
    try {
      await orderService.rejectOrder(orderId);
      await fetchOrders();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to reject order.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStartPreparing = async (orderId: string) => {
    setActionLoadingId(orderId);
    try {
      await orderService.startPreparingOrder(orderId);
      await fetchOrders();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to start preparation.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkReady = async (orderId: string) => {
    setActionLoadingId(orderId);
    try {
      await orderService.markOrderReady(orderId);
      await fetchOrders();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to mark order ready for pickup.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Client-side search and pickup date refinement on the current fetched dataset
  const filteredOrders = useMemo(() => {
    let result = [...allFetchedOrders];

    // Search query filter (Order ID or Customer Name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((order) => {
        const idMatch = order.id.toLowerCase().includes(q) || order.id.replace(/-/g, '').toLowerCase().includes(q);
        const customerMatch = order.customerName?.toLowerCase().includes(q);
        return idMatch || customerMatch;
      });
    }

    // Pickup time window filter
    if (pickupFilter !== 'ALL') {
      const todayStr = new Date().toISOString().split('T')[0];
      result = result.filter((order) => {
        const slotDate = order.pickupSlot?.finalPickupDate || order.pickupSlot?.pickupDate;
        if (!slotDate) return false;
        if (pickupFilter === 'TODAY') return slotDate === todayStr;
        if (pickupFilter === 'UPCOMING') return slotDate >= todayStr;
        if (pickupFilter === 'PAST') return slotDate < todayStr;
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'OLDEST') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'PICKUP_TIME') {
        const timeA =
          a.pickupSlot?.finalStartTime ||
          a.pickupSlot?.requestedStartTime ||
          a.pickupSlot?.startTime ||
          '99:99';
        const timeB =
          b.pickupSlot?.finalStartTime ||
          b.pickupSlot?.requestedStartTime ||
          b.pickupSlot?.startTime ||
          '99:99';
        return timeA.localeCompare(timeB);
      }
      return 0;
    });

    return result;
  }, [allFetchedOrders, searchQuery, pickupFilter, sortBy]);

  // Operational KPI counts
  const kpiCounts = useMemo(() => {
    return {
      pending: allFetchedOrders.filter((o) => o.status === 'PENDING').length,
      preparing: allFetchedOrders.filter(
        (o) => o.status === 'CONFIRMED' || o.status === 'ACCEPTED' || o.status === 'PREPARING'
      ).length,
      ready: allFetchedOrders.filter((o) => o.status === 'READY_FOR_PICKUP').length,
      total: totalElements || allFetchedOrders.length,
    };
  }, [allFetchedOrders, totalElements]);

  return {
    orders: filteredOrders,
    rawOrdersCount: allFetchedOrders.length,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    pickupFilter,
    setPickupFilter,
    sortBy,
    setSortBy,
    page,
    setPage,
    totalPages,
    totalElements,
    kpiCounts,
    actionLoadingId,
    handleConfirmOrder,
    handleRejectOrder,
    handleStartPreparing,
    handleMarkReady,
    refetch: fetchOrders,
  };
};
