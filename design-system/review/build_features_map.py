"""Build the owner's features-and-map page from the feature set and the screen map.

Reads knowledge/ux/feature-set.md and ia-and-flows.md and writes
design-system/review/features-map.html. Run: python3 design-system/review/build_features_map.py
"""
import re
from pathlib import Path

from mdlite import blocks, cells, inline, sections, strip_front

ROOT = Path(__file__).resolve().parents[2]
FS = strip_front((ROOT / "knowledge/ux/feature-set.md").read_text())
IA = strip_front((ROOT / "knowledge/ux/ia-and-flows.md").read_text())
HERE = Path(__file__).parent
OUT = HERE / "features-map.html"


def part(md, title_start):
    return next(b for t, b in sections(md, 2) if t and t.startswith(title_start))


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


# ---------- features ----------

def version_of(v):
    v = v.strip()
    return "v1" if v == "V1" else "never" if v == "Never" else "later"


def feature_groups():
    groups = []
    for title, body in sections(part(FS, "The features"), 3)[1:]:
        rows = [cells(ln) for ln in body.splitlines() if ln.startswith("|")][2:]
        groups.append((title, rows))
    return groups


def feature_table(title, rows):
    out = [f'<section class="fgroup" aria-labelledby="g-{slug(title)}"><h3 id="g-{slug(title)}">{inline(title)}</h3>',
           '<div class="tw"><table class="ftable"><thead><tr><th>ID</th><th>Feature</th><th>Where it lives</th>'
           '<th>Who</th><th>Version</th><th>Status</th><th class="basis">Basis</th></tr></thead><tbody>']
    for fid, feat, where, who, ver, basis, status in rows:
        v = version_of(ver)
        confirm = "owner to confirm" in status
        st = "open" if status.startswith("Open") else "confirm" if confirm else "decided"
        out.append(
            f'<tr id="{fid.lower()}" data-v="{v}" data-s="{st}">'
            f'<td data-label="ID" class="fid"><a href="#{fid.lower()}">{fid}</a></td>'
            f'<td data-label="Feature">{inline(feat)}</td>'
            f'<td data-label="Where">{inline(where)}</td>'
            f'<td data-label="Who">{inline(who)}</td>'
            f'<td data-label="Version"><span class="badge b-{v}">{inline(ver)}</span></td>'
            f'<td data-label="Status"><span class="st st-{st}">{inline(status)}</span></td>'
            f'<td data-label="Basis" class="basis">{inline(basis)}</td></tr>')
    out.append("</tbody></table></div></section>")
    return "".join(out)


# ---------- screens ----------

def drawn_label(d):
    low = d.lower()
    if low.startswith("not drawn"):
        return "nd", "Not drawn"
    if "drawn by the phone" in low or "not a screen" in low:
        return "out", "Outside the game"
    if "not drawn" in low or "not among" in low:
        return "part", "Partly drawn"
    return "yes", "Drawn"


def screens_html():
    body = part(IA, "Screen inventory")
    lines = body.splitlines()
    first = next(i for i, ln in enumerate(lines) if ln.startswith("|"))
    last = max(i for i, ln in enumerate(lines) if ln.startswith("|"))
    rows = [cells(ln) for ln in lines[first:last + 1]][2:]
    out = [f'<div class="prose">{blocks(chr(10).join(lines[:first]))}</div>', '<div class="screens">']
    for sid, name, kind, frm, to, feats, drawn, states in rows:
        cls, lab = drawn_label(drawn)
        out.append(
            f'<details class="screen" id="{sid.lower()}"><summary><span class="sid">{sid}</span>'
            f'<span class="sname">{inline(name)}</span><span class="skind">{inline(kind)}</span>'
            f'<span class="drawn d-{cls}">{lab}</span></summary><dl>'
            f'<dt>Reached from</dt><dd>{inline(frm)}</dd>'
            f'<dt>Leaves to, and what Back or Close does</dt><dd>{inline(to)}</dd>'
            f'<dt>Features</dt><dd>{inline(feats)}</dd>'
            f'<dt>Drawn so far</dt><dd>{inline(drawn)}</dd>'
            f'<dt>States</dt><dd>{inline(states)}</dd></dl></details>')
    out.append("</div>")
    out.append(f'<div class="prose">{blocks(chr(10).join(lines[last + 1:]))}</div>')
    return "".join(out)


def sub_sections(md, tag="h3", id_from=None):
    parts = sections(md, 3)
    out = [f'<div class="prose">{blocks(parts[0][1])}</div>'] if parts[0][1].strip() else []
    for t, b in parts[1:]:
        sid = id_from(t) if id_from else slug(t)
        out.append(f'<section class="sub" id="{sid}"><{tag}>{inline(t)}</{tag}><div class="prose">{blocks(b)}</div></section>')
    return "".join(out)


def flow_id(t):
    m = re.match(r"(FL-\d+)", t)
    return m.group(1).lower() if m else slug(t)


