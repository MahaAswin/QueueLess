import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../../services/orderService';
import { cartService } from '../../../services/cartService';
import type { Order, OrderStatus } from '../../../types/order.types';

export type OrderFilterTab = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export const isOrderActive = (status: OrderStatus): boolean => {
  return ['PENDING', 'CONFIRMED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP'].includes(status);
};

export const isOrderCompleted = (status: OrderStatus): boolean => {
  return status === 'COLLECTED' || status === 'COMPLETED';
};

export const isOrderCancelled = (status: OrderStatus): boolean => {
  return status === 'CANCELLED' || status === 'REJECTED';
};

export const useCustomerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OrderFilterTab>('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [selectedOrderForQR, setSelectedOrderForQR] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getCustomerOrders(0, 50);
      setOrders(response?.content || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Cancel order
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setCancellingId(orderId);
    try {
      await orderService.cancelOrder(orderId);
      await fetchOrders();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Unable to cancel this order.');
    } finally {
      setCancellingId(null);
    }
  };

  // Reorder flow
  const handleReorder = async (order: Order) => {
    if (!order.items || order.items.length === 0) return;

    setReorderingId(order.id);
    try {
      for (const item of order.items) {
        if (item.productId) {
          await cartService.addToCart(item.productId, item.quantity);
        }
      }
      navigate('/customer/cart');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to add items to cart for reorder.');
    } finally {
      setReorderingId(null);
    }
  };

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (activeTab === 'ALL') return true;
      if (activeTab === 'ACTIVE') return isOrderActive(order.status);
      if (activeTab === 'COMPLETED') return isOrderCompleted(order.status);
      if (activeTab === 'CANCELLED') return isOrderCancelled(order.status);
      return true;
    });
  }, [orders, activeTab]);

  const counts = useMemo(() => {
    return {
      all: orders.length,
      active: orders.filter((o) => isOrderActive(o.status)).length,
      completed: orders.filter((o) => isOrderCompleted(o.status)).length,
      cancelled: orders.filter((o) => isOrderCancelled(o.status)).length,
    };
  }, [orders]);

  return {
    orders,
    filteredOrders,
    counts,
    loading,
    error,
    activeTab,
    setActiveTab,
    cancellingId,
    reorderingId,
    selectedOrderForQR,
    setSelectedOrderForQR,
    handleCancelOrder,
    handleReorder,
    refetch: fetchOrders,
  };
};
