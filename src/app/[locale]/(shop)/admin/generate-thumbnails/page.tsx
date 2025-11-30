'use client';

/**
 * Thumbnail Generator Page
 * Open this page in browser to generate product thumbnails
 * Visit: /en/admin/generate-thumbnails
 */

import { useState, useRef, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { Center, Environment } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PRODUCT_TYPES = ['shirt', 'hoodie', 'hat', 'bag', 'apron'] as const;
type ProductType = (typeof PRODUCT_TYPES)[number];

// Model mapping - update when you add more models
const MODEL_MAPPING: Record<ProductType, string> = {
  shirt: '/models/t_shirt.glb',
  hoodie: '/models/t_shirt.glb',
  hat: '/models/t_shirt.glb',
  bag: '/models/t_shirt.glb',
  apron: '/models/t_shirt.glb',
};

export default function GenerateThumbnailsPage() {
  const [currentType, setCurrentType] = useState<ProductType | null>(null);
  const [generated, setGenerated] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateThumbnail = async (type: ProductType) => {
    setCurrentType(type);
    setIsGenerating(true);

    // Wait for render
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get canvas and create download
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');

      // Create download link
      const link = document.createElement('a');
      link.download = `${type}.png`;
      link.href = dataUrl;
      link.click();

      setGenerated((prev) => [...prev, type]);
    }

    setIsGenerating(false);
  };

  const generateAll = async () => {
    for (const type of PRODUCT_TYPES) {
      if (!generated.includes(type)) {
        await generateThumbnail(type);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  };

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Generate Product Thumbnails</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click each button to generate and download a PNG thumbnail. Save them to{' '}
            <code>public/images/products/</code>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preview Canvas */}
          <div className="mx-auto h-[512px] w-[512px] overflow-hidden rounded-lg border bg-[#f5f5f5]">
            {currentType ? (
              <Canvas
                camera={{ position: [0, 0, 4], fov: 45 }}
                gl={{ preserveDrawingBuffer: true, antialias: true }}
                dpr={2}
              >
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={0.8} />
                <directionalLight position={[-5, 5, -5]} intensity={0.4} />
                <Environment preset="studio" />
                <Center>
                  <ThumbnailModel modelPath={MODEL_MAPPING[currentType]} />
                </Center>
              </Canvas>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Select a product type to preview
              </div>
            )}
          </div>

          {/* Generate Buttons */}
          <div className="flex flex-wrap gap-2">
            {PRODUCT_TYPES.map((type) => (
              <Button
                key={type}
                onClick={() => generateThumbnail(type)}
                disabled={isGenerating}
                variant={generated.includes(type) ? 'secondary' : 'default'}
              >
                {generated.includes(type) ? '✓ ' : ''}
                {type}
              </Button>
            ))}
          </div>

          <Button onClick={generateAll} disabled={isGenerating} className="w-full">
            Generate All
          </Button>

          {generated.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Generated: {generated.join(', ')}
              <br />
              <strong>Move downloaded files to:</strong> public/images/products/
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ThumbnailModel({ modelPath }: { modelPath: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useLoader(GLTFLoader, modelPath);

  const scene = gltf.scene.clone(true);

  // Apply neutral gray color
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        child.material = child.material.clone();
        (child.material as THREE.MeshStandardMaterial).color = new THREE.Color('#888888');
      }
    });
  }, [scene]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={4} />
    </group>
  );
}
