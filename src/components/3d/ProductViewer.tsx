'use client';

/**
 * ProductViewer Component
 * 3D canvas wrapper with lighting and controls
 * Uses client-side only rendering to avoid SSR/hydration issues
 */

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Environment, ContactShadows } from '@react-three/drei';
import { ShirtModel } from './ShirtModel';
import type { ProductType } from '@/types';

interface ProductViewerProps {
  productType: ProductType;
  color: string;
  productName?: string; // Reserved for future use (e.g., displaying name in 3D)
}

export function ProductViewer({ productType, color, productName }: ProductViewerProps) {
  // Ensure client-side only rendering to prevent SSR/hydration mismatch
  const [mounted, setMounted] = useState(false);

  // This pattern is intentional for client-only rendering in Next.js
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Show loading state until mounted on client
  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <div className="text-muted-foreground">Loading 3D viewer...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true }} dpr={[1, 2]}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />

        {/* Environment for reflections */}
        <Environment preset="studio" />

        {/* Model */}
        <Suspense fallback={<LoadingPlaceholder />}>
          <Center>
            <ProductModel productType={productType} color={color} productName={productName} />
          </Center>
        </Suspense>

        {/* Shadow */}
        <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={5} blur={2} />

        {/* Controls */}
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

/**
 * Get the correct model path based on product name and type
 */
function getModelPath(productName?: string): string {
  // Check product name for specific styles
  if (productName) {
    const nameLower = productName.toLowerCase();
    if (nameLower.includes('polo')) {
      return '/models/polo_t-shirt.glb';
    }
  }
  // Default to t-shirt model
  return '/models/t_shirt.glb';
}

/**
 * ProductModel - Routes to correct model based on product type and name
 */
function ProductModel({
  color,
  productName,
}: {
  productType: ProductType;
  color: string;
  productName?: string;
}) {
  const modelPath = getModelPath(productName);
  return <ShirtModel color={color} modelPath={modelPath} />;
}

/**
 * Loading placeholder while model loads
 */
function LoadingPlaceholder() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#e0e0e0" wireframe />
    </mesh>
  );
}
