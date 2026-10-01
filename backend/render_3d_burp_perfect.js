import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

const threePath = path.resolve('node_modules/three/build/three.module.js').replace(/\\/g, '/');

// Base background (768 x 1376)
const bgPath = 'C:/Users/Admin/.gemini/antigravity-ide/brain/6b69f536-f8f4-4e04-b189-39701c0c3532/burp_suite_v2_1790261795579.jpg';
const bgBase64 = fs.readFileSync(bgPath).toString('base64');

// Normal map & diffuse texture
const normalMapBase64 = fs.readFileSync('C:/Users/Admin/.gemini/antigravity-ide/brain/fefe4294-e657-497d-ac9b-aff161e5f6dd/logo_normalmap.png').toString('base64');
const diffuseBase64 = fs.readFileSync('C:/Users/Admin/.gemini/antigravity-ide/brain/fefe4294-e657-497d-ac9b-aff161e5f6dd/burp_logo_transparent.png').toString('base64');

const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 768px;
      height: 1376px;
      background: url(data:image/jpeg;base64,${bgBase64}) no-repeat center center;
      background-size: cover;
      overflow: hidden;
      position: relative;
    }
    #c {
      width: 768px;
      height: 1376px;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 10;
    }
  </style>
  <script type="importmap">
    {
      "imports": {
        "three": "file:///${threePath}"
      }
    }
  </script>
</head>
<body>
  <canvas id="c"></canvas>
  <script type="module">
    import * as THREE from 'three';

    const canvas = document.getElementById('c');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(768, 1376);
    renderer.setPixelRatio(2);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, 768 / 1376, 0.1, 1000);
    camera.position.set(0, 0, 10);

    // Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.5);
    scene.add(ambientLight);

    // Key Light from top-left (casting specular glints on bevels)
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 4.0);
    keyLight.position.set(-6, 9, 8);
    scene.add(keyLight);

    // Cyber Rim Light (cool blue specular on chassis edge)
    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 2.8);
    rimLight.position.set(-8, 4, 3);
    scene.add(rimLight);

    // Warm Orange Bounce Light from bottom-right (simulating circuit wires glow)
    const bounceLight = new THREE.DirectionalLight(0xff7700, 3.2);
    bounceLight.position.set(7, -6, 3);
    scene.add(bounceLight);

    // Top subtle highlight light
    const topLight = new THREE.DirectionalLight(0xffffff, 1.8);
    topLight.position.set(0, 8, 4);
    scene.add(topLight);

    // Helper: Rounded Rectangle Shape
    function createRoundedRectShape(w, h, r) {
      const shape = new THREE.Shape();
      const x = -w / 2;
      const y = -h / 2;
      shape.moveTo(x + r, y);
      shape.lineTo(x + w - r, y);
      shape.quadraticCurveTo(x + w, y, x + w, y + r);
      shape.lineTo(x + w, y + h - r);
      shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      shape.lineTo(x + r, y + h);
      shape.quadraticCurveTo(x, y + h, x, y + h - r);
      shape.lineTo(x, y + r);
      shape.quadraticCurveTo(x, y, x + r, y);
      return shape;
    }

    // --- 1. CHASSIS (Dark Metallic Frame) ---
    // Scaled to fit exactly over the original box
    const chassisShape = createRoundedRectShape(3.85, 3.85, 0.85);
    const chassisGeom = new THREE.ExtrudeGeometry(chassisShape, {
      depth: 0.5,
      bevelEnabled: true,
      bevelSegments: 16,
      steps: 2,
      bevelSize: 0.2,
      bevelThickness: 0.2
    });
    chassisGeom.center();

    const chassisMat = new THREE.MeshPhysicalMaterial({
      color: 0x18202c,
      metalness: 0.85,
      roughness: 0.25,
      clearcoat: 0.5,
      clearcoatRoughness: 0.15
    });
    const chassisMesh = new THREE.Mesh(chassisGeom, chassisMat);

    // --- 2. INNER METALLIC BEVEL RIM ---
    const rimShape = createRoundedRectShape(3.55, 3.55, 0.75);
    const rimGeom = new THREE.ExtrudeGeometry(rimShape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelSegments: 12,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08
    });
    rimGeom.center();

    const silverRimMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.15,
      clearcoat: 0.9
    });
    const rimMesh = new THREE.Mesh(rimGeom, silverRimMat);
    rimMesh.position.z = 0.26;

    // --- 3. 3D BURP SUITE LOGO FACEPLATE ---
    // Texture loader with base64
    const textureLoader = new THREE.TextureLoader();
    const diffuseTex = textureLoader.load('data:image/png;base64,${diffuseBase64}');
    diffuseTex.colorSpace = THREE.SRGBColorSpace;

    const normalTex = textureLoader.load('data:image/png;base64,${normalMapBase64}');

    const faceShape = createRoundedRectShape(3.35, 3.35, 0.7);
    const faceGeom = new THREE.ExtrudeGeometry(faceShape, {
      depth: 0.15,
      bevelEnabled: true,
      bevelSegments: 16,
      steps: 2,
      bevelSize: 0.08,
      bevelThickness: 0.08
    });
    faceGeom.center();

    // High-end PBR material with normal map and glossy clearcoat
    const faceMat = new THREE.MeshPhysicalMaterial({
      map: diffuseTex,
      normalMap: normalTex,
      normalScale: new THREE.Vector2(2.5, 2.5),
      metalness: 0.06,
      roughness: 0.14,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      reflectivity: 0.95,
      emissive: 0x220a00,
      emissiveIntensity: 0.15
    });

    const faceMesh = new THREE.Mesh(faceGeom, faceMat);
    faceMesh.position.z = 0.35;

    // Assemble the complete 3D Module
    const moduleGroup = new THREE.Group();
    moduleGroup.add(chassisMesh);
    moduleGroup.add(rimMesh);
    moduleGroup.add(faceMesh);

    // 3D Perspective Rotation matching Image 1
    moduleGroup.rotation.x = THREE.MathUtils.degToRad(11.5);
    moduleGroup.rotation.y = THREE.MathUtils.degToRad(-16.5);
    moduleGroup.rotation.z = THREE.MathUtils.degToRad(-5.5);
    
    // Positioned directly over the original badge center (x=395, y=560 in 768x1376 canvas)
    // In camera space:
    moduleGroup.position.set(-0.25, 0.46, 0);

    scene.add(moduleGroup);

    // Render loop to ensure textures are uploaded to GPU
    let frames = 0;
    function animate() {
      renderer.render(scene, camera);
      frames++;
      if (frames < 5) {
        requestAnimationFrame(animate);
      } else {
        window.renderComplete = true;
        console.log('Complete 3D scene rendered with textures and normal mapping!');
      }
    }
    animate();
  </script>
