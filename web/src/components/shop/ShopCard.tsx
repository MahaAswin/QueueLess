import React, { useState } from 'react';
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
  Navigation,
} from 'lucide-react';
import type { Shop, ShopCategory } from '../../types/shop.types';
import { Button } from '../ui/Button';
import { getShopImage, getCategoryDefaultImage, openShopNavigation } from '../../utils/shopImageUtils';

interface ShopCardProps {
  shop: Shop & {
    distanceMeters?: number;
    distanceFormatted?: string;
    isOpen?: boolean;
    averageWaitMinutes?: number;
  };
  isSelected?: boolean;
  onSelect?: () => void;
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

export const ShopCard: React.FC<ShopCardProps> = ({ shop, isSelected = false, onSelect }) => {
  const [imgSrc, setImgSrc] = useState<string>(getShopImage(shop));
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
              fontSize: 11.5,
              fontWeight: 700,
              color: 'var(--color-primary-deep)',
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: 'var(--color-success)',
              }}
            />
            <span>Open</span>
          </div>
        );
      case 'PENDING':
        return (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11.5,
              fontWeight: 700,
              color: 'var(--color-warning)',
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
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
              fontSize: 11.5,
              fontWeight: 700,
              color: 'var(--color-error)',
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
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
              fontSize: 11.5,
              fontWeight: 700,
              color: 'var(--color-text-muted)',
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'var(--color-text-light)' }} />
            <span>Closed</span>
          </div>
        );
    }
  };

  const distanceLabel = shop.distanceFormatted || (shop.distanceMeters ? `${Math.round(shop.distanceMeters)} m` : null);

  const handleNavigateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (shop.latitude && shop.longitude) {
      openShopNavigation(shop.latitude, shop.longitude);
    }
  };

  return (
    <div
      id={`shop-card-${shop.id}`}
      className="card interactive-card"
      onClick={onSelect}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 'var(--radius-xl)',
        padding: 0,
        backgroundColor: 'var(--color-surface)',
        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
        boxShadow: isSelected ? '0 0 0 3px rgba(18, 124, 78, 0.15), var(--shadow-sm)' : 'var(--shadow-xs)',
        position: 'relative',
        overflow: 'hidden',
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Top Banner Shop Image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 140,
          backgroundColor: categoryInfo.bgColor,
          overflow: 'hidden',
        }}
      >
        <img
          src={imgSrc}
          alt={shopName}
          onError={() => setImgSrc(getCategoryDefaultImage(shop.category))}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
        />

        {/* Gradient overlay for contrast */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.65) 100%)',
          }}
        />

        {/* Top Badges: Category & Status */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            right: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11.5,
              fontWeight: 700,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: categoryInfo.color,
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >
            {categoryInfo.icon}
            <span>{categoryInfo.label}</span>
          </div>

          {getStatusBadge()}
        </div>

        {/* Bottom Image Overlay: Distance badge */}
        {distanceLabel && (
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              right: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11.5,
              fontWeight: 700,
              color: '#FFFFFF',
              backgroundColor: 'rgba(13, 92, 58, 0.9)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <Navigation size={11} color="#FFFFFF" />
            <span>{distanceLabel} away</span>
          </div>
        )}
      </div>

      {/* Card Content Area */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* Shop Name */}
          <h3
            id={`shop-name-${shop.id}`}
            style={{
              fontSize: 18,
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
              fontSize: 12.5,
              marginBottom: 12,
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.6em',
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
              padding: '6px 10px',
              marginBottom: 12,
              border: '1px solid rgba(221, 238, 228, 0.9)',
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-deep)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Zap size={11} fill="#FFFFFF" />
            </div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-primary-deep)' }}>
              Zero-Wait Express Counter
            </div>
            <span style={{ fontSize: 11, color: 'var(--color-text-light)', marginLeft: 'auto' }}>
              Avg wait: {shop.averageWaitMinutes || 5}m
            </span>
          </div>

          {/* Location, Phone, Operating Hours Info */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              fontSize: 12,
              color: 'var(--color-text-muted)',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={13} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)' }}>
                <Clock size={13} style={{ color: 'var(--color-text-light)', flexShrink: 0 }} />
                <span>{hoursText}</span>
              </div>
            )}

            {shop.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-light)' }}>
                <Phone size={13} style={{ flexShrink: 0 }} />
                <span>{shop.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card Footer CTA */}
        <div
          style={{
            paddingTop: 12,
            borderTop: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          {shop.latitude && shop.longitude ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNavigateClick}
              icon={<Navigation size={13} />}
              style={{ fontSize: 12, padding: '6px 10px', gap: 4 }}
              title="Open turn-by-turn directions in Google Maps"
            >
              Directions
            </Button>
          ) : (
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-primary)' }}>
              Express Ordering
            </span>
          )}

          <Link to={`/customer/shops/${shop.id}`} style={{ textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>
            <Button
              id={`view-shop-btn-${shop.id}`}
              variant="primary"
              size="sm"
              icon={<ArrowRight size={13} />}
              style={{ fontSize: 12, padding: '6px 12px' }}
            >
              View Shop
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
