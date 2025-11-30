/**
 * Products Listing Page
 * Displays products with filtering and sorting capabilities
 */

import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/layout';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductFilters } from '@/components/product/ProductFilters';
import { ProductSort } from '@/components/product/ProductSort';
import { MobileFilters } from '@/components/product/MobileFilters';
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton';

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
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
    description: 'Browse our collection of custom apparel including t-shirts, hoodies, and hats.',
  };
}

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('products');
  const filters = await searchParams;

  return (
    <Container className="py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <div className="flex items-center gap-4">
            {/* Mobile filters button */}
            <MobileFilters />
            {/* Sort dropdown */}
            <ProductSort />
          </div>
        </div>

        {/* Filters + Grid */}
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Desktop filters sidebar */}
          <aside className="hidden lg:block">
            <ProductFilters />
          </aside>

          {/* Products grid */}
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
