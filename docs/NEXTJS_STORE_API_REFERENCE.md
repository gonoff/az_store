# AZTEAM ERP - Online Store API Reference

Complete API documentation for building a Next.js online store that integrates with the AZTEAM ERP system.

**Base URL**: `https://erp.azteamtech.com` (production) | `http://localhost/erp` (development)
**API Version**: v1
**Last Updated**: 2025-11-28

---

## Table of Contents

1. [Quick Start Guide](#1-quick-start-guide)
2. [Authentication](#2-authentication)
3. [Product Catalog](#3-product-catalog)
4. [Order Creation](#4-order-creation)
5. [Customer Account](#5-customer-account)
6. [Error Handling](#6-error-handling)
7. [TypeScript Types](#7-typescript-types)

---

## 1. Quick Start Guide

### Base URL Configuration

```typescript
// next.config.js or environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://erp.azteamtech.com';
```

### Authentication Overview

The API uses **JWT (JSON Web Tokens)** for customer authentication:

| Token Type    | Validity | Purpose              |
| ------------- | -------- | -------------------- |
| Access Token  | 24 hours | API authorization    |
| Refresh Token | 30 days  | Get new access token |

**Algorithm**: HS256
**Header Format**: `Authorization: Bearer <access_token>`

### CORS Configuration

The API accepts cross-origin requests from:

- `https://store.azteamtech.com` (production)
- `http://localhost:3000` (Next.js dev)
- `http://localhost:5173` (Vite dev)

### Standard Response Format

**Success Response**:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response**:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "details": { ... }  // Optional validation details
}
```

### HTTP Status Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | Success                              |
| 201  | Created (new resource)               |
| 400  | Bad Request / Validation Error       |
| 401  | Unauthorized (missing/invalid token) |
| 403  | Forbidden (access denied)            |
| 404  | Not Found                            |
| 405  | Method Not Allowed                   |
| 422  | Validation Failed (with details)     |
| 500  | Server Error                         |

---

## 2. Authentication

### 2.1 Register Customer Account

Creates a new customer account and sends email verification.

```
POST /api/auth/register
```

**Request Body**:

```json
{
  "email": "customer@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "phone_number": "555-123-4567"
}
```

**Password Requirements**:

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Success Response** (201 Created):

```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "customer_id": 123
  }
}
```

**Error Response** (400 Bad Request):

```json
{
  "success": false,
  "error": "An account with this email already exists. Please login instead."
}
```

**Next.js Example**:

```typescript
async function registerCustomer(data: RegisterData) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

---

### 2.2 Login

Authenticates a customer and returns JWT tokens.

```
POST /api/auth/login
```

**Request Body**:

```json
{
  "email": "customer@example.com",
  "password": "SecurePass123"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400,
    "token_type": "Bearer",
    "customer": {
      "customer_id": 123,
      "email": "customer@example.com",
      "full_name": "John Doe",
      "email_verified": true
    }
  }
}
```

**Error Response** (401 Unauthorized):

```json
{
  "success": false,
  "error": "Invalid email or password."
}
```

**Account Lockout**:

- 5 failed attempts → 15-minute lockout
- 10 failed attempts → 1-hour lockout
- 20 failed attempts → Permanent lockout (contact support)

**Next.js Example**:

```typescript
async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();

  if (result.success) {
    // Store tokens securely (httpOnly cookie recommended)
    localStorage.setItem('access_token', result.data.access_token);
    localStorage.setItem('refresh_token', result.data.refresh_token);
  }

  return result;
}
```

---

### 2.3 Refresh Token

Exchanges a refresh token for a new access token pair.

```
POST /api/auth/refresh
```

**Request Body**:

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400,
    "token_type": "Bearer"
  }
}
```

**Next.js Example (Axios Interceptor)**:

```typescript
import axios from 'axios';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refresh_token: refreshToken,
        });

        if (data.success) {
          localStorage.setItem('access_token', data.data.access_token);
          localStorage.setItem('refresh_token', data.data.refresh_token);

          // Retry original request
          error.config.headers.Authorization = `Bearer ${data.data.access_token}`;
          return api.request(error.config);
        }
      }

      // Redirect to login
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);
```

---

### 2.4 Logout

Client-side logout (JWT is stateless - client deletes tokens).

```
POST /api/auth/logout
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Logged out successfully. Please delete your tokens."
}
```

---

### 2.5 Forgot Password

Sends a password reset email. Always returns success to prevent email enumeration.

```
POST /api/auth/forgot-password
```

**Request Body**:

```json
{
  "email": "customer@example.com"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

---

### 2.6 Reset Password

Resets password using the token from the email link.

```
POST /api/auth/reset-password
```

**Request Body**:

```json
{
  "token": "abc123def456...",
  "password": "NewSecurePass456"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Password successfully reset. Please log in with your new password."
}
```

---

### 2.7 Verify Email

Verifies email using the token from the verification email.

```
GET /api/auth/verify-email?token=abc123def456...
```

**Browser Access**: Redirects to `https://store.azteamtech.com/login?verified=true`

**API Access**:

```json
{
  "success": true,
  "message": "Email successfully verified! You can now place orders."
}
```

---

### 2.8 Resend Verification Email

Resends the email verification link.

```
POST /api/auth/resend-verification
```

**Request Body**:

```json
{
  "email": "customer@example.com"
}
```

**Rate Limits**:

- 2-minute cooldown between requests
- Maximum 5 requests per 24 hours

---

### 2.9 Get Current Customer

Returns the authenticated customer's information.

```
GET /api/auth/me
Authorization: Bearer <access_token>
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "customer_id": 123,
    "email": "customer@example.com",
    "full_name": "John Doe",
    "phone_number": "5551234567",
    "email_verified": true,
    "created_at": "2025-01-15 10:30:00"
  }
}
```

---

## 3. Product Catalog

All product catalog endpoints are **PUBLIC** (no authentication required).

### 3.1 List All Products

Returns products grouped by type with optional filtering.

```
GET /api/v1/products
GET /api/v1/products?type=shirt
GET /api/v1/products?material=Cotton&gender=unisex
```

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | Filter by product type (shirt, hoodie, hat, bag, apron) |
| material | string | Filter by material (Cotton, 50/50, Polyester) |
| gender | string | Filter by gender (mens, womens, unisex) |

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "shirt": [
      {
        "id": 1,
        "type": "shirt",
        "style": "T-Shirt Round Neck",
        "material": "50/50",
        "gender": "unisex",
        "display_name": "T-Shirt Round Neck - 50/50",
        "base_price": 3.89,
        "product": {
          "brand": "Gildan",
          "material": "50/50",
          "style": "T-Shirt Round Neck"
        }
      }
    ],
    "hoodie": [
      {
        "id": 10,
        "type": "hoodie",
        "style": "Pullover Hoodie",
        "material": "Cotton",
        "gender": "unisex",
        "display_name": "Pullover Hoodie - Cotton",
        "base_price": 15.99
      }
    ]
  },
  "meta": {
    "total_count": 19,
    "filters_applied": {}
  }
}
```

---

### 3.2 Get Product Details

Returns a single product with sizes and colors.

```
GET /api/v1/products/{id}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "shirt",
    "style": "T-Shirt Round Neck",
    "material": "50/50",
    "gender": "unisex",
    "display_name": "T-Shirt Round Neck - 50/50",
    "base_price": 3.89,
    "sizes": [
      { "size_code": "S", "size_name": "S", "supplier_cost": 3.89 },
      { "size_code": "M", "size_name": "M", "supplier_cost": 3.89 },
      { "size_code": "L", "size_name": "L", "supplier_cost": 3.89 },
      { "size_code": "XL", "size_name": "XL", "supplier_cost": 3.89 },
      { "size_code": "2XL", "size_name": "2XL", "supplier_cost": 6.99 },
      { "size_code": "3XL", "size_name": "3XL", "supplier_cost": 7.99 }
    ],
    "colors": [
      { "color_name": "Black", "hex_code": "#000000", "color_group": "dark" },
      { "color_name": "White", "hex_code": "#FFFFFF", "color_group": "light" },
      { "color_name": "Navy", "hex_code": "#001F3F", "color_group": "dark" },
      { "color_name": "Red", "hex_code": "#FF0000", "color_group": "bright" }
    ]
  }
}
```

---

### 3.3 Calculate Price

Calculates the price for a product configuration.

```
POST /api/v1/products/calculate-price
```

**Request Body**:

```json
{
  "product_id": 1,
  "size": "2XL",
  "method": "dtf",
  "designs": [
    { "area": "front", "design_size": "medium" },
    { "area": "back", "design_size": "large" }
  ],
  "quantity": 10
}
```

**Pricing Formula**:

```
Final Price = Blank Cost + Design Costs + Labor/Profit

