// The demo's type as a Pixel 9 shows it (owner, 23 Oct 2026: "Show me the font weights and sizes as they will appear on
// my pixel 9"): a 412 x 923 CSS viewport at 2.625 device pixels per CSS pixel, as Chrome on the phone reports it. The
// demo stops scaling its phone below 500 px wide, so a CSS size is the size on the screen. For each kind of screen, every
// piece of visible text: its role (from its class), family, weight, size and line height, plus one shot at device pixels.
// Run:  BASE=http://127.0.0.1:8766 PAGE=demo.html node design-system/tools/type_pixel9.cjs <out-dir>
const fs = require('fs');
const { chromium } = require('/Users/priyanshu/equal-lens-evaluator-game/node_modules/playwright-core');
const EXE = '/Users/priyanshu/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const UA = 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';

const SCREENS = [   // [name, the first phone matching, what to do on it]
  ['opening cutscene', '.js-cut', null],
  ['chapter cover', '.phone:has(.is-cover)', null],
  ['pick one, notes on cards', '.js-pick', null],
  ['rank', '.js-rank', 'rank'],
  ['team, rows with notes', '.js-multi', null],
  ['believe', '.js-pick:has(.jd-teller)', null],
  ['result card', '.js-res', null],
  ['"?" sheet', '.js-pick', 'help'],
];

(async () => {
  const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage({ viewport: { width: 412, height: 923 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true, userAgent: UA });
  // the published page's skeleton carries this viewport tag; the local file does not, so a phone would lay it out 980 wide
  await p.route('**/*.html', async route => {
    const r = await route.fetch(); const body = (await r.text()).replace('<title>', '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>');
    await route.fulfill({ response: r, body, headers: { ...r.headers(), 'content-type': 'text/html; charset=utf-8' } });
  });
  await p.goto(`${process.env.BASE}/${process.env.PAGE || 'demo.html'}`); await p.evaluate(() => document.fonts.ready);
  console.log('layout width', await p.evaluate(() => innerWidth));
  const rows = [];
  for (const [name, sel, act] of SCREENS) {
    const ok = await p.evaluate(sel => {
      const all = [...document.querySelectorAll('.demo .phone')], t = document.querySelector(`.demo ${sel}`);
      if (!t) return false;
      all.forEach(x => { x.hidden = x !== t; }); scrollTo(0, 0); return true;
    }, sel);
    if (!ok) { console.log('no screen for', name); continue; }
    const cur = '.demo .phone:not([hidden])';
    if (act === 'rank') { for (let j = 0; j < 3; j++) await p.locator(`${cur} .rows .row`).nth(j).click(); }
    if (act === 'help') await p.click(`${cur} [data-help]`);
    await p.waitForTimeout(400);
    await p.screenshot({ path: `${out}/${String(SCREENS.findIndex(s => s[0] === name) + 1).padStart(2, '0')}.png` });
    const found = await p.evaluate(() => {
      const ph = document.querySelector('.demo .phone:not([hidden])'), seen = [];
      const roleOf = el => {
        for (let e = el; e && e !== ph; e = e.parentElement) {
          const c = [...e.classList].find(c => !/^(is-|js-|w-|world|phone|scr|tx)/.test(c));
          if (c) return c;
        }
        return el.tagName.toLowerCase();
      };
      for (const el of ph.querySelectorAll('*')) {
        const own = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ');
        if (!own) continue;
        const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
        if (el.closest('[hidden]')) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') continue;
        const z = el.currentCSSZoom || 1;   // the phone draws its screen at 0.8: report the size on the glass
        seen.push({ role: roleOf(el), family: cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(), weight: cs.fontWeight, css: parseFloat(cs.fontSize), zoom: z,
                    size: Math.round(parseFloat(cs.fontSize) * z * 10) / 10, line: cs.lineHeight === 'normal' ? 'normal' : Math.round(parseFloat(cs.lineHeight) * z * 10) / 10, lang: el.closest('[lang]')?.getAttribute('lang') || '',
                    text: own.slice(0, 48) });
      }
      return seen;
    });
    found.forEach(f => rows.push({ screen: name, ...f }));
  }
  fs.writeFileSync(`${out}/type.json`, JSON.stringify(rows, null, 1));
  console.log(`type: ${rows.length} text pieces on ${SCREENS.length} screens`);
  await b.close();
})();
