import React from 'react';
import {
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
} from 'lucide-react';
import { useAdminComplaints } from './hooks/useAdminComplaints';
import { ComplaintsFilterBar } from './components/ComplaintsFilterBar';
import { ComplaintsTable } from './components/ComplaintsTable';
import { ComplaintsTableSkeleton } from './components/ComplaintsTableSkeleton';
import { AdminComplaintDetailsModal } from './components/AdminComplaintDetailsModal';
import { ErrorState } from '../../components/feedback/ErrorState';
import { Button } from '../../components/ui/Button';

export const AdminComplaintsPage: React.FC = () => {
  const {
    complaints,
    totalElements,
    totalPages,
    currentPage,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    summary,
    loading,
    error,
    selectedComplaintId,
    selectedComplaint,
    detailLoading,
    detailError,
    reviewLoading,
    reviewError,
    reviewSuccess,
    fetchComplaintDetail,
    handleReview,
    closeDetails,
    setPage,
    refetch,
  } = useAdminComplaints();

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
            Complaints & Dispute Resolution
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, margin: '4px 0 0 0' }}>
            Investigate customer and merchant disputes, review attached evidence, and apply policy penalties.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={refetch}
          disabled={loading}
          icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
        >
          Refresh Disputes
        </Button>
      </div>

      {/* Operational KPI Metric Strip */}
      {summary && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 14,
            marginBottom: 20,
          }}
        >
          {/* Total Complaints */}
          <div
            className="card"
            style={{
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-bg)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Total Disputes
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-main)' }}>
                {summary.totalComplaints}
              </div>
            </div>
          </div>

          {/* Action Required / Submitted */}
          <div
            className="card"
            style={{
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={20} />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Action Required
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#D97706' }}>
                {summary.submittedComplaints || summary.pendingComplaints || 0}
              </div>
            </div>
          </div>

          {/* Under Review */}
          <div
            className="card"
            style={{
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#E0F2FE',
                color: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldAlert size={20} />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Under Review
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0284C7' }}>
                {summary.underReviewComplaints || 0}
              </div>
            </div>
          </div>

          {/* Upheld / Valid */}
          <div
            className="card"
            style={{
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Upheld Valid
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-success)' }}>
                {summary.validComplaints}
              </div>
            </div>
          </div>

          {/* Invalid / Dismissed */}
          <div
            className="card"
            style={{
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-subtle)',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <XCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Dismissed / Invalid
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-main)' }}>
                {(summary.invalidComplaints || 0) + (summary.dismissedComplaints || 0)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <ComplaintsFilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        totalCount={totalElements}
      />

      {/* Complaints Table / Loading / Error State */}
      {loading && complaints.length === 0 ? (
        <ComplaintsTableSkeleton />
      ) : error && complaints.length === 0 ? (
        <ErrorState
          title="Unable to load platform complaint records"
          message={error}
          onRetry={refetch}
        />
      ) : (
        <ComplaintsTable
          complaints={complaints}
          totalElements={totalElements}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setPage}
          onViewDetails={(complaintId) => fetchComplaintDetail(complaintId)}
        />
      )}

      {/* Complaint Details Slide-over Drawer / Modal */}
      {selectedComplaintId && (
        <AdminComplaintDetailsModal
          complaint={selectedComplaint}
          loading={detailLoading}
          error={detailError}
          reviewLoading={reviewLoading}
          reviewError={reviewError}
          reviewSuccess={reviewSuccess}
          onReview={handleReview}
          onClose={closeDetails}
        />
      )}
    </div>
  );
};
