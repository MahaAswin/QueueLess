import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Store,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { cartService } from '../../services/cartService';
import { orderService } from '../../services/orderService';
import type { Cart, CartItem } from '../../types/cart.types';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { EmptyState } from '../../components/feedback/EmptyState';

export const CustomerCartPage: React.FC = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (err: any) {
      // If 404 or empty cart response, treat as empty cart
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

  const handleUpdateQuantity = async (item: CartItem, newQty: number) => {
    const itemId = item.id || item.itemId;
    if (!itemId) return;

    if (newQty <= 0) {
      handleRemoveItem(item);
      return;
    }

    setUpdatingId(itemId);
    try {
      const updatedCart = await cartService.updateItemQuantity(itemId, newQty);
      setCart(updatedCart);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update item quantity.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (item: CartItem) => {
    const itemId = item.id || item.itemId;
    if (!itemId) return;

    setUpdatingId(itemId);
    try {
      const updatedCart = await cartService.removeItem(itemId);
      setCart(updatedCart);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to remove item from cart.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear all items from your basket?')) {
      return;
    }
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

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const order = await orderService.checkout();
      setCheckoutSuccess(true);
      setTimeout(() => {
        navigate('/customer/orders', {
          state: { newlyCreatedOrderId: order.id },
        });
      }, 1500);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Checkout failed. Please ensure items are available.');
      setIsCheckingOut(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your active express pickup basket..." />;
  }

  if (error) {
    return <ErrorState title="Unable to load basket" message={error} onRetry={fetchCart} />;
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  if (checkoutSuccess) {
    return (
      <div
        className="card"
        style={{
          maxWidth: 540,
          margin: '40px auto',
          textAlign: 'center',
          padding: '48px 32px',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <CheckCircle2 size={36} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Order Placed Successfully!</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 15, marginBottom: 24 }}>
          Your advance express pickup order has been created. Redirecting to your Orders dashboard...
        </p>
        <Link to="/customer/orders">
          <Button variant="primary" size="md">
            View My Orders & Pickups
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-main)' }}>
            My Shopping Cart
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14.5 }}>
            Review items, customize quantities, and proceed to zero-wait pickup checkout.
          </p>
        </div>

        {!isEmpty && (
          <Button variant="outline" size="sm" onClick={handleClearCart} icon={<Trash2 size={15} />}>
            Clear Cart
          </Button>
        )}
      </div>

      {isEmpty ? (
        <EmptyState
          icon={<ShoppingCart size={32} />}
          title="Your cart is currently empty"
          message="Browse nearby partner shops to add items and place an advance express pickup order."
          actionText="Explore Partner Shops"
          onAction={() => navigate('/customer/shops')}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: 28,
            alignItems: 'flex-start',
          }}
          className="cart-grid-layout"
        >
          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Shop Origin Banner */}
            {cart?.shopName && (
              <div
                className="card"
                style={{
                  padding: '16px 20px',
                  backgroundColor: 'var(--color-light-sage)',
                  borderColor: 'var(--color-sage)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-primary-deep)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Store size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary-deep)', textTransform: 'uppercase' }}>
                      Ordering From
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-main)' }}>
                      {cart.shopName}
                    </div>
                  </div>
                </div>

                {cart.shopId && (
                  <Link to={`/customer/shops/${cart.shopId}`}>
                    <Button variant="outline" size="sm">
                      Add More Items
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Items Table Card */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Cart Items ({cart?.totalItemCount || items.length})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {items.map((item, index) => {
                  const itemId = item.id || item.itemId || String(index);
                  const isItemUpdating = updatingId === itemId;

                  return (
                    <div
                      key={itemId}
                      style={{
                        padding: '18px 20px',
                        borderBottom: index < items.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 16,
                      }}
                    >
                      {/* Product details */}
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
                          {item.productName}
                        </h4>
                        <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                          ${Number(item.price).toFixed(2)} each
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
                            onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                            disabled={isItemUpdating}
                            style={{
                              padding: '5px 8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--color-text-main)',
                            }}
                          >
                            <Minus size={13} />
                          </button>
                          <span
                            style={{
                              minWidth: 28,
                              textAlign: 'center',
                              fontSize: 13.5,
                              fontWeight: 700,
                            }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                            disabled={isItemUpdating}
                            style={{
                              padding: '5px 8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--color-text-main)',
                            }}
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div style={{ minWidth: 70, textAlign: 'right', fontWeight: 700, fontSize: 15 }}>
                          ${Number(item.subtotal || item.price * item.quantity).toFixed(2)}
                        </div>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item)}
                          disabled={isItemUpdating}
                          style={{
                            padding: 6,
                            color: 'var(--color-error)',
                            borderRadius: 'var(--radius-sm)',
                          }}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>Order Summary</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Items Subtotal</span>
                  <span style={{ fontWeight: 600 }}>${Number(cart?.subtotal || 0).toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Express Pickup Fee</span>
                  <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>FREE ($0.00)</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Convenience Surcharge</span>
                  <span style={{ fontWeight: 600 }}>$0.00</span>
                </div>

                <div
                  style={{
                    paddingTop: 14,
                    marginTop: 6,
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 700 }}>Total Payable</span>
                  <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-primary-deep)' }}>
                    ${Number(cart?.subtotal || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--color-primary-subtle)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 12.5,
                  color: 'var(--color-primary-deep)',
                  marginBottom: 20,
                }}
              >
                <Clock size={18} style={{ flexShrink: 0 }} />
                <span>Zero-Wait Guarantee: Your basket is packed and reserved for your scheduled slot.</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                style={{ width: '100%' }}
                isLoading={isCheckingOut}
                onClick={handleCheckout}
                icon={<ArrowRight size={18} />}
              >
                Proceed to Checkout
              </Button>
            </div>

            {/* Trust badge */}
            <div
              className="card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                backgroundColor: 'var(--color-surface-subtle)',
              }}
            >
              <ShieldCheck size={24} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                Direct merchant verification via QR & express pickup slot guarantee.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
