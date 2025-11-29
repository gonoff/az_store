/**
 * Auth API Service
 * API functions for authentication operations
 * Uses local Next.js API routes (not external ERP API)
 */

import { handleApiError } from './errors';
import type {
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ResendVerificationRequest,
  CurrentUserResponse,
  ApiResponse,
} from '@/types';

/**
 * Helper for local API calls (uses relative URLs to Next.js API routes)
 */
async function localPost<T>(url: string, data?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
  });
  const json = await response.json();
  if (!response.ok) {
    const error = new Error(json.error || 'Request failed');
    (error as Error & { response?: { status: number; data: unknown } }).response = {
      status: response.status,
      data: json,
    };
    throw error;
  }
  return json;
}

async function localGet<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  const json = await response.json();
  if (!response.ok) {
    const error = new Error(json.error || 'Request failed');
    (error as Error & { response?: { status: number; data: unknown } }).response = {
      status: response.status,
      data: json,
    };
    throw error;
  }
  return json;
}

/**
 * Auth API service
 */
export const authApi = {
  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<LoginResponse['data']> => {
    try {
      const response = await localPost<{
        success: true;
        data: { customer: LoginResponse['data']['customer'] };
      }>('/api/auth/login', {
        email,
        password,
      });
      return { ...response.data, customer: response.data.customer } as LoginResponse['data'];
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Register a new customer account
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse['data']> => {
    try {
      const response = await localPost<RegisterResponse>('/api/auth/register', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Refresh access token using refresh token
   */
  refresh: async (_refreshToken: string): Promise<RefreshTokenResponse['data']> => {
    try {
      // Token is in httpOnly cookie, no need to send it
      const response = await localPost<RefreshTokenResponse>('/api/auth/refresh', {});
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Logout (client-side token cleanup)
   */
  logout: async (): Promise<void> => {
    try {
      await localPost<ApiResponse>('/api/auth/logout');
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Request password reset email
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    try {
      await localPost<ApiResponse>('/api/auth/forgot-password', data);
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    try {
      await localPost<ApiResponse>('/api/auth/reset-password', data);
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Resend email verification
   */
  resendVerification: async (data: ResendVerificationRequest): Promise<void> => {
    try {
      await localPost<ApiResponse>('/api/auth/resend-verification', data);
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get current authenticated user
   */
  me: async (): Promise<CurrentUserResponse['data']> => {
    try {
      const response = await localGet<CurrentUserResponse>('/api/auth/me');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};
