import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../../services/adminService';
import type { AdminUser } from '../../../types/admin.types';
import type { Role, AccountStatus } from '../../../types/auth.types';

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(15);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CUSTOMER' | 'SHOP_OWNER'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    user: AdminUser;
    action: 'SUSPEND' | 'REINSTATE';
  } | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users from server
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const roleParam: Role | undefined =
        roleFilter === 'ALL' ? undefined : (roleFilter as Role);
      const statusParam: AccountStatus | undefined =
        statusFilter === 'ALL' ? undefined : (statusFilter as AccountStatus);

      const response = await adminService.getUsers({
        role: roleParam,
        accountStatus: statusParam,
        search: debouncedSearch || undefined,
        page: currentPage,
        size: pageSize,
      });

      setUsers(response.content || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load user records from server.'
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, statusFilter, currentPage, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Suspend action with Admin protection
  const handleSuspendUser = async (userId: string): Promise<boolean> => {
    setActionLoadingId(userId);
    try {
      await adminService.suspendUser(userId);
      setUsers((prev) =>
        prev.map((u) =>
          (u.userId === userId || u.id === userId)
            ? { ...u, accountStatus: 'SUSPENDED' }
            : u
        )
      );
      if (selectedUser && (selectedUser.userId === userId || selectedUser.id === userId)) {
        setSelectedUser({ ...selectedUser, accountStatus: 'SUSPENDED' });
      }
      setConfirmAction(null);
      return true;
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to suspend user.');
      return false;
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reinstate action
  const handleReinstateUser = async (userId: string): Promise<boolean> => {
    setActionLoadingId(userId);
    try {
      await adminService.reinstateUser(userId);
      setUsers((prev) =>
        prev.map((u) =>
          (u.userId === userId || u.id === userId)
            ? { ...u, accountStatus: 'ACTIVE' }
            : u
        )
      );
      if (selectedUser && (selectedUser.userId === userId || selectedUser.id === userId)) {
        setSelectedUser({ ...selectedUser, accountStatus: 'ACTIVE' });
      }
      setConfirmAction(null);
      return true;
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to reinstate user.');
      return false;
    } finally {
      setActionLoadingId(null);
    }
  };

  return {
    users,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    search,
    setSearch,
    roleFilter,
    setRoleFilter: (role: 'ALL' | 'CUSTOMER' | 'SHOP_OWNER') => {
      setRoleFilter(role);
      setCurrentPage(0);
    },
    statusFilter,
    setStatusFilter: (status: 'ALL' | 'ACTIVE' | 'SUSPENDED') => {
      setStatusFilter(status);
      setCurrentPage(0);
    },
    setPage: setCurrentPage,
    loading,
    error,
    actionLoadingId,
    selectedUser,
    setSelectedUser,
    confirmAction,
    setConfirmAction,
    handleSuspendUser,
    handleReinstateUser,
    refetch: fetchUsers,
  };
};
