import React from 'react';
import {
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Store,
  MapPin,
  Clock,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { SHOP_CATEGORY_LABELS, SHOP_STATUS_META } from '../../../types/shop.types';
import type { AdminShop } from '../../../types/admin.types';

interface ShopsTableProps {
  shops: AdminShop[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onViewDetails: (shop: AdminShop) => void;
  onOpenConfirmAction: (
    shop: AdminShop,
    action: 'ACTIVATE' | 'REJECT' | 'SUSPEND' | 'REINSTATE'
  ) => void;
}

export const ShopsTable: React.FC<ShopsTableProps> = ({
  shops,
  totalElements,
  totalPages,
  currentPage,
  onPageChange,
  onViewDetails,
  onOpenConfirmAction,
}) => {
  if (shops.length === 0) {
    return (
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '48px 24px',
          color: 'var(--color-text-muted)',
        }}
      >
        <Store size={36} color="var(--color-text-light)" style={{ marginBottom: 12 }} />
        <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
          No shop outlets found
        </h4>
        <p style={{ fontSize: 13, color: 'var(--color-text-light)', margin: '4px 0 0 0' }}>
          Try clearing your search filters or selecting another category or status.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '26%' }}>Shop Outlet</th>
              <th style={{ width: '20%' }}>Owner & Contact</th>
              <th style={{ width: '16%' }}>Location</th>
              <th style={{ width: '12%' }}>Operating Hours</th>
              <th style={{ width: '11%' }}>Status</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shops.map((shop) => {
              const shopId = shop.shopId || shop.id || '';
              const statusMeta = SHOP_STATUS_META[shop.status] || {
                label: shop.status,
                variant: 'neutral',
              };
              const complaintCount = shop.validComplaintCount || 0;

              return (
                <tr key={shopId}>
                  {/* Shop Outlet Info */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 'var(--radius-md)',
                          backgroundColor:
                            shop.status === 'PENDING'
                              ? '#FEF3C7'
                              : shop.status === 'SUSPENDED'
                              ? '#FEE2E2'
                              : 'var(--color-primary-bg)',
                          color:
                            shop.status === 'PENDING'
                              ? '#B45309'
                              : shop.status === 'SUSPENDED'
                              ? '#B91C1C'
                              : 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        <Store size={18} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 13.5,
                            color: 'var(--color-text-main)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {shop.shopName || shop.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: 'var(--color-text-muted)',
                              backgroundColor: 'var(--color-surface-subtle)',
                              padding: '1px 6px',
                              borderRadius: 'var(--radius-xs)',
                            }}
                          >
                            {SHOP_CATEGORY_LABELS[shop.category] || shop.category}
                          </span>
                          {complaintCount > 0 && (
                            <span
                              style={{
                                fontSize: 10.5,
                                fontWeight: 700,
                                color: 'var(--color-error)',
                                backgroundColor: 'var(--color-error-bg)',
                                padding: '1px 5px',
                                borderRadius: 'var(--radius-full)',
                              }}
                            >
                              {complaintCount} disputes
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Owner & Contact */}
                  <td>
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
                        {shop.ownerName || 'Store Manager'}
                      </div>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: 'var(--color-text-light)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {shop.ownerEmail || shop.phone || '—'}
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                      <MapPin size={13} color="var(--color-text-light)" style={{ marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-main)' }}>
                          {shop.city}
                        </div>
                        {shop.address && (
                          <div
                            style={{
                              fontSize: 11,
                              color: 'var(--color-text-muted)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: 160,
                            }}
                            title={shop.address}
                          >
                            {shop.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Operating Hours */}
                  <td>
                    {shop.openingTime && shop.closingTime ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--color-text-muted)' }}>
                        <Clock size={12} color="var(--color-text-light)" />
                        <span>{shop.openingTime} - {shop.closingTime}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>Standard</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td>
                    <Badge variant={statusMeta.variant as any}>
                      {statusMeta.label}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, flexWrap: 'wrap' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Eye size={13} />}
                        onClick={() => onViewDetails(shop)}
                        title="View Full Shop Profile & Details"
                      >
                        Details
                      </Button>

                      {/* Status-specific action buttons */}
                      {shop.status === 'PENDING' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<CheckCircle2 size={13} />}
                            onClick={() => onOpenConfirmAction(shop, 'ACTIVATE')}
                            title="Approve & Activate Shop"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            icon={<XCircle size={13} />}
                            onClick={() => onOpenConfirmAction(shop, 'REJECT')}
                            title="Reject Shop Registration"
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {shop.status === 'ACTIVE' && (
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<AlertTriangle size={13} />}
                          onClick={() => onOpenConfirmAction(shop, 'SUSPEND')}
                          title="Suspend Shop Outlet"
                        >
                          Suspend
                        </Button>
                      )}

                      {shop.status === 'SUSPENDED' && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<ShieldCheck size={13} />}
                          onClick={() => onOpenConfirmAction(shop, 'REINSTATE')}
                          title="Reinstate Suspended Shop"
                        >
                          Reinstate
                        </Button>
                      )}

                      {shop.status === 'INACTIVE' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<CheckCircle2 size={13} />}
                          onClick={() => onOpenConfirmAction(shop, 'ACTIVATE')}
                          title="Activate Shop Outlet"
                        >
                          Activate
                        </Button>
                      )}
                    </div>
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
            {totalElements} total registered shops)
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
