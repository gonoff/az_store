/**
 * API Error Handling
 * Custom error classes and utilities for API error handling
 */

import axios from 'axios';

/**
 * Base API error class
 */
export class ApiError extends Error {
  status: number;
  details?: Record<string, string>;

  constructor(message: string, status: number, details?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Validation error with field-level details
 */
export class ValidationError extends ApiError {
  constructor(message: string, details: Record<string, string>) {
    super(message, 422, details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Handle API errors from axios
 * Transforms axios errors into typed ApiError instances
 */
export function handleApiError(error: unknown): never {
  // Already an ApiError, just rethrow
  if (error instanceof ApiError) {
    throw error;
  }

  // Handle axios errors
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    const status = error.response?.status || 500;

    // Validation errors (422)
    if (status === 422 && data?.details) {
      throw new ValidationError(data.error || 'Validation failed', data.details);
    }

    // Authentication errors (401)
    if (status === 401) {
      throw new AuthenticationError(data?.error || 'Authentication required');
    }

    // Authorization errors (403)
    if (status === 403) {
      throw new AuthorizationError(data?.error || 'Access denied');
    }

    // Not found errors (404)
    if (status === 404) {
      throw new NotFoundError(data?.error || 'Resource not found');
    }

    // Generic API error
    throw new ApiError(data?.error || 'An unexpected error occurred', status, data?.details);
  }

  // Handle network errors
  if (error instanceof Error) {
    throw new ApiError(error.message, 0);
  }

  // Unknown error
  throw new ApiError('An unexpected error occurred', 500);
}

/**
 * Check if an error is a specific API error type
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

export function isAuthorizationError(error: unknown): error is AuthorizationError {
  return error instanceof AuthorizationError;
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}
