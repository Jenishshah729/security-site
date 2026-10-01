import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

const outDir = path.resolve('../frontend/public');

const covers = [
  // 1. Beginner Blind Spots — "The Shattered Map"
  {
    id: 'top-10-mistakes',
    outName: 'top-10-mistakes.png',
    altOutName: 'top-10-mistakes.jpg',
    accentColor: '#FF3B3B',
    coverTitle: 'BEGINNER BLIND SPOTS',
    coverSubtitle: "Don't learn these the hard way.",
    titleSize: '118px',
    layoutType: 'shattered-map',
    htmlContent: `
      <!-- Fractured Fracture Lines radiating from Numeral -->
      <svg class="bg-layer" viewBox="0 0 1600 2560" width="1600" height="2560" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#FF3B3B" stroke-width="3" fill="none" opacity="0.18" stroke-linecap="round">
          <path d="M 520 480 L 100 150 L 0 50" />
          <path d="M 520 480 L 300 0" />
          <path d="M 520 480 L 900 100 L 1400 0" />
          <path d="M 520 480 L 1350 400 L 1600 350" />
          <path d="M 520 480 L 1200 800 L 1600 1000" />
          <path d="M 520 480 L 850 950 L 1300 1400 L 1600 1800" />
          <path d="M 520 480 L 500 1100 L 650 1700 L 800 2560" />
          <path d="M 520 480 L 250 1050 L 100 1700 L 0 2200" />
          <path d="M 520 480 L 0 850" />
          <!-- Cross fractures -->
          <path d="M 300 300 L 600 200" />
          <path d="M 1000 300 L 1300 600" />
          <path d="M 350 1150 L 800 1300" />
        </g>
      </svg>

      <!-- Giant Fractured Numeral 10 -->
      <div style="position: absolute; top: 220px; left: 260px; z-index: 3;">
        <svg viewBox="0 0 900 650" width="900" height="650" xmlns="http://www.w3.org/2000/svg">
          <text x="380" y="520" font-family="'Archivo Black', sans-serif" font-weight="900" font-size="640" fill="#FF3B3B" letter-spacing="-0.03em">10</text>
          <!-- Cracks tearing through numeral -->
          <g stroke="#0B0F19" stroke-width="12" fill="none" stroke-linecap="round">
            <path d="M 160 120 L 220 280 L 190 420 L 240 540" />
            <path d="M 440 140 L 510 310 L 460 450 L 530 520" />
            <path d="M 120 340 L 320 310" />
            <path d="M 410 290 L 630 330" />
          </g>
        </svg>

        <!-- Warning Triangle Badge Overlapping Bottom-Right of Numeral -->
        <div style="position: absolute; bottom: 40px; right: 80px; width: 130px; height: 130px; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.8));">
          <svg viewBox="0 0 130 130" width="130" height="130" xmlns="http://www.w3.org/2000/svg">
            <polygon points="65,10 122,112 8,112" fill="#0B0F19" stroke="#FF3B3B" stroke-width="10" stroke-linejoin="round" />
            <rect x="59" y="42" width="12" height="40" rx="6" fill="#FF3B3B" />
            <circle cx="65" cy="94" r="7" fill="#FF3B3B" />
          </svg>
        </div>
      </div>

      <!-- Title & Subtitle Block -->
      <div class="title-container" style="top: 1320px;">
        <h1 class="main-title">BEGINNER BLIND SPOTS</h1>
        <p class="subtitle" style="color: #FF3B3B;">Don't learn these the hard way.</p>
      </div>
    `
  },

  // 2. The Hacker's Arsenal — "The Reveal"
  {
    id: 'hackers-toolkit',
    outName: 'hackers-toolkit.jpg',
    accentColor: '#FF9F1C',
    coverTitle: "THE HACKER'S ARSENAL",
    coverSubtitle: "Free. Proven. Actually used.",
    titleSize: '115px',
    layoutType: 'reveal',
    htmlContent: `
      <!-- Scattered Tool Silhouettes near Edges -->
      <svg class="bg-layer" viewBox="0 0 1600 2560" width="1600" height="2560" xmlns="http://www.w3.org/2000/svg">
        <g fill="#FF9F1C" opacity="0.08">
          <!-- Wrench Top Left -->
          <path transform="translate(120, 180) scale(1.5) rotate(25)" d="M 40 40 L 80 80 M 70 30 C 60 20 40 25 35 35 C 30 45 35 60 45 65 Z" stroke="#FF9F1C" stroke-width="4" />
          <!-- Screwdriver Top Right -->
          <path transform="translate(1380, 220) scale(1.6) rotate(-35)" d="M 10 10 L 60 60 M 50 50 L 70 70" stroke="#FF9F1C" stroke-width="6" stroke-linecap="round" />
          <!-- Cable Connector Left Edge -->
          <rect x="90" y="900" width="60" height="40" rx="6" />
          <path d="M 120 940 L 120 980" stroke="#FF9F1C" stroke-width="8" />
          <!-- Key Right Edge -->
          <circle cx="1480" cy="950" r="25" stroke="#FF9F1C" stroke-width="6" fill="none" />
          <rect x="1440" y="945" width="60" height="10" />
          <!-- Shield Bottom Left -->
          <path transform="translate(150, 1800) scale(1.4)" d="M 40 10 L 70 25 C 70 60 55 80 40 90 C 25 80 10 60 10 25 Z" stroke="#FF9F1C" stroke-width="4" fill="none" />
          <!-- Terminal Bottom Right -->
          <rect x="1350" y="1850" width="100" height="70" rx="8" stroke="#FF9F1C" stroke-width="4" fill="none" />
        </g>
      </svg>

      <!-- Radial Starburst Rays behind Icon -->
      <div style="position: absolute; top: 300px; left: 450px; width: 700px; height: 700px; z-index: 2; opacity: 0.3;">
        <svg viewBox="0 0 700 700" width="700" height="700" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#FF9F1C" stroke-width="3" stroke-dasharray="12,12">
            ${Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 15) * Math.PI / 180;
              const x2 = 350 + 330 * Math.cos(angle);
              const y2 = 350 + 330 * Math.sin(angle);
              return `<line x1="350" y1="350" x2="${x2}" y2="${y2}" />`;
            }).join('')}
          </g>
        </svg>
      </div>

      <!-- Solid Toolbox Icon -->
      <div class="icon-container" style="top: 480px; filter: drop-shadow(0 0 35px rgba(255, 159, 28, 0.4));">
        <svg viewBox="0 0 320 320" width="320" height="320" xmlns="http://www.w3.org/2000/svg">
          <g fill="#FF9F1C">
            <path d="M 110 70 C 110 45 135 30 160 30 C 185 30 210 45 210 70 L 210 90 L 110 90 Z" fill="none" stroke="#FF9F1C" stroke-width="16" stroke-linecap="round" />
            <path d="M 30 100 L 290 100 C 305 100 315 110 310 125 L 280 290 C 275 302 262 310 248 310 L 72 310 C 58 310 45 302 40 290 L 10 125 C 5 110 15 100 30 100 Z" />
            <line x1="20" y1="170" x2="300" y2="170" stroke="#0B0F19" stroke-width="12" stroke-linecap="round" />
            <rect x="140" y="152" width="40" height="36" rx="6" fill="#0B0F19" />
          </g>
        </svg>
      </div>

      <!-- Title & Subtitle Block -->
      <div class="title-container" style="top: 1320px;">
        <h1 class="main-title">THE HACKER'S ARSENAL</h1>
        <p class="subtitle" style="color: #FF9F1C;">Free. Proven. Actually used.</p>
      </div>
    `
  },

  // 3. Crack the Request — "Intercepted"
  {
    id: 'burp-suite',
    outName: 'burp-suite.jpg',
    accentColor: '#FF5C00',
    coverTitle: 'CRACK THE REQUEST',
    coverSubtitle: 'From blank screen to first intercept.',
    titleSize: '118px',
    layoutType: 'intercepted',
    htmlContent: `
      <!-- Faint HTTP Request Text Fragments -->
      <div class="bg-layer" style="opacity: 0.05; font-family: 'Courier New', monospace; font-size: 20px; font-weight: bold; color: #5A7A9E; padding: 120px 100px; line-height: 1.8; overflow: hidden;">
        POST /api/v1/auth/login HTTP/1.1<br/>
        Host: target.internal.net<br/>
        User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)<br/>
        Accept: application/json, text/plain, */*<br/>
        Content-Type: application/json;charset=UTF-8<br/>
        X-Forwarded-For: 127.0.0.1<br/>
        Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...<br/>
        <br/>
        HTTP/1.1 200 OK<br/>
        Server: nginx/1.24.0<br/>
        Content-Length: 142<br/>
        {"status":"authenticated","role":"administrator"}<br/>
        <br/>
        GET /admin/dashboard HTTP/1.1<br/>
        Authorization: Bearer admin_secret_token_key_9921
      </div>

      <!-- Circuit Trace Lines Converging on Icon -->
      <svg class="bg-layer" viewBox="0 0 1600 2560" width="1600" height="2560" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#FF5C00" stroke-width="2.5" fill="none" opacity="0.14" stroke-linecap="round" stroke-linejoin="round">
          <path d="M 0 300 L 250 300 L 350 480 L 450 480" />
          <path d="M 0 650 L 180 650 L 300 560 L 450 560" />
          <path d="M 700 0 L 700 250 L 550 400 M 550 400 L 550 450" />
          <path d="M 1600 200 L 1100 200 L 800 450 L 650 450" />
          <path d="M 1600 750 L 1200 750 L 850 580 L 650 580" />
          <path d="M 0 1100 L 350 1100 L 450 700" />
          <circle cx="250" cy="300" r="5" fill="#FF5C00" />
          <circle cx="1100" cy="200" r="5" fill="#FF5C00" />
          <circle cx="1200" cy="750" r="5" fill="#FF5C00" />
        </g>
      </svg>

      <!-- Official Burp Suite Mark (Center-Left) -->
      <div style="position: absolute; top: 460px; left: 320px; z-index: 3; filter: drop-shadow(0 0 40px rgba(255, 92, 0, 0.35));">
        <svg viewBox="0 0 300 300" width="300" height="300" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="280" height="280" rx="60" fill="#FF5C00" />
          <path d="M 155 25 L 185 25 L 185 95 L 235 95 L 135 180 L 180 180 L 165 250 L 135 250 L 135 190 L 95 190 L 185 105 L 140 105 Z" fill="#FFFFFF" />
        </svg>
      </div>

      <!-- Title & Subtitle Block -->
      <div class="title-container" style="top: 1320px;">
        <h1 class="main-title">CRACK THE REQUEST</h1>
        <p class="subtitle" style="color: #FF5C00;">From blank screen to first intercept.</p>
      </div>
    `
  },

  // 4. Flag Hunter's Playbook — "The Summit" (Reversed Layout: Title ABOVE Icon!)
  {
    id: 'ctf-guide',
    outName: 'ctf-guide.jpg',
    accentColor: '#2ECC71',
    coverTitle: "FLAG HUNTER'S PLAYBOOK",
    coverSubtitle: 'Strategy over guesswork.',
    titleSize: '110px',
    layoutType: 'the-summit',
    htmlContent: `
      <!-- Topographic Contour Lines in Lower Half -->
      <svg class="bg-layer" viewBox="0 0 1600 2560" width="1600" height="2560" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#2ECC71" stroke-width="2" fill="none" opacity="0.12">
          <!-- Concentric elevation contour rings centered at lower flag base (800, 1600) -->
          <ellipse cx="800" cy="1600" rx="140" ry="60" />
          <ellipse cx="800" cy="1620" rx="280" ry="110" />
          <ellipse cx="800" cy="1650" rx="440" ry="180" />
          <ellipse cx="800" cy="1690" rx="620" ry="260" />
          <ellipse cx="800" cy="1740" rx="800" ry="360" />
          <ellipse cx="800" cy="1800" rx="1000" ry="480" />
          <ellipse cx="800" cy="1880" rx="1220" ry="620" />
        </g>
      </svg>

      <!-- TITLE BLOCK IN UPPER THIRD (ABOVE ICON!) -->
      <div class="title-container" style="top: 260px;">
        <h1 class="main-title">FLAG HUNTER'S PLAYBOOK</h1>
        <p class="subtitle" style="color: #2ECC71; margin-top: 16px;">Strategy over guesswork.</p>
      </div>

      <!-- Checkered Flag Icon planted at the peak in Lower-Center -->
      <div class="icon-container" style="top: 1180px; filter: drop-shadow(0 0 35px rgba(46, 204, 113, 0.35));">
        <svg viewBox="0 0 300 300" width="300" height="300" xmlns="http://www.w3.org/2000/svg">
          <!-- Pole -->
          <rect x="40" y="30" width="16" height="250" rx="8" fill="#2ECC71" />
          <circle cx="48" cy="30" r="14" fill="#2ECC71" />
          <!-- Flag Body -->
          <path d="M 56 45 C 120 25 170 65 260 45 L 260 190 C 170 210 120 170 56 190 Z" fill="#2ECC71" />
          <!-- Checker Pattern Cutout -->
          <path d="M 56 45 C 95 38 125 45 130 115 C 95 120 56 115 56 45 Z" fill="#0B0F19" />
          <path d="M 195 52 C 230 46 260 45 260 115 C 230 120 195 115 195 52 Z" fill="#0B0F19" />
          <path d="M 130 115 C 165 120 195 115 195 194 C 165 190 130 194 130 115 Z" fill="#0B0F19" />
        </svg>
      </div>
    `
  },

  // 5. Breach in the Cloud — "The Breach Point"
  {
    id: 'cloud-security-v4',
    outName: 'cloud-security-v4.jpg',
    accentColor: '#00A8FF',
    coverTitle: 'BREACH IN THE CLOUD',
    coverSubtitle: 'The fundamentals nobody covers.',
    titleSize: '115px',
    layoutType: 'breach-point',
    htmlContent: `
      <!-- Background Crack extending beyond Cloud -->
      <svg class="bg-layer" viewBox="0 0 1600 2560" width="1600" height="2560" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#00A8FF" stroke-width="4" fill="none" opacity="0.18" stroke-linecap="round" stroke-linejoin="round">
          <path d="M 800 0 L 800 350 L 850 480 M 850 480 L 780 750 L 840 920 L 800 1200 L 830 1600 L 770 2100 L 800 2560" />
          <path d="M 850 480 L 1150 350 L 1400 200" />
          <path d="M 780 750 L 450 850 L 200 950" />
          <path d="M 840 920 L 1250 1050 L 1500 1150" />
        </g>
      </svg>

      <!-- Cloud Icon with Dramatic Lightning Crack -->
      <div class="icon-container" style="top: 460px; filter: drop-shadow(0 0 45px rgba(0, 168, 255, 0.4));">
        <svg viewBox="0 0 340 340" width="340" height="340" xmlns="http://www.w3.org/2000/svg">
          <!-- Cloud Base -->
          <path d="M 90 260 C 50 260 20 230 20 190 C 20 152 48 122 85 117 C 95 68 138 30 190 30 C 242 30 285 68 295 117 C 332 122 360 152 360 190 C 360 230 330 260 290 260 Z" fill="#00A8FF" />
          <!-- Jagged Lightning Bolt Cutout -->
          <polygon points="190,20 215,110 170,170 220,170 175,270 200,185 155,185" fill="#0B0F19" />
        </svg>
      </div>

      <!-- Title & Subtitle Block -->
      <div class="title-container" style="top: 1320px;">
        <h1 class="main-title">BREACH IN THE CLOUD</h1>
        <p class="subtitle" style="color: #00A8FF;">The fundamentals nobody covers.</p>
      </div>
    `
  },

  // 6. Behind the Screens — "Active Scan"
  {
    id: 'soc-analyst',
    outName: 'soc-analyst.jpg',
    accentColor: '#9B51E0',
    coverTitle: 'BEHIND THE SCREENS',
    coverSubtitle: 'The role, decoded.',
    titleSize: '118px',
    layoutType: 'active-scan',
    htmlContent: `
      <!-- Concentric Radar Rings & Blip Dots -->
      <svg class="bg-layer" viewBox="0 0 1600 2560" width="1600" height="2560" xmlns="http://www.w3.org/2000/svg">
        <!-- Expanding Radar Rings -->
        <g stroke="#9B51E0" stroke-width="2.5" fill="none" opacity="0.14">
          <circle cx="800" cy="640" r="220" />
          <circle cx="800" cy="640" r="380" />
          <circle cx="800" cy="640" r="540" opacity="0.08" />
          <circle cx="800" cy="640" r="720" opacity="0.05" />
          <line x1="800" y1="0" x2="800" y2="1280" stroke-dasharray="8,8" />
          <line x1="160" y1="640" x2="1440" y2="640" stroke-dasharray="8,8" />
        </g>
        <!-- 7 Active Radar Blip Dots -->
        <g fill="#9B51E0" opacity="0.45">
          <circle cx="950" cy="480" r="10" />
          <circle cx="620" cy="520" r="8" />
          <circle cx="1080" cy="760" r="12" />
          <circle cx="540" cy="820" r="7" />
          <circle cx="720" cy="310" r="11" />
          <circle cx="1220" cy="420" r="9" />
          <circle cx="420" cy="410" r="8" />
        </g>
      </svg>

      <!-- Shield with Monitor Outline Icon -->
      <div class="icon-container" style="top: 480px; filter: drop-shadow(0 0 35px rgba(155, 81, 224, 0.35));">
        <svg viewBox="0 0 320 320" width="320" height="320" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#9B51E0" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <!-- Shield Outline -->
            <path d="M 160 20 L 290 60 C 290 190 230 265 160 300 C 90 265 30 190 30 60 Z" fill="#0B0F19" />
            <!-- Monitor Screen Outline inside -->
            <rect x="90" y="100" width="140" height="95" rx="10" stroke="#9B51E0" stroke-width="12" />
            <path d="M 148 195 L 140 225 L 180 225 L 172 195" stroke="#9B51E0" stroke-width="10" />
            <line x1="125" y1="225" x2="195" y2="225" stroke="#9B51E0" stroke-width="10" />
            <!-- Inner Screen Pulse Wave -->
            <path d="M 105 148 L 125 148 L 135 125 L 148 170 L 162 135 L 174 158 L 215 158" stroke="#9B51E0" stroke-width="8" />
          </g>
        </svg>
      </div>

      <!-- Title & Subtitle Block -->
      <div class="title-container" style="top: 1320px;">
        <h1 class="main-title">BEHIND THE SCREENS</h1>
        <p class="subtitle" style="color: #9B51E0;">The role, decoded.</p>
      </div>
    `
  }
];

