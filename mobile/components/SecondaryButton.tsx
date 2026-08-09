import React from 'react';
import { Button } from './Button';
import { ViewStyle, TextStyle } from 'react-native';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = (props) => {
  return <Button {...props} variant="secondary" />;
};
