import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { formatDateShort } from '../../../utils/formatters';
import { Badge } from '../../../components/ui/Badge';
import { COMPLAINT_STATUS_META } from '../../../types/complaint.types';
import type { AdminRecentComplaint } from '../../../types/admin.types';

interface RecentComplaintsWidgetProps {
  complaints: AdminRecentComplaint[];
}

export const RecentComplaintsWidget: React.FC<RecentComplaintsWidgetProps> = ({ complaints }) => {
  return (
    <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 24px',
          borderBottom: '1px solid var(--color-border)',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-error-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-error)',
            }}
          >
            <ShieldAlert size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
              Recent Platform Complaints
            </h3>
            <p style={{ fontSize: 12, color: 'var(--color-text-light)', margin: '2px 0 0 0' }}>
              Customer and partner disputes requiring governance review
            </p>
          </div>
        </div>

        <Link
          to="/admin/complaints"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--color-primary)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          View All Complaints <ArrowRight size={14} />
        </Link>
      </div>

      {/* Table Content */}
      {complaints.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '36px 20px',
            color: 'var(--color-text-muted)',
          }}
        >
          <AlertCircle size={32} color="var(--color-text-light)" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-main)' }}>
            No platform complaints reported
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 2 }}>
            Customer or store complaints filed across orders will appear here.
          </div>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Complaint Type</th>
                <th style={{ width: '24%' }}>Order Reference</th>
                <th style={{ width: '20%' }}>Complainant</th>
                <th style={{ width: '18%' }}>Status</th>
                <th style={{ width: '16%', textAlign: 'right' }}>Filed</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => {
                const statusMeta = COMPLAINT_STATUS_META[c.status] || {
                  label: c.status,
                  variant: 'neutral' as const,
                  description: '',
                };
                return (
                  <tr key={c.complaintId}>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-main)' }}>
                        {c.complaintType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--mono)',
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: 'var(--color-primary-deep)',
                        }}
                      >
                        #{c.orderId.slice(0, 8)}...
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-surface-subtle)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {c.complainantRole}
                      </span>
                    </td>
                    <td>
                      <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                    </td>
                    <td style={{ textAlign: 'right', fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {formatDateShort(c.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
