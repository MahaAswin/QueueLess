import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useAdminShops } from './hooks/useAdminShops';
import { ShopsFilterBar } from './components/ShopsFilterBar';
import { ShopsTable } from './components/ShopsTable';
import { ShopsTableSkeleton } from './components/ShopsTableSkeleton';
import { ShopDetailsModal } from './components/ShopDetailsModal';
import { ShopStatusConfirmModal } from './components/ShopStatusConfirmModal';
import { ErrorState } from '../../components/feedback/ErrorState';
import { Button } from '../../components/ui/Button';

export const AdminShopsPage: React.FC = () => {
  const {
    shops,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    cityFilter,
    setCityFilter,
    setPage,
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
    refetch,
  } = useAdminShops();

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const shopId = confirmAction.shop.shopId || confirmAction.shop.id || '';
    if (!shopId) return;

    if (confirmAction.action === 'ACTIVATE') {
      await handleActivateShop(shopId);
    } else if (confirmAction.action === 'REJECT') {
      await handleRejectShop(shopId);
    } else if (confirmAction.action === 'SUSPEND') {
      await handleSuspendShop(shopId);
    } else if (confirmAction.action === 'REINSTATE') {
      await handleReinstateShop(shopId);
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
            Shop Management & Approvals
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, margin: '4px 0 0 0' }}>
            Review merchant registrations, verify store profiles, approve outlets, and manage operational statuses.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={refetch}
          disabled={loading}
          icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
        >
          Refresh Shops
        </Button>
      </div>

      {/* Filter Bar */}
      <ShopsFilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        cityFilter={cityFilter}
        onCityFilterChange={setCityFilter}
        totalCount={totalElements}
      />

      {/* Content Rendering */}
      {loading && shops.length === 0 ? (
        <ShopsTableSkeleton />
      ) : error && shops.length === 0 ? (
        <ErrorState
          title="Unable to load shop records"
          message={error}
          onRetry={refetch}
        />
      ) : (
        <ShopsTable
          shops={shops}
          totalElements={totalElements}
          totalPages={totalPages}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setPage}
          onViewDetails={(s) => setSelectedShop(s)}
          onOpenConfirmAction={(s, act) => setConfirmAction({ shop: s, action: act })}
        />
      )}

      {/* Shop Details Modal */}
      {selectedShop && (
        <ShopDetailsModal
          shop={selectedShop}
          onClose={() => setSelectedShop(null)}
          onOpenConfirmAction={(s, act) => {
            setSelectedShop(null);
            setConfirmAction({ shop: s, action: act });
          }}
        />
      )}

      {/* Action Confirmation Modal */}
      {confirmAction && (
        <ShopStatusConfirmModal
          shop={confirmAction.shop}
          action={confirmAction.action}
          isSubmitting={!!actionLoadingId}
          onConfirm={handleConfirmAction}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};
