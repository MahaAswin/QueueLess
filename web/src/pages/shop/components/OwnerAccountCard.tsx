import React from 'react';
import { User as UserIcon, Mail, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import type { User } from '../../../types/auth.types';

interface OwnerAccountCardProps {
  user: User | null;
}

export const OwnerAccountCard: React.FC<OwnerAccountCardProps> = ({ user }) => {
  if (!user) return null;

  return (
    <div className="card" style={{ marginBottom: 24, padding: '20px 24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
            }}
          >
            <UserIcon size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
              Account Owner
            </h3>
            <p style={{ fontSize: 12, color: 'var(--color-text-light)', margin: '2px 0 0 0' }}>
              Authenticated user credentials & access permissions
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Badge variant="success" icon={<CheckCircle2 size={12} />}>
            Verified Owner
          </Badge>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          backgroundColor: 'var(--color-surface-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Full Name */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 4 }}>
            Full Name
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-main)' }}>
            {user.fullName || 'Shop Owner'}
          </div>
        </div>

        {/* Email */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 4 }}>
            Email Address
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Mail size={13} color="var(--color-text-light)" />
            <span>{user.email}</span>
          </div>
        </div>

        {/* Phone */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 4 }}>
            Contact Number
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Phone size={13} color="var(--color-text-light)" />
            <span>{user.phone || 'Not configured'}</span>
          </div>
        </div>

        {/* Role */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 4 }}>
            Role Authority
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary-deep)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} color="var(--color-primary)" />
            <span>SHOP_OWNER</span>
          </div>
        </div>
      </div>
    </div>
  );
};
