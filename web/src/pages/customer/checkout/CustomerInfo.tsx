import React from 'react';
import { User as UserIcon, Mail, Phone, ShieldCheck } from 'lucide-react';
import type { User } from '../../../types/auth.types';

interface CustomerInfoProps {
  user: User | null;
}

export const CustomerInfo: React.FC<CustomerInfoProps> = ({ user }) => {
  return (
    <div
      className="card"
      style={{
        padding: 24,
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 12,
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-subtle)',
              color: 'var(--color-primary-deep)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UserIcon size={18} />
          </div>
          <div>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: 'var(--color-primary-deep)',
                letterSpacing: 0.6,
                textTransform: 'uppercase',
              }}
            >
              CUSTOMER DETAILS
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
              Pickup Contact Information
            </h3>
          </div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            color: 'var(--color-success)',
            fontWeight: 700,
            backgroundColor: 'var(--color-success-bg)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <ShieldCheck size={14} />
          <span>Verified Customer</span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          backgroundColor: 'var(--color-surface-subtle)',
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 2 }}>
            Customer Name
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-main)' }}>
            {user?.fullName || 'Customer'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Mail size={16} color="var(--color-primary)" />
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Email Address</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-text-main)' }}>
              {user?.email || 'customer@queueless.com'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Phone size={16} color="var(--color-primary)" />
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Phone Number</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-text-main)' }}>
              {user?.phone || '+91 98765 43210'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--color-text-light)', lineHeight: 1.4 }}>
        Your pickup confirmation pass and QR code will be generated for this account immediately upon placing the order.
      </div>
    </div>
  );
};
