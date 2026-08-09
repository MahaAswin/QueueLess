import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Theme } from '../constants/theme';

interface CategoryCardProps {
  name: string;
  iconName: keyof typeof Ionicons.glyphMap;
  isSelected?: boolean;
  onPress: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  name,
  iconName,
  isSelected = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        isSelected ? styles.selectedCard : styles.unselectedCard,
      ]}
    >
      <View style={[styles.iconContainer, isSelected && styles.selectedIconContainer]}>
        <Ionicons
          name={iconName}
          size={22}
          color={isSelected ? Colors.white : Colors.primaryDeep}
        />
      </View>
      <Text style={[styles.name, isSelected && styles.selectedText]} numberOfLines={1}>
        {name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: Theme.spacing.sm + 2,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Theme.spacing.sm,
    borderWidth: 1,
  },
  unselectedCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
  },
  selectedCard: {
    backgroundColor: Colors.primaryDeep,
    borderColor: Colors.primaryDeep,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.lightSage,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.xs + 2,
  },
  selectedIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  name: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
  },
  selectedText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.fontWeight.semibold,
  },
});
