/**
 * Orders API Service
 * API functions for order operations
 */

import { get, post } from './client';
import { handleApiError } from './errors';
import type {
  CreateOrderRequest,
  OrderResponse,
  OrderDetails,
  OrderSummary,
  Pagination,
  PublicOrderTracking,
  ChangeRequestData,
  ChangeRequestResponse,
  OrderStatus,
} from '@/types';

/**
 * Order list filters
 */
export interface OrderListFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

/**
 * Orders API service
 */
export const ordersApi = {
  /**
   * Create a new order
   */
  create: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    try {
      const response = await post<{ success: true; data: OrderResponse }>('/api/v1/orders', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get customer order history (paginated)
   */
  list: async (
    filters?: OrderListFilters
  ): Promise<{ orders: OrderSummary[]; pagination: Pagination }> => {
    try {
      const response = await get<{
        success: true;
        data: { orders: OrderSummary[]; pagination: Pagination };
      }>('/api/v1/customer/orders', filters as Record<string, unknown>);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get order details by ID
   */
  get: async (id: number): Promise<OrderDetails> => {
    try {
      const response = await get<{ success: true; data: OrderDetails }>(
        `/api/v1/customer/orders/${id}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Track order by tracking code (public, no auth required)
   */
  track: async (trackingCode: string): Promise<PublicOrderTracking> => {
    try {
      const response = await get<{ success: true; data: PublicOrderTracking }>(
        `/api/v1/orders/track/${trackingCode}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Request a change to an order
   */
  requestChange: async (
    orderId: number,
    data: ChangeRequestData
  ): Promise<ChangeRequestResponse['data']> => {
    try {
      const response = await post<ChangeRequestResponse>(
        `/api/v1/customer/orders/${orderId}/request-change`,
        data
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};
