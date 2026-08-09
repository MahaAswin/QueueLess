import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ComplaintService } from '../../../services/complaint.service';
import { ComplaintResponse, ComplaintStatus, ComplaintType } from '../../../types';
import { LoadingState } from '../../../components/LoadingState';
import { EmptyState } from '../../../components/EmptyState';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { Theme } from '../../../constants/theme';

const formatComplaintTypeLabel = (type?: ComplaintType): string => {
  switch (type) {
    case 'SHOP_WRONG_ORDER':
      return 'Wrong Item / Quality Issue';
    case 'SHOP_DELAY':
      return 'Long Wait / Shop Delay';
    case 'SHOP_ORDER_REFUSAL':
      return 'Shop Order Refusal';
    case 'SHOP_OTHER':
      return 'Other Shop Issue';
    default:
      return type ? type.replace(/_/g, ' ') : 'General Support';
  }
};

const getStatusBadgeStyle = (status?: ComplaintStatus) => {
  switch (status) {
    case 'SUBMITTED':
      return { bg: '#E0F2FE', text: '#0284C7', label: 'SUBMITTED' };
    case 'UNDER_REVIEW':
      return { bg: '#FEF3C7', text: '#D97706', label: 'UNDER REVIEW' };
    case 'VALID':
      return { bg: '#DCFCE7', text: '#15803D', label: 'RESOLVED (VALID)' };
    case 'INVALID':
      return { bg: '#FEE2E2', text: '#DC2626', label: 'INVALID' };
    case 'DISMISSED':
      return { bg: '#F3F4F6', text: '#4B5563', label: 'DISMISSED' };
    default:
      return { bg: Colors.lightSage, text: Colors.primaryDeep, label: status || 'PENDING' };
  }
};

const formatDate = (isoStr?: string | null): string => {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoStr;
  }
};

