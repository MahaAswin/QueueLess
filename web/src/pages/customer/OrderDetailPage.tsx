import React, { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Store,
  Clock,
  QrCode,
  ShieldCheck,
  RotateCcw,
  Package,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useOrderDetail } from './orders/useOrderDetail';
import { OrderTimeline } from './orders/OrderTimeline';
import { OrderPickupPass } from './orders/OrderPickupPass';
import { OrderDetailSkeleton } from './orders/OrdersListSkeleton';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  formatCurrency,
  formatOrderId,
  formatDateLong,
  getOrderStatusMeta,
} from '../../utils/formatters';
import { isOrderActive } from './orders/useCustomerOrders';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as {
    orderPlaced?: boolean;
    pickupSlot?: string;
  } | null;

  const [successBanner, setSuccessBanner] = useState<string | null>(
    locationState?.orderPlaced
      ? `Order placed successfully! ${
          locationState.pickupSlot
            ? `Your pickup is scheduled for ${locationState.pickupSlot}.`
            : ''
        }`
      : null
  );

  const {
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
    refetch,
  } = useOrderDetail(id);

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (error || !order) {
    return (
      <div
        className="card"
        style={{
          maxWidth: 540,
          margin: '40px auto',
          textAlign: 'center',
          padding: '48px 32px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-main)', marginBottom: 8 }}>
          {error || 'Order Not Found'}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14.5, marginBottom: 24 }}>
          We could not locate this order or you may not have authorization to view it.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Button variant="outline" size="md" onClick={() => refetch()}>
            Retry
          </Button>
          <Button variant="primary" size="md" onClick={() => navigate('/customer/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const meta = getOrderStatusMeta(order.status);
  const active = isOrderActive(order.status);
  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';
  const canReorder =
    order.status === 'COLLECTED' ||
    order.status === 'COMPLETED' ||
    order.status === 'CANCELLED' ||
    order.status === 'REJECTED';

  const slotDisplay = order.pickupSlot
    ? `${order.pickupSlot.startTime || ''} – ${order.pickupSlot.endTime || ''}`
    : 'Ready upon merchant notification';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* QR Pickup Modal */}
      {showQRModal && (
        <OrderPickupPass
          order={order}
          qrData={qrData}
          onClose={() => setShowQRModal(false)}
        />
      )}

      {/* Top Bar: Back Link, Order ID, Status Badge */}
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
          <Link
            to="/customer/orders"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--color-primary-deep)',
              textDecoration: 'none',
              marginBottom: 10,
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Orders</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: 'var(--color-text-main)',
                fontFamily: 'var(--font-heading)',
                margin: 0,
              }}
            >
              Order {formatOrderId(order.id)}
            </h1>
            <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
          </div>

          <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, marginTop: 4 }}>
            Placed on {formatDateLong(order.createdAt)}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {active && (
            <Button
              variant="secondary"
              size="md"
              icon={<QrCode size={16} />}
              onClick={() => setShowQRModal(true)}
            >
              Pickup Pass
            </Button>
          )}

          {canCancel && (
            <Button
              variant="danger"
              size="md"
              isLoading={cancelling}
              onClick={handleCancelOrder}
            >
              Cancel Order
            </Button>
          )}

          {canReorder && (
            <Button
              variant="outline"
              size="md"
              icon={<RotateCcw size={15} />}
              isLoading={reordering}
              onClick={handleReorder}
            >
              Reorder All Items
            </Button>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div
          className="card"
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--color-success-bg)',
            borderColor: 'var(--color-success-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 size={20} color="var(--color-success)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>
              {successBanner}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#166534',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Live Order Timeline Progress */}
      <OrderTimeline status={order.status} updatedAt={order.updatedAt} />

      {/* 2-Column Responsive Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: 28,
          alignItems: 'flex-start',
        }}
        className="cart-grid-layout"
      >
        {/* Left Column: Items & Merchant */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          {/* Order Items Table Card */}
          <div
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-subtle)',
                fontWeight: 700,
                fontSize: 14,
                color: 'var(--color-text-main)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Ordered Items ({order.items?.length || 0})</span>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Prices in INR (₹)</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {order.items?.map((item, idx) => {
                const unitPrice =
                  typeof item.unitPrice === 'number'
                    ? item.unitPrice
                    : parseFloat(String(item.unitPrice)) || 0;
                const subtotal =
                  typeof item.subtotal === 'number'
                    ? item.subtotal
                    : unitPrice * item.quantity;

                return (
                  <div
                    key={item.id || idx}
                    style={{
                      padding: '16px 20px',
                      borderBottom:
                        idx < (order.items?.length || 0) - 1
                          ? '1px solid var(--color-border-subtle)'
                          : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-light-sage)',
                          color: 'var(--color-primary-deep)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Package size={20} />
                      </div>

                      <div>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--color-text-main)' }}>
                          {item.productName}
                        </div>
                        <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 2 }}>
                          {item.quantity} × {formatCurrency(unitPrice)}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-main)' }}>
                      {formatCurrency(subtotal)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Merchant Card */}
          <div
            className="card"
            style={{
              padding: 22,
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: 'var(--color-primary-deep)',
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              MERCHANT DETAILS
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-primary-subtle)',
                    color: 'var(--color-primary-deep)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Store size={22} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-main)' }}>
                    {order.shopName || 'Partner Shop'}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    QueueLess Zero-Wait Express Pickup Partner
                  </div>
                </div>
              </div>

              {order.shopId && (
                <Link to={`/customer/shop/${order.shopId}`} style={{ textDecoration: 'none' }}>
                  <Button variant="outline" size="sm">
                    View Shop Menu
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Pickup Pass */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Order Summary Card */}
          <div
            className="card"
            style={{
              padding: 24,
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: 'var(--color-text-main)',
                marginBottom: 16,
                fontFamily: 'var(--font-heading)',
              }}
            >
              Payment Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Items Subtotal</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(order.totalAmount)}</span>
              </div>

              <div
                style={{
                  paddingTop: 14,
                  marginTop: 6,
                  borderTop: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 700 }}>Total Paid</span>
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: 'var(--color-primary-deep)',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Pickup Slot Details Card */}
          <div
            className="card"
            style={{
              padding: 22,
              backgroundColor: 'var(--color-light-sage)',
              borderColor: 'var(--color-sage)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color="var(--color-primary-deep)" />
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-primary-deep)' }}>
                Scheduled Pickup Slot
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 700 }}>
                SLOT WINDOW
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-main)', marginTop: 4 }}>
                {slotDisplay}
              </div>
              {order.pickupSlot?.pickupDate && (
                <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  Date: {order.pickupSlot.pickupDate}
                </div>
              )}
            </div>

            <Button
              variant="primary"
              size="md"
              style={{ width: '100%', justifyContent: 'center' }}
              icon={<QrCode size={16} />}
              onClick={() => setShowQRModal(true)}
            >
              Show Pickup Pass
            </Button>
          </div>

          {/* Trust Guarantee */}
          <div
            className="card"
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              backgroundColor: 'var(--color-surface-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <ShieldCheck size={22} color="var(--color-primary)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              Direct merchant QR scan verification upon express pickup counter check-in.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
