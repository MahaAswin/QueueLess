import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { cartService } from '../../services/cartService';
import type { Cart, CartItem } from '../../types/cart.types';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/feedback/ErrorState';

import { CartItemRow } from './cart/CartItemRow';
import { CartSummary } from './cart/CartSummary';
import { EmptyCart } from './cart/EmptyCart';
import { CartSkeleton } from './cart/CartSkeleton';
import { MultiShopConflictBanner } from './cart/MultiShopConflictBanner';

export const CustomerCartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Modals
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Fetch cart on mount
  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setCart({ items: [], totalItemCount: 0, subtotal: 0 });
      } else {
        setError(err?.response?.data?.message || 'Failed to load your cart. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Update item quantity
  const handleUpdateQuantity = async (item: CartItem, newQty: number) => {
    const itemId = item.id || item.itemId;
    if (!itemId) return;

    if (newQty < 1) {
      handleRemoveItem(item);
      return;
    }

    setUpdatingId(itemId);

    // Optimistic local state update for instant subtotal calculation
    if (cart) {
      const updatedItems = cart.items.map((i) => {
        if ((i.id || i.itemId) === itemId) {
          const unitPrice = typeof i.price === 'number' ? i.price : parseFloat(String(i.price)) || 0;
          return {
            ...i,
            quantity: newQty,
            subtotal: unitPrice * newQty,
          };
        }
        return i;
      });
      const newSubtotal = updatedItems.reduce((acc, curr) => acc + curr.subtotal, 0);
      const newTotalCount = updatedItems.reduce((acc, curr) => acc + curr.quantity, 0);

      setCart({
        ...cart,
        items: updatedItems,
        subtotal: newSubtotal,
        totalItemCount: newTotalCount,
      });
    }

    try {
      const updatedCart = await cartService.updateItemQuantity(itemId, newQty);
      setCart(updatedCart);
    } catch (err: any) {
      // Revert / re-fetch on error
      await fetchCart();
      alert(err?.response?.data?.message || 'Failed to update item quantity.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Remove item
  const handleRemoveItem = async (item: CartItem) => {
    const itemId = item.id || item.itemId;
    if (!itemId) return;

    setUpdatingId(itemId);

    // Optimistic local state update
    if (cart) {
      const filteredItems = cart.items.filter((i) => (i.id || i.itemId) !== itemId);
      const newSubtotal = filteredItems.reduce((acc, curr) => acc + curr.subtotal, 0);
      const newTotalCount = filteredItems.reduce((acc, curr) => acc + curr.quantity, 0);

      setCart({
        ...cart,
        items: filteredItems,
        subtotal: newSubtotal,
        totalItemCount: newTotalCount,
        ...(filteredItems.length === 0 ? { shopId: undefined, shopName: undefined } : {}),
      });
    }

    try {
      const updatedCart = await cartService.removeItem(itemId);
      setCart(updatedCart);
    } catch (err: any) {
      await fetchCart();
      alert(err?.response?.data?.message || 'Failed to remove item from cart.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Clear entire cart
  const handleClearCart = async () => {
    setShowClearConfirm(false);
    setLoading(true);
    try {
      await cartService.clearCart();
      setCart({ items: [], totalItemCount: 0, subtotal: 0 });
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to clear cart.');
    } finally {
      setLoading(false);
    }
  };

  // Proceed to Checkout handler
  const handleProceedToCheckout = () => {
    navigate('/customer/checkout');
  };

  // Check for multi-shop cart items
  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  const distinctShopIds = useMemo(() => {
    const shopSet = new Set<string>();
    items.forEach((item) => {
      if (item.shopId) {
        shopSet.add(item.shopId);
      }
    });
    return Array.from(shopSet);
  }, [items]);

  const hasMultiShopConflict = distinctShopIds.length > 1;

  if (loading) {
    return <CartSkeleton />;
  }

  if (error) {
    return <ErrorState title="Unable to load basket" message={error} onRetry={fetchCart} />;
  }

  if (isEmpty) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
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
            <span>EXPRESS BASKET</span>
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: 'var(--color-text-main)',
              fontFamily: 'var(--font-heading)',
              margin: '0 0 6px 0',
            }}
          >
            Your Cart
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14.5 }}>
            Review your items before choosing a pickup time.
          </p>
        </div>

        <EmptyCart />
      </div>
    );
  }

  const primaryShopName = cart?.shopName || items[0]?.shopName || 'Partner Shop';
  const primaryShopId = cart?.shopId || items[0]?.shopId;
  const totalItemCount = cart?.totalItemCount || items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = cart?.subtotal || items.reduce((acc, i) => acc + (i.subtotal || i.price * i.quantity), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 100,
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: 420,
              width: '100%',
              textAlign: 'center',
              padding: '28px 24px',
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertCircle size={28} />
            </div>

            <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 6 }}>
              Clear all items?
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, marginBottom: 20 }}>
              Are you sure you want to remove all items from your express pickup cart?
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleClearCart}
              >
                Yes, Clear Cart
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
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
            <span>EXPRESS BASKET</span>
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: 'var(--color-text-main)',
              fontFamily: 'var(--font-heading)',
              margin: '0 0 6px 0',
            }}
          >
            Your Cart
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14.5 }}>
            Review your items before choosing a pickup time.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowClearConfirm(true)}
        >
          Clear Cart
        </Button>
      </div>

      {/* Multi-shop Conflict Warning Banner */}
      {hasMultiShopConflict && (
        <MultiShopConflictBanner onResolve={() => setShowClearConfirm(true)} />
      )}

      {/* 2-Column Responsive Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: 28,
          alignItems: 'flex-start',
        }}
        className="cart-grid-layout"
      >
        {/* Left Column: Shop Banner + Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          {/* Shop Banner */}
          {primaryShopName && (
            <div
              className="card"
              style={{
                padding: '16px 20px',
                backgroundColor: 'var(--color-light-sage)',
                borderColor: 'var(--color-sage)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-primary-deep)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Store size={22} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--color-primary-deep)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                    }}
                  >
                    Ordering From
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {primaryShopName}
                  </div>
                </div>
              </div>

              {primaryShopId && (
                <Link to={`/customer/shop/${primaryShopId}`}>
                  <Button variant="outline" size="sm">
                    Add More Items
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Cart Items Card */}
          <div
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-subtle)',
                fontWeight: 700,
                fontSize: 14,
                color: 'var(--color-text-main)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Cart Items ({totalItemCount})</span>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 500 }}>
                Prices in INR (₹)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {items.map((item, index) => {
                const itemId = item.id || item.itemId || String(index);
                const isItemUpdating = updatingId === itemId;

                return (
                  <CartItemRow
                    key={itemId}
                    item={item}
                    shopName={primaryShopName}
                    isUpdating={isItemUpdating}
                    onUpdateQuantity={(newQty) => handleUpdateQuantity(item, newQty)}
                    onRemove={() => handleRemoveItem(item)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary (Sticky) */}
        <div style={{ position: 'sticky', top: 96, zIndex: 10 }}>
          <CartSummary
            subtotal={subtotal}
            itemCount={totalItemCount}
            isCheckingOut={false}
            onProceedToCheckout={handleProceedToCheckout}
            onClearCart={() => setShowClearConfirm(true)}
          />
        </div>
      </div>
    </div>
  );
};
