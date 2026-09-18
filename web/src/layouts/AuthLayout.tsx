import React from 'react';
import { Outlet } from 'react-router-dom';
import { Clock, ShieldCheck, QrCode } from 'lucide-react';
import { QueueLessLogo } from '../components/ui/QueueLessLogo';

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
        <QueueLessLogo
          size="lg"
          textColor="#fff"
          subtitle="EXPRESS PICKUP PLATFORM"
          subtitleColor="rgba(255, 255, 255, 0.85)"
        />

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
          <div className="mobile-auth-logo" style={{ marginBottom: 28, justifyContent: 'center' }}>
            <QueueLessLogo size="lg" subtitle="EXPRESS PICKUP" />
          </div>
          <Outlet />
        </div>
      </div>

      <style>{`
        .mobile-auth-logo {
          display: none;
        }
        @media (max-width: 900px) {
          .auth-hero-banner {
            display: none !important;
          }
          .mobile-auth-logo {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};
