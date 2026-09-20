import React from 'react';
import { X, KeyRound, Store, Calendar, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { Order } from '../../../types/order.types';
import {
  formatOrderId,
  formatSlotWindow,
  formatSlotDate,
  getOrderStatusMeta,
} from '../../../utils/formatters';
import { usePickupOtp } from './usePickupOtp';

interface OrderPickupPassProps {
  order: Order;
  onClose: () => void;
}

export const OrderPickupPass: React.FC<OrderPickupPassProps> = ({
  order,
  onClose,
}) => {
  const isReady = order.status === 'READY_FOR_PICKUP';
  const { otpData, loading, error, timeLeft, isExpired, refetchOtp } = usePickupOtp(
    order.id,
    isReady
  );

  const meta = getOrderStatusMeta(order.status);
  const slotDisplay = formatSlotWindow(order.pickupSlot);
  const slotDate = formatSlotDate(order.pickupSlot);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        zIndex: 100,
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: 440,
          width: '100%',
          textAlign: 'center',
          padding: '32px 24px',
          position: 'relative',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          backgroundColor: 'var(--color-surface)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close Pickup Pass"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            padding: 6,
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <X size={20} />
        </button>

        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary-subtle)',
            color: 'var(--color-primary-deep)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <KeyRound size={30} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: 'var(--color-text-main)',
              fontFamily: 'var(--font-heading)',
              margin: 0,
            }}
          >
            Pickup Verification
          </h3>
        </div>

        <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, marginBottom: 18, lineHeight: 1.4 }}>
          Share this OTP with the Shop Owner to collect your order.
        </p>

        {/* OTP Presentation Box */}
        {isReady ? (
          <div
            style={{
              backgroundColor: isExpired ? 'var(--color-error-bg)' : 'var(--color-surface-subtle)',
              padding: '20px 16px',
              borderRadius: 'var(--radius-lg)',
              border: `2px dashed ${isExpired ? 'var(--color-error)' : 'var(--color-sage)'}`,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: isExpired ? 'var(--color-error)' : 'var(--color-text-light)',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
              }}
            >
              Your Pickup OTP
            </div>

            {loading ? (
              <div style={{ padding: '16px 0', fontSize: 16, color: 'var(--color-text-muted)' }}>
                Generating secure OTP...
              </div>
            ) : error ? (
              <div style={{ padding: '10px 0', color: 'var(--color-error)', fontSize: 13 }}>
                <AlertCircle size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 4 }} />
                {error}
              </div>
            ) : (
              <>
                <div
                  style={{
                    fontSize: 34,
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    color: isExpired ? 'var(--color-text-light)' : 'var(--color-primary-deep)',
                    letterSpacing: 8,
                    marginTop: 6,
                    marginBottom: 6,
                    textDecoration: isExpired ? 'line-through' : 'none',
                  }}
                >
                  {otpData?.otp || '------'}
                </div>

                {/* Expiration Info */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: isExpired ? 'var(--color-error)' : 'var(--color-text-muted)',
                  }}
                >
                  <Clock size={14} />
                  <span>
                    {isExpired ? 'OTP Expired' : timeLeft ? `Valid for ${timeLeft}` : 'Active'}
                  </span>

                  {isExpired && (
                    <button
                      type="button"
                      onClick={() => refetchOtp()}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        marginLeft: 6,
                        textDecoration: 'underline',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <RefreshCw size={12} /> Regenerate
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div
            style={{
              backgroundColor: 'var(--color-surface-subtle)',
              padding: '16px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              marginBottom: 18,
              fontSize: 13,
              color: 'var(--color-text-muted)',
            }}
          >
            Pickup OTP will become available once your order status is marked <strong>Ready for Pickup</strong>.
          </div>
        )}

        {/* Order and Shop Meta */}
        <div
          style={{
            backgroundColor: 'var(--color-light-sage)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: 20,
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Store size={15} color="var(--color-primary)" />
              <span style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>
                {order.shopName || otpData?.shopName || 'Partner Shop'}
              </span>
            </div>
            <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--color-text-muted)' }}>
            <span>Order Reference: <strong>{formatOrderId(order.id)}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--color-text-muted)' }}>
            <Calendar size={14} color="var(--color-primary)" />
            <span>Pickup Slot: {slotDisplay}{slotDate ? ` (${slotDate})` : ''}</span>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={onClose}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Done
        </Button>
      </div>
    </div>
  );
};
