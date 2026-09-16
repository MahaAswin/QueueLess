import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ShopOwnerSidebar } from './components/ShopOwnerSidebar';
import { ShopOwnerHeader } from './components/ShopOwnerHeader';

export const ShopOwnerLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

      {/* Persistent Desktop / Collapsible Mobile Sidebar */}
      <ShopOwnerSidebar
        mobileMenuOpen={mobileMenuOpen}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="app-main-wrapper">
        <ShopOwnerHeader onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
