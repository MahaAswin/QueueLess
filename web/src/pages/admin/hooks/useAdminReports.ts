import { useState, useEffect, useCallback } from 'react';
import { adminReportsService } from '../../../services/adminReportsService';
import type {
  AdminReportsOverviewResponse,
  DateRangePreset,
} from '../../../types/reports.types';

export const useAdminReports = () => {
  const [preset, setPreset] = useState<DateRangePreset>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const [data, setData] = useState<AdminReportsOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateDateBounds = useCallback(
    (selectedPreset: DateRangePreset, fromInput?: string, toInput?: string) => {
      const today = new Date();
      const formatIso = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };

      if (selectedPreset === 'today') {
        const dStr = formatIso(today);
        return { from: dStr, to: dStr };
      }
      if (selectedPreset === '7d') {
        const past = new Date(today);
        past.setDate(past.getDate() - 6);
        return { from: formatIso(past), to: formatIso(today) };
      }
      if (selectedPreset === '30d') {
        const past = new Date(today);
        past.setDate(past.getDate() - 29);
        return { from: formatIso(past), to: formatIso(today) };
      }
      if (selectedPreset === '90d') {
        const past = new Date(today);
        past.setDate(past.getDate() - 89);
        return { from: formatIso(past), to: formatIso(today) };
      }
      if (selectedPreset === 'custom') {
        return { from: fromInput || undefined, to: toInput || undefined };
      }
      // 'all'
      return { from: undefined, to: undefined };
    },
    []
  );

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { from, to } = calculateDateBounds(preset, customFrom, customTo);
      const res = await adminReportsService.getReportsOverview(from, to);
      setData(res);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load platform analytics & report metrics.'
      );
    } finally {
      setLoading(false);
    }
  }, [preset, customFrom, customTo, calculateDateBounds]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const exportCSV = useCallback(() => {
    if (!data) return;

    const lines: string[] = [];

    // Section 1: Overview Summary
    lines.push('=== PLATFORM EXECUTIVE SUMMARY ===');
    lines.push('Metric,Value');
    lines.push(`Total Users,${data.overview.totalUsers}`);
    lines.push(`Total Customers,${data.overview.totalCustomers}`);
    lines.push(`Total Shop Owners,${data.overview.totalShopOwners}`);
    lines.push(`Total Shops,${data.overview.totalShops}`);
    lines.push(`Active Shops,${data.overview.activeShops}`);
    lines.push(`Pending Approval Shops,${data.overview.pendingShops}`);
    lines.push(`Suspended Shops,${data.overview.suspendedShops}`);
    lines.push(`Total Orders Placed,${data.overview.totalOrders}`);
    lines.push(`Completed (Collected) Orders,${data.overview.completedOrders}`);
    lines.push(`Cancelled Orders,${data.overview.cancelledOrders}`);
    lines.push(`Pending / Active Orders,${data.overview.pendingOrders}`);
    lines.push(`Total Order Value (INR),₹${data.overview.totalOrderValue.toFixed(2)}`);
    lines.push(`Collected Order Value (INR),₹${data.overview.collectedOrderValue.toFixed(2)}`);
    lines.push(`Average Order Value (INR),₹${data.overview.averageOrderValue.toFixed(2)}`);
    lines.push(`Total Complaints,${data.overview.totalComplaints}`);
    lines.push(`Pending Action Disputes,${data.overview.pendingComplaints}`);
    lines.push(`Resolved Disputes,${data.overview.resolvedComplaints}`);
    lines.push('');

    // Section 2: Order Status Distribution
    lines.push('=== ORDER STATUS BREAKDOWN ===');
    lines.push('Status,Order Count,Total Value (INR),Percentage');
    data.orderStatusDistribution.forEach((s) => {
      lines.push(
        `"${s.status}",${s.count},₹${s.totalValue.toFixed(2)},${s.percentage}%`
      );
    });
    lines.push('');

    // Section 3: Top Performing Shops
    lines.push('=== TOP PERFORMING SHOPS ===');
    lines.push(
      'Shop Name,Category,Status,Total Orders,Completed Orders,Cancelled Orders,Total Order Value (INR),Dispute Count'
    );
    data.topShops.forEach((shop) => {
      lines.push(
        `"${shop.shopName.replace(/"/g, '""')}","${shop.category}","${shop.status}",${shop.totalOrders},${shop.completedOrders},${shop.cancelledOrders},₹${shop.totalOrderValue.toFixed(2)},${shop.validComplaintCount}`
      );
    });
    lines.push('');

    // Section 4: Daily Trends
    lines.push('=== DAILY ORDER TIMELINE ===');
    lines.push('Date,Total Orders,Completed Orders,Cancelled Orders,Daily Order Value (INR)');
    data.ordersOverTime.forEach((pt) => {
      lines.push(
        `"${pt.date}",${pt.orderCount},${pt.completedCount},${pt.cancelledCount},₹${pt.orderValue.toFixed(2)}`
      );
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `queueless_admin_reports_${preset}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data, preset]);

  return {
    preset,
    setPreset,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    data,
    loading,
    error,
    refetch: fetchReports,
    exportCSV,
  };
};
