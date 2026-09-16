import React from 'react';
import { Search, Calendar, ArrowUpDown, X } from 'lucide-react';
import type { OrderStatus } from '../../../types/order.types';
import type { PickupTimeFilter, OrderSortOption } from '../hooks/useShopOwnerOrders';

interface ShopOrdersFilterBarProps {
  statusFilter?: OrderStatus;
  onStatusChange: (status?: OrderStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  pickupFilter: PickupTimeFilter;
  onPickupFilterChange: (filter: PickupTimeFilter) => void;
  sortBy: OrderSortOption;
  onSortChange: (sort: OrderSortOption) => void;
}

const STATUS_TABS: { label: string; value?: OrderStatus }[] = [
  { label: 'All Orders', value: undefined },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Preparing', value: 'PREPARING' },
  { label: 'Ready for Pickup', value: 'READY_FOR_PICKUP' },
  { label: 'Collected', value: 'COLLECTED' },
  { label: 'Cancelled / Rejected', value: 'CANCELLED' },
];

export const ShopOrdersFilterBar: React.FC<ShopOrdersFilterBarProps> = ({
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearchChange,
  pickupFilter,
  onPickupFilterChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
      {/* Status Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
        }}
      >
        {STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.label}
              onClick={() => onStatusChange(tab.value)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: 13,
                fontWeight: 600,
                border: '1px solid',
                borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                backgroundColor: isActive ? 'var(--color-primary-deep)' : 'var(--color-surface)',
                color: isActive ? '#fff' : 'var(--color-text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search & Extra Filters Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {/* Search Box */}
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 420 }}>
          <Search
            size={16}
            color="var(--color-text-light)"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search by Order ID or Customer name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="form-input"
            style={{
              paddingLeft: 36,
              paddingRight: searchQuery ? 32 : 12,
              paddingTop: 8,
              paddingBottom: 8,
              fontSize: 13.5,
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
                color: 'var(--color-text-light)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters Group: Pickup Filter & Sort */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Pickup Window Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={15} color="var(--color-text-muted)" />
            <select
              value={pickupFilter}
              onChange={(e) => onPickupFilterChange(e.target.value as PickupTimeFilter)}
              className="form-input"
              style={{
                width: 'auto',
                padding: '7px 10px',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-text-main)',
              }}
            >
              <option value="ALL">All Pickup Dates</option>
              <option value="TODAY">Today&apos;s Pickups</option>
              <option value="UPCOMING">Upcoming Pickups</option>
              <option value="PAST">Past Pickups</option>
            </select>
          </div>

          {/* Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowUpDown size={15} color="var(--color-text-muted)" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as OrderSortOption)}
              className="form-input"
              style={{
                width: 'auto',
                padding: '7px 10px',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-text-main)',
              }}
            >
              <option value="NEWEST">Newest Placed</option>
              <option value="OLDEST">Oldest Placed</option>
              <option value="PICKUP_TIME">Pickup Time</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