Where:
- Blank Cost = supplier_cost for selected size (e.g., $6.99 for 2XL)
- Design Costs = SUM of material costs per design placement
- Labor/Profit = method's labor_profit (applied once per item)
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "pricing": {
    "blank_cost": 6.99,
    "design_costs": [
      { "area": "front", "size": "medium", "cost": 1.65 },
      { "area": "back", "size": "large", "cost": 2.48 }
    ],
    "design_total": 4.13,
    "labor_profit": 9.11,
    "per_item_price": 20.23,
    "quantity": 10,
    "total": 202.3
  }
}
```

---

### 3.4 Validate Configuration

Validates a product configuration without calculating price.

```
POST /api/v1/products/validate
```

**Request Body**: Same as calculate-price

**Success Response** (200 OK):

```json
{
  "success": true,
  "valid": true,
  "errors": []
}
```

**Validation Error Response**:

```json
{
  "success": true,
  "valid": false,
  "errors": [
    "Size '4XL' not available for this product",
    "Design 0: Size 'large' not allowed for 'sleeve'"
  ]
}
```

---

### 3.5 List Customization Methods

Returns available customization methods with pricing.

```
GET /api/v1/methods
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "method_code": "dtf",
      "method_name": "DTF (Direct-to-Film)",
      "labor_profit": 9.11,
      "description": "High-quality heat transfer prints...",
      "pricing": {
        "teeny_tiny": 0.14,
        "tiny": 0.38,
        "small": 0.83,
        "medium": 1.65,
        "large": 2.48
      }
    },
    {
      "method_code": "embroidery",
      "method_name": "Embroidery",
      "labor_profit": 12.0,
      "description": "Professional embroidered designs...",
      "pricing": {
        "teeny_tiny": 3.5,
        "tiny": 5.0,
        "small": 8.0,
        "medium": 12.0,
        "large": 18.0
      }
    }
  ]
}
```

---

### 3.6 Get Filter Options

Returns available values for product filters.

```
GET /api/v1/filters
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "product_types": ["shirt", "hoodie", "hat", "bag", "apron"],
    "materials": ["Cotton", "50/50", "Polyester", "Blend"],
    "genders": ["mens", "womens", "unisex"],
    "styles": ["T-Shirt Round Neck", "V-Neck", "Polo", "Long Sleeve"]
  }
}
```

---

### 3.7 Get Design Sizes for Area

Returns allowed design sizes for a placement area with pricing.

```
GET /api/v1/design-sizes?area=front&method=dtf
```

**Query Parameters**:
| Parameter | Required | Description |
|-----------|----------|-------------|
| area | Yes | Placement area (front, back, sleeve, pocket, etc.) |
| method | Yes | Method code (dtf, embroidery) |

**Valid Areas**:

- `front`, `back` - Full design range (teeny_tiny to large)
- `sleeve`, `sleeve_left`, `sleeve_right` - Limited to teeny_tiny, tiny, small
- `pocket`, `side_left`, `side_right` - Limited sizes

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "size_code": "teeny_tiny",
      "size_name": "Teeny Tiny",
      "dimensions": "3.5×3.5",
      "material_cost": 0.14
    },
    { "size_code": "tiny", "size_name": "Tiny", "dimensions": "5×5", "material_cost": 0.38 },
    { "size_code": "small", "size_name": "Small", "dimensions": "5×11", "material_cost": 0.83 },
    { "size_code": "medium", "size_name": "Medium", "dimensions": "10×11", "material_cost": 1.65 },
    { "size_code": "large", "size_name": "Large", "dimensions": "15×11", "material_cost": 2.48 }
  ],
  "meta": {
    "area": "front",
    "method": "dtf"
  }
}
```

