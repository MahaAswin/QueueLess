import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantityControlProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  disabled?: boolean;
  min?: number;
}

export const QuantityControl: React.FC<QuantityControlProps> = ({
  quantity,
  onDecrease,
  onIncrease,
  disabled = false,
  min = 1,
}) => {
  const isMin = quantity <= min;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: 'var(--color-surface-subtle)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        padding: '2px',
      }}
      role="group"
      aria-label="Quantity selector"
    >
      <button
        type="button"
        onClick={onDecrease}
        disabled={disabled || isMin}
        aria-label="Decrease quantity"
        title={isMin ? 'Minimum quantity is 1' : 'Decrease quantity'}
        style={{
          width: 30,
          height: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          backgroundColor: 'transparent',
          color: isMin ? 'var(--color-text-light)' : 'var(--color-text-main)',
          cursor: isMin || disabled ? 'not-allowed' : 'pointer',
          transition: 'all var(--transition-fast)',
        }}
      >
        <Minus size={14} />
      </button>

      <span
        style={{
          minWidth: 32,
          textAlign: 'center',
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--color-text-main)',
          userSelect: 'none',
        }}
        aria-live="polite"
      >
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled}
        aria-label="Increase quantity"
        title="Increase quantity"
        style={{
          width: 30,
          height: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          backgroundColor: 'transparent',
          color: disabled ? 'var(--color-text-light)' : 'var(--color-text-main)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all var(--transition-fast)',
        }}
      >
        <Plus size={14} />
      </button>
    </div>
  );
};
