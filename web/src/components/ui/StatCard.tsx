import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  className = '',
}) => {
  return (
    <div className={`stat-card ${className}`}>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {trend && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              marginTop: 6,
              color: trend.isPositive ? 'var(--color-success)' : 'var(--color-error)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>{trend.isPositive ? '↑' : '↓'} {trend.value}</span>
            <span style={{ color: 'var(--color-text-light)', fontWeight: 400 }}>vs last week</span>
          </div>
        )}
      </div>
      <div className="stat-icon-wrapper">{icon}</div>
    </div>
  );
};
