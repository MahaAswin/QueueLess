import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, ShoppingBag, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { shopService } from '../../services/shopService';
import type { Shop } from '../../types/shop.types';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Badge } from '../../components/ui/Badge';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShops() {
      try {
        const data = await shopService.getActiveShops();
        setShops(data || []);
      } catch {
        // Soft fail
      } finally {
        setLoading(false);
      }
    }
    loadShops();
  }, []);

  return (
    <div>
      {/* Welcome Hero Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-light-sage) 100%)',
          borderColor: 'var(--color-sage)',
          padding: '32px 36px',
          marginBottom: 32,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', backgroundColor: 'var(--color-primary-subtle)', borderRadius: 'var(--radius-full)', color: 'var(--color-primary-deep)', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
            <Sparkles size={14} />
            <span>ZERO-WAIT EXPRESS PICKUP</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: 'var(--color-text-main)' }}>
            Welcome back, {user?.fullName || 'Customer'}!
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 15, maxWidth: 540 }}>
            Browse partner shops nearby, customize your orders in advance, and collect with zero waiting in line.
          </p>
        </div>

        <Link to="/customer/shops">
          <Button variant="primary" size="lg" icon={<ArrowRight size={18} />}>
            Explore All Shops
          </Button>
        </Link>
      </div>

      {/* Quick Metrics */}
      <div className="grid-3" style={{ marginBottom: 36 }}>
        <StatCard
          label="Partner Shops"
          value={shops.length}
          icon={<Store size={24} />}
        />
        <StatCard
          label="Express Pickups"
          value="100% Zero Wait"
          icon={<Clock size={24} />}
        />
        <StatCard
          label="Active Basket"
          value="Ready to Order"
          icon={<ShoppingBag size={24} />}
        />
      </div>

      {/* Featured Shops Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Featured Partner Shops</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5 }}>Top local outlets accepting express pickup slots</p>
          </div>
          <Link to="/customer/shops" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-primary)' }}>
            View All →
          </Link>
        </div>

        {loading ? (
          <LoadingState message="Loading available shops..." />
        ) : shops.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
            No partner shops found in your local area currently.
          </div>
        ) : (
          <div className="grid-3">
            {shops.slice(0, 6).map((shop) => (
              <div key={shop.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-deep)' }}>
                      <Store size={22} />
                    </div>
                    <Badge variant="neutral">{shop.category}</Badge>
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{shop.name}</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 16 }}>
                    {shop.description || `${shop.address}, ${shop.city}`}
                  </p>
                </div>
                <div style={{ paddingTop: 14, borderTop: '1px solid var(--color-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>{shop.city}</span>
                  <Link to={`/customer/shops`}>
                    <Button variant="outline" size="sm">Browse Items</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
