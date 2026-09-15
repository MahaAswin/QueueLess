import React from 'react';
import { ArrowRight, Clock, ShieldCheck, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
  isCheckingOut: boolean;
  onProceedToCheckout: () => void;
  onClearCart?: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  itemCount,
  isCheckingOut,
  onProceedToCheckout,
  onClearCart,
}) => {
  const formattedSubtotal = Number(subtotal || 0).toFixed(2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
            fontSize: 18,
            fontWeight: 800,
            color: 'var(--color-text-main)',
            marginBottom: 18,
            fontFamily: 'var(--font-heading)',
          }}
        >
          Order Summary
        </h3>

        {/* Pricing Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 14,
            }}
          >
            <span style={{ color: 'var(--color-text-muted)' }}>
              Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
              ₹{formattedSubtotal}
            </span>
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
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-main)' }}>
              Total
            </span>
            <span
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: 'var(--color-primary-deep)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              ₹{formattedSubtotal}
            </span>
          </div>
        </div>

        {/* Pickup Reassurance Banner */}
        <div
          style={{
            backgroundColor: 'var(--color-primary-subtle)',
            border: '1px solid var(--color-sage)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 12.5,
            color: 'var(--color-primary-deep)',
            marginBottom: 20,
          }}
        >
          <Clock size={18} style={{ flexShrink: 0 }} />
          <span>Zero-Wait Guarantee: Your items will be freshly prepared for scheduled express pickup.</span>
        </div>

        {/* Primary Checkout CTA */}
        <Button
          variant="primary"
          size="lg"
          style={{ width: '100%', justifyContent: 'center' }}
          isLoading={isCheckingOut}
          onClick={onProceedToCheckout}
          icon={<ArrowRight size={18} />}
        >
          Proceed to Checkout
        </Button>

        {/* Clear Cart Option */}
        {onClearCart && (
          <button
            type="button"
            onClick={onClearCart}
            style={{
              width: '100%',
              marginTop: 12,
              padding: '8px 0',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--color-text-muted)',
              fontSize: 12.5,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-error)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-muted)';
            }}
          >
            <Trash2 size={13} />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {/* Trust Badge Card */}
      <div
        className="card"
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          backgroundColor: 'var(--color-surface-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <ShieldCheck size={22} color="var(--color-primary)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
          Secure express pickup verification with instant QR validation at merchant counter.
        </div>
      </div>
    </div>
  );
};
