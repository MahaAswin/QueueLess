import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Store,
  Package,
  Receipt,
  AlertCircle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
                backgroundColor: '#1E293B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <ShieldCheck size={20} color="#38BDF8" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, color: 'var(--color-text-main)', letterSpacing: '-0.3px' }}>
                QueueLess
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#0284C7', letterSpacing: '0.8px' }}>
                ADMIN CONTROL
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
            System Governance
          </div>

          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <ShieldAlert size={19} className="nav-icon" />
            <span>Dashboard Overview</span>
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Users size={19} className="nav-icon" />
            <span>User Management</span>
          </NavLink>

          <NavLink
            to="/admin/shops"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Store size={19} className="nav-icon" />
            <span>Shop Approvals</span>
          </NavLink>

          <NavLink
            to="/admin/products"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Package size={19} className="nav-icon" />
            <span>Product Catalog</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Receipt size={19} className="nav-icon" />
            <span>Order Logs</span>
          </NavLink>

          <NavLink
            to="/admin/complaints"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <AlertCircle size={19} className="nav-icon" />
            <span>Complaints & Disputes</span>
          </NavLink>

          <NavLink
            to="/admin/analytics"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <BarChart3 size={19} className="nav-icon" />
            <span>Analytics & Reports</span>
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Settings size={19} className="nav-icon" />
            <span>System Settings</span>
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
              A
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.fullName || 'System Admin'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-light)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ display: 'flex', alignItems: 'center', padding: 6, color: 'var(--color-text-main)' }}
              className="mobile-menu-btn"
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