const template = (cover) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 1600px;
      height: 2560px;
      background-color: #0B0F19;
      color: #FFFFFF;
      font-family: 'Archivo Black', 'Inter', sans-serif;
      overflow: hidden;
      position: relative;
      -webkit-font-smoothing: antialiased;
    }
    .bg-layer {
      position: absolute;
      inset: 0;
      width: 1600px;
      height: 2560px;
      pointer-events: none;
    }
    .icon-container {
      position: absolute;
      left: 0;
      width: 1600px;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 3;
    }
    .title-container {
      position: absolute;
      left: 140px;
      width: 1320px;
      text-align: center;
      z-index: 4;
    }
    .main-title {
      font-family: 'Archivo Black', sans-serif;
      font-weight: 900;
      font-size: ${cover.titleSize};
      line-height: 1.05;
      color: #FFFFFF;
      letter-spacing: -0.015em;
      text-transform: uppercase;
      word-break: break-word;
      text-shadow: 0 10px 40px rgba(0, 0, 0, 0.9);
    }
    .subtitle {
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      font-size: 42px;
      letter-spacing: -0.01em;
      margin-top: 14px;
    }
    .handle-text {
      position: absolute;
      bottom: 90px;
      left: 0;
      width: 1600px;
      text-align: center;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      font-size: 36px;
      letter-spacing: 0.02em;
      color: #A0AABF;
      z-index: 4;
    }
  </style>
