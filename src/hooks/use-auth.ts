/**
 * Auth Hooks
 * TanStack Query hooks for authentication operations
 * Integrated with Zustand store for client state
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { useAuthStore } from '@/lib/stores/auth';
import type {
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ResendVerificationRequest,
} from '@/types';

/**
 * Get current authenticated user
 * Syncs with Zustand store on success
 */
export function useCurrentUser() {
  const setCustomer = useAuthStore((state) => state.setCustomer);
  const logout = useAuthStore((state) => state.logout);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: async () => {
      try {
        const data = await authApi.me();
        setCustomer(data);
        setInitialized(true);
        return data;
      } catch {
        logout();
        setInitialized(true);
        throw new Error('Not authenticated');
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Login mutation
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const setCustomer = useAuthStore((state) => state.setCustomer);
  const setLoading = useAuthStore((state) => state.setLoading);

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      setLoading(true);
      const data = await authApi.login(email, password);
      return data;
    },
    onSuccess: (data) => {
      // Update Zustand store
      setCustomer(data.customer);
      // Update the current user cache
      queryClient.setQueryData(queryKeys.auth.user, data.customer);
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    },
  });
}

/**
 * Register mutation
 */
export function useRegister() {
  const setLoading = useAuthStore((state) => state.setLoading);

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      setLoading(true);
      const result = await authApi.register(data);
      return result;
    },
    onSettled: () => {
      setLoading(false);
    },
  });
}

/**
 * Logout mutation
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const logoutStore = useAuthStore((state) => state.logout);
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear Zustand store
      logoutStore();
      // Clear the current user cache
      queryClient.setQueryData(queryKeys.auth.user, null);
      // Invalidate all queries
      queryClient.invalidateQueries();
      // Redirect to home
      router.push('/');
    },
  });
}

/**
 * Forgot password mutation
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
  });
}

/**
 * Reset password mutation
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
  });
}

/**
 * Resend verification email mutation
 */
export function useResendVerification() {
  return useMutation({
    mutationFn: (data: ResendVerificationRequest) => authApi.resendVerification(data),
  });
}

/**
 * Refresh token mutation
 */
export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.refresh(''), // Token is in httpOnly cookie
    onSuccess: () => {
      // Refetch the current user after refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
    },
  });
}

/**
 * Check if user is authenticated
 */
export function useIsAuthenticated() {
  return useAuthStore((state) => state.isAuthenticated);
}

/**
 * Get current customer from store
 */
export function useCustomer() {
  return useAuthStore((state) => state.customer);
}
