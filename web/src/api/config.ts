import { Capacitor } from '@capacitor/core';

export const PRODUCTION_API_URL = 'https://queueless-backend-haov.onrender.com';

/**
 * Resolves the appropriate base API URL depending on execution environment:
 * - Native Capacitor (Android / iOS): Always targets the production backend, NEVER localhost.
 * - Browser (Vercel / Production Web): Uses VITE_API_URL, falling back to PRODUCTION_API_URL.
 * - Local Dev Server: Uses VITE_API_URL or Vite proxy.
 */
export const getApiBaseUrl = (): string => {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();
  const sanitizedEnv = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;

  // 1. Native Capacitor environment (Android / iOS)
  if (Capacitor.isNativePlatform()) {
    // If an explicit remote HTTPS endpoint is provided (e.g. custom staging), use it
    if (
      sanitizedEnv &&
      sanitizedEnv.startsWith('http') &&
      !sanitizedEnv.includes('localhost') &&
      !sanitizedEnv.includes('127.0.0.1')
    ) {
      return sanitizedEnv;
    }
    // Safeguard: native apps must NEVER call localhost
    return PRODUCTION_API_URL;
  }

  // 2. Browser environment with configured VITE_API_URL
  if (sanitizedEnv) {
    return sanitizedEnv;
  }

  // 3. Fallback for production web build without explicit env var
  if (import.meta.env.PROD) {
    return PRODUCTION_API_URL;
  }

  // 4. Default for local Vite development (relies on Vite /api proxy)
  return '';
};

/**
 * Resolves absolute URLs for media assets and backend-served uploads
 * (e.g., shop logos, product photos, evidence files).
 */
export const resolveMediaUrl = (path?: string | null): string => {
  if (!path || typeof path !== 'string') return '';
  const trimmed = path.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const baseUrl = getApiBaseUrl();
  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${baseUrl}${normalizedPath}`;
};
