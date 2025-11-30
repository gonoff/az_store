# Phase 4: Product Catalog

**Status**: ✅ Complete
**Dependencies**: Phase 2 (API Layer), Phase 3 (Authentication)

## Overview

Build the product browsing experience with filtering, sorting, and product detail pages.

## Goals

- Product listing page with grid layout
- Product filtering by type, material, gender
- Product sorting options
- Product detail page with configuration
- Price calculation integration
- SEO optimization with metadata

---

## Step 4.1: Product Listing Page

**File**: `src/app/[locale]/(shop)/products/page.tsx`

```typescript
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/layout';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductFilters } from '@/components/product/ProductFilters';
import { ProductSort } from '@/components/product/ProductSort';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductsPageProps {
  searchParams: Promise<{
    type?: string;
    material?: string;
    gender?: string;
    sort?: string;
  }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'products' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const t = await getTranslations('products');
  const filters = await searchParams;

  return (
    <Container className="py-8">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <ProductSort />
        </div>

        {/* Filters + Grid */}
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <ProductFilters />
          </aside>

          <main>
            <Suspense fallback={<ProductGridSkeleton />}>
              <ProductGrid filters={filters} />
            </Suspense>
          </main>
        </div>
      </div>
    </Container>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
```

---

## Step 4.2: Product Grid Component

**File**: `src/components/product/ProductGrid.tsx`

```typescript
'use client';

import { useProducts } from '@/hooks/use-products';
import { ProductCard } from './ProductCard';
import { useTranslations } from 'next-intl';

interface ProductGridProps {
  filters?: {
    type?: string;
    material?: string;
    gender?: string;
  };
}

export function ProductGrid({ filters }: ProductGridProps) {
  const t = useTranslations('products');
  const { data: productsByType, isLoading, error } = useProducts(filters);

  if (isLoading) {
    return <div>{t('loading')}</div>;
  }

  if (error) {
    return <div className="text-destructive">Error loading products</div>;
  }

  // Flatten products from all types
  const allProducts = productsByType
    ? Object.values(productsByType).flat()
    : [];

  if (allProducts.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        {t('noResults')}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {allProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## Step 4.3: Product Card Component

**File**: `src/components/product/ProductCard.tsx`

Uses static PNG thumbnails and displays the **default price** (blank + $9 customization).

```typescript
'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

// Map product types to thumbnail images
const THUMBNAIL_MAP: Record<string, string> = {
  shirt: '/images/products/shirt.png',
  hoodie: '/images/products/hoodie.png',
  hat: '/images/products/hat.png',
  bag: '/images/products/bag.png',
  apron: '/images/products/apron.png',
};

const getThumbnail = (type: string) => THUMBNAIL_MAP[type] || THUMBNAIL_MAP.shirt;

