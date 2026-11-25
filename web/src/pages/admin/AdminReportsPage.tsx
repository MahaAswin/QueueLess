import React, { useMemo } from 'react';
import {
  BarChart3,
  Download,
  RefreshCw,
  TrendingUp,
  Receipt,
  Store,
  Users,
  AlertCircle,
  Calendar,
  Info,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { useAdminReports } from './hooks/useAdminReports';
import { AnalyticsTrendChart } from './components/AnalyticsTrendChart';
import { AnalyticsDistributionChart } from './components/AnalyticsDistributionChart';
import { TopShopsReportTable } from './components/TopShopsReportTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ErrorState } from '../../components/feedback/ErrorState';
import { formatCurrency } from '../../utils/formatters';
import type { DateRangePreset } from '../../types/reports.types';

const COMPLAINT_TYPE_TITLES: Record<string, string> = {
  SHOP_DELAY: 'Order Delay by Merchant',
  SHOP_WRONG_ORDER: 'Wrong / Mismatched Items',
  SHOP_ORDER_REFUSAL: 'Shop Order Refusal',
  SHOP_OTHER: 'Other Shop Issues',
  CUSTOMER_NO_SHOW: 'Customer Pickup No-Show',
  CUSTOMER_ABUSE: 'Customer Inappropriate Behavior',
  CUSTOMER_FRAUD: 'Payment / Identity Discrepancy',
  CUSTOMER_OTHER: 'Other Customer Issues',
};

export const AdminReportsPage: React.FC = () => {
  const {
    preset,
    setPreset,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    data,
    loading,
    error,
    refetch,
    exportCSV,
  } = useAdminReports();

  const presets: { label: string; value: DateRangePreset }[] = [
    { label: 'All Time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 90 Days', value: '90d' },
    { label: 'Custom', value: 'custom' },
  ];

  // Calculate fulfillment rate
  const fulfillmentRate = useMemo(() => {
    if (!data || data.overview.totalOrders === 0) return 0;
    return Math.round((data.overview.completedOrders / data.overview.totalOrders) * 100);
  }, [data]);

  // Aggregate Category Breakdown from top shops
  const categoryBreakdown = useMemo(() => {
    if (!data || !data.topShops) return [];
    const catMap: Record<string, { orderCount: number; revenue: number; shopCount: number }> = {};

    data.topShops.forEach((shop) => {
      const cat = shop.category || 'GENERAL';
      if (!catMap[cat]) {
        catMap[cat] = { orderCount: 0, revenue: 0, shopCount: 0 };
      }
      catMap[cat].orderCount += shop.totalOrders;
      catMap[cat].revenue += shop.totalOrderValue;
      catMap[cat].shopCount += 1;
    });

    const totalOrders = Object.values(catMap).reduce((a, b) => a + b.orderCount, 0) || 1;

    return Object.entries(catMap).map(([cat, info]) => ({
      category: cat.replace(/_/g, ' '),
      orderCount: info.orderCount,
      revenue: info.revenue,
      shopCount: info.shopCount,
      percentage: Math.round((info.orderCount / totalOrders) * 100),
    }));
  }, [data]);

  const activeDateLabel = useMemo(() => {
    if (preset === 'all') return 'All Historical Platform Data';
    if (preset === 'today') return 'Today’s Performance';
    if (preset === '7d') return 'Past 7 Calendar Days';
    if (preset === '30d') return 'Past 30 Calendar Days';
    if (preset === '90d') return 'Past 90 Calendar Days';
    if (preset === 'custom') {
      return customFrom && customTo ? `${customFrom} to ${customTo}` : 'Custom Date Range';
    }
    return '';
  }, [preset, customFrom, customTo]);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', paddingBottom: 40 }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: 'var(--color-tint, #F0FDF4)',
              border: '1px solid #BBF7D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary, #0F5132)',
            }}
          >
            <BarChart3 size={22} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: 'var(--color-text-main, #1F2937)',
                margin: 0,
                letterSpacing: '-0.3px',
              }}
            >
              Platform Analytics & Reports
            </h1>
            <p
              style={{
                color: 'var(--color-text-muted, #6B7280)',
                fontSize: 13,
                margin: '3px 0 0 0',
              }}
            >
              Operational throughput, merchant metrics, and system governance reports
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={refetch}
            disabled={loading}
            icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={exportCSV}
            disabled={loading || !data}
            icon={<Download size={14} />}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Date Range Selector Toolbar */}
      <div
        className="card"
        style={{
          padding: '12px 18px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
          borderRadius: 'var(--radius-lg, 12px)',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface, #FFFFFF)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--color-text-muted, #6B7280)',
            }}
          >
            <Calendar size={15} color="var(--color-primary, #0F5132)" />
            <span>Timeframe:</span>
          </div>

          {/* Segmented Control */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--color-surface-subtle, #F3F4F6)',
              padding: 3,
              borderRadius: 8,
              gap: 3,
              border: '1px solid var(--color-border, #E5E7EB)',
            }}
          >
            {presets.map((p) => {
              const isActive = preset === p.value;
              return (
                <button
                  key={p.value}
                  onClick={() => setPreset(p.value)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: isActive ? 700 : 500,
                    backgroundColor: isActive
                      ? 'var(--color-primary, #0F5132)'
                      : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--color-text-muted, #6B7280)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Range Badge & Custom inputs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {preset === 'custom' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
              <input
                type="date"
                className="input"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                style={{
                  padding: '5px 10px',
                  fontSize: 12,
                  borderRadius: 6,
                  border: '1px solid var(--color-border)',
                }}
              />
              <span style={{ color: 'var(--color-text-muted)' }}>to</span>
              <input
                type="date"
                className="input"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                style={{
                  padding: '5px 10px',
                  fontSize: 12,
                  borderRadius: 6,
                  border: '1px solid var(--color-border)',
                }}
              />
            </div>
          ) : (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--color-primary, #0F5132)',
                backgroundColor: 'var(--color-tint, #F0FDF4)',
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid #BBF7D0',
              }}
            >
              {activeDateLabel}
            </span>
          )}
        </div>
      </div>

      {/* Zero Activity Notice Banner when a restrictive preset has 0 orders */}
      {data && data.overview.totalOrders === 0 && preset !== 'all' && (
        <div
          style={{
            padding: '12px 18px',
            marginBottom: 20,
            borderRadius: 8,
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Info size={18} color="#2563EB" />
            <span style={{ fontSize: 13, color: '#1E40AF', fontWeight: 500 }}>
              No orders were placed in the selected window (
              <strong>{activeDateLabel}</strong>). Switch to <strong>All Time</strong> to view all
              historical platform records.
            </span>
          </div>
          <button
            onClick={() => setPreset('all')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Switch to All Time Range
          </button>
        </div>
      )}

      {/* Loading & Error States */}
      {loading && !data ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <RefreshCw
            size={32}
            className="animate-spin"
            style={{ color: 'var(--color-primary, #0F5132)', margin: '0 auto 14px' }}
          />
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--color-text-main, #1F2937)',
            }}
          >
            Calculating platform analytics from database...
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--color-text-muted, #6B7280)', marginTop: 4 }}>
            Aggregating orders, revenue, merchant fulfillment, and governance data
          </p>
        </div>
      ) : error && !data ? (
        <ErrorState
          title="Unable to load platform reports"
          message={error}
          onRetry={refetch}
        />
      ) : data ? (
        <>
          {/* Executive Overview KPI Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 16,
              marginBottom: 24,
            }}
          >
            {/* KPI 1: Orders & Throughput */}
            <div
              className="card"
              style={{
                padding: '20px 22px',
                borderRadius: 'var(--radius-lg, 12px)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: 'var(--color-text-muted, #6B7280)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Orders & Throughput
                  </span>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 6,
                      backgroundColor: 'var(--color-tint, #F0FDF4)',
                      border: '1px solid #BBF7D0',
                      color: 'var(--color-primary, #0F5132)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Receipt size={16} />
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: 'var(--color-text-main, #1F2937)',
                    lineHeight: 1.1,
                  }}
                >
                  {data.overview.totalOrders}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--color-text-muted, #6B7280)',
                    marginTop: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <strong style={{ color: '#16A34A' }}>
                    {data.overview.completedOrders} completed
                  </strong>
                  <span>•</span>
                  <span style={{ color: '#EF4444' }}>
                    {data.overview.cancelledOrders} cancelled
                  </span>
                </div>
              </div>

              {/* Progress pill */}
              <div
                style={{
                  marginTop: 14,
                  paddingTop: 10,
                  borderTop: '1px solid var(--color-border, #E5E7EB)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 11.5,
                }}
              >
                <span style={{ color: 'var(--color-text-muted)' }}>Fulfillment Rate:</span>
                <span
                  style={{
                    fontWeight: 700,
                    color: fulfillmentRate >= 80 ? '#16A34A' : '#D97706',
                    backgroundColor: fulfillmentRate >= 80 ? '#DCFCE7' : '#FEF3C7',
                    padding: '2px 8px',
                    borderRadius: 10,
                  }}
                >
                  {fulfillmentRate}%
                </span>
              </div>
            </div>

            {/* KPI 2: Collected Order Value */}
            <div
              className="card"
              style={{
                padding: '20px 22px',
                borderRadius: 'var(--radius-lg, 12px)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: 'var(--color-text-muted, #6B7280)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Collected Order Value
                  </span>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 6,
                      backgroundColor: 'var(--color-tint, #F0FDF4)',
                      border: '1px solid #BBF7D0',
                      color: 'var(--color-primary, #0F5132)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TrendingUp size={16} />
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: 'var(--color-primary, #0F5132)',
                    lineHeight: 1.1,
                  }}
                >
                  {formatCurrency(data.overview.collectedOrderValue)}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--color-text-muted, #6B7280)',
                    marginTop: 6,
                  }}
                >
                  Avg Basket: <strong>{formatCurrency(data.overview.averageOrderValue)}</strong>
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  paddingTop: 10,
                  borderTop: '1px solid var(--color-border, #E5E7EB)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 11.5,
                  color: 'var(--color-text-muted)',
                }}
              >
                <span>Gross Volume:</span>
                <strong style={{ color: 'var(--color-text-main)' }}>
                  {formatCurrency(data.overview.totalOrderValue)}
                </strong>
              </div>
            </div>

            {/* KPI 3: Storefront Operations */}
            <div
              className="card"
              style={{
                padding: '20px 22px',
                borderRadius: 'var(--radius-lg, 12px)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: 'var(--color-text-muted, #6B7280)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Merchant Outlets
                  </span>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 6,
                      backgroundColor: 'var(--color-tint, #F0FDF4)',
                      border: '1px solid #BBF7D0',
                      color: 'var(--color-primary, #0F5132)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Store size={16} />
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: 'var(--color-text-main, #1F2937)',
                    lineHeight: 1.1,
                  }}
                >
                  {data.overview.activeShops}{' '}
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: 'var(--color-text-muted, #6B7280)',
                    }}
                  >
                    / {data.overview.totalShops}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--color-text-muted, #6B7280)',
                    marginTop: 6,
                  }}
                >
                  <strong>{data.overview.pendingShops}</strong> pending approval •{' '}
                  <span style={{ color: '#EF4444' }}>
                    {data.overview.suspendedShops} suspended
                  </span>
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  paddingTop: 10,
                  borderTop: '1px solid var(--color-border, #E5E7EB)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 11.5,
                }}
              >
                <span style={{ color: 'var(--color-text-muted)' }}>Store Availability:</span>
                <span
                  style={{
                    fontWeight: 700,
                    color: '#16A34A',
                    backgroundColor: '#DCFCE7',
                    padding: '2px 8px',
                    borderRadius: 10,
                  }}
                >
                  {data.overview.totalShops > 0
                    ? `${Math.round((data.overview.activeShops / data.overview.totalShops) * 100)}% Online`
                    : '0%'}
                </span>
              </div>
            </div>

            {/* KPI 4: Governance & Disputes */}
            <div
              className="card"
              style={{
                padding: '20px 22px',
                borderRadius: 'var(--radius-lg, 12px)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: 'var(--color-text-muted, #6B7280)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Disputes & Governance
                  </span>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 6,
                      backgroundColor: 'var(--color-tint, #F0FDF4)',
                      border: '1px solid #BBF7D0',
                      color: 'var(--color-primary, #0F5132)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShieldCheck size={16} />
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: 'var(--color-text-main, #1F2937)',
                    lineHeight: 1.1,
                  }}
                >
                  {data.overview.totalComplaints}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--color-text-muted, #6B7280)',
                    marginTop: 6,
                  }}
                >
                  <strong style={{ color: '#D97706' }}>
                    {data.overview.pendingComplaints} action required
                  </strong>{' '}
                  •{' '}
                  <span style={{ color: '#16A34A' }}>
                    {data.overview.resolvedComplaints} resolved
                  </span>
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  paddingTop: 10,
                  borderTop: '1px solid var(--color-border, #E5E7EB)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 11.5,
                }}
              >
                <span style={{ color: 'var(--color-text-muted)' }}>Trust Index:</span>
                <span
                  style={{
                    fontWeight: 700,
                    color: data.overview.pendingComplaints === 0 ? '#16A34A' : '#D97706',
                    backgroundColor:
                      data.overview.pendingComplaints === 0 ? '#DCFCE7' : '#FEF3C7',
                    padding: '2px 8px',
                    borderRadius: 10,
                  }}
                >
                  {data.overview.pendingComplaints === 0 ? 'Healthy (Low Risk)' : 'Action Needed'}
                </span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
              gap: 20,
              marginBottom: 24,
            }}
          >
            {/* Trend Chart */}
            <AnalyticsTrendChart
              data={data.ordersOverTime}
              onSwitchToAllTime={() => setPreset('all')}
              isAllTime={preset === 'all'}
            />

            {/* Lifecycle Distribution Chart */}
            <AnalyticsDistributionChart
              data={data.orderStatusDistribution}
              onSwitchToAllTime={() => setPreset('all')}
              isAllTime={preset === 'all'}
            />
          </div>

          {/* Top Performing Shops Ranking Table */}
          <div style={{ marginBottom: 24 }}>
            <TopShopsReportTable
              shops={data.topShops}
              onSwitchToAllTime={() => setPreset('all')}
              isAllTime={preset === 'all'}
            />
          </div>

          {/* Bottom Insights Grid: Category Breakdown + Disputes + Demographics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 20,
            }}
          >
            {/* Category Revenue Breakdown Card */}
            <div
              className="card"
              style={{
                padding: '22px 24px',
                borderRadius: 'var(--radius-lg, 12px)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      backgroundColor: 'var(--color-tint, #F0FDF4)',
                      border: '1px solid #BBF7D0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-primary, #0F5132)',
                    }}
                  >
                    <ShoppingBag size={14} />
                  </div>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      margin: 0,
                      color: 'var(--color-text-main, #1F2937)',
                    }}
                  >
                    Revenue by Merchant Category
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--color-text-muted, #6B7280)',
                    margin: '4px 0 0 34px',
                  }}
                >
                  Order volume distribution across store classifications
                </p>
              </div>

              {categoryBreakdown.length === 0 ? (
                <div
                  style={{
                    padding: '28px 0',
                    textAlign: 'center',
                    color: 'var(--color-text-muted, #6B7280)',
                    fontSize: 13,
                  }}
                >
                  No category activity in this period.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {categoryBreakdown.map((cat, idx) => (
                    <div key={idx} style={{ fontSize: 12.5 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 5,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            color: 'var(--color-text-main, #1F2937)',
                            textTransform: 'capitalize',
                          }}
                        >
                          {cat.category.toLowerCase()}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: 'var(--color-text-muted, #6B7280)' }}>
                            {cat.orderCount} orders
                          </span>
                          <strong style={{ color: 'var(--color-primary, #0F5132)' }}>
                            {formatCurrency(cat.revenue)}
                          </strong>
                        </div>
                      </div>
                      <div
                        style={{
                          height: 6,
                          borderRadius: 'var(--radius-full, 9999px)',
                          backgroundColor: 'var(--color-surface-subtle, #F3F4F6)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${cat.percentage}%`,
                            backgroundColor: 'var(--color-primary, #0F5132)',
                            borderRadius: 'var(--radius-full, 9999px)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Disputes Breakdown Card */}
            <div
              className="card"
              style={{
                padding: '22px 24px',
                borderRadius: 'var(--radius-lg, 12px)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      backgroundColor: 'var(--color-tint, #F0FDF4)',
                      border: '1px solid #BBF7D0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-primary, #0F5132)',
                    }}
                  >
                    <AlertCircle size={14} />
                  </div>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      margin: 0,
                      color: 'var(--color-text-main, #1F2937)',
                    }}
                  >
                    Disputes by Category
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--color-text-muted, #6B7280)',
                    margin: '4px 0 0 34px',
                  }}
                >
                  Frequency distribution of reported issue types
                </p>
              </div>

              {Object.keys(data.complaintsByType).length === 0 ? (
                <div
                  style={{
                    padding: '28px 0',
                    textAlign: 'center',
                    color: 'var(--color-text-muted, #6B7280)',
                    fontSize: 13,
                  }}
                >
                  <ShieldCheck
                    size={28}
                    color="#16A34A"
                    style={{ margin: '0 auto 8px', display: 'block' }}
                  />
                  No customer or merchant disputes filed yet. Platform trust is high.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Object.entries(data.complaintsByType).map(([type, count], idx) => {
                    const totalComplaints = data.overview.totalComplaints || 1;
                    const pct = Math.round((count / totalComplaints) * 100);

                    return (
                      <div key={idx} style={{ fontSize: 12.5 }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              color: 'var(--color-text-main, #1F2937)',
                            }}
                          >
                            {COMPLAINT_TYPE_TITLES[type] || type}
                          </span>
                          <span style={{ color: 'var(--color-text-muted, #6B7280)' }}>
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div
                          style={{
                            height: 6,
                            borderRadius: 'var(--radius-full, 9999px)',
                            backgroundColor: 'var(--color-surface-subtle, #F3F4F6)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${pct}%`,
                              backgroundColor: '#DC2626',
                              borderRadius: 'var(--radius-full, 9999px)',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Platform User Demographics */}
            <div
              className="card"
              style={{
                padding: '22px 24px',
                borderRadius: 'var(--radius-lg, 12px)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      backgroundColor: 'var(--color-tint, #F0FDF4)',
                      border: '1px solid #BBF7D0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-primary, #0F5132)',
                    }}
                  >
                    <Users size={14} />
                  </div>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      margin: 0,
                      color: 'var(--color-text-main, #1F2937)',
                    }}
                  >
                    Platform Demographics
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--color-text-muted, #6B7280)',
                    margin: '4px 0 0 34px',
                  }}
                >
                  Registered user distribution across platform roles
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Total Users banner */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 8,
                    backgroundColor: 'var(--color-tint, #F0FDF4)',
                    border: '1px solid #BBF7D0',
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--color-primary, #0F5132)',
                    }}
                  >
                    Total Registered Accounts
                  </span>
                  <strong
                    style={{
                      fontSize: 16,
                      color: 'var(--color-primary, #0F5132)',
                    }}
                  >
                    {data.overview.totalUsers}
                  </strong>
                </div>

                {/* Customers */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--color-border, #E5E7EB)',
                  }}
                >
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted, #6B7280)' }}>
                    Customers
                  </span>
                  <strong style={{ fontSize: 13.5, color: 'var(--color-text-main, #1F2937)' }}>
                    {data.overview.totalCustomers}
                  </strong>
                </div>

                {/* Shop Owners */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--color-border, #E5E7EB)',
                  }}
                >
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted, #6B7280)' }}>
                    Shop Owners (Merchants)
                  </span>
                  <strong style={{ fontSize: 13.5, color: 'var(--color-text-main, #1F2937)' }}>
                    {data.overview.totalShopOwners}
                  </strong>
                </div>

                {/* Suspended Accounts */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                  }}
                >
                  <span style={{ fontSize: 13, color: '#DC2626', fontWeight: 500 }}>
                    Suspended Outlets
                  </span>
                  <strong style={{ fontSize: 13.5, color: '#DC2626' }}>
                    {data.overview.suspendedShops > 0 ? (
                      <Badge variant="error">{data.overview.suspendedShops} shop(s)</Badge>
                    ) : (
                      '0'
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
