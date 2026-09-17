import React from 'react';
import { Search, X, Filter, AlertCircle, RotateCcw } from 'lucide-react';
import type { ComplaintStatus, ComplaintType } from '../../../types/complaint.types';

interface ComplaintsFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: 'ALL' | ComplaintStatus;
  onStatusFilterChange: (status: 'ALL' | ComplaintStatus) => void;
  typeFilter: 'ALL' | ComplaintType;
  onTypeFilterChange: (type: 'ALL' | ComplaintType) => void;
  totalCount: number;
}

const COMPLAINT_STATUS_OPTIONS: { label: string; value: 'ALL' | ComplaintStatus }[] = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Submitted (Action Required)', value: 'SUBMITTED' },
  { label: 'Under Review', value: 'UNDER_REVIEW' },
  { label: 'Valid (Upheld)', value: 'VALID' },
  { label: 'Invalid (Unsubstantiated)', value: 'INVALID' },
  { label: 'Dismissed', value: 'DISMISSED' },
];

const COMPLAINT_TYPE_OPTIONS: { label: string; value: 'ALL' | ComplaintType }[] = [
  { label: 'All Categories', value: 'ALL' },
  { label: 'Shop: Delay', value: 'SHOP_DELAY' },
  { label: 'Shop: Wrong Order Item(s)', value: 'SHOP_WRONG_ORDER' },
  { label: 'Shop: Refused Order', value: 'SHOP_ORDER_REFUSAL' },
  { label: 'Shop: Other Concern', value: 'SHOP_OTHER' },
  { label: 'Customer: No Show', value: 'CUSTOMER_NO_SHOW' },
  { label: 'Customer: Abuse', value: 'CUSTOMER_ABUSE' },
  { label: 'Customer: Fraud', value: 'CUSTOMER_FRAUD' },
  { label: 'Customer: Other Concern', value: 'CUSTOMER_OTHER' },
];

export const ComplaintsFilterBar: React.FC<ComplaintsFilterBarProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  totalCount,
}) => {
  const isFiltered = Boolean(search) || statusFilter !== 'ALL' || typeFilter !== 'ALL';

  const handleResetFilters = () => {
    onSearchChange('');
    onStatusFilterChange('ALL');
    onTypeFilterChange('ALL');
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
        {/* Search Input */}
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
            placeholder="Search by Complaint #, Complainant, Reported Party, Shop, or Order #..."
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
              onChange={(e) => onStatusFilterChange(e.target.value as 'ALL' | ComplaintStatus)}
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
              {COMPLAINT_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Type / Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={14} color="var(--color-text-muted)" />
            <select
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value as 'ALL' | ComplaintType)}
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
                maxWidth: 220,
              }}
            >
              {COMPLAINT_TYPE_OPTIONS.map((opt) => (
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
          Dispute resolution queue • Showing{' '}
          <strong style={{ color: 'var(--color-text-main)' }}>{totalCount}</strong> matching complaint records
        </div>
      </div>
    </div>
  );
};
