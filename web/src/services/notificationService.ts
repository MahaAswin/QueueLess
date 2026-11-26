import { apiClient } from '../api/axiosClient';
import type {
  NotificationItem,
  NotificationPageResponse,
  UnreadCountResponse,
} from '../types/notification.types';

export const notificationService = {
  async getUserNotifications(page = 0, size = 20): Promise<NotificationPageResponse> {
    const response = await apiClient.get<NotificationPageResponse>('/api/notifications', {
      params: { page, size },
    });
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<UnreadCountResponse>('/api/notifications/unread-count');
      return response.data?.unreadCount ?? 0;
    } catch {
      return 0;
    }
  },

  async markAsRead(notificationId: string): Promise<NotificationItem> {
    const response = await apiClient.patch<NotificationItem>(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/api/notifications/read-all');
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(`/api/notifications/${notificationId}`);
  },

  async clearAllNotifications(notificationIds: string[] = []): Promise<void> {
    try {
      await apiClient.delete('/api/notifications');
    } catch {
      // Robust cloud fallback: if backend is still deploying, delete sequentially in parallel
      if (notificationIds.length > 0) {
        await Promise.allSettled(notificationIds.map((id) => this.deleteNotification(id)));
      }
    }
  },
};
