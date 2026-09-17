import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { SHOP_CATEGORY_LABELS } from '../../../types/shop.types';
import type { AdminShop } from '../../../types/admin.types';


interface PendingShopApprovalsWidgetProps {
  pendingShops: AdminShop[];
  actionLoadingId: string | null;
  onActivateShop: (shopId: string) => Promise<boolean>;
}

export const PendingShopApprovalsWidget: React.FC<PendingShopApprovalsWidgetProps> = ({
  pendingShops,
  actionLoadingId,
  onActivateShop,
}) => {
  return (
    <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
      {/* Card Header */}
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
              backgroundColor: 'var(--color-warning-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-warning)',
            }}
          >
            <AlertCircle size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
              Pending Shop Approvals
            </h3>
            <p style={{ fontSize: 12, color: 'var(--color-text-light)', margin: '2px 0 0 0' }}>
              New partner outlet registrations requiring admin verification
            </p>
          </div>
        </div>

        <Link
          to="/admin/shops"
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
          Manage All Shops <ArrowRight size={14} />
        </Link>
      </div>

      {/* Table Content */}
      {pendingShops.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '36px 20px',
            color: 'var(--color-text-muted)',
          }}
        >
          <Store size={32} color="var(--color-text-light)" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-main)' }}>
            No pending shop approvals
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 2 }}>
            All registered shop outlets have been verified and activated.
          </div>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Shop / Outlet</th>
                <th style={{ width: '22%' }}>Category</th>
                <th style={{ width: '18%' }}>City</th>
                <th style={{ width: '18%' }}>Contact Phone</th>
                <th style={{ width: '14%', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingShops.map((shop) => {
                const shopId = shop.shopId || shop.id || '';
                const isActivating = actionLoadingId === shopId;
                return (
                  <tr key={shopId}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--color-text-main)' }}>
                        {shop.shopName || shop.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-light)' }}>
                        ID: {shopId ? `${shopId.slice(0, 8)}...` : 'N/A'}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-surface-subtle)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {SHOP_CATEGORY_LABELS[shop.category] || shop.category}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: 'var(--color-text-main)', fontWeight: 500 }}>
                        {shop.city}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12.5, color: 'var(--color-text-muted)', fontFamily: 'var(--mono)' }}>
                        {shop.phone}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isActivating || !shopId}
                        onClick={() => shopId && onActivateShop(shopId)}
                        icon={isActivating ? undefined : <Check size={14} />}
                      >
                        {isActivating ? 'Activating...' : 'Approve & Activate'}
                      </Button>
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
