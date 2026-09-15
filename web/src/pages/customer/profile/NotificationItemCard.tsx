import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  ShoppingBag,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  Check,
  Trash2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { NotificationItem } from '../../../types/notification.types';
import { getNotificationMeta, formatRelativeTime } from '../../../utils/formatters';

interface NotificationItemCardProps {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isActionLoading?: boolean;
}

export const NotificationItemCard: React.FC<NotificationItemCardProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  isActionLoading,
}) => {
  const meta = getNotificationMeta(notification.type);

  const getCategoryIcon = () => {
    switch (meta.category) {
      case 'ORDER':
        return <ShoppingBag size={18} />;
      case 'SLOT':
        return <Calendar size={18} />;
      case 'COMPLAINT':
        return <AlertTriangle size={18} />;
      case 'ACCOUNT':
        return <ShieldCheck size={18} />;
      default:
        return <Bell size={18} />;
    }
  };

  return (
    <div
      className="card"
      style={{
        padding: '18px 20px',
        borderRadius: 'var(--radius-lg)',
        border: notification.read
          ? '1px solid var(--color-border)'
          : '1.5px solid var(--color-primary-light, #A7D7C5)',
        backgroundColor: notification.read
          ? 'var(--color-surface)'
          : 'var(--color-primary-subtle, #F0FDF4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'all 0.2s ease',
        boxShadow: notification.read ? 'none' : '0 2px 8px rgba(13, 92, 58, 0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
        {/* Icon & Details */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              backgroundColor: meta.bgColor,
              color: meta.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 2,
            }}
          >
            {getCategoryIcon()}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
              <span
                style={{
                  fontWeight: notification.read ? 600 : 700,
                  fontSize: 15,
                  color: 'var(--color-text-main)',
                }}
              >
                {notification.title}
              </span>

              {!notification.read && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-primary-deep)',
                    color: '#FFFFFF',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.3px',
                  }}
                >
                  <Sparkles size={10} />
                  <span>NEW</span>
                </span>
              )}
            </div>

            <p
              style={{
                fontSize: 13.5,
                color: 'var(--color-text-muted)',
                lineHeight: 1.5,
                margin: '0 0 6px 0',
              }}
            >
              {notification.message}
            </p>

            <div style={{ fontSize: 12, color: 'var(--color-text-light)', fontWeight: 500 }}>
              {formatRelativeTime(notification.createdAt)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {!notification.read && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              disabled={isActionLoading}
              title="Mark as Read"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-primary-deep)',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Check size={13} />
              <span>Mark Read</span>
            </button>
          )}

          <button
            onClick={() => onDelete(notification.id)}
            disabled={isActionLoading}
            title="Delete notification"
            style={{
              padding: 7,
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--color-text-light)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Related Order Deep Link */}
      {notification.relatedOrderId && (
        <div
          style={{
            paddingTop: 10,
            borderTop: '1px solid var(--color-border-subtle, rgba(0, 0, 0, 0.05))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          <Link
            to={`/customer/orders/${notification.relatedOrderId}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--color-primary-deep)',
              textDecoration: 'none',
            }}
          >
            <span>View Order & Pickup Pass</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
};
