/**
 * GLB to PNG Thumbnail Generator
 * Renders 3D models to static PNG images using Puppeteer
 *
 * Usage: node scripts/generate-thumbnails.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const CONFIG = {
  width: 512,
  height: 512,
  modelsDir: path.join(__dirname, '../public/models'),
  outputDir: path.join(__dirname, '../public/images/products'),
};

// Product type to model mapping
const MODEL_MAPPING = {
  shirt: 't_shirt.glb',
  hoodie: 't_shirt.glb',
  hat: 't_shirt.glb',
  bag: 't_shirt.glb',
  apron: 't_shirt.glb',
};

/**
 * Generate HTML for rendering a model (with embedded base64 model data)
 */
function generateHTML(modelBase64, color = '#888888') {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #f5f5f5; }
    canvas { display: block; }
  </style>
  <script type="importmap">
  {
    "imports": {
      "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
      "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
    }
  }
  </script>
</head>
<body>
  <script type="module">
    import * as THREE from 'three';
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

    const width = ${CONFIG.width};
    const height = ${CONFIG.height};
    const modelBase64 = '${modelBase64}';
    const modelColor = '${color}';

    // Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);
    const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
    backLight.position.set(-5, 5, -5);
    scene.add(backLight);

    // Decode base64 to ArrayBuffer
    function base64ToArrayBuffer(base64) {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    }

    try {
      // Load model from base64
      const loader = new GLTFLoader();
      const arrayBuffer = base64ToArrayBuffer(modelBase64);

      loader.parse(arrayBuffer, '', (gltf) => {
        const model = gltf.scene;
        model.scale.setScalar(4);

        // Apply color
        model.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material = child.material.clone();
            child.material.color = new THREE.Color(modelColor);
          }
        });

        // Center model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        scene.add(model);

        // Render
        renderer.render(scene, camera);

        // Signal done
        window.renderComplete = true;
      }, (error) => {
        console.error('Error parsing model:', error);
        window.renderError = error.message || 'Parse error';
      });
    } catch (e) {
      console.error('Error:', e);
      window.renderError = e.message;
    }
  </script>
</body>
</html>
`;
}

/**
 * Generate thumbnail for a product type
 */
async function generateThumbnail(browser, productType, modelFile, color = '#888888') {
  console.log(`Generating thumbnail for ${productType}...`);

  const modelPath = path.join(CONFIG.modelsDir, modelFile);

  if (!fs.existsSync(modelPath)) {
    console.error(`  Model not found: ${modelPath}`);
    return false;
  }

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: CONFIG.width, height: CONFIG.height });

    // Read model and convert to base64
    const modelBuffer = fs.readFileSync(modelPath);
    const modelBase64 = modelBuffer.toString('base64');

    const html = generateHTML(modelBase64, color);

    // Log console messages from the page
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`  Browser error: ${msg.text()}`);
      }
    });

    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Wait for render to complete
    await page.waitForFunction(() => window.renderComplete || window.renderError, {
      timeout: 30000,
    });

    // Check for errors
    const error = await page.evaluate(() => window.renderError);
    if (error) {
      throw new Error(error);
    }

    // Take screenshot
    const outputPath = path.join(CONFIG.outputDir, `${productType}.png`);
    await page.screenshot({ path: outputPath, type: 'png' });
    console.log(`  Saved: ${outputPath}`);

    await page.close();
    return true;
  } catch (error) {
    console.error(`  Error generating thumbnail for ${productType}:`, error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('GLB to PNG Thumbnail Generator (Puppeteer)');
  console.log('==========================================\n');

  // Ensure output directory exists
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // Launch browser with WebGL support
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=swiftshader', '--enable-webgl'],
  });

  // Generate thumbnails for each product type
  const productTypes = Object.keys(MODEL_MAPPING);
  let success = 0;
  let failed = 0;

  for (const productType of productTypes) {
    const modelFile = MODEL_MAPPING[productType];
    const result = await generateThumbnail(browser, productType, modelFile);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  await browser.close();

  console.log(`\nDone! Generated ${success} thumbnails, ${failed} failed.`);
}

main().catch(console.error);
