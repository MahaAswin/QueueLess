import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Store,
  Clock,
  Package,
  ShieldCheck,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { adminOrderService } from '../../services/adminOrderService';
import { OrderTimeline } from '../customer/orders/OrderTimeline';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/feedback/ErrorState';
import {
  formatCurrency,
  formatOrderId,
  formatDateLong,
  getOrderStatusMeta,
} from '../../utils/formatters';
import type { AdminOrderDetail } from '../../types/admin.types';

export const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminOrderService.getAdminOrderById(id);
      setOrder(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load order details.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1200, margin: '0 auto' }}>
        <div className="skeleton" style={{ height: 32, width: 220 }} />
        <div className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
          <div className="skeleton" style={{ height: 320, borderRadius: 'var(--radius-lg)' }} />
          <div className="skeleton" style={{ height: 320, borderRadius: 'var(--radius-lg)' }} />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto' }}>
        <ErrorState
          title="Order Not Found"
          message={error || 'Could not locate the requested order.'}
          onRetry={fetchOrder}
        />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <Button variant="secondary" size="md" onClick={() => navigate('/admin/orders')}>
            Back to Orders List
          </Button>
        </div>
      </div>
    );
  }

  const meta = getOrderStatusMeta(order.status);
  const slotDisplay = order.pickupSlot
    ? `${order.pickupSlot.startTime || order.pickupSlot.requestedStartTime || ''} – ${
        order.pickupSlot.endTime || order.pickupSlot.requestedEndTime || ''
      }`
    : 'Counter Express Pickup';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* Top Header */}
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
            to="/admin/orders"
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
            <span>Back to Orders Monitoring</span>
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
              Order #{formatOrderId(order.orderId)}
            </h1>
            <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
          </div>

          <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, marginTop: 4 }}>
            Placed on {formatDateLong(order.createdAt)} • Partner Outlet: <strong>{order.shopName || 'Partner Shop'}</strong>
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          icon={<RefreshCw size={14} />}
          onClick={fetchOrder}
        >
          Refresh Order
        </Button>
      </div>

      {/* Progress Timeline */}
      <OrderTimeline status={order.status} updatedAt={order.updatedAt} />

      {/* 2-Column Responsive Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: 24,
          alignItems: 'flex-start',
        }}
        className="cart-grid-layout"
      >
        {/* Left Column: Line Items & Customer */}
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
              <span>Ordered Items ({order.items?.length || 0})</span>
              <span style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>Prices in INR (₹)</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {order.items?.map((item, idx) => (
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
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-main)' }}>
                    {formatCurrency(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer & Merchant Information Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Customer Details */}
            <div className="card">
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <User size={13} />
                CUSTOMER
              </div>

              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-main)' }}>
                {order.customerName || 'Customer'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10, fontSize: 12.5, color: 'var(--color-text-muted)' }}>
                {order.customerEmail && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={13} color="var(--color-text-light)" />
                    <span>{order.customerEmail}</span>
                  </div>
                )}
                {order.customerPhone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={13} color="var(--color-text-light)" />
                    <span>{order.customerPhone}</span>
                  </div>
                )}
                <div style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 4 }}>
                  ID: <code style={{ fontSize: 10.5 }}>{order.customerId}</code>
                </div>
              </div>
            </div>

            {/* Shop Details */}
            <div className="card">
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Store size={13} />
                PARTNER OUTLET
              </div>

              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-main)' }}>
                {order.shopName || 'Partner Shop'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10, fontSize: 12.5, color: 'var(--color-text-muted)' }}>
                {order.shopCategory && (
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-main)' }}>
                    Category: {order.shopCategory}
                  </div>
                )}
                {(order.shopCity || order.shopAddress) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={13} color="var(--color-text-light)" />
                    <span>
                      {order.shopAddress ? `${order.shopAddress}, ` : ''}
                      {order.shopCity}
                    </span>
                  </div>
                )}
                {order.shopPhone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={13} color="var(--color-text-light)" />
                    <span>{order.shopPhone}</span>
                  </div>
                )}
                {order.ownerName && (
                  <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>
                    Owner: <strong>{order.ownerName}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment & Pickup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Payment Summary */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>
              Payment Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Basket Subtotal</span>
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
              <div style={{ fontSize: 11, color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 700 }}>
                SLOT WINDOW
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-main)', marginTop: 4 }}>
                {slotDisplay}
              </div>
              {order.pickupSlot?.pickupDate && (
                <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Date: <strong>{order.pickupSlot.pickupDate}</strong>
                </div>
              )}
              {order.pickupSlot?.status && (
                <div style={{ fontSize: 11.5, color: 'var(--color-primary-deep)', fontWeight: 600, marginTop: 4 }}>
                  Status: {order.pickupSlot.status}
                </div>
              )}
            </div>
          </div>

          {/* Oversight Governance Badge */}
          <div
            className="card"
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              backgroundColor: 'var(--color-surface-subtle)',
            }}
          >
            <ShieldCheck size={22} color="var(--color-primary)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              <strong>Admin Oversight Role:</strong> Monitor orders across all shops. Merchant fulfillment and customer order actions remain within their respective domain workflows.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
