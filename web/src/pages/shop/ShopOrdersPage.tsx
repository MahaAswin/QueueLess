import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { OrderStatus } from '../../types/order.types';
import { useShopOwnerOrders } from './hooks/useShopOwnerOrders';
import { ShopOrdersKPIs } from './components/ShopOrdersKPIs';
import { ShopOrdersFilterBar } from './components/ShopOrdersFilterBar';
import { ShopOrderActions } from './components/ShopOrderActions';
import { ShopOrdersSkeleton } from './components/ShopOrdersSkeleton';
import {
  formatCurrency,
  formatOrderId,
  formatTimeLabel,
  formatDateShort,
  getOrderStatusMeta,
} from '../../utils/formatters';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/feedback/ErrorState';
import { Filter, RefreshCw, ChevronRight } from 'lucide-react';

export const ShopOrdersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const statusParam = searchParams.get('status') as OrderStatus | null;

  const {
    orders,
    rawOrdersCount,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    pickupFilter,
    setPickupFilter,
    sortBy,
    setSortBy,
    page,
    setPage,
    totalPages,
    kpiCounts,
    actionLoadingId,
    handleConfirmOrder,
    handleRejectOrder,
    handleStartPreparing,
    handleMarkReady,
    refetch,
  } = useShopOwnerOrders(statusParam || undefined);

  const handleStatusChange = (status?: OrderStatus) => {
    setStatusFilter(status);
    setPage(0);
    if (status) {
      setSearchParams({ status });
    } else {
      setSearchParams({});
    }
  };

  if (loading && rawOrdersCount === 0) {
    return <ShopOrdersSkeleton />;
  }

  if (error && rawOrdersCount === 0) {
    return (
      <div style={{ padding: '40px 0' }}>
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

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
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px 0' }}>Orders</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: 0 }}>
            Manage incoming orders and pickup operations.
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={refetch}
          icon={<RefreshCw size={16} className={loading ? 'spin' : ''} />}
        >
          Refresh
        </Button>
      </div>

      {/* Operational Highlights KPIs */}
      <ShopOrdersKPIs counts={kpiCounts} loading={loading && rawOrdersCount === 0} />

      {/* Filter and Search Bar */}
      <ShopOrdersFilterBar
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pickupFilter={pickupFilter}
        onPickupFilterChange={setPickupFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Orders List / Table */}
      {orders.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--color-text-muted)' }}
        >
          <Filter size={36} color="var(--color-text-light)" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No orders found</h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-light)' }}>
            {searchQuery
              ? `No orders matching "${searchQuery}".`
              : 'New customer orders will appear here in real time.'}
          </p>
        </div>
      ) : (
        <div className="data-table-container" style={{ marginBottom: 24 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Basket Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Pickup Slot</th>
                <th>Placed</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const meta = getOrderStatusMeta(order.status);
                const isProcessing = actionLoadingId === order.id;

                const slotDate = order.pickupSlot?.finalPickupDate || order.pickupSlot?.pickupDate;
                const slotStart = order.pickupSlot?.finalStartTime || order.pickupSlot?.requestedStartTime;
                const slotEnd = order.pickupSlot?.finalEndTime || order.pickupSlot?.requestedEndTime;
                const slotText =
                  slotStart && slotEnd
                    ? `${slotDate ? `${formatDateShort(slotDate)} • ` : ''}${formatTimeLabel(slotStart)} – ${formatTimeLabel(slotEnd)}`
                    : 'Standard Pickup';

                return (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/shop-owner/orders/${order.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            fontFamily: 'var(--mono)',
                            fontWeight: 800,
                            fontSize: 13.5,
                            color: 'var(--color-primary-deep)',
                          }}
                        >
                          {formatOrderId(order.id)}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                        {order.customerName || 'Customer'}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: 13, color: 'var(--color-text-main)' }}>
                        {order.items?.length || 0} item{order.items?.length === 1 ? '' : 's'}
                      </div>
                      {order.items && order.items.length > 0 && (
                        <div
                          style={{
                            fontSize: 11.5,
                            color: 'var(--color-text-light)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 160,
                          }}
                        >
                          {order.items[0].productName}
                          {order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
                        </div>
                      )}
                    </td>

                    <td>
                      <span style={{ fontWeight: 800, fontSize: 14 }}>
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </td>

                    <td>
                      <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
                    </td>

                    <td>
                      <span style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>
                        {slotText}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                        <ShopOrderActions
                          orderId={order.id}
                          status={order.status}
                          isLoading={isProcessing}
                          onConfirm={() => handleConfirmOrder(order.id)}
                          onReject={() => handleRejectOrder(order.id)}
                          onStartPreparing={() => handleStartPreparing(order.id)}
                          onMarkReady={() => handleMarkReady(order.id)}
                          size="sm"
                        />
                        <ChevronRight size={16} color="var(--color-text-light)" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 16 }}>
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(Math.max(0, page - 1))}
          >
            Previous
          </Button>
          <span style={{ fontSize: 13, alignSelf: 'center', color: 'var(--color-text-muted)' }}>
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
