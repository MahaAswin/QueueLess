import React from 'react';
import { Filter, ArrowUpDown, X } from 'lucide-react';
import type { ShopCategory } from '../../types/shop.types';
import { CATEGORY_META } from './ShopCard';

export type SortOption = 'RECOMMENDED' | 'NAME_ASC' | 'NAME_DESC' | 'NEWEST';

interface CategoryOption {
  value: ShopCategory | 'ALL';
  label: string;
}

const CATEGORY_LIST: CategoryOption[] = [
  { value: 'ALL', label: 'All Shops' },
  { value: 'GROCERY', label: CATEGORY_META.GROCERY.label },
  { value: 'RESTAURANT', label: CATEGORY_META.RESTAURANT.label },
  { value: 'BAKERY', label: CATEGORY_META.BAKERY.label },
  { value: 'PHARMACY', label: CATEGORY_META.PHARMACY.label },
  { value: 'STATIONERY', label: CATEGORY_META.STATIONERY.label },
  { value: 'MEAT_SHOP', label: CATEGORY_META.MEAT_SHOP.label },
  { value: 'OTHER', label: CATEGORY_META.OTHER.label },
];

interface ShopFiltersProps {
  selectedCategory: ShopCategory | 'ALL';
  onSelectCategory: (category: ShopCategory | 'ALL') => void;
  selectedSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  categoryCounts?: Record<string, number>;
}

export const ShopFilters: React.FC<ShopFiltersProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedSort,
  onSelectSort,
  onReset,
  hasActiveFilters,
  categoryCounts = {},
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {/* Category Pills Header & List */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            paddingBottom: 4,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: 'var(--color-text-light)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginRight: 4,
            }}
          >
            <Filter size={14} />
            Categories:
          </span>

          {CATEGORY_LIST.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            const count = categoryCounts[cat.value];

            return (
              <button
                key={cat.value}
                id={`filter-cat-${cat.value.toLowerCase()}`}
                type="button"
                onClick={() => onSelectCategory(cat.value)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 13,
                  fontWeight: isSelected ? 700 : 500,
                  backgroundColor: isSelected
                    ? 'var(--color-primary-deep)'
                    : 'var(--color-surface)',
                  color: isSelected ? '#FFFFFF' : 'var(--color-text-muted)',
                  border: isSelected
                    ? '1px solid var(--color-primary-deep)'
                    : '1px solid var(--color-border)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <span>{cat.label}</span>
                {typeof count === 'number' && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      opacity: isSelected ? 0.9 : 0.6,
                      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'var(--color-surface-hover)',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sort Controls & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 12px',
            }}
          >
            <ArrowUpDown size={14} style={{ color: 'var(--color-text-light)' }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Sort:
            </span>
            <select
              id="shop-sort-select"
              value={selectedSort}
              onChange={(e) => onSelectSort(e.target.value as SortOption)}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-text-main)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="RECOMMENDED">Recommended</option>
              <option value="NAME_ASC">Name (A – Z)</option>
              <option value="NAME_DESC">Name (Z – A)</option>
              <option value="NEWEST">Recently Added</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              id="shop-filters-reset-btn"
              type="button"
              onClick={onReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: 12.5,
                fontWeight: 600,
                backgroundColor: 'var(--color-surface-subtle)',
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <X size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
