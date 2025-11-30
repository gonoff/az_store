/**
 * Products API Service
 * API functions for product catalog operations
 * Uses local Next.js API routes to proxy requests to ERP (avoiding CORS issues)
 */

import axios from 'axios';
import { handleApiError } from './errors';
import type {
  ProductsByType,
  ProductDetails,
  ProductFilters,
  CustomizationMethod,
  FilterOptions,
  DesignSize,
  PriceCalculationRequest,
  PricingBreakdown,
  ValidationResponse,
  PlacementArea,
  MethodCode,
} from '@/types';

/**
 * Local API helper - calls Next.js API routes which proxy to ERP
 */
async function localGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await axios.get<T>(url, { params });
  return response.data;
}

async function localPost<T>(url: string, data?: unknown): Promise<T> {
  const response = await axios.post<T>(url, data);
  return response.data;
}

/**
 * Products API service
 */
export const productsApi = {
  /**
   * List all products with optional filters
   */
  list: async (filters?: ProductFilters): Promise<ProductsByType> => {
    try {
      const response = await localGet<{ success: true; data: ProductsByType }>(
        '/api/products',
        filters as Record<string, unknown>
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get single product details with sizes and colors
   */
  get: async (id: number): Promise<ProductDetails> => {
    try {
      const response = await localGet<{ success: true; data: ProductDetails }>(
        `/api/products/${id}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Calculate price for a product configuration
   */
  calculatePrice: async (request: PriceCalculationRequest): Promise<PricingBreakdown> => {
    try {
      const response = await localPost<{ success: true; pricing: PricingBreakdown }>(
        '/api/products/calculate-price',
        request
      );
      return response.pricing;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Validate a product configuration
   */
  validate: async (request: PriceCalculationRequest): Promise<ValidationResponse> => {
    try {
      const response = await localPost<ValidationResponse>('/api/products/validate', request);
      return response;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get available customization methods with pricing
   */
  getMethods: async (): Promise<CustomizationMethod[]> => {
    try {
      const response = await localGet<{ success: true; data: CustomizationMethod[] }>(
        '/api/methods'
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get filter options (types, materials, genders, styles)
   */
  getFilters: async (): Promise<FilterOptions> => {
    try {
      const response = await localGet<{ success: true; data: FilterOptions }>('/api/filters');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get design sizes for a specific placement area and method
   */
  getDesignSizes: async (area: PlacementArea, method: MethodCode): Promise<DesignSize[]> => {
    try {
      const response = await localGet<{ success: true; data: DesignSize[] }>('/api/design-sizes', {
        area,
        method,
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};
