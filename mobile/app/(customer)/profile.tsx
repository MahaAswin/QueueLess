import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { NotificationService } from '../../services/notification.service';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, setActiveRole } = useAuthStore();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);

  const displayName = user?.name || 'Customer';
  const displayEmail = user?.email || 'customer@queueless.com';
  const displayPhone = user?.phone || 'Not Provided';
  const displayRole = user?.role || 'CUSTOMER';

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      async function loadUnreadCount() {
        try {
          const countData = await NotificationService.getUnreadCount();
          if (isMounted) {
            setUnreadNotificationsCount(countData.unreadCount || 0);
          }
        } catch {
          // Soft fail
        }
      }
      loadUnreadCount();
      return () => {
        isMounted = false;
      };
    }, [])
  );

  const handleSwitchToShopOwner = () => {
    setActiveRole('SHOP_OWNER');
    router.replace('/(shop-owner)/dashboard' as any);
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/(auth)/login');
          } catch {
            router.replace('/');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
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

      {/* Navigation & Services Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account & Services</Text>
        <View style={styles.menuCard}>
          {/* Notifications */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(customer)/notifications')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBg, { backgroundColor: Colors.lightSage }]}>
              <Ionicons name="notifications-outline" size={20} color={Colors.primaryDeep} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Notifications</Text>
              <Text style={styles.menuSub}>Pickup alerts & order status updates</Text>
            </View>
            {unreadNotificationsCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadNotificationsCount}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={18} color={Colors.secondaryText} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          {/* Order History */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(customer)/orders')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBg, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="receipt-outline" size={20} color="#0284C7" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>My Orders</Text>
              <Text style={styles.menuSub}>Track live pickups & past receipts</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.secondaryText} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          {/* Help & Support */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(customer)/complaints')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBg, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="help-buoy-outline" size={20} color="#D97706" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Help & Complaints</Text>
              <Text style={styles.menuSub}>Submit order issues & support tickets</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.secondaryText} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          {/* App Settings */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              Alert.alert('App Settings', `QueueLess Mobile v1.0.0\nTheme: Clean Sage / Deep Green\nStatus: Online`)
            }
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBg, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="settings-outline" size={20} color="#9333EA" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Settings</Text>
              <Text style={styles.menuSub}>App preferences & version info</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.secondaryText} />
          </TouchableOpacity>
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
        <Text style={styles.sectionTitle}>Partner Mode</Text>
        <TouchableOpacity
          style={styles.switchCard}
          onPress={handleSwitchToShopOwner}
          activeOpacity={0.8}
        >
          <View style={styles.switchIcon}>
            <Ionicons name="storefront-outline" size={22} color={Colors.primaryDeep} />
          </View>
          <View style={styles.switchContent}>
            <Text style={styles.switchTitle}>Switch to Shop Partner Mode</Text>
            <Text style={styles.switchSub}>Manage shop dashboard, slots & live orders</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.secondaryText} />
        </TouchableOpacity>
      </View>

      {/* Logout Action */}
      <Button
        title="Sign Out"
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
  userName: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginTop: Theme.spacing.sm,
  },
  userEmail: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
  },
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
  trustText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.primaryDeep,
    marginLeft: 4,
  },
  section: { marginBottom: Theme.spacing.lg },
  sectionTitle: {
    fontSize: Typography.fontSize.xs + 1,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Theme.spacing.xs,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  menuIconBg: {
    width: 38,
    height: 38,
    borderRadius: Theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.sm,
  },
  menuTextContainer: { flex: 1 },
  menuTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  menuSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  badge: {
    backgroundColor: Colors.primaryDeep,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: Theme.spacing.md + 38 + Theme.spacing.sm,
  },
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
  switchIcon: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.sage,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.sm,
  },
  switchContent: { flex: 1 },
  switchTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  switchSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  logoutButton: { marginTop: Theme.spacing.xs },
});
