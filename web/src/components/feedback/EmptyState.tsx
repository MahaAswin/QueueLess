import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  message = 'There is currently no data to display here.',
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '56px 20px',
        textAlign: 'center',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--color-border)',
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-sage)',
          color: 'var(--color-primary-deep)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        {icon || <PackageOpen size={26} />}
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{title}</h3>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, maxWidth: 360, marginBottom: actionText ? 20 : 0 }}>
        {message}
      </p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
