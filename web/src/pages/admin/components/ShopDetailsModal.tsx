import React from 'react';
import {
  Store,
  MapPin,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  X,
  Compass,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { formatDateShort } from '../../../utils/formatters';
import { SHOP_CATEGORY_LABELS, SHOP_STATUS_META } from '../../../types/shop.types';
import type { AdminShop } from '../../../types/admin.types';

interface ShopDetailsModalProps {
  shop: AdminShop | null;
  onClose: () => void;
  onOpenConfirmAction: (
    shop: AdminShop,
    action: 'ACTIVATE' | 'REJECT' | 'SUSPEND' | 'REINSTATE'
  ) => void;
}

export const ShopDetailsModal: React.FC<ShopDetailsModalProps> = ({
  shop,
  onClose,
  onOpenConfirmAction,
}) => {
  if (!shop) return null;

  const shopId = shop.shopId || shop.id || '';
  const statusMeta = SHOP_STATUS_META[shop.status] || {
    label: shop.status,
    variant: 'neutral',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 620,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 24,
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 16,
            borderBottom: '1px solid var(--color-border)',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 46,
                height: 46,
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
                fontSize: 20,
              }}
            >
              <Store size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
                {shop.shopName || shop.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    backgroundColor: 'var(--color-surface-subtle)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-xs)',
                  }}
                >
                  {SHOP_CATEGORY_LABELS[shop.category] || shop.category}
                </span>
                <Badge variant={statusMeta.variant as any}>{statusMeta.label}</Badge>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Shop ID info */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface-subtle)',
            border: '1px solid var(--color-border)',
            marginBottom: 18,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)' }}>Shop Outlet ID</span>
          <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--color-text-main)' }}>
            {shopId}
          </span>
        </div>

        {/* Description if present */}
        {shop.description && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 4 }}>
              About this Outlet
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
              {shop.description}
            </p>
          </div>
        )}

        {/* Details Section Grids */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          {/* Owner Details Card */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-main)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={15} color="var(--color-primary)" />
              <span>Shop Owner Profile</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--color-text-light)' }}>Name:</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-main)' }}>
                  {shop.ownerName || 'Store Partner'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: 'var(--color-text-light)' }}>Email:</span>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  {shop.ownerEmail || '—'}
                </div>
              </div>

              {shop.ownerPhone && (
                <div>
                  <span style={{ fontSize: 11, color: 'var(--color-text-light)' }}>Owner Phone:</span>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'var(--mono)' }}>
                    {shop.ownerPhone}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location & Contact */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-main)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={15} color="var(--color-primary)" />
              <span>Location & Schedule</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--color-text-light)' }}>City:</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-main)' }}>
                  {shop.city}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: 'var(--color-text-light)' }}>Address:</span>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  {shop.address || '—'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: 'var(--color-text-light)' }}>Outlet Phone:</span>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'var(--mono)' }}>
                  {shop.phone || '—'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: 'var(--color-text-light)' }}>Operating Hours:</span>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  {shop.openingTime && shop.closingTime ? `${shop.openingTime} - ${shop.closingTime}` : 'Standard'}
                </div>
              </div>

              {shop.latitude !== undefined && shop.longitude !== undefined && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-light)' }}>Coordinates:</span>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--mono)' }}>
                    {shop.latitude.toFixed(6)}, {shop.longitude.toFixed(6)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Platform Trust & Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border)',
              }}
            >
              <span style={{ fontSize: 11, color: 'var(--color-text-light)' }}>Valid Disputes</span>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color:
                    (shop.validComplaintCount || 0) > 0
                      ? 'var(--color-error)'
                      : 'var(--color-text-main)',
                  marginTop: 2,
                }}
              >
                {shop.validComplaintCount || 0} complaint(s)
              </div>
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border)',
              }}
            >
              <span style={{ fontSize: 11, color: 'var(--color-text-light)' }}>Registered Date</span>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-main)', marginTop: 2 }}>
                {shop.createdAt ? formatDateShort(shop.createdAt) : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 16,
            borderTop: '1px solid var(--color-border)',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>

          <div style={{ display: 'flex', gap: 8 }}>
            {shop.status === 'PENDING' && (
              <>
                <Button
                  variant="danger"
                  size="md"
                  icon={<XCircle size={16} />}
                  onClick={() => onOpenConfirmAction(shop, 'REJECT')}
                >
                  Reject Shop
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  icon={<CheckCircle2 size={16} />}
                  onClick={() => onOpenConfirmAction(shop, 'ACTIVATE')}
                >
                  Approve & Activate
                </Button>
              </>
            )}

            {shop.status === 'ACTIVE' && (
              <Button
                variant="danger"
                size="md"
                icon={<AlertTriangle size={16} />}
                onClick={() => onOpenConfirmAction(shop, 'SUSPEND')}
              >
                Suspend Outlet
              </Button>
            )}

            {shop.status === 'SUSPENDED' && (
              <Button
                variant="primary"
                size="md"
                icon={<ShieldCheck size={16} />}
                onClick={() => onOpenConfirmAction(shop, 'REINSTATE')}
              >
                Reinstate Outlet
              </Button>
            )}

            {shop.status === 'INACTIVE' && (
              <Button
                variant="primary"
                size="md"
                icon={<CheckCircle2 size={16} />}
                onClick={() => onOpenConfirmAction(shop, 'ACTIVATE')}
              >
                Activate Outlet
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
