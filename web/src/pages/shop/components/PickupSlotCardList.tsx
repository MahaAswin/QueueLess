import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Check, X, MessageSquare, ExternalLink, Calendar, KeyRound } from 'lucide-react';
import { formatOrderId, formatTimeLabel, formatDateShort } from '../../../utils/formatters';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import {
  SLOT_STATUS_META,
  type PickupSlotResponse,
} from '../../../types/slot.types';

interface PickupSlotCardListProps {
  slots: PickupSlotResponse[];
  actionLoadingId: string | null;
  onAccept: (slotId: string) => Promise<boolean>;
  onReject: (slotId: string) => Promise<boolean>;
  onOpenCounter: (slot: PickupSlotResponse) => void;
}

export const PickupSlotCardList: React.FC<PickupSlotCardListProps> = ({
  slots,
  actionLoadingId,
  onAccept,
  onReject,
  onOpenCounter,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}
    >
      {slots.map((slot) => {
        const id = slot.id || slot.slotId || '';
        const isProcessing = actionLoadingId === id;
        const dateStr = slot.finalPickupDate || slot.proposedDate || slot.pickupDate;
        const start = slot.finalStartTime || slot.proposedStartTime || slot.requestedStartTime;
        const end = slot.finalEndTime || slot.proposedEndTime || slot.requestedEndTime;
        const statusMeta = SLOT_STATUS_META[slot.status] || {
          label: slot.status,
          variant: 'neutral' as const,
          description: '',
        };

        const isPendingReview = slot.status === 'REQUESTED';
        const isConfirmed =
          slot.status === 'ACCEPTED' || slot.status === 'CUSTOMER_ACCEPTED';

        return (
          <div
            key={id || slot.orderId}
            className="card"
            style={{
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {/* Top row: Order ID and Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link
                to={`/shop-owner/orders/${slot.orderId}`}
                style={{
                  fontFamily: 'var(--mono)',
                  fontWeight: 700,
                  fontSize: 14,
                  color: 'var(--color-primary-deep)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                #{formatOrderId(slot.orderId)}
                <ExternalLink size={12} color="var(--color-text-light)" />
              </Link>

              <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
            </div>

            {/* Date & Time info box */}
            <div
              style={{
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                <Calendar size={14} color="var(--color-text-light)" />
                <span>{dateStr ? formatDateShort(dateStr) : 'Today'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--color-primary-deep)' }}>
                <Clock size={14} color="var(--color-primary)" />
                <span>
                  {start && end
                    ? `${formatTimeLabel(start)} – ${formatTimeLabel(end)}`
                    : 'Standard Pickup'}
                </span>
              </div>
            </div>

            {/* Actions */}
            {isPendingReview ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 6,
                  marginTop: 'auto',
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: 10,
                }}
              >
                <Button
                  size="sm"
                  variant="primary"
                  disabled={isProcessing}
                  onClick={() => onAccept(id)}
                  icon={<Check size={13} />}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isProcessing}
                  onClick={() => onOpenCounter(slot)}
                  icon={<MessageSquare size={13} />}
                >
                  Counter
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={isProcessing}
                  onClick={() => onReject(id)}
                  icon={<X size={13} />}
                >
                  Decline
                </Button>
              </div>
            ) : isConfirmed ? (
              <div style={{ marginTop: 'auto', borderTop: '1px solid var(--color-border)', paddingTop: 10 }}>
                <Link to="/shop-owner/pickup-verification" style={{ display: 'block' }}>
                  <Button size="sm" variant="outline" icon={<KeyRound size={14} />} style={{ width: '100%' }}>
                    Verify Pickup OTP
                  </Button>
                </Link>
              </div>
            ) : slot.status === 'COUNTER_PROPOSED' ? (
              <div style={{ marginTop: 'auto', borderTop: '1px solid var(--color-border)', paddingTop: 10, textAlign: 'center' }}>
                <span style={{ fontSize: 12, color: '#D97706', fontWeight: 600 }}>
                  Awaiting customer confirmation
                </span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
