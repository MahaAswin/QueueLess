import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { SlotConfigService, ShopPickupSlotConfig } from '../../services/slotConfig.service';
import { ShopOwnerService } from '../../services/shopOwner.service';
import { ShopResponse } from '../../types';
import { SectionHeader } from '../../components/SectionHeader';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

export default function PickupSlotsManagementScreen() {
  const router = useRouter();
  const [shop, setShop] = useState<ShopResponse | null>(null);
  const [slots, setSlots] = useState<ShopPickupSlotConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingSlot, setEditingSlot] = useState<ShopPickupSlotConfig | null>(null);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [capacity, setCapacity] = useState<number>(5);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchSlotsData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const shops = await ShopOwnerService.getMyShops();
      const myShop = shops && shops.length > 0 ? shops[0] : null;
      setShop(myShop);

      const slotConfigs = await SlotConfigService.getSlotConfigs(myShop?.id);
      setSlots(slotConfigs);
    } catch (err) {
      console.warn('[PickupSlotsScreen] Error loading slots:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSlotsData();
    }, [fetchSlotsData])
  );

  const handleOpenAddModal = () => {
    setEditingSlot(null);
    setStartTime('');
    setEndTime('');
    setCapacity(5);
    setIsActive(true);
    setFormError(null);
    setModalVisible(true);
  };

  const handleOpenEditModal = (slot: ShopPickupSlotConfig) => {
    setEditingSlot(slot);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setCapacity(slot.capacity);
    setIsActive(slot.isActive);
    setFormError(null);
    setModalVisible(true);
  };

  const handleSaveSlot = async () => {
    setFormError(null);

    if (!startTime.trim()) {
      setFormError('Start time is required (e.g. 12:15 PM)');
      return;
    }
    if (!endTime.trim()) {
      setFormError('End time is required (e.g. 12:30 PM)');
      return;
    }
    if (capacity < 1) {
      setFormError('Order capacity must be at least 1 order');
      return;
    }
    if (editingSlot && capacity < editingSlot.bookedOrders) {
      setFormError(
        `Capacity cannot be less than currently booked orders (${editingSlot.bookedOrders})`
      );
      return;
    }

    try {
      setSaving(true);
      let updated: ShopPickupSlotConfig[];

      if (editingSlot) {
        updated = await SlotConfigService.updateSlot(
          editingSlot.id,
          {
            startTime: startTime.trim(),
            endTime: endTime.trim(),
            capacity,
            isActive,
          },
          shop?.id
        );
      } else {
        updated = await SlotConfigService.addSlot(
          {
            startTime: startTime.trim(),
            endTime: endTime.trim(),
            capacity,
            isActive,
          },
          shop?.id
        );
      }

      setSlots(updated);
      setModalVisible(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save pickup slot');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (slotId: string) => {
    try {
      const updated = await SlotConfigService.toggleSlotActive(slotId, shop?.id);
      setSlots(updated);
    } catch (err) {
      console.warn('[PickupSlotsScreen] Failed to toggle slot:', err);
    }
  };

  const handleDeleteSlot = (slot: ShopPickupSlotConfig) => {
    if (slot.bookedOrders > 0) {
      Alert.alert(
        'Cannot Delete Slot',
        `This slot currently has ${slot.bookedOrders} active order(s). It cannot be removed while orders are assigned.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Pickup Slot',
      `Are you sure you want to delete the slot "${slot.startTime} - ${slot.endTime}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = await SlotConfigService.deleteSlot(slot.id, shop?.id);
              setSlots(updated);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete slot');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.contentWrapper}>
        {/* Header with Add Slot CTA */}
        <View style={styles.headerRow}>
          <View style={styles.headerTextCol}>
            <Text style={styles.screenTitle}>Pickup Slot Limits</Text>
            <Text style={styles.screenSub}>
              {shop?.shopName ? `Cap orders per slot for ${shop.shopName}` : 'Manage zero-wait 15-min limits'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addSlotBtn}
            onPress={handleOpenAddModal}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color={Colors.white} />
            <Text style={styles.addSlotBtnText}>Add Slot</Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <LoadingState message="Loading pickup slots..." />
        ) : slots.length === 0 ? (
          <EmptyState
            iconName="time-outline"
            title="No Pickup Slots Configured"
            message="Configure time slots and order caps to ensure zero counter waiting."
            actionTitle="Add First Slot"
            onActionPress={handleOpenAddModal}
          />
        ) : (
          <FlatList
            data={slots}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchSlotsData(true)}
                colors={[Colors.primaryDeep]}
                tintColor={Colors.primaryDeep}
              />
            }
            renderItem={({ item }) => {
              const isFull = item.bookedOrders >= item.capacity;
              const utilizationPercent = Math.min(100, Math.round((item.bookedOrders / item.capacity) * 100));

              return (
                <View style={[styles.slotCard, !item.isActive && styles.disabledCard, Theme.shadows.soft]}>
                  {/* Top Row: Time Range & Badges */}
                  <View style={styles.slotTopRow}>
                    <View style={styles.timeWrapper}>
                      <Ionicons
                        name="time-outline"
                        size={18}
                        color={item.isActive ? Colors.primaryDeep : Colors.secondaryText}
                      />
                      <Text style={[styles.slotTimeText, !item.isActive && styles.disabledText]}>
                        {item.startTime} - {item.endTime}
                      </Text>
                    </View>

                    <View style={styles.badgeRow}>
                      {isFull && item.isActive && (
                        <View style={styles.fullBadge}>
                          <Text style={styles.fullBadgeText}>FULL</Text>
                        </View>
                      )}
                      <View style={[styles.statusBadge, item.isActive ? styles.activeBadge : styles.inactiveBadge]}>
                        <Text style={[styles.statusBadgeText, item.isActive ? styles.activeBadgeText : styles.inactiveBadgeText]}>
                          {item.isActive ? 'Active' : 'Disabled'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Middle Row: Capacity Count & Progress Bar */}
                  <View style={styles.capacityRow}>
                    <Text style={styles.capacityLabel}>Order Workload:</Text>
                    <Text style={[styles.capacityValue, isFull && item.isActive && styles.capacityFullText]}>
                      {item.bookedOrders} / {item.capacity} orders {isFull && item.isActive ? '(100%)' : `(${utilizationPercent}%)`}
                    </Text>
                  </View>

                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${utilizationPercent}%`,
                          backgroundColor: isFull ? Colors.error : Colors.primaryDeep,
                        },
                      ]}
                    />
                  </View>

                  {/* Bottom Actions Row */}
                  <View style={styles.slotActionRow}>
                    <View style={styles.toggleWrapper}>
                      <Switch
                        value={item.isActive}
                        onValueChange={() => handleToggleActive(item.id)}
                        trackColor={{ false: Colors.border, true: Colors.sage }}
                        thumbColor={item.isActive ? Colors.primaryDeep : '#9CA3AF'}
                      />
                      <Text style={styles.toggleText}>{item.isActive ? 'Enabled' : 'Disabled'}</Text>
                    </View>

                    <View style={styles.btnActionGroup}>
                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => handleOpenEditModal(item)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="create-outline" size={16} color={Colors.primaryDeep} />
                        <Text style={styles.editBtnText}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.deleteBtn, item.bookedOrders > 0 && styles.disabledDeleteBtn]}
                        onPress={() => handleDeleteSlot(item)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color={item.bookedOrders > 0 ? Colors.secondaryText : Colors.error}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>

      {/* Add / Edit Slot Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {editingSlot ? 'Edit Pickup Slot' : 'Add Pickup Slot'}
                </Text>
                <Text style={styles.modalSub}>
                  Set time window & max order limit per slot
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Form Error Banner */}
              {formError && (
                <View style={styles.errorCard}>
                  <Ionicons name="alert-circle" size={16} color={Colors.error} />
                  <Text style={styles.errorText}>{formError}</Text>
                </View>
              )}

              {/* Time Range Inputs */}
              <View style={styles.timeInputsRow}>
                <View style={styles.timeInputCol}>
                  <Input
                    label="Start Time"
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="12:15 PM"
                    autoCapitalize="characters"
                  />
                </View>
                <View style={styles.timeInputCol}>
                  <Input
                    label="End Time"
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="12:30 PM"
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              {/* Capacity Counter */}
              <View style={styles.capacitySection}>
                <Text style={styles.capacitySectionTitle}>Max Order Capacity (Per Slot)</Text>
                <Text style={styles.capacitySectionSub}>
                  Limits orders accepted to guarantee zero counter delay
                </Text>

                <View style={styles.counterRow}>
                  <TouchableOpacity
                    style={[styles.counterBtn, capacity <= 1 && styles.counterBtnDisabled]}
                    onPress={() => setCapacity((prev) => Math.max(1, prev - 1))}
                    disabled={capacity <= 1}
                  >
                    <Ionicons name="remove" size={20} color={capacity <= 1 ? Colors.secondaryText : Colors.primaryDeep} />
                  </TouchableOpacity>

                  <View style={styles.counterDisplay}>
                    <Text style={styles.counterValue}>{capacity}</Text>
                    <Text style={styles.counterUnit}>orders max</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setCapacity((prev) => prev + 1)}
                  >
                    <Ionicons name="add" size={20} color={Colors.primaryDeep} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Active Toggle Switch */}
              <View style={styles.modalToggleRow}>
                <View>
                  <Text style={styles.modalToggleTitle}>Enable Slot for Customers</Text>
                  <Text style={styles.modalToggleSub}>Active slots appear during checkout</Text>
                </View>
                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
                  trackColor={{ false: Colors.border, true: Colors.sage }}
                  thumbColor={isActive ? Colors.primaryDeep : '#9CA3AF'}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <Button
                  title={saving ? 'Saving...' : editingSlot ? 'Update Slot' : 'Create Slot'}
                  onPress={handleSaveSlot}
                  isLoading={saving}
                  style={styles.saveBtn}
                />
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setModalVisible(false)}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentWrapper: { flex: 1, paddingHorizontal: Theme.spacing.md },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Theme.spacing.md,
  },
  headerTextCol: { flex: 1, marginRight: Theme.spacing.sm },
  screenTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  screenSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  addSlotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryDeep,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
  },
  addSlotBtnText: {
    color: Colors.white,
    fontSize: Typography.fontSize.xs + 1,
    fontFamily: Typography.fontFamily.bold,
    marginLeft: 4,
  },
  listContainer: { paddingBottom: Theme.spacing.xxl },
  slotCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disabledCard: {
    opacity: 0.7,
    backgroundColor: '#F9FAFB',
  },
  slotTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs + 2,
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotTimeText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginLeft: 6,
  },
  disabledText: {
    color: Colors.secondaryText,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fullBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  fullBadgeText: {
    color: Colors.error,
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
  },
  activeBadge: {
    backgroundColor: Colors.lightSage,
  },
  inactiveBadge: {
    backgroundColor: '#E5E7EB',
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
  },
  activeBadgeText: {
    color: Colors.primaryDeep,
  },
  inactiveBadgeText: {
    color: Colors.secondaryText,
  },
  capacityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
    marginBottom: 4,
  },
  capacityLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
  },
  capacityValue: {
    fontSize: Typography.fontSize.xs + 1,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
  capacityFullText: {
    color: Colors.error,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: Theme.borderRadius.full,
    overflow: 'hidden',
    marginBottom: Theme.spacing.md,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: Theme.borderRadius.full,
  },
  slotActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Theme.spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  toggleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginLeft: 6,
  },
  btnActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightSage,
    paddingHorizontal: Theme.spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.md,
  },
  editBtnText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
    marginLeft: 3,
  },
  deleteBtn: {
    padding: 6,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: '#FEE2E2',
  },
  disabledDeleteBtn: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  modalSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    marginLeft: 6,
    flex: 1,
  },
  timeInputsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  timeInputCol: {
    flex: 1,
  },
  capacitySection: {
    backgroundColor: Colors.lightSage,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    marginVertical: Theme.spacing.sm,
  },
  capacitySectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  capacitySectionSub: {
    fontSize: Typography.fontSize.xs - 1,
    color: Colors.secondaryText,
    marginTop: 2,
    marginBottom: Theme.spacing.sm,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.lg,
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  counterBtnDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  counterDisplay: {
    alignItems: 'center',
    minWidth: 80,
  },
  counterValue: {
    fontSize: Typography.fontSize.xxl || 24,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
  counterUnit: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
  },
  modalToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    marginVertical: Theme.spacing.sm,
  },
  modalToggleTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  modalToggleSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  modalActions: {
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  saveBtn: {
    width: '100%',
  },
});
