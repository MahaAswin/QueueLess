import React from 'react';
import { Trash2, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type { Order } from '../../../types/order.types';
import { formatCurrency, formatOrderId } from '../../../utils/formatters';

interface RemoveOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export const RemoveOrderModal: React.FC<RemoveOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) => {
  if (!isOpen || !order) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: 440,
          maxWidth: '100%',
          boxShadow: 'var(--shadow-xl)',
          padding: 24,
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-error-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-error)',
            }}
          >
            <Trash2 size={22} />
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-light)',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px 0', color: 'var(--color-text-main)' }}>
          Remove this order?
        </h3>

        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
          This will remove the order from your order history. This action cannot be undone.
        </p>

        {/* Order Details Preview Box */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
            padding: '12px 14px',
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-main)' }}>
              {formatOrderId(order.id)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
              {order.shopName || 'Store Outlet'}
            </div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-primary-deep)' }}>
            {formatCurrency(order.totalAmount)}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="outline" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={onConfirm}
            isLoading={loading}
            icon={<Trash2 size={16} />}
          >
            Remove Order
          </Button>
        </div>
      </div>
    </div>
  );
};
