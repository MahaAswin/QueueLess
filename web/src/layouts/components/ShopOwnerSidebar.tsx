import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Package,
  Clock,
  QrCode,
  HelpCircle,
  Store,
  LogOut,
  X,
} from 'lucide-react';
import { QueueLessLogo } from '../../components/ui/QueueLessLogo';
import { useAuth } from '../../context/AuthContext';

interface ShopOwnerSidebarProps {
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

export const ShopOwnerSidebar: React.FC<ShopOwnerSidebarProps> = ({
  mobileMenuOpen,
  onCloseMobileMenu,
}) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside
      className={`app-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
        transition: 'transform var(--transition-normal)',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          borderBottom: '1px solid var(--color-border)',
          justifyContent: 'space-between',
        }}
      >
        <QueueLessLogo size="md" subtitle="SHOP PARTNER" subtitleColor="var(--color-primary)" />
        <button
          onClick={onCloseMobileMenu}
          aria-label="Close menu"
          style={{
            display: 'none',
            padding: 6,
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
          }}
          className="mobile-close-btn"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Links */}
      <div style={{ flex: 1, padding: '20px 14px', overflowY: 'auto' }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--color-text-light)',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            padding: '0 8px 10px',
          }}
        >
          Store Operations
        </div>

        <NavLink
          to="/shop-owner"
          end
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onCloseMobileMenu}
        >
          <LayoutDashboard size={19} className="nav-icon" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/shop-owner/orders"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onCloseMobileMenu}
        >
          <Receipt size={19} className="nav-icon" />
          <span>Live Orders</span>
        </NavLink>

        <NavLink
          to="/shop-owner/products"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onCloseMobileMenu}
        >
          <Package size={19} className="nav-icon" />
          <span>Products & Stock</span>
        </NavLink>

        <NavLink
          to="/shop-owner/pickup-slots"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onCloseMobileMenu}
        >
          <Clock size={19} className="nav-icon" />
          <span>Pickup Slots</span>
        </NavLink>

        <NavLink
          to="/shop-owner/qr-pickup"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onCloseMobileMenu}
        >
          <QrCode size={19} className="nav-icon" />
          <span>Scan QR Token</span>
        </NavLink>

        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--color-text-light)',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            padding: '18px 8px 10px',
          }}
        >
          Store Support
        </div>

        <NavLink
          to="/shop-owner/complaints"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onCloseMobileMenu}
        >
          <HelpCircle size={19} className="nav-icon" />
          <span>Customer Complaints</span>
        </NavLink>

        <NavLink
          to="/shop-owner/profile"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onCloseMobileMenu}
        >
          <Store size={19} className="nav-icon" />
          <span>Shop Profile</span>
        </NavLink>
      </div>

      {/* User Card Footer */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--color-surface-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-sage)',
              color: 'var(--color-primary-deep)',
              fontWeight: 700,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {user?.fullName?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-text-main)',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {user?.fullName || 'Shop Partner'}
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--color-text-light)',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {user?.email}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign Out"
          style={{
            padding: 6,
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};
