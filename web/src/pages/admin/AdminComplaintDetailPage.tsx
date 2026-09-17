import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  User,
  Store,
  Receipt,
  Paperclip,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { adminComplaintService } from '../../services/adminComplaintService';
import type { ComplaintResponse, ComplaintStatus } from '../../types/complaint.types';
import {
  COMPLAINT_STATUS_META,
  COMPLAINT_TYPE_LABELS,
} from '../../types/complaint.types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ErrorState } from '../../components/feedback/ErrorState';
import { formatOrderId, formatDateLong, formatDateShort } from '../../utils/formatters';

export const AdminComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState<ComplaintResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviewNote, setReviewNote] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  const fetchComplaint = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminComplaintService.getComplaintById(id);
      setComplaint(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load dispute details from server.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleReview = async (targetStatus: ComplaintStatus) => {
    if (!id) return;
    setReviewLoading(true);
    setReviewError(null);
    setReviewSuccess(null);
    try {
      const updated = await adminComplaintService.reviewComplaint(id, {
        status: targetStatus,
        reviewNote: reviewNote.trim() || undefined,
      });
      setComplaint(updated);
      setReviewSuccess(`Complaint successfully transitioned to ${targetStatus}.`);
      setReviewNote('');
    } catch (err: any) {
      setReviewError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to submit resolution decision.'
      );
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 0', textAlign: 'center' }}>
        <div className="animate-spin" style={{ display: 'inline-block', marginBottom: 12 }}>
          <AlertCircle size={32} color="var(--color-primary)" />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-muted)' }}>
          Loading dispute details...
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Button
          variant="secondary"
          size="sm"
          icon={<ArrowLeft size={14} />}
          onClick={() => navigate('/admin/complaints')}
          style={{ marginBottom: 20 }}
        >
          Back to Complaints
        </Button>
        <ErrorState
          title="Dispute Record Not Found"
          message={error || 'Unable to find the requested complaint record.'}
          onRetry={fetchComplaint}
        />
      </div>
    );
  }

  const isFinalized =
    complaint.status === 'VALID' ||
    complaint.status === 'INVALID' ||
    complaint.status === 'DISMISSED';

  const statusMeta =
    COMPLAINT_STATUS_META[complaint.status] || {
      label: complaint.status,
      variant: 'neutral',
      description: '',
    };
  const typeLabel =
    COMPLAINT_TYPE_LABELS[complaint.type] || complaint.type;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Breadcrumb / Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Button
          variant="secondary"
          size="sm"
          icon={<ArrowLeft size={14} />}
          onClick={() => navigate('/admin/complaints')}
        >
          All Complaints
        </Button>
        <span style={{ color: 'var(--color-text-light)' }}>/</span>
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'var(--mono)' }}>
          #{formatOrderId(complaint.complaintId)}
        </span>
      </div>

      {/* Header Banner */}
      <div
        className="card"
        style={{
          padding: '24px',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
              Dispute #{formatOrderId(complaint.complaintId)}
            </h1>
            <Badge variant={statusMeta.variant as any}>
              {statusMeta.label}
            </Badge>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, margin: '6px 0 0 0' }}>
            Category: <strong>{typeLabel}</strong> • Created on {formatDateLong(complaint.createdAt)}
          </p>
        </div>
      </div>

      {/* Review Banners */}
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
            marginBottom: 20,
          }}
        >
          <CheckCircle2 size={16} />
          <span>{reviewSuccess}</span>
        </div>
      )}

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
            marginBottom: 20,
          }}
        >
          <AlertCircle size={16} />
          <span>{reviewError}</span>
        </div>
      )}

      {/* Parties Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 14,
          marginBottom: 20,
        }}
      >
        {/* Complainant Card */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
            <User size={15} />
            <span>Complainant</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-main)' }}>
            {complaint.complainantName}
          </div>
          <div style={{ fontSize: 11.5, fontFamily: 'var(--mono)', color: 'var(--color-text-light)', marginTop: 4 }}>
            ID: {formatOrderId(complaint.complainantId)}
          </div>
        </div>

        {/* Reported Party Card */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
            {complaint.reportedShopName ? <Store size={15} /> : <User size={15} />}
            <span>Reported Entity</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-main)' }}>
            {complaint.reportedShopName || complaint.reportedUserName}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)', marginTop: 4 }}>
            {complaint.reportedShopName ? `Owner: ${complaint.reportedUserName}` : 'Customer Account'}
          </div>
        </div>

        {/* Order Reference Card */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
            <Receipt size={15} />
            <span>Associated Order</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--color-primary-deep)' }}>
            <Link to={`/admin/orders/${complaint.orderId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              #{formatOrderId(complaint.orderId)}
            </Link>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Order details link available
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="card" style={{ padding: '20px', marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: '0 0 12px 0' }}>
          Complaint Statement
        </h3>
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: 'var(--color-text-main)',
            backgroundColor: 'var(--color-surface-subtle)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {complaint.description}
        </div>
      </div>

      {/* Evidence Attachments */}
      {complaint.evidenceItems && complaint.evidenceItems.length > 0 && (
        <div className="card" style={{ padding: '20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Paperclip size={18} color="var(--color-primary)" />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-main)' }}>
              Supporting Evidence ({complaint.evidenceItems.length})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {complaint.evidenceItems.map((evidence, idx) => (
              <div
                key={evidence.evidenceId || idx}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <Badge variant="neutral">{evidence.type}</Badge>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-text-main)' }}>
                      {evidence.description || `Evidence Attachment #${idx + 1}`}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--color-text-light)', marginTop: 2 }}>
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
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-primary)',
                      fontSize: 12.5,
                      fontWeight: 600,
                      textDecoration: 'none',
                      flexShrink: 0,
                    }}
                  >
                    <span>Inspect Attachment</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Finalized Record */}
      {isFinalized && (
        <div
          className="card"
          style={{
            padding: '20px',
            marginBottom: 20,
            borderLeft: `4px solid ${
              complaint.status === 'VALID'
                ? 'var(--color-success)'
                : complaint.status === 'INVALID'
                ? 'var(--color-error)'
                : 'var(--color-text-muted)'
            }`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <ShieldAlert size={18} />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-main)' }}>
              Final Resolution Record
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14, fontSize: 13 }}>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Reviewed By: </span>
              <strong>{complaint.reviewedByAdminEmail || 'System Admin'}</strong>
            </div>
            {complaint.reviewedAt && (
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Reviewed At: </span>
                <strong>{formatDateLong(complaint.reviewedAt)}</strong>
              </div>
            )}
          </div>

          {complaint.reviewNote && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                Administrative Findings & Justification:
              </div>
              <div
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  color: 'var(--color-text-main)',
                  padding: '12px 14px',
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

      {/* Resolution Action Panel for Open Complaints */}
      {!isFinalized && (
        <div
          className="card"
          style={{
            padding: '24px',
            marginBottom: 20,
            border: '1px solid var(--color-primary)',
            backgroundColor: 'rgba(2, 132, 199, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <ShieldAlert size={18} color="var(--color-primary)" />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--color-text-main)' }}>
              Administrative Resolution Decision
            </h3>
          </div>

          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 16px 0' }}>
            Submit an official dispute decision. Marking as <strong>VALID</strong> automatically applies policy penalties and increments the reported party's trust violation score.
          </p>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-main)', marginBottom: 6 }}>
              Resolution Justification / Review Note
            </label>
            <textarea
              rows={3}
              placeholder="Enter official investigation notes and decision justification..."
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

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {complaint.status === 'SUBMITTED' && (
              <Button
                variant="secondary"
                size="md"
                disabled={reviewLoading}
                onClick={() => handleReview('UNDER_REVIEW')}
              >
                Mark Under Review
              </Button>
            )}

            <Button
              variant="primary"
              size="md"
              disabled={reviewLoading}
              onClick={() => handleReview('VALID')}
              style={{ backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)' }}
            >
              Uphold as VALID (Apply Trust Penalty)
            </Button>

            <Button
              variant="danger"
              size="md"
              disabled={reviewLoading}
              onClick={() => handleReview('INVALID')}
            >
              Mark as INVALID
            </Button>

            <Button
              variant="secondary"
              size="md"
              disabled={reviewLoading}
              onClick={() => handleReview('DISMISSED')}
            >
              Dismiss Complaint
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
