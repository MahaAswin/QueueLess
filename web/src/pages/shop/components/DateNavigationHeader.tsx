import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { formatDateLong } from '../../../utils/formatters';
import type { PickupDateFilter } from '../../../types/slot.types';

interface DateNavigationHeaderProps {
  selectedDate: string;
  dateFilterMode: PickupDateFilter;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onTomorrow: () => void;
  onCustomDate: (date: string) => void;
  onAllDates: () => void;
  operatingHours?: {
    openingTime?: string;
    closingTime?: string;
  };
}

export const DateNavigationHeader: React.FC<DateNavigationHeaderProps> = ({
  selectedDate,
  dateFilterMode,
  onPreviousDay,
  onNextDay,
  onToday,
  onTomorrow,
  onCustomDate,
  onAllDates,
  operatingHours,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr && dateFilterMode !== 'ALL_DATES';

  return (
    <div
      className="card"
      style={{
        padding: '16px 20px',
        marginBottom: 20,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      {/* Date Title & Operating Hours */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
            flexShrink: 0,
          }}
        >
          <CalendarIcon size={22} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
              {dateFilterMode === 'ALL_DATES' ? 'All Scheduled Dates' : formatDateLong(selectedDate)}
            </h2>
            {isToday && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                }}
              >
                Today
              </span>
            )}
          </div>

          {operatingHours?.openingTime && operatingHours?.closingTime && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12,
                color: 'var(--color-text-muted)',
                marginTop: 2,
              }}
            >
              <Clock size={12} />
              <span>
                Operating Hours: {operatingHours.openingTime.slice(0, 5)} – {operatingHours.closingTime.slice(0, 5)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Date Navigation Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {/* Previous Day */}
        <button
          onClick={onPreviousDay}
          className="btn btn-outline btn-sm"
          style={{ height: 36, padding: '0 10px', display: 'flex', alignItems: 'center' }}
          title="Previous Day"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Quick Date Buttons */}
        <button
          onClick={onToday}
          className={`btn btn-sm ${isToday ? 'btn-primary' : 'btn-outline'}`}
          style={{ height: 36 }}
        >
          Today
        </button>

        <button
          onClick={onTomorrow}
          className={`btn btn-sm ${
            dateFilterMode === 'TOMORROW' ? 'btn-primary' : 'btn-outline'
          }`}
          style={{ height: 36 }}
        >
          Tomorrow
        </button>

        {/* Next Day */}
        <button
          onClick={onNextDay}
          className="btn btn-outline btn-sm"
          style={{ height: 36, padding: '0 10px', display: 'flex', alignItems: 'center' }}
          title="Next Day"
        >
          <ChevronRight size={16} />
        </button>

        {/* Date Picker Input */}
        <div style={{ position: 'relative' }}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) {
                onCustomDate(e.target.value);
              }
            }}
            className="form-input"
            style={{
              height: 36,
              padding: '0 10px',
              fontSize: 13,
              fontWeight: 500,
              width: 'auto',
            }}
          />
        </div>

        {/* All Dates Toggle */}
        <button
          onClick={onAllDates}
          className={`btn btn-sm ${
            dateFilterMode === 'ALL_DATES' ? 'btn-primary' : 'btn-outline'
          }`}
          style={{ height: 36 }}
        >
          All Dates
        </button>
      </div>
    </div>
  );
};
