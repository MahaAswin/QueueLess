import { apiClient } from '../api/axiosClient';
import type { Cart } from '../types/cart.types';

export const cartService = {
  async getCart(): Promise<Cart> {
    const response = await apiClient.get<Cart>('/api/cart');
    return response.data;
  },

  async addToCart(productId: string, quantity = 1): Promise<Cart> {
    const response = await apiClient.post<Cart>('/api/cart/items', { productId, quantity });
    return response.data;
  },

  async updateItemQuantity(itemId: string, quantity: number): Promise<Cart> {
    const response = await apiClient.put<Cart>(`/api/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  async removeItem(itemId: string): Promise<Cart> {
    const response = await apiClient.delete<Cart>(`/api/cart/items/${itemId}`);
    return response.data;
  },

  async clearCart(): Promise<void> {
    await apiClient.delete('/api/cart');
  },
};
