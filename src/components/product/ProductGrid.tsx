'use client';

/**
 * ProductGrid Component
 * Displays products in a responsive grid layout
 */

import { useProducts } from '@/hooks/use-products';
import { ProductCard } from './ProductCard';
import { useTranslations } from 'next-intl';
import type { ProductFilters as ProductFiltersType, Product, ProductType } from '@/types';

interface ProductGridProps {
  filters?: {
    type?: string;
    material?: string;
    gender?: string;
    sort?: string;
  };
}

export function ProductGrid({ filters }: ProductGridProps) {
  const t = useTranslations('products');
  const tCommon = useTranslations('common');

  // Convert string filters to typed filters
  const typedFilters: ProductFiltersType = {
    type: filters?.type as ProductType | undefined,
    material: filters?.material,
    gender: filters?.gender as 'mens' | 'womens' | 'unisex' | undefined,
  };

  const { data: productsByType, isLoading, error } = useProducts(typedFilters);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">{t('loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive">{tCommon('error')}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm text-primary hover:underline"
        >
          {tCommon('retry')}
        </button>
      </div>
    );
  }

  // Flatten products from all types
  const allProducts: Product[] = productsByType ? Object.values(productsByType).flat() : [];

  // Apply sorting if specified
  const sortedProducts = sortProducts(allProducts, filters?.sort);

  if (sortedProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{tCommon('noResults')}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {sortedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function sortProducts(products: Product[], sortBy?: string): Product[] {
  if (!sortBy) return products;

  const sorted = [...products];

  switch (sortBy) {
    case 'price_asc':
      return sorted.sort((a, b) => a.base_price - b.base_price);
    case 'price_desc':
      return sorted.sort((a, b) => b.base_price - a.base_price);
    case 'name':
      return sorted.sort((a, b) => a.display_name.localeCompare(b.display_name));
    case 'newest':
    default:
      return sorted;
  }
}
