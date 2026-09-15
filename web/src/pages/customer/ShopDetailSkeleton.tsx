import React from 'react';

export const ShopDetailSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Back button skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="skeleton" style={{ width: 140, height: 20, borderRadius: 6 }} />
      </div>

      {/* Shop Hero Card Skeleton */}
      <div
        className="card"
        style={{
          padding: '32px 36px',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Avatar skeleton */}
          <div
            className="skeleton"
            style={{
              width: 80,
              height: 80,
              borderRadius: 'var(--radius-xl)',
              flexShrink: 0,
            }}
          />

          <div style={{ flex: 1, minWidth: 260 }}>
            {/* Title & badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div className="skeleton" style={{ width: 220, height: 28, borderRadius: 8 }} />
              <div className="skeleton" style={{ width: 90, height: 24, borderRadius: 20 }} />
              <div className="skeleton" style={{ width: 120, height: 24, borderRadius: 20 }} />
            </div>

            {/* Description lines */}
            <div className="skeleton" style={{ width: '85%', height: 16, borderRadius: 4, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: '60%', height: 16, borderRadius: 4, marginBottom: 16 }} />

            {/* Address & Hours meta */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div className="skeleton" style={{ width: 180, height: 18, borderRadius: 4 }} />
              <div className="skeleton" style={{ width: 140, height: 18, borderRadius: 4 }} />
              <div className="skeleton" style={{ width: 120, height: 18, borderRadius: 4 }} />
            </div>
          </div>
        </div>

        {/* Queue badge bar skeleton */}
        <div
          className="skeleton"
          style={{
            width: '100%',
            height: 46,
            borderRadius: 'var(--radius-md)',
            marginTop: 8,
          }}
        />
      </div>

      {/* Filter / Search Bar Skeleton */}
      <div
        className="card"
        style={{
          padding: 18,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div className="skeleton" style={{ width: '100%', height: 42, borderRadius: 'var(--radius-md)' }} />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div className="skeleton" style={{ width: 80, height: 32, borderRadius: 'var(--radius-full)' }} />
          <div className="skeleton" style={{ width: 100, height: 32, borderRadius: 'var(--radius-full)' }} />
          <div className="skeleton" style={{ width: 90, height: 32, borderRadius: 'var(--radius-full)' }} />
          <div className="skeleton" style={{ width: 110, height: 32, borderRadius: 'var(--radius-full)' }} />
        </div>
      </div>

      {/* Products Section Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="skeleton" style={{ width: 200, height: 24, borderRadius: 6, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 280, height: 16, borderRadius: 4 }} />
        </div>
      </div>

      {/* Product Cards Grid Skeleton */}
      <div className="grid-3">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="card"
            style={{
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: 280,
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 8 }} />
                <div className="skeleton" style={{ width: 70, height: 20, borderRadius: 12 }} />
              </div>
              <div className="skeleton" style={{ width: '75%', height: 20, borderRadius: 4, marginBottom: 10 }} />
              <div className="skeleton" style={{ width: '90%', height: 14, borderRadius: 4, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: '50%', height: 14, borderRadius: 4, marginBottom: 16 }} />
              <div className="skeleton" style={{ width: 80, height: 22, borderRadius: 4 }} />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 12,
                borderTop: '1px solid var(--color-border-subtle)',
              }}
            >
              <div className="skeleton" style={{ width: 84, height: 32, borderRadius: 6 }} />
              <div className="skeleton" style={{ width: 100, height: 32, borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
