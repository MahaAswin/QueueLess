import React from 'react';
import type { OrderStatusMetric } from '../../../types/reports.types';
import { formatCurrency } from '../../../utils/formatters';

interface AnalyticsDistributionChartProps {
  data: OrderStatusMetric[];
}

const STATUS_COLOR_MAP: Record<string, string> = {
  COLLECTED: '#10B981', // green
  READY_FOR_PICKUP: '#059669', // emerald
  PREPARING: '#F59E0B', // amber
  CONFIRMED: '#0284C7', // sky
  PENDING: '#6366F1', // indigo
  CANCELLED: '#EF4444', // red
  REJECTED: '#DC2626', // dark red
};

const STATUS_LABEL_MAP: Record<string, string> = {
  COLLECTED: 'Completed (Collected)',
  READY_FOR_PICKUP: 'Ready for Pickup',
  PREPARING: 'Preparing Basket',
  CONFIRMED: 'Confirmed by Shop',
  PENDING: 'Pending Placement',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
};

export const AnalyticsDistributionChart: React.FC<AnalyticsDistributionChartProps> = ({
  data,
}) => {
  const totalCount = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="card" style={{ padding: '20px 24px', height: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
          Order Lifecycle Distribution
        </h3>
        <p style={{ fontSize: 12.5, color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
          Breakdown of orders across platform lifecycle states
        </p>
      </div>

      {totalCount === 0 ? (
        <div
          style={{
            padding: '24px 0',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontSize: 13,
          }}
        >
          No orders recorded in this period.
        </div>
      ) : (
        <>
          {/* Segmented Progress Bar */}
          <div
            style={{
              height: 14,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-surface-subtle)',
              display: 'flex',
              overflow: 'hidden',
              marginBottom: 18,
            }}
          >
            {data
              .filter((d) => d.count > 0)
              .map((d, idx) => (
                <div
                  key={idx}
                  title={`${STATUS_LABEL_MAP[d.status] || d.status}: ${d.count} (${d.percentage}%)`}
                  style={{
                    width: `${d.percentage}%`,
                    backgroundColor: STATUS_COLOR_MAP[d.status] || '#94A3B8',
                    transition: 'width 0.3s ease',
                  }}
                />
              ))}
          </div>

          {/* Status Breakdown List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data
              .filter((d) => d.count > 0)
              .map((d, idx) => {
                const color = STATUS_COLOR_MAP[d.status] || '#94A3B8';
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 12.5,
                      padding: '6px 0',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: color,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                        {STATUS_LABEL_MAP[d.status] || d.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>
                        {d.count} ({d.percentage}%)
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-main)', minWidth: 65, textAlign: 'right' }}>
                        {formatCurrency(d.totalValue)}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
};
