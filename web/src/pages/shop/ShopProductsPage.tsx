import React, { useState, useEffect, useCallback } from 'react';
import { productService } from '../../services/productService';
import { shopService } from '../../services/shopService';
import type { Product, ProductCategory, CreateProductPayload } from '../../types/product.types';
import type { Shop } from '../../types/shop.types';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { Plus, Package, Edit2, Trash2, Check, RefreshCw } from 'lucide-react';

const CATEGORIES: ProductCategory[] = [
  'GROCERY',
  'BEVERAGES',
  'SNACKS',
  'DAIRY',
  'BAKERY',
  'PERSONAL_CARE',
  'HOUSEHOLD',
  'PHARMACY',
  'OTHER',
];

export const ShopProductsPage: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New product form modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<CreateProductPayload>({
    name: '',
    description: '',
    price: 0,
    category: 'GROCERY',
    stockQuantity: 10,
    unit: 'pcs',
  });
  const [submitting, setSubmitting] = useState(false);

  // Load shops first
  useEffect(() => {
    async function loadShops() {
      try {
        const myShops = await shopService.getMyShops();
        setShops(myShops);
        if (myShops.length > 0) {
          setSelectedShopId(myShops[0].id);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load shops.');
      }
    }
    loadShops();
  }, []);

  const fetchProducts = useCallback(async () => {
    if (!selectedShopId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getProductsByShop(selectedShopId);
      setProducts(res || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load products for this shop.');
    } finally {
      setLoading(false);
    }
  }, [selectedShopId]);

  useEffect(() => {
    if (selectedShopId) {
      fetchProducts();
    }
  }, [selectedShopId, fetchProducts]);

  const handleToggleAvailability = async (product: Product) => {
    try {
      await productService.updateAvailability(product.id, !product.available);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, available: !p.available } : p))
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update availability');
    }
  };

  const handleStockUpdate = async (product: Product, newStock: number) => {
    try {
      await productService.updateStock(product.id, newStock);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stockQuantity: newStock } : p))
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update stock');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopId) return;
    setSubmitting(true);
    try {
      await productService.createProduct(selectedShopId, formData);
      setShowAddModal(false);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'GROCERY',
        stockQuantity: 10,
        unit: 'pcs',
      });
      await fetchProducts();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px 0' }}>
            Products & Inventory
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: 0 }}>
            Manage catalog pricing, stock levels, and item availability
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {shops.length > 1 && (
            <select
              value={selectedShopId}
              onChange={(e) => setSelectedShopId(e.target.value)}
              className="form-input"
              style={{ width: 'auto', padding: '8px 12px' }}
            >
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shopName || s.name}
                </option>
              ))}
            </select>
          )}

          <Button
            variant="outline"
            size="md"
            onClick={fetchProducts}
            icon={<RefreshCw size={16} className={loading ? 'spin' : ''} />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setShowAddModal(true)}
            icon={<Plus size={16} />}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <LoadingState message="Loading catalog..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProducts} />
      ) : products.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--color-text-muted)' }}
        >
          <Package size={36} color="var(--color-text-light)" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No products in store</h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-light)', marginBottom: 16 }}>
            Add products to your catalog so customers can discover and order them.
          </p>
          <Button variant="primary" size="md" onClick={() => setShowAddModal(true)} icon={<Plus size={16} />}>
            Add First Product
          </Button>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Quantity</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                    {p.description && (
                      <div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>
                        {p.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-surface-subtle)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      {p.category}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700 }}>{formatCurrency(p.price)}</span>
                    {p.unit && (
                      <span style={{ fontSize: 12, color: 'var(--color-text-light)', marginLeft: 4 }}>
                        /{p.unit}
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        type="number"
                        min="0"
                        defaultValue={p.stockQuantity}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val !== p.stockQuantity) {
                            handleStockUpdate(p, val);
                          }
                        }}
                        style={{
                          width: 64,
                          padding: '4px 6px',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 13,
                          fontWeight: 600,
                          textAlign: 'center',
                        }}
                      />
                      <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>units</span>
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleAvailability(p)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid',
                        backgroundColor: p.available ? 'var(--color-success-bg)' : 'var(--color-surface-subtle)',
                        borderColor: p.available ? 'var(--color-success-border)' : 'var(--color-border)',
                        color: p.available ? 'var(--color-success)' : 'var(--color-text-muted)',
                      }}
                    >
                      {p.available ? 'Available' : 'Out of Stock'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      title="Delete Product"
                      style={{
                        padding: 6,
                        color: 'var(--color-error)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            className="card"
            style={{
              width: 480,
              maxWidth: '90%',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Add New Product</h2>
            <form onSubmit={handleCreateProduct}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Farm Fresh Milk 1L"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description of the item"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="form-input"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stockQuantity || ''}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value, 10) || 0 })}
                    placeholder="10"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <input
                    type="text"
                    value={formData.unit || ''}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="pcs, kg, packet"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <Button variant="outline" size="md" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Add Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
