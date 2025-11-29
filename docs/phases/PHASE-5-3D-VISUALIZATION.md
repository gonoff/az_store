# Phase 5: 3D Product Visualization

**Status**: ⏳ Pending
**Dependencies**: Phase 4 (Product Catalog)

## Overview

Implement interactive 3D product visualization using React Three Fiber with programmatic models (replaceable with GLTF later).

## Goals

- React Three Fiber setup
- Programmatic 3D shirt/hoodie models
- Dynamic color changing
- Interactive rotation controls
- Design placement preview
- Responsive canvas
- Performance optimization

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

## Step 5.3: Programmatic Shirt Model

**File**: `src/components/3d/ShirtModel.tsx`

```typescript
'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ShirtModelProps {
  color: string;
  designTexture?: string;
}

export function ShirtModel({ color, designTexture }: ShirtModelProps) {
  const meshRef = useRef<THREE.Group>(null);

  // Create shirt geometry programmatically
  const shirtGeometry = useMemo(() => {
    // Main body - simplified t-shirt shape
    const shape = new THREE.Shape();

    // Outline of shirt front (simplified)
    shape.moveTo(-0.8, -1.2);  // Bottom left
    shape.lineTo(-0.8, 0.3);   // Left side
    shape.lineTo(-1.2, 0.5);   // Left shoulder
    shape.lineTo(-1.2, 0.8);   // Left sleeve top
    shape.lineTo(-0.5, 0.8);   // Armpit left
    shape.lineTo(-0.3, 1.0);   // Neck left
    shape.lineTo(0.3, 1.0);    // Neck right
    shape.lineTo(0.5, 0.8);    // Armpit right
    shape.lineTo(1.2, 0.8);    // Right sleeve top
    shape.lineTo(1.2, 0.5);    // Right shoulder
    shape.lineTo(0.8, 0.3);    // Right side
    shape.lineTo(0.8, -1.2);   // Bottom right
    shape.lineTo(-0.8, -1.2);  // Back to start

    const extrudeSettings = {
      steps: 1,
      depth: 0.15,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  // Material with the selected color
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.8,
      metalness: 0.1,
    });
  }, [color]);

  // Gentle rotation animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Front of shirt */}
      <mesh geometry={shirtGeometry} material={material} position={[0, 0, 0]} />

      {/* Back of shirt (slightly behind) */}
      <mesh
        geometry={shirtGeometry}
        material={material}
        position={[0, 0, -0.15]}
        rotation={[0, Math.PI, 0]}
      />

      {/* Collar */}
      <mesh position={[0, 0.95, 0.075]}>
        <torusGeometry args={[0.25, 0.05, 8, 32, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  );
}
```

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

```typescript
'use client';

import { Suspense, lazy } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProductType } from '@/types/api';

// Dynamic import to avoid SSR issues
const ProductCanvas = dynamic(
  () => import('./ProductCanvas').then((mod) => mod.ProductCanvas),
  { ssr: false, loading: () => <Skeleton className="aspect-square w-full rounded-lg" /> }
);

const ShirtModel = dynamic(
  () => import('./ShirtModel').then((mod) => mod.ShirtModel),
  { ssr: false }
);

const HoodieModel = dynamic(
  () => import('./HoodieModel').then((mod) => mod.HoodieModel),
  { ssr: false }
);

interface ProductViewerProps {
  productType: ProductType;
  color: string;
  designAreas?: Array<{
    area: 'front' | 'back' | 'sleeve';
    designSize: string;
  }>;
}

export function ProductViewer({ productType, color, designAreas }: ProductViewerProps) {
  const renderModel = () => {
    switch (productType) {
      case 'shirt':
        return <ShirtModel color={color} />;
      case 'hoodie':
        return <HoodieModel color={color} />;
      default:
        // Fallback for unsupported types
        return (
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
    }
  };

  return (
    <ProductCanvas>
      {renderModel()}
    </ProductCanvas>
  );
}
```

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

### GLTF Model Loading

When GLTF models are available, update the models to use `useGLTF`:

```typescript
import { useGLTF } from '@react-three/drei';

export function ShirtModelGLTF({ color }: { color: string }) {
  const { nodes, materials } = useGLTF('/models/shirt.glb');

  // Clone material and update color
  const material = materials.fabric.clone();
  material.color.set(color);

  return (
    <mesh geometry={nodes.Shirt.geometry} material={material} />
  );
}

useGLTF.preload('/models/shirt.glb');
```

### Design Texture Application

For applying uploaded designs as textures:

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

---

## Deliverables Checklist

- [ ] React Three Fiber dependencies installed
- [ ] ProductCanvas wrapper component
- [ ] ShirtModel programmatic model
- [ ] HoodieModel programmatic model
- [ ] ProductViewer component
- [ ] Dynamic imports (no SSR)
- [ ] Color overlay component
- [ ] Design placement overlay
- [ ] View controls component
- [ ] Loading skeleton
- [ ] Integration with ProductConfigurator
- [ ] Storybook stories for 3D components
- [ ] Performance optimization

---

## Files to Create

| File                                           | Purpose               |
| ---------------------------------------------- | --------------------- |
| `src/components/3d/ProductCanvas.tsx`          | 3D canvas wrapper     |
| `src/components/3d/ShirtModel.tsx`             | Programmatic shirt    |
| `src/components/3d/HoodieModel.tsx`            | Programmatic hoodie   |
| `src/components/3d/ProductViewer.tsx`          | Main viewer component |
| `src/components/3d/ColorOverlay.tsx`           | Color indicator       |
| `src/components/3d/DesignPlacementOverlay.tsx` | Design badges         |
| `src/components/3d/ViewControls.tsx`           | Zoom/rotate controls  |
| `src/components/3d/ProductViewerSkeleton.tsx`  | Loading state         |
| `src/components/3d/index.ts`                   | Barrel exports        |
| `src/components/3d/__stories__/*.stories.tsx`  | Storybook stories     |

---

## Next Phase

→ **Phase 6: Shopping Cart**