---

## 4. Order Creation

### 4.1 Create Order

Creates a new order with items.

```
POST /api/v1/orders
Authorization: Bearer <access_token>
```

**Request Body**:

```json
{
  "client_order_reference": "unique-cart-id-12345",
  "items": [
    {
      "product_id": 1,
      "size": "L",
      "color": "Black",
      "method": "dtf",
      "quantity": 10,
      "designs": [
        { "area": "front", "design_size": "medium" },
        { "area": "back", "design_size": "small" }
      ],
      "notes": "Company logo on front"
    },
    {
      "product_id": 10,
      "size": "XL",
      "color": "Navy",
      "method": "embroidery",
      "quantity": 5,
      "designs": [{ "area": "front", "design_size": "small" }]
    }
  ],
  "delivery": {
    "method": "pickup",
    "requested_date": "2025-12-15"
  },
  "notes": "Rush order - please prioritize"
}
```

**Request Fields**:

| Field                         | Type   | Required    | Description                                        |
| ----------------------------- | ------ | ----------- | -------------------------------------------------- |
| client_order_reference        | string | No          | Unique ID for idempotency (max 100 chars)          |
| items                         | array  | Yes         | Array of order items                               |
| items[].product_id            | int    | Yes         | Product ID from catalog                            |
| items[].size                  | string | Yes         | Size code (S, M, L, XL, 2XL, etc.)                 |
| items[].color                 | string | Yes         | Color name from product colors                     |
| items[].method                | string | Yes         | Method code (dtf, embroidery)                      |
| items[].quantity              | int    | Yes         | Quantity (minimum 1)                               |
| items[].designs               | array  | Yes         | Array of design placements                         |
| items[].designs[].area        | string | Yes         | Placement area (front, back, sleeve)               |
| items[].designs[].design_size | string | Yes         | Size code (teeny_tiny, tiny, small, medium, large) |
| items[].notes                 | string | No          | Item-specific notes                                |
| delivery.method               | string | Yes         | "pickup" or "delivery"                             |
| delivery.requested_date       | string | No          | Requested due date (YYYY-MM-DD)                    |
| delivery.address              | object | If delivery | Shipping address (required for delivery)           |
| notes                         | string | No          | Order-level notes                                  |

