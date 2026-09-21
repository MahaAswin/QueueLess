import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  ShoppingBag,
  ArrowRight,
  Clock,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  PackageCheck,
  RefreshCw,
  QrCode,
  AlertTriangle,
  Phone,
  Leaf,
  Users,
  CreditCard,
} from 'lucide-react';
import { shopService } from '../../services/shopService';
import { orderService } from '../../services/orderService';
import type { Shop, ShopCategory } from '../../types/shop.types';
import type { Order, OrderStatus, CustomerExpenseSummary } from '../../types/order.types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ExpenseSummarySection } from './components/ExpenseSummarySection';
import { formatSlotWindow } from '../../utils/formatters';

const CATEGORY_LABELS: Record<string, string> = {
  ALL: 'All Categories',
  GROCERY: 'Grocery',
  RESTAURANT: 'Restaurant',
  BAKERY: 'Bakery',
  PHARMACY: 'Pharmacy',
  STATIONERY: 'Stationery',
  MEAT_SHOP: 'Meat & Seafood',
  OTHER: 'Other',
};

const ORDER_ACTIVE_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'ACCEPTED',
  'PREPARING',
  'READY_FOR_PICKUP',
];

export const CustomerHomePage: React.FC = () => {

  // Shops State
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopsLoading, setShopsLoading] = useState<boolean>(true);
  const [shopsError, setShopsError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'ALL'>('ALL');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Expense Summary State
  const [expenseSummary, setExpenseSummary] = useState<CustomerExpenseSummary | null>(null);
  const [expenseLoading, setExpenseLoading] = useState<boolean>(true);
  const [expenseError, setExpenseError] = useState<string | null>(null);

  // Load Shops from backend
  const loadShops = useCallback(async () => {
    setShopsLoading(true);
    setShopsError(null);
    try {
      const data = await shopService.getActiveShops();
      setShops(data || []);
    } catch {
      setShopsError('Unable to load shops right now. Please try again.');
    } finally {
      setShopsLoading(false);
    }
  }, []);

  // Load Orders (for active order check)
  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const response = await orderService.getCustomerOrders(0, 10);
      setOrders(response?.content || []);
    } catch {
      setOrdersError('Unable to check active orders right now.');
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // Load Customer Expense Summary
  const loadExpenseSummary = useCallback(async () => {
    setExpenseLoading(true);
    setExpenseError(null);
    try {
      const data = await orderService.getCustomerExpenseSummary();
      setExpenseSummary(data);
    } catch {
      setExpenseError('Unable to load spending summary.');
    } finally {
      setExpenseLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShops();
    loadOrders();
    loadExpenseSummary();
  }, [loadShops, loadOrders, loadExpenseSummary]);

  // Active Order detection
  const activeOrder = useMemo(() => {
    return orders.find((o) => ORDER_ACTIVE_STATUSES.includes(o.status));
  }, [orders]);

  // Filtered shops for preview section
  const filteredShops = useMemo(() => {
    if (selectedCategory === 'ALL') return shops;
    return shops.filter((s) => s.category === selectedCategory);
  }, [shops, selectedCategory]);

  const getOrderStatusStep = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 1;
      case 'CONFIRMED':
      case 'ACCEPTED':
        return 2;
      case 'PREPARING':
        return 3;
      case 'READY_FOR_PICKUP':
        return 4;
      default:
        return 1;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      {/* 1. HERO SECTION */}
      <section
        className="hero-card"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F6FAF7 50%, #EEF9F2 100%)',
          border: '1px solid #E2E8F0',
          borderRadius: 24,
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 4px 12px -2px rgba(0, 0, 0, 0.02)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        {/* Left Column: Heading, CTA & Value Proposition */}
        <div
          className="hero-left-content"
          style={{
            flex: '1.2',
            padding: '38px 36px 32px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 2,
          }}
        >
          <div>
            {/* Top Pill Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 14px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: 9999,
                color: '#047857',
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              <Zap size={13} fill="#059669" />
              <span>ZERO-WAIT EXPRESS PICKUP</span>
            </div>

            {/* Main Heading */}
            <h1
              style={{
                fontSize: 'clamp(32px, 3.4vw, 44px)',
                fontWeight: 900,
                color: '#0F172A',
                lineHeight: 1.14,
                marginBottom: 14,
                letterSpacing: '-1px',
              }}
            >
              Order Now.<br />
              Pick Up Later.<br />
              <span style={{ color: '#059669' }}>No Queues.</span>
            </h1>

            {/* Supporting Text */}
            <p
              style={{
                color: '#64748B',
                fontSize: 15,
                lineHeight: 1.6,
                marginBottom: 26,
                maxWidth: 460,
              }}
            >
              Discover local partner shops, pre-order your items, and collect at your convenience.
            </p>

            {/* CTA Buttons */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <Link to="/customer/shops" style={{ textDecoration: 'none' }}>
                <button
                  className="hero-btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 12,
                    padding: '12px 22px',
                    fontSize: 14.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.28)',
                  }}
                >
                  <span>Explore Partner Shops</span>
                  <ArrowRight size={17} />
                </button>
              </Link>

              <Link to="/customer/cart" style={{ textDecoration: 'none' }}>
                <button
                  className="hero-btn-secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: '#FFFFFF',
                    color: '#059669',
                    border: '1.5px solid #10B981',
                    borderRadius: 12,
                    padding: '12px 20px',
                    fontSize: 14.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ShoppingBag size={17} />
                  <span>View My Basket</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Bottom Feature Strip */}
          <div
            className="hero-feature-strip"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              paddingTop: 18,
              borderTop: '1px solid #E2E8F0',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={17} />
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                  Verified Partners
                </div>
                <div style={{ fontSize: 11, color: '#64748B' }}>Trusted & safe</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock size={17} />
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                  Guaranteed Slots
                </div>
                <div style={{ fontSize: 11, color: '#64748B' }}>Pick your time</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <QrCode size={17} />
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                  Express QR Pass
                </div>
                <div style={{ fontSize: 11, color: '#64748B' }}>Scan & collect</div>
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right Column: 3D Express Scene Illustration & Floating Micro-Cards */}
        <div
          className="hero-illustration-area"
          style={{
            flex: '1.4',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 20px',
            minHeight: 380,
            overflow: 'hidden',
          }}
        >
          {/* Main Visual Image */}
          <div
            style={{
              width: '100%',
              height: '100%',
              maxHeight: 360,
              borderRadius: 18,
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.06)',
            }}
          >
            <img
              src="/assets/hero_express_scene.jpg"
              alt="QueueLess Express Pickup"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              className="hero-scene-img"
            />
          </div>

          {/* Floating Speech Bubble */}
          <div
            className="hero-floating-bubble"
            style={{
              position: 'absolute',
              top: 26,
              left: 40,
              backgroundColor: '#FFFFFF',
              border: '1px solid #DCFCE7',
              borderRadius: 16,
              padding: '8px 14px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: '#059669',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}
            >
              Skip the queue<br />for a better you! ✨
            </span>
          </div>

          {/* Floating QR Micro-Badge */}
          <div
            className="hero-floating-qr"
            style={{
              position: 'absolute',
              bottom: 30,
              left: 36,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              padding: '6px 12px',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.06)',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <QrCode size={20} color="#059669" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                Scan Collect
              </span>
              <span style={{ fontSize: 10, color: '#059669', fontWeight: 700 }}>Go! ⚡</span>
            </div>
          </div>

          {/* Bottom Handwritten Tagline */}
          <div
            className="hero-handwritten-tagline"
            style={{
              position: 'absolute',
              bottom: 16,
              right: 28,
              transform: 'rotate(-7deg)',
              zIndex: 3,
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                fontFamily: 'Caveat, "Comic Sans MS", "Segoe Print", cursive',
                fontSize: 20,
                fontWeight: 700,
                color: '#059669',
                lineHeight: 1.1,
                textShadow: '0 1px 3px rgba(255, 255, 255, 0.8)',
              }}
            >
              Good things,
              <br />
              no queues! ❤️
            </span>
          </div>
        </div>

        {/* Far-Right Narrow Vertical Feature Rail */}
        <div
          className="hero-right-rail"
          style={{
            width: 96,
            backgroundColor: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(10px)',
            borderLeft: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '24px 6px',
            zIndex: 2,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: '#F0FDF4',
                border: '1px solid #DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
              }}
            >
              <ShoppingBag size={18} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
              Order<br />Online
            </span>
          </div>

          <div style={{ width: 24, height: 1, backgroundColor: '#E2E8F0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: '#F0FDF4',
                border: '1px solid #DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
              }}
            >
              <Clock size={18} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
              Pick Your<br />Slot
            </span>
          </div>

          <div style={{ width: 24, height: 1, backgroundColor: '#E2E8F0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: '#F0FDF4',
                border: '1px solid #DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
              }}
            >
              <QrCode size={18} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
              Walk In &<br />Collect
            </span>
          </div>
        </div>

        {/* Scoped CSS for Hero Responsiveness & Micro-Animations */}
        <style>{`
          .hero-btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(5, 150, 105, 0.38) !important;
          }
          .hero-btn-secondary:hover {
            transform: translateY(-2px);
            background-color: #F0FDF4 !important;
          }
          .hero-floating-bubble {
            animation: heroFloat 3.5s ease-in-out infinite alternate;
          }
          @keyframes heroFloat {
            0% { transform: translateY(0px); }
            100% { transform: translateY(-6px); }
          }
          @media (max-width: 1024px) {
            .hero-card {
              flex-direction: column !important;
            }
            .hero-right-rail {
              width: 100% !important;
              flex-direction: row !important;
              border-left: none !important;
              border-top: 1px solid #E2E8F0 !important;
              padding: 16px 20px !important;
            }
            .hero-left-content {
              padding: 28px 24px !important;
            }
            .hero-illustration-area {
              min-height: 300px !important;
            }
          }
          @media (max-width: 640px) {
            .hero-feature-strip {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 12px !important;
            }
            .hero-floating-bubble {
              display: none !important;
            }
            .hero-handwritten-tagline {
              display: none !important;
            }
          }
        `}</style>
      </section>

      {/* 2. EXPENSE SUMMARY / MY SPENDING */}
      <ExpenseSummarySection
        summary={expenseSummary}
        loading={expenseLoading}
        error={expenseError}
        onRetry={loadExpenseSummary}
      />

      {/* 3. ACTIVE ORDER MONITOR - PHYSICAL SHOP COUNTER EXPERIENCE */}
      <section
        className="active-order-outer-section"
        style={{
          backgroundColor: '#F8FAF8',
          border: '1px solid #E2E8F0',
          borderRadius: 24,
          padding: '24px 28px 24px',
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.03), 0 4px 12px -2px rgba(0, 0, 0, 0.02)',
        }}
      >
        {/* Section Header with LIVE Indicator and All Orders Link */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ fontSize: 21, fontWeight: 800, color: '#14213D', margin: 0, letterSpacing: '-0.3px' }}>
                Active Order Status
              </h2>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#15803D',
                  backgroundColor: '#DCFCE7',
                  padding: '3px 10px',
                  borderRadius: 9999,
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#16A34A',
                    boxShadow: '0 0 6px #16A34A',
                    display: 'inline-block',
                  }}
                  className="active-order-pulse-dot"
                />
                LIVE
              </span>
            </div>
            <p style={{ fontSize: 13.5, color: '#64748B', margin: 0 }}>
              Live tracking for current preparation and pickup readiness
            </p>
          </div>
          <Link to="/customer/orders" style={{ textDecoration: 'none' }}>
            <button
              className="active-order-all-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#FFFFFF',
                color: '#14213D',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                transition: 'all 0.2s ease',
              }}
            >
              <span>All Orders</span>
              <ArrowRight size={14} />
            </button>
          </Link>
        </div>

        {ordersLoading ? (
          /* Active Order Skeleton Loader */
          <div
            style={{
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              borderRadius: 20,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 180, height: 24 }} />
              <div className="skeleton" style={{ width: 100, height: 24, borderRadius: 20 }} />
            </div>
            <div className="skeleton" style={{ width: '100%', height: 160, borderRadius: 14 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <div className="skeleton" style={{ height: 48, borderRadius: 12 }} />
              <div className="skeleton" style={{ height: 48, borderRadius: 12 }} />
              <div className="skeleton" style={{ height: 48, borderRadius: 12 }} />
              <div className="skeleton" style={{ height: 48, borderRadius: 12 }} />
            </div>
          </div>
        ) : ordersError ? (
          /* Isolated Error State */
          <div
            style={{
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFFFFF',
              border: '1px dashed #CBD5E1',
              borderRadius: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <AlertTriangle size={20} color="#F59E0B" />
              <span style={{ fontSize: 14, color: '#64748B' }}>
                {ordersError}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={loadOrders} icon={<RefreshCw size={14} />}>
              Retry
            </Button>
          </div>
        ) : activeOrder ? (
          /* Real Miniature Physical Shop Counter Environment */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* The Physical Store Scene Canvas */}
            <div
              className="store-physical-stage"
              style={{
                position: 'relative',
                background: 'linear-gradient(180deg, #FFFDF9 0%, #FAF6EE 55%, #F4ECE0 100%)',
                borderRadius: 20,
                border: '1.5px solid #EDE2D2',
                padding: '24px 24px 30px',
                overflow: 'hidden',
                boxShadow: 'inset 0 2px 8px rgba(180, 140, 90, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
                minHeight: 230,
              }}
            >
              {/* Background Physical Plant (Left) */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 16,
                  left: 14,
                  zIndex: 1,
                  pointerEvents: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{ width: 44, height: 56, position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 8, width: 22, height: 38, background: 'linear-gradient(135deg, #22C55E 0%, #15803D 100%)', borderRadius: '50% 50% 10% 10%', transform: 'rotate(-16deg)', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }} />
                  <div style={{ position: 'absolute', bottom: 0, right: 8, width: 20, height: 44, background: 'linear-gradient(135deg, #4ADE80 0%, #16A34A 100%)', borderRadius: '50% 50% 10% 10%', transform: 'rotate(18deg)', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 14, width: 18, height: 48, background: 'linear-gradient(135deg, #16A34A 0%, #14532D 100%)', borderRadius: '50% 50% 10% 10%', transform: 'rotate(2deg)' }} />
                </div>
                <div style={{ width: 34, height: 24, background: 'linear-gradient(180deg, #E07A5F 0%, #C85A32 100%)', borderRadius: '2px 2px 8px 8px', borderTop: '2.5px solid #F08A6F', boxShadow: '0 3px 6px rgba(0,0,0,0.12)' }} />
              </div>

              {/* Background QueueLess Kraft Paper Shopping Bag */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 24,
                  right: 120,
                  zIndex: 1,
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: 58,
                    height: 68,
                    background: 'linear-gradient(180deg, #E6C8A0 0%, #D8B788 100%)',
                    borderRadius: '3px 3px 6px 6px',
                    boxShadow: '0 8px 18px rgba(120, 80, 40, 0.16)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #C4A272',
                  }}
                >
                  {/* Paper Bag Handle */}
                  <div style={{ position: 'absolute', top: -12, width: 24, height: 16, border: '2.5px solid #B89666', borderBottom: 'none', borderRadius: '10px 10px 0 0' }} />
                  {/* Green Q circular logo */}
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: '#108A5F',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontWeight: 900,
                      fontSize: 13,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    Q
                  </div>
                </div>
              </div>

              {/* Background Potted Plant (Far Right) & Cursive Note */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 16,
                  right: 14,
                  zIndex: 1,
                  pointerEvents: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{ width: 40, height: 48, position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 8, width: 18, height: 34, background: 'linear-gradient(135deg, #22C55E 0%, #15803D 100%)', borderRadius: '50% 50% 10% 10%', transform: 'rotate(-20deg)' }} />
                  <div style={{ position: 'absolute', bottom: 0, right: 8, width: 18, height: 40, background: 'linear-gradient(135deg, #4ADE80 0%, #16A34A 100%)', borderRadius: '50% 50% 10% 10%', transform: 'rotate(20deg)' }} />
                </div>
                <div style={{ width: 30, height: 22, background: 'linear-gradient(180deg, #E07A5F 0%, #C85A32 100%)', borderRadius: '2px 2px 6px 6px', borderTop: '2px solid #F08A6F', boxShadow: '0 3px 6px rgba(0,0,0,0.12)' }} />
              </div>

              {/* Top-Right Cursive Tagline */}
              <div
                style={{
                  position: 'absolute',
                  right: 28,
                  top: 18,
                  transform: 'rotate(-6deg)',
                  textAlign: 'right',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Caveat, "Comic Sans MS", cursive',
                    fontSize: 17,
                    fontWeight: 700,
                    color: '#108A5F',
                    lineHeight: 1.15,
                    textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                  }}
                >
                  Good things,<br />no queues! 🌿
                </span>
              </div>

              {/* Wooden Countertop Slab running along the bottom */}
              <div
                className="store-counter-slab"
                style={{
                  position: 'absolute',
                  bottom: 8,
                  left: 16,
                  right: 16,
                  height: 14,
                  background: 'linear-gradient(180deg, #F5EADB 0%, #E8D8BF 50%, #DFCBAE 100%)',
                  borderRadius: 6,
                  borderTop: '2px solid #FFF8EE',
                  borderBottom: '2px solid #C9B293',
                  boxShadow: '0 6px 14px rgba(120, 80, 40, 0.12)',
                  zIndex: 1,
                }}
              />

              {/* 1. LEFT ORDER FLOATING CARD (Approx 25% width) */}
              <div
                className="store-order-card"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 18,
                  border: '1px solid #ECEEEA',
                  padding: '16px 18px',
                  boxShadow: '0 10px 25px -4px rgba(0, 0, 0, 0.06), 0 4px 10px -2px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minWidth: 230,
                  zIndex: 3,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: '#E8F6EF',
                      color: '#108A5F',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Store size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#14213D', lineHeight: 1.2 }}>
                      {activeOrder.shopName || 'Demo'}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginTop: 2 }}>
                      Order #{activeOrder.id ? activeOrder.id.slice(0, 8).toUpperCase() : '6112AC4A'}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 1 }}>
                      Placed at {new Date(activeOrder.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 14,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: activeOrder.status === 'READY_FOR_PICKUP' ? '#DCFCE7' : '#FFF9EF',
                    border: `1px solid ${activeOrder.status === 'READY_FOR_PICKUP' ? '#86EFAC' : '#FED7AA'}`,
                    color: activeOrder.status === 'READY_FOR_PICKUP' ? '#15803D' : '#D97706',
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 9999,
                    padding: '6px 14px',
                    width: 'fit-content',
                  }}
                >
                  <Clock size={13} />
                  <span>
                    {activeOrder.status === 'PENDING'
                      ? 'Pending Confirmation'
                      : activeOrder.status === 'CONFIRMED' || activeOrder.status === 'ACCEPTED'
                      ? 'Shop Confirmed'
                      : activeOrder.status === 'PREPARING'
                      ? 'Preparing Order'
                      : activeOrder.status === 'READY_FOR_PICKUP'
                      ? 'Ready for Pickup'
                      : activeOrder.status}
                  </span>
                </div>
              </div>

              {/* 2. CENTER WOODEN MESSAGE BOARD (Approx 18% width) */}
              <div
                className="store-wooden-board"
                style={{
                  backgroundColor: '#FFFDF9',
                  border: '4.5px solid #C89B6D',
                  outline: '1px solid #A8784C',
                  borderRadius: 14,
                  padding: '16px 18px',
                  boxShadow: '0 8px 20px rgba(140, 100, 60, 0.12), inset 0 2px 4px rgba(0,0,0,0.02)',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minWidth: 170,
                  zIndex: 3,
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 900, color: '#14213D', lineHeight: 1.25, marginBottom: 6 }}>
                  Your order<br />is at the shop!
                </div>
                <div style={{ fontSize: 11.5, color: '#786C5E', fontWeight: 600, lineHeight: 1.3 }}>
                  {activeOrder.status === 'PENDING'
                    ? 'Waiting for confirmation...'
                    : activeOrder.status === 'CONFIRMED' || activeOrder.status === 'ACCEPTED'
                    ? 'Order confirmed by clerk!'
                    : activeOrder.status === 'PREPARING'
                    ? 'Packing your fresh items...'
                    : activeOrder.status === 'READY_FOR_PICKUP'
                    ? 'Ready on pickup counter!'
                    : 'Processing at shop...'}
                </div>
              </div>

              {/* 3. RIGHT FOUR STATUS TILES SITTING ON THE TRAY (Approx 42% width) */}
              <div
                className="store-status-tray"
                style={{
                  backgroundColor: '#F3E5D0',
                  border: '1.5px solid #E5D2B8',
                  borderRadius: 18,
                  padding: '8px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 8,
                  zIndex: 3,
                  boxShadow: '0 8px 18px rgba(140, 100, 60, 0.12)',
                }}
              >
                {[
                  {
                    step: 1,
                    title: 'Order Placed',
                    detail: new Date(activeOrder.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
                    icon: <CheckCircle2 size={22} />,
                  },
                  {
                    step: 2,
                    title: 'Confirming',
                    detail: getOrderStatusStep(activeOrder.status) > 2 ? 'Confirmed' : getOrderStatusStep(activeOrder.status) === 2 ? 'Waiting' : 'Pending',
                    icon: <Store size={20} />,
                  },
                  {
                    step: 3,
                    title: 'Preparing',
                    detail: getOrderStatusStep(activeOrder.status) > 3 ? 'Done' : getOrderStatusStep(activeOrder.status) === 3 ? 'In Progress' : 'Pending',
                    icon: <PackageCheck size={20} />,
                  },
                  {
                    step: 4,
                    title: 'Ready',
                    detail: getOrderStatusStep(activeOrder.status) === 4 ? 'Ready' : 'Pending',
                    icon: <ShoppingBag size={20} />,
                  },
                ].map((item) => {
                  const currentStep = getOrderStatusStep(activeOrder.status);
                  const isDone = currentStep > item.step || (item.step === 1 && currentStep >= 1);
                  const isCurrent = currentStep === item.step;

                  let tileBg = '#FFFFFF';
                  let tileBorder = '1px solid #ECEEEA';
                  let iconBg = '#F8FAFC';
                  let iconColor = '#94A3B8';
                  let titleColor = '#475569';
                  let detailColor = '#94A3B8';

                  if (isDone && item.step !== currentStep) {
                    tileBg = 'linear-gradient(180deg, #DCFCE7 0%, #D1FAE5 100%)';
                    tileBorder = '1px solid #A7F3D0';
                    iconBg = '#16A34A';
                    iconColor = '#FFFFFF';
                    titleColor = '#14532D';
                    detailColor = '#15803D';
                  } else if (isCurrent) {
                    if (item.step === 4) {
                      tileBg = 'linear-gradient(180deg, #DCFCE7 0%, #D1FAE5 100%)';
                      tileBorder = '2px solid #16A34A';
                      iconBg = '#16A34A';
                      iconColor = '#FFFFFF';
                      titleColor = '#14532D';
                      detailColor = '#15803D';
                    } else if (item.step === 1) {
                      tileBg = 'linear-gradient(180deg, #DCFCE7 0%, #D1FAE5 100%)';
                      tileBorder = '1px solid #A7F3D0';
                      iconBg = '#16A34A';
                      iconColor = '#FFFFFF';
                      titleColor = '#14532D';
                      detailColor = '#15803D';
                    } else {
                      tileBg = 'linear-gradient(180deg, #FEF9C3 0%, #FEF08A 100%)';
                      tileBorder = '1.5px solid #FACC15';
                      iconBg = '#EAB308';
                      iconColor = '#FFFFFF';
                      titleColor = '#713F12';
                      detailColor = '#854D0E';
                    }
                  }

                  return (
                    <div
                      key={item.step}
                      className="store-step-tile"
                      style={{
                        backgroundColor: tileBg,
                        border: tileBorder,
                        borderRadius: 14,
                        padding: '12px 8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        minWidth: 84,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          backgroundColor: iconBg,
                          color: iconColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 6,
                          boxShadow: isCurrent ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                        }}
                      >
                        {item.icon}
                      </div>
                      <div style={{ fontSize: 11.5, fontWeight: 800, color: titleColor, lineHeight: 1.15 }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 10.5, fontWeight: 600, color: detailColor, marginTop: 2 }}>
                        {item.detail}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom 4 Information & Action Blocks (Inside Main Section) */}
            <div
              className="store-summary-row"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 14,
              }}
            >
              {/* Block 1: Items */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 14,
                  border: '1px solid #E2E8F0',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#14213D' }}>
                    {activeOrder.items?.length || 1} Item{activeOrder.items?.length === 1 ? '' : 's'}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>Items</div>
                </div>
              </div>

              {/* Block 2: Total Amount */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 14,
                  border: '1px solid #E2E8F0',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: '#F0FDF4',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <CreditCard size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: '#14213D' }}>
                    ₹{(activeOrder.totalAmount || 1000).toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>Total Amount</div>
                </div>
              </div>

              {/* Block 3: Pickup Window */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 14,
                  border: '1px solid #E2E8F0',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: '#F0FDF4',
                    color: '#108A5F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Clock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#14213D' }}>
                    {activeOrder.pickupSlot ? formatSlotWindow(activeOrder.pickupSlot) : '9:00 AM – 9:30 AM'}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>Pickup Window</div>
                </div>
              </div>

              {/* Block 4: CTA View Pickup Pass */}
              <Link to="/customer/orders" style={{ textDecoration: 'none', display: 'flex' }}>
                <button
                  className="active-order-pass-btn"
                  style={{
                    width: '100%',
                    backgroundColor: '#108A5F',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 14,
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 138, 95, 0.28)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <QrCode size={18} />
                  <span>View Pickup Pass</span>
                  <ArrowRight size={15} />
                </button>
              </Link>
            </div>
          </div>
        ) : (
          /* Clean Empty State */
          <div
            style={{
              padding: '36px 28px',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              border: '1px dashed #E2E8F0',
              borderRadius: 20,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
              }}
            >
              <PackageCheck size={26} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, color: '#14213D' }}>
              No Active Orders in Progress
            </h3>
            <p
              style={{
                color: '#64748B',
                fontSize: 13.5,
                maxWidth: 440,
                margin: '0 auto 20px',
                lineHeight: 1.5,
              }}
            >
              You don&apos;t have any live orders being prepared right now. Order in advance from verified local partner outlets to skip waiting lines.
            </p>
            <Link to="/customer/shops">
              <Button variant="primary" size="sm" icon={<ArrowRight size={14} />}>
                Browse Available Shops
              </Button>
            </Link>
          </div>
        )}

        {/* Scoped Styling for Physical Shop Counter Interactions */}
        <style>{`
          .active-order-pulse-dot {
            animation: pulseActiveOrderLive 2s infinite ease-in-out;
          }
          @keyframes pulseActiveOrderLive {
            0% { transform: scale(0.95); opacity: 0.8; }
            50% { transform: scale(1.25); opacity: 1; }
            100% { transform: scale(0.95); opacity: 0.8; }
          }
          .active-order-all-btn:hover {
            transform: translateY(-2px);
            background-color: #F8FAFC !important;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06) !important;
          }
          .store-step-tile:hover {
            transform: translateY(-3px);
          }
          .active-order-pass-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(16, 138, 95, 0.38) !important;
          }
          @media (max-width: 1024px) {
            .store-physical-stage {
              flex-direction: column !important;
              align-items: stretch !important;
            }
            .store-summary-row {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          @media (max-width: 640px) {
            .store-status-tray {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            .store-summary-row {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>

      {/* 4. POPULAR PARTNER SHOPS SECTION */}
      <section>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-main)' }}>
                Popular Partner Shops
              </h2>
              {!shopsLoading && shops.length > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--color-primary-subtle)',
                    color: 'var(--color-primary-deep)',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {shops.length} Available
                </span>
              )}
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, marginTop: 2 }}>
              Select a partner store to view menu items, basket configurations, and reserve pickup slots
            </p>
          </div>

          <Link
            to="/customer/shops"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--color-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>Explore All Shops</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* Category quick filter chips */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 8,
            marginBottom: 20,
            scrollbarWidth: 'none',
          }}
        >
          {(['ALL', 'GROCERY', 'RESTAURANT', 'BAKERY', 'PHARMACY', 'STATIONERY', 'MEAT_SHOP'] as const).map(
            (cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 13,
                    fontWeight: isSelected ? 600 : 500,
                    backgroundColor: isSelected
                      ? 'var(--color-primary)'
                      : 'var(--color-surface)',
                    color: isSelected ? '#fff' : 'var(--color-text-muted)',
                    border: isSelected
                      ? '1px solid var(--color-primary)'
                      : '1px solid var(--color-border)',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {CATEGORY_LABELS[cat] || cat}
                </button>
              );
            }
          )}
        </div>

        {/* Shops Content Area */}
        {shopsLoading ? (
          /* Skeletons Loader */
          <div className="grid-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="card"
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  minHeight: 220,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 10 }} />
                  <div className="skeleton" style={{ width: 80, height: 22, borderRadius: 12 }} />
                </div>
                <div className="skeleton" style={{ width: '70%', height: 20 }} />
                <div className="skeleton" style={{ width: '90%', height: 14 }} />
                <div className="skeleton" style={{ width: '50%', height: 14, marginTop: 'auto' }} />
                <div className="skeleton" style={{ width: '100%', height: 34, borderRadius: 6 }} />
              </div>
            ))}
          </div>
        ) : shopsError ? (
          /* Error with Retry */
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '48px 24px',
              maxWidth: 480,
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                backgroundColor: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertTriangle size={26} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
              Unable to load shops right now
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--color-text-muted)', marginBottom: 20 }}>
              We could not connect to the shop directory. Please check your connection and retry.
            </p>
            <Button variant="primary" size="sm" onClick={loadShops} icon={<RefreshCw size={14} />}>
              Retry Loading Shops
            </Button>
          </div>
        ) : filteredShops.length === 0 ? (
          /* Empty State */
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '52px 24px',
              backgroundColor: 'var(--color-surface)',
              border: '1px dashed var(--color-border)',
            }}
          >
            <Store size={44} style={{ color: 'var(--color-text-light)', margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
              No Partner Shops Found
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--color-text-muted)', maxWidth: 380, margin: '0 auto 18px' }}>
              {selectedCategory !== 'ALL'
                ? `No shops found in the ${CATEGORY_LABELS[selectedCategory]} category. Try switching categories.`
                : 'There are currently no active partner outlets listed in your area.'}
            </p>
            {selectedCategory !== 'ALL' && (
              <Button variant="outline" size="sm" onClick={() => setSelectedCategory('ALL')}>
                Show All Categories
              </Button>
            )}
          </div>
        ) : (
          /* Shop Cards Grid */
          <div className="grid-3">
            {filteredShops.slice(0, 6).map((shop) => (
              <div
                key={shop.id}
                className="card interactive-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div>
                  {/* Shop Header Row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-sage)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-primary-deep)',
                      }}
                    >
                      <Store size={22} />
                    </div>
                    <Badge variant="neutral">{CATEGORY_LABELS[shop.category] || shop.category}</Badge>
                  </div>

                  <h3
                    style={{
                      fontSize: 17.5,
                      fontWeight: 700,
                      marginBottom: 6,
                      color: 'var(--color-text-main)',
                    }}
                  >
                    {shop.name}
                  </h3>

                  <p
                    style={{
                      color: 'var(--color-text-muted)',
                      fontSize: 13,
                      marginBottom: 16,
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {shop.description || 'Verified QueueLess advance ordering & express pickup partner.'}
                  </p>
                </div>

                <div>
                  {/* Location & Contact */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      fontSize: 12.5,
                      color: 'var(--color-text-muted)',
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={14} color="var(--color-primary)" />
                      <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {shop.address}, {shop.city}
                      </span>
                    </div>
                    {shop.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-light)' }}>
                        <Phone size={13} />
                        <span>{shop.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA */}
                  <div
                    style={{
                      paddingTop: 14,
                      borderTop: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
                      Open for Pickup
                    </span>

                    <Link to={`/customer/shops/${shop.id}`}>
                      <Button variant="outline" size="sm" icon={<ArrowRight size={14} />}>
                        Browse Shop
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. PRODUCT / ORDER EXPERIENCE (WORKFLOW GUIDE - 5 STEP JOURNEY) */}
      <section
        className="how-it-works-card"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: '36px 32px 28px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 4px 12px -2px rgba(0, 0, 0, 0.02)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top playful handwritten note (Left) */}
        <div
          className="hiw-playful-note"
          style={{
            position: 'absolute',
            top: 24,
            left: 32,
            transform: 'rotate(-8deg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily: 'Caveat, "Comic Sans MS", "Segoe Print", cursive',
              fontSize: 20,
              fontWeight: 700,
              color: '#059669',
              lineHeight: 1.1,
            }}
          >
            Good things,
          </span>
          <span
            style={{
              fontFamily: 'Caveat, "Comic Sans MS", "Segoe Print", cursive',
              fontSize: 20,
              fontWeight: 700,
              color: '#059669',
              lineHeight: 1.1,
              marginLeft: 12,
            }}
          >
            no queues! ✨
          </span>
        </div>

        {/* Top live counter badge (Right) */}
        <div
          className="hiw-live-badge"
          style={{
            position: 'absolute',
            top: 24,
            right: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#F0FDF4',
            border: '1px solid #DCFCE7',
            borderRadius: 16,
            padding: '7px 14px',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: '#DCFCE7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
            }}
          >
            <Users size={16} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#10B981',
                  display: 'inline-block',
                  boxShadow: '0 0 6px #10B981',
                }}
              />
              24 orders
            </div>
            <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500, lineHeight: 1.2 }}>
              being prepared right now
            </span>
          </div>
        </div>

        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: 660, margin: '0 auto 36px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11.5,
              fontWeight: 800,
              color: '#059669',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              padding: '4px 14px',
              borderRadius: 9999,
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}
          >
            <Zap size={13} fill="#059669" />
            <span>HOW IT WORKS</span>
          </div>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: '#0F172A',
              letterSpacing: '-0.5px',
              margin: '0 0 8px',
            }}
          >
            The 5-Step <span style={{ color: '#059669' }}>QueueLess</span> Experience
          </h2>
          <p
            style={{
              color: '#64748B',
              fontSize: 14.5,
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            From browsing local partner stores to collecting your basket in seconds without standing in line.
          </p>
        </div>

        {/* 5 Step Cards Container with Connected Flow */}
        <div
          className="hiw-steps-row"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 16,
            position: 'relative',
          }}
        >
          {[
            {
              step: '01',
              title: 'Browse Shops',
              desc: 'Discover verified local restaurants, cafés, and retail partners near you.',
              image: '/assets/howitworks/step1_shop.jpg',
              pillIcon: <MapPin size={13} />,
              pillText: 'Find nearby options',
              cardBg: '#FAF8FF',
              cardBorder: '#EDE9FE',
              badgeBg: '#EDE9FE',
              badgeColor: '#6D28D9',
              pillBg: '#F3F0FF',
              pillColor: '#6D28D9',
              isFeatured: false,
            },
            {
              step: '02',
              title: 'Choose Products',
              desc: 'Select your items and configure quantities or customizations seamlessly.',
              image: '/assets/howitworks/step2_basket.jpg',
              pillIcon: <ShoppingBag size={13} />,
              pillText: 'Build your basket',
              cardBg: '#F0F9FF',
              cardBorder: '#E0F2FE',
              badgeBg: '#E0F2FE',
              badgeColor: '#0284C7',
              pillBg: '#E0F2FE',
              pillColor: '#0369A1',
              isFeatured: false,
            },
            {
              step: '03',
              title: 'Select Pickup',
              desc: 'Choose an exact guaranteed express time slot that fits your schedule.',
              image: '/assets/howitworks/step3_calendar.jpg',
              pillIcon: <Clock size={13} />,
              pillText: 'Guaranteed slot',
              cardBg: '#FEFCE8',
              cardBorder: '#FEF9C3',
              badgeBg: '#FEF9C3',
              badgeColor: '#CA8A04',
              pillBg: '#FEF9C3',
              pillColor: '#854D0E',
              isFeatured: false,
            },
            {
              step: '04',
              title: 'Place Order',
              desc: 'Confirm your order securely and receive your digital pickup express pass.',
              image: '/assets/howitworks/step4_phone.jpg',
              pillIcon: <CreditCard size={13} />,
              pillText: 'Secure & contactless',
              cardBg: '#FFF5F5',
              cardBorder: '#FFE4E6',
              badgeBg: '#FFE4E6',
              badgeColor: '#E11D48',
              pillBg: '#FFE4E6',
              pillColor: '#BE123C',
              isFeatured: false,
            },
            {
              step: '05',
              title: 'Skip the Queue',
              desc: 'Walk into the partner counter at your slot time and grab your ready basket.',
              image: '/assets/howitworks/step5_express.jpg',
              pillIcon: <Zap size={13} fill="#047857" />,
              pillText: 'Zero waiting!',
              cardBg: '#F0FDF4',
              cardBorder: '#10B981',
              badgeBg: '#10B981',
              badgeColor: '#FFFFFF',
              pillBg: '#DCFCE7',
              pillColor: '#047857',
              isFeatured: true,
            },
          ].map((item, idx) => (
            <div
              key={item.step}
              className={`hiw-step-card ${item.isFeatured ? 'hiw-featured-card' : ''}`}
              style={{
                backgroundColor: item.cardBg,
                borderRadius: 20,
                border: item.isFeatured ? '2px solid #10B981' : `1px solid ${item.cardBorder}`,
                padding: '16px 14px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: item.isFeatured
                  ? '0 10px 25px -5px rgba(16, 185, 129, 0.18), 0 4px 10px -2px rgba(16, 185, 129, 0.1)'
                  : '0 2px 8px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Step indicator top row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: item.badgeBg,
                    color: item.badgeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {item.step}
                </div>

                {item.isFeatured && (
                  <span
                    style={{
                      fontSize: 16,
                      lineHeight: 1,
                    }}
                    title="Express Advantage"
                  >
                    👑
                  </span>
                )}
              </div>

              {/* 3D Visual Asset */}
              <div
                style={{
                  width: '100%',
                  height: 120,
                  borderRadius: 14,
                  overflow: 'hidden',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)',
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                  }}
                  className="hiw-step-img"
                />
              </div>

              {/* Title & Description */}
              <h4
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  marginBottom: 6,
                  color: '#0F172A',
                  letterSpacing: '-0.2px',
                }}
              >
                {item.title}
              </h4>
              <p
                style={{
                  fontSize: 12,
                  color: '#64748B',
                  lineHeight: 1.45,
                  margin: '0 0 14px',
                  flexGrow: 1,
                }}
              >
                {item.desc}
              </p>

              {/* Action / Benefit pill badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  backgroundColor: item.pillBg,
                  color: item.pillColor,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '6px 10px',
                  borderRadius: 9999,
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                {item.pillIcon}
                <span>{item.pillText}</span>
              </div>

              {/* Connected Journey Path Node (Desktop) */}
              {idx < 4 && (
                <div
                  className="hiw-connector-node"
                  style={{
                    position: 'absolute',
                    right: -13,
                    top: '26%',
                    transform: 'translateY(-50%)',
                    zIndex: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      border: '2px solid #FFFFFF',
                      boxShadow: '0 0 0 2px #6EE7B7',
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Trust & Campus Impact Bar */}
        <div
          className="hiw-impact-bar"
          style={{
            marginTop: 28,
            backgroundColor: '#F8FBF9',
            border: '1px solid #DCFCE7',
            borderRadius: 16,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: '#DCFCE7',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={18} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Average pickup time</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#059669' }}>~ 30 seconds</div>
            </div>
          </div>

          <div className="hiw-divider" style={{ width: 1, height: 28, backgroundColor: '#E2E8F0' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: '#DCFCE7',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={18} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Verified partner stores</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>Trusted & safe</div>
            </div>
          </div>

          <div className="hiw-divider" style={{ width: 1, height: 28, backgroundColor: '#E2E8F0' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: '#DCFCE7',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Leaf size={18} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Supports local businesses</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>Stronger campus community</div>
            </div>
          </div>

          <div className="hiw-divider" style={{ width: 1, height: 28, backgroundColor: '#E2E8F0' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: '#DCFCE7',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={18} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>A smoother, smarter campus</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>Less waiting, more doing!</div>
            </div>
          </div>

          <div
            className="hiw-happiness-note"
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span
              style={{
                fontFamily: 'Caveat, "Comic Sans MS", "Segoe Print", cursive',
                fontSize: 16,
                fontWeight: 700,
                color: '#059669',
                textAlign: 'right',
                lineHeight: 1.15,
              }}
            >
              Same campus.
              <br />
              Happier you! ❤️
            </span>
          </div>
        </div>

        {/* Scoped CSS styling for responsiveness, hover states, and connectors */}
        <style>{`
          .hiw-step-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.08);
          }
          .hiw-step-card:hover .hiw-step-img {
            transform: scale(1.04);
          }
          @media (max-width: 1024px) {
            .hiw-steps-row {
              grid-template-columns: repeat(3, 1fr) !important;
            }
            .hiw-playful-note, .hiw-live-badge {
              position: static !important;
              margin-bottom: 12px;
            }
          }
          @media (max-width: 768px) {
            .hiw-steps-row {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            .hiw-divider {
              display: none !important;
            }
            .hiw-impact-bar {
              flex-direction: column !important;
              align-items: flex-start !important;
            }
            .hiw-happiness-note {
              margin-left: 0 !important;
              margin-top: 8px;
            }
          }
          @media (max-width: 480px) {
            .hiw-steps-row {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>
    </div>
  );
};
