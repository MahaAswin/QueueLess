import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Product, ProductResponse } from '../types';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Theme } from '../constants/theme';

export const formatProductCategory = (cat?: string): string => {
  if (!cat) return 'General';
  switch (cat) {
    case 'GROCERY':
      return 'Grocery';
    case 'FRUITS_VEGETABLES':
      return 'Fruits & Vegetables';
    case 'DAIRY':
      return 'Dairy';
    case 'BEVERAGES':
      return 'Beverages';
    case 'SNACKS':
      return 'Snacks';
    case 'MEDICINE':
      return 'Medicine';
    case 'PERSONAL_CARE':
      return 'Personal Care';
    case 'BAKERY':
      return 'Bakery';
    case 'RESTAURANT':
      return 'Restaurant';
    case 'STATIONERY':
      return 'Stationery';
    case 'MEAT':
      return 'Meat & Seafood';
    case 'OTHER':
      return 'Other';
    default:
      return cat
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
};

interface ProductCardProps {
  product: Product | ProductResponse;
  quantity?: number;
  onAddPress?: () => void;
  onPress?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
}) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const name = product.name;
  const description = product.description || 'No description available';
  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price || '0');
  const imageUrl = product.imageUrl;
  const isAvailable = 'available' in product ? product.available : product.isAvailable;
  const categoryFormatted = formatProductCategory(product.category);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (product.id) {
      router.push(`/(customer)/product/${product.id}` as any);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[
        styles.card,
        Theme.shadows.soft,
        !isAvailable && styles.unavailableCard,
      ]}
      accessibilityLabel={`${name}, Price ₹${price.toFixed(2)}, ${isAvailable ? 'Available' : 'Currently unavailable'}`}
      accessibilityRole="button"
    >
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.name, !isAvailable && styles.unavailableText]} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{categoryFormatted}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>

        <View style={styles.bottomRow}>
          <Text style={[styles.price, !isAvailable && styles.unavailablePrice]}>
            ₹{price.toFixed(2)}
          </Text>
          <View
            style={[
              styles.stockBadge,
              isAvailable ? styles.availableBadge : styles.unavailableBadge,
            ]}
          >
            <Text
              style={[
                styles.stockText,
                isAvailable ? styles.availableStockText : styles.unavailableStockText,
              ]}
            >
              {isAvailable ? 'Available' : 'Currently unavailable'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.imageSection}>
        {imageUrl && !imageError ? (
          <Image
            source={{ uri: imageUrl }}
            style={[styles.image, !isAvailable && styles.dimmedImage]}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.placeholderImage, !isAvailable && styles.dimmedImage]}>
            <Ionicons
              name="cube-outline"
              size={28}
              color={isAvailable ? Colors.primaryDeep : Colors.secondaryText}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unavailableCard: {
    backgroundColor: '#FAF9F8',
    borderColor: '#E5E7EB',
    opacity: 0.85,
  },
  content: {
    flex: 1,
    marginRight: Theme.spacing.md,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    flex: 1,
    marginRight: Theme.spacing.xs,
  },
  unavailableText: {
    color: Colors.secondaryText,
  },
  categoryBadge: {
    backgroundColor: Colors.lightSage,
    paddingHorizontal: Theme.spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryDeep,
  },
  description: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginBottom: Theme.spacing.sm,
    lineHeight: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.xs,
  },
  price: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryDeep,
  },
  unavailablePrice: {
    color: Colors.secondaryText,
  },
  stockBadge: {
    paddingHorizontal: Theme.spacing.xs + 2,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.sm,
  },
  availableBadge: {
    backgroundColor: '#DEF7EC',
  },
  unavailableBadge: {
    backgroundColor: '#F3F4F6',
  },
  stockText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
  },
  availableStockText: {
    color: '#03543F',
  },
  unavailableStockText: {
    color: '#6B7280',
  },
  imageSection: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 76,
    height: 76,
    borderRadius: Theme.borderRadius.sm,
  },
  placeholderImage: {
    width: 76,
    height: 76,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Colors.lightSage,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dimmedImage: {
    opacity: 0.6,
  },
});