**Success Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "order_id": 1234,
    "tracking_code": "AZ001234ABCD1234",
    "status": "pending",
    "total": 625.5,
    "items": [
      {
        "order_item_id": 5678,
        "product_type": "shirt",
        "method": "dtf",
        "size": "L",
        "color": "Black",
        "quantity": 10,
        "unit_price": 18.5,
        "description": "T-Shirt Round Neck - 50/50 - L - Black (Front: medium, Back: small)"
      }
    ],
    "created_at": "2025-11-28T10:30:00Z"
  }
}
```

**Idempotency**:

- If `client_order_reference` matches an existing order, returns that order (200 OK)
- New orders return 201 Created

**Validation Error Response** (422 Unprocessable Entity):

```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "items.0.product_id": "Invalid or inactive product",
    "items.1.size": "Size '4XL' not available for this product",
    "delivery.requested_date": "Requested date must be in the future"
  }
}
```

**Next.js Example**:

```typescript
async function createOrder(cartItems: CartItem[], deliveryMethod: string) {
  const accessToken = localStorage.getItem('access_token');

  const orderData = {
    client_order_reference: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    items: cartItems.map((item) => ({
      product_id: item.productId,
      size: item.size,
      color: item.color,
      method: item.method,
      quantity: item.quantity,
      designs: item.designs.map((d) => ({
        area: d.area,
        design_size: d.designSize,
      })),
    })),
    delivery: {
      method: deliveryMethod,
      requested_date: getRequestedDate(),
    },
  };

  const response = await fetch(`${API_BASE_URL}/api/v1/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(orderData),
  });

  return response.json();
}
```

---

### 4.2 Track Order by Code (PUBLIC)

Tracks an order using the tracking code (no authentication required).

```
GET /api/v1/orders/track/{tracking_code}
```

**Example**: `GET /api/v1/orders/track/AZ001234ABCD1234`

**Tracking Code Format**: `AZ` + 6-digit order ID (padded) + 8 random alphanumeric characters

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "order_number": "#1234",
    "date_created": "2025-11-28T10:30:00Z",
    "date_due": "2025-12-15",
    "order_status": "processing",
    "artwork_status": "approved",
    "items": [
      {
        "product_description": "T-Shirt Round Neck - L - Black",
        "quantity": 10,
        "status": "production",
        "status_label": "In Production"
      },
      {
        "product_description": "Hoodie - XL - Navy",
        "quantity": 5,
        "status": "artwork_approved",
        "status_label": "Artwork Approved"
      }
    ]
  }
}
```

**Note**: This endpoint returns limited data for privacy. Payment details and customer information are excluded.

---

## 5. Customer Account

All customer account endpoints require JWT authentication.

### 5.1 Get Profile

```
GET /api/v1/customer/profile
Authorization: Bearer <access_token>
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "customer_id": 123,
    "email": "customer@example.com",
    "full_name": "John Doe",
    "company_name": "Acme Corp",
    "phone_number": "5551234567",
    "address": {
      "line1": "123 Main St",
      "line2": "Suite 100",
      "city": "Austin",
      "state": "TX",
      "zip": "78701"
    },
    "consent": {
      "sms_opt_in": true,
      "email_marketing_opt_in": false,
      "whatsapp_consent": false
    },
    "email_verified": true,
    "last_login_at": "2025-11-28T09:15:00Z",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

