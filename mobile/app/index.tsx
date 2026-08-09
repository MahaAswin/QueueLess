import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Theme } from '../constants/theme';
import { Button } from '../components/Button';
import { SecondaryButton } from '../components/SecondaryButton';

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'ORDER',
    description: 'Browse nearby shops & customize your fresh items',
    icon: 'bag-handle-outline' as const,
  },
  {
    step: '02',
    title: 'PICKUP TIME',
    description: 'Select your preferred 15-minute slot',
    icon: 'time-outline' as const,
  },
  {
    step: '03',
    title: 'ARRIVE',
    description: 'Walk to the store at your chosen slot',
    icon: 'walk-outline' as const,
  },
  {
    step: '04',
    title: 'SHOW QR',
    description: 'Instant scan at Express Counter',
    icon: 'qr-code-outline' as const,
  },
  {
    step: '05',
    title: 'COLLECT',
    description: 'Grab your order with zero waiting in line',
    icon: 'checkmark-done-circle-outline' as const,
  },
];

const NEARBY_SHOPS_PREVIEW = [
  {
    id: 's1',
    name: 'Green Leaf Organic Café',
    category: 'Coffee & Tea',
    distance: '0.4 km',
    prepTime: '~8 mins slot',
    rating: '4.9 ★',
    badge: '100% Zero-Wait',
  },
  {
    id: 's2',
    name: 'Artisan Oven Bakery',
    category: 'Bakery & Pastries',
    distance: '0.9 km',
    prepTime: '~5 mins slot',
    rating: '4.8 ★',
    badge: 'Express Counter',
  },
];

