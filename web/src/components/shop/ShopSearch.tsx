import React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface ShopSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
  placeholder?: string;
  isSearching?: boolean;
}

export const ShopSearch: React.FC<ShopSearchProps> = ({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = 'Search shops or products...',
  isSearching = false,
}) => {
  return (
    <form
      id="shop-search-form"
      onSubmit={onSubmit}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
      }}
    >
      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Search
          size={19}
          style={{
            position: 'absolute',
            left: 16,
            color: 'var(--color-primary)',
            pointerEvents: 'none',
          }}
        />

        <input
          id="shop-search-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            height: 48,
            paddingLeft: 46,
            paddingRight: value ? 44 : 18,
            fontSize: 14.5,
            color: 'var(--color-text-main)',
            backgroundColor: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
            outline: 'none',
            boxShadow: 'var(--shadow-xs)',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)';
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-glow)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
          }}
        />

        {value && (
          <button
            id="shop-search-clear-btn"
            type="button"
            onClick={onClear}
            style={{
              position: 'absolute',
              right: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-hover)',
              color: 'var(--color-text-muted)',
              border: 'none',
              cursor: 'pointer',
            }}
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <Button
        id="shop-search-submit-btn"
        type="submit"
        variant="primary"
        size="md"
        isLoading={isSearching}
        style={{
          height: 48,
          padding: '0 24px',
          borderRadius: 'var(--radius-full)',
          flexShrink: 0,
        }}
      >
        Search
      </Button>
    </form>
  );
};
