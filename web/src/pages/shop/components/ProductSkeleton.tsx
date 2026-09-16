import React from 'react';

export const ProductSkeleton: React.FC = () => {
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

      {/* Filter Bar Skeleton */}
      <div className="card" style={{ padding: 16, height: 72 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="skeleton" style={{ height: 40, flex: 1, borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ height: 40, width: 140, borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ height: 40, width: 120, borderRadius: 'var(--radius-md)' }} />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--color-border)' }}>
          <div className="skeleton" style={{ height: 20, width: '100%' }} />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
              <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 12, width: '60%' }} />
              </div>
            </div>
            <div className="skeleton" style={{ height: 20, width: 80 }} />
            <div className="skeleton" style={{ height: 20, width: 60 }} />
            <div className="skeleton" style={{ height: 24, width: 80, borderRadius: 'var(--radius-full)' }} />
          </div>
        ))}
      </div>
    </div>
  );
};
