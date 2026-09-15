import React from 'react';
import { Sparkles, AlertCircle, X } from 'lucide-react';
import { useCheckout } from './checkout/useCheckout';
import { CheckoutItems } from './checkout/CheckoutItems';
import { PickupSlotSelector } from './checkout/PickupSlotSelector';
import { CustomerInfo } from './checkout/CustomerInfo';
import { CheckoutSummary } from './checkout/CheckoutSummary';
import { CheckoutEmptyCart } from './checkout/CheckoutEmptyCart';
import { CheckoutSkeleton } from './checkout/CheckoutSkeleton';

export const CustomerCheckoutPage: React.FC = () => {
  const {
    cart,
    shop,
    user,
    dates,
    selectedDate,
    setSelectedDate,
    availableSlots,
    selectedSlot,
    setSelectedSlot,
    loading,
    submitting,
    error,
    setError,
    handleConfirmOrder,
  } = useCheckout();

  if (loading) {
    return <CheckoutSkeleton />;
  }

  const items = cart?.items || [];
  if (items.length === 0) {
    return <CheckoutEmptyCart />;
  }

  const primaryShopName = cart?.shopName || shop?.name || items[0]?.shopName || 'Partner Shop';
  const totalItemCount = cart?.totalItemCount || items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = cart?.subtotal || items.reduce((acc, i) => acc + (i.subtotal || i.price * i.quantity), 0);

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
          <span>ZERO-WAIT CHECKOUT</span>
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
          Checkout
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14.5 }}>
          Review your order details and confirm your express pickup slot.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          className="card"
          style={{
            padding: '14px 18px',
            backgroundColor: 'var(--color-error-bg)',
            borderColor: 'var(--color-error-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={18} color="var(--color-error)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13.5, color: '#991B1B', fontWeight: 500 }}>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#991B1B',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={16} />
          </button>
        </div>
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
        {/* Left Column: Items, Pickup Schedule, Customer Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          {/* Order Items */}
          <CheckoutItems
            items={items}
            shopName={primaryShopName}
            shopId={cart?.shopId}
          />

          {/* Pickup Slot Selection */}
          <PickupSlotSelector
            dates={dates}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            slots={availableSlots}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
            shopOpeningTime={shop?.openingTime}
            shopClosingTime={shop?.closingTime}
          />

          {/* Customer Information */}
          <CustomerInfo user={user} />
        </div>

        {/* Right Column: Sticky Order Summary */}
        <div style={{ position: 'sticky', top: 96, zIndex: 10 }}>
          <CheckoutSummary
            subtotal={subtotal}
            itemCount={totalItemCount}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            isSubmitting={submitting}
            onConfirmOrder={handleConfirmOrder}
          />
        </div>
      </div>
    </div>
  );
};
