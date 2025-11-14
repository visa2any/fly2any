/**
 * API Client Configuration for Web and Mobile
 *
 * Architecture:
 * - Web (Vercel): Uses relative URLs (/api/*) for same-origin API calls
 * - Mobile (iOS/Android): Uses absolute URLs (https://fly2any-fresh.vercel.app/api/*)
 *
 * This ensures mobile apps call the production API while web apps use local routes
 */

import { Capacitor } from '@capacitor/core';

/**
 * Detect if running in native mobile app
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get the platform name
 */
export function getPlatform(): 'web' | 'ios' | 'android' {
  const platform = Capacitor.getPlatform();
  if (platform === 'ios') return 'ios';
  if (platform === 'android') return 'android';
  return 'web';
}

/**
 * Get the API base URL based on platform
 */
export function getApiBaseUrl(): string {
  if (isNativePlatform()) {
    // Mobile apps call the production web API
    return process.env.NEXT_PUBLIC_API_URL || 'https://fly2any-fresh.vercel.app';
  }

  // Web app uses relative URLs for same-origin requests
  return '';
}

/**
 * Build full API URL for a given endpoint
 * @param endpoint - API endpoint path (e.g., '/api/flights/search')
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();

  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  return `${baseUrl}${normalizedEndpoint}`;
}

/**
 * Enhanced fetch wrapper for mobile/web compatibility
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(endpoint);

  // Add default headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Add platform identifier for analytics/debugging
  if (isNativePlatform()) {
    headers['X-Platform'] = getPlatform();
    headers['X-App-Version'] = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      // Ensure credentials are included for web, but not for mobile (CORS)
      credentials: isNativePlatform() ? 'omit' : (options.credentials || 'same-origin'),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Fetch Error [${getPlatform()}]:`, error);
    throw error;
  }
}

/**
 * API client with common methods
 */
export const apiClient = {
  /**
   * GET request
   */
  get: async <T = any>(endpoint: string, options?: RequestInit): Promise<T> => {
    return apiFetch<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  },

  /**
   * POST request
   */
  post: async <T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> => {
    return apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PUT request
   */
  put: async <T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> => {
    return apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PATCH request
   */
  patch: async <T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> => {
    return apiFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * DELETE request
   */
  delete: async <T = any>(endpoint: string, options?: RequestInit): Promise<T> => {
    return apiFetch<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  },
};

/**
 * Environment information for debugging
 */
export function getEnvironmentInfo() {
  return {
    platform: getPlatform(),
    isNative: isNativePlatform(),
    apiBaseUrl: getApiBaseUrl(),
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    nodeEnv: process.env.NODE_ENV,
  };
}
