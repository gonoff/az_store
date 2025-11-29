/**
 * API Barrel Exports
 * Re-exports all API services and utilities
 */

// API client
export { apiClient, get, post, put, del } from './client';

// Error handling
export {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  handleApiError,
  isApiError,
  isValidationError,
  isAuthenticationError,
  isAuthorizationError,
  isNotFoundError,
} from './errors';

// API services
export { productsApi } from './products';
export { authApi } from './auth';
export { ordersApi, type OrderListFilters } from './orders';
export { customerApi } from './customer';
