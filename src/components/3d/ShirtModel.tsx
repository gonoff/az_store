'use client';

/**
 * ShirtModel Component
 * 3D shirt model using GLTF
 * Uses the same model for all product types (can be extended later)
 */

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ShirtModelProps {
  color: string;
  modelPath?: string;
}

// Adjust pure black to prevent "void black" appearance
function adjustColorFor3D(hexColor: string): string {
  const color = new THREE.Color(hexColor);

  // Only adjust if ALL color channels are very low (true black, not dark blue/red/etc)
  if (color.r < 0.08 && color.g < 0.08 && color.b < 0.08) {
    return '#1a1a1a'; // Very dark gray instead of pure black
  }
  return hexColor;
}

const DEFAULT_MODEL = '/models/t_shirt.glb';

export function ShirtModel({ color, modelPath = DEFAULT_MODEL }: ShirtModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);

  // Adjust color for better 3D visibility
  const adjustedColor = adjustColorFor3D(color);

  // Apply color to the model's materials
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        // Clone material to avoid affecting other instances
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
