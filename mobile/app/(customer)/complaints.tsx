import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ComplaintService } from '../../services/complaint.service';
import { ComplaintResponse, ComplaintStatus, ComplaintType } from '../../types';
import { SectionHeader } from '../../components/SectionHeader';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

type FilterTab = 'ALL' | 'SUBMITTED' | 'UNDER_REVIEW' | 'RESOLVED';

const formatTypeLabel = (type: ComplaintType): string => {
  switch (type) {
    case 'SHOP_WRONG_ORDER':
      return 'Wrong Item / Quality';
    case 'SHOP_DELAY':
      return 'Long Wait / Shop Delay';
    case 'SHOP_ORDER_REFUSAL':
      return 'Shop Refused Order';
    case 'SHOP_OTHER':
      return 'Other Shop Issue';
    default:
      return type.replace(/_/g, ' ');
  }
};

const getStatusBadgeStyle = (status: ComplaintStatus) => {
  switch (status) {
    case 'SUBMITTED':
      return { bg: '#E0F2FE', text: '#0284C7', label: 'SUBMITTED' };
    case 'UNDER_REVIEW':
      return { bg: '#FEF3C7', text: '#D97706', label: 'UNDER REVIEW' };
    case 'VALID':
      return { bg: '#DCFCE7', text: '#15803D', label: 'VALID' };
    case 'INVALID':
      return { bg: '#FEE2E2', text: '#DC2626', label: 'INVALID' };
    case 'DISMISSED':
      return { bg: '#F3F4F6', text: '#4B5563', label: 'DISMISSED' };
    default:
      return { bg: Colors.lightSage, text: Colors.primaryDeep, label: status };
  }
};

const formatDateShort = (isoStr: string): string => {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoStr;
  }
};

export default function MyComplaintsScreen() {
  const router = useRouter();

  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchComplaints = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setErrorMsg(null);

      const data = await ComplaintService.getMyComplaints();
      setComplaints(data || []);
    } catch (err: any) {
      console.error('[MyComplaintsScreen] Error loading complaints:', err);
      const msg =
        err.response?.data?.message ||
        'Unable to load your complaints. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchComplaints();
    }, [fetchComplaints])
  );

  const filteredComplaints = complaints.filter((item) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'SUBMITTED') return item.status === 'SUBMITTED';
    if (activeTab === 'UNDER_REVIEW') return item.status === 'UNDER_REVIEW';
    if (activeTab === 'RESOLVED')
      return item.status === 'VALID' || item.status === 'INVALID' || item.status === 'DISMISSED';
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.contentWrapper}>
        {/* Navigation Header */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.primaryDeep} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <SectionHeader
          title="My Complaints"
          subtitle="Track support tickets and order issue resolution status"
        />

        {/* Filter Tabs */}
        <View style={styles.tabsContainer}>
          {(
            [
              { key: 'ALL', label: 'All' },
              { key: 'SUBMITTED', label: 'Submitted' },
              { key: 'UNDER_REVIEW', label: 'Under Review' },
              { key: 'RESOLVED', label: 'Resolved' },
            ] as const
          ).map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabButton, isSelected && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading && !refreshing ? (
          <LoadingState message="Loading complaints..." />
        ) : errorMsg ? (
          <EmptyState
            title="Error Loading Complaints"
            message={errorMsg}
            actionTitle="Try Again"
            onActionPress={() => fetchComplaints()}
          />
        ) : filteredComplaints.length === 0 ? (
          <EmptyState
            icon="shield-checkmark-outline"
            title="No complaints found"
            message={
              activeTab === 'ALL'
                ? "If you ever experience an issue with an order, you can report it from Order Details."
                : `No complaints found under the "${activeTab.replace('_', ' ')}" filter.`
            }
            actionTitle="View My Orders"
            onActionPress={() => router.push('/(customer)/orders' as any)}
          />
        ) : (
          <FlatList
            data={filteredComplaints}
            keyExtractor={(item) => item.complaintId}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchComplaints(true)}
                colors={[Colors.primaryDeep]}
                tintColor={Colors.primaryDeep}
              />
            }
            renderItem={({ item }) => {
              const statusConfig = getStatusBadgeStyle(item.status);

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.card, Theme.shadows.soft]}
                  onPress={() => router.push(`/(customer)/complaint/${item.complaintId}` as any)}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.complaintIdText}>
                      Complaint #{item.complaintId.slice(0, 8).toUpperCase()}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusConfig.text }]}>
                        {statusConfig.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.shopName}>{item.reportedShopName || 'Partner Shop'}</Text>
                  <Text style={styles.orderRefText}>
                    Order #{item.orderId.slice(0, 8).toUpperCase()} • {formatTypeLabel(item.type)}
                  </Text>

                  <Text style={styles.descriptionSnippet} numberOfLines={2}>
                    "{item.description}"
                  </Text>

                  <View style={styles.cardFooter}>
                    <Text style={styles.dateText}>{formatDateShort(item.createdAt)}</Text>
                    <View style={styles.detailsTag}>
                      <Text style={styles.detailsTagText}>View Details →</Text>
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
  contentWrapper: { flex: 1, paddingHorizontal: Theme.spacing.md },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
    marginBottom: Theme.spacing.xs,
  },
  backText: {
    color: Colors.primaryDeep,
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.sm,
    marginLeft: Theme.spacing.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.full,
    padding: 4,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Theme.spacing.xs,
    alignItems: 'center',
    borderRadius: Theme.borderRadius.full,
  },
  tabButtonActive: {
    backgroundColor: Colors.primaryDeep,
  },
  tabText: {
    fontSize: Typography.fontSize.xs - 1,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.secondaryText,
  },
  tabTextActive: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
  },
  listContainer: {
    paddingBottom: Theme.spacing.xxl,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  complaintIdText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.secondaryText,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.full,
  },
  statusBadgeText: {
    fontSize: 9,
    fontFamily: Typography.fontFamily.bold,
  },
  shopName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  orderRefText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primaryDeep,
    marginTop: 2,
  },
  descriptionSnippet: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginVertical: Theme.spacing.xs,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
    paddingTop: Theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  dateText: {
    fontSize: Typography.fontSize.xs - 1,
    color: Colors.secondaryText,
  },
  detailsTag: {
    backgroundColor: Colors.lightSage,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.full,
  },
  detailsTagText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
});
