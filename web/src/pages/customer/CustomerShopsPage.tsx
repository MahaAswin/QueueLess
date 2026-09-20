import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Store,
  Sparkles,
  ShoppingBag,
  Zap,
  ShieldCheck,
  RotateCcw,
  Navigation,
  MapPin,
  AlertCircle,
  Compass,
} from 'lucide-react';
import { shopService } from '../../services/shopService';
import type { Shop, ShopCategory, NearbyShop } from '../../types/shop.types';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/feedback/ErrorState';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ShopGrid } from '../../components/shop/ShopGrid';
import { ShopSearch } from '../../components/shop/ShopSearch';
import { ShopFilters, type SortOption } from '../../components/shop/ShopFilters';
import { ShopSkeleton } from '../../components/shop/ShopSkeleton';
import { useGeolocation } from '../../hooks/useGeolocation';
import { NearbyShopsMap } from '../../components/shop/NearbyShopsMap';
import { NearbyRadiusSelector } from '../../components/shop/NearbyRadiusSelector';
import { ShopCard } from '../../components/shop/ShopCard';

export const CustomerShopsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = (searchParams.get('category') as ShopCategory | 'ALL') || 'ALL';

  // Geolocation Hook
  const {
    coordinates,
    loading: locationLoading,
    status: locationStatus,
    error: locationError,
    requestLocation,
    clearLocation,
  } = useGeolocation();

  // Mode: 'all' | 'nearby'
  const isNearbyMode = Boolean(coordinates && locationStatus === 'granted');

  // Nearby Discovery State
  const [selectedRadius, setSelectedRadius] = useState<number>(500);
  const [nearbyShops, setNearbyShops] = useState<NearbyShop[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState<boolean>(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  // Baseline Directory State
  const [allShops, setAllShops] = useState<Shop[]>([]);
  const [displayedShops, setDisplayedShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'ALL'>(urlCategory);
  const [selectedSort, setSelectedSort] = useState<SortOption>('RECOMMENDED');

  // Load baseline directory from backend
  const loadShops = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await shopService.getActiveShops();
      setAllShops(data || []);
      setDisplayedShops(data || []);
    } catch {
      setError('Unable to load shops right now. Please try again.');
      setAllShops([]);
      setDisplayedShops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  // Load nearby shops when coordinates or radius or category changes
  const loadNearbyShops = useCallback(async () => {
    if (!coordinates) return;

    setNearbyLoading(true);
    setNearbyError(null);
    try {
      const res = await shopService.getNearbyShops(
        coordinates.latitude,
        coordinates.longitude,
        selectedRadius,
        selectedCategory !== 'ALL' ? selectedCategory : undefined
      );
      setNearbyShops(res.shops || []);
    } catch {
      setNearbyError('Failed to fetch nearby shops. Please try again.');
      setNearbyShops([]);
    } finally {
      setNearbyLoading(false);
    }
  }, [coordinates, selectedRadius, selectedCategory]);

  useEffect(() => {
    if (isNearbyMode) {
      loadNearbyShops();
    }
  }, [isNearbyMode, loadNearbyShops]);

  // Keep search input synced if URL search param changes externally
  useEffect(() => {
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

  // Filter & Search logic for baseline directory
  const executeQuery = useCallback(
    async (query: string, category: ShopCategory | 'ALL') => {
      setError(null);

      const filterInMemory = (source: Shop[]) => {
        let list = source;
        if (query.trim()) {
          const lower = query.toLowerCase().trim();
          list = list.filter((s) => {
            const name = (s.shopName || s.name || '').toLowerCase();
            const desc = (s.description || '').toLowerCase();
            const addr = (s.address || '').toLowerCase();
            const city = (s.city || '').toLowerCase();
            return (
              name.includes(lower) ||
              desc.includes(lower) ||
              addr.includes(lower) ||
              city.includes(lower)
            );
          });
        }
        if (category !== 'ALL') {
          list = list.filter((s) => s.category === category);
        }
        return list;
      };

      if (query.trim()) {
        setSearchLoading(true);
        try {
          const results = await shopService.searchShops(query.trim());
          let filtered = results || [];
          if (category !== 'ALL') {
            filtered = filtered.filter((s) => s.category === category);
          }
          setDisplayedShops(filtered);
        } catch {
          setDisplayedShops(filterInMemory(allShops));
        } finally {
          setSearchLoading(false);
        }
      } else if (category !== 'ALL') {
        setSearchLoading(true);
        try {
          const results = await shopService.getShopsByCategory(category);
          setDisplayedShops(results || []);
        } catch {
          setDisplayedShops(filterInMemory(allShops));
        } finally {
          setSearchLoading(false);
        }
      } else {
        setDisplayedShops(allShops);
      }
    },
    [allShops]
  );

  useEffect(() => {
    if (!loading && !isNearbyMode) {
      executeQuery(searchQuery, selectedCategory);
    }
  }, [loading, searchQuery, selectedCategory, executeQuery, isNearbyMode]);

  const updateUrlParams = (query: string, category: ShopCategory | 'ALL') => {
    const params: Record<string, string> = {};
    if (query.trim()) {
      params.search = query.trim();
    }
    if (category !== 'ALL') {
      params.category = category;
    }
    setSearchParams(params, { replace: true });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams(searchQuery, selectedCategory);
    executeQuery(searchQuery, selectedCategory);
  };

  const handleCategorySelect = (category: ShopCategory | 'ALL') => {
    setSelectedCategory(category);
    updateUrlParams(searchQuery, category);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    updateUrlParams('', selectedCategory);
    executeQuery('', selectedCategory);
  };

  const handleResetAll = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedSort('RECOMMENDED');
    setSearchParams({}, { replace: true });
    setDisplayedShops(allShops);
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const source = isNearbyMode ? nearbyShops : allShops;
    const counts: Record<string, number> = {
      ALL: source.length,
    };
    source.forEach((shop) => {
      if (shop.category) {
        counts[shop.category] = (counts[shop.category] || 0) + 1;
      }
    });
    return counts;
  }, [allShops, nearbyShops, isNearbyMode]);

  // Sort displayed shops for baseline
  const sortedShops = useMemo(() => {
    const copy = [...displayedShops];
    switch (selectedSort) {
      case 'NAME_ASC':
        return copy.sort((a, b) => {
          const nameA = (a.shopName || a.name || '').toLowerCase();
          const nameB = (b.shopName || b.name || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
      case 'NAME_DESC':
        return copy.sort((a, b) => {
          const nameA = (a.shopName || a.name || '').toLowerCase();
          const nameB = (b.shopName || b.name || '').toLowerCase();
          return nameB.localeCompare(nameA);
        });
      case 'NEWEST':
        return copy.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      case 'RECOMMENDED':
      default:
        return copy;
    }
  }, [displayedShops, selectedSort]);

  // Filter nearby shops by search query if user types in search
  const filteredNearbyShops = useMemo(() => {
    if (!searchQuery.trim()) return nearbyShops;
    const q = searchQuery.toLowerCase().trim();
    return nearbyShops.filter((s) => {
      const name = (s.shopName || s.name || '').toLowerCase();
      const desc = (s.description || '').toLowerCase();
      const addr = (s.address || '').toLowerCase();
      return name.includes(q) || desc.includes(q) || addr.includes(q);
    });
  }, [nearbyShops, searchQuery]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedCategory !== 'ALL' || selectedSort !== 'RECOMMENDED'
  );

  const radiusLabel = selectedRadius >= 1000 ? `${selectedRadius / 1000} km` : `${selectedRadius} m`;

  return (
    <div
      id="customer-shops-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        maxWidth: 'var(--content-max-width)',
        margin: '0 auto',
        width: '100%',
        paddingBottom: 40,
      }}
    >
      {/* 1. Page Header & Hero Banner */}
      <div
        className="card"
        style={{
          background:
            'linear-gradient(135deg, #FFFFFF 0%, var(--color-light-sage) 60%, var(--color-sage) 100%)',
          borderRadius: 'var(--radius-2xl)',
          padding: '32px 36px',
          border: '1px solid rgba(221, 238, 228, 0.8)',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -20,
            bottom: -30,
            opacity: 0.05,
            pointerEvents: 'none',
            color: 'var(--color-primary-deep)',
          }}
        >
          <Zap size={220} />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 20,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ maxWidth: 640 }}>
            {/* Express Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '4px 14px',
                backgroundColor: 'var(--color-primary-subtle)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--color-primary-deep)',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                marginBottom: 10,
                border: '1px solid rgba(18, 124, 78, 0.15)',
              }}
            >
              <Sparkles size={13} />
              <span>QueueLess Express Outlets</span>
            </div>

            {/* Page Heading & Subtitle */}
            <h1
              id="explore-shops-title"
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: 'var(--color-text-main)',
                lineHeight: 1.2,
                fontFamily: 'var(--font-heading)',
                marginBottom: 8,
                letterSpacing: '-0.5px',
              }}
            >
              Explore Shops
            </h1>
            <p
              id="explore-shops-subtitle"
              style={{
                color: 'var(--color-text-muted)',
                fontSize: 15,
                lineHeight: 1.5,
                marginBottom: 18,
              }}
            >
              {isNearbyMode
                ? 'Showing verified partner outlets closest to your current location.'
                : 'Find a shop, choose what you want, and skip the queue.'}
            </p>

            {/* Feature Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--color-primary-deep)',
                }}
              >
                <Zap size={15} fill="var(--color-primary)" color="var(--color-primary)" />
                <span>Zero-Wait Counter Pickup</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                }}
              >
                <ShieldCheck size={15} color="var(--color-primary)" />
                <span>Verified Merchant Partners</span>
              </div>
            </div>
          </div>

          {/* Location Action & Cart Shortcut */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {!isNearbyMode ? (
              <Button
                id="use-my-location-btn"
                variant="primary"
                size="md"
                isLoading={locationLoading}
                onClick={requestLocation}
                icon={<Compass size={18} />}
              >
                {locationLoading ? 'Detecting Location...' : 'Use My Location'}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="md"
                onClick={clearLocation}
                icon={<Store size={16} />}
              >
                Browse All Shops
              </Button>
            )}

            <Link to="/customer/cart" style={{ textDecoration: 'none' }}>
              <Button
                id="header-view-cart-btn"
                variant="secondary"
                size="md"
                icon={<ShoppingBag size={18} />}
              >
                View Cart
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Geolocation Error / Denied Banner */}
      {(locationStatus === 'denied' || locationStatus === 'unavailable' || locationStatus === 'timeout' || locationStatus === 'unsupported') && (
        <div
          className="card"
          style={{
            borderLeft: '4px solid var(--color-warning)',
            backgroundColor: 'var(--color-warning-bg)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertCircle size={22} color="var(--color-warning)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--color-warning)' }}>
                {locationStatus === 'denied' ? 'Location access is disabled.' : 'Location unavailable.'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                {locationError || 'Allow location access to find shops near you.'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="outline" size="sm" onClick={requestLocation}>
              Try Again
            </Button>
            <Button variant="secondary" size="sm" onClick={clearLocation}>
              Browse All Shops
            </Button>
          </div>
        </div>
      )}

      {/* 3. Search Bar & Filters */}
      <div
        className="card"
        style={{
          padding: '20px 24px',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <ShopSearch
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={handleSearchSubmit}
          onClear={handleClearSearch}
          placeholder="Search shops by name, category, or address..."
          isSearching={searchLoading}
        />

        {/* Categories Bar */}
        <ShopFilters
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
          selectedSort={selectedSort}
          onSelectSort={setSelectedSort}
          onReset={handleResetAll}
          hasActiveFilters={hasActiveFilters}
          categoryCounts={categoryCounts}
        />
      </div>

      {/* 4. MAIN CONTENT AREA */}
      {isNearbyMode && coordinates ? (
        /* ==================== NEARBY DISCOVERY VIEW (MAP + RADIUS + LIST) ==================== */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Proximity Control Bar */}
          <div
            className="card"
            style={{
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
              backgroundColor: 'var(--color-light-sage)',
              borderColor: 'var(--color-sage)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Navigation size={18} color="var(--color-primary)" />
              <div>
                <span style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--color-primary-deep)' }}>
                  Showing shops near your location
                </span>
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)', marginLeft: 8 }}>
                  ({filteredNearbyShops.length} found within {radiusLabel})
                </span>
              </div>
            </div>

            {/* Radius Selector */}
            <NearbyRadiusSelector
              selectedRadius={selectedRadius}
              onSelectRadius={(r) => {
                setSelectedRadius(r);
                setSelectedShopId(null);
              }}
              disabled={nearbyLoading}
            />
          </div>

          {/* Desktop Responsive Split Layout: Map + Nearby Shops */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: 24,
              alignItems: 'start',
            }}
          >
            {/* Interactive Leaflet Map */}
            <div style={{ position: 'sticky', top: 90 }}>
              <NearbyShopsMap
                userLocation={coordinates}
                shops={filteredNearbyShops}
                radiusMeters={selectedRadius}
                selectedShopId={selectedShopId}
                onSelectShop={(s) => setSelectedShopId(s.id)}
                height={520}
              />
            </div>

            {/* Nearby Shops List (Sorted Nearest First) */}
            <div>
              {nearbyLoading ? (
                <div>
                  <div style={{ marginBottom: 12, fontSize: 13.5, color: 'var(--color-text-muted)' }}>
                    Scanning nearby outlets...
                  </div>
                  <ShopSkeleton count={3} />
                </div>
              ) : nearbyError ? (
                <div className="card" style={{ padding: 32 }}>
                  <ErrorState
                    title="Unable to load nearby shops"
                    message={nearbyError}
                    onRetry={loadNearbyShops}
                  />
                </div>
              ) : filteredNearbyShops.length === 0 ? (
                /* No Shops in Radius Empty State */
                <div
                  className="card"
                  style={{
                    textAlign: 'center',
                    padding: '40px 24px',
                    borderRadius: 'var(--radius-xl)',
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-surface-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    <MapPin size={28} />
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>
                    No partner shops found within {radiusLabel}
                  </h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, marginBottom: 20 }}>
                    Try increasing the search radius to discover outlets slightly further away.
                  </p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {selectedRadius < 1000 && (
                      <Button variant="secondary" size="sm" onClick={() => setSelectedRadius(1000)}>
                        Expand to 1 km
                      </Button>
                    )}
                    {selectedRadius < 2000 && (
                      <Button variant="secondary" size="sm" onClick={() => setSelectedRadius(2000)}>
                        Expand to 2 km
                      </Button>
                    )}
                    {selectedRadius < 5000 && (
                      <Button variant="primary" size="sm" onClick={() => setSelectedRadius(5000)}>
                        Expand to 5 km
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                /* Nearby List */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {filteredNearbyShops.map((shop) => (
                    <ShopCard
                      key={shop.id}
                      shop={shop}
                      isSelected={shop.id === selectedShopId}
                      onSelect={() => setSelectedShopId(shop.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ==================== STANDARD DIRECTORY VIEW ==================== */
        <div>
          {loading ? (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 20,
                }}
              >
                <div className="skeleton" style={{ width: 220, height: 20 }} />
                <div className="skeleton" style={{ width: 140, height: 20 }} />
              </div>
              <ShopSkeleton count={6} />
            </div>
          ) : error ? (
            <div className="card" style={{ padding: 40 }}>
              <ErrorState
                title="Unable to load shops"
                message="Please try again."
                onRetry={loadShops}
              />
            </div>
          ) : allShops.length === 0 ? (
            <EmptyState
              icon={<Store size={32} />}
              title="No shops available"
              message="Try changing your search or check back later."
              actionText="Refresh Directory"
              onAction={loadShops}
            />
          ) : sortedShops.length === 0 ? (
            <EmptyState
              icon={<Store size={32} />}
              title="No shops found"
              message="Try a different search."
              actionText="Clear Search & Filters"
              onAction={handleResetAll}
            />
          ) : (
            <div>
              {/* Results Header Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--color-text-main)' }}>
                  Showing {sortedShops.length}{' '}
                  {sortedShops.length === 1 ? 'verified partner outlet' : 'verified partner outlets'}
                  {selectedCategory !== 'ALL' && (
                    <span style={{ fontWeight: 500, color: 'var(--color-text-muted)', marginLeft: 6 }}>
                      in {selectedCategory}
                    </span>
                  )}
                  {searchQuery && (
                    <span style={{ fontWeight: 500, color: 'var(--color-primary-deep)', marginLeft: 6 }}>
                      matching &ldquo;{searchQuery}&rdquo;
                    </span>
                  )}
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={handleResetAll}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary)',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <RotateCcw size={13} />
                    <span>Show All Shops ({allShops.length})</span>
                  </button>
                )}
              </div>

              {/* Responsive Shop Cards Grid */}
              <ShopGrid shops={sortedShops} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
