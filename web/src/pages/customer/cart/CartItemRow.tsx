import React, { useState } from 'react';
import { Trash2, Store, Package } from 'lucide-react';
import type { CartItem } from '../../../types/cart.types';
import { QuantityControl } from './QuantityControl';

interface CartItemRowProps {
  item: CartItem;
  shopName?: string;
  isUpdating: boolean;
  onUpdateQuantity: (newQty: number) => void;
  onRemove: () => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  shopName,
  isUpdating,
  onUpdateQuantity,
  onRemove,
}) => {
  const [imageError, setImageError] = useState(false);

  const displayShopName = item.shopName || shopName || 'Partner Shop';
  const unitPrice = typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0;
  const itemSubtotal = typeof item.subtotal === 'number'
    ? item.subtotal
    : unitPrice * item.quantity;

  return (
    <div
      style={{
        padding: '18px 20px',
        borderBottom: '1px solid var(--color-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        opacity: isUpdating ? 0.6 : 1,
        transition: 'opacity var(--transition-fast)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      {/* Left side: Image & Details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: '1 1 240px', minWidth: 200 }}>
        {/* Product Image */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            backgroundColor: 'var(--color-light-sage)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {item.imageUrl && !imageError ? (
            <img
              src={item.imageUrl}
              alt={item.productName}
              onError={() => setImageError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <Package size={24} color="var(--color-primary-deep)" />
          )}
        </div>

        {/* Product & Shop Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <h4
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--color-text-main)',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {item.productName}
          </h4>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              color: 'var(--color-text-muted)',
              fontWeight: 500,
            }}
          >
            <Store size={12} color="var(--color-primary)" />
            <span>{displayShopName}</span>
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary-deep)', marginTop: 2 }}>
            ₹{unitPrice.toFixed(2)} each
          </div>
        </div>
      </div>

      {/* Right side: Quantity Stepper, Subtotal, Remove */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          flexShrink: 0,
        }}
      >
        {/* Stepper */}
        <QuantityControl
          quantity={item.quantity}
          onDecrease={() => onUpdateQuantity(item.quantity - 1)}
          onIncrease={() => onUpdateQuantity(item.quantity + 1)}
          disabled={isUpdating}
          min={1}
        />

        {/* Item Subtotal */}
        <div
          style={{
            minWidth: 85,
            textAlign: 'right',
            fontWeight: 800,
            fontSize: 15.5,
            color: 'var(--color-text-main)',
          }}
        >
          ₹{itemSubtotal.toFixed(2)}
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={onRemove}
          disabled={isUpdating}
          aria-label={`Remove ${item.productName} from cart`}
          title="Remove item"
          style={{
            width: 34,
            height: 34,
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--color-error)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition-fast)',
            padding: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-error-bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  );
};
