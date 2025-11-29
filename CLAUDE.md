# AZTEAM Store - Project Context for Claude Code

## Project Overview

Next.js 14+ e-commerce store for AZTEAM custom apparel with:

- 3D product visualization (React Three Fiber)
- Integration with AZTEAM ERP PHP backend via REST API
- Bilingual support (English + Portuguese)
- Multiple payment options (Stripe, PayPal, pay-later)
- Guest checkout with email

## Key Domains

- **Production Store**: https://azteamonline.com
- **ERP API**: https://erp.azteamtech.com
- **GitHub Repository**: https://github.com/gonoff/az_store

## Tech Stack

| Category       | Technology               |
| -------------- | ------------------------ |
| Framework      | Next.js 14+ (App Router) |
| Language       | TypeScript 5+            |
| Styling        | Tailwind CSS 4+          |
| UI Components  | shadcn/ui                |
| 3D             | React Three Fiber + drei |
| State (Client) | Zustand                  |
| State (Server) | TanStack Query           |
| Forms          | React Hook Form + Zod    |
| i18n           | next-intl                |
| Payments       | Stripe, PayPal           |
| File Upload    | UploadThing              |
| Testing        | Vitest + Playwright      |
| Docs           | Storybook                |

## Brand Colors

- **Primary (Red)**: #E5192B - buttons, links, accents
- **Background**: White (#FFFFFF)
- **Text**: Gray-900 (headings), Gray-600 (body)

## Directory Structure

```
src/
├── app/[locale]/        # i18n route groups
│   ├── (shop)/          # Public shopping pages
│   ├── (auth)/          # Authentication pages
│   ├── (account)/       # Protected account pages
│   └── track/[code]/    # Public order tracking
├── components/
│   ├── ui/              # shadcn components
│   ├── 3d/              # Three.js components
│   ├── cart/            # Cart components
│   ├── checkout/        # Checkout components
│   ├── product/         # Product components
│   └── layout/          # Layout components
├── lib/
│   ├── api/             # API client & hooks
│   ├── auth/            # Auth utilities
│   ├── stores/          # Zustand stores
│   └── utils/           # Utility functions
├── types/               # TypeScript type definitions
└── messages/            # i18n translation files
```

## Key Documentation

- `docs/NEXTJS_STORE_API_REFERENCE.md` - Complete ERP API documentation
- `docs/TECH_STACK.md` - Full technology stack plan

## Security Principles

1. JWT tokens in httpOnly cookies (never localStorage)
2. SameSite=Strict for CSRF protection
3. Zod validation on all forms
4. Server-side revalidation
5. Environment variables never exposed to client

## API Integration Pattern

```typescript
// Use the typed API client
import { apiClient } from '@/lib/api/client';

// Products (public - no auth)
const products = await apiClient.products.list();

// Orders (authenticated)
const order = await apiClient.orders.create(orderData);
```

## Authentication Flow

1. Login via `/api/auth/login` (server route)
2. JWT stored in httpOnly cookie
3. Middleware checks auth on protected routes
4. Auto-refresh via interceptor

## Common Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run typecheck    # TypeScript check
npm run test         # Run Vitest tests
npm run test:e2e     # Run Playwright tests
npm run storybook    # Start Storybook
```

## Environment Variables

### Critical: Client vs Server Environment Variables

**IMPORTANT**: Next.js handles `NEXT_PUBLIC_*` variables differently:

- `NEXT_PUBLIC_*` variables are replaced at **BUILD TIME**
- Non-prefixed variables are read at **RUNTIME**

For API routes that call the ERP backend, **always use `ERP_API_URL`** (server-side):

```typescript
// ❌ WRONG - in API routes, NEXT_PUBLIC_ may have wrong build-time value
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`);

// ✅ CORRECT - use getServerEnv() for runtime values
import { getServerEnv } from '@/lib/env';
const { ERP_API_URL } = getServerEnv();
const response = await fetch(`${ERP_API_URL}/api/auth/login`);
```

### Required Variables

| Variable              | Type        | Purpose                                  |
| --------------------- | ----------- | ---------------------------------------- |
| `ERP_API_URL`         | Server-side | API routes calling ERP backend (runtime) |
| `NEXT_PUBLIC_API_URL` | Client-side | Client components (build-time)           |
| `JWT_COOKIE_NAME`     | Server-side | Cookie name prefix for auth tokens       |

### Configuration Files

- `.env` - Base configuration (committed to repo)
- `.env.local` - Local overrides (never committed)
- See `.env` for all available variables with documentation

## Deployment

- **Target**: Hostinger VPS with Docker + Nginx
- **SSL**: Let's Encrypt via certbot
- **Process**: Docker Compose for container management

## Incremental Implementation Phases

1. Foundation (current) - Project setup, testing, docs
2. Design System - Tailwind config, shadcn/ui, layouts, i18n
3. API Layer - Types, client, React Query
4. Authentication - JWT, protected routes, auth pages
5. Product Catalog - Listing, detail, filters, pricing
6. 3D Visualization - Shirt model, color changing
7. Shopping Cart - Zustand store, persistence
8. Checkout - Multi-step, file upload, guest flow
9. Payments - Stripe, PayPal, pay-later
10. Account - Profile, orders, change requests
11. Public Features - Order tracking, SEO
12. Testing & Quality - Unit, integration, E2E
13. Production - Docker, Nginx, SSL

## Notes for Claude

- Always check `docs/NEXTJS_STORE_API_REFERENCE.md` for API details
- Use TypeScript strict mode - no `any` types
- Follow existing code patterns and conventions
- Run `npm run typecheck` before committing
- All components should have Storybook stories
- Test coverage target: 80%+

### Environment Variables - CRITICAL

- **NEVER hardcode API URLs** - always use environment variables
- **In API routes**: Use `getServerEnv().ERP_API_URL` (runtime)
- **In client components**: Use `clientEnv.NEXT_PUBLIC_API_URL` (build-time)
- **No fallback defaults** for API URLs - require explicit configuration
- **Search for existing patterns** before adding new env vars
- See `docs/phases/PHASE-3-AUTHENTICATION.md` for detailed env var documentation
