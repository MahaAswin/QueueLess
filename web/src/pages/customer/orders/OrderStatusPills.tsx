import React from 'react';
import { X } from 'lucide-react';
import type { OrderStatus } from '../../../types/order.types';

interface OrderStatusPillsProps {
  status: OrderStatus;
  accentColor?: string;
  prepStageVerb?: string;
}

const getStageIndex = (status: OrderStatus): number => {
  switch (status) {
    case 'PENDING':
      return 0;
    case 'CONFIRMED':
    case 'ACCEPTED':
      return 1;
    case 'PREPARING':
      return 2;
    case 'READY_FOR_PICKUP':
    case 'COLLECTED':
    case 'COMPLETED':
      return 3;
    default:
      return 0;
  }
};

export const OrderStatusPills: React.FC<OrderStatusPillsProps> = ({
  status,
  accentColor = '#10B981',
  prepStageVerb = 'Preparing',
}) => {
  const isCancelled = status === 'CANCELLED' || status === 'REJECTED';
  const currentIndex = getStageIndex(status);

  if (isCancelled) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 12px',
          borderRadius: '8px',
          backgroundColor: '#FEE2E2',
          border: '1px solid #FECACA',
          color: '#DC2626',
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        <X size={13} strokeWidth={2.5} />
        <span>{status === 'REJECTED' ? 'Declined' : 'Cancelled'}</span>
      </div>
    );
  }

  const steps = [
    { label: 'Placed', index: 0 },
    { label: 'Confirmed', index: 1 },
    { label: prepStageVerb, index: 2 },
    { label: 'Ready', index: 3 },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
      }}
    >
      {steps.map((st) => {
        const isCurrent = currentIndex === st.index;

        return (
          <div
            key={st.label}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px 12px',
              borderRadius: '8px',
              backgroundColor: isCurrent ? accentColor : 'rgba(255, 255, 255, 0.7)',
              border: isCurrent ? `1px solid ${accentColor}` : '1px solid rgba(203, 213, 225, 0.6)',
              color: isCurrent ? '#FFFFFF' : '#475569',
              fontSize: 11.5,
              fontWeight: isCurrent ? 800 : 600,
              letterSpacing: '0.2px',
              transition: 'all 0.15s ease',
              boxShadow: isCurrent ? '0 2px 6px rgba(0, 0, 0, 0.08)' : 'none',
            }}
          >
            {st.label}
          </div>
        );
      })}
    </div>
  );
};
