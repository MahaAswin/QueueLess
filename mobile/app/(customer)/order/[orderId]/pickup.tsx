import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { OrderService } from '../../../../services/order.service';
import { ShopService } from '../../../../services/shop.service';
import { PickupService } from '../../../../services/pickup.service';
import {
  OrderResponse,
  ShopResponse,
  PickupSlotResponse,
  TimeSlotOption,
} from '../../../../types';
import { Button } from '../../../../components/Button';
import { LoadingState } from '../../../../components/LoadingState';
import { EmptyState } from '../../../../components/EmptyState';
import { Colors } from '../../../../constants/colors';
import { Typography } from '../../../../constants/typography';
import { Theme } from '../../../../constants/theme';

// Helper: Format ISO Date (YYYY-MM-DD) to friendly string e.g. "Today", "Tomorrow", "Mon, Aug 10"
const formatDayChip = (dateStr: string, index: number): { dayLabel: string; dateLabel: string } => {
  if (index === 0) return { dayLabel: 'TODAY', dateLabel: formatDateShort(dateStr) };
  if (index === 1) return { dayLabel: 'TOMORROW', dateLabel: formatDateShort(dateStr) };
  
  const d = new Date(dateStr + 'T00:00:00');
  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dateNum = formatDateShort(dateStr);
  return { dayLabel: dayName, dateLabel: dateNum };
};

