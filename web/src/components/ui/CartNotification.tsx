import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight, RotateCcw, X } from 'lucide-react';
import type { Cart } from '../../types/cart.types';

export interface CartNotificationProps {
  cart: Cart;
  shopName: string;
  onUndo?: () => void;
  onDismiss: () => void;
  isUndoing?: boolean;
}

export const CartNotification: React.FC<CartNotificationProps> = ({
  cart,
  shopName,
  onUndo,
  onDismiss,
  isUndoing = false,
}) => {
  if (!cart || cart.totalItemCount === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="cart-notification-bar"
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: 820,
        backgroundColor: 'var(--color-primary-deep)',
        color: '#FFFFFF',
        padding: '12px 20px',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        zIndex: 100,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        animation: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Left: Cart Icon & Details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(255, 255, 255, 0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0,
          }}
        >
          <ShoppingCart size={20} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 14.5,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {cart.totalItemCount} {cart.totalItemCount === 1 ? 'item' : 'items'} in your basket
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--color-sage)',
              marginTop: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Subtotal: <strong style={{ color: '#FFFFFF', fontSize: 13 }}>₹{Number(cart.subtotal).toFixed(2)}</strong>
            {shopName ? ` • ${shopName}` : ''}
          </div>
        </div>
      </div>

      {/* Right: Actions (Undo, View Cart, Close X) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            disabled={isUndoing}
            aria-label="Undo last cart addition"
            className="cart-notification-undo-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 13px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.16)',
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 600,
              border: '1px solid rgba(255, 255, 255, 0.25)',
              cursor: isUndoing ? 'default' : 'pointer',
              opacity: isUndoing ? 0.7 : 1,
              transition: 'background-color 0.15s ease, transform 0.1s ease',
            }}
          >
            <RotateCcw size={14} />
            <span>{isUndoing ? 'Undoing...' : 'Undo'}</span>
          </button>
        )}

        <Link
          to="/customer/cart"
          aria-label="View Cart"
          style={{ textDecoration: 'none' }}
        >
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 15px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-accent)',
              color: 'var(--color-primary-deep)',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease, transform 0.1s ease',
            }}
          >
            <span>View Cart</span>
            <ArrowRight size={14} />
          </button>
        </Link>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss cart notification"
          title="Dismiss"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'transparent',
            color: 'rgba(255, 255, 255, 0.75)',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            transition: 'color 0.15s ease, background-color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <X size={17} />
        </button>
      </div>
    </div>
  );
};
