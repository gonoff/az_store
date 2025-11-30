'use client';

/**
 * ProductFilters Component
 * Sidebar filters for product listing
 */

import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useFilters } from '@/hooks/use-products';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: filterOptions, isLoading } = useFilters();

  const activeType = searchParams.get('type');
  const activeMaterial = searchParams.get('material');
  const activeGender = searchParams.get('gender');

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasActiveFilters = activeType || activeMaterial || activeGender;

  if (isLoading) {
    return <FiltersSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
          Clear all filters
        </Button>
      )}

      {/* Product Type */}
      <FilterSection title="Type">
        {filterOptions?.product_types?.map((type: string) => (
          <FilterCheckbox
            key={type}
            id={`type-${type}`}
            label={formatFilterLabel(type)}
            checked={activeType === type}
            onChange={(checked) => updateFilter('type', checked ? type : null)}
          />
        ))}
      </FilterSection>

      <Separator />

      {/* Material */}
      <FilterSection title="Material">
        {filterOptions?.materials?.map((material: string) => (
          <FilterCheckbox
            key={material}
            id={`material-${material}`}
            label={material}
            checked={activeMaterial === material}
            onChange={(checked) => updateFilter('material', checked ? material : null)}
          />
        ))}
      </FilterSection>

      <Separator />

      {/* Gender */}
      <FilterSection title="Gender">
        {filterOptions?.genders?.map((gender: string) => (
          <FilterCheckbox
            key={gender}
            id={`gender-${gender}`}
            label={formatFilterLabel(gender)}
            checked={activeGender === gender}
            onChange={(checked) => updateFilter('gender', checked ? gender : null)}
          />
        ))}
      </FilterSection>
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <div>
      <h3 className="mb-3 font-semibold">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

interface FilterCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function FilterCheckbox({ id, label, checked, onChange }: FilterCheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="cursor-pointer">
        {label}
      </Label>
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((section) => (
        <div key={section}>
          <Skeleton className="mb-3 h-5 w-20" />
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
          {section < 3 && <Separator className="mt-6" />}
        </div>
      ))}
    </div>
  );
}

function formatFilterLabel(value: string): string {
  // Capitalize first letter and replace underscores with spaces
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
