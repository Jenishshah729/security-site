import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

const threePath = path.resolve('node_modules/three/build/three.module.js').replace(/\\/g, '/');

// Base cleaned background (768 x 1376)
const bgPath = 'C:/Users/Admin/.gemini/antigravity-ide/brain/fefe4294-e657-497d-ac9b-aff161e5f6dd/clean_legs_and_antennae.jpg';
const bgBase64 = fs.readFileSync(bgPath).toString('base64');

// High-res PBR 3D emblem texture
const emblemPath = 'C:/Users/Admin/.gemini/antigravity-ide/brain/fefe4294-e657-497d-ac9b-aff161e5f6dd/burp_pbr_3d_emblem.png';
const emblemBase64 = fs.readFileSync(emblemPath).toString('base64');

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
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, 768 / 1376, 0.1, 1000);
    camera.position.set(0, 0, 10);

    // Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0x1a2638, 1.4);
    scene.add(ambientLight);

    // Key Light from top-left (casting specular glints on bevels)
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 4.2);
    keyLight.position.set(-6, 9, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // Cyber Rim Light (cool blue specular on top-left edge)
    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 2.6);
    rimLight.position.set(-8, 4, 3);
    scene.add(rimLight);

    // Warm Orange Bounce Light from bottom-right (simulating circuit wires glow)
    const bounceLight = new THREE.DirectionalLight(0xff7700, 3.2);
    bounceLight.position.set(7, -6, 3);
    scene.add(bounceLight);

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

    // --- 3D BURP SUITE LOGO EMBLEM ---
    // Sized to ~ 2.4 units (which corresponds to ~ 260px on screen), perfectly covering the bug
    const size = 2.45;
    const logoShape = createRoundedRectShape(size, size, 0.52);
    const logoGeom = new THREE.ExtrudeGeometry(logoShape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelSegments: 16,
      steps: 2,
      bevelSize: 0.08,
      bevelThickness: 0.08
    });
    logoGeom.center();

    // Vibrant Glossy Burp Suite Orange
    const orangeMat = new THREE.MeshPhysicalMaterial({
      color: 0xFD7D00,
      emissive: 0x2b0d00,
      roughness: 0.12,
      metalness: 0.06,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      reflectivity: 0.95
    });
    const logoMesh = new THREE.Mesh(logoGeom, orangeMat);
    logoMesh.castShadow = true;
    logoMesh.receiveShadow = true;

    // --- 3D LIGHTNING / FRACTURE CUTOUT & CORE ---
    // Scaled to the 2.45 size
    const s = size / 296;
    const cx = 154;
    const cy = 162;

    const crackShape = new THREE.Shape();
    crackShape.moveTo((141 - cx)*s, -(20 - cy)*s);
    crackShape.lineTo((140 - cx)*s, -(52 - cy)*s);
    crackShape.lineTo((65 - cx)*s, -(145 - cy)*s);
    crackShape.lineTo((168 - cx)*s, -(145 - cy)*s);
    crackShape.lineTo((168 - cx)*s, -(175 - cy)*s);
    crackShape.lineTo((245 - cx)*s, -(180 - cy)*s);
    crackShape.lineTo((140 - cx)*s, -(268 - cy)*s);
    crackShape.lineTo((141 - cx)*s, -(300 - cy)*s);
    crackShape.lineTo((168 - cx)*s, -(300 - cy)*s);
    crackShape.lineTo((168 - cx)*s, -(268 - cy)*s);
    crackShape.lineTo((215 - cx)*s, -(215 - cy)*s);
    crackShape.lineTo((141 - cx)*s, -(204 - cy)*s);
    crackShape.lineTo((141 - cx)*s, -(175 - cy)*s);
    crackShape.lineTo((141 - cx)*s, -(148 - cy)*s);
    crackShape.lineTo((89 - cx)*s, -(116 - cy)*s);
    crackShape.lineTo((168 - cx)*s, -(52 - cy)*s);
    crackShape.lineTo((168 - cx)*s, -(20 - cy)*s);
    crackShape.closePath();

    const crackGeom = new THREE.ExtrudeGeometry(crackShape, {
      depth: 0.10,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.025
    });
    crackGeom.center();

    // Pure White Glowing Resin Material
    const whiteMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.35,
      roughness: 0.08,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04
    });
    const crackMesh = new THREE.Mesh(crackGeom, whiteMat);
    crackMesh.position.z = 0.16; // Embossed on front face
    crackMesh.castShadow = true;

    // Contact Shadow Plane (invisible plane that receives shadow)
    const shadowPlaneGeom = new THREE.PlaneGeometry(6, 6);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.55 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeom, shadowPlaneMat);
    shadowPlane.position.z = -0.12;
    shadowPlane.receiveShadow = true;

    const emblemGroup = new THREE.Group();
    emblemGroup.add(logoMesh);
    emblemGroup.add(crackMesh);
    emblemGroup.add(shadowPlane);

    // 3D Perspective Rotation matching Image 1
    emblemGroup.rotation.x = THREE.MathUtils.degToRad(11.5);
    emblemGroup.rotation.y = THREE.MathUtils.degToRad(-16.5);
    emblemGroup.rotation.z = THREE.MathUtils.degToRad(-5.5);

    // Positioned directly at the center of the badge (covering the bug)
    emblemGroup.position.set(-0.22, 0.44, 0);

    scene.add(emblemGroup);

    let frames = 0;
    function animate() {
      renderer.render(scene, camera);
      frames++;
      if (frames < 6) {
        requestAnimationFrame(animate);
      } else {
        window.renderComplete = true;
        console.log('Final cover rendered!');
      }
    }
    animate();
  </script>
</body>
</html>
`;

const htmlPath = path.resolve('render_final_cover.html');
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
    await new Promise(r => setTimeout(r, 600));
    
    const outCover = 'C:/Users/Admin/.gemini/antigravity-ide/brain/fefe4294-e657-497d-ac9b-aff161e5f6dd/burp_suite_perfect_3d_cover.jpg';
    await page.screenshot({ 
      path: outCover, 
      type: 'jpeg', 
      quality: 100 
    });
    
    await browser.close();
    console.log('Saved final cover to:', outCover);
  } catch (e) {
    console.error('Error during final cover render:', e);
  }
})();
