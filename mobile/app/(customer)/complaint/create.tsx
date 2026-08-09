import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { OrderService } from '../../../services/order.service';
import { ComplaintService } from '../../../services/complaint.service';
import { OrderResponse, ComplaintType } from '../../../types';
import { Button } from '../../../components/Button';
import { LoadingState } from '../../../components/LoadingState';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { Theme } from '../../../constants/theme';

const CUSTOMER_COMPLAINT_TYPES: { type: ComplaintType; label: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  {
    type: 'SHOP_WRONG_ORDER',
    label: 'Wrong Item / Quality Issue',
    description: 'Received incorrect items, missing items, or defective quality.',
    icon: 'fast-food-outline',
  },
  {
    type: 'SHOP_DELAY',
    label: 'Long Wait / Shop Delay',
    description: 'Order was delayed significantly past the scheduled pickup window.',
    icon: 'time-outline',
  },
  {
    type: 'SHOP_ORDER_REFUSAL',
    label: 'Shop Refused Order',
    description: 'Shop refused to honor or fulfill the confirmed order.',
    icon: 'close-circle-outline',
  },
  {
    type: 'SHOP_OTHER',
    label: 'Other Shop Issue',
    description: 'Rude staff, incorrect pricing, or other service issues.',
    icon: 'help-circle-outline',
  },
];

