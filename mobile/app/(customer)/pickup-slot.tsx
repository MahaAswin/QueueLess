import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader } from '../../components/SectionHeader';
import { PickupSlotCard } from '../../components/PickupSlotCard';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';
import { PickupSlot } from '../../types';

const MOCK_SLOTS: PickupSlot[] = [
  { id: '1', shopId: 's1', startTime: '12:15 PM', endTime: '12:30 PM', maxOrders: 5, currentOrders: 2, isAvailable: true },
  { id: '2', shopId: 's1', startTime: '12:30 PM', endTime: '12:45 PM', maxOrders: 5, currentOrders: 4, isAvailable: true },
  { id: '3', shopId: 's1', startTime: '12:45 PM', endTime: '01:00 PM', maxOrders: 5, currentOrders: 5, isAvailable: false },
  { id: '4', shopId: 's1', startTime: '01:00 PM', endTime: '01:15 PM', maxOrders: 5, currentOrders: 1, isAvailable: true },
];

export default function PickupSlotScreen() {
  const router = useRouter();
  const [selectedSlotId, setSelectedSlotId] = useState<string>('2');

  return (
    <View style={styles.flex}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.primaryDeep} />
          <Text style={styles.backText}>Back to Cart</Text>
        </TouchableOpacity>

        <SectionHeader
          title="Select Pickup Time"
          subtitle="QueueLess guarantees your order is prepared fresh & ready exactly at your chosen slot"
        />

        <View style={styles.infoBanner}>
          <Ionicons name="flash" size={20} color={Colors.primaryDeep} />
          <Text style={styles.infoText}>
            Express Slots are limited to avoid shop overload. Arrive during your 15-minute slot for zero wait collection.
          </Text>
        </View>

        {MOCK_SLOTS.map((slot) => (
          <PickupSlotCard
            key={slot.id}
            slot={slot}
            isSelected={selectedSlotId === slot.id}
            onSelect={() => setSelectedSlotId(slot.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Confirm Pickup Time & Proceed"
          onPress={() => router.push('/(customer)/checkout')}
          disabled={!selectedSlotId}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: {
    padding: Theme.spacing.md,
    paddingTop: Theme.spacing.xl + 10,
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightSage,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.sage,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.xs,
    color: Colors.primaryDeep,
    marginLeft: Theme.spacing.xs + 2,
    lineHeight: Typography.lineHeight.xs,
  },
  footer: {
    padding: Theme.spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
