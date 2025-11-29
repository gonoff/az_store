/**
 * Query Key Factory
 * Centralized query keys for TanStack Query caching
 */

import type { ProductFilters, OrderStatus } from '@/types';

/**
 * Query key factory for consistent cache key management
 */
export const queryKeys = {
  // Products
  products: {
    all: ['products'] as const,
    list: (filters?: ProductFilters) => ['products', 'list', filters] as const,
    detail: (id: number) => ['products', 'detail', id] as const,
  },

  // Customization methods
  methods: ['methods'] as const,

  // Filter options
  filters: ['filters'] as const,

  // Design sizes
  designSizes: (area: string, method: string) => ['design-sizes', area, method] as const,

  // Orders
  orders: {
    all: ['orders'] as const,
    list: (page?: number, status?: OrderStatus) => ['orders', 'list', { page, status }] as const,
    detail: (id: number) => ['orders', 'detail', id] as const,
    track: (code: string) => ['orders', 'track', code] as const,
  },

  // Customer
  customer: {
    profile: ['customer', 'profile'] as const,
    consent: ['customer', 'consent'] as const,
  },

  // Auth
  auth: {
    user: ['auth', 'user'] as const,
  },
} as const;

/**
 * Type for query key values
 */
export type QueryKeys = typeof queryKeys;
