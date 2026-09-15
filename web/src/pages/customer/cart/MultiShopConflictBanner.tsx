import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface MultiShopConflictBannerProps {
  onResolve: () => void;
}

export const MultiShopConflictBanner: React.FC<MultiShopConflictBannerProps> = ({
  onResolve,
}) => {
  return (
    <div
      className="card"
      style={{
        padding: '16px 20px',
        backgroundColor: 'var(--color-warning-bg)',
        borderColor: 'var(--color-warning-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(217, 119, 6, 0.15)',
            color: 'var(--color-warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={20} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#92400E' }}>
            Multi-Shop Conflict Detected
          </div>
          <div style={{ fontSize: 13, color: '#B45309', marginTop: 2 }}>
            Items from different shops cannot be checked out together.
          </div>
        </div>
      </div>

      <Button
        variant="danger"
        size="sm"
        onClick={onResolve}
        icon={<Trash2 size={14} />}
      >
        Clear Conflicting Items
      </Button>
    </div>
  );
};
