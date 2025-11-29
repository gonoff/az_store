# Phase 6: Shopping Cart

**Status**: ⏳ Pending
**Dependencies**: Phase 4 (Product Catalog), Phase 5 (3D Visualization)

## Overview

Implement shopping cart functionality with Zustand for state management and localStorage persistence.

## Goals

- Cart state management with Zustand
- Add/update/remove cart items
- Cart drawer (slide-out panel)
- Cart page
- Persistent cart across sessions
- Price recalculation
- Cart item validation

---

## Step 6.1: Install Zustand

```bash
npm install zustand
```

---

## Step 6.2: Cart Store

**File**: `src/lib/stores/cart.ts`

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MethodCode, DesignPlacement } from '@/types/api';

export interface CartItem {
  id: string; // Unique ID for this cart item
  productId: number;
  productName: string;
  productType: string;
  size: string;
  color: string;
  colorHex: string;
  method: MethodCode;
  designs: DesignPlacement[];
  quantity: number;
  unitPrice: number;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<CartItem>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computed
  itemCount: () => number;
  subtotal: () => number;
}

// Generate unique ID for cart item
function generateCartItemId(): string {
  return `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const newItem: CartItem = {
          ...item,
          id: generateCartItemId(),
        };

        set((state) => ({
          items: [...state.items, newItem],
          isOpen: true, // Open cart drawer when adding
        }));
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }

        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, quantity } : item)),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      itemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      subtotal: () => {
        return get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      },
    }),
    {
      name: 'azteam-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
);
```

---

## Step 6.3: Cart Drawer Component

**File**: `src/components/cart/CartDrawer.tsx`

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCartStore } from '@/lib/stores/cart';
import { CartItem } from './CartItem';
import { ShoppingBag } from 'lucide-react';

export function CartDrawer() {
  const t = useTranslations('cart');
  const { items, isOpen, closeCart, subtotal } = useCartStore();
  const total = subtotal();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            {t('title')} ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">{t('empty')}</p>
            <Button asChild onClick={closeCart}>
              <Link href="/products">{t('continueShopping')}</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4">
              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('subtotal')}</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('shipping')}</span>
                  <span className="text-muted-foreground">{t('calculated')}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold">
                <span>{t('total')}</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <SheetFooter className="flex-col gap-2 sm:flex-col">
                <Button asChild className="w-full" onClick={closeCart}>
                  <Link href="/checkout">{t('checkout')}</Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={closeCart}
                  asChild
                >
                  <Link href="/cart">View Cart</Link>
                </Button>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
```

---

## Step 6.4: Cart Item Component

**File**: `src/components/cart/CartItem.tsx`

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { Trash2, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore, type CartItem as CartItemType } from '@/lib/stores/cart';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const t = useTranslations('cart');
  const { updateQuantity, removeItem } = useCartStore();

  const handleDecrease = () => {
    updateQuantity(item.id, item.quantity - 1);
  };

  const handleIncrease = () => {
    updateQuantity(item.id, item.quantity + 1);
  };

  return (
    <div className="flex gap-4">
      {/* Color preview */}
      <div
        className="h-20 w-20 flex-shrink-0 rounded-lg"
        style={{ backgroundColor: item.colorHex }}
      />

      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div>
            <h4 className="font-medium line-clamp-1">{item.productName}</h4>
            <p className="text-sm text-muted-foreground">
              {item.size} / {item.color}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-1 flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            {item.method.toUpperCase()}
          </Badge>
          {item.designs.map((design, i) => (
            <Badge key={i} variant="outline" className="text-xs capitalize">
              {design.area}: {design.design_size}
            </Badge>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between">
          {/* Quantity controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleDecrease}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleIncrease}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Price */}
          <p className="font-semibold">
            ${(item.unitPrice * item.quantity).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## Step 6.5: Cart Page

**File**: `src/app/[locale]/(shop)/cart/page.tsx`

```typescript
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/layout';
import { CartContents } from '@/components/cart/CartContents';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'cart' });

  return {
    title: t('title'),
  };
}

export default async function CartPage() {
  const t = await getTranslations('cart');

  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <CartContents />
    </Container>
  );
}
```

**File**: `src/components/cart/CartContents.tsx`

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/lib/stores/cart';
import { CartItem } from './CartItem';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export function CartContents() {
  const t = useTranslations('cart');
  const { items, subtotal, clearCart } = useCartStore();
  const total = subtotal();

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">{t('empty')}</h2>
        <p className="mt-2 text-muted-foreground">
          Add some products to get started
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">{t('continueShopping')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-3">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <CartItem item={item} />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-4 flex justify-between">
          <Button variant="ghost" onClick={clearCart}>
            Clear Cart
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products">{t('continueShopping')}</Link>
          </Button>
        </div>
      </div>

      {/* Order Summary */}
      <div>
        <Card className="sticky top-24">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Order Summary</h2>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('subtotal')} ({items.length} items)
                </span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('shipping')}</span>
                <span className="text-muted-foreground">{t('calculated')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('tax')}</span>
                <span className="text-muted-foreground">{t('calculated')}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between font-semibold">
              <span>{t('total')}</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </CardContent>

          <CardFooter className="p-6 pt-0">
            <Button asChild className="w-full gap-2">
              <Link href="/checkout">
                {t('checkout')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
```

