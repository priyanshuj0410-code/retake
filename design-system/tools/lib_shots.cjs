// A few library views at desktop size, to see the 0.8 phone and the wide app after a scale change.
// Run:  BASE=http://127.0.0.1:8766 node design-system/tools/lib_shots.cjs <out-dir>
const { chromium } = require('/Users/priyanshu/equal-lens-evaluator-game/node_modules/playwright-core');
const EXE = '/Users/priyanshu/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
(async () => {
  const out = process.argv[2]; require('fs').mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.goto(`${process.env.BASE}/index.html`, { timeout: 120000 }); await p.evaluate(() => document.fonts.ready);
  const targets = [['phones', '.phone.js-pick'], ['sheet', '.phone:has(> .sheet)'], ['app', '.app']];
  for (const [name, sel] of targets) {
    const el = p.locator(sel).first();
    if (!(await el.count())) { console.log('none:', name); continue; }
    await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
    await p.screenshot({ path: `${out}/${name}.png` });
  }
  console.log(`library shots; page errors: ${errors.length ? errors.join(' | ') : 'none'}`);
  await b.close();
})();
