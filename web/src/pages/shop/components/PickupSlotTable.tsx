import React from 'react';
import { Link } from 'react-router-dom';
import { Check, X, MessageSquare, Clock, ExternalLink, QrCode } from 'lucide-react';
import { formatOrderId, formatTimeLabel, formatDateShort } from '../../../utils/formatters';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import {
  SLOT_STATUS_META,
  type PickupSlotResponse,
} from '../../../types/slot.types';

interface PickupSlotTableProps {
  slots: PickupSlotResponse[];
  actionLoadingId: string | null;
  onAccept: (slotId: string) => Promise<boolean>;
  onReject: (slotId: string) => Promise<boolean>;
  onOpenCounter: (slot: PickupSlotResponse) => void;
}

export const PickupSlotTable: React.FC<PickupSlotTableProps> = ({
  slots,
  actionLoadingId,
  onAccept,
  onReject,
  onOpenCounter,
}) => {
  return (
    <div className="data-table-container" style={{ marginBottom: 24 }}>
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '22%' }}>Order Reference</th>
            <th style={{ width: '18%' }}>Scheduled Date</th>
            <th style={{ width: '25%' }}>Time Window</th>
            <th style={{ width: '15%' }}>Slot Status</th>
            <th style={{ width: '20%', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
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
              <tr key={id || slot.orderId}>
                {/* Order ID & Link */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Link
                      to={`/shop-owner/orders/${slot.orderId}`}
                      style={{
                        fontFamily: 'var(--mono)',
                        fontWeight: 700,
                        fontSize: 13,
                        color: 'var(--color-primary-deep)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                      title="View Order Details"
                    >
                      #{formatOrderId(slot.orderId)}
                      <ExternalLink size={12} color="var(--color-text-light)" />
                    </Link>
                  </div>
                  {slot.customerName && (
                    <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 2 }}>
                      {slot.customerName}
                    </div>
                  )}
                </td>

                {/* Scheduled Date */}
                <td>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-main)' }}>
                    {dateStr ? formatDateShort(dateStr) : 'Today'}
                  </div>
                  {slot.proposedDate && slot.proposedDate !== slot.pickupDate && (
                    <div style={{ fontSize: 11, color: 'var(--color-info)', marginTop: 2 }}>
                      (Proposed from {formatDateShort(slot.pickupDate)})
                    </div>
                  )}
                </td>

                {/* Time Window */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={14} color="var(--color-text-light)" />
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-main)' }}>
                      {start && end
                        ? `${formatTimeLabel(start)} – ${formatTimeLabel(end)}`
                        : 'Standard Pickup'}
                    </span>
                  </div>
                  {slot.status === 'COUNTER_PROPOSED' && (
                    <div style={{ fontSize: 11, color: 'var(--color-info)', marginTop: 2 }}>
                      Proposed by you: {formatTimeLabel(slot.proposedStartTime || '')} –{' '}
                      {formatTimeLabel(slot.proposedEndTime || '')}
                    </div>
                  )}
                </td>

                {/* Status Badge */}
                <td>
                  <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                </td>

                {/* Action Buttons */}
                <td style={{ textAlign: 'right' }}>
                  {isPendingReview ? (
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={isProcessing}
                        onClick={() => onAccept(id)}
                        icon={<Check size={14} />}
                        title="Accept Requested Slot"
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isProcessing}
                        onClick={() => onOpenCounter(slot)}
                        icon={<MessageSquare size={14} />}
                        title="Propose Alternative Time"
                      >
                        Counter
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={isProcessing}
                        onClick={() => onReject(id)}
                        icon={<X size={14} />}
                        title="Decline Slot Request"
                      >
                        Decline
                      </Button>
                    </div>
                  ) : isConfirmed ? (
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Link to="/shop-owner/qr-pickup">
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<QrCode size={13} />}
                        >
                          Verify QR
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>
                      No actions needed
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
