import React from 'react';
import { X, QrCode, Store, Calendar } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type { Order } from '../../../types/order.types';
import type { PickupQrResponse } from '../../../types/slot.types';
import { formatOrderId } from '../../../utils/formatters';

interface OrderPickupPassProps {
  order: Order;
  qrData?: PickupQrResponse | null;
  onClose: () => void;
}

export const OrderPickupPass: React.FC<OrderPickupPassProps> = ({
  order,
  qrData,
  onClose,
}) => {
  const referenceCode = qrData?.verificationCode || formatOrderId(order.id).replace('#', '');
  const slotDisplay = order.pickupSlot
    ? `${order.pickupSlot.startTime || ''} – ${order.pickupSlot.endTime || ''}`
    : 'Ready upon merchant notification';

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
          maxWidth: 420,
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
          <QrCode size={32} />
        </div>

        <h3
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: 'var(--color-text-main)',
            marginBottom: 4,
            fontFamily: 'var(--font-heading)',
          }}
        >
          Zero-Wait Pickup Pass
        </h3>

        <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, marginBottom: 20, lineHeight: 1.4 }}>
          Present this verification reference at <strong>{order.shopName || 'the shop'}</strong> counter for immediate pickup.
        </p>

        {/* Verification Code Box */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-subtle)',
            padding: '20px 16px',
            borderRadius: 'var(--radius-lg)',
            border: '2px dashed var(--color-sage)',
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-text-light)', letterSpacing: 1.2 }}>
            EXPRESS PICKUP TOKEN
          </div>
          <div
            style={{
              fontSize: 28,
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              color: 'var(--color-primary-deep)',
              letterSpacing: 3,
              marginTop: 4,
            }}
          >
            {referenceCode}
          </div>
        </div>

        {/* Shop and Slot Meta */}
        <div
          style={{
            backgroundColor: 'var(--color-light-sage)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: 24,
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <Store size={15} color="var(--color-primary)" />
            <span style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>
              {order.shopName || 'Partner Shop'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--color-text-muted)' }}>
            <Calendar size={15} color="var(--color-primary)" />
            <span>Pickup Slot: {slotDisplay}</span>
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
