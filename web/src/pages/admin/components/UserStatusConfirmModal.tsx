import React from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type { AdminUser } from '../../../types/admin.types';

interface UserStatusConfirmModalProps {
  user: AdminUser | null;
  action: 'SUSPEND' | 'REINSTATE' | null;
  isSubmitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const UserStatusConfirmModal: React.FC<UserStatusConfirmModalProps> = ({
  user,
  action,
  isSubmitting,
  onConfirm,
  onClose,
}) => {
  if (!user || !action) return null;

  const isSuspend = action === 'SUSPEND';

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
          maxWidth: 460,
          padding: 24,
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              backgroundColor: isSuspend
                ? 'var(--color-error-bg)'
                : 'var(--color-success-bg)',
              color: isSuspend
                ? 'var(--color-error)'
                : 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {isSuspend ? <AlertTriangle size={22} /> : <ShieldCheck size={22} />}
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
              {isSuspend ? 'Suspend User Account' : 'Reinstate User Account'}
            </h3>
            <p style={{ fontSize: 12.5, color: 'var(--color-text-light)', margin: '2px 0 0 0' }}>
              Confirm governance action for this user
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto',
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

        {/* User Card */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface-subtle)',
            border: '1px solid var(--color-border)',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text-main)' }}>
            {user.fullName}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
            {user.email} • {user.phone || 'No phone'}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--color-text-light)', marginTop: 4 }}>
            Role: <strong style={{ color: 'var(--color-text-main)' }}>{user.role}</strong>
          </div>
        </div>

        {/* Warning / Explanation Text */}
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: 20 }}>
          {isSuspend
            ? 'Are you sure you want to suspend this user? They will be immediately blocked from logging in, making purchases, or managing shop inventory until reinstated.'
            : 'Are you sure you want to reinstate this user? Their account will be reactivated immediately, restoring platform access.'}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="secondary" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant={isSuspend ? 'danger' : 'primary'}
            size="md"
            isLoading={isSubmitting}
            onClick={onConfirm}
          >
            {isSuspend ? 'Confirm Suspension' : 'Confirm Reinstatement'}
          </Button>
        </div>
      </div>
    </div>
  );
};
