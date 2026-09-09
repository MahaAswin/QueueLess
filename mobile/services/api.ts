import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthService } from './auth';

/**
 * QueueLess API Client
 *
 * NOTE: The backend base URL is dynamically retrieved from EXPO_PUBLIC_API_URL.
 * For local physical device testing with Expo Go, configure your local IP in your .env file:
 * EXPO_PUBLIC_API_URL=http://192.168.x.x:8080
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor to attach JWT auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AuthService.getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Concurrency queue to handle simultaneous 401s
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle token expiry / unauthenticated states with safe refresh logic
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // If there is no response or error is not 401, reject immediately
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || '';

    // Auth endpoints should not trigger refresh loops
    const isAuthEndpoint =
      requestUrl.includes('/api/auth/login') ||
      requestUrl.includes('/api/auth/register') ||
      requestUrl.includes('/api/auth/refresh') ||
      requestUrl.includes('/api/auth/logout');

    if (isAuthEndpoint || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If no refresh token exists, user is unauthenticated / guest; reject cleanly without attempting refresh
    const refreshToken = await AuthService.getRefreshToken();
    if (!refreshToken) {
      return Promise.reject(error);
    }

    // If refresh is already in progress, enqueue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newAccessToken = await AuthService.refreshAccessToken();

      if (!newAccessToken) {
        const sessionExpiredError = new Error('Session expired. Please log in again.');
        processQueue(sessionExpiredError, null);
        await AuthService.clearSession();
        return Promise.reject(sessionExpiredError);
      }

      processQueue(null, newAccessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await AuthService.clearSession();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
