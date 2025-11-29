# Phase 7: Checkout Flow

**Status**: ⏳ Pending
**Dependencies**: Phase 6 (Shopping Cart), Phase 3 (Authentication)

## Overview

Multi-step checkout process supporting both authenticated and guest users, with delivery options and order review.

## Goals

- Multi-step checkout form
- Guest checkout with email
- Authenticated checkout with saved info
- Delivery method selection (pickup/delivery)
- Address form with validation
- Order review step
- Design file upload
- Order creation

---

## Step 7.1: Checkout Page Structure

**File**: `src/app/[locale]/(shop)/checkout/page.tsx`

```typescript
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/layout';
import { CheckoutFlow } from '@/components/checkout/CheckoutFlow';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkout' });

  return {
    title: t('title'),
  };
}

export default async function CheckoutPage() {
  const t = await getTranslations('checkout');

  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <CheckoutFlow />
    </Container>
  );
}
```

---

## Step 7.2: Checkout Flow Component

**File**: `src/components/checkout/CheckoutFlow.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useCartStore } from '@/lib/stores/cart';
import { useAuthStore } from '@/lib/stores/auth';
import { useCreateOrder } from '@/hooks/use-orders';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckoutSteps } from './CheckoutSteps';
import { ContactStep } from './steps/ContactStep';
import { DeliveryStep } from './steps/DeliveryStep';
import { DesignUploadStep } from './steps/DesignUploadStep';
import { ReviewStep } from './steps/ReviewStep';
import { OrderSummary } from './OrderSummary';
import type { CheckoutData } from '@/types/checkout';

const STEPS = ['contact', 'delivery', 'designs', 'review'] as const;
type Step = typeof STEPS[number];

export function CheckoutFlow() {
  const t = useTranslations('checkout');
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { isAuthenticated, customer } = useAuthStore();
  const createOrder = useCreateOrder();

  const [currentStep, setCurrentStep] = useState<Step>('contact');
  const [checkoutData, setCheckoutData] = useState<Partial<CheckoutData>>({
    contact: customer ? {
      email: customer.email,
      firstName: customer.full_name.split(' ')[0],
      lastName: customer.full_name.split(' ').slice(1).join(' '),
      phone: '',
    } : undefined,
  });

  // Redirect if cart is empty
  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const stepIndex = STEPS.indexOf(currentStep);

  const handleStepComplete = (step: Step, data: Partial<CheckoutData>) => {
    setCheckoutData((prev) => ({ ...prev, ...data }));

    const nextIndex = stepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = stepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  };

  const handlePlaceOrder = async () => {
    if (!checkoutData.contact || !checkoutData.delivery) return;

    const orderData = {
      client_order_reference: `web-${Date.now()}`,
      items: items.map((item) => ({
        product_id: item.productId,
        size: item.size,
        color: item.color,
        method: item.method,
        quantity: item.quantity,
        designs: item.designs,
        notes: item.notes,
      })),
      delivery: checkoutData.delivery,
      notes: checkoutData.notes,
      guest_email: !isAuthenticated ? checkoutData.contact.email : undefined,
    };

    try {
      const order = await createOrder.mutateAsync(orderData);
      clearCart();
      router.push(`/checkout/success?order=${order.tracking_code}`);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'contact':
        return (
          <ContactStep
            initialData={checkoutData.contact}
            isAuthenticated={isAuthenticated}
            onComplete={(data) => handleStepComplete('contact', { contact: data })}
          />
        );
      case 'delivery':
        return (
          <DeliveryStep
            initialData={checkoutData.delivery}
            onComplete={(data) => handleStepComplete('delivery', { delivery: data })}
            onBack={handleBack}
          />
        );
      case 'designs':
        return (
          <DesignUploadStep
            items={items}
            initialFiles={checkoutData.designFiles}
            onComplete={(files) => handleStepComplete('designs', { designFiles: files })}
            onBack={handleBack}
          />
        );
      case 'review':
        return (
          <ReviewStep
            checkoutData={checkoutData as CheckoutData}
            items={items}
            onPlaceOrder={handlePlaceOrder}
            onBack={handleBack}
            isLoading={createOrder.isPending}
            error={createOrder.error?.message}
          />
        );
    }
  };

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <CheckoutSteps steps={STEPS} currentStep={currentStep} />
        <Card className="mt-6">
          <CardContent className="p-6">
            {renderStep()}
          </CardContent>
        </Card>
      </div>

      <div>
        <OrderSummary items={items} />
      </div>
    </div>
  );
}
```

