import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Shop, ShopPreview } from '../types';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Theme } from '../constants/theme';

interface ShopCardProps {
  shop: Shop | ShopPreview;
  onPress: () => void;
  onOrderPress?: () => void;
}

export const ShopCard: React.FC<ShopCardProps> = ({ shop, onPress, onOrderPress }) => {
  const handleOrderPress = (e: any) => {
    e.stopPropagation?.();
    if (onOrderPress) {
      onOrderPress();
    } else {
      onPress();
    }
  };

  const getPrepTimeLabel = (mins?: number) => {
    if (!mins) return '15–20 min';
    if (mins === 15) return '15–20 min';
    if (mins === 20) return '20–25 min';
    if (mins === 25) return '25–30 min';
    return `${mins}–${mins + 5} min`;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, Theme.shadows.soft]}
      accessibilityLabel={`${shop.name}, Rating ${shop.rating}, Distance ${shop.distanceKm || 0.8} km`}
      accessibilityRole="button"
    >
      <View style={styles.imageContainer}>
        {shop.imageUrl ? (
          <Image source={{ uri: shop.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <View style={styles.placeholderIconBg}>
              <Ionicons name="storefront" size={28} color={Colors.primaryDeep} />
            </View>
            <Text style={styles.placeholderCategoryText}>{shop.category}</Text>
          </View>
        )}
        <View style={[styles.badgeContainer, shop.isOpen ? styles.openBadge : styles.closedBadge]}>
          <Text style={styles.badgeText}>{shop.isOpen ? 'Open' : 'Closed'}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {shop.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={styles.ratingText}>{shop.rating.toFixed(1)}</Text>
          </View>
        </View>

        <Text style={styles.category} numberOfLines={1}>
          {shop.category} • {shop.address}
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={Colors.secondaryText} />
            <Text style={styles.metaText}>{shop.distanceKm ? `${shop.distanceKm} km` : '0.8 km'}</Text>
          </View>
          <Text style={styles.bullet}>•</Text>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={Colors.secondaryText} />
            <Text style={styles.metaText}>{getPrepTimeLabel(shop.estimatedPrepTimeMinutes)}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.orderButton}
            onPress={handleOrderPress}
            activeOpacity={0.8}
            accessibilityLabel={`Order now from ${shop.name}`}
            accessibilityRole="button"
          >
            <Text style={styles.orderButtonText}>Order Now</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 120,
    width: '100%',
    backgroundColor: Colors.lightSage,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightSage,
  },
  placeholderIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  placeholderCategoryText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primaryDeep,
  },
  badgeContainer: {
    position: 'absolute',
    top: Theme.spacing.sm,
    right: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs - 2,
    borderRadius: Theme.borderRadius.full,
  },
  openBadge: {
    backgroundColor: Colors.primaryDeep,
  },
  closedBadge: {
    backgroundColor: Colors.secondaryText,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 11,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.fontWeight.semibold,
  },
  content: {
    padding: Theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    flex: 1,
    marginRight: Theme.spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: Theme.spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
  },
  ratingText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: '#92400E',
    marginLeft: 3,
  },
  category: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    fontFamily: Typography.fontFamily.medium,
    marginBottom: Theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.secondaryText,
    marginLeft: 4,
  },
  bullet: {
    marginHorizontal: Theme.spacing.xs + 2,
    color: Colors.secondaryText,
    fontSize: Typography.fontSize.xs,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  orderButton: {
    backgroundColor: Colors.primaryDeep,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs + 2,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    marginRight: 4,
  },
});
