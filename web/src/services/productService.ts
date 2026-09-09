import { apiClient } from '../api/axiosClient';
import type { Product, CreateProductPayload, UpdateProductPayload, ProductCategory } from '../types/product.types';

export const productService = {
  async getProductsByShop(shopId: string): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(`/api/shops/${shopId}/products`);
    return response.data;
  },

  async getProductById(productId: string): Promise<Product> {
    const response = await apiClient.get<Product>(`/api/products/${productId}`);
    return response.data;
  },

  async searchProducts(query: string): Promise<Product[]> {
    const response = await apiClient.get<Product[]>('/api/products/search', {
      params: { query },
    });
    return response.data;
  },

  async getProductsByCategory(category: ProductCategory): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(`/api/products/category/${category}`);
    return response.data;
  },

  // Shop Owner Endpoints
  async createProduct(shopId: string, payload: CreateProductPayload): Promise<Product> {
    const response = await apiClient.post<Product>(`/api/shops/${shopId}/products`, payload);
    return response.data;
  },

  async updateProduct(productId: string, payload: UpdateProductPayload): Promise<Product> {
    const response = await apiClient.put<Product>(`/api/products/${productId}`, payload);
    return response.data;
  },

  async deleteProduct(productId: string): Promise<void> {
    await apiClient.delete(`/api/products/${productId}`);
  },

  async updateAvailability(productId: string, available: boolean): Promise<Product> {
    const response = await apiClient.patch<Product>(`/api/products/${productId}/availability`, { available });
    return response.data;
  },

  async updateStock(productId: string, stockQuantity: number): Promise<Product> {
    const response = await apiClient.patch<Product>(`/api/products/${productId}/stock`, { stockQuantity });
    return response.data;
  },
};
