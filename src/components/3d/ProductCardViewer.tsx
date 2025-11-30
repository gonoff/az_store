'use client';

/**
 * ProductCardViewer Component
 * Lightweight 3D preview for product cards
 * Static view with slow auto-rotation, no user controls
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Center, Environment } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import type { ProductType } from '@/types';

interface ProductCardViewerProps {
  productType: ProductType;
  color?: string;
}

export function ProductCardViewer({ productType, color = '#888888' }: ProductCardViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [hasError, setHasError] = useState(false);

  // This pattern is intentional for client-only rendering in Next.js
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted || hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted-foreground/20" />
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        onError={() => setHasError(true)}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <Environment preset="studio" />

        <Center>
          <CardModel productType={productType} color={color} />
        </Center>
      </Canvas>
    </div>
  );
}

/**
 * CardModel - Simplified model for card preview
 * Uses useLoader directly for better control over loading
 */
function CardModel({ color }: { productType: ProductType; color: string }) {
  const groupRef = useRef<THREE.Group>(null);

  // Use useLoader which handles caching properly
  const gltf = useLoader(GLTFLoader, '/models/t_shirt.glb');

  // Clone the scene for this instance
  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);

    // Clone materials for this instance
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map((mat) => mat.clone());
        } else {
          child.material = child.material.clone();
        }
      }
    });

    return cloned;
  }, [gltf.scene]);

  // Apply color
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const material = child.material as THREE.MeshStandardMaterial;
        if (material.color) {
          material.color.set(color);
        }
      }
    });
  }, [scene, color]);

  // Slow rotation
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={3} />
    </group>
  );
}
