import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { SectionHeader } from '../../components/SectionHeader';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

const MOCK_SLOTS = [
  { id: '1', time: '12:15 PM - 12:30 PM', cap: '2 / 5 orders' },
  { id: '2', time: '12:30 PM - 12:45 PM', cap: '4 / 5 orders' },
  { id: '3', time: '12:45 PM - 01:00 PM', cap: '5 / 5 orders (FULL)' },
];

export default function ShopPickupSlotsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <SectionHeader title="Pickup Slot Limits" subtitle="Set max orders per 15-minute slot to maintain zero counter wait" />
      {MOCK_SLOTS.map((s) => (
        <View key={s.id} style={styles.card}>
          <Text style={styles.time}>{s.time}</Text>
          <Text style={styles.cap}>{s.cap}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: { padding: Theme.spacing.md, paddingTop: Theme.spacing.xl + 10, paddingBottom: Theme.spacing.xxl },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.white, padding: Theme.spacing.md, borderRadius: Theme.borderRadius.md, marginBottom: Theme.spacing.sm, borderWidth: 1, borderColor: Colors.border },
  time: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.bold, color: Colors.text },
  cap: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.semibold, color: Colors.primaryDeep },
});
