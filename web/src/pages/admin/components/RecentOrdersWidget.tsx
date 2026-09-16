import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { formatCurrency, formatOrderId, formatDateShort } from '../../../utils/formatters';
import { Badge } from '../../../components/ui/Badge';
import type { AdminRecentOrder } from '../../../types/admin.types';
import type { OrderStatus } from '../../../types/order.types';


interface RecentOrdersWidgetProps {
  orders: AdminRecentOrder[];
}

const getOrderStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING':
      return { label: 'Pending', variant: 'warning' as const };
    case 'CONFIRMED':
      return { label: 'Confirmed', variant: 'info' as const };
    case 'PREPARING':
      return { label: 'Preparing', variant: 'warning' as const };
    case 'READY_FOR_PICKUP':
      return { label: 'Ready at Counter', variant: 'success' as const };
    case 'COLLECTED':
      return { label: 'Collected', variant: 'success' as const };
    case 'REJECTED':
      return { label: 'Rejected', variant: 'error' as const };
    case 'CANCELLED':
      return { label: 'Cancelled', variant: 'neutral' as const };
    default:
      return { label: status, variant: 'neutral' as const };
  }
};

export const RecentOrdersWidget: React.FC<RecentOrdersWidgetProps> = ({ orders }) => {
  return (
    <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 24px',
          borderBottom: '1px solid var(--color-border)',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
            }}
          >
            <ShoppingBag size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
              Recent Platform Orders
            </h3>
            <p style={{ fontSize: 12, color: 'var(--color-text-light)', margin: '2px 0 0 0' }}>
              Live customer transactions and counter pickup activities
            </p>
          </div>
        </div>

        <Link
          to="/admin/orders"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--color-primary)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          View All Orders <ArrowRight size={14} />
        </Link>
      </div>

      {/* Table Content */}
      {orders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '36px 20px',
            color: 'var(--color-text-muted)',
          }}
        >
          <ShoppingBag size={32} color="var(--color-text-light)" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-main)' }}>
            No platform orders yet
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 2 }}>
            Recent customer orders will appear here as transactions take place.
          </div>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '18%' }}>Order Reference</th>
                <th style={{ width: '24%' }}>Partner Outlet</th>
                <th style={{ width: '22%' }}>Customer</th>
                <th style={{ width: '14%' }}>Total Amount</th>
                <th style={{ width: '12%' }}>Status</th>
                <th style={{ width: '10%', textAlign: 'right' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const statusMeta = getOrderStatusBadge(order.status);
                return (
                  <tr key={order.orderId}>
                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--mono)',
                          fontWeight: 700,
                          fontSize: 13,
                          color: 'var(--color-primary-deep)',
                        }}
                      >
                        #{formatOrderId(order.orderId)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-main)' }}>
                        {order.shopName || 'Partner Outlet'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-main)' }}>
                        {order.customerName || 'Customer'}
                      </div>
                      {order.customerEmail && (
                        <div style={{ fontSize: 11, color: 'var(--color-text-light)' }}>
                          {order.customerEmail}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--color-text-main)' }}>
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </td>
                    <td>
                      <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                    </td>
                    <td style={{ textAlign: 'right', fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {formatDateShort(order.createdAt)}
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
