/**
 * Customer Types
 * Types for customer profile and consent settings
 */

/**
 * Customer address
 */
export interface CustomerAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
}

/**
 * Consent settings
 */
export interface ConsentSettings {
  sms_opt_in: boolean;
  sms_opt_in_date?: string;
  email_marketing_opt_in: boolean;
  email_marketing_opt_in_date?: string;
  whatsapp_consent: boolean;
  whatsapp_consent_date?: string;
}

/**
 * Customer profile
 */
export interface CustomerProfile {
  customer_id: number;
  email: string;
  full_name: string;
  company_name: string;
  phone_number: string;
  address: CustomerAddress;
  consent: ConsentSettings;
  email_verified: boolean;
  last_login_at: string;
  created_at: string;
}

/**
 * Profile response
 */
export interface ProfileResponse {
  success: true;
  data: CustomerProfile;
}

/**
 * Update profile request
 */
export interface UpdateProfileRequest {
  full_name?: string;
  company_name?: string;
  phone_number?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

/**
 * Update consent request
 */
export interface UpdateConsentRequest {
  sms_opt_in?: boolean;
  email_marketing_opt_in?: boolean;
  whatsapp_consent?: boolean;
}

/**
 * Consent response
 */
export interface ConsentResponse {
  success: true;
  data: ConsentSettings;
}

/**
 * Delete account request
 */
export interface DeleteAccountRequest {
  password: string;
}