---

### 5.2 Update Profile

```
PUT /api/v1/customer/profile
Authorization: Bearer <access_token>
```

**Request Body** (all fields optional):

```json
{
  "full_name": "John Smith",
  "company_name": "Acme Corporation",
  "phone_number": "555-987-6543",
  "address_line_1": "456 Oak Ave",
  "address_line_2": "",
  "city": "Austin",
  "state": "TX",
  "zip_code": "78702"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Profile updated successfully."
}
```

---

### 5.3 Change Password

```
PUT /api/v1/customer/password
Authorization: Bearer <access_token>
```

**Request Body**:

```json
{
  "current_password": "OldPass123",
  "new_password": "NewSecurePass456",
  "new_password_confirmation": "NewSecurePass456"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Password changed successfully."
}
```

---

### 5.4 Get Order History

```
GET /api/v1/customer/orders
GET /api/v1/customer/orders?page=1&limit=10&status=completed
Authorization: Bearer <access_token>
```

**Query Parameters**:
| Parameter | Default | Max | Description |
|-----------|---------|-----|-------------|
| page | 1 | - | Page number |
| limit | 10 | 50 | Items per page |
| status | - | - | Filter by order_status |

**Valid Status Values**: `pending`, `processing`, `completed`, `cancelled`

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "order_id": 1234,
        "order_status": "completed",
        "payment_status": "paid",
        "order_total": 625.5,
        "date_created": "2025-11-28T10:30:00Z",
        "date_due": "2025-12-15",
        "tracking_code": "AZ001234ABCD1234",
        "item_count": 2
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 47,
      "items_per_page": 10
    }
  }
}
```

---

### 5.5 Get Order Details

```
GET /api/v1/customer/orders/{id}
Authorization: Bearer <access_token>
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "order_id": 1234,
    "order_status": "processing",
    "payment_status": "unpaid",
    "artwork_status": "approved",
    "order_total": 625.5,
    "amount_paid": 0.0,
    "balance_due": 625.5,
    "tax": 51.2,
    "discount": 0.0,
    "shipping_cost": 0.0,
    "date_created": "2025-11-28T10:30:00Z",
    "date_due": "2025-12-15",
    "tracking_code": "AZ001234ABCD1234",
    "items": [
      {
        "order_item_id": 5678,
        "status": "production",
        "product_type": "shirt",
        "custom_method": "dtf",
        "size": "L",
        "color": "Black",
        "quantity": 10,
        "unit_price": 18.5,
        "description": "T-Shirt Round Neck - L - Black"
      }
    ]
  }
}
```

---

### 5.6 Get/Update Consent Settings

**Get Consent**:

```
GET /api/v1/customer/consent
Authorization: Bearer <access_token>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "sms_opt_in": true,
    "sms_opt_in_date": "2025-06-15T14:30:00Z",
    "email_marketing_opt_in": false,
    "email_marketing_opt_in_date": null,
    "whatsapp_consent": false,
    "whatsapp_consent_date": null
  }
}
```

**Update Consent**:

```
PUT /api/v1/customer/consent
Authorization: Bearer <access_token>
```

**Request Body**:

```json
{
  "sms_opt_in": true,
  "email_marketing_opt_in": true,
  "whatsapp_consent": false
}
```

---

### 5.7 Delete Account (GDPR)

Deletes the customer account. Data is anonymized to preserve order records.

```
DELETE /api/v1/customer/account
Authorization: Bearer <access_token>
```

**Request Body**:

```json
{
  "password": "CurrentPassword123"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Account deleted successfully. Your order history has been retained for our records."
}
```

---

### 5.8 Request Order Change

Submits a change request for an order that hasn't entered production.

```
POST /api/v1/customer/orders/{id}/request-change
Authorization: Bearer <access_token>
```

**Request Body**:

```json
{
  "change_type": "modify_items",
  "description": "Please change the quantity from 10 to 15 shirts and add a back design.",
  "contact_method": "email"
}
```

**Change Types**:

- `modify_items` - Change quantity, size, customization
- `change_due_date` - Request different due date
- `cancel_order` - Request cancellation
- `other` - General inquiries

**Contact Methods**: `email`, `phone`, `whatsapp`

**Allowed Order Statuses**: Only `pending` or `internal_review` orders can be modified.

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Change request submitted successfully.",
  "data": {
    "request_id": 456,
    "status": "pending_review",
    "submitted_at": "2025-11-28T10:30:00Z",
    "estimated_response_time": "24 hours"
  }
}
```

