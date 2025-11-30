'use client';

/**
 * ColorSelector Component
 * Color swatch selection
 */

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { ProductColor } from '@/types';

interface ColorSelectorProps {
  colors: ProductColor[];
  selected: string;
  onSelect: (color: string) => void;
}

export function ColorSelector({ colors, selected, onSelect }: ColorSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => {
        const isSelected = selected === color.color_name;
        const hex = color.hex_code || '#cccccc';
        const isLight = isLightColor(hex);

        return (
          <button
            key={color.color_name}
            type="button"
            onClick={() => onSelect(color.color_name)}
            className={cn(
              'relative h-10 w-10 rounded-full border-2 transition-all hover:scale-110',
              isSelected ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-border'
            )}
            style={{ backgroundColor: hex }}
            title={color.color_name}
          >
            {isSelected && (
              <Check
                className={cn(
                  'absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2',
                  isLight ? 'text-gray-800' : 'text-white'
                )}
              />
            )}
            <span className="sr-only">{color.color_name}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Determine if a hex color is light or dark
 */
function isLightColor(hex: string): boolean {
  // Remove # if present
  const color = hex.replace('#', '');

  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5;
}
