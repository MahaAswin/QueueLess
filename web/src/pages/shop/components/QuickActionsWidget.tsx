import React from 'react';
import { Link } from 'react-router-dom';
import { Receipt, Package, Clock, KeyRound, Store, HelpCircle } from 'lucide-react';

export const QuickActionsWidget: React.FC = () => {
  const actions = [
    {
      label: 'Live Orders',
      desc: 'Process pending & ready baskets',
      to: '/shop-owner/orders',
      icon: <Receipt size={20} />,
      color: 'var(--color-primary)',
      bg: 'var(--color-primary-subtle)',
    },
    {
      label: 'Catalog & Stock',
      desc: 'Update prices & availability',
      to: '/shop-owner/products',
      icon: <Package size={20} />,
      color: '#0284C7',
      bg: '#E0F2FE',
    },
    {
      label: 'Pickup Slots',
      desc: 'Review & counter-propose times',
      to: '/shop-owner/pickup-slots',
      icon: <Clock size={20} />,
      color: '#D97706',
      bg: '#FEF3C7',
    },
    {
      label: 'Pickup Verification',
      desc: 'Verify customer 6-digit OTP',
      to: '/shop-owner/pickup-verification',
      icon: <KeyRound size={20} />,
      color: 'var(--color-primary-deep)',
      bg: 'var(--color-sage)',
    },
    {
      label: 'Shop Profile',
      desc: 'Edit outlet hours & address',
      to: '/shop-owner/profile',
      icon: <Store size={20} />,
      color: '#7C3AED',
      bg: '#F5F3FF',
    },
    {
      label: 'Customer Support',
      desc: 'Review complaints & tickets',
      to: '/shop-owner/complaints',
      icon: <HelpCircle size={20} />,
      color: '#475569',
      bg: '#F1F5F9',
    },
  ];

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Quick Operational Actions</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 12,
        }}
      >
        {actions.map((act) => (
          <Link
            key={act.to}
            to={act.to}
            className="interactive-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                backgroundColor: act.bg,
                color: act.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {act.icon}
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-text-main)' }}>
                {act.label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-light)', lineHeight: 1.2 }}>
                {act.desc}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
