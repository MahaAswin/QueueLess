import { api } from './api';
import { ShopResponse, BackendShopCategory } from '../types';

export const ShopService = {
  /**
   * Fetch all active shops available to customers.
   * Endpoint: GET /api/shops
   */
  async getActiveShops(): Promise<ShopResponse[]> {
    const response = await api.get<ShopResponse[]>('/api/shops');
    return response.data;
  },

  /**
   * Fetch details of a specific shop by ID.
   * Endpoint: GET /api/shops/{id}
   */
  async getShopById(id: string): Promise<ShopResponse> {
    const response = await api.get<ShopResponse>(`/api/shops/${id}`);
    return response.data;
  },

  /**
   * Search shops by name.
   * Endpoint: GET /api/shops/search?name={name}
   */
  async searchShops(name: string): Promise<ShopResponse[]> {
    if (!name.trim()) {
      return this.getActiveShops();
    }
    const response = await api.get<ShopResponse[]>('/api/shops/search', {
      params: { name: name.trim() },
    });
    return response.data;
  },

  /**
   * Filter shops by category.
   * Endpoint: GET /api/shops/category/{category}
   */
  async getShopsByCategory(category: BackendShopCategory): Promise<ShopResponse[]> {
    const response = await api.get<ShopResponse[]>(`/api/shops/category/${category}`);
    return response.data;
  },
};
