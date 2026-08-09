import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Theme } from '../constants/theme';

interface QueueHeroCardProps {
  onStartOrdering?: () => void;
}

export const QueueHeroCard: React.FC<QueueHeroCardProps> = ({ onStartOrdering }) => {
  return (
    <View style={[styles.card, Theme.shadows.medium]}>
      {/* Decorative background shapes */}
      <View style={styles.bgShape1} />
      <View style={styles.bgShape2} />

      <View style={styles.contentContainer}>
        <View style={styles.textColumn}>
          <View style={styles.badge}>
            <Ionicons name="flash" size={12} color={Colors.white} />
            <Text style={styles.badgeText}>FAST PICKUP</Text>
          </View>
          <Text style={styles.title}>Skip the Queue ⚡</Text>
          <Text style={styles.subtitle}>Order now, pick up on your time.</Text>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={onStartOrdering}
            activeOpacity={0.85}
            accessibilityLabel="Start Ordering"
            accessibilityRole="button"
          >
            <Text style={styles.ctaText}>Start Ordering</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.primaryDeep} style={styles.ctaIcon} />
          </TouchableOpacity>
        </View>

        {/* Visual Graphic Element */}
        <View style={styles.illustrationContainer}>
          <View style={styles.outerCircle}>
            <View style={styles.innerCircle}>
              <Ionicons name="bag-handle" size={32} color={Colors.white} />
            </View>
            <View style={styles.clockBadge}>
              <Ionicons name="time" size={14} color={Colors.primaryDeep} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primaryDeep,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    marginVertical: Theme.spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  bgShape1: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  bgShape2: {
    position: 'absolute',
    left: -30,
    bottom: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(47, 158, 91, 0.25)',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  textColumn: {
    flex: 1,
    paddingRight: Theme.spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Theme.spacing.xs + 2,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.full,
    marginBottom: Theme.spacing.xs + 2,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  title: {
    color: Colors.white,
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: Colors.lightSage,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: 18,
    marginBottom: Theme.spacing.md,
  },
  ctaButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs + 4,
    borderRadius: Theme.borderRadius.md,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaText: {
    color: Colors.primaryDeep,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    fontSize: Typography.fontSize.sm,
  },
  ctaIcon: {
    marginLeft: 6,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  innerCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: Colors.sage,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primaryDeep,
  },
});
