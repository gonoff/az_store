# Phase 8: Payment Integration

**Status**: ⏳ Pending
**Dependencies**: Phase 7 (Checkout Flow)

## Overview

Integrate multiple payment options: Stripe, PayPal, and Pay Later (invoice).

## Goals

- Stripe Checkout integration
- PayPal integration
- Pay Later option for business accounts
- Payment webhooks
- Order status updates
- Payment confirmation

---

## Step 8.1: Install Dependencies

```bash
npm install @stripe/stripe-js stripe
npm install @paypal/react-paypal-js
```

---

## Step 8.2: Stripe Configuration

**File**: `src/lib/stripe.ts`

```typescript
import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Client-side Stripe promise
let stripePromise: Promise<typeof import('@stripe/stripe-js').Stripe | null>;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
}
```

---

## Step 8.3: Environment Variables

**File**: `.env.example` (update)

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

---

## Step 8.4: Create Checkout Session API

**File**: `src/app/api/checkout/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, items, email, successUrl, cancelUrl } = body;

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.productName,
          description: `${item.size} / ${item.color} - ${item.method.toUpperCase()}`,
          metadata: {
            productId: item.productId,
            size: item.size,
            color: item.color,
            method: item.method,
          },
        },
        unit_amount: Math.round(item.unitPrice * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }));

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId: orderId.toString(),
      },
      payment_intent_data: {
        metadata: {
          orderId: orderId.toString(),
        },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
```

---

## Step 8.5: Stripe Webhook Handler

**File**: `src/app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          // Update order payment status in ERP
          await updateOrderPaymentStatus(orderId, 'paid', {
            stripeSessionId: session.id,
            paymentIntentId: session.payment_intent,
            amountPaid: session.amount_total ? session.amount_total / 100 : 0,
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          // Log failed payment attempt
          console.error(`Payment failed for order ${orderId}`);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function updateOrderPaymentStatus(
  orderId: string,
  status: string,
  details: Record<string, any>
) {
  // Call ERP API to update payment status
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${orderId}/payment`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...details }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to update order payment status');
  }
}
```

---

## Step 8.6: PayPal Provider

**File**: `src/components/providers/PayPalProvider.tsx`

```typescript
'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const initialOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  currency: 'USD',
  intent: 'capture',
};

export function PayPalProvider({ children }: { children: React.ReactNode }) {
  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  );
}
```

---

## Step 8.7: Payment Options Component

**File**: `src/components/checkout/PaymentOptions.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Wallet, FileText } from 'lucide-react';

type PaymentMethod = 'stripe' | 'paypal' | 'pay_later';

interface PaymentOptionsProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  allowPayLater?: boolean;
}

