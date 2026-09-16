import React, { useState } from 'react';
import { RefreshCw, Clock } from 'lucide-react';
import { useShopOwnerPickupSlots } from './hooks/useShopOwnerPickupSlots';
import { PickupSlotsKPIs } from './components/PickupSlotsKPIs';
import { DateNavigationHeader } from './components/DateNavigationHeader';
import { PickupSlotsFiltersBar } from './components/PickupSlotsFiltersBar';
import { PickupSlotTable } from './components/PickupSlotTable';
import { PickupSlotCardList } from './components/PickupSlotCardList';
import { CounterProposalModal } from './components/CounterProposalModal';
import { PickupSlotsSkeleton } from './components/PickupSlotsSkeleton';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/feedback/ErrorState';
import type { PickupSlotResponse } from '../../types/slot.types';

export const ShopPickupSlotsPage: React.FC = () => {
  const {
    slots,
    filteredSlots,
    selectedShop,
    loading,
    error,
    actionLoadingId,
    dateFilterMode,
    selectedDate,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    kpis,
    refetch,
    goToToday,
    goToTomorrow,
    goToPreviousDay,
    goToNextDay,
    setCustomDate,
    showAllDates,
    handleAcceptSlot,
    handleRejectSlot,
    handleCounterPropose,
  } = useShopOwnerPickupSlots();

  // Counter proposal modal state
  const [counterSlot, setCounterSlot] = useState<PickupSlotResponse | null>(null);
  const [proposing, setProposing] = useState(false);

  const handleOpenCounter = (slot: PickupSlotResponse) => {
    setCounterSlot(slot);
  };

  const handleCloseCounter = () => {
    setCounterSlot(null);
  };

  const handleSubmitCounter = async (slotId: string, payload: any) => {
    setProposing(true);
    const success = await handleCounterPropose(slotId, payload);
    setProposing(false);
    return success;
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px 0', color: 'var(--color-text-main)' }}>
            Pickup Slots
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: 0 }}>
            Manage pickup availability and customer capacity.
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={refetch}
          icon={<RefreshCw size={16} className={loading ? 'spin' : ''} />}
        >
          Refresh
        </Button>
      </div>

      {/* Main View State Handling */}
      {loading ? (
        <PickupSlotsSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <div>
          {/* Summary KPIs */}
          <PickupSlotsKPIs
            kpis={kpis}
            activeFilter={statusFilter}
            onSelectFilter={(filter) =>
              setStatusFilter(statusFilter === filter ? 'ALL' : filter)
            }
          />

          {/* Date Navigation Header */}
          <DateNavigationHeader
            selectedDate={selectedDate}
            dateFilterMode={dateFilterMode}
            onPreviousDay={goToPreviousDay}
            onNextDay={goToNextDay}
            onToday={goToToday}
            onTomorrow={goToTomorrow}
            onCustomDate={setCustomDate}
            onAllDates={showAllDates}
            operatingHours={{
              openingTime: selectedShop?.openingTime,
              closingTime: selectedShop?.closingTime,
            }}
          />

          {/* Status and Search Filters Bar */}
          <PickupSlotsFiltersBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            totalCount={slots.length}
            filteredCount={filteredSlots.length}
          />

          {/* Empty State */}
          {filteredSlots.length === 0 ? (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '56px 20px',
                color: 'var(--color-text-muted)',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  color: 'var(--color-primary)',
                }}
              >
                <Clock size={28} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: 'var(--color-text-main)' }}>
                No pickup slots found
              </h3>
              <p style={{ fontSize: 14, color: 'var(--color-text-light)', maxWidth: 440, margin: '0 auto 20px auto' }}>
                {searchQuery || statusFilter !== 'ALL' || dateFilterMode !== 'ALL_DATES'
                  ? 'No pickup requests match your selected date or status filters. Try viewing All Dates or resetting filters.'
                  : 'Customer pickup slot requests for scheduled orders will appear here.'}
              </p>
              {(searchQuery || statusFilter !== 'ALL' || dateFilterMode !== 'ALL_DATES') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    showAllDates();
                  }}
                >
                  View All Dates & Slots
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="desktop-only">
                <PickupSlotTable
                  slots={filteredSlots}
                  actionLoadingId={actionLoadingId}
                  onAccept={handleAcceptSlot}
                  onReject={handleRejectSlot}
                  onOpenCounter={handleOpenCounter}
                />
              </div>

              {/* Mobile Card List View */}
              <div className="mobile-only">
                <PickupSlotCardList
                  slots={filteredSlots}
                  actionLoadingId={actionLoadingId}
                  onAccept={handleAcceptSlot}
                  onReject={handleRejectSlot}
                  onOpenCounter={handleOpenCounter}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Counter Proposal Modal */}
      <CounterProposalModal
        isOpen={Boolean(counterSlot)}
        slot={counterSlot}
        onClose={handleCloseCounter}
        onSubmit={handleSubmitCounter}
        shop={selectedShop}
        loading={proposing}
      />
    </div>
  );
};
