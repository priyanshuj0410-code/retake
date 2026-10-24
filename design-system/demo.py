"""Builds demo.html: the First take, playable, for the owner to sign off before the app is built and to share (owner,
22 Oct 2026: "Get the demo to run the whole first take then since we have the puzzles ... I'll sign off from the demo to
start building the actual app").

Five chapters in the First take's order (Station, Lugdi, Jadugar, Cricket, Rukavat), each opening on its world's cover,
then its decisions as first_take.py reads them from knowledge/content/first-take.md. Cards come in a new order on every
load, as for a player. The hard decisions are in, for the team's feedback (owner, 23 Oct 2026: "include the hard
questions... these are my team members"); no help line number is printed anywhere in it. No score
is shown: how the game scores waits on the research (RSE-164), and a number made up for a demo would read as real.
Cutscenes go between chapters once their panels are picked (art/cutscenes.py, knowledge/content/story.md).

Build:  python3 design-system/demo.py   (writes demo.html and demo-files.json, the files the page needs, for publishing)
The owner's private review with the 12 hard decisions (owner, 23 Oct 2026): python3 design-system/demo.py review
(writes review.html and review-files.json; each chapter opens on its hard cover, naming the setting plainly). The
help line numbers in each chapter's "?" are checked against their official sources before any player outside the team
sees them.
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import library as L
import first_take as FT
import story_take as S

# The First take's cutscenes (knowledge/content/story.md): {where it plays: ((label en, hi), [(panel, world, caption en,
# caption hi)])}. Panels arrive one per tap, down the page like a comic strip, and the screen's own colours, type and
# button change world with the newest panel; a seam panel already belongs to the next world. A cutscene goes in once all
# its panels are picked and exported (art/cutscenes.py: sheet ft, then export ft). Hindi is a first draft.
CUTS = {
    'before station': (('Monsoon night', 'बरसात की रात'), [
        ('ft-0-1', 'station', 'Monsoon night on the Nashik line.', 'नाशिक लाइन पर बरसात की रात।'),
        ('ft-0-2', 'station', "Gurpreet's crew board has gaps to fill.", 'गुरप्रीत के क्रू बोर्ड पर कुछ जगहें ख़ाली हैं।')]),
    'after station': (('From Station to Lugdi', 'स्टेशन से लुगदी तक'), [
        ('ft-1-1', 'station', "Mud on the line. The onion wagons can't go on.", 'लाइन पर कीचड़। प्याज़ के डिब्बे आगे नहीं जा सकते।'),
        ('ft-1-2', 'lugdi', 'Beside the rails, the ghat road climbs the same hill.', 'पटरियों के साथ, घाट की सड़क उसी पहाड़ पर चढ़ती है।'),
        ('ft-1-3', 'lugdi', 'The onions go by road. Mehul seth needs drivers.', 'प्याज़ सड़क से जाएगा। मेहुल सेठ को ड्राइवर चाहिए।')]),
    'after lugdi': (('From Lugdi to Jadugar', 'लुगदी से जादूगर तक'), [
        ('ft-2-1', 'lugdi', "The magic show hires Mehul seth's last truck.", 'जादू का शो मेहुल सेठ का आख़िरी ट्रक किराए पर लेता है।'),
        ('ft-2-2', 'jadugar', 'It carries their tent to the next town.', 'वह उनका तंबू अगले शहर ले जाता है।'),
        ('ft-2-3', 'jadugar', "By the late show, the Chandni Mandal's tent is up.", 'देर रात के शो तक, चाँदनी मंडल का तंबू तन गया।')]),
    'after jadugar': (('From Jadugar to Cricket', 'जादूगर से क्रिकेट तक'), [
        ('ft-3-1', 'jadugar', 'The show packs up at dawn.', 'सुबह होते ही शो का सामान बँधने लगा।'),
        ('ft-3-2', 'cricket', "Their tent stood on the town's old cricket ground.", 'उनका तंबू शहर के पुराने क्रिकेट मैदान पर लगा था।'),
        ('ft-3-3', 'cricket', 'By Sunday, the old ground is a pitch again.', 'रविवार तक पुराना मैदान फिर से पिच बन गया।')]),
    'after cricket': (('From Cricket to Rukavat', 'क्रिकेट से रुकावट तक'), [
        ('ft-4-1', 'cricket', 'After the final, the trophy waits by the boundary rope.', 'फ़ाइनल के बाद, ट्रॉफ़ी बाउंड्री की रस्सी के पास रखी है।'),
        ('ft-4-2', 'rukavat', "That night, the final is on the nine o'clock news.", 'उस रात, फ़ाइनल रात नौ बजे की ख़बरों में आता है।'),
        ('ft-4-3', 'rukavat', "At Dadi's, the TV is on and the week is being planned.", 'दादी के घर टीवी चल रहा है, और हफ़्ते का हिसाब बन रहा है।')]),
    'after rukavat': (('The house sleeps', 'घर सो गया'), [
        ('ft-5-1', 'rukavat', 'The house sleeps. Somewhere, the night mail runs on.', 'घर सो गया। कहीं दूर, रात की मेल चलती रही।')]),
}


# Change 2 (owner, 23 Oct 2026): "a clear, maybe slightly longer cutscene onboarding users into the story". The opening
# passes through every place the night will reach, each panel in its own world's style, and ends by telling the player
# what they do. Used by the preview (next) and the sketch until the owner approves it for the shared demo.
OPENING = (('Monsoon night', 'बरसात की रात'), [
    ('ft-0-1', 'station', 'Monsoon night on the Nashik line.', 'नाशिक लाइन पर बरसात की रात।'),
    ('ft-0-3', 'lugdi', 'Up the ghat, trucks wait for drivers.', 'घाट पर ट्रक ड्राइवरों की राह देख रहे हैं।'),
    ('ft-0-4', 'jadugar', 'A magic show is pitching its tent in town.', 'शहर में एक जादू का शो तंबू गाड़ रहा है।'),
    ('ft-0-5', 'cricket', 'The old ground has a final on Sunday.', 'पुराने मैदान पर रविवार को फ़ाइनल है।'),
    ('ft-0-6', 'rukavat', "And at Dadi's, a family has a week to plan.", 'और दादी के घर, परिवार को हफ़्ते का हिसाब लगाना है।'),
    ('ft-0-2', 'station', 'Everyone needs people. Tonight, you choose who.', 'सबको लोग चाहिए। आज रात, आप तय करेंगे कौन।')])


def cut(where, opening=False):
    """The cutscene for a place in the flow, once all its panels are exported; the longer opening when asked for and
    ready, else the first one."""
    for label, panels in ([OPENING] if opening and where == 'before station' else []) + ([CUTS[where]] if where in CUTS else []):
        pics = [f'assets/cut-{p}.webp' for p, *_ in panels]
        if all((HERE / pic).exists() for pic in pics):
            return [cutscene(label, [(w, pic, en, hi) for (_, w, en, hi), pic in zip(panels, pics)])]
    return []

CSS = '''
:root { --stage: #0E0E0E; color-scheme: dark; }
html, body { background: var(--stage); }
.demo { min-height: 100dvh; display: grid; place-items: center; padding: 16px 0; box-sizing: border-box; }
main.sheet { display: grid; grid-template-columns: repeat(auto-fill, 390px); gap: 40px 32px; padding: 32px 16px; justify-content: center; }
main.sheet > figure { margin: 0; display: grid; gap: 10px; }
main.sheet > figure > figcaption, main.sheet > h2 { color: #EDE6F5; font: 600 15px/1.4 'Hind', sans-serif; }
main.sheet > h2 { grid-column: 1 / -1; margin: 16px 0 0; font-size: 22px; }
.langs { display: flex; gap: 8px; justify-content: center; padding: 16px; }
.langs button { padding: 8px 14px; border-radius: 999px; border: 1px solid #EDE6F5; color: #EDE6F5; background: none; font: 600 14px 'Hind', sans-serif; }
.langs button[aria-pressed="true"] { background: #EDE6F5; color: #17110F; }
@media (max-width: 500px) {
  .demo { display: block; padding: 0; min-height: 0; }
  /* the screen's height, not the library's 390:844 phone shape (`.phone:not(.is-thumb):not(.is-small)`, which outranked
     this and held a 412-wide phone at 892 tall), so the app fills the viewport's height */
  .demo .phone:not(.is-thumb):not(.is-small) { width: 100vw; height: calc(var(--app-h, 100dvh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)); aspect-ratio: auto; border-radius: 0; box-shadow: none; }
  .demo .phone .notch { display: none; }
  .demo .phone .scr { padding-top: 8px; }
}
'''

# One screen at a time; a live main button moves on. A language chosen on any cover holds on every screen. The batting
# order fills its rank column from the top and a placed player tapped goes back; Split holds a tapped chore for the next
# person tapped (a person tapped first takes the first open chore), and a filled chore tapped comes free.
JS = '''
(() => {
  const phs = [...document.querySelectorAll('.demo .phone')];
  let at = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TICK = `__TICK__`;
  const say = (ph, en, hi) => ph.dataset.cur === 'hi' ? hi : en;
  const label = (ph, en, hi, live) => {
    const b = ph.querySelector('.dock .main'), s = b.querySelector('span[data-hi]');
    s.dataset.en = en; s.dataset.hi = hi; s.innerHTML = say(ph, en, hi);
    b.classList.toggle('is-live', live); b.classList.toggle('is-wait', !live);
    if (live) b.removeAttribute('aria-disabled'); else b.setAttribute('aria-disabled', 'true');
  };
  const who = (ph, row) => {
    const nm = row.querySelector('.nm');
    return `<span class="who"><i style="${row.querySelector('.face').getAttribute('style')}"></i><span data-hi="${nm.dataset.hi}">${say(ph, row.dataset.en, nm.dataset.hi)}</span></span>`;
  };

  document.querySelectorAll('[data-shuffle]').forEach(g => {
    const k = [...g.children];
    for (let i = k.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [k[i], k[j]] = [k[j], k[i]]; }
    k.forEach(x => g.appendChild(x));
  });

  document.querySelectorAll('.js-order').forEach(ph => {
    const slots = [...ph.querySelectorAll('.cr-pos')], btn = ph.querySelector('.dock .main'), order = [];
    const draw = () => {
      slots.forEach((s, j) => {
        const r = order[j];
        s.classList.toggle('is-filled', !!r); s.classList.toggle('is-target', j === order.length);
        s.innerHTML = `<b class="cr-no" aria-hidden="true">${j + 1}</b>` + (r ? who(ph, r) + r.querySelector('.stats').outerHTML + `<span class="stick">${TICK}</span>` : '');
      });
      ph.querySelectorAll('.cr-tray .row').forEach(r => { r.hidden = order.includes(r); });
      ph.dataset.order = order.map(r => r.dataset.en).join('|');
      const left = slots.length - order.length;
      if (left) label(ph, `Place ${left} more`, `${left} और रखें`, false); else label(ph, btn.dataset.liveEn, btn.dataset.liveHi, true);
    };
    ph.querySelectorAll('.cr-tray .row').forEach(r => r.addEventListener('click', () => { if (order.length < slots.length) { order.push(r); draw(); } }));
    slots.forEach((s, j) => s.addEventListener('click', () => { if (order[j]) { order.splice(j, 1); draw(); } }));
  });

  // rank: tapped in order; ranked rows move up into their order (the rest keep the shuffled order under them), places
  // that win a seat show as picks, and the perforation falls under the last seat (owner, 23 Oct 2026: "The rankings need
  // to be more clear")
  document.querySelectorAll('.js-rank').forEach(ph => {
    const box = ph.querySelector('.rows'), rows = [...box.querySelectorAll('.row')], cut = box.querySelector('.rkcut');
    const seats = +ph.dataset.seats, btn = ph.querySelector('.dock .main'), order = [];
    let base;
    const draw = () => {
      base = base || [...box.querySelectorAll('.row')];   // read after the shuffle
      const was = new Map(rows.map(r => [r, r.getBoundingClientRect().top]));
      [...order, ...base.filter(r => !order.includes(r))].forEach(r => box.appendChild(r));
      cut.hidden = order.length < seats;
      if (!cut.hidden) order[seats - 1].after(cut);
      rows.forEach(r => {
        const k = order.indexOf(r);
        r.querySelector('.rkno').textContent = k < 0 ? '' : k + 1;
        // only a seat is a pick: a checked row draws as one, so places past the seats keep just their number
        r.classList.toggle('is-selected', k >= 0 && k < seats); r.setAttribute('aria-checked', String(k >= 0 && k < seats));
        const dy = was.get(r) - r.getBoundingClientRect().top;
        if (dy && !reduced) r.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 240, easing: 'cubic-bezier(.2, 0, 0, 1)' });
      });
      ph.dataset.order = order.map(r => r.dataset.en).join('|');
      const left = rows.length - order.length;
      if (left) label(ph, `Rank ${left} more`, `${left} और क्रम में लगाएँ`, false); else label(ph, btn.dataset.liveEn, btn.dataset.liveHi, true);
    };
    rows.forEach(r => r.addEventListener('click', () => { const k = order.indexOf(r); if (k >= 0) order.splice(k, 1); else order.push(r); draw(); }));
  });

  document.querySelectorAll('.js-checks').forEach(ph => {   // spend checks: each tapped card takes one, up to data-max
    const max = +ph.dataset.max, btn = ph.querySelector('.dock .main');
    ph.querySelectorAll('.tile').forEach(t => t.addEventListener('click', () => {
      const on = t.getAttribute('aria-checked') === 'true';
      if (!on && ph.querySelectorAll('.tile[aria-checked="true"]').length >= max) return;
      t.setAttribute('aria-checked', String(!on)); t.classList.toggle('is-selected', !on);
      if (ph.querySelector('.tile[aria-checked="true"]')) label(ph, btn.dataset.liveEn, btn.dataset.liveHi, true);
      else label(ph, btn.dataset.waitEn, btn.dataset.waitHi, false);
    }));
  });

  document.querySelectorAll('.js-split').forEach(ph => {
    const slots = [...ph.querySelectorAll('.rk-slots .slot')], rows = [...ph.querySelectorAll('.rk-family .row')], btn = ph.querySelector('.dock .main');
    const given = new Map();
    let held = null;
    const draw = () => {
      slots.forEach(s => {
        const r = given.get(s), b = s.querySelector('b');
        s.classList.toggle('is-filled', !!r); s.classList.toggle('is-target', s === held);
        s.innerHTML = b.outerHTML + (r ? who(ph, r).replace(/<\\/span><\\/span>$/, `</span><span class="stick">${TICK}</span></span>`) : '');
      });
      rows.forEach(r => { r.querySelector('.rk-marks').innerHTML = '<i></i>'.repeat([...given.values()].filter(x => x === r).length); });
      const load = {};   // chores to each person, the TV counted against them (first-take.md: "the TV counted for whoever gets it")
      given.forEach((r, s) => { load[r.dataset.en] = (load[r.dataset.en] || 0) + (s.hasAttribute('data-tv') ? -1 : 1); });
      ph.dataset.chores = JSON.stringify(load);
      const left = slots.length - given.size;
      if (left) label(ph, `Share ${left} more`, `${left} और बाँटें`, false); else label(ph, btn.dataset.liveEn, btn.dataset.liveHi, true);
    };
    slots.forEach(s => s.addEventListener('click', () => { if (given.has(s)) given.delete(s); else held = held === s ? null : s; draw(); }));
    rows.forEach(r => r.addEventListener('click', () => {
      const s = held || slots.find(x => !given.has(x)); if (!s) return;
      given.set(s, r); held = null; draw();
    }));
  });

  const cutShow = (ph, n) => {
    const fs = [...ph.querySelectorAll('.cutpanel')], last = n === fs.length - 1;
    fs.forEach((f, i) => { f.hidden = i > n; f.classList.toggle('is-now', i === n); });
    ph.querySelectorAll('.cutdots i').forEach((d, i) => d.classList.toggle('on', i <= n));
    ph.classList.remove(...new Set(fs.map(f => f.dataset.world))); ph.classList.add(fs[n].dataset.world);
    label(ph, last ? 'Continue' : 'Next', last ? 'जारी रखें' : 'आगे', true);
    const body = ph.querySelector('.cutbody');
    requestAnimationFrame(() => body.scrollTo({ top: body.scrollHeight, behavior: reduced || !n ? 'auto' : 'smooth' }));
  };
  const cutNext = ph => {
    const n = ph.querySelectorAll('.cutpanel:not([hidden])').length;
    if (n < ph.querySelectorAll('.cutpanel').length) { cutShow(ph, n); return true; }
    return false;
  };
  // the app fills the viewport's height at every size (owner, 23 Oct 2026: "The app's height is not scaling based on the
  // viewport"): on a phone the screen takes the visible height, read from the window as its bars come and go (100dvh fell
  // short); on a wider screen the phone frame scales up as well as down to fill the height
  const fit = () => {
    const vh = (window.visualViewport && visualViewport.height) || innerHeight;
    document.documentElement.style.setProperty('--app-h', vh + 'px');
    phs.forEach(p => { p.style.zoom = innerWidth <= 500 ? '' : String(Math.min((vh - 32) / 844, (innerWidth - 32) / 390)); });
  };
  if (window.visualViewport) visualViewport.addEventListener('resize', fit);
  const show = n => {
    at = (n + phs.length) % phs.length;
    phs.forEach((p, i) => { p.hidden = i !== at; });
    if (phs[at].matches('.js-cut')) cutShow(phs[at], 0);
    if (phs[at].matches('.js-res') && FT) fillRes(phs[at]);
    phs[at].querySelectorAll('.scr-body').forEach(b => { b.scrollTop = 0; b.dispatchEvent(new Event('scroll')); });
    scrollTo(0, 0);
    music();
  };
  // Sound (owner, 23 Oct 2026, from the team: "Add audio to the demo"): each world's suggested default from the sound
  // pages (sound/index.html, sound/worlds.html), quiet, through their own engines. Every person makes the same sound, so
  // sound never hints at a lean. Station's chime plays on its cover only; cutscenes and the end card have no bed.
  const SOUND = { lugdi: ['SND_LS', 'lB', 1], station: ['SND_LS', 'sB', 0], jadugar: ['SND_W', 'jB', 1], cricket: ['SND_W', 'cB', 1], rukavat: ['SND_W', 'rA', 1] };
  let soundOn = true, woke = false, bed = '';
  const worldOf = ph => ((ph && ph.className.match(/\\bw-(\\w+)/)) || [])[1];
  const engine = w => SOUND[w] && window[SOUND[w][0]];
  const fx = (ph, id) => {
    const w = worldOf(ph), e = engine(w);
    if (!soundOn || !woke || !e) return;
    e.S.vol = 0.3;
    const c = e.ensureCtx(), f = c && e.FX[w] && e.FX[w][id];
    if (f) f(c.currentTime + 0.02, e.S.fx);
  };
  const music = () => {
    const ph = phs[at], w = worldOf(ph), cover = !!ph.querySelector('.tabbar');
    const key = soundOn && woke && SOUND[w] && !ph.matches('.js-cut, .js-end') && (cover || SOUND[w][2]) ? w + SOUND[w][1] : '';
    if (key === bed) return;
    ['SND_LS', 'SND_W'].forEach(n => window[n] && window[n].S.ctx && window[n].stopLoop());
    bed = key;
    if (key) { const e = engine(w); e.S.vol = 0.3; e.startLoop(e.MUSIC[SOUND[w][1]]); }
  };
  addEventListener('pointerdown', () => { if (!woke) { woke = true; setTimeout(music, 0); } });
  // the one sound switch, in each screen's "?" sheet (owner, 23 Oct 2026: "Sound should also go in the ? menu")
  document.querySelectorAll('.sndrow').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation(); soundOn = !soundOn;
    document.querySelectorAll('.sndrow').forEach(x => x.setAttribute('aria-checked', String(soundOn)));
    music();
  }));
  phs.forEach(ph => {
    ph.querySelectorAll('.tiles [role], .rows .row').forEach(el => el.addEventListener('click', () => {
      if (el.closest('.rk-family')) return;
      const on = el.getAttribute('aria-checked') === 'true';
      fx(ph, ph.matches('.js-rank') ? 'fill' : ph.matches('.js-checks') && on ? 'spend' : on ? 'tap' : 'unpick');
    }));
    ph.querySelectorAll('.cr-tray .row, .rk-family .row').forEach(el => el.addEventListener('click', () => fx(ph, 'fill')));
  });

  // The private reading (first-take.md "The results"), worked out here from the player's own picks and sent nowhere:
  // which of the hidden two each choice favoured, then counts, one twin that shows it, and the area it leaned most.
  const FT = JSON.parse((document.getElementById('ftdata') || {}).textContent || 'null');
  const picks = {}, t0 = Date.now();
  const favoured = (ph, d) => {
    const [p, q] = d.pair, sel = s => [...ph.querySelectorAll(s)].map(x => x.dataset.en);
    if (d.kind === 'pick') { const s = sel('[role="radio"][aria-checked="true"]')[0]; return d.pair.includes(s) ? s : null; }
    if (d.kind === 'set') { const s = sel('[aria-checked="true"]'), a = s.includes(p), b = s.includes(q); return a === b ? null : a ? p : q; }
    if (d.kind === 'split') { const c = JSON.parse(ph.dataset.chores || '{}'), a = c[p] || 0, b = c[q] || 0; return a === b ? null : a < b ? p : q; }
    const o = (ph.dataset.order || '').split('|'), i = o.indexOf(p), j = o.indexOf(q);   // order and rank: the higher place
    return i < 0 || j < 0 ? null : i < j ? p : q;
  };
  const put = (el, en, hi) => { el.dataset.en = en; el.dataset.hi = hi; el.innerHTML = el.closest('.phone').dataset.cur === 'hi' ? hi : en; };
  const SIDE = { m: ['man', 'आदमी'], w: ['woman', 'औरत'] };
  const swap = (s, a, b) => s.replace(new RegExp(`\\\\b${a}\\\\b|\\\\b${b}\\\\b`, 'g'), x => x === a ? b : a);
  const swapHi = s => s.replace(/आदमी|औरत/g, x => x === 'आदमी' ? 'औरत' : 'आदमी');
  const fillRes = ph => {
    const pic = ph.querySelector('.respic'), txt = ph.querySelector('.restext'), n = +ph.dataset.card;
    const D = FT.decisions, sexOf = id => picks[id] ? D[id].sex[picks[id]] : null;
    const read = Object.keys(picks).filter(id => D[id] && sexOf(id));
    const m = read.filter(id => sexOf(id) === 'm').length, w = read.length - m, more = m > w ? 'm' : w > m ? 'w' : null;
    const twins = FT.twins.filter(t => t.kind !== 'hard').map(t => ({ ...t, ga: sexOf(t.a), gb: sexOf(t.b) }));
    pic.innerHTML = ''; pic.className = 'respic';
    if (n === 1) {
      pic.classList.add('stacks');
      pic.innerHTML = ['w', 'm'].map(s => `<span class="resstack"><span class="bars">${'<i></i>'.repeat(s === 'm' ? m : w)}</span><b data-hi="${SIDE[s][1]}">${SIDE[s][0]}</b></span>`).join('');
      pic.querySelectorAll('b').forEach(b => put(b, b.textContent, b.dataset.hi));
      if (!read.length) return put(txt, 'Your picks went outside the equal two every time.', 'आपने हर बार बराबर वाले दो से बाहर चुना।');
      if (!more) return put(txt, `${read.length} times, 2 people had the same numbers. You picked each ${m} times.`, `${read.length} बार, 2 लोगों के नंबर एक जैसे थे। आपने दोनों को ${m}-${m} बार चुना।`);
      return put(txt, `${read.length} times, 2 people had the same numbers. You picked the ${SIDE[more][0]} ${Math.max(m, w)} times.`,
                 `${read.length} बार, 2 लोगों के नंबर एक जैसे थे। आपने ${Math.max(m, w)} बार ${SIDE[more][1]} को चुना।`);
    }
    if (n === 2) {
      const one = twins.filter(t => t.ga && t.ga === t.gb).sort((x, y) => (y.ga === more) - (x.ga === more) || (x.kind === 'matters') - (y.kind === 'matters'))[0];
      const both = one || twins.find(t => t.ga && t.gb);
      if (!both) return put(txt, 'Too few clear picks to show a pair.', 'दिखाने लायक़ जोड़ी नहीं बनी।');
      pic.classList.add('twin');
      pic.innerHTML = [both.a, both.b].map(id => `<span class="half">${D[id].pair.map(p => `<span class="pp${picks[id] === p ? ' is-picked' : ''}"><i style="background-image:url(${D[id].faces[p]})"></i><b data-hi="${D[id].hi[p]}">${p}</b>${D[id].nudged === p ? `<em data-hi="${both.nudge[1]}">${both.nudge[0]}</em>` : ''}</span>`).join('')}</span>`).join('');
      pic.querySelectorAll('[data-hi]').forEach(e => put(e, e.textContent, e.dataset.hi));
      const cap = both.nudge[0][0].toUpperCase() + both.nudge[0].slice(1);
      if (one) return put(txt, `Same numbers both times. ${cap} swapped sides. You picked the ${SIDE[one.ga][0]} both times.`,
                          `दोनों बार नंबर एक जैसे थे। बस ${both.nudge[1]} की जगह बदली। आपने दोनों बार ${SIDE[one.ga][1]} को चुना।`);
      return put(txt, `Same numbers both times. ${cap} swapped sides, and so did your pick.`, `दोनों बार नंबर एक जैसे थे। ${both.nudge[1]} की जगह बदली, और आपकी पसंद भी।`);
    }
    if (n === 3) {
      const score = {};
      twins.forEach(t => { if (t.ga && t.ga === t.gb) score[t.world] = (score[t.world] || 0) + (t.ga === 'm' ? 1 : -1); });
      const top = Object.entries(score).sort((x, y) => Math.abs(y[1]) - Math.abs(x[1]))[0];
      if (!top || !top[1]) return put(txt, 'Close to even in every part of life.', 'ज़िंदगी के हर हिस्से में लगभग बराबर।');
      const A = FT.areas[top[0]], [en, hi] = A.real;
      pic.innerHTML = `<span class="scene" style="background-image:url(${A.scene})"></span>`;
      return top[1] > 0 ? put(txt, en, hi) : put(txt, swap(en, 'man', 'woman'), swapHi(hi));
    }
    if (n === 4) {
      pic.innerHTML = '<span class="trade"><i></i>__SWAP__<i></i></span>';
      return put(txt, 'Before you choose, swap the 2 people in your head. Would you still choose the same?', 'चुनने से पहले, मन में दोनों को आपस में बदल दें। क्या तब भी वही चुनाव होगा?');
    }
    const mins = Math.max(1, Math.round((Date.now() - t0) / 60000)), all = phs.filter(p => p.dataset.ft).length;
    pic.innerHTML = '<span class="marks"><i></i><i></i><i></i><i></i><i></i></span>';
    put(txt, `${all} choices in ${mins} ${mins === 1 ? 'minute' : 'minutes'}. A first reading, from one sitting.`, `${mins} मिनट, ${all} चुनाव। एक बैठक की पहली रीडिंग।`);
  };
  document.querySelectorAll('.resforget').forEach(b => b.addEventListener('click', () => location.reload()));

  phs.forEach(p => p.querySelectorAll('.dock .main').forEach(b => b.addEventListener('click', () => {
    if (b.classList.contains('is-wait')) { fx(p, 'refuse'); return; }
    if (FT && p.dataset.ft && FT.decisions[p.dataset.ft]) picks[p.dataset.ft] = favoured(p, FT.decisions[p.dataset.ft]);
    fx(p, p.matches('.js-cut') ? 'tab' : p.querySelector('.tabbar') ? 'cover' : 'commit');
    if (p.matches('.js-end')) { location.reload(); return; }
    if (!(p.matches('.js-cut') && cutNext(p))) show(at + 1);
  })));
  document.querySelectorAll('.js-cut').forEach(ph => {
    ph.querySelector('.cutbar .textbtn').addEventListener('click', () => show(at + 1));
    ph.querySelectorAll('.cutpanel img').forEach(im => im.addEventListener('click', () => { if (!cutNext(ph)) show(at + 1); }));
  });
  document.querySelectorAll('[data-set-lang]').forEach(b => b.addEventListener('click', () => {
    const all = document.querySelector(`[data-page-lang="${b.dataset.setLang}"]`); if (all) all.click();
  }));
  // "?" opens the screen's sheet: how to play, then the languages (owner, 23 Oct 2026: "put language in the ? menu"); the
  // close button, the handle, the scrim and Escape close it
  const helpOf = ph => [ph.querySelector(':scope > .scrim'), ph.querySelector(':scope > .helpsheet')];
  const closeHelp = ph => helpOf(ph).forEach(x => { if (x) x.hidden = true; });
  phs.forEach(ph => {
    const [scrim, sh] = helpOf(ph); if (!sh) return;
    ph.querySelectorAll('[data-help]').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation(); scrim.hidden = sh.hidden = false; sh.querySelector('.close').focus();
    }));
    [scrim, sh.querySelector('.close'), sh.querySelector('.handle')].forEach(x => x.addEventListener('click', e => { e.stopPropagation(); closeHelp(ph); }));
    sh.addEventListener('click', e => e.stopPropagation());
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') phs.forEach(closeHelp); });
  addEventListener('resize', fit);
  fit(); show(0);
})();
'''


def cutscene(label, panels):
    dots = ''.join('<i></i>' for _ in panels)
    figs = ''.join(f'<figure class="cutpanel" data-world="{L.WORLDS[w].cls}"><img src="{pic}" alt="" width="800" height="600">'
                   f'{L.tx("figcaption", en, hi, "cap")}</figure>' for w, pic, en, hi in panels)
    # the header holds only "?" (its sheet holds the languages and sound) and Skip; the dots sit over the Next button (owner,
    # 23 Oct 2026: "too many things in the header", "put language in the ? menu", "Sound should also go in the ? menu")
    inner = (f'<div class="cutbar">{L.HELP}<button class="textbtn" type="button">{L.tx("span", "Skip", "छोड़ें")}</button></div>'
             f'<div class="scr-body cutbody">{figs}</div>'
             f'<div class="dock"><span class="cutdots" aria-hidden="true">{dots}</span>{L.out_btn("Next", "आगे")}</div>')
    return (f'<div class="phone world {L.WORLDS[panels[0][0]].cls} js-cut" role="group"{L.al(*label)}>'
            f'<span class="notch" aria-hidden="true"></span><div class="scr">{inner}</div></div>')


def ending():
    W = L.WORLDS['rukavat']
    inner = (L.topbar('cover', first=True)
             + L.body(L.h1q('That was the First take.', 'यह था फ़र्स्ट टेक।'),
                      L.tx('p', 'Your private cards come here once the scoring is settled.', 'स्कोरिंग तय होने पर आपके निजी कार्ड यहाँ आएँगे।', 'nextline'), cls='is-cover')
             + L.dock(L.out_btn('Play again', 'फिर से खेलें')))
    return L.phone('rukavat', inner, 'The end of the First take', 'js-end', W.scene(W.moment('cover')), 'veil-low')


def sound_engines():
    """The sound pages' own engines (sound/index.html: Lugdi and Station; sound/worlds.html: the three new worlds), each
    wrapped so the two can share one page; window.SND_LS and window.SND_W."""
    out = ''
    for f, name in (('index.html', 'SND_LS'), ('worlds.html', 'SND_W')):
        t = (HERE / 'sound' / f).read_text(encoding='utf-8')
        a = t.index('<script id="engine">') + len('<script id="engine">')
        out += f'window.{name} = (() => {{\n{t[a:t.index("</script>", a)]}\nreturn {{ S, FX, MUSIC, startLoop, stopLoop, ensureCtx }};\n}})();\n'
    return out


def chapter_cover(c, review):
    """The world's cover; in the review, its hard cover with the chapter's own plain line under the title."""
    if not review:
        return L.cover(c['world'], first=True)
    W = L.WORLDS[c['world']]
    keep, W.hard_line = W.hard_line, c['line']
    try:
        return L.cover(c['world'], first=True, hard=True)
    finally:
        W.hard_line = keep


TITLES = {'demo': 'Retake Demo', 'review': 'Retake Review', 'next': 'Retake Next Demo', 'sketch': 'First Take Sketches', 'story': "Dadi's Trunk"}


def story_cut(panels, ids, world, label):
    """A cutscene from the script's panels, once every one of them is painted and exported (art/cutscenes.py, prefix
    st); a present-day panel takes the colours of the chapter it belongs to."""
    # the panels painted so far, in order: the cutscene grows as the illustrations come in (owner, 23 Oct 2026)
    rows = [(k, *panels[k]) for k in ids if k in panels and (HERE / f'assets/cut-st-{k.replace(".", "-")}.webp').exists()]
    pics = [f'assets/cut-st-{k.replace(".", "-")}.webp' for k, *_ in rows]
    if not rows:
        return []
    return [cutscene(label, [(S.ERA.get(y, world), pic, en, hi) for (k, y, en, hi), pic in zip(rows, pics)])]


def with_help(ph):
    """A screen with its "?" sheet, hidden until "?" is tapped (owner, 23 Oct 2026: "put language in the ? menu")."""
    cls = re.search(r'class="phone world (w-[\w-]+)', ph).group(1)
    return ph[:-6] + L.help_sheet(next(k for k, W in L.WORLDS.items() if W.cls == cls)) + ph[-6:]


def story_build(shared=False):
    """"Dadi's trunk" (knowledge/story/first-take-script.md; owner, 23 Oct 2026: "I need this in the demo"): the opening,
    each chapter's way in, title card, eight decisions with notes and progress, and way out, then the diary, the private
    reading and the trunk handed on. Every chapter opens on its title card (SC-91), naming the setting plainly; the
    shared link carries all 40 decisions for the team (owner, 23 Oct 2026)."""
    chapters, P = S.parse(), S.panels()
    faults = S.length_faults(chapters)
    if faults:   # a note's length must never point at the pair: fix the script's notes first
        sys.exit('not built, note lengths: ' + '; '.join(faults))
    total = sum(len(c['decisions']) for c in chapters)
    phones, i = story_cut(P, [f'0.{k}' for k in range(1, 8)], 'station', ("Dadi's trunk", 'दादी का संदूक')), 0
    for c in chapters:
        n, label = c['n'], c['title']
        phones += story_cut(P, [f'{n}.{k}' for k in range(1, 5)], c['world'], label) + [L.chapter_card(c['world'], c=S.card(c))]
        for j, d in enumerate(c['decisions'], 1):
            i += 1
            phones.append(FT.step(c, dict(d, prog=(n, j, len(c['decisions']))), i, total))
        phones += story_cut(P, [f'{n}.9', f'{n}.10'], c['world'], label)
    phones += (story_cut(P, [f'6.{k}' for k in range(1, 9)], 'rukavat', ("Dadi's diary", 'दादी की डायरी'))
               + FT.results_phones(end=False) + story_cut(P, ['6.9'], 'rukavat', ('The trunk', 'संदूक')))
    phones = [with_help(ph) for ph in phones]
    langs = ''.join(f'<button type="button" data-page-lang="{k}"></button>' for k, _, _ in L.LANGS)
    js = JS.replace("__TICK__", L.ic("tick")).replace("__SWAP__", L.ic("arrow") * 2)
    write('demo' if shared else 'story', f'<main class="demo">{"".join(phones)}</main>\n<div hidden>{langs}</div>\n'
                   f'<script type="application/json" id="ftdata">{json.dumps(FT.results_data(chapters, S.NUDGE), ensure_ascii=False)}</script>\n'
                   f'<script src="library.js"></script>\n<script>{sound_engines()}</script>\n<script>{js}</script>\n', total, len(chapters))
    print('cutscenes in:', sum(1 for ph in phones if 'js-cut' in ph), 'of 13; strings with no Hindi yet:', sorted(set(S.MISSING)) or 'none')


def build(mode='demo'):
    """demo: the shared demo. review: with the hard decisions. next: the demo with the changes of 23 Oct 2026 (the longer
    opening, progress, chapter results, notes on the cards where sketched), ready to replace the demo once approved.
    sketch: the new parts side by side in every world, for the owner's approval (design before build)."""
    if mode in ('story', 'demo'):   # the demo is "Dadi's trunk" now (owner, 23 Oct 2026: "Stitch it in the demo")
        return story_build(shared=mode == 'demo')
    new = mode in ('next', 'sketch')
    chapters = FT.parse(hard=mode == 'review')
    total = sum(len(c['decisions']) for c in chapters)
    if mode == 'sketch':
        return sketch(chapters, total)
    phones, i = [], 0
    for c in chapters:
        phones += cut(f'before {c["world"]}', new) + [chapter_cover(c, mode == 'review')]
        for j, d in enumerate(c['decisions'], 1):
            i += 1
            if new:
                d = dict(FT.sketched(c, d) or d, prog=(c['n'], j, len(c['decisions'])))
            phones.append(FT.step(c, d, i, total))
        phones += ([FT.chapter_end(c)] if new else []) + cut(f'after {c["world"]}')
    # the private reading closes the preview and the review; the shared demo keeps its plain end card until approved
    phones += FT.results_phones() if mode in ('next', 'review') else [ending()]
    phones = [with_help(ph) for ph in phones]
    langs = ''.join(f'<button type="button" data-page-lang="{k}"></button>' for k, _, _ in L.LANGS)
    js = JS.replace("__TICK__", L.ic("tick")).replace("__SWAP__", L.ic("arrow") * 2)
    write(mode, f'<main class="demo">{"".join(phones)}</main>\n<div hidden>{langs}</div>\n'
                f'<script type="application/json" id="ftdata">{json.dumps(FT.results_data(chapters), ensure_ascii=False)}</script>\n'
                f'<script src="library.js"></script>\n<script>{sound_engines()}</script>\n<script>{js}</script>\n', total, len(chapters))


