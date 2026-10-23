// Checks the shareable demo (demo.py) and English only across the library.
// 1. English only in the library: every visible word on every phone that is not an English word, for a person to read
//    (names are expected; Hindi words in Latin letters are the fault the owner found on 22 Oct 2026).
// 2. The demo played through on a 390 x 844 phone in the chosen mode, as a player does it: one shot per screen, then
//    python3 tools/demo_check.py <dir> joins them into one sheet. Any page error is printed.
// Run:  node design-system/tools/demo_check.cjs <out-dir> [mix|hi|en]
const fs = require('fs');
const { chromium } = require('/Users/priyanshu/equal-lens-evaluator-game/node_modules/playwright-core');
const EXE = '/Users/priyanshu/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const DS = '/Users/priyanshu/equal-lens-trainer/design-system';
const BASE = process.env.BASE || 'file://' + DS;   // a local server (BASE=http://localhost:8765) lets the paint textures load
const WORDS = new Set(fs.readFileSync('/usr/share/dict/words', 'utf8').split('\n').map(w => w.toLowerCase()));

(async () => {
  const out = process.argv[2], mode = process.argv[3] || 'en';
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: EXE });

  // SKIP_LIB=1 when BASE serves only the demo (the Vercel site, where index.html is the demo itself)
  const lib = process.env.SKIP_LIB ? null : await b.newPage({ viewport: { width: 1400, height: 1000 } });
  if (lib) { await lib.goto(`${BASE}/index.html`, { timeout: 120000 }); await lib.evaluate(() => document.fonts.ready);
  await lib.click('[data-page-lang="en"]'); await lib.waitForTimeout(300); }
  const text = lib ? await lib.evaluate(() => [...document.querySelectorAll('.phone.world:not([data-lang="hi"]), .app')].map(p => p.innerText).join('\n')) : '';
  const odd = new Map();
  for (const w of text.match(/[A-Za-z]{3,}/g) || []) {
    const l = w.toLowerCase();
    if (!WORDS.has(l) && !WORDS.has(l.replace(/s$/, '')) && !WORDS.has(l.replace(/(ed|ing)$/, ''))) odd.set(w, (odd.get(w) || 0) + 1);
  }
  console.log('English only, words not in the dictionary:', [...odd.keys()].sort().join(', '));

  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.goto(`${BASE}/${process.env.PAGE || 'demo.html'}`); await p.evaluate(() => document.fonts.ready);   // PAGE=review.html for the owner's review
  const cur = '.demo .phone:not([hidden])';
  if (mode !== 'mix') { await p.click(`${cur} [data-help]`); await p.click(`${cur} [data-set-lang="${mode}"]`); await p.click(`${cur} .helpsheet .close`); }
  const n = await p.locator('.demo .phone').count();
  for (let i = 0; i < n; i++) {
    await p.waitForTimeout(250);
    const ph = p.locator(cur);
    const cls = await ph.getAttribute('class');
    if (cls.includes('js-cut')) {   // the cutscene: one shot per panel, each tap brings the next
      const k = await ph.locator('.cutpanel').count();
      for (let j = 0; j < k; j++) {
        await p.waitForTimeout(700); await p.screenshot({ path: `${out}/${String(i).padStart(2, '0')}${'abcdefgh'[j]}.png` });
        if (j < k - 1) await ph.locator('.dock .main').click();
      }
    } else await p.screenshot({ path: `${out}/${String(i).padStart(2, '0')}.png` });
    if (cls.includes('js-pick')) await ph.locator('[role="radio"]').first().click();
    if (cls.includes('js-chips')) await ph.locator('.chips [role="radio"]').first().click();
    if (cls.includes('js-multi')) { const need = +(await ph.getAttribute('data-need')) || 3; for (let k = 0; k < need; k++) await ph.locator('.row').nth(k).click(); }
    if (cls.includes('js-order')) while (await ph.locator('.cr-tray .row:not([hidden])').count()) await ph.locator('.cr-tray .row:not([hidden])').first().click();
    if (cls.includes('js-split')) for (let k = 0; k < 12 && await ph.locator('.dock .main.is-wait').count(); k++) await ph.locator('.rk-family .row').nth(k % 3).click();
    if (cls.includes('js-rank')) { const k = await ph.locator('.rows .row').count(); for (let j = 0; j < k; j++) await ph.locator('.rows .row').nth(j).click(); }
    if (cls.includes('js-checks')) await ph.locator('.tile').first().click();
    if (/js-(pick|multi|order|split|rank|checks)/.test(cls)) {   // the step as played, before it is sent
      await p.waitForTimeout(150); await p.screenshot({ path: `${out}/${String(i).padStart(2, '0')}z.png` });
    }
    if (cls.includes('js-end')) break;
    if (await ph.locator('.dock .main.is-wait').count()) { console.log(`stuck on screen ${i}: ${await ph.getAttribute('aria-label')}`); break; }
    await ph.locator('.dock .main').click();
  }
  const last = await p.locator(cur).getAttribute('aria-label');
  console.log(`demo: ${n} screens in ${mode}; it ends on "${last}"; page errors: ${errors.length ? errors.join(' | ') : 'none'}`);
  await b.close();
})();
