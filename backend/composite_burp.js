import fs from 'fs';
import puppeteer from 'puppeteer-core';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

(async () => {
  const browser = await puppeteer.launch({ executablePath, headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 896, height: 1536 });
  
  // Base AI background (V2) which has the nice 3D box and cyber lines
  const bgPath = 'C:/Users/Admin/.gemini/antigravity-ide/brain/6b69f536-f8f4-4e04-b189-39701c0c3532/burp_suite_v2_1790261795579.jpg';
  
  // The exact logo from the user
  const logoPath = 'C:/Users/Admin/.gemini/antigravity-ide/brain/6b69f536-f8f4-4e04-b189-39701c0c3532/.user_uploaded/media_1790266211322.jpg';
  
  const bgBase64 = fs.readFileSync(bgPath).toString('base64');
  const logoBase64 = fs.readFileSync(logoPath).toString('base64');
  
  // We place the user's 2D logo INSIDE the 3D box.
  // The AI generated box is slightly tilted/rotated in 3D. We use CSS 3D transforms to match it.
  const html = `
    <style>
      body { 
        margin: 0; padding: 0; 
        background: url(data:image/jpeg;base64,${bgBase64}) no-repeat center center; 
        background-size: cover; 
        width: 896px; height: 1536px; 
        display: flex; justify-content: center; align-items: center; 
        position: relative; 
        perspective: 1000px;
      }
      .logo-container {
        position: absolute;
        top: 550px; /* Center vertical */
        width: 320px; height: 320px;
        /* Rotate slightly to match the 3D box's angle in V2 image */
        transform: rotateY(-15deg) rotateX(10deg) rotateZ(-5deg);
        border-radius: 60px;
        overflow: hidden;
        box-shadow: 
          inset 0 0 20px rgba(255,255,255,0.4), /* inner glossy reflection */
          0 10px 30px rgba(0,0,0,0.8); /* shadow casting onto the 3D box */
      }
      .logo { 
        width: 100%; height: 100%; 
        object-fit: cover;
      }
      .gloss {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%);
        pointer-events: none;
      }
    </style>
    <body>
      <div class="logo-container">
        <img src="data:image/jpeg;base64,${logoBase64}" class="logo" />
        <div class="gloss"></div>
      </div>
    </body>
  `;
  
  await page.setContent(html);
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity-ide/brain/6b69f536-f8f4-4e04-b189-39701c0c3532/burp_suite_v8_exact_inside_box.jpg', type: 'jpeg', quality: 100 });
  await browser.close();
  console.log('Composited image saved!');
})();
