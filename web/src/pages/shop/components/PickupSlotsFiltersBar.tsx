import React from 'react';
import { Search, X } from 'lucide-react';
import type { PickupSlotFilter } from '../../../types/slot.types';

interface PickupSlotsFiltersBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: PickupSlotFilter;
  onStatusChange: (status: PickupSlotFilter) => void;
  totalCount: number;
  filteredCount: number;
}

export const PickupSlotsFiltersBar: React.FC<PickupSlotsFiltersBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  totalCount,
  filteredCount,
}) => {
  const tabs: Array<{ id: PickupSlotFilter; label: string }> = [
    { id: 'ALL', label: 'All Slots' },
    { id: 'REQUESTED', label: 'Requested' },
    { id: 'ACCEPTED', label: 'Confirmed' },
    { id: 'COUNTER_PROPOSED', label: 'Counter-Proposed' },
    { id: 'REJECTED', label: 'Rejected / Cancelled' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}
    >
      {/* Status Tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onStatusChange(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: 13,
                fontWeight: 600,
                border: '1px solid',
                backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
                borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                color: isActive ? '#fff' : 'var(--color-text-muted)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', width: 260, maxWidth: '100%' }}>
        <Search
          size={15}
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
          placeholder="Search Order ID or customer..."
          className="form-input"
          style={{
            paddingLeft: 34,
            paddingRight: searchQuery ? 32 : 12,
            height: 36,
            fontSize: 13,
          }}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-light)',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Results Counter */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          color: 'var(--color-text-light)',
          marginTop: -4,
        }}
      >
        <span>
          Showing <strong style={{ color: 'var(--color-text-main)' }}>{filteredCount}</strong> of{' '}
          {totalCount} slots
        </span>
        {filteredCount < totalCount && (
          <span style={{ color: 'var(--color-warning)' }}>
            Filtered ({totalCount - filteredCount} hidden)
          </span>
        )}
      </div>
    </div>
  );
};
