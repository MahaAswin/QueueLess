import React from 'react';
import { Link } from 'react-router-dom';
import { Check, X, ChefHat, CheckCircle2, KeyRound } from 'lucide-react';
import type { OrderStatus } from '../../../types/order.types';
import { Button } from '../../../components/ui/Button';

interface ShopOrderActionsProps {
  orderId?: string;
  status: OrderStatus;
  isLoading?: boolean;
  onConfirm: () => void;
  onReject: () => void;
  onStartPreparing: () => void;
  onMarkReady: () => void;
  size?: 'sm' | 'md';
}

export const ShopOrderActions: React.FC<ShopOrderActionsProps> = ({
  status,
  isLoading = false,
  onConfirm,
  onReject,
  onStartPreparing,
  onMarkReady,
  size = 'sm',
}) => {
  if (status === 'PENDING') {
    return (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <Button
          size={size}
          variant="primary"
          disabled={isLoading}
          onClick={(e) => {
            e.stopPropagation();
            onConfirm();
          }}
          icon={<Check size={14} />}
        >
          Accept
        </Button>
        <Button
          size={size}
          variant="danger"
          disabled={isLoading}
          onClick={(e) => {
            e.stopPropagation();
            onReject();
          }}
          icon={<X size={14} />}
        >
          Decline
        </Button>
      </div>
    );
  }

  if (status === 'CONFIRMED' || status === 'ACCEPTED') {
    return (
      <Button
        size={size}
        variant="secondary"
        disabled={isLoading}
        onClick={(e) => {
          e.stopPropagation();
          onStartPreparing();
        }}
        icon={<ChefHat size={14} />}
      >
        Start Prep
      </Button>
    );
  }

  if (status === 'PREPARING') {
    return (
      <Button
        size={size}
        variant="primary"
        disabled={isLoading}
        onClick={(e) => {
          e.stopPropagation();
          onMarkReady();
        }}
        icon={<CheckCircle2 size={14} />}
      >
        Mark Ready
      </Button>
    );
  }

  if (status === 'READY_FOR_PICKUP') {
    return (
      <Link
        to="/shop-owner/qr-pickup"
        onClick={(e) => e.stopPropagation()}
        style={{ textDecoration: 'none' }}
      >
        <Button size={size} variant="outline" icon={<KeyRound size={14} />}>
          Verify OTP
        </Button>
      </Link>
    );
  }

  return (
    <span style={{ fontSize: 12.5, color: 'var(--color-text-light)', fontWeight: 500 }}>
      {status === 'COLLECTED' || status === 'COMPLETED' ? 'Completed' : 'Closed'}
    </span>
  );
};
