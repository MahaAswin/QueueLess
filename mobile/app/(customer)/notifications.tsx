import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { NotificationService } from '../../services/notification.service';
import { NotificationResponse, NotificationType } from '../../types';
import { SectionHeader } from '../../components/SectionHeader';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

// Relative time formatter
const formatRelativeTime = (isoDateStr: string): string => {
  if (!isoDateStr) return '';
  try {
    const d = new Date(isoDateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHour < 24) return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay} days ago`;

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoDateStr;
  }
};

// Map NotificationType to appropriate icon
const getNotificationIcon = (type: NotificationType): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'ORDER_READY_FOR_PICKUP':
      return 'bag-check';
    case 'ORDER_PREPARING':
      return 'restaurant';
    case 'ORDER_CONFIRMED':
    case 'PICKUP_SLOT_ACCEPTED':
    case 'PICKUP_SLOT_CUSTOMER_ACCEPTED':
      return 'checkmark-circle';
    case 'ORDER_COLLECTED':
      return 'happy';
    case 'ORDER_CANCELLED':
    case 'ORDER_REJECTED':
    case 'PICKUP_SLOT_REJECTED':
    case 'PICKUP_SLOT_CUSTOMER_REJECTED':
      return 'close-circle';
    case 'PICKUP_SLOT_COUNTER_PROPOSED':
    case 'PICKUP_SLOT_REQUESTED':
      return 'time';
    default:
      return 'notifications';
  }
};

export default function NotificationsScreen() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [hasNext, setHasNext] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchInitialData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setErrorMsg(null);

      const [pageData, countData] = await Promise.all([
        NotificationService.getUserNotifications(0, 20),
        NotificationService.getUnreadCount(),
      ]);

      setNotifications(pageData.content || []);
      setPage(0);
      setHasNext(pageData.hasNext);
      setUnreadCount(countData.unreadCount || 0);
    } catch (err: any) {
      console.error('[NotificationsScreen] Error loading notifications:', err);
      const msg =
        err.response?.data?.message ||
        'Unable to load notifications. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchInitialData();
    }, [fetchInitialData])
  );

  // Load more pages
  const handleLoadMore = async () => {
    if (!hasNext || loadingMore || loading || refreshing) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const pageData = await NotificationService.getUserNotifications(nextPage, 20);

      setNotifications((prev) => [...prev, ...(pageData.content || [])]);
      setPage(nextPage);
      setHasNext(pageData.hasNext);
    } catch (err) {
      console.warn('[NotificationsScreen] Failed to load more notifications:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Mark single item as read & navigate to order if related
  const handleNotificationPress = async (item: NotificationResponse) => {
    if (!item.read) {
      try {
        const updated = await NotificationService.markAsRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? updated : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.warn('[NotificationsScreen] Failed to mark as read:', err);
      }
    }

    if (item.relatedOrderId) {
      router.push(`/(customer)/order/${item.relatedOrderId}` as any);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await NotificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err: any) {
      console.error('[NotificationsScreen] Mark all as read failed:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.contentWrapper}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.primaryDeep} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllAsRead}>
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>

        <SectionHeader
          title="Notifications"
          subtitle={
            unreadCount > 0
              ? `${unreadCount} unread express update${unreadCount > 1 ? 's' : ''}`
              : 'Express pickup alerts & order status updates'
          }
        />

        {loading && !refreshing ? (
          <LoadingState message="Loading notifications..." />
        ) : errorMsg ? (
          <EmptyState
            title="Error Loading Notifications"
            message={errorMsg}
            actionTitle="Try Again"
            onActionPress={() => fetchInitialData()}
          />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon="notifications-off-outline"
            title="No notifications yet"
            message="We'll let you know when something important happens with your express orders."
            actionTitle="Explore Shops"
            onActionPress={() => router.push('/(customer)/shops')}
          />
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchInitialData(true)}
                colors={[Colors.primaryDeep]}
                tintColor={Colors.primaryDeep}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.loadingMoreBox}>
                  <ActivityIndicator size="small" color={Colors.primaryDeep} />
                </View>
              ) : null
            }
            renderItem={({ item }) => {
              const iconName = getNotificationIcon(item.type);
              const isUnread = !item.read;

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.card, isUnread && styles.unreadCard, Theme.shadows.soft]}
                  onPress={() => handleNotificationPress(item)}
                >
                  <View style={[styles.iconCircle, isUnread && styles.iconCircleUnread]}>
                    <Ionicons
                      name={iconName}
                      size={20}
                      color={isUnread ? Colors.white : Colors.primaryDeep}
                    />
                  </View>

                  <View style={styles.textContent}>
                    <View style={styles.cardHeaderRow}>
                      <Text
                        style={[styles.title, isUnread && styles.titleUnread]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      {isUnread && <View style={styles.unreadDot} />}
                    </View>

                    <Text style={styles.message} numberOfLines={3}>
                      {item.message}
                    </Text>

                    <View style={styles.timeRow}>
                      <Text style={styles.timeText}>{formatRelativeTime(item.createdAt)}</Text>
                      {item.relatedOrderId && (
                        <View style={styles.actionTag}>
                          <Text style={styles.actionTagText}>View Order →</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: Theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
    marginBottom: Theme.spacing.xs,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: Colors.primaryDeep,
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.sm,
    marginLeft: Theme.spacing.xs,
  },
  markAllBtn: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
  },
  markAllText: {
    color: Colors.primaryDeep,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
  },
  listContainer: {
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
    borderColor: Colors.sage,
    backgroundColor: Colors.lightSage,
    borderWidth: 1.5,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.lightSage,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.sm,
  },
  iconCircleUnread: {
    backgroundColor: Colors.primaryDeep,
  },
  textContent: { flex: 1 },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text,
    flex: 1,
  },
  titleUnread: {
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryDeep,
    marginLeft: Theme.spacing.xs,
  },
  message: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 4,
    lineHeight: Typography.lineHeight.xs,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
  },
  timeText: {
    fontSize: Typography.fontSize.xs - 1,
    color: Colors.secondaryText,
    fontFamily: Typography.fontFamily.medium,
  },
  actionTag: {
    backgroundColor: Colors.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actionTagText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
  loadingMoreBox: {
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
  },
});
