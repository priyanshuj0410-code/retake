// The "?" sheet as a player meets it (owner, 23 Oct 2026: "put language in the ? menu"): the opening's header and dock,
// the sheet opened there, Hindi chosen in it, the sheet closed, and the sheet on the first step in Hindi.
// Run:  BASE=http://127.0.0.1:8766 PAGE=demo.html node design-system/tools/help_check.cjs <out-dir>
const { chromium } = require('/Users/priyanshu/equal-lens-evaluator-game/node_modules/playwright-core');
const EXE = '/Users/priyanshu/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

(async () => {
  const out = process.argv[2], b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.goto(`${process.env.BASE}/${process.env.PAGE || 'demo.html'}`); await p.evaluate(() => document.fonts.ready);
  const cur = '.demo .phone:not([hidden])', shot = async n => { await p.waitForTimeout(350); await p.screenshot({ path: `${out}/${n}.png` }); };
  await shot('1-opening');
  await p.click(`${cur} [data-help]`); await shot('2-sheet-open');
  await p.click(`${cur} .helpsheet [data-set-lang="hi"]`); await shot('3-hindi-chosen');
  await p.click(`${cur} .helpsheet .close`); await shot('4-closed-hindi');
  const step = await p.evaluate(() => {   // straight to the first step, as a player would reach it
    const all = [...document.querySelectorAll('.demo .phone')], s = document.querySelector('.demo .phone.js-pick, .demo .phone.js-rank');
    all.forEach(x => { x.hidden = x !== s; }); return s.getAttribute('aria-label');
  });
  await p.click(`${cur} [data-help]`); await shot('5-step-sheet-hindi');
  await p.click(`${cur} .helpsheet .sndrow`); await shot('5b-sound-off');
  await p.keyboard.press('Escape'); await shot('6-step-closed');
  const state = await p.evaluate(() => ({
    lang: [...document.querySelectorAll('.demo .phone')].map(x => x.dataset.cur || 'mix').filter((v, i, a) => a.indexOf(v) === i),
    open: document.querySelectorAll('.helpsheet:not([hidden])').length,
    pressed: [...document.querySelectorAll('.demo .phone')][0].querySelector('.langchips [aria-pressed="true"]').dataset.setLang,
    sound: [...new Set([...document.querySelectorAll('.sndrow')].map(x => x.getAttribute('aria-checked')))].join(','),
  }));
  console.log(`help: step "${step}"; languages on the screens: ${state.lang.join(', ')}; sheets left open: ${state.open}; ticked: ${state.pressed}; sound switches: ${state.sound}; page errors: ${errors.length ? errors.join(' | ') : 'none'}`);
  await b.close();
})();
