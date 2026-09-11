import { apiClient } from '../api/axiosClient';
import type { Shop, CreateShopPayload, UpdateShopPayload, ShopCategory } from '../types/shop.types';

const normalizeShop = (raw: any): Shop => {
  if (!raw) return raw;
  const name = raw.shopName || raw.name || 'Partner Outlet';
  return {
    ...raw,
    name,
    shopName: raw.shopName || name,
  };
};

export const shopService = {
  async getActiveShops(): Promise<Shop[]> {
    const response = await apiClient.get<Shop[]>('/api/shops');
    return Array.isArray(response.data) ? response.data.map(normalizeShop) : [];
  },

  async getShopById(id: string): Promise<Shop> {
    const response = await apiClient.get<Shop>(`/api/shops/${id}`);
    return normalizeShop(response.data);
  },

  async searchShops(query: string): Promise<Shop[]> {
    const response = await apiClient.get<Shop[]>('/api/shops/search', {
      params: { name: query },
    });
    return Array.isArray(response.data) ? response.data.map(normalizeShop) : [];
  },

  async getShopsByCategory(category: ShopCategory): Promise<Shop[]> {
    const response = await apiClient.get<Shop[]>(`/api/shops/category/${category}`);
    return Array.isArray(response.data) ? response.data.map(normalizeShop) : [];
  },

  // Shop Owner Endpoints
  async getMyShops(): Promise<Shop[]> {
    const response = await apiClient.get<Shop[]>('/api/shops/my');
    return response.data;
  },

  async createShop(payload: CreateShopPayload): Promise<Shop> {
    const response = await apiClient.post<Shop>('/api/shops', payload);
    return response.data;
  },

  async updateShop(id: string, payload: UpdateShopPayload): Promise<Shop> {
    const response = await apiClient.put<Shop>(`/api/shops/${id}`, payload);
    return response.data;
  },
};
