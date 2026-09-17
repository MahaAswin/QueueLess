import { apiClient } from '../api/axiosClient';
import type {
  AdminSystemSettingsResponse,
  UpdateSystemSettingsRequest,
} from '../types/settings.types';

export const adminSettingsService = {
  /**
   * Fetch current system settings and platform governance specifications.
   * Endpoint: GET /api/admin/settings
   */
  async getSettings(): Promise<AdminSystemSettingsResponse> {
    const response = await apiClient.get<AdminSystemSettingsResponse>('/api/admin/settings');
    return response.data;
  },

  /**
   * Update runtime operational system settings.
   * Endpoint: PUT /api/admin/settings
   */
  async updateSettings(
    request: UpdateSystemSettingsRequest
  ): Promise<AdminSystemSettingsResponse> {
    const response = await apiClient.put<AdminSystemSettingsResponse>(
      '/api/admin/settings',
      request
    );
    return response.data;
  },
};
