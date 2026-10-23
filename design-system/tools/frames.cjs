// Checks every phone frame on a library page: words on screen, the fixed skeleton, and text runs for the pixel contrast check.
// Usage: node tools/frames.cjs <url> <outdir> [hi]
//   Writes <outdir>/frames.json (one row per frame), <outdir>/shot-<n>.png (the frame as drawn) and <outdir>/px-<n>.png
//   (the same frame with all text made transparent). Then run: python3 tools/contrast_score.py <outdir>/frames.json
//   Memory: use a small one-world page (LIB_WORLDS=<id> LIB_OUT=<name>), never the full five-world preview.
const { chromium } = require('/Users/priyanshu/equal-lens-evaluator-game/node_modules/playwright-core');
const fs = require('fs');
const path = require('path');
const EXE = '/Users/priyanshu/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const [url, outdir, ...rest] = process.argv.slice(2);
const HI = rest.includes('hi'), SHOTS = rest.includes('--shots');
if (!url || !outdir) { console.error('usage: node tools/frames.cjs <url> <outdir> [hi] [--shots]'); process.exit(2); }
fs.mkdirSync(outdir, { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await p.goto(url); await p.waitForTimeout(1500);
  if (HI) { const t = await p.$('[data-tog="lang"]'); if (t) { await t.click(); await p.waitForTimeout(400); } }
  await p.addStyleTag({ content: '.pg-nav{position:static!important} *{animation-duration:0s!important;transition-duration:0s!important}' });
  const phones = await p.$$('.phone:not(.is-thumb)');
  const rows = [];
  for (let i = 0; i < phones.length; i++) {
    const ph = phones[i];
    const box = await ph.boundingBox(); if (!box || box.width < 200) continue;
    const info = await ph.evaluate((el) => {
      const fig = el.closest('figure'); const cap = fig && fig.querySelector('figcaption');
      const sec = el.closest('section');
      // measure everything after the frame is scrolled into view, against the same box
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect(), r2 = r;
      const world = (el.className.match(/\bw-([a-z]+)/) || (el.closest('[class*="w-"]') || { className: '' }).className.match(/\bw-([a-z]+)/) || [])[1] || '';
      const vis = (n) => { for (let e = n; e && e !== el.parentElement; e = e.parentElement) { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false; } return true; };
      // a run covered by a scrim, a sheet or a clipping box is skipped, since nobody reads it there
      const covered = (pe, rc) => {
        const cx = rc.left + rc.width / 2, cy = rc.top + rc.height / 2;
        if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) return false;
        const hit = document.elementFromPoint(cx, cy);
        return !!hit && hit !== pe && !pe.contains(hit) && !hit.contains(pe);
      };
      // names, quotes and screen-reader-only text do not count against the word budget (R-NUM-20)
      const skip = (n) => n.closest('.nm, .quote, .vh, [data-count="0"], .slot .who, [aria-hidden="true"], script, style');
      const words = [];
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (w.nextNode()) {
        const t = w.currentNode; const s = t.textContent.trim(); if (!s) continue;
        const pe = t.parentElement; if (!pe || !vis(pe) || skip(pe)) continue;
        const rr = pe.getBoundingClientRect(); if (rr.bottom < r.top || rr.top > r.bottom || rr.width < 2) continue;
        if (covered(pe, rr)) continue;
        for (const tok of s.split(/\s+/)) if (tok && !/^[\d.,:%/+\-]+$/.test(tok) && !/^[|·•]$/.test(tok)) words.push(tok);
      }
      // skeleton: a puzzle step has the question box and the dock but no tab bar (tab screens dock at 682 and use the 20-word budget)
      const q = el.querySelector('.qbox, h1.q'); const dock = el.querySelector('.dock');
      const tabs = !!el.querySelector('.tabbar');
      const step = !!(q && dock && el.querySelector('.dock .main')) && !tabs;
      const runs = [];
      const w2 = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (w2.nextNode()) {
        const t = w2.currentNode; if (!t.textContent.trim()) continue;
        const pe = t.parentElement; if (!pe || !vis(pe) || pe.closest('script, style')) continue;
        const range = document.createRange(); range.selectNodeContents(t);
        for (const rc of range.getClientRects()) {
          if (rc.width < 2 || rc.height < 4 || rc.bottom < r2.top || rc.top > r2.bottom || rc.right < r2.left || rc.left > r2.right) continue;
          if (covered(pe, rc)) continue;
          const cs = getComputedStyle(pe);
          runs.push({ text: t.textContent.trim().slice(0, 40), color: cs.color, size: parseFloat(cs.fontSize), weight: +cs.fontWeight,
                      x: rc.left - r2.left, y: rc.top - r2.top, w: rc.width, h: rc.height });
        }
      }
      return { caption: cap ? cap.innerText.replace(/\s+/g, ' ').trim().slice(0, 120) : '', section: sec ? sec.id : '', world,
               words: words.length, wordlist: words.join(' ').slice(0, 400), step, tabs,
               qtop: q ? Math.round(q.getBoundingClientRect().top - r.top) : null,
               docktop: dock ? Math.round(dock.getBoundingClientRect().top - r.top) : null,
               w: Math.round(r.width), h: Math.round(r.height), runs };
    });
    // the drawn frame is always saved: the contrast score finds the letters by comparing it with the text-free frame
    await ph.screenshot({ path: path.join(outdir, `shot-${i}.png`) });
    await ph.evaluate(el => {
      el.classList.add('__nt');
      // lettering filled with a texture (background-clip: text) is the text itself, not its background
      for (const e of [el, ...el.querySelectorAll('*')]) {
        const s = getComputedStyle(e);
        if (s.backgroundClip === 'text' || s.webkitBackgroundClip === 'text') e.classList.add('__bt');
      }
    });
    await p.addStyleTag({ content: '.__nt, .__nt * { color: transparent !important; -webkit-text-fill-color: transparent !important; -webkit-text-stroke: 0 !important; text-shadow: none !important; } .__bt { background: none !important; }' });
    await ph.screenshot({ path: path.join(outdir, `px-${i}.png`) });
    await ph.evaluate(el => { el.classList.remove('__nt'); for (const e of el.querySelectorAll('.__bt')) e.classList.remove('__bt'); el.classList.remove('__bt'); });
    rows.push({ n: i, png: path.join(outdir, `px-${i}.png`), shot: path.join(outdir, `shot-${i}.png`), ...info });
  }
  fs.writeFileSync(path.join(outdir, 'frames.json'), JSON.stringify(rows));
  const over = rows.filter(r => r.words > (r.step ? 15 : 20));
  const skel = rows.filter(r => r.qtop !== null && r.docktop !== null && r.w === 390 && r.h === 844 && (r.step || r.tabs) && (Math.abs(r.qtop - 104) > 2 || Math.abs(r.docktop - (r.tabs ? 682 : 748)) > 2));
  console.log(`frames ${rows.length}; over word budget ${over.length}; skeleton off ${skel.length}`);
  for (const r of over) console.log(`  words ${r.words}/${r.step ? 15 : 20} [${r.world}] ${r.section} | ${r.caption}`);
  for (const r of skel) console.log(`  skeleton q${r.qtop} dock${r.docktop} [${r.world}] ${r.section} | ${r.caption}`);
  await b.close();
})();
