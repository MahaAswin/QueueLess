import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../../services/adminService';
import type {
  AdminDashboardSummary,
  AdminShop,
  AdminRecentOrder,
  AdminRecentComplaint,
} from '../../../types/admin.types';

export const useAdminDashboard = () => {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [pendingShops, setPendingShops] = useState<AdminShop[]>([]);
  const [recentOrders, setRecentOrders] = useState<AdminRecentOrder[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<AdminRecentComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, pendingRes, ordersRes, complaintsRes] = await Promise.allSettled([
        adminService.getDashboardSummary(),
        adminService.getPendingShops(0, 5),
        adminService.getRecentOrders(0, 6),
        adminService.getRecentComplaints(0, 5),
      ]);

      if (summaryRes.status === 'fulfilled') {
        setSummary(summaryRes.value);
      }
      if (pendingRes.status === 'fulfilled') {
        setPendingShops(pendingRes.value.content || []);
      }
      if (ordersRes.status === 'fulfilled') {
        setRecentOrders(ordersRes.value.content || []);
      }
      if (complaintsRes.status === 'fulfilled') {
        setRecentComplaints(complaintsRes.value.content || []);
      }

      // If summary failed, set error
      if (summaryRes.status === 'rejected') {
        setError(
          summaryRes.reason?.response?.data?.message ||
            summaryRes.reason?.message ||
            'Failed to load admin dashboard summary.'
        );
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || 'Failed to load admin dashboard.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Activate pending shop action
  const handleActivateShop = async (shopId: string): Promise<boolean> => {
    setActionLoadingId(shopId);
    try {
      await adminService.activateShop(shopId);
      setPendingShops((prev) => prev.filter((s) => s.id !== shopId));
      if (summary) {
        setSummary({
          ...summary,
          shops: {
            ...summary.shops,
            pendingShops: Math.max(0, summary.shops.pendingShops - 1),
            activeShops: summary.shops.activeShops + 1,
          },
        });
      }
      return true;
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to activate shop.');
      return false;
    } finally {
      setActionLoadingId(null);
    }
  };

  return {
    summary,
    pendingShops,
    recentOrders,
    recentComplaints,
    loading,
    error,
    actionLoadingId,
    handleActivateShop,
    refetch: fetchDashboardData,
  };
};
