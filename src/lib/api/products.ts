/**
 * Products API Service
 * API functions for product catalog operations
 */

import { get, post } from './client';
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
 * Products API service
 */
export const productsApi = {
  /**
   * List all products with optional filters
   */
  list: async (filters?: ProductFilters): Promise<ProductsByType> => {
    try {
      const response = await get<{ success: true; data: ProductsByType }>(
        '/api/v1/products',
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
      const response = await get<{ success: true; data: ProductDetails }>(`/api/v1/products/${id}`);
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
      const response = await post<{ success: true; pricing: PricingBreakdown }>(
        '/api/v1/products/calculate-price',
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
      const response = await post<ValidationResponse>('/api/v1/products/validate', request);
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
      const response = await get<{ success: true; data: CustomizationMethod[] }>('/api/v1/methods');
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
      const response = await get<{ success: true; data: FilterOptions }>('/api/v1/filters');
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
      const response = await get<{ success: true; data: DesignSize[] }>('/api/v1/design-sizes', {
        area,
        method,
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};
