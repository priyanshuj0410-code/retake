import { createRequire } from 'module';
const require = createRequire('/Users/priyanshu/equal-lens-trainer/package.json');
const { chromium } = require('playwright-core');

const PAGE = 'file:///Users/priyanshu/equal-lens-trainer/design-system/sound/worlds.html';
const OUT = process.argv[2];
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await chromium.launch({ headless: true, executablePath: '/Users/priyanshu/Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell', args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
page.on('pageerror', e => errors.push('pageerror: ' + e.message));

try {
  await page.goto(PAGE, { waitUntil: 'load' });
  await sleep(600);
  const report = {};
  report.beforePress = await page.evaluate(() => ({ ctx: S.ctx === null, fxButtons: document.querySelectorAll('#fxtable button').length, loops: document.querySelectorAll('[data-loop]').length }));

  const overflow = {};
  for (const w of [320, 390]) {
    await page.setViewportSize({ width: w, height: 844 });
    await sleep(150);
    overflow[w] = await page.evaluate(() => {
      const de = document.documentElement;
      const wide = [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > de.clientWidth + 1).slice(0, 5).map(el => el.tagName + '.' + el.className);
      return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, wide };
    });
  }
  report.overflow = overflow;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: OUT + '/top-390.png' });

  // live: every loop, then calm on a running loop, then every effect button
  const live = [];
  for (const id of ['jA', 'jB', 'jC', 'cA', 'cB', 'cC', 'rA', 'rB', 'rC']) {
    await page.click('[data-loop="' + id + '"]');
    await sleep(700);
    live.push(await page.evaluate(() => ({ id: S.loop && S.loop.def.id, state: S.ctx.state, steps: S.loop && S.loop.step, nodes: S.loop && S.loop.keep.length })));
  }
  await page.click('#calm');
  await sleep(500);
  live.push(await page.evaluate(() => ({ calmLoop: S.loop && S.loop.def.id, calm: S.calm, steps: S.loop && S.loop.step })));
  await page.click('#calm');
  report.live = live;

  const fxCount = await page.evaluate(async () => {
    const bs = [...document.querySelectorAll('button[data-fx], button[data-pulse], button[data-skip]')];
    for (const b of bs) { b.click(); await new Promise(r => setTimeout(r, 30)); }
    return bs.length;
  });
  report.fxClicked = fxCount;
  await page.evaluate(() => { S.loop.fading = false; return fadeLoop(0.3, () => { window.__faded = true; }); });
  await sleep(700);
  report.fade = await page.evaluate(() => ({ faded: !!window.__faded, loopAfter: S.loop }));
  await page.click('#stop');

  // offline renders: build each graph in an OfflineAudioContext and measure it
  report.levels = await page.evaluate(async () => {
    const saved = { ctx: S.ctx, bus: S.bus, comp: S.comp, master: S.master, fx: S.fx, noise: S.noise, calm: S.calm };
    const SR = 44100;
    const measure = buf => {
      const d = buf.getChannelData(0);
      let pk = 0, ss = 0, nan = 0;
      for (let i = 0; i < d.length; i++) { const v = d[i]; if (v !== v) { nan++; continue; } const a = Math.abs(v); if (a > pk) pk = a; ss += v * v; }
      return { peak: +pk.toFixed(3), rmsDb: +(10 * Math.log10(ss / d.length + 1e-12)).toFixed(1), nan };
    };
    const setup = secs => {
      const c = new OfflineAudioContext(1, Math.ceil(SR * secs), SR);
      S.ctx = c; S.noise = makeNoise(c);
      const ch = buildChain(c, 0.4);
      S.bus = ch.bus; S.comp = ch.comp; S.master = ch.master;
      S.fx = c.createGain(); S.fx.connect(S.bus);
      return c;
    };
    const res = { loops: {}, fx: {} };
    try {
      for (const calm of [false, true]) {
        S.calm = calm;
        for (const id of Object.keys(MUSIC)) {
          const def = MUSIC[id], len = loopLen(def), c = setup(len + 1.5);
          const out = c.createGain(); out.gain.value = def.trim * (calm ? 0.8 : 1); out.connect(S.bus);
          const keep = [], h = { out, t0: 0.05, keep: n => { keep.push(n); return n; } };
          def.setup(out, h);
          for (let i = 0; i < def.steps; i++) def.onStep(i, 0.05 + i * def.stepDur, h);
          keep.forEach(n => n.stop(len + 0.2));
          res.loops[id + (calm ? ' calm' : '')] = measure(await c.startRendering());
        }
        for (const w of Object.keys(FX)) for (const ev of Object.keys(FX[w])) {
          const c = setup(2.6);
          FX[w][ev](0.05, S.fx);
          const r = measure(await c.startRendering());
          const d = c.length ? null : null;
          res.fx[w + '.' + ev + (calm ? ' calm' : '')] = r;
        }
      }
    } finally {
      Object.assign(S, saved);
    }
    return res;
  });

  // sound length per effect: last sample above -50 dB
  report.lengths = await page.evaluate(async () => {
    const saved = { ctx: S.ctx, bus: S.bus, comp: S.comp, master: S.master, fx: S.fx, noise: S.noise, calm: S.calm };
    const SR = 44100, out = {};
    try {
      for (const calm of [false, true]) {
        S.calm = calm;
        for (const w of Object.keys(FX)) for (const ev of ['result', 'milestone', 'cover', 'commit']) {
          const c = new OfflineAudioContext(1, SR * 3, SR);
          S.ctx = c; S.noise = makeNoise(c);
          const ch = buildChain(c, 1); S.bus = ch.bus; S.fx = c.createGain(); S.fx.connect(S.bus);
          FX[w][ev](0, S.fx);
          const d = (await c.startRendering()).getChannelData(0);
          let last = 0; for (let i = 0; i < d.length; i++) if (Math.abs(d[i]) > 0.00316) last = i;
          out[w + '.' + ev + (calm ? ' calm' : '')] = +(last / SR).toFixed(2);
        }
      }
    } finally { Object.assign(S, saved); }
    return out;
  });

  await page.evaluate(() => document.getElementById('moments').scrollIntoView());
  await page.screenshot({ path: OUT + '/moments-390.png' });
  await page.evaluate(() => document.getElementById('effects').scrollIntoView());
  await page.screenshot({ path: OUT + '/effects-390.png' });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.evaluate(() => document.getElementById('cricket').scrollIntoView());
  await page.screenshot({ path: OUT + '/cricket-1280.png' });
  await page.evaluate(() => document.getElementById('fx-h').scrollIntoView());
  await page.screenshot({ path: OUT + '/effects-1280.png' });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.evaluate(() => document.getElementById('rukavat').scrollIntoView());
  await page.screenshot({ path: OUT + '/rukavat-dark-1280.png' });

  report.errors = errors;
  const fs = await import('fs');
  fs.writeFileSync(OUT + '/report.json', JSON.stringify(report, null, 1));
  console.log('errors:', JSON.stringify(errors));
} finally {
  await browser.close();
}
