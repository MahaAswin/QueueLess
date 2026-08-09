import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PickupSlot } from '../types';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Theme } from '../constants/theme';

interface PickupSlotCardProps {
  slot: PickupSlot;
  isSelected: boolean;
  onSelect: () => void;
}

export const PickupSlotCard: React.FC<PickupSlotCardProps> = ({
  slot,
  isSelected,
  onSelect,
}) => {
  const isFull = slot.currentOrders >= slot.maxOrders;
  const spotsLeft = slot.maxOrders - slot.currentOrders;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onSelect}
      disabled={isFull || !slot.isAvailable}
      style={[
        styles.card,
        isSelected && styles.selectedCard,
        (isFull || !slot.isAvailable) && styles.disabledCard,
      ]}
    >
      <View style={styles.timeContainer}>
        <Ionicons
          name="time-outline"
          size={18}
          color={isSelected ? Colors.white : isFull ? Colors.secondaryText : Colors.primaryDeep}
        />
        <Text
          style={[
            styles.timeText,
            isSelected && styles.selectedText,
            (isFull || !slot.isAvailable) && styles.disabledText,
          ]}
        >
          {slot.startTime} - {slot.endTime}
        </Text>
      </View>

      <View style={styles.capacityBadge}>
        {isFull ? (
          <Text style={styles.fullText}>Full</Text>
        ) : (
          <Text style={[styles.capacityText, isSelected && styles.selectedCapacityText]}>
            {spotsLeft} slot{spotsLeft > 1 ? 's' : ''} left
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
  },
  selectedCard: {
    backgroundColor: Colors.primaryDeep,
    borderColor: Colors.primaryDeep,
  },
  disabledCard: {
    backgroundColor: Colors.inputBackground,
    borderColor: Colors.border,
    opacity: 0.6,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginLeft: Theme.spacing.xs + 2,
  },
  selectedText: {
    color: Colors.white,
  },
  disabledText: {
    color: Colors.secondaryText,
  },
  capacityBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.sm,
  },
  capacityText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.primaryDeep,
  },
  selectedCapacityText: {
    color: Colors.sage,
  },
  fullText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.error,
  },
});
