import React from 'react';
import { Search, X, Users, User, Store, Filter } from 'lucide-react';

interface UsersFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  roleFilter: 'ALL' | 'CUSTOMER' | 'SHOP_OWNER';
  onRoleFilterChange: (role: 'ALL' | 'CUSTOMER' | 'SHOP_OWNER') => void;
  statusFilter: 'ALL' | 'ACTIVE' | 'SUSPENDED';
  onStatusFilterChange: (status: 'ALL' | 'ACTIVE' | 'SUSPENDED') => void;
  totalCount: number;
}

export const UsersFilterBar: React.FC<UsersFilterBarProps> = ({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
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
      {/* Top Search & Status Controls */}
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
            placeholder="Search users by name, email, or phone number..."
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

        {/* Status Dropdown Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={15} color="var(--color-text-muted)" />
          <select
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange(e.target.value as 'ALL' | 'ACTIVE' | 'SUSPENDED')
            }
            style={{
              padding: '8px 14px',
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
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Accounts</option>
            <option value="SUSPENDED">Suspended Accounts</option>
          </select>
        </div>
      </div>

      {/* Role Switcher Tabs */}
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
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => onRoleFilterChange('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: 12.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid',
              borderColor:
                roleFilter === 'ALL'
                  ? 'var(--color-primary)'
                  : 'var(--color-border)',
              backgroundColor:
                roleFilter === 'ALL'
                  ? 'var(--color-primary-bg)'
                  : 'transparent',
              color:
                roleFilter === 'ALL'
                  ? 'var(--color-primary)'
                  : 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
          >
            <Users size={14} />
            <span>All Users</span>
          </button>

          <button
            onClick={() => onRoleFilterChange('CUSTOMER')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: 12.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid',
              borderColor:
                roleFilter === 'CUSTOMER'
                  ? 'var(--color-primary)'
                  : 'var(--color-border)',
              backgroundColor:
                roleFilter === 'CUSTOMER'
                  ? 'var(--color-primary-bg)'
                  : 'transparent',
              color:
                roleFilter === 'CUSTOMER'
                  ? 'var(--color-primary)'
                  : 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
          >
            <User size={14} />
            <span>Customers</span>
          </button>

          <button
            onClick={() => onRoleFilterChange('SHOP_OWNER')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: 12.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid',
              borderColor:
                roleFilter === 'SHOP_OWNER'
                  ? 'var(--color-primary)'
                  : 'var(--color-border)',
              backgroundColor:
                roleFilter === 'SHOP_OWNER'
                  ? 'var(--color-primary-bg)'
                  : 'transparent',
              color:
                roleFilter === 'SHOP_OWNER'
                  ? 'var(--color-primary)'
                  : 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
          >
            <Store size={14} />
            <span>Shop Owners</span>
          </button>
        </div>

        <div style={{ fontSize: 12, color: 'var(--color-text-light)', fontWeight: 500 }}>
          Showing <strong style={{ color: 'var(--color-text-main)' }}>{totalCount}</strong> matching user accounts
        </div>
      </div>
    </div>
  );
};
