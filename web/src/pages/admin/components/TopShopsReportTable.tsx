import React, { useState, useMemo } from 'react';
import { Store, ShieldCheck, ShieldAlert, Search, ArrowUpRight, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { TopShopMetric } from '../../../types/reports.types';
import { Badge } from '../../../components/ui/Badge';
import { formatCurrency } from '../../../utils/formatters';

interface TopShopsReportTableProps {
  shops: TopShopMetric[];
  onSwitchToAllTime?: () => void;
  isAllTime?: boolean;
}

export const TopShopsReportTable: React.FC<TopShopsReportTableProps> = ({
  shops,
  onSwitchToAllTime,
  isAllTime,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredShops = useMemo(() => {
    if (!searchTerm.trim()) return shops;
    const term = searchTerm.toLowerCase().trim();
    return shops.filter(
      (s) =>
        s.shopName.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term)
    );
  }, [shops, searchTerm]);

  return (
    <div
      className="card"
      style={{
        padding: '22px 24px',
        borderRadius: 'var(--radius-lg, 12px)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}
    >
      {/* Table Header & Search Filter */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                backgroundColor: 'var(--color-tint, #F0FDF4)',
                border: '1px solid #BBF7D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary, #0F5132)',
              }}
            >
              <Award size={16} />
            </div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                margin: 0,
                color: 'var(--color-text-main, #1F2937)',
              }}
            >
              Top Performing Merchant Outlets
            </h3>
          </div>
          <p
            style={{
              fontSize: 12.5,
              color: 'var(--color-text-muted, #6B7280)',
              margin: '4px 0 0 36px',
            }}
          >
            Ranked by order fulfillment volume, collected gross merchandise value, and customer satisfaction
          </p>
        </div>

        {/* Search bar inside table */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {shops.length > 0 && (
            <div style={{ position: 'relative', width: 220 }}>
              <Search
                size={14}
                color="var(--color-text-muted, #9CA3AF)"
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Filter shops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 30px',
                  fontSize: 12,
                  borderRadius: 6,
                  border: '1px solid var(--color-border, #E5E7EB)',
                  outline: 'none',
                  backgroundColor: 'var(--color-surface, #FFFFFF)',
                }}
              />
            </div>
          )}

          <Link
            to="/admin/shops"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-primary, #0F5132)',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: 6,
              backgroundColor: 'var(--color-tint, #F0FDF4)',
              border: '1px solid #BBF7D0',
            }}
          >
            Manage Outlets
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {shops.length === 0 ? (
        <div
          style={{
            padding: '36px 20px',
            textAlign: 'center',
            backgroundColor: 'var(--color-surface-subtle, #FAFAFA)',
            borderRadius: 8,
            border: '1px dashed var(--color-border, #E5E7EB)',
          }}
        >
          <Store size={36} color="var(--color-text-muted, #9CA3AF)" style={{ marginBottom: 10, opacity: 0.6 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-main, #374151)', marginBottom: 4 }}>
            No merchant order activity in this period
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--color-text-muted, #6B7280)', maxWidth: 360, margin: '0 auto 14px auto' }}>
            None of the registered outlets processed orders during the selected timeframe.
          </p>
          {!isAllTime && onSwitchToAllTime && (
            <button
              onClick={onSwitchToAllTime}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                backgroundColor: 'var(--color-primary, #0F5132)',
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Switch to All Time Range
            </button>
          )}
        </div>
      ) : filteredShops.length === 0 ? (
        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-text-muted, #6B7280)', fontSize: 13 }}>
          No shops match "{searchTerm}".
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1.5px solid var(--color-border, #E5E7EB)',
                  color: 'var(--color-text-muted, #6B7280)',
                  fontSize: 11.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 700,
                }}
              >
                <th style={{ padding: '10px 12px' }}>Rank & Outlet Name</th>
                <th style={{ padding: '10px 12px' }}>Category</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Total Orders</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Fulfillment Rate</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Collected Value</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Trust / Disputes</th>
              </tr>
            </thead>
            <tbody>
              {filteredShops.map((shop, idx) => {
                const completionRate =
                  shop.totalOrders > 0
                    ? Math.round((shop.completedOrders / shop.totalOrders) * 100)
                    : 0;

                const rankMedal =
                  idx === 0
                    ? { bg: '#FEF3C7', color: '#B45309', label: '1' }
                    : idx === 1
                    ? { bg: '#F1F5F9', color: '#475569', label: '2' }
                    : idx === 2
                    ? { bg: '#FFEDD5', color: '#C2410C', label: '3' }
                    : { bg: 'var(--color-surface-subtle, #F3F4F6)', color: 'var(--color-text-muted, #6B7280)', label: `${idx + 1}` };

                return (
                  <tr
                    key={shop.shopId || idx}
                    style={{
                      borderBottom: '1px solid var(--color-border, #E5E7EB)',
                      fontSize: 13,
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* Rank & Shop */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: rankMedal.bg,
                            color: rankMedal.color,
                            fontWeight: 700,
                            fontSize: 11,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          #{rankMedal.label}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--color-text-main, #1F2937)' }}>
                            {shop.shopName}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted, #6B7280)' }}>
                            {shop.completedOrders} completed • {shop.cancelledOrders} cancelled
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          fontSize: 11.5,
                          padding: '3px 8px',
                          borderRadius: 4,
                          backgroundColor: 'var(--color-surface-subtle, #F3F4F6)',
                          color: 'var(--color-text-main, #374151)',
                          fontWeight: 500,
                          textTransform: 'capitalize',
                        }}
                      >
                        {shop.category ? shop.category.toLowerCase().replace(/_/g, ' ') : 'General'}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px' }}>
                      <Badge
                        variant={shop.status === 'ACTIVE' ? 'success' : 'neutral'}
                        dot
                      >
                        {shop.status === 'ACTIVE' ? 'Active' : shop.status}
                      </Badge>
                    </td>

                    {/* Total Orders */}
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                      {shop.totalOrders}
                    </td>

                    {/* Fulfillment Rate Bar */}
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: completionRate >= 80 ? '#16A34A' : completionRate >= 50 ? '#D97706' : '#DC2626',
                          }}
                        >
                          {completionRate}%
                        </span>
                        <div
                          style={{
                            width: 60,
                            height: 5,
                            borderRadius: 3,
                            backgroundColor: 'var(--color-surface-subtle, #E5E7EB)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${completionRate}%`,
                              height: '100%',
                              backgroundColor: completionRate >= 80 ? '#16A34A' : completionRate >= 50 ? '#D97706' : '#DC2626',
                              borderRadius: 3,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Collected Value */}
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <strong style={{ color: 'var(--color-primary, #0F5132)', fontSize: 13.5 }}>
                        {formatCurrency(shop.totalOrderValue)}
                      </strong>
                    </td>

                    {/* Disputes */}
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {shop.validComplaintCount === 0 ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: '#16A34A',
                            backgroundColor: '#DCFCE7',
                            padding: '2px 8px',
                            borderRadius: 12,
                          }}
                        >
                          <ShieldCheck size={12} />
                          0 Issues
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: '#DC2626',
                            backgroundColor: '#FEE2E2',
                            padding: '2px 8px',
                            borderRadius: 12,
                          }}
                        >
                          <ShieldAlert size={12} />
                          {shop.validComplaintCount} Dispute(s)
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
