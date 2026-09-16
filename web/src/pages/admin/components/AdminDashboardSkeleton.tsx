import React from 'react';

export const AdminDashboardSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPIs Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card" style={{ padding: 20, height: 100 }}>
            <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 28, width: '30%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 10, width: '70%' }} />
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card" style={{ padding: 18, height: 72 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 11, width: '80%' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tables Skeleton */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 18, borderBottom: '1px solid var(--color-border)' }}>
          <div className="skeleton" style={{ height: 20, width: '30%' }} />
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
            <div className="skeleton" style={{ height: 18, width: 140 }} />
            <div className="skeleton" style={{ height: 18, width: 120 }} />
            <div className="skeleton" style={{ height: 18, width: 100 }} />
            <div className="skeleton" style={{ height: 24, width: 80, borderRadius: 'var(--radius-full)' }} />
            <div className="skeleton" style={{ height: 32, width: 120, borderRadius: 'var(--radius-sm)' }} />
          </div>
        ))}
      </div>
    </div>
  );
};