**Error Response** (400 Bad Request):

```json
{
  "success": false,
  "error": "Cannot request changes for orders in production or completed.",
  "details": {
    "order_status": "processing",
    "allowed_statuses": ["pending", "internal_review"]
  }
}
```

---

## 6. Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": "Human-readable error message",
  "details": { ... }
}
```

### Common Error Codes

| HTTP Status | Error Type         | Example Message                                    |
| ----------- | ------------------ | -------------------------------------------------- |
| 400         | Bad Request        | "Request body is required."                        |
| 400         | Validation         | "Email and password are required."                 |
| 401         | Unauthorized       | "Authentication required. Provide Bearer token."   |
| 401         | Token Expired      | "Invalid or expired token."                        |
| 403         | Forbidden          | "You do not have permission to modify this order." |
| 404         | Not Found          | "Order not found."                                 |
| 405         | Method Not Allowed | "Method not allowed. Use POST."                    |
| 422         | Validation Failed  | "Validation failed" (with details)                 |
| 500         | Server Error       | "Order creation failed. Please try again."         |

### Next.js Error Handler

```typescript
interface ApiError {
  success: false;
  error: string;
  details?: Record<string, string>;
}

async function handleApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!data.success) {
    const error = data as ApiError;

    // Handle specific error types
    if (response.status === 401) {
      // Token expired - try refresh or redirect to login
      await refreshTokenOrRedirect();
      throw new Error('Session expired');
    }

    if (response.status === 422 && error.details) {
      // Validation errors - format for form display
      throw new ValidationError(error.error, error.details);
    }

    throw new Error(error.error);
  }

  return data as T;
}

