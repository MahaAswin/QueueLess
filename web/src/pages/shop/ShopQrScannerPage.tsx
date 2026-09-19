import React, { useState } from 'react';
import { usePickupOtpVerification } from './hooks/usePickupOtpVerification';
import { pickupService } from '../../services/pickupService';
import type { PickupVerificationResponse } from '../../types/slot.types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  QrCode,
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
  formatDateLong,
  formatTimeLabel,
} from '../../utils/formatters';

export const ShopQrScannerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'otp' | 'qr'>('otp');

  // OTP Verification Hook
  const {
    otp,
    setOtp,
    loading: otpLoading,
    error: otpError,
    verifiedOrder,
    completing,
    completeError,
    completeSuccess,
    handleVerify: handleVerifyOtp,
    handleComplete,
    reset: resetOtpVerification,
  } = usePickupOtpVerification();

  // QR Token State
  const [qrTokenInput, setQrTokenInput] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [qrResult, setQrResult] = useState<PickupVerificationResponse | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);

  const handleVerifyQr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrTokenInput.trim()) return;

    setQrLoading(true);
    setQrError(null);
    setQrResult(null);

    try {
      const res = await pickupService.verifyPickup({ pickupToken: qrTokenInput.trim() });
      setQrResult(res);
      setQrTokenInput('');
    } catch (err: any) {
      setQrError(
        err?.response?.data?.message ||
          'Failed to verify pickup token. Token may be invalid, expired, or already used.'
      );
    } finally {
      setQrLoading(false);
    }
  };

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
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--color-primary-subtle)',
            color: 'var(--color-primary-deep)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          <KeyRound size={28} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', fontFamily: 'var(--font-heading)' }}>
          Customer Order Pickup Verification
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: 0 }}>
          Verify the customer&apos;s short pickup OTP or express pass to securely hand over their order.
        </p>
      </div>

      {/* Mode Switch Tabs */}
      <div
        style={{
          display: 'flex',
          backgroundColor: 'var(--color-surface-subtle)',
          padding: 4,
          borderRadius: 'var(--radius-lg)',
          marginBottom: 24,
          border: '1px solid var(--color-border)',
        }}
      >
        <button
          type="button"
          onClick={() => {
            setActiveTab('otp');
          }}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'otp' ? 'var(--color-surface)' : 'transparent',
            color: activeTab === 'otp' ? 'var(--color-primary-deep)' : 'var(--color-text-muted)',
            boxShadow: activeTab === 'otp' ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <KeyRound size={16} />
          <span>Pickup OTP Verification</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('qr');
          }}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'qr' ? 'var(--color-surface)' : 'transparent',
            color: activeTab === 'qr' ? 'var(--color-primary-deep)' : 'var(--color-text-muted)',
            boxShadow: activeTab === 'qr' ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <QrCode size={16} />
          <span>QR Token Payload</span>
        </button>
      </div>

      {/* TAB 1: OTP VERIFICATION */}
      {activeTab === 'otp' && (
        <>
          {/* OTP Entry Card (shown when no order verified yet or when starting fresh) */}
          {!verifiedOrder && !completeSuccess && (
            <div className="card" style={{ marginBottom: 24, padding: '32px 24px' }}>
              <form onSubmit={handleVerifyOtp}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <label
                    htmlFor="otp-input"
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: 'var(--color-text-main)',
                      display: 'block',
                      marginBottom: 8,
                    }}
                  >
                    Enter Customer Pickup OTP
                  </label>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, margin: '0 0 20px 0' }}>
                    Ask the customer for their 6-digit pickup code shown on their order screen.
                  </p>

                  {/* 6-Digit Numeric Input Display */}
                  <div
                    style={{
                      maxWidth: 320,
                      margin: '0 auto',
                      position: 'relative',
                    }}
                  >
                    <input
                      id="otp-input"
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
                      }}
                    />
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 8 }}>
                    Must be exactly 6 numeric digits
                  </div>
                </div>

                {otpError && (
                  <div
                    className="card"
                    style={{
                      borderLeft: '4px solid var(--color-error)',
                      backgroundColor: 'var(--color-error-bg)',
                      marginBottom: 20,
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      textAlign: 'left',
                    }}
                  >
                    <AlertCircle size={20} color="var(--color-error)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13.5, color: 'var(--color-error)', fontWeight: 600 }}>
                      {otpError}
                    </span>
                  </div>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  disabled={otpLoading || otp.length !== 6}
                  style={{ width: '100%', justifyContent: 'center' }}
                  icon={<KeyRound size={18} />}
                >
                  {otpLoading ? 'Verifying OTP...' : 'Verify OTP'}
                </Button>
              </form>
            </div>
          )}

          {/* VERIFIED ORDER DETAILS & ORDER COMPLETION CONFIRMATION */}
          {verifiedOrder && !completeSuccess && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
              {/* Verification Success Alert */}
              <div
                className="card"
                style={{
                  borderLeft: '4px solid var(--color-success)',
                  backgroundColor: 'var(--color-light-sage)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <CheckCircle2 size={24} color="var(--color-success)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary-deep)', margin: 0 }}>
                      OTP Verified Successfully
                    </h3>
                    <Badge variant="success">READY FOR PICKUP</Badge>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
                    Please check the customer and basket details below before confirming physical handover.
                  </p>
                </div>
              </div>

              {/* Customer and Order Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                {/* Customer Details */}
                <div className="card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-primary-deep)', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 12 }}>
                    CUSTOMER DETAILS
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
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
                        fontWeight: 800,
                        fontSize: 16,
                      }}
                    >
                      <User size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-main)' }}>
                        {verifiedOrder.customer.fullName}
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>
                        Registered QueueLess Customer
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)' }}>
                      <Phone size={15} color="var(--color-primary)" />
                      <span>Phone: <strong>{verifiedOrder.customer.phone || 'Not provided'}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)' }}>
                      <Mail size={15} color="var(--color-primary)" />
                      <span>Email: <strong>{verifiedOrder.customer.email}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Pickup Slot & Order Meta */}
                <div className="card" style={{ padding: 20, backgroundColor: 'var(--color-light-sage)' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-primary-deep)', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 12 }}>
                    PICKUP DETAILS
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Clock size={18} color="var(--color-primary-deep)" />
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-primary-deep)' }}>
                      {slotFormatted}
                    </div>
                  </div>

                  {slotDate && (
                    <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                      Date: <strong>{slotDate}</strong>
                    </div>
                  )}

                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    Order Ref: <strong>{formatOrderId(verifiedOrder.orderId)}</strong>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
                    Shop: <strong>{verifiedOrder.shopName}</strong>
                  </div>
                </div>
              </div>

              {/* Basket Items Card */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface-subtle)',
                    fontWeight: 700,
                    fontSize: 14,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Order Items ({verifiedOrder.items?.length || 0})</span>
                  <span style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>Prices in INR (₹)</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {verifiedOrder.items?.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      style={{
                        padding: '14px 20px',
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
                        <Package size={18} color="var(--color-primary)" />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{item.productName}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                            {item.quantity} × {formatCurrency(item.unitPrice)}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: 14.5, fontWeight: 800 }}>
                        {formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    padding: '16px 20px',
                    backgroundColor: 'var(--color-surface-subtle)',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 700 }}>Total Order Amount</span>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: 'var(--color-primary-deep)',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {formatCurrency(verifiedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              {completeError && (
                <div
                  className="card"
                  style={{
                    borderLeft: '4px solid var(--color-error)',
                    backgroundColor: 'var(--color-error-bg)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <AlertCircle size={20} color="var(--color-error)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, color: 'var(--color-error)', fontWeight: 600 }}>
                    {completeError}
                  </span>
                </div>
              )}

              {/* Handover & Mark Order Completed Action */}
              <div
                className="card"
                style={{
                  padding: 24,
                  backgroundColor: 'var(--color-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  textAlign: 'center',
                }}
              >
                <h4 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>
                  Confirm Order Handover
                </h4>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, margin: 0 }}>
                  Hand the items to the customer and click below to finalize the order.
                </p>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={resetOtpVerification}
                    disabled={completing}
                  >
                    Cancel / Back
                  </Button>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleComplete}
                    disabled={completing}
                    icon={<Check size={18} />}
                  >
                    {completing ? 'Completing Order...' : 'Mark Order Completed'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Completion Success State */}
          {completeSuccess && (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '40px 24px',
                marginBottom: 24,
                backgroundColor: 'var(--color-light-sage)',
                borderColor: 'var(--color-sage)',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-success)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-primary-deep)', marginBottom: 8 }}>
                Order Completed Successfully!
              </h2>

              <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 24 }}>
                The order status is now updated to <strong>COLLECTED</strong> and the customer has been notified.
              </p>

              <Button
                variant="primary"
                size="lg"
                onClick={resetOtpVerification}
                icon={<RotateCcw size={18} />}
              >
                Verify Next Customer Order
              </Button>
            </div>
          )}
        </>
      )}

      {/* TAB 2: QR TOKEN SCANNER */}
      {activeTab === 'qr' && (
        <>
          <div className="card" style={{ marginBottom: 24 }}>
            <form onSubmit={handleVerifyQr}>
              <div className="form-group">
                <label className="form-label">Pickup Token String / QR Payload</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. QLP:a8b3f12..."
                  value={qrTokenInput}
                  onChange={(e) => setQrTokenInput(e.target.value)}
                  className="form-input"
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 14,
                    padding: '12px 14px',
                  }}
                  autoFocus
                />
                <span style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 4, display: 'block' }}>
                  Format begins with <code style={{ fontSize: 11 }}>QLP:</code>
                </span>
              </div>

              <Button
                variant="primary"
                size="lg"
                type="submit"
                disabled={qrLoading || !qrTokenInput.trim()}
                style={{ width: '100%', marginTop: 8 }}
                icon={<CheckCircle2 size={18} />}
              >
                {qrLoading ? 'Verifying...' : 'Verify & Handover Order'}
              </Button>
            </form>
          </div>

          {/* Success Result */}
          {qrResult && (
            <div
              className="card"
              style={{
                borderLeft: '4px solid var(--color-success)',
                backgroundColor: 'var(--color-light-sage)',
                marginBottom: 24,
              }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <CheckCircle2 size={28} color="var(--color-success)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-primary-deep)', margin: '0 0 4px 0' }}>
                    Pickup Successfully Verified!
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 10px 0' }}>
                    {qrResult.message}
                  </p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 12.5 }}>
                    <span>Order ID: <strong>#{qrResult.orderId.slice(0, 8)}</strong></span>
                    <span>•</span>
                    <span>Status: <Badge variant="success">{qrResult.status}</Badge></span>
                    {qrResult.collectedAt && (
                      <>
                        <span>•</span>
                        <span>Collected: {formatDateLong(qrResult.collectedAt)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Result */}
          {qrError && (
            <div
              className="card"
              style={{
                borderLeft: '4px solid var(--color-error)',
                backgroundColor: 'var(--color-error-bg)',
                marginBottom: 24,
              }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <AlertCircle size={24} color="var(--color-error)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-error)', margin: '0 0 4px 0' }}>
                    Verification Failed
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
                    {qrError}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
