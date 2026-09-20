import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  ChefHat,
  KeyRound,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useShopOwnerDashboard } from './hooks/useShopOwnerDashboard';
import { MetricCard } from './components/MetricCard';
import { ShopSummaryCard } from './components/ShopSummaryCard';
import { QueueSummaryWidget } from './components/QueueSummaryWidget';
import { OrderStatusSummaryWidget } from './components/OrderStatusSummaryWidget';
import { PickupSlotsWidget } from './components/PickupSlotsWidget';
import { RecentOrdersWidget } from './components/RecentOrdersWidget';
import { QuickActionsWidget } from './components/QuickActionsWidget';
import { ShopDashboardSkeleton } from './components/ShopDashboardSkeleton';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/feedback/ErrorState';

export const ShopDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    data,
    activeShop,
    setActiveShop,
    loading,
    error,
    actionLoadingId,
    handleConfirmOrder,
    handleStartPreparing,
    handleMarkReady,
    handleRejectOrder,
    refetch,
  } = useShopOwnerDashboard();

  if (loading && !data) {
    return <ShopDashboardSkeleton />;
  }

  if (error && !data) {
    return (
      <div style={{ padding: '40px 0' }}>
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  const shops = data?.shops || [];
  const orders = data?.orders || [];
  const recentOrders = data?.recentOrders || [];
  const pickupSlots = data?.pickupSlots || [];
  const queueMetrics = data?.queueMetrics || {
    waitingConfirmation: 0,
    inPreparation: 0,
    readyAtCounter: 0,
    totalInQueue: 0,
    activeSlotsCount: 0,
    pendingSlotsCount: 0,
  };
  const statusBreakdown = data?.statusBreakdown || {
    PENDING: 0,
    CONFIRMED: 0,
    ACCEPTED: 0,
    PREPARING: 0,
    READY_FOR_PICKUP: 0,
    COLLECTED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    REJECTED: 0,
  };

  const pendingCount = statusBreakdown.PENDING || 0;
  const preparingCount =
    (statusBreakdown.CONFIRMED || 0) +
    (statusBreakdown.ACCEPTED || 0) +
    (statusBreakdown.PREPARING || 0);
  const readyCount = statusBreakdown.READY_FOR_PICKUP || 0;
  const totalOrders = data?.totalOrdersCount || orders.length;

  return (
    <div>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px 0' }}>
            Shop Dashboard
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: 0 }}>
            Real-time fulfillment overview for{' '}
            <strong style={{ color: 'var(--color-text-main)' }}>
              {activeShop?.shopName || activeShop?.name || user?.fullName || 'My Store'}
            </strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Button
            variant="outline"
            size="md"
            onClick={() => refetch()}
            icon={<RefreshCw size={16} className={loading ? 'spin' : ''} />}
          >
            Refresh
          </Button>

          <Link to="/shop-owner/pickup-verification">
            <Button variant="secondary" size="md" icon={<KeyRound size={16} />}>
              Pickup Verification
            </Button>
          </Link>

          <Link to="/shop-owner/products">
            <Button variant="primary" size="md" icon={<Plus size={16} />}>
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Shop Information & Context Card */}
      <ShopSummaryCard
        shop={activeShop}
        allShops={shops}
        onSelectShop={setActiveShop}
        loading={loading}
      />

      {/* High-Level Metrics Row */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <MetricCard
          label="Total Orders"
          value={totalOrders}
          subtext="Lifetime received"
          icon={<ShoppingBag size={22} />}
          variant="primary"
          loading={loading}
        />
        <MetricCard
          label="Pending Acceptance"
          value={pendingCount}
          subtext={pendingCount > 0 ? 'Requires immediate action' : 'All confirmed'}
          icon={<Clock size={22} />}
          variant={pendingCount > 0 ? 'warning' : 'neutral'}
          loading={loading}
        />
        <MetricCard
          label="In Preparation"
          value={preparingCount}
          subtext="Being packed for pickup"
          icon={<ChefHat size={22} />}
          variant="info"
          loading={loading}
        />
        <MetricCard
          label="Ready at Counter"
          value={readyCount}
          subtext="Awaiting customer QR scan"
          icon={<CheckCircle2 size={22} />}
          variant={readyCount > 0 ? 'success' : 'neutral'}
          loading={loading}
        />
      </div>

      {/* Express Pickup Queue Visualizer */}
      <QueueSummaryWidget metrics={queueMetrics} loading={loading} />

      {/* Quick Operational Actions */}
      <QuickActionsWidget />

      {/* Main Content Grid: Live Orders Table + Side Breakdown Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
        }}
      >
        {/* Left Column: Recent Live Orders Table */}
        <div style={{ gridColumn: 'span 2' }}>
          <RecentOrdersWidget
            orders={recentOrders}
            loading={loading}
            actionLoadingId={actionLoadingId}
            onConfirmOrder={handleConfirmOrder}
            onStartPreparing={handleStartPreparing}
            onMarkReady={handleMarkReady}
            onRejectOrder={handleRejectOrder}
          />
        </div>

        {/* Right Column: Status Breakdown + Pickup Slots Schedule */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <OrderStatusSummaryWidget
            statusBreakdown={statusBreakdown}
            loading={loading}
          />
          <PickupSlotsWidget slots={pickupSlots} loading={loading} />
        </div>
      </div>
    </div>
  );
};
