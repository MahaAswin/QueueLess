import React from 'react';
import { ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type { TimeSlotOption } from '../../../types/slot.types';

interface CheckoutSummaryProps {
  subtotal: number;
  itemCount: number;
  selectedDate: string;
  selectedSlot: TimeSlotOption | null;
  isSubmitting: boolean;
  onConfirmOrder: () => void;
}

export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  subtotal,
  itemCount,
  selectedDate,
  selectedSlot,
  isSubmitting,
  onConfirmOrder,
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

        {/* Selected Slot Recap */}
        {selectedSlot ? (
          <div
            style={{
              backgroundColor: 'var(--color-primary-subtle)',
              border: '1px solid var(--color-sage)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              marginBottom: 18,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: 'var(--color-primary-deep)', textTransform: 'uppercase' }}>
              <Clock size={13} />
              <span>Scheduled Pickup</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-main)', marginTop: 4 }}>
              {selectedSlot.displayLabel}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
              Date: {selectedDate}
            </div>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: 'var(--color-warning-bg)',
              border: '1px solid var(--color-warning-border)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: 12.5,
              color: '#92400E',
              marginBottom: 18,
            }}
          >
            Please select a pickup time slot from the schedule on the left.
          </div>
        )}

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
              Items Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
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
              Total Amount
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

        {/* Submit Button */}
        <Button
          variant="primary"
          size="lg"
          style={{ width: '100%', justifyContent: 'center' }}
          isLoading={isSubmitting}
          disabled={isSubmitting || !selectedSlot}
          onClick={onConfirmOrder}
          icon={<ArrowRight size={18} />}
        >
          {isSubmitting ? 'Placing Order...' : 'Confirm Order & Pickup'}
        </Button>

        <div
          style={{
            fontSize: 11.5,
            color: 'var(--color-text-light)',
            textAlign: 'center',
            marginTop: 12,
            lineHeight: 1.4,
          }}
        >
          By confirming, your order will be sent to the merchant for express zero-wait preparation.
        </div>
      </div>

      {/* Trust Badge */}
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
          Instant order verification pass with QR code generated upon confirmation.
        </div>
      </div>
    </div>
  );
};
