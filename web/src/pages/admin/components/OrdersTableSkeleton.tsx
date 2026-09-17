import React from 'react';

export const OrdersTableSkeleton: React.FC = () => {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
        <div className="skeleton" style={{ height: 18, width: 220 }} />
      </div>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
          <div className="skeleton" style={{ height: 16, width: 100 }} />
          <div style={{ width: '20%' }}>
            <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 6 }} />
            <div className="skeleton" style={{ height: 11, width: '60%' }} />
          </div>
          <div style={{ width: '20%' }}>
            <div className="skeleton" style={{ height: 14, width: '75%', marginBottom: 6 }} />
            <div className="skeleton" style={{ height: 11, width: '45%' }} />
          </div>
          <div className="skeleton" style={{ height: 16, width: 80 }} />
          <div className="skeleton" style={{ height: 22, width: 100, borderRadius: 'var(--radius-full)' }} />
          <div className="skeleton" style={{ height: 14, width: 110 }} />
          <div className="skeleton" style={{ height: 28, width: 90, borderRadius: 'var(--radius-sm)' }} />
        </div>
      ))}
    </div>
  );
};
