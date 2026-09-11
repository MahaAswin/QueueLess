import React from 'react';

interface ShopSkeletonProps {
  count?: number;
}

export const ShopSkeleton: React.FC<ShopSkeletonProps> = ({ count = 6 }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 24,
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="card"
          style={{
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 320,
          }}
        >
          <div>
            {/* Top row: Icon + badges */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 16,
              }}
            >
              <div
                className="skeleton"
                style={{ width: 50, height: 50, borderRadius: 'var(--radius-lg)' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <div className="skeleton" style={{ width: 90, height: 22, borderRadius: 12 }} />
                <div className="skeleton" style={{ width: 70, height: 20, borderRadius: 12 }} />
              </div>
            </div>

            {/* Shop title skeleton */}
            <div
              className="skeleton"
              style={{ width: '68%', height: 22, borderRadius: 4, marginBottom: 10 }}
            />

            {/* Description lines */}
            <div
              className="skeleton"
              style={{ width: '100%', height: 14, borderRadius: 4, marginBottom: 6 }}
            />
            <div
              className="skeleton"
              style={{ width: '85%', height: 14, borderRadius: 4, marginBottom: 16 }}
            />

            {/* Feature badge skeleton */}
            <div
              className="skeleton"
              style={{ width: '100%', height: 36, borderRadius: 'var(--radius-md)', marginBottom: 18 }}
            />

            {/* Address & contact lines */}
            <div
              className="skeleton"
              style={{ width: '60%', height: 14, borderRadius: 4, marginBottom: 8 }}
            />
            <div
              className="skeleton"
              style={{ width: '40%', height: 14, borderRadius: 4, marginBottom: 16 }}
            />
          </div>

          {/* Footer button */}
          <div
            style={{
              paddingTop: 16,
              borderTop: '1px solid var(--color-border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 4 }} />
            <div className="skeleton" style={{ width: 96, height: 32, borderRadius: 'var(--radius-md)' }} />
          </div>
        </div>
      ))}
    </div>
  );
};
