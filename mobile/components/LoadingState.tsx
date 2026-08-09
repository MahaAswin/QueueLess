import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Theme } from '../constants/theme';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading QueueLess...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primaryDeep} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
    backgroundColor: Colors.background,
  },
  message: {
    fontSize: Typography.fontSize.sm,
    color: Colors.secondaryText,
    marginTop: Theme.spacing.md,
    fontFamily: Typography.fontFamily.medium,
  },
});
