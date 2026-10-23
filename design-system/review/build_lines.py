"""Build the owner's line-by-line review page from design-system/review/lines.json.

Each line gets Keep, Change or Cut and a note; the choices are saved in the artifact's database
(collection "verdicts", one document per line id) so they can be read back. Run:
python3 design-system/review/build_lines.py [lines.json]
"""
import html
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / "lines.json"
OUT = HERE / "lines-review.html"

data = json.loads(SRC.read_text())
lines = data["lines"]
CSS = (HERE / "review.css").read_text() + "\n" + (HERE / "lines.css").read_text()
payload = json.dumps(lines, ensure_ascii=False).replace("</", "<\\/")

page = f"""<title>Retake Line Review</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hind:wght@500;700&family=Sarpanch:wght@900&family=Yatra+One&family=Khand:wght@700&family=Rozha+One&display=swap">
<style>
{CSS}
</style>
<header class="top">
  <div class="wrap">
    <p class="eyebrow">Retake · for your review · {html.escape(data.get("generated", ""))}</p>
    <h1>Every line a character says</h1>
    <p class="lede">The exact words, English and Hindi, of every line that leans one way: what the speaker says, the
    loaded words on the cards, and the stories people tell. Lines that swap sides sit together. Mark each one
    Keep, Change or Cut, and add a note when you want different words.</p>
    <p class="savenote" id="savenote">Connecting so your choices are saved…</p>
  </div>
</header>
<nav class="nav" aria-label="Filter"><div class="nav-in lr-bar">
  <div class="chips" role="group" aria-label="Show">
    <button type="button" class="chip" data-f="all" aria-pressed="true">All</button>
    <button type="button" class="chip" data-f="todo" aria-pressed="false">To review</button>
    <button type="button" class="chip" data-f="keep" aria-pressed="false">Keep</button>
    <button type="button" class="chip" data-f="change" aria-pressed="false">Change</button>
    <button type="button" class="chip" data-f="cut" aria-pressed="false">Cut</button>
    <button type="button" class="chip" data-f="hard" aria-pressed="false">Hard topics</button>
  </div>
  <p class="progress" id="progress" aria-live="polite"></p>
</div></nav>
<main id="main"></main>
<script type="application/json" id="data">{payload}</script>
<script>
(function () {{
  var LINES = JSON.parse(document.getElementById('data').textContent);
  var WORLDS = ['Station', 'Lugdi', 'Jadugar', 'Cricket', 'Rukavat'];
  var byId = {{}};
  LINES.forEach(function (l) {{ byId[l.id] = l; }});
  var state = {{}};
  var col = null;
  var filter = 'all';
  var queue = {{}};
  var LS = 'retake-line-review';

  function loadLocal() {{
    try {{ var s = JSON.parse(localStorage.getItem(LS) || '{{}}'); Object.keys(s).forEach(function (k) {{ state[k] = s[k]; }}); }} catch (e) {{}}
  }}
  function saveLocal() {{
    try {{ localStorage.setItem(LS, JSON.stringify(state)); }} catch (e) {{}}
  }}
  function el(tag, cls, text) {{
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }}
  function world(w) {{ return w.toLowerCase(); }}

  function groups() {{
    var seen = {{}}, out = {{}};
    WORLDS.forEach(function (w) {{ out[w] = []; }});
    LINES.forEach(function (l) {{
      if (seen[l.id]) return;
      seen[l.id] = true;
      var g = [l];
      if (l.twin && byId[l.twin] && !seen[l.twin]) {{ g.push(byId[l.twin]); seen[l.twin] = true; }}
      (out[l.world] || (out[l.world] = [])).push(g);
    }});
    return out;
  }}

  function verdictOf(id) {{ return state[id] && state[id].verdict || ''; }}

  function lineCard(l) {{
    var card = el('article', 'lr-line');
    card.id = l.id;
    card.dataset.id = l.id;
    var meta = el('p', 'lr-meta');
    meta.appendChild(el('span', 'lr-where', l.where + (l.title ? ' · ' + l.title : '')));
    if (l.hard) meta.appendChild(el('span', 'lr-tag lr-hard', 'Hard topic'));
    meta.appendChild(el('span', 'lr-tag', l.kind));
    card.appendChild(meta);
    var who = el('p', 'lr-who');
    who.textContent = l.speaker + (l.about ? ', about ' + l.about : '');
    if (l.side === 'woman' || l.side === 'man') who.appendChild(el('span', 'lr-side', 'nudge on the ' + l.side));
    card.appendChild(who);
    var q = el('blockquote', 'lr-quote');
    q.appendChild(el('span', 'lr-en', l.en));
    if (l.hi) {{ var hi = el('span', 'lr-hi', l.hi); hi.lang = 'hi'; q.appendChild(hi); }}
    card.appendChild(q);
    var acts = el('div', 'lr-acts');
    acts.setAttribute('role', 'group');
    acts.setAttribute('aria-label', 'Your choice for this line');
    [['keep', 'Keep'], ['change', 'Change'], ['cut', 'Cut']].forEach(function (v) {{
      var b = el('button', 'lr-btn lr-' + v[0], v[1]);
      b.type = 'button';
      b.dataset.v = v[0];
      b.setAttribute('aria-pressed', 'false');
      acts.appendChild(b);
    }});
    card.appendChild(acts);
    var lab = el('label', 'lr-notelab');
    lab.appendChild(el('span', 'lr-notecap', 'Note, or the words you want'));
    var ta = el('textarea', 'lr-note');
    ta.rows = 2;
    lab.appendChild(ta);
    card.appendChild(lab);
    card.appendChild(el('p', 'lr-status'));
    paint(card);
    return card;
  }}

  function paint(card) {{
    var id = card.dataset.id, s = state[id] || {{}}, v = s.verdict || '';
    card.dataset.v = v;
    Array.prototype.forEach.call(card.querySelectorAll('.lr-btn'), function (b) {{
      b.setAttribute('aria-pressed', b.dataset.v === v ? 'true' : 'false');
    }});
    var ta = card.querySelector('.lr-note');
    if (document.activeElement !== ta) ta.value = s.note || '';
    card.querySelector('.lr-notelab').hidden = !(v === 'change' || v === 'cut' || (s.note || ''));
    var stale = s.en && s.en !== byId[id].en;
    card.querySelector('.lr-status').textContent = stale ? 'The words changed after you marked this. Look again.' : '';
  }}

  function render() {{
    var main = document.getElementById('main');
    main.textContent = '';
    var g = groups();
    WORLDS.forEach(function (w) {{
      if (!g[w] || !g[w].length) return;
      var sec = el('section', 'lr-world w-' + world(w));
      sec.id = 'w-' + world(w);
      var band = el('div', 'band band-' + world(w) + ' band-sm');
      var bi = el('div', 'band-in');
      bi.appendChild(el('h2', 'disp disp-' + world(w), w));
      var count = g[w].reduce(function (n, x) {{ return n + x.length; }}, 0);
      bi.appendChild(el('p', 'band-area', count + (count === 1 ? ' line' : ' lines')));
      band.appendChild(bi);
      sec.appendChild(band);
      var body = el('div', 'lr-body');
      g[w].forEach(function (grp) {{
        var row = el('div', grp.length > 1 ? 'lr-pair' : 'lr-single');
        if (grp.length > 1) row.appendChild(el('p', 'lr-paircap', 'The same idea, the nudge on the other side'));
        var inner = el('div', 'lr-pairin');
        grp.forEach(function (l) {{ inner.appendChild(lineCard(l)); }});
        row.appendChild(inner);
        body.appendChild(row);
      }});
      sec.appendChild(body);
      main.appendChild(sec);
    }});
    applyFilter();
  }}

  function applyFilter() {{
    var done = 0;
    Array.prototype.forEach.call(document.querySelectorAll('.lr-line'), function (c) {{
      var l = byId[c.dataset.id], v = verdictOf(l.id);
      if (v) done++;
      var ok = filter === 'all' || (filter === 'todo' ? !v : filter === 'hard' ? l.hard : v === filter);
      c.hidden = !ok;
    }});
    Array.prototype.forEach.call(document.querySelectorAll('.lr-pair, .lr-single'), function (r) {{
      r.hidden = !r.querySelector('.lr-line:not([hidden])');
    }});
    Array.prototype.forEach.call(document.querySelectorAll('.lr-world'), function (s) {{
      s.hidden = !s.querySelector('.lr-line:not([hidden])');
    }});
    document.getElementById('progress').textContent = done + ' of ' + LINES.length + ' marked';
  }}

  function write(id) {{
    var card = document.getElementById(id);
    var s = state[id];
    saveLocal();
    if (!col) return;
    var body = {{ verdict: s.verdict || '', note: s.note || '', en: byId[id].en, hi: byId[id].hi || '', at: new Date().toISOString() }};
    queue[id] = (queue[id] || Promise.resolve()).then(function () {{
      return col.doc(id).set(body);
    }}).then(function () {{
      if (card) card.querySelector('.lr-status').textContent = 'Saved';
    }}, function (e) {{
      if (card) card.querySelector('.lr-status').textContent = 'Not saved: ' + (e && e.message || 'try again');
    }});
  }}

  document.addEventListener('click', function (e) {{
    var b = e.target.closest && e.target.closest('.lr-btn');
    if (b) {{
      var card = b.closest('.lr-line'), id = card.dataset.id;
      var s = state[id] = Object.assign({{}}, state[id] || {{}});
      s.verdict = s.verdict === b.dataset.v ? '' : b.dataset.v;
      paint(card);
      if (s.verdict === 'change') card.querySelector('.lr-note').focus();
      write(id);
      applyFilter();
      return;
    }}
    var c = e.target.closest && e.target.closest('.chip');
    if (c) {{
      filter = c.dataset.f;
      Array.prototype.forEach.call(document.querySelectorAll('.chip'), function (x) {{
        x.setAttribute('aria-pressed', x === c ? 'true' : 'false');
      }});
      applyFilter();
    }}
  }});
  var timers = {{}};
  document.addEventListener('input', function (e) {{
    if (!e.target.classList.contains('lr-note')) return;
    var id = e.target.closest('.lr-line').dataset.id;
    state[id] = Object.assign({{}}, state[id] || {{}}, {{ note: e.target.value }});
    clearTimeout(timers[id]);
    timers[id] = setTimeout(function () {{ write(id); }}, 900);
  }});

  loadLocal();
  render();
  var note = document.getElementById('savenote');
  var use = window.claude && window.claude.use ? window.claude.use('db') : Promise.resolve(null);
  Promise.resolve(use).then(function (db) {{
    if (!db) {{
      note.textContent = 'Your choices stay in this browser only here. Open the page signed in to claude.ai so they reach Claude.';
      return;
    }}
    col = db.collection('verdicts');
    note.textContent = 'Your choices save as you go, and Claude can read them.';
    col.onSnapshot(function (snap) {{
      snap.docChanges().forEach(function (ch) {{
        var id = ch.doc.id;
        if (!byId[id]) return;
        if (ch.type === 'removed') delete state[id];
        else state[id] = Object.assign({{}}, ch.doc.data());
        var card = document.getElementById(id);
        if (card) paint(card);
      }});
      saveLocal();
      applyFilter();
    }}, function () {{
      note.textContent = 'Saving stopped working. Reload the page; your marks so far are kept.';
    }});
  }}, function () {{
    note.textContent = 'Your choices stay in this browser only here.';
  }});
}})();
</script>
"""

OUT.write_text(page)
print(OUT, len(page), len(lines), "lines")
