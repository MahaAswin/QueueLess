import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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

interface ShopNavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string; color?: string }>;
  end?: boolean;
}

const STORE_OPERATIONS: ShopNavItem[] = [
  { label: 'Dashboard', path: '/shop-owner', icon: LayoutDashboard, end: true },
  { label: 'Live Orders', path: '/shop-owner/orders', icon: Receipt },
  { label: 'Products & Stock', path: '/shop-owner/products', icon: Package },
  { label: 'Pickup Slots', path: '/shop-owner/pickup-slots', icon: Clock },
  { label: 'Scan QR Token', path: '/shop-owner/qr-pickup', icon: QrCode },
];

const STORE_SUPPORT: ShopNavItem[] = [
  { label: 'Customer Complaints', path: '/shop-owner/complaints', icon: HelpCircle },
  { label: 'Shop Profile', path: '/shop-owner/profile', icon: Store },
];

interface ShopOwnerSidebarProps {
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  onTooltipHover: (tooltip: { label: string; top: number } | null) => void;
}

export const ShopOwnerSidebar: React.FC<ShopOwnerSidebarProps> = ({
  isExpanded,
  setIsExpanded,
  onTooltipHover,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    onTooltipHover(null);
    if (window.innerWidth <= 768) {
      setIsExpanded(false);
    }
  };

  return (
    <aside
      id="shop-owner-sidebar"
      role="navigation"
      aria-label="Shop Owner Navigation"
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
            <QueueLessLogo size="md" subtitle="SHOP PARTNER" subtitleColor="var(--color-primary)" variant="standard" />
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
              onTooltipHover({ label: 'QueueLess Partner (Expand)', top: rect.top + rect.height / 2 });
            }}
            onMouseLeave={() => onTooltipHover(null)}
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
            Store Operations
          </div>
        )}

        {STORE_OPERATIONS.map((item) => (
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
                  onTooltipHover({ label: item.label, top: rect.top + rect.height / 2 });
                }
              }}
              onMouseLeave={() => onTooltipHover(null)}
            >
              <item.icon size={19} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </NavLink>
          </div>
        ))}

        {isExpanded && (
          <div
            className="sidebar-section-title"
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
        )}

        {STORE_SUPPORT.map((item) => (
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
                  onTooltipHover({ label: item.label, top: rect.top + rect.height / 2 });
                }
              }}
              onMouseLeave={() => onTooltipHover(null)}
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
                {user?.fullName?.charAt(0).toUpperCase() || 'S'}
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
            onClick={() => navigate('/shop-owner/profile')}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onTooltipHover({ label: `Shop Profile (${user?.fullName || 'Shop Partner'})`, top: rect.top + rect.height / 2 });
            }}
            onMouseLeave={() => onTooltipHover(null)}
            title={`Shop Profile (${user?.fullName || 'Shop Partner'})`}
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
              {user?.fullName?.charAt(0).toUpperCase() || 'S'}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
