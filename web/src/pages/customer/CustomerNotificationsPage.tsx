import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  ArrowLeft,
  CheckCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useNotifications, type NotificationFilter } from './profile/useNotifications';
import { NotificationItemCard } from './profile/NotificationItemCard';
import { NotificationsListSkeleton } from './profile/NotificationsListSkeleton';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ErrorState } from '../../components/feedback/ErrorState';
import { EmptyState } from '../../components/feedback/EmptyState';

export const CustomerNotificationsPage: React.FC = () => {
  const {
    notifications,
    rawCount,
    unreadCount,
    loading,
    error,
    filter,
    setFilter,
    actionLoadingId,
    markingAll,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  } = useNotifications();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 860, margin: '0 auto' }}>
      {/* Top Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link
          to="/customer/profile"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13.5,
            fontWeight: 600,
            color: 'var(--color-primary-deep)',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface-hover)',
          }}
        >
          <ArrowLeft size={15} />
          <span>Back to Account Profile</span>
        </Link>
      </div>

      {/* Page Header */}
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
            <span>ACTIVITY & ALERTS</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <Badge variant="success">
                {unreadCount} Unread
              </Badge>
            )}
          </div>

          <p style={{ color: 'var(--color-text-muted)', fontSize: 14.5, marginTop: 4, marginBottom: 0 }}>
            Real-time updates regarding your store pickup passes, slots, and order statuses.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            isLoading={loading}
            icon={<RefreshCw size={14} />}
          >
            Refresh
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={markAllAsRead}
              isLoading={markingAll}
              icon={<CheckCheck size={15} />}
            >
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: 8,
          overflowX: 'auto',
        }}
      >
        {(
          [
            { key: 'ALL', label: `All (${rawCount})` },
            { key: 'UNREAD', label: `Unread (${unreadCount})` },
            { key: 'ORDERS', label: 'Order Updates' },
            { key: 'SLOTS', label: 'Pickup Slots' },
          ] as { key: NotificationFilter; label: string }[]
        ).map((tab) => {
          const isActive = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                backgroundColor: isActive ? 'var(--color-primary-deep)' : 'var(--color-surface-subtle)',
                color: isActive ? '#FFFFFF' : 'var(--color-text-muted)',
                fontWeight: isActive ? 700 : 600,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Notification List Container */}
      <div>
        {loading ? (
          <NotificationsListSkeleton />
        ) : error ? (
          <ErrorState
            title="Unable to load notifications"
            message={error}
            onRetry={refresh}
          />
        ) : notifications.length === 0 ? (
          <EmptyState
            title="No notifications yet"
            message="You'll see important QueueLess updates here when your store orders change status or pickup slots are confirmed."
            icon={<Bell size={40} />}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notifications.map((item) => (
              <NotificationItemCard
                key={item.id}
                notification={item}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                isActionLoading={actionLoadingId === item.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
