import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  variant?: 'primary' | 'warning' | 'success' | 'info' | 'neutral';
  loading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon,
  variant = 'primary',
  loading = false,
}) => {
  const getIconStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          backgroundColor: 'var(--color-warning-bg)',
          color: 'var(--color-warning)',
        };
      case 'success':
        return {
          backgroundColor: 'var(--color-success-bg)',
          color: 'var(--color-success)',
        };
      case 'info':
        return {
          backgroundColor: 'var(--color-info-bg)',
          color: 'var(--color-info)',
        };
      case 'neutral':
        return {
          backgroundColor: 'var(--color-surface-hover)',
          color: 'var(--color-text-muted)',
        };
      case 'primary':
      default:
        return {
          backgroundColor: 'var(--color-primary-subtle)',
          color: 'var(--color-primary)',
        };
    }
  };

  if (loading) {
    return (
      <div className="stat-card">
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 28, width: '40%', marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 10, width: '80%' }} />
        </div>
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)' }} />
      </div>
    );
  }

  return (
    <div className="stat-card interactive-card">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {subtext && (
          <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 4 }}>
            {subtext}
          </div>
        )}
      </div>
      <div className="stat-icon-wrapper" style={getIconStyles()}>
        {icon}
      </div>
    </div>
  );
};
