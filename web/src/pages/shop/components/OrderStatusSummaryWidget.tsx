import React from 'react';
import { Link } from 'react-router-dom';
import type { OrderStatus } from '../../../types/order.types';
import { getOrderStatusMeta } from '../../../utils/formatters';
import { Badge } from '../../../components/ui/Badge';

interface OrderStatusSummaryWidgetProps {
  statusBreakdown: Record<OrderStatus, number>;
  loading?: boolean;
}

const DISPLAY_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'COLLECTED',
  'CANCELLED',
];

export const OrderStatusSummaryWidget: React.FC<OrderStatusSummaryWidgetProps> = ({
  statusBreakdown,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="card" style={{ height: '100%' }}>
        <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="skeleton" style={{ height: 32 }} />
          <div className="skeleton" style={{ height: 32 }} />
          <div className="skeleton" style={{ height: 32 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Order Status Breakdown</h3>
        <Link to="/shop-owner/orders" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-primary)' }}>
          All Orders →
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {DISPLAY_STATUSES.map((status) => {
          const count = statusBreakdown[status] || 0;
          const meta = getOrderStatusMeta(status);

          return (
            <Link
              key={status}
              to={`/shop-owner/orders?status=${status}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-subtle)',
                transition: 'background-color var(--transition-fast)',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface-subtle)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: count > 0 ? 'var(--color-text-main)' : 'var(--color-text-light)',
                }}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
