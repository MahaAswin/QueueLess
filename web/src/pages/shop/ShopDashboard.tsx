import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Clock, CheckCircle2, TrendingUp, QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { shopService } from '../../services/shopService';
import type { Order } from '../../types/order.types';
import type { Shop } from '../../types/shop.types';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/feedback/LoadingState';

export const ShopDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [myShops, setMyShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShopData() {
      try {
        const [ordersRes, shopsRes] = await Promise.all([
          orderService.getShopOrders(undefined, 0, 10),
          shopService.getMyShops(),
        ]);
        setOrders(ordersRes.content || []);
        setMyShops(shopsRes || []);
      } catch {
        // Soft fail
      } finally {
        setLoading(false);
      }
    }
    loadShopData();
  }, []);

  const pendingOrders = orders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED');
  const readyOrders = orders.filter((o) => o.status === 'READY_FOR_PICKUP');

  return (
    <div>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 28,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
            Shop Partner Dashboard
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
            Overview for {myShops[0]?.name || user?.fullName || 'My Store'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/shop/qr-pickup">
            <Button variant="secondary" size="md" icon={<QrCode size={17} />}>
              Scan Customer QR
            </Button>
          </Link>
          <Link to="/shop/products">
            <Button variant="primary" size="md">
              Manage Products
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        <StatCard
          label="Pending / Prep"
          value={pendingOrders.length}
          icon={<Clock size={22} />}
        />
        <StatCard
          label="Ready For Pickup"
          value={readyOrders.length}
          icon={<CheckCircle2 size={22} />}
        />
        <StatCard
          label="Total Orders"
          value={orders.length}
          icon={<ShoppingBag size={22} />}
        />
        <StatCard
          label="Express Counter"
          value="Online"
          icon={<TrendingUp size={22} />}
        />
      </div>

      {/* Live Orders Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Recent Orders</h3>
          <Link to="/shop/orders" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-primary)' }}>
            View All Orders →
          </Link>
        </div>

        {loading ? (
          <LoadingState message="Loading store orders..." />
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--color-text-muted)' }}>
            No customer orders received yet today.
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600, color: 'var(--color-primary-deep)' }}>
                      #{order.id.slice(0, 8)}
                    </td>
                    <td>{order.customerName || 'Customer'}</td>
                    <td>{order.items?.length || 0} item(s)</td>
                    <td style={{ fontWeight: 600 }}>₹{order.totalAmount.toFixed(2)}</td>
                    <td>
                      <Badge
                        variant={
                          order.status === 'READY_FOR_PICKUP'
                            ? 'success'
                            : order.status === 'PENDING'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td style={{ color: 'var(--color-text-light)', fontSize: 13 }}>
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
