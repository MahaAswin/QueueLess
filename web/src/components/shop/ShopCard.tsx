import React from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  Zap,
  ShoppingBag,
  UtensilsCrossed,
  Pill,
  Cake,
  BookOpen,
  Beef,
} from 'lucide-react';
import type { Shop, ShopCategory } from '../../types/shop.types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface ShopCardProps {
  shop: Shop;
}

export const CATEGORY_META: Record<
  ShopCategory,
  { label: string; icon: React.ReactNode; color: string; bgColor: string }
> = {
  GROCERY: {
    label: 'Grocery',
    icon: <ShoppingBag size={14} />,
    color: '#0D5C3A',
    bgColor: '#E8F5EE',
  },
  RESTAURANT: {
    label: 'Restaurant',
    icon: <UtensilsCrossed size={14} />,
    color: '#D97706',
    bgColor: '#FEF3C7',
  },
  BAKERY: {
    label: 'Bakery',
    icon: <Cake size={14} />,
    color: '#B45309',
    bgColor: '#FFFBEB',
  },
  PHARMACY: {
    label: 'Pharmacy',
    icon: <Pill size={14} />,
    color: '#0284C7',
    bgColor: '#E0F2FE',
  },
  STATIONERY: {
    label: 'Stationery',
    icon: <BookOpen size={14} />,
    color: '#7C3AED',
    bgColor: '#F5F3FF',
  },
  MEAT_SHOP: {
    label: 'Meat & Seafood',
    icon: <Beef size={14} />,
    color: '#E11D48',
    bgColor: '#FFE4E6',
  },
  OTHER: {
    label: 'Retail Store',
    icon: <Store size={14} />,
    color: '#475569',
    bgColor: '#F1F5F9',
  },
};

export const formatOperatingHours = (open?: string, close?: string): string | null => {
  if (!open || !close) return null;
  const formatTime = (t: string) => {
    const parts = t.split(':');
    if (parts.length < 2) return t;
    const h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };
  return `${formatTime(open)} – ${formatTime(close)}`;
};

export const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  const shopName = shop.shopName || shop.name || 'Partner Outlet';
  const categoryInfo = CATEGORY_META[shop.category] || CATEGORY_META.OTHER;
  const hoursText = formatOperatingHours(shop.openingTime, shop.closingTime);

  const getStatusBadge = () => {
    switch (shop.status) {
      case 'ACTIVE':
        return (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-primary-deep)',
              backgroundColor: 'var(--color-primary-subtle)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(18, 124, 78, 0.2)',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: 'var(--color-success)',
                boxShadow: '0 0 0 2px var(--color-success-bg)',
              }}
            />
            <span>Open for Pickup</span>
          </div>
        );
      case 'PENDING':
        return (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-warning)',
              backgroundColor: 'var(--color-warning-bg)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'var(--color-warning)' }} />
            <span>Opening Soon</span>
          </div>
        );
      case 'SUSPENDED':
        return (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-error)',
              backgroundColor: 'var(--color-error-bg)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'var(--color-error)' }} />
            <span>Unavailable</span>
          </div>
        );
      default:
        return (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              backgroundColor: 'var(--color-surface-subtle)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'var(--color-text-light)' }} />
            <span>Currently Closed</span>
          </div>
        );
    }
  };

  return (
    <div
      id={`shop-card-${shop.id}`}
      className="card interactive-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Banner Accent with subtle glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, var(--color-primary-deep) 0%, var(--color-primary-accent) 100%)',
        }}
      />

      <div>
        {/* Card Header: Category & Status */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 16,
            gap: 10,
          }}
        >
          {/* Shop Icon / Category Avatar */}
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: categoryInfo.bgColor,
              color: categoryInfo.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-xs)',
              border: `1px solid ${categoryInfo.color}20`,
            }}
          >
            {shop.imageUrl ? (
              <img
                src={shop.imageUrl}
                alt={shopName}
                style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }}
              />
            ) : (
              <Store size={26} />
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            {getStatusBadge()}
            <Badge variant="neutral" icon={categoryInfo.icon}>
              {categoryInfo.label}
            </Badge>
          </div>
        </div>

        {/* Shop Name */}
        <h3
          id={`shop-name-${shop.id}`}
          style={{
            fontSize: 18.5,
            fontWeight: 800,
            color: 'var(--color-text-main)',
            marginBottom: 6,
            lineHeight: 1.3,
            fontFamily: 'var(--font-heading)',
          }}
        >
          {shopName}
        </h3>

        {/* Shop Description */}
        <p
          style={{
            color: 'var(--color-text-muted)',
            fontSize: 13,
            marginBottom: 16,
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.8em',
          }}
        >
          {shop.description || 'Verified QueueLess advance ordering partner with express counter pickup.'}
        </p>

        {/* QueueLess Differentiating Queue Highlight */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'var(--color-light-sage)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            marginBottom: 16,
            border: '1px solid rgba(221, 238, 228, 0.9)',
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-deep)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Zap size={12} fill="#FFFFFF" />
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary-deep)' }}>
            Zero-Wait Express Counter
          </div>
          <span style={{ fontSize: 11, color: 'var(--color-text-light)', marginLeft: 'auto' }}>
            No Line
          </span>
        </div>

        {/* Location, Phone, Operating Hours Info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 7,
            fontSize: 12.5,
            color: 'var(--color-text-muted)',
            marginBottom: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <MapPin size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
            <span
              style={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                fontWeight: 500,
              }}
              title={`${shop.address}, ${shop.city}`}
            >
              {shop.address}, {shop.city}
            </span>
          </div>

          {hoursText && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--color-text-muted)' }}>
              <Clock size={14} style={{ color: 'var(--color-text-light)', flexShrink: 0 }} />
              <span style={{ fontSize: 12 }}>{hoursText}</span>
            </div>
          )}

          {shop.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--color-text-light)' }}>
              <Phone size={14} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 12 }}>{shop.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer CTA */}
      <div
        style={{
          paddingTop: 16,
          borderTop: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--color-primary)',
          }}
        >
          Express Ordering
        </span>

        <Link to={`/customer/shops/${shop.id}`} style={{ textDecoration: 'none' }}>
          <Button
            id={`view-shop-btn-${shop.id}`}
            variant="primary"
            size="sm"
            icon={<ArrowRight size={14} />}
          >
            View Shop
          </Button>
        </Link>
      </div>
    </div>
  );
};
