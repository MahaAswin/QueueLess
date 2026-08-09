import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader } from '../../components/SectionHeader';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

export default function ShopDashboardScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Shop Owner Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.shopRole}>Shop Manager</Text>
          <Text style={styles.shopTitle}>Green Leaf Organic Café</Text>
        </View>
        <TouchableOpacity style={styles.scannerBtn} onPress={() => router.push('/(shop)/scanner')}>
          <Ionicons name="qr-code-outline" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Quick Scanner Launcher */}
      <View style={[styles.scannerBanner, Theme.shadows.medium]}>
        <View style={styles.bannerInfo}>
          <Text style={styles.bannerTitle}>Express QR Scanner</Text>
          <Text style={styles.bannerSub}>Instant verification & order handoff at counter</Text>
        </View>
        <Button
          title="Open Scanner"
          onPress={() => router.push('/(shop)/scanner')}
          size="small"
          style={styles.scanActionBtn}
        />
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Ionicons name="receipt-outline" size={20} color={Colors.primaryDeep} />
          <Text style={styles.metricValue}>18</Text>
          <Text style={styles.metricLabel}>Today's Orders</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="time-outline" size={20} color={Colors.primaryDeep} />
          <Text style={styles.metricValue}>4</Text>
          <Text style={styles.metricLabel}>Active Slots</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="cash-outline" size={20} color={Colors.primaryDeep} />
          <Text style={styles.metricValue}>$248.50</Text>
          <Text style={styles.metricLabel}>Daily Revenue</Text>
        </View>
      </View>

      {/* Quick Management Links */}
      <SectionHeader title="Shop Management" subtitle="Manage catalog, slots, and customer complaints" />

      <View style={styles.managementList}>
        <TouchableOpacity style={styles.managementCard} onPress={() => router.push('/(shop)/orders')}>
          <Ionicons name="list" size={22} color={Colors.primaryDeep} />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Live Orders Queue</Text>
            <Text style={styles.cardSub}>View pending, preparing, & ready pickup orders</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.secondaryText} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.managementCard} onPress={() => router.push('/(shop)/pickup-slots')}>
          <Ionicons name="calendar-outline" size={22} color={Colors.primaryDeep} />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Pickup Time Slots</Text>
            <Text style={styles.cardSub}>Configure slot limits & order caps per 15 mins</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.secondaryText} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.managementCard} onPress={() => router.push('/(shop)/products')}>
          <Ionicons name="fast-food-outline" size={22} color={Colors.primaryDeep} />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Products & Pricing</Text>
            <Text style={styles.cardSub}>Toggle stock availability & prep duration</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.secondaryText} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.managementCard} onPress={() => router.push('/(shop)/complaints')}>
          <Ionicons name="warning-outline" size={22} color={Colors.error} />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Complaints & Trust Score</Text>
            <Text style={styles.cardSub}>Review no-show reports & resolve violations</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.secondaryText} />
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  shopRole: { fontSize: Typography.fontSize.xs, color: Colors.secondaryText, fontFamily: Typography.fontFamily.medium },
  shopTitle: { fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.bold, color: Colors.primaryDeep },
  scannerBtn: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.primaryDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerBanner: {
    backgroundColor: Colors.primaryDeep,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.lg,
  },
  bannerInfo: { flex: 1, marginRight: Theme.spacing.sm },
  bannerTitle: { color: Colors.white, fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.bold },
  bannerSub: { color: Colors.lightSage, fontSize: Typography.fontSize.xs, marginTop: 2 },
  scanActionBtn: { backgroundColor: Colors.white },
  metricsGrid: { flexDirection: 'row', gap: Theme.spacing.xs, marginBottom: Theme.spacing.lg },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Theme.spacing.sm + 2,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  metricValue: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily.bold, color: Colors.text, marginVertical: 2 },
  metricLabel: { fontSize: Typography.fontSize.xs, color: Colors.secondaryText, textAlign: 'center' },
  managementList: { gap: Theme.spacing.xs },
  managementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTextContainer: { flex: 1, marginLeft: Theme.spacing.sm },
  cardTitle: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.bold, color: Colors.text },
  cardSub: { fontSize: Typography.fontSize.xs, color: Colors.secondaryText, marginTop: 2 },
});
