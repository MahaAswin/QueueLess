import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  Bell,
  LogOut,
  Sparkles,
  CheckCircle2,
  Clock,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import type { NotificationItem } from '../../types/notification.types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/feedback/LoadingState';

type ProfileTab = 'PROFILE' | 'NOTIFICATIONS' | 'PREFERENCES';

export const CustomerProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    tabParam === 'notifications' ? 'NOTIFICATIONS' : 'PROFILE'
  );

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (tabParam === 'notifications') {
      setActiveTab('NOTIFICATIONS');
    }
  }, [tabParam]);

  const loadNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const response = await notificationService.getUserNotifications(0, 30);
      setNotifications(response?.content || []);
    } catch {
      // Soft fail
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'NOTIFICATIONS') {
      loadNotifications();
    }
  }, [activeTab]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // Soft fail
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // Soft fail
    } finally {
      setMarkingAll(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
            <span>ACCOUNT OVERVIEW</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-main)' }}>
            Customer Account & Profile
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14.5 }}>
            Manage your personal profile, notification alerts, and express pickup preferences.
          </p>
        </div>

        <Button variant="danger" size="md" onClick={handleLogout} icon={<LogOut size={16} />}>
          Sign Out
        </Button>
      </div>

      {/* Profile Overview Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-light-sage) 100%)',
          borderColor: 'var(--color-sage)',
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-deep)',
              color: '#FFFFFF',
              fontSize: 24,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {user?.fullName?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>{user?.fullName || 'Customer User'}</h2>
              <Badge variant="success">Verified Customer</Badge>
            </div>
            <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
              {user?.email || 'customer@queueless.com'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Badge variant="neutral">Role: {user?.role || 'CUSTOMER'}</Badge>
          <Badge variant="info">Status: {user?.accountStatus || 'ACTIVE'}</Badge>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: 4,
        }}
      >
        <button
          onClick={() => {
            setActiveTab('PROFILE');
            setSearchParams({});
          }}
          style={{
            padding: '10px 20px',
            borderBottom: activeTab === 'PROFILE' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'PROFILE' ? 'var(--color-primary-deep)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'PROFILE' ? 700 : 500,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <UserIcon size={16} />
          <span>Profile Details</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('NOTIFICATIONS');
            setSearchParams({ tab: 'notifications' });
          }}
          style={{
            padding: '10px 20px',
            borderBottom: activeTab === 'NOTIFICATIONS' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'NOTIFICATIONS' ? 'var(--color-primary-deep)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'NOTIFICATIONS' ? 700 : 500,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Bell size={16} />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span
              style={{
                backgroundColor: 'var(--color-primary-deep)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('PREFERENCES');
            setSearchParams({});
          }}
          style={{
            padding: '10px 20px',
            borderBottom: activeTab === 'PREFERENCES' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'PREFERENCES' ? 'var(--color-primary-deep)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'PREFERENCES' ? 700 : 500,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Shield size={16} />
          <span>Express Pickup Guide</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'PROFILE' && (
        <div className="grid-2">
          {/* Personal Details */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Personal Information</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Full Legal Name
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UserIcon size={16} color="var(--color-text-light)" />
                  {user?.fullName || 'Not specified'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Registered Email Address
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={16} color="var(--color-text-light)" />
                  {user?.email || 'Not specified'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Phone Number
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Phone size={16} color="var(--color-text-light)" />
                  {user?.phone || '+1 (555) 019-2834'}
                </div>
              </div>
            </div>
          </div>

          {/* Account Security & Role */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Account Security & Access</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 4 }}>
                  System Role
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-main)' }}>
                  Customer (Store Pickup & Orders)
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Session Security
                </div>
                <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
                  JWT Authenticated with Auto-Refresh & Secure Storage.
                </div>
              </div>

              <div style={{ paddingTop: 16, borderTop: '1px solid var(--color-border-subtle)' }}>
                <Button variant="outline" size="sm" onClick={handleLogout} icon={<LogOut size={15} />}>
                  Sign Out of QueueLess
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'NOTIFICATIONS' && (
        <div className="card" style={{ padding: 24 }}>
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
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Notifications & Alerts</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5 }}>
                Real-time updates regarding your express pickup orders and slots
              </p>
            </div>

            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                isLoading={markingAll}
                onClick={handleMarkAllAsRead}
                icon={<Check size={14} />}
              >
                Mark All as Read
              </Button>
            )}
          </div>

          {notificationsLoading ? (
            <LoadingState message="Loading notification alerts..." />
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
              <Bell size={36} style={{ margin: '0 auto 12px', color: 'var(--color-text-light)' }} />
              <div style={{ fontWeight: 600, fontSize: 15 }}>No notifications yet</div>
              <div style={{ fontSize: 13.5, color: 'var(--color-text-light)', marginTop: 4 }}>
                You will receive alerts here when your orders change status or express pickup slots are updated.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: n.read ? 'var(--color-surface)' : 'var(--color-primary-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: n.read ? 'var(--color-surface-subtle)' : 'var(--color-sage)',
                        color: 'var(--color-primary-deep)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      <Bell size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--color-text-main)' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--color-text-light)', marginTop: 4 }}>
                        {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now'}
                      </div>
                    </div>
                  </div>

                  {!n.read && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(n.id)}
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'PREFERENCES' && (
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
            QueueLess Express Pickup Guide
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            QueueLess is engineered to eliminate customer waiting lines at physical merchant outlets. Here is how our zero-wait guarantee operates:
          </p>

          <div className="grid-3" style={{ gap: 20 }}>
            <div
              style={{
                padding: 20,
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Clock size={20} color="var(--color-primary)" />
                <h4 style={{ fontSize: 15, fontWeight: 700 }}>1. Advance Preparation</h4>
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                When you place your order, the merchant prepares and packs your basket ahead of time so it is ready when you arrive.
              </p>
            </div>

            <div
              style={{
                padding: 20,
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Sparkles size={20} color="var(--color-primary)" />
                <h4 style={{ fontSize: 15, fontWeight: 700 }}>2. Dedicated Slot</h4>
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Pickup slots distribute store footfall to avoid congestion at the pickup counter.
              </p>
            </div>

            <div
              style={{
                padding: 20,
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <CheckCircle2 size={20} color="var(--color-primary)" />
                <h4 style={{ fontSize: 15, fontWeight: 700 }}>3. Instant Handover</h4>
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Present your 8-digit order reference pass or QR code at the counter for contactless basket collection.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
