import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  ShoppingBag,
  RotateCcw,
  Trash2,
  XCircle,
} from 'lucide-react';
import type { Order } from '../../../types/order.types';
import type { Shop } from '../../../types/shop.types';
import {
  formatCurrency,
  formatOrderId,
  formatSlotWindow,
} from '../../../utils/formatters';
import { getCategoryTheme } from './orderCategoryTheme';
import { OrderStatusPills } from './OrderStatusPills';

interface OrderCardProps {
  order: Order;
  shop?: Shop | null;
  isCancelling: boolean;
  isReordering: boolean;
  onCancel: (orderId: string) => void;
  onReorder: (order: Order) => void;
  onOpenQR: (order: Order) => void;
  onRemove?: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  shop,
  isCancelling,
  isReordering,
  onCancel,
  onReorder,
  onOpenQR,
  onRemove,
}) => {
  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';
  const canReorder =
    order.status === 'COLLECTED' ||
    order.status === 'COMPLETED' ||
    order.status === 'CANCELLED' ||
    order.status === 'REJECTED';
  const canRemove =
    order.status === 'COLLECTED' ||
    order.status === 'COMPLETED' ||
    order.status === 'CANCELLED' ||
    order.status === 'REJECTED';

  const totalItemsCount =
    order.items?.reduce((acc, i) => acc + i.quantity, 0) || order.items?.length || 0;

  // Resolve category pastel theme & 3D illustration
  const resolvedCategory = shop?.category || (order as any).shopCategory;
  const resolvedShopName = order.shopName || shop?.name || 'Partner Merchant';
  const categoryTheme = getCategoryTheme(resolvedCategory, resolvedShopName);

  const pickupSlotFormatted = order.pickupSlot
    ? formatSlotWindow(order.pickupSlot)
    : '9:00 to 9:30 AM';

  return (
    <div
      style={{
        backgroundColor: categoryTheme.bgPastel,
        border: `1px solid ${categoryTheme.borderPastel}`,
        borderRadius: '22px',
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 250,
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03), 0 1px 3px rgba(15, 23, 42, 0.02)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      className="interactive-card"
    >
      <div>
        {/* 1. TOP ROW: Category tag + Shop name + Order ID (Left) & 3D Illustration (Right) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            marginBottom: 14,
          }}
        >
          {/* Left info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Category Indicator */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12,
                fontWeight: 700,
                color: categoryTheme.accentColor,
                marginBottom: 4,
              }}
            >
              <span>{categoryTheme.iconEmoji}</span>
              <span>{categoryTheme.label}</span>
            </div>

            {/* Shop Name */}
            <h3
              style={{
                fontSize: 19,
                fontWeight: 800,
                color: '#172033',
                fontFamily: 'var(--font-heading)',
                margin: '0 0 2px 0',
                lineHeight: 1.25,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={resolvedShopName}
            >
              {resolvedShopName}
            </h3>

            {/* Order ID */}
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
              Order {formatOrderId(order.id)}
            </div>
          </div>

          {/* Right: 3D Category Illustration */}
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: '16px',
              overflow: 'hidden',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: -4,
              marginRight: -4,
            }}
          >
            <img
              src={categoryTheme.illustration3d}
              alt={categoryTheme.label}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              loading="lazy"
            />
          </div>
        </div>

        {/* 2. STATUS JOURNEY PILLS */}
        <div style={{ marginBottom: 16 }}>
          <OrderStatusPills
            status={order.status}
            accentColor={categoryTheme.accentColor}
            prepStageVerb={categoryTheme.prepStageVerb}
          />
        </div>

        {/* 3. ORDER METRICS ROW */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 14,
            fontSize: 12.5,
            fontWeight: 700,
            color: '#172033',
            marginBottom: 16,
          }}
        >
          {/* Items count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <ShoppingBag size={14} color="#64748B" />
            <span>
              {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
            </span>
          </div>

          {/* Total Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>

          {/* Collect window */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#1E293B' }}>
            <Calendar size={14} color="#64748B" />
            <span>Collect {pickupSlotFormatted}</span>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM ACTION ROW: View Pickup Pass / View Order & Category Slogan */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          paddingTop: 12,
          borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* Main Action Button (View pickup pass / View Order) */}
          <button
            type="button"
            onClick={() => onOpenQR(order)}
            style={{
              padding: '7px 16px',
              borderRadius: '10px',
              backgroundColor: '#FDE047', // Warm Yellow from reference
              color: '#713F12', // Deep golden brown text
              border: 'none',
              fontSize: 12.5,
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            View pickup pass
          </button>

          {/* View Details Link */}
          <Link
            to={`/customer/orders/${order.id}`}
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#475569',
              textDecoration: 'none',
              padding: '6px 10px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              border: '1px solid rgba(203, 213, 225, 0.6)',
            }}
          >
            Details
          </Link>

          {/* Cancel Order if cancellable */}
          {canCancel && (
            <button
              type="button"
              onClick={() => onCancel(order.id)}
              disabled={isCancelling}
              title="Cancel Order"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 10px',
                borderRadius: '8px',
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                border: '1px solid #FECACA',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: isCancelling ? 'not-allowed' : 'pointer',
              }}
            >
              <XCircle size={13} />
              <span>{isCancelling ? '...' : 'Cancel'}</span>
            </button>
          )}

          {/* Reorder if completed */}
          {canReorder && (
            <button
              type="button"
              onClick={() => onReorder(order)}
              disabled={isReordering}
              title="Reorder items"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                color: '#334155',
                border: '1px solid #CBD5E1',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: isReordering ? 'not-allowed' : 'pointer',
              }}
            >
              <RotateCcw size={12} />
              <span>{isReordering ? '...' : 'Reorder'}</span>
            </button>
          )}

          {/* Remove if completed/cancelled */}
          {canRemove && onRemove && (
            <button
              type="button"
              onClick={() => onRemove(order)}
              title="Remove order from history"
              style={{
                padding: '6px 8px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: '#94A3B8',
                border: '1px solid rgba(203, 213, 225, 0.6)',
                fontSize: 11.5,
                cursor: 'pointer',
              }}
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>

        {/* Right Slogan Quote from reference */}
        <div
          style={{
            fontSize: 11.5,
            color: '#475569',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            textAlign: 'right',
          }}
        >
          <span>{categoryTheme.slogan}</span>
          <span>{categoryTheme.sloganIcon}</span>
        </div>
      </div>
    </div>
  );
};
