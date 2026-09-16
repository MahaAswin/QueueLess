import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Store, ShoppingBag, ShieldAlert, ArrowRight } from 'lucide-react';

export const AdminQuickActionsWidget: React.FC = () => {
  const actions = [
    {
      title: 'User Management',
      description: 'Audit registered customer and shop owner accounts',
      link: '/admin/users',
      icon: <Users size={20} color="var(--color-primary)" />,
      iconBg: 'var(--color-primary-bg)',
    },
    {
      title: 'Shop Outlet Governance',
      description: 'Review pending registrations, locations, and activations',
      link: '/admin/shops',
      icon: <Store size={20} color="var(--color-info)" />,
      iconBg: 'var(--color-info-bg)',
    },
    {
      title: 'Platform Order Oversight',
      description: 'Monitor cross-outlet orders, queues, and pickups',
      link: '/admin/orders',
      icon: <ShoppingBag size={20} color="var(--color-success)" />,
      iconBg: 'var(--color-success-bg)',
    },
    {
      title: 'Complaint & Trust Review',
      description: 'Inspect filed disputes and enforce account sanctions',
      link: '/admin/complaints',
      icon: <ShieldAlert size={20} color="var(--color-error)" />,
      iconBg: 'var(--color-error-bg)',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}
    >
      {actions.map((act, idx) => (
        <Link
          key={idx}
          to={act.link}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div
            className="card interactive-card"
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              height: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: act.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {act.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-main)' }}>
                  {act.title}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--color-text-light)', marginTop: 2 }}>
                  {act.description}
                </div>
              </div>
            </div>

            <ArrowRight size={16} color="var(--color-text-light)" />
          </div>
        </Link>
      ))}
    </div>
  );
};
