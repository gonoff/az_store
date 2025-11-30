'use client';

/**
 * MobileFilters Component
 * Slide-out drawer for filters on mobile devices
 */

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ProductFilters } from './ProductFilters';

export function MobileFilters() {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();

  // Count active filters
  const activeFiltersCount = [
    searchParams.get('type'),
    searchParams.get('material'),
    searchParams.get('gender'),
  ].filter(Boolean).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <ProductFilters />
        </div>
      </SheetContent>
    </Sheet>
  );
}
