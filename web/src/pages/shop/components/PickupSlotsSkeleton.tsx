import React from 'react';

export const PickupSlotsSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPIs Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card" style={{ padding: 20, height: 90 }}>
            <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 28, width: '30%' }} />
          </div>
        ))}
      </div>

      {/* Date Navigation Skeleton */}
      <div className="card" style={{ padding: 20, height: 76 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton" style={{ height: 28, width: 220 }} />
          <div className="skeleton" style={{ height: 36, width: 300, borderRadius: 'var(--radius-md)' }} />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--color-border)' }}>
          <div className="skeleton" style={{ height: 20, width: '100%' }} />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
            }}
          >
            <div className="skeleton" style={{ height: 20, width: 120 }} />
            <div className="skeleton" style={{ height: 20, width: 100 }} />
            <div className="skeleton" style={{ height: 20, width: 160 }} />
            <div className="skeleton" style={{ height: 24, width: 90, borderRadius: 'var(--radius-full)' }} />
            <div className="skeleton" style={{ height: 32, width: 180, borderRadius: 'var(--radius-sm)' }} />
          </div>
        ))}
      </div>
    </div>
  );
};
