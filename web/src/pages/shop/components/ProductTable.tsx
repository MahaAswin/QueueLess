import React, { useState } from 'react';
import { Edit2, Trash2, Package, Check, X } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import { PRODUCT_CATEGORY_LABELS, type Product } from '../../../types/product.types';

interface ProductTableProps {
  products: Product[];
  onToggleAvailability: (product: Product) => Promise<boolean>;
  onUpdateStock: (product: Product, newStock: number) => Promise<boolean>;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onToggleAvailability,
  onUpdateStock,
  onEdit,
  onDelete,
}) => {
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<string>('');
  const [updatingStock, setUpdatingStock] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const startStockEdit = (product: Product) => {
    setEditingStockId(product.id);
    setTempStockValue(String(product.stockQuantity));
  };

  const cancelStockEdit = () => {
    setEditingStockId(null);
    setTempStockValue('');
  };

  const saveStockEdit = async (product: Product) => {
    const num = parseInt(tempStockValue, 10);
    if (isNaN(num) || num < 0) {
      cancelStockEdit();
      return;
    }
    setUpdatingStock(true);
    await onUpdateStock(product, num);
    setUpdatingStock(false);
    setEditingStockId(null);
  };

  const handleToggle = async (product: Product) => {
    setTogglingId(product.id);
    await onToggleAvailability(product);
    setTogglingId(null);
  };

  return (
    <div className="data-table-container" style={{ marginBottom: 24 }}>
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '38%' }}>Product</th>
            <th style={{ width: '15%' }}>Category</th>
            <th style={{ width: '12%' }}>Price (INR)</th>
            <th style={{ width: '15%' }}>Stock Quantity</th>
            <th style={{ width: '10%' }}>Availability</th>
            <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const isEditingStock = editingStockId === product.id;
            const isToggling = togglingId === product.id;
            const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;
            const isOutOfStock = product.stockQuantity === 0;

            return (
              <tr key={product.id}>
                {/* Product Info & Thumbnail */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
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
                        <Package size={20} color="var(--color-text-light)" />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: 'var(--color-text-main)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 260,
                        }}
                      >
                        {product.name}
                      </div>
                      {product.description && (
                        <div
                          style={{
                            fontSize: 12,
                            color: 'var(--color-text-light)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 280,
                            marginTop: 2,
                          }}
                        >
                          {product.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-subtle)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {PRODUCT_CATEGORY_LABELS[product.category] || product.category}
                  </span>
                </td>

                {/* Price */}
                <td>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-main)' }}>
                    {formatCurrency(product.price)}
                  </span>
                </td>

                {/* Stock Quantity & Quick Edit */}
                <td>
                  {isEditingStock ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input
                        type="number"
                        min="0"
                        value={tempStockValue}
                        onChange={(e) => setTempStockValue(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveStockEdit(product);
                          if (e.key === 'Escape') cancelStockEdit();
                        }}
                        style={{
                          width: 60,
                          padding: '4px 6px',
                          border: '1px solid var(--color-primary)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 13,
                          fontWeight: 600,
                          textAlign: 'center',
                        }}
                      />
                      <button
                        onClick={() => saveStockEdit(product)}
                        disabled={updatingStock}
                        style={{
                          background: 'var(--color-primary)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          padding: '4px',
                          cursor: 'pointer',
                        }}
                        title="Save Stock"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={cancelStockEdit}
                        style={{
                          background: 'var(--color-surface-subtle)',
                          color: 'var(--color-text-muted)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '4px',
                          cursor: 'pointer',
                        }}
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => startStockEdit(product)}
                      title="Click to quickly adjust stock quantity"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isOutOfStock
                          ? 'var(--color-error-bg)'
                          : isLowStock
                          ? 'var(--color-warning-bg)'
                          : 'var(--color-surface-subtle)',
                        border: `1px solid ${
                          isOutOfStock
                            ? 'var(--color-error-border)'
                            : isLowStock
                            ? 'var(--color-warning-border)'
                            : 'var(--color-border)'
                        }`,
                      }}
                    >
                      <span
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
                      </span>
                      <Edit2 size={11} color="var(--color-text-light)" />
                    </div>
                  )}
                </td>

                {/* Availability Toggle */}
                <td>
                  <button
                    onClick={() => handleToggle(product)}
                    disabled={isToggling}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
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
                      opacity: isToggling ? 0.6 : 1,
                      transition: 'all var(--transition-fast)',
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
                </td>

                {/* Actions */}
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 6 }}>
                    <button
                      onClick={() => onEdit(product)}
                      title="Edit Product"
                      style={{
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-surface-subtle)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(product)}
                      title="Delete Product"
                      style={{
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-error-bg)',
                        border: '1px solid var(--color-error-border)',
                        color: 'var(--color-error)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
