import { apiClient } from '../api/axiosClient';
import type { Cart, CartItem } from '../types/cart.types';
import { getDemoProductById, getDemoShopById } from '../data/demoShops';

const DEMO_CART_STORAGE_KEY = 'queueless_demo_cart';

// Helper to read local demo cart
const getLocalDemoCart = (): Cart => {
  try {
    const raw = localStorage.getItem(DEMO_CART_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read local demo cart', e);
  }
  return { items: [], totalItemCount: 0, subtotal: 0 };
};

// Helper to persist local demo cart
const saveLocalDemoCart = (cart: Cart): Cart => {
  const totalItemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const updatedCart: Cart = {
    ...cart,
    totalItemCount,
    subtotal,
  };
  try {
    localStorage.setItem(DEMO_CART_STORAGE_KEY, JSON.stringify(updatedCart));
  } catch (e) {
    console.error('Failed to save local demo cart', e);
  }
  return updatedCart;
};

const normalizeCart = (raw: any): Cart => {
  if (!raw) return { items: [], totalItemCount: 0, subtotal: 0 };
  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const normalizedItems: CartItem[] = rawItems.map((item: any) => ({
    ...item,
    id: item.itemId || item.id,
    itemId: item.itemId || item.id,
    price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0,
    subtotal: typeof item.subtotal === 'number' ? item.subtotal : parseFloat(String(item.subtotal)) || 0,
  }));
  return {
    ...raw,
    items: normalizedItems,
    subtotal: typeof raw.subtotal === 'number' ? raw.subtotal : parseFloat(String(raw.subtotal)) || 0,
    totalItemCount: typeof raw.totalItemCount === 'number' ? raw.totalItemCount : normalizedItems.reduce((acc, i) => acc + i.quantity, 0),
  };
};

export const cartService = {
  /**
   * Fetch current cart. Prioritizes real backend API data.
   * Only falls back to local demo cart if the backend API is unreachable.
   */
  async getCart(): Promise<Cart> {
    try {
      const response = await apiClient.get<Cart>('/api/cart');
      return normalizeCart(response.data || { items: [], totalItemCount: 0, subtotal: 0 });
    } catch {
      // Backend unavailable (offline / network failure) -> fallback to local demo cart
      return getLocalDemoCart();
    }
  },

  /**
   * Add item to cart. If product is a demo product or API fails, handles via demo cart.
   * Enforces single-shop constraint.
   */
  async addToCart(productId: string, quantity = 1): Promise<Cart> {
    const isDemoProduct = productId.startsWith('demo-');

    if (!isDemoProduct) {
      try {
        const response = await apiClient.post<Cart>('/api/cart/items', { productId, quantity });
        // Purge any stale local demo cart when interacting with real backend catalog
        localStorage.removeItem(DEMO_CART_STORAGE_KEY);
        return normalizeCart(response.data);
      } catch (err: any) {
        // If API fails with non-validation error, check demo fallback
        const demoProd = getDemoProductById(productId);
        if (!demoProd) {
          throw err;
        }
      }
    }

    // Demo Product Handling
    const demoProd = getDemoProductById(productId);
    if (!demoProd) {
      throw new Error('Product not found.');
    }

    const currentCart = getLocalDemoCart();
    const demoShop = getDemoShopById(demoProd.shopId);

    // Enforce single-shop constraint
    if (currentCart.items.length > 0 && currentCart.shopId && currentCart.shopId !== demoProd.shopId) {
      const error: any = new Error('Cart can contain products from only one shop.');
      error.response = {
        data: { message: 'Cart can contain products from only one shop.' },
        status: 400,
      };
      throw error;
    }

    const existingIndex = currentCart.items.findIndex((item) => item.productId === productId);
    let updatedItems: CartItem[] = [...currentCart.items];

    if (existingIndex >= 0) {
      const existing = updatedItems[existingIndex];
      const newQty = existing.quantity + quantity;
      updatedItems[existingIndex] = {
        ...existing,
        quantity: newQty,
        subtotal: existing.price * newQty,
      };
    } else {
      updatedItems.push({
        id: `demo-cart-item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        itemId: `demo-cart-item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productId: demoProd.id,
        productName: demoProd.name,
        price: demoProd.price,
        quantity,
        subtotal: demoProd.price * quantity,
        imageUrl: demoProd.imageUrl,
        shopId: demoProd.shopId,
        shopName: demoShop?.name || 'Partner Shop',
      });
    }

    const updatedCart: Cart = {
      cartId: currentCart.cartId || `demo-cart-${Date.now()}`,
      shopId: demoProd.shopId,
      shopName: demoShop?.name || currentCart.shopName || 'Partner Shop',
      items: updatedItems,
      totalItemCount: 0,
      subtotal: 0,
    };

    return saveLocalDemoCart(updatedCart);
  },

  /**
   * Update item quantity in cart.
   */
  async updateItemQuantity(itemId: string, quantity: number): Promise<Cart> {
    if (itemId.startsWith('demo-')) {
      const currentCart = getLocalDemoCart();
      const itemIndex = currentCart.items.findIndex(
        (i) => i.id === itemId || i.itemId === itemId
      );
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          currentCart.items.splice(itemIndex, 1);
        } else {
          const item = currentCart.items[itemIndex];
          currentCart.items[itemIndex] = {
            ...item,
            quantity,
            subtotal: item.price * quantity,
          };
        }
        if (currentCart.items.length === 0) {
          currentCart.shopId = undefined;
          currentCart.shopName = undefined;
        }
        return saveLocalDemoCart(currentCart);
      }
    }

    try {
      const response = await apiClient.put<Cart>(`/api/cart/items/${itemId}`, { quantity });
      return normalizeCart(response.data);
    } catch {
      // Fallback update in demo cart
      const currentCart = getLocalDemoCart();
      const itemIndex = currentCart.items.findIndex(
        (i) => i.id === itemId || i.itemId === itemId
      );
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          currentCart.items.splice(itemIndex, 1);
        } else {
          const item = currentCart.items[itemIndex];
          currentCart.items[itemIndex] = {
            ...item,
            quantity,
            subtotal: item.price * quantity,
          };
        }
        if (currentCart.items.length === 0) {
          currentCart.shopId = undefined;
          currentCart.shopName = undefined;
        }
        return saveLocalDemoCart(currentCart);
      }
      throw new Error('Item not found in cart.');
    }
  },

  /**
   * Remove item from cart.
   */
  async removeItem(itemId: string): Promise<Cart> {
    if (itemId.startsWith('demo-')) {
      const currentCart = getLocalDemoCart();
      const filtered = currentCart.items.filter(
        (i) => i.id !== itemId && i.itemId !== itemId
      );
      currentCart.items = filtered;
      if (filtered.length === 0) {
        currentCart.shopId = undefined;
        currentCart.shopName = undefined;
      }
      return saveLocalDemoCart(currentCart);
    }

    try {
      const response = await apiClient.delete<Cart>(`/api/cart/items/${itemId}`);
      return normalizeCart(response.data);
    } catch {
      const currentCart = getLocalDemoCart();
      const filtered = currentCart.items.filter(
        (i) => i.id !== itemId && i.itemId !== itemId
      );
      currentCart.items = filtered;
      if (filtered.length === 0) {
        currentCart.shopId = undefined;
        currentCart.shopName = undefined;
      }
      return saveLocalDemoCart(currentCart);
    }
  },

  /**
   * Clear cart completely.
   */
  async clearCart(): Promise<void> {
    try {
      await apiClient.delete('/api/cart');
    } catch {
      // Ignore API failure on clear
    } finally {
      localStorage.removeItem(DEMO_CART_STORAGE_KEY);
    }
  },
};
