import React from 'react';
import { ShieldAlert } from 'lucide-react';
import type { TopShopMetric } from '../../../types/reports.types';
import { Badge } from '../../../components/ui/Badge';
import { formatCurrency } from '../../../utils/formatters';

interface TopShopsReportTableProps {
  shops: TopShopMetric[];
}

export const TopShopsReportTable: React.FC<TopShopsReportTableProps> = ({ shops }) => {
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
          Top Performing Shops
        </h3>
        <p style={{ fontSize: 12.5, color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
          Ranking of merchant outlets by order throughput and fulfillment value
        </p>
      </div>

      {shops.length === 0 ? (
        <div
          style={{
            padding: '36px 0',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontSize: 13.5,
          }}
        >
          No shop order activity recorded for this period.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  color: 'var(--color-text-muted)',
                  fontSize: 11.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  textAlign: 'left',
                }}
              >
                <th style={{ padding: '10px 12px' }}>Rank & Shop Outlet</th>
                <th style={{ padding: '10px 12px' }}>Category</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Total Orders</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Completed</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Cancelled</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Collected Value</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Disputes</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop, idx) => {
                const completionRate =
                  shop.totalOrders > 0
                    ? Math.round((shop.completedOrders / shop.totalOrders) * 100)
                    : 0;

                return (
                  <tr
                    key={shop.shopId || idx}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      fontSize: 13,
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* Rank & Name */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: idx < 3 ? '#FEF3C7' : 'var(--color-surface-subtle)',
                            color: idx < 3 ? '#B45309' : 'var(--color-text-muted)',
                            fontWeight: 700,
                            fontSize: 11,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          #{idx + 1}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                            {shop.shopName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '12px' }}>
                      <Badge variant="neutral">
                        {shop.category}
                      </Badge>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px' }}>
                      <Badge
                        variant={
                          shop.status === 'ACTIVE'
                            ? 'success'
                            : shop.status === 'PENDING'
                            ? 'warning'
                            : 'error'
                        }
                      >
                        {shop.status}
                      </Badge>
                    </td>

                    {/* Total Orders */}
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                      {shop.totalOrders}
                    </td>

                    {/* Completed */}
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ color: '#10B981', fontWeight: 600 }}>
                        {shop.completedOrders}
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 4 }}>
                          ({completionRate}%)
                        </span>
                      </div>
                    </td>

                    {/* Cancelled */}
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <span style={{ color: shop.cancelledOrders > 0 ? '#EF4444' : 'var(--color-text-muted)' }}>
                        {shop.cancelledOrders}
                      </span>
                    </td>

                    {/* Collected Value */}
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {formatCurrency(shop.totalOrderValue)}
                    </td>

                    {/* Trust Violations */}
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {shop.validComplaintCount > 0 ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: '#FEE2E2',
                            color: '#DC2626',
                            fontSize: 11.5,
                            fontWeight: 700,
                          }}
                        >
                          <ShieldAlert size={12} />
                          {shop.validComplaintCount}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>—</span>
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
