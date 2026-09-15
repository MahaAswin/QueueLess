import React from 'react';

export const CheckoutSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Skeleton */}
      <div>
        <div className="skeleton" style={{ width: 120, height: 22, borderRadius: 9999, marginBottom: 10 }} />
        <div className="skeleton" style={{ width: 180, height: 32, marginBottom: 6 }} />
        <div className="skeleton" style={{ width: 280, height: 16 }} />
      </div>

      {/* Grid Layout Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: 28,
          alignItems: 'flex-start',
        }}
        className="cart-grid-layout"
      >
        {/* Left Column Skeletons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Items card skeleton */}
          <div className="card" style={{ padding: 24 }}>
            <div className="skeleton" style={{ width: 160, height: 20, marginBottom: 18 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[1, 2].map((i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 8 }} />
                    <div>
                      <div className="skeleton" style={{ width: 140, height: 16, marginBottom: 6 }} />
                      <div className="skeleton" style={{ width: 80, height: 12 }} />
                    </div>
                  </div>
                  <div className="skeleton" style={{ width: 60, height: 18 }} />
                </div>
              ))}
            </div>
          </div>

          {/* Pickup schedule skeleton */}
          <div className="card" style={{ padding: 24 }}>
            <div className="skeleton" style={{ width: 200, height: 20, marginBottom: 18 }} />
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton" style={{ width: 80, height: 50, borderRadius: 8 }} />
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton" style={{ height: 38, borderRadius: 8 }} />
              ))}
            </div>
          </div>

          {/* Customer info skeleton */}
          <div className="card" style={{ padding: 24 }}>
            <div className="skeleton" style={{ width: 180, height: 20, marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 60, borderRadius: 8 }} />
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 24 }}>
            <div className="skeleton" style={{ width: 140, height: 22, marginBottom: 18 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="skeleton" style={{ width: 100, height: 16 }} />
                <div className="skeleton" style={{ width: 60, height: 16 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
                <div className="skeleton" style={{ width: 80, height: 20 }} />
                <div className="skeleton" style={{ width: 90, height: 24 }} />
              </div>
            </div>
            <div className="skeleton" style={{ height: 48, borderRadius: 8 }} />
          </div>
        </div>
      </div>
    </div>
  );
};
