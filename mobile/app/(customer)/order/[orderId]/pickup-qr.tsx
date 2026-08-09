import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

import { OrderService } from '../../../../services/order.service';
import { PickupService } from '../../../../services/pickup.service';
import { OrderResponse, PickupQrResponse } from '../../../../types';
import { Button } from '../../../../components/Button';
import { LoadingState } from '../../../../components/LoadingState';
import { EmptyState } from '../../../../components/EmptyState';
import { Colors } from '../../../../constants/colors';
import { Typography } from '../../../../constants/typography';
import { Theme } from '../../../../constants/theme';

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

const formatDateShort = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
  } catch {
    return dateStr;
  }
};

export default function PickupQrScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [qrData, setQrData] = useState<PickupQrResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshingQr, setRefreshingQr] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load Order and Pickup QR Data
  const loadData = useCallback(async () => {
    if (!orderId) {
      setErrorMsg('Invalid order identifier.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      // Fetch Order Details
      const orderData = await OrderService.getOrderById(orderId);
      setOrder(orderData);

      // If status is READY_FOR_PICKUP, fetch secure QR payload
      if (orderData.status === 'READY_FOR_PICKUP') {
        const qrResponse = await PickupService.getPickupQR(orderId);
        setQrData(qrResponse);
      }
    } catch (err: any) {
      console.error('[PickupQrScreen] Error loading QR data:', err);
      const msg =
        err.response?.data?.message ||
        'Unable to load pickup QR pass. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Regeneration Handler
  const handleRegenerateQr = async () => {
    if (!orderId || refreshingQr) return;
    try {
      setRefreshingQr(true);
      setErrorMsg(null);

      const qrResponse = await PickupService.getPickupQR(orderId);
      setQrData(qrResponse);
    } catch (err: any) {
      console.error('[PickupQrScreen] Regeneration error:', err);
      const msg = err.response?.data?.message || 'Failed to refresh QR code.';
      setErrorMsg(msg);
    } finally {
      setRefreshingQr(false);
    }
  };

  // Countdown timer logic
  useEffect(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    if (!qrData?.expiresAt) {
      setSecondsLeft(null);
      return;
    }

    const calcRemaining = () => {
      // Backend returns ISO LocalDateTime string without offset e.g. "2026-08-09T19:42:00"
      const expTime = new Date(qrData.expiresAt).getTime();
      const now = new Date().getTime();
      const diffSec = Math.floor((expTime - now) / 1000);
      return Math.max(0, diffSec);
    };

    setSecondsLeft(calcRemaining());

    countdownTimerRef.current = setInterval(() => {
      const rem = calcRemaining();
      setSecondsLeft(rem);
      if (rem <= 0 && countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [qrData?.expiresAt]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <LoadingState message="Fetching secure pickup QR code..." />
      </SafeAreaView>
    );
  }

  if (errorMsg && !order) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <EmptyState
          title="QR Unavailable"
          message={errorMsg}
          actionTitle="Try Again"
          onActionPress={loadData}
        />
      </SafeAreaView>
    );
  }

  // Check order eligibility: ONLY READY_FOR_PICKUP is eligible for active QR
  const isEligible = order?.status === 'READY_FOR_PICKUP';
  const isCollected = order?.status === 'COLLECTED';
  const isCancelled = order?.status === 'CANCELLED';

  if (!isEligible) {
    let title = 'Pickup QR Unavailable';
    let message = 'Your order is not ready for express pickup yet.';

    if (isCollected) {
      title = 'Order Already Collected';
      message = 'This order has already been picked up successfully.';
    } else if (isCancelled) {
      title = 'Order Cancelled';
      message = 'This order was cancelled.';
    } else if (order?.status === 'PREPARING' || order?.status === 'CONFIRMED' || order?.status === 'PENDING') {
      title = 'Order Is Being Prepared';
      message = `Your order status is currently "${order.status.replace(/_/g, ' ')}". Your pickup QR code will appear as soon as the shop marks it ready.`;
    }

    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <EmptyState
          icon={isCollected ? 'checkmark-circle-outline' : 'time-outline'}
          title={title}
          message={message}
          actionTitle="View Live Tracker"
          onActionPress={() => router.push(`/(customer)/order/${orderId}` as any)}
        />
      </SafeAreaView>
    );
  }

  const isExpired = secondsLeft !== null && secondsLeft <= 0;
  const minutes = secondsLeft ? Math.floor(secondsLeft / 60) : 0;
  const seconds = secondsLeft ? secondsLeft % 60 : 0;
  const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const slot = order?.pickupSlot;
  const finalDate = slot?.finalPickupDate || slot?.pickupDate;
  const finalStart = slot?.finalStartTime || slot?.requestedStartTime;
  const finalEnd = slot?.finalEndTime || slot?.requestedEndTime;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Back navigation */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.push(`/(customer)/order/${orderId}` as any)}>
          <Ionicons name="arrow-back" size={20} color={Colors.primaryDeep} />
          <Text style={styles.backText}>Order Details</Text>
        </TouchableOpacity>

        {/* Screen Header */}
        <Text style={styles.screenTitle}>Pickup QR Code</Text>
        <Text style={styles.screenSubtitle}>
          Show this QR code at the shop counter to collect your order.
        </Text>

        {/* Main QR Card */}
        <View style={[styles.qrCard, Theme.shadows.medium]}>
          {/* Shop & Order Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.shopName}>{order?.shopName || 'Partner Shop'}</Text>
            <Text style={styles.orderIdText}>Order #{orderId?.slice(0, 8).toUpperCase()}</Text>
          </View>

          {/* Confirmed Pickup Slot Badge */}
          {finalDate && (
            <View style={styles.slotBadge}>
              <Ionicons name="time-outline" size={16} color={Colors.primaryDeep} />
              <Text style={styles.slotBadgeText}>
                {formatDateShort(finalDate)} • {formatTimeLabel(finalStart)} – {formatTimeLabel(finalEnd)}
              </Text>
            </View>
          )}

          {/* QR Render Box */}
          <View style={styles.qrBoxWrapper}>
            {isExpired ? (
              <View style={styles.expiredBox}>
                <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
                <Text style={styles.expiredTitle}>QR Code Expired</Text>
                <Text style={styles.expiredSub}>
                  Pickup QR tokens expire for safety. Tap below to generate a new token.
                </Text>
              </View>
            ) : qrData?.pickupToken ? (
              <View style={styles.qrSvgContainer}>
                <QRCode
                  value={qrData.pickupToken}
                  size={210}
                  color={Colors.primaryDeep}
                  backgroundColor={Colors.white}
                />
              </View>
            ) : (
              <ActivityIndicator size="large" color={Colors.primaryDeep} />
            )}
          </View>

          {/* Expiration Countdown Bar */}
          {!isExpired && secondsLeft !== null && (
            <View style={styles.timerBadge}>
              <Ionicons name="timer-outline" size={16} color={Colors.primaryDeep} />
              <Text style={styles.timerText}>QR expires in {formattedCountdown}</Text>
            </View>
          )}

          <Text style={styles.instructionText}>Show this code directly to shop staff.</Text>
        </View>

        {/* Actions / Refresh Button */}
        <View style={styles.actionsContainer}>
          {isExpired || refreshingQr ? (
            <Button
              title="Generate New QR"
              onPress={handleRegenerateQr}
              loading={refreshingQr}
              style={styles.primaryCta}
            />
          ) : (
            <Button
              title="Refresh QR Code"
              variant="outline"
              onPress={handleRegenerateQr}
              loading={refreshingQr}
              style={styles.secondaryCta}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: {
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
  qrCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Theme.spacing.lg,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  shopName: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  orderIdText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  slotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightSage,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    marginBottom: Theme.spacing.md,
  },
  slotBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
    marginLeft: 4,
  },
  qrBoxWrapper: {
    marginVertical: Theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 230,
    width: '100%',
  },
  qrSvgContainer: {
    padding: Theme.spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.sage,
  },
  expiredBox: {
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: '#FEE2E2',
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    width: '100%',
  },
  expiredTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.error,
    marginTop: Theme.spacing.xs,
  },
  expiredSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginTop: 4,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: Theme.spacing.sm,
  },
  timerText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
    marginLeft: 4,
  },
  instructionText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.secondaryText,
    marginTop: Theme.spacing.xs,
    textAlign: 'center',
  },
  actionsContainer: {
    width: '100%',
  },
  primaryCta: {
    width: '100%',
  },
  secondaryCta: {
    width: '100%',
  },
});
