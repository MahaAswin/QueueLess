import React, { useEffect, useState } from 'react';
import logoMarkImg from '../../assets/logo-mark.png';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading details...',
  size = 'md',
}) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const ringSize = size === 'sm' ? 36 : size === 'lg' ? 64 : 48;
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 32 : 24;

  const currentMessage =
    elapsed >= 6
      ? 'Waking up cloud service (Render free-tier cold start), almost ready...'
      : elapsed >= 2.5
      ? 'Connecting to QueueLess server...'
      : message;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: size === 'sm' ? '24px 16px' : '48px 20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: ringSize,
          height: ringSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2.5px solid var(--color-tint-border, #BBF7D0)',
            borderTopColor: 'var(--color-primary, #0F5132)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <img
          src={logoMarkImg}
          alt="QueueLess"
          style={{
            width: iconSize,
            height: iconSize,
            borderRadius: 6,
            objectFit: 'contain',
          }}
        />
      </div>

      <p
        style={{
          color: elapsed >= 2.5 ? 'var(--color-primary)' : 'var(--color-text-muted)',
          fontSize: 14,
          fontWeight: elapsed >= 2.5 ? 600 : 500,
          maxWidth: 320,
          lineHeight: 1.4,
          transition: 'color 0.2s ease',
        }}
      >
        {currentMessage}
      </p>

      {elapsed >= 2.5 && (
        <span
          style={{
            marginTop: 8,
            fontSize: 11.5,
            fontWeight: 700,
            color: 'var(--color-primary)',
            backgroundColor: 'var(--color-tint)',
            padding: '2px 8px',
            borderRadius: 12,
            border: '1px solid var(--color-tint-border)',
          }}
        >
          {elapsed}s
        </span>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
