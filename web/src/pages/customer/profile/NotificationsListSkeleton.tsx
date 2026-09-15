import React from 'react';

export const NotificationsListSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="card skeleton"
          style={{
            height: 104,
            padding: 20,
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-border)',
            }}
          />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div
              style={{
                width: '40%',
                height: 16,
                borderRadius: 4,
                backgroundColor: 'var(--color-border)',
              }}
            />
            <div
              style={{
                width: '75%',
                height: 13,
                borderRadius: 4,
                backgroundColor: 'var(--color-border)',
              }}
            />
            <div
              style={{
                width: '20%',
                height: 11,
                borderRadius: 4,
                backgroundColor: 'var(--color-border)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
