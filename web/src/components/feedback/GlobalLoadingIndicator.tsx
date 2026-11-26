import React, { useEffect, useState } from 'react';
import { CheckCircle2, CloudLightning } from 'lucide-react';
import { loadingTracker, type LoadingStateSnapshot } from '../../services/loadingTracker';
import logoMarkImg from '../../assets/logo-mark.png';

export const GlobalLoadingIndicator: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingStateSnapshot>(loadingTracker.getSnapshot());

  useEffect(() => {
    const unsubscribe = loadingTracker.subscribe((state) => {
      setLoadingState(state);
    });
    return unsubscribe;
  }, []);

  const isVisible = loadingState.progress > 0;
  const showBanner = loadingState.status === 'slow' || loadingState.status === 'cold-start' || loadingState.status === 'success';

  return (
    <>
      {/* 1. Global Top Progress Bar */}
      <div
        className="global-top-progress-container"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 3.5,
          zIndex: 99999,
          pointerEvents: 'none',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.25s ease',
        }}
        aria-hidden="true"
      >
        <div
          className="global-top-progress-bar"
          style={{
            height: '100%',
            width: `${loadingState.progress}%`,
            background: 'linear-gradient(90deg, #22C55E 0%, #10B981 60%, #0F5132 100%)',
            boxShadow: '0 0 10px rgba(34, 197, 94, 0.7), 0 0 4px rgba(15, 81, 50, 0.9)',
            transition: loadingState.progress === 100 ? 'width 0.18s ease-out' : 'width 0.3s cubic-bezier(0.1, 0.8, 0.3, 1)',
            position: 'relative',
          }}
        >
          {/* Animated glow head */}
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: -2,
              width: 8,
              height: 7.5,
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 0 8px #22C55E, 0 0 14px #22C55E',
              opacity: loadingState.progress < 100 ? 1 : 0,
            }}
          />
        </div>
      </div>

      {/* 2. Floating Slowdown & Server Spin-up Notice */}
      {showBanner && (
        <div
          className="global-slowdown-card-wrap"
          style={{
            position: 'fixed',
            bottom: 'max(24px, calc(var(--safe-bottom, 0px) + 76px))',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99998,
            width: 'calc(100% - 32px)',
            maxWidth: 440,
            animation: 'slideUpBounce 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius-xl, 18px)',
              padding: '14px 18px',
              boxShadow: '0 12px 36px rgba(15, 81, 50, 0.16), 0 4px 12px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            {/* Status Icon */}
            {loadingState.status === 'success' ? (
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-tint, #F0FDF4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary, #0F5132)',
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={24} />
              </div>
            ) : loadingState.status === 'cold-start' ? (
              <div
                style={{
                  position: 'relative',
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: '2.5px solid var(--color-tint-border, #BBF7D0)',
                    borderTopColor: 'var(--color-primary, #0F5132)',
                    animation: 'spinRing 0.8s linear infinite',
                  }}
                />
                <img
                  src={logoMarkImg}
                  alt="QueueLess"
                  style={{ width: 22, height: 22, borderRadius: 6, objectFit: 'contain' }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(34, 197, 94, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary, #0F5132)',
                  flexShrink: 0,
                }}
              >
                <CloudLightning size={20} className="pulse-lightning" />
              </div>
            )}

            {/* Status Message */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {loadingState.status === 'success' ? (
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-primary, #0F5132)' }}>
                    Connected!
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted, #64748B)' }}>
                    Server response received successfully.
                  </div>
                </div>
              ) : loadingState.status === 'cold-start' ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-primary, #0F5132)' }}>
                      Waking up cloud server...
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: 'var(--color-tint, #F0FDF4)',
                        color: 'var(--color-primary, #0F5132)',
                        padding: '2px 7px',
                        borderRadius: 10,
                      }}
                    >
                      {loadingState.elapsedSeconds}s
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted, #64748B)', lineHeight: 1.35 }}>
                    Cloud backend instance is spinning up. Hang tight, this only takes a few seconds!
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text-main, #1F2937)' }}>
                    Connecting to QueueLess server...
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted, #64748B)' }}>
                    Establishing secure cloud connection...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUpBounce {
          0% {
            opacity: 0;
            transform: translate(-50%, 20px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }
        @keyframes spinRing {
          to { transform: rotate(360deg); }
        }
        .pulse-lightning {
          animation: pulseIcon 1.2s ease-in-out infinite;
        }
        @keyframes pulseIcon {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </>
  );
};
