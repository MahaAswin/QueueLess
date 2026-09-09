import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Home,
  Store,
  ShoppingCart,
  Receipt,
  User,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CustomerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/customer/shops?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="app-layout">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            zIndex: 35,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Persistent Desktop Sidebar */}
      <aside className={`app-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-deep)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Zap size={20} fill="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, color: 'var(--color-primary-deep)', letterSpacing: '-0.3px' }}>
                QueueLess
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-light)', letterSpacing: '0.8px' }}>
                EXPRESS PICKUP
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{ display: 'none' }}
            className="mobile-close-btn"
          >
            <X size={20} color="var(--color-text-muted)" />
          </button>
        </div>

        {/* Navigation Links */}
        <div style={{ flex: 1, padding: '20px 14px', overflowY: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '0 8px 10px' }}>
            Customer Menu
          </div>

          <NavLink
            to="/customer"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Home size={19} className="nav-icon" />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/customer/shops"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Store size={19} className="nav-icon" />
            <span>Explore Shops</span>
          </NavLink>

          <NavLink
            to="/customer/cart"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <ShoppingCart size={19} className="nav-icon" />
            <span>My Cart</span>
          </NavLink>

          <NavLink
            to="/customer/orders"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Receipt size={19} className="nav-icon" />
            <span>Orders & Pickups</span>
          </NavLink>

          <NavLink
            to="/customer/profile"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <User size={19} className="nav-icon" />
            <span>Account Profile</span>
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
              {user?.fullName?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.fullName || 'Customer'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-light)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.email || 'customer@queueless.com'}
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
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="app-main-wrapper">
        {/* Top Header */}
        <header className="app-header glass-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, maxWidth: 540 }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ display: 'flex', alignItems: 'center', padding: 6, color: 'var(--color-text-main)' }}
              className="mobile-menu-btn"
            >
              <Menu size={22} />
            </button>
            <form onSubmit={handleSearchSubmit} style={{ width: '100%', position: 'relative' }}>
              <Search
                size={17}
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }}
              />
              <input
                type="text"
                placeholder="Search partner shops, categories, or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 14px 9px 36px',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 13.5,
                  outline: 'none',
                }}
              />
            </form>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <NavLink
              to="/customer/cart"
              style={{
                position: 'relative',
                padding: 8,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface-hover)',
                color: 'var(--color-primary-deep)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingCart size={20} />
            </NavLink>

            <NavLink
              to="/customer/profile"
              style={{
                position: 'relative',
                padding: 8,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface-hover)',
                color: 'var(--color-primary-deep)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={20} />
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