class ValidationError extends Error {
  details: Record<string, string>;

  constructor(message: string, details: Record<string, string>) {
    super(message);
    this.details = details;
  }
}
```

---

## 7. TypeScript Types

Copy these types to your Next.js project for type-safe API integration.

```typescript
// ============================================================================
// API Response Types
// ============================================================================

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: Record<string, string>;
}

interface PaginatedResponse<T> {
  success: true;
  data: {
    items: T[];
    pagination: Pagination;
  };
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

// ============================================================================
// Authentication Types
// ============================================================================

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

interface CustomerInfo {
  customer_id: number;
  email: string;
  full_name: string;
  email_verified: boolean;
}

interface LoginResponse {
  success: true;
  data: AuthTokens & {
    customer: CustomerInfo;
  };
}

interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
}

// ============================================================================
// Product Types
// ============================================================================

type ProductType = 'shirt' | 'hoodie' | 'hat' | 'bag' | 'apron';
type Gender = 'mens' | 'womens' | 'unisex';
type MethodCode = 'dtf' | 'embroidery';
type DesignSizeCode = 'teeny_tiny' | 'tiny' | 'small' | 'medium' | 'large';
type PlacementArea = 'front' | 'back' | 'sleeve' | 'sleeve_left' | 'sleeve_right' | 'pocket';

interface Product {
  id: number;
  type: ProductType;
  style: string;
  material: string;
  gender: Gender;
  display_name: string;
  base_price: number;
  product: {
    brand: string;
    material: string;
    style: string;
  };
}

interface ProductDetails extends Product {
  sizes: ProductSize[];
  colors: ProductColor[];
}

interface ProductSize {
  size_code: string;
  size_name: string;
  supplier_cost: number;
}

interface ProductColor {
  color_name: string;
  hex_code: string | null;
  color_group: string | null;
}

interface CustomizationMethod {
  method_code: MethodCode;
  method_name: string;
  labor_profit: number;
  description: string;
  pricing: Record<DesignSizeCode, number>;
}

interface DesignSize {
  size_code: DesignSizeCode;
  size_name: string;
  dimensions: string;
  material_cost: number;
}

// ============================================================================
// Pricing Types
// ============================================================================

interface PriceCalculationRequest {
  product_id: number;
  size: string;
  method: MethodCode;
  designs: DesignPlacement[];
  quantity?: number;
}

interface DesignPlacement {
  area: PlacementArea;
  design_size: DesignSizeCode;
}

interface PricingBreakdown {
  blank_cost: number;
  design_costs: Array<{
    area: string;
    size: string;
    cost: number;
  }>;
  design_total: number;
  labor_profit: number;
  per_item_price: number;
  quantity: number;
  total: number;
}

// ============================================================================
// Order Types
// ============================================================================

type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
type PaymentStatus = 'unpaid' | 'partial' | 'paid';
type ArtworkStatus =
  | 'not_started'
  | 'design_in_progress'
  | 'awaiting_admin_review'
  | 'awaiting_customer_review'
  | 'approved'
  | 'rejected_by_admin'
  | 'rejected_by_customer';
type ItemStatus =
  | 'pending'
  | 'internal_review'
  | 'artwork_uploaded'
  | 'artwork_sent_for_approval'
  | 'artwork_approved'
  | 'nesting_digitalization_done'
  | 'production'
  | 'completed';

interface CreateOrderRequest {
  client_order_reference?: string;
  items: OrderItemRequest[];
  delivery: DeliveryInfo;
  notes?: string;
}

interface OrderItemRequest {
  product_id: number;
  size: string;
  color: string;
  method: MethodCode;
  quantity: number;
  designs: DesignPlacement[];
  notes?: string;
}

interface DeliveryInfo {
  method: 'pickup' | 'delivery';
  requested_date?: string;
  address?: ShippingAddress;
  shipping_cost?: number;
}

interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

interface OrderResponse {
  order_id: number;
  tracking_code: string;
  status: OrderStatus;
  total: number;
  items: OrderItemResponse[];
  created_at: string;
}

