/**
 * Customer Hooks
 * TanStack Query hooks for customer profile and settings
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  UpdateConsentRequest,
  DeleteAccountRequest,
} from '@/types';

/**
 * Fetch customer profile
 */
export function useProfile() {
  return useQuery({
    queryKey: queryKeys.customer.profile,
    queryFn: customerApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Update customer profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => customerApi.updateProfile(data),
    onSuccess: () => {
      // Invalidate profile cache to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.profile });
    },
  });
}

/**
 * Change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => customerApi.changePassword(data),
  });
}

/**
 * Fetch consent settings
 */
export function useConsent() {
  return useQuery({
    queryKey: queryKeys.customer.consent,
    queryFn: customerApi.getConsent,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Update consent settings
 */
export function useUpdateConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateConsentRequest) => customerApi.updateConsent(data),
    onSuccess: () => {
      // Invalidate consent cache to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.consent });
      // Also invalidate profile as it includes consent
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.profile });
    },
  });
}

/**
 * Delete customer account
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteAccountRequest) => customerApi.deleteAccount(data),
    onSuccess: () => {
      // Clear all customer data from cache
      queryClient.setQueryData(queryKeys.customer.profile, null);
      queryClient.setQueryData(queryKeys.auth.user, null);
      queryClient.invalidateQueries();
    },
  });
}
