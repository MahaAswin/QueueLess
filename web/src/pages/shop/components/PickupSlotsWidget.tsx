import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import type { PickupSlotResponse } from '../../../types/slot.types';
import { formatTimeLabel, formatDateShort } from '../../../utils/formatters';
import { Badge } from '../../../components/ui/Badge';

interface PickupSlotsWidgetProps {
  slots: PickupSlotResponse[];
  loading?: boolean;
}

export const PickupSlotsWidget: React.FC<PickupSlotsWidgetProps> = ({
  slots,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="card" style={{ height: '100%' }}>
        <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="skeleton" style={{ height: 48 }} />
          <div className="skeleton" style={{ height: 48 }} />
        </div>
      </div>
    );
  }

  const pendingCount = slots.filter((s) => s.status === 'REQUESTED').length;
  const recentSlots = slots.slice(0, 4);

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Pickup Schedule</h3>
          {pendingCount > 0 && (
            <Badge variant="warning">{pendingCount} Action Req.</Badge>
          )}
        </div>
        <Link
          to="/shop-owner/pickup-slots"
          style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-primary)' }}
        >
          View Slots →
        </Link>
      </div>

      {recentSlots.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 12px',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontSize: 13,
          }}
        >
          <Calendar size={28} color="var(--color-text-light)" style={{ marginBottom: 8 }} />
          <span>No pickup slots scheduled yet.</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {recentSlots.map((slot, index) => {
            const dateStr = slot.pickupDate || slot.finalPickupDate || '';
            const startTime = slot.finalStartTime || slot.requestedStartTime || '';
            const endTime = slot.finalEndTime || slot.requestedEndTime || '';
            const timeFormatted =
              startTime && endTime
                ? `${formatTimeLabel(startTime)} – ${formatTimeLabel(endTime)}`
                : 'Time TBD';

            const isPending = slot.status === 'REQUESTED';
            const isConfirmed =
              slot.status === 'ACCEPTED' || slot.status === 'CUSTOMER_ACCEPTED';

            return (
              <div
                key={slot.id || slot.slotId || index}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isPending ? 'var(--color-warning-bg)' : 'var(--color-surface-subtle)',
                  border: `1px solid ${isPending ? 'var(--color-warning-border)' : 'var(--color-border)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-main)' }}>
                    {dateStr ? formatDateShort(dateStr) : 'Today'} • {timeFormatted}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    Order #{slot.orderId ? slot.orderId.slice(0, 8) : 'N/A'}
                  </div>
                </div>

                <Badge
                  variant={
                    isConfirmed
                      ? 'success'
                      : isPending
                      ? 'warning'
                      : slot.status === 'COUNTER_PROPOSED'
                      ? 'info'
                      : 'neutral'
                  }
                >
                  {slot.status}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
