import React from 'react';
import { Clock, Activity, AlertCircle } from 'lucide-react';
import {
  SHOP_STATUS_META,
  type ShopStatus,
} from '../../../types/shop.types';

interface OperatingHoursCardProps {
  openingTime: string;
  onOpeningTimeChange: (val: string) => void;
  closingTime: string;
  onClosingTimeChange: (val: string) => void;
  status: ShopStatus;
  onStatusChange: (status: ShopStatus) => void;
  disabled?: boolean;
}

export const OperatingHoursCard: React.FC<OperatingHoursCardProps> = ({
  openingTime,
  onOpeningTimeChange,
  closingTime,
  onClosingTimeChange,
  status,
  onStatusChange,
  disabled = false,
}) => {
  const isTimeInvalid = openingTime && closingTime && openingTime >= closingTime;
  const currentStatusMeta = SHOP_STATUS_META[status] || {
    label: status,
    variant: 'neutral' as const,
    description: '',
  };

  return (
    <div className="card" style={{ marginBottom: 24, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
          }}
        >
          <Clock size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
            Operating Hours & Store Status
          </h3>
          <p style={{ fontSize: 12, color: 'var(--color-text-light)', margin: '2px 0 0 0' }}>
            Set daily operational pickup schedules and outlet availability
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Operating Hours (2 Columns) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} color="var(--color-text-light)" />
              Opening Time <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              type="time"
              required
              disabled={disabled}
              value={openingTime}
              onChange={(e) => onOpeningTimeChange(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} color="var(--color-text-light)" />
              Closing Time <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              type="time"
              required
              disabled={disabled}
              value={closingTime}
              onChange={(e) => onClosingTimeChange(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        {isTimeInvalid && (
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
            }}
          >
            <AlertCircle size={16} flex-shrink="0" />
            <span>Opening time must be strictly earlier than closing time.</span>
          </div>
        )}

        {/* Store Status Toggle */}
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface-subtle)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={16} color="var(--color-primary)" />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text-main)' }}>
                Store Operational Status
              </span>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onStatusChange('ACTIVE')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  backgroundColor: status === 'ACTIVE' ? 'var(--color-success-bg)' : 'var(--color-surface)',
                  borderColor: status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-border)',
                  color: status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-text-muted)',
                }}
              >
                ● Active & Open
              </button>

              <button
                type="button"
                disabled={disabled}
                onClick={() => onStatusChange('INACTIVE')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  backgroundColor: status === 'INACTIVE' ? 'var(--color-surface)' : 'var(--color-surface)',
                  borderColor: status === 'INACTIVE' ? 'var(--color-text-main)' : 'var(--color-border)',
                  color: status === 'INACTIVE' ? 'var(--color-text-main)' : 'var(--color-text-light)',
                }}
              >
                ○ Inactive / Closed
              </button>
            </div>
          </div>

          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
            {currentStatusMeta.description}
          </div>
        </div>
      </div>
    </div>
  );
};