def sketch(chapters, total):
    """Every new part at once, all five worlds, the screens standing still: the opening, a step with notes on its cards
    and the progress marker, and each chapter's result."""
    opening = cut('before station', True)
    steps = []
    for c in chapters:
        for j, d in enumerate(c['decisions'], 1):
            s = FT.sketched(c, d)
            if s:
                steps.append((f'{L.WORLDS[c["world"]].title}, {d["title"]}', FT.step(c, dict(s, prog=(c['n'], j, len(c['decisions']))), j, total)))
    ends = [(L.WORLDS[c['world']].title, FT.chapter_end(c)) for c in chapters]
    figs = ([f'<h2>The longer opening</h2><figure><figcaption>Six panels, one place each, ending on what the player does. Tap through in the preview.</figcaption>{opening[0]}</figure>'] if opening else [])
    figs += ['<h2>Notes on the cards, in each world\'s paperwork, with progress at the top</h2>'] + [f'<figure><figcaption>{t}</figcaption>{ph}</figure>' for t, ph in steps]
    figs += ['<h2>Each chapter closes on a result</h2>'] + [f'<figure><figcaption>{t}</figcaption>{ph}</figure>' for t, ph in ends]
    # rank standing still, three places given (owner, 23 Oct 2026: "The rankings need to be more clear")
    st = S.parse()[0]
    rk = next(d for d in st['decisions'] if d['kind'].startswith('rank'))
    rank = FT.step_rank(st, dict(rk, prog=(1, rk['n'], len(st['decisions']))), rk['n'], 40, ranked=tuple(p['en'] for p in rk['people'][:3]))
    rank_note = 'Three places given: ranked rows move up into their order, the place is big type where the tick goes, and a perforation falls under the last seat.'
    figs += ['<h2>Rank, for the seats</h2>', f'<figure><figcaption>{rank_note}</figcaption>{rank}</figure>']
    res = FT.results_phones(FT.results_samples(chapters))
    figs += ['<h2>The private reading, after chapter 5 (your draft\'s samples; the preview reads your own picks)</h2>'] + [f'<figure><figcaption>Card {i}</figcaption>{ph}</figure>' for i, ph in enumerate(res, 1)]
    langs = ''.join(f'<button type="button" data-page-lang="{k}" aria-pressed="{str(k == "mix").lower()}">{n}</button>' for k, n, _ in L.LANGS)
    write('sketch', f'<div class="langs">{langs}</div>\n<main class="sheet">{"".join(figs)}</main>\n<script src="library.js"></script>\n', total, len(chapters))
    # the same parts for the library's "First take" section (library.py reads this file)
    frag = ('<h3 class="pg-h3">The opening cutscene</h3><div class="pg-grid">'
            + (L.fig(opening[0], 'The opening', "Six panels, one place each, each in its own world's style; it ends on what the player does.") if opening else '')
            + '</div><h3 class="pg-h3">Notes on the cards, with progress</h3><div class="pg-grid">'
            + ''.join(L.fig(ph, t, "Every card carries a note in its world's paperwork; the loaded word is one note among decoys. Progress fills under the top bar.") for t, ph in steps)
            + '</div><h3 class="pg-h3">Each chapter closes on a result</h3><div class="pg-grid">'
            + ''.join(L.fig(ph, t, 'The same for every player, whoever they picked.') for t, ph in ends) + '</div>'
            + '<h3 class="pg-h3">Rank, for the seats</h3><div class="pg-grid">' + L.fig(rank, 'Station, the new-engine course', rank_note) + '</div>'
            + '<h3 class="pg-h3">The private reading, after chapter 5</h3><div class="pg-grid">'
            + ''.join(L.fig(ph, f'Card {i}', 'Worked out on the phone from the player\'s own picks and sent nowhere; shown here with the draft\'s samples. No lean score until the research line sets it.') for i, ph in enumerate(res, 1)) + '</div>')
    (HERE / 'parts-first-take.html').write_text(frag, encoding='utf-8')


