import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import axios from 'axios';
import { User } from '../types';

const ACCESS_TOKEN_KEY = 'queueless_access_token';
const REFRESH_TOKEN_KEY = 'queueless_refresh_token';
const USER_KEY = 'queueless_user_data';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

// Web fallback in-memory storage for web browser compatibility
const memoryStorage: Record<string, string> = {};
const isSecureStoreAvailable = Platform.OS !== 'web';

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: 'CUSTOMER' | 'SHOP_OWNER' | 'ADMIN';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface BackendUserResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'SHOP_OWNER' | 'ADMIN';
  accountStatus?: string;
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  user: BackendUserResponse;
}

export const authStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (isSecureStoreAvailable) {
        return await SecureStore.getItemAsync(key);
      }
      return memoryStorage[key] || (typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null);
    } catch (error) {
      console.warn(`[AuthStorage] Failed to get item for key ${key}:`, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (isSecureStoreAvailable) {
        await SecureStore.setItemAsync(key, value);
      } else {
        memoryStorage[key] = value;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        }
      }
    } catch (error) {
      console.warn(`[AuthStorage] Failed to set item for key ${key}:`, error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (isSecureStoreAvailable) {
        await SecureStore.deleteItemAsync(key);
      } else {
        delete memoryStorage[key];
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn(`[AuthStorage] Failed to remove item for key ${key}:`, error);
    }
  },
};

export const AuthService = {
  async getAccessToken(): Promise<string | null> {
    return await authStorage.getItem(ACCESS_TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    return await authStorage.getItem(REFRESH_TOKEN_KEY);
  },

  async setTokens(accessToken: string, refreshToken?: string): Promise<void> {
    await authStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      await authStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  async saveUser(user: User): Promise<void> {
    await authStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async getUser(): Promise<User | null> {
    const data = await authStorage.getItem(USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data) as User;
    } catch {
      return null;
    }
  },

  async clearSession(): Promise<void> {
    await authStorage.removeItem(ACCESS_TOKEN_KEY);
    await authStorage.removeItem(REFRESH_TOKEN_KEY);
    await authStorage.removeItem(USER_KEY);
  },

  async register(payload: RegisterPayload): Promise<AuthResponseData> {
    const response = await axios.post<AuthResponseData>(
      `${BASE_URL}/api/auth/register`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
    const data = response.data;
    if (data.accessToken) {
      await this.setTokens(data.accessToken, data.refreshToken);
      const user: User = {
        id: data.user.id,
        name: data.user.fullName,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role,
      };
      await this.saveUser(user);
    }
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthResponseData> {
    const response = await axios.post<AuthResponseData>(
      `${BASE_URL}/api/auth/login`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
    const data = response.data;
    if (data.accessToken) {
      await this.setTokens(data.accessToken, data.refreshToken);
      const user: User = {
        id: data.user.id,
        name: data.user.fullName,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role,
      };
      await this.saveUser(user);
    }
    return data;
  },

  async getCurrentUser(): Promise<User | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const response = await axios.get<BackendUserResponse>(
        `${BASE_URL}/api/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const backendUser = response.data;
      const user: User = {
        id: backendUser.id,
        name: backendUser.fullName,
        email: backendUser.email,
        phone: backendUser.phone,
        role: backendUser.role,
      };
      await this.saveUser(user);
      return user;
    } catch {
      return await this.getUser();
    }
  },

  async logout(): Promise<void> {
    try {
      const token = await this.getAccessToken();
      const refreshToken = await this.getRefreshToken();
      if (token) {
        await axios.post(
          `${BASE_URL}/api/auth/logout`,
          { refreshToken },
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(() => {});
      }
    } finally {
      await this.clearSession();
    }
  },
};
