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

  // Inject aggressive print CSS for slide-style output
  await page.addStyleTag({ content: `
    @page {
      size: A3 landscape;
      margin: 0;
    }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      margin: 0 !important;
      padding: 0 !important;
    }

    /* Hide non-print elements */
    #progress-bar, .hero-scroll-cue, .expand-btn { display: none !important; }

    /* ===== HERO = Page 1 ===== */
    .hero {
      page-break-after: always;
      break-after: page;
      min-height: 100vh;
      box-sizing: border-box;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    /* ===== Each chapter = its own page ===== */
    .story-section {
      page-break-before: always !important;
      break-before: page !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      min-height: 100vh;
      box-sizing: border-box;
      padding: 50px 60px !important;
      display: flex;
      flex-direction: column;
    }

    .section-container {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    /* ===== Prevent ANY internal splitting ===== */
    .chart-card,
    .chart-pair,
    .chart-full,
    .insight-callout,
    .kpi-strip,
    .stat-highlight-row,
    .type-cards,
    .heatmap-table,
    .data-table,
    .commentary,
    .comm-callout,
    h2, h3, h4 {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      orphans: 4;
      widows: 4;
    }

    /* Keep headings with their content */
    h2, h3, .chapter-label, .section-lead {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }

    /* ===== Commentary chapter: allow multi-page ===== */
    #ch7 {
      page-break-inside: auto !important;
      break-inside: auto !important;
      min-height: auto;
    }

    #ch7 .commentary h3 {
      page-break-before: auto;
      margin-top: 28px;
    }

    /* ===== Chart sizing for print ===== */
    .chart-wrap { height: 260px !important; }
    .chart-wrap-tall { height: 320px !important; }
    .chart-pair { gap: 24px !important; }

    /* ===== KPI cards fill width ===== */
    .kpi-strip {
      display: flex !important;
      gap: 12px !important;
    }
    .kpi-card {
      flex: 1 !important;
      min-width: 0 !important;
    }

    /* Footer */
    footer {
      page-break-before: always;
      break-before: page;
      min-height: 30vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `});

  await new Promise(r => setTimeout(r, 500));

  console.log('Generating slide-style PDF...');
  await page.pdf({
    path: 'Claims_Operations_Dashboard.pdf',
    format: 'A3',
    landscape: true,
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
    scale: 0.62,
    preferCSSPageSize: true,
  });

  console.log('PDF saved: Claims_Operations_Dashboard.pdf');
  await browser.close();
})();
