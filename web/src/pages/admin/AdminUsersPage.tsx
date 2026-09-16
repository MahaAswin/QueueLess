import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useAdminUsers } from './hooks/useAdminUsers';
import { UsersFilterBar } from './components/UsersFilterBar';
import { UsersTable } from './components/UsersTable';
import { UsersTableSkeleton } from './components/UsersTableSkeleton';
import { UserDetailsModal } from './components/UserDetailsModal';
import { UserStatusConfirmModal } from './components/UserStatusConfirmModal';
import { ErrorState } from '../../components/feedback/ErrorState';
import { Button } from '../../components/ui/Button';

export const AdminUsersPage: React.FC = () => {
  const {
    users,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    setPage,
    loading,
    error,
    actionLoadingId,
    selectedUser,
    setSelectedUser,
    confirmAction,
    setConfirmAction,
    handleSuspendUser,
    handleReinstateUser,
    refetch,
  } = useAdminUsers();

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const userId = confirmAction.user.userId || confirmAction.user.id || '';
    if (!userId) return;

    if (confirmAction.action === 'SUSPEND') {
      await handleSuspendUser(userId);
    } else {
      await handleReinstateUser(userId);
    }
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
            User Management
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, margin: '4px 0 0 0' }}>
            Audit, search, and manage registered customer and shop owner accounts across QueueLess.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={refetch}
          disabled={loading}
          icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
        >
          Refresh Users
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <UsersFilterBar
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        totalCount={totalElements}
      />

      {/* Content State */}
      {loading && users.length === 0 ? (
        <UsersTableSkeleton />
      ) : error && users.length === 0 ? (
        <ErrorState
          title="Unable to load user accounts"
          message={error}
          onRetry={refetch}
        />
      ) : (
        <UsersTable
          users={users}
          totalElements={totalElements}
          totalPages={totalPages}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setPage}
          onViewDetails={(u) => setSelectedUser(u)}
          onOpenConfirmAction={(u, act) => setConfirmAction({ user: u, action: act })}
        />
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onOpenConfirmAction={(u, act) => {
            setSelectedUser(null);
            setConfirmAction({ user: u, action: act });
          }}
        />
      )}

      {/* Suspension / Reinstatement Confirmation Modal */}
      {confirmAction && (
        <UserStatusConfirmModal
          user={confirmAction.user}
          action={confirmAction.action}
          isSubmitting={!!actionLoadingId}
          onConfirm={handleConfirmAction}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};
