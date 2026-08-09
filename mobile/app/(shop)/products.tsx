import React from 'react';
import { ScrollView, StyleSheet, View, Text, Switch } from 'react-native';
import { SectionHeader } from '../../components/SectionHeader';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Iced Oat Vanilla Matcha', price: 5.5, available: true, prep: '4 mins' },
  { id: 'p2', name: 'Avocado Artisan Toast', price: 8.9, available: true, prep: '7 mins' },
  { id: 'p3', name: 'Cold Brew Coffee', price: 4.8, available: false, prep: '2 mins' },
];

export default function ShopProductsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <SectionHeader title="Product Catalog" subtitle="Toggle product availability and preparation estimates" />
      {MOCK_PRODUCTS.map((prod) => (
        <View key={prod.id} style={styles.card}>
          <View style={styles.info}>
            <Text style={styles.name}>{prod.name}</Text>
            <Text style={styles.sub}>${prod.price.toFixed(2)} • Prep: {prod.prep}</Text>
          </View>
          <Switch value={prod.available} trackColor={{ true: Colors.primaryDeep }} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: { padding: Theme.spacing.md, paddingTop: Theme.spacing.xl + 10, paddingBottom: Theme.spacing.xxl },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.white, padding: Theme.spacing.md, borderRadius: Theme.borderRadius.md, marginBottom: Theme.spacing.sm, borderWidth: 1, borderColor: Colors.border },
  info: { flex: 1 },
  name: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.bold, color: Colors.text },
  sub: { fontSize: Typography.fontSize.xs, color: Colors.secondaryText, marginTop: 2 },
});
