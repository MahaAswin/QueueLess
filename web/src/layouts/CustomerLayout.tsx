import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { QueueLessLogo } from '../components/ui/QueueLessLogo';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';

export const CustomerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        if (isMounted) setUnreadNotificationsCount(count ?? 0);
      } catch {
        // Soft fail
      }
    };

    fetchUnread();

    const handleUpdate = () => {
      fetchUnread();
    };

    window.addEventListener('queueless:notifications-updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('queueless:notifications-updated', handleUpdate);
    };
  }, []);

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
          <QueueLessLogo size="md" subtitle="EXPRESS PICKUP" />
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
              to="/customer/profile/notifications"
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
              title="Notifications"
            >
              <Bell size={20} />
              {unreadNotificationsCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-primary-deep)',
                    color: '#FFFFFF',
                    fontSize: 10,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    boxShadow: '0 0 0 2px var(--color-surface)',
                  }}
                >
                  {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                </span>
              )}
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
