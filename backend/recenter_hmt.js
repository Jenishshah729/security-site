import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

const outDir = path.resolve('../frontend/public');
const srcHmt = 'C:/Users/Admin/.gemini/antigravity-ide/brain/f81e64d9-e46b-46ed-a745-c053c96003ee/.user_uploaded/media_1789452096186.png';

async function generateBalancedHmtLogo() {
  const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const hmtBase64 = fs.readFileSync(srcHmt).toString('base64');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
      <img id="imgHmt" src="data:image/png;base64,${hmtBase64}" />
      <script>
        function processHmt(img, opticalNudgeDownRatio = 0.05) {
          const w = img.naturalWidth;
          const h = img.naturalHeight;
          const cTemp = document.createElement('canvas');
          cTemp.width = w;
          cTemp.height = h;
          const ctxT = cTemp.getContext('2d');
          ctxT.drawImage(img, 0, 0);
          const data = ctxT.getImageData(0, 0, w, h).data;

          let minX = w, maxX = 0, minY = h, maxY = 0;
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const idx = (y * w + x) * 4;
              const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
              if (a > 50 && !(r > 230 && g > 230 && b > 230)) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }

          const cropW = maxX - minX + 1;
          const cropH = maxY - minY + 1;
          const cCrop = document.createElement('canvas');
          cCrop.width = cropW;
          cCrop.height = cropH;
          const ctxCrop = cCrop.getContext('2d');
          ctxCrop.drawImage(cTemp, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

          const cropData = ctxCrop.getImageData(0, 0, cropW, cropH);
          const cd = cropData.data;
          for (let i = 0; i < cd.length; i += 4) {
            const r = cd[i], g = cd[i+1], b = cd[i+2];
            const brightness = (r + g + b) / 3;
            if (r > 220 && g > 220 && b > 220) {
              cd[i+3] = Math.max(0, Math.min(255, (255 - brightness) * 4));
            }
          }
          ctxCrop.putImageData(cropData, 0, 0);

          const targetSize = 512;
          const padding = 70;
          const maxInner = targetSize - padding * 2;
          const scale = Math.min(maxInner / cropW, maxInner / cropH);

          const drawW = cropW * scale;
          const drawH = cropH * scale;
          const drawX = (targetSize - drawW) / 2;
          // Apply optical centering shift down to account for top bar visual weight
          const drawY = (targetSize - drawH) / 2 + (targetSize * opticalNudgeDownRatio);

          const cSquare = document.createElement('canvas');
          cSquare.width = targetSize;
          cSquare.height = targetSize;
          const ctxSquare = cSquare.getContext('2d');
          ctxSquare.imageSmoothingEnabled = true;
          ctxSquare.imageSmoothingQuality = 'high';
          ctxSquare.drawImage(cCrop, drawX, drawY, drawW, drawH);

          return cSquare.toDataURL('image/png');
        }

        window.__RUN__ = () => {
          const img = document.getElementById('imgHmt');
          return processHmt(img, 0.05); // 5% shift down for perfect optical centering
        };
      </script>
    </body>
    </html>
  `);

  await page.waitForFunction('document.getElementById("imgHmt").complete');
  const hmtCentered = await page.evaluate(() => window.__RUN__());

  const saveBase64 = (dataUrl, filePath) => {
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
    console.log(`Saved ${filePath}`);
  };

  saveBase64(hmtCentered, path.join(outDir, 'hmt-logo-transparent.png'));
  saveBase64(hmtCentered, path.join(outDir, 'hmt-logo.png'));
  await browser.close();
  console.log('Re-centered with optical vertical balance successfully!');
}

generateBalancedHmtLogo().catch(console.error);
