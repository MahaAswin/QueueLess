import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  QrCode,
  ShieldCheck,
  ArrowRight,
  Zap,
  CheckCircle2,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { QueueLessLogo } from '../components/ui/QueueLessLogo';
import { getRoleHomeRoute } from '../utils/auth';

export const LandingHeroPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* 1. TOP NAVIGATION BAR */}
      <header
        className="landing-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'rgba(251, 246, 236, 0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <QueueLessLogo size="md" subtitle="EXPRESS PICKUP" />
        </div>

        {/* Center Nav Links (Desktop Only) */}
        <nav className="landing-desktop-nav">
          <a href="#how-it-works">How It Works</a>
          <a href="#benefits">Benefits</a>
          <a href="#for-merchants">For Shop Owners</a>
        </nav>

        {/* Right Action Buttons (Desktop Only) */}
        <div className="landing-desktop-actions">
          {isAuthenticated && user ? (
            <button
              onClick={() => navigate(getRoleHomeRoute(user.role))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                padding: '10px 20px',
                borderRadius: 'var(--radius-md)',
                fontSize: 14,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px var(--color-primary-glow)',
                transition: 'all 0.2s ease',
              }}
            >
              <span>Go to Dashboard</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  backgroundColor: 'transparent',
                  border: '1.5px solid var(--color-primary)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                Log In
              </Link>
              <Link
                to="/register"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  backgroundColor: 'var(--color-primary)',
                  textDecoration: 'none',
                  border: 'none',
                  boxShadow: '0 4px 12px var(--color-primary-glow)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>Sign Up</span>
                <ArrowRight size={15} />
              </Link>
            </>
          )}
        </div>

        {/* Right Action Controls (Mobile Portrait / Small Screen) */}
        <div className="landing-mobile-controls">
          {isAuthenticated && user ? (
            <button
              onClick={() => navigate(getRoleHomeRoute(user.role))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span>Dashboard</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <Link
              to="/login"
              className="landing-mobile-login-btn"
            >
              Log In
            </Link>
          )}

          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            className="landing-hamburger-btn"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="landing-mobile-drawer">
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <a
              href="#how-it-works"
              onClick={() => setIsMobileMenuOpen(false)}
              className="landing-mobile-drawer-link"
            >
              How It Works
            </a>
            <a
              href="#benefits"
              onClick={() => setIsMobileMenuOpen(false)}
              className="landing-mobile-drawer-link"
            >
              Benefits
            </a>
            <a
              href="#for-merchants"
              onClick={() => setIsMobileMenuOpen(false)}
              className="landing-mobile-drawer-link"
            >
              For Shop Owners
            </a>
          </nav>

          <div style={{ height: 1, backgroundColor: 'var(--color-border)', margin: '14px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isAuthenticated && user ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate(getRoleHomeRoute(user.role));
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 14.5,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span>Go to Dashboard</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 14.5,
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px var(--color-primary-glow)',
                  }}
                >
                  <span>Get Started — Free</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                    color: 'var(--color-primary)',
                    border: '1.5px solid var(--color-primary)',
                    padding: '11px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 14.5,
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  Sign In to Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. HERO PRESENTATION SECTION */}
      <main style={{ flex: 1 }}>
        <section
          style={{
            padding: '70px 24px 90px',
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Top Pill Announcement */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              backgroundColor: 'var(--color-tint)',
              border: '1px solid var(--color-tint-border)',
              borderRadius: 9999,
              color: 'var(--color-primary)',
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              marginBottom: 24,
            }}
          >
            <Zap size={14} />
            <span>Zero-Wait Express Pickup & Local Commerce</span>
          </div>

          {/* Main Hero Headline */}
          <h1
            style={{
              fontSize: 'clamp(38px, 5vw, 64px)',
              fontWeight: 900,
              color: 'var(--color-primary)',
              lineHeight: 1.12,
              letterSpacing: '-1.5px',
              marginBottom: 20,
              maxWidth: 900,
            }}
          >
            Order Ahead. Pick Up in Minutes.{' '}
            <span
              style={{
                display: 'inline-block',
                color: 'var(--color-primary-hover)',
                textDecoration: 'underline',
                textDecorationColor: 'rgba(15, 81, 50, 0.35)',
              }}
            >
              Skip All Queues.
            </span>
          </h1>

          {/* Subheading */}
          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 19px)',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
              maxWidth: 680,
              marginBottom: 36,
            }}
          >
            Pre-order groceries, meals, and daily essentials from trusted neighborhood shops.
            Walk in and pick up instantly using reserved 15-minute express windows and smart QR counter tokens.
          </p>

          {/* Hero CTAs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: 56,
            }}
          >
            <Link
              to="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                padding: '16px 32px',
                borderRadius: 'var(--radius-lg)',
                fontSize: 16,
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 8px 24px var(--color-primary-glow)',
                transition: 'all 0.2s ease',
              }}
            >
              <span>Get Started — Free</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-primary)',
                padding: '15px 28px',
                borderRadius: 'var(--radius-lg)',
                fontSize: 16,
                fontWeight: 700,
                border: '2px solid var(--color-primary)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span>Sign In to Account</span>
              <ChevronRight size={18} />
            </Link>
          </div>

          {/* 3 Core Guarantee Badges */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 20,
              width: '100%',
              maxWidth: 960,
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                textAlign: 'left',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-tint)',
                  border: '1px solid var(--color-tint-border)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Clock size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)', marginBottom: 2 }}>
                  15-Min Slots
                </h4>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
                  Pre-scheduled pickup windows
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                textAlign: 'left',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-tint)',
                  border: '1px solid var(--color-tint-border)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <QrCode size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)', marginBottom: 2 }}>
                  QR Verification
                </h4>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
                  Scan & collect at express counter
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                textAlign: 'left',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-tint)',
                  border: '1px solid var(--color-tint-border)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)', marginBottom: 2 }}>
                  Verified Shops
                </h4>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
                  Live prep times & trusted items
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. HOW IT WORKS 3-STEP WALKTHROUGH */}
        <section
          id="how-it-works"
          style={{
            padding: '80px 24px',
            backgroundColor: 'var(--color-surface-subtle)',
            borderTop: '1px solid var(--color-border)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 800,
                color: 'var(--color-primary)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              Effortless 3-Step Routine
            </span>
            <h2
              style={{
                fontSize: 'clamp(28px, 3.5vw, 42px)',
                fontWeight: 900,
                color: 'var(--color-primary)',
                marginTop: 8,
                marginBottom: 48,
              }}
            >
              How QueueLess Works
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 28,
                textAlign: 'left',
              }}
            >
              {/* Step 1 */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  padding: '32px 28px',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 18,
                  }}
                >
                  1
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary)' }}>
                  Browse Local Shops
                </h3>
                <p style={{ fontSize: 14.5, color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
                  Explore neighborhood bakeries, supermarkets, and cafes. Add required items directly to your cart.
                </p>
              </div>

              {/* Step 2 */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  padding: '32px 28px',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 18,
                  }}
                >
                  2
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary)' }}>
                  Pick an Express Slot
                </h3>
                <p style={{ fontSize: 14.5, color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
                  Select an available 15-minute window for your pickup. The merchant prepares your order ahead of time.
                </p>
              </div>

              {/* Step 3 */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  padding: '32px 28px',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 18,
                  }}
                >
                  3
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary)' }}>
                  Show QR & Walk Out
                </h3>
                <p style={{ fontSize: 14.5, color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
                  Arrive at the express counter, display your digital QR or 4-digit OTP, grab your package, and you’re set!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. VALUE PROPOSITION SECTION */}
        <section
          id="benefits"
          style={{
            padding: '90px 24px',
            maxWidth: 1100,
            margin: '0 auto',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 800,
                color: 'var(--color-primary)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              Why Thousands Choose Us
            </span>
            <h2
              style={{
                fontSize: 'clamp(28px, 3.5vw, 42px)',
                fontWeight: 900,
                color: 'var(--color-primary)',
                marginTop: 8,
              }}
            >
              Eliminate Waiting In Lines Forever
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 32,
            }}
          >
            {/* Customer Benefits */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-2xl)',
                padding: '40px 32px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  padding: '8px 16px',
                  borderRadius: 9999,
                  backgroundColor: 'var(--color-tint)',
                  border: '1px solid var(--color-tint-border)',
                  color: 'var(--color-primary)',
                  fontWeight: 800,
                  fontSize: 13,
                  marginBottom: 20,
                }}
              >
                FOR SHOPPERS
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-primary)', marginBottom: 16 }}>
                Shop Smart & Gain Time
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14.5, color: 'var(--color-text-muted)' }}>
                  <CheckCircle2 size={18} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>No standing in 20-minute peak checkout queues.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14.5, color: 'var(--color-text-muted)' }}>
                  <CheckCircle2 size={18} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>Pre-reserved slots guarantee immediate handoff.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14.5, color: 'var(--color-text-muted)' }}>
                  <CheckCircle2 size={18} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>Real-time order prep tracking from confirmation to ready.</span>
                </li>
              </ul>
            </div>

            {/* Merchant Benefits */}
            <div
              id="for-merchants"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-2xl)',
                padding: '40px 32px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  padding: '8px 16px',
                  borderRadius: 9999,
                  backgroundColor: 'var(--color-tint)',
                  border: '1px solid var(--color-tint-border)',
                  color: 'var(--color-primary)',
                  fontWeight: 800,
                  fontSize: 13,
                  marginBottom: 20,
                }}
              >
                FOR MERCHANTS
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-primary)', marginBottom: 16 }}>
                Expand Store Capacity
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14.5, color: 'var(--color-text-muted)' }}>
                  <CheckCircle2 size={18} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>Serve 3x more customers without in-store congestion.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14.5, color: 'var(--color-text-muted)' }}>
                  <CheckCircle2 size={18} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>Quick QR scan to instantly mark pickups verified.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14.5, color: 'var(--color-text-muted)' }}>
                  <CheckCircle2 size={18} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>Full control over stock, operating hours, and slot limits.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. BOTTOM CALL TO ACTION BANNER */}
        <section
          style={{
            margin: '0 24px 60px',
          }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: '0 auto',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-2xl)',
              padding: '64px 36px',
              textAlign: 'center',
              boxShadow: '0 16px 36px var(--color-primary-glow)',
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 44px)',
                fontWeight: 900,
                color: '#FFFFFF',
                marginBottom: 16,
              }}
            >
              Ready for Zero-Wait Shopping?
            </h2>
            <p
              style={{
                fontSize: 17,
                opacity: 0.9,
                maxWidth: 580,
                margin: '0 auto 36px',
                lineHeight: 1.6,
              }}
            >
              Join QueueLess today and experience the future of streamlined local commerce.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/register"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-primary)',
                  padding: '14px 30px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 15,
                  fontWeight: 800,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
              >
                <span>Create Your Account</span>
                <ArrowRight size={17} />
              </Link>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '14px 28px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  border: '1.5px solid #FFFFFF',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
              >
                <span>Sign In</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 6. FOOTER */}
      <footer
        style={{
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg)',
          padding: '36px 32px',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <QueueLessLogo size="sm" subtitle="EXPRESS PICKUP" />
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-light)' }}>
            © {new Date().getFullYear()} QueueLess Technologies Inc. All rights reserved.
          </div>
        </div>
      </footer>

      <style>{`
        .landing-header {
          padding: 0 32px;
          height: 72px;
        }
        .landing-desktop-nav {
          display: flex;
          align-items: center;
          gap: 28px;
        }
        .landing-desktop-nav a {
          color: var(--color-text);
          font-size: 14.5px;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .landing-desktop-nav a:hover {
          color: var(--color-primary);
        }
        .landing-desktop-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .landing-mobile-controls {
          display: none;
          align-items: center;
          gap: 10px;
        }
        .landing-hamburger-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          background-color: transparent;
          border: 1px solid var(--color-border);
          color: var(--color-text-main);
          cursor: pointer;
          transition: background-color 0.15s ease;
        }
        .landing-hamburger-btn:hover {
          background-color: var(--color-surface-hover);
        }
        .landing-mobile-login-btn {
          display: inline-flex;
          align-items: center;
          padding: 7px 14px;
          border-radius: var(--radius-md);
          font-size: 13.5px;
          font-weight: 700;
          color: var(--color-primary);
          border: 1.5px solid var(--color-primary);
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .landing-mobile-drawer {
          display: none;
        }

        @media (max-width: 860px) {
          .landing-header {
            padding: 0 16px !important;
            height: calc(64px + var(--safe-top, 0px)) !important;
            padding-top: var(--safe-top, 0px) !important;
          }
          .landing-desktop-nav {
            display: none !important;
          }
          .landing-desktop-actions {
            display: none !important;
          }
          .landing-mobile-controls {
            display: flex !important;
          }
          .landing-mobile-drawer {
            display: block !important;
            position: sticky;
            top: calc(64px + var(--safe-top, 0px));
            z-index: 49;
            background-color: rgba(251, 246, 236, 0.98);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-bottom: 1.5px solid var(--color-border);
            padding: 18px 20px 22px;
            box-shadow: 0 12px 28px rgba(15, 81, 50, 0.12);
            animation: slideDownMenu 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .landing-mobile-drawer-link {
            color: var(--color-text-main);
            font-size: 15.5px;
            font-weight: 600;
            text-decoration: none;
            padding: 8px 4px;
            display: block;
            border-radius: var(--radius-sm);
            transition: color 0.15s ease;
          }
          .landing-mobile-drawer-link:hover {
            color: var(--color-primary);
          }
        }

        @keyframes slideDownMenu {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
