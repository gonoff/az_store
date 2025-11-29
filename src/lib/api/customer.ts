/**
 * Customer API Service
 * API functions for customer profile and settings
 */

import { get, put, del } from './client';
import { handleApiError } from './errors';
import type {
  CustomerProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ConsentSettings,
  UpdateConsentRequest,
  DeleteAccountRequest,
  ApiResponse,
} from '@/types';

/**
 * Customer API service
 */
export const customerApi = {
  /**
   * Get customer profile
   */
  getProfile: async (): Promise<CustomerProfile> => {
    try {
      const response = await get<{ success: true; data: CustomerProfile }>(
        '/api/v1/customer/profile'
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Update customer profile
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<void> => {
    try {
      await put<ApiResponse>('/api/v1/customer/profile', data);
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    try {
      await put<ApiResponse>('/api/v1/customer/password', data);
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get consent settings
   */
  getConsent: async (): Promise<ConsentSettings> => {
    try {
      const response = await get<{ success: true; data: ConsentSettings }>(
        '/api/v1/customer/consent'
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Update consent settings
   */
  updateConsent: async (data: UpdateConsentRequest): Promise<void> => {
    try {
      await put<ApiResponse>('/api/v1/customer/consent', data);
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Delete account (GDPR compliance)
   */
  deleteAccount: async (data: DeleteAccountRequest): Promise<void> => {
    try {
      await del<ApiResponse>('/api/v1/customer/account', data);
    } catch (error) {
      handleApiError(error);
    }
  },
};
