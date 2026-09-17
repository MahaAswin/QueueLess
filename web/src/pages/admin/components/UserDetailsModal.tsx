import React from 'react';
import { Mail, Phone, Calendar, AlertTriangle, ShieldCheck, ShieldAlert, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { formatDateShort } from '../../../utils/formatters';
import type { AdminUser } from '../../../types/admin.types';

interface UserDetailsModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onOpenConfirmAction: (user: AdminUser, action: 'SUSPEND' | 'REINSTATE') => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  onClose,
  onOpenConfirmAction,
}) => {
  if (!user) return null;

  const isProtectedAdmin = user.role === 'ADMIN';
  const isSuspended = user.accountStatus === 'SUSPENDED';
  const userId = user.userId || user.id || '';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 520,
          padding: 24,
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 16,
            borderBottom: '1px solid var(--color-border)',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-full)',
                backgroundColor: isProtectedAdmin
                  ? '#E0F2FE'
                  : user.role === 'SHOP_OWNER'
                  ? 'var(--color-info-bg)'
                  : 'var(--color-primary-bg)',
                color: isProtectedAdmin
                  ? '#0369A1'
                  : user.role === 'SHOP_OWNER'
                  ? 'var(--color-info)'
                  : 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
                {user.fullName}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                {isProtectedAdmin ? (
                  <Badge variant="info">Protected Admin</Badge>
                ) : user.role === 'SHOP_OWNER' ? (
                  <Badge variant="info">Shop Owner</Badge>
                ) : (
                  <Badge variant="neutral">Customer</Badge>
                )}
                {isSuspended ? (
                  <Badge variant="error">Suspended</Badge>
                ) : (
                  <Badge variant="success">Active</Badge>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          {/* User ID */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-subtle)',
              border: '1px solid var(--color-border)',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)' }}>User ID</span>
            <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--color-text-main)' }}>
              {userId}
            </span>
          </div>

          {/* Email */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Mail size={16} color="var(--color-text-muted)" />
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)', width: 100 }}>Email:</span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-text-main)' }}>
              {user.email}
            </span>
          </div>

          {/* Phone */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Phone size={16} color="var(--color-text-muted)" />
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)', width: 100 }}>Phone:</span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-text-main)' }}>
              {user.phone || '—'}
            </span>
          </div>

          {/* Registration Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calendar size={16} color="var(--color-text-muted)" />
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)', width: 100 }}>Joined:</span>
            <span style={{ fontSize: 13, color: 'var(--color-text-main)' }}>
              {user.createdAt ? formatDateShort(user.createdAt) : '—'}
            </span>
          </div>

          {/* Valid Complaints */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={16} color="var(--color-text-muted)" />
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)', width: 100 }}>Complaints:</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color:
                  (user.validComplaintCount || 0) > 0
                    ? 'var(--color-error)'
                    : 'var(--color-text-main)',
              }}
            >
              {user.validComplaintCount || 0} valid dispute(s)
            </span>
          </div>
        </div>

        {/* Protected Admin Notice */}
        {isProtectedAdmin && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#F0F9FF',
              border: '1px solid #BAE6FD',
              color: '#0369A1',
              fontSize: 12.5,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 20,
            }}
          >
            <ShieldAlert size={16} />
            <span>This is the single default Admin account and is protected from modification or suspension.</span>
          </div>
        )}

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 16,
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>

          {!isProtectedAdmin && (
            <div>
              {isSuspended ? (
                <Button
                  variant="primary"
                  size="md"
                  icon={<ShieldCheck size={16} />}
                  onClick={() => onOpenConfirmAction(user, 'REINSTATE')}
                >
                  Reinstate Account
                </Button>
              ) : (
                <Button
                  variant="danger"
                  size="md"
                  icon={<AlertTriangle size={16} />}
                  onClick={() => onOpenConfirmAction(user, 'SUSPEND')}
                >
                  Suspend Account
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
