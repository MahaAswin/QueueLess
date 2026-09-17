import React from 'react';
import {
  Eye,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Store,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  formatCurrency,
  formatOrderId,
  formatDateShort,
  getOrderStatusMeta,
} from '../../../utils/formatters';
import type { AdminOrder } from '../../../types/admin.types';

interface OrdersTableProps {
  orders: AdminOrder[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onViewDetails: (orderId: string) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  totalElements,
  totalPages,
  currentPage,
  onPageChange,
  onViewDetails,
}) => {
  if (orders.length === 0) {
    return (
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '48px 24px',
          color: 'var(--color-text-muted)',
        }}
      >
        <ShoppingBag size={36} color="var(--color-text-light)" style={{ marginBottom: 12 }} />
        <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
          No orders found
        </h4>
        <p style={{ fontSize: 13, color: 'var(--color-text-light)', margin: '4px 0 0 0' }}>
          Try clearing your search query or adjusting your status/shop/date filters.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '16%' }}>Order Reference</th>
              <th style={{ width: '20%' }}>Customer</th>
              <th style={{ width: '20%' }}>Partner Outlet</th>
              <th style={{ width: '14%' }}>Pickup Slot</th>
              <th style={{ width: '11%' }}>Total</th>
              <th style={{ width: '10%' }}>Status</th>
              <th style={{ width: '9%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const meta = getOrderStatusMeta(order.status);
              const slotDisplay = order.pickupSlot
                ? `${order.pickupSlot.startTime || order.pickupSlot.requestedStartTime || ''} - ${
                    order.pickupSlot.endTime || order.pickupSlot.requestedEndTime || ''
                  }`
                : null;

              return (
                <tr key={order.orderId}>
                  {/* Order ID & Date */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {formatDateShort(order.createdAt)}
                      </span>
                    </div>
                  </td>

                  {/* Customer Info */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--color-primary-subtle)',
                          color: 'var(--color-primary-deep)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {order.customerName ? (
                          order.customerName.charAt(0).toUpperCase()
                        ) : (
                          <User size={14} />
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--color-text-main)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {order.customerName || 'Customer'}
                        </div>
                        {order.customerEmail && (
                          <div
                            style={{
                              fontSize: 11,
                              color: 'var(--color-text-light)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: 160,
                            }}
                            title={order.customerEmail}
                          >
                            {order.customerEmail}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Shop Outlet */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-surface-subtle)',
                          color: 'var(--color-text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Store size={15} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--color-text-main)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {order.shopName || 'Partner Outlet'}
                        </div>
                        {order.shopCategory && (
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 600,
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            {order.shopCategory}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Pickup Slot */}
                  <td>
                    {slotDisplay && slotDisplay !== ' - ' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                        <Clock size={12} color="var(--color-text-light)" />
                        <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                          {slotDisplay}
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>
                        Counter Express
                      </span>
                    )}
                  </td>

                  {/* Total Amount */}
                  <td>
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--color-text-main)' }}>
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </td>

                  {/* Order Status */}
                  <td>
                    <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Eye size={13} />}
                      onClick={() => onViewDetails(order.orderId)}
                      title="Inspect Order Details"
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-subtle)',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>
            Showing page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong> (
            {totalElements} total platform orders)
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              variant="secondary"
              size="sm"
              icon={<ChevronLeft size={15} />}
              disabled={currentPage === 0}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<ChevronRight size={15} />}
              disabled={currentPage >= totalPages - 1}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
