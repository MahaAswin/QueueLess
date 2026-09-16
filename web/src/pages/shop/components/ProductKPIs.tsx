import React from 'react';
import { Package, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { ProductStockFilter } from '../../../types/product.types';

interface ProductKPIsProps {
  kpis: {
    totalProducts: number;
    availableCount: number;
    outOfStockCount: number;
    lowStockCount: number;
    distinctCategories: number;
  };
  activeStockFilter: ProductStockFilter;
  onSelectStockFilter: (filter: ProductStockFilter) => void;
}

export const ProductKPIs: React.FC<ProductKPIsProps> = ({
  kpis,
  activeStockFilter,
  onSelectStockFilter,
}) => {
  const cards = [
    {
      id: 'ALL',
      title: 'Total Products',
      value: kpis.totalProducts,
      subtitle: `${kpis.distinctCategories} categories in catalog`,
      icon: <Package size={20} color="var(--color-primary)" />,
      iconBg: 'var(--color-primary-bg)',
      color: 'var(--color-primary)',
      filterKey: 'ALL',
    },
    {
      id: 'IN_STOCK',
      title: 'Available & In Stock',
      value: kpis.availableCount,
      subtitle: 'Ready for customer orders',
      icon: <CheckCircle2 size={20} color="var(--color-success)" />,
      iconBg: 'var(--color-success-bg)',
      color: 'var(--color-success)',
      filterKey: 'IN_STOCK',
    },
    {
      id: 'LOW_STOCK',
      title: 'Low Stock (< 5)',
      value: kpis.lowStockCount,
      subtitle: 'Needs replenishment soon',
      icon: <AlertTriangle size={20} color="var(--color-warning)" />,
      iconBg: 'var(--color-warning-bg)',
      color: 'var(--color-warning)',
      filterKey: 'LOW_STOCK',
    },
    {
      id: 'OUT_OF_STOCK',
      title: 'Out of Stock / Unavailable',
      value: kpis.outOfStockCount,
      subtitle: 'Hidden or unorderable',
      icon: <XCircle size={20} color="var(--color-error)" />,
      iconBg: 'var(--color-error-bg)',
      color: 'var(--color-error)',
      filterKey: 'OUT_OF_STOCK',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}
    >
      {cards.map((card) => {
        const isSelected = activeStockFilter === card.filterKey;
        return (
          <div
            key={card.id}
            onClick={() => onSelectStockFilter(card.filterKey)}
            className="card"
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              border: isSelected
                ? `2px solid ${card.color}`
                : '1px solid var(--color-border)',
              backgroundColor: isSelected ? 'var(--color-surface-subtle)' : 'var(--color-surface)',
              transition: 'all var(--transition-fast)',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: 4,
                }}
              >
                {card.title}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-main)' }}>
                {card.value}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 2 }}>
                {card.subtitle}
              </div>
            </div>

            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                backgroundColor: card.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {card.icon}
            </div>
          </div>
        );
      })}
    </div>
  );
};
