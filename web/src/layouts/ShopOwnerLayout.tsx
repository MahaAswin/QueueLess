import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ShopOwnerSidebar } from './components/ShopOwnerSidebar';
import { ShopOwnerHeader } from './components/ShopOwnerHeader';

export const ShopOwnerLayout: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredTooltip, setHoveredTooltip] = useState<{ label: string; top: number } | null>(null);
  const location = useLocation();

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

  return (
    <div className={`app-layout shop-owner-layout ${isExpanded ? 'sidebar-open' : ''}`}>
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
      <ShopOwnerSidebar
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        onTooltipHover={setHoveredTooltip}
      />

      {/* Main Content Area */}
      <div className={`app-main-wrapper ${isExpanded ? 'sidebar-expanded' : ''}`}>
        <ShopOwnerHeader
          onToggleMenu={() => setIsExpanded((prev) => !prev)}
          isExpanded={isExpanded}
        />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
