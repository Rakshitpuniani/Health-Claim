const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  console.log('Loading dashboard...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 4000));

  // Expand agent table
  const expandBtn = await page.$('#expand-agents');
  if (expandBtn) await expandBtn.click();
  await new Promise(r => setTimeout(r, 1000));

  // Inject print CSS: each .story-section and .hero starts on a new page
  await page.addStyleTag({ content: `
    @media print {
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body { margin: 0; padding: 0; }
      #progress-bar { display: none !important; }

      .hero {
        page-break-after: always;
        break-after: page;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .story-section {
        page-break-before: always;
        break-before: page;
        page-break-inside: avoid;
        break-inside: avoid;
        padding-top: 40px;
        padding-bottom: 40px;
      }

      /* Prevent charts from being split across pages */
      .chart-card, .chart-pair, .insight-callout, .kpi-strip,
      .stat-highlight-row, .type-cards, .heatmap-table,
      .data-table, .commentary {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      footer {
        page-break-before: always;
        break-before: page;
        min-height: 20vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .hero-scroll-cue { display: none !important; }
      .expand-btn { display: none !important; }

      /* Ensure backgrounds print */
      .hero, .section-alt, .kpi-card, .insight-callout,
      .type-card, .chart-card, .stat-highlight {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      /* Make charts fit better on print pages */
      .chart-wrap { height: 280px !important; }
      .chart-wrap-tall { height: 350px !important; }
    }
  `});

  await new Promise(r => setTimeout(r, 500));

  console.log('Generating slide-style PDF...');
  await page.pdf({
    path: 'Claims_Operations_Dashboard.pdf',
    format: 'A3',
    landscape: true,
    printBackground: true,
    margin: { top: '30px', bottom: '30px', left: '40px', right: '40px' },
    scale: 0.65,
    preferCSSPageSize: false,
  });

  console.log('PDF saved: Claims_Operations_Dashboard.pdf');
  await browser.close();
})();
