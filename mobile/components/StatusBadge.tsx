import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OrderStatus } from '../types';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Theme } from '../constants/theme';

interface StatusBadgeProps {
  status: OrderStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'PENDING':
        return { label: 'Pending', bg: '#FFF4E5', text: '#D97706' };
      case 'CONFIRMED':
        return { label: 'Confirmed', bg: '#E0F2FE', text: '#0284C7' };
      case 'ACCEPTED':
        return { label: 'Accepted', bg: Colors.lightSage, text: Colors.primaryDeep };
      case 'PREPARING':
        return { label: 'Preparing', bg: '#FEF3C7', text: '#B45309' };
      case 'READY_FOR_PICKUP':
        return { label: 'Ready for Pickup', bg: Colors.lightSage, text: Colors.primaryDeep };
      case 'COLLECTED':
      case 'COMPLETED':
        return { label: 'Collected', bg: '#DCFCE7', text: '#15803D' };
      case 'REJECTED':
        return { label: 'Rejected', bg: '#FEE2E2', text: '#DC2626' };
      case 'CANCELLED':
        return { label: 'Cancelled', bg: '#FEE2E2', text: '#DC2626' };
      default:
        return { label: status, bg: Colors.lightSage, text: Colors.text };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Theme.spacing.sm + 2,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.fontWeight.semibold,
  },
});
