/**
 * Order Types
 * Types for orders, items, and delivery
 */

import type { MethodCode, DesignPlacement } from './products';

/**
 * Order status
 */
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

/**
 * Payment status
 */
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

/**
 * Artwork status
 */
export type ArtworkStatus =
  | 'not_started'
  | 'design_in_progress'
  | 'awaiting_admin_review'
  | 'awaiting_customer_review'
  | 'approved'
  | 'rejected_by_admin'
  | 'rejected_by_customer';

/**
 * Item status
 */
export type ItemStatus =
  | 'pending'
  | 'internal_review'
  | 'artwork_uploaded'
  | 'artwork_sent_for_approval'
  | 'artwork_approved'
  | 'nesting_digitalization_done'
  | 'production'
  | 'completed';

/**
 * Delivery method
 */
export type DeliveryMethod = 'pickup' | 'delivery';

/**
 * Shipping address
 */
export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

/**
 * Delivery info for order creation
 */
export interface DeliveryInfo {
  method: DeliveryMethod;
  requested_date?: string;
  address?: ShippingAddress;
  shipping_cost?: number;
}

/**
 * Order item request
 */
export interface OrderItemRequest {
  product_id: number;
  size: string;
  color: string;
  method: MethodCode;
  quantity: number;
  designs: DesignPlacement[];
  notes?: string;
}

/**
 * Create order request
 */
export interface CreateOrderRequest {
  client_order_reference?: string;
  items: OrderItemRequest[];
  delivery: DeliveryInfo;
  notes?: string;
}

/**
 * Order item response
 */
export interface OrderItemResponse {
  order_item_id: number;
  product_type: string;
  method: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
  description: string;
}

/**
 * Order response (from create)
 */
export interface OrderResponse {
  order_id: number;
  tracking_code: string;
  status: OrderStatus;
  total: number;
  items: OrderItemResponse[];
  created_at: string;
}

/**
 * Create order response
 */
export interface CreateOrderResponse {
  success: true;
  data: OrderResponse;
}

/**
 * Order item details
 */
export interface OrderItemDetails {
  order_item_id: number;
  status: ItemStatus;
  product_type: string;
  custom_method: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
  description: string;
}

/**
 * Full order details
 */
export interface OrderDetails {
  order_id: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  artwork_status: ArtworkStatus;
  order_total: number;
  amount_paid: number;
  balance_due: number;
  tax: number;
  discount: number;
  shipping_cost: number;
  date_created: string;
  date_due: string;
  tracking_code: string;
  items: OrderItemDetails[];
}

/**
 * Order summary (for list view)
 */
export interface OrderSummary {
  order_id: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  order_total: number;
  date_created: string;
  date_due: string;
  tracking_code: string;
  item_count: number;
}

/**
 * Order list response
 */
export interface OrderListResponse {
  success: true;
  data: {
    orders: OrderSummary[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  };
}

/**
 * Order detail response
 */
export interface OrderDetailResponse {
  success: true;
  data: OrderDetails;
}

/**
 * Public order item (for tracking)
 */
export interface PublicOrderItem {
  product_description: string;
  quantity: number;
  status: ItemStatus;
  status_label: string;
}

/**
 * Public order tracking data
 */
export interface PublicOrderTracking {
  order_number: string;
  date_created: string;
  date_due: string;
  order_status: OrderStatus;
  artwork_status: ArtworkStatus;
  items: PublicOrderItem[];
}

/**
 * Track order response
 */
export interface TrackOrderResponse {
  success: true;
  data: PublicOrderTracking;
}

/**
 * Change request type
 */
export type ChangeRequestType = 'modify_items' | 'change_due_date' | 'cancel_order' | 'other';

/**
 * Contact method
 */
export type ContactMethod = 'email' | 'phone' | 'whatsapp';

/**
 * Change request data
 */
export interface ChangeRequestData {
  change_type: ChangeRequestType;
  description: string;
  contact_method?: ContactMethod;
}

/**
 * Change request response
 */
export interface ChangeRequestResponse {
  success: true;
  message: string;
  data: {
    request_id: number;
    status: string;
    submitted_at: string;
    estimated_response_time: string;
  };
}
