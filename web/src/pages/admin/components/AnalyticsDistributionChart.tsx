import React, { useState, useMemo } from 'react';
import { PieChart, CheckCircle2, Clock, AlertTriangle, XCircle, ShoppingBag } from 'lucide-react';
import type { OrderStatusMetric } from '../../../types/reports.types';
import { formatCurrency } from '../../../utils/formatters';

interface AnalyticsDistributionChartProps {
  data: OrderStatusMetric[];
  onSwitchToAllTime?: () => void;
  isAllTime?: boolean;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  COLLECTED: {
    label: 'Completed (Collected)',
    color: '#16A34A',
    bg: '#DCFCE7',
    icon: <CheckCircle2 size={13} />,
  },
  READY_FOR_PICKUP: {
    label: 'Ready for Pickup',
    color: '#0D9488',
    bg: '#CCFBF1',
    icon: <Clock size={13} />,
  },
  PREPARING: {
    label: 'Preparing Basket',
    color: '#D97706',
    bg: '#FEF3C7',
    icon: <ShoppingBag size={13} />,
  },
  CONFIRMED: {
    label: 'Confirmed by Shop',
    color: '#2563EB',
    bg: '#DBEAFE',
    icon: <Clock size={13} />,
  },
  PENDING: {
    label: 'Pending Placement',
    color: '#6366F1',
    bg: '#EEF2FF',
    icon: <Clock size={13} />,
  },
  CANCELLED: {
    label: 'Cancelled by Customer',
    color: '#EF4444',
    bg: '#FEE2E2',
    icon: <XCircle size={13} />,
  },
  REJECTED: {
    label: 'Rejected by Merchant',
    color: '#DC2626',
    bg: '#FEE2E2',
    icon: <AlertTriangle size={13} />,
  },
};

export const AnalyticsDistributionChart: React.FC<AnalyticsDistributionChartProps> = ({
  data,
  onSwitchToAllTime,
  isAllTime,
}) => {
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

  const totalCount = useMemo(
    () => data.reduce((acc, curr) => acc + curr.count, 0),
    [data]
  );
  const totalValue = useMemo(
    () => data.reduce((acc, curr) => acc + curr.totalValue, 0),
    [data]
  );

  const activeSegments = useMemo(
    () => data.filter((d) => d.count > 0),
    [data]
  );

  // SVG Donut calculation
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute stroke offsets for each active segment
  let cumulativePct = 0;
  const segmentsWithAngles = activeSegments.map((seg) => {
    const pct = totalCount > 0 ? (seg.count / totalCount) * 100 : 0;
    const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePct / 100) * circumference);
    cumulativePct += pct;
    return {
      ...seg,
      pct,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeHoveredData = useMemo(() => {
    if (!hoveredStatus) return null;
    return data.find((d) => d.status === hoveredStatus) || null;
  }, [hoveredStatus, data]);

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
        height: '100%',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
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
            <PieChart size={16} />
          </div>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              margin: 0,
              color: 'var(--color-text-main, #1F2937)',
            }}
          >
            Order Lifecycle Distribution
          </h3>
        </div>
        <p
          style={{
            fontSize: 12.5,
            color: 'var(--color-text-muted, #6B7280)',
            margin: '4px 0 0 36px',
          }}
        >
          Proportion of orders across platform fulfillment lifecycle states
        </p>
      </div>

      {totalCount === 0 ? (
        <div
          style={{
            minHeight: 240,
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
          <PieChart size={36} color="var(--color-text-muted, #9CA3AF)" style={{ marginBottom: 10, opacity: 0.6 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-main, #374151)', marginBottom: 4 }}>
            No lifecycle events in this period
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--color-text-muted, #6B7280)', maxWidth: 280, margin: '0 0 14px 0' }}>
            No orders were placed or updated during the selected timeframe.
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(180px, 200px) 1fr',
            gap: 20,
            alignItems: 'center',
          }}
        >
          {/* Left: SVG Donut Visual */}
          <div
            style={{
              position: 'relative',
              width: size,
              height: size,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
            >
              {/* Background Ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="var(--color-border, #E5E7EB)"
                strokeWidth={strokeWidth}
              />
              {/* Segments */}
              {segmentsWithAngles.map((seg, idx) => {
                const config = STATUS_CONFIG[seg.status] || { color: '#9CA3AF' };
                const isHovered = hoveredStatus === seg.status;

                return (
                  <circle
                    key={idx}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={config.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                      transition: 'all 0.25s ease',
                      cursor: 'pointer',
                      opacity: hoveredStatus && !isHovered ? 0.35 : 1,
                    }}
                    onMouseEnter={() => setHoveredStatus(seg.status)}
                    onMouseLeave={() => setHoveredStatus(null)}
                  />
                );
              })}
            </svg>

            {/* Donut Center Display */}
            <div
              style={{
                position: 'absolute',
                textAlign: 'center',
                pointerEvents: 'none',
                padding: '0 8px',
              }}
            >
              {activeHoveredData ? (
                <>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color:
                        STATUS_CONFIG[activeHoveredData.status]?.color ||
                        'var(--color-text-main, #1F2937)',
                      lineHeight: 1.1,
                    }}
                  >
                    {Math.round((activeHoveredData.count / totalCount) * 100)}%
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--color-text-muted, #6B7280)',
                      marginTop: 2,
                      maxWidth: 90,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {activeHoveredData.count} orders
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: 'var(--color-text-main, #1F2937)',
                      lineHeight: 1,
                    }}
                  >
                    {totalCount}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--color-text-muted, #6B7280)',
                      marginTop: 2,
                    }}
                  >
                    Total Orders
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right: Status Breakdown List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {activeSegments.map((d, idx) => {
              const config = STATUS_CONFIG[d.status] || {
                label: d.status,
                color: '#6B7280',
                bg: '#F3F4F6',
                icon: null,
              };
              const isHovered = hoveredStatus === d.status;
              const pct = Math.round((d.count / totalCount) * 100);

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredStatus(d.status)}
                  onMouseLeave={() => setHoveredStatus(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 6,
                    backgroundColor: isHovered
                      ? 'var(--color-surface-subtle, #F3F4F6)'
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                    border: '1px solid',
                    borderColor: isHovered
                      ? 'var(--color-border, #E5E7EB)'
                      : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: config.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: isHovered ? 700 : 500,
                        color: 'var(--color-text-main, #1F2937)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {config.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--color-text-main, #1F2937)',
                      }}
                    >
                      {d.count}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        padding: '1px 6px',
                        borderRadius: 4,
                        backgroundColor: config.bg,
                        color: config.color,
                        fontWeight: 700,
                      }}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Total Value Summary Footnote */}
            {totalValue > 0 && (
              <div
                style={{
                  marginTop: 6,
                  paddingTop: 8,
                  borderTop: '1px solid var(--color-border, #E5E7EB)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 11.5,
                  color: 'var(--color-text-muted, #6B7280)',
                }}
              >
                <span>Fulfillment Value:</span>
                <strong style={{ color: 'var(--color-primary, #0F5132)' }}>
                  {formatCurrency(totalValue)}
                </strong>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
