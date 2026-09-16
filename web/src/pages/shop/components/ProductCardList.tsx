import React from 'react';
import { Edit2, Trash2, Package } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import { PRODUCT_CATEGORY_LABELS, type Product } from '../../../types/product.types';

interface ProductCardListProps {
  products: Product[];
  onToggleAvailability: (product: Product) => Promise<boolean>;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductCardList: React.FC<ProductCardListProps> = ({
  products,
  onToggleAvailability,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}
    >
      {products.map((product) => {
        const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;
        const isOutOfStock = product.stockQuantity === 0;

        return (
          <div
            key={product.id}
            className="card"
            style={{
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              position: 'relative',
            }}
          >
            {/* Header with image, title, category */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Package size={24} color="var(--color-text-light)" />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: 'var(--color-text-main)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {product.name}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-subtle)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {PRODUCT_CATEGORY_LABELS[product.category] || product.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--color-text-light)',
                  margin: 0,
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {product.description}
              </p>
            )}

            {/* Pricing and Stock Info */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-sm)',
                marginTop: 'auto',
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-text-light)' }}>Price</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-main)' }}>
                  {formatCurrency(product.price)}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-light)' }}>Stock</div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: isOutOfStock
                      ? 'var(--color-error)'
                      : isLowStock
                      ? 'var(--color-warning)'
                      : 'var(--color-text-main)',
                  }}
                >
                  {product.stockQuantity} units
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--color-border)',
                paddingTop: 10,
              }}
            >
              <button
                onClick={() => onToggleAvailability(product)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  backgroundColor: product.available
                    ? 'var(--color-success-bg)'
                    : 'var(--color-surface-subtle)',
                  borderColor: product.available
                    ? 'var(--color-success-border)'
                    : 'var(--color-border)',
                  color: product.available ? 'var(--color-success)' : 'var(--color-text-muted)',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: product.available
                      ? 'var(--color-success)'
                      : 'var(--color-text-light)',
                  }}
                />
                {product.available ? 'Available' : 'Unavailable'}
              </button>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => onEdit(product)}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-surface-subtle)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                  }}
                  title="Edit Product"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => onDelete(product)}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-error-bg)',
                    border: '1px solid var(--color-error-border)',
                    color: 'var(--color-error)',
                    cursor: 'pointer',
                  }}
                  title="Delete Product"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
