import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

const srcImage = 'C:/Users/Admin/.gemini/antigravity-ide/brain/f81e64d9-e46b-46ed-a745-c053c96003ee/.user_uploaded/media_1789452096186.png';
const base64Data = fs.readFileSync(srcImage).toString('base64');
const dataUrl = `data:image/png;base64,${base64Data}`;

const outDir = path.resolve('../frontend/public');

async function process() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Set content with canvas
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
      <img id="srcImg" src="${dataUrl}" />
      <canvas id="cLight"></canvas>
      <canvas id="cDark"></canvas>
      <script>
        const img = document.getElementById('srcImg');
        img.onload = () => {
          const w = img.naturalWidth;
          const h = img.naturalHeight;
          
          // 1. Process Transparent Light (Black stays black, Blue stays blue, White becomes transparent)
          const cLight = document.getElementById('cLight');
          cLight.width = w;
          cLight.height = h;
          const ctxL = cLight.getContext('2d');
          ctxL.drawImage(img, 0, 0);
          const imgDataL = ctxL.getImageData(0, 0, w, h);
          const dL = imgDataL.data;
          
          for (let i = 0; i < dL.length; i += 4) {
            const r = dL[i];
            const g = dL[i+1];
            const b = dL[i+2];
            
            // Check if pixel is white / background
            const brightness = (r + g + b) / 3;
            if (r > 220 && g > 220 && b > 220) {
              // Smooth alpha feathering for near-white
              const alpha = Math.max(0, Math.min(255, (255 - brightness) * 4));
              dL[i+3] = alpha;
            }
          }
          ctxL.putImageData(imgDataL, 0, 0);
          
          // 2. Process Transparent Dark (Black becomes White, Blue stays vibrant Blue, White becomes transparent)
          const cDark = document.getElementById('cDark');
          cDark.width = w;
          cDark.height = h;
          const ctxD = cDark.getContext('2d');
          ctxD.drawImage(img, 0, 0);
          const imgDataD = ctxD.getImageData(0, 0, w, h);
          const dD = imgDataD.data;
          
          for (let i = 0; i < dD.length; i += 4) {
            const r = dD[i];
            const g = dD[i+1];
            const b = dD[i+2];
            const brightness = (r + g + b) / 3;
            
            // If it is white background
            if (r > 225 && g > 225 && b > 225) {
              dD[i+3] = 0;
            } else {
              // Check if it's blue part vs black part
              // Blue has much higher blue component than red/green
              const isBlue = (b > r + 35) && (b > g + 10);
              
              if (isBlue) {
                // Keep vibrant blue or enhance it slightly for dark backgrounds
                dD[i] = Math.max(r, 20);
                dD[i+1] = Math.max(g, 100);
                dD[i+2] = Math.min(255, b + 20);
                // Antialias edge if close to white
                if (brightness > 200) {
                  dD[i+3] = Math.max(0, 255 - (brightness - 200) * 5);
                }
              } else {
                // It is the black/dark part: convert to clean white (#FFFFFF)
                const darkness = 255 - brightness;
                dD[i] = 255;
                dD[i+1] = 255;
                dD[i+2] = 255;
                dD[i+3] = Math.min(255, Math.max(0, darkness * 3));
              }
            }
          }
          ctxD.putImageData(imgDataD, 0, 0);
          window.__DONE__ = true;
        };
      </script>
    </body>
    </html>
  `);

  await page.waitForFunction('window.__DONE__ === true');

  const lightDataUrl = await page.evaluate(() => document.getElementById('cLight').toDataURL('image/png'));
  const darkDataUrl = await page.evaluate(() => document.getElementById('cDark').toDataURL('image/png'));

  const saveBase64 = (dataUrl, filePath) => {
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
    console.log(`Saved ${filePath} (${fs.statSync(filePath).size} bytes)`);
  };

  saveBase64(lightDataUrl, path.join(outDir, 'hmt-logo-transparent.png'));
  saveBase64(darkDataUrl, path.join(outDir, 'hmt-logo-dark.png'));

  await browser.close();
  console.log("Done generating HMT logo assets!");
}

process().catch(console.error);
