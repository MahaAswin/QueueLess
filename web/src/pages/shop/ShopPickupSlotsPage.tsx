import React, { useState, useEffect, useCallback } from 'react';
import { pickupService } from '../../services/pickupService';
import type { PickupSlotResponse, CounterProposalRequest } from '../../types/slot.types';
import { formatOrderId, formatTimeLabel, formatDateShort } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { Clock, Check, X, RefreshCw, MessageSquare } from 'lucide-react';

export const ShopPickupSlotsPage: React.FC = () => {
  const [slots, setSlots] = useState<PickupSlotResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Counter proposal modal state
  const [counterSlot, setCounterSlot] = useState<PickupSlotResponse | null>(null);
  const [proposal, setProposal] = useState<CounterProposalRequest>({
    pickupDate: new Date().toISOString().split('T')[0],
    startTime: '10:00:00',
    endTime: '10:30:00',
  });
  const [proposing, setProposing] = useState(false);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await pickupService.getShopPickupSlots();
      setSlots(res || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load pickup slots.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleAccept = async (slot: PickupSlotResponse) => {
    const id = slot.id || slot.slotId;
    if (!id) return;
    setActionLoadingId(id);
    try {
      await pickupService.acceptSlot(id);
      await fetchSlots();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to accept pickup slot');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (slot: PickupSlotResponse) => {
    const id = slot.id || slot.slotId;
    if (!id) return;
    if (!window.confirm('Are you sure you want to reject this pickup slot?')) return;
    setActionLoadingId(id);
    try {
      await pickupService.rejectSlot(id);
      await fetchSlots();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to reject pickup slot');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCounterPropose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterSlot) return;
    const id = counterSlot.id || counterSlot.slotId;
    if (!id) return;

    setProposing(true);
    try {
      await pickupService.counterProposeSlot(id, proposal);
      setCounterSlot(null);
      await fetchSlots();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to submit counter proposal');
    } finally {
      setProposing(false);
    }
  };

  return (
    <div>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px 0' }}>
            Pickup Slot Schedule
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: 0 }}>
            Review customer requested arrival times and manage store capacity
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={fetchSlots}
          icon={<RefreshCw size={16} className={loading ? 'spin' : ''} />}
        >
          Refresh
        </Button>
      </div>

      {/* Slots Table */}
      {loading ? (
        <LoadingState message="Loading pickup slots..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSlots} />
      ) : slots.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--color-text-muted)' }}
        >
          <Clock size={36} color="var(--color-text-light)" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No pickup slots scheduled</h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-light)' }}>
            Customer pickup slot requests for orders will appear here.
          </p>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Scheduled Date</th>
                <th>Time Window</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => {
                const id = slot.id || slot.slotId || '';
                const isProcessing = actionLoadingId === id;
                const dateStr = slot.finalPickupDate || slot.pickupDate;
                const start = slot.finalStartTime || slot.requestedStartTime;
                const end = slot.finalEndTime || slot.requestedEndTime;

                return (
                  <tr key={id || slot.orderId}>
                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--mono)',
                          fontWeight: 700,
                          color: 'var(--color-primary-deep)',
                        }}
                      >
                        {formatOrderId(slot.orderId)}
                      </span>
                    </td>
                    <td>
                      <strong>{dateStr ? formatDateShort(dateStr) : 'Today'}</strong>
                    </td>
                    <td>
                      {start && end
                        ? `${formatTimeLabel(start)} – ${formatTimeLabel(end)}`
                        : 'Standard Pickup'}
                    </td>
                    <td>
                      <Badge
                        variant={
                          slot.status === 'ACCEPTED' || slot.status === 'CUSTOMER_ACCEPTED'
                            ? 'success'
                            : slot.status === 'REQUESTED'
                            ? 'warning'
                            : slot.status === 'COUNTER_PROPOSED'
                            ? 'info'
                            : 'neutral'
                        }
                      >
                        {slot.status}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {slot.status === 'REQUESTED' && (
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={isProcessing}
                            onClick={() => handleAccept(slot)}
                            icon={<Check size={14} />}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={isProcessing}
                            onClick={() => {
                              setCounterSlot(slot);
                              setProposal({
                                pickupDate: slot.pickupDate || new Date().toISOString().split('T')[0],
                                startTime: '12:00:00',
                                endTime: '12:30:00',
                              });
                            }}
                            icon={<MessageSquare size={14} />}
                          >
                            Counter
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={isProcessing}
                            onClick={() => handleReject(slot)}
                            icon={<X size={14} />}
                          >
                            Decline
                          </Button>
                        </div>
                      )}

                      {slot.status !== 'REQUESTED' && (
                        <span style={{ fontSize: 13, color: 'var(--color-text-light)' }}>
                          Processed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Counter Proposal Modal */}
      {counterSlot && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            className="card"
            style={{
              width: 440,
              maxWidth: '90%',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Counter-Propose Pickup Time
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 16 }}>
              Suggest an alternate date/time window for Order #{counterSlot.orderId.slice(0, 8)}
            </p>

            <form onSubmit={handleCounterPropose}>
              <div className="form-group">
                <label className="form-label">Proposed Date *</label>
                <input
                  type="date"
                  required
                  value={proposal.pickupDate}
                  onChange={(e) => setProposal({ ...proposal, pickupDate: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Start Time *</label>
                  <input
                    type="time"
                    required
                    step="60"
                    value={proposal.startTime.slice(0, 5)}
                    onChange={(e) => setProposal({ ...proposal, startTime: `${e.target.value}:00` })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Time *</label>
                  <input
                    type="time"
                    required
                    step="60"
                    value={proposal.endTime.slice(0, 5)}
                    onChange={(e) => setProposal({ ...proposal, endTime: `${e.target.value}:00` })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <Button variant="outline" size="md" type="button" onClick={() => setCounterSlot(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" disabled={proposing}>
                  {proposing ? 'Submitting...' : 'Send Proposal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
