import { useState, useEffect, useCallback } from 'react';
import { orderService } from '../../../services/orderService';
import type { Order } from '../../../types/order.types';

export const useShopOrderDetail = (orderId?: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getShopOrderById(orderId);
      setOrder(res);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Failed to load order details. You may not have access to this order.'
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const handleConfirm = async () => {
    if (!orderId) return;
    setActionLoading(true);
    try {
      const updated = await orderService.confirmOrder(orderId);
      setOrder(updated);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to confirm order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!orderId) return;
    if (!window.confirm('Are you sure you want to decline this order? Stock will be restored.')) return;
    setActionLoading(true);
    try {
      const updated = await orderService.rejectOrder(orderId);
      setOrder(updated);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to decline order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartPreparing = async () => {
    if (!orderId) return;
    setActionLoading(true);
    try {
      const updated = await orderService.startPreparingOrder(orderId);
      setOrder(updated);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to start preparation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkReady = async () => {
    if (!orderId) return;
    setActionLoading(true);
    try {
      const updated = await orderService.markOrderReady(orderId);
      setOrder(updated);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to mark order ready for pickup.');
    } finally {
      setActionLoading(false);
    }
  };

  return {
    order,
    loading,
    error,
    actionLoading,
    handleConfirm,
    handleReject,
    handleStartPreparing,
    handleMarkReady,
    refetch: fetchOrderDetail,
  };
};
