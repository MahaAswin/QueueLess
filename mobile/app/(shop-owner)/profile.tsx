import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../../store/authStore';
import { ShopOwnerService } from '../../services/shopOwner.service';
import { ShopResponse } from '../../types';
import { SectionHeader } from '../../components/SectionHeader';
import { LoadingState } from '../../components/LoadingState';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

export default function ShopOwnerProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [shop, setShop] = useState<ShopResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [togglingActive, setTogglingActive] = useState<boolean>(false);

  const fetchShopData = useCallback(async () => {
    try {
      setLoading(true);
      const shops = await ShopOwnerService.getMyShops();
      if (shops && shops.length > 0) {
        setShop(shops[0]);
      }
    } catch (err) {
      console.error('[ShopOwnerProfileScreen] Error loading shop details:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchShopData();
    }, [fetchShopData])
  );

  const handleToggleShopActive = async (currentActive: boolean) => {
    if (!shop || togglingActive) return;
    try {
      setTogglingActive(true);
      const newStatus = currentActive ? 'INACTIVE' : 'ACTIVE';
      const updated = await ShopOwnerService.updateShop(shop.id, { status: newStatus });
      setShop(updated);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update shop status.');
    } finally {
      setTogglingActive(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out of your shop owner account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <LoadingState message="Loading shop profile..." />
      </SafeAreaView>
    );
  }

  const isShopOpen = shop?.status === 'ACTIVE';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Shop Profile" subtitle="Manage operational settings & account" />

        {/* Owner Info Header Card */}
        <View style={[styles.profileCard, Theme.shadows.medium]}>
          <Avatar name={user?.name || 'Shop Owner'} size={60} />
          <Text style={styles.ownerName}>{user?.name || 'Shop Owner'}</Text>
          <Text style={styles.ownerEmail}>{user?.email || 'owner@queueless.com'}</Text>

          <View style={styles.roleBadge}>
            <Ionicons name="storefront" size={14} color={Colors.primaryDeep} />
            <Text style={styles.roleBadgeText}>AUTHORIZED SHOP OWNER</Text>
          </View>
        </View>

        {/* Shop Settings Card */}
        <View style={[styles.sectionCard, Theme.shadows.soft]}>
          <Text style={styles.sectionTitle}>Shop Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Shop Name</Text>
            <Text style={styles.detailValue}>{shop?.shopName || 'Not Set'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{shop?.category?.replace(/_/g, ' ') || 'General'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Address</Text>
            <Text style={styles.detailValue}>{shop?.address || 'Vellakovil, Tamil Nadu'}</Text>
          </View>
        </View>

        {/* Operational Status Toggle */}
        <View style={[styles.statusToggleCard, Theme.shadows.soft]}>
          <View style={styles.statusTextWrapper}>
            <Text style={styles.statusToggleTitle}>Live Express Status</Text>
            <Text style={styles.statusToggleSub}>
              {isShopOpen ? 'Shop is currently OPEN to accept orders' : 'Shop is CLOSED'}
            </Text>
          </View>
          <Switch
            value={isShopOpen}
            onValueChange={() => handleToggleShopActive(isShopOpen)}
            disabled={togglingActive}
            trackColor={{ false: Colors.border, true: Colors.sage }}
            thumbColor={isShopOpen ? Colors.primaryDeep : '#9CA3AF'}
          />
        </View>

        {/* Logout CTA */}
        <View style={styles.logoutWrapper}>
          <Button
            title="Logout of Account"
            variant="outline"
            onPress={handleLogout}
            style={styles.logoutBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Theme.spacing.md,
  },
  ownerName: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginTop: Theme.spacing.xs,
  },
  ownerEmail: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightSage,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    marginTop: Theme.spacing.md,
  },
  roleBadgeText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginBottom: Theme.spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
  },
  detailValue: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  statusToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Theme.spacing.lg,
  },
  statusTextWrapper: { flex: 1, marginRight: Theme.spacing.sm },
  statusToggleTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  statusToggleSub: {
    fontSize: Typography.fontSize.xs - 1,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  logoutWrapper: {
    marginTop: Theme.spacing.sm,
  },
  logoutBtn: {
    borderColor: Colors.error,
  },
});
