import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../../services/orderService';
import { pickupService } from '../../../services/pickupService';
import { cartService } from '../../../services/cartService';
import type { Order } from '../../../types/order.types';
import type { PickupQrResponse } from '../../../types/slot.types';
import { isOrderActive } from './useCustomerOrders';

export const useOrderDetail = (orderId?: string) => {
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [qrData, setQrData] = useState<PickupQrResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrder = useCallback(
    async (silent = false) => {
      if (!orderId) {
        setError('Invalid order ID.');
        setLoading(false);
        return;
      }

      if (!silent) {
        setLoading(true);
      }
      setError(null);

      try {
        const orderData = await orderService.getCustomerOrderById(orderId);
        setOrder(orderData);

        // If order is ready for pickup or confirmed, attempt to fetch real QR verification token
        if (orderData.status === 'READY_FOR_PICKUP' || orderData.status === 'CONFIRMED') {
          try {
            const qr = await pickupService.getPickupQR(orderId);
            setQrData(qr);
          } catch {
            // QR endpoint soft fallback
          }
        }
      } catch (err: any) {
        const message =
          err?.response?.status === 404
            ? 'Order not found.'
            : err?.response?.data?.message || 'Unable to load order details.';
        if (!silent) {
          setError(message);
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [orderId]
  );

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Live polling for active orders
  useEffect(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    if (order && isOrderActive(order.status)) {
      pollTimerRef.current = setInterval(() => {
        fetchOrder(true);
      }, 10000);
    }

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [order, fetchOrder]);

  // Cancel order
  const handleCancelOrder = async () => {
    if (!orderId) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(true);
    try {
      await orderService.cancelOrder(orderId);
      await fetchOrder(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Unable to cancel this order.');
    } finally {
      setCancelling(false);
    }
  };

  // Reorder
  const handleReorder = async () => {
    if (!order || !order.items || order.items.length === 0) return;

    setReordering(true);
    try {
      for (const item of order.items) {
        if (item.productId) {
          await cartService.addToCart(item.productId, item.quantity);
        }
      }
      navigate('/customer/cart');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to reorder items.');
    } finally {
      setReordering(false);
    }
  };

  return {
    order,
    qrData,
    loading,
    error,
    cancelling,
    reordering,
    showQRModal,
    setShowQRModal,
    handleCancelOrder,
    handleReorder,
    refetch: fetchOrder,
  };
};
