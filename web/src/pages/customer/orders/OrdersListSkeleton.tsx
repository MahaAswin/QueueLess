import React from 'react';

export const OrdersListSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="card"
          style={{
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 8 }} />
              <div>
                <div className="skeleton" style={{ width: 140, height: 18, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: 100, height: 12 }} />
              </div>
            </div>
            <div className="skeleton" style={{ width: 80, height: 24 }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="skeleton" style={{ height: 40, borderRadius: 6 }} />
            <div className="skeleton" style={{ height: 40, borderRadius: 6 }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
            <div className="skeleton" style={{ width: 100, height: 32, borderRadius: 6 }} />
            <div className="skeleton" style={{ width: 110, height: 32, borderRadius: 6 }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export const OrderDetailSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="skeleton" style={{ width: 100, height: 16, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 220, height: 32, marginBottom: 6 }} />
          <div className="skeleton" style={{ width: 160, height: 14 }} />
        </div>
        <div className="skeleton" style={{ width: 110, height: 38, borderRadius: 6 }} />
      </div>

      {/* Timeline Skeleton */}
      <div className="card" style={{ padding: 24 }}>
        <div className="skeleton" style={{ width: 140, height: 20, marginBottom: 20 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', marginBottom: 8 }} />
              <div className="skeleton" style={{ width: 70, height: 12 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Content Grid Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: 28,
        }}
        className="cart-grid-layout"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 24, height: 200 }}>
            <div className="skeleton" style={{ width: 120, height: 18, marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 100, borderRadius: 8 }} />
          </div>
        </div>
        <div className="card" style={{ padding: 24, height: 260 }}>
          <div className="skeleton" style={{ width: 140, height: 20, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 140, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
};
