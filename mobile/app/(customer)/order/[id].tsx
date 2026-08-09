import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader } from '@/components/SectionHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Theme } from '@/constants/theme';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color={Colors.primaryDeep} />
        <Text style={styles.backText}>Back to Orders</Text>
      </TouchableOpacity>

      <SectionHeader title="Order Details" subtitle={`Order #QL-8892`} />

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.shopName}>Green Leaf Organic Café</Text>
          <StatusBadge status="READY_FOR_PICKUP" />
        </View>
        <Text style={styles.address}>142 Market Street, Downtown</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Express Pickup Time</Text>
        <View style={styles.timeRow}>
          <Ionicons name="time" size={20} color={Colors.primaryDeep} />
          <Text style={styles.timeText}>12:30 PM - 12:45 PM (Today)</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Items Ordered</Text>
        <View style={styles.itemRow}>
          <Text style={styles.itemName}>1x Iced Oat Matcha</Text>
          <Text style={styles.itemPrice}>$5.50</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemName}>1x Avocado Toast</Text>
          <Text style={styles.itemPrice}>$8.90</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.itemRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>$14.40</Text>
        </View>
      </View>

      <Button title="Show Express QR Ticket" onPress={() => router.push('/(customer)/qr')} />
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
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: Theme.spacing.md },
  backText: { color: Colors.primaryDeep, fontFamily: Typography.fontFamily.semibold, fontSize: Typography.fontSize.sm, marginLeft: Theme.spacing.xs },
  card: { backgroundColor: Colors.white, padding: Theme.spacing.md, borderRadius: Theme.borderRadius.lg, marginBottom: Theme.spacing.md, borderWidth: 1, borderColor: Colors.border },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shopName: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.bold, color: Colors.text },
  address: { fontSize: Typography.fontSize.xs, color: Colors.secondaryText, marginTop: 4 },
  cardTitle: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.bold, color: Colors.text, marginBottom: Theme.spacing.xs },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: Typography.fontSize.sm, color: Colors.text, marginLeft: Theme.spacing.xs, fontFamily: Typography.fontFamily.semibold },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  itemName: { fontSize: Typography.fontSize.sm, color: Colors.text },
  itemPrice: { fontSize: Typography.fontSize.sm, color: Colors.primaryDeep, fontWeight: Typography.fontWeight.semibold },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Theme.spacing.sm },
  totalLabel: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, color: Colors.text },
  totalPrice: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, color: Colors.primaryDeep },
});
