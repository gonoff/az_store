'use client';

/**
 * SizeSelector Component
 * Size selection buttons
 */

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ProductSize } from '@/types';

interface SizeSelectorProps {
  sizes: ProductSize[];
  selected: string;
  onSelect: (size: string) => void;
}

export function SizeSelector({ sizes, selected, onSelect }: SizeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => (
        <Button
          key={size.size_code}
          variant={selected === size.size_code ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect(size.size_code)}
          className={cn(
            'min-w-[3rem]',
            selected === size.size_code && 'ring-2 ring-primary ring-offset-2'
          )}
        >
          {size.size_name}
        </Button>
      ))}
    </div>
  );
}
