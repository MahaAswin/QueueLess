import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Store } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const CheckoutEmptyCart: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="card"
      style={{
        padding: '64px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 560,
        margin: '30px auto',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-light-sage)',
          color: 'var(--color-primary-deep)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <ShoppingCart size={36} />
      </div>

      <h2
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: 'var(--color-text-main)',
          marginBottom: 8,
          fontFamily: 'var(--font-heading)',
        }}
      >
        Your cart is empty
      </h2>

      <p
        style={{
          color: 'var(--color-text-muted)',
          fontSize: 14.5,
          maxWidth: 360,
          lineHeight: 1.5,
          marginBottom: 24,
        }}
      >
        Please add items to your cart from partner shops before proceeding to checkout.
      </p>

      <Button
        variant="primary"
        size="lg"
        onClick={() => navigate('/customer/shops')}
        icon={<Store size={18} />}
      >
        Back to Shops
      </Button>
    </div>
  );
};
