import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ProductService } from '../../../services/product.service';
import { ShopService } from '../../../services/shop.service';
import { ProductResponse, ShopResponse } from '../../../types';
import { formatProductCategory } from '../../../components/ProductCard';
import { LoadingState } from '../../../components/LoadingState';
import { ErrorState } from '../../../components/ErrorState';
import { Button } from '../../../components/Button';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { Theme } from '../../../constants/theme';
import { useCartStore } from '../../../store/cartStore';

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams<{ productId: string }>();

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [shop, setShop] = useState<ShopResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Cart interaction state
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [cartErrorAlert, setCartErrorAlert] = useState<string | null>(null);

  // Multi-shop modal state
  const [showMultiShopModal, setShowMultiShopModal] = useState(false);
  const [existingShopName, setExistingShopName] = useState('another shop');

  // Cart store hooks
  const addItem = useCartStore((state) => state.addItem);
  const replaceCartAndAdd = useCartStore((state) => state.replaceCartAndAdd);
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const fetchCart = useCartStore((state) => state.fetchCart);

  const fetchProductDetails = async () => {
    if (!productId) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      setImageError(false);

      const productData = await ProductService.getProductById(productId);
      setProduct(productData);

      if (productData.shopId) {
        try {
          const shopData = await ShopService.getShopById(productData.shopId);
          setShop(shopData);
        } catch (shopErr) {
          console.warn('[ProductDetailsScreen] Shop fetch failed:', shopErr);
        }
      }
    } catch (err: any) {
      console.warn('[ProductDetailsScreen] Error loading product:', err);
      const status = err.response?.status;
      if (status === 404) {
        setErrorMsg('Product no longer exists or is no longer available.');
      } else {
        setErrorMsg('Unable to load product details. Please check network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    fetchCart();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product || !productId) return;
    if (!product.available || (product.stockQuantity !== undefined && product.stockQuantity <= 0)) {
      return;
    }

    try {
      setAddingToCart(true);
      setShowSuccessBanner(false);
      setCartErrorAlert(null);

      const result = await addItem(productId, quantity);

      if (result.success) {
        setShowSuccessBanner(true);
      } else if (result.isMultiShopError) {
        setExistingShopName(result.existingShopName || 'another shop');
        setShowMultiShopModal(true);
      } else if (result.error) {
        setCartErrorAlert(result.error);
      }
    } catch (err: any) {
      console.warn('[ProductDetailsScreen] Add to cart error:', err);
      setCartErrorAlert('Failed to add product to cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleConfirmReplaceCart = async () => {
    if (!productId) return;
    try {
      setShowMultiShopModal(false);
      setAddingToCart(true);
      const success = await replaceCartAndAdd(productId, quantity);
      if (success) {
        setShowSuccessBanner(true);
      } else {
        setCartErrorAlert('Unable to replace cart. Please try again.');
      }
    } catch (err) {
      setCartErrorAlert('Error replacing cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LoadingState message="Loading product details..." />
      </SafeAreaView>
    );
  }

  if (errorMsg || !product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <ErrorState
          title="Product Unavailable"
          message={errorMsg || 'Failed to load product details.'}
          onRetry={fetchProductDetails}
        />
      </SafeAreaView>
    );
  }

  const isAvailable = product.available && (product.stockQuantity === undefined || product.stockQuantity > 0);
  const priceFormatted = `₹${(typeof product.price === 'number' ? product.price : parseFloat(product.price || 0)).toFixed(2)}`;
  const categoryFormatted = formatProductCategory(product.category);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Navigation Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            Product Details
          </Text>

          {/* Cart Icon with Badge */}
          <TouchableOpacity
            style={styles.cartIconButton}
            onPress={() => router.push('/(customer)/cart')}
            accessibilityLabel={`Cart with ${cartItemCount} items`}
            accessibilityRole="button"
          >
            <Ionicons name="cart-outline" size={24} color={Colors.primaryDeep} />
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Success Alert Banner */}
        {showSuccessBanner && (
          <View style={styles.successBanner}>
            <View style={styles.successBannerContent}>
              <Ionicons name="checkmark-circle" size={20} color="#03543F" />
              <Text style={styles.successBannerText}>
                Added {quantity} {quantity === 1 ? 'item' : 'items'} to your cart!
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewCartButton}
              onPress={() => router.push('/(customer)/cart')}
            >
              <Text style={styles.viewCartText}>View Cart</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.primaryDeep} />
            </TouchableOpacity>
          </View>
        )}

        {/* Error Alert Banner */}
        {cartErrorAlert && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={20} color={Colors.error} />
            <Text style={styles.errorBannerText}>{cartErrorAlert}</Text>
            <TouchableOpacity onPress={() => setCartErrorAlert(null)}>
              <Ionicons name="close" size={18} color={Colors.error} />
            </TouchableOpacity>
          </View>
        )}

        {/* Product Image Container */}
        <View style={styles.imageContainer}>
          {product.imageUrl && !imageError ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={[styles.image, !isAvailable && styles.dimmedImage]}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={[styles.placeholderImage, !isAvailable && styles.dimmedImage]}>
              <Ionicons
                name="cube-outline"
                size={64}
                color={isAvailable ? Colors.primaryDeep : Colors.secondaryText}
              />
              <Text style={styles.placeholderSubText}>{categoryFormatted}</Text>
            </View>
          )}

          <View
            style={[
              styles.availabilityBadge,
              isAvailable ? styles.availableBadge : styles.unavailableBadge,
            ]}
          >
            <Text
              style={[
                styles.availabilityBadgeText,
                isAvailable ? styles.availableBadgeText : styles.unavailableBadgeText,
              ]}
            >
              {isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
            </Text>
          </View>
        </View>

        {/* Product Header Card */}
        <View style={styles.infoCard}>
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{categoryFormatted}</Text>
            </View>

            {product.stockQuantity !== undefined && product.stockQuantity !== null && (
              <View style={styles.stockQuantityContainer}>
                <Ionicons
                  name={product.stockQuantity > 0 ? 'checkmark-circle' : 'close-circle'}
                  size={14}
                  color={product.stockQuantity > 0 ? Colors.primaryDeep : Colors.error}
                />
                <Text style={styles.stockQuantityText}>
                  {product.stockQuantity > 0
                    ? `In Stock (${product.stockQuantity} available)`
                    : 'Out of stock'}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>{priceFormatted}</Text>

          {!isAvailable && (
            <View style={styles.unavailableWarning}>
              <Ionicons name="alert-circle-outline" size={18} color={Colors.error} />
              <Text style={styles.unavailableWarningText}>
                This product is currently marked as unavailable by the shop owner.
              </Text>
            </View>
          )}
        </View>

        {/* Quantity Selector & Add to Cart Section */}
        <View style={styles.cartActionCard}>
          <Text style={styles.sectionTitle}>Select Quantity</Text>
          <View style={styles.quantityRow}>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[styles.qtyButton, (quantity <= 1 || !isAvailable) && styles.disabledQtyButton]}
                onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
                disabled={quantity <= 1 || !isAvailable}
              >
                <Ionicons name="remove" size={18} color={quantity <= 1 || !isAvailable ? Colors.secondaryText : Colors.primaryDeep} />
              </TouchableOpacity>

              <Text style={styles.quantityText}>{quantity}</Text>

              <TouchableOpacity
                style={[
                  styles.qtyButton,
                  (product.stockQuantity !== undefined && quantity >= product.stockQuantity || !isAvailable) && styles.disabledQtyButton,
                ]}
                onPress={() =>
                  setQuantity((prev) =>
                    product.stockQuantity !== undefined ? Math.min(product.stockQuantity, prev + 1) : prev + 1
                  )
                }
                disabled={!isAvailable || (product.stockQuantity !== undefined && quantity >= product.stockQuantity)}
              >
                <Ionicons
                  name="add"
                  size={18}
                  color={
                    !isAvailable || (product.stockQuantity !== undefined && quantity >= product.stockQuantity)
                      ? Colors.secondaryText
                      : Colors.primaryDeep
                  }
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.itemSubtotalText}>
              Subtotal: ₹{((typeof product.price === 'number' ? product.price : parseFloat(product.price || 0)) * quantity).toFixed(2)}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.addToCartCta,
              !isAvailable && styles.disabledAddToCartCta,
            ]}
            onPress={handleAddToCart}
            disabled={!isAvailable || addingToCart}
            activeOpacity={0.85}
          >
            {addingToCart ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <Ionicons name="cart" size={20} color={Colors.white} style={{ marginRight: 8 }} />
                <Text style={styles.addToCartCtaText}>
                  {isAvailable ? 'Add to Cart' : 'Currently Unavailable'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Description Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {product.description && product.description.trim() !== ''
              ? product.description
              : 'No detailed description provided for this product.'}
          </Text>
        </View>

        {/* Shop Information Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Sold By</Text>

          <View style={styles.shopRow}>
            <View style={styles.shopAvatar}>
              <Ionicons name="storefront" size={24} color={Colors.primaryDeep} />
            </View>

            <View style={styles.shopInfoText}>
              <Text style={styles.shopName}>
                {shop?.shopName || product.shopName || 'Partner Shop'}
              </Text>

              {shop?.address && (
                <Text style={styles.shopAddress} numberOfLines={2}>
                  <Ionicons name="location-outline" size={13} color={Colors.secondaryText} />{' '}
                  {shop.address}{shop.city ? `, ${shop.city}` : ''}
                </Text>
              )}

              {shop?.category && (
                <Text style={styles.shopCategory}>
                  Category: {shop.category}
                </Text>
              )}
            </View>
          </View>

          {product.shopId && (
            <TouchableOpacity
              style={styles.visitShopButton}
              onPress={() => router.push(`/(customer)/shop/${product.shopId}` as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.visitShopButtonText}>Visit Shop</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.primaryDeep} />
            </TouchableOpacity>
          )}
        </View>

        {/* Back Action */}
        <View style={styles.actionSection}>
          <Button
            title="Back to Catalog"
            onPress={() => router.back()}
            variant="outline"
          />
        </View>
      </ScrollView>

      {/* Multi-Shop Confirmation Modal */}
      <Modal
        visible={showMultiShopModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMultiShopModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderIcon}>
              <Ionicons name="swap-horizontal" size={28} color={Colors.primaryDeep} />
            </View>

            <Text style={styles.modalTitle}>Replace Cart Items?</Text>
            <Text style={styles.modalMessage}>
              Your cart currently contains items from <Text style={styles.boldText}>{existingShopName}</Text>.
              {'\n\n'}
              QueueLess orders belong to one shop per pickup. Would you like to clear your cart and add this product from{' '}
              <Text style={styles.boldText}>{shop?.shopName || product.shopName || 'this shop'}</Text>?
            </Text>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowMultiShopModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleConfirmReplaceCart}
              >
                <Text style={styles.modalConfirmButtonText}>Replace & Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    textAlign: 'center',
    flex: 1,
  },
  cartIconButton: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.primaryDeep,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontFamily: Typography.fontFamily.bold,
  },
  successBanner: {
    backgroundColor: '#DEF7EC',
    borderColor: '#31C48D',
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  successBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  successBannerText: {
    color: '#03543F',
    fontSize: Typography.fontSize.xs + 1,
    fontFamily: Typography.fontFamily.bold,
    marginLeft: Theme.spacing.xs,
  },
  viewCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCartText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
    marginRight: 2,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  errorBannerText: {
    color: Colors.error,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    marginHorizontal: Theme.spacing.xs,
    flex: 1,
  },
  imageContainer: {
    height: 220,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Theme.spacing.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dimmedImage: {
    opacity: 0.6,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.lightSage,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderSubText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primaryDeep,
    marginTop: Theme.spacing.xs,
  },
  availabilityBadge: {
    position: 'absolute',
    top: Theme.spacing.sm,
    right: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.full,
  },
  availableBadge: {
    backgroundColor: Colors.primaryDeep,
  },
  unavailableBadge: {
    backgroundColor: Colors.secondaryText,
  },
  availabilityBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 0.5,
  },
  availableBadgeText: {},
  unavailableBadgeText: {},
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Theme.spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.xs,
  },
  categoryBadge: {
    backgroundColor: Colors.lightSage,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.sm,
  },
  categoryText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
  stockQuantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockQuantityText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    fontFamily: Typography.fontFamily.medium,
    marginLeft: 4,
  },
  productName: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginBottom: Theme.spacing.xs,
  },
  productPrice: {
    fontSize: Typography.fontSize.xxl || 22,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
    marginBottom: Theme.spacing.xs,
  },
  unavailableWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.sm,
    marginTop: Theme.spacing.xs,
  },
  unavailableWarningText: {
    color: Colors.error,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    marginLeft: Theme.spacing.xs,
    flex: 1,
  },
  cartActionCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Theme.spacing.md,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightSage,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disabledQtyButton: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  quantityText: {
    marginHorizontal: Theme.spacing.md,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  itemSubtotalText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
  },
  addToCartCta: {
    backgroundColor: Colors.primaryDeep,
    height: 48,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledAddToCartCta: {
    backgroundColor: Colors.secondaryText,
    opacity: 0.6,
  },
  addToCartCtaText: {
    color: Colors.white,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Theme.spacing.sm,
  },
  descriptionText: {
    fontSize: Typography.fontSize.sm + 1,
    color: Colors.text,
    lineHeight: 22,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopAvatar: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.lightSage,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.sm,
  },
  shopInfoText: {
    flex: 1,
  },
  shopName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  shopAddress: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  shopCategory: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  visitShopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.sm,
  },
  visitShopButtonText: {
    fontSize: Typography.fontSize.xs + 1,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDeep,
    marginRight: 2,
  },
  actionSection: {
    marginTop: Theme.spacing.xs,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  modalHeaderIcon: {
    width: 56,
    height: 56,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Colors.lightSage,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginBottom: Theme.spacing.xs,
  },
  modalMessage: {
    fontSize: Typography.fontSize.sm,
    color: Colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Theme.spacing.xl,
  },
  boldText: {
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: Theme.spacing.sm,
  },
  modalCancelButton: {
    flex: 1,
    height: 44,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  modalConfirmButton: {
    flex: 1,
    height: 44,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.primaryDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
  },
});
