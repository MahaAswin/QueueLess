import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  ShoppingBag,
  Receipt,
  Bell,
  ArrowRight,
  Clock,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  PackageCheck,
  RefreshCw,
  Timer,
  QrCode,
  Compass,
  AlertTriangle,
  Phone,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { shopService } from '../../services/shopService';
import { orderService } from '../../services/orderService';
import type { Shop, ShopCategory } from '../../types/shop.types';
import type { Order, OrderStatus } from '../../types/order.types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

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
  const { user } = useAuth();

  // Shops State
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopsLoading, setShopsLoading] = useState<boolean>(true);
  const [shopsError, setShopsError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'ALL'>('ALL');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Time-of-day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const customerFirstName = useMemo(() => {
    if (!user?.fullName) return null;
    const parts = user.fullName.trim().split(' ');
    return parts[0];
  }, [user?.fullName]);

  // Load Shops
  const loadShops = useCallback(async () => {
    setShopsLoading(true);
    setShopsError(null);
    try {
      const data = await shopService.getActiveShops();
      setShops(data || []);
    } catch {
      setShopsError('Unable to load shops right now.');
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

  useEffect(() => {
    loadShops();
    loadOrders();
  }, [loadShops, loadOrders]);

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

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'READY_FOR_PICKUP':
        return (
          <Badge variant="success" icon={<CheckCircle2 size={13} />}>
            Ready for Pickup
          </Badge>
        );
      case 'PREPARING':
        return (
          <Badge variant="warning" icon={<Clock size={13} />}>
            Preparing Basket
          </Badge>
        );
      case 'CONFIRMED':
      case 'ACCEPTED':
        return (
          <Badge variant="info" icon={<CheckCircle2 size={13} />}>
            Confirmed by Shop
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="warning" icon={<Clock size={13} />}>
            Pending Confirmation
          </Badge>
        );
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      {/* 1. HERO SECTION */}
      <section
        className="card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #edf7f2 100%)',
          borderColor: 'var(--color-sage)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 44px',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
            gap: 36,
            alignItems: 'center',
          }}
          className="hero-grid"
        >
          {/* Left Column: Heading & Value Proposition */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                backgroundColor: 'var(--color-primary-subtle)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--color-primary-deep)',
                fontSize: 12.5,
                fontWeight: 700,
                letterSpacing: '0.4px',
                marginBottom: 18,
                border: '1px solid rgba(18, 124, 78, 0.15)',
              }}
            >
              <Zap size={15} fill="var(--color-primary)" />
              <span>ZERO-WAIT EXPRESS PICKUP</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(28px, 3.2vw, 40px)',
                fontWeight: 800,
                color: 'var(--color-text-main)',
                lineHeight: 1.18,
                marginBottom: 12,
                letterSpacing: '-0.8px',
              }}
            >
              {customerFirstName ? (
                <>
                  {greeting}, <span style={{ color: 'var(--color-primary)' }}>{customerFirstName}</span>!
                </>
              ) : (
                'Order ahead. Skip the queue.'
              )}
            </h1>

            <p
              style={{
                color: 'var(--color-text-muted)',
                fontSize: 16,
                lineHeight: 1.6,
                marginBottom: 26,
                maxWidth: 560,
              }}
            >
              Discover verified local restaurants, bakeries, and stores. Pre-order your basket, reserve an express pickup slot, and pick up without waiting in line.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <Link to="/customer/shops">
                <Button variant="primary" size="lg" icon={<ArrowRight size={18} />}>
                  Explore Partner Shops
                </Button>
              </Link>
              <Link to="/customer/cart">
                <Button variant="secondary" size="lg" icon={<ShoppingBag size={18} />}>
                  View My Basket
                </Button>
              </Link>
            </div>

            {/* Micro value badges */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                marginTop: 28,
                paddingTop: 20,
                borderTop: '1px solid rgba(226, 232, 240, 0.8)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 500 }}>
                <ShieldCheck size={16} color="var(--color-primary)" />
                <span>Verified Partners</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 500 }}>
                <Timer size={16} color="var(--color-primary)" />
                <span>Guaranteed Slots</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 500 }}>
                <QrCode size={16} color="var(--color-primary)" />
                <span>Express QR Pass</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Express Pickup Visual Treatment */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-sage)',
              padding: '24px',
              boxShadow: 'var(--shadow-md)',
              position: 'relative',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: '1px dashed var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-primary-deep)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Zap size={20} fill="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-primary-deep)' }}>
                    QueueLess Express Pass
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-light)' }}>
                    Zero-Wait Counter Verification
                  </div>
                </div>
              </div>
              <Badge variant="success" icon={<CheckCircle2 size={12} />}>
                Instant Collection
              </Badge>
            </div>

            {/* Visual Sample Card Info */}
            <div
              style={{
                backgroundColor: 'var(--color-light-sage)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: 16,
                border: '1px solid rgba(221, 238, 228, 0.6)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
                  Next Available Slot
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)' }}>
                  Ready in ~10 mins
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-main)', marginBottom: 4 }}>
                Skip the lines at {shops.length > 0 ? shops[0].name : 'Partner Cafes & Bakeries'}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>
                Order ahead &rarr; Arrive at counter &rarr; Scan QR & Go
              </div>
            </div>

            {/* Interactive Express Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--color-text-light)', fontWeight: 600 }}>AVERAGE WAIT TIME</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary)', marginTop: 2 }}>0 min</div>
              </div>
              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--color-text-light)', fontWeight: 600 }}>PARTNER SHOPS</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-main)', marginTop: 2 }}>
                  {shopsLoading ? '...' : `${shops.length} Active`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK ACTIONS */}
      <section>
        <div style={{ marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-main)' }}>
            Quick Actions
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            Frequent shortcuts for express ordering, pickups, and account management
          </p>
        </div>

        <div className="grid-4">
          <Link
            to="/customer/shops"
            className="card interactive-card"
            style={{
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-subtle)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Store size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-main)' }}>
                Explore Shops
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 1 }}>
                Browse menus & outlets
              </div>
            </div>
          </Link>

          <Link
            to="/customer/cart"
            className="card interactive-card"
            style={{
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-sage)',
                color: 'var(--color-primary-deep)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShoppingBag size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-main)' }}>
                My Cart
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 1 }}>
                Review items & checkout
              </div>
            </div>
          </Link>

          <Link
            to="/customer/orders"
            className="card interactive-card"
            style={{
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-info-bg)',
                color: 'var(--color-info)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Receipt size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-main)' }}>
                Orders & Pickups
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 1 }}>
                Live tickets & history
              </div>
            </div>
          </Link>

          <Link
            to="/customer/profile?tab=notifications"
            className="card interactive-card"
            style={{
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-warning-bg)',
                color: 'var(--color-warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Bell size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-main)' }}>
                Notifications
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 1 }}>
                Pickup readiness alerts
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. ACTIVE ORDER MONITOR */}
      <section>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-main)' }}>
              Active Order Status
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--color-text-muted)' }}>
              Live tracking for current preparation and pickup readiness
            </p>
          </div>
          {activeOrder && (
            <Link to="/customer/orders">
              <Button variant="outline" size="sm" icon={<ArrowRight size={14} />}>
                All Orders
              </Button>
            </Link>
          )}
        </div>

        {ordersLoading ? (
          /* Active Order Skeleton Loader */
          <div
            className="card"
            style={{
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 180, height: 24 }} />
              <div className="skeleton" style={{ width: 100, height: 24, borderRadius: 20 }} />
            </div>
            <div className="skeleton" style={{ width: '100%', height: 48, borderRadius: 8 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 220, height: 20 }} />
              <div className="skeleton" style={{ width: 120, height: 36, borderRadius: 8 }} />
            </div>
          </div>
        ) : ordersError ? (
          /* Isolated Error State */
          <div
            className="card"
            style={{
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--color-surface-subtle)',
              border: '1px dashed var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <AlertTriangle size={20} color="var(--color-warning)" />
              <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
                {ordersError}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={loadOrders} icon={<RefreshCw size={14} />}>
              Retry
            </Button>
          </div>
        ) : activeOrder ? (
          /* Active Order Card */
          <div
            className="card"
            style={{
              border: '1.5px solid var(--color-primary-accent)',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              boxShadow: 'var(--shadow-md)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top Accent Bar */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                backgroundColor: 'var(--color-primary)',
              }}
            />

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
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <Store size={20} color="var(--color-primary-deep)" />
                  <h3 style={{ fontSize: 19, fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {activeOrder.shopName || 'Partner Shop'}
                  </h3>
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-light)', fontWeight: 500 }}>
                  Order #{activeOrder.id.slice(0, 8).toUpperCase()} &bull; Placed at{' '}
                  {new Date(activeOrder.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              <div>{getOrderStatusBadge(activeOrder.status)}</div>
            </div>

            {/* Stepper Progress Bar */}
            <div
              style={{
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '18px 24px',
                marginBottom: 22,
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  position: 'relative',
                  gap: 8,
                }}
              >
                {[
                  { step: 1, title: 'Order Placed' },
                  { step: 2, title: 'Confirmed' },
                  { step: 3, title: 'Preparing' },
                  { step: 4, title: 'Ready for Pickup' },
                ].map((item) => {
                  const currentStep = getOrderStatusStep(activeOrder.status);
                  const isDone = currentStep >= item.step;
                  const isCurrent = currentStep === item.step;

                  return (
                    <div
                      key={item.step}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: isDone
                            ? 'var(--color-primary)'
                            : 'var(--color-border)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 700,
                          marginBottom: 6,
                          boxShadow: isCurrent ? '0 0 0 4px var(--color-primary-glow)' : 'none',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {isDone && currentStep > item.step ? (
                          <Check size={14} />
                        ) : (
                          item.step
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: isCurrent ? 700 : 500,
                          color: isDone ? 'var(--color-text-main)' : 'var(--color-text-light)',
                        }}
                      >
                        {item.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Details Summary & Action */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
                paddingTop: 16,
                borderTop: '1px solid var(--color-border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-light)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Items Count
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {activeOrder.items?.length || 0} items
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-light)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Total Amount
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-primary-deep)' }}>
                    ₹{activeOrder.totalAmount?.toFixed(2) || '0.00'}
                  </div>
                </div>

                {activeOrder.pickupSlot && (
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-light)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Reserved Pickup Slot
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-primary)' }}>
                      {activeOrder.pickupSlot.startTime} - {activeOrder.pickupSlot.endTime}
                    </div>
                  </div>
                )}
              </div>

              <Link to="/customer/orders">
                <Button variant="primary" size="md" icon={<QrCode size={16} />}>
                  View Pickup Pass
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Clean Empty State */
          <div
            className="card"
            style={{
              padding: '36px 28px',
              textAlign: 'center',
              backgroundColor: 'var(--color-surface)',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                backgroundColor: 'var(--color-sage)',
                color: 'var(--color-primary-deep)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
              }}
            >
              <PackageCheck size={26} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, color: 'var(--color-text-main)' }}>
              No Active Orders in Progress
            </h3>
            <p
              style={{
                color: 'var(--color-text-muted)',
                fontSize: 14,
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

      {/* 5. PRODUCT / ORDER EXPERIENCE (WORKFLOW GUIDE) */}
      <section
        className="card"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px 32px',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--color-primary-deep)',
              backgroundColor: 'var(--color-primary-subtle)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
            }}
          >
            <Compass size={14} />
            <span>HOW IT WORKS</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.3px' }}>
            The 5-Step QueueLess Experience
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14.5, marginTop: 6 }}>
            From browsing local partner stores to collecting your basket in seconds without standing in line.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 20,
            position: 'relative',
          }}
        >
          {[
            {
              step: '01',
              title: 'Browse Shops',
              desc: 'Discover verified local restaurants, cafes, and retail partners near you.',
              icon: <Store size={22} />,
            },
            {
              step: '02',
              title: 'Choose Products',
              desc: 'Select your items and configure quantities or customizations seamlessly.',
              icon: <ShoppingBag size={22} />,
            },
            {
              step: '03',
              title: 'Select Pickup',
              desc: 'Choose an exact guaranteed express time slot that fits your schedule.',
              icon: <Clock size={22} />,
            },
            {
              step: '04',
              title: 'Place Order',
              desc: 'Confirm your order securely and receive your digital pickup express pass.',
              icon: <Receipt size={22} />,
            },
            {
              step: '05',
              title: 'Skip the Queue',
              desc: 'Walk into the partner counter at your slot time and grab your ready basket.',
              icon: <Zap size={22} />,
            },
          ].map((item, idx) => (
            <div
              key={item.step}
              style={{
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '22px 18px',
                border: '1px solid var(--color-border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: idx === 4 ? 'var(--color-primary)' : 'var(--color-sage)',
                    color: idx === 4 ? '#fff' : 'var(--color-primary-deep)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: 'var(--color-text-light)',
                    letterSpacing: '0.5px',
                  }}
                >
                  STEP {item.step}
                </span>
              </div>

              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: 'var(--color-text-main)' }}>
                {item.title}
              </h4>
              <p style={{ fontSize: 12.5, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
