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
  await page.setViewport({ width: 800, height: 700 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-[#0c0c0e] p-8 flex flex-col gap-6 text-white font-sans">
      
      <!-- Option 1: 1.5px Solid Brand Gold Outline -->
      <div>
        <span class="text-xs text-slate-400 mb-1 block">Option 1: Crisp Gold Border (border-[1.5px] border-[#E5C158])</span>
        <div class="w-full flex items-center p-3.5 rounded-full bg-[#edf5e8] border-[1.5px] border-[#E5C158] shadow-sm">
          <div class="w-10 h-10 flex items-center justify-center text-gray-900 font-bold">📅</div>
          <div class="flex-1 text-center">
            <h2 class="text-[16px] font-bold text-gray-900">1:1 Consultation</h2>
            <p class="text-gray-600 text-[12px]">Book a high-impact cybersecurity call.</p>
          </div>
          <div class="w-10 h-10 flex items-center justify-center text-gray-900 font-bold">⋮</div>
        </div>
      </div>

      <!-- Option 2: Gold Border with Subtle Ambient Glow -->
      <div>
        <span class="text-xs text-slate-400 mb-1 block">Option 2: Gold Border + Ambient Glow (border border-[#E5C158] shadow-[0_0_20px_rgba(229,193,88,0.25)])</span>
        <div class="w-full flex items-center p-3.5 rounded-full bg-[#edf5e8] border border-[#E5C158] shadow-[0_0_20px_rgba(229,193,88,0.25)]">
          <div class="w-10 h-10 flex items-center justify-center text-gray-900 font-bold">📚</div>
          <div class="flex-1 text-center">
            <h2 class="text-[16px] font-bold text-gray-900">PDF Store</h2>
            <p class="text-gray-600 text-[12px]">Level up your skills with premium PDFs.</p>
          </div>
          <div class="w-10 h-10 flex items-center justify-center text-gray-900 font-bold">⋮</div>
        </div>
      </div>

      <!-- Option 3: Double Layer (Outer Gold Ring / Outline + Inner Pill) -->
      <div>
        <span class="text-xs text-slate-400 mb-1 block">Option 3: Gold Layer Outer Ring (p-0.5 bg-gradient-to-r from-[#E5C158] via-amber-200 to-[#E5C158])</span>
        <div class="w-full p-[1.5px] rounded-full bg-gradient-to-r from-[#E5C158] via-amber-200 to-[#E5C158] shadow-md shadow-[#E5C158]/15">
          <div class="w-full flex items-center p-3.5 rounded-full bg-[#edf5e8]">
            <div class="w-10 h-10 flex items-center justify-center text-gray-900 font-bold">📦</div>
            <div class="flex-1 text-center">
              <h2 class="text-[16px] font-bold text-gray-900">Premium Bundles</h2>
              <p class="text-gray-600 text-[12px]">Exclusive packages for maximum value.</p>
            </div>
            <div class="w-10 h-10 flex items-center justify-center text-gray-900 font-bold">⋮</div>
          </div>
        </div>
      </div>

      <!-- Option 4: 2px Bold Gold Border -->
      <div>
        <span class="text-xs text-slate-400 mb-1 block">Option 4: 2px Gold Border (border-2 border-[#E5C158])</span>
        <div class="w-full flex items-center p-3.5 rounded-full bg-[#edf5e8] border-2 border-[#E5C158] shadow-sm">
          <div class="w-10 h-10 flex items-center justify-center text-gray-900 font-bold">👤</div>
          <div class="flex-1 text-center">
            <h2 class="text-[16px] font-bold text-gray-900">About Jenish Shah</h2>
            <p class="text-gray-600 text-[12px]">Background, credentials & journey.</p>
          </div>
          <div class="w-10 h-10 flex items-center justify-center text-gray-900 font-bold">⋮</div>
        </div>
      </div>

    </body>
    </html>
  `);

  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity-ide/brain/f81e64d9-e46b-46ed-a745-c053c96003ee/gold_outline_comparison.png' });
  await browser.close();
  console.log('Comparison saved');
}

run().catch(console.error);
