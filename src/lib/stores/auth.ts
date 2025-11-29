/**
 * Auth Store
 * Zustand store for client-side authentication state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CustomerInfo } from '@/types';

/**
 * Extended customer info with additional fields from /me endpoint
 */
export interface AuthCustomer extends CustomerInfo {
  phone_number?: string;
  created_at?: string;
}

/**
 * Auth store state
 */
export interface AuthState {
  customer: AuthCustomer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

/**
 * Auth store actions
 */
export interface AuthActions {
  setCustomer: (customer: AuthCustomer) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  logout: () => void;
  reset: () => void;
}

/**
 * Combined auth store type
 */
export type AuthStore = AuthState & AuthActions;

/**
 * Initial auth state
 */
const initialState: AuthState = {
  customer: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
};

/**
 * Auth store with persistence
 * Customer data is persisted to localStorage for hydration
 * Tokens are stored in httpOnly cookies (not accessible from JS)
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setCustomer: (customer) =>
        set({
          customer,
          isAuthenticated: true,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setInitialized: (isInitialized) => set({ isInitialized }),

      logout: () =>
        set({
          customer: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      reset: () => set(initialState),
    }),
    {
      name: 'azteam-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        customer: state.customer,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Selector hooks for common state slices
 */
export const useCustomer = () => useAuthStore((state) => state.customer);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthInitialized = () => useAuthStore((state) => state.isInitialized);
