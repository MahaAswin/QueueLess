import React from 'react';
import {
  AlertCircle,
  User,
  Store,
  ChevronLeft,
  ChevronRight,
  Eye,
  Paperclip,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { formatOrderId, formatDateShort } from '../../../utils/formatters';
import type { ComplaintResponse } from '../../../types/complaint.types';
import {
  COMPLAINT_STATUS_META,
  COMPLAINT_TYPE_LABELS,
} from '../../../types/complaint.types';

interface ComplaintsTableProps {
  complaints: ComplaintResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onViewDetails: (complaintId: string) => void;
}

export const ComplaintsTable: React.FC<ComplaintsTableProps> = ({
  complaints,
  totalElements,
  totalPages,
  currentPage,
  onPageChange,
  onViewDetails,
}) => {
  if (complaints.length === 0) {
    return (
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '48px 24px',
          color: 'var(--color-text-muted)',
        }}
      >
        <AlertCircle size={36} color="var(--color-text-light)" style={{ marginBottom: 12 }} />
        <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
          No complaints found
        </h4>
        <p style={{ fontSize: 13, color: 'var(--color-text-light)', margin: '4px 0 0 0' }}>
          Try clearing your search query or adjusting your status/category filters.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '15%' }}>Complaint Ref</th>
              <th style={{ width: '18%' }}>Complainant</th>
              <th style={{ width: '18%' }}>Reported Entity</th>
              <th style={{ width: '12%' }}>Order #</th>
              <th style={{ width: '14%' }}>Category</th>
              <th style={{ width: '8%', textAlign: 'center' }}>Evidence</th>
              <th style={{ width: '10%' }}>Status</th>
              <th style={{ width: '5%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint) => {
              const statusMeta =
                COMPLAINT_STATUS_META[complaint.status] || {
                  label: complaint.status,
                  variant: 'neutral',
                };
              const typeLabel =
                COMPLAINT_TYPE_LABELS[complaint.type] || complaint.type;

              return (
                <tr key={complaint.complaintId}>
                  {/* Complaint ID & Date */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span
                        style={{
                          fontFamily: 'var(--mono)',
                          fontWeight: 700,
                          fontSize: 13,
                          color: 'var(--color-primary-deep)',
                        }}
                      >
                        #{formatOrderId(complaint.complaintId)}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {formatDateShort(complaint.createdAt)}
                      </span>
                    </div>
                  </td>

                  {/* Complainant Info */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--color-primary-subtle)',
                          color: 'var(--color-primary-deep)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11.5,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {complaint.complainantName ? (
                          complaint.complainantName.charAt(0).toUpperCase()
                        ) : (
                          <User size={13} />
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--color-text-main)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {complaint.complainantName}
                        </div>
                        <span style={{ fontSize: 10.5, color: 'var(--color-text-muted)' }}>
                          Complainant
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Reported Entity */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: complaint.reportedShopName
                            ? 'var(--radius-sm)'
                            : 'var(--radius-full)',
                          backgroundColor: complaint.reportedShopName
                            ? 'var(--color-surface-subtle)'
                            : '#FEE2E2',
                          color: complaint.reportedShopName
                            ? 'var(--color-text-muted)'
                            : '#DC2626',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {complaint.reportedShopName ? (
                          <Store size={14} />
                        ) : (
                          <User size={13} />
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--color-text-main)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {complaint.reportedShopName || complaint.reportedUserName}
                        </div>
                        <span style={{ fontSize: 10.5, color: 'var(--color-text-muted)' }}>
                          {complaint.reportedShopName
                            ? `Owner: ${complaint.reportedUserName}`
                            : 'Reported User'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Associated Order */}
                  <td>
                    <span
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: 'var(--color-text-main)',
                      }}
                    >
                      #{formatOrderId(complaint.orderId)}
                    </span>
                  </td>

                  {/* Category / Type */}
                  <td>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--color-text-main)',
                        display: 'inline-block',
                        padding: '2px 8px',
                        backgroundColor: 'var(--color-surface-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      {typeLabel}
                    </span>
                  </td>

                  {/* Evidence Count */}
                  <td style={{ textAlign: 'center' }}>
                    {(complaint.evidenceCount || 0) > 0 ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: 'var(--color-primary-deep)',
                          backgroundColor: 'var(--color-primary-subtle)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                        }}
                        title={`${complaint.evidenceCount} piece(s) of evidence attached`}
                      >
                        <Paperclip size={11} />
                        {complaint.evidenceCount}
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>-</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td>
                    <Badge variant={statusMeta.variant as any}>{statusMeta.label}</Badge>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      variant={complaint.status === 'SUBMITTED' ? 'primary' : 'secondary'}
                      size="sm"
                      icon={<Eye size={13} />}
                      onClick={() => onViewDetails(complaint.complaintId)}
                      title="Inspect and Resolve Complaint"
                    >
                      {complaint.status === 'SUBMITTED' ? 'Review' : 'Details'}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-subtle)',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>
            Showing page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong> (
            {totalElements} total complaints)
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              variant="secondary"
              size="sm"
              icon={<ChevronLeft size={15} />}
              disabled={currentPage === 0}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<ChevronRight size={15} />}
              disabled={currentPage >= totalPages - 1}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
