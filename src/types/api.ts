/**
 * API Response Types
 * Base types for API responses from the AZTEAM ERP backend
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: Record<string, string>;
}

/**
 * Pagination metadata
 */
export interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  success: true;
  data: {
    items: T[];
    pagination: Pagination;
  };
}

/**
 * API Error response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string>;
}
