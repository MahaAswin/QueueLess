import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function LegacyPickupSlotScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const router = useRouter();

  useEffect(() => {
    if (orderId) {
      router.replace(`/(customer)/order/${orderId}/pickup` as any);
    } else {
      router.replace('/(customer)/orders');
    }
  }, [orderId, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primaryDeep} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
