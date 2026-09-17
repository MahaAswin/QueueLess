import React from 'react';
import { RefreshCw, ShoppingBag, Clock, CheckCircle2, XCircle, DollarSign } from 'lucide-react';
import { useAdminOrders } from './hooks/useAdminOrders';
import { OrdersFilterBar } from './components/OrdersFilterBar';
import { OrdersTable } from './components/OrdersTable';
import { OrdersTableSkeleton } from './components/OrdersTableSkeleton';
import { AdminOrderDetailsModal } from './components/AdminOrderDetailsModal';
import { ErrorState } from '../../components/feedback/ErrorState';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';

export const AdminOrdersPage: React.FC = () => {
  const {
    orders,
    totalElements,
    totalPages,
    currentPage,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    shopFilter,
    setShopFilter,
    dateFilter,
    setDateFilter,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    availableShops,
    summary,
    loading,
    error,
    selectedOrderId,
    selectedOrder,
    detailLoading,
    detailError,
    fetchOrderDetail,
    closeDetails,
    setPage,
    refetch,
  } = useAdminOrders();

  const activeProcessingOrders =
    (summary?.pendingOrders || 0) +
    (summary?.confirmedOrders || 0) +
    (summary?.preparingOrders || 0) +
    (summary?.readyForPickupOrders || 0);

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
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
            Order Monitoring & Oversight
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, margin: '4px 0 0 0' }}>
            Live platform-wide transaction monitoring, customer order status tracking, and merchant fulfillment oversight.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={refetch}
          disabled={loading}
          icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
        >
          Refresh Orders
        </Button>
      </div>

      {/* Operational KPI Metric Strip */}
      {summary && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 14,
            marginBottom: 20,
          }}
        >
          {/* Total Orders */}
          <div
            className="card"
            style={{
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-bg)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingBag size={20} />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Total Orders
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-main)' }}>
                {summary.totalOrders}
              </div>
            </div>
          </div>

          {/* Active / In-Flight */}
          <div
            className="card"
            style={{
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={20} />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Active / In-Flight
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-main)' }}>
                {activeProcessingOrders}
              </div>
            </div>
          </div>

          {/* Collected / Completed */}
          <div
            className="card"
            style={{
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Collected
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-main)' }}>
                {summary.collectedOrders}
              </div>
            </div>
          </div>

          {/* Cancelled / Rejected */}
          <div
            className="card"
            style={{
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <XCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Cancelled / Rejected
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-main)' }}>
                {summary.cancelledOrders + summary.rejectedOrders}
              </div>
            </div>
          </div>

          {/* Gross Order Volume */}
          {summary.totalRevenue !== undefined && (
            <div
              className="card"
              style={{
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary-deep)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DollarSign size={20} />
              </div>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Platform Volume
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-main)' }}>
                  {formatCurrency(summary.totalRevenue)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Bar */}
      <OrdersFilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        shopFilter={shopFilter}
        onShopFilterChange={setShopFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        customFrom={customFrom}
        onCustomFromChange={setCustomFrom}
        customTo={customTo}
        onCustomToChange={setCustomTo}
        availableShops={availableShops}
        totalCount={totalElements}
      />

      {/* Orders Table / Loading / Error State */}
      {loading && orders.length === 0 ? (
        <OrdersTableSkeleton />
      ) : error && orders.length === 0 ? (
        <ErrorState
          title="Unable to load platform order records"
          message={error}
          onRetry={refetch}
        />
      ) : (
        <OrdersTable
          orders={orders}
          totalElements={totalElements}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setPage}
          onViewDetails={(orderId) => fetchOrderDetail(orderId)}
        />
      )}

      {/* Order Details Slide-over / Modal */}
      {selectedOrderId && (
        <AdminOrderDetailsModal
          order={selectedOrder}
          loading={detailLoading}
          error={detailError}
          onClose={closeDetails}
        />
      )}
    </div>
  );
};
