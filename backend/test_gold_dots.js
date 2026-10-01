import puppeteer from 'puppeteer-core';
import fs from 'fs';

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
  await page.setViewport({ width: 700, height: 600 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-[#0c0c0e] p-8 flex flex-col gap-5 text-white font-sans">
      
      <!-- Option 1: #D4A017 Warm Gold -->
      <div class="w-full flex items-center p-3 rounded-full bg-[#edf5e8]">
        <div class="w-10 h-10 flex items-center justify-center text-gray-900 font-bold">Icon</div>
        <div class="flex-1 text-center font-bold text-gray-900">1:1 Consultation (Warm Gold #D4A017)</div>
        <div class="w-10 h-10 flex items-center justify-center text-[#D4A017] text-2xl font-bold">⋮</div>
      </div>

      <!-- Option 2: #E5C158 Brand Gold -->
      <div class="w-full flex items-center p-3 rounded-full bg-[#edf5e8]">
        <div class="w-10 h-10 flex items-center justify-center text-gray-900 font-bold">Icon</div>
        <div class="flex-1 text-center font-bold text-gray-900">PDF Store (Brand Gold #E5C158)</div>
        <div class="w-10 h-10 flex items-center justify-center text-[#E5C158] text-2xl font-bold">⋮</div>
      </div>

      <!-- Option 3: #B8860B Darker Rich Gold (High Contrast) -->
      <div class="w-full flex items-center p-3 rounded-full bg-[#edf5e8]">
        <div class="w-10 h-10 flex items-center justify-center text-gray-900 font-bold">Icon</div>
        <div class="flex-1 text-center font-bold text-gray-900">Custom Bundles (Rich Gold #B8860B)</div>
        <div class="w-10 h-10 flex items-center justify-center text-[#B8860B] text-2xl font-bold">⋮</div>
      </div>

      <!-- Option 4: #C49520 Classic Gold -->
      <div class="w-full flex items-center p-3 rounded-full bg-[#edf5e8]">
        <div class="w-10 h-10 flex items-center justify-center text-gray-900 font-bold">Icon</div>
        <div class="flex-1 text-center font-bold text-gray-900">About Jenish Shah (Classic Gold #C49520)</div>
        <div class="w-10 h-10 flex items-center justify-center text-[#C49520] text-2xl font-bold">⋮</div>
      </div>

    </body>
    </html>
  `);

  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity-ide/brain/f81e64d9-e46b-46ed-a745-c053c96003ee/dots_gold_comparison.png' });
  await browser.close();
  console.log('Gold comparison saved');
}

run().catch(console.error);
