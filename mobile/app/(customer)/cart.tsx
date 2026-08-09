import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader } from '../../components/SectionHeader';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';
import { useCartStore } from '../../store/cartStore';

export default function CartScreen() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getTotalAmount, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          iconName="cart-outline"
          title="Your Cart is Empty"
          message="Browse nearby shops and add items to experience zero-wait pickup!"
          actionTitle="Explore Shops"
          onActionPress={() => router.push('/(customer)/shops')}
        />
      </View>
    );
  }

  const totalAmount = getTotalAmount();

  return (
    <View style={styles.flex}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerRow}>
          <SectionHeader title="Your Express Order" subtitle="Review your items before selecting pickup slot" />
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {items.map((item) => (
          <View key={item.product.id} style={styles.itemCard}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemPrice}>${(item.product.price * item.quantity).toFixed(2)}</Text>
            </View>

            <View style={styles.quantityControls}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.product.id, item.quantity - 1)}>
                <Ionicons name="remove" size={16} color={Colors.primaryDeep} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.product.id, item.quantity + 1)}>
                <Ionicons name="add" size={16} color={Colors.primaryDeep} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>QueueLess Express Fee</Text>
            <Text style={styles.summaryValue}>FREE</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Select Pickup Time Slot →" onPress={() => router.push('/(customer)/pickup-slot')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background },
  emptyContainer: { flex: 1, justifyContent: 'center', backgroundColor: Colors.background },
  contentContainer: {
    padding: Theme.spacing.md,
    paddingTop: Theme.spacing.xl + 10,
    paddingBottom: Theme.spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearText: {
    color: Colors.error,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemInfo: { flex: 1, marginRight: Theme.spacing.md },
  itemName: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.bold, color: Colors.text },
  itemPrice: { fontSize: Typography.fontSize.sm, color: Colors.primaryDeep, marginTop: 2 },
  quantityControls: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Colors.sage,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: { marginHorizontal: Theme.spacing.sm, fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold },
  summaryCard: {
    backgroundColor: Colors.white,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    marginTop: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, marginBottom: Theme.spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  summaryLabel: { fontSize: Typography.fontSize.sm, color: Colors.secondaryText },
  summaryValue: { fontSize: Typography.fontSize.sm, color: Colors.text },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Theme.spacing.sm, marginTop: Theme.spacing.xs },
  totalLabel: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, color: Colors.text },
  totalValue: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, color: Colors.primaryDeep },
  footer: { padding: Theme.spacing.md, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
});
