import axios from 'axios';
import { AuthService } from './auth';

/**
 * QueueLess API Client
 *
 * NOTE: The backend base URL is dynamically retrieved from EXPO_PUBLIC_API_URL.
 * For local physical device testing with Expo Go, configure your local IP in your .env file:
 * EXPO_PUBLIC_API_URL=http://192.168.x.x:8080
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || '';

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
  async (config) => {
    const token = await AuthService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry / unauthenticated states
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AuthService.logout();
    }
    return Promise.reject(error);
  }
);
