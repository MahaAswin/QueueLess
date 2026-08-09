import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Theme } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const isOutline = variant === 'outline';
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';

  const getBackgroundColor = () => {
    if (disabled) return Colors.border;
    if (isOutline) return 'transparent';
    if (isSecondary) return Colors.sage;
    if (isDanger) return Colors.error;
    return Colors.primaryDeep;
  };

  const getTextColor = () => {
    if (disabled) return Colors.secondaryText;
    if (isOutline) return Colors.primaryDeep;
    if (isSecondary) return Colors.primaryDeep;
    return Colors.white;
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: Theme.spacing.xs + 2, paddingHorizontal: Theme.spacing.md };
      case 'large':
        return { paddingVertical: Theme.spacing.md, paddingHorizontal: Theme.spacing.xl };
      case 'medium':
      default:
        return { paddingVertical: Theme.spacing.sm + 4, paddingHorizontal: Theme.spacing.lg };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return Typography.fontSize.sm;
      case 'large':
        return Typography.fontSize.lg;
      case 'medium':
      default:
        return Typography.fontSize.md;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.button,
        getPadding(),
        {
          backgroundColor: getBackgroundColor(),
          borderColor: isOutline ? Colors.primaryDeep : 'transparent',
          borderWidth: isOutline ? 1.5 : 0,
        },
        Theme.shadows.soft,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: getFontSize(),
                marginLeft: icon ? Theme.spacing.xs : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
});
