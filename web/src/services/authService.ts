import { apiClient } from '../api/axiosClient';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth.types';
import { tokenStorage } from '../utils/storage';

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', payload);
    const data = response.data;
    if (data.accessToken) {
      tokenStorage.setTokens(data.accessToken, data.refreshToken);
      if (data.user) {
        tokenStorage.setUser(data.user);
      }
    }
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', payload);
    const data = response.data;
    if (data.accessToken) {
      tokenStorage.setTokens(data.accessToken, data.refreshToken);
      if (data.user) {
        tokenStorage.setUser(data.user);
      }
    }
    return data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/api/auth/me');
    if (response.data) {
      tokenStorage.setUser(response.data);
    }
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      await apiClient.post('/api/auth/logout', { refreshToken });
    } catch {
      // Soft fail on network issues during logout
    } finally {
      tokenStorage.clearAuth();
    }
  },
};
