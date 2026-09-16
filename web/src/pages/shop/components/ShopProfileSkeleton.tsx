import React from 'react';

export const ShopProfileSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Account Card Skeleton */}
      <div className="card" style={{ padding: 24 }}>
        <div className="skeleton" style={{ height: 20, width: 180, marginBottom: 16 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 48, borderRadius: 'var(--radius-sm)' }} />
          ))}
        </div>
      </div>

      {/* Main Info Skeleton */}
      <div className="card" style={{ padding: 24 }}>
        <div className="skeleton" style={{ height: 22, width: 220, marginBottom: 20 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="skeleton" style={{ height: 40, borderRadius: 'var(--radius-md)' }} />
            <div className="skeleton" style={{ height: 40, borderRadius: 'var(--radius-md)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="skeleton" style={{ height: 40, borderRadius: 'var(--radius-md)' }} />
            <div className="skeleton" style={{ height: 40, borderRadius: 'var(--radius-md)' }} />
          </div>
          <div className="skeleton" style={{ height: 40, borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ height: 72, borderRadius: 'var(--radius-md)' }} />
        </div>
      </div>

      {/* Hours Skeleton */}
      <div className="card" style={{ padding: 24 }}>
        <div className="skeleton" style={{ height: 22, width: 240, marginBottom: 20 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="skeleton" style={{ height: 40, borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ height: 40, borderRadius: 'var(--radius-md)' }} />
        </div>
      </div>
    </div>
  );
};
