import React from 'react';
import { usePickupOtpVerification } from './hooks/usePickupOtpVerification';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  Mail,
  Package,
  Clock,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  formatCurrency,
  formatOrderId,
  formatTimeLabel,
} from '../../utils/formatters';

export const ShopPickupVerificationPage: React.FC = () => {
  const {
    otp,
    setOtp,
    loading,
    error,
    verifiedOrder,
    completeSuccess,
    handleVerifyAndHandover,
    reset,
  } = usePickupOtpVerification();

  const slotStart =
    verifiedOrder?.pickupSlot?.finalStartTime ||
    verifiedOrder?.pickupSlot?.requestedStartTime;
  const slotEnd =
    verifiedOrder?.pickupSlot?.finalEndTime ||
    verifiedOrder?.pickupSlot?.requestedEndTime;
  const slotFormatted =
    slotStart && slotEnd
      ? `${formatTimeLabel(slotStart)} – ${formatTimeLabel(slotEnd)}`
      : 'Standard Pickup Window';
  const slotDate =
    verifiedOrder?.pickupSlot?.finalPickupDate ||
    verifiedOrder?.pickupSlot?.pickupDate;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px 0 32px' }}>
      {/* Top Banner Header */}
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--color-primary-subtle)',
            color: 'var(--color-primary-deep)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <KeyRound size={30} />
        </div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            margin: '0 0 8px 0',
            fontFamily: 'var(--font-heading)',
            color: 'var(--color-text-main)',
          }}
        >
          Customer Order Pickup Verification
        </h1>
        <p
          style={{
            color: 'var(--color-text-muted)',
            fontSize: 14.5,
            maxWidth: 520,
            margin: '0 auto',
            lineHeight: 1.5,
          }}
        >
          Enter the customer&apos;s 6-digit pickup OTP to securely hand over their order.
        </p>
      </div>

      {/* OTP ENTRY FORM (Active when no order verified yet) */}
      {!completeSuccess && (
        <div
          className="card"
          style={{
            padding: '36px 28px',
            boxShadow: 'var(--shadow-md)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <form onSubmit={handleVerifyAndHandover}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <label
                htmlFor="pickup-otp-input"
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: 'var(--color-text-main)',
                  display: 'block',
                  marginBottom: 12,
                }}
              >
                Pickup OTP
              </label>

              {/* 6-Digit Numeric OTP Input */}
              <div
                style={{
                  maxWidth: 320,
                  margin: '0 auto',
                  position: 'relative',
                }}
              >
                <input
                  id="pickup-otp-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoFocus
                  required
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    fontSize: 32,
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    letterSpacing: 14,
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-lg)',
                    border: '2px solid var(--color-primary)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-main)',
                    outline: 'none',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: 'var(--color-text-muted)',
                  marginTop: 10,
                }}
              >
                Enter the 6-digit OTP shared by the customer.
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="card"
                style={{
                  borderLeft: '4px solid var(--color-error)',
                  backgroundColor: 'var(--color-error-bg)',
                  marginBottom: 24,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  textAlign: 'left',
                }}
              >
                <AlertCircle size={20} color="var(--color-error)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13.5, color: 'var(--color-error)', fontWeight: 600 }}>
                  {error}
                </span>
              </div>
            )}

            {/* Submit Verification Button */}
            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={loading || otp.length !== 6}
              style={{ width: '100%', justifyContent: 'center', height: 48, fontSize: 15 }}
              icon={<Check size={18} />}
            >
              {loading ? 'Verifying & Handing Over...' : '✓ Verify & Handover Order'}
            </Button>
          </form>
        </div>
      )}

      {/* SUCCESSFUL HANDOVER DETAILS */}
      {completeSuccess && verifiedOrder && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Success Banner */}
          <div
            className="card"
            style={{
              borderLeft: '4px solid var(--color-success)',
              backgroundColor: 'var(--color-light-sage)',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
            }}
          >
            <CheckCircle2
              size={28}
              color="var(--color-success)"
              style={{ flexShrink: 0, marginTop: 2 }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: 'var(--color-primary-deep)',
                    margin: 0,
                  }}
                >
                  Order Verified Successfully!
                </h3>
                <Badge variant="success">COLLECTED</Badge>
              </div>
              <p
                style={{
                  fontSize: 13.5,
                  color: 'var(--color-text-muted)',
                  margin: '6px 0 0 0',
                }}
              >
                Order verified successfully. The order has been handed over to the customer.
              </p>
            </div>
          </div>

          {/* Customer & Pickup Meta Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {/* Customer Details */}
            <div className="card" style={{ padding: 18 }}>
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
                CUSTOMER DETAILS
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-primary-subtle)',
                    color: 'var(--color-primary-deep)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-main)' }}>
                    {verifiedOrder.customer.fullName}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    QueueLess Customer
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  fontSize: 12.5,
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)' }}>
                  <Phone size={14} color="var(--color-primary)" />
                  <span>Phone: <strong>{verifiedOrder.customer.phone || 'Not provided'}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)' }}>
                  <Mail size={14} color="var(--color-primary)" />
                  <span>Email: <strong>{verifiedOrder.customer.email}</strong></span>
                </div>
              </div>
            </div>

            {/* Pickup Details */}
            <div className="card" style={{ padding: 18, backgroundColor: 'var(--color-light-sage)' }}>
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
                PICKUP DETAILS
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Clock size={16} color="var(--color-primary-deep)" />
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-primary-deep)' }}>
                  {slotFormatted}
                </div>
              </div>

              {slotDate && (
                <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                  Date: <strong>{slotDate}</strong>
                </div>
              )}

              <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>
                Order Ref: <strong>{formatOrderId(verifiedOrder.orderId)}</strong>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 4 }}>
                Shop: <strong>{verifiedOrder.shopName}</strong>
              </div>
            </div>
          </div>

          {/* Basket Items Card */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-subtle)',
                fontWeight: 700,
                fontSize: 13.5,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Order Items ({verifiedOrder.items?.length || 0})</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Prices in INR (₹)</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {verifiedOrder.items?.map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    padding: '12px 18px',
                    borderBottom:
                      idx < (verifiedOrder.items?.length || 0) - 1
                        ? '1px solid var(--color-border-subtle)'
                        : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Package size={16} color="var(--color-primary)" />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{item.productName}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>
                    {formatCurrency(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                padding: '14px 18px',
                backgroundColor: 'var(--color-surface-subtle)',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <span style={{ fontSize: 14.5, fontWeight: 700 }}>Total Order Amount</span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: 'var(--color-primary-deep)',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {formatCurrency(verifiedOrder.totalAmount)}
              </span>
            </div>
          </div>

          {/* Action to Verify Another Order */}
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <Button
              variant="primary"
              size="lg"
              onClick={reset}
              icon={<RotateCcw size={18} />}
              style={{ minWidth: 240 }}
            >
              Verify Next Customer Order
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
