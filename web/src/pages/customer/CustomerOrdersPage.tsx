import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  Store,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Calendar,
  X,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import type { Order, OrderStatus } from '../../types/order.types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { EmptyState } from '../../components/feedback/EmptyState';

type FilterTab = 'ALL' | 'ACTIVE' | 'READY' | 'COMPLETED' | 'CANCELLED';

export const CustomerOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedQR, setSelectedQR] = useState<Order | null>(null);

  const fetchOrders = async () => {
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
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'READY_FOR_PICKUP':
        return (
          <Badge variant="success" icon={<CheckCircle2 size={12} />}>
            Ready for Pickup
          </Badge>
        );
      case 'PREPARING':
        return (
          <Badge variant="warning" icon={<Clock size={12} />}>
            Preparing Basket
          </Badge>
        );
      case 'CONFIRMED':
      case 'ACCEPTED':
        return (
          <Badge variant="info" icon={<CheckCircle2 size={12} />}>
            Confirmed by Shop
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="warning" icon={<Clock size={12} />}>
            Pending Acceptance
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge variant="neutral" icon={<CheckCircle2 size={12} />}>
            Completed
          </Badge>
        );
      case 'CANCELLED':
      case 'REJECTED':
        return (
          <Badge variant="error" icon={<XCircle size={12} />}>
            {status === 'CANCELLED' ? 'Cancelled' : 'Rejected'}
          </Badge>
        );
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  // Filter orders based on active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ACTIVE') {
      return ['PENDING', 'CONFIRMED', 'ACCEPTED', 'PREPARING'].includes(order.status);
    }
    if (activeTab === 'READY') {
      return order.status === 'READY_FOR_PICKUP';
    }
    if (activeTab === 'COMPLETED') {
      return order.status === 'COMPLETED';
    }
    if (activeTab === 'CANCELLED') {
      return ['CANCELLED', 'REJECTED'].includes(order.status);
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* QR Pickup Modal */}
      {selectedQR && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 100,
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setSelectedQR(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: 420,
              width: '100%',
              textAlign: 'center',
              padding: 32,
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedQR(null)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                padding: 6,
                color: 'var(--color-text-muted)',
              }}
            >
              <X size={20} />
            </button>

            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-subtle)',
                color: 'var(--color-primary-deep)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <QrCode size={32} />
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
              Express Pickup Pass
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, marginBottom: 20 }}>
              Show this order reference or barcode to the staff at <strong>{selectedQR.shopName}</strong> for instant pickup.
            </p>

            <div
              style={{
                backgroundColor: 'var(--color-surface-subtle)',
                padding: '20px 16px',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--color-border)',
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-light)', letterSpacing: 1 }}>
                ORDER REFERENCE CODE
              </div>
              <div style={{ fontSize: 28, fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-primary-deep)', letterSpacing: 2, marginTop: 4 }}>
                {selectedQR.id.slice(0, 8).toUpperCase()}
              </div>
            </div>

            <Button variant="primary" size="md" onClick={() => setSelectedQR(null)} style={{ width: '100%' }}>
              Done / Close
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              backgroundColor: 'var(--color-primary-subtle)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-primary-deep)',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            <Sparkles size={13} />
            <span>EXPRESS ORDERS</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-main)' }}>
            Orders & Pickups
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14.5 }}>
            Track order preparation, scheduled pickup slots, and view verification codes.
          </p>
        </div>

        <Link to="/customer/shops">
          <Button variant="primary" size="md" icon={<Store size={18} />}>
            Order from Shop
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: 4,
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'ALL', label: `All Orders (${orders.length})` },
          {
            id: 'ACTIVE',
            label: `In Progress (${
              orders.filter((o) => ['PENDING', 'CONFIRMED', 'ACCEPTED', 'PREPARING'].includes(o.status)).length
            })`,
          },
          {
            id: 'READY',
            label: `Ready for Pickup (${orders.filter((o) => o.status === 'READY_FOR_PICKUP').length})`,
          },
          {
            id: 'COMPLETED',
            label: `Completed (${orders.filter((o) => o.status === 'COMPLETED').length})`,
          },
          {
            id: 'CANCELLED',
            label: `Cancelled (${orders.filter((o) => ['CANCELLED', 'REJECTED'].includes(o.status)).length})`,
          },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as FilterTab)}
              style={{
                padding: '10px 18px',
                borderBottom: isSelected ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: isSelected ? 'var(--color-primary-deep)' : 'var(--color-text-muted)',
                fontWeight: isSelected ? 700 : 500,
                fontSize: 14,
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main List */}
      {loading ? (
        <LoadingState message="Fetching your express orders and pickup passes..." />
      ) : error ? (
        <ErrorState title="Unable to load orders" message={error} onRetry={fetchOrders} />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<Receipt size={32} />}
          title={activeTab === 'ALL' ? 'No orders placed yet' : 'No orders match this filter'}
          message={
            activeTab === 'ALL'
              ? 'You have not placed any express pickup orders yet. Browse partner shops to get started!'
              : 'Try selecting another order tab or create a new order.'
          }
          actionText={activeTab === 'ALL' ? 'Explore Shops' : 'Show All Orders'}
          onAction={() => (activeTab === 'ALL' ? null : setActiveTab('ALL'))}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {filteredOrders.map((order) => {
            const isCancelling = cancellingId === order.id;
            const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);
            const isReady = order.status === 'READY_FOR_PICKUP';

            const formattedDate = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recently placed';

            return (
              <div
                key={order.id}
                className="card"
                style={{
                  padding: '24px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                  borderColor: isReady ? 'var(--color-primary)' : 'var(--color-border)',
                  boxShadow: isReady ? '0 4px 16px var(--color-primary-glow)' : 'var(--shadow-sm)',
                }}
              >
                {/* Order Top Bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    paddingBottom: 16,
                    borderBottom: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isReady ? 'var(--color-primary-deep)' : 'var(--color-sage)',
                        color: isReady ? '#fff' : 'var(--color-primary-deep)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Receipt size={22} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-main)' }}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--color-text-light)', marginTop: 2 }}>
                        Placed on {formattedDate}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary-deep)' }}>
                      ${Number(order.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Shop and Items Content */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 20,
                  }}
                  className="order-content-grid"
                >
                  {/* Shop Details & Pickup Slot */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Store size={16} color="var(--color-primary)" />
                      <span style={{ fontWeight: 700, fontSize: 15 }}>
                        {order.shopName || 'Partner Merchant'}
                      </span>
                    </div>

                    {/* Pickup Slot Status Box */}
                    <div
                      style={{
                        backgroundColor: 'var(--color-surface-subtle)',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        fontSize: 13,
                      }}
                    >
                      <Calendar size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                          Zero-Wait Express Pickup
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                          {order.pickupSlot
                            ? `Slot: ${order.pickupSlot.startTime || ''} - ${order.pickupSlot.endTime || ''}`
                            : 'Pickup Slot: Ready upon merchant notification'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items list */}
                  <div
                    style={{
                      backgroundColor: 'var(--color-surface-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 16px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--color-text-light)',
                        textTransform: 'uppercase',
                        marginBottom: 8,
                      }}
                    >
                      Ordered Items ({order.items?.length || 0})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 110, overflowY: 'auto' }}>
                      {order.items?.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 13,
                          }}
                        >
                          <span style={{ color: 'var(--color-text-main)' }}>
                            {item.quantity}x {item.productName}
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>
                            ${Number(item.subtotal || item.unitPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions Bottom Bar */}
                <div
                  style={{
                    paddingTop: 12,
                    borderTop: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Package size={14} />
                    <span>Free express packaging included</span>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    {/* View QR Code / Pass */}
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<QrCode size={14} />}
                      onClick={() => setSelectedQR(order)}
                    >
                      Pickup Pass
                    </Button>

                    {canCancel && (
                      <Button
                        variant="danger"
                        size="sm"
                        isLoading={isCancelling}
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
