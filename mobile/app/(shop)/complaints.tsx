import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { SectionHeader } from '../../components/SectionHeader';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

export default function ShopComplaintsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <SectionHeader title="Complaints & Trust System" subtitle="Monitor customer complaints & shop trust rating" />
      <View style={styles.card}>
        <Text style={styles.title}>Shop Suspension Status: Clean</Text>
        <Text style={styles.sub}>Violations: 0 / 3 (Threshold)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: { padding: Theme.spacing.md, paddingTop: Theme.spacing.xl + 10 },
  card: { backgroundColor: Colors.white, padding: Theme.spacing.md, borderRadius: Theme.borderRadius.lg, borderWidth: 1, borderColor: Colors.border },
  title: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.bold, color: Colors.primaryDeep },
  sub: { fontSize: Typography.fontSize.xs, color: Colors.secondaryText, marginTop: 4 },
});
