import React, { useState, useEffect } from 'react';
import { X, Clock, MessageSquare, AlertCircle, Check } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { formatOrderId, formatTimeLabel } from '../../../utils/formatters';
import type { PickupSlotResponse, CounterProposalRequest } from '../../../types/slot.types';
import type { Shop } from '../../../types/shop.types';

interface CounterProposalModalProps {
  slot: PickupSlotResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (slotId: string, payload: CounterProposalRequest) => Promise<boolean>;
  shop?: Shop | null;
  loading?: boolean;
}

export const CounterProposalModal: React.FC<CounterProposalModalProps> = ({
  slot,
  isOpen,
  onClose,
  onSubmit,
  shop,
  loading = false,
}) => {
  const [pickupDate, setPickupDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slot) {
      const defaultDate =
        slot.pickupDate || new Date().toISOString().split('T')[0];
      setPickupDate(defaultDate);

      // Default to requested times or shop opening hours
      const reqStart = slot.requestedStartTime ? slot.requestedStartTime.slice(0, 5) : '10:00';
      const reqEnd = slot.requestedEndTime ? slot.requestedEndTime.slice(0, 5) : '10:30';
      setStartTime(reqStart);
      setEndTime(reqEnd);
      setError(null);
    }
  }, [slot, isOpen]);

  if (!isOpen || !slot) return null;

  const validate = () => {
    if (!pickupDate) {
      setError('Please select a pickup date.');
      return false;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (pickupDate < todayStr) {
      setError('Pickup date cannot be in the past.');
      return false;
    }

    if (!startTime || !endTime) {
      setError('Please provide both start and end times.');
      return false;
    }

    if (startTime >= endTime) {
      setError('Start time must be before end time.');
      return false;
    }

    // Check operating hours if available
    if (shop?.openingTime && shop?.closingTime) {
      const open = shop.openingTime.slice(0, 5);
      const close = shop.closingTime.slice(0, 5);
      if (startTime < open || endTime > close) {
        setError(`Pickup time must be within shop operating hours: ${open} – ${close}`);
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const slotId = slot.id || slot.slotId;
    if (!slotId) return;

    // Format with seconds if required by backend LocalTime
    const formattedStartTime = startTime.length === 5 ? `${startTime}:00` : startTime;
    const formattedEndTime = endTime.length === 5 ? `${endTime}:00` : endTime;

    const payload: CounterProposalRequest = {
      pickupDate,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
    };

    const success = await onSubmit(slotId, payload);
    if (success) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="card"
        style={{
          width: 480,
          maxWidth: '100%',
          boxShadow: 'var(--shadow-xl)',
          padding: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-info-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-info)',
              }}
            >
              <MessageSquare size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
                Counter-Propose Slot
              </h2>
              <p style={{ fontSize: 12, color: 'var(--color-text-light)', margin: '2px 0 0 0' }}>
                Order #{formatOrderId(slot.orderId)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-light)',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Customer Request Details */}
        <div
          style={{
            padding: '14px 24px',
            backgroundColor: 'var(--color-surface-subtle)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>
            Customer's Requested Slot:
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-main)' }}>
            {slot.pickupDate} • {formatTimeLabel(slot.requestedStartTime)} – {formatTimeLabel(slot.requestedEndTime)}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-error-bg)',
                border: '1px solid var(--color-error-border)',
                color: 'var(--color-error)',
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              <AlertCircle size={16} flex-shrink="0" />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* New Pickup Date */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
                Proposed Pickup Date
              </label>
              <input
                type="date"
                required
                value={pickupDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setPickupDate(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Proposed Time Window (2 Columns) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
                  Start Time
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
                  End Time
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {shop?.openingTime && shop?.closingTime && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  color: 'var(--color-text-light)',
                  marginTop: 2,
                }}
              >
                <Clock size={13} />
                <span>
                  Store hours: {shop.openingTime.slice(0, 5)} – {shop.closingTime.slice(0, 5)}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              marginTop: 24,
              borderTop: '1px solid var(--color-border)',
              paddingTop: 16,
            }}
          >
            <Button variant="outline" size="md" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={loading}
              icon={loading ? undefined : <Check size={16} />}
            >
              {loading ? 'Submitting...' : 'Send Counter-Proposal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
