import React from 'react';
import { Calendar, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import type { TimeSlotOption } from '../../../types/slot.types';
import { formatDayChip } from './useCheckout';

interface PickupSlotSelectorProps {
  dates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  slots: TimeSlotOption[];
  selectedSlot: TimeSlotOption | null;
  onSelectSlot: (slot: TimeSlotOption) => void;
  shopOpeningTime?: string;
  shopClosingTime?: string;
}

export const PickupSlotSelector: React.FC<PickupSlotSelectorProps> = ({
  dates,
  selectedDate,
  onSelectDate,
  slots,
  selectedSlot,
  onSelectSlot,
  shopOpeningTime,
  shopClosingTime,
}) => {
  return (
    <div
      className="card"
      style={{
        padding: 24,
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 12,
          borderBottom: '1px solid var(--color-border-subtle)',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-subtle)',
              color: 'var(--color-primary-deep)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={18} />
          </div>
          <div>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: 'var(--color-primary-deep)',
                letterSpacing: 0.6,
                textTransform: 'uppercase',
              }}
            >
              PICKUP SCHEDULE
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
              Select Express Pickup Time
            </h3>
          </div>
        </div>

        {shopOpeningTime && shopClosingTime && (
          <div
            style={{
              fontSize: 12,
              color: 'var(--color-text-muted)',
              backgroundColor: 'var(--color-surface-subtle)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
            }}
          >
            Hours: {shopOpeningTime.slice(0, 5)} – {shopClosingTime.slice(0, 5)}
          </div>
        )}
      </div>

      {/* Date Picker Horizontal Chips */}
      <div>
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            color: 'var(--color-text-muted)',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Calendar size={14} color="var(--color-primary)" />
          <span>Select Date</span>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 4,
          }}
        >
          {dates.map((dateStr, index) => {
            const { dayLabel, dateLabel } = formatDayChip(dateStr, index);
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => onSelectDate(dateStr)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected
                    ? '2px solid var(--color-primary-deep)'
                    : '1px solid var(--color-border)',
                  backgroundColor: isSelected
                    ? 'var(--color-primary-deep)'
                    : 'var(--color-surface)',
                  color: isSelected ? '#FFFFFF' : 'var(--color-text-main)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 80,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 0.5,
                    opacity: isSelected ? 0.9 : 0.6,
                  }}
                >
                  {dayLabel}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    marginTop: 2,
                  }}
                >
                  {dateLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots Grid */}
      <div>
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            color: 'var(--color-text-muted)',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Clock size={14} color="var(--color-primary)" />
          <span>Available 30-Minute Windows</span>
        </div>

        {slots.length === 0 ? (
          <div
            style={{
              padding: 20,
              backgroundColor: 'var(--color-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: 13.5,
            }}
          >
            No pickup slots available for the selected date.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
              gap: 10,
            }}
          >
            {slots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;
              const isAvailable = slot.isAvailable;

              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => isAvailable && onSelectSlot(slot)}
                  disabled={!isAvailable}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected
                      ? '2px solid var(--color-primary)'
                      : '1px solid var(--color-border)',
                    backgroundColor: isSelected
                      ? 'var(--color-primary-subtle)'
                      : isAvailable
                      ? 'var(--color-surface)'
                      : 'var(--color-surface-subtle)',
                    color: isSelected
                      ? 'var(--color-primary-deep)'
                      : isAvailable
                      ? 'var(--color-text-main)'
                      : 'var(--color-text-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    transition: 'all var(--transition-fast)',
                    opacity: isAvailable ? 1 : 0.5,
                  }}
                >
                  <span style={{ fontSize: 12.5, fontWeight: isSelected ? 700 : 500 }}>
                    {slot.displayLabel}
                  </span>
                  {isSelected && <CheckCircle2 size={16} color="var(--color-primary)" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* QueueLess Zero-Wait Promise Banner */}
      <div
        style={{
          backgroundColor: 'var(--color-light-sage)',
          border: '1px solid var(--color-sage)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Sparkles size={20} color="var(--color-primary-deep)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: 12.5, color: 'var(--color-primary-deep)', lineHeight: 1.4 }}>
          <strong>Zero-Wait Counter Guarantee:</strong> Show your instant pickup pass QR code at the dedicated QueueLess counter to collect without waiting in lines.
        </div>
      </div>
    </div>
  );
};
