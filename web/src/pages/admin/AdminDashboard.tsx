import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Store, ShoppingBag, AlertCircle, Check } from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { AdminDashboardSummary } from '../../types/admin.types';
import type { Shop } from '../../types/shop.types';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/feedback/LoadingState';

export const AdminDashboard: React.FC = () => {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [pendingShops, setPendingShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [summaryData, pendingData] = await Promise.all([
          adminService.getDashboardSummary(),
          adminService.getPendingShops(0, 5),
        ]);
        setSummary(summaryData);
        setPendingShops(pendingData.content || []);
      } catch {
        // Soft fail
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const handleActivateShop = async (shopId: string) => {
    try {
      await adminService.activateShop(shopId);
      setPendingShops((prev) => prev.filter((s) => s.id !== shopId));
    } catch {
      alert('Failed to activate shop.');
    }
  };

  return (
    <div>
      {/* Top Banner */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
          Administration Dashboard
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
          Global metrics, user governance, and shop approvals across the QueueLess network.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        <StatCard
          label="Total Registered Users"
          value={summary?.totalUsers ?? '—'}
          icon={<Users size={22} />}
        />
        <StatCard
          label="Active Partner Shops"
          value={summary?.activeShops ?? '—'}
          icon={<Store size={22} />}
        />
        <StatCard
          label="Total Completed Orders"
          value={summary?.completedOrders ?? '—'}
          icon={<ShoppingBag size={22} />}
        />
        <StatCard
          label="Pending Approvals"
          value={summary?.pendingShops ?? pendingShops.length}
          icon={<AlertCircle size={22} />}
        />
      </div>

      {/* Pending Shop Approvals Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Pending Shop Approvals</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>New shop registrations requiring admin review</p>
          </div>
          <Link to="/admin/shops" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-primary)' }}>
            Manage All Shops →
          </Link>
        </div>

        {loading ? (
          <LoadingState message="Loading governance metrics..." />
        ) : pendingShops.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--color-text-muted)' }}>
            No shops currently waiting for approval.
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Shop Name</th>
                  <th>Category</th>
                  <th>City</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingShops.map((shop) => (
                  <tr key={shop.id}>
                    <td style={{ fontWeight: 600 }}>{shop.name}</td>
                    <td><Badge variant="neutral">{shop.category}</Badge></td>
                    <td>{shop.city}</td>
                    <td>{shop.phone}</td>
                    <td><Badge variant="warning">{shop.status}</Badge></td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleActivateShop(shop.id)}
                        icon={<Check size={14} />}
                      >
                        Approve & Activate
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
