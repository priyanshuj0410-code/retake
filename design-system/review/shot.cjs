// Screenshots a review page at phone and laptop widths, light and dark, and reports sideways overflow.
// Usage: node design-system/review/shot.cjs <page.html> <outdir> (the page is wrapped in the skeleton the Artifact tool adds)
const { chromium } = require('/Users/priyanshu/equal-lens-evaluator-game/node_modules/playwright-core');
const EXE = '/Users/priyanshu/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const fs = require('fs');

(async () => {
  const [url, out] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: EXE });
  for (const [w, h] of (process.env.SIZES || '390x844,1440x900').split(',').map(s => s.split('x').map(Number))) {
    for (const scheme of (process.env.SCHEMES || 'light,dark').split(',')) {
      const page = await browser.newPage({ viewport: { width: w, height: h }, colorScheme: scheme });
      const src = fs.readFileSync(url, 'utf8');
      await page.setContent('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}[hidden]{display:none!important}img{max-width:100%}</style></head><body>' + src + '</body></html>', { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const wide = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const bad = [];
        document.querySelectorAll('body *').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.right > vw + 1 && !el.closest('.tw, .nav-in')) bad.push(el.tagName + '.' + el.className);
        });
        return { scroll: document.documentElement.scrollWidth - vw, bad: bad.slice(0, 8) };
      });
      console.log(w, scheme, JSON.stringify(wide));
      for (const id of (process.env.IDS || 'top,ch1,ch5,results,stories').split(',')) {
        const sel = id === 'top' ? 'header.top' : '#' + id;
        await page.locator(sel).scrollIntoViewIfNeeded();
        await page.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'start' }), sel);
        await page.screenshot({ path: `${out}/${w}-${scheme}-${id}.png` });
      }
      await page.close();
    }
  }
  await browser.close();
})();
