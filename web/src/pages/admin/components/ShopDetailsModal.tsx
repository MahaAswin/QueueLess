import React, { useState } from 'react';
import {
  MapPin,
  User,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  X,
  Navigation,
  Copy,
  Check,
  Mail,
  Phone,
  Clock,
  Calendar,
  ExternalLink,
  Tag,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { formatDateShort } from '../../../utils/formatters';
import { SHOP_CATEGORY_LABELS, SHOP_STATUS_META } from '../../../types/shop.types';
import type { AdminShop } from '../../../types/admin.types';
import { getShopImage, getCategoryDefaultImage } from '../../../utils/shopImageUtils';

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
  const [imgSrc, setImgSrc] = useState<string>(getShopImage(shop));
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    if (!shopId) return;
    navigator.clipboard.writeText(shopId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formatOperatingHours = (open?: string, close?: string) => {
    if (!open || !close) return 'Standard Schedule';
    const cleanTime = (t: string) => {
      const parts = t.split(':');
      if (parts.length >= 2) {
        const h = parseInt(parts[0], 10);
        const m = parts[1];
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${m} ${ampm}`;
      }
      return t;
    };
    return `${cleanTime(open)} – ${cleanTime(close)}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
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
          maxWidth: 680,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: 20,
          boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.28), 0 0 1px 1px var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 14,
                overflow: 'hidden',
                backgroundColor: 'var(--color-tint)',
                border: '1.5px solid var(--color-border)',
                flexShrink: 0,
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <img
                src={imgSrc}
                alt={shop.shopName || shop.name}
                onError={() => setImgSrc(getCategoryDefaultImage(shop.category))}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  margin: 0,
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--color-primary)',
                  letterSpacing: '-0.3px',
                }}
              >
                {shop.shopName || shop.name}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    backgroundColor: 'var(--color-tint)',
                    border: '1px solid var(--color-tint-border)',
                    padding: '3px 10px',
                    borderRadius: 9999,
                    letterSpacing: '0.2px',
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
            aria-label="Close dialog"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
              e.currentTarget.style.color = 'var(--color-text-main)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-muted)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            flex: 1,
          }}
        >
          {/* Shop Outlet ID Banner with One-Click Copy */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px',
              borderRadius: 12,
              backgroundColor: 'var(--color-tint)',
              border: '1px solid var(--color-tint-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag size={14} color="var(--color-primary)" />
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 800,
                  color: 'var(--color-primary)',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                }}
              >
                Shop Outlet ID
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 12.5,
                  fontFamily: 'monospace',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                }}
              >
                {shopId}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                title="Copy Outlet ID"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: '1px solid var(--color-tint-border)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-primary)',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {copiedId ? (
                  <>
                    <Check size={12} color="var(--color-accent)" />
                    <span style={{ color: 'var(--color-accent)' }}>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Description if present */}
          {shop.description && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                backgroundColor: '#FDFBF7',
                border: '1px solid var(--color-border)',
                borderLeft: '4px solid var(--color-accent)',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: 'var(--color-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: 4,
                }}
              >
                About this Outlet
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--color-text)', margin: 0, lineHeight: 1.55 }}>
                {shop.description}
              </p>
            </div>
          )}

          {/* Shop Owner Profile Card */}
          <div
            style={{
              padding: '16px 18px',
              borderRadius: 14,
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-heading)',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-tint)',
                  border: '1px solid var(--color-tint-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <User size={15} color="var(--color-primary)" />
              </div>
              <span>Shop Owner Profile</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              <div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Full Name
                </span>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)', marginTop: 2 }}>
                  {shop.ownerName || 'Store Partner'}
                </div>
              </div>

              <div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Email Address
                </span>
                <div style={{ marginTop: 2 }}>
                  {shop.ownerEmail ? (
                    <a
                      href={`mailto:${shop.ownerEmail}`}
                      style={{
                        fontSize: 13,
                        color: 'var(--color-primary)',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontWeight: 600,
                      }}
                    >
                      <Mail size={12} color="var(--color-text-muted)" />
                      <span>{shop.ownerEmail}</span>
                    </a>
                  ) : (
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>—</span>
                  )}
                </div>
              </div>

              {shop.ownerPhone && (
                <div>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: 'var(--color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Owner Phone
                  </span>
                  <div style={{ marginTop: 2 }}>
                    <a
                      href={`tel:${shop.ownerPhone}`}
                      style={{
                        fontSize: 13,
                        color: 'var(--color-primary)',
                        textDecoration: 'none',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <Phone size={12} color="var(--color-text-muted)" />
                      <span>{shop.ownerPhone}</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location & Schedule Card */}
          <div
            style={{
              padding: '16px 18px',
              borderRadius: 14,
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-heading)',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-tint)',
                  border: '1px solid var(--color-tint-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MapPin size={15} color="var(--color-primary)" />
              </div>
              <span>Location & Schedule</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              <div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  City
                </span>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)', marginTop: 2 }}>
                  {shop.city}
                </div>
              </div>

              <div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Physical Address
                </span>
                <div style={{ fontSize: 13, color: 'var(--color-text)', marginTop: 2, lineHeight: 1.4 }}>
                  {shop.address || '—'}
                </div>
              </div>

              <div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Outlet Phone
                </span>
                <div style={{ marginTop: 2 }}>
                  {shop.phone ? (
                    <a
                      href={`tel:${shop.phone}`}
                      style={{
                        fontSize: 13,
                        color: 'var(--color-primary)',
                        textDecoration: 'none',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <Phone size={12} color="var(--color-text-muted)" />
                      <span>{shop.phone}</span>
                    </a>
                  ) : (
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>—</span>
                  )}
                </div>
              </div>

              <div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Operating Hours
                </span>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    marginTop: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <Clock size={13} color="var(--color-primary)" />
                  <span>{formatOperatingHours(shop.openingTime, shop.closingTime)}</span>
                </div>
              </div>

              {shop.latitude !== undefined && shop.longitude !== undefined && (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 10,
                    borderTop: '1px solid var(--color-border)',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Navigation size={13} color="var(--color-text-muted)" />
                    <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                      {shop.latitude.toFixed(6)}, {shop.longitude.toFixed(6)}
                    </span>
                  </div>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      backgroundColor: 'var(--color-tint)',
                      border: '1px solid var(--color-tint-border)',
                      padding: '5px 12px',
                      borderRadius: 6,
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Platform Trust & Dates Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 14,
                backgroundColor: (shop.validComplaintCount || 0) > 0 ? '#FEF2F2' : 'var(--color-tint)',
                border: `1px solid ${(shop.validComplaintCount || 0) > 0 ? '#FECACA' : 'var(--color-tint-border)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-xs)',
                  flexShrink: 0,
                }}
              >
                {(shop.validComplaintCount || 0) > 0 ? (
                  <ShieldAlert size={18} color="#DC2626" />
                ) : (
                  <ShieldCheck size={18} color="var(--color-primary)" />
                )}
              </div>
              <div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                  }}
                >
                  Valid Disputes
                </span>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: (shop.validComplaintCount || 0) > 0 ? '#DC2626' : 'var(--color-primary)',
                    marginTop: 1,
                  }}
                >
                  {(shop.validComplaintCount || 0) === 0
                    ? '0 Complaints (Clean)'
                    : `${shop.validComplaintCount} complaint(s)`}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '14px 16px',
                borderRadius: 14,
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-tint)',
                  border: '1px solid var(--color-tint-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Calendar size={18} color="var(--color-primary)" />
              </div>
              <div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                  }}
                >
                  Registered On
                </span>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text)', marginTop: 1 }}>
                  {shop.createdAt ? formatDateShort(shop.createdAt) : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>

          <div style={{ display: 'flex', gap: 10 }}>
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
