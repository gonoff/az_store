/**
 * Type Barrel Exports
 * Re-exports all types from a single entry point
 */

// API types
export type { ApiResponse, Pagination, PaginatedResponse, ApiErrorResponse } from './api';

// Auth types
export type {
  AuthTokens,
  CustomerInfo,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ResendVerificationRequest,
  CurrentUserResponse,
} from './auth';

// Product types
export type {
  ProductType,
  Gender,
  MethodCode,
  DesignSizeCode,
  PlacementArea,
  ProductSize,
  ProductColor,
  Product,
  ProductDetails,
  ProductsByType,
  ProductListResponse,
  ProductDetailResponse,
  CustomizationMethod,
  DesignSize,
  FilterOptions,
  ProductFilters,
  DesignPlacement,
  PriceCalculationRequest,
  DesignCost,
  PricingBreakdown,
  PriceCalculationResponse,
  ValidationResponse,
} from './products';

// Order types
export type {
  OrderStatus,
  PaymentStatus,
  ArtworkStatus,
  ItemStatus,
  DeliveryMethod,
  ShippingAddress,
  DeliveryInfo,
  OrderItemRequest,
  CreateOrderRequest,
  OrderItemResponse,
  OrderResponse,
  CreateOrderResponse,
  OrderItemDetails,
  OrderDetails,
  OrderSummary,
  OrderListResponse,
  OrderDetailResponse,
  PublicOrderItem,
  PublicOrderTracking,
  TrackOrderResponse,
  ChangeRequestType,
  ContactMethod,
  ChangeRequestData,
  ChangeRequestResponse,
} from './orders';

// Customer types
export type {
  CustomerAddress,
  ConsentSettings,
  CustomerProfile,
  ProfileResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UpdateConsentRequest,
  ConsentResponse,
  DeleteAccountRequest,
} from './customer';
