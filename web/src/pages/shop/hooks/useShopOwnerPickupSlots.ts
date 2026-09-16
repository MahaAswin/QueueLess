import { useState, useEffect, useCallback, useMemo } from 'react';
import { pickupService } from '../../../services/pickupService';
import { shopService } from '../../../services/shopService';
import type {
  PickupSlotResponse,
  PickupSlotFilter,
  PickupDateFilter,
  CounterProposalRequest,
} from '../../../types/slot.types';
import type { Shop } from '../../../types/shop.types';

export const useShopOwnerPickupSlots = () => {
  const [slots, setSlots] = useState<PickupSlotResponse[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Date Navigation State
  const [dateFilterMode, setDateFilterMode] = useState<PickupDateFilter>('TODAY');
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );

  // Filters
  const [statusFilter, setStatusFilter] = useState<PickupSlotFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch shops to get operating hours and details
  useEffect(() => {
    let isMounted = true;
    async function loadShopData() {
      try {
        const myShops = await shopService.getMyShops();
        if (isMounted) {
          setShops(myShops);
          if (myShops.length > 0) {
            setSelectedShop(myShops[0]);
          }
        }
      } catch (err: any) {
        console.error('Failed to load shop details:', err);
      }
    }
    loadShopData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch slots
  const fetchSlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pickupService.getShopPickupSlots();
      setSlots(data || []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || 'Failed to load pickup slots.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Date navigation helpers
  const goToToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    setDateFilterMode('TODAY');
  };

  const goToTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
    setDateFilterMode('TOMORROW');
  };

  const goToPreviousDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - 1);
    const prevDateStr = current.toISOString().split('T')[0];
    setSelectedDate(prevDateStr);
    setDateFilterMode('CUSTOM');
  };

  const goToNextDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + 1);
    const nextDateStr = current.toISOString().split('T')[0];
    setSelectedDate(nextDateStr);
    setDateFilterMode('CUSTOM');
  };

  const setCustomDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setDateFilterMode('CUSTOM');
  };

  const showAllDates = () => {
    setDateFilterMode('ALL_DATES');
  };

  // KPIs
  const kpis = useMemo(() => {
    const pendingCount = slots.filter((s) => s.status === 'REQUESTED').length;
    const confirmedCount = slots.filter(
      (s) => s.status === 'ACCEPTED' || s.status === 'CUSTOMER_ACCEPTED'
    ).length;
    const counterProposedCount = slots.filter((s) => s.status === 'COUNTER_PROPOSED').length;
    const rejectedCount = slots.filter(
      (s) =>
        s.status === 'SHOP_REJECTED' ||
        s.status === 'CUSTOMER_REJECTED' ||
        s.status === 'REJECTED' ||
        s.status === 'CANCELLED'
    ).length;

    return {
      total: slots.length,
      pendingCount,
      confirmedCount,
      counterProposedCount,
      rejectedCount,
    };
  }, [slots]);

  // Filtered slots
  const filteredSlots = useMemo(() => {
    let result = [...slots];

    // Date filter
    if (dateFilterMode !== 'ALL_DATES') {
      result = result.filter((slot) => {
        const slotDate = slot.finalPickupDate || slot.proposedDate || slot.pickupDate;
        return slotDate === selectedDate;
      });
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'REQUESTED') {
        result = result.filter((s) => s.status === 'REQUESTED');
      } else if (statusFilter === 'ACCEPTED') {
        result = result.filter(
          (s) => s.status === 'ACCEPTED' || s.status === 'CUSTOMER_ACCEPTED'
        );
      } else if (statusFilter === 'COUNTER_PROPOSED') {
        result = result.filter((s) => s.status === 'COUNTER_PROPOSED');
      } else if (statusFilter === 'REJECTED') {
        result = result.filter(
          (s) =>
            s.status === 'SHOP_REJECTED' ||
            s.status === 'CUSTOMER_REJECTED' ||
            s.status === 'REJECTED' ||
            s.status === 'CANCELLED'
        );
      }
    }

    // Search query (Order ID or Customer Name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((slot) => {
        const orderIdMatch =
          slot.orderId.toLowerCase().includes(q) ||
          slot.orderId.replace(/-/g, '').toLowerCase().includes(q);
        const customerMatch = slot.customerName?.toLowerCase().includes(q);
        return orderIdMatch || customerMatch;
      });
    }

    // Sort by scheduled pickup time
    result.sort((a, b) => {
      const timeA = a.finalStartTime || a.proposedStartTime || a.requestedStartTime || '';
      const timeB = b.finalStartTime || b.proposedStartTime || b.requestedStartTime || '';
      return timeA.localeCompare(timeB);
    });

    return result;
  }, [slots, dateFilterMode, selectedDate, statusFilter, searchQuery]);

  // Actions
  const handleAcceptSlot = async (slotId: string): Promise<boolean> => {
    setActionLoadingId(slotId);
    try {
      const updated = await pickupService.acceptSlot(slotId);
      setSlots((prev) =>
        prev.map((s) => (s.id === slotId || s.slotId === slotId ? updated : s))
      );
      return true;
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to accept pickup slot');
      return false;
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectSlot = async (slotId: string): Promise<boolean> => {
    if (!window.confirm('Are you sure you want to decline this pickup slot request?')) {
      return false;
    }
    setActionLoadingId(slotId);
    try {
      const updated = await pickupService.rejectSlot(slotId);
      setSlots((prev) =>
        prev.map((s) => (s.id === slotId || s.slotId === slotId ? updated : s))
      );
      return true;
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to reject pickup slot');
      return false;
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCounterPropose = async (
    slotId: string,
    payload: CounterProposalRequest
  ): Promise<boolean> => {
    setActionLoadingId(slotId);
    try {
      const updated = await pickupService.counterProposeSlot(slotId, payload);
      setSlots((prev) =>
        prev.map((s) => (s.id === slotId || s.slotId === slotId ? updated : s))
      );
      return true;
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to submit counter-proposal');
      return false;
    } finally {
      setActionLoadingId(null);
    }
  };

  return {
    slots,
    filteredSlots,
    shops,
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
    refetch: fetchSlots,
    goToToday,
    goToTomorrow,
    goToPreviousDay,
    goToNextDay,
    setCustomDate,
    showAllDates,
    handleAcceptSlot,
    handleRejectSlot,
    handleCounterPropose,
  };
};