export function PaymentOptions({
  selected,
  onSelect,
  allowPayLater = false,
}: PaymentOptionsProps) {
  const t = useTranslations('checkout.payment');

  const options = [
    {
      id: 'stripe' as const,
      icon: CreditCard,
      title: t('card'),
      description: 'Visa, Mastercard, American Express',
    },
    {
      id: 'paypal' as const,
      icon: Wallet,
      title: 'PayPal',
      description: 'Pay with your PayPal account',
    },
    ...(allowPayLater
      ? [
          {
            id: 'pay_later' as const,
            icon: FileText,
            title: t('payLater'),
            description: 'Invoice sent after order completion',
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">{t('title')}</h3>

      <RadioGroup
        value={selected}
        onValueChange={(value) => onSelect(value as PaymentMethod)}
        className="space-y-3"
      >
        {options.map((option) => (
          <Label
            key={option.id}
            htmlFor={option.id}
            className="cursor-pointer"
          >
            <Card className={selected === option.id ? 'border-primary' : ''}>
              <CardContent className="flex items-center gap-4 p-4">
                <RadioGroupItem value={option.id} id={option.id} />
                <option.icon className="h-6 w-6" />
                <div>
                  <p className="font-medium">{option.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}
```

---

## Step 8.8: Stripe Payment Component

**File**: `src/components/checkout/StripePayment.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getStripe } from '@/lib/stripe';
import type { CartItem } from '@/lib/stores/cart';

interface StripePaymentProps {
  orderId: number;
  items: CartItem[];
  email: string;
  total: number;
}

export function StripePayment({ orderId, items, email, total }: StripePaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      // Create checkout session
      const response = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          items,
          email,
          successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout?cancelled=true`,
        }),
      });

      const { sessionId, url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        const stripe = await getStripe();
        await stripe?.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        `Pay $${total.toFixed(2)} with Card`
      )}
    </Button>
  );
}
```

---

## Step 8.9: PayPal Payment Component

**File**: `src/components/checkout/PayPalPayment.tsx`

```typescript
'use client';

import { PayPalButtons } from '@paypal/react-paypal-js';
import { useRouter } from '@/i18n/navigation';
import type { CartItem } from '@/lib/stores/cart';

interface PayPalPaymentProps {
  orderId: number;
  items: CartItem[];
  total: number;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

export function PayPalPayment({
  orderId,
  items,
  total,
  onSuccess,
  onError,
}: PayPalPaymentProps) {
  return (
    <PayPalButtons
      style={{ layout: 'vertical' }}
      createOrder={(data, actions) => {
        return actions.order.create({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'USD',
                value: total.toFixed(2),
              },
              description: `AZTEAM Order #${orderId}`,
              custom_id: orderId.toString(),
            },
          ],
        });
      }}
      onApprove={async (data, actions) => {
        const order = await actions.order?.capture();

        // Update order payment status
        await fetch('/api/checkout/paypal/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            paypalOrderId: data.orderID,
            captureId: order?.id,
          }),
        });

        onSuccess();
      }}
      onError={(err) => {
        console.error('PayPal error:', err);
        onError(new Error('PayPal payment failed'));
      }}
    />
  );
}
```

---

## Step 8.10: PayPal Capture API

**File**: `src/app/api/checkout/paypal/capture/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { orderId, paypalOrderId, captureId } = await request.json();

    // Update order payment status in ERP
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${orderId}/payment`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'paid',
          paymentMethod: 'paypal',
          paypalOrderId,
          captureId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update order');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PayPal capture error:', error);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}
```

---

## Step 8.11: Pay Later Component

**File**: `src/components/checkout/PayLaterOption.tsx`

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FileText, Info } from 'lucide-react';

interface PayLaterOptionProps {
  orderId: number;
  total: number;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function PayLaterOption({
  orderId,
  total,
  onConfirm,
  isLoading,
}: PayLaterOptionProps) {
  const t = useTranslations('checkout.payment');

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Your order will be processed and an invoice will be sent to your email.
          Payment is due within 30 days of order completion.
        </AlertDescription>
      </Alert>

      <div className="rounded-lg bg-muted p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span className="font-medium">Invoice Total</span>
          </div>
          <span className="text-lg font-bold">${total.toFixed(2)}</span>
        </div>
      </div>

      <Button
        onClick={onConfirm}
        disabled={isLoading}
        className="w-full"
        size="lg"
      >
        Confirm Order (Pay Later)
      </Button>
    </div>
  );
}
```

---

## Deliverables Checklist

- [ ] Stripe library configuration
- [ ] Environment variables for payments
- [ ] Stripe Checkout session API
- [ ] Stripe webhook handler
- [ ] PayPal provider component
- [ ] Payment options component
- [ ] Stripe payment component
- [ ] PayPal payment component
- [ ] PayPal capture API
- [ ] Pay Later component
- [ ] Payment status updates
- [ ] Error handling
- [ ] Success/cancel redirects

---

## Files to Create

| File                                           | Purpose                 |
| ---------------------------------------------- | ----------------------- |
| `src/lib/stripe.ts`                            | Stripe configuration    |
| `src/app/api/checkout/stripe/route.ts`         | Create Stripe session   |
| `src/app/api/webhooks/stripe/route.ts`         | Stripe webhooks         |
| `src/app/api/checkout/paypal/capture/route.ts` | PayPal capture          |
| `src/components/providers/PayPalProvider.tsx`  | PayPal SDK provider     |
| `src/components/checkout/PaymentOptions.tsx`   | Payment method selector |
| `src/components/checkout/StripePayment.tsx`    | Stripe payment          |
| `src/components/checkout/PayPalPayment.tsx`    | PayPal payment          |
| `src/components/checkout/PayLaterOption.tsx`   | Invoice option          |

---

## Next Phase

→ **Phase 9: Account Management**
