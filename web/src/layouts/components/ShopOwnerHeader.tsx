import React from 'react';
import { Menu, Zap } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

interface ShopOwnerHeaderProps {
  onToggleMenu: () => void;
  isExpanded?: boolean;
}

export const ShopOwnerHeader: React.FC<ShopOwnerHeaderProps> = ({
  onToggleMenu,
  isExpanded,
}) => {
  return (
    <header className="app-header glass-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onToggleMenu}
          aria-label={isExpanded ? 'Collapse navigation rail' : 'Expand navigation rail'}
          aria-expanded={isExpanded}
          aria-controls="shop-owner-sidebar"
          className="menu-toggle-btn mobile-menu-btn"
        >
          <Menu size={22} />
        </button>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
            Store Management Portal
          </h2>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Badge variant="success">
            <Zap size={13} style={{ marginRight: 2 }} />
            Express Counter Online
          </Badge>
        </div>
      </div>
    </header>
  );
};
