# Phase 2: API Layer & Types

**Status**: ✅ Completed
**Dependencies**: Phase 1 (Design System)

## Overview

Build type-safe API integration layer with TanStack Query for server state management.

## Goals

- Create TypeScript types for all API entities
- Build API client with axios/ky
- Setup TanStack Query for caching and mutations
- Create custom hooks for data fetching
- Implement error handling patterns

---

## Step 2.1: Install Dependencies

```bash
npm install @tanstack/react-query axios
npm install -D @tanstack/react-query-devtools
```

---

## Step 2.2: TypeScript Types

**File**: `src/types/api.ts`

Based on ERP API documentation, create types for:

### Response Types

```typescript
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
```

### Product Types

```typescript
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
```

### Order Types

```typescript
type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
type PaymentStatus = 'unpaid' | 'partial' | 'paid';

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

interface DesignPlacement {
  area: PlacementArea;
  design_size: DesignSizeCode;
}
```

### Auth Types

```typescript
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
```

---

## Step 2.3: API Client

**File**: `src/lib/api/client.ts`

```typescript
import axios, { AxiosError, AxiosInstance } from 'axios';
import { env } from '@/lib/env';

const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For httpOnly cookies
});

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  // Token added via httpOnly cookie, no manual header needed
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle token refresh or redirect to login
    }
    return Promise.reject(error);
  }
);
```

---

## Step 2.4: API Service Functions

### Products API

**File**: `src/lib/api/products.ts`

```typescript
import { apiClient } from './client';
import type {
  Product,
  ProductDetails,
  CustomizationMethod,
  PriceCalculationRequest,
  PricingBreakdown,
} from '@/types/api';

export const productsApi = {
  list: async (filters?: { type?: string; material?: string; gender?: string }) => {
    const { data } = await apiClient.get('/api/v1/products', { params: filters });
    return data.data as Record<string, Product[]>;
  },

  get: async (id: number) => {
    const { data } = await apiClient.get(`/api/v1/products/${id}`);
    return data.data as ProductDetails;
  },

  calculatePrice: async (request: PriceCalculationRequest) => {
    const { data } = await apiClient.post('/api/v1/products/calculate-price', request);
    return data.pricing as PricingBreakdown;
  },

  getMethods: async () => {
    const { data } = await apiClient.get('/api/v1/methods');
    return data.data as CustomizationMethod[];
  },

  getFilters: async () => {
    const { data } = await apiClient.get('/api/v1/filters');
    return data.data;
  },
};
```

### Auth API

**File**: `src/lib/api/auth.ts`

### Orders API

**File**: `src/lib/api/orders.ts`

### Customer API

**File**: `src/lib/api/customer.ts`

---

## Step 2.5: TanStack Query Setup

**File**: `src/lib/query/provider.tsx`

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**File**: `src/lib/query/keys.ts`

```typescript
export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (filters?: Record<string, string>) => ['products', 'list', filters] as const,
    detail: (id: number) => ['products', 'detail', id] as const,
  },
  methods: ['methods'] as const,
  filters: ['filters'] as const,
  orders: {
    all: ['orders'] as const,
    list: (page?: number) => ['orders', 'list', page] as const,
    detail: (id: number) => ['orders', 'detail', id] as const,
    track: (code: string) => ['orders', 'track', code] as const,
  },
  customer: {
    profile: ['customer', 'profile'] as const,
    consent: ['customer', 'consent'] as const,
  },
};
```

---

## Step 2.6: Custom Query Hooks

**File**: `src/hooks/use-products.ts`

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products';
import { queryKeys } from '@/lib/query/keys';
import type { PriceCalculationRequest } from '@/types/api';

export function useProducts(filters?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => productsApi.list(filters),
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productsApi.get(id),
    enabled: !!id,
  });
}

export function useMethods() {
  return useQuery({
    queryKey: queryKeys.methods,
    queryFn: productsApi.getMethods,
    staleTime: Infinity, // Methods rarely change
  });
}

export function useCalculatePrice() {
  return useMutation({
    mutationFn: (request: PriceCalculationRequest) => productsApi.calculatePrice(request),
  });
}
```

**File**: `src/hooks/use-orders.ts`

**File**: `src/hooks/use-auth.ts`

**File**: `src/hooks/use-customer.ts`

---

## Step 2.7: Error Handling

**File**: `src/lib/api/errors.ts`

```typescript
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

export class ValidationError extends ApiError {
  constructor(message: string, details: Record<string, string>) {
    super(message, 422, details);
    this.name = 'ValidationError';
  }
}

export function handleApiError(error: unknown): never {
  if (error instanceof ApiError) {
    throw error;
  }

  // Handle axios errors
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    const status = error.response?.status || 500;

    if (status === 422 && data?.details) {
      throw new ValidationError(data.error || 'Validation failed', data.details);
    }

    throw new ApiError(data?.error || 'An unexpected error occurred', status, data?.details);
  }

  throw new ApiError('An unexpected error occurred', 500);
}
```

---

## Step 2.8: Add Provider to Layout

**File**: `src/app/[locale]/layout.tsx` (update)

```typescript
import { QueryProvider } from '@/lib/query/provider';

export default async function LocaleLayout({ children, params }) {
  // ... existing code

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <MainLayout locale={locale}>{children}</MainLayout>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

---

## Deliverables Checklist

- [ ] TypeScript types for all API entities
- [ ] API client with axios configured
- [ ] Products API service
- [ ] Auth API service
- [ ] Orders API service
- [ ] Customer API service
- [ ] TanStack Query provider
- [ ] Query key factory
- [ ] useProducts hook
- [ ] useProduct hook
- [ ] useMethods hook
- [ ] useCalculatePrice hook
- [ ] useOrders hooks
- [ ] useAuth hooks
- [ ] useCustomer hooks
- [ ] Error handling utilities
- [ ] Query provider in layout

---

## Files to Create

| File                         | Purpose                    |
| ---------------------------- | -------------------------- |
| `src/types/api.ts`           | All API TypeScript types   |
| `src/types/index.ts`         | Type barrel exports        |
| `src/lib/api/client.ts`      | Axios client configuration |
| `src/lib/api/products.ts`    | Products API service       |
| `src/lib/api/auth.ts`        | Auth API service           |
| `src/lib/api/orders.ts`      | Orders API service         |
| `src/lib/api/customer.ts`    | Customer API service       |
| `src/lib/api/errors.ts`      | Error handling utilities   |
| `src/lib/api/index.ts`       | API barrel exports         |
| `src/lib/query/provider.tsx` | TanStack Query provider    |
| `src/lib/query/keys.ts`      | Query key factory          |
| `src/hooks/use-products.ts`  | Product query hooks        |
| `src/hooks/use-orders.ts`    | Order query hooks          |
| `src/hooks/use-auth.ts`      | Auth query hooks           |
| `src/hooks/use-customer.ts`  | Customer query hooks       |

---

## Next Phase

→ **Phase 3: Authentication System**
