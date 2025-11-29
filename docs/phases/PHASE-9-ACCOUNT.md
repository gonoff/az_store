# Phase 9: Account Management

**Status**: ⏳ Pending
**Dependencies**: Phase 3 (Authentication), Phase 7 (Checkout)

## Overview

Customer account pages for profile management, order history, and preferences.

## Goals

- Profile page with editable info
- Order history with filtering
- Order detail view
- Password change
- Communication preferences
- Account deletion (GDPR)

---

## Step 9.1: Account Layout

**File**: `src/app/[locale]/(account)/layout.tsx`

```typescript
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/layout';
import { AccountSidebar } from '@/components/account/AccountSidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <Container className="py-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <AccountSidebar />
          <main>{children}</main>
        </div>
      </Container>
    </ProtectedRoute>
  );
}
```

---

## Step 9.2: Account Sidebar

**File**: `src/components/account/AccountSidebar.tsx`

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { User, Package, Settings, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/use-auth';

const navItems = [
  { href: '/account', icon: User, labelKey: 'profile' },
  { href: '/account/orders', icon: Package, labelKey: 'orders' },
  { href: '/account/settings', icon: Settings, labelKey: 'settings' },
  { href: '/account/privacy', icon: Shield, labelKey: 'privacy' },
];

export function AccountSidebar() {
  const t = useTranslations('account.nav');
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <aside className="space-y-2">
      <h2 className="mb-4 text-lg font-semibold">{t('title')}</h2>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={() => logout.mutate()}
        >
          <LogOut className="h-4 w-4" />
          {t('logout')}
        </Button>
      </div>
    </aside>
  );
}
```

---

## Step 9.3: Profile Page

**File**: `src/app/[locale]/(account)/account/page.tsx`

```typescript
import { getTranslations } from 'next-intl/server';
import { ProfileForm } from '@/components/account/ProfileForm';

export async function generateMetadata() {
  return { title: 'My Profile' };
}

export default async function ProfilePage() {
  const t = await getTranslations('account.profile');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <ProfileForm />
    </div>
  );
}
```

---

## Step 9.4: Profile Form Component

**File**: `src/components/account/ProfileForm.tsx`

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useCustomerProfile, useUpdateProfile } from '@/hooks/use-customer';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  company_name: z.string().optional(),
  phone_number: z.string().optional(),
  address_line_1: z.string().optional(),
  address_line_2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const t = useTranslations('account.profile');
  const { data: profile, isLoading } = useCustomerProfile();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: profile ? {
      full_name: profile.full_name,
      company_name: profile.company_name || '',
      phone_number: profile.phone_number || '',
      address_line_1: profile.address?.line1 || '',
      address_line_2: profile.address?.line2 || '',
      city: profile.address?.city || '',
      state: profile.address?.state || '',
      zip_code: profile.address?.zip || '',
    } : undefined,
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateProfile.mutateAsync(data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  });

  if (isLoading) {
    return <ProfileFormSkeleton />;
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                Email: <span className="font-medium text-foreground">{profile?.email}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="address_line_1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1</FormLabel>
                  <FormControl>
                    <Input placeholder="Street address" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address_line_2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2</FormLabel>
                  <FormControl>
                    <Input placeholder="Apt, suite, etc." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zip_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function ProfileFormSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Step 9.5: Orders Page

**File**: `src/app/[locale]/(account)/account/orders/page.tsx`

```typescript
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { OrderList } from '@/components/account/OrderList';
import { Skeleton } from '@/components/ui/skeleton';

export async function generateMetadata() {
  return { title: 'My Orders' };
}

export default async function OrdersPage() {
  const t = await getTranslations('account.orders');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Suspense fallback={<OrderListSkeleton />}>
        <OrderList />
      </Suspense>
    </div>
  );
}

function OrderListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}
```

---

## Step 9.6: Order List Component

**File**: `src/components/account/OrderList.tsx`

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCustomerOrders } from '@/hooks/use-customer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function OrderList() {
  const t = useTranslations('account.orders');
  const { data, isLoading } = useCustomerOrders();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const orders = data?.orders || [];

  if (orders.length === 0) {
    return (
      <div className="py-12 text-center">
        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
        <p className="mt-2 text-muted-foreground">
          When you place an order, it will appear here.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.order_id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">Order #{order.order_id}</span>
                  <Badge className={statusColors[order.order_status]}>
                    {order.order_status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(order.date_created)} • {order.item_count} items
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold">${order.order_total.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.payment_status}
                  </p>
                </div>

                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/account/orders/${order.order_id}`}>
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## Step 9.7: Order Detail Page

**File**: `src/app/[locale]/(account)/account/orders/[id]/page.tsx`

---

## Step 9.8: Settings Page

**File**: `src/app/[locale]/(account)/account/settings/page.tsx`

(Password change, notification preferences)

---

## Step 9.9: Privacy Page

**File**: `src/app/[locale]/(account)/account/privacy/page.tsx`

(Consent settings, account deletion)

---

## Step 9.10: Customer Hooks

**File**: `src/hooks/use-customer.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/lib/api/customer';
import { queryKeys } from '@/lib/query/keys';

export function useCustomerProfile() {
  return useQuery({
    queryKey: queryKeys.customer.profile,
    queryFn: customerApi.getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.profile });
    },
  });
}

export function useCustomerOrders(page = 1) {
  return useQuery({
    queryKey: queryKeys.orders.list(page),
    queryFn: () => customerApi.getOrders({ page }),
  });
}

export function useOrderDetails(id: number) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => customerApi.getOrder(id),
    enabled: !!id,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: customerApi.changePassword,
  });
}

export function useUpdateConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerApi.updateConsent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.consent });
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: customerApi.deleteAccount,
  });
}
```

---

## Deliverables Checklist

- [ ] Account layout with sidebar
- [ ] Account sidebar navigation
- [ ] Profile page
- [ ] Profile form component
- [ ] Orders list page
- [ ] Order list component
- [ ] Order detail page
- [ ] Settings page
- [ ] Password change form
- [ ] Privacy/consent page
- [ ] Account deletion
- [ ] Customer API service
- [ ] Customer hooks
- [ ] Loading states
- [ ] Error handling

---

## Files to Create

| File                                                      | Purpose          |
| --------------------------------------------------------- | ---------------- |
| `src/app/[locale]/(account)/layout.tsx`                   | Account layout   |
| `src/app/[locale]/(account)/account/page.tsx`             | Profile page     |
| `src/app/[locale]/(account)/account/orders/page.tsx`      | Orders page      |
| `src/app/[locale]/(account)/account/orders/[id]/page.tsx` | Order detail     |
| `src/app/[locale]/(account)/account/settings/page.tsx`    | Settings page    |
| `src/app/[locale]/(account)/account/privacy/page.tsx`     | Privacy page     |
| `src/components/account/AccountSidebar.tsx`               | Sidebar nav      |
| `src/components/account/ProfileForm.tsx`                  | Profile form     |
| `src/components/account/OrderList.tsx`                    | Order list       |
| `src/components/account/OrderDetail.tsx`                  | Order detail     |
| `src/components/account/PasswordForm.tsx`                 | Password change  |
| `src/components/account/ConsentForm.tsx`                  | Consent settings |
| `src/components/account/DeleteAccount.tsx`                | Account deletion |
| `src/lib/api/customer.ts`                                 | Customer API     |
| `src/hooks/use-customer.ts`                               | Customer hooks   |

---

## Next Phase

→ **Phase 10: Public Features & SEO**
