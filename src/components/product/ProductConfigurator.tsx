'use client';

/**
 * ProductConfigurator Component
 * Main product configuration interface with 3D preview
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useProduct, useMethods, useCalculatePrice } from '@/hooks/use-products';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
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
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <div className="text-muted-foreground">Loading 3D viewer...</div>
      </div>
    ),
  }
);

interface ProductConfiguratorProps {
  productId: number;
}

export function ProductConfigurator({ productId }: ProductConfiguratorProps) {
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
  const router = useRouter();

  // Fetch product data
  const { data: product, isLoading, error } = useProduct(productId);
  const { data: methods } = useMethods();
  const calculatePrice = useCalculatePrice();

  // Configuration state - use null to indicate "not yet set"
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<MethodCode>('dtf');
  // Default configuration: Front (Tiny) + Back (Medium) to match ERP pricing model
  const [designs, setDesigns] = useState<DesignPlacement[]>([
    { area: 'front', design_size: 'tiny' },
    { area: 'back', design_size: 'medium' },
  ]);
  const [quantity, setQuantity] = useState(1);

  // Compute effective values - use defaults from product if state not yet set
  const effectiveSize = selectedSize ?? (product?.sizes[0]?.size_code || '');
  const effectiveColor = selectedColor ?? (product?.colors[0]?.color_name || '');

  // Get selected color hex code for 3D viewer
  const selectedColorHex = useMemo(() => {
    if (!product || !effectiveColor) return '#cccccc';
    const color = product.colors.find((c) => c.color_name === effectiveColor);
    return color?.hex_code || '#cccccc';
  }, [product, effectiveColor]);

  // Price calculation function
  const triggerPriceCalculation = useCallback(
    (request: PriceCalculationRequest) => {
      calculatePrice.mutate(request);
    },
    [calculatePrice]
  );

  // Calculate price when configuration changes (using a ref to track previous request)
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
      triggerPriceCalculation(request);
    }
  }, [product, effectiveSize, selectedMethod, designs, quantity, triggerPriceCalculation]);

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product || !calculatePrice.data) return;

    // TODO: Integrate with cart store in Phase 6
    console.log('Add to cart:', {
      productId: product.id,
      productName: product.display_name,
      size: effectiveSize,
      color: effectiveColor,
      method: selectedMethod,
      designs,
      quantity,
      unitPrice: calculatePrice.data.per_item_price,
      total: calculatePrice.data.total,
    });

    // For now, show an alert
    alert('Added to cart! (Cart functionality coming in Phase 6)');
  };

  if (isLoading) {
    return <ConfiguratorSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive">{tCommon('error')}</p>
        <Button variant="link" onClick={() => router.push('/products')} className="mt-4">
          Back to Products
        </Button>
      </div>
    );
  }

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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{product.display_name}</h1>
          <p className="mt-2 text-muted-foreground">
            {product.product?.brand} - {product.material}
          </p>
        </div>

        <Separator />

        {/* Size */}
        <div>
          <h3 className="mb-3 font-semibold">Size</h3>
          <SizeSelector sizes={product.sizes} selected={effectiveSize} onSelect={setSelectedSize} />
        </div>

        {/* Color */}
        <div>
          <h3 className="mb-3 font-semibold">
            Color: <span className="font-normal text-muted-foreground">{effectiveColor}</span>
          </h3>
          <ColorSelector
            colors={product.colors}
            selected={effectiveColor}
            onSelect={setSelectedColor}
          />
        </div>

        {/* Method */}
        <div>
          <h3 className="mb-3 font-semibold">Customization Method</h3>
          <MethodSelector
            methods={methods || []}
            selected={selectedMethod}
            onSelect={setSelectedMethod}
          />
        </div>

        {/* Design Placements */}
        <div>
          <h3 className="mb-3 font-semibold">Design Placements</h3>
          <DesignSelector method={selectedMethod} designs={designs} onChange={setDesigns} />
        </div>

        {/* Quantity */}
        <div>
          <h3 className="mb-3 font-semibold">Quantity</h3>
          <QuantityInput value={quantity} onChange={setQuantity} min={1} max={500} />
        </div>

        <Separator />

        {/* Price Summary */}
        <Card>
          <CardContent className="p-4">
            <PriceSummary pricing={calculatePrice.data} isLoading={calculatePrice.isPending} />
          </CardContent>
        </Card>

        {/* Add to Cart */}
        <Button
          size="lg"
          className="w-full"
          onClick={handleAddToCart}
          disabled={!calculatePrice.data || calculatePrice.isPending}
        >
          {t('addToCart')} - ${calculatePrice.data?.total.toFixed(2) || '...'}
        </Button>
      </div>
    </div>
  );
}

function ConfiguratorSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="space-y-3">
          <Skeleton className="h-5 w-16" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-14" />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-16" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-full" />
            ))}
          </div>
        </div>
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