export default function ComplaintDetailsScreen() {
  const { complaintId } = useLocalSearchParams<{ complaintId: string }>();
  const router = useRouter();

  const [complaint, setComplaint] = useState<ComplaintResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchComplaintDetails = useCallback(async (isRefresh = false) => {
    if (!complaintId) {
      setErrorMsg('Invalid complaint reference.');
      setLoading(false);
      return;
    }
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setErrorMsg(null);

      const data = await ComplaintService.getComplaintById(complaintId);
      setComplaint(data);
    } catch (err: any) {
      console.error('[ComplaintDetailsScreen] Error loading complaint:', err);
      const msg =
        err.response?.data?.message ||
        'Unable to load complaint details. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [complaintId]);

  useEffect(() => {
    fetchComplaintDetails();
  }, [fetchComplaintDetails]);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <LoadingState message="Fetching complaint details..." />
      </SafeAreaView>
    );
  }

  if (errorMsg || !complaint) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <EmptyState
          title="Complaint Not Found"
          message={errorMsg || 'Could not find the requested support ticket.'}
          actionTitle="Back to Complaints"
          onActionPress={() => router.push('/(customer)/complaints' as any)}
        />
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusBadgeStyle(complaint.status);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchComplaintDetails(true)}
            colors={[Colors.primaryDeep]}
            tintColor={Colors.primaryDeep}
          />
        }
      >
        {/* Navigation */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(customer)/complaints' as any)}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.primaryDeep} />
          <Text style={styles.backText}>My Complaints</Text>
        </TouchableOpacity>

        {/* Complaint Title Card */}
        <View style={[styles.mainCard, Theme.shadows.medium]}>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusConfig.text }]}>
                {statusConfig.label}
              </Text>
            </View>
            <Text style={styles.createdAtText}>{formatDate(complaint.createdAt)}</Text>
          </View>

          <Text style={styles.complaintIdTitle}>
            Complaint #{complaint.complaintId.slice(0, 8).toUpperCase()}
          </Text>

          <View style={styles.typeBadge}>
            <Ionicons name="alert-circle" size={16} color={Colors.primaryDeep} />
            <Text style={styles.typeBadgeText}>
              {formatComplaintTypeLabel(complaint.type)}
            </Text>
          </View>
        </View>

        {/* Related Order Action Card */}
        {complaint.orderId && (
          <TouchableOpacity
            style={[styles.orderCard, Theme.shadows.soft]}
            onPress={() => router.push(`/(customer)/order/${complaint.orderId}` as any)}
            activeOpacity={0.85}
          >
            <View style={styles.orderIconBox}>
              <Ionicons name="receipt-outline" size={22} color={Colors.primaryDeep} />
            </View>
            <View style={styles.orderTextWrapper}>
              <Text style={styles.orderShopName}>{complaint.reportedShopName || 'Partner Shop'}</Text>
              <Text style={styles.orderSubText}>Order #{complaint.orderId.slice(0, 8).toUpperCase()}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.secondaryText} />
          </TouchableOpacity>
        )}

        {/* Issue Description Card */}
        <View style={[styles.sectionCard, Theme.shadows.soft]}>
          <Text style={styles.sectionHeader}>Description</Text>
          <Text style={styles.descriptionText}>{complaint.description}</Text>
        </View>

        {/* Evidence Card */}
        {complaint.evidenceItems && complaint.evidenceItems.length > 0 && (
          <View style={[styles.sectionCard, Theme.shadows.soft]}>
            <Text style={styles.sectionHeader}>
              Attached Evidence ({complaint.evidenceItems.length})
            </Text>
            <View style={styles.evidenceGrid}>
              {complaint.evidenceItems.map((item) => (
                <View key={item.evidenceId} style={styles.evidenceCard}>
                  {item.fileUrl?.startsWith('http') || item.fileUrl?.startsWith('file:') || item.fileUrl?.startsWith('data:') ? (
                    <Image source={{ uri: item.fileUrl }} style={styles.evidenceImage} />
                  ) : (
                    <View style={styles.evidencePlaceholder}>
                      <Ionicons name="document-text-outline" size={32} color={Colors.primaryDeep} />
                      <Text style={styles.evidencePlaceholderText}>{item.type}</Text>
                    </View>
                  )}
                  {item.description && (
                    <Text style={styles.evidenceCaption}>{item.description}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Admin Resolution & Review Notes */}
        {complaint.reviewNote && (
          <View style={[styles.reviewCard, Theme.shadows.soft]}>
            <View style={styles.reviewHeaderRow}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primaryDeep} />
              <Text style={styles.reviewTitle}>Support Resolution Note</Text>
            </View>
            <Text style={styles.reviewNoteText}>{complaint.reviewNote}</Text>
            {complaint.reviewedAt && (
              <Text style={styles.reviewedAtText}>
                Reviewed on {formatDate(complaint.reviewedAt)}
              </Text>
            )}
          </View>
        )}
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  backText: {
    color: Colors.primaryDeep,
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.sm,
    marginLeft: Theme.spacing.xs,
  },
  mainCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Theme.spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
  },
  createdAtText: {
    fontSize: Typography.fontSize.xs - 1,
    color: Colors.secondaryText,
  },
  complaintIdTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginVertical: 4,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
  },
  typeBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
    marginLeft: 4,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Theme.spacing.md,
  },
  orderIconBox: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.lightSage,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.sm,
  },
  orderTextWrapper: {
    flex: 1,
  },
  orderShopName: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  orderSubText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Theme.spacing.md,
  },
  sectionHeader: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginBottom: Theme.spacing.xs,
  },
  descriptionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    lineHeight: Typography.lineHeight.md,
  },
  evidenceGrid: {
    marginTop: Theme.spacing.xs,
  },
  evidenceCard: {
    marginBottom: Theme.spacing.xs,
  },
  evidenceImage: {
    width: '100%',
    height: 200,
    borderRadius: Theme.borderRadius.md,
    resizeMode: 'cover',
  },
  evidencePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.lightSage,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidencePlaceholderText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.primaryDeep,
    marginTop: 4,
  },
  evidenceCaption: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 4,
  },
  reviewCard: {
    backgroundColor: Colors.lightSage,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.sage,
    marginBottom: Theme.spacing.md,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  reviewTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
    marginLeft: 6,
  },
  reviewNoteText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text,
    lineHeight: Typography.lineHeight.sm,
  },
  reviewedAtText: {
    fontSize: 10,
    color: Colors.secondaryText,
    marginTop: Theme.spacing.xs,
  },
});
