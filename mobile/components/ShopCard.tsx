import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Shop, ShopPreview, ShopResponse, ShopStatus } from '../types';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Theme } from '../constants/theme';

interface ShopCardProps {
  shop: Shop | ShopPreview | ShopResponse;
  onPress: () => void;
  onOrderPress?: () => void;
}

export const ShopCard: React.FC<ShopCardProps> = ({ shop, onPress, onOrderPress }) => {
  // Normalize fields across ShopResponse (backend) and Shop / ShopPreview (mock/UI)
  const name = 'shopName' in shop ? shop.shopName : shop.name;
  const address = shop.address + ('city' in shop && shop.city ? `, ${shop.city}` : '');
  const category = shop.category;
  const imageUrl = 'imageUrl' in shop ? shop.imageUrl : undefined;

  let status: ShopStatus | 'OPEN' | 'CLOSED' = 'ACTIVE';
  if ('status' in shop && shop.status) {
    status = shop.status;
  } else if ('isOpen' in shop) {
    status = shop.isOpen ? 'ACTIVE' : 'INACTIVE';
  }

  const isAvailable = status === 'ACTIVE';

  const getStatusBadge = () => {
    switch (status) {
      case 'ACTIVE':
        return { text: 'OPEN', style: styles.openBadge };
      case 'INACTIVE':
        return { text: 'CLOSED', style: styles.closedBadge };
      case 'PENDING':
        return { text: 'PENDING', style: styles.pendingBadge };
      case 'SUSPENDED':
        return { text: 'SUSPENDED', style: styles.suspendedBadge };
      default:
        return { text: 'CLOSED', style: styles.closedBadge };
    }
  };

  const badge = getStatusBadge();

  const rating = 'rating' in shop && shop.rating ? shop.rating : 4.5;
  const distanceKm = 'distanceKm' in shop && shop.distanceKm ? shop.distanceKm : 1.0;
  const openingHours = 'openingTime' in shop && shop.openingTime ? `${shop.openingTime} - ${shop.closingTime || ''}` : '9:00 AM - 9:00 PM';

  const handleOrderPress = (e: any) => {
    e.stopPropagation?.();
    if (!isAvailable) return;
    if (onOrderPress) {
      onOrderPress();
    } else {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, Theme.shadows.soft]}
      accessibilityLabel={`${name}, ${category}, Status ${badge.text}`}
      accessibilityRole="button"
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <View style={styles.placeholderIconBg}>
              <Ionicons name="storefront" size={28} color={Colors.primaryDeep} />
            </View>
            <Text style={styles.placeholderCategoryText}>{category}</Text>
          </View>
        )}
        <View style={[styles.badgeContainer, badge.style]}>
          <Text style={styles.badgeText}>{badge.text}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        </View>

        <Text style={styles.category} numberOfLines={1}>
          {category} • {address}
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={Colors.secondaryText} />
            <Text style={styles.metaText}>{`${distanceKm} km`}</Text>
          </View>
          <Text style={styles.bullet}>•</Text>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={Colors.secondaryText} />
            <Text style={styles.metaText}>{openingHours}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.orderButton, !isAvailable && styles.disabledButton]}
            onPress={handleOrderPress}
            disabled={!isAvailable}
            activeOpacity={0.8}
            accessibilityLabel={isAvailable ? `View shop ${name}` : `Shop ${name} is ${badge.text}`}
            accessibilityRole="button"
          >
            <Text style={styles.orderButtonText}>{isAvailable ? 'View Shop' : badge.text}</Text>
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
  pendingBadge: {
    backgroundColor: Colors.warning,
  },
  suspendedBadge: {
    backgroundColor: Colors.error,
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
  disabledButton: {
    backgroundColor: Colors.secondaryText,
  },
  orderButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    marginRight: 4,
  },
});
