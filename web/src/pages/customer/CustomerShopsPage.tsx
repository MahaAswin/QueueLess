import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Store,
  Sparkles,
  ShoppingBag,
  Zap,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { shopService } from '../../services/shopService';
import type { Shop, ShopCategory } from '../../types/shop.types';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/feedback/ErrorState';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ShopGrid } from '../../components/shop/ShopGrid';
import { ShopSearch } from '../../components/shop/ShopSearch';
import { ShopFilters, type SortOption } from '../../components/shop/ShopFilters';
import { ShopSkeleton } from '../../components/shop/ShopSkeleton';

export const CustomerShopsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = (searchParams.get('category') as ShopCategory | 'ALL') || 'ALL';

  // State
  const [allShops, setAllShops] = useState<Shop[]>([]);
  const [displayedShops, setDisplayedShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'ALL'>(urlCategory);
  const [selectedSort, setSelectedSort] = useState<SortOption>('RECOMMENDED');

  // Load baseline shops from backend API
  const loadShops = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await shopService.getActiveShops();
      setAllShops(data || []);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Unable to load partner shops. Please check your connection.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  // Keep search input synced if URL search param changes externally
  useEffect(() => {
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

  // Filter & Search logic using backend search when available or fallback to in-memory filter
  const executeQuery = useCallback(
    async (query: string, category: ShopCategory | 'ALL') => {
      setError(null);

      // If there's an active text query, we can query backend search API
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
          // Fallback to filtering already loaded shops in case network was interrupted
          const lower = query.toLowerCase().trim();
          let filtered = allShops.filter((s) => {
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
          if (category !== 'ALL') {
            filtered = filtered.filter((s) => s.category === category);
          }
          setDisplayedShops(filtered);
        } finally {
          setSearchLoading(false);
        }
      } else if (category !== 'ALL') {
        // Query backend category filter API
        setSearchLoading(true);
        try {
          const results = await shopService.getShopsByCategory(category);
          setDisplayedShops(results || []);
        } catch {
          // Fallback to in-memory
          setDisplayedShops(allShops.filter((s) => s.category === category));
        } finally {
          setSearchLoading(false);
        }
      } else {
        // Display all active shops
        setDisplayedShops(allShops);
      }
    },
    [allShops]
  );

  // Re-run whenever category or search param or baseline allShops changes
  useEffect(() => {
    if (!loading) {
      executeQuery(searchQuery, selectedCategory);
    }
  }, [loading, searchQuery, selectedCategory, executeQuery]);

  // Update URL search parameters
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

  // Category counts based on active directory
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: allShops.length,
    };
    allShops.forEach((shop) => {
      if (shop.category) {
        counts[shop.category] = (counts[shop.category] || 0) + 1;
      }
    });
    return counts;
  }, [allShops]);

  // Sort displayed shops
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

  const hasActiveFilters = Boolean(searchQuery.trim() || selectedCategory !== 'ALL' || selectedSort !== 'RECOMMENDED');

  return (
    <div
      id="customer-shops-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        maxWidth: 'var(--content-max-width)',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* 1. Page Header & Hero Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, var(--color-light-sage) 60%, var(--color-sage) 100%)',
          borderRadius: 'var(--radius-2xl)',
          padding: '36px 40px',
          border: '1px solid rgba(221, 238, 228, 0.8)',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorative zero-wait watermark icon */}
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
            gap: 24,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ maxWidth: 680 }}>
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
                marginBottom: 12,
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
                fontSize: 34,
                fontWeight: 800,
                color: 'var(--color-text-main)',
                lineHeight: 1.2,
                fontFamily: 'var(--font-heading)',
                marginBottom: 10,
                letterSpacing: '-0.5px',
              }}
            >
              Explore Shops
            </h1>
            <p
              id="explore-shops-subtitle"
              style={{
                color: 'var(--color-text-muted)',
                fontSize: 16,
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              Find a shop, choose what you want, and skip the queue.
            </p>

            {/* Feature Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--color-primary-deep)' }}>
                <Zap size={15} fill="var(--color-primary)" color="var(--color-primary)" />
                <span>Zero-Wait Counter Pickup</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)' }}>
                <ShieldCheck size={15} color="var(--color-primary)" />
                <span>Verified Merchant Partners</span>
              </div>
            </div>
          </div>

          {/* Quick Cart Shortcut */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, alignSelf: 'flex-start' }}>
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

      {/* 2. Prominent Search Bar */}
      <div
        className="card"
        style={{
          padding: '24px 28px',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <ShopSearch
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={handleSearchSubmit}
          onClear={handleClearSearch}
          placeholder="Search shops or products..."
          isSearching={searchLoading}
        />

        {/* Categories and Sort Bar */}
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

      {/* 3. Main Shop Directory Content Area */}
      <div>
        {loading ? (
          /* Initial Loading State */
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
          /* Error State with Retry Button */
          <div className="card" style={{ padding: 40 }}>
            <ErrorState
              title="Unable to load shops"
              message="Please try again."
              onRetry={loadShops}
            />
          </div>
        ) : allShops.length === 0 ? (
          /* Empty System State: No Shops Available */
          <EmptyState
            icon={<Store size={32} />}
            title="No shops available"
            message="Try changing your search or check back later."
            actionText="Refresh Directory"
            onAction={loadShops}
          />
        ) : sortedShops.length === 0 ? (
          /* Empty Search / Filter State: No Shops Found */
          <EmptyState
            icon={<Store size={32} />}
            title="No shops found"
            message="Try a different search."
            actionText="Clear Search & Filters"
            onAction={handleResetAll}
          />
        ) : (
          /* Shops Grid List */
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
    </div>
  );
};
