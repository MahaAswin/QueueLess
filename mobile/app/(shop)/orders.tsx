import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SectionHeader } from '../../components/SectionHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

const MOCK_SHOP_ORDERS = [
  {
    id: 'so1',
    orderNumber: 'QL-8892',
    customerName: 'Alex Johnson',
    slotTime: '12:30 PM - 12:45 PM',
    itemsCount: 2,
    total: 14.40,
    status: 'READY_FOR_PICKUP' as const,
  },
  {
    id: 'so2',
    orderNumber: 'QL-8895',
    customerName: 'Sarah Smith',
    slotTime: '01:00 PM - 01:15 PM',
    itemsCount: 1,
    total: 5.50,
    status: 'PREPARING' as const,
  },
];

export default function ShopOrdersScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <SectionHeader title="Shop Orders Queue" subtitle="Manage incoming express orders by pickup slot" />
      {MOCK_SHOP_ORDERS.map((ord) => (
        <TouchableOpacity
          key={ord.id}
          style={styles.card}
          onPress={() => router.push(`/(shop)/order/${ord.id}` as any)}
        >
          <View style={styles.rowBetween}>
            <Text style={styles.orderNo}>Order #{ord.orderNumber}</Text>
            <StatusBadge status={ord.status} />
          </View>
          <Text style={styles.customerName}>Customer: {ord.customerName}</Text>
          <Text style={styles.slotText}>Pickup Slot: {ord.slotTime}</Text>

          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.itemsText}>{ord.itemsCount} Items • ${ord.total.toFixed(2)}</Text>
            <Text style={styles.actionLink}>Update Status →</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: {
    padding: Theme.spacing.md,
    paddingTop: Theme.spacing.xl + 10,
    paddingBottom: Theme.spacing.xxl,
  },
  card: {
    backgroundColor: Colors.white,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNo: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.bold, color: Colors.text },
  customerName: { fontSize: Typography.fontSize.sm, color: Colors.secondaryText, marginTop: 4 },
  slotText: { fontSize: Typography.fontSize.xs, color: Colors.primaryDeep, fontFamily: Typography.fontFamily.semibold, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Theme.spacing.sm },
  itemsText: { fontSize: Typography.fontSize.xs, color: Colors.secondaryText },
  actionLink: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.bold, color: Colors.primaryDeep },
});
