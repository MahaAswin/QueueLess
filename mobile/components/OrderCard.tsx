import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrderResponse } from '../types';
import { StatusBadge } from './StatusBadge';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Theme } from '../constants/theme';

interface OrderCardProps {
  order: OrderResponse;
  onPress: () => void;
  onShowQR?: () => void;
}

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
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
};

export const OrderCard: React.FC<OrderCardProps> = ({ order, onPress, onShowQR }) => {
  const shortId = order.id ? order.id.slice(0, 8).toUpperCase() : '';
  const itemCount = order.items?.length || 0;
  const total = typeof order.totalAmount === 'number' ? order.totalAmount : parseFloat(order.totalAmount || '0');

  const slot = order.pickupSlot;
  const pickupTimeText = slot
    ? `${formatDateShort(slot.finalPickupDate || slot.pickupDate)} • ${formatTimeLabel(
        slot.finalStartTime || slot.requestedStartTime
      )} – ${formatTimeLabel(slot.finalEndTime || slot.requestedEndTime)}`
    : 'Pickup not scheduled';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, Theme.shadows.soft]}
    >
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.shopName} numberOfLines={1}>{order.shopName || 'Partner Shop'}</Text>
          <Text style={styles.orderNumber}>Order #{shortId} • {formatDateShort(order.createdAt)}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={Colors.primaryDeep} />
          <Text style={styles.detailText} numberOfLines={1}>
            Pickup: {pickupTimeText}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="bag-handle-outline" size={16} color={Colors.secondaryText} />
          <Text style={styles.detailText}>
            {itemCount} item{itemCount !== 1 ? 's' : ''} • ₹{total.toFixed(2)}
          </Text>
        </View>
      </View>

      {onShowQR && (order.status === 'READY_FOR_PICKUP' || order.status === 'CONFIRMED' || order.status === 'PREPARING') && (
        <TouchableOpacity style={styles.qrButton} onPress={onShowQR}>
          <Ionicons name="qr-code-outline" size={18} color={Colors.white} />
          <Text style={styles.qrButtonText}>View Express QR Ticket</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitleGroup: {
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  shopName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  orderNumber: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Theme.spacing.sm,
  },
  detailsContainer: {
    gap: Theme.spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    marginLeft: Theme.spacing.xs,
    flex: 1,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryDeep,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    marginTop: Theme.spacing.md,
  },
  qrButtonText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.sm,
    marginLeft: Theme.spacing.xs,
  },
});
