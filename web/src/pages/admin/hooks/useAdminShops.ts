import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../../services/adminService';
import type { AdminShop } from '../../../types/admin.types';
import type { ShopCategory, ShopStatus } from '../../../types/shop.types';

export const useAdminShops = () => {
  const [shops, setShops] = useState<AdminShop[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(15);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ShopStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | ShopCategory>('ALL');
  const [cityFilter, setCityFilter] = useState('');
  const [debouncedCity, setDebouncedCity] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [selectedShop, setSelectedShop] = useState<AdminShop | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    shop: AdminShop;
    action: 'ACTIVATE' | 'REJECT' | 'SUSPEND' | 'REINSTATE';
  } | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Debounce city filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCity(cityFilter.trim());
      setCurrentPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [cityFilter]);

  // Fetch shops from server
  const fetchShops = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam: ShopStatus | undefined =
        statusFilter === 'ALL' ? undefined : statusFilter;
      const categoryParam: ShopCategory | undefined =
        categoryFilter === 'ALL' ? undefined : categoryFilter;

      const response = await adminService.getShops({
        status: statusParam,
        category: categoryParam,
        city: debouncedCity || undefined,
        search: debouncedSearch || undefined,
        page: currentPage,
        size: pageSize,
      });

      setShops(response.content || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load registered shops from server.'
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, debouncedCity, statusFilter, categoryFilter, currentPage, pageSize]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  // Activate / Approve action
  const handleActivateShop = async (shopId: string): Promise<boolean> => {
    setActionLoadingId(shopId);
    try {
      const updated = await adminService.activateShop(shopId);
      setShops((prev) =>
        prev.map((s) =>
          (s.shopId === shopId || s.id === shopId)
            ? { ...s, status: updated.status || 'ACTIVE' }
            : s
        )
      );
      if (selectedShop && (selectedShop.shopId === shopId || selectedShop.id === shopId)) {
        setSelectedShop({ ...selectedShop, status: 'ACTIVE' });
      }
      setConfirmAction(null);
      return true;
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to activate shop.');
      return false;
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject action
  const handleRejectShop = async (shopId: string): Promise<boolean> => {
    setActionLoadingId(shopId);
    try {
      const updated = await adminService.rejectShop(shopId);
      setShops((prev) =>
        prev.map((s) =>
          (s.shopId === shopId || s.id === shopId)
            ? { ...s, status: updated.status || 'INACTIVE' }
            : s
        )
      );
      if (selectedShop && (selectedShop.shopId === shopId || selectedShop.id === shopId)) {
        setSelectedShop({ ...selectedShop, status: 'INACTIVE' });
      }
      setConfirmAction(null);
      return true;
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to reject shop.');
      return false;
    } finally {
      setActionLoadingId(null);
    }
  };

  // Suspend action
  const handleSuspendShop = async (shopId: string): Promise<boolean> => {
    setActionLoadingId(shopId);
    try {
      await adminService.suspendShop(shopId);
      setShops((prev) =>
        prev.map((s) =>
          (s.shopId === shopId || s.id === shopId)
            ? { ...s, status: 'SUSPENDED' }
            : s
        )
      );
      if (selectedShop && (selectedShop.shopId === shopId || selectedShop.id === shopId)) {
        setSelectedShop({ ...selectedShop, status: 'SUSPENDED' });
      }
      setConfirmAction(null);
      return true;
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to suspend shop.');
      return false;
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reinstate action
  const handleReinstateShop = async (shopId: string): Promise<boolean> => {
    setActionLoadingId(shopId);
    try {
      await adminService.reinstateShop(shopId);
      setShops((prev) =>
        prev.map((s) =>
          (s.shopId === shopId || s.id === shopId)
            ? { ...s, status: 'ACTIVE' }
            : s
        )
      );
      if (selectedShop && (selectedShop.shopId === shopId || selectedShop.id === shopId)) {
        setSelectedShop({ ...selectedShop, status: 'ACTIVE' });
      }
      setConfirmAction(null);
      return true;
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to reinstate shop.');
      return false;
    } finally {
      setActionLoadingId(null);
    }
  };

  return {
    shops,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    search,
    setSearch,
    statusFilter,
    setStatusFilter: (status: 'ALL' | ShopStatus) => {
      setStatusFilter(status);
      setCurrentPage(0);
    },
    categoryFilter,
    setCategoryFilter: (category: 'ALL' | ShopCategory) => {
      setCategoryFilter(category);
      setCurrentPage(0);
    },
    cityFilter,
    setCityFilter: (city: string) => {
      setCityFilter(city);
      setCurrentPage(0);
    },
    setPage: setCurrentPage,
    loading,
    error,
    actionLoadingId,
    selectedShop,
    setSelectedShop,
    confirmAction,
    setConfirmAction,
    handleActivateShop,
    handleRejectShop,
    handleSuspendShop,
    handleReinstateShop,
    refetch: fetchShops,
  };
};
