import React from 'react';
import { Users, Store, ShoppingBag, AlertCircle, Clock } from 'lucide-react';
import type { AdminDashboardSummary } from '../../../types/admin.types';

interface AdminKPIsProps {
  summary: AdminDashboardSummary | null;
}

export const AdminKPIs: React.FC<AdminKPIsProps> = ({ summary }) => {
  if (!summary) return null;

  const cards = [
    {
      title: 'Platform Users',
      value: summary.users.totalUsers,
      breakdown: `${summary.users.totalCustomers} Customers • ${summary.users.totalShopOwners} Shop Owners`,
      icon: <Users size={20} color="var(--color-primary)" />,
      iconBg: 'var(--color-primary-bg)',
      color: 'var(--color-primary)',
    },
    {
      title: 'Partner Shops',
      value: summary.shops.totalShops,
      breakdown: `${summary.shops.activeShops} Active • ${summary.shops.pendingShops} Pending Approval`,
      icon: <Store size={20} color="var(--color-info)" />,
      iconBg: 'var(--color-info-bg)',
      color: 'var(--color-info)',
    },
    {
      title: 'Total Platform Orders',
      value: summary.orders.totalOrders,
      breakdown: `${summary.orders.collectedOrders} Completed • ${summary.orders.cancelledOrders + summary.orders.rejectedOrders} Cancelled/Declined`,
      icon: <ShoppingBag size={20} color="var(--color-success)" />,
      iconBg: 'var(--color-success-bg)',
      color: 'var(--color-success)',
    },
    {
      title: 'Active Orders in Queue',
      value:
        summary.orders.pendingOrders +
        summary.orders.confirmedOrders +
        summary.orders.preparingOrders +
        summary.orders.readyForPickupOrders,
      breakdown: `${summary.orders.preparingOrders} Preparing • ${summary.orders.readyForPickupOrders} Ready at Counter`,
      icon: <Clock size={20} color="var(--color-warning)" />,
      iconBg: 'var(--color-warning-bg)',
      color: 'var(--color-warning)',
    },
    {
      title: 'Platform Complaints',
      value: summary.complaints.totalComplaints,
      breakdown: `${summary.complaints.pendingComplaints} Pending Review • ${summary.complaints.validComplaints} Resolved Valid`,
      icon: <AlertCircle size={20} color="var(--color-error)" />,
      iconBg: 'var(--color-error-bg)',
      color: 'var(--color-error)',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}
    >
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="card"
          style={{
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {card.title}
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                backgroundColor: card.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {card.icon}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-main)', lineHeight: 1 }}>
              {card.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 6 }}>
              {card.breakdown}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
