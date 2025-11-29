/**
 * Authentication Types
 * Types for JWT authentication and customer info
 */

/**
 * JWT token pair
 */
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

/**
 * Basic customer info returned with auth
 */
export interface CustomerInfo {
  customer_id: number;
  email: string;
  full_name: string;
  email_verified: boolean;
}

/**
 * Login response
 */
export interface LoginResponse {
  success: true;
  data: AuthTokens & {
    customer: CustomerInfo;
  };
}

/**
 * Registration request
 */
export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
}

/**
 * Registration response
 */
export interface RegisterResponse {
  success: true;
  message: string;
  data: {
    customer_id: number;
  };
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refresh_token: string;
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
  success: true;
  data: AuthTokens;
}

/**
 * Forgot password request
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Reset password request
 */
export interface ResetPasswordRequest {
  token: string;
  password: string;
}

/**
 * Resend verification request
 */
export interface ResendVerificationRequest {
  email: string;
}

/**
 * Current user response (from /api/auth/me)
 */
export interface CurrentUserResponse {
  success: true;
  data: CustomerInfo & {
    phone_number: string;
    created_at: string;
  };
}
