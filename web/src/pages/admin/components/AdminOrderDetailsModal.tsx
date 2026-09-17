import React from 'react';
import {
  X,
  User,
  Store,
  Clock,
  Package,
  ShieldCheck,
  Receipt,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { OrderTimeline } from '../../customer/orders/OrderTimeline';
import {
  formatCurrency,
  formatOrderId,
  formatDateLong,
  getOrderStatusMeta,
} from '../../../utils/formatters';
import type { AdminOrderDetail } from '../../../types/admin.types';

interface AdminOrderDetailsModalProps {
  order: AdminOrderDetail | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

export const AdminOrderDetailsModal: React.FC<AdminOrderDetailsModalProps> = ({
  order,
  loading,
  error,
  onClose,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: 820,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--color-surface-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
              }}
            >
              <Receipt size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: 'var(--color-text-main)' }}>
                  {order ? `Order #${formatOrderId(order.orderId)}` : 'Order Details'}
                </h3>
                {order && (
                  <Badge variant={getOrderStatusMeta(order.status).badgeVariant}>
                    {getOrderStatusMeta(order.status).label}
                  </Badge>
                )}
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                {order ? `Placed on ${formatDateLong(order.createdAt)}` : 'Platform Order Monitoring'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: 6,
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="skeleton" style={{ height: 90, borderRadius: 'var(--radius-md)' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="skeleton" style={{ height: 130, borderRadius: 'var(--radius-md)' }} />
                <div className="skeleton" style={{ height: 130, borderRadius: 'var(--radius-md)' }} />
              </div>
              <div className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-md)' }} />
            </div>
          ) : error || !order ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--color-error)',
              }}
            >
              <p style={{ fontWeight: 700 }}>{error || 'Unable to load order details.'}</p>
            </div>
          ) : (
            <>
              {/* Order Status Timeline */}
              <OrderTimeline status={order.status} updatedAt={order.updatedAt} />

              {/* 2-Column Info: Customer & Shop */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: 16,
                }}
              >
                {/* Customer Details Card */}
                <div
                  className="card"
                  style={{
                    padding: 16,
                    backgroundColor: 'var(--color-surface-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      letterSpacing: 0.6,
                      textTransform: 'uppercase',
                      marginBottom: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <User size={13} />
                    CUSTOMER DETAILS
                  </div>

                  <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {order.customerName || 'Customer'}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8, fontSize: 12.5, color: 'var(--color-text-muted)' }}>
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
                      Customer ID: <code style={{ fontSize: 10.5 }}>{order.customerId}</code>
                    </div>
                  </div>
                </div>

                {/* Partner Shop Details Card */}
                <div
                  className="card"
                  style={{
                    padding: 16,
                    backgroundColor: 'var(--color-surface-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      letterSpacing: 0.6,
                      textTransform: 'uppercase',
                      marginBottom: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Store size={13} />
                    PARTNER OUTLET DETAILS
                  </div>

                  <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {order.shopName || 'Partner Shop'}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8, fontSize: 12.5, color: 'var(--color-text-muted)' }}>
                    {order.shopCategory && (
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-main)' }}>
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
                      <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)', marginTop: 2 }}>
                        Owner: <strong>{order.ownerName}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pickup Slot & Payment Summary Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: 16,
                }}
              >
                {/* Pickup Slot Window */}
                <div
                  className="card"
                  style={{
                    padding: 16,
                    backgroundColor: 'var(--color-light-sage)',
                    borderColor: 'var(--color-sage)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--color-primary-deep)',
                      letterSpacing: 0.6,
                      textTransform: 'uppercase',
                      marginBottom: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Clock size={13} />
                    SCHEDULED PICKUP SLOT
                  </div>

                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-main)' }}>
                    {order.pickupSlot
                      ? `${order.pickupSlot.startTime || order.pickupSlot.requestedStartTime || ''} - ${
                          order.pickupSlot.endTime || order.pickupSlot.requestedEndTime || ''
                        }`
                      : 'Counter Express Pickup'}
                  </div>
                  {order.pickupSlot?.pickupDate && (
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 3 }}>
                      Date: {order.pickupSlot.pickupDate}
                    </div>
                  )}
                  {order.pickupSlot?.status && (
                    <div style={{ fontSize: 11, color: 'var(--color-primary-deep)', fontWeight: 600, marginTop: 4 }}>
                      Slot Status: {order.pickupSlot.status}
                    </div>
                  )}
                </div>

                {/* Payment Summary */}
                <div
                  className="card"
                  style={{
                    padding: 16,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--color-text-light)',
                      letterSpacing: 0.6,
                      textTransform: 'uppercase',
                      marginBottom: 8,
                    }}
                  >
                    TOTAL PAID
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: 'var(--color-primary-deep)',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {formatCurrency(order.totalAmount)}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)', marginTop: 4 }}>
                    Total Includes {order.items?.length || 0} order basket item(s)
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div
                className="card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div
                  style={{
                    padding: '12px 18px',
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface-subtle)',
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--color-text-main)',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Ordered Items ({order.items?.length || 0})</span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Prices in INR (₹)</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {order.items?.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      style={{
                        padding: '12px 18px',
                        borderBottom:
                          idx < (order.items?.length || 0) - 1
                            ? '1px solid var(--color-border-subtle)'
                            : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--color-light-sage)',
                            color: 'var(--color-primary-deep)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Package size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text-main)' }}>
                            {item.productName}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                            {item.quantity} × {formatCurrency(item.unitPrice)}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text-main)' }}>
                        {formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Oversight Governance Badge */}
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <ShieldCheck size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  <strong>Admin Monitoring Mode:</strong> Real-time oversight view. Merchant operations and customer status actions are governed by their respective domain rules.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: 'var(--color-surface-subtle)',
          }}
        >
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
