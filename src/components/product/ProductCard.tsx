'use client';

/**
 * ProductCard Component
 * Displays individual product in the grid with static thumbnail
 */

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

// Fallback to shirt if type not found
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
          <h3 className="line-clamp-2 font-semibold leading-tight">{product.display_name}</h3>
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
          <p className="text-xs text-muted-foreground">{t('startingAt')}</p>
        </div>
        <Button asChild size="sm">
          <Link href={`/products/${product.id}`}>{t('customize')}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
