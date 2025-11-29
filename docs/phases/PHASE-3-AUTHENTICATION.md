# Phase 3: Authentication System

**Status**: ⏳ Pending
**Dependencies**: Phase 2 (API Layer)

## Overview

Implement JWT-based authentication with httpOnly cookies, protected routes, and session management.

## Goals

- Secure token storage with httpOnly cookies
- Login/Register/Logout flows
- Password reset functionality
- Protected route middleware
- Auth state management
- Token refresh mechanism

---

## Step 3.1: Auth Architecture

### Token Flow

```
1. User logs in → API returns access_token + refresh_token
2. Next.js API route stores tokens in httpOnly cookies
3. Middleware checks auth on protected routes
4. API client includes cookies automatically
5. Token refresh via API route when expired
```

### Security Considerations

- httpOnly cookies prevent XSS attacks
- SameSite=Strict prevents CSRF
- Tokens never exposed to JavaScript
- Secure flag for HTTPS only

---

## Step 3.2: API Routes for Auth

**File**: `src/app/api/auth/login/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (data.success) {
    const cookieStore = await cookies();

    // Store access token
    cookieStore.set('access_token', data.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: data.data.expires_in,
      path: '/',
    });

    // Store refresh token
    cookieStore.set('refresh_token', data.data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    // Return customer data (not tokens)
    return NextResponse.json({
      success: true,
      data: { customer: data.data.customer },
    });
  }

  return NextResponse.json(data, { status: response.status });
}
```

**File**: `src/app/api/auth/logout/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');

  return NextResponse.json({ success: true });
}
```

**File**: `src/app/api/auth/refresh/route.ts`

**File**: `src/app/api/auth/me/route.ts`

---

## Step 3.3: Auth Middleware

**File**: `src/middleware.ts` (update)

```typescript
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Routes that require authentication
const protectedRoutes = ['/account', '/orders', '/profile'];

// Routes that should redirect if authenticated
const authRoutes = ['/login', '/register'];

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accessToken = request.cookies.get('access_token')?.value;

  // Extract locale from path
  const locale = pathname.split('/')[1];
  const pathWithoutLocale = pathname.replace(`/${locale}`, '');

  // Check if protected route
  const isProtectedRoute = protectedRoutes.some((route) => pathWithoutLocale.startsWith(route));

  // Check if auth route
  const isAuthRoute = authRoutes.some((route) => pathWithoutLocale.startsWith(route));

  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next|api|_vercel|.*\\..*).*)'],
};
```

---

## Step 3.4: Auth Store (Zustand)

**File**: `src/lib/stores/auth.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CustomerInfo } from '@/types/api';

interface AuthState {
  customer: CustomerInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setCustomer: (customer: CustomerInfo | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      customer: null,
      isAuthenticated: false,
      isLoading: true,

      setCustomer: (customer) =>
        set({
          customer,
          isAuthenticated: !!customer,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          customer: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ customer: state.customer }),
    }
  )
);
```

---

## Step 3.5: Auth Hooks

**File**: `src/hooks/use-auth.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import type { LoginResponse, RegisterRequest } from '@/types/api';

export function useLogin() {
  const router = useRouter();
  const setCustomer = useAuthStore((state) => state.setCustomer);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      setCustomer(data.data.customer);
      queryClient.invalidateQueries();
      router.push('/');
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
      router.push('/');
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      router.push('/login?registered=true');
    },
  });
}

export function useCurrentUser() {
  const setCustomer = useAuthStore((state) => state.setCustomer);
  const setLoading = useAuthStore((state) => state.setLoading);

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.success) {
        setCustomer(data.data);
        return data.data;
      }

      setCustomer(null);
      return null;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return response.json();
    },
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      router.push('/login?reset=true');
    },
  });
}
```

---

## Step 3.6: Auth Pages

### Login Page

