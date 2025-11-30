# Phase 5: 3D Product Visualization

**Status**: ✅ Complete
**Dependencies**: Phase 4 (Product Catalog)

## Overview

Interactive 3D product visualization using React Three Fiber with GLTF models.

## Goals

- [x] React Three Fiber setup
- [x] GLTF model loading (t-shirt, polo)
- [x] Dynamic color changing with 3D-safe adjustments
- [x] Interactive rotation controls
- [ ] Design placement preview (future)
- [x] Responsive canvas
- [x] Performance optimization (SSR disabled, static thumbnails for listings)

---

## Step 5.1: Install Dependencies

```bash
npm install @react-three/fiber @react-three/drei three
npm install -D @types/three
```

---

## Step 5.2: 3D Canvas Wrapper

**File**: `src/components/3d/ProductCanvas.tsx`

```typescript
'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductCanvasProps {
  children: React.ReactNode;
}

export function ProductCanvas({ children }: ProductCanvasProps) {
  return (
    <div className="aspect-square w-full rounded-lg bg-gradient-to-br from-muted to-muted/50">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <directionalLight position={[-5, 5, -5]} intensity={0.5} />

          {/* Environment for reflections */}
          <Environment preset="city" />

          {/* Product Model */}
          {children}

          {/* Shadow */}
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.4}
            scale={5}
            blur={2}
            far={4}
          />

          {/* Controls */}
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
            minDistance={2}
            maxDistance={6}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export function ProductCanvasSkeleton() {
  return <Skeleton className="aspect-square w-full rounded-lg" />;
}
```

---

## Step 5.3: GLTF Shirt Model

**File**: `src/components/3d/ShirtModel.tsx`

Uses GLTF models with dynamic color application and black color adjustment for better 3D visibility.

```typescript
'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ShirtModelProps {
  color: string;
  modelPath?: string;
}

// Adjust pure black to prevent "void black" appearance in 3D
function adjustColorFor3D(hexColor: string): string {
  const color = new THREE.Color(hexColor);
  // Only adjust if ALL color channels are very low (true black)
  if (color.r < 0.08 && color.g < 0.08 && color.b < 0.08) {
    return '#1a1a1a'; // Very dark gray instead of pure black
  }
  return hexColor;
}

const DEFAULT_MODEL = '/models/t_shirt.glb';

export function ShirtModel({ color, modelPath = DEFAULT_MODEL }: ShirtModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);
  const adjustedColor = adjustColorFor3D(color);

  // Apply color to the model's materials
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map((mat) => {
            const cloned = mat.clone();
            cloned.color = new THREE.Color(adjustedColor);
            return cloned;
          });
        } else {
          child.material = child.material.clone();
          child.material.color = new THREE.Color(adjustedColor);
        }
      }
    });
  }, [scene, adjustedColor]);

  // Slow rotation animation
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={4} />
    </group>
  );
}

// Preload models for better performance
useGLTF.preload('/models/t_shirt.glb');
useGLTF.preload('/models/polo_t-shirt.glb');
```

**Models**:

- `/public/models/t_shirt.glb` - Standard t-shirt
- `/public/models/polo_t-shirt.glb` - Polo shirt

---

## Step 5.4: Programmatic Hoodie Model

**File**: `src/components/3d/HoodieModel.tsx`

```typescript
'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HoodieModelProps {
  color: string;
}

export function HoodieModel({ color }: HoodieModelProps) {
  const meshRef = useRef<THREE.Group>(null);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.9,
      metalness: 0.05,
    });
  }, [color]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Main body */}
      <mesh material={material}>
        <boxGeometry args={[1.6, 1.8, 0.4]} />
      </mesh>

      {/* Hood */}
      <mesh material={material} position={[0, 1.2, -0.1]}>
        <sphereGeometry args={[0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>

      {/* Left Sleeve */}
      <mesh material={material} position={[-1.1, 0.4, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.2, 0.25, 1, 8]} />
      </mesh>

      {/* Right Sleeve */}
      <mesh material={material} position={[1.1, 0.4, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.2, 0.25, 1, 8]} />
      </mesh>

      {/* Front pocket */}
      <mesh position={[0, -0.4, 0.21]}>
        <boxGeometry args={[0.8, 0.4, 0.02]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
    </group>
  );
}
```

---

## Step 5.5: Product Viewer Component

