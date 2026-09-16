import React from 'react';

export const ShopDashboardSkeleton: React.FC = () => {
  return (
    <div>
      {/* Top Banner Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div className="skeleton" style={{ height: 28, width: 220, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 16, width: 300 }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="skeleton" style={{ height: 40, width: 140, borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ height: 40, width: 140, borderRadius: 'var(--radius-md)' }} />
        </div>
      </div>

      {/* Shop Summary Skeleton */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 'var(--radius-lg)' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 22, width: '35%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: '55%' }} />
          </div>
        </div>
      </div>

      {/* Metrics Row Skeleton */}
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

      {/* Queue Visualizer Skeleton */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="skeleton" style={{ height: 20, width: '25%', marginBottom: 16 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <div className="skeleton" style={{ height: 64, borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ height: 64, borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ height: 64, borderRadius: 'var(--radius-md)' }} />
        </div>
      </div>

      {/* Grid for Orders Table & Side Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div className="card">
          <div className="skeleton" style={{ height: 20, width: '30%', marginBottom: 16 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="skeleton" style={{ height: 40 }} />
            <div className="skeleton" style={{ height: 40 }} />
            <div className="skeleton" style={{ height: 40 }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <div className="skeleton" style={{ height: 20, width: '50%', marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 120 }} />
          </div>
        </div>
      </div>
    </div>
  );
};
