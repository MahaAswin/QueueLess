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
    return Array.isArray(response.data) ? response.data.map(normalizeShop) : [];
  },

  async createShop(payload: CreateShopPayload): Promise<Shop> {
    const body = {
      ...payload,
      shopName: payload.shopName || payload.name,
    };
    const response = await apiClient.post<Shop>('/api/shops', body);
    return normalizeShop(response.data);
  },

  async updateShop(id: string, payload: UpdateShopPayload): Promise<Shop> {
    const body = {
      ...payload,
      shopName: payload.shopName || payload.name,
    };
    const response = await apiClient.put<Shop>(`/api/shops/${id}`, body);
    return normalizeShop(response.data);
  },

  async getNearbyShops(
    latitude: number,
    longitude: number,
    radiusMeters: number = 500,
    category?: ShopCategory
  ): Promise<{ shops: (Shop & { distanceMeters: number; distanceFormatted?: string; isOpen?: boolean; averageWaitMinutes?: number })[]; radiusMeters: number; count: number }> {
    const params: Record<string, any> = {
      latitude,
      longitude,
      radius: radiusMeters,
    };
    if (category && category !== ('ALL' as any)) {
      params.category = category;
    }
    const response = await apiClient.get<any>('/api/shops/nearby', { params });
    const rawData = response.data;
    const shops = Array.isArray(rawData?.shops)
      ? rawData.shops.map((s: any) => ({
          ...normalizeShop(s),
          distanceMeters: s.distanceMeters,
          distanceFormatted: s.distanceFormatted,
          isOpen: s.isOpen,
          averageWaitMinutes: s.averageWaitMinutes,
        }))
      : [];
    return {
      shops,
      radiusMeters: rawData?.radiusMeters || radiusMeters,
      count: rawData?.count || shops.length,
    };
  },

  async uploadShopImage(shopId: string, file: File): Promise<Shop> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('image', file);
    const response = await apiClient.post<Shop>(`/api/shops/${shopId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return normalizeShop(response.data);
  },

  async removeShopImage(shopId: string): Promise<Shop> {
    const response = await apiClient.delete<Shop>(`/api/shops/${shopId}/image`);
    return normalizeShop(response.data);
  },
};
