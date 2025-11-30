/**
 * Product Types
 * Types for products, customization methods, and pricing
 */

/**
 * Product type enum
 */
export type ProductType = 'shirt' | 'hoodie' | 'hat' | 'bag' | 'apron';

/**
 * Gender enum
 */
export type Gender = 'mens' | 'womens' | 'unisex';

/**
 * Customization method code
 */
export type MethodCode = 'dtf' | 'embroidery';

/**
 * Design size code
 */
export type DesignSizeCode = 'teeny_tiny' | 'tiny' | 'small' | 'medium' | 'large';

/**
 * Design placement area
 */
export type PlacementArea =
  | 'front'
  | 'back'
  | 'sleeve'
  | 'sleeve_left'
  | 'sleeve_right'
  | 'pocket'
  | 'side_left'
  | 'side_right';

/**
 * Product size with pricing
 */
export interface ProductSize {
  size_code: string;
  size_name: string;
  supplier_cost: number;
}

/**
 * Product color
 */
export interface ProductColor {
  color_name: string;
  hex_code: string | null;
  color_group: string | null;
}

/**
 * Base product info
 */
export interface Product {
  id: number;
  type: ProductType;
  style: string;
  material: string;
  gender: Gender;
  display_name: string;
  base_price: number;
  product?: {
    brand: string;
    material: string;
    style: string;
  };
}

/**
 * Product with sizes and colors
 */
export interface ProductDetails extends Product {
  sizes: ProductSize[];
  colors: ProductColor[];
}

/**
 * Products grouped by type
 */
export type ProductsByType = Record<ProductType, Product[]>;

/**
 * Product list response
 */
export interface ProductListResponse {
  success: true;
  data: ProductsByType;
  meta: {
    total_count: number;
    filters_applied: Record<string, string>;
  };
}

/**
 * Product detail response
 */
export interface ProductDetailResponse {
  success: true;
  data: ProductDetails;
}

/**
 * Customization method with pricing
 */
export interface CustomizationMethod {
  method_code: MethodCode;
  method_name: string;
  labor_profit: number;
  description: string;
  pricing: Record<DesignSizeCode, number>;
}

/**
 * Design size info
 */
export interface DesignSize {
  size_code: DesignSizeCode;
  size_name: string;
  dimensions: string;
  material_cost: number;
}

/**
 * Filter options
 */
export interface FilterOptions {
  product_types: ProductType[];
  materials: string[];
  genders: Gender[];
  styles: string[];
}

/**
 * Product filters
 */
export interface ProductFilters {
  type?: ProductType;
  material?: string;
  gender?: Gender;
}

/**
 * Design placement for pricing
 */
export interface DesignPlacement {
  area: PlacementArea;
  design_size: DesignSizeCode;
}

/**
 * Price calculation request
 */
export interface PriceCalculationRequest {
  product_id: number;
  size: string;
  method: MethodCode;
  designs: DesignPlacement[];
  quantity?: number;
}

/**
 * Design cost breakdown
 */
export interface DesignCost {
  area: string;
  area_group?: string;
  size: string;
  cost: number;
}

/**
 * Base price breakdown (default configuration)
 */
export interface BasePrice {
  blank_cost: number;
  default_front: number;
  default_back: number;
  total: number;
}

/**
 * Price adjustment from default configuration
 */
export interface PriceAdjustment {
  area: string;
  size: string;
  adjustment: number;
  label: string;
}

/**
 * Pricing breakdown
 */
export interface PricingBreakdown {
  blank_cost: number;
  design_costs: DesignCost[];
  design_total: number;
  base_fee: number;
  base_price: BasePrice;
  adjustments: PriceAdjustment[];
  per_item_price: number;
  quantity: number;
  total: number;
}

/**
 * Price calculation response
 */
export interface PriceCalculationResponse {
  success: true;
  pricing: PricingBreakdown;
}

/**
 * Validation response
 */
export interface ValidationResponse {
  success: true;
  valid: boolean;
  errors: string[];
}