export default function LandingHomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const handleStartOrdering = () => {
    router.push('/(customer)');
  };

  const handleExploreShops = () => {
    router.push('/(customer)/shops');
  };

  const handleShopOwnerDemo = () => {
    router.push('/(shop-owner)/dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Ionicons name="flash" size={20} color={Colors.white} />
            </View>
            <View>
              <Text style={styles.brandName}>QueueLess</Text>
              <Text style={styles.brandTagline}>EXPRESS PICKUP</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.roleChip}
            onPress={handleShopOwnerDemo}
            activeOpacity={0.7}
          >
            <Ionicons name="storefront-outline" size={14} color={Colors.primaryDeep} />
            <Text style={styles.roleChipText}>Shop Owner</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <View style={[styles.heroCard, Theme.shadows.medium]}>
          <View style={styles.heroBadge}>
            <Ionicons name="shield-checkmark-outline" size={14} color={Colors.primaryDeep} />
            <Text style={styles.heroBadgeText}>Zero Wait Time Guaranteed</Text>
          </View>

          <Text style={styles.heroTitle}>
            Skip the Queue.{'\n'}
            <Text style={styles.heroHighlight}>Save Your Time.</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            Order from nearby shops, choose your pickup time, and collect without waiting in line.
          </Text>

          {/* Primary & Secondary Actions */}
          <View style={styles.actionRow}>
            <Button
              title="Start Ordering"
              onPress={handleStartOrdering}
              size="large"
              style={styles.primaryBtn}
              icon={<Ionicons name="arrow-forward" size={18} color={Colors.white} />}
            />
            <SecondaryButton
              title="Explore Shops"
              onPress={handleExploreShops}
              size="large"
              style={styles.secondaryBtn}
            />
          </View>
        </View>

        {/* Express Concept Workflow */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>How QueueLess Works</Text>
              <Text style={styles.sectionSubtitle}>
                No delivery delays. No standing in long lines.
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.workflowScroll}
          >
            {WORKFLOW_STEPS.map((step, idx) => (
              <View key={step.step} style={[styles.stepCard, Theme.shadows.soft]}>
                <View style={styles.stepTopRow}>
                  <Text style={styles.stepNumber}>{step.step}</Text>
                  <View style={styles.stepIconCircle}>
                    <Ionicons name={step.icon} size={22} color={Colors.primaryDeep} />
                  </View>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.description}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Feature Spotlight Ticket Card */}
        <View style={[styles.featureCard, Theme.shadows.soft]}>
          <View style={styles.featureHeader}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="qr-code" size={26} color={Colors.primaryDeep} />
            </View>
            <View style={styles.featureHeaderText}>
              <Text style={styles.featureTitle}>Express QR Pass System</Text>
              <Text style={styles.featureSub}>Show code upon arrival at express counter</Text>
            </View>
          </View>

          <View style={styles.ticketMockup}>
            <View style={styles.ticketLeft}>
              <Text style={styles.ticketShop}>Green Leaf Café</Text>
              <Text style={styles.ticketTime}>Reserved Slot: 12:30 - 12:45 PM</Text>
              <Text style={styles.ticketStatus}>● Order Ready for Pickup</Text>
            </View>
            <View style={styles.ticketRight}>
              <Ionicons name="qr-code-outline" size={48} color={Colors.primaryDeep} />
              <Text style={styles.ticketPassLabel}>EXPRESS PASS</Text>
            </View>
          </View>
        </View>

        {/* Nearby Shops Concept Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Nearby Partner Shops</Text>
              <Text style={styles.sectionSubtitle}>
                Local favorites ready for express pickup
              </Text>
            </View>
            <TouchableOpacity onPress={handleExploreShops}>
              <Text style={styles.seeAllText}>See All →</Text>
            </TouchableOpacity>
          </View>

          {NEARBY_SHOPS_PREVIEW.map((shop) => (
            <TouchableOpacity
              key={shop.id}
              activeOpacity={0.85}
              onPress={handleStartOrdering}
              style={[styles.shopPreviewCard, Theme.shadows.soft]}
            >
              <View style={styles.shopPreviewLeft}>
                <View style={styles.shopIconBg}>
                  <Ionicons name="storefront" size={24} color={Colors.primaryDeep} />
                </View>
                <View style={styles.shopMeta}>
                  <Text style={styles.shopName}>{shop.name}</Text>
                  <Text style={styles.shopSub}>
                    {shop.category} • {shop.distance}
                  </Text>
                </View>
              </View>

              <View style={styles.shopPreviewRight}>
                <View style={styles.badgeChip}>
                  <Text style={styles.badgeChipText}>{shop.badge}</Text>
                </View>
                <Text style={styles.ratingText}>{shop.rating}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Value Proposition Footer Banner */}
        <View style={styles.trustBanner}>
          <Ionicons name="time" size={24} color={Colors.primaryDeep} />
          <View style={styles.trustBannerText}>
            <Text style={styles.trustTitle}>Guaranteed Zero Waiting</Text>
            <Text style={styles.trustSubtitle}>
              Shops cap orders per 15-minute slot so your food is always freshly prepared on time.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.primaryDeep,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.sm,
  },
  brandName: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryDeep,
    letterSpacing: -0.3,
  },
  brandTagline: {
    fontSize: 9,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.secondaryText,
    letterSpacing: 1.2,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.sage,
    paddingHorizontal: Theme.spacing.sm + 2,
    paddingVertical: Theme.spacing.xs + 2,
    borderRadius: Theme.borderRadius.full,
  },
  roleChipText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primaryDeep,
    marginLeft: 4,
  },
  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.lightSage,
    paddingHorizontal: Theme.spacing.sm + 2,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    marginBottom: Theme.spacing.md,
  },
  heroBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primaryDeep,
    marginLeft: 6,
  },
  heroTitle: {
    fontSize: Typography.fontSize.hero - 2,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    lineHeight: Typography.lineHeight.hero - 2,
    marginBottom: Theme.spacing.sm,
  },
  heroHighlight: {
    color: Colors.primaryDeep,
  },
  heroSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.secondaryText,
    lineHeight: Typography.lineHeight.sm + 2,
    marginBottom: Theme.spacing.lg,
  },
  actionRow: {
    flexDirection: 'column',
    gap: Theme.spacing.sm,
  },
  primaryBtn: {
    width: '100%',
  },
  secondaryBtn: {
    width: '100%',
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primaryDeep,
  },
  workflowScroll: {
    paddingRight: Theme.spacing.md,
  },
  stepCard: {
    width: 170,
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginRight: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'space-between',
  },
  stepTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  stepNumber: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.secondaryText,
  },
  stepIconCircle: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.lightSage,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryDeep,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    lineHeight: 16,
  },
  featureCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.sage,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.sm,
  },
  featureHeaderText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  featureSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
  },
  ticketMockup: {
    backgroundColor: Colors.lightSage,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.sage,
    borderStyle: 'dashed',
  },
  ticketLeft: {
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  ticketShop: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryDeep,
  },
  ticketTime: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text,
    marginVertical: 4,
    fontFamily: Typography.fontFamily.medium,
  },
  ticketStatus: {
    fontSize: Typography.fontSize.xs,
    color: Colors.success,
    fontFamily: Typography.fontFamily.semibold,
  },
  ticketRight: {
    alignItems: 'center',
  },
  ticketPassLabel: {
    fontSize: 9,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryDeep,
    marginTop: 2,
    letterSpacing: 0.8,
  },
  shopPreviewCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shopPreviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shopIconBg: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.sage,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.sm,
  },
  shopMeta: {
    flex: 1,
  },
  shopName: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  shopSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  shopPreviewRight: {
    alignItems: 'flex-end',
  },
  badgeChip: {
    backgroundColor: Colors.lightSage,
    paddingHorizontal: Theme.spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: 4,
  },
  badgeChipText: {
    fontSize: Typography.fontSize.xs - 1,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryDeep,
  },
  ratingText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.sage,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.xs,
  },
  trustBannerText: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
  },
  trustTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryDeep,
  },
  trustSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text,
    marginTop: 2,
    lineHeight: 16,
  },
});
