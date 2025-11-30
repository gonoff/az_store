'use client';

/**
 * DesignSelector Component
 * Design placement and size selection
 * Fetches available sizes dynamically from ERP based on placement area
 */

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useDesignSizes } from '@/hooks/use-products';
import type { MethodCode, DesignPlacement, PlacementArea, DesignSizeCode } from '@/types';

interface DesignSelectorProps {
  method: MethodCode;
  designs: DesignPlacement[];
  onChange: (designs: DesignPlacement[]) => void;
}

const placementAreas: { value: PlacementArea; label: string; defaultSize: DesignSizeCode }[] = [
  { value: 'front', label: 'Front', defaultSize: 'tiny' },
  { value: 'back', label: 'Back', defaultSize: 'medium' },
  { value: 'sleeve_left', label: 'Left Sleeve', defaultSize: 'teeny_tiny' },
  { value: 'sleeve_right', label: 'Right Sleeve', defaultSize: 'teeny_tiny' },
  { value: 'pocket', label: 'Pocket', defaultSize: 'teeny_tiny' },
];

// Get the default size for a placement area
function getDefaultSizeForArea(area: PlacementArea): DesignSizeCode {
  const placement = placementAreas.find((p) => p.value === area);
  return placement?.defaultSize ?? 'medium';
}

export function DesignSelector({ method, designs, onChange }: DesignSelectorProps) {
  const addDesign = () => {
    // Find first unused placement area
    const usedAreas = designs.map((d) => d.area);
    const availableArea = placementAreas.find((p) => !usedAreas.includes(p.value));

    if (availableArea) {
      onChange([...designs, { area: availableArea.value, design_size: availableArea.defaultSize }]);
    }
  };

  const removeDesign = (index: number) => {
    if (designs.length > 1) {
      onChange(designs.filter((_, i) => i !== index));
    }
  };

  const updateDesign = (index: number, updates: Partial<DesignPlacement>) => {
    onChange(designs.map((design, i) => (i === index ? { ...design, ...updates } : design)));
  };

  // Get available areas (excluding already selected ones except current)
  const getAvailableAreas = (currentArea: PlacementArea) => {
    const usedAreas = designs.map((d) => d.area);
    return placementAreas.filter((p) => p.value === currentArea || !usedAreas.includes(p.value));
  };

  const canAddMore = designs.length < placementAreas.length;

  return (
    <div className="space-y-4">
      {designs.map((design, index) => (
        <DesignRow
          key={index}
          design={design}
          method={method}
          availableAreas={getAvailableAreas(design.area)}
          canRemove={designs.length > 1}
          onAreaChange={(area) =>
            updateDesign(index, { area, design_size: getDefaultSizeForArea(area) })
          }
          onSizeChange={(design_size) => updateDesign(index, { design_size })}
          onRemove={() => removeDesign(index)}
        />
      ))}

      {/* Add Design button */}
      {canAddMore && (
        <Button variant="outline" size="sm" onClick={addDesign} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Another Placement
        </Button>
      )}
    </div>
  );
}

/**
 * DesignRow - Individual design placement row
 * Fetches sizes dynamically based on the selected area
 */
interface DesignRowProps {
  design: DesignPlacement;
  method: MethodCode;
  availableAreas: { value: PlacementArea; label: string }[];
  canRemove: boolean;
  onAreaChange: (area: PlacementArea) => void;
  onSizeChange: (size: DesignSizeCode) => void;
  onRemove: () => void;
}

function DesignRow({
  design,
  method,
  availableAreas,
  canRemove,
  onAreaChange,
  onSizeChange,
  onRemove,
}: DesignRowProps) {
  // Fetch sizes for this specific area and method
  const { data: sizes, isLoading } = useDesignSizes(design.area, method);

  return (
    <div className="flex items-center gap-3">
      {/* Placement Area */}
      <Select value={design.area} onValueChange={(value) => onAreaChange(value as PlacementArea)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableAreas.map((area) => (
            <SelectItem key={area.value} value={area.value}>
              {area.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Design Size - fetched from API */}
      {isLoading ? (
        <Skeleton className="h-10 flex-1" />
      ) : (
        <Select
          value={design.design_size}
          onValueChange={(value) => onSizeChange(value as DesignSizeCode)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sizes?.map((size) => (
              <SelectItem key={size.size_code} value={size.size_code}>
                {size.size_name} ({size.dimensions})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Remove button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        disabled={!canRemove}
        className="shrink-0"
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Remove design</span>
      </Button>
    </div>
  );
}