</head>
<body>
  ${cover.htmlContent}
  <div class="handle-text">@thejenishshah</div>
</body>
</html>
`;

async function renderCovers() {
  console.log('Launching browser to render 6 brand-DNA custom covers...');
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1600, height: 2560, deviceScaleFactor: 1 }
  });

  for (const item of covers) {
    console.log(`Rendering cover: ${item.id} (${item.coverTitle})...`);
    const page = await browser.newPage();
    const fullHtml = template(item);
    await page.setContent(fullHtml, { waitUntil: 'domcontentloaded' });
    
    // Wait for fonts & rendering
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await new Promise(r => setTimeout(r, 600));

    const targetPath = path.join(outDir, item.outName);
    await page.screenshot({
      path: targetPath,
      type: item.outName.endsWith('.png') ? 'png' : 'jpeg',
      quality: item.outName.endsWith('.png') ? undefined : 98,
      clip: { x: 0, y: 0, width: 1600, height: 2560 }
    });
    console.log(`Saved: ${targetPath}`);

    if (item.altOutName) {
      const altTargetPath = path.join(outDir, item.altOutName);
      await page.screenshot({
        path: altTargetPath,
        type: item.altOutName.endsWith('.png') ? 'png' : 'jpeg',
        quality: item.altOutName.endsWith('.png') ? undefined : 98,
        clip: { x: 0, y: 0, width: 1600, height: 2560 }
      });
      console.log(`Saved alternate: ${altTargetPath}`);
    }
    await page.close();
  }

  await browser.close();
  console.log('All 6 brand-DNA custom covers rendered successfully!');
}

renderCovers().catch(err => {
  console.error('Render error:', err);
  process.exit(1);
});
