import React, { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Store,
  Clock,
  KeyRound,
  ShieldCheck,
  RotateCcw,
  Package,
  CheckCircle2,
  AlertTriangle,
  Check,
  X,
  Calendar,
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
  formatDateShort,
  formatTimeLabel,
  formatSlotWindow,
  formatSlotDate,
  getOrderStatusMeta,
} from '../../utils/formatters';
import { SLOT_STATUS_META } from '../../types/slot.types';

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
    loading,
    error,
    cancelling,
    reordering,
    proposalLoading,
    showQRModal,
    setShowQRModal,
    handleAcceptProposal,
    handleRejectProposal,
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
  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';
  const canReorder =
    order.status === 'COLLECTED' ||
    order.status === 'COMPLETED' ||
    order.status === 'CANCELLED' ||
    order.status === 'REJECTED';

  const isSlotCounterProposed = order.pickupSlot?.status === 'COUNTER_PROPOSED';
  const isSlotConfirmed =
    order.pickupSlot?.status === 'ACCEPTED' ||
    order.pickupSlot?.status === 'CUSTOMER_ACCEPTED';
  const slotStatusMeta = order.pickupSlot?.status
    ? SLOT_STATUS_META[order.pickupSlot.status as keyof typeof SLOT_STATUS_META]
    : null;

  const slotDisplay = formatSlotWindow(order.pickupSlot);
  const slotDateDisplay = formatSlotDate(order.pickupSlot);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* OTP Pickup Modal */}
      {showQRModal && (
        <OrderPickupPass
          order={order}
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
          {order.status === 'READY_FOR_PICKUP' && (
            <Button
              variant="primary"
              size="md"
              icon={<KeyRound size={16} />}
              onClick={() => setShowQRModal(true)}
              style={{ backgroundColor: '#0D5C3A' }}
            >
              Show Pickup OTP
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

      {/* Counter-Proposal Alert Banner */}
      {isSlotCounterProposed && (
        <div
          className="card"
          style={{
            padding: '20px 24px',
            backgroundColor: '#FEF3C7',
            borderColor: '#F59E0B',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#FDE68A',
                color: '#B45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={22} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#92400E', margin: 0 }}>
                  Merchant Proposed a New Pickup Slot
                </h3>
                <Badge variant="warning">Action Required</Badge>
              </div>

              <p style={{ color: '#78350F', fontSize: 14, marginTop: 6, marginBottom: 12, lineHeight: 1.5 }}>
                The shop owner reviewed your order and proposed an adjusted pickup window for optimal preparation:
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 12,
                  backgroundColor: '#FFFFFF',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #FCD34D',
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#92400E', textTransform: 'uppercase' }}>
                    PROPOSED PICKUP TIME
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1E293B', marginTop: 2 }}>
                    {order.pickupSlot?.proposedStartTime && order.pickupSlot?.proposedEndTime
                      ? `${formatTimeLabel(order.pickupSlot.proposedStartTime)} – ${formatTimeLabel(order.pickupSlot.proposedEndTime)}`
                      : 'Proposed Time'}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>
                    Date:{' '}
                    <strong>
                      {order.pickupSlot?.proposedDate
                        ? formatDateShort(order.pickupSlot.proposedDate)
                        : slotDateDisplay || 'Today'}
                    </strong>
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    ORIGINAL REQUEST
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#64748B', marginTop: 2, textDecoration: 'line-through' }}>
                    {order.pickupSlot?.requestedStartTime && order.pickupSlot?.requestedEndTime
                      ? `${formatTimeLabel(order.pickupSlot.requestedStartTime)} – ${formatTimeLabel(order.pickupSlot.requestedEndTime)}`
                      : 'Original Request'}
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                    Date: {order.pickupSlot?.pickupDate ? formatDateShort(order.pickupSlot.pickupDate) : 'Today'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
              borderTop: '1px solid #FDE68A',
              paddingTop: 12,
            }}
          >
            <Button
              variant="danger"
              size="md"
              disabled={proposalLoading}
              onClick={handleRejectProposal}
              icon={<X size={16} />}
            >
              Decline Proposal
            </Button>
            <Button
              variant="primary"
              size="md"
              isLoading={proposalLoading}
              onClick={handleAcceptProposal}
              icon={<Check size={16} />}
              style={{ backgroundColor: '#0D5C3A' }}
            >
              Accept Proposed Time
            </Button>
          </div>
        </div>
      )}

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
              backgroundColor: isSlotCounterProposed
                ? '#FEF3C7'
                : 'var(--color-light-sage)',
              borderColor: isSlotCounterProposed
                ? '#F59E0B'
                : 'var(--color-sage)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock
                  size={18}
                  color={isSlotCounterProposed ? '#B45309' : 'var(--color-primary-deep)'}
                />
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: isSlotCounterProposed ? '#92400E' : 'var(--color-primary-deep)',
                  }}
                >
                  Pickup Slot
                </div>
              </div>

              {slotStatusMeta && (
                <Badge variant={slotStatusMeta.variant}>{slotStatusMeta.label}</Badge>
              )}
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--color-text-light)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>{isSlotConfirmed ? 'CONFIRMED WINDOW' : isSlotCounterProposed ? 'PROPOSED WINDOW' : 'REQUESTED WINDOW'}</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-main)', marginTop: 4 }}>
                {slotDisplay}
              </div>
              {slotDateDisplay && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  <Calendar size={13} />
                  <span>Date: <strong>{slotDateDisplay}</strong></span>
                </div>
              )}
            </div>

            {isSlotCounterProposed ? (
              <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                <Button
                  variant="primary"
                  size="sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                  isLoading={proposalLoading}
                  onClick={handleAcceptProposal}
                  icon={<Check size={14} />}
                >
                  Accept Slot
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={proposalLoading}
                  onClick={handleRejectProposal}
                  icon={<X size={14} />}
                >
                  Decline
                </Button>
              </div>
            ) : order.status === 'READY_FOR_PICKUP' ? (
              <Button
                variant="primary"
                size="md"
                style={{ width: '100%', justifyContent: 'center', backgroundColor: '#0D5C3A' }}
                icon={<KeyRound size={16} />}
                onClick={() => setShowQRModal(true)}
              >
                Show Pickup OTP
              </Button>
            ) : order.status === 'COLLECTED' || order.status === 'COMPLETED' ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '10px 14px',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--color-success)',
                  border: '1px solid var(--color-border)',
                }}
              >
                ✓ Order Collected • OTP Completed
              </div>
            ) : (
              <Button
                variant="outline"
                size="md"
                disabled={true}
                style={{ width: '100%', justifyContent: 'center', opacity: 0.7, cursor: 'not-allowed' }}
                icon={<KeyRound size={16} />}
                title="Pickup OTP will become available once your order is marked Ready for Pickup"
              >
                OTP Available When Ready
              </Button>
            )}
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
