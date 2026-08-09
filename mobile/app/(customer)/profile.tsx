import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { setActiveRole } = useAuthStore();

  const handleSwitchToShopOwner = () => {
    setActiveRole('SHOP_OWNER');
    router.replace('/(shop)/dashboard');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Avatar name="Alex Johnson" size={72} />
        <Text style={styles.userName}>Alex Johnson</Text>
        <Text style={styles.userEmail}>alex.johnson@example.com</Text>

        <View style={styles.trustBadge}>
          <Ionicons name="shield-checkmark" size={16} color={Colors.primaryDeep} />
          <Text style={styles.trustText}>Verified Express Customer (Trust Score: 100)</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Role Switcher (V1 Architecture Demo)</Text>
        <TouchableOpacity style={styles.switchCard} onPress={handleSwitchToShopOwner}>
          <View style={styles.switchIcon}>
            <Ionicons name="storefront-outline" size={24} color={Colors.primaryDeep} />
          </View>
          <View style={styles.switchContent}>
            <Text style={styles.switchTitle}>Switch to Shop Owner Mode</Text>
            <Text style={styles.switchSub}>Manage shop dashboard, slots, scanner & orders</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.secondaryText} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Options</Text>
        <TouchableOpacity style={styles.optionRow}>
          <Ionicons name="person-outline" size={20} color={Colors.text} />
          <Text style={styles.optionText}>Edit Personal Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionRow}>
          <Ionicons name="time-outline" size={20} color={Colors.text} />
          <Text style={styles.optionText}>Pickup Preferences</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionRow}>
          <Ionicons name="help-circle-outline" size={20} color={Colors.text} />
          <Text style={styles.optionText}>Help & Support</Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Return to QueueLess Landing"
        variant="outline"
        onPress={() => router.replace('/')}
        style={styles.logoutButton}
      />
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
  header: { alignItems: 'center', marginBottom: Theme.spacing.xl },
  userName: { fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.bold, color: Colors.text, marginTop: Theme.spacing.sm },
  userEmail: { fontSize: Typography.fontSize.xs, color: Colors.secondaryText, marginTop: 2 },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightSage,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    marginTop: Theme.spacing.sm,
  },
  trustText: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.semibold, color: Colors.primaryDeep, marginLeft: 4 },
  section: { marginBottom: Theme.spacing.xl },
  sectionTitle: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.bold, color: Colors.secondaryText, marginBottom: Theme.spacing.sm },
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.sage,
  },
  switchIcon: { width: 44, height: 44, borderRadius: Theme.borderRadius.full, backgroundColor: Colors.sage, justifyContent: 'center', alignItems: 'center', marginRight: Theme.spacing.sm },
  switchContent: { flex: 1 },
  switchTitle: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.bold, color: Colors.text },
  switchSub: { fontSize: Typography.fontSize.xs, color: Colors.secondaryText, marginTop: 2 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionText: { fontSize: Typography.fontSize.sm, color: Colors.text, marginLeft: Theme.spacing.sm, fontFamily: Typography.fontFamily.medium },
  logoutButton: { marginTop: Theme.spacing.md },
});
