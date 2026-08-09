import { create } from 'zustand';
import { CartItem, Product, PickupSlot } from '../types';

interface CartState {
  shopId: string | null;
  shopName: string | null;
  items: CartItem[];
  selectedSlot: PickupSlot | null;

  addItem: (product: Product, quantity?: number, specialInstructions?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setShop: (shopId: string, shopName: string) => void;
  setPickupSlot: (slot: PickupSlot | null) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  shopId: null,
  shopName: null,
  items: [],
  selectedSlot: null,

  addItem: (product, quantity = 1, specialInstructions) => {
    const { items, shopId } = get();

    // If adding item from a different shop, prompt reset or auto-reset cart
    if (shopId && shopId !== product.shopId) {
      set({
        shopId: product.shopId,
        shopName: null,
        items: [{ product, quantity, specialInstructions }],
      });
      return;
    }

    const existingIndex = items.findIndex((i) => i.product.id === product.id);
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += quantity;
      set({ items: updated, shopId: product.shopId });
    } else {
      set({
        items: [...items, { product, quantity, specialInstructions }],
        shopId: product.shopId,
      });
    }
  },

  removeItem: (productId) => {
    const updated = get().items.filter((i) => i.product.id !== productId);
    set({
      items: updated,
      shopId: updated.length === 0 ? null : get().shopId,
    });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    const updated = get().items.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    set({ items: updated });
  },

  setShop: (shopId, shopName) => set({ shopId, shopName }),

  setPickupSlot: (selectedSlot) => set({ selectedSlot }),

  clearCart: () => set({ items: [], shopId: null, shopName: null, selectedSlot: null }),

  getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

  getTotalAmount: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
}));
