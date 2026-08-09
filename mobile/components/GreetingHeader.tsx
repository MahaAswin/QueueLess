import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Theme } from '../constants/theme';

interface GreetingHeaderProps {
  userName?: string;
  greetingTime?: string;
}

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({
  userName = 'Aswin',
  greetingTime = 'Good morning',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.greetingText}>
        {greetingTime}, {userName} 👋
      </Text>
      <Text style={styles.subtitleText}>
        What would you like to order today?
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
    marginTop: Theme.spacing.xs,
  },
  greetingText: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.secondaryText,
  },
});
