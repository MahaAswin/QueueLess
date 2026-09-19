import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Store,
  Receipt,
  AlertCircle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { QueueLessLogo } from '../components/ui/QueueLessLogo';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';

interface AdminNavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string; color?: string }>;
  end?: boolean;
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: 'Dashboard Overview', path: '/admin', icon: ShieldAlert, end: true },
  { label: 'User Management', path: '/admin/users', icon: Users },
  { label: 'Shops', path: '/admin/shops', icon: Store },
  { label: 'Orders', path: '/admin/orders', icon: Receipt },
  { label: 'Complaints & Disputes', path: '/admin/complaints', icon: AlertCircle },
  { label: 'Analytics & Reports', path: '/admin/reports', icon: BarChart3 },
  { label: 'System Settings', path: '/admin/settings', icon: Settings },
];

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredTooltip, setHoveredTooltip] = useState<{ label: string; top: number } | null>(null);

  // Auto-close expanded drawer upon route navigation on mobile
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsExpanded(false);
    }
  }, [location.pathname]);

  // Handle Escape key to collapse drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (isExpanded && window.innerWidth <= 768) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isExpanded]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    setHoveredTooltip(null);
    if (window.innerWidth <= 768) {
      setIsExpanded(false);
    }
  };

  return (
    <div className={`app-layout admin-layout ${isExpanded ? 'sidebar-open' : ''}`}>
      {/* Mobile Drawer Overlay / Backdrop */}
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

      {/* Collapsible Sidebar / Navigation Rail */}
      <aside
        id="admin-sidebar"
        role="navigation"
        aria-label="Admin Navigation"
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
              <QueueLessLogo size="md" subtitle="ADMIN CONTROL" subtitleColor="#0284C7" variant="standard" />
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
                setHoveredTooltip({ label: 'QueueLess Admin (Expand)', top: rect.top + rect.height / 2 });
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
              System Governance
            </div>
          )}

          {ADMIN_NAV_ITEMS.map((item) => (
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
                    backgroundColor: '#E0F2FE',
                    color: '#0369A1',
                    fontWeight: 700,
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {user?.fullName?.charAt(0).toUpperCase() || 'A'}
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
                    {user?.fullName || 'System Admin'}
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
              onClick={() => navigate('/admin/settings')}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredTooltip({ label: `Admin Profile (${user?.fullName || 'System Admin'})`, top: rect.top + rect.height / 2 });
              }}
              onMouseLeave={() => setHoveredTooltip(null)}
              title={`Admin Profile (${user?.fullName || 'System Admin'})`}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#E0F2FE',
                  color: '#0369A1',
                  fontWeight: 700,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {user?.fullName?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className={`app-main-wrapper ${isExpanded ? 'sidebar-expanded' : ''}`}>
        {/* Top Header */}
        <header className="app-header glass-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              aria-label={isExpanded ? 'Collapse navigation rail' : 'Expand navigation rail'}
              aria-expanded={isExpanded}
              aria-controls="admin-sidebar"
              className="menu-toggle-btn mobile-menu-btn"
            >
              <Menu size={22} />
            </button>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Admin Control Center</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Badge variant="info">Global Scope</Badge>
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