export default function CreateComplaintScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loadingOrder, setLoadingOrder] = useState<boolean>(true);

  const [selectedType, setSelectedType] = useState<ComplaintType>('SHOP_WRONG_ORDER');
  const [description, setDescription] = useState<string>('');
  const [evidenceUri, setEvidenceUri] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrderInfo() {
      if (!orderId) {
        setLoadingOrder(false);
        return;
      }
      try {
        const data = await OrderService.getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        console.warn('[CreateComplaintScreen] Unable to load order info:', err);
      } finally {
        setLoadingOrder(false);
      }
    }
    fetchOrderInfo();
  }, [orderId]);

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Camera roll permissions are required to select photo evidence.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setEvidenceUri(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('[CreateComplaintScreen] Image picker error:', err);
      Alert.alert('Error', 'Unable to pick image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!orderId) {
      setErrorMsg('Invalid order reference.');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Please enter a description of the issue.');
      return;
    }

    if (submitting) return;

    try {
      setSubmitting(true);
      setErrorMsg(null);

      // 1. Create Complaint
      const complaintRes = await ComplaintService.createCustomerComplaint(orderId, {
        type: selectedType,
        description: description.trim(),
      });

      // 2. Attach Evidence if selected
      if (evidenceUri) {
        try {
          await ComplaintService.addEvidence(complaintRes.complaintId, {
            type: 'IMAGE',
            fileUrl: evidenceUri,
            description: 'Customer attached photo evidence',
          });
        } catch (evidenceErr) {
          console.warn('[CreateComplaintScreen] Evidence upload warning:', evidenceErr);
        }
      }

      // 3. Navigate to Complaint Details
      router.replace(`/(customer)/complaint/${complaintRes.complaintId}` as any);
    } catch (err: any) {
      console.error('[CreateComplaintScreen] Complaint submission error:', err);
      const msg =
        err.response?.data?.message ||
        'Failed to submit complaint. Please check your network and try again.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingOrder) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <LoadingState message="Preparing support request..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Navigation Header */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.primaryDeep} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.screenTitle}>Report an Issue</Text>
        <Text style={styles.screenSubtitle}>
          We take order issues seriously. Submit your report below to get help from QueueLess support.
        </Text>

        {/* Order Reference Card */}
        <View style={[styles.orderRefCard, Theme.shadows.soft]}>
          <Ionicons name="receipt-outline" size={24} color={Colors.primaryDeep} />
          <View style={styles.orderRefTextWrapper}>
            <Text style={styles.orderRefShopName}>{order?.shopName || 'Partner Shop'}</Text>
            <Text style={styles.orderRefSub}>Order #{orderId?.slice(0, 8).toUpperCase()}</Text>
          </View>
        </View>

        {/* Error Banner */}
        {errorMsg && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={Colors.error} />
            <Text style={styles.errorBannerText}>{errorMsg}</Text>
          </View>
        )}

        {/* Complaint Type Selector */}
        <Text style={styles.sectionLabel}>Select Reason</Text>
        <View style={styles.typesContainer}>
          {CUSTOMER_COMPLAINT_TYPES.map((item) => {
            const isSelected = selectedType === item.type;
            return (
              <TouchableOpacity
                key={item.type}
                activeOpacity={0.8}
                style={[
                  styles.typeCard,
                  isSelected && styles.typeCardSelected,
                  Theme.shadows.soft,
                ]}
                onPress={() => setSelectedType(item.type)}
              >
                <View
                  style={[
                    styles.typeIconCircle,
                    isSelected && styles.typeIconCircleSelected,
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={isSelected ? Colors.white : Colors.primaryDeep}
                  />
                </View>
                <View style={styles.typeTextWrapper}>
                  <Text style={[styles.typeTitle, isSelected && styles.typeTitleSelected]}>
                    {item.label}
                  </Text>
                  <Text style={styles.typeSub}>{item.description}</Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.primaryDeep} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Issue Description */}
        <Text style={styles.sectionLabel}>Describe the Problem</Text>
        <View style={styles.textInputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Please provide details about what went wrong with your order..."
            placeholderTextColor={Colors.secondaryText}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        {/* Photo Evidence Section */}
        <Text style={styles.sectionLabel}>Attach Photo Evidence (Optional)</Text>
        {evidenceUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: evidenceUri }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeImageBtn}
              onPress={() => setEvidenceUri(null)}
            >
              <Ionicons name="trash-outline" size={16} color={Colors.error} />
              <Text style={styles.removeImageText}>Remove Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadBox}
            activeOpacity={0.8}
            onPress={handlePickImage}
          >
            <Ionicons name="camera-outline" size={28} color={Colors.primaryDeep} />
            <Text style={styles.uploadBoxTitle}>Choose Photo from Library</Text>
            <Text style={styles.uploadBoxSub}>Attach a photo of the received items or receipt</Text>
          </TouchableOpacity>
        )}

        {/* Submit CTA */}
        <View style={styles.actionRow}>
          <Button
            title="Submit Complaint"
            onPress={handleSubmit}
            loading={submitting}
            style={styles.submitBtn}
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  backText: {
    color: Colors.primaryDeep,
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.fontSize.sm,
    marginLeft: Theme.spacing.xs,
  },
  screenTitle: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  screenSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.secondaryText,
    marginTop: 4,
    marginBottom: Theme.spacing.md,
  },
  orderRefCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Theme.spacing.md,
  },
  orderRefTextWrapper: {
    marginLeft: Theme.spacing.sm,
  },
  orderRefShopName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  orderRefSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
  },
  errorBannerText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    marginLeft: Theme.spacing.xs,
    flex: 1,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },
  typesContainer: {
    marginBottom: Theme.spacing.sm,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Theme.spacing.xs,
  },
  typeCardSelected: {
    borderColor: Colors.primaryDeep,
    backgroundColor: Colors.lightSage,
    borderWidth: 1.5,
  },
  typeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.lightSage,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.sm,
  },
  typeIconCircleSelected: {
    backgroundColor: Colors.primaryDeep,
  },
  typeTextWrapper: {
    flex: 1,
  },
  typeTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text,
  },
  typeTitleSelected: {
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
  typeSub: {
    fontSize: Typography.fontSize.xs - 1,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  textInputWrapper: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  textInput: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    minHeight: 90,
  },
  uploadBox: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.sage,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.lg,
  },
  uploadBoxTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
    marginTop: Theme.spacing.xs,
  },
  uploadBoxSub: {
    fontSize: Typography.fontSize.xs - 1,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  previewContainer: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Theme.spacing.lg,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: Theme.borderRadius.md,
    resizeMode: 'cover',
  },
  removeImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
    padding: Theme.spacing.xs,
  },
  removeImageText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    fontFamily: Typography.fontFamily.semibold,
    marginLeft: 4,
  },
  actionRow: {
    marginTop: Theme.spacing.sm,
  },
  submitBtn: {
    width: '100%',
  },
});
