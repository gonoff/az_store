/**
 * Product Detail Page
 * Displays product configuration and purchase options
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/layout';
import { ProductConfigurator } from '@/components/product/ProductConfigurator';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;

  // For SEO, we just use a generic title
  // The actual product name is loaded client-side
  return {
    title: `Product #${id}`,
    description: 'Customize your product with our easy-to-use configurator.',
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  // Validate that ID is a number
  const productId = parseInt(id, 10);
  if (isNaN(productId) || productId <= 0) {
    notFound();
  }

  return (
    <Container className="py-8">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductConfigurator productId={productId} />
      </Suspense>
    </Container>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* 3D Viewer skeleton */}
      <Skeleton className="aspect-square w-full rounded-lg" />

      {/* Configuration skeleton */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>

        <Skeleton className="h-px w-full" />

        {/* Size */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-16" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-14" />
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-16" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-full" />
            ))}
          </div>
        </div>

        {/* Method */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>

        <Skeleton className="h-px w-full" />

        {/* Price and Add to Cart */}
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
