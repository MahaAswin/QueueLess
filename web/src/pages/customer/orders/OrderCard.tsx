import React from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  Store,
  Calendar,
  QrCode,
  ArrowRight,
  RotateCcw,
  Package,
} from 'lucide-react';
import type { Order } from '../../../types/order.types';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import {
  formatCurrency,
  formatOrderId,
  formatDateLong,
  getOrderStatusMeta,
} from '../../../utils/formatters';
import { isOrderActive } from './useCustomerOrders';

interface OrderCardProps {
  order: Order;
  isCancelling: boolean;
  isReordering: boolean;
  onCancel: (orderId: string) => void;
  onReorder: (order: Order) => void;
  onOpenQR: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  isCancelling,
  isReordering,
  onCancel,
  onReorder,
  onOpenQR,
}) => {
  const meta = getOrderStatusMeta(order.status);
  const active = isOrderActive(order.status);
  const isReady = order.status === 'READY_FOR_PICKUP';
  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';
  const canReorder = order.status === 'COLLECTED' || order.status === 'COMPLETED' || order.status === 'CANCELLED' || order.status === 'REJECTED';

  const totalItemsCount = order.items?.reduce((acc, i) => acc + i.quantity, 0) || order.items?.length || 0;

  return (
    <div
      className="card interactive-card"
      style={{
        padding: '22px 26px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: isReady
          ? '2px solid var(--color-primary)'
          : active
          ? '1px solid var(--color-primary-light)'
          : '1px solid var(--color-border)',
        boxShadow: isReady
          ? '0 4px 16px var(--color-primary-glow)'
          : active
          ? 'var(--shadow-sm)'
          : 'var(--shadow-xs)',
      }}
    >
      {/* Top Row: Order ID, Status Badge, Total Amount */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          paddingBottom: 14,
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              backgroundColor: isReady
                ? 'var(--color-primary-deep)'
                : active
                ? 'var(--color-primary-subtle)'
                : 'var(--color-surface-subtle)',
              color: isReady
                ? '#FFFFFF'
                : active
                ? 'var(--color-primary-deep)'
                : 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Receipt size={20} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-main)', fontFamily: 'var(--font-heading)' }}>
                {formatOrderId(order.id)}
              </span>
              <Badge variant={meta.badgeVariant}>
                {meta.label}
              </Badge>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 2 }}>
              Placed on {formatDateLong(order.createdAt)}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary-deep)', fontFamily: 'var(--font-heading)' }}>
            {formatCurrency(order.totalAmount)}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>
            {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
          </div>
        </div>
      </div>

      {/* Middle Row: Shop details & Pickup slot */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 14,
        }}
      >
        {/* Shop Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Store size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
              Merchant
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-main)' }}>
              {order.shopName || 'Partner Merchant'}
            </div>
          </div>
        </div>

        {/* Pickup Slot */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-subtle)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Calendar size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary-deep)' }}>
              Scheduled Express Pickup
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--color-text-main)', fontWeight: 600 }}>
              {order.pickupSlot
                ? `${order.pickupSlot.startTime || ''} – ${order.pickupSlot.endTime || ''}`
                : 'Ready upon merchant notification'}
            </div>
          </div>
        </div>
      </div>

      {/* Items Summary Preview */}
      {order.items && order.items.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--color-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            fontSize: 12.5,
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Package size={14} color="var(--color-primary)" style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
          </span>
        </div>
      )}

      {/* Bottom Row: Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          paddingTop: 6,
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {/* Pickup Pass QR */}
          {active && (
            <Button
              variant="secondary"
              size="sm"
              icon={<QrCode size={14} />}
              onClick={() => onOpenQR(order)}
            >
              Pickup Pass
            </Button>
          )}

          {/* Cancel Order */}
          {canCancel && (
            <Button
              variant="danger"
              size="sm"
              isLoading={isCancelling}
              onClick={() => onCancel(order.id)}
            >
              Cancel Order
            </Button>
          )}

          {/* Reorder */}
          {canReorder && (
            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw size={13} />}
              isLoading={isReordering}
              onClick={() => onReorder(order)}
            >
              Reorder
            </Button>
          )}
        </div>

        {/* View Order */}
        <Link to={`/customer/orders/${order.id}`} style={{ textDecoration: 'none' }}>
          <Button
            variant="primary"
            size="sm"
            icon={<ArrowRight size={14} />}
          >
            View Order
          </Button>
        </Link>
      </div>
    </div>
  );
};