</body>
</html>
`;

const htmlPath = path.resolve('render_perfect.html');
fs.writeFileSync(htmlPath, html);

(async () => {
  try {
    const browser = await puppeteer.launch({ 
      executablePath, 
      headless: true,
      args: ['--enable-webgl', '--use-gl=angle', '--allow-file-access-from-files']
    });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    
    await page.setViewport({ width: 768, height: 1376 });
    await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.renderComplete === true, { timeout: 10000 });
    await new Promise(r => setTimeout(r, 800));
    
    // 1. Save high-res PNG
    const outPng = 'C:/Users/Admin/.gemini/antigravity-ide/brain/fefe4294-e657-497d-ac9b-aff161e5f6dd/burp_suite_3d_final.png';
    const outJpg = 'C:/Users/Admin/.gemini/antigravity-ide/brain/fefe4294-e657-497d-ac9b-aff161e5f6dd/burp_suite_3d_final.jpg';
    
    await page.screenshot({ path: outPng, type: 'png' });
    await page.screenshot({ path: outJpg, type: 'jpeg', quality: 100 });
    
    // Also save to frontend/public/burp-suite.jpg and frontend/dist/burp-suite.jpg
    fs.copyFileSync(outJpg, 'C:/Users/Admin/OneDrive/Pictures/Documents/thejenishshah/frontend/public/burp-suite.jpg');
    if (fs.existsSync('C:/Users/Admin/OneDrive/Pictures/Documents/thejenishshah/frontend/dist/burp-suite.jpg')) {
      fs.copyFileSync(outJpg, 'C:/Users/Admin/OneDrive/Pictures/Documents/thejenishshah/frontend/dist/burp-suite.jpg');
    }
    
    await browser.close();
    console.log('Saved final cover image to:', outJpg);
  } catch (e) {
    console.error('Error during render:', e);
  }
})();
