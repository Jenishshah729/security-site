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
    <body class="bg-[#0c0c0e] p-8 flex flex-col gap-8 text-white font-sans">
      
      <!-- Option 1: Clean White Tile for BOTH -->
      <div class="space-y-3 p-4 bg-[#141418] rounded-2xl border border-white/10">
        <h4 class="text-xs text-[#E5C158] font-bold uppercase tracking-wider">Option 1: Clean Crisp White Tiles for BOTH (Consistent Brand Tiles)</h4>
        
        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-xl bg-white p-2 flex items-center justify-center flex-shrink-0 shadow-md border border-white/20">
            <img src="http://localhost:5173/matrix-fortress-logo.png" class="w-full h-full object-contain" />
          </div>
          <h2 class="text-lg font-bold text-white">Careers & Internships at Matrix Fortress</h2>
        </div>

        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-xl bg-white p-1.5 flex items-center justify-center flex-shrink-0 shadow-md border border-white/20">
            <img src="http://localhost:5173/hmt-logo-transparent.png" class="w-full h-full object-contain" />
          </div>
          <h2 class="text-lg font-bold text-white">Sales Careers & Internships at Himmatlal Machine Tools</h2>
        </div>
      </div>

      <!-- Option 2: Dark Translucent Glass Tiles for BOTH -->
      <div class="space-y-3 p-4 bg-[#141418] rounded-2xl border border-white/10">
        <h4 class="text-xs text-[#E5C158] font-bold uppercase tracking-wider">Option 2: Dark Translucent Glass Tiles for BOTH</h4>
        
        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-xl bg-white/[0.08] border border-white/10 p-2 flex items-center justify-center flex-shrink-0 shadow-sm">
            <img src="http://localhost:5173/matrix-fortress-logo.png" class="w-full h-full object-contain" />
          </div>
          <h2 class="text-lg font-bold text-white">Careers & Internships at Matrix Fortress</h2>
        </div>

        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-xl bg-white/[0.08] border border-white/10 p-2 flex items-center justify-center flex-shrink-0 shadow-sm">
            <img src="http://localhost:5173/hmt-logo-dark.png" class="w-full h-full object-contain" />
          </div>
          <h2 class="text-lg font-bold text-white">Sales Careers & Internships at Himmatlal Machine Tools</h2>
        </div>
      </div>

      <!-- Option 3: Tinted Glass Tiles for BOTH -->
      <div class="space-y-3 p-4 bg-[#141418] rounded-2xl border border-white/10">
        <h4 class="text-xs text-[#E5C158] font-bold uppercase tracking-wider">Option 3: Custom Brand Tinted Tiles for BOTH</h4>
        
        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-xl bg-[#00629b]/15 border border-[#00629b]/30 p-2 flex items-center justify-center flex-shrink-0 shadow-sm">
            <img src="http://localhost:5173/matrix-fortress-logo.png" class="w-full h-full object-contain" />
          </div>
          <h2 class="text-lg font-bold text-white">Careers & Internships at Matrix Fortress</h2>
        </div>

        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-xl bg-[#00629b]/15 border border-[#00629b]/30 p-2 flex items-center justify-center flex-shrink-0 shadow-sm">
            <img src="http://localhost:5173/hmt-logo-dark.png" class="w-full h-full object-contain" />
          </div>
          <h2 class="text-lg font-bold text-white">Sales Careers & Internships at Himmatlal Machine Tools</h2>
        </div>
      </div>

    </body>
    </html>
  `);

  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity-ide/brain/f81e64d9-e46b-46ed-a745-c053c96003ee/logo_style_comparison.png' });
  await browser.close();
  console.log('Comparison saved');
}

run().catch(console.error);
