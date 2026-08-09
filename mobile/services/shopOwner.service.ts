import { api } from './api';
import {
  CreateProductRequest,
  OrderPageResponse,
  OrderResponse,
  OrderStatus,
  PickupVerificationResponse,
  ProductResponse,
  ShopResponse,
  UpdateShopRequest,
} from '../types';

export const ShopOwnerService = {
  /**
   * Fetch authenticated shop owner's shops.
   * Endpoint: GET /api/shops/my
   */
  async getMyShops(): Promise<ShopResponse[]> {
    const response = await api.get<ShopResponse[]>('/api/shops/my');
    return response.data;
  },

  /**
   * Update shop details.
   * Endpoint: PUT /api/shops/{id}
   */
  async updateShop(
    shopId: string,
    request: UpdateShopRequest
  ): Promise<ShopResponse> {
    const response = await api.put<ShopResponse>(
      `/api/shops/${shopId}`,
      request
    );
    return response.data;
  },

  /**
   * Fetch shop orders (with optional status filter and pagination).
   * Endpoint: GET /api/shop/orders?status={status}&page={page}&size={size}
   */
  async getShopOrders(
    status?: OrderStatus,
    page: number = 0,
    size: number = 20
  ): Promise<OrderPageResponse> {
    const response = await api.get<OrderPageResponse>('/api/shop/orders', {
      params: { status, page, size },
    });
    return response.data;
  },

  /**
   * Fetch shop order details by order ID.
   * Endpoint: GET /api/shop/orders/{orderId}
   */
  async getShopOrderById(orderId: string): Promise<OrderResponse> {
    const response = await api.get<OrderResponse>(
      `/api/shop/orders/${orderId}`
    );
    return response.data;
  },

  /**
   * Confirm an incoming order (PENDING -> CONFIRMED).
   * Endpoint: PATCH /api/shop/orders/{orderId}/confirm
   */
  async confirmOrder(orderId: string): Promise<OrderResponse> {
    const response = await api.patch<OrderResponse>(
      `/api/shop/orders/${orderId}/confirm`
    );
    return response.data;
  },

  /**
   * Reject an incoming order (PENDING -> CANCELLED).
   * Endpoint: PATCH /api/shop/orders/{orderId}/reject
   */
  async rejectOrder(orderId: string): Promise<OrderResponse> {
    const response = await api.patch<OrderResponse>(
      `/api/shop/orders/${orderId}/reject`
    );
    return response.data;
  },

  /**
   * Start preparing order (CONFIRMED -> PREPARING).
   * Endpoint: PATCH /api/shop/orders/{orderId}/preparing
   */
  async startPreparing(orderId: string): Promise<OrderResponse> {
    const response = await api.patch<OrderResponse>(
      `/api/shop/orders/${orderId}/preparing`
    );
    return response.data;
  },

  /**
   * Mark order ready for pickup (PREPARING -> READY_FOR_PICKUP).
   * Endpoint: PATCH /api/shop/orders/{orderId}/ready
   */
  async markOrderReadyForPickup(orderId: string): Promise<OrderResponse> {
    const response = await api.patch<OrderResponse>(
      `/api/shop/orders/${orderId}/ready`
    );
    return response.data;
  },

  /**
   * Verify customer pickup QR pass token.
   * Endpoint: POST /api/shop/pickup/verify
   */
  async verifyPickup(pickupToken: string): Promise<PickupVerificationResponse> {
    const response = await api.post<PickupVerificationResponse>(
      '/api/shop/pickup/verify',
      { pickupToken }
    );
    return response.data;
  },

  /**
   * Fetch products for shop.
   * Endpoint: GET /api/shops/{shopId}/products
   */
  async getShopProducts(shopId: string): Promise<ProductResponse[]> {
    const response = await api.get<ProductResponse[]>(
      `/api/shops/${shopId}/products`
    );
    return response.data;
  },

  /**
   * Create a new product for shop.
   * Endpoint: POST /api/shops/{shopId}/products
   */
  async createProduct(
    shopId: string,
    request: CreateProductRequest
  ): Promise<ProductResponse> {
    const response = await api.post<ProductResponse>(
      `/api/shops/${shopId}/products`,
      request
    );
    return response.data;
  },

  /**
   * Toggle product availability.
   * Endpoint: PATCH /api/products/{productId}/availability
   */
  async updateProductAvailability(
    productId: string,
    available: boolean
  ): Promise<ProductResponse> {
    const response = await api.patch<ProductResponse>(
      `/api/products/${productId}/availability`,
      { available }
    );
    return response.data;
  },

  /**
   * Update product stock quantity.
   * Endpoint: PATCH /api/products/{productId}/stock
   */
  async updateProductStock(
    productId: string,
    stockQuantity: number
  ): Promise<ProductResponse> {
    const response = await api.patch<ProductResponse>(
      `/api/products/${productId}/stock`,
      { stockQuantity }
    );
    return response.data;
  },
};
