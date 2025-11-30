'use client';

/**
 * PriceSummary Component
 * Displays Base Price + Adjustments pricing model
 * Shows adjustments from default configuration (Front Tiny + Back Medium)
 */

import { ArrowDown, ArrowUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { PricingBreakdown } from '@/types';

interface PriceSummaryProps {
  pricing?: PricingBreakdown;
  isLoading?: boolean;
}

export function PriceSummary({ pricing, isLoading }: PriceSummaryProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    );
  }

  if (!pricing) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        Configure your product to see pricing
      </div>
    );
  }

  const hasAdjustments = pricing.adjustments && pricing.adjustments.length > 0;

  return (
    <div className="space-y-3">
      {/* Base Price */}
      <div className="flex items-center justify-between">
        <span className="font-medium">Base Price</span>
        <span className="font-semibold">
          ${pricing.base_price?.total?.toFixed(2) ?? pricing.per_item_price.toFixed(2)}
        </span>
      </div>

      {/* Adjustments Section */}
      {hasAdjustments && (
        <>
          <div className="border-t" />
          <div className="space-y-2">
            {pricing.adjustments.map((adjustment, index) => (
              <AdjustmentLine key={index} adjustment={adjustment} />
            ))}
          </div>
        </>
      )}

      {/* Per Item Price */}
      <div className="border-t pt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Per Item</span>
          <span className="font-medium">${pricing.per_item_price.toFixed(2)}</span>
        </div>
      </div>

      {/* Quantity */}
      {pricing.quantity > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Quantity</span>
          <span>x {pricing.quantity}</span>
        </div>
      )}

      {/* Total */}
      <div className="border-t pt-3">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">Total</span>
          <span className="text-xl font-bold text-primary">${pricing.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * AdjustmentLine - Single adjustment row with arrow indicator
 */
interface AdjustmentLineProps {
  adjustment: {
    area: string;
    size: string;
    adjustment: number;
    label: string;
  };
}

function AdjustmentLine({ adjustment }: AdjustmentLineProps) {
  const isDiscount = adjustment.adjustment < 0;
  const isIncrease = adjustment.adjustment > 0;

  // Don't show zero adjustments
  if (adjustment.adjustment === 0) return null;

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        {isDiscount ? (
          <ArrowDown className="h-3 w-3 text-green-600" />
        ) : (
          <ArrowUp className="h-3 w-3 text-red-600" />
        )}
        <span className="text-muted-foreground">{adjustment.label}</span>
      </div>
      <span
        className={cn('font-medium', isDiscount && 'text-green-600', isIncrease && 'text-red-600')}
      >
        {isDiscount ? '-' : '+'}${Math.abs(adjustment.adjustment).toFixed(2)}
      </span>
    </div>
  );
}
