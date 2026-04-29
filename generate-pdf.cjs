const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Wide viewport for charts
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  
  console.log('Loading dashboard...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 30000 });
  
  // Wait for charts to render
  await new Promise(r => setTimeout(r, 3000));
  
  // Expand the agent table before capturing
  const expandBtn = await page.$('#expand-agents');
  if (expandBtn) await expandBtn.click();
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('Generating PDF...');
  await page.pdf({
    path: 'Claims_Operations_Dashboard.pdf',
    format: 'A3',
    landscape: true,
    printBackground: true,
    margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
    scale: 0.7,
  });
  
  console.log('PDF saved: Claims_Operations_Dashboard.pdf');
  await browser.close();
})();
