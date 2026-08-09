import { api } from './api';
import { CartResponse } from '../types';

export const CartService = {
  /**
   * Fetch current user's active cart.
   * Endpoint: GET /api/cart
   */
  async getCart(): Promise<CartResponse> {
    const response = await api.get<CartResponse>('/api/cart');
    return response.data;
  },

  /**
   * Add a product to the cart.
   * Endpoint: POST /api/cart/items
   */
  async addToCart(productId: string, quantity: number = 1): Promise<CartResponse> {
    const response = await api.post<CartResponse>('/api/cart/items', {
      productId,
      quantity,
    });
    return response.data;
  },

  /**
   * Update quantity of a cart item.
   * Endpoint: PUT /api/cart/items/{itemId}
   */
  async updateCartItemQuantity(itemId: string, quantity: number): Promise<CartResponse> {
    const response = await api.put<CartResponse>(`/api/cart/items/${itemId}`, {
      quantity,
    });
    return response.data;
  },

  /**
   * Remove a single item from the cart.
   * Endpoint: DELETE /api/cart/items/{itemId}
   */
  async removeCartItem(itemId: string): Promise<CartResponse> {
    const response = await api.delete<CartResponse>(`/api/cart/items/${itemId}`);
    return response.data;
  },

  /**
   * Clear all items in current user's cart.
   * Endpoint: DELETE /api/cart
   */
  async clearCart(): Promise<CartResponse> {
    const response = await api.delete<CartResponse>('/api/cart');
    return response.data;
  },
};
