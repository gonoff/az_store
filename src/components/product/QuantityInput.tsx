'use client';

/**
 * QuantityInput Component
 * Numeric input with increment/decrement buttons
 */

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function QuantityInput({ value, onChange, min = 1, max = 500 }: QuantityInputProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue)) {
      onChange(Math.min(Math.max(newValue, min), max));
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={handleDecrement} disabled={value <= min}>
        <Minus className="h-4 w-4" />
        <span className="sr-only">Decrease quantity</span>
      </Button>

      <Input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        className="w-20 text-center"
      />

      <Button variant="outline" size="icon" onClick={handleIncrement} disabled={value >= max}>
        <Plus className="h-4 w-4" />
        <span className="sr-only">Increase quantity</span>
      </Button>

      <span className="text-sm text-muted-foreground">
        (min {min}, max {max})
      </span>
    </div>
  );
}
