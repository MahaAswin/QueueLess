import { useState, useEffect, useCallback } from 'react';
import { shopOwnerService, type ShopDashboardData } from '../../../services/shopOwnerService';
import { orderService } from '../../../services/orderService';
import type { Shop } from '../../../types/shop.types';

export const useShopOwnerDashboard = () => {
  const [data, setData] = useState<ShopDashboardData | null>(null);
  const [activeShop, setActiveShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await shopOwnerService.getDashboardSummary();
      setData(summary);
      if (summary.shops.length > 0) {
        setActiveShop((prev) => {
          if (prev && summary.shops.some((s) => s.id === prev.id)) {
            return summary.shops.find((s) => s.id === prev.id) || summary.shops[0];
          }
          return summary.shops[0];
        });
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to load shop dashboard data. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleConfirmOrder = async (orderId: string) => {
    setActionLoadingId(orderId);
    try {
      await orderService.confirmOrder(orderId);
      await fetchDashboard();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to confirm order.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStartPreparing = async (orderId: string) => {
    setActionLoadingId(orderId);
    try {
      await orderService.startPreparingOrder(orderId);
      await fetchDashboard();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to move order to preparing.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkReady = async (orderId: string) => {
    setActionLoadingId(orderId);
    try {
      await orderService.markOrderReady(orderId);
      await fetchDashboard();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to mark order ready for pickup.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to reject this order?')) return;
    setActionLoadingId(orderId);
    try {
      await orderService.rejectOrder(orderId);
      await fetchDashboard();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to reject order.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return {
    data,
    activeShop,
    setActiveShop,
    loading,
    error,
    actionLoadingId,
    handleConfirmOrder,
    handleStartPreparing,
    handleMarkReady,
    handleRejectOrder,
    refetch: fetchDashboard,
  };
};
