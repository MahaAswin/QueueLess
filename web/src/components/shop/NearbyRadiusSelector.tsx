import React from 'react';
import { RADIUS_OPTIONS, type RadiusOption } from '../../types/shop.types';
import { Navigation } from 'lucide-react';

interface NearbyRadiusSelectorProps {
  selectedRadius: number;
  onSelectRadius: (radius: number) => void;
  disabled?: boolean;
}

export const NearbyRadiusSelector: React.FC<NearbyRadiusSelectorProps> = ({
  selectedRadius,
  onSelectRadius,
  disabled = false,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--color-text-main)',
        }}
      >
        <Navigation size={14} color="var(--color-primary)" />
        <span>Nearby shops within:</span>
      </div>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
          backgroundColor: 'var(--color-surface-subtle)',
          padding: 4,
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}
      >
        {RADIUS_OPTIONS.map((opt: RadiusOption) => {
          const isActive = selectedRadius === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => onSelectRadius(opt.value)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                cursor: disabled ? 'not-allowed' : 'pointer',
                backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--color-text-main)',
                boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
