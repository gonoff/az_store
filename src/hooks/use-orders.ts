/**
 * Order Hooks
 * TanStack Query hooks for order operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, type OrderListFilters } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import type { CreateOrderRequest, ChangeRequestData, OrderStatus } from '@/types';

/**
 * Fetch customer orders with pagination and optional status filter
 */
export function useOrders(page?: number, status?: OrderStatus) {
  return useQuery({
    queryKey: queryKeys.orders.list(page, status),
    queryFn: () =>
      ordersApi.list({
        page,
        status,
      } satisfies OrderListFilters),
  });
}

/**
 * Fetch single order by ID
 */
export function useOrder(id: number) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => ordersApi.get(id),
    enabled: id > 0,
  });
}

/**
 * Track order by tracking code (public, no auth)
 */
export function useTrackOrder(trackingCode: string) {
  return useQuery({
    queryKey: queryKeys.orders.track(trackingCode),
    queryFn: () => ordersApi.track(trackingCode),
    enabled: !!trackingCode,
    retry: false, // Don't retry on invalid tracking codes
  });
}

/**
 * Create a new order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersApi.create(data),
    onSuccess: () => {
      // Invalidate order list to refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}

/**
 * Request a change to an order
 */
export function useRequestChange(orderId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChangeRequestData) => ordersApi.requestChange(orderId, data),
    onSuccess: () => {
      // Invalidate the specific order to refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
    },
  });
}
