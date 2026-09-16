import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw, Package, Search, Store } from 'lucide-react';
import { useShopOwnerProducts } from './hooks/useShopOwnerProducts';
import { ProductKPIs } from './components/ProductKPIs';
import { ProductFiltersBar } from './components/ProductFiltersBar';
import { ProductTable } from './components/ProductTable';
import { ProductCardList } from './components/ProductCardList';
import { ProductFormModal } from './components/ProductFormModal';
import { ProductDeleteModal } from './components/ProductDeleteModal';
import { ProductSkeleton } from './components/ProductSkeleton';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/feedback/ErrorState';
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
} from '../../types/product.types';

export const ShopProductsPage: React.FC = () => {
  const {
    shops,
    selectedShopId,
    setSelectedShopId,
    products,
    filteredProducts,
    loading,
    error,
    actionLoading,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    availabilityFilter,
    setAvailabilityFilter,
    stockFilter,
    setStockFilter,
    sortBy,
    setSortBy,
    kpis,
    refetch,
    handleToggleAvailability,
    handleUpdateStock,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    clearFilters,
  } = useShopOwnerProducts();

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingProduct(null);
    setFormModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormModalOpen(true);
  };

  // Open Delete Modal
  const openDeleteModal = (product: Product) => {
    setDeletingProduct(product);
    setDeleteModalOpen(true);
  };

  // Submit Handler for Form Modal (Create or Edit)
  const handleFormSubmit = async (payload: CreateProductPayload | UpdateProductPayload) => {
    if (editingProduct) {
      return await handleUpdateProduct(editingProduct.id, payload);
    } else {
      return await handleCreateProduct(payload as CreateProductPayload);
    }
  };

  // Confirm Deletion
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    const success = await handleDeleteProduct(deletingProduct.id);
    if (success) {
      setDeleteModalOpen(false);
      setDeletingProduct(null);
    }
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      {/* Top Banner & Header Actions */}
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
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px 0', color: 'var(--color-text-main)' }}>
            Products
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: 0 }}>
            Manage the products available in your shop.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Shop Switcher (if owner has multiple registered shops) */}
          {shops.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Store size={16} color="var(--color-text-light)" />
              <select
                value={selectedShopId}
                onChange={(e) => setSelectedShopId(e.target.value)}
                className="form-input"
                style={{ width: 'auto', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}
              >
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shopName || s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="outline"
            size="md"
            onClick={refetch}
            icon={<RefreshCw size={16} className={loading ? 'spin' : ''} />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="md"
            disabled={shops.length === 0}
            onClick={openCreateModal}
            icon={<Plus size={16} />}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Main View State Handling */}
      {shops.length === 0 && !loading ? (
        <div
          className="card"
          style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--color-text-muted)' }}
        >
          <Package size={36} color="var(--color-text-light)" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: 'var(--color-text-main)' }}>
            No store outlet registered yet
          </h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-light)', marginBottom: 16 }}>
            Please register your store outlet before managing inventory and products.
          </p>
          <Link to="/shop-owner/profile">
            <Button variant="primary" size="md">
              Register Store Outlet
            </Button>
          </Link>
        </div>
      ) : loading ? (
        <ProductSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : products.length === 0 ? (
        /* Empty Store Catalog */
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '56px 20px',
            color: 'var(--color-text-muted)',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: 'var(--color-primary)',
            }}
          >
            <Package size={28} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: 'var(--color-text-main)' }}>
            No products yet
          </h3>
          <p style={{ fontSize: 14, color: 'var(--color-text-light)', maxWidth: 400, margin: '0 auto 20px auto' }}>
            Add products to start accepting customer orders and managing inventory.
          </p>
          <Button variant="primary" size="md" onClick={openCreateModal} icon={<Plus size={16} />}>
            Add Product
          </Button>
        </div>
      ) : (
        /* Catalog with products */
        <div>
          {/* Summary KPIs */}
          <ProductKPIs
            kpis={kpis}
            activeStockFilter={stockFilter}
            onSelectStockFilter={(filter) =>
              setStockFilter(stockFilter === filter ? 'ALL' : filter)
            }
          />

          {/* Filter & Search Controls */}
          <ProductFiltersBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            availabilityFilter={availabilityFilter}
            onAvailabilityChange={setAvailabilityFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalCount={products.length}
            filteredCount={filteredProducts.length}
            onClearFilters={clearFilters}
          />

          {/* Filtered Empty State */}
          {filteredProducts.length === 0 ? (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '48px 20px',
                color: 'var(--color-text-muted)',
              }}
            >
              <Search size={32} color="var(--color-text-light)" style={{ marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: 'var(--color-text-main)' }}>
                No matching products found
              </h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-light)', marginBottom: 16 }}>
                Try adjusting your search query, category, or availability filters.
              </p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="desktop-only">
                <ProductTable
                  products={filteredProducts}
                  onToggleAvailability={handleToggleAvailability}
                  onUpdateStock={handleUpdateStock}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                />
              </div>

              {/* Mobile / Tablet Cards View */}
              <div className="mobile-only">
                <ProductCardList
                  products={filteredProducts}
                  onToggleAvailability={handleToggleAvailability}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Reusable Create & Edit Product Modal */}
      <ProductFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleFormSubmit}
        editingProduct={editingProduct}
        submitting={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <ProductDeleteModal
        isOpen={deleteModalOpen}
        product={deletingProduct}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingProduct(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={actionLoading}
      />
    </div>
  );
};