**File**: `src/components/3d/ProductViewer.tsx`

Routes to correct GLTF model based on product name (e.g., "polo" → polo model).

```typescript
'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Environment, ContactShadows } from '@react-three/drei';
import { ShirtModel } from './ShirtModel';
import type { ProductType } from '@/types';

interface ProductViewerProps {
  productType: ProductType;
  color: string;
  productName?: string;
}

// Get the correct model path based on product name
function getModelPath(productName?: string): string {
  if (productName) {
    const nameLower = productName.toLowerCase();
    if (nameLower.includes('polo')) {
      return '/models/polo_t-shirt.glb';
    }
  }
  return '/models/t_shirt.glb';
}

export function ProductViewer({ productType, color, productName }: ProductViewerProps) {
  // Ensure client-side only rendering to prevent SSR/hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <div className="text-muted-foreground">Loading 3D viewer...</div>
      </div>
    );
  }

  const modelPath = getModelPath(productName);

  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        <Environment preset="studio" />

        <Suspense fallback={<LoadingPlaceholder />}>
          <Center>
            <ShirtModel color={color} modelPath={modelPath} />
          </Center>
        </Suspense>

        <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={5} blur={2} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
          minDistance={3}
          maxDistance={8}
        />
      </Canvas>
    </div>
  );
}
```

**Key Features**:

- SSR disabled via `useState` + `useEffect` pattern
- Model routing based on product name
- Studio environment for realistic lighting
- Orbit controls with zoom limits

---

## Step 5.6: Color Indicator Overlay

**File**: `src/components/3d/ColorOverlay.tsx`

```typescript
'use client';

import { Badge } from '@/components/ui/badge';

interface ColorOverlayProps {
  colorName: string;
  hexCode: string;
}

export function ColorOverlay({ colorName, hexCode }: ColorOverlayProps) {
  return (
    <div className="absolute bottom-4 left-4 z-10">
      <Badge variant="secondary" className="gap-2">
        <span
          className="h-3 w-3 rounded-full border"
          style={{ backgroundColor: hexCode }}
        />
        {colorName}
      </Badge>
    </div>
  );
}
```

---

## Step 5.7: Design Placement Overlay

**File**: `src/components/3d/DesignPlacementOverlay.tsx`

```typescript
'use client';

import { Badge } from '@/components/ui/badge';
import type { DesignPlacement } from '@/types/api';

interface DesignPlacementOverlayProps {
  designs: DesignPlacement[];
}

export function DesignPlacementOverlay({ designs }: DesignPlacementOverlayProps) {
  return (
    <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1">
      {designs.map((design, index) => (
        <Badge key={index} variant="outline" className="capitalize">
          {design.area}: {design.design_size}
        </Badge>
      ))}
    </div>
  );
}
```

---

## Step 5.8: Integrate into Product Configurator

**File**: `src/components/product/ProductConfigurator.tsx` (update)

Replace the placeholder color box with the actual 3D viewer:

```typescript
import { ProductViewer } from '@/components/3d/ProductViewer';
import { ColorOverlay } from '@/components/3d/ColorOverlay';
import { DesignPlacementOverlay } from '@/components/3d/DesignPlacementOverlay';

// In the component:
<div className="relative aspect-square">
  <ProductViewer
    productType={product.type}
    color={product.colors.find(c => c.color_name === selectedColor)?.hex_code || '#cccccc'}
    designAreas={designs}
  />
  <ColorOverlay
    colorName={selectedColor}
    hexCode={product.colors.find(c => c.color_name === selectedColor)?.hex_code || '#cccccc'}
  />
  <DesignPlacementOverlay designs={designs} />
</div>
```

---

## Step 5.9: Loading State

**File**: `src/components/3d/ProductViewerSkeleton.tsx`

```typescript
import { Skeleton } from '@/components/ui/skeleton';

export function ProductViewerSkeleton() {
  return (
    <div className="relative aspect-square w-full">
      <Skeleton className="h-full w-full rounded-lg" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-muted-foreground">Loading 3D view...</div>
      </div>
    </div>
  );
}
```

---

## Step 5.10: View Controls

