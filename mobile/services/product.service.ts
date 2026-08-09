import { api } from './api';
import { ProductResponse, BackendProductCategory } from '../types';

export const ProductService = {
  /**
   * Fetch products for a specific shop.
   * Endpoint: GET /api/shops/{shopId}/products
   */
  async getProductsByShop(shopId: string): Promise<ProductResponse[]> {
    const response = await api.get<ProductResponse[]>(`/api/shops/${shopId}/products`);
    return response.data;
  },

  /**
   * Fetch a single product by ID.
   * Endpoint: GET /api/products/{productId}
   */
  async getProductById(productId: string): Promise<ProductResponse> {
    const response = await api.get<ProductResponse>(`/api/products/${productId}`);
    return response.data;
  },

  /**
   * Search products by name/query.
   * Endpoint: GET /api/products/search?name={query}
   */
  async searchProducts(query: string): Promise<ProductResponse[]> {
    const response = await api.get<ProductResponse[]>('/api/products/search', {
      params: { name: query.trim() },
    });
    return response.data;
  },

  /**
   * Filter products by category.
   * Endpoint: GET /api/products/category/{category}
   */
  async getProductsByCategory(category: BackendProductCategory): Promise<ProductResponse[]> {
    const response = await api.get<ProductResponse[]>(`/api/products/category/${category}`);
    return response.data;
  },
};
