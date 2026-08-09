import { create } from 'zustand';
import { CartResponse } from '../types';
import { CartService } from '../services/cart.service';

interface AddItemResult {
  success: boolean;
  isMultiShopError?: boolean;
  existingShopName?: string;
  error?: string;
}

interface CartState {
  cart: CartResponse | null;
  loading: boolean;
  itemLoading: Record<string, boolean>;
  error: string | null;

  fetchCart: () => Promise<CartResponse | null>;
  addItem: (productId: string, quantity?: number) => Promise<AddItemResult>;
  replaceCartAndAdd: (productId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  getItemCount: () => number;
  getSubtotal: () => number;
  resetError: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  loading: false,
  itemLoading: {},
  error: null,

  fetchCart: async () => {
    try {
      set({ loading: true, error: null });
      const cartData = await CartService.getCart();
      set({ cart: cartData, loading: false });
      return cartData;
    } catch (err: any) {
      console.warn('[useCartStore] Error fetching cart:', err);
      // If unauthorized or error, soft handle
      set({ loading: false, error: 'Unable to fetch cart details' });
      return null;
    }
  },

  addItem: async (productId: string, quantity: number = 1) => {
    try {
      set({ error: null });
      const updatedCart = await CartService.addToCart(productId, quantity);
      set({ cart: updatedCart });
      return { success: true };
    } catch (err: any) {
      console.warn('[useCartStore] Error adding item to cart:', err);
      const message = err.response?.data?.message || err.message || '';
      
      // Check for multi-shop restriction
      const isMultiShop =
        message.toLowerCase().includes('one shop') ||
        message.toLowerCase().includes('different shop') ||
        err.response?.status === 400 && message.includes('shop');

      if (isMultiShop) {
        const currentCart = get().cart;
        return {
          success: false,
          isMultiShopError: true,
          existingShopName: currentCart?.shopName || 'another shop',
          error: 'Your cart contains items from another shop.',
        };
      }

      const friendlyError =
        message.includes('stock') ? message : 'Unable to add item to cart.';
      set({ error: friendlyError });
      return { success: false, error: friendlyError };
    }
  },

  replaceCartAndAdd: async (productId: string, quantity: number = 1) => {
    try {
      set({ loading: true, error: null });
      await CartService.clearCart();
      const newCart = await CartService.addToCart(productId, quantity);
      set({ cart: newCart, loading: false });
      return true;
    } catch (err: any) {
      console.warn('[useCartStore] Error replacing cart:', err);
      set({ loading: false, error: 'Failed to replace cart.' });
      return false;
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      return get().removeItem(itemId);
    }

    try {
      set((state) => ({
        itemLoading: { ...state.itemLoading, [itemId]: true },
        error: null,
      }));

      const updatedCart = await CartService.updateCartItemQuantity(itemId, quantity);
      set((state) => ({
        cart: updatedCart,
        itemLoading: { ...state.itemLoading, [itemId]: false },
      }));
      return true;
    } catch (err: any) {
      console.warn('[useCartStore] Error updating item quantity:', err);
      const message = err.response?.data?.message || 'Unable to update item quantity.';
      set((state) => ({
        itemLoading: { ...state.itemLoading, [itemId]: false },
        error: message,
      }));
      return false;
    }
  },

  removeItem: async (itemId: string) => {
    try {
      set((state) => ({
        itemLoading: { ...state.itemLoading, [itemId]: true },
        error: null,
      }));

      const updatedCart = await CartService.removeCartItem(itemId);
      set((state) => ({
        cart: updatedCart,
        itemLoading: { ...state.itemLoading, [itemId]: false },
      }));
      return true;
    } catch (err: any) {
      console.warn('[useCartStore] Error removing item:', err);
      set((state) => ({
        itemLoading: { ...state.itemLoading, [itemId]: false },
        error: 'Unable to remove item from cart.',
      }));
      return false;
    }
  },

  clearCart: async () => {
    try {
      set({ loading: true, error: null });
      const clearedCart = await CartService.clearCart();
      set({ cart: clearedCart, loading: false });
      return true;
    } catch (err: any) {
      console.warn('[useCartStore] Error clearing cart:', err);
      set({ loading: false, error: 'Unable to clear cart.' });
      return false;
    }
  },

  getItemCount: () => {
    return get().cart?.totalItemCount || 0;
  },

  getSubtotal: () => {
    return get().cart?.subtotal || 0;
  },

  resetError: () => set({ error: null }),
}));
