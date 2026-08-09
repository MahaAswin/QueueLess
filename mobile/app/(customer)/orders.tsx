import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SectionHeader } from '../../components/SectionHeader';
import { OrderCard } from '../../components/OrderCard';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';
import { Order } from '../../types';

const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    orderNumber: 'QL-8892',
    customerId: 'u1',
    shopId: 's1',
    shopName: 'Green Leaf Organic Café',
    items: [
      { id: 'i1', productId: 'p1', productName: 'Iced Oat Matcha', unitPrice: 5.5, quantity: 1 },
      { id: 'i2', productId: 'p2', productName: 'Avocado Toast', unitPrice: 8.9, quantity: 1 },
    ],
    totalAmount: 14.4,
    status: 'READY_FOR_PICKUP',
    pickupSlot: { id: '2', shopId: 's1', startTime: '12:30 PM', endTime: '12:45 PM', maxOrders: 5, currentOrders: 4, isAvailable: true },
    createdAt: '2026-08-09T11:00:00Z',
  },
  {
    id: 'o2',
    orderNumber: 'QL-7712',
    customerId: 'u1',
    shopId: 's2',
    shopName: 'Artisan Oven Bakery',
    items: [
      { id: 'i3', productId: 'p3', productName: 'Almond Croissant', unitPrice: 4.5, quantity: 2 },
    ],
    totalAmount: 9.0,
    status: 'COMPLETED',
    pickupSlot: { id: '1', shopId: 's2', startTime: '09:00 AM', endTime: '09:15 AM', maxOrders: 5, currentOrders: 2, isAvailable: true },
    createdAt: '2026-08-08T08:45:00Z',
  },
];

export default function OrdersScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <SectionHeader title="Your Pickup Orders" subtitle="Track active express slots & view past collection passes" />
      <View style={styles.listContainer}>
        {MOCK_ORDERS.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onPress={() => router.push(`/(customer)/order/${order.id}` as any)}
            onShowQR={() => router.push('/(customer)/qr')}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Theme.spacing.md,
    paddingTop: Theme.spacing.xl + 10,
    paddingBottom: Theme.spacing.xxl,
  },
  listContainer: {
    marginTop: Theme.spacing.sm,
  },
});
