import { useState, useEffect, useCallback } from 'react';
import { adminComplaintService } from '../../../services/adminComplaintService';
import type { AdminComplaintSummary } from '../../../types/admin.types';
import type {
  ComplaintResponse,
  ComplaintStatus,
  ComplaintType,
} from '../../../types/complaint.types';

export const useAdminComplaints = () => {
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(15);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ComplaintStatus>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | ComplaintType>('ALL');

  const [summary, setSummary] = useState<AdminComplaintSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch complaints and summary metrics
  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = statusFilter === 'ALL' ? undefined : statusFilter;
      const typeParam = typeFilter === 'ALL' ? undefined : typeFilter;

      const [complaintsResp, summaryResp] = await Promise.all([
        adminComplaintService.getAdminComplaints({
          status: statusParam,
          type: typeParam,
          search: debouncedSearch || undefined,
          page: currentPage,
          size: pageSize,
        }),
        adminComplaintService.getComplaintSummary().catch(() => null),
      ]);

      setComplaints(complaintsResp.content || []);
      setTotalElements(complaintsResp.totalElements || 0);
      setTotalPages(complaintsResp.totalPages || 0);
      if (summaryResp) {
        setSummary(summaryResp);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load platform complaints from server.'
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, typeFilter, currentPage, pageSize]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Fetch single complaint details
  const fetchComplaintDetail = useCallback(async (complaintId: string) => {
    setSelectedComplaintId(complaintId);
    setDetailLoading(true);
    setDetailError(null);
    setReviewError(null);
    setReviewSuccess(null);
    try {
      const detail = await adminComplaintService.getComplaintById(complaintId);
      setSelectedComplaint(detail);
    } catch (err: any) {
      setDetailError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load complaint details.'
      );
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Review & resolve complaint action
  const handleReview = useCallback(
    async (targetStatus: ComplaintStatus, reviewNote?: string) => {
      if (!selectedComplaintId) return;
      setReviewLoading(true);
      setReviewError(null);
      setReviewSuccess(null);
      try {
        const updated = await adminComplaintService.reviewComplaint(
          selectedComplaintId,
          {
            status: targetStatus,
            reviewNote: reviewNote?.trim() || undefined,
          }
        );
        setSelectedComplaint(updated);
        setReviewSuccess(`Complaint successfully transitioned to ${targetStatus}.`);
        // Refresh list and summary metrics in background
        fetchComplaints();
      } catch (err: any) {
        setReviewError(
          err?.response?.data?.message ||
            err?.message ||
            'Failed to submit complaint review.'
        );
      } finally {
        setReviewLoading(false);
      }
    },
    [selectedComplaintId, fetchComplaints]
  );

  const closeDetails = () => {
    setSelectedComplaintId(null);
    setSelectedComplaint(null);
    setDetailError(null);
    setReviewError(null);
    setReviewSuccess(null);
  };

  return {
    complaints,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    search,
    setSearch,
    statusFilter,
    setStatusFilter: (st: 'ALL' | ComplaintStatus) => {
      setStatusFilter(st);
      setCurrentPage(0);
    },
    typeFilter,
    setTypeFilter: (tp: 'ALL' | ComplaintType) => {
      setTypeFilter(tp);
      setCurrentPage(0);
    },
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
    setPage: setCurrentPage,
    refetch: fetchComplaints,
  };
};
