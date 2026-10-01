import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

const threePath = path.resolve('node_modules/three/build/three.module.js').replace(/\\/g, '/');

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
      width: 1000px;
      height: 1000px;
      background: transparent;
      overflow: hidden;
    }
    #c {
      width: 1000px;
      height: 1000px;
      display: block;
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
    renderer.setSize(1000, 1000);
    renderer.setPixelRatio(2);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
    camera.position.set(0, 0, 10);

    // Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0x223344, 1.4);
    scene.add(ambientLight);

    // Key Light from top-left (casting specular glints on bevels)
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 4.2);
    keyLight.position.set(-6, 9, 8);
    scene.add(keyLight);

    // Cyber Rim Light (cool blue specular on top-left edge)
    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 2.8);
    rimLight.position.set(-8, 4, 3);
    scene.add(rimLight);

    // Warm Orange Bounce Light from bottom-right (simulating circuit wires glow)
    const bounceLight = new THREE.DirectionalLight(0xff7700, 3.0);
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
    const logoShape = createRoundedRectShape(3.4, 3.4, 0.7);
    const logoGeom = new THREE.ExtrudeGeometry(logoShape, {
      depth: 0.35,
      bevelEnabled: true,
      bevelSegments: 16,
      steps: 2,
      bevelSize: 0.14,
      bevelThickness: 0.14
    });
    logoGeom.center();

    const textureLoader = new THREE.TextureLoader();
    const diffuseTex = textureLoader.load('data:image/png;base64,${diffuseBase64}');
    diffuseTex.colorSpace = THREE.SRGBColorSpace;
    const normalTex = textureLoader.load('data:image/png;base64,${normalMapBase64}');

    const logoMat = new THREE.MeshPhysicalMaterial({
      map: diffuseTex,
      normalMap: normalTex,
      normalScale: new THREE.Vector2(3.0, 3.0),
      color: 0xffffff,
      metalness: 0.05,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.95
    });

    const logoMesh = new THREE.Mesh(logoGeom, logoMat);

    // --- INNER LIGHTNING CORE (Emissive + Beveled for extra 3D punch) ---
    const s = 3.4 / 296;
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

    const group = new THREE.Group();
    group.add(logoMesh);

    // Exact 3D Perspective Rotation matching Image 1
    group.rotation.x = THREE.MathUtils.degToRad(11.5);
    group.rotation.y = THREE.MathUtils.degToRad(-16.5);
    group.rotation.z = THREE.MathUtils.degToRad(-5.5);

    scene.add(group);

    let frames = 0;
    function animate() {
      renderer.render(scene, camera);
      frames++;
      if (frames < 6) {
        requestAnimationFrame(animate);
      } else {
        window.renderComplete = true;
      }
    }
    animate();
  </script>
</body>
</html>
`;

const htmlPath = path.resolve('render_emblem.html');
fs.writeFileSync(htmlPath, html);

(async () => {
  try {
    const browser = await puppeteer.launch({ 
      executablePath, 
      headless: true,
      args: ['--enable-webgl', '--use-gl=angle', '--allow-file-access-from-files']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1000, height: 1000 });
    await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.renderComplete === true, { timeout: 10000 });
    await new Promise(r => setTimeout(r, 600));
    
    const outPng = 'C:/Users/Admin/.gemini/antigravity-ide/brain/fefe4294-e657-497d-ac9b-aff161e5f6dd/burp_logo_emblem_3d.png';
    await page.screenshot({ 
      path: outPng, 
      omitBackground: true 
    });
    
    await browser.close();
    console.log('Saved 3D emblem to:', outPng);
  } catch (e) {
    console.error('Error during emblem render:', e);
  }
})();
