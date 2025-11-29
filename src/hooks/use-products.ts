/**
 * Product Hooks
 * TanStack Query hooks for product operations
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import type { ProductFilters, PriceCalculationRequest, PlacementArea, MethodCode } from '@/types';

/**
 * Fetch products with optional filters
 */
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => productsApi.list(filters),
  });
}

/**
 * Fetch single product by ID
 */
export function useProduct(id: number) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productsApi.get(id),
    enabled: id > 0,
  });
}

/**
 * Fetch customization methods
 */
export function useMethods() {
  return useQuery({
    queryKey: queryKeys.methods,
    queryFn: productsApi.getMethods,
    staleTime: Infinity, // Methods rarely change
  });
}

/**
 * Fetch filter options
 */
export function useFilters() {
  return useQuery({
    queryKey: queryKeys.filters,
    queryFn: productsApi.getFilters,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch design sizes for a placement area and method
 */
export function useDesignSizes(area: PlacementArea, method: MethodCode) {
  return useQuery({
    queryKey: queryKeys.designSizes(area, method),
    queryFn: () => productsApi.getDesignSizes(area, method),
    enabled: !!area && !!method,
    staleTime: Infinity, // Design sizes rarely change
  });
}

/**
 * Calculate price for a product configuration
 */
export function useCalculatePrice() {
  return useMutation({
    mutationFn: (request: PriceCalculationRequest) => productsApi.calculatePrice(request),
  });
}

/**
 * Validate a product configuration
 */
export function useValidateConfiguration() {
  return useMutation({
    mutationFn: (request: PriceCalculationRequest) => productsApi.validate(request),
  });
}
