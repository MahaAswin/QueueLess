import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
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

interface CustomerNavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string; color?: string }>;
  end?: boolean;
}

const CUSTOMER_NAV_ITEMS: CustomerNavItem[] = [
  { label: 'Home', path: '/customer', icon: Home, end: true },
  { label: 'Explore Shops', path: '/customer/shops', icon: Store },
  { label: 'My Cart', path: '/customer/cart', icon: ShoppingCart },
  { label: 'Orders & Pickups', path: '/customer/orders', icon: Receipt },
  { label: 'Account Profile', path: '/customer/profile', icon: User },
];

export const CustomerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [hoveredTooltip, setHoveredTooltip] = useState<{ label: string; top: number } | null>(null);

  // Auto-close expanded drawer on navigation on mobile
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsExpanded(false);
    }
  }, [location.pathname]);

  // Handle Escape key to collapse sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  // Lock body scroll when drawer is open on mobile screen
  useEffect(() => {
    if (isExpanded && window.innerWidth <= 768) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isExpanded]);

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

  const handleNavClick = () => {
    setHoveredTooltip(null);
    if (window.innerWidth <= 768) {
      setIsExpanded(false);
    }
  };

  return (
    <div className={`app-layout customer-layout ${isExpanded ? 'sidebar-open' : ''}`}>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`drawer-backdrop ${isExpanded ? 'active' : ''}`}
        onClick={() => setIsExpanded(false)}
        role="presentation"
        aria-hidden="true"
      />

      {/* Floating Hover Tooltip for Collapsed Rail */}
      {!isExpanded && hoveredTooltip && (
        <div
          style={{
            position: 'fixed',
            left: 80,
            top: hoveredTooltip.top,
            transform: 'translateY(-50%)',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            fontSize: 12.5,
            fontWeight: 600,
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.3)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            letterSpacing: '0.2px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: '100%',
              top: '50%',
              transform: 'translateY(-50%)',
              borderWidth: 5,
              borderStyle: 'solid',
              borderColor: 'transparent #0F172A transparent transparent',
            }}
          />
          {hoveredTooltip.label}
        </div>
      )}

      {/* Navigation Rail / Collapsible Sidebar */}
      <aside
        id="customer-sidebar"
        role="navigation"
        aria-label="Customer Navigation"
        className={`app-sidebar ${isExpanded ? 'expanded open' : 'collapsed'}`}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            padding: isExpanded ? '0 20px' : '0 12px',
            borderBottom: '1px solid var(--color-border)',
            justifyContent: isExpanded ? 'space-between' : 'center',
            minHeight: 'var(--header-height)',
          }}
        >
          {isExpanded ? (
            <>
              <QueueLessLogo size="md" subtitle="EXPRESS PICKUP" variant="standard" />
              <button
                onClick={() => setIsExpanded(false)}
                aria-label="Close navigation menu"
                className="mobile-close-btn"
              >
                <X size={20} color="var(--color-text-muted)" />
              </button>
            </>
          ) : (
            <div
              className="nav-rail-item"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              onClick={() => setIsExpanded(true)}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredTooltip({ label: 'QueueLess Express (Expand)', top: rect.top + rect.height / 2 });
              }}
              onMouseLeave={() => setHoveredTooltip(null)}
              title="QueueLess - Click to expand"
            >
              <QueueLessLogo size={36} variant="mark-only" />
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div style={{ flex: 1, padding: isExpanded ? '20px 14px' : '16px 8px', overflowY: 'auto' }}>
          {isExpanded && (
            <div
              className="sidebar-section-title"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--color-text-light)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                padding: '0 8px 10px',
              }}
            >
              Customer Menu
            </div>
          )}

          {CUSTOMER_NAV_ITEMS.map((item) => (
            <div className="nav-rail-item" key={item.path}>
              <NavLink
                to={item.path}
                end={item.end}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={handleNavClick}
                aria-label={item.label}
                onMouseEnter={(e) => {
                  if (!isExpanded) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredTooltip({ label: item.label, top: rect.top + rect.height / 2 });
                  }
                }}
                onMouseLeave={() => setHoveredTooltip(null)}
              >
                <item.icon size={19} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </div>
          ))}
        </div>

        {/* User Card Footer */}
        <div
          style={{
            padding: isExpanded ? '16px' : '12px 8px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: isExpanded ? 'row' : 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: isExpanded ? 10 : 8,
            backgroundColor: 'var(--color-surface-subtle)',
          }}
        >
          {isExpanded ? (
            <>
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
                <div className="user-info-text" style={{ minWidth: 0 }}>
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
                    {user?.fullName || 'Customer'}
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
                    {user?.email || 'customer@queueless.com'}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                aria-label="Sign Out"
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
            </>
          ) : (
            <div
              className="user-rail-item"
              style={{
                position: 'relative',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '4px 0',
              }}
              onClick={() => navigate('/customer/profile')}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredTooltip({ label: `Account (${user?.fullName || 'Customer'})`, top: rect.top + rect.height / 2 });
              }}
              onMouseLeave={() => setHoveredTooltip(null)}
              title={`Account (${user?.fullName || 'Customer'})`}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-sage)',
                  color: 'var(--color-primary-deep)',
                  fontWeight: 700,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {user?.fullName?.charAt(0).toUpperCase() || 'C'}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className={`app-main-wrapper ${isExpanded ? 'sidebar-expanded' : ''}`}>
        {/* Top Header */}
        <header className="app-header glass-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, maxWidth: 580 }}>
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              aria-label={isExpanded ? 'Collapse navigation rail' : 'Expand navigation rail'}
              aria-expanded={isExpanded}
              aria-controls="customer-sidebar"
              className="menu-toggle-btn mobile-menu-btn"
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
              aria-label="My Cart"
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
              aria-label="Notifications"
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
