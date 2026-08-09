import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'queueless_access_token';
const REFRESH_TOKEN_KEY = 'queueless_refresh_token';
const USER_KEY = 'queueless_user_data';

// Web fallback in-memory storage for web browser compatibility
const memoryStorage: Record<string, string> = {};

const isSecureStoreAvailable = Platform.OS !== 'web';

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

  async clearTokens(): Promise<void> {
    await authStorage.removeItem(ACCESS_TOKEN_KEY);
    await authStorage.removeItem(REFRESH_TOKEN_KEY);
    await authStorage.removeItem(USER_KEY);
  },

  async logout(): Promise<void> {
    await this.clearTokens();
  },
};
