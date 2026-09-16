import React from 'react';

export const UsersTableSkeleton: React.FC = () => {
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
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', width: '30%' }}>
            <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 11, width: '90%' }} />
            </div>
          </div>
          <div className="skeleton" style={{ height: 22, width: 90, borderRadius: 'var(--radius-full)' }} />
          <div className="skeleton" style={{ height: 22, width: 80, borderRadius: 'var(--radius-full)' }} />
          <div className="skeleton" style={{ height: 16, width: 100 }} />
          <div className="skeleton" style={{ height: 16, width: 80 }} />
          <div className="skeleton" style={{ height: 28, width: 90, borderRadius: 'var(--radius-sm)' }} />
        </div>
      ))}
    </div>
  );
};