def write(name, body, total, nch):
    page = (f'<title>{TITLES[name]}</title>\n<link rel="preconnect" href="https://fonts.googleapis.com">\n'
            f'<link rel="stylesheet" href="{L.font_link()}">\n<link rel="stylesheet" href="fonts.css">\n'
            f'<link rel="stylesheet" href="library.css">{L.world_css()}\n<style>{CSS}</style>\n' + body)
    (HERE / f'{name}.html').write_text(page, encoding='utf-8')

    # the files the page reaches: its stylesheets, script and every picture they or the screens name
    files = {'fonts.css', 'library.css', 'library.js'} | {f'worlds/{W.id}.css' for W in L.WORLDS.values() if (HERE / 'worlds' / f'{W.id}.css').exists()}
    for src in [page] + [(HERE / f).read_text(encoding='utf-8') for f in sorted(files) if f.endswith('.css')]:
        for u in re.findall(r'(?:url\(["\']?|src=")([^)"\']+)', src):
            if u.startswith(('http', 'data:', '#')):
                continue
            p = (HERE / u.replace('../', '')).resolve()
            if p.exists():
                files.add(str(p.relative_to(HERE)))
    (HERE / f'{name}-files.json').write_text(json.dumps(sorted(files), indent=1), encoding='utf-8')
    print(f'{name}.html', len(page), 'chars;', len(files), 'files;', total, 'decisions in', nch, 'chapters')


if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else 'demo')
