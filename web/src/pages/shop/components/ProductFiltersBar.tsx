import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
  type ProductCategory,
  type ProductAvailabilityFilter,
  type ProductSortOption,
} from '../../../types/product.types';

interface ProductFiltersBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  categoryFilter: ProductCategory | 'ALL';
  onCategoryChange: (cat: ProductCategory | 'ALL') => void;
  availabilityFilter: ProductAvailabilityFilter;
  onAvailabilityChange: (av: ProductAvailabilityFilter) => void;
  sortBy: ProductSortOption;
  onSortChange: (sort: ProductSortOption) => void;
  totalCount: number;
  filteredCount: number;
  onClearFilters: () => void;
}

export const ProductFiltersBar: React.FC<ProductFiltersBarProps> = ({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  availabilityFilter,
  onAvailabilityChange,
  sortBy,
  onSortChange,
  totalCount,
  filteredCount,
  onClearFilters,
}) => {
  const isFiltered =
    searchQuery.trim() !== '' ||
    categoryFilter !== 'ALL' ||
    availabilityFilter !== 'ALL' ||
    sortBy !== 'NAME_ASC';

  return (
    <div
      className="card"
      style={{
        padding: '16px 20px',
        marginBottom: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Search Field */}
        <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 220 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-light)',
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by product name or description..."
            className="form-input"
            style={{
              paddingLeft: 36,
              paddingRight: searchQuery ? 36 : 12,
              height: 40,
              fontSize: 13,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-light)',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            alignItems: 'center',
          }}
        >
          {/* Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <SlidersHorizontal size={14} color="var(--color-text-light)" />
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value as ProductCategory | 'ALL')}
              className="form-input"
              style={{
                height: 40,
                padding: '0 12px',
                fontSize: 13,
                width: 'auto',
                fontWeight: 500,
              }}
            >
              <option value="ALL">All Categories</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {PRODUCT_CATEGORY_LABELS[cat] || cat}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Select */}
          <select
            value={availabilityFilter}
            onChange={(e) => onAvailabilityChange(e.target.value as ProductAvailabilityFilter)}
            className="form-input"
            style={{
              height: 40,
              padding: '0 12px',
              fontSize: 13,
              width: 'auto',
              fontWeight: 500,
            }}
          >
            <option value="ALL">All Availability</option>
            <option value="AVAILABLE">Available Only</option>
            <option value="UNAVAILABLE">Unavailable Only</option>
          </select>

          {/* Sort Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowUpDown size={14} color="var(--color-text-light)" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as ProductSortOption)}
              className="form-input"
              style={{
                height: 40,
                padding: '0 12px',
                fontSize: 13,
                width: 'auto',
                fontWeight: 500,
              }}
            >
              <option value="NAME_ASC">Name (A - Z)</option>
              <option value="NAME_DESC">Name (Z - A)</option>
              <option value="PRICE_ASC">Price (Low to High)</option>
              <option value="PRICE_DESC">Price (High to Low)</option>
              <option value="STOCK_ASC">Stock (Low to High)</option>
              <option value="STOCK_DESC">Stock (High to Low)</option>
              <option value="NEWEST">Newest Added</option>
            </select>
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={onClearFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--color-primary)',
                background: 'var(--color-primary-bg)',
                border: '1px solid var(--color-primary)',
                cursor: 'pointer',
                height: 40,
              }}
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Results Counter */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          color: 'var(--color-text-light)',
          borderTop: '1px solid var(--color-border)',
          paddingTop: 10,
        }}
      >
        <span>
          Showing <strong style={{ color: 'var(--color-text-main)' }}>{filteredCount}</strong> of{' '}
          {totalCount} products
        </span>
        {isFiltered && filteredCount < totalCount && (
          <span style={{ color: 'var(--color-warning)' }}>
            Filtered ({totalCount - filteredCount} hidden)
          </span>
        )}
      </div>
    </div>
  );
};
