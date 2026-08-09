import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader } from '../../components/SectionHeader';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

export default function CheckoutScreen() {
  const router = useRouter();

  return (
    <View style={styles.flex}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.primaryDeep} />
          <Text style={styles.backText}>Back to Slot</Text>
        </TouchableOpacity>

        <SectionHeader title="Confirm Express Order" subtitle="Review details before generating your pickup pass" />

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Shop Details</Text>
          <Text style={styles.cardTitle}>Green Leaf Organic Café</Text>
          <Text style={styles.cardSub}>142 Market Street, Downtown (0.4 km away)</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Reserved Pickup Slot</Text>
          <View style={styles.slotRow}>
            <Ionicons name="time" size={20} color={Colors.primaryDeep} />
            <Text style={styles.slotText}>Today, 12:30 PM - 12:45 PM</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Payment Method</Text>
          <View style={styles.slotRow}>
            <Ionicons name="card" size={20} color={Colors.primaryDeep} />
            <Text style={styles.slotText}>Pay at Counter upon QR Scan</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Place Order & Get QR Pass"
          onPress={() => router.push('/(customer)/qr')}
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
  card: {
    backgroundColor: Colors.white,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: { fontSize: Typography.fontSize.xs, color: Colors.secondaryText, marginBottom: 4 },
  cardTitle: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.bold, color: Colors.text },
  cardSub: { fontSize: Typography.fontSize.xs, color: Colors.secondaryText, marginTop: 2 },
  slotRow: { flexDirection: 'row', alignItems: 'center', marginTop: Theme.spacing.xs },
  slotText: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.semibold, color: Colors.text, marginLeft: Theme.spacing.xs },
  footer: { padding: Theme.spacing.md, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
});
