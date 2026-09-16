import React from 'react';
import { Search, X, Store, Clock, CheckCircle2, AlertTriangle, XCircle, MapPin, Tag } from 'lucide-react';
import type { ShopCategory, ShopStatus } from '../../../types/shop.types';
import { SHOP_CATEGORIES, SHOP_CATEGORY_LABELS } from '../../../types/shop.types';

interface ShopsFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: 'ALL' | ShopStatus;
  onStatusFilterChange: (status: 'ALL' | ShopStatus) => void;
  categoryFilter: 'ALL' | ShopCategory;
  onCategoryFilterChange: (cat: 'ALL' | ShopCategory) => void;
  cityFilter: string;
  onCityFilterChange: (city: string) => void;
  totalCount: number;
}

export const ShopsFilterBar: React.FC<ShopsFilterBarProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  cityFilter,
  onCityFilterChange,
  totalCount,
}) => {
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
      {/* Search & Location Filters */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Name / Keyword Search */}
        <div style={{ position: 'relative', flex: 2, minWidth: 260 }}>
          <Search
            size={17}
            color="var(--color-text-muted)"
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search shops by name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 36px 9px 38px',
              fontSize: 13.5,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-subtle)',
              color: 'var(--color-text-main)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* City Filter */}
        <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
          <MapPin
            size={16}
            color="var(--color-text-muted)"
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Filter by city..."
            value={cityFilter}
            onChange={(e) => onCityFilterChange(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 30px 9px 32px',
              fontSize: 13.5,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-subtle)',
              color: 'var(--color-text-main)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {cityFilter && (
            <button
              onClick={() => onCityFilterChange('')}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Select Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 180 }}>
          <Tag size={15} color="var(--color-text-muted)" />
          <select
            value={categoryFilter}
            onChange={(e) =>
              onCategoryFilterChange(e.target.value as 'ALL' | ShopCategory)
            }
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-main)',
              fontSize: 13,
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Categories</option>
            {SHOP_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {SHOP_CATEGORY_LABELS[cat] || cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Filter Tabs & Summary Count */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          paddingTop: 10,
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => onStatusFilterChange('ALL')}
            style={{
              padding: '6px 13px',
              borderRadius: 'var(--radius-full)',
              fontSize: 12.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid',
              borderColor:
                statusFilter === 'ALL'
                  ? 'var(--color-primary)'
                  : 'var(--color-border)',
              backgroundColor:
                statusFilter === 'ALL'
                  ? 'var(--color-primary-bg)'
                  : 'transparent',
              color:
                statusFilter === 'ALL'
                  ? 'var(--color-primary)'
                  : 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
          >
            <Store size={14} />
            <span>All Shops</span>
          </button>

          <button
            onClick={() => onStatusFilterChange('PENDING')}
            style={{
              padding: '6px 13px',
              borderRadius: 'var(--radius-full)',
              fontSize: 12.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid',
              borderColor:
                statusFilter === 'PENDING'
                  ? '#F59E0B'
                  : 'var(--color-border)',
              backgroundColor:
                statusFilter === 'PENDING'
                  ? '#FEF3C7'
                  : 'transparent',
              color:
                statusFilter === 'PENDING'
                  ? '#B45309'
                  : 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
          >
            <Clock size={14} />
            <span>Pending Approvals</span>
          </button>

          <button
            onClick={() => onStatusFilterChange('ACTIVE')}
            style={{
              padding: '6px 13px',
              borderRadius: 'var(--radius-full)',
              fontSize: 12.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid',
              borderColor:
                statusFilter === 'ACTIVE'
                  ? '#10B981'
                  : 'var(--color-border)',
              backgroundColor:
                statusFilter === 'ACTIVE'
                  ? '#D1FAE5'
                  : 'transparent',
              color:
                statusFilter === 'ACTIVE'
                  ? '#047857'
                  : 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
          >
            <CheckCircle2 size={14} />
            <span>Active Outlets</span>
          </button>

          <button
            onClick={() => onStatusFilterChange('SUSPENDED')}
            style={{
              padding: '6px 13px',
              borderRadius: 'var(--radius-full)',
              fontSize: 12.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid',
              borderColor:
                statusFilter === 'SUSPENDED'
                  ? '#EF4444'
                  : 'var(--color-border)',
              backgroundColor:
                statusFilter === 'SUSPENDED'
                  ? '#FEE2E2'
                  : 'transparent',
              color:
                statusFilter === 'SUSPENDED'
                  ? '#B91C1C'
                  : 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
          >
            <AlertTriangle size={14} />
            <span>Suspended</span>
          </button>

          <button
            onClick={() => onStatusFilterChange('INACTIVE')}
            style={{
              padding: '6px 13px',
              borderRadius: 'var(--radius-full)',
              fontSize: 12.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid',
              borderColor:
                statusFilter === 'INACTIVE'
                  ? '#64748B'
                  : 'var(--color-border)',
              backgroundColor:
                statusFilter === 'INACTIVE'
                  ? '#F1F5F9'
                  : 'transparent',
              color:
                statusFilter === 'INACTIVE'
                  ? '#475569'
                  : 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
          >
            <XCircle size={14} />
            <span>Inactive / Rejected</span>
          </button>
        </div>

        <div style={{ fontSize: 12, color: 'var(--color-text-light)', fontWeight: 500 }}>
          Showing <strong style={{ color: 'var(--color-text-main)' }}>{totalCount}</strong> matching shop outlets
        </div>
      </div>
    </div>
  );
};
