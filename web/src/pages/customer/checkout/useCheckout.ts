import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { cartService } from '../../../services/cartService';
import { orderService } from '../../../services/orderService';
import { shopService } from '../../../services/shopService';
import { pickupService } from '../../../services/pickupService';
import type { Cart } from '../../../types/cart.types';
import type { Shop } from '../../../types/shop.types';
import type { TimeSlotOption, CreatePickupSlotRequest } from '../../../types/slot.types';

// Helper: Format ISO Date (YYYY-MM-DD) to friendly string
export const formatDayChip = (
  dateStr: string,
  index: number
): { dayLabel: string; dateLabel: string } => {
  if (index === 0) return { dayLabel: 'TODAY', dateLabel: formatDateShort(dateStr) };
  if (index === 1) return { dayLabel: 'TOMORROW', dateLabel: formatDateShort(dateStr) };

  const d = new Date(dateStr + 'T00:00:00');
  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dateNum = formatDateShort(dateStr);
  return { dayLabel: dayName, dateLabel: dateNum };
};

export const formatDateShort = (dateStr: string): string => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper: Format LocalTime string ("14:30:00" or "14:30") to "2:30 PM"
export const formatTimeLabel = (timeStr?: string | null): string => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
};

// Helper: Generate next 7 dates in YYYY-MM-DD format
export const generateDates = (): string[] => {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
};

// Helper: Generate 30-min time slots between opening and closing time
export const generateTimeSlots = (
  dateStr: string,
  openTimeStr?: string | null,
  closeTimeStr?: string | null
): TimeSlotOption[] => {
  const slots: TimeSlotOption[] = [];

  let openHour = 8;
  let openMinute = 0;
  let closeHour = 21;
  let closeMinute = 0;

  if (openTimeStr) {
    const parts = openTimeStr.split(':');
    if (parts.length >= 2) {
      openHour = parseInt(parts[0], 10);
      openMinute = parseInt(parts[1], 10);
    }
  }

  if (closeTimeStr) {
    const parts = closeTimeStr.split(':');
    if (parts.length >= 2) {
      closeHour = parseInt(parts[0], 10);
      closeMinute = parseInt(parts[1], 10);
    }
  }

  const isToday = dateStr === generateDates()[0];
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  let startTotalMinutes = openHour * 60 + openMinute;
  const endTotalMinutes = closeHour * 60 + closeMinute;

  while (startTotalMinutes + 30 <= endTotalMinutes) {
    const slotStartHour = Math.floor(startTotalMinutes / 60);
    const slotStartMin = startTotalMinutes % 60;
    const slotEndTotal = startTotalMinutes + 30;
    const slotEndHour = Math.floor(slotEndTotal / 60);
    const slotEndMin = slotEndTotal % 60;

    const startStr = `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMin).padStart(2, '0')}:00`;
    const endStr = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}:00`;

    const labelStart = formatTimeLabel(startStr);
    const labelEnd = formatTimeLabel(endStr);
    const displayLabel = `${labelStart} – ${labelEnd}`;

    let isAvailable = true;
    if (isToday) {
      // If slot start time has already passed today (+ 10 min prep buffer), mark unavailable
      if (startTotalMinutes <= currentHour * 60 + currentMinute + 10) {
        isAvailable = false;
      }
    }

    slots.push({
      id: `${startStr}-${endStr}`,
      startTime: startStr,
      endTime: endStr,
      displayLabel,
      isAvailable,
    });

    startTotalMinutes += 30;
  }

  return slots;
};

export const useCheckout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cart, setCart] = useState<Cart | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Date and slot selection
  const dates = useMemo(() => generateDates(), []);
  const [selectedDate, setSelectedDate] = useState<string>(dates[0]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotOption | null>(null);

  // Load cart and shop information
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cartData = await cartService.getCart();
      setCart(cartData);

      if (cartData && cartData.shopId) {
        try {
          const shopData = await shopService.getShopById(cartData.shopId);
          setShop(shopData);
        } catch {
          // Shop fetch non-fatal for checkout load
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load checkout details.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Generate available time slots based on selected date & shop hours
  const availableSlots = useMemo(() => {
    return generateTimeSlots(
      selectedDate,
      shop?.openingTime || '08:00:00',
      shop?.closingTime || '21:00:00'
    );
  }, [selectedDate, shop?.openingTime, shop?.closingTime]);

  // Auto-select first available slot if current selectedSlot is not available
  useEffect(() => {
    if (availableSlots.length > 0) {
      const currentValid = selectedSlot && availableSlots.some(
        (s) => s.id === selectedSlot.id && s.isAvailable
      );
      if (!currentValid) {
        const firstAvailable = availableSlots.find((s) => s.isAvailable);
        setSelectedSlot(firstAvailable || null);
      }
    } else {
      setSelectedSlot(null);
    }
  }, [availableSlots, selectedSlot]);

  // Confirm and create order
  const handleConfirmOrder = async () => {
    if (submitting) return;

    if (!cart || !cart.items || cart.items.length === 0) {
      setError('Your cart is empty. Please add items before checking out.');
      return;
    }

    if (!selectedSlot) {
      setError('Please select a pickup time slot for your zero-wait express pickup.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Real Backend Order Placement (POST /api/orders)
      const order = await orderService.checkout();

      if (!order || !order.id) {
        throw new Error('Order creation failed: Backend did not return an order ID.');
      }

      // Request Pickup Slot (POST /api/orders/{orderId}/pickup-slot)
      try {
        const slotPayload: CreatePickupSlotRequest = {
          pickupDate: selectedDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
        };
        await pickupService.requestPickupSlot(order.id, slotPayload);
      } catch (slotErr) {
        console.warn('Pickup slot reservation note:', slotErr);
        // Soft-fail slot reservation if already allocated, order itself is successfully created
      }

      // Clear cart
      await cartService.clearCart();

      // Navigate to orders with confirmation state ONLY when real order is confirmed
      navigate('/customer/orders', {
        state: {
          newlyCreatedOrderId: order.id,
          orderPlaced: true,
          pickupDate: selectedDate,
          pickupSlot: selectedSlot.displayLabel,
        },
      });
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Unable to place your order. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    cart,
    shop,
    user,
    dates,
    selectedDate,
    setSelectedDate,
    availableSlots,
    selectedSlot,
    setSelectedSlot,
    loading,
    submitting,
    error,
    setError,
    handleConfirmOrder,
    refetch: loadData,
  };
};