def flows_index():
    items = [t for t, _ in sections(part(IA, "Flows"), 3)[1:]]
    lis = "".join(f'<li><a href="#{flow_id(t)}">{inline(t)}</a></li>' for t in items)
    return f'<ol class="flowlist">{lis}</ol>'


def persona_html():
    body = part(IA, "Persona walk-through")
    head, _, rest = body.partition("**What each number does to the flows.**")
    notes, _, tail = rest.partition("With these, no cell is a dead end")
    return (f'<div class="prose wide">{blocks(head)}</div>'
            f'<details class="notes"><summary>What each number does to the flows</summary>'
            f'<div class="prose">{blocks(notes)}</div></details>'
            f'<div class="prose"><p>With these, no cell is a dead end{inline(tail.strip())}</p></div>')


# ---------- links between ids ----------

def linker(html_text, known):
    def link_ids(text):
        def rep(m):
            k = m.group(0).lower()
            return f'<a class="ref" href="#{k}">{m.group(0)}</a>' if k in known else m.group(0)
        return re.sub(r"\b(?:F-\d+[a-z]?|SC-\d\d|FL-\d\d)\b", rep, text)

    parts = re.split(r"(<pre[\s\S]*?</pre>|<summary[\s\S]*?</summary>|<a [\s\S]*?</a>)", html_text)
    for i in range(0, len(parts), 2):
        parts[i] = re.sub(r">([^<]+)<", lambda m: ">" + link_ids(m.group(1)) + "<", parts[i])
    return "".join(parts)


groups = feature_groups()
all_rows = [r for _, rows in groups for r in rows]
n_v = {k: sum(1 for r in all_rows if version_of(r[4]) == k) for k in ("v1", "later", "never")}
n_confirm = sum(1 for r in all_rows if "owner to confirm" in r[6])
inventory = [ln for ln in part(IA, "Screen inventory").splitlines() if ln.startswith("| SC-")]
flows = [t for t, _ in sections(part(IA, "Flows"), 3)[1:]]
known = {r[0].lower() for r in all_rows} | {cells(ln)[0].lower() for ln in inventory} | {flow_id(t) for t in flows}

in_one_line = part(FS, "In one line").strip()
owner_fs = part(FS, "Owner answers")

NAV = [("features", "Features"), ("never", "Never"), ("journeys", "Journeys"), ("decisions", "Decisions"),
       ("screens", "Screens"), ("map", "Map"), ("navigation", "Navigation"), ("flows", "Flows"),
       ("personas", "Personas"), ("to-draw", "To draw")]

