import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { getRoleHomeRoute } from '../../utils/auth';

export const ForbiddenPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const redirectPath = getRoleHomeRoute(user?.role);

  const handleLogoutAndSwitch = async () => {
    await logout();
    navigate('/login');
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
      <p style={{ color: 'var(--color-text-muted)', fontSize: 16, maxWidth: 440, marginBottom: 16 }}>
        You do not have the required permissions to view this portal.
      </p>
      {user && (
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 24 }}>
          Currently signed in as: <strong style={{ color: 'var(--color-text-main)' }}>{user.email}</strong> (Role: <span style={{ textTransform: 'capitalize' }}>{user.role}</span>)
        </p>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to={redirectPath} style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="md" icon={<ArrowLeft size={16} />}>
            Return to Dashboard
          </Button>
        </Link>
        <Button
          variant="secondary"
          size="md"
          icon={<LogOut size={16} />}
          onClick={handleLogoutAndSwitch}
        >
          Sign Out & Switch Account
        </Button>
      </div>
    </div>
  );
};

