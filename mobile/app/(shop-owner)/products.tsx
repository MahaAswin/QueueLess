import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Image,
  RefreshControl,
  Modal,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ShopOwnerService } from '../../services/shopOwner.service';
import { ProductResponse, ShopResponse, BackendProductCategory } from '../../types';
import { SectionHeader } from '../../components/SectionHeader';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Theme } from '../../constants/theme';

const PRODUCT_CATEGORIES: { label: string; value: BackendProductCategory }[] = [
  { label: 'Beverages', value: 'BEVERAGES' },
  { label: 'Bakery', value: 'BAKERY' },
  { label: 'Restaurant', value: 'RESTAURANT' },
  { label: 'Snacks', value: 'SNACKS' },
  { label: 'Grocery', value: 'GROCERY' },
  { label: 'Fruits & Veg', value: 'FRUITS_VEGETABLES' },
  { label: 'Dairy', value: 'DAIRY' },
  { label: 'Other', value: 'OTHER' },
];

export default function ShopOwnerProductsScreen() {
  const [shop, setShop] = useState<ShopResponse | null>(null);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Modal State for Add / Edit Product
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<string>('5');
  const [stockQuantity, setStockQuantity] = useState<string>('20');
  const [category, setCategory] = useState<BackendProductCategory>('BEVERAGES');
  const [description, setDescription] = useState<string>('');
  const [available, setAvailable] = useState<boolean>(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchShopProducts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const shops = await ShopOwnerService.getMyShops();
      if (shops && shops.length > 0) {
        const myShop = shops[0];
        setShop(myShop);
        const prods = await ShopOwnerService.getShopProducts(myShop.id);
        setProducts(prods || []);
      }
    } catch (err) {
      console.error('[ShopOwnerProductsScreen] Error loading shop products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchShopProducts();
    }, [fetchShopProducts])
  );

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setPrepTimeMinutes('5');
    setStockQuantity('20');
    setCategory('BEVERAGES');
    setDescription('');
    setAvailable(true);
    setFormError(null);
    setModalVisible(true);
  };

  const handleOpenEditModal = (product: ProductResponse) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price.toString());
    setStockQuantity(product.stockQuantity !== undefined ? product.stockQuantity.toString() : '20');
    setCategory(product.category || 'BEVERAGES');
    setDescription(product.description || '');
    setAvailable(product.available ?? true);

    // Extract prep time if present in description (e.g. "Prep: 4 mins")
    const match = product.description?.match(/Prep:\s*(\d+)\s*mins?/i);
    setPrepTimeMinutes(match ? match[1] : '5');

    setFormError(null);
    setModalVisible(true);
  };

  const handleSaveProduct = async () => {
    setFormError(null);

    if (!name.trim()) {
      setFormError('Product name is required');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Please enter a valid price greater than 0');
      return;
    }

    const stockNum = parseInt(stockQuantity, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setFormError('Please enter a valid stock quantity (0 or greater)');
      return;
    }

    if (!shop?.id) {
      setFormError('Shop details not loaded. Please pull to refresh.');
      return;
    }

    try {
      setSaving(true);
      const prepStr = prepTimeMinutes.trim() ? `Prep: ${prepTimeMinutes.trim()} mins` : '';
      const finalDesc = description.trim()
        ? `${prepStr}${prepStr ? ' • ' : ''}${description.trim()}`
        : prepStr || 'Freshly prepared item';

      if (editingProduct) {
        // Update product via PUT /api/products/{id}
        const updated = await ShopOwnerService.updateProduct(editingProduct.id, {
          name: name.trim(),
          price: priceNum,
          category,
          stockQuantity: stockNum,
          description: finalDesc,
          available,
        });

        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? updated : p))
        );
      } else {
        // Create product via POST /api/shops/{shopId}/products
        const created = await ShopOwnerService.createProduct(shop.id, {
          name: name.trim(),
          price: priceNum,
          category,
          stockQuantity: stockNum,
          description: finalDesc,
          available,
        });

        setProducts((prev) => [created, ...prev]);
      }

      setModalVisible(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save product';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (productId: string, currentVal: boolean) => {
    try {
      setUpdatingId(productId);
      const updated = await ShopOwnerService.updateProductAvailability(productId, !currentVal);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? updated : p))
      );
    } catch (err) {
      console.warn('[ShopOwnerProductsScreen] Failed to toggle availability:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteProduct = (product: ProductResponse) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to remove "${product.name}" from your catalog?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ShopOwnerService.deleteProduct(product.id);
              setProducts((prev) => prev.filter((p) => p.id !== product.id));
            } catch (err: any) {
              Alert.alert(
                'Delete Failed',
                err.response?.data?.message || 'Unable to delete product.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.contentWrapper}>
        {/* Header with Add Product CTA */}
        <View style={styles.headerRow}>
          <View style={styles.headerTextCol}>
            <Text style={styles.screenTitle}>Inventory & Products</Text>
            <Text style={styles.screenSub}>
              {shop?.shopName ? `Manage catalog for ${shop.shopName}` : 'Product availability & stock'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addProductBtn}
            onPress={handleOpenAddModal}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color={Colors.white} />
            <Text style={styles.addProductBtnText}>Add Product</Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <LoadingState message="Loading catalog..." />
        ) : products.length === 0 ? (
          <EmptyState
            iconName="cube-outline"
            title="No products in catalog"
            message="Add items to your catalog so customers can order with zero waiting."
            actionTitle="Add First Product"
            onActionPress={handleOpenAddModal}
          />
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchShopProducts(true)}
                colors={[Colors.primaryDeep]}
                tintColor={Colors.primaryDeep}
              />
            }
            renderItem={({ item }) => {
              const isUpdating = updatingId === item.id;
              const isAvailable = item.available ?? true;

              // Extract prep time
              const prepMatch = item.description?.match(/Prep:\s*(\d+\s*mins?)/i);
              const prepDisplay = prepMatch ? prepMatch[1] : '5 mins';

              return (
                <View style={[styles.card, Theme.shadows.soft]}>
                  {/* Left: Product Image / Icon */}
                  {item.imageUrl && (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('file:')) ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="fast-food-outline" size={24} color={Colors.primaryDeep} />
                    </View>
                  )}

                  {/* Middle: Info */}
                  <View style={styles.productTextWrapper}>
                    <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.productPrice}>
                      ₹{(item.price || 0).toFixed(2)} • <Text style={styles.prepText}>Prep: {prepDisplay}</Text>
                    </Text>
                    {item.stockQuantity !== undefined && item.stockQuantity !== null && (
                      <Text style={styles.stockText}>Stock: {item.stockQuantity} units</Text>
                    )}
                  </View>

                  {/* Right: Controls & Actions */}
                  <View style={styles.actionsCol}>
                    <View style={styles.switchWrapper}>
                      <Switch
                        value={isAvailable}
                        onValueChange={() => handleToggleAvailability(item.id, isAvailable)}
                        disabled={isUpdating}
                        trackColor={{ false: Colors.border, true: Colors.sage }}
                        thumbColor={isAvailable ? Colors.primaryDeep : '#9CA3AF'}
                      />
                    </View>

                    <View style={styles.actionButtonsRow}>
                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => handleOpenEditModal(item)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="create-outline" size={16} color={Colors.primaryDeep} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteProduct(item)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={16} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>

      {/* Add / Edit Product Modal */}
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
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </Text>
                <Text style={styles.modalSub}>
                  Configure product details, price & prep estimates
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
              {/* Error Banner */}
              {formError && (
                <View style={styles.errorCard}>
                  <Ionicons name="alert-circle" size={16} color={Colors.error} />
                  <Text style={styles.errorText}>{formError}</Text>
                </View>
              )}

              {/* Product Name */}
              <Input
                label="Product Name *"
                value={name}
                onChangeText={setName}
                placeholder="e.g. Iced Oat Vanilla Matcha"
              />

              {/* Price and Prep Time */}
              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Input
                    label="Price (₹) *"
                    value={price}
                    onChangeText={setPrice}
                    placeholder="5.50"
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.formCol}>
                  <Input
                    label="Prep Time (mins) *"
                    value={prepTimeMinutes}
                    onChangeText={setPrepTimeMinutes}
                    placeholder="5"
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              {/* Stock Quantity */}
              <Input
                label="Stock Quantity *"
                value={stockQuantity}
                onChangeText={setStockQuantity}
                placeholder="20"
                keyboardType="number-pad"
              />

              {/* Category Selection */}
              <Text style={styles.fieldLabel}>Category *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryChipsScroll}
              >
                {PRODUCT_CATEGORIES.map((cat) => {
                  const isSelected = category === cat.value;
                  return (
                    <TouchableOpacity
                      key={cat.value}
                      style={[styles.categoryChip, isSelected && styles.selectedCategoryChip]}
                      onPress={() => setCategory(cat.value)}
                    >
                      <Text style={[styles.categoryChipText, isSelected && styles.selectedCategoryChipText]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Description */}
              <Input
                label="Short Description (Optional)"
                value={description}
                onChangeText={setDescription}
                placeholder="e.g. Made with organic oat milk & ceremonial grade matcha"
                multiline
                numberOfLines={2}
              />

              {/* In Stock Toggle */}
              <View style={styles.modalToggleRow}>
                <View>
                  <Text style={styles.modalToggleTitle}>In Stock / Available</Text>
                  <Text style={styles.modalToggleSub}>Allow customers to add this to cart</Text>
                </View>
                <Switch
                  value={available}
                  onValueChange={setAvailable}
                  trackColor={{ false: Colors.border, true: Colors.sage }}
                  thumbColor={available ? Colors.primaryDeep : '#9CA3AF'}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <Button
                  title={saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                  onPress={handleSaveProduct}
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
  addProductBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryDeep,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
  },
  addProductBtnText: {
    color: Colors.white,
    fontSize: Typography.fontSize.xs + 1,
    fontFamily: Typography.fontFamily.bold,
    marginLeft: 4,
  },
  listContainer: { paddingBottom: Theme.spacing.xxl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  productImage: {
    width: 52,
    height: 52,
    borderRadius: Theme.borderRadius.md,
    marginRight: Theme.spacing.sm,
  },
  imagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.lightSage,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.sm,
  },
  productTextWrapper: { flex: 1, marginRight: Theme.spacing.xs },
  productName: {
    fontSize: Typography.fontSize.sm + 1,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  productPrice: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.primaryDeep,
    marginTop: 2,
  },
  prepText: {
    color: Colors.secondaryText,
    fontFamily: Typography.fontFamily.medium,
  },
  stockText: {
    fontSize: 10,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  actionsCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
  },
  switchWrapper: {
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editBtn: {
    padding: 6,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.lightSage,
  },
  deleteBtn: {
    padding: 6,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: '#FEE2E2',
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
    maxHeight: '92%',
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
  closeBtn: { padding: 4 },
  modalScrollContent: { paddingBottom: Theme.spacing.xl },
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
  formRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  formCol: { flex: 1 },
  fieldLabel: {
    fontSize: Typography.fontSize.xs + 1,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginBottom: 6,
    marginTop: 4,
  },
  categoryChipsScroll: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Theme.spacing.md,
    paddingVertical: 2,
  },
  categoryChip: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedCategoryChip: {
    backgroundColor: Colors.primaryDeep,
    borderColor: Colors.primaryDeep,
  },
  categoryChipText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
  },
  selectedCategoryChipText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
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
  saveBtn: { width: '100%' },
});
