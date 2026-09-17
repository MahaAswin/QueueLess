import React, { useState } from 'react';
import type { TimeSeriesPoint } from '../../../types/reports.types';
import { formatCurrency } from '../../../utils/formatters';

interface AnalyticsTrendChartProps {
  data: TimeSeriesPoint[];
}

export const AnalyticsTrendChart: React.FC<AnalyticsTrendChartProps> = ({ data }) => {
  const [hoveredPoint, setHoveredPoint] = useState<TimeSeriesPoint | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        className="card"
        style={{
          padding: '36px 20px',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: 13.5,
        }}
      >
        No timeline data available for the selected timeframe.
      </div>
    );
  }

  const maxOrders = Math.max(...data.map((d) => d.orderCount), 5);

  const height = 220;
  const paddingY = 24;
  const chartHeight = height - paddingY * 2;

  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
            Order Volume & Activity Timeline
          </h3>
          <p style={{ fontSize: 12.5, color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
            Daily order placement trends and completed pickups
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#0284C7' }} />
            <span style={{ color: 'var(--color-text-muted)' }}>Total Placed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#10B981' }} />
            <span style={{ color: 'var(--color-text-muted)' }}>Completed (Collected)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#EF4444' }} />
            <span style={{ color: 'var(--color-text-muted)' }}>Cancelled / Rejected</span>
          </div>
        </div>
      </div>

      {/* Hover Info Tooltip Banner */}
      <div
        style={{
          minHeight: 28,
          fontSize: 12.5,
          color: 'var(--color-text-main)',
          backgroundColor: 'var(--color-surface-subtle)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {hoveredPoint ? (
          <>
            <span>
              <strong>{hoveredPoint.date}</strong> — Orders: <strong>{hoveredPoint.orderCount}</strong> (
              <span style={{ color: '#10B981' }}>{hoveredPoint.completedCount} collected</span>,{' '}
              <span style={{ color: '#EF4444' }}>{hoveredPoint.cancelledCount} cancelled</span>)
            </span>
            <span style={{ fontWeight: 700, color: '#0284C7' }}>
              Daily Value: {formatCurrency(hoveredPoint.orderValue)}
            </span>
          </>
        ) : (
          <span style={{ color: 'var(--color-text-muted)' }}>
            Hover over any bar in the timeline to inspect detailed daily breakdown.
          </span>
        )}
      </div>

      {/* Bar Chart Visualization */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: Math.max(2, Math.min(12, 600 / data.length)),
          height: chartHeight,
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: 4,
          paddingTop: 10,
        }}
      >
        {data.map((pt, idx) => {
          const barHeightPct = (pt.orderCount / maxOrders) * 100;
          const completedHeightPct = pt.orderCount > 0 ? (pt.completedCount / pt.orderCount) * 100 : 0;
          const cancelledHeightPct = pt.orderCount > 0 ? (pt.cancelledCount / pt.orderCount) * 100 : 0;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{
                flex: 1,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              {/* Stacked Bar */}
              <div
                style={{
                  width: '100%',
                  maxWidth: 24,
                  height: `${Math.max(barHeightPct, pt.orderCount > 0 ? 8 : 2)}%`,
                  backgroundColor: pt.orderCount > 0 ? '#0284C7' : 'var(--color-border)',
                  borderRadius: '3px 3px 0 0',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'height 0.2s ease, opacity 0.15s ease',
                  opacity: hoveredPoint && hoveredPoint.date !== pt.date ? 0.45 : 1,
                }}
              >
                {/* Completed sub-bar */}
                {pt.completedCount > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: `${completedHeightPct}%`,
                      backgroundColor: '#10B981',
                    }}
                  />
                )}
                {/* Cancelled sub-bar */}
                {pt.cancelledCount > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: `${cancelledHeightPct}%`,
                      backgroundColor: '#EF4444',
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* X Axis Labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: 'var(--color-text-muted)',
          marginTop: 6,
        }}
      >
        <span>{data[0]?.date}</span>
        {data.length > 2 && <span>{data[Math.floor(data.length / 2)]?.date}</span>}
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
};
