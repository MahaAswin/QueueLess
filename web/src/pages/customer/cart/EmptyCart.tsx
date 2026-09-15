import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Store, Sparkles } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const EmptyCart: React.FC = () => {
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
        maxWidth: 580,
        margin: '20px auto 40px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-light-sage)',
          color: 'var(--color-primary-deep)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          boxShadow: '0 4px 14px var(--color-primary-glow)',
        }}
      >
        <ShoppingCart size={38} />
      </div>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 12px',
          backgroundColor: 'var(--color-primary-subtle)',
          borderRadius: 'var(--radius-full)',
          color: 'var(--color-primary-deep)',
          fontSize: 11.5,
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        <Sparkles size={12} />
        <span>ZERO-WAIT BASKET</span>
      </div>

      <h2
        style={{
          fontSize: 24,
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
          fontSize: 15,
          maxWidth: 380,
          lineHeight: 1.5,
          marginBottom: 28,
        }}
      >
        Explore shops and add something you'd like to order.
      </p>

      <Button
        variant="primary"
        size="lg"
        onClick={() => navigate('/customer/shops')}
        icon={<Store size={18} />}
      >
        Explore Shops
      </Button>
    </div>
  );
};
