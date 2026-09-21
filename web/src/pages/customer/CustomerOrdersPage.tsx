import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Receipt,
  Store,
  Zap,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useCustomerOrders, type OrderFilterTab, isOrderActive } from './orders/useCustomerOrders';
import { OrderCard } from './orders/OrderCard';
import { FeaturedOrderJourney } from './orders/FeaturedOrderJourney';
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
    shopsMap,
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

  const filterTabs: { id: OrderFilterTab; label: string; count: number }[] = [
    { id: 'ALL', label: 'All Orders', count: counts.all },
    { id: 'ACTIVE', label: 'Active', count: counts.active },
    { id: 'COMPLETED', label: 'Completed', count: counts.completed },
    { id: 'CANCELLED', label: 'Cancelled', count: counts.cancelled },
  ];

  // Pick the active order (or latest order) to display in the bottom Featured Order Journey tracker
  const featuredOrder =
    orders.find((o) => isOrderActive(o.status)) || (orders.length > 0 ? orders[0] : null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1280, margin: '0 auto', width: '100%' }}>
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
            backgroundColor: '#FFFFFF',
            color: '#172033',
            padding: '12px 18px',
            borderRadius: '14px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            border: '1px solid #BBF7D0',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <CheckCircle2 size={18} color="#0F8A5F" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13.5, fontWeight: 700 }}>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
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

      {/* 1. PAGE HEADER */}
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
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              backgroundColor: '#DCFCE7',
              borderRadius: '9999px',
              color: '#15803D',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.4px',
              marginBottom: 8,
              border: '1px solid #BBF7D0',
            }}
          >
            <Zap size={13} fill="#15803D" color="#15803D" />
            <span>EXPRESS ORDERS</span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: '#172033',
              fontFamily: 'var(--font-heading)',
              margin: '0 0 4px 0',
              letterSpacing: '-0.5px',
            }}
          >
            My Orders
          </h1>

          {/* Subtitle */}
          <p style={{ color: '#64748B', fontSize: 15, margin: 0 }}>
            Track your orders and pickup status.
          </p>
        </div>

        {/* Explore Shops Button */}
        <Link to="/customer/shops" style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="md" icon={<Store size={18} />}>
            Explore Shops
          </Button>
        </Link>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#DC2626' }}>
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
          style={{
            padding: '16px 20px',
            backgroundColor: '#DCFCE7',
            border: '1px solid #BBF7D0',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 size={20} color="#15803D" style={{ flexShrink: 0 }} />
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

      {/* 2. FILTER TABS */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '2px solid #E2E8F0',
          paddingBottom: 0,
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 18px',
                borderBottom: isSelected ? '3px solid #0F8A5F' : '3px solid transparent',
                marginBottom: -2,
                color: isSelected ? '#0F8A5F' : '#64748B',
                fontWeight: isSelected ? 800 : 600,
                fontSize: 14.5,
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                backgroundColor: isSelected ? '#F0FDF4' : 'transparent',
                borderRadius: '8px 8px 0 0',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
              }}
            >
              <span>{tab.label}</span>
              <span>({tab.count})</span>
            </button>
          );
        })}
      </div>

      {/* 3. ORDER CARDS GRID */}
      {loading ? (
        <OrdersListSkeleton />
      ) : error ? (
        <ErrorState title="Unable to load your orders" message={error} onRetry={refetch} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Receipt size={36} />}
          title="No orders yet"
          message="Your completed and upcoming express pickups will appear here."
          actionText="Explore Shops"
          onAction={() => navigate('/customer/shops')}
        />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<Receipt size={32} />}
          title="No orders in this filter"
          message="Your next express pickup is just a few taps away. Try selecting another filter."
          actionText="Show All Orders"
          onAction={() => setActiveTab('ALL')}
        />
      ) : (
        <>
          {/* Responsive 3-Column Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: 20,
            }}
          >
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                shop={shopsMap?.[order.shopId]}
                isCancelling={cancellingId === order.id}
                isReordering={reorderingId === order.id}
                onCancel={handleCancelOrder}
                onReorder={handleReorder}
                onOpenQR={(ord) => setSelectedOrderForQR(ord)}
                onRemove={(ord) => setOrderToRemove(ord)}
              />
            ))}
          </div>

          {/* 4. BOTTOM SECTION: Featured Order Journey & Estimated Time Tracker */}
          {featuredOrder && (
            <FeaturedOrderJourney
              order={featuredOrder}
              onOpenQR={(ord) => setSelectedOrderForQR(ord)}
            />
          )}
        </>
      )}
    </div>
  );
};