**File**: `src/components/3d/ViewControls.tsx`

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface ViewControlsProps {
  onReset?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

export function ViewControls({ onReset, onZoomIn, onZoomOut }: ViewControlsProps) {
  return (
    <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
      <Button variant="secondary" size="icon" onClick={onReset}>
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button variant="secondary" size="icon" onClick={onZoomIn}>
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button variant="secondary" size="icon" onClick={onZoomOut}>
        <ZoomOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

---

## Step 5.11: Storybook Stories

**File**: `src/components/3d/__stories__/ProductViewer.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProductViewer } from '../ProductViewer';

const meta: Meta<typeof ProductViewer> = {
  title: '3D/ProductViewer',
  component: ProductViewer,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ShirtBlack: Story = {
  args: {
    productType: 'shirt',
    color: '#000000',
  },
};

export const ShirtRed: Story = {
  args: {
    productType: 'shirt',
    color: '#E5192B',
  },
};

export const ShirtWhite: Story = {
  args: {
    productType: 'shirt',
    color: '#FFFFFF',
  },
};

export const HoodieNavy: Story = {
  args: {
    productType: 'hoodie',
    color: '#001F3F',
  },
};

export const HoodieGray: Story = {
  args: {
    productType: 'hoodie',
    color: '#6B7280',
  },
};
```

---

## Future Improvements

### Design Texture Application

For applying uploaded designs as textures (planned for checkout phase):

```typescript
import { Decal, useTexture } from '@react-three/drei';

function DesignDecal({ url, position, scale }: DesignDecalProps) {
  const texture = useTexture(url);

  return (
    <Decal
      position={position}
      rotation={[0, 0, 0]}
      scale={scale}
      map={texture}
    />
  );
}
```

### Additional Models

Future models to add:

- Hoodie (`/models/hoodie.glb`)
- Hat (`/models/hat.glb`)
- Bag (`/models/bag.glb`)

---

## Deliverables Checklist

- [x] React Three Fiber dependencies installed
- [x] ProductViewer component with Canvas
- [x] ShirtModel with GLTF loading
- [ ] HoodieModel (uses fallback currently)
- [x] Dynamic imports (no SSR)
- [x] Black color adjustment for 3D visibility
- [x] Model routing (polo vs t-shirt)
- [ ] Color overlay component
- [ ] Design placement overlay
- [ ] View controls component
- [x] Loading state
- [x] Integration with ProductConfigurator
- [ ] Storybook stories for 3D components
- [x] Performance optimization (static thumbnails for listings)

---

## Files Created

| File                                  | Purpose                        | Status |
| ------------------------------------- | ------------------------------ | ------ |
| `src/components/3d/ProductViewer.tsx` | Main viewer with Canvas        | ✅     |
| `src/components/3d/ShirtModel.tsx`    | GLTF model loader with colors  | ✅     |
| `public/models/t_shirt.glb`           | T-shirt 3D model               | ✅     |
| `public/models/polo_t-shirt.glb`      | Polo shirt 3D model            | ✅     |
| `public/images/products/*.png`        | Static thumbnails for listings | ✅     |

## Files Pending

| File                                           | Purpose              |
| ---------------------------------------------- | -------------------- |
| `src/components/3d/ColorOverlay.tsx`           | Color indicator      |
| `src/components/3d/DesignPlacementOverlay.tsx` | Design badges        |
| `src/components/3d/ViewControls.tsx`           | Zoom/rotate controls |
| `src/components/3d/__stories__/*.stories.tsx`  | Storybook stories    |

---

## Technical Notes

### WebGL Context Limitations

Browsers limit WebGL contexts to ~8-16 per page. Attempted approaches:

1. **3D on all product cards** - Failed (context limit exceeded)
2. **Hover-only 3D loading** - Rejected (poor UX)
3. **Headless thumbnail generation** - Failed (`gl.texImage3D` not supported)

**Solution**: Static PNG thumbnails for product listings, 3D only on detail page.

### SSR/Hydration Issues

Three.js causes hydration mismatches with SSR. Fixed by:

1. `useState(false)` + `useEffect(() => setMounted(true))`
2. `dynamic()` import with `ssr: false`
3. Show loading placeholder until mounted

### Color Adjustments

Pure black (#000000) appears as "void black" in 3D. Solution:

- Check if all RGB channels < 0.08
- Replace with very dark gray (#1a1a1a)
- Does NOT affect dark colors like navy (#001f3f)

---

## Next Phase

→ **Phase 6: Shopping Cart**
