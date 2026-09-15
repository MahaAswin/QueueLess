import React from 'react';

export const CartSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header Skeleton */}
      <div>
        <div className="skeleton" style={{ width: 140, height: 22, borderRadius: 9999, marginBottom: 12 }} />
        <div className="skeleton" style={{ width: 220, height: 36, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 340, height: 18 }} />
      </div>

      {/* 2-Column Grid Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: 28,
          alignItems: 'flex-start',
        }}
        className="cart-grid-layout"
      >
        {/* Left Column: Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Shop Banner Skeleton */}
          <div
            className="card"
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 8 }} />
              <div>
                <div className="skeleton" style={{ width: 80, height: 12, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: 140, height: 16 }} />
              </div>
            </div>
            <div className="skeleton" style={{ width: 110, height: 32, borderRadius: 6 }} />
          </div>

          {/* Items Card Skeleton */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <div className="skeleton" style={{ width: 120, height: 18 }} />
            </div>

            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                style={{
                  padding: '18px 20px',
                  borderBottom: idx < 3 ? '1px solid var(--color-border-subtle)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="skeleton" style={{ width: 56, height: 56, borderRadius: 10 }} />
                  <div>
                    <div className="skeleton" style={{ width: 150, height: 18, marginBottom: 6 }} />
                    <div className="skeleton" style={{ width: 90, height: 14, marginBottom: 4 }} />
                    <div className="skeleton" style={{ width: 70, height: 14 }} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div className="skeleton" style={{ width: 90, height: 34, borderRadius: 8 }} />
                  <div className="skeleton" style={{ width: 60, height: 20 }} />
                  <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Order Summary Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 24 }}>
            <div className="skeleton" style={{ width: 140, height: 22, marginBottom: 20 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="skeleton" style={{ width: 100, height: 16 }} />
                <div className="skeleton" style={{ width: 60, height: 16 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--color-border-subtle)' }}>
                <div className="skeleton" style={{ width: 70, height: 20 }} />
                <div className="skeleton" style={{ width: 90, height: 26 }} />
              </div>
            </div>
            <div className="skeleton" style={{ width: '100%', height: 48, borderRadius: 8 }} />
          </div>
        </div>
      </div>
    </div>
  );
};
