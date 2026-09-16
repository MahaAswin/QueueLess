import React from 'react';
import { Store, MapPin, Clock, Phone, ChevronDown, CheckCircle2 } from 'lucide-react';
import type { Shop } from '../../../types/shop.types';
import { Badge } from '../../../components/ui/Badge';
import { formatTimeLabel } from '../../../utils/formatters';

interface ShopSummaryCardProps {
  shop: Shop | null;
  allShops: Shop[];
  onSelectShop: (shop: Shop) => void;
  loading?: boolean;
}

export const ShopSummaryCard: React.FC<ShopSummaryCardProps> = ({
  shop,
  allShops,
  onSelectShop,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div className="skeleton" style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="card" style={{ marginBottom: 24, borderLeft: '4px solid var(--color-warning)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>No Registered Shop Found</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
              Register your retail outlet or restaurant to start receiving customer orders and pickup requests.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const shopDisplayName = shop.shopName || shop.name || 'Store Partner';
  const hoursFormatted =
    shop.openingTime && shop.closingTime
      ? `${formatTimeLabel(shop.openingTime)} – ${formatTimeLabel(shop.closingTime)}`
      : 'Regular Hours';

  return (
    <div
      className="card"
      style={{
        marginBottom: 24,
        background: 'linear-gradient(135deg, #FFFFFF 0%, var(--color-light-sage) 100%)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-primary-deep)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              flexShrink: 0,
            }}
          >
            <Store size={26} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{shopDisplayName}</h2>
              <Badge variant={shop.status === 'ACTIVE' ? 'success' : 'warning'}>
                {shop.status || 'ACTIVE'}
              </Badge>
              {shop.category && (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-sage)',
                    color: 'var(--color-primary-deep)',
                  }}
                >
                  {shop.category}
                </span>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                marginTop: 8,
                color: 'var(--color-text-muted)',
                fontSize: 13,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={14} color="var(--color-primary)" />
                <span>
                  {shop.address ? `${shop.address}, ${shop.city}` : shop.city || 'Address on file'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Clock size={14} color="var(--color-primary)" />
                <span>{hoursFormatted}</span>
              </div>

              {shop.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Phone size={14} color="var(--color-primary)" />
                  <span>{shop.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Multi-Shop Selector */}
        {allShops.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Managing Outlet:
            </span>
            <div style={{ position: 'relative' }}>
              <select
                value={shop.id}
                onChange={(e) => {
                  const selected = allShops.find((s) => s.id === e.target.value);
                  if (selected) onSelectShop(selected);
                }}
                className="form-input"
                style={{
                  padding: '6px 30px 6px 12px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--color-primary-deep)',
                  backgroundColor: 'var(--color-surface)',
                  cursor: 'pointer',
                }}
              >
                {allShops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shopName || s.name} ({s.city})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