// Default customization cost (Front Tiny $3 + Back Medium $6 for DTF)
const DEFAULT_CUSTOMIZATION_COST = 9.0;

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations('products');

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          {/* Product Thumbnail */}
          <Image
            src={getThumbnail(product.type)}
            alt={product.display_name}
            fill
            className="object-contain p-4 transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="secondary" size="sm">
              {t('viewDetails')}
            </Button>
          </div>

          {/* Gender badge */}
          <Badge variant="secondary" className="absolute right-2 top-2 capitalize">
            {product.gender}
          </Badge>
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="space-y-1">
          <h3 className="line-clamp-2 font-semibold leading-tight">
            {product.display_name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {product.product?.brand || product.material}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div>
          <p className="text-lg font-bold text-primary">
            ${(product.base_price + DEFAULT_CUSTOMIZATION_COST).toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('startingAt')}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href={`/products/${product.id}`}>{t('customize')}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
```

**Pricing Note**: The displayed price includes the default customization (Front Tiny + Back Medium = $9.00 for DTF). See `docs/ONLINE_STORE_PRICING_GUIDE.md` for details.

---

## Step 4.4: Product Filters Component

**File**: `src/components/product/ProductFilters.tsx`

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useFilters } from '@/hooks/use-products';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export function ProductFilters() {
  const t = useTranslations('products.filters');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: filterOptions } = useFilters();

  const activeType = searchParams.get('type');
  const activeMaterial = searchParams.get('material');
  const activeGender = searchParams.get('gender');

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasActiveFilters = activeType || activeMaterial || activeGender;

  return (
    <div className="space-y-6">
      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear all filters
        </Button>
      )}

      {/* Product Type */}
      <div>
        <h3 className="mb-3 font-semibold">{t('type')}</h3>
        <div className="space-y-2">
          {filterOptions?.product_types?.map((type: string) => (
            <div key={type} className="flex items-center gap-2">
              <Checkbox
                id={`type-${type}`}
                checked={activeType === type}
                onCheckedChange={(checked) =>
                  updateFilter('type', checked ? type : null)
                }
              />
              <Label htmlFor={`type-${type}`} className="capitalize">
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Material */}
      <div>
        <h3 className="mb-3 font-semibold">{t('material')}</h3>
        <div className="space-y-2">
          {filterOptions?.materials?.map((material: string) => (
            <div key={material} className="flex items-center gap-2">
              <Checkbox
                id={`material-${material}`}
                checked={activeMaterial === material}
                onCheckedChange={(checked) =>
                  updateFilter('material', checked ? material : null)
                }
              />
              <Label htmlFor={`material-${material}`}>{material}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Gender */}
      <div>
        <h3 className="mb-3 font-semibold">{t('gender')}</h3>
        <div className="space-y-2">
          {filterOptions?.genders?.map((gender: string) => (
            <div key={gender} className="flex items-center gap-2">
              <Checkbox
                id={`gender-${gender}`}
                checked={activeGender === gender}
                onCheckedChange={(checked) =>
                  updateFilter('gender', checked ? gender : null)
                }
              />
              <Label htmlFor={`gender-${gender}`} className="capitalize">
                {gender}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Step 4.5: Product Detail Page

**File**: `src/app/[locale]/(shop)/products/[id]/page.tsx`

```typescript
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/layout';
import { ProductConfigurator } from '@/components/product/ProductConfigurator';
import { productsApi } from '@/lib/api/products';

interface ProductPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { locale, id } = await params;

  try {
    const product = await productsApi.get(parseInt(id));
    return {
      title: product.display_name,
      description: `Customize your ${product.display_name}`,
    };
  } catch {
    return { title: 'Product Not Found' };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const t = await getTranslations('products');

  let product;
  try {
    product = await productsApi.get(parseInt(id));
  } catch {
    notFound();
  }

  return (
    <Container className="py-8">
      <ProductConfigurator product={product} />
    </Container>
  );
}
```

---

## Step 4.6: Product Configurator Component

**File**: `src/components/product/ProductConfigurator.tsx`

Features:

- 3D product viewer with GLTF models
- **Default configuration**: Front (Tiny) + Back (Medium) pre-selected
- Auto-calculates price on configuration changes
- Base Price + Adjustments pricing display

```typescript
'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useProduct, useMethods, useCalculatePrice } from '@/hooks/use-products';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SizeSelector } from './SizeSelector';
import { ColorSelector } from './ColorSelector';
import { MethodSelector } from './MethodSelector';
import { DesignSelector } from './DesignSelector';
import { QuantityInput } from './QuantityInput';
import { PriceSummary } from './PriceSummary';
import type { MethodCode, DesignPlacement, PriceCalculationRequest } from '@/types';

// Dynamic import for 3D viewer with SSR disabled
const ProductViewer = dynamic(
  () => import('@/components/3d/ProductViewer').then((mod) => mod.ProductViewer),
  { ssr: false }
);

interface ProductConfiguratorProps {
  productId: number;
}

export function ProductConfigurator({ productId }: ProductConfiguratorProps) {
  const t = useTranslations('products');
  const { data: product, isLoading } = useProduct(productId);
  const { data: methods } = useMethods();
  const calculatePrice = useCalculatePrice();

  // Configuration state
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<MethodCode>('dtf');

  // Default configuration: Front (Tiny) + Back (Medium) to match ERP pricing model
  const [designs, setDesigns] = useState<DesignPlacement[]>([
    { area: 'front', design_size: 'tiny' },
    { area: 'back', design_size: 'medium' },
  ]);
  const [quantity, setQuantity] = useState(1);

  // Compute effective values from product defaults
  const effectiveSize = selectedSize ?? (product?.sizes[0]?.size_code || '');
  const effectiveColor = selectedColor ?? (product?.colors[0]?.color_name || '');

  // Get color hex for 3D viewer
  const selectedColorHex = useMemo(() => {
    if (!product || !effectiveColor) return '#cccccc';
    const color = product.colors.find((c) => c.color_name === effectiveColor);
    return color?.hex_code || '#cccccc';
  }, [product, effectiveColor]);

  // Auto-calculate price when configuration changes
  const prevRequestRef = useRef<string>('');
  useEffect(() => {
    if (!product || !effectiveSize) return;

    const request: PriceCalculationRequest = {
      product_id: product.id,
      size: effectiveSize,
      method: selectedMethod,
      designs,
      quantity,
    };

    const requestKey = JSON.stringify(request);
    if (requestKey !== prevRequestRef.current) {
      prevRequestRef.current = requestKey;
      calculatePrice.mutate(request);
    }
  }, [product, effectiveSize, selectedMethod, designs, quantity]);

  if (isLoading || !product) return <div>Loading...</div>;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left: 3D Viewer */}
      <div className="aspect-square overflow-hidden rounded-lg bg-muted">
        <ProductViewer
          productType={product.type}
          color={selectedColorHex}
          productName={product.display_name}
        />
      </div>

      {/* Right: Configuration */}
      <div className="space-y-6">
        {/* ... Size, Color, Method, Design selectors ... */}

        {/* Price Summary - Base Price + Adjustments */}
        <Card>
          <CardContent className="p-4">
            <PriceSummary
              pricing={calculatePrice.data}
              isLoading={calculatePrice.isPending}
            />
          </CardContent>
        </Card>

        {/* Add to Cart */}
        <Button
          size="lg"
          className="w-full"
          disabled={!calculatePrice.data || calculatePrice.isPending}
        >
          {t('addToCart')} - ${calculatePrice.data?.total.toFixed(2) || '...'}
        </Button>
      </div>
    </div>
  );
}
```

**Default Designs**: The configurator pre-selects Front (Tiny) + Back (Medium) to match the ERP's base price calculation. Users can modify or remove these placements, and the price adjusts accordingly.

---

## Step 4.7: Supporting Components

### SizeSelector

**File**: `src/components/product/SizeSelector.tsx`

### ColorSelector

**File**: `src/components/product/ColorSelector.tsx`

### MethodSelector

**File**: `src/components/product/MethodSelector.tsx`

### DesignSelector

**File**: `src/components/product/DesignSelector.tsx`

### QuantityInput

**File**: `src/components/product/QuantityInput.tsx`

### PriceSummary

**File**: `src/components/product/PriceSummary.tsx`

---

## Step 4.8: Add Filters Hook

**File**: `src/hooks/use-products.ts` (update)

```typescript
export function useFilters() {
  return useQuery({
    queryKey: queryKeys.filters,
    queryFn: productsApi.getFilters,
    staleTime: Infinity,
  });
}
```

---

## Deliverables Checklist

- [x] Products listing page
- [x] Product grid component
- [x] Product card component (with static thumbnails)
- [x] Product filters component
- [ ] Product sort component
- [ ] Mobile filter drawer
- [x] Product detail page
- [x] Product configurator component
- [x] Size selector component
- [x] Color selector component
- [x] Method selector component
- [x] Design selector component (with default sizes per area)
- [x] Quantity input component
- [x] Price summary component (Base Price + Adjustments model)
- [x] useFilters hook
- [x] SEO metadata for products
- [x] Loading states/skeletons
- [x] Empty state for no results
- [ ] URL-based filter state

---

## Files to Create

| File                                             | Purpose                 |
| ------------------------------------------------ | ----------------------- |
| `src/app/[locale]/(shop)/products/page.tsx`      | Products listing page   |
| `src/app/[locale]/(shop)/products/[id]/page.tsx` | Product detail page     |
| `src/components/product/ProductGrid.tsx`         | Product grid display    |
| `src/components/product/ProductCard.tsx`         | Individual product card |
| `src/components/product/ProductFilters.tsx`      | Filter sidebar          |
| `src/components/product/ProductSort.tsx`         | Sort dropdown           |
| `src/components/product/MobileFilters.tsx`       | Mobile filter drawer    |
| `src/components/product/ProductConfigurator.tsx` | Product configuration   |
| `src/components/product/SizeSelector.tsx`        | Size selection          |
| `src/components/product/ColorSelector.tsx`       | Color selection         |
| `src/components/product/MethodSelector.tsx`      | Method selection        |
| `src/components/product/DesignSelector.tsx`      | Design placement        |
| `src/components/product/QuantityInput.tsx`       | Quantity input          |
| `src/components/product/PriceSummary.tsx`        | Price breakdown         |
| `src/components/product/index.ts`                | Barrel exports          |

---

## Next Phase

→ **Phase 5: 3D Product Visualization**
