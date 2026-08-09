import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, ProductResponse } from '../types';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Theme } from '../constants/theme';

interface ProductCardProps {
  product: Product | ProductResponse;
  quantity?: number;
  onAddPress?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity = 0,
  onAddPress,
}) => {
  const name = product.name;
  const description = product.description || 'No description available';
  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price || '0');
  const imageUrl = product.imageUrl;
  const isAvailable = 'available' in product ? product.available : product.isAvailable;
  const category = product.category;

  return (
    <View style={[styles.card, Theme.shadows.soft]}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <View style={[styles.categoryBadge]}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>

        <View style={styles.bottomRow}>
          <Text style={styles.price}>₹{price.toFixed(2)}</Text>
          <View style={[styles.stockBadge, isAvailable ? styles.availableBadge : styles.unavailableBadge]}>
            <Text style={styles.stockText}>{isAvailable ? 'Available' : 'Out of Stock'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.imageSection}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="cube-outline" size={28} color={Colors.primaryDeep} />
          </View>
        )}
      </View>
    </View>
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
  },
  price: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryDeep,
  },
  stockBadge: {
    paddingHorizontal: Theme.spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
  },
  availableBadge: {
    backgroundColor: '#DEF7EC',
  },
  unavailableBadge: {
    backgroundColor: '#FDE8E8',
  },
  stockText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
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
});
