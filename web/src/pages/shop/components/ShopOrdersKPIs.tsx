import React from 'react';
import { Clock, ChefHat, CheckCircle2, ShoppingBag } from 'lucide-react';
import { MetricCard } from './MetricCard';

interface ShopOrdersKPIsProps {
  counts: {
    pending: number;
    preparing: number;
    ready: number;
    total: number;
  };
  loading?: boolean;
}

export const ShopOrdersKPIs: React.FC<ShopOrdersKPIsProps> = ({ counts, loading = false }) => {
  return (
    <div className="grid-4" style={{ marginBottom: 24 }}>
      <MetricCard
        label="Pending Acceptance"
        value={counts.pending}
        subtext={counts.pending > 0 ? 'Requires immediate action' : 'All incoming handled'}
        icon={<Clock size={22} />}
        variant={counts.pending > 0 ? 'warning' : 'neutral'}
        loading={loading}
      />
      <MetricCard
        label="In Preparation"
        value={counts.preparing}
        subtext="Being packed for pickup"
        icon={<ChefHat size={22} />}
        variant="info"
        loading={loading}
      />
      <MetricCard
        label="Ready at Counter"
        value={counts.ready}
        subtext="Awaiting customer QR scan"
        icon={<CheckCircle2 size={22} />}
        variant={counts.ready > 0 ? 'success' : 'neutral'}
        loading={loading}
      />
      <MetricCard
        label="Total Orders"
        value={counts.total}
        subtext="Filtered orders"
        icon={<ShoppingBag size={22} />}
        variant="primary"
        loading={loading}
      />
    </div>
  );
};
