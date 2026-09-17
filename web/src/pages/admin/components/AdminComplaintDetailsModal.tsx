import React, { useState } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  User,
  Store,
  Receipt,
  ExternalLink,
  Paperclip,
  Clock,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { formatOrderId, formatDateLong, formatDateShort } from '../../../utils/formatters';
import type { ComplaintResponse, ComplaintStatus } from '../../../types/complaint.types';
import {
  COMPLAINT_STATUS_META,
  COMPLAINT_TYPE_LABELS,
} from '../../../types/complaint.types';

interface AdminComplaintDetailsModalProps {
  complaint: ComplaintResponse | null;
  loading: boolean;
  error: string | null;
  reviewLoading: boolean;
  reviewError: string | null;
  reviewSuccess: string | null;
  onReview: (targetStatus: ComplaintStatus, reviewNote?: string) => Promise<void>;
  onClose: () => void;
}

export const AdminComplaintDetailsModal: React.FC<AdminComplaintDetailsModalProps> = ({
  complaint,
  loading,
  error,
  reviewLoading,
  reviewError,
  reviewSuccess,
  onReview,
  onClose,
}) => {
  const [reviewNote, setReviewNote] = useState('');

  if (!complaint && !loading && !error) return null;

  const isFinalized =
    complaint &&
    (complaint.status === 'VALID' ||
      complaint.status === 'INVALID' ||
      complaint.status === 'DISMISSED');

  const statusMeta = complaint
    ? COMPLAINT_STATUS_META[complaint.status] || {
        label: complaint.status,
        variant: 'neutral',
        description: '',
      }
    : { label: '', variant: 'neutral', description: '' };

  const typeLabel = complaint
    ? COMPLAINT_TYPE_LABELS[complaint.type] || complaint.type
    : '';

  const handleSubmitResolution = async (targetStatus: ComplaintStatus) => {
    await onReview(targetStatus, reviewNote);
    setReviewNote('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 680,
          height: '100%',
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideInRight 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-surface-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertCircle size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--color-text-main)' }}>
                  Dispute Review
                </h3>
                {complaint && (
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--color-primary-deep)',
                    }}
                  >
                    #{formatOrderId(complaint.complaintId)}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                Administrative Investigation & Policy Resolution
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: 6,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
            }}
            title="Close Drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
              <div className="animate-spin" style={{ display: 'inline-block', marginBottom: 12 }}>
                <AlertCircle size={32} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Loading complaint details...</div>
            </div>
          )}

          {error && (
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                fontSize: 13.5,
              }}
            >
              {error}
            </div>
          )}

          {complaint && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Review Success Banner */}
              {reviewSuccess && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-success-bg)',
                    color: 'var(--color-success)',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{reviewSuccess}</span>
                </div>
              )}

              {/* Review Error Banner */}
              {reviewError && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-error-bg)',
                    color: 'var(--color-error)',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{reviewError}</span>
                </div>
              )}

              {/* Status Header Banner */}
              <div
                className="card"
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--color-surface-subtle)',
                }}
              >
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Current Dispute Status
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-main)', marginTop: 2 }}>
                    {statusMeta.description || typeLabel}
                  </div>
                </div>
                <Badge variant={statusMeta.variant as any}>
                  {statusMeta.label}
                </Badge>
              </div>

              {/* Parties Grid (Complainant, Reported Entity, Order) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 12,
                }}
              >
                {/* Complainant Card */}
                <div
                  className="card"
                  style={{
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: 11.5, fontWeight: 600 }}>
                    <User size={14} />
                    <span>Complainant</span>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {complaint.complainantName}
                  </div>
                  <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--color-text-light)' }}>
                    ID: {formatOrderId(complaint.complainantId)}
                  </span>
                </div>

                {/* Reported Party Card */}
                <div
                  className="card"
                  style={{
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: 11.5, fontWeight: 600 }}>
                    {complaint.reportedShopName ? <Store size={14} /> : <User size={14} />}
                    <span>Reported Party</span>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {complaint.reportedShopName || complaint.reportedUserName}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--color-text-light)' }}>
                    {complaint.reportedShopName ? `Owner: ${complaint.reportedUserName}` : 'Customer Account'}
                  </span>
                </div>

                {/* Order Reference Card */}
                <div
                  className="card"
                  style={{
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: 11.5, fontWeight: 600 }}>
                    <Receipt size={14} />
                    <span>Order Reference</span>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--color-primary-deep)' }}>
                    #{formatOrderId(complaint.orderId)}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    {formatDateShort(complaint.createdAt)}
                  </span>
                </div>
              </div>

              {/* Description Section */}
              <div className="card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Complaint Category: {typeLabel}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--color-text-muted)' }}>
                    <Clock size={12} />
                    <span>{formatDateLong(complaint.createdAt)}</span>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.6,
                    color: 'var(--color-text-main)',
                    backgroundColor: 'var(--color-surface-subtle)',
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {complaint.description}
                </div>
              </div>

              {/* Evidence Items Section */}
              {complaint.evidenceItems && complaint.evidenceItems.length > 0 && (
                <div className="card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <Paperclip size={16} color="var(--color-primary)" />
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--color-text-main)' }}>
                      Supporting Evidence ({complaint.evidenceItems.length})
                    </h4>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {complaint.evidenceItems.map((evidence, idx) => (
                      <div
                        key={evidence.evidenceId || idx}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-surface-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <Badge variant="neutral">{evidence.type}</Badge>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-main)' }}>
                              {evidence.description || `Evidence Item #${idx + 1}`}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 2 }}>
                              Uploaded {formatDateShort(evidence.createdAt)}
                            </div>
                          </div>
                        </div>

                        {evidence.fileUrl && (
                          <a
                            href={evidence.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '6px 12px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--color-surface)',
                              border: '1px solid var(--color-border)',
                              color: 'var(--color-primary)',
                              fontSize: 12,
                              fontWeight: 600,
                              textDecoration: 'none',
                              flexShrink: 0,
                            }}
                          >
                            <span>View Attachment</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Finalized Review Details (For VALID, INVALID, DISMISSED) */}
              {isFinalized && (
                <div
                  className="card"
                  style={{
                    padding: '16px 20px',
                    borderLeft: `4px solid ${
                      complaint.status === 'VALID'
                        ? 'var(--color-success)'
                        : complaint.status === 'INVALID'
                        ? 'var(--color-error)'
                        : 'var(--color-text-muted)'
                    }`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <ShieldAlert size={16} />
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--color-text-main)' }}>
                      Final Resolution Record
                    </h4>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12, fontSize: 12.5 }}>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)' }}>Reviewed By: </span>
                      <strong style={{ color: 'var(--color-text-main)' }}>
                        {complaint.reviewedByAdminEmail || 'System Admin'}
                      </strong>
                    </div>
                    {complaint.reviewedAt && (
                      <div>
                        <span style={{ color: 'var(--color-text-muted)' }}>Reviewed At: </span>
                        <strong style={{ color: 'var(--color-text-main)' }}>
                          {formatDateLong(complaint.reviewedAt)}
                        </strong>
                      </div>
                    )}
                  </div>

                  {complaint.reviewNote && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                        Administrative Findings & Justification:
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          lineHeight: 1.5,
                          color: 'var(--color-text-main)',
                          padding: '10px 12px',
                          backgroundColor: 'var(--color-surface-subtle)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {complaint.reviewNote}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dispute Resolution Action Form (For SUBMITTED or UNDER_REVIEW) */}
              {!isFinalized && (
                <div
                  className="card"
                  style={{
                    padding: '18px 20px',
                    border: '1px solid var(--color-primary)',
                    backgroundColor: 'rgba(2, 132, 199, 0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <ShieldAlert size={17} color="var(--color-primary)" />
                    <h4 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: 'var(--color-text-main)' }}>
                      Admin Dispute Resolution Actions
                    </h4>
                  </div>

                  <p style={{ fontSize: 12.5, color: 'var(--color-text-muted)', margin: '0 0 14px 0' }}>
                    Select an official resolution state. Upholding a complaint as <strong>VALID</strong> applies a policy penalty to the reported party and increments their trust violation score.
                  </p>

                  {/* Review Note Input */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-main)', marginBottom: 6 }}>
                      Resolution Notes / Justification
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Provide detailed justification for this resolution decision..."
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: 13,
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-main)',
                        outline: 'none',
                        boxSizing: 'border-box',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  {/* Action Buttons Grid */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {complaint.status === 'SUBMITTED' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={reviewLoading}
                        onClick={() => handleSubmitResolution('UNDER_REVIEW')}
                      >
                        Mark Under Review
                      </Button>
                    )}

                    <Button
                      variant="primary"
                      size="sm"
                      disabled={reviewLoading}
                      onClick={() => handleSubmitResolution('VALID')}
                      style={{ backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                    >
                      Uphold as VALID (Apply Trust Penalty)
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      disabled={reviewLoading}
                      onClick={() => handleSubmitResolution('INVALID')}
                    >
                      Mark as INVALID
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={reviewLoading}
                      onClick={() => handleSubmitResolution('DISMISSED')}
                    >
                      Dismiss Complaint
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: 'var(--color-surface-subtle)',
          }}
        >
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
