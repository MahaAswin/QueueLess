import React, { useState, useEffect, useCallback } from 'react';
import { complaintService } from '../../services/complaintService';
import type { ComplaintResponse } from '../../types/complaint.types';
import { formatDateLong, formatOrderId } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { HelpCircle, RefreshCw } from 'lucide-react';

export const ShopComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await complaintService.getShopComplaints();
      setComplaints(res || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load shop complaints.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

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
            Store Complaints & Tickets
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: 0 }}>
            Review support issues and resolution status for your outlet
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={fetchComplaints}
          icon={<RefreshCw size={16} className={loading ? 'spin' : ''} />}
        >
          Refresh
        </Button>
      </div>

      {/* Complaints List */}
      {loading ? (
        <LoadingState message="Loading complaints..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchComplaints} />
      ) : complaints.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--color-text-muted)' }}
        >
          <HelpCircle size={36} color="var(--color-text-light)" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No complaints on file</h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-light)' }}>
            Your outlet currently has zero open customer or order complaints.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {complaints.map((c) => (
            <div key={c.complaintId} className="card interactive-card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 10,
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontFamily: 'var(--mono)',
                        fontWeight: 700,
                        color: 'var(--color-primary-deep)',
                      }}
                    >
                      {formatOrderId(c.orderId)}
                    </span>
                    <Badge
                      variant={
                        c.status === 'RESOLVED'
                          ? 'success'
                          : c.status === 'UNDER_REVIEW'
                          ? 'warning'
                          : 'neutral'
                      }
                    >
                      {c.status}
                    </Badge>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 4 }}>
                    Reported on {formatDateLong(c.createdAt)} • Complainant: <strong>{c.complainantName}</strong>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-surface-subtle)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {c.type}
                </span>
              </div>

              <p style={{ fontSize: 14, color: 'var(--color-text-main)', marginBottom: 8 }}>
                {c.description}
              </p>

              {c.reviewNote && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-surface-subtle)',
                    borderLeft: '3px solid var(--color-primary)',
                    fontSize: 13,
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <strong>Admin Note:</strong> {c.reviewNote}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
