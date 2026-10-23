// How the demo's phone fills the viewport's height (owner, 23 Oct 2026: "The app's height is not scaling based on the
// viewport"): for a phone and two desktop sizes, the viewport, the phone's box, the screen's box and where the main
// button ends, plus one shot each. Run:  BASE=... PAGE=index.html node design-system/tools/height_check.cjs <out-dir>
const { chromium } = require('/Users/priyanshu/equal-lens-evaluator-game/node_modules/playwright-core');
const EXE = '/Users/priyanshu/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const SIZES = [['pixel9', { width: 412, height: 923 }, 2.625, true], ['laptop', { width: 1440, height: 900 }, 1, false], ['short', { width: 1280, height: 640 }, 1, false]];
(async () => {
  const out = process.argv[2], b = await chromium.launch({ executablePath: EXE });
  for (const [name, viewport, dpr, mobile] of SIZES) {
    const p = await b.newPage({ viewport, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile });
    await p.goto(`${process.env.BASE}/${process.env.PAGE || 'index.html'}`); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
    for (const which of ['.js-cut', '.js-pick']) {
      const m = await p.evaluate(sel => {
        const all = [...document.querySelectorAll('.demo .phone')], t = document.querySelector(`.demo ${sel}`);
        all.forEach(x => { x.hidden = x !== t; }); dispatchEvent(new Event('resize'));
        const r = e => { const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom), Math.round(b.height)]; };
        const ph = t, scr = t.querySelector(':scope > .scr'), dock = t.querySelector('.dock');
        return { inner: [innerWidth, innerHeight], phone: r(ph), zoom: ph.style.zoom || '1', scr: r(scr), dock: r(dock) };
      }, which);
      console.log(name, which, JSON.stringify(m));
      await p.waitForTimeout(200); await p.screenshot({ path: `${out}/${name}${which.replace('.js-', '-')}.png` });
    }
    await p.close();
  }
  await b.close();
})();
