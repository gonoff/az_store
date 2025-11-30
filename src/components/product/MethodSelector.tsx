'use client';

/**
 * MethodSelector Component
 * Customization method selection (DTF / Embroidery)
 */

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import type { CustomizationMethod, MethodCode } from '@/types';

interface MethodSelectorProps {
  methods: CustomizationMethod[];
  selected: MethodCode;
  onSelect: (method: MethodCode) => void;
}

const methodIcons: Record<MethodCode, string> = {
  dtf: '\uD83C\uDFA8', // Paint palette
  embroidery: '\uD83E\uDEA1', // Sewing needle
};

export function MethodSelector({ methods, selected, onSelect }: MethodSelectorProps) {
  // Use default methods if API hasn't returned yet
  const availableMethods: Array<{ code: MethodCode; name: string; description: string }> =
    methods.length > 0
      ? methods.map((m) => ({
          code: m.method_code,
          name: m.method_name,
          description: m.description,
        }))
      : [
          {
            code: 'dtf',
            name: 'DTF Printing',
            description: 'Direct to Film - vibrant, full-color designs',
          },
          {
            code: 'embroidery',
            name: 'Embroidery',
            description: 'Premium stitched designs for a professional look',
          },
        ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {availableMethods.map((method) => (
        <Card
          key={method.code}
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            selected === method.code && 'border-primary ring-2 ring-primary'
          )}
          onClick={() => onSelect(method.code)}
        >
          <CardContent className="flex items-start gap-3 p-4">
            <span className="text-2xl">{methodIcons[method.code]}</span>
            <div>
              <h4 className="font-semibold">{method.name}</h4>
              <p className="text-sm text-muted-foreground">{method.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
