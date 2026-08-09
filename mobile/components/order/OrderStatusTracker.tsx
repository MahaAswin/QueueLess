import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrderStatus, PickupSlotResponse } from '../../types';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

interface OrderStatusTrackerProps {
  status: OrderStatus;
  pickupSlot?: PickupSlotResponse | null;
}

interface StepInfo {
  key: OrderStatus;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const LIFECYCLE_STEPS: StepInfo[] = [
  {
    key: 'PENDING',
    title: 'Order Placed',
    subtitle: 'Sent to shop',
    icon: 'document-text-outline',
  },
  {
    key: 'CONFIRMED',
    title: 'Order Confirmed',
    subtitle: 'Accepted by shop owner',
    icon: 'checkmark-circle-outline',
  },
  {
    key: 'PREPARING',
    title: 'Preparing Order',
    subtitle: 'Items are being packed',
    icon: 'restaurant-outline',
  },
  {
    key: 'READY_FOR_PICKUP',
    title: 'Ready for Express Pickup',
    subtitle: 'Head to the counter',
    icon: 'bag-check-outline',
  },
  {
    key: 'COLLECTED',
    title: 'Collected',
    subtitle: 'Order completed',
    icon: 'happy-outline',
  },
];

// Helper to determine step index in standard happy path
const getStepIndex = (status: OrderStatus): number => {
  switch (status) {
    case 'PENDING':
      return 0;
    case 'CONFIRMED':
    case 'ACCEPTED': // support legacy name if present
      return 1;
    case 'PREPARING':
      return 2;
    case 'READY_FOR_PICKUP':
      return 3;
    case 'COLLECTED':
    case 'COMPLETED':
      return 4;
    default:
      return -1;
  }
};

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ status, pickupSlot }) => {
  const currentStepIndex = getStepIndex(status);
  const isCancelled = status === 'CANCELLED';
  const isRejected = status === 'REJECTED';

  return (
    <View style={[styles.container, Theme.shadows.soft]}>
      {/* Alert Banner for Cancelled / Rejected */}
      {isCancelled && (
        <View style={styles.cancelledBanner}>
          <Ionicons name="close-circle" size={24} color="#DC2626" />
          <View style={styles.bannerTextContainer}>
            <Text style={styles.cancelledTitle}>Order Cancelled</Text>

            <Text style={styles.cancelledSubtext}>
              This order was cancelled and will not be prepared.
            </Text>
          </View>
        </View>
      )}

      {isRejected && (
        <View style={styles.cancelledBanner}>
          <Ionicons name="alert-circle" size={24} color="#DC2626" />
          <View style={styles.bannerTextContainer}>
            <Text style={styles.cancelledTitle}>Order Declined</Text>

            <Text style={styles.cancelledSubtext}>
              The shop was unable to accept this order.
            </Text>
          </View>
        </View>
      )}

      {/* Timeline Steps */}
      <View style={styles.timelineList}>
        {LIFECYCLE_STEPS.map((step, idx) => {
          const isCompleted = currentStepIndex > idx;
          const isCurrent = currentStepIndex === idx && !isCancelled && !isRejected;
          const isFuture = currentStepIndex < idx || isCancelled || isRejected;

          return (
            <View key={step.key} style={styles.stepRow}>
              {/* Left Column: Icon + Line */}
              <View style={styles.leftColumn}>
                <View
                  style={[
                    styles.nodeCircle,
                    isCompleted && styles.nodeCompleted,
                    isCurrent && styles.nodeCurrent,
                    isFuture && styles.nodeFuture,
                  ]}
                >
                  <Ionicons
                    name={isCompleted ? 'checkmark' : step.icon}
                    size={16}
                    color={
                      isCompleted || isCurrent ? Colors.white : Colors.secondaryText
                    }
                  />
                </View>

                {/* Vertical connecting line */}
                {idx < LIFECYCLE_STEPS.length - 1 && (
                  <View
                    style={[
                      styles.line,
                      isCompleted ? styles.lineCompleted : styles.lineFuture,
                    ]}
                  />
                )}
              </View>

              {/* Right Column: Step Info */}
              <View style={styles.rightColumn}>
                <View style={styles.stepTitleRow}>
                  <Text
                    style={[
                      styles.stepTitle,
                      isCurrent && styles.stepTitleCurrent,
                      isCompleted && styles.stepTitleCompleted,
                      isFuture && styles.stepTitleFuture,
                    ]}
                  >
                    {step.title}
                  </Text>
                  {isCurrent && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>IN PROGRESS</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.stepSubtitle}>
                  {step.subtitle}
                  {step.key === 'READY_FOR_PICKUP' && pickupSlot?.finalStartTime && (
                    ` • ${pickupSlot.finalStartTime.slice(0, 5)}`
                  )}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  bannerTextContainer: {
    marginLeft: Theme.spacing.sm,
    flex: 1,
  },
  cancelledTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: '#DC2626',
  },
  cancelledSubtext: {
    fontSize: Typography.fontSize.xs,
    color: '#991B1B',
    marginTop: 2,
  },
  timelineList: {
    paddingVertical: Theme.spacing.xs,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 56,
  },
  leftColumn: {
    alignItems: 'center',
    width: 32,
    marginRight: Theme.spacing.sm,
  },
  nodeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  nodeCompleted: {
    backgroundColor: Colors.primaryDeep,
  },
  nodeCurrent: {
    backgroundColor: Colors.primaryDeep,
    borderWidth: 3,
    borderColor: Colors.sage,
  },
  nodeFuture: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  lineCompleted: {
    backgroundColor: Colors.primaryDeep,
  },
  lineFuture: {
    backgroundColor: '#E5E7EB',
  },
  rightColumn: {
    flex: 1,
    paddingBottom: Theme.spacing.md,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  stepTitleCurrent: {
    color: Colors.primaryDeep,
    fontSize: Typography.fontSize.md,
  },
  stepTitleCompleted: {
    color: Colors.text,
  },
  stepTitleFuture: {
    color: Colors.secondaryText,
    fontFamily: Typography.fontFamily.medium,
  },
  activeBadge: {
    backgroundColor: Colors.lightSage,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
  },
  activeBadgeText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
  stepSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
  },
});
