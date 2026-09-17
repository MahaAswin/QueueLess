import React from 'react';

export const ComplaintsTableSkeleton: React.FC = () => {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
        <div
          className="skeleton-pulse"
          style={{ width: 180, height: 16, borderRadius: 'var(--radius-sm)' }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', width: '30%' }}>
              <div
                className="skeleton-pulse"
                style={{ width: 32, height: 32, borderRadius: 'var(--radius-full)', flexShrink: 0 }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                <div className="skeleton-pulse" style={{ width: '70%', height: 14, borderRadius: 'var(--radius-sm)' }} />
                <div className="skeleton-pulse" style={{ width: '40%', height: 11, borderRadius: 'var(--radius-sm)' }} />
              </div>
            </div>
            <div className="skeleton-pulse" style={{ width: '18%', height: 14, borderRadius: 'var(--radius-sm)' }} />
            <div className="skeleton-pulse" style={{ width: '15%', height: 20, borderRadius: 'var(--radius-full)' }} />
            <div className="skeleton-pulse" style={{ width: '12%', height: 20, borderRadius: 'var(--radius-full)' }} />
            <div className="skeleton-pulse" style={{ width: 60, height: 28, borderRadius: 'var(--radius-md)' }} />
          </div>
        ))}
      </div>
    </div>
  );
};
