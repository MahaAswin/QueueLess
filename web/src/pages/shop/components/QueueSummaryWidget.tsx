import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChefHat, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import type { QueueMetrics } from '../../../services/shopOwnerService';

interface QueueSummaryWidgetProps {
  metrics: QueueMetrics;
  loading?: boolean;
}

export const QueueSummaryWidget: React.FC<QueueSummaryWidgetProps> = ({
  metrics,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="skeleton" style={{ height: 20, width: '30%', marginBottom: 16 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div className="skeleton" style={{ height: 70 }} />
          <div className="skeleton" style={{ height: 70 }} />
          <div className="skeleton" style={{ height: 70 }} />
        </div>
      </div>
    );
  }

  const { waitingConfirmation, inPreparation, readyAtCounter, totalInQueue } = metrics;

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary-subtle)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Express Pickup Queue</h3>
            <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>
              Live customer fulfillment pipeline ({totalInQueue} active in store)
            </span>
          </div>
        </div>

        <Link
          to="/shop-owner/orders"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>Manage Queue</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Queue Pipeline Stages */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
        }}
      >
        {/* Step 1: Pending Acceptance */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: waitingConfirmation > 0 ? 'var(--color-warning-bg)' : 'var(--color-surface-subtle)',
            border: `1px solid ${waitingConfirmation > 0 ? 'var(--color-warning-border)' : 'var(--color-border)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: waitingConfirmation > 0 ? 'var(--color-warning)' : 'var(--color-text-muted)',
              boxShadow: 'var(--shadow-xs)',
              flexShrink: 0,
            }}
          >
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-main)', lineHeight: 1.1 }}>
              {waitingConfirmation}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Awaiting Acceptance
            </div>
          </div>
        </div>

        {/* Step 2: In Preparation */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: inPreparation > 0 ? 'var(--color-info-bg)' : 'var(--color-surface-subtle)',
            border: `1px solid ${inPreparation > 0 ? 'var(--color-info-border)' : 'var(--color-border)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: inPreparation > 0 ? 'var(--color-info)' : 'var(--color-text-muted)',
              boxShadow: 'var(--shadow-xs)',
              flexShrink: 0,
            }}
          >
            <ChefHat size={20} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-main)', lineHeight: 1.1 }}>
              {inPreparation}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Preparing / Packing
            </div>
          </div>
        </div>

        {/* Step 3: Ready at Counter */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: readyAtCounter > 0 ? 'var(--color-success-bg)' : 'var(--color-surface-subtle)',
            border: `1px solid ${readyAtCounter > 0 ? 'var(--color-success-border)' : 'var(--color-border)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: readyAtCounter > 0 ? 'var(--color-success)' : 'var(--color-text-muted)',
              boxShadow: 'var(--shadow-xs)',
              flexShrink: 0,
            }}
          >
            <CheckCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-main)', lineHeight: 1.1 }}>
              {readyAtCounter}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Ready at Counter
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
