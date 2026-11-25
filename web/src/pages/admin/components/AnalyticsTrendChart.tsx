import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, IndianRupee, Layers } from 'lucide-react';
import type { TimeSeriesPoint } from '../../../types/reports.types';
import { formatCurrency } from '../../../utils/formatters';

interface AnalyticsTrendChartProps {
  data: TimeSeriesPoint[];
  onSwitchToAllTime?: () => void;
  isAllTime?: boolean;
}

export const AnalyticsTrendChart: React.FC<AnalyticsTrendChartProps> = ({
  data,
  onSwitchToAllTime,
  isAllTime,
}) => {
  const [viewMode, setViewMode] = useState<'volume' | 'revenue'>('volume');
  const [hoveredPoint, setHoveredPoint] = useState<TimeSeriesPoint | null>(null);

  const totalOrders = useMemo(
    () => data.reduce((acc, curr) => acc + curr.orderCount, 0),
    [data]
  );
  const totalRevenue = useMemo(
    () => data.reduce((acc, curr) => acc + curr.orderValue, 0),
    [data]
  );
  const peakPoint = useMemo(() => {
    if (!data.length) return null;
    return data.reduce((max, curr) =>
      curr.orderCount > (max?.orderCount || 0) ? curr : max
    , data[0]);
  }, [data]);

  const maxVal = useMemo(() => {
    if (viewMode === 'volume') {
      const highest = Math.max(...data.map((d) => d.orderCount), 0);
      return Math.max(highest, 5);
    } else {
      const highest = Math.max(...data.map((d) => d.orderValue), 0);
      return Math.max(highest, 1000);
    }
  }, [data, viewMode]);

  const hasData = totalOrders > 0 || totalRevenue > 0;

  return (
    <div
      className="card"
      style={{
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 'var(--radius-lg, 12px)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}
    >
      {/* Chart Header & Controls */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  backgroundColor: 'var(--color-tint, #F0FDF4)',
                  border: '1px solid #BBF7D0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary, #0F5132)',
                }}
              >
                <TrendingUp size={16} />
              </div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  margin: 0,
                  color: 'var(--color-text-main, #1F2937)',
                }}
              >
                Timeline Trends & Velocity
              </h3>
            </div>
            <p
              style={{
                fontSize: 12.5,
                color: 'var(--color-text-muted, #6B7280)',
                margin: '4px 0 0 36px',
              }}
            >
              Daily order fulfillment trajectory and gross revenue throughput
            </p>
          </div>

          {/* View Mode Toggle Button Group */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--color-surface-subtle, #F3F4F6)',
              padding: 3,
              borderRadius: 8,
              border: '1px solid var(--color-border, #E5E7EB)',
            }}
          >
            <button
              onClick={() => setViewMode('volume')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: viewMode === 'volume' ? 700 : 500,
                backgroundColor:
                  viewMode === 'volume' ? 'var(--color-primary, #0F5132)' : 'transparent',
                color: viewMode === 'volume' ? '#FFFFFF' : 'var(--color-text-muted, #6B7280)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Layers size={13} />
              Order Volume
            </button>
            <button
              onClick={() => setViewMode('revenue')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: viewMode === 'revenue' ? 700 : 500,
                backgroundColor:
                  viewMode === 'revenue' ? 'var(--color-primary, #0F5132)' : 'transparent',
                color: viewMode === 'revenue' ? '#FFFFFF' : 'var(--color-text-muted, #6B7280)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <IndianRupee size={13} />
              Gross Revenue (₹)
            </button>
          </div>
        </div>

        {/* Legend & Stats Quick Strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            padding: '8px 12px',
            backgroundColor: 'var(--color-surface-subtle, #F9FAFB)',
            borderRadius: 8,
            border: '1px solid var(--color-border, #E5E7EB)',
            fontSize: 12,
          }}
        >
          {viewMode === 'volume' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: 'var(--color-primary, #0F5132)' }} />
                <span style={{ color: 'var(--color-text-main, #1F2937)', fontWeight: 500 }}>Total Placed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: '#22C55E' }} />
                <span style={{ color: 'var(--color-text-main, #1F2937)', fontWeight: 500 }}>Completed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: '#EF4444' }} />
                <span style={{ color: 'var(--color-text-main, #1F2937)', fontWeight: 500 }}>Cancelled</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: 'var(--color-primary, #0F5132)' }} />
              <span style={{ color: 'var(--color-text-main, #1F2937)', fontWeight: 600 }}>
                Daily Revenue Value (Collected + Active)
              </span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--color-text-muted, #6B7280)' }}>
            <span>
              Period Total:{' '}
              <strong style={{ color: 'var(--color-primary, #0F5132)' }}>
                {viewMode === 'volume' ? `${totalOrders} orders` : formatCurrency(totalRevenue)}
              </strong>
            </span>
            {peakPoint && peakPoint.orderCount > 0 && (
              <span>
                Peak:{' '}
                <strong style={{ color: 'var(--color-text-main, #1F2937)' }}>
                  {peakPoint.date} ({peakPoint.orderCount})
                </strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Chart Visualization */}
      {!hasData ? (
        <div
          style={{
            height: 220,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-surface-subtle, #FAFAFA)',
            borderRadius: 8,
            border: '1px dashed var(--color-border, #E5E7EB)',
            padding: 24,
            textAlign: 'center',
          }}
        >
          <BarChart3 size={36} color="var(--color-text-muted, #9CA3AF)" style={{ marginBottom: 10, opacity: 0.6 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-main, #374151)', marginBottom: 4 }}>
            No order trends in this timeframe
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--color-text-muted, #6B7280)', maxWidth: 320, margin: '0 0 14px 0' }}>
            There were no orders recorded during the selected period.
          </p>
          {!isAllTime && onSwitchToAllTime && (
            <button
              onClick={onSwitchToAllTime}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                backgroundColor: 'var(--color-primary, #0F5132)',
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Switch to All Time Range
            </button>
          )}
        </div>
      ) : (
        <div>
          {/* Tooltip Inspector Strip */}
          <div
            style={{
              minHeight: 32,
              fontSize: 12.5,
              color: 'var(--color-text-main, #1F2937)',
              backgroundColor: hoveredPoint
                ? 'var(--color-tint, #F0FDF4)'
                : 'transparent',
              border: hoveredPoint ? '1px solid #BBF7D0' : '1px solid transparent',
              padding: '6px 14px',
              borderRadius: 6,
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease',
            }}
          >
            {hoveredPoint ? (
              <>
                <span>
                  <strong>{hoveredPoint.date}</strong> &nbsp;—&nbsp;
                  {viewMode === 'volume' ? (
                    <>
                      Total: <strong>{hoveredPoint.orderCount}</strong> (
                      <span style={{ color: '#16A34A', fontWeight: 600 }}>{hoveredPoint.completedCount} completed</span>,{' '}
                      <span style={{ color: '#EF4444', fontWeight: 600 }}>{hoveredPoint.cancelledCount} cancelled</span>)
                    </>
                  ) : (
                    <>
                      Value: <strong style={{ color: 'var(--color-primary, #0F5132)' }}>{formatCurrency(hoveredPoint.orderValue)}</strong>
                      &nbsp;({hoveredPoint.orderCount} orders)
                    </>
                  )}
                </span>
                <span style={{ fontSize: 11.5, color: 'var(--color-text-muted, #6B7280)' }}>
                  {formatCurrency(hoveredPoint.orderValue)} revenue
                </span>
              </>
            ) : (
              <span style={{ color: 'var(--color-text-muted, #9CA3AF)', fontSize: 12 }}>
                Hover over bars to inspect daily metrics.
              </span>
            )}
          </div>

          {/* SVG & Bar Chart container */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: Math.max(3, Math.min(14, Math.floor(640 / (data.length || 1)))),
              height: 180,
              borderBottom: '2px solid var(--color-border, #E5E7EB)',
              paddingBottom: 2,
              paddingTop: 12,
              position: 'relative',
            }}
          >
            {data.map((pt, idx) => {
              const currentVal = viewMode === 'volume' ? pt.orderCount : pt.orderValue;
              const barHeightPct = maxVal > 0 ? (currentVal / maxVal) * 100 : 0;
              const completedHeightPct =
                pt.orderCount > 0 ? (pt.completedCount / pt.orderCount) * 100 : 0;
              const cancelledHeightPct =
                pt.orderCount > 0 ? (pt.cancelledCount / pt.orderCount) * 100 : 0;

              const isHovered = hoveredPoint?.date === pt.date;

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
                  {/* The Bar */}
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 24,
                      minHeight: currentVal > 0 ? 8 : 2,
                      height: `${Math.max(barHeightPct, currentVal > 0 ? 8 : 2)}%`,
                      backgroundColor:
                        currentVal > 0
                          ? 'var(--color-primary, #0F5132)'
                          : 'var(--color-border, #E5E7EB)',
                      borderRadius: '4px 4px 0 0',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'height 0.25s ease, transform 0.15s ease, opacity 0.15s ease',
                      opacity: hoveredPoint && !isHovered ? 0.4 : 1,
                      transform: isHovered ? 'scaleY(1.05)' : 'none',
                      transformOrigin: 'bottom',
                      boxShadow: isHovered ? '0 2px 8px rgba(15, 81, 50, 0.25)' : 'none',
                    }}
                  >
                    {/* For volume view, show stacked completed & cancelled sub-bars */}
                    {viewMode === 'volume' && (
                      <>
                        {pt.completedCount > 0 && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: `${completedHeightPct}%`,
                              backgroundColor: '#22C55E',
                            }}
                          />
                        )}
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
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-Axis Axis Label Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11,
              fontWeight: 500,
              color: 'var(--color-text-muted, #6B7280)',
              marginTop: 8,
              padding: '0 4px',
            }}
          >
            <span>{data[0]?.date}</span>
            {data.length > 2 && (
              <span>{data[Math.floor(data.length / 2)]?.date}</span>
            )}
            <span>{data[data.length - 1]?.date}</span>
          </div>
        </div>
      )}
    </div>
  );
};
