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

export default function ShopOrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color={Colors.primaryDeep} />
        <Text style={styles.backText}>Back to Orders</Text>
      </TouchableOpacity>

      <SectionHeader title="Manage Order #QL-8892" subtitle="Customer: Alex Johnson" />

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Status</Text>
          <StatusBadge status="READY_FOR_PICKUP" />
        </View>
        <Text style={styles.slotText}>Reserved Slot: 12:30 PM - 12:45 PM</Text>
      </View>

      <View style={styles.actionSection}>
        <Text style={styles.actionTitle}>Update Status</Text>
        <View style={styles.btnRow}>
          <Button title="Mark Preparing" onPress={() => {}} variant="outline" style={styles.actionBtn} />
          <Button title="Mark Ready" onPress={() => {}} variant="primary" style={styles.actionBtn} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: { padding: Theme.spacing.md, paddingTop: Theme.spacing.xl + 10, paddingBottom: Theme.spacing.xxl },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: Theme.spacing.md },
  backText: { color: Colors.primaryDeep, fontFamily: Typography.fontFamily.semibold, fontSize: Typography.fontSize.sm, marginLeft: Theme.spacing.xs },
  card: { backgroundColor: Colors.white, padding: Theme.spacing.md, borderRadius: Theme.borderRadius.lg, marginBottom: Theme.spacing.md, borderWidth: 1, borderColor: Colors.border },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.bold, color: Colors.text },
  slotText: { fontSize: Typography.fontSize.sm, color: Colors.secondaryText, marginTop: 4 },
  actionSection: { marginTop: Theme.spacing.md },
  actionTitle: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.bold, color: Colors.text, marginBottom: Theme.spacing.sm },
  btnRow: { flexDirection: 'row', gap: Theme.spacing.sm },
  actionBtn: { flex: 1 },
});
