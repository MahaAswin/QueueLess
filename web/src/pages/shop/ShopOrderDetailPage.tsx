import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Clock,
  QrCode,
  Package,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useShopOrderDetail } from './hooks/useShopOrderDetail';
import { OrderTimeline } from '../customer/orders/OrderTimeline';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  formatCurrency,
  formatOrderId,
  formatDateLong,
  formatTimeLabel,
  getOrderStatusMeta,
} from '../../utils/formatters';
import { ShopOrderActions } from './components/ShopOrderActions';

export const ShopOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    order,
    loading,
    error,
    actionLoading,
    handleConfirm,
    handleReject,
    handleStartPreparing,
    handleMarkReady,
    refetch,
  } = useShopOrderDetail(id);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="skeleton" style={{ height: 32, width: 200 }} />
        <div className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
          <div className="skeleton" style={{ height: 260, borderRadius: 'var(--radius-lg)' }} />
          <div className="skeleton" style={{ height: 260, borderRadius: 'var(--radius-lg)' }} />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div
        className="card"
        style={{
          maxWidth: 520,
          margin: '40px auto',
          textAlign: 'center',
          padding: '48px 32px',
        }}
      >
        <AlertCircle size={40} color="var(--color-error)" style={{ marginBottom: 12 }} />
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Order Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 20 }}>
          {error || 'The requested order could not be found or you do not have permission to access it.'}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Button variant="outline" size="md" onClick={refetch}>
            Retry
          </Button>
          <Button variant="primary" size="md" onClick={() => navigate('/shop-owner/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const meta = getOrderStatusMeta(order.status);
  const slotDate = order.pickupSlot?.finalPickupDate || order.pickupSlot?.pickupDate;
  const slotStart = order.pickupSlot?.finalStartTime || order.pickupSlot?.requestedStartTime;
  const slotEnd = order.pickupSlot?.finalEndTime || order.pickupSlot?.requestedEndTime;
  const slotFormatted =
    slotStart && slotEnd
      ? `${formatTimeLabel(slotStart)} – ${formatTimeLabel(slotEnd)}`
      : 'Standard Pickup Window';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Header Bar */}
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
            to="/shop-owner/orders"
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
            <span>Back to Orders List</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1
              style={{
                fontSize: 24,
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
            Placed on {formatDateLong(order.createdAt)} • Customer: <strong>{order.customerName || 'Customer'}</strong>
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="md"
            onClick={refetch}
            icon={<RefreshCw size={15} className={actionLoading ? 'spin' : ''} />}
          >
            Refresh
          </Button>

          <ShopOrderActions
            orderId={order.id}
            status={order.status}
            isLoading={actionLoading}
            onConfirm={handleConfirm}
            onReject={handleReject}
            onStartPreparing={handleStartPreparing}
            onMarkReady={handleMarkReady}
            size="md"
          />
        </div>
      </div>

      {/* Progress Timeline Tracker */}
      <OrderTimeline status={order.status} updatedAt={order.updatedAt} />

      {/* Main 2-Column Details Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
          alignItems: 'flex-start',
        }}
      >
        {/* Left Column: Basket Items & Customer Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Order Items Table Card */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
              <span>Basket Items ({order.items?.length || 0})</span>
              <span style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>Prices in INR (₹)</span>
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

          {/* Customer Profile Card */}
          <div className="card">
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: 'var(--color-primary-deep)',
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              CUSTOMER INFORMATION
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary-deep)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                {order.customerName ? order.customerName.charAt(0).toUpperCase() : <User size={20} />}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-main)' }}>
                  {order.customerName || 'Customer'}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  Customer ID: <code style={{ fontSize: 11 }}>{order.customerId || 'Registered User'}</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment & Pickup Schedule */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Payment Summary */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>
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
                <span style={{ fontSize: 15, fontWeight: 700 }}>Total Paid</span>
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

          {/* Pickup Slot Details */}
          <div
            className="card"
            style={{
              backgroundColor: 'var(--color-light-sage)',
              borderColor: 'var(--color-sage)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Clock size={18} color="var(--color-primary-deep)" />
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-primary-deep)' }}>
                Pickup Slot Schedule
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 11, color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 700 }}>
                SCHEDULED WINDOW
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-main)', marginTop: 4 }}>
                {slotFormatted}
              </div>
              {slotDate && (
                <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Date: <strong>{slotDate}</strong>
                </div>
              )}
            </div>

            {order.status === 'READY_FOR_PICKUP' && (
              <Link to="/shop-owner/qr-pickup" style={{ textDecoration: 'none' }}>
                <Button
                  variant="primary"
                  size="md"
                  style={{ width: '100%', justifyContent: 'center' }}
                  icon={<QrCode size={16} />}
                >
                  Verify Customer QR
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