interface OrderItemResponse {
  order_item_id: number;
  product_type: string;
  method: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
  description: string;
}

interface OrderDetails {
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

interface OrderItemDetails {
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

interface OrderSummary {
  order_id: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  order_total: number;
  date_created: string;
  date_due: string;
  tracking_code: string;
  item_count: number;
}

// ============================================================================
// Customer Account Types
// ============================================================================

interface CustomerProfile {
  customer_id: number;
  email: string;
  full_name: string;
  company_name: string;
  phone_number: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    zip: string;
  };
  consent: ConsentSettings;
  email_verified: boolean;
  last_login_at: string;
  created_at: string;
}

interface ConsentSettings {
  sms_opt_in: boolean;
  sms_opt_in_date?: string;
  email_marketing_opt_in: boolean;
  email_marketing_opt_in_date?: string;
  whatsapp_consent: boolean;
  whatsapp_consent_date?: string;
}

interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

interface ChangeRequestData {
  change_type: 'modify_items' | 'change_due_date' | 'cancel_order' | 'other';
  description: string;
  contact_method?: 'email' | 'phone' | 'whatsapp';
}

// ============================================================================
// Public Tracking Types
// ============================================================================

interface PublicOrderTracking {
  order_number: string;
  date_created: string;
  date_due: string;
  order_status: OrderStatus;
  artwork_status: ArtworkStatus;
  items: PublicOrderItem[];
}

interface PublicOrderItem {
  product_description: string;
  quantity: number;
  status: ItemStatus;
  status_label: string;
}
```

---

## Appendix A: API Endpoint Quick Reference

### Public Endpoints (No Auth)

| Method | Endpoint                           | Description             |
| ------ | ---------------------------------- | ----------------------- |
| POST   | `/api/auth/register`               | Create customer account |
| POST   | `/api/auth/login`                  | Get JWT tokens          |
| POST   | `/api/auth/refresh`                | Refresh access token    |
| POST   | `/api/auth/logout`                 | Logout                  |
| POST   | `/api/auth/forgot-password`        | Request password reset  |
| POST   | `/api/auth/reset-password`         | Reset password          |
| GET    | `/api/auth/verify-email`           | Verify email            |
| POST   | `/api/auth/resend-verification`    | Resend verification     |
| GET    | `/api/v1/products`                 | List products           |
| GET    | `/api/v1/products/{id}`            | Get product details     |
| POST   | `/api/v1/products/calculate-price` | Calculate price         |
| POST   | `/api/v1/products/validate`        | Validate configuration  |
| GET    | `/api/v1/methods`                  | List methods            |
| GET    | `/api/v1/filters`                  | Get filter options      |
| GET    | `/api/v1/design-sizes`             | Get design sizes        |
| GET    | `/api/v1/orders/track/{code}`      | Track order             |

### Authenticated Endpoints (JWT Required)

| Method | Endpoint                                      | Description          |
| ------ | --------------------------------------------- | -------------------- |
| GET    | `/api/auth/me`                                | Get current customer |
| GET    | `/api/v1/customer/profile`                    | Get profile          |
| PUT    | `/api/v1/customer/profile`                    | Update profile       |
| PUT    | `/api/v1/customer/password`                   | Change password      |
| GET    | `/api/v1/customer/orders`                     | Order history        |
| GET    | `/api/v1/customer/orders/{id}`                | Order details        |
| GET    | `/api/v1/customer/consent`                    | Get consent          |
| PUT    | `/api/v1/customer/consent`                    | Update consent       |
| DELETE | `/api/v1/customer/account`                    | Delete account       |
| POST   | `/api/v1/customer/orders/{id}/request-change` | Request change       |
| POST   | `/api/v1/orders`                              | Create order         |

---

## Appendix B: Environment Variables

```env
# Next.js .env.local
NEXT_PUBLIC_API_URL=https://erp.azteamtech.com

# For development
NEXT_PUBLIC_API_URL=http://localhost/erp
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-28
**API Version**: v1
