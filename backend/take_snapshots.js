import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

const outDir = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\e5649de4-d4c5-4c41-bf23-a95fe0df6f07';

const pages = [
  {
    name: '1_thankyou_consultation.png',
    url: 'http://localhost:5173/thank-you?type=consultation',
    title: 'Thank You - 1:1 Consultation'
  },
  {
    name: '2_thankyou_pdf.png',
    url: 'http://localhost:5173/thank-you?type=pdf',
    title: 'Thank You - PDF Store'
  },
  {
    name: '3_thankyou_bundle.png',
    url: 'http://localhost:5173/thank-you?type=bundle&hasConsultation=true',
    title: 'Thank You - Bundle'
  },
  {
    name: '4_conflict_consultation.png',
    url: 'http://localhost:5173/consultation?conflict=true',
    title: 'Slot Already Booked (1:1 Consultation)'
  },
  {
    name: '5_conflict_bundle.png',
    url: 'http://localhost:5173/bundle?conflict=true',
    title: 'Slot Already Booked (Bundle)'
  }
];

async function capture() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1000, height: 900, deviceScaleFactor: 2 }
  });

  for (const item of pages) {
    const page = await browser.newPage();
    await page.goto(item.url, { waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 1200)); // Wait for framer-motion animations
    const filePath = path.join(outDir, item.name);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`Captured: ${item.name}`);
    await page.close();
  }

  await browser.close();
  console.log('All snapshots captured successfully!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
