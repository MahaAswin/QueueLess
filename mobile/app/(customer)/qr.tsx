import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader } from '../../components/SectionHeader';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

export default function QRPassScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color={Colors.primaryDeep} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <SectionHeader title="Express QR Ticket" subtitle="Show this code at the store express pickup counter" />

      <View style={[styles.qrTicketCard, Theme.shadows.medium]}>
        <View style={styles.ticketHeader}>
          <Text style={styles.shopName}>Green Leaf Organic Café</Text>
          <Text style={styles.orderNo}>Order #QL-8892</Text>
        </View>

        <View style={styles.slotBadge}>
          <Ionicons name="time" size={16} color={Colors.primaryDeep} />
          <Text style={styles.slotBadgeText}>Slot: 12:30 PM - 12:45 PM</Text>
        </View>

        <View style={styles.qrContainer}>
          <View style={styles.qrBox}>
            <Ionicons name="qr-code" size={180} color={Colors.primaryDeep} />
          </View>
          <Text style={styles.qrCodeText}>QL-8892-PASSTICKET</Text>
        </View>

        <View style={styles.ticketFooter}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
          <Text style={styles.footerText}>Ready for Instant Scan & Collection</Text>
        </View>
      </View>
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
  qrTicketCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ticketHeader: { alignItems: 'center', marginBottom: Theme.spacing.md },
  shopName: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily.bold, color: Colors.text },
  orderNo: { fontSize: Typography.fontSize.xs, color: Colors.secondaryText, marginTop: 2 },
  slotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightSage,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    marginBottom: Theme.spacing.lg,
  },
  slotBadgeText: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.bold, color: Colors.primaryDeep, marginLeft: 4 },
  qrContainer: { alignItems: 'center', marginVertical: Theme.spacing.md },
  qrBox: {
    padding: Theme.spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.sage,
  },
  qrCodeText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.secondaryText,
    marginTop: Theme.spacing.sm,
    letterSpacing: 1.5,
  },
  ticketFooter: { flexDirection: 'row', alignItems: 'center', marginTop: Theme.spacing.lg },
  footerText: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.semibold, color: Colors.success, marginLeft: Theme.spacing.xs },
});
