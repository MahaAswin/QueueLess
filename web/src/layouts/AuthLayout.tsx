import React from 'react';
import { Outlet } from 'react-router-dom';
import { Zap, Clock, ShieldCheck, QrCode } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      {/* Left Brand Showcase Banner (Desktop Only) */}
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(145deg, #094028 0%, #0D5C3A 50%, #127C4E 100%)',
          color: '#fff',
          padding: '48px 60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="auth-hero-banner"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={24} fill="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.3px' }}>
              QueueLess
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, letterSpacing: '1.2px' }}>
              EXPRESS PICKUP PLATFORM
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 480, margin: '60px 0' }}>
          <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.15, color: '#fff', marginBottom: 16 }}>
            Skip the Wait.{'\n'}Collect Instantly.
          </h1>
          <p style={{ fontSize: 16, opacity: 0.85, lineHeight: 1.6, marginBottom: 36 }}>
            Order ahead from your favorite local shops, reserve your preferred 15-minute pickup slot, and pick up your items at the express counter with zero queue.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} />
              </div>
              <span style={{ fontSize: 14.5, fontWeight: 500 }}>Guaranteed 15-Minute Reserved Pickup Windows</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QrCode size={18} />
              </div>
              <span style={{ fontSize: 14.5, fontWeight: 500 }}>Instant Digital QR Express Counter Verification</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={18} />
              </div>
              <span style={{ fontSize: 14.5, fontWeight: 500 }}>Verified Partner Shops with Live Prep Times</span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 13, opacity: 0.65 }}>
          © {new Date().getFullYear()} QueueLess Technologies Inc. All rights reserved.
        </div>
      </div>

      {/* Right Form Container */}
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          <Outlet />
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-hero-banner {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
