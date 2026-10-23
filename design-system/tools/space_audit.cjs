// Negative-space audit of every phone screen in the library (owner, 22 Oct 2026: "the negative space here has to be
// improved... do a negative space audit of all the screens"). Measures, on each phone frame:
//   gutter    a box or line of text closer than 12 px to the screen's left or right edge (full-bleed art and bands excepted)
//   bar       a top-bar control set in from the edge by a different amount than the body's content
//   cramped   a framed box whose words or icons come closer than 8 px to its own edge
//   offcentre a one-line framed box whose content sits more than 3 px off its vertical middle, or centred words more than
//             4 px off the horizontal middle
//   touching  two framed boxes in one stack closer than 6 px (they read as one)
//   collide   two unrelated boxes overlapping
// Usage: node design-system/tools/space_audit.cjs [page.html] [out.json]   (default: design-system/index.html)
const { chromium } = require('/Users/priyanshu/equal-lens-evaluator-game/node_modules/playwright-core');
const EXE = '/Users/priyanshu/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const path = require('path');
const fs = require('fs');

(async () => {
  const page = path.resolve(process.argv[2] || path.join(__dirname, '..', 'index.html'));
  const out = process.argv[3];
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
  await p.goto('file://' + page, { timeout: 120000 });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => document.querySelectorAll('.world').forEach(e => e.classList.add('cr-still')));
  const res = await p.evaluate(() => {
    const vis = el => { const cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05; };
    const painted = el => {
      const cs = getComputedStyle(el);
      const bg = !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor) && !/, 0\)$/.test(cs.backgroundColor);
      const img = cs.backgroundImage !== 'none';
      const border = ['Top', 'Right', 'Bottom', 'Left'].some(s => parseFloat(cs['border' + s + 'Width']) > 0 && cs['border' + s + 'Style'] !== 'none');
      const shadow = cs.boxShadow && cs.boxShadow !== 'none';
      return (bg || img || border || shadow);
    };
    const name = el => {
      const c = [...el.classList].filter(x => !/^(is-|js-|pad-)/.test(x)).slice(0, 3).join('.');
      const t = (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 28);
      return el.tagName.toLowerCase() + (c ? '.' + c : '') + (t ? ` "${t}"` : '');
    };
    const ctx = document.createElement('canvas').getContext('2d');
    const contentRect = el => {
      // the union of the element's own words and icons: text nodes, svg, and painted leaf children that are not frames
      let l = Infinity, t = Infinity, r = -Infinity, bt = -Infinity, n = 0;
      let deva = false;
      const add = rc => { if (rc.width < 1 || rc.height < 1) return; if (rc.deva) deva = true; l = Math.min(l, rc.left); t = Math.min(t, rc.top); r = Math.max(r, rc.right); bt = Math.max(bt, rc.bottom); n++; };
      const walk = node => {
        for (const c of node.childNodes) {
          if (c.nodeType === 3 && c.textContent.trim()) {
            // the ink of the words, not their line box: baseline from the font's ascent and descent, ink from the glyphs
            const rg = document.createRange(); rg.selectNodeContents(c);
            const cs = getComputedStyle(c.parentElement);
            ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
            const m = ctx.measureText(cs.textTransform === 'uppercase' ? c.textContent.trim().toUpperCase() : c.textContent.trim());
            for (const rc of rg.getClientRects()) {
              const fa = m.fontBoundingBoxAscent, fd = m.fontBoundingBoxDescent;
              const base = rc.top + (rc.height - (fa + fd)) / 2 + fa;
              // optical: capitals to baseline for Latin (descenders ignored, as type is centred); full ink for Devanagari
              const deva = /[\u0900-\u097F]/.test(c.textContent);
              const capH = ctx.measureText('H').actualBoundingBoxAscent;   // ascenders (h, l, k) rise above the capitals; type is centred on the caps
              add({ left: rc.left, right: rc.right, width: rc.width, height: rc.height, top: base - (deva ? m.actualBoundingBoxAscent : capH), bottom: deva ? base + m.actualBoundingBoxDescent : base, deva });
            }
          }
          else if (c.nodeType === 1 && vis(c)) {
            if (c.matches('svg, img, .face, i[style*="background-image"], .av')) add(c.getBoundingClientRect());
            else if (!c.classList.contains('vh')) walk(c);
          }
        }
      };
      walk(el);
      return n ? { left: l, top: t, right: r, bottom: bt, deva } : null;
    };
    const phones = [...document.querySelectorAll('.phone.world:not(.is-thumb)')].filter(vis);
    const issues = [];
    let screens = 0;
    for (const ph of phones) {
      const scr = ph.querySelector(':scope > .scr'); if (!scr) continue;
      const S = scr.getBoundingClientRect(); if (S.width < 200) continue;
      screens++;
      const w = [...ph.classList].find(c => c.startsWith('w-'));
      const label = ph.getAttribute('aria-label');
      const add = (kind, el, detail) => issues.push({ w, screen: label, kind, el: name(el), detail });
      const body = scr.querySelector(':scope > .scr-body');
      const bodyLeft = body ? Math.min(...[...body.children].filter(vis).map(c => c.getBoundingClientRect().left).filter(x => x > S.left)) - S.left : 16;
      // gutter: painted boxes and text blocks near the side edges
      const cands = [...scr.querySelectorAll('*')].filter(el => vis(el) && !el.closest('.vh') && !el.matches('.art, .notch, .scr-body, .dock, .topbar, svg *, .vh'));
      for (const el of cands) {
        const rc = el.getBoundingClientRect(); if (rc.width < 8 || rc.height < 8) continue;
        if (rc.bottom < S.top || rc.top > S.bottom) continue;
        const full = rc.width >= S.width - 2;
        if (full) continue;
        const isBox = painted(el), isText = [...el.childNodes].some(c => c.nodeType === 3 && c.textContent.trim());
        if (!isBox && !isText) continue;
        // only the outermost painted box of a nest is judged against the screen edge
        if (isBox && el.parentElement.closest('.scr *') && [...ancestors(el)].some(a => painted(a) && a.getBoundingClientRect().width < S.width - 2 && a !== scr && scr.contains(a))) continue;
        const lg = rc.left - S.left, rg = S.right - rc.right;
        if (lg < 12 && lg > -1) add('gutter', el, `left ${lg.toFixed(1)} px`);
        if (rg < 12 && rg > -1) add('gutter', el, `right ${rg.toFixed(1)} px`);
      }
      function* ancestors(el) { let a = el.parentElement; while (a && a !== scr) { yield a; a = a.parentElement; } }
      // top bar: the outer controls against the body's inset
      const bar = scr.querySelector(':scope > .topbar');
      if (bar) {
        const kids = [...bar.querySelectorAll('button, .plate, .dayplate, [class*="plate"]')].filter(vis).filter(k => painted(k));
        if (kids.length) {
          const first = Math.min(...kids.map(k => k.getBoundingClientRect().left)) - S.left;
          const last = S.right - Math.max(...kids.map(k => k.getBoundingClientRect().right));
          // a bar with nothing at one end (a centred plate) is not judged at that end
          if (first < 60 && Math.abs(first - bodyLeft) > 4) add('bar', bar, `left control ${first.toFixed(1)} px in, body ${bodyLeft.toFixed(1)} px`);
          if (last < 60 && Math.abs(last - bodyLeft) > 4) add('bar', bar, `right control ${last.toFixed(1)} px in, body ${bodyLeft.toFixed(1)} px`);
        }
      }
      // cramped and off-centre: painted boxes with their own words
      for (const el of cands) {
        if (!painted(el) || el.matches('.face, .av, i, svg, .tick, .stick, .lockmark, .armmark, .notch')) continue;
        const rc = el.getBoundingClientRect(); if (rc.width < 24 || rc.height < 20 || rc.width >= S.width - 2) continue;
        const c = contentRect(el); if (!c) continue;
        const pl = c.left - rc.left, pr = rc.right - c.right, pt = c.top - rc.top, pb = rc.bottom - c.bottom;
        const cs = getComputedStyle(el);
        const min = Math.min(pl, pr, pt, pb);
        if (min < 6 && min > -2) add('cramped', el, `ink to edge L${pl.toFixed(0)} R${pr.toFixed(0)} T${pt.toFixed(0)} B${pb.toFixed(0)}`);
        const oneLine = (c.bottom - c.top) < parseFloat(cs.fontSize) * 2.1;
        const pictured = cs.backgroundImage.includes('url(') || el.querySelector(':scope > .face, :scope > i[style*="background-image"]');
        if (oneLine && !c.deva && !pictured && Math.abs(pt - pb) > 3 && rc.height < 90) add('offcentre', el, `top ${pt.toFixed(1)} vs bottom ${pb.toFixed(1)}`);
        const centred = cs.textAlign === 'center' || (cs.display.includes('flex') && cs.justifyContent === 'center') || (cs.display.includes('grid') && cs.justifyItems === 'center');
        if (centred && oneLine && Math.abs(pl - pr) > 4) add('offcentre', el, `left ${pl.toFixed(1)} vs right ${pr.toFixed(1)}`);
      }
      // touching and collisions among the blocks of each stack
      const stacks = [body, scr.querySelector(':scope > .dock'), bar, ...scr.querySelectorAll('.tiles, .rows, .slots, .chips, .daygrid, .figs, .coverstack')].filter(Boolean);
      for (const st of stacks) {
        const kids = [...st.children].filter(k => vis(k) && k.getBoundingClientRect().height > 4);
        for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) {
          const a = kids[i].getBoundingClientRect(), c = kids[j].getBoundingClientRect();
          const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left), oy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
          if (ox > 2 && oy > 2) add('collide', kids[j], `overlaps ${name(kids[i])} by ${ox.toFixed(0)} x ${oy.toFixed(0)} px`);
          else if (painted(kids[i]) && painted(kids[j]) && !st.closest('.slip')) {   // the Station week slip is perforated on purpose
            const gap = Math.max(c.left - a.right, a.left - c.right, c.top - a.bottom, a.top - c.bottom);
            if (gap >= 0 && gap < 6 && (ox > 0 || oy > 0)) add('touching', kids[j], `${gap.toFixed(1)} px from ${name(kids[i])}`);
          }
        }
      }
    }
    return { screens, issues };
  });
  const by = {};
  for (const i of res.issues) { const k = `${i.kind} | ${i.el.replace(/ ".*"$/, '')} | ${i.detail.replace(/[\d.]+/g, 'n')}`; (by[k] = by[k] || []).push(i); }
  const rows = Object.entries(by).sort((a, b) => b[1].length - a[1].length);
  console.log(`${res.screens} phone screens, ${res.issues.length} findings in ${rows.length} kinds`);
  for (const [k, v] of rows) {
    const worlds = [...new Set(v.map(x => x.w.slice(2)))].join(',');
    console.log(String(v.length).padStart(4), k, ' [' + worlds + ']  e.g. ' + v[0].screen + ': ' + v[0].el.slice(0, 60) + ' ' + v[0].detail);
  }
  if (out) fs.writeFileSync(out, JSON.stringify(res, null, 1));
  await b.close();
})();
