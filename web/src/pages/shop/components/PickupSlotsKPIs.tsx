import React from 'react';
import { Clock, CheckCircle2, MessageSquare, Calendar } from 'lucide-react';
import type { PickupSlotFilter } from '../../../types/slot.types';

interface PickupSlotsKPIsProps {
  kpis: {
    total: number;
    pendingCount: number;
    confirmedCount: number;
    counterProposedCount: number;
    rejectedCount: number;
  };
  activeFilter: PickupSlotFilter;
  onSelectFilter: (filter: PickupSlotFilter) => void;
}

export const PickupSlotsKPIs: React.FC<PickupSlotsKPIsProps> = ({
  kpis,
  activeFilter,
  onSelectFilter,
}) => {
  const cards: Array<{
    id: string;
    title: string;
    value: number;
    subtitle: string;
    icon: React.ReactNode;
    iconBg: string;
    color: string;
    filterKey: PickupSlotFilter;
  }> = [
    {
      id: 'ALL',
      title: 'Total Pickups',
      value: kpis.total,
      subtitle: 'All scheduled & requested',
      icon: <Calendar size={20} color="var(--color-primary)" />,
      iconBg: 'var(--color-primary-bg)',
      color: 'var(--color-primary)',
      filterKey: 'ALL',
    },
    {
      id: 'REQUESTED',
      title: 'Awaiting Review',
      value: kpis.pendingCount,
      subtitle: 'Requested by customer',
      icon: <Clock size={20} color="var(--color-warning)" />,
      iconBg: 'var(--color-warning-bg)',
      color: 'var(--color-warning)',
      filterKey: 'REQUESTED',
    },
    {
      id: 'ACCEPTED',
      title: 'Confirmed Slots',
      value: kpis.confirmedCount,
      subtitle: 'Ready for order pickup',
      icon: <CheckCircle2 size={20} color="var(--color-success)" />,
      iconBg: 'var(--color-success-bg)',
      color: 'var(--color-success)',
      filterKey: 'ACCEPTED',
    },
    {
      id: 'COUNTER_PROPOSED',
      title: 'Counter-Proposed',
      value: kpis.counterProposedCount,
      subtitle: 'Awaiting customer response',
      icon: <MessageSquare size={20} color="var(--color-info)" />,
      iconBg: 'var(--color-info-bg)',
      color: 'var(--color-info)',
      filterKey: 'COUNTER_PROPOSED',
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
        const isSelected = activeFilter === card.filterKey;
        return (
          <div
            key={card.id}
            onClick={() => onSelectFilter(card.filterKey)}
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
