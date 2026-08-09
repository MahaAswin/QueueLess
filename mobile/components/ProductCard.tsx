import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Theme } from '../constants/theme';

interface ProductCardProps {
  product: Product;
  quantity?: number;
  onAddPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity = 0,
  onAddPress,
}) => {
  return (
    <View style={[styles.card, Theme.shadows.soft]}>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {product.description}
        </Text>

        <View style={styles.bottomRow}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          <View style={styles.prepChip}>
            <Ionicons name="time-outline" size={12} color={Colors.secondaryText} />
            <Text style={styles.prepText}>{product.preparationTimeMinutes}m prep</Text>
          </View>
        </View>
      </View>

      <View style={styles.imageActionSection}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="fast-food-outline" size={24} color={Colors.primaryDeep} />
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onAddPress}
          disabled={!product.isAvailable}
          style={[
            styles.addButton,
            quantity > 0 && styles.activeAddButton,
            !product.isAvailable && styles.disabledAddButton,
          ]}
        >
          {quantity > 0 ? (
            <Text style={styles.activeAddButtonText}>Added ({quantity})</Text>
          ) : (
            <Text style={styles.addButtonText}>
              {product.isAvailable ? '+ Add' : 'Sold Out'}
            </Text>
          )}
        </TouchableOpacity>
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
  name: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Theme.spacing.xs,
  },
  description: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginBottom: Theme.spacing.sm,
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
  prepChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: Theme.spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
  },
  prepText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginLeft: 2,
  },
  imageActionSection: {
    width: 90,
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 70,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.xs,
  },
  placeholderImage: {
    width: 80,
    height: 70,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Colors.lightSage,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  addButton: {
    backgroundColor: Colors.lightSage,
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    width: '100%',
    alignItems: 'center',
  },
  activeAddButton: {
    backgroundColor: Colors.primaryDeep,
  },
  disabledAddButton: {
    backgroundColor: Colors.border,
  },
  addButtonText: {
    color: Colors.primaryDeep,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.fontWeight.semibold,
  },
  activeAddButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.fontWeight.semibold,
  },
});
