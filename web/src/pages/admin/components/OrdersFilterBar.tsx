import React from 'react';
import { Search, X, Filter, Calendar, Store, RotateCcw } from 'lucide-react';
import type { AdminShop } from '../../../types/admin.types';
import type { OrderStatus } from '../../../types/order.types';
import type { DatePreset } from '../hooks/useAdminOrders';

interface OrdersFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: 'ALL' | OrderStatus;
  onStatusFilterChange: (status: 'ALL' | OrderStatus) => void;
  shopFilter: 'ALL' | string;
  onShopFilterChange: (shopId: 'ALL' | string) => void;
  dateFilter: DatePreset;
  onDateFilterChange: (preset: DatePreset) => void;
  customFrom: string;
  onCustomFromChange: (val: string) => void;
  customTo: string;
  onCustomToChange: (val: string) => void;
  availableShops: AdminShop[];
  totalCount: number;
}

const ORDER_STATUS_OPTIONS: { label: string; value: 'ALL' | OrderStatus }[] = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Pending Approval', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Preparing', value: 'PREPARING' },
  { label: 'Ready for Pickup', value: 'READY_FOR_PICKUP' },
  { label: 'Collected', value: 'COLLECTED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Rejected', value: 'REJECTED' },
];

const DATE_PRESET_OPTIONS: { label: string; value: DatePreset }[] = [
  { label: 'All Time', value: 'ALL' },
  { label: 'Today', value: 'TODAY' },
  { label: 'Last 7 Days', value: '7DAYS' },
  { label: 'Last 30 Days', value: '30DAYS' },
  { label: 'Custom Range', value: 'CUSTOM' },
];

export const OrdersFilterBar: React.FC<OrdersFilterBarProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  shopFilter,
  onShopFilterChange,
  dateFilter,
  onDateFilterChange,
  customFrom,
  onCustomFromChange,
  customTo,
  onCustomToChange,
  availableShops,
  totalCount,
}) => {
  const isFiltered =
    Boolean(search) ||
    statusFilter !== 'ALL' ||
    shopFilter !== 'ALL' ||
    dateFilter !== 'ALL';

  const handleResetFilters = () => {
    onSearchChange('');
    onStatusFilterChange('ALL');
    onShopFilterChange('ALL');
    onDateFilterChange('ALL');
    onCustomFromChange('');
    onCustomToChange('');
  };

  return (
    <div
      className="card"
      style={{
        padding: '18px 20px',
        marginBottom: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Top Search and Select Controls */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Search Bar */}
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
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
            placeholder="Search by Order #, Customer Name, Email, or Shop Name..."
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

        {/* Dropdown Filters Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Status Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} color="var(--color-text-muted)" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as 'ALL' | OrderStatus)}
              style={{
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
              {ORDER_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Shop Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Store size={14} color="var(--color-text-muted)" />
            <select
              value={shopFilter}
              onChange={(e) => onShopFilterChange(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-main)',
                fontSize: 13,
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
                maxWidth: 200,
              }}
            >
              <option value="ALL">All Partner Shops</option>
              {availableShops.map((s) => {
                const sId = s.shopId || s.id || '';
                return (
                  <option key={sId} value={sId}>
                    {s.shopName || s.name || 'Shop Outlet'}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Date Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} color="var(--color-text-muted)" />
            <select
              value={dateFilter}
              onChange={(e) => onDateFilterChange(e.target.value as DatePreset)}
              style={{
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
              {DATE_PRESET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '7px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-subtle)',
                color: 'var(--color-text-muted)',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Reset All Filters"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Custom Date Range Picker (shown when dateFilter is CUSTOM) */}
      {dateFilter === 'CUSTOM' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            backgroundColor: 'var(--color-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-text-muted)' }}>
            Custom Date Range:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>From:</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => onCustomFromChange(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                fontSize: 12.5,
                color: 'var(--color-text-main)',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>To:</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => onCustomToChange(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                fontSize: 12.5,
                color: 'var(--color-text-main)',
              }}
            />
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          paddingTop: 8,
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', fontWeight: 500 }}>
          Global monitoring view • Showing{' '}
          <strong style={{ color: 'var(--color-text-main)' }}>{totalCount}</strong> matching order records
        </div>
      </div>
    </div>
  );
};
