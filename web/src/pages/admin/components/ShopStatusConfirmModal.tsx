import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, ShieldCheck, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type { AdminShop } from '../../../types/admin.types';

interface ShopStatusConfirmModalProps {
  shop: AdminShop;
  action: 'ACTIVATE' | 'REJECT' | 'SUSPEND' | 'REINSTATE';
  isSubmitting: boolean;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export const ShopStatusConfirmModal: React.FC<ShopStatusConfirmModalProps> = ({
  shop,
  action,
  isSubmitting,
  onConfirm,
  onClose,
}) => {
  const getActionConfig = () => {
    switch (action) {
      case 'ACTIVATE':
        return {
          title: 'Approve & Activate Shop',
          description: `Are you sure you want to approve and activate "${shop.shopName || shop.name}"? This shop will become publicly visible to customers and can receive express pickup orders immediately.`,
          icon: <CheckCircle2 size={32} color="#10B981" />,
          buttonVariant: 'primary' as const,
          buttonText: 'Approve & Activate',
          bgIcon: '#D1FAE5',
        };
      case 'REJECT':
        return {
          title: 'Reject Shop Registration',
          description: `Are you sure you want to reject "${shop.shopName || shop.name}"? The shop will be marked INACTIVE and will not be displayed to customers.`,
          icon: <XCircle size={32} color="#EF4444" />,
          buttonVariant: 'danger' as const,
          buttonText: 'Reject Shop',
          bgIcon: '#FEE2E2',
        };
      case 'SUSPEND':
        return {
          title: 'Suspend Shop Outlet',
          description: `Are you sure you want to suspend "${shop.shopName || shop.name}"? The outlet will be hidden from customer search, active products will be disabled, and new orders will be blocked until reinstated.`,
          icon: <AlertTriangle size={32} color="#EF4444" />,
          buttonVariant: 'danger' as const,
          buttonText: 'Suspend Shop',
          bgIcon: '#FEE2E2',
        };
      case 'REINSTATE':
        return {
          title: 'Reinstate Shop Outlet',
          description: `Are you sure you want to reinstate "${shop.shopName || shop.name}"? The outlet will return to ACTIVE status and resume accepting customer pickups.`,
          icon: <ShieldCheck size={32} color="#10B981" />,
          buttonVariant: 'primary' as const,
          buttonText: 'Reinstate Shop',
          bgIcon: '#D1FAE5',
        };
    }
  };

  const config = getActionConfig();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 110,
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
          maxWidth: 480,
          padding: 24,
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            padding: 4,
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header & Icon */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 20 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 'var(--radius-full)',
              backgroundColor: config.bgIcon,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
            }}
          >
            {config.icon}
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px 0', color: 'var(--color-text-main)' }}>
            {config.title}
          </h3>

          <p style={{ fontSize: 13.5, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
            {config.description}
          </p>
        </div>

        {/* Shop Info Card */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface-subtle)',
            border: '1px solid var(--color-border)',
            marginBottom: 24,
            fontSize: 12.5,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Shop Name:</span>
            <strong style={{ color: 'var(--color-text-main)' }}>{shop.shopName || shop.name}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Location:</span>
            <span style={{ color: 'var(--color-text-main)' }}>{shop.city}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Current Status:</span>
            <strong style={{ color: 'var(--color-text-main)' }}>{shop.status}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            variant={config.buttonVariant}
            size="md"
            isLoading={isSubmitting}
            onClick={onConfirm}
          >
            {config.buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};
