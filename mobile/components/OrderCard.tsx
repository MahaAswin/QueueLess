import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '../types';
import { StatusBadge } from './StatusBadge';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Theme } from '../constants/theme';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  onShowQR?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onPress, onShowQR }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, Theme.shadows.soft]}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.shopName}>{order.shopName}</Text>
          <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={Colors.primaryDeep} />
          <Text style={styles.detailText}>
            Pickup Slot: {order.pickupSlot.startTime} - {order.pickupSlot.endTime}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="bag-handle-outline" size={16} color={Colors.secondaryText} />
          <Text style={styles.detailText}>
            {order.items.length} item{order.items.length > 1 ? 's' : ''} • ${order.totalAmount.toFixed(2)}
          </Text>
        </View>
      </View>

      {onShowQR && (order.status === 'READY_FOR_PICKUP' || order.status === 'ACCEPTED' || order.status === 'PREPARING') && (
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
  shopName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
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
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.sm,
    marginLeft: Theme.spacing.xs,
  },
});
