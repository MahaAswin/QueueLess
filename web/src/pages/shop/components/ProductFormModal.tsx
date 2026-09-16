import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
  type Product,
  type ProductCategory,
  type CreateProductPayload,
  type UpdateProductPayload,
} from '../../../types/product.types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateProductPayload | UpdateProductPayload) => Promise<boolean>;
  editingProduct?: Product | null;
  submitting?: boolean;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingProduct,
  submitting = false,
}) => {
  const isEdit = Boolean(editingProduct);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [category, setCategory] = useState<ProductCategory>('GROCERY');
  const [stockQuantity, setStockQuantity] = useState<string>('10');
  const [imageUrl, setImageUrl] = useState('');
  const [available, setAvailable] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || '');
      setDescription(editingProduct.description || '');
      setPrice(editingProduct.price ? String(editingProduct.price) : '');
      setCategory(editingProduct.category || 'GROCERY');
      setStockQuantity(
        editingProduct.stockQuantity !== undefined ? String(editingProduct.stockQuantity) : '0'
      );
      setImageUrl(editingProduct.imageUrl || '');
      setAvailable(editingProduct.available !== undefined ? editingProduct.available : true);
    } else {
      // Defaults for create
      setName('');
      setDescription('');
      setPrice('');
      setCategory('GROCERY');
      setStockQuantity('10');
      setImageUrl('');
      setAvailable(true);
    }
    setErrors({});
    setImageError(false);
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (name.trim().length > 250) {
      newErrors.name = 'Name cannot exceed 250 characters';
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = 'Price must be greater than ₹0.00';
    }

    const numStock = parseInt(stockQuantity, 10);
    if (isNaN(numStock) || numStock < 0) {
      newErrors.stockQuantity = 'Stock quantity cannot be negative';
    }

    if (!category) {
      newErrors.category = 'Please select a category';
    }

    if (description && description.length > 2000) {
      newErrors.description = 'Description cannot exceed 2000 characters';
    }

    if (imageUrl && imageUrl.length > 500) {
      newErrors.imageUrl = 'Image URL cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: CreateProductPayload = {
      name: name.trim(),
      description: description.trim() || undefined,
      price: parseFloat(price),
      category,
      stockQuantity: parseInt(stockQuantity, 10),
      imageUrl: imageUrl.trim() || undefined,
      available,
    };

    const success = await onSubmit(payload);
    if (success) {
      onClose();
    }
  };

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
    >
      <div
        className="card"
        style={{
          width: 540,
          maxWidth: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-xl)',
          padding: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--color-text-light)', margin: '2px 0 0 0' }}>
              {isEdit
                ? 'Update pricing, stock availability and product details.'
                : 'Fill in the information below to add a product to your catalog.'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-light)',
              padding: 4,
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Name */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
                Product Name <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Masala Dosa, Fresh Milk 500ml"
                className="form-input"
                style={{ borderColor: errors.name ? 'var(--color-error)' : undefined }}
              />
              {errors.name && (
                <span style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 4, display: 'block' }}>
                  {errors.name}
                </span>
              )}
            </div>

            {/* Category & Price (2 Columns) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
                  Category <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="form-input"
                  style={{ borderColor: errors.category ? 'var(--color-error)' : undefined }}
                >
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {PRODUCT_CATEGORY_LABELS[cat] || cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 4, display: 'block' }}>
                    {errors.category}
                  </span>
                )}
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
                  Price (₹ INR) <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 45.00"
                  className="form-input"
                  style={{ borderColor: errors.price ? 'var(--color-error)' : undefined }}
                />
                {errors.price && (
                  <span style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 4, display: 'block' }}>
                    {errors.price}
                  </span>
                )}
              </div>
            </div>

            {/* Stock Quantity */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
                Stock Quantity (Units) <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="e.g. 25"
                className="form-input"
                style={{ borderColor: errors.stockQuantity ? 'var(--color-error)' : undefined }}
              />
              {errors.stockQuantity && (
                <span style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 4, display: 'block' }}>
                  {errors.stockQuantity}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the product, ingredients, weight, etc."
                className="form-input"
                rows={3}
                style={{
                  resize: 'vertical',
                  borderColor: errors.description ? 'var(--color-error)' : undefined,
                }}
              />
              {errors.description && (
                <span style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 4, display: 'block' }}>
                  {errors.description}
                </span>
              )}
            </div>

            {/* Image URL & Preview */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
                Image URL (Optional)
              </label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImageError(false);
                  }}
                  placeholder="https://example.com/item.jpg"
                  className="form-input"
                  style={{ flex: 1, borderColor: errors.imageUrl ? 'var(--color-error)' : undefined }}
                />
                {imageUrl && !imageError && (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border: '1px solid var(--color-border)',
                      flexShrink: 0,
                      backgroundColor: 'var(--color-surface-subtle)',
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt="Preview"
                      onError={() => setImageError(true)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>
              {imageError && (
                <span style={{ fontSize: 12, color: 'var(--color-warning)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertCircle size={12} /> Preview failed to load (check URL)
                </span>
              )}
              {errors.imageUrl && (
                <span style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 4, display: 'block' }}>
                  {errors.imageUrl}
                </span>
              )}
            </div>

            {/* Availability Checkbox */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border)',
              }}
            >
              <input
                type="checkbox"
                id="product-available-checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--color-primary)' }}
              />
              <label
                htmlFor="product-available-checkbox"
                style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer', margin: 0, flex: 1 }}
              >
                Available for Order
                <span
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 400,
                    color: 'var(--color-text-light)',
                    marginTop: 2,
                  }}
                >
                  When unchecked, customers cannot order this item even if in stock.
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
              marginTop: 24,
              borderTop: '1px solid var(--color-border)',
              paddingTop: 16,
            }}
          >
            <Button variant="outline" size="md" type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={submitting}
              icon={submitting ? undefined : <Check size={16} />}
            >
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
