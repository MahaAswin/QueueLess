import React from 'react';

export const ShopsTableSkeleton: React.FC = () => {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
        <div className="skeleton" style={{ height: 18, width: 180 }} />
      </div>
      {[1, 2, 3, 4, 5, 6].map((i) => (
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
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', width: '28%' }}>
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 14, width: '75%', marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 11, width: '50%' }} />
            </div>
          </div>
          <div className="skeleton" style={{ height: 16, width: 120 }} />
          <div className="skeleton" style={{ height: 16, width: 90 }} />
          <div className="skeleton" style={{ height: 22, width: 95, borderRadius: 'var(--radius-full)' }} />
          <div className="skeleton" style={{ height: 18, width: 70, borderRadius: 'var(--radius-full)' }} />
          <div className="skeleton" style={{ height: 28, width: 110, borderRadius: 'var(--radius-sm)' }} />
        </div>
      ))}
    </div>
  );
};
