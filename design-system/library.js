(() => {
  const rmQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => rmQuery.matches || document.documentElement.classList.contains('rm');
  const langOf = ph => ph.dataset.cur || 'en';

  // three modes: 'mix' (the original Hinglish: English words, Hindi on the signs), 'hi' (Hindi) and 'en' (English only)
  function translate(ph, lang) {
    ph.dataset.cur = lang;
    ph.dataset.mode = lang;
    ph.setAttribute('lang', lang === 'hi' ? 'hi' : 'en');
    // data-eng holds the English-only wording where Hinglish keeps Hindi words in Latin letters
    ph.querySelectorAll('[data-hi], [data-eng]').forEach(el => {
      if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      const hi = lang === 'hi' && el.dataset.hi !== undefined;
      el.innerHTML = hi ? el.dataset.hi : (lang === 'en' && el.dataset.eng) || el.dataset.en;
      if (hi) el.setAttribute('lang', 'hi'); else el.removeAttribute('lang');
    });
    ph.querySelectorAll('[data-hi-label]').forEach(el => {
      if (el.dataset.enLabel === undefined) el.dataset.enLabel = el.getAttribute('aria-label');
      el.setAttribute('aria-label', lang === 'hi' ? el.dataset.hiLabel : (lang === 'en' && el.dataset.engLabel) || el.dataset.enLabel);
    });
    ph.querySelectorAll('.langchips [data-set-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.setLang === lang)));
    if (ph.matches('.js-pick, .js-chips, .js-multi')) refresh(ph);
    ph.querySelectorAll('.scr-body').forEach(b => b.dispatchEvent(new Event('scroll')));   // a language can change what fits
  }

  function setMain(btn, en, hi, live) {
    const span = btn.querySelector('span[data-hi]');
    if (!span) return;
    span.dataset.en = en; span.dataset.hi = hi;
    const ph = btn.closest('.phone, .app');
    span.innerHTML = ph && langOf(ph) === 'hi' ? hi : en;
    btn.classList.toggle('is-live', live); btn.classList.toggle('is-wait', !live);
    if (live) btn.removeAttribute('aria-disabled'); else btn.setAttribute('aria-disabled', 'true');
  }

  function pickedName(el) {
    if (el.dataset.en) return [el.dataset.en, el.dataset.hiName || el.dataset.en];
    const s = el.querySelector('span[data-hi]');
    if (!s) return [el.textContent.trim(), el.textContent.trim()];
    return [s.dataset.en !== undefined ? s.dataset.en : s.innerHTML, s.dataset.hi];
  }

  function refresh(ph) {
    const btn = ph.querySelector('.dock .main[data-live-en]');
    if (!btn) return;
    if (ph.classList.contains('js-multi')) {   // data-need says how many (3 unless set); the live label is the button's own
      const left = (+ph.dataset.need || 3) - ph.querySelectorAll('.row[aria-checked="true"]').length;
      if (left > 0) setMain(btn, `Pick ${left} more`, `${left} और चुनें`, false);
      else setMain(btn, btn.dataset.liveEn, btn.dataset.liveHi, true);
      return;
    }
    const sel = ph.querySelector('[role="radio"][aria-checked="true"]');
    if (!sel) { setMain(btn, btn.dataset.waitEn, btn.dataset.waitHi, false); return; }
    const [en, hi] = pickedName(sel);
    setMain(btn, btn.dataset.liveEn.replace('{n}', en), btn.dataset.liveHi.replace('{n}', hi), true);
  }

  function refuse(el) {
    if (reduced()) return;
    el.classList.remove('is-refused'); void el.offsetWidth; el.classList.add('is-refused');
  }

  document.querySelectorAll('[role="radiogroup"]').forEach(g => {
    const items = g.querySelectorAll('[role="radio"]');
    items.forEach(it => it.addEventListener('click', () => {
      const on = it.getAttribute('aria-checked') === 'true';
      items.forEach(x => { x.setAttribute('aria-checked', 'false'); x.classList.remove('is-selected'); });
      if (!on) it.setAttribute('aria-checked', 'true');
      const ph = it.closest('.phone, .app'); if (ph) refresh(ph);
    }));
  });

  document.querySelectorAll('.js-multi').forEach(ph => {
    ph.querySelectorAll('.row[role="checkbox"]').forEach(r => r.addEventListener('click', () => {
      const on = r.getAttribute('aria-checked') === 'true';
      if (!on && ph.querySelectorAll('.row[aria-checked="true"]').length >= (+ph.dataset.need || 3)) { refuse(r); return; }
      r.setAttribute('aria-checked', String(!on)); r.classList.toggle('is-selected', !on);
      refresh(ph);
    }));
  });

  document.querySelectorAll('.dock .main').forEach(b => b.addEventListener('click', () => { if (b.classList.contains('is-wait')) refuse(b); }));
  document.querySelectorAll('.setrow[role="switch"]').forEach(r => r.addEventListener('click', () => r.setAttribute('aria-checked', r.getAttribute('aria-checked') === 'true' ? 'false' : 'true')));

  const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  document.querySelectorAll('.seg').forEach(g => {
    const tabs = g.querySelectorAll('[role="tab"]');
    tabs.forEach(t => t.addEventListener('click', () => {
      tabs.forEach(x => { x.setAttribute('aria-selected', 'false'); const s = x.querySelector('svg'); if (s) s.remove(); });
      t.setAttribute('aria-selected', 'true'); t.insertAdjacentHTML('afterbegin', TICK);
    }));
  });

  // the languages, in the "?" sheet: a language turns its screen (the demo turns every screen)
  document.querySelectorAll('[data-set-lang]').forEach(b => b.addEventListener('click', () => {
    const ph = b.closest('.phone, .app'); if (ph) translate(ph, b.dataset.setLang);
  }));
  document.querySelectorAll('.phone[data-lang="hi"]').forEach(ph => translate(ph, 'hi'));

  document.querySelectorAll('[data-tog]').forEach(t => t.addEventListener('click', () => {
    const on = t.getAttribute('aria-pressed') !== 'true';
    t.setAttribute('aria-pressed', String(on));
    if (['rm', 'grey', 'protan', 'deutan'].includes(t.dataset.tog)) document.documentElement.classList.toggle(t.dataset.tog, on);
  }));

  document.querySelectorAll('.phone[data-lang="hi"]').forEach(ph => ph.setAttribute('lang', 'hi'));
  // a body that runs past the screen says so: the fade at its foot and the round "more" cue above the dock, as on small
  // phones; both go when the body is scrolled to its end (22 Oct: 5:4 portraits made the four-card steps scroll)
  const DOWN = '<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"/></svg>';
  const moreCue = body => {
    const scr = body.parentElement; if (!scr) return;
    const more = body.scrollHeight - body.clientHeight > 2 && body.scrollTop + body.clientHeight < body.scrollHeight - 2;
    body.classList.toggle('has-more', more);
    let cue = scr.querySelector(':scope > .morecue.is-live');
    if (more && !scr.querySelector(':scope > .morecue')) {
      const dock = scr.querySelector(':scope > .dock');
      cue = document.createElement('span'); cue.className = 'morecue is-live'; cue.setAttribute('aria-hidden', 'true'); cue.innerHTML = DOWN;
      cue.style.bottom = ((dock ? dock.offsetHeight : 0) + 8) + 'px'; scr.appendChild(cue);
    }
    if (cue) cue.hidden = !more;
  };
  document.querySelectorAll('.phone .scr-body, .app .scr-body').forEach(body => { moreCue(body); body.addEventListener('scroll', () => moreCue(body), { passive: true }); });
  document.fonts && document.fonts.ready.then(() => document.querySelectorAll('.phone .scr-body, .app .scr-body').forEach(moreCue));
  document.querySelectorAll('[data-page-lang]').forEach(t => t.addEventListener('click', () => {
    document.querySelectorAll('[data-page-lang]').forEach(b => b.setAttribute('aria-pressed', String(b === t)));
    document.querySelectorAll('.phone:not([data-lang="hi"]), .app').forEach(ph => translate(ph, t.dataset.pageLang));
  }));
  const flapBtn = document.querySelector('[data-flap]');
  if (flapBtn) flapBtn.addEventListener('click', () => {
    const target = String(10 + Math.floor(Math.random() * 89));
    document.querySelectorAll('.js-flap .flaps i').forEach((t, i) => {
      if (reduced()) { t.textContent = target[i]; return; }
      let n = 0; const steps = 4 + i * 2;
      const tick = () => {
        t.textContent = n >= steps ? target[i] : String((Number(t.textContent) + 1) % 10);
        if (++n <= steps) setTimeout(tick, 90); else t.textContent = target[i];
      };
      tick();
    });
  });

  const L = h => { const v = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(c => c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
  const ratio = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  // [world id ('' for shared), pair, foreground, background, needed ratio, what]. A row shows only when its world is on the page.
  // Lugdi and Station keep their pairs here; a worlds/<id>.py module lists its own in `contrast`, and the build adds them as JSON.
  const PAIRS = [
    ['lugdi', 'Ink on Lugdi paper', '#17110F', '#EFE7D4', 7, 'text on paper'], ['lugdi', 'Paper on Lugdi ground', '#EFE7D4', '#1B0B2E', 4.5, 'text'],
    ['lugdi', 'Title white on Lugdi ground', '#FFF3DC', '#1B0B2E', 4.5, 'text on plates'], ['', 'Ink on pick yellow', '#17110F', '#FFD23F', 7, 'text on picks'],
    ['lugdi', 'Paper on Lugdi muted (not ready)', '#EFE7D4', '#4A3B57', 7, 'button text'], ['', 'Ink frame against pick yellow', '#17110F', '#FFD23F', 3, 'state mark'],
    ['lugdi', 'Print red against Lugdi paper', '#E4002B', '#EFE7D4', 3, 'stamp mark'], ['lugdi', 'White focus ring against Lugdi ground', '#FFFFFF', '#1B0B2E', 3, 'focus'],
    ['lugdi', 'Ink focus ring against Lugdi paper', '#17110F', '#EFE7D4', 3, 'focus'],
    ['station', 'Ink on Station ticket', '#121212', '#E9DFC4', 7, 'text on paper'], ['station', 'White on enamel cobalt', '#F4F1E8', '#13308F', 4.5, 'board text'],
    ['station', 'White on split-flap', '#F4F1E8', '#262626', 4.5, 'text'], ['station', 'Ticket on Station muted (not ready)', '#E9DFC4', '#3A3D40', 7, 'button text'],
    ['station', 'Ticket edge on Station ground', '#E9DFC4', '#181A1B', 3, 'control edge'], ['station', 'Enamel cobalt on Station ground (rimmed)', '#13308F', '#181A1B', 3, 'needs its white rim'],
  ];
  document.querySelectorAll('script.pg-pairs').forEach(s => PAIRS.push(...JSON.parse(s.textContent)));
  const onPage = w => !w || document.querySelector('.phone.w-' + w);
  const tb = document.querySelector('#contrast tbody');
  if (tb) PAIRS.filter(([w]) => onPage(w)).forEach(([, n, a, b, need, what]) => {
    const r = ratio(a, b);
    const res = r >= need ? 'Pass' : (n.includes('rimmed') ? 'Passes only with the rim' : 'Fail');
    tb.insertAdjacentHTML('beforeend', `<tr><td><span class="chipsw" style="background:${b}"></span><span class="chipsw" style="background:${a}"></span> ${n}</td><td>${r.toFixed(2)}:1</td><td>${need}:1 (${what})</td><td>${res}</td></tr>`);
  });
})();
