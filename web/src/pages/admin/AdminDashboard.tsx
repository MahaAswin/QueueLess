import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useAdminDashboard } from './hooks/useAdminDashboard';
import { AdminKPIs } from './components/AdminKPIs';
import { AdminQuickActionsWidget } from './components/AdminQuickActionsWidget';
import { PendingShopApprovalsWidget } from './components/PendingShopApprovalsWidget';
import { RecentOrdersWidget } from './components/RecentOrdersWidget';
import { RecentComplaintsWidget } from './components/RecentComplaintsWidget';
import { AdminDashboardSkeleton } from './components/AdminDashboardSkeleton';
import { ErrorState } from '../../components/feedback/ErrorState';
import { Button } from '../../components/ui/Button';

export const AdminDashboard: React.FC = () => {
  const {
    summary,
    pendingShops,
    recentOrders,
    recentComplaints,
    loading,
    error,
    actionLoadingId,
    handleActivateShop,
    refetch,
  } = useAdminDashboard();

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
            Admin Dashboard
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, margin: '4px 0 0 0' }}>
            Monitor and manage the QueueLess platform.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={refetch}
          disabled={loading}
          icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
        >
          Refresh Platform Data
        </Button>
      </div>

      {/* Content Rendering */}
      {loading && !summary ? (
        <AdminDashboardSkeleton />
      ) : error && !summary ? (
        <ErrorState
          title="Unable to load Admin Dashboard"
          message={error}
          onRetry={refetch}
        />
      ) : (
        <>
          {/* Platform KPIs */}
          <AdminKPIs summary={summary} />

          {/* Quick Management Actions */}
          <AdminQuickActionsWidget />

          {/* Pending Shop Outlet Approvals (High Priority Governance) */}
          <PendingShopApprovalsWidget
            pendingShops={pendingShops}
            actionLoadingId={actionLoadingId}
            onActivateShop={handleActivateShop}
          />

          {/* Platform Activity: Recent Orders & Complaints Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
              gap: 20,
            }}
          >
            <RecentOrdersWidget orders={recentOrders} />
            <RecentComplaintsWidget complaints={recentComplaints} />
          </div>
        </>
      )}
    </div>
  );
};

