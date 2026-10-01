import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

async function run() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 600, height: 400 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-[#0c0c0e] p-8 flex flex-col gap-6 text-white font-sans">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-lg">
          <img src="http://localhost:5173/hmt-logo-transparent.png" class="w-full h-full object-contain" />
        </div>
        <div>
          <h3 class="font-bold text-white">Option A: Clean Crisp White Badge (True Brand Colors)</h3>
          <p class="text-xs text-slate-400">Original Black & Royal Blue</p>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-white/[0.08] border border-white/10 p-2 flex items-center justify-center shadow-sm">
          <img src="http://localhost:5173/hmt-logo-dark.png" class="w-full h-full object-contain" />
        </div>
        <div>
          <h3 class="font-bold text-white">Option B: Dark Theme Inverted</h3>
          <p class="text-xs text-slate-400">White & Electric Blue on translucent box</p>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-[#004280]/20 border border-[#0066cc]/40 p-2 flex items-center justify-center shadow-sm">
          <img src="http://localhost:5173/hmt-logo-dark.png" class="w-full h-full object-contain" />
        </div>
        <div>
          <h3 class="font-bold text-white">Option C: Brand Tinted Dark Box</h3>
          <p class="text-xs text-slate-400">Blue tint border & container</p>
        </div>
      </div>
    </body>
    </html>
  `);

  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity-ide/brain/f81e64d9-e46b-46ed-a745-c053c96003ee/badge_comparison.png' });
  await browser.close();
  console.log('Comparison saved');
}

run().catch(console.error);
