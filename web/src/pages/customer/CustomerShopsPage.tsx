import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Store,
  Search,
  MapPin,
  Phone,
  ArrowRight,
  Filter,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { shopService } from '../../services/shopService';
import type { Shop, ShopCategory } from '../../types/shop.types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { EmptyState } from '../../components/feedback/EmptyState';

const CATEGORIES: { label: string; value: ShopCategory | 'ALL' }[] = [
  { label: 'All Categories', value: 'ALL' },
  { label: 'Grocery', value: 'GROCERY' },
  { label: 'Restaurant', value: 'RESTAURANT' },
  { label: 'Pharmacy', value: 'PHARMACY' },
  { label: 'Bakery', value: 'BAKERY' },
  { label: 'Stationery', value: 'STATIONERY' },
  { label: 'Meat & Seafood', value: 'MEAT_SHOP' },
  { label: 'Other', value: 'OTHER' },
];

export const CustomerShopsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'ALL'>('ALL');

  const fetchShops = async () => {
    setLoading(true);
    setError(null);
    try {
      let data: Shop[] = [];
      if (searchQuery.trim()) {
        data = await shopService.searchShops(searchQuery.trim());
      } else if (selectedCategory !== 'ALL') {
        data = await shopService.getShopsByCategory(selectedCategory);
      } else {
        data = await shopService.getActiveShops();
      }
      setShops(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load partner shops. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearchQuery(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    fetchShops();
  }, [selectedCategory, urlSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSearchParams({});
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              backgroundColor: 'var(--color-primary-subtle)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-primary-deep)',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            <Sparkles size={13} />
            <span>EXPRESS OUTLET DIRECTORY</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-main)' }}>
            Explore Partner Shops
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14.5 }}>
            Discover verified merchant outlets near you offering express zero-wait pickup.
          </p>
        </div>

        <Link to="/customer/cart">
          <Button variant="secondary" size="md" icon={<ShoppingBag size={18} />}>
            View Cart
          </Button>
        </Link>
      </div>

      {/* Search and Category Filter Bar */}
      <div
        className="card"
        style={{
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-light)',
              }}
            />
            <input
              type="text"
              placeholder="Search by shop name, address, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 42 }}
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            Search
          </Button>
          {(searchQuery || selectedCategory !== 'ALL') && (
            <Button type="button" variant="outline" size="md" onClick={handleClearFilters}>
              Reset
            </Button>
          )}
        </form>

        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: 'var(--color-text-light)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              marginRight: 4,
            }}
          >
            <Filter size={14} />
            Categories:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 12.5,
                  fontWeight: isSelected ? 700 : 500,
                  backgroundColor: isSelected
                    ? 'var(--color-primary-deep)'
                    : 'var(--color-surface-subtle)',
                  color: isSelected ? '#FFFFFF' : 'var(--color-text-muted)',
                  border: isSelected
                    ? '1px solid var(--color-primary-deep)'
                    : '1px solid var(--color-border)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content / Shop Grid */}
      {loading ? (
        <LoadingState message="Searching verified partner shops..." />
      ) : error ? (
        <ErrorState title="Unable to load shops" message={error} onRetry={fetchShops} />
      ) : shops.length === 0 ? (
        <EmptyState
          icon={<Store size={28} />}
          title="No shops match your criteria"
          message={
            searchQuery || selectedCategory !== 'ALL'
              ? 'Try modifying your search keywords or switching category filters.'
              : 'There are currently no active partner shops listed.'
          }
          actionText={searchQuery || selectedCategory !== 'ALL' ? 'Clear All Filters' : undefined}
          onAction={handleClearFilters}
        />
      ) : (
        <div>
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              marginBottom: 16,
            }}
          >
            Showing {shops.length} verified partner {shops.length === 1 ? 'outlet' : 'outlets'}
          </div>

          <div className="grid-3">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
                }}
              >
                <div>
                  {/* Shop Card Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-sage)',
                        color: 'var(--color-primary-deep)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Store size={26} />
                    </div>
                    <Badge variant="neutral">{shop.category || 'RETAIL'}</Badge>
                  </div>

                  {/* Shop Info */}
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{shop.name}</h3>
                  <p
                    style={{
                      color: 'var(--color-text-muted)',
                      fontSize: 13.5,
                      marginBottom: 16,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.5,
                    }}
                  >
                    {shop.description || 'Verified local shop offering advance pickup slots.'}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 13,
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      <MapPin size={15} style={{ color: 'var(--color-text-light)', flexShrink: 0 }} />
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {shop.address}, {shop.city}
                      </span>
                    </div>

                    {shop.phone && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 13,
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        <Phone size={15} style={{ color: 'var(--color-text-light)', flexShrink: 0 }} />
                        <span>{shop.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shop Card Footer */}
                <div
                  style={{
                    paddingTop: 14,
                    borderTop: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: shop.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-text-light)',
                      }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)' }}>
                      {shop.status === 'ACTIVE' ? 'Open for Pickup' : shop.status}
                    </span>
                  </div>

                  <Link to={`/customer/shops/${shop.id}`}>
                    <Button variant="primary" size="sm" icon={<ArrowRight size={14} />}>
                      Browse Items
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
