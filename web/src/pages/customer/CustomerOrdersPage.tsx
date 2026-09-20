import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Receipt,
  Store,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useCustomerOrders, type OrderFilterTab } from './orders/useCustomerOrders';
import { OrderCard } from './orders/OrderCard';
import { OrderPickupPass } from './orders/OrderPickupPass';
import { RemoveOrderModal } from './orders/RemoveOrderModal';
import { OrdersListSkeleton } from './orders/OrdersListSkeleton';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { formatOrderId } from '../../utils/formatters';

export const CustomerOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as {
    orderPlaced?: boolean;
    newlyCreatedOrderId?: string;
    pickupSlot?: string;
    pickupDate?: string;
  } | null;

  const [successBanner, setSuccessBanner] = useState<string | null>(
    locationState?.orderPlaced && locationState?.newlyCreatedOrderId
      ? `Order ${formatOrderId(locationState.newlyCreatedOrderId)} placed successfully! ${
          locationState.pickupSlot
            ? `Your pickup is scheduled for ${locationState.pickupSlot}.`
            : ''
        }`
      : null
  );

  const {
    orders,
    filteredOrders,
    counts,
    loading,
    error,
    activeTab,
    setActiveTab,
    cancellingId,
    reorderingId,
    selectedOrderForQR,
    setSelectedOrderForQR,
    orderToRemove,
    setOrderToRemove,
    removingId,
    actionError,
    setActionError,
    toastMessage,
    setToastMessage,
    handleRemoveOrder,
    handleCancelOrder,
    handleReorder,
    refetch,
  } = useCustomerOrders();

  const filterTabs: { id: OrderFilterTab; label: string }[] = [
    { id: 'ALL', label: `All Orders (${counts.all})` },
    { id: 'ACTIVE', label: `Active (${counts.active})` },
    { id: 'COMPLETED', label: `Completed (${counts.completed})` },
    { id: 'CANCELLED', label: `Cancelled (${counts.cancelled})` },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Pickup Pass Modal */}
      {selectedOrderForQR && (
        <OrderPickupPass
          order={selectedOrderForQR}
          onClose={() => setSelectedOrderForQR(null)}
        />
      )}

      {/* Remove Order Confirmation Modal */}
      {orderToRemove && (
        <RemoveOrderModal
          order={orderToRemove}
          isOpen={Boolean(orderToRemove)}
          onClose={() => setOrderToRemove(null)}
          onConfirm={handleRemoveOrder}
          loading={removingId === orderToRemove.id}
        />
      )}

      {/* Floating Success Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 110,
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-main)',
            padding: '12px 18px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <CheckCircle2 size={18} color="var(--color-success)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: 2,
              marginLeft: 4,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              backgroundColor: 'var(--color-primary-subtle)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-primary-deep)',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            <Sparkles size={13} />
            <span>EXPRESS ORDERS</span>
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: 'var(--color-text-main)',
              fontFamily: 'var(--font-heading)',
              margin: '0 0 4px 0',
            }}
          >
            My Orders
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14.5 }}>
            Track your orders and pickup status.
          </p>
        </div>

        <Link to="/customer/shops" style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="md" icon={<Store size={18} />}>
            Explore Shops
          </Button>
        </Link>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div
          className="card"
          style={{
            padding: '14px 18px',
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 13.5, fontWeight: 600, color: '#DC2626' }}>
            {actionError}
          </span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#DC2626',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Order Placed Success Banner */}
      {successBanner && (
        <div
          className="card"
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--color-success-bg)',
            borderColor: 'var(--color-success-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 size={20} color="var(--color-success)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>
              {successBanner}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#166534',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: 4,
          overflowX: 'auto',
        }}
      >
        {filterTabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 18px',
                borderBottom: isSelected
                  ? '2px solid var(--color-primary-deep)'
                  : '2px solid transparent',
                color: isSelected ? 'var(--color-primary-deep)' : 'var(--color-text-muted)',
                fontWeight: isSelected ? 800 : 500,
                fontSize: 14,
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
                backgroundColor: 'transparent',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      {loading ? (
        <OrdersListSkeleton />
      ) : error ? (
        <ErrorState title="Unable to load your orders" message={error} onRetry={refetch} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Receipt size={36} />}
          title="No orders yet"
          message="Your completed and upcoming orders will appear here."
          actionText="Explore Shops"
          onAction={() => navigate('/customer/shops')}
        />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<Receipt size={32} />}
          title="No orders in this filter"
          message="Try selecting another filter tab to view your orders."
          actionText="Show All Orders"
          onAction={() => setActiveTab('ALL')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isCancelling={cancellingId === order.id}
              isReordering={reorderingId === order.id}
              onCancel={handleCancelOrder}
              onReorder={handleReorder}
              onOpenQR={(ord) => setSelectedOrderForQR(ord)}
              onRemove={(ord) => setOrderToRemove(ord)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
