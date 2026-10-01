import puppeteer from 'puppeteer-core';

(async () => {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox']
  });

  const routes = ['/', '/pdf-store', '/bundles', '/consultation', '/about', '/contact'];
  const viewports = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 900 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });
    for (const r of routes) {
      await page.goto('http://localhost:5173' + r, { waitUntil: 'networkidle2' });
      await new Promise(res => setTimeout(res, 500));
      const rName = r === '/' ? 'home' : r.replace('/', '');
      await page.screenshot({ path: `C:/Users/Admin/.gemini/antigravity-ide/brain/fefe4294-e657-497d-ac9b-aff161e5f6dd/resp_${vp.name}_${rName}.jpg`, fullPage: false });
    }
    await page.close();
  }

  await browser.close();
  console.log('Responsive screenshots taken successfully!');
})();
