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
  await page.setViewport({ width: 750, height: 500 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@500;600;700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
    </head>
    <body class="bg-[#0c0c0e] p-8 flex flex-col gap-5 text-white font-['Inter']">
      
      <!-- Style 1: Sleek Monospace Badge -->
      <div class="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5">
        <div class="flex items-center gap-2 text-sm text-slate-300 font-medium">
          <span>Connect with</span>
          <span class="inline-flex items-center px-3 py-1 rounded-lg bg-white/10 text-white font-['JetBrains_Mono'] font-bold text-xs tracking-wider border border-white/15 shadow-inner">
            @thejenishshah
          </span>
        </div>
        <div class="text-slate-400 text-xs">Style 1: JetBrains Badge</div>
      </div>

      <!-- Style 2: Golden Accent Handle -->
      <div class="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5">
        <div class="flex items-center gap-2 text-sm text-slate-300 font-medium">
          <span>Connect with</span>
          <span class="inline-flex items-center px-3 py-1 rounded-full bg-[#E5C158]/10 text-[#E5C158] font-['JetBrains_Mono'] font-semibold text-xs tracking-tight border border-[#E5C158]/30">
            @thejenishshah
          </span>
        </div>
        <div class="text-slate-400 text-xs">Style 2: Gold Pill Chip</div>
      </div>

      <!-- Style 3: Clean Bold Gradient Modern -->
      <div class="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5">
        <div class="flex items-center gap-2 text-sm text-slate-300 font-medium">
          <span>Connect with</span>
          <span class="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent font-['Inter']">
            @thejenishshah
          </span>
        </div>
        <div class="text-slate-400 text-xs">Style 3: Bold Clean Gradient</div>
      </div>

      <!-- Style 4: Minimal Terminal Style -->
      <div class="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5">
        <div class="flex items-center gap-2 text-sm text-slate-300 font-medium">
          <span class="text-slate-400">Social handle:</span>
          <span class="px-2.5 py-1 bg-black/40 rounded-md border border-white/10 font-mono text-sm font-semibold text-white">
            @thejenishshah
          </span>
        </div>
        <div class="text-slate-400 text-xs">Style 4: Terminal Chip</div>
      </div>

    </body>
    </html>
  `);

  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity-ide/brain/f81e64d9-e46b-46ed-a745-c053c96003ee/handle_styles.png' });
  await browser.close();
  console.log('Handle styles rendered');
}

run().catch(console.error);
