// The rank step as a player meets it (owner, 23 Oct 2026: "The rankings need to be more clear"): the first rank screen
// of a story page, shot fresh and after one, two, three and every place, in each mode; and the library's rank part.
// Run:  BASE=http://127.0.0.1:8766 PAGE=demo.html node design-system/tools/rank_check.cjs <out-dir>
const { chromium } = require('/Users/priyanshu/equal-lens-evaluator-game/node_modules/playwright-core');
const EXE = '/Users/priyanshu/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

(async () => {
  const out = process.argv[2], BASE = process.env.BASE, b = await chromium.launch({ executablePath: EXE });
  for (const mode of ['mix', 'hi', 'en']) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } });
    const errors = []; p.on('pageerror', e => errors.push(e.message));
    await p.goto(`${BASE}/${process.env.PAGE || 'demo.html'}`); await p.evaluate(() => document.fonts.ready);
    if (mode !== 'mix') { await p.click('.demo .phone:not([hidden]) [data-help]'); await p.click(`.demo .phone:not([hidden]) [data-set-lang="${mode}"]`); await p.click('.demo .phone:not([hidden]) .helpsheet .close'); }
    await p.evaluate(() => {   // straight to the first rank screen
      const all = [...document.querySelectorAll('.demo .phone')], r = document.querySelector('.demo .phone.js-rank');
      all.forEach(x => { x.hidden = x !== r; });
    });
    const ph = p.locator('.demo .phone.js-rank').first(), n = await ph.locator('.rows .row').count();
    for (let j = 0; j <= n; j++) {
      if (j) { await ph.locator('.rows .row').nth(j - 1).click(); await p.waitForTimeout(400); }
      if (j <= 3 || j === n) {
        await ph.locator('.scr-body').evaluate(s => { s.scrollTop = s.scrollHeight; });
        await p.waitForTimeout(150); await p.screenshot({ path: `${out}/rank-${mode}-${j}.png` });
      }
    }
    const order = await ph.evaluate(x => [...x.querySelectorAll('.rows > *')].map(e => e.matches('.rkcut') ? '|cut|' : `${e.querySelector('.nm').textContent}:${e.querySelector('.rkno').textContent}`).join(' '));
    console.log(`rank ${mode}: ${order}; page errors: ${errors.length ? errors.join(' | ') : 'none'}`);
    await p.close();
  }
  const lib = await b.newPage({ viewport: { width: 1400, height: 1000 } });
  await lib.goto(`${BASE}/index.html`, { timeout: 120000 }); await lib.evaluate(() => document.fonts.ready);
  const fig = lib.locator('#first-take .phone.js-rank').first();
  await fig.scrollIntoViewIfNeeded(); await lib.waitForTimeout(300); await fig.screenshot({ path: `${out}/rank-library.png` });
  await b.close();
})();
