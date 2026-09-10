import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Store,
  MapPin,
  Phone,
  ArrowLeft,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Package,
} from 'lucide-react';
import { shopService } from '../../services/shopService';
import { productService } from '../../services/productService';
import { cartService } from '../../services/cartService';
import type { Shop } from '../../types/shop.types';
import type { Product, ProductCategory } from '../../types/product.types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { EmptyState } from '../../components/feedback/EmptyState';

export const ShopDetailsPage: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Quantity per product selection
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>({});
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedNotification, setAddedNotification] = useState<string | null>(null);

  const loadShopAndProducts = async () => {
    if (!shopId) return;
    setLoading(true);
    setError(null);
    try {
      const [shopData, productsData] = await Promise.all([
        shopService.getShopById(shopId),
        productService.getProductsByShop(shopId),
      ]);
      setShop(shopData);
      setProducts(productsData || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load shop details and products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShopAndProducts();
  }, [shopId]);

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, Math.min(99, current + delta));
      return { ...prev, [productId]: next };
    });
  };

  const handleAddToCart = async (product: Product) => {
    setAddingId(product.id);
    const qty = quantities[product.id] || 1;
    try {
      await cartService.addToCart(product.id, qty);
      setAddedNotification(`Added ${qty}x "${product.name}" to your basket!`);
      setTimeout(() => {
        setAddedNotification(null);
      }, 3500);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to add item to basket.');
    } finally {
      setAddingId(null);
    }
  };

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Extract available categories from products
  const availableCategories: (ProductCategory | string)[] = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  if (loading) {
    return <LoadingState message="Loading partner shop details and products..." />;
  }

  if (error || !shop) {
    return (
      <ErrorState
        title="Unable to load shop details"
        message={error || 'Shop details could not be found.'}
        onRetry={loadShopAndProducts}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, position: 'relative' }}>
      {/* Toast Notification for Cart Actions */}
      {addedNotification && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 100,
            backgroundColor: 'var(--color-primary-deep)',
            color: '#FFFFFF',
            padding: '14px 20px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary-deep)',
            }}
          >
            <Check size={16} strokeWidth={3} />
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{addedNotification}</div>
          </div>
          <Link to="/customer/cart">
            <Button variant="secondary" size="sm" style={{ marginLeft: 8 }}>
              View Cart
            </Button>
          </Link>
        </div>
      )}

      {/* Navigation Breadcrumb */}
      <div>
        <Link
          to="/customer/shops"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13.5,
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            marginBottom: 8,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to All Partner Shops</span>
        </Link>
      </div>

      {/* Shop Info Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-light-sage) 100%)',
          borderColor: 'var(--color-sage)',
          padding: '32px 36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24,
        }}
      >
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-primary-deep)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Store size={36} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800 }}>{shop.name}</h1>
              <Badge variant="neutral">{shop.category}</Badge>
              <Badge variant={shop.status === 'ACTIVE' ? 'success' : 'warning'}>
                {shop.status === 'ACTIVE' ? 'Express Pickup Open' : shop.status}
              </Badge>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14.5, maxWidth: 640, marginBottom: 8 }}>
              {shop.description || 'Verified partner shop with advance express ordering.'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 13, color: 'var(--color-text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={15} color="var(--color-text-light)" />
                {shop.address}, {shop.city}
              </span>
              {shop.phone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Phone size={15} color="var(--color-text-light)" />
                  {shop.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div>
          <Link to="/customer/cart">
            <Button variant="primary" size="lg" icon={<ShoppingCart size={18} />}>
              Go to Cart
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar for Products */}
      <div
        className="card"
        style={{
          padding: 18,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50)',
                color: 'var(--color-text-light)',
              }}
            />
            <input
              type="text"
              placeholder={`Search products in ${shop.name}...`}
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

        {availableCategories.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-light)' }}>
              Categories:
            </span>
            <button
              onClick={() => setSelectedCategory('ALL')}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: 12.5,
                fontWeight: selectedCategory === 'ALL' ? 700 : 500,
                backgroundColor:
                  selectedCategory === 'ALL'
                    ? 'var(--color-primary-deep)'
                    : 'var(--color-surface-subtle)',
                color: selectedCategory === 'ALL' ? '#FFFFFF' : 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
              }}
            >
              All Items ({products.length})
            </button>
            {availableCategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 12.5,
                    fontWeight: isSelected ? 700 : 500,
                    backgroundColor: isSelected
                      ? 'var(--color-primary-deep)'
                      : 'var(--color-surface-subtle)',
                    color: isSelected ? '#FFFFFF' : 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Catalog Grid */}
      <div>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>
            Available Products ({filteredProducts.length})
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5 }}>
            Select item quantities and add directly to your express pickup basket
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={<Package size={28} />}
            title="No products found"
            message={
              searchQuery || selectedCategory !== 'ALL'
                ? 'No items match your active search or category filter.'
                : 'This shop does not currently have any active products listed.'
            }
            actionText={searchQuery || selectedCategory !== 'ALL' ? 'Reset Filters' : undefined}
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
            }}
          />
        ) : (
          <div className="grid-3">
            {filteredProducts.map((product) => {
              const qty = quantities[product.id] || 1;
              const isAdding = addingId === product.id;
              const isAvailable = product.available !== false && (product.stockQuantity === undefined || product.stockQuantity > 0);

              return (
                <div
                  key={product.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-surface-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--color-primary)',
                        }}
                      >
                        <Package size={22} />
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {product.category && <Badge variant="neutral">{product.category}</Badge>}
                        <Badge variant={isAvailable ? 'success' : 'error'}>
                          {isAvailable ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </div>
                    </div>

                    <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{product.name}</h3>
                    <p
                      style={{
                        color: 'var(--color-text-muted)',
                        fontSize: 13,
                        marginBottom: 14,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.4,
                      }}
                    >
                      {product.description || 'Standard packaged grocery item'}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary-deep)' }}>
                        ${Number(product.price).toFixed(2)}
                      </span>
                      {product.preparationTimeMinutes && product.preparationTimeMinutes > 0 && (
                        <span style={{ fontSize: 11.5, color: 'var(--color-text-light)' }}>
                          • ~{product.preparationTimeMinutes} min prep
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity and Add to Cart Section */}
                  <div
                    style={{
                      paddingTop: 14,
                      borderTop: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    {/* Quantity Picker */}
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
                        onClick={() => handleQuantityChange(product.id, -1)}
                        disabled={qty <= 1 || !isAvailable}
                        style={{
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: qty <= 1 ? 'var(--color-text-light)' : 'var(--color-text-main)',
                        }}
                      >
                        <Minus size={14} />
                      </button>
                      <span
                        style={{
                          minWidth: 26,
                          textAlign: 'center',
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(product.id, 1)}
                        disabled={!isAvailable}
                        style={{
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--color-text-main)',
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Add Button */}
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!isAvailable}
                      isLoading={isAdding}
                      onClick={() => handleAddToCart(product)}
                      icon={<ShoppingCart size={15} />}
                    >
                      {isAvailable ? 'Add to Cart' : 'Unavailable'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
