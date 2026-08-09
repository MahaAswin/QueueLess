import { api } from './api';
import {
  NotificationPageResponse,
  NotificationResponse,
  UnreadCountResponse,
} from '../types';

export const NotificationService = {
  /**
   * Fetch paginated notifications for the authenticated user.
   * Endpoint: GET /api/notifications?page={page}&size={size}
   */
  async getUserNotifications(
    page: number = 0,
    size: number = 20
  ): Promise<NotificationPageResponse> {
    const response = await api.get<NotificationPageResponse>('/api/notifications', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Fetch unread notification count for the authenticated user.
   * Endpoint: GET /api/notifications/unread-count
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await api.get<UnreadCountResponse>(
      '/api/notifications/unread-count'
    );
    return response.data;
  },

  /**
   * Mark a single notification as read.
   * Endpoint: PATCH /api/notifications/{notificationId}/read
   */
  async markAsRead(notificationId: string): Promise<NotificationResponse> {
    const response = await api.patch<NotificationResponse>(
      `/api/notifications/${notificationId}/read`
    );
    return response.data;
  },

  /**
   * Mark all notifications as read for the authenticated user.
   * Endpoint: PATCH /api/notifications/read-all
   */
  async markAllAsRead(): Promise<{ message: string }> {
    const response = await api.patch<{ message: string }>(
      '/api/notifications/read-all'
    );
    return response.data;
  },

  /**
   * Delete a notification by ID.
   * Endpoint: DELETE /api/notifications/{notificationId}
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/api/notifications/${notificationId}`);
  },
};
