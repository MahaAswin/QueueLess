import React from 'react';
import { TrendingUp, Clock, QrCode } from 'lucide-react';
import type { Order } from '../../../types/order.types';
import { formatTimeLabel, formatRelativeTime } from '../../../utils/formatters';

interface FeaturedOrderJourneyProps {
  order: Order;
  onOpenQR: (order: Order) => void;
}

const getStageIndex = (status: string): number => {
  switch (status) {
    case 'PENDING':
      return 0;
    case 'CONFIRMED':
    case 'ACCEPTED':
      return 1;
    case 'PREPARING':
      return 2;
    case 'READY_FOR_PICKUP':
    case 'COLLECTED':
    case 'COMPLETED':
      return 3;
    default:
      return 0;
  }
};

export const FeaturedOrderJourney: React.FC<FeaturedOrderJourneyProps> = ({
  order,
  onOpenQR,
}) => {
  const currentStage = getStageIndex(order.status);
  const isReady = order.status === 'READY_FOR_PICKUP';

  // Calculate remaining minutes from pickup slot if available
  let timeRemaining = '~20 minutes';
  if (isReady) {
    timeRemaining = 'Ready Now!';
  } else if (order.pickupSlot?.finalStartTime || order.pickupSlot?.requestedStartTime) {
    const timeStr = order.pickupSlot.finalStartTime || order.pickupSlot.requestedStartTime;
    try {
      const parts = timeStr!.split(':');
      const now = new Date();
      const target = new Date();
      target.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
      const diffMs = target.getTime() - now.getTime();
      const diffMins = Math.round(diffMs / (1000 * 60));
      if (diffMins > 0 && diffMins < 300) {
        timeRemaining = `~${diffMins} minutes`;
      } else if (diffMins <= 0) {
        timeRemaining = 'Any moment';
      }
    } catch {
      timeRemaining = '~15 minutes';
    }
  }

  const steps = [
    {
      step: 1,
      title: 'Order Placed',
      time: formatTimeLabel(order.createdAt?.split('T')[1]?.substring(0, 5) || '11:45') || formatRelativeTime(order.createdAt),
    },
    {
      step: 2,
      title: 'Confirmed',
      time: currentStage >= 1 ? 'Confirmed' : 'Pending',
    },
    {
      step: 3,
      title: 'Preparing / Packing',
      time: currentStage >= 2 ? 'In Progress' : 'Pending',
    },
    {
      step: 4,
      title: 'Ready for Pickup',
      time: currentStage >= 3 ? 'Ready' : 'Pending',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)',
        gap: 16,
        marginTop: 8,
      }}
      className="featured-journey-grid"
    >
      {/* 1. LEFT PANEL: Your Order Journey Horizontal Tracker */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '20px',
          padding: '22px 26px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <TrendingUp size={18} color="#0F8A5F" />
            <h3
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: '#172033',
                fontFamily: 'var(--font-heading)',
                margin: 0,
              }}
            >
              Your Order Journey
            </h3>
          </div>
          <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 20px 26px' }}>
            Track each step in real-time.
          </p>
        </div>

        {/* 4-Step Horizontal Progress Tracker */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            position: 'relative',
            padding: '0 10px',
          }}
        >
          {/* Connector Line behind nodes */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: 30,
              right: 30,
              height: 2,
              backgroundColor: '#E2E8F0',
              zIndex: 1,
            }}
          >
            <div
              style={{
                height: '100%',
                backgroundColor: '#0F8A5F',
                width: `${(currentStage / (steps.length - 1)) * 100}%`,
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          {steps.map((st, idx) => {
            const isCompletedOrActive = currentStage >= idx;
            const isCurrent = currentStage === idx;

            return (
              <div
                key={st.step}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  zIndex: 2,
                  minWidth: 80,
                }}
              >
                {/* Node Circle */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: isCompletedOrActive ? '#0F8A5F' : '#FFFFFF',
                    border: isCompletedOrActive ? '2px solid #0F8A5F' : '2px solid #CBD5E1',
                    color: isCompletedOrActive ? '#FFFFFF' : '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 8,
                    boxShadow: isCurrent ? '0 0 0 4px rgba(15, 138, 95, 0.15)' : 'none',
                  }}
                >
                  {st.step}
                </div>

                {/* Title */}
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: isCompletedOrActive ? 800 : 600,
                    color: isCompletedOrActive ? '#172033' : '#94A3B8',
                    lineHeight: 1.25,
                  }}
                >
                  {st.title}
                </div>

                {/* Time */}
                <div
                  style={{
                    fontSize: 11,
                    color: isCompletedOrActive ? '#0F8A5F' : '#94A3B8',
                    fontWeight: 600,
                    marginTop: 2,
                  }}
                >
                  {st.time}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. RIGHT PANEL: Estimated Time & Express Pickup Box */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
          gap: 12,
        }}
      >
        {/* Estimated Time Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Clock size={16} color="#0F8A5F" />
              <span style={{ fontSize: 13, fontWeight: 800, color: '#172033' }}>
                Estimated Time
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: '#64748B' }}>
              Your order will be ready in
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#172033',
                fontFamily: 'var(--font-heading)',
                margin: '10px 0 8px',
              }}
            >
              {timeRemaining}
            </div>

            {/* Green Progress Bar */}
            <div
              style={{
                width: '100%',
                height: 6,
                borderRadius: '9999px',
                backgroundColor: '#E2E8F0',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: isReady ? '100%' : '65%',
                  backgroundColor: '#0F8A5F',
                  borderRadius: '9999px',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Pickup at Express Counter Card */}
        <div
          onClick={() => onOpenQR(order)}
          style={{
            backgroundColor: '#EAFBF1',
            border: '1px solid #BBF7D0',
            borderRadius: '20px',
            padding: '18px 14px',
            boxShadow: '0 2px 8px rgba(15, 138, 95, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          className="interactive-card"
          title="Click to view pickup OTP / QR Pass"
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              backgroundColor: '#DCFCE7',
              color: '#0F8A5F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
              border: '1px solid #A7F3D0',
            }}
          >
            <QrCode size={24} />
          </div>

          <div
            style={{
              fontSize: 12.5,
              fontWeight: 800,
              color: '#0D5C3A',
              lineHeight: 1.25,
            }}
          >
            Pickup at
            <br />
            Express Counter
          </div>
        </div>
      </div>
    </div>
  );
};
