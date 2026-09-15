import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Store, ArrowLeft } from 'lucide-react';
import type { CartItem } from '../../../types/cart.types';

interface CheckoutItemsProps {
  items: CartItem[];
  shopName?: string;
  shopId?: string;
}

export const CheckoutItems: React.FC<CheckoutItemsProps> = ({
  items,
  shopName,
  shopId,
}) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  return (
    <div
      className="card"
      style={{
        padding: 24,
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 12,
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              color: 'var(--color-primary-deep)',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              marginBottom: 2,
            }}
          >
            ORDER ITEMS ({items.length})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Store size={14} color="var(--color-primary)" />
            {shopId ? (
              <Link
                to={`/customer/shop/${shopId}`}
                style={{
                  fontSize: 14.5,
                  fontWeight: 700,
                  color: 'var(--color-text-main)',
                  textDecoration: 'none',
                }}
              >
                {shopName || 'Partner Shop'}
              </Link>
            ) : (
              <span style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--color-text-main)' }}>
                {shopName || 'Partner Shop'}
              </span>
            )}
          </div>
        </div>

        <Link
          to="/customer/cart"
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--color-primary-deep)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <ArrowLeft size={13} />
          <span>Edit Basket</span>
        </Link>
      </div>

      {/* Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item, idx) => {
          const itemId = item.id || item.itemId || String(idx);
          const hasImageError = imageErrors[itemId];
          const unitPrice = typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0;
          const subtotal = typeof item.subtotal === 'number' ? item.subtotal : unitPrice * item.quantity;

          return (
            <div
              key={itemId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: idx < items.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--color-light-sage)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {item.imageUrl && !hasImageError ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      onError={() =>
                        setImageErrors((prev) => ({ ...prev, [itemId]: true }))
                      }
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Package size={20} color="var(--color-primary-deep)" />
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: 'var(--color-text-main)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.productName}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {item.quantity} × ₹{unitPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: 14.5,
                  fontWeight: 700,
                  color: 'var(--color-text-main)',
                  flexShrink: 0,
                }}
              >
                ₹{subtotal.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