**File**: `src/app/[locale]/(auth)/login/page.tsx`

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from '@/i18n/navigation';
import { useLogin } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Container } from '@/components/layout';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const login = useLogin();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = form.handleSubmit((data) => {
    login.mutate(data);
  });

  return (
    <Container className="max-w-md py-16">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <Form {...form}>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email')}</FormLabel>
                <Input type="email" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('password')}</FormLabel>
                <Input type="password" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          {login.error && (
            <p className="text-sm text-destructive">{login.error.message}</p>
          )}

          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? 'Loading...' : t('submit')}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm">
        <Link href="/forgot-password" className="text-primary hover:underline">
          {t('forgotPassword')}
        </Link>
      </div>

      <div className="mt-4 text-center text-sm">
        {t('noAccount')}{' '}
        <Link href="/register" className="text-primary hover:underline">
          {t('signUp')}
        </Link>
      </div>
    </Container>
  );
}
```

### Register Page

**File**: `src/app/[locale]/(auth)/register/page.tsx`

### Forgot Password Page

**File**: `src/app/[locale]/(auth)/forgot-password/page.tsx`

### Reset Password Page

**File**: `src/app/[locale]/(auth)/reset-password/page.tsx`

### Verify Email Page

**File**: `src/app/[locale]/(auth)/verify-email/page.tsx`

---

## Step 3.7: Auth Provider Component

**File**: `src/components/providers/AuthProvider.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useCurrentUser } from '@/hooks/use-auth';
import { useAuthStore } from '@/lib/stores/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoading } = useCurrentUser();
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  return <>{children}</>;
}
```

---

## Step 3.8: Protected Route Component

**File**: `src/components/auth/ProtectedRoute.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { Skeleton } from '@/components/ui/skeleton';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

---

## Step 3.9: Update Header with Auth State

**File**: `src/components/layout/Header.tsx` (update)

Add user menu with authenticated state:

- Show user name/avatar when logged in
- Show logout option
- Show orders link
- Show login/register when logged out

---

## Deliverables Checklist

- [ ] API route: POST /api/auth/login
- [ ] API route: POST /api/auth/logout
- [ ] API route: POST /api/auth/refresh
- [ ] API route: GET /api/auth/me
- [ ] API route: POST /api/auth/register
- [ ] API route: POST /api/auth/forgot-password
- [ ] API route: POST /api/auth/reset-password
- [ ] Middleware with protected routes
- [ ] Auth Zustand store
- [ ] useLogin hook
- [ ] useLogout hook
- [ ] useRegister hook
- [ ] useCurrentUser hook
- [ ] useForgotPassword hook
- [ ] useResetPassword hook
- [ ] Login page
- [ ] Register page
- [ ] Forgot password page
- [ ] Reset password page
- [ ] Verify email page
- [ ] AuthProvider component
- [ ] ProtectedRoute component
- [ ] Header auth state integration
- [ ] Form validation with Zod
- [ ] Error handling for auth flows

---

## Files to Create

| File                                               | Purpose                 |
| -------------------------------------------------- | ----------------------- |
| `src/app/api/auth/login/route.ts`                  | Login API route         |
| `src/app/api/auth/logout/route.ts`                 | Logout API route        |
| `src/app/api/auth/refresh/route.ts`                | Token refresh route     |
| `src/app/api/auth/me/route.ts`                     | Current user route      |
| `src/app/api/auth/register/route.ts`               | Registration proxy      |
| `src/app/api/auth/forgot-password/route.ts`        | Password reset request  |
| `src/app/api/auth/reset-password/route.ts`         | Password reset          |
| `src/lib/stores/auth.ts`                           | Auth Zustand store      |
| `src/hooks/use-auth.ts`                            | Auth hooks              |
| `src/app/[locale]/(auth)/login/page.tsx`           | Login page              |
| `src/app/[locale]/(auth)/register/page.tsx`        | Register page           |
| `src/app/[locale]/(auth)/forgot-password/page.tsx` | Forgot password         |
| `src/app/[locale]/(auth)/reset-password/page.tsx`  | Reset password          |
| `src/app/[locale]/(auth)/verify-email/page.tsx`    | Email verification      |
| `src/app/[locale]/(auth)/layout.tsx`               | Auth pages layout       |
| `src/components/providers/AuthProvider.tsx`        | Auth provider           |
| `src/components/auth/ProtectedRoute.tsx`           | Protected route wrapper |

---

## Next Phase

→ **Phase 4: Product Catalog**
