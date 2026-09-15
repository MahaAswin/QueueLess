import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Store,
  MapPin,
  Phone,
  Clock,
  ArrowLeft,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Package,
  Zap,
  ArrowRight,
  AlertCircle,
  Trash2,
  X,
  Sparkles,
  ShoppingBag,
  UtensilsCrossed,
  Cake,
  Pill,
  BookOpen,
  Beef,
} from 'lucide-react';
import { shopService } from '../../services/shopService';
import { productService } from '../../services/productService';
import { cartService } from '../../services/cartService';
import type { Shop, ShopCategory } from '../../types/shop.types';
import type { Product, ProductCategory } from '../../types/product.types';
import type { Cart } from '../../types/cart.types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ErrorState } from '../../components/feedback/ErrorState';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ShopDetailSkeleton } from './ShopDetailSkeleton';

// Category metadata helper for aesthetic badges & icons
const CATEGORY_META: Record<
  ShopCategory | 'OTHER',
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

const formatOperatingHours = (open?: string, close?: string): string | null => {
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

export const ShopDetailsPage: React.FC = () => {
  const { id, shopId: routeShopId } = useParams<{ id?: string; shopId?: string }>();
  const effectiveShopId = id || routeShopId;
  const navigate = useNavigate();

  // Data States
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);

  // Status States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Quantity per product selection
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addingId, setAddingId] = useState<string | null>(null);

  // Toast Notification
  const [toastNotification, setToastNotification] = useState<{
    title: string;
    description: string;
  } | null>(null);

  // Multi-shop Cart Conflict Modal
  const [conflictModal, setConflictModal] = useState<{
    show: boolean;
    pendingProduct?: Product;
    pendingQty?: number;
    existingShopName?: string;
  }>({ show: false });

  // Initial Data Fetch
  const loadData = useCallback(async () => {
    if (!effectiveShopId) {
      setError('Invalid shop identifier.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [shopData, productsData, cartData] = await Promise.all([
        shopService.getShopById(effectiveShopId),
        productService.getProductsByShop(effectiveShopId).catch(() => [] as Product[]),
        cartService.getCart().catch(() => null),
      ]);

      setShop(shopData);
      setProducts(productsData || []);
      setCart(cartData);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        setError('This partner shop does not exist or has been removed.');
      } else {
        setError(err?.response?.data?.message || 'Unable to load shop details and catalog.');
      }
    } finally {
      setLoading(false);
    }
  }, [effectiveShopId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Adjust product quantity in UI
  const handleQuantityChange = (productId: string, delta: number, maxStock = 99) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, Math.min(maxStock, current + delta));
      return { ...prev, [productId]: next };
    });
  };

  // Add Item to Cart
  const handleAddToCart = async (product: Product, overrideQuantity?: number) => {
    const qty = overrideQuantity ?? (quantities[product.id] || 1);
    setAddingId(product.id);

    try {
      const updatedCart = await cartService.addToCart(product.id, qty);
      setCart(updatedCart);

      setToastNotification({
        title: `Added to Basket!`,
        description: `${qty}x "${product.name}" added to your express pickup order.`,
      });

      setTimeout(() => {
        setToastNotification((curr) => (curr?.title === 'Added to Basket!' ? null : curr));
      }, 4000);
    } catch (err: any) {
      const message: string = err?.response?.data?.message || '';

      // Handle single-shop cart constraint from backend
      if (
        message.toLowerCase().includes('only one shop') ||
        message.toLowerCase().includes('cart can contain')
      ) {
        setConflictModal({
          show: true,
          pendingProduct: product,
          pendingQty: qty,
          existingShopName: cart?.shopName || 'another partner shop',
        });
      } else {
        setToastNotification({
          title: 'Unable to Add Item',
          description: message || 'An error occurred while adding this item to your cart.',
        });
        setTimeout(() => {
          setToastNotification(null);
        }, 4000);
      }
    } finally {
      setAddingId(null);
    }
  };

  // Resolve Cart Conflict: Clear previous shop's cart and add current item
  const handleClearAndAdd = async () => {
    if (!conflictModal.pendingProduct) return;
    const prod = conflictModal.pendingProduct;
    const qty = conflictModal.pendingQty || 1;

    try {
      setAddingId(prod.id);
      await cartService.clearCart();
      const updatedCart = await cartService.addToCart(prod.id, qty);
      setCart(updatedCart);
      setConflictModal({ show: false });

      setToastNotification({
        title: 'Basket Started!',
        description: `Your basket was reset and ${qty}x "${prod.name}" was added.`,
      });
      setTimeout(() => {
        setToastNotification(null);
      }, 4000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update basket.');
    } finally {
      setAddingId(null);
    }
  };

  // Product categories list
  const availableCategories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return cats as ProductCategory[];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Grouped products when viewing All categories with no search query
  const groupedProducts = useMemo(() => {
    if (selectedCategory !== 'ALL' || searchQuery.trim() !== '') {
      return null;
    }
    const map = new Map<string, Product[]>();
    products.forEach((p) => {
      const cat = p.category || 'OTHER';
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(p);
    });
    return map;
  }, [products, selectedCategory, searchQuery]);

  // Is Cart populated for this specific shop?
  const hasItemsFromThisShop = useMemo(() => {
    if (!cart || !shop || !cart.items || cart.items.length === 0) return false;
    // Compare either shopId or check if items belong to this shop
    if (cart.shopId && cart.shopId === shop.id) return true;
    return false;
  }, [cart, shop]);

  if (loading) {
    return <ShopDetailSkeleton />;
  }

  if (error || !shop) {
    return (
      <div style={{ padding: '20px 0' }}>
        <div style={{ marginBottom: 20 }}>
          <Link
            to="/customer/shops"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--color-text-muted)',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to All Shops</span>
          </Link>
        </div>

        <ErrorState
          title="Unable to load shop"
          message={error || 'Shop details could not be found or loaded.'}
          onRetry={loadData}
        />
      </div>
    );
  }

  const isShopActive = shop.status === 'ACTIVE';
  const hoursDisplay = formatOperatingHours(shop.openingTime, shop.closingTime);
  const shopName = shop.shopName || shop.name || 'Partner Outlet';
  const categoryInfo = CATEGORY_META[shop.category] || CATEGORY_META.OTHER;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        position: 'relative',
        paddingBottom: hasItemsFromThisShop ? 90 : 20,
      }}
    >
      {/* 1. TOP BREADCRUMB NAVIGATION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link
          to="/customer/shops"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            transition: 'color var(--transition-fast)',
          }}
        >
          <ArrowLeft size={17} />
          <span>Back to Shops</span>
        </Link>

        {hasItemsFromThisShop && (
          <Link to="/customer/cart">
            <Button
              variant="outline"
              size="sm"
              icon={<ShoppingCart size={15} color="var(--color-primary)" />}
            >
              View Basket ({cart?.totalItemCount || 0})
            </Button>
          </Link>
        )}
      </div>

      {/* 2. SHOP HERO HEADER BANNER */}
      <section
        className="card"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, var(--color-light-sage) 100%)',
          borderColor: 'var(--color-sage)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px 36px',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Accent Bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, var(--color-primary-deep) 0%, var(--color-primary-accent) 100%)',
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 28,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flex: 1, minWidth: 280 }}>
            {/* Shop Avatar / Logo */}
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: 'var(--radius-xl)',
                backgroundColor: categoryInfo.bgColor,
                color: categoryInfo.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: 'var(--shadow-sm)',
                border: '1.5px solid rgba(18, 124, 78, 0.15)',
                overflow: 'hidden',
              }}
            >
              {shop.imageUrl ? (
                <img
                  src={shop.imageUrl}
                  alt={shopName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Store size={44} color={categoryInfo.color} />
              )}
            </div>

            {/* Shop Details */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1
                  style={{
                    fontSize: 'clamp(22px, 2.5vw, 28px)',
                    fontWeight: 800,
                    color: 'var(--color-text-main)',
                    margin: 0,
                  }}
                >
                  {shopName}
                </h1>
                <Badge variant="neutral" icon={categoryInfo.icon}>
                  {categoryInfo.label}
                </Badge>
                <Badge variant={isShopActive ? 'success' : 'warning'}>
                  {isShopActive ? 'Express Pickup Open' : shop.status}
                </Badge>
              </div>

              <p
                style={{
                  color: 'var(--color-text-muted)',
                  fontSize: 14.5,
                  maxWidth: 680,
                  lineHeight: 1.5,
                  marginBottom: 14,
                }}
              >
                {shop.description || 'Verified partner outlet with advance express ordering and counter pickup.'}
              </p>

              {/* Location, Phone, Hours */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  fontSize: 13,
                  color: 'var(--color-text-muted)',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={15} color="var(--color-primary)" />
                  <strong style={{ color: 'var(--color-text-main)' }}>
                    {shop.address}{shop.city ? `, ${shop.city}` : ''}
                  </strong>
                </span>

                {hoursDisplay && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={15} color="var(--color-primary)" />
                    <span>{hoursDisplay}</span>
                  </span>
                )}

                {shop.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={15} color="var(--color-primary)" />
                    <span>{shop.phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick CTA to Cart if items present */}
          {hasItemsFromThisShop && (
            <div style={{ alignSelf: 'center' }}>
              <Link to="/customer/cart">
                <Button variant="primary" size="md" icon={<ShoppingCart size={16} />}>
                  Checkout Basket
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* QueueLess Zero-Wait Guarantee Banner */}
        <div
          style={{
            marginTop: 24,
            paddingTop: 18,
            borderTop: '1px solid rgba(221, 238, 228, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-deep)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={15} fill="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary-deep)' }}>
                Zero-Wait Express Counter Pickup
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>
                Order now &bull; Your items are prepared and packed in advance &bull; Scan QR at counter to collect
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid var(--color-sage)',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--color-primary-deep)',
            }}
          >
            <Clock size={13} />
            <span>Avg Counter Wait: 0 mins</span>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT SEARCH & CATEGORY FILTERS */}
      <section
        className="card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
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
              placeholder={`Search products in ${shopName}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 42 }}
            />
          </div>
          {searchQuery && (
            <Button variant="outline" size="md" onClick={() => setSearchQuery('')}>
              Clear
            </Button>
          )}
        </div>

        {/* Category Pills */}
        {availableCategories.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-text-light)', marginRight: 4 }}>
              Filter Category:
            </span>
            <button
              onClick={() => setSelectedCategory('ALL')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: 13,
                fontWeight: selectedCategory === 'ALL' ? 700 : 500,
                backgroundColor:
                  selectedCategory === 'ALL'
                    ? 'var(--color-primary-deep)'
                    : 'var(--color-surface-subtle)',
                color: selectedCategory === 'ALL' ? '#FFFFFF' : 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              All Items ({products.length})
            </button>
            {availableCategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = products.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 13,
                    fontWeight: isSelected ? 700 : 500,
                    backgroundColor: isSelected
                      ? 'var(--color-primary-deep)'
                      : 'var(--color-surface-subtle)',
                    color: isSelected ? '#FFFFFF' : 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {cat.replace(/_/g, ' ')} ({count})
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. PRODUCT CATALOG */}
      <section>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 20,
          }}
        >
          <div>
            <h2 style={{ fontSize: 21, fontWeight: 800, color: 'var(--color-text-main)' }}>
              {selectedCategory === 'ALL' ? 'Product Catalog' : selectedCategory.replace(/_/g, ' ')}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5 }}>
              Select items and quantities for express pickup preparation
            </p>
          </div>
          <span style={{ fontSize: 13, color: 'var(--color-text-light)', fontWeight: 600 }}>
            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found
          </span>
        </div>

        {/* Empty Catalog State */}
        {products.length === 0 ? (
          <EmptyState
            icon={<Package size={32} />}
            title="No products available"
            message="This partner shop does not currently have any active products listed in their catalog."
            actionText="Explore Other Shops"
            onAction={() => navigate('/customer/shops')}
          />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={<Search size={32} />}
            title="No matching products"
            message="No products match your active search terms or category filter."
            actionText="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
            }}
          />
        ) : groupedProducts ? (
          /* Grouped by Category View when ALL is selected and no active text search */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            {Array.from(groupedProducts.entries()).map(([categoryName, categoryItems]) => (
              <div key={categoryName}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 16,
                    paddingBottom: 8,
                    borderBottom: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {categoryName.replace(/_/g, ' ')}
                  </h3>
                  <Badge variant="neutral">{categoryItems.length}</Badge>
                </div>

                <div className="grid-3">
                  {categoryItems.map((product) => renderProductCard(product))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Filtered or Searched Grid View */
          <div className="grid-3">
            {filteredProducts.map((product) => renderProductCard(product))}
          </div>
        )}
      </section>

      {/* 5. STICKY CART SUMMARY BAR */}
      {hasItemsFromThisShop && cart && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 40px)',
            maxWidth: 820,
            backgroundColor: 'var(--color-primary-deep)',
            color: '#FFFFFF',
            padding: '14px 24px',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 90,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            animation: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <ShoppingCart size={22} />
            </div>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>
                {cart.totalItemCount} {cart.totalItemCount === 1 ? 'item' : 'items'} in your basket
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-sage)', marginTop: 1 }}>
                Subtotal: <strong style={{ color: '#FFFFFF', fontSize: 13.5 }}>₹{Number(cart.subtotal).toFixed(2)}</strong> &bull; {shopName}
              </div>
            </div>
          </div>

          <Link to="/customer/cart" style={{ textDecoration: 'none' }}>
            <Button
              variant="secondary"
              size="md"
              icon={<ArrowRight size={16} />}
              style={{
                backgroundColor: 'var(--color-primary-accent)',
                color: 'var(--color-primary-deep)',
                fontWeight: 700,
                border: 'none',
              }}
            >
              View Cart
            </Button>
          </Link>
        </div>
      )}

      {/* 6. TOAST NOTIFICATION */}
      {toastNotification && (
        <div
          style={{
            position: 'fixed',
            bottom: hasItemsFromThisShop ? 96 : 24,
            right: 24,
            zIndex: 100,
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-main)',
            padding: '14px 20px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            animation: 'fadeIn 0.2s ease',
            maxWidth: 420,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-subtle)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Check size={18} strokeWidth={3} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text-main)' }}>
              {toastNotification.title}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>
              {toastNotification.description}
            </div>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            style={{
              color: 'var(--color-text-light)',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 7. MULTI-SHOP CART CONFLICT MODAL */}
      {conflictModal.show && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            zIndex: 200,
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: 460,
              width: '100%',
              padding: '28px',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-warning-bg)',
                  color: 'var(--color-warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-main)' }}>
                  Start New Basket?
                </h3>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  Single outlet express pickup
                </span>
              </div>
            </div>

            <p style={{ fontSize: 13.5, color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: 20 }}>
              Your current basket already contains items from{' '}
              <strong>{conflictModal.existingShopName}</strong>. QueueLess express orders are prepared
              and picked up directly from a single store at a time.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button
                variant="primary"
                size="md"
                onClick={handleClearAndAdd}
                icon={<Trash2 size={16} />}
              >
                Clear Previous Basket &amp; Add Item
              </Button>

              <div style={{ display: 'flex', gap: 10 }}>
                <Link to="/customer/cart" style={{ flex: 1, textDecoration: 'none' }}>
                  <Button variant="outline" size="md" style={{ width: '100%' }}>
                    View Existing Cart
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setConflictModal({ show: false })}
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper renderer for product card
  function renderProductCard(product: Product) {
    const qty = quantities[product.id] || 1;
    const isAdding = addingId === product.id;
    const isStockPositive = product.stockQuantity === undefined || product.stockQuantity > 0;
    const isAvailable = product.available !== false && isStockPositive && isShopActive;

    return (
      <div
        key={product.id}
        id={`product-card-${product.id}`}
        className="card interactive-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRadius: 'var(--radius-xl)',
          padding: '20px',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          opacity: isAvailable ? 1 : 0.72,
        }}
      >
        <div>
          {/* Card Header: Product Image / Icon & Badges */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 12,
              marginBottom: 14,
            }}
          >
            {/* Product Thumbnail */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Package size={26} color="var(--color-primary)" />
              )}
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
              <Badge variant={isAvailable ? 'success' : 'error'}>
                {isAvailable ? 'In Stock' : 'Out of Stock'}
              </Badge>
              {product.category && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--color-text-light)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                  }}
                >
                  {product.category.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>

          {/* Product Name */}
          <h4
            id={`product-name-${product.id}`}
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--color-text-main)',
              marginBottom: 4,
              lineHeight: 1.3,
            }}
          >
            {product.name}
          </h4>

          {/* Product Description */}
          <p
            style={{
              color: 'var(--color-text-muted)',
              fontSize: 12.5,
              lineHeight: 1.45,
              marginBottom: 14,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.5em',
            }}
          >
            {product.description || 'Verified fresh partner grocery or specialty item.'}
          </p>

          {/* Price and Preparation Time Tag */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
            <span
              style={{
                fontSize: 19,
                fontWeight: 800,
                color: 'var(--color-primary-deep)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              ₹{Number(product.price).toFixed(2)}
            </span>

            {product.preparationTimeMinutes && product.preparationTimeMinutes > 0 ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11.5,
                  color: 'var(--color-text-muted)',
                }}
              >
                <Sparkles size={11} color="var(--color-primary)" />
                ~{product.preparationTimeMinutes} min prep
              </span>
            ) : null}

            {product.stockQuantity !== undefined && product.stockQuantity <= 5 && product.stockQuantity > 0 && (
              <span style={{ fontSize: 11, color: 'var(--color-warning)', fontWeight: 600, marginLeft: 'auto' }}>
                Only {product.stockQuantity} left
              </span>
            )}
          </div>
        </div>

        {/* Quantity Controls & Add to Cart CTA */}
        <div
          style={{
            paddingTop: 12,
            borderTop: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          {/* Quantity Stepper */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--color-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              padding: 2,
            }}
          >
            <button
              type="button"
              id={`qty-minus-${product.id}`}
              onClick={() => handleQuantityChange(product.id, -1, product.stockQuantity || 99)}
              disabled={qty <= 1 || !isAvailable}
              style={{
                padding: '4px 7px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: qty <= 1 || !isAvailable ? 'var(--color-text-light)' : 'var(--color-text-main)',
                cursor: qty <= 1 || !isAvailable ? 'default' : 'pointer',
              }}
            >
              <Minus size={13} />
            </button>
            <span
              id={`qty-val-${product.id}`}
              style={{
                minWidth: 26,
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: isAvailable ? 'var(--color-text-main)' : 'var(--color-text-light)',
              }}
            >
              {qty}
            </span>
            <button
              type="button"
              id={`qty-plus-${product.id}`}
              onClick={() => handleQuantityChange(product.id, 1, product.stockQuantity || 99)}
              disabled={!isAvailable || (product.stockQuantity !== undefined && qty >= product.stockQuantity)}
              style={{
                padding: '4px 7px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: !isAvailable || (product.stockQuantity !== undefined && qty >= product.stockQuantity) ? 'var(--color-text-light)' : 'var(--color-text-main)',
                cursor: !isAvailable ? 'default' : 'pointer',
              }}
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Add to Cart Button */}
          <Button
            id={`add-to-cart-btn-${product.id}`}
            variant="primary"
            size="sm"
            disabled={!isAvailable}
            isLoading={isAdding}
            onClick={() => handleAddToCart(product)}
            icon={<ShoppingCart size={14} />}
          >
            {isAvailable ? 'Add to Cart' : 'Unavailable'}
          </Button>
        </div>
      </div>
    );
  }
};