body = f"""<header class="top">
  <div class="wrap">
    <p class="eyebrow">Retake · stages 2 and 3 · updated 22 Oct 2026</p>
    <h1>Features and screen map</h1>
    <p class="lede">{inline(in_one_line)}</p>
    <ul class="stats" aria-label="In numbers">
      <li><b>{len(all_rows)}</b> features</li>
      <li><b>{n_v['v1']}</b> in the first version</li>
      <li><b>{n_v['later']}</b> later</li>
      <li><b>{n_v['never']}</b> never</li>
      <li><b>{n_confirm}</b> on a default for you to confirm</li>
      <li><b>{len(inventory)}</b> screens</li>
      <li><b>{len(flows)}</b> flows</li>
    </ul>
    <div class="changed">
      <h2>What changed since the last version of this page</h2>
      <ul>
        <li>The game is called <b>Retake</b> (रीटेक). The 20-minute starter is the <b>First take</b>, and each monthly redo the <b>Next take</b>.</li>
        <li>The First take is in the first version: five chapters of about 4 minutes, one per world, with private results that show which way the choices leaned.</li>
        <li>Three dailies a day, Easy, Medium and Hard, each level with its own Today, This week and All time boards.</li>
        <li>Five worlds take a week each: Lugdi, Station, Jadugar, Cricket and Rukavat. Three new kinds of decision: Believe, the batting order and Split.</li>
        <li>Sign out for a saved player; signing in on a new phone signs the old one out. "Wrong date?" once on the wait screen.</li>
        <li>The metal look with fewer, finer borders, and each world telling its own story, are design decisions: they live in the design document, not here.</li>
      </ul>
    </div>
  </div>
</header>
<nav class="nav" aria-label="Sections"><div class="nav-in">
{''.join(f'<a href="#{i}">{t}</a>' for i, t in NAV)}
</div></nav>
<main>
<section class="wrap" id="features" aria-labelledby="features-h">
  <h2 id="features-h">Features</h2>
  <details class="howto"><summary>How to read the feature tables</summary><div class="prose">{blocks(part(FS, "How to read this"))}</div></details>
  <div class="filters" role="group" aria-label="Filter the features">
    <div class="chips">
      <button type="button" class="chip" data-f="all" aria-pressed="true">All</button>
      <button type="button" class="chip" data-f="v1" aria-pressed="false">First version</button>
      <button type="button" class="chip" data-f="later" aria-pressed="false">Later</button>
      <button type="button" class="chip" data-f="never" aria-pressed="false">Never</button>
      <button type="button" class="chip" data-f="confirm" aria-pressed="false">For you to confirm</button>
    </div>
    <label class="search"><span class="vh">Search the features</span><input type="search" id="q" placeholder="Search, e.g. streak or F-203" autocomplete="off"></label>
    <label class="basis-t"><input type="checkbox" id="basis"> Show the basis</label>
    <p class="count" id="count" aria-live="polite"></p>
  </div>
  {''.join(feature_table(t, rows) for t, rows in groups)}
  <p class="none" id="none" hidden>No feature matches. Clear the search or pick All.</p>
</section>
<section class="wrap narrow" id="never" aria-labelledby="never-h">
  <h2 id="never-h">Never, and why</h2>
  <div class="prose">{blocks(part(FS, "Never"))}</div>
</section>
<section class="wrap" id="journeys" aria-labelledby="journeys-h">
  <h2 id="journeys-h">Which features serve each moment</h2>
  <div class="prose wide">{blocks(part(FS, "Journey trace"))}</div>
</section>
<section class="wrap narrow" id="decisions" aria-labelledby="decisions-h">
  <h2 id="decisions-h">Your answers and the defaults set with them</h2>
  {sub_sections(owner_fs)}
  <h3>Counts by group</h3>
  <div class="prose">{blocks(part(FS, "Counts"))}</div>
</section>
<section class="wrap" id="screens" aria-labelledby="screens-h">
  <h2 id="screens-h">Every screen</h2>
  <p class="lede-s">{inline(part(IA, "The shape in one paragraph").strip())}</p>
  <details class="howto"><summary>How to read the screen map</summary><div class="prose">{blocks(part(IA, "How to read this"))}</div></details>
  {screens_html()}
</section>
<section class="wrap" id="map" aria-labelledby="map-h">
  <h2 id="map-h">The map</h2>
  <div class="prose wide">{blocks(part(IA, "The map"))}</div>
</section>
<section class="wrap" id="navigation" aria-labelledby="navigation-h">
  <h2 id="navigation-h">Navigation rules</h2>
  {sub_sections(part(IA, "Navigation rules"))}
</section>
<section class="wrap" id="flows" aria-labelledby="flows-h">
  <h2 id="flows-h">Flows</h2>
  {flows_index()}
  {sub_sections(part(IA, "Flows"), id_from=flow_id)}
</section>
<section class="wrap" id="personas" aria-labelledby="personas-h">
  <h2 id="personas-h">Each flow, walked by the six players</h2>
  {persona_html()}
</section>
<section class="wrap narrow" id="to-draw" aria-labelledby="to-draw-h">
  <h2 id="to-draw-h">Screens still to draw</h2>
  <div class="prose">{blocks(part(IA, "Screens still to draw"))}</div>
  <h3>Your answers on the screen map</h3>
  <div class="prose">{blocks(part(IA, "Owner answers"))}</div>
</section>
</main>
"""

SCRIPT = """<script>
(function () {
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var q = document.getElementById('q');
  var rows = Array.prototype.slice.call(document.querySelectorAll('.ftable tbody tr'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('.fgroup'));
  var count = document.getElementById('count');
  var none = document.getElementById('none');
  var mode = 'all';
  function apply() {
    var term = q.value.trim().toLowerCase(), shown = 0;
    rows.forEach(function (r) {
      var ok = mode === 'all' || (mode === 'confirm' ? r.dataset.s === 'confirm' : r.dataset.v === mode);
      if (ok && term) ok = r.textContent.toLowerCase().indexOf(term) >= 0;
      r.hidden = !ok;
      if (ok) shown++;
    });
    groups.forEach(function (g) { g.hidden = !g.querySelector('tbody tr:not([hidden])'); });
    count.textContent = 'Showing ' + shown + ' of ' + rows.length;
    none.hidden = shown > 0;
  }
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      mode = c.dataset.f;
      chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
      apply();
    });
  });
  q.addEventListener('input', apply);
  document.getElementById('basis').addEventListener('change', function (e) {
    document.body.classList.toggle('show-basis', e.target.checked);
  });
  function openTarget() {
    var id = location.hash.slice(1);
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'DETAILS') el.open = true;
    if (el.tagName === 'TR' && el.hidden) {
      mode = 'all'; q.value = '';
      chips.forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.f === 'all' ? 'true' : 'false'); });
      apply();
      el.scrollIntoView({ block: 'center' });
    }
  }
  window.addEventListener('hashchange', openTarget);
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.ref');
    if (a) setTimeout(openTarget, 0);
  });
  openTarget();
  apply();
})();
</script>
"""

CSS = (HERE / "review.css").read_text() + "\n" + (HERE / "features.css").read_text()
page = f"""<title>Retake Features and Map</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hind:wght@500;700&display=swap">
<style>
{CSS}
</style>
{linker(body, known)}{SCRIPT}"""

OUT.write_text(page)
print(OUT, len(page), n_v, n_confirm, len(inventory), len(flows))
