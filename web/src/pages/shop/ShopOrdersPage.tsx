import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import type { Order, OrderStatus } from '../../types/order.types';
import {
  formatCurrency,
  formatOrderId,
  formatDateLong,
  formatTimeLabel,
  getOrderStatusMeta,
} from '../../utils/formatters';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { Check, X, ChefHat, CheckCircle2, RefreshCw, Filter } from 'lucide-react';

const FILTER_STATUSES: { label: string; value?: OrderStatus }[] = [
  { label: 'All Orders', value: undefined },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Preparing', value: 'PREPARING' },
  { label: 'Ready for Pickup', value: 'READY_FOR_PICKUP' },
  { label: 'Collected', value: 'COLLECTED' },
  { label: 'Cancelled / Rejected', value: 'CANCELLED' },
];

export const ShopOrdersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status') as OrderStatus | null;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>(
    statusParam || undefined
  );
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getShopOrders(selectedStatus, page, 20);
      setOrders(res.content || []);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load shop orders.');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = (status?: OrderStatus) => {
    setSelectedStatus(status);
    setPage(0);
    if (status) {
      setSearchParams({ status });
    } else {
      setSearchParams({});
    }
  };

  const handleConfirm = async (orderId: string) => {
    setActionLoadingId(orderId);
    try {
      await orderService.confirmOrder(orderId);
      await fetchOrders();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to confirm order');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStartPrep = async (orderId: string) => {
    setActionLoadingId(orderId);
    try {
      await orderService.startPreparingOrder(orderId);
      await fetchOrders();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to move order to preparing');
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
      alert(err?.response?.data?.message || 'Failed to mark order ready');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to reject this order?')) return;
    setActionLoadingId(orderId);
    try {
      await orderService.rejectOrder(orderId);
      await fetchOrders();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to reject order');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px 0' }}>
            Store Orders Management
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: 0 }}>
            Live incoming and historical customer pickup orders
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={fetchOrders}
          icon={<RefreshCw size={16} className={loading ? 'spin' : ''} />}
        >
          Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
          overflowX: 'auto',
          paddingBottom: 4,
        }}
      >
        {FILTER_STATUSES.map((tab) => {
          const isActive = selectedStatus === tab.value;
          return (
            <button
              key={tab.label}
              onClick={() => handleStatusChange(tab.value)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: 13,
                fontWeight: 600,
                border: '1px solid',
                borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                backgroundColor: isActive ? 'var(--color-primary-deep)' : 'var(--color-surface)',
                color: isActive ? '#fff' : 'var(--color-text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {loading ? (
        <LoadingState message="Loading store orders..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchOrders} />
      ) : orders.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--color-text-muted)' }}
        >
          <Filter size={32} color="var(--color-text-light)" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No orders found</h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-light)' }}>
            There are no orders matching the selected status filter.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {orders.map((order) => {
            const meta = getOrderStatusMeta(order.status);
            const isProcessing = actionLoadingId === order.id;

            return (
              <div key={order.id} className="card interactive-card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginBottom: 12,
                    borderBottom: '1px solid var(--color-border-subtle)',
                    paddingBottom: 12,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          fontFamily: 'var(--mono)',
                          fontWeight: 800,
                          fontSize: 15,
                          color: 'var(--color-primary-deep)',
                        }}
                      >
                        {formatOrderId(order.id)}
                      </span>
                      <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 4 }}>
                      Placed {formatDateLong(order.createdAt)} • Customer: <strong>{order.customerName || 'Customer'}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary-deep)' }}>
                      {formatCurrency(order.totalAmount)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {order.items?.length || 0} items
                    </div>
                  </div>
                </div>

                {/* Items preview */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Basket Items
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {order.items?.map((item) => (
                      <span
                        key={item.id}
                        style={{
                          fontSize: 13,
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-surface-subtle)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        {item.quantity}x {item.productName} ({formatCurrency(item.subtotal || item.unitPrice * item.quantity)})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pickup Slot info if available */}
                {order.pickupSlot && (
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 14 }}>
                    Pickup Slot: <strong>{order.pickupSlot.pickupDate}</strong> ({formatTimeLabel(order.pickupSlot.requestedStartTime)} - {formatTimeLabel(order.pickupSlot.requestedEndTime)})
                  </div>
                )}

                {/* Actions Row */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  {order.status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={isProcessing}
                        onClick={() => handleConfirm(order.id)}
                        icon={<Check size={14} />}
                      >
                        Accept Order
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={isProcessing}
                        onClick={() => handleReject(order.id)}
                        icon={<X size={14} />}
                      >
                        Decline
                      </Button>
                    </>
                  )}

                  {order.status === 'CONFIRMED' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={isProcessing}
                      onClick={() => handleStartPrep(order.id)}
                      icon={<ChefHat size={14} />}
                    >
                      Start Preparation
                    </Button>
                  )}

                  {order.status === 'PREPARING' && (
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={isProcessing}
                      onClick={() => handleMarkReady(order.id)}
                      icon={<CheckCircle2 size={14} />}
                    >
                      Mark Ready for Pickup
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 16 }}>
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span style={{ fontSize: 13, alignSelf: 'center', color: 'var(--color-text-muted)' }}>
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
