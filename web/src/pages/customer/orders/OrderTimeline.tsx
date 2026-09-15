import React from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  Store,
  Check,
  XCircle,
} from 'lucide-react';
import type { OrderStatus } from '../../../types/order.types';
import { getOrderStatusMeta } from '../../../utils/formatters';

interface OrderTimelineProps {
  status: OrderStatus;
  updatedAt?: string;
}

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const LIFECYCLE_STEPS: TimelineStep[] = [
  {
    id: 'PENDING',
    title: 'Order Placed',
    description: 'Order sent to merchant',
    icon: <Clock size={16} />,
  },
  {
    id: 'CONFIRMED',
    title: 'Confirmed by Shop',
    description: 'Merchant accepted order',
    icon: <Store size={16} />,
  },
  {
    id: 'PREPARING',
    title: 'Preparing Basket',
    description: 'Packing fresh items',
    icon: <Package size={16} />,
  },
  {
    id: 'READY_FOR_PICKUP',
    title: 'Ready for Pickup',
    description: 'Ready at express counter',
    icon: <CheckCircle2 size={16} />,
  },
  {
    id: 'COLLECTED',
    title: 'Collected',
    description: 'Verified & completed',
    icon: <Check size={16} />,
  },
];

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ status }) => {
  const isCancelled = status === 'CANCELLED' || status === 'REJECTED';
  const meta = getOrderStatusMeta(status);
  const currentStepIndex = meta.stepIndex;

  if (isCancelled) {
    return (
      <div
        className="card"
        style={{
          padding: '20px 24px',
          backgroundColor: 'var(--color-error-bg)',
          borderColor: 'var(--color-error-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#FEE2E2',
            color: 'var(--color-error)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <XCircle size={24} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#991B1B' }}>
            {status === 'CANCELLED' ? 'Order Cancelled' : 'Order Rejected by Shop'}
          </div>
          <div style={{ fontSize: 13, color: '#B91C1C', marginTop: 2 }}>
            {status === 'CANCELLED'
              ? 'You cancelled this order. No charges were processed.'
              : 'The merchant was unable to accept this order at this time.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        padding: 24,
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--color-primary-deep)',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        ORDER PROGRESS
      </div>
      <h3
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: 'var(--color-text-main)',
          marginBottom: 20,
          fontFamily: 'var(--font-heading)',
        }}
      >
        Live Order Tracker
      </h3>

      {/* Desktop / Responsive Step Tracker */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          position: 'relative',
          gap: 12,
          flexWrap: 'wrap',
        }}
        className="timeline-steps-container"
      >
        {LIFECYCLE_STEPS.map((step, idx) => {
          const isCompleted = currentStepIndex > idx;
          const isCurrent = currentStepIndex === idx;

          let iconBg = 'var(--color-surface-subtle)';
          let iconColor = 'var(--color-text-light)';
          let borderColor = 'var(--color-border)';

          if (isCompleted) {
            iconBg = 'var(--color-primary-deep)';
            iconColor = '#FFFFFF';
            borderColor = 'var(--color-primary-deep)';
          } else if (isCurrent) {
            iconBg = 'var(--color-primary-subtle)';
            iconColor = 'var(--color-primary-deep)';
            borderColor = 'var(--color-primary-deep)';
          }

          return (
            <div
              key={step.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                flex: '1 1 90px',
                minWidth: 90,
                position: 'relative',
              }}
            >
              {/* Step Circle */}
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: iconBg,
                  color: iconColor,
                  border: `2px solid ${borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                  boxShadow: isCurrent ? '0 0 12px var(--color-primary-glow)' : 'none',
                  transition: 'all var(--transition-normal)',
                }}
              >
                {step.icon}
              </div>

              {/* Step Title */}
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: isCurrent ? 800 : isCompleted ? 700 : 500,
                  color: isCurrent
                    ? 'var(--color-primary-deep)'
                    : isCompleted
                    ? 'var(--color-text-main)'
                    : 'var(--color-text-light)',
                  lineHeight: 1.2,
                }}
              >
                {step.title}
              </div>

              {/* Step Subtitle */}
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--color-text-muted)',
                  marginTop: 2,
                }}
              >
                {step.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
