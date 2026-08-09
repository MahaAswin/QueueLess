import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Shop } from '../types';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Theme } from '../constants/theme';

interface ShopCardProps {
  shop: Shop;
  onPress: () => void;
}

export const ShopCard: React.FC<ShopCardProps> = ({ shop, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, Theme.shadows.soft]}
    >
      <View style={styles.imageContainer}>
        {shop.imageUrl ? (
          <Image source={{ uri: shop.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="storefront-outline" size={36} color={Colors.primaryDeep} />
          </View>
        )}
        <View style={[styles.badgeContainer, shop.isOpen ? styles.openBadge : styles.closedBadge]}>
          <Text style={styles.badgeText}>{shop.isOpen ? 'Open Now' : 'Closed'}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {shop.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>{shop.rating.toFixed(1)}</Text>
          </View>
        </View>

        <Text style={styles.category} numberOfLines={1}>
          {shop.category} • {shop.address}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.infoChip}>
            <Ionicons name="location-outline" size={14} color={Colors.primaryDeep} />
            <Text style={styles.infoText}>{shop.distanceKm ? `${shop.distanceKm} km` : 'Near you'}</Text>
          </View>
          <View style={styles.infoChip}>
            <Ionicons name="time-outline" size={14} color={Colors.primaryDeep} />
            <Text style={styles.infoText}>
              {shop.estimatedPrepTimeMinutes ? `Ready in ~${shop.estimatedPrepTimeMinutes} mins` : 'Pickup slots available'}
            </Text>
          </View>
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
    height: 140,
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
  badgeContainer: {
    position: 'absolute',
    top: Theme.spacing.sm,
    right: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
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
    fontSize: Typography.fontSize.xs,
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
    marginBottom: Theme.spacing.xs,
  },
  name: {
    fontSize: Typography.fontSize.lg,
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
    fontWeight: Typography.fontWeight.bold,
    color: '#92400E',
    marginLeft: 2,
  },
  category: {
    fontSize: Typography.fontSize.sm,
    color: Colors.secondaryText,
    marginBottom: Theme.spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.xs,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightSage,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    marginRight: Theme.spacing.xs,
  },
  infoText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.primaryDeep,
    marginLeft: 4,
  },
});