---

## Step 6.6: Update Header Cart Icon

**File**: `src/components/layout/Header.tsx` (update)

```typescript
// Import cart store
import { useCartStore } from '@/lib/stores/cart';

// In component:
const { openCart, itemCount } = useCartStore();
const count = itemCount();

// Cart button with live count
<Button variant="ghost" size="icon" className="relative" onClick={openCart}>
  <ShoppingCart className="h-5 w-5" />
  {count > 0 && (
    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
      {count > 99 ? '99+' : count}
    </span>
  )}
  <span className="sr-only">{tHeader('shoppingCart')}</span>
</Button>
```

---

## Step 6.7: Add Cart Drawer to Layout

**File**: `src/app/[locale]/layout.tsx` (update)

```typescript
import { CartDrawer } from '@/components/cart/CartDrawer';

// In the layout return:
<body>
  <NextIntlClientProvider messages={messages}>
    <QueryProvider>
      <MainLayout locale={locale}>
        {children}
        <CartDrawer />
      </MainLayout>
    </QueryProvider>
  </NextIntlClientProvider>
</body>
```

---

## Step 6.8: Cart Hooks

**File**: `src/hooks/use-cart.ts`

```typescript
import { useCartStore } from '@/lib/stores/cart';
import { useCalculatePrice } from './use-products';
import type { PriceCalculationRequest } from '@/types/api';

export function useAddToCart() {
  const addItem = useCartStore((state) => state.addItem);
  const calculatePrice = useCalculatePrice();

  const addToCart = async (config: {
    productId: number;
    productName: string;
    productType: string;
    size: string;
    color: string;
    colorHex: string;
    method: MethodCode;
    designs: DesignPlacement[];
    quantity: number;
    notes?: string;
  }) => {
    // Calculate price first
    const priceRequest: PriceCalculationRequest = {
      product_id: config.productId,
      size: config.size,
      method: config.method,
      designs: config.designs,
      quantity: config.quantity,
    };

    const pricing = await calculatePrice.mutateAsync(priceRequest);

    // Add to cart with calculated price
    addItem({
      ...config,
      unitPrice: pricing.per_item_price,
    });
  };

  return { addToCart, isLoading: calculatePrice.isPending };
}
```

---

## Step 6.9: Cart Validation

**File**: `src/lib/cart/validation.ts`

```typescript
import { productsApi } from '@/lib/api/products';
import type { CartItem } from '@/lib/stores/cart';

export interface ValidationResult {
  valid: boolean;
  errors: Map<string, string[]>;
}

export async function validateCart(items: CartItem[]): Promise<ValidationResult> {
  const errors = new Map<string, string[]>();

  for (const item of items) {
    const itemErrors: string[] = [];

    try {
      // Validate configuration with API
      const result = await productsApi.validate({
        product_id: item.productId,
        size: item.size,
        method: item.method,
        designs: item.designs,
        quantity: item.quantity,
      });

      if (!result.valid) {
        itemErrors.push(...result.errors);
      }
    } catch (error) {
      itemErrors.push('Unable to validate item');
    }

    if (itemErrors.length > 0) {
      errors.set(item.id, itemErrors);
    }
  }

  return {
    valid: errors.size === 0,
    errors,
  };
}
```

---

## Deliverables Checklist

- [ ] Cart Zustand store with persistence
- [ ] Cart drawer component
- [ ] Cart item component
- [ ] Cart page
- [ ] Cart contents component
- [ ] Order summary component
- [ ] Header cart icon integration
- [ ] Cart drawer in layout
- [ ] useAddToCart hook
- [ ] Cart validation utility
- [ ] Quantity controls
- [ ] Remove item functionality
- [ ] Clear cart functionality
- [ ] Empty cart state
- [ ] Responsive design

---

## Files to Create

| File                                    | Purpose              |
| --------------------------------------- | -------------------- |
| `src/lib/stores/cart.ts`                | Cart Zustand store   |
| `src/components/cart/CartDrawer.tsx`    | Slide-out cart       |
| `src/components/cart/CartItem.tsx`      | Individual cart item |
| `src/components/cart/CartContents.tsx`  | Cart page contents   |
| `src/components/cart/OrderSummary.tsx`  | Price summary card   |
| `src/components/cart/index.ts`          | Barrel exports       |
| `src/app/[locale]/(shop)/cart/page.tsx` | Cart page            |
| `src/hooks/use-cart.ts`                 | Cart hooks           |
| `src/lib/cart/validation.ts`            | Cart validation      |

---

## Next Phase

→ **Phase 7: Checkout Flow**
