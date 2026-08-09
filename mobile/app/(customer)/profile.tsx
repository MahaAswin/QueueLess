import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
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
  const { user, logout, setActiveRole } = useAuthStore();

  const displayName = user?.name || 'Aswin Kumar';
  const displayEmail = user?.email || 'aswin@example.com';
  const displayPhone = user?.phone || '+91 9876543210';
  const displayRole = user?.role || 'CUSTOMER';

  const handleSwitchToShopOwner = () => {
    setActiveRole('SHOP_OWNER');
    router.replace('/(shop)/dashboard');
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch {
      router.replace('/');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Avatar name={displayName} size={72} />
        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.userEmail}>{displayEmail}</Text>

        <View style={styles.roleTag}>
          <Text style={styles.roleTagText}>{displayRole}</Text>
        </View>

        <View style={styles.trustBadge}>
          <Ionicons name="shield-checkmark" size={16} color={Colors.primaryDeep} />
          <Text style={styles.trustText}>Verified Express Account</Text>
        </View>
      </View>

      {/* Account Info Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Details</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color={Colors.secondaryText} />
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{displayName}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={Colors.secondaryText} />
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{displayEmail}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color={Colors.secondaryText} />
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{displayPhone}</Text>
          </View>
        </View>
      </View>

      {/* Role Switcher */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Role Switcher</Text>
        <TouchableOpacity style={styles.switchCard} onPress={handleSwitchToShopOwner}>
          <View style={styles.switchIcon}>
            <Ionicons name="storefront-outline" size={24} color={Colors.primaryDeep} />
          </View>
          <View style={styles.switchContent}>
            <Text style={styles.switchTitle}>Switch to Shop Partner Mode</Text>
            <Text style={styles.switchSub}>Manage shop dashboard, slots & orders</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.secondaryText} />
        </TouchableOpacity>
      </View>

      {/* Logout Action */}
      <Button
        title="Sign Out (Logout)"
        variant="outline"
        onPress={handleLogout}
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
  header: { alignItems: 'center', marginBottom: Theme.spacing.lg },
  userName: { fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.bold, color: Colors.text, marginTop: Theme.spacing.sm },
  userEmail: { fontSize: Typography.fontSize.xs, color: Colors.secondaryText, marginTop: 2 },
  roleTag: {
    backgroundColor: Colors.sage,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.full,
    marginTop: 6,
  },
  roleTagText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryDeep,
    letterSpacing: 0.5,
  },
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
  section: { marginBottom: Theme.spacing.lg },
  sectionTitle: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.bold, color: Colors.secondaryText, marginBottom: Theme.spacing.xs },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xs,
  },
  infoLabel: {
    fontSize: Typography.fontSize.xs + 1,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.secondaryText,
    marginLeft: Theme.spacing.xs,
    width: 80,
  },
  infoValue: {
    fontSize: Typography.fontSize.xs + 1,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Theme.spacing.xs,
  },
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
  logoutButton: { marginTop: Theme.spacing.sm },
});
