import { apiClient } from '../api/axiosClient';
import type { AdminReportsOverviewResponse } from '../types/reports.types';

export const adminReportsService = {
  /**
   * Fetch platform-wide aggregated analytics and report metrics for Admin.
   * Endpoint: GET /api/admin/reports/overview
   */
  async getReportsOverview(from?: string, to?: string): Promise<AdminReportsOverviewResponse> {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await apiClient.get<AdminReportsOverviewResponse>(
      '/api/admin/reports/overview',
      { params }
    );
    return response.data;
  },
};
