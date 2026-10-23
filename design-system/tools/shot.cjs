// One screenshot of a page, for a design sample. Run:  BASE=http://127.0.0.1:8766 node tools/shot.cjs <page> <out.png> [width] [height]
const { chromium } = require('/Users/priyanshu/equal-lens-evaluator-game/node_modules/playwright-core');
const EXE = '/Users/priyanshu/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
(async () => {
  const [page, out, w = 1400, h = 960] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2 });
  await p.goto(`${process.env.BASE}/${page}`); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  await p.screenshot({ path: out, fullPage: true }); await b.close();
})();
