import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  PackageCheck,
  TrendingUp,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import type { CustomerExpenseSummary } from '../../../types/order.types';
import { Button } from '../../../components/ui/Button';

interface ExpenseSummarySectionProps {
  summary: CustomerExpenseSummary | null;
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const ExpenseSummarySection: React.FC<ExpenseSummarySectionProps> = ({
  summary,
  loading,
  error,
  onRetry,
}) => {
  const formatCurrency = (val?: number) => {
    const num = Number(val || 0);
    return `₹${num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <section aria-labelledby="expense-summary-heading" style={{ marginBottom: 28 }}>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h2
            id="expense-summary-heading"
            style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}
          >
            My Spending
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2, marginBottom: 0 }}>
            Your QueueLess purchase summary & verified pickup insights
          </p>
        </div>

        {error && onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            icon={<RefreshCw size={13} />}
          >
            Retry
          </Button>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid-3">
          {[1, 2, 3].map((key) => (
            <div
              key={key}
              className="card skeleton"
              style={{
                height: 110,
                borderRadius: 'var(--radius-lg)',
              }}
            />
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div
          className="card"
          style={{
            padding: '20px 24px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            border: '1px solid var(--color-error-border, #FECACA)',
            backgroundColor: 'var(--color-error-bg, #FEF2F2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertCircle size={20} color="var(--color-error, #DC2626)" />
            <span style={{ fontSize: 13.5, color: 'var(--color-text-main)', fontWeight: 500 }}>
              {error}
            </span>
          </div>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try Again
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* 3-Column Summary Cards */}
          <div className="grid-3">
            {/* Primary Highlight: Total Spent */}
            <div
              className="card"
              style={{
                padding: '20px 22px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderLeft: '4px solid var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--color-text-light)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                  }}
                >
                  Total Spent
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: 'var(--color-primary-deep)',
                    fontFamily: 'var(--font-heading)',
                    marginTop: 4,
                    lineHeight: 1.2,
                  }}
                >
                  {formatCurrency(summary?.totalSpent)}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: 'var(--color-text-muted)',
                    marginTop: 3,
                  }}
                >
                  Lifetime valid purchases
                </div>
              </div>

              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Wallet size={24} />
              </div>
            </div>

            {/* Completed Orders */}
            <div
              className="card"
              style={{
                padding: '20px 22px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--color-text-light)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                  }}
                >
                  Completed Orders
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: 'var(--color-text-main)',
                    fontFamily: 'var(--font-heading)',
                    marginTop: 4,
                    lineHeight: 1.2,
                  }}
                >
                  {summary?.completedOrders ?? 0}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: 'var(--color-text-muted)',
                    marginTop: 3,
                  }}
                >
                  {summary?.activeOrders && summary.activeOrders > 0
                    ? `${summary.activeOrders} active in progress`
                    : 'Picked up & verified'}
                </div>
              </div>

              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#E0F2FE',
                  color: '#0369A1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <PackageCheck size={24} />
              </div>
            </div>

            {/* Average Order Value */}
            <div
              className="card"
              style={{
                padding: '20px 22px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--color-text-light)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                  }}
                >
                  Average Order Value
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: 'var(--color-text-main)',
                    fontFamily: 'var(--font-heading)',
                    marginTop: 4,
                    lineHeight: 1.2,
                  }}
                >
                  {formatCurrency(summary?.averageOrderValue)}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: 'var(--color-text-muted)',
                    marginTop: 3,
                  }}
                >
                  Per valid order
                </div>
              </div>

              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#FEF3C7',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <TrendingUp size={24} />
              </div>
            </div>
          </div>

          {/* New / Zero-Orders Customer Banner */}
          {summary && summary.completedOrders === 0 && (
            <div
              style={{
                marginTop: 12,
                padding: '12px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShoppingBag size={16} color="var(--color-primary)" />
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  Start ordering to see your spending summary.
                </span>
              </div>
              <Link
                to="/customer/shops"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                }}
              >
                <span>Explore Shops</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  );
};
