import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export const ForbiddenPage: React.FC = () => {
  const { user } = useAuth();

  const getRedirectPath = () => {
    if (user?.role === 'ADMIN') return '/admin';
    if (user?.role === 'SHOP_OWNER') return '/shop';
    return '/customer';
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-error-bg)',
          color: 'var(--color-error)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <ShieldAlert size={36} />
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 10 }}>403 - Access Denied</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 16, maxWidth: 440, marginBottom: 28 }}>
        You do not have the required permissions to view this portal. Please return to your account area.
      </p>
      <Link to={getRedirectPath()}>
        <Button variant="primary" size="md" icon={<ArrowLeft size={16} />}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};
