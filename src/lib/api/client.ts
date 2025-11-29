/**
 * API Client
 * Axios instance configured for AZTEAM ERP API
 */

import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { clientEnv } from '@/lib/env';

const API_BASE_URL = clientEnv.NEXT_PUBLIC_API_URL;

/**
 * Create axios instance with base configuration
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send httpOnly cookies
  timeout: 30000, // 30 second timeout
});

/**
 * Request interceptor
 * - Adds auth headers if needed (handled by httpOnly cookies)
 * - Can be extended for request logging
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Auth is handled via httpOnly cookies
    // Additional headers can be added here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * - Handles 401 errors for token refresh
 * - Logs errors in development
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        // This will be handled by the auth API route which manages httpOnly cookies
        const refreshResponse = await axios.post(
          '/api/auth/refresh',
          {},
          { withCredentials: true }
        );

        if (refreshResponse.data.success) {
          // Retry the original request
          return apiClient(originalRequest);
        }
      } catch {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          // Only redirect on client-side
          window.location.href = '/login';
        }
      }
    }

    // Log errors in development (except 401 which is expected for unauthenticated requests)
    if (process.env.NODE_ENV === 'development' && error.response?.status !== 401) {
      console.error('[API Error]', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    return Promise.reject(error);
  }
);

/**
 * Type-safe API request helpers
 */
export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<T>(url, { params });
  return response.data;
}

export async function post<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.post<T>(url, data);
  return response.data;
}

export async function put<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.put<T>(url, data);
  return response.data;
}

export async function del<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.delete<T>(url, { data });
  return response.data;
}
