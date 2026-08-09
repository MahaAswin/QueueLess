import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Theme } from '../constants/theme';

interface EmptyStateProps {
  iconName?: keyof typeof Ionicons.glyphMap | string;
  icon?: keyof typeof Ionicons.glyphMap | string;
  title: string;
  message: string;
  actionTitle?: string;
  onActionPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  iconName,
  icon = 'basket-outline',
  title,
  message,
  actionTitle,
  onActionPress,
}) => {
  const selectedIcon = (iconName || icon) as keyof typeof Ionicons.glyphMap;

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={selectedIcon} size={48} color={Colors.primaryDeep} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionTitle && onActionPress && (
        <Button
          title={actionTitle}
          onPress={onActionPress}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.sage,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  message: {
    fontSize: Typography.fontSize.sm,
    color: Colors.secondaryText,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.sm,
    marginBottom: Theme.spacing.lg,
  },
  button: {
    minWidth: 160,
  },
});
