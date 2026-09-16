import React from 'react';
import { Link } from 'react-router-dom';
import { Check, X, ChefHat, CheckCircle2, QrCode, ArrowRight } from 'lucide-react';
import type { Order } from '../../../types/order.types';
import { formatCurrency, formatOrderId, formatTimeLabel, getOrderStatusMeta } from '../../../utils/formatters';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

interface RecentOrdersWidgetProps {
  orders: Order[];
  loading?: boolean;
  actionLoadingId?: string | null;
  onConfirmOrder: (orderId: string) => void;
  onStartPreparing: (orderId: string) => void;
  onMarkReady: (orderId: string) => void;
  onRejectOrder: (orderId: string) => void;
}

export const RecentOrdersWidget: React.FC<RecentOrdersWidgetProps> = ({
  orders,
  loading = false,
  actionLoadingId,
  onConfirmOrder,
  onStartPreparing,
  onMarkReady,
  onRejectOrder,
}) => {
  if (loading) {
    return (
      <div className="card">
        <div className="skeleton" style={{ height: 24, width: '25%', marginBottom: 20 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="skeleton" style={{ height: 48 }} />
          <div className="skeleton" style={{ height: 48 }} />
          <div className="skeleton" style={{ height: 48 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Recent Store Orders</h3>
          <span style={{ fontSize: 13, color: 'var(--color-text-light)' }}>
            Incoming and active fulfillment orders
          </span>
        </div>
        <Link
          to="/shop-owner/orders"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>View All Orders</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--color-text-muted)',
            backgroundColor: 'var(--color-surface-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No orders placed yet</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-light)' }}>
            New customer express orders will appear here in real time.
          </div>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Basket</th>
                <th>Total</th>
                <th>Status</th>
                <th>Pickup Window</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const statusMeta = getOrderStatusMeta(order.status);
                const isProcessing = actionLoadingId === order.id;

                const pickupTimeText = order.pickupSlot?.requestedStartTime
                  ? `${formatTimeLabel(order.pickupSlot.requestedStartTime)} – ${formatTimeLabel(order.pickupSlot.requestedEndTime || '')}`
                  : order.pickupSlot?.agreedStartTime
                  ? `${formatTimeLabel(order.pickupSlot.agreedStartTime)}`
                  : 'Standard Pickup';

                return (
                  <tr key={order.id}>
                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--mono)',
                          fontWeight: 700,
                          fontSize: 13,
                          color: 'var(--color-primary-deep)',
                        }}
                      >
                        {formatOrderId(order.id)}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {order.customerName || 'Customer'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 13.5 }}>
                        {order.items?.length || 0} item{order.items?.length === 1 ? '' : 's'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </td>
                    <td>
                      <Badge variant={statusMeta.badgeVariant}>{statusMeta.label}</Badge>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                        {pickupTimeText}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {order.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={isProcessing}
                            onClick={() => onConfirmOrder(order.id)}
                            icon={<Check size={14} />}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={isProcessing}
                            onClick={() => onRejectOrder(order.id)}
                            icon={<X size={14} />}
                          >
                            Decline
                          </Button>
                        </div>
                      )}

                      {order.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={isProcessing}
                          onClick={() => onStartPreparing(order.id)}
                          icon={<ChefHat size={14} />}
                        >
                          Start Prep
                        </Button>
                      )}

                      {order.status === 'PREPARING' && (
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={isProcessing}
                          onClick={() => onMarkReady(order.id)}
                          icon={<CheckCircle2 size={14} />}
                        >
                          Mark Ready
                        </Button>
                      )}

                      {order.status === 'READY_FOR_PICKUP' && (
                        <Link to="/shop-owner/qr-pickup">
                          <Button size="sm" variant="outline" icon={<QrCode size={14} />}>
                            Verify QR
                          </Button>
                        </Link>
                      )}

                      {(order.status === 'COLLECTED' ||
                        order.status === 'COMPLETED' ||
                        order.status === 'CANCELLED' ||
                        order.status === 'REJECTED') && (
                        <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