const formatDateShort = (dateStr: string): string => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper: Format LocalTime string ("14:30:00" or "14:30") to "2:30 PM"
const formatTimeLabel = (timeStr?: string | null): string => {
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

// Helper: Generate next 7 days in YYYY-MM-DD
const generateDates = (): string[] => {
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
const generateTimeSlots = (
  dateStr: string,
  openTimeStr?: string | null,
  closeTimeStr?: string | null
): TimeSlotOption[] => {
  const slots: TimeSlotOption[] = [];

  let openHour = 8;
  let openMinute = 0;
  let closeHour = 20;
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
      // If slot start time has already passed today (+ 5 min buffer), mark unavailable
      if (startTotalMinutes <= currentHour * 60 + currentMinute + 5) {
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

export default function PickupScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();

  const [dates] = useState<string[]>(generateDates());
  const [selectedDate, setSelectedDate] = useState<string>(dates[0]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotOption | null>(null);

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [shop, setShop] = useState<ShopResponse | null>(null);
  const [existingSlot, setExistingSlot] = useState<PickupSlotResponse | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!orderId) {
      setErrorMsg('Invalid order identifier.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      // Fetch Order details
      const orderData = await OrderService.getOrderById(orderId);
      setOrder(orderData);

      // Fetch Shop details to get exact operating hours and address
      if (orderData.shopId) {
        try {
          const shopData = await ShopService.getShopById(orderData.shopId);
          setShop(shopData);
        } catch (shopErr) {
          console.warn('[PickupScreen] Could not load shop details:', shopErr);
        }
      }

      // Fetch existing pickup slot if any
      const slotData = await PickupService.getSlotByOrder(orderId);
      setExistingSlot(slotData || orderData.pickupSlot || null);
    } catch (err: any) {
      console.error('[PickupScreen] Error loading data:', err);
      const msg = err.response?.data?.message || 'Failed to load order details. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Generate slots for current date selection
  const timeSlots = generateTimeSlots(selectedDate, shop?.openingTime, shop?.closingTime);

  // Handle slot confirmation POST /api/orders/{orderId}/pickup-slot
  const handleConfirmPickup = async () => {
    if (!selectedSlot || submitting || !orderId) return;

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const response = await PickupService.requestPickupSlot(orderId, {
        pickupDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });

      setExistingSlot(response);
    } catch (err: any) {
      console.warn('[PickupScreen] Slot request failed:', err);
      const status = err.response?.status;
      const backendMessage = err.response?.data?.message || err.message || '';

      if (status === 400 && backendMessage.toLowerCase().includes('past')) {
        setErrorMsg('Pickup date/time cannot be in the past.');
      } else if (status === 400 && backendMessage.toLowerCase().includes('operating')) {
        setErrorMsg('Pickup time must be within shop operating hours.');
      } else if (status === 400 || status === 409) {
        setErrorMsg('This pickup slot is no longer available. Please choose another time.');
      } else if (status === 403) {
        setErrorMsg('You are not authorized to schedule pickup for this order.');
      } else {
        setErrorMsg('Unable to schedule pickup. Please check your connection and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Customer Accept Counter Proposal
  const handleAcceptProposal = async () => {
    if (!existingSlot || actionLoading) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      const updated = await PickupService.customerAcceptSlot(existingSlot.slotId);
      setExistingSlot(updated);
    } catch (err: any) {
      console.error('[PickupScreen] Failed to accept proposal:', err);
      setErrorMsg('Unable to accept counter-proposal. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Customer Reject Counter Proposal
  const handleRejectProposal = async () => {
    if (!existingSlot || actionLoading) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      const updated = await PickupService.customerRejectSlot(existingSlot.slotId);
      setExistingSlot(updated);
    } catch (err: any) {
      console.error('[PickupScreen] Failed to reject proposal:', err);
      setErrorMsg('Unable to reject counter-proposal. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <LoadingState message="Loading pickup options..." />
      </SafeAreaView>
    );
  }

  if (errorMsg && !order) {
    return (
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <EmptyState
          title="Unable to Load Order"
          message={errorMsg}
          actionTitle="Try Again"
          onActionPress={loadData}
        />
      </SafeAreaView>
    );
  }

  // Check if slot is confirmed
  const isConfirmed =
    existingSlot?.status === 'ACCEPTED' || existingSlot?.status === 'CUSTOMER_ACCEPTED';

  // Check if slot is requested (pending shop response)
  const isRequestedPending = existingSlot?.status === 'REQUESTED';

  // Check if shop counter-proposed
  const isCounterProposed = existingSlot?.status === 'COUNTER_PROPOSED';

  // Check if shop or customer rejected (allows selecting new slot)
  const isRejected =
    existingSlot?.status === 'SHOP_REJECTED' || existingSlot?.status === 'CUSTOMER_REJECTED';

  // SUCCESS STATE VIEW
  if (isConfirmed && existingSlot) {
    const finalDate = existingSlot.finalPickupDate || existingSlot.pickupDate;
    const finalStart = existingSlot.finalStartTime || existingSlot.requestedStartTime;
    const finalEnd = existingSlot.finalEndTime || existingSlot.requestedEndTime;

    return (
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.successContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(customer)/orders')}>
            <Ionicons name="arrow-back" size={20} color={Colors.primaryDeep} />
            <Text style={styles.backText}>My Orders</Text>
          </TouchableOpacity>

          <View style={styles.successIconWrapper}>
            <Ionicons name="checkmark-circle" size={80} color={Colors.primaryDeep} />
          </View>

          <Text style={styles.successTitle}>✓ Pickup Scheduled</Text>

          <Text style={styles.orderIdBadge}>Order #{orderId?.slice(0, 8).toUpperCase()}</Text>

          <View style={[styles.card, Theme.shadows.soft]}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="storefront" size={22} color={Colors.primaryDeep} />
              <View style={styles.shopTextWrapper}>
                <Text style={styles.cardShopTitle}>{order?.shopName || shop?.shopName || 'Partner Shop'}</Text>

                {(shop?.address || shop?.city) && (
                  <Text style={styles.shopAddress}>
                    {[shop.address, shop.city].filter(Boolean).join(', ')}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pickup Date</Text>
              <Text style={styles.detailValue}>{formatDateShort(finalDate)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time Window</Text>
              <Text style={styles.highlightTime}>
                {formatTimeLabel(finalStart)} – {formatTimeLabel(finalEnd)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pickup Status</Text>
              <View style={styles.statusConfirmedBadge}>
                <Ionicons name="checkmark-done" size={14} color={Colors.primaryDeep} />
                <Text style={styles.statusConfirmedText}>Confirmed by Shop</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoBanner}>
            <Ionicons name="flash-outline" size={20} color={Colors.primaryDeep} />
            <Text style={styles.infoText}>
              Please present your order ID or QR ticket at the shop counter during your express pickup window.
            </Text>
          </View>

          <Button
            title="View Order Details"
            onPress={() => router.push(`/(customer)/order/${orderId}` as any)}
            style={styles.primaryCta}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // PENDING SHOP APPROVAL VIEW
  if (isRequestedPending && existingSlot) {
    return (
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.successContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.primaryDeep} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.pendingIconWrapper}>
            <Ionicons name="time-outline" size={72} color={Colors.primaryDeep} />
          </View>

          <Text style={styles.successTitle}>Pickup Requested</Text>

          <Text style={styles.orderIdBadge}>Order #{orderId?.slice(0, 8).toUpperCase()}</Text>

          <View style={[styles.card, Theme.shadows.soft]}>
            <Text style={styles.pendingCardHeader}>Awaiting Shop Confirmation</Text>

            <Text style={styles.pendingSubtext}>
              Your requested pickup time has been sent to {order?.shopName || 'the shop'}. You will receive a confirmation once accepted.
            </Text>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Requested Date</Text>
              <Text style={styles.detailValue}>{formatDateShort(existingSlot.pickupDate)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time Window</Text>
              <Text style={styles.detailValue}>
                {formatTimeLabel(existingSlot.requestedStartTime)} – {formatTimeLabel(existingSlot.requestedEndTime)}
              </Text>
            </View>
          </View>

          <Button
            title="View Order Status"
            onPress={() => router.push(`/(customer)/order/${orderId}` as any)}
            style={styles.primaryCta}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // SELECTION & COUNTER PROPOSAL VIEW
  return (
    <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
      <View style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.primaryDeep} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.screenTitle}>Choose Pickup Time</Text>
          <Text style={styles.screenSubtitle}>Pick a convenient time to collect your order.</Text>

          {/* Shop Card */}
          <View style={[styles.card, styles.shopCard, Theme.shadows.soft]}>
            <Ionicons name="storefront" size={24} color={Colors.primaryDeep} />
            <View style={styles.shopTextWrapper}>
              <Text style={styles.shopName}>{order?.shopName || shop?.shopName || 'Partner Shop'}</Text>

              {(shop?.address || shop?.city) && (
                <Text style={styles.shopAddress}>
                  {[shop.address, shop.city].filter(Boolean).join(', ')}
                </Text>
              )}

              {shop?.openingTime && shop?.closingTime && (
                <Text style={styles.operatingHoursText}>
                  Hours: {formatTimeLabel(shop.openingTime)} – {formatTimeLabel(shop.closingTime)}
                </Text>
              )}
            </View>
          </View>

          {/* Error Banner */}
          {errorMsg && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color={Colors.error} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* COUNTER PROPOSAL CARD */}
          {isCounterProposed && existingSlot && (
            <View style={[styles.card, styles.counterCard, Theme.shadows.soft]}>
              <View style={styles.counterHeader}>
                <Ionicons name="swap-horizontal" size={24} color={Colors.primaryDeep} />
                <Text style={styles.counterTitle}>Shop Suggested a New Time</Text>
              </View>

              <Text style={styles.counterText}>
                The shop isn't available for your original slot and has proposed:
              </Text>

              <View style={styles.counterTimeBox}>
                <Text style={styles.counterDateText}>
                  {formatDateShort(existingSlot.proposedDate || existingSlot.pickupDate)}
                </Text>

                <Text style={styles.counterTimeRange}>
                  {formatTimeLabel(existingSlot.proposedStartTime)} – {formatTimeLabel(existingSlot.proposedEndTime)}
                </Text>
              </View>

              <View style={styles.counterActions}>
                <Button
                  title="Accept Proposal"
                  onPress={handleAcceptProposal}
                  loading={actionLoading}
                  style={styles.counterAcceptBtn}
                />

                <Button
                  title="Choose Another Time"
                  onPress={handleRejectProposal}
                  variant="outline"
                  loading={actionLoading}
                  style={styles.counterRejectBtn}
                />
              </View>
            </View>
          )}

          {/* REJECTED WARNING */}
          {isRejected && (
            <View style={styles.warningBanner}>
              <Ionicons name="information-circle" size={20} color={Colors.primaryDeep} />
              <Text style={styles.warningText}>
                Previous pickup slot request was declined. Please choose another time slot below.
              </Text>
            </View>
          )}

          {/* DATE SELECTION (Horizontal) */}
          <Text style={styles.sectionHeaderTitle}>Select Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateSelectorContainer}
          >
            {dates.map((dStr, idx) => {
              const { dayLabel, dateLabel } = formatDayChip(dStr, idx);
              const isSelected = selectedDate === dStr;

              return (
                <TouchableOpacity
                  key={dStr}
                  style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                  onPress={() => {
                    setSelectedDate(dStr);
                    setSelectedSlot(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dateChipDay, isSelected && styles.dateChipTextSelected]}>
                    {dayLabel}
                  </Text>
                  <Text style={[styles.dateChipNum, isSelected && styles.dateChipTextSelected]}>
                    {dateLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* TIME SLOTS GRID / LIST */}
          <Text style={styles.sectionHeaderTitle}>Available Time Slots</Text>

          {timeSlots.length === 0 ? (
            <View style={styles.emptySlotsBox}>
              <Ionicons name="calendar-outline" size={36} color={Colors.secondaryText} />
              <Text style={styles.emptySlotsTitle}>No pickup slots available.</Text>
              <Text style={styles.emptySlotsSub}>Please try selecting another date.</Text>
            </View>
          ) : (
            <View style={styles.slotsContainer}>
              {timeSlots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                const isDisabled = !slot.isAvailable;

                return (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.slotCard,
                      isSelected && styles.slotCardSelected,
                      isDisabled && styles.slotCardDisabled,
                    ]}
                    onPress={() => {
                      if (!isDisabled) {
                        setSelectedSlot(slot);
                      }
                    }}
                    disabled={isDisabled}
                    activeOpacity={0.7}
                  >
                    <View style={styles.slotRadioRow}>
                      <Ionicons
                        name={
                          isSelected
                            ? 'radio-button-on'
                            : isDisabled
                            ? 'close-circle-outline'
                            : 'radio-button-off'
                        }
                        size={20}
                        color={
                          isSelected
                            ? Colors.primaryDeep
                            : isDisabled
                            ? Colors.secondaryText
                            : Colors.secondaryText
                        }
                      />
                      <Text
                        style={[
                          styles.slotTimeText,
                          isSelected && styles.slotTimeTextSelected,
                          isDisabled && styles.slotTimeTextDisabled,
                        ]}
                      >
                        {slot.displayLabel}
                      </Text>
                    </View>

                    {isDisabled && <Text style={styles.fullBadge}>UNAVAILABLE</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* BOTTOM CTA FOOTER */}
        <View style={styles.footer}>
          <Button
            title="Confirm Pickup Time"
            onPress={handleConfirmPickup}
            disabled={!selectedSlot || submitting}
            loading={submitting}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  backText: {
    color: Colors.primaryDeep,
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.sm,
    marginLeft: Theme.spacing.xs,
  },
  screenTitle: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  screenSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.secondaryText,
    marginTop: 4,
    marginBottom: Theme.spacing.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shopCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopTextWrapper: {
    marginLeft: Theme.spacing.md,
    flex: 1,
  },
  shopName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  shopAddress: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  operatingHoursText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primaryDeep,
    fontFamily: Typography.fontFamily.medium,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Theme.spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDE8E8',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: '#F8B4B4',
  },
  errorText: {
    flex: 1,
    color: Colors.error,
    fontSize: Typography.fontSize.xs,
    marginLeft: Theme.spacing.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightSage,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.sage,
  },
  warningText: {
    flex: 1,
    color: Colors.primaryDeep,
    fontSize: Typography.fontSize.xs,
    marginLeft: Theme.spacing.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  sectionHeaderTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  dateSelectorContainer: {
    paddingVertical: Theme.spacing.xs,
    marginBottom: Theme.spacing.md,
  },
  dateChip: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Theme.spacing.sm,
    alignItems: 'center',
    minWidth: 80,
  },
  dateChipSelected: {
    backgroundColor: Colors.primaryDeep,
    borderColor: Colors.primaryDeep,
  },
  dateChipDay: {
    fontSize: Typography.fontSize.xs - 1,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.secondaryText,
  },
  dateChipNum: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text,
    marginTop: 2,
  },
  dateChipTextSelected: {
    color: Colors.white,
  },
  slotsContainer: {
    gap: Theme.spacing.sm,
  },
  slotCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  slotCardSelected: {
    borderColor: Colors.primaryDeep,
    backgroundColor: Colors.lightSage,
    borderWidth: 2,
  },
  slotCardDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.6,
  },
  slotRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotTimeText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
    marginLeft: Theme.spacing.sm,
  },
  slotTimeTextSelected: {
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
  slotTimeTextDisabled: {
    color: Colors.secondaryText,
    textDecorationLine: 'line-through',
  },
  fullBadge: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.secondaryText,
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emptySlotsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptySlotsTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginTop: Theme.spacing.sm,
  },
  emptySlotsSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  footer: {
    padding: Theme.spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  // COUNTER PROPOSAL STYLES
  counterCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
    borderWidth: 1,
  },
  counterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  counterTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginLeft: Theme.spacing.xs,
  },
  counterText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginBottom: Theme.spacing.sm,
  },
  counterTimeBox: {
    backgroundColor: Colors.white,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: Theme.spacing.md,
  },
  counterDateText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    fontFamily: Typography.fontFamily.medium,
  },
  counterTimeRange: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
    marginTop: 2,
  },
  counterActions: {
    gap: Theme.spacing.xs,
  },
  counterAcceptBtn: {
    backgroundColor: Colors.primaryDeep,
  },
  counterRejectBtn: {
    borderColor: Colors.primaryDeep,
  },
  // SUCCESS STATE STYLES
  successContent: {
    padding: Theme.spacing.lg,
    alignItems: 'center',
  },
  successIconWrapper: {
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.md,
  },
  pendingIconWrapper: {
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.md,
  },
  successTitle: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
    textAlign: 'center',
  },
  orderIdBadge: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.secondaryText,
    backgroundColor: Colors.lightSage,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.lg,
    marginTop: Theme.spacing.xs,
    marginBottom: Theme.spacing.lg,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardShopTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Theme.spacing.xs,
  },
  detailLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.secondaryText,
  },
  detailValue: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text,
  },
  highlightTime: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
  statusConfirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightSage,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.sm,
  },
  statusConfirmedText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
    marginLeft: 4,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightSage,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: Colors.sage,
    width: '100%',
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.xs,
    color: Colors.primaryDeep,
    marginLeft: Theme.spacing.xs,
    lineHeight: Typography.lineHeight.xs,
  },
  pendingCardHeader: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  pendingSubtext: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    lineHeight: Typography.lineHeight.xs,
  },
  primaryCta: {
    width: '100%',
  },
});
