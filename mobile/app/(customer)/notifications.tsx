import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader } from '../../components/SectionHeader';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Order Ready for Pickup! ☕',
    message: 'Your order at Green Leaf Organic Café is ready at Express Counter. Show your QR pass to collect.',
    time: '10 mins ago',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Pickup Slot Reminder ⏰',
    message: 'Your pickup slot for Green Leaf Organic Café starts in 15 minutes (12:30 PM).',
    time: '25 mins ago',
    unread: false,
  },
];

export default function NotificationsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <SectionHeader title="Notifications" subtitle="Express pickup alerts & order status updates" />
      {MOCK_NOTIFICATIONS.map((n) => (
        <View key={n.id} style={[styles.card, n.unread && styles.unreadCard]}>
          <View style={styles.iconCircle}>
            <Ionicons name="notifications-outline" size={20} color={Colors.primaryDeep} />
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>{n.title}</Text>
            <Text style={styles.message}>{n.message}</Text>
            <Text style={styles.time}>{n.time}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: {
    padding: Theme.spacing.md,
    paddingTop: Theme.spacing.xl + 10,
    paddingBottom: Theme.spacing.xxl,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unreadCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.lightSage,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.sage,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.sm,
  },
  content: { flex: 1 },
  title: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.bold, color: Colors.text },
  message: { fontSize: Typography.fontSize.xs, color: Colors.secondaryText, marginVertical: 2 },
  time: { fontSize: Typography.fontSize.xs, color: Colors.secondaryText, marginTop: 4 },
});
