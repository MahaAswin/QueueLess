import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../../../services/notificationService';
import type { NotificationItem } from '../../../types/notification.types';

export type NotificationFilter = 'ALL' | 'UNREAD' | 'ORDERS' | 'SLOTS';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<NotificationFilter>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pageData, count] = await Promise.all([
        notificationService.getUserNotifications(0, 50),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(pageData?.content || []);
      setUnreadCount(count ?? 0);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const handleUpdate = () => {
      notificationService.getUnreadCount().then((count) => setUnreadCount(count));
    };

    window.addEventListener('queueless:notifications-updated', handleUpdate);
    return () => {
      window.removeEventListener('queueless:notifications-updated', handleUpdate);
    };
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    if (actionLoadingId === id) return;
    setActionLoadingId(id);

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await notificationService.markAsRead(id);
      window.dispatchEvent(new CustomEvent('queueless:notifications-updated'));
    } catch (err) {
      console.warn('Failed to mark notification read on backend:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const markAllAsRead = async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
    );
    setUnreadCount(0);

    try {
      await notificationService.markAllAsRead();
      window.dispatchEvent(new CustomEvent('queueless:notifications-updated'));
    } catch (err) {
      console.warn('Failed to mark all notifications as read:', err);
      // Re-fetch on error to ensure sync
      fetchNotifications();
    } finally {
      setMarkingAll(false);
    }
  };

  const deleteNotification = async (id: string) => {
    if (actionLoadingId === id) return;
    setActionLoadingId(id);

    const target = notifications.find((n) => n.id === id);
    const wasUnread = target && !target.read;

    // Optimistic update
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await notificationService.deleteNotification(id);
      window.dispatchEvent(new CustomEvent('queueless:notifications-updated'));
    } catch (err) {
      console.warn('Failed to delete notification:', err);
      fetchNotifications();
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'UNREAD') return !item.read;
    if (filter === 'ORDERS') {
      return (
        item.type.startsWith('ORDER_') ||
        item.relatedOrderId !== undefined
      );
    }
    if (filter === 'SLOTS') {
      return item.type.startsWith('PICKUP_SLOT_');
    }
    return true;
  });

  return {
    notifications: filteredNotifications,
    rawCount: notifications.length,
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
    refresh: fetchNotifications,
  };
};