---

## Step 7.3: Checkout Steps Indicator

**File**: `src/components/checkout/CheckoutSteps.tsx`

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutStepsProps {
  steps: readonly string[];
  currentStep: string;
}

export function CheckoutSteps({ steps, currentStep }: CheckoutStepsProps) {
  const t = useTranslations('checkout.steps');
  const currentIndex = steps.indexOf(currentStep);

  return (
    <nav aria-label="Checkout progress">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary text-primary',
                    !isCompleted && !isCurrent && 'border-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-sm',
                    isCurrent && 'font-medium text-foreground',
                    !isCurrent && 'text-muted-foreground'
                  )}
                >
                  {t(step)}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-4 h-0.5 w-16 sm:w-24',
                    index < currentIndex ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

---

## Step 7.4: Contact Step

**File**: `src/components/checkout/steps/ContactStep.tsx`

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Link } from '@/i18n/navigation';

const contactSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

type ContactData = z.infer<typeof contactSchema>;

interface ContactStepProps {
  initialData?: ContactData;
  isAuthenticated: boolean;
  onComplete: (data: ContactData) => void;
}

export function ContactStep({ initialData, isAuthenticated, onComplete }: ContactStepProps) {
  const t = useTranslations('checkout.shipping');

  const form = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: initialData || {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    onComplete(data);
  });

  return (
    <div className="space-y-6">
      {!isAuthenticated && (
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm">
            Already have an account?{' '}
            <Link href="/login?redirect=/checkout" className="text-primary hover:underline">
              Log in
            </Link>{' '}
            for faster checkout.
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email')}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    disabled={isAuthenticated}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('firstName')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lastName')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('phone')} (optional)</FormLabel>
                <FormControl>
                  <Input type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-4">
            <Button type="submit">Continue to Delivery</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
```

---

## Step 7.5: Delivery Step

**File**: `src/components/checkout/steps/DeliveryStep.tsx`

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Store } from 'lucide-react';

const deliverySchema = z.object({
  method: z.enum(['pickup', 'delivery']),
  requestedDate: z.string().optional(),
  address: z.object({
    line1: z.string().min(1, 'Address is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zip: z.string().min(1, 'ZIP code is required'),
  }).optional(),
}).refine((data) => {
  if (data.method === 'delivery' && !data.address) {
    return false;
  }
  return true;
}, { message: 'Address is required for delivery' });

type DeliveryData = z.infer<typeof deliverySchema>;

interface DeliveryStepProps {
  initialData?: DeliveryData;
  onComplete: (data: DeliveryData) => void;
  onBack: () => void;
}

export function DeliveryStep({ initialData, onComplete, onBack }: DeliveryStepProps) {
  const t = useTranslations('checkout.shipping');

  const form = useForm<DeliveryData>({
    resolver: zodResolver(deliverySchema),
    defaultValues: initialData || {
      method: 'pickup',
    },
  });

  const deliveryMethod = form.watch('method');

  const handleSubmit = form.handleSubmit((data) => {
    onComplete(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Method</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  <Label htmlFor="pickup" className="cursor-pointer">
                    <Card className={field.value === 'pickup' ? 'border-primary' : ''}>
                      <CardContent className="flex items-center gap-4 p-4">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <Store className="h-6 w-6" />
                        <div>
                          <p className="font-medium">Store Pickup</p>
                          <p className="text-sm text-muted-foreground">Free</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Label>

                  <Label htmlFor="delivery" className="cursor-pointer">
                    <Card className={field.value === 'delivery' ? 'border-primary' : ''}>
                      <CardContent className="flex items-center gap-4 p-4">
                        <RadioGroupItem value="delivery" id="delivery" />
                        <MapPin className="h-6 w-6" />
                        <div>
                          <p className="font-medium">Delivery</p>
                          <p className="text-sm text-muted-foreground">Calculated at checkout</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Label>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {deliveryMethod === 'delivery' && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="address.line1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('address')}</FormLabel>
                  <FormControl>
                    <Input placeholder="Street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.line2"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Apartment, suite, etc. (optional)" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('city')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('state')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('zipCode')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Continue to Designs</Button>
        </div>
      </form>
    </Form>
  );
}
```

---

## Step 7.6: Design Upload Step

**File**: `src/components/checkout/steps/DesignUploadStep.tsx`

(Optional step for uploading artwork files)

---

## Step 7.7: Review Step

**File**: `src/components/checkout/steps/ReviewStep.tsx`

---

## Step 7.8: Order Summary Component

**File**: `src/components/checkout/OrderSummary.tsx`

---

## Step 7.9: Success Page

**File**: `src/app/[locale]/(shop)/checkout/success/page.tsx`

```typescript
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/layout';
import { OrderConfirmation } from '@/components/checkout/OrderConfirmation';

export async function generateMetadata() {
  return { title: 'Order Confirmed' };
}

export default async function CheckoutSuccessPage() {
  return (
    <Container className="py-16">
      <Suspense fallback={<div>Loading...</div>}>
        <OrderConfirmation />
      </Suspense>
    </Container>
  );
}
```

---

## Step 7.10: Checkout Types

**File**: `src/types/checkout.ts`

```typescript
import type { DesignPlacement, MethodCode } from './api';

export interface ContactData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface DeliveryData {
  method: 'pickup' | 'delivery';
  requestedDate?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface DesignFile {
  itemId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface CheckoutData {
  contact: ContactData;
  delivery: DeliveryData;
  designFiles?: DesignFile[];
  notes?: string;
}
```

---

## Deliverables Checklist

- [ ] Checkout flow component
- [ ] Checkout steps indicator
- [ ] Contact step (guest/auth)
- [ ] Delivery step (pickup/delivery)
- [ ] Address form
- [ ] Design upload step (optional)
- [ ] Review step
- [ ] Order summary sidebar
- [ ] Order creation mutation
- [ ] Success page
- [ ] Order confirmation component
- [ ] Checkout types
- [ ] Form validation
- [ ] Error handling
- [ ] Loading states

---

## Files to Create

| File                                                 | Purpose                 |
| ---------------------------------------------------- | ----------------------- |
| `src/app/[locale]/(shop)/checkout/page.tsx`          | Checkout page           |
| `src/app/[locale]/(shop)/checkout/success/page.tsx`  | Success page            |
| `src/components/checkout/CheckoutFlow.tsx`           | Main checkout component |
| `src/components/checkout/CheckoutSteps.tsx`          | Step indicator          |
| `src/components/checkout/OrderSummary.tsx`           | Order summary           |
| `src/components/checkout/OrderConfirmation.tsx`      | Success display         |
| `src/components/checkout/steps/ContactStep.tsx`      | Contact form            |
| `src/components/checkout/steps/DeliveryStep.tsx`     | Delivery form           |
| `src/components/checkout/steps/DesignUploadStep.tsx` | File upload             |
| `src/components/checkout/steps/ReviewStep.tsx`       | Order review            |
| `src/components/checkout/index.ts`                   | Barrel exports          |
| `src/types/checkout.ts`                              | Checkout types          |
| `src/hooks/use-orders.ts`                            | Order mutations         |

---

## Next Phase

→ **Phase 8: Payment Integration**
