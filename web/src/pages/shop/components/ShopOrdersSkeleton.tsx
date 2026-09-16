import React from 'react';

export const ShopOrdersSkeleton: React.FC = () => {
  return (
    <div>
      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div className="skeleton" style={{ height: 26, width: 180, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 16, width: 280 }} />
        </div>
        <div className="skeleton" style={{ height: 38, width: 110, borderRadius: 'var(--radius-md)' }} />
      </div>

      {/* KPIs Skeleton */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card">
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 26, width: '40%', marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 10, width: '70%' }} />
            </div>
            <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)' }} />
          </div>
        ))}
      </div>

      {/* Filter Bar Skeleton */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton" style={{ height: 34, width: 100, borderRadius: 'var(--radius-full)' }} />
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-subtle)' }}>
          <div className="skeleton" style={{ height: 16, width: 140 }} />
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div className="skeleton" style={{ width: 70, height: 16 }} />
                <div className="skeleton" style={{ width: 120, height: 16 }} />
                <div className="skeleton" style={{ width: 80, height: 22, borderRadius: 'var(--radius-full)' }} />
              </div>
              <div className="skeleton" style={{ width: 140, height: 32, borderRadius: 'var(--radius-sm)' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
