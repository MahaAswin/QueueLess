import React from 'react';
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
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 90 Days', value: '90d' },
    { label: 'All Time', value: 'all' },
    { label: 'Custom', value: 'custom' },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
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
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(2, 132, 199, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284C7',
              }}
            >
              <BarChart3 size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
                Platform Analytics & Reports
              </h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13, margin: '3px 0 0 0' }}>
                Operational throughput, merchant metrics, and system governance reports
              </p>
            </div>
          </div>
        </div>

        {/* Actions Strip */}
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
            Export CSV Report
          </Button>
        </div>
      </div>

      {/* Date Range Selector Toolbar */}
      <div
        className="card"
        style={{
          padding: '12px 16px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-muted)', marginRight: 6 }}>
            <Calendar size={15} />
            <span>Timeframe:</span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--color-surface-subtle)',
              padding: 3,
              borderRadius: 'var(--radius-md)',
              gap: 2,
            }}
          >
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => setPreset(p.value)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12,
                  fontWeight: preset === p.value ? 700 : 500,
                  backgroundColor: preset === p.value ? 'var(--color-surface)' : 'transparent',
                  color: preset === p.value ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: preset === p.value ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Range Inputs */}
        {preset === 'custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
            <input
              type="date"
              className="input"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              style={{ padding: '4px 8px', fontSize: 12 }}
            />
            <span style={{ color: 'var(--color-text-muted)' }}>to</span>
            <input
              type="date"
              className="input"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              style={{ padding: '4px 8px', fontSize: 12 }}
            />
          </div>
        )}
      </div>

      {/* Loading & Error States */}
      {loading && !data ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--color-primary)', margin: '0 auto 12px' }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-main)' }}>
            Calculating platform analytics from database...
          </div>
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
            {/* KPI 1: Total Orders & Throughput */}
            <div className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Orders & Throughput
                </span>
                <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', backgroundColor: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Receipt size={16} />
                </div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-main)' }}>
                {data.overview.totalOrders}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                <strong style={{ color: '#10B981' }}>{data.overview.completedOrders} completed</strong> •{' '}
                <span style={{ color: '#EF4444' }}>{data.overview.cancelledOrders} cancelled</span>
              </div>
            </div>

            {/* KPI 2: Order Fulfillment Value */}
            <div className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Collected Order Value
                </span>
                <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', backgroundColor: '#DCFCE7', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={16} />
                </div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#10B981' }}>
                {formatCurrency(data.overview.collectedOrderValue)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                Avg Order: <strong>{formatCurrency(data.overview.averageOrderValue)}</strong> (Gross: {formatCurrency(data.overview.totalOrderValue)})
              </div>
            </div>

            {/* KPI 3: Storefront Operations */}
            <div className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Merchant Outlets
                </span>
                <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Store size={16} />
                </div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-main)' }}>
                {data.overview.activeShops}{' '}
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)' }}>
                  / {data.overview.totalShops}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                <strong>{data.overview.pendingShops}</strong> pending approvals •{' '}
                <span style={{ color: '#EF4444' }}>{data.overview.suspendedShops} suspended</span>
              </div>
            </div>

            {/* KPI 4: Governance & Disputes */}
            <div className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Disputes & Governance
                </span>
                <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', backgroundColor: '#F3E8FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={16} />
                </div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-main)' }}>
                {data.overview.totalComplaints}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                <strong style={{ color: '#F59E0B' }}>{data.overview.pendingComplaints} action required</strong> •{' '}
                <span style={{ color: '#10B981' }}>{data.overview.resolvedComplaints} resolved</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
              gap: 20,
              marginBottom: 24,
            }}
          >
            {/* Trend Chart */}
            <AnalyticsTrendChart data={data.ordersOverTime} />

            {/* Lifecycle Distribution Chart */}
            <AnalyticsDistributionChart data={data.orderStatusDistribution} />
          </div>

          {/* Top Performing Shops */}
          <div style={{ marginBottom: 24 }}>
            <TopShopsReportTable shops={data.topShops} />
          </div>

          {/* Bottom Row: Disputes Breakdown & User Demographics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 20,
              marginBottom: 30,
            }}
          >
            {/* Disputes by Category Card */}
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ marginBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
                  Disputes by Category
                </h3>
                <p style={{ fontSize: 12.5, color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
                  Frequency distribution of reported issue types
                </p>
              </div>

              {Object.keys(data.complaintsByType).length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                  No customer or merchant disputes filed yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Object.entries(data.complaintsByType).map(([type, count], idx) => {
                    const totalComplaints = data.overview.totalComplaints || 1;
                    const pct = Math.round((count / totalComplaints) * 100);

                    return (
                      <div key={idx} style={{ fontSize: 12.5 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                            {COMPLAINT_TYPE_TITLES[type] || type}
                          </span>
                          <span style={{ color: 'var(--color-text-muted)' }}>
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div
                          style={{
                            height: 6,
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--color-surface-subtle)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${pct}%`,
                              backgroundColor: '#7C3AED',
                              borderRadius: 'var(--radius-full)',
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
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ marginBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
                  Platform Demographics
                </h3>
                <p style={{ fontSize: 12.5, color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
                  User distribution across registered roles
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Total Users */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Users size={16} color="var(--color-primary)" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-main)' }}>
                      Total Registered Users
                    </span>
                  </div>
                  <strong style={{ fontSize: 15, color: 'var(--color-text-main)' }}>
                    {data.overview.totalUsers}
                  </strong>
                </div>

                {/* Customers */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    Customers
                  </span>
                  <strong style={{ fontSize: 13.5, color: 'var(--color-text-main)' }}>
                    {data.overview.totalCustomers}
                  </strong>
                </div>

                {/* Shop Owners */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    Shop Owners (Merchants)
                  </span>
                  <strong style={{ fontSize: 13.5, color: 'var(--color-text-main)' }}>
                    {data.overview.totalShopOwners}
                  </strong>
                </div>

                {/* Suspended Users */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px',
                  }}
                >
                  <span style={{ fontSize: 13, color: '#DC2626' }}>
                    Suspended Accounts
                  </span>
                  <strong style={{ fontSize: 13.5, color: '#DC2626' }}>
                    {data.overview.suspendedShops > 0 || data.overview.totalUsers > 0 ? (
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
