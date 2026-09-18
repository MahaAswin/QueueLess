import { apiClient } from '../api/axiosClient';
import type { Cart, CartItem } from '../types/cart.types';

const normalizeCart = (raw: any): Cart => {
  if (!raw) return { items: [], totalItemCount: 0, subtotal: 0 };
  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const normalizedItems: CartItem[] = rawItems.map((item: any) => ({
    ...item,
    id: item.itemId || item.id,
    itemId: item.itemId || item.id,
    price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0,
    subtotal: typeof item.subtotal === 'number' ? item.subtotal : parseFloat(String(item.subtotal)) || 0,
    quantity: typeof item.quantity === 'number' ? item.quantity : parseInt(String(item.quantity), 10) || 1,
  }));

  const calculatedSubtotal = normalizedItems.reduce((sum, i) => sum + i.subtotal, 0);
  const calculatedCount = normalizedItems.reduce((sum, i) => sum + i.quantity, 0);

  return {
    ...raw,
    cartId: raw.cartId || raw.id,
    shopId: raw.shopId,
    shopName: raw.shopName,
    items: normalizedItems,
    subtotal: typeof raw.subtotal === 'number' ? raw.subtotal : calculatedSubtotal,
    totalItemCount: typeof raw.totalItemCount === 'number' ? raw.totalItemCount : calculatedCount,
  };
};

export const cartService = {
  /**
   * Fetch current cart for authenticated customer.
   * Endpoint: GET /api/cart
   */
  async getCart(): Promise<Cart> {
    const response = await apiClient.get<Cart>('/api/cart');
    return normalizeCart(response.data || { items: [], totalItemCount: 0, subtotal: 0 });
  },

  /**
   * Add item to cart with quantity.
   * Endpoint: POST /api/cart/items
   */
  async addToCart(productId: string, quantity = 1): Promise<Cart> {
    const response = await apiClient.post<Cart>('/api/cart/items', { productId, quantity });
    return normalizeCart(response.data);
  },

  /**
   * Update item quantity in cart.
   * Endpoint: PUT /api/cart/items/{itemId}
   */
  async updateItemQuantity(itemId: string, quantity: number): Promise<Cart> {
    const response = await apiClient.put<Cart>(`/api/cart/items/${itemId}`, { quantity });
    return normalizeCart(response.data);
  },

  /**
   * Remove item from cart.
   * Endpoint: DELETE /api/cart/items/{itemId}
   */
  async removeItem(itemId: string): Promise<Cart> {
    const response = await apiClient.delete<Cart>(`/api/cart/items/${itemId}`);
    return normalizeCart(response.data);
  },

  /**
   * Clear all items in cart.
   * Endpoint: DELETE /api/cart
   */
  async clearCart(): Promise<Cart> {
    const response = await apiClient.delete<Cart>('/api/cart');
    return normalizeCart(response.data || { items: [], totalItemCount: 0, subtotal: 0 });
  },
};

