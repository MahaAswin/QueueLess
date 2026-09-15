import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Phone,
  Bell,
  LogOut,
  Sparkles,
  Clock,
  ArrowRight,
  Receipt,
  Store,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import type { NotificationItem } from '../../types/notification.types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatRelativeTime } from '../../utils/formatters';

export const CustomerProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loadingNotifications, setLoadingNotifications] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadProfileData = async () => {
      setLoadingNotifications(true);
      try {
        const [pageData, count] = await Promise.all([
          notificationService.getUserNotifications(0, 3),
          notificationService.getUnreadCount(),
        ]);
        if (isMounted) {
          setRecentNotifications(pageData?.content || []);
          setUnreadCount(count ?? 0);
        }
      } catch {
        // Soft fail
      } finally {
        if (isMounted) setLoadingNotifications(false);
      }
    };

    loadProfileData();

    const handleUpdate = () => {
      loadProfileData();
    };

    window.addEventListener('queueless:notifications-updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('queueless:notifications-updated', handleUpdate);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1040, margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              backgroundColor: 'var(--color-primary-subtle)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-primary-deep)',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            <Sparkles size={13} />
            <span>ACCOUNT SETTINGS</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
            Account Profile
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14.5, marginTop: 4, marginBottom: 0 }}>
            Manage your QueueLess account and preferences.
          </p>
        </div>

        <Button variant="danger" size="md" onClick={handleLogout} icon={<LogOut size={16} />}>
          Sign Out
        </Button>
      </div>

      {/* Profile Overview Hero Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-light-sage, #F0FDF4) 100%)',
          borderColor: 'var(--color-sage, #A7D7C5)',
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
          borderRadius: 'var(--radius-xl, 16px)',
          boxShadow: '0 4px 16px rgba(13, 92, 58, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-deep)',
              color: '#FFFFFF',
              fontSize: 26,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(13, 92, 58, 0.2)',
            }}
          >
            {user?.fullName?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: 'var(--color-text-main)' }}>
                {user?.fullName || 'Customer User'}
              </h2>
              <Badge variant="success">Verified Customer</Badge>
            </div>
            <div style={{ fontSize: 14, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={14} color="var(--color-text-light)" />
              <span>{user?.email || 'customer@queueless.com'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Badge variant="neutral">Role: {user?.role || 'CUSTOMER'}</Badge>
          <Badge variant="info">Status: {user?.accountStatus || 'ACTIVE'}</Badge>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
        {/* Left Column: Personal Information & Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{ padding: 24, borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Personal Information</h3>
              <Badge variant="neutral">Read Only</Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 5 }}>
                  Full Legal Name
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <UserIcon size={16} color="var(--color-text-light)" />
                  <span>{user?.fullName || 'Not specified'}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 5 }}>
                  Registered Email Address
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Mail size={16} color="var(--color-text-light)" />
                  <span>{user?.email || 'Not specified'}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 5 }}>
                  Contact Phone Number
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Phone size={16} color="var(--color-text-light)" />
                  <span>{user?.phone || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Security Card */}
          <div className="card" style={{ padding: 24, borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Account Security</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Authentication State
                </div>
                <div style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  Protected by secure JWT session tokens with automatic refresh handling.
                </div>
              </div>

              <div style={{ paddingTop: 14, borderTop: '1px solid var(--color-border-subtle)' }}>
                <Button variant="outline" size="sm" onClick={handleLogout} icon={<LogOut size={15} />}>
                  Sign Out of QueueLess
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Notifications Preview & Express Pickup Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Notifications Card */}
          <div className="card" style={{ padding: 24, borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="success">{unreadCount} New</Badge>
                )}
              </div>

              <Link
                to="/customer/profile/notifications"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--color-primary-deep)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {loadingNotifications ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13.5 }}>
                Checking recent alerts...
              </div>
            ) : recentNotifications.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                <Bell size={28} style={{ margin: '0 auto 8px', color: 'var(--color-text-light)' }} />
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-text-main)' }}>
                  No new notifications
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  Order readiness and pickup schedule updates will appear here.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentNotifications.map((n) => {
                  return (
                    <div
                      key={n.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: n.read ? '1px solid var(--color-border)' : '1px solid var(--color-primary-light, #A7D7C5)',
                        backgroundColor: n.read ? 'var(--color-surface)' : 'var(--color-primary-subtle, #F0FDF4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: n.read ? 600 : 700, color: 'var(--color-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>
                          {n.message}
                        </div>
                      </div>

                      <span style={{ fontSize: 11.5, color: 'var(--color-text-light)', flexShrink: 0, fontWeight: 500 }}>
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                  );
                })}

                <div style={{ marginTop: 8 }}>
                  <Link
                    to="/customer/profile/notifications"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface-subtle)',
                      color: 'var(--color-primary-deep)',
                      fontSize: 13,
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <span>Open Notifications Inbox</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Express Pickup Zero-Wait Summary Card */}
          <div
            className="card"
            style={{
              padding: 24,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Clock size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Zero-Wait Express Pickup</h3>
            </div>

            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.55, margin: '0 0 16px 0' }}>
              Your pickup time slots guarantee dedicated basket preparation before you arrive. Show your order reference code at the counter for instant pickup.
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <Link
                to="/customer/orders"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: 'var(--color-primary-deep)',
                  textDecoration: 'none',
                }}
              >
                <Receipt size={14} />
                <span>My Active Orders</span>
              </Link>
              <span style={{ color: 'var(--color-border)' }}>•</span>
              <Link
                to="/customer/shops"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: 'var(--color-primary-deep)',
                  textDecoration: 'none',
                }}
              >
                <Store size={14} />
                <span>Explore Shops</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
