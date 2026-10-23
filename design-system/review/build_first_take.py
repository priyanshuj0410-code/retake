"""Build the owner's review page for the First take and each world's daily story.

Reads knowledge/content/first-take.md and world-voices.md and writes
design-system/review/first-take.html. Run: python3 design-system/review/build_first_take.py
"""
import re
from pathlib import Path

from mdlite import blocks, bilingual, cells, inline, sections, strip_front, table

ROOT = Path(__file__).resolve().parents[2]
FT = (ROOT / "knowledge/content/first-take.md").read_text()
WV = (ROOT / "knowledge/content/world-voices.md").read_text()
OUT = Path(__file__).with_name("first-take.html")

WOMEN, MEN = set(), set()
for _ln in (ROOT / "knowledge/content/cast.md").read_text().splitlines():
    _c = cells(_ln) if _ln.startswith("|") else []
    if len(_c) >= 3 and _c[2].lower() in ("woman", "man") and re.fullmatch(r"[A-Z][a-z]+", _c[0]):
        (WOMEN if _c[2].lower() == "woman" else MEN).add(_c[0])
WORLDS = {
    "Station": "station", "Lugdi": "lugdi", "Jadugar": "jadugar",
    "Cricket": "cricket", "Rukavat": "rukavat",
}
# ---------- the chapters ----------

def parse_decision(title, body):
    m = re.match(r"(\w+) (\d+)\. (.+)", title)
    d = {"world": m.group(1), "n": int(m.group(2)), "title": m.group(3), "fields": {}, "table": []}
    for ln in body.splitlines():
        if ln.startswith("|"):
            d["table"].append(ln)
        else:
            f = re.match(r"- \*\*(.+?):\*\* (.*)", ln)
            if f:
                d["fields"][f.group(1)] = f.group(2)
    kind = d["fields"].get("Kind", "")
    k = re.match(r"(.*?)\s*\*\*Twin:\*\*", kind)
    d["kind"] = (k.group(1) if k else kind).rstrip(". ")
    pair = re.match(r"(\w+) and (\w+)", d["fields"].get("Hidden pair", ""))
    d["pair"] = {pair.group(1), pair.group(2)} if pair else set()
    return d


def cap(s):
    return s[:1].upper() + s[1:]


def decision_html(d, nudge_side, matters, acc):
    f = d["fields"]
    pair = d["pair"]
    nudged = next((p for p in pair if p in (WOMEN if nudge_side == "woman" else MEN)), None)

    def rowclass(row):
        name = row[0].split(" (")[0]
        return ' class="same"' if name in pair else ""

    rows = table(d["table"], rowclass)
    if nudged:
        rows = rows.replace(f"<td>{nudged} (", f'<td><span class="nudge" title="The nudge is about this person">{nudged}</span> (', 1)
    out = [f'<article class="dec" id="{acc}-{d["n"]}">',
           f'<header><span class="dn">{d["world"]} {d["n"]}</span><h4>{inline(d["title"])}</h4></header>',
           f'<p class="kind">{inline(d["kind"])}</p>']
    if "Setting" in f:
        out.append(f'<p class="set">{inline(cap(f["Setting"]))}</p>')
    if "Question" in f:
        out.append(f'<p class="q">{bilingual(f["Question"])}</p>')
    if "Voice" in f:
        who, said = f["Voice"].split(": ", 1)
        out.append(f'<blockquote class="voice"><span class="who">{inline(who)} says</span>{bilingual(said)}</blockquote>')
    if "Chores and TV" in f:
        out.append(f'<p class="chores"><span class="lab">To share out</span>{bilingual(f["Chores and TV"])}</p>')
    out.append(rows)
    if "Button" in f:
        named = any(n in f["Button"] for n in WOMEN | MEN)
        note = '<span class="note">names whoever is picked</span>' if named else ""
        out.append(f'<p class="btnline"><span class="fakebtn">{bilingual(f["Button"])}</span>{note}</p>')
    out.append("<dl>")
    if "Hidden pair" in f:
        out.append(f'<dt>The matching two</dt><dd>{inline(cap(f["Hidden pair"]))}</dd>')
    if "What it probes" in f:
        out.append(f'<dt>What it looks at</dt><dd>{inline(cap(f["What it probes"]))}</dd>')
    out.append("</dl>")
    side = "the woman" if nudge_side == "woman" else "the man"
    tag = f"Nudge on {side}"
    if matters:
        tag += ". It matters: following it is fair"
    out.append(f'<p class="side side-{nudge_side}">{tag}</p>')
    out.append("</article>")
    return "".join(out)


def chapter_html(title, body, idx):
    m = re.match(r"Chapter (\d): (\w+), (.+)", title)
    num, world, area = m.group(1), m.group(2), m.group(3)
    acc = WORLDS[world]
    parts = sections(body, 3)
    pre = parts[0][1]
    decs = {}
    for t, b in parts[1:]:
        d = parse_decision(t, b)
        decs[d["n"]] = d
    lines = pre.splitlines()
    twins, keep, i = [], [], 0
    while i < len(lines):
        if lines[i].strip() == "**The twins**":
            i += 1
            while i < len(lines) and not lines[i].startswith("|"):
                i += 1
            tl = []
            while i < len(lines) and lines[i].startswith("|"):
                tl.append(lines[i])
                i += 1
            hdr = [h.lower() for h in cells(tl[0])]
            col = {k: next((i for i, h in enumerate(hdr) if h.startswith(k)), None)
                   for k in ("what it looks at", "kind", "nudge on the woman", "nudge on the man")}
            for row in tl[2:]:
                c = cells(row)
                a, b = re.findall(r"\d+", c[0])[:2]
                kind = c[col["kind"]].lower() if col["kind"] is not None else ""
                twins.append({"a": int(a), "b": int(b), "looks": c[col["what it looks at"]], "kind": kind,
                              "woman": int(re.findall(r"\d+", c[col["nudge on the woman"]])[0]),
                              "man": int(re.findall(r"\d+", c[col["nudge on the man"]])[0])})
            continue
        keep.append(lines[i])
        i += 1
    tc = re.search(r"\*\*Title card:\*\* (.+)", pre)
    speaker = re.search(r"\*\*Speaker:\*\* (.+)", pre)
    setting = re.search(r"\*\*Line under the area[^*]*\*\* (.+)", pre)
    helpline = re.search(r'^\*\*"\?" in this chapter,?\*\*,? ?(.+)$', pre, re.M)
    skip = ("**Title card:**", "**Speaker:**", "**Line under the area", '**"?" in this chapter')
    rest = "\n".join(ln for ln in keep if not ln.startswith(skip))
    out = [f'<section class="chapter w-{acc}" id="ch{num}" aria-labelledby="ch{num}-h">',
           f'<div class="band band-{acc}"><div class="band-in">',
           f'<p class="band-k">Chapter {num} of 5</p>',
           f'<h2 id="ch{num}-h" class="disp disp-{acc}">{world}</h2>',
           f'<p class="band-area">{inline(area[0].upper() + area[1:])}</p>']
    if tc:
        out.append(f'<p class="band-card"><span class="lab">Title card</span>{bilingual(tc.group(1))}</p>')
    if setting:
        out.append(f'<p class="band-card"><span class="lab">Under the area, before Start</span>{bilingual(setting.group(1))}</p>')
    out.append("</div></div>")
    out.append('<div class="chapter-body">')
    if helpline:
        out.append(f'<p class="helpline"><b>"?" in this chapter:</b> {inline(helpline.group(1))}</p>')
    if speaker:
        out.append(f'<p class="speaker"><b>Who speaks:</b> {inline(speaker.group(1))}</p>')
    out.append(f'<div class="prose">{blocks(rest)}</div>')
    for k, t in enumerate(twins, 1):
        matters = t["kind"].startswith("matters") or t["looks"].lower().startswith("a detail that matters")
        label = f"Pair {k} of 4" + (" · hard topic" if t["kind"].startswith("hard") else "")
        out.append(f'<div class="twin"><h3 class="twin-h"><span class="twin-n">{label}</span>{inline(t["looks"])}</h3>')
        out.append('<div class="pair">')
        for n in (t["a"], t["b"]):
            side = "woman" if t["woman"] == n else "man"
            out.append(decision_html(decs[n], side, matters, acc))
        out.append("</div></div>")
    out.append("</div></section>")
    return "".join(out)


# ---------- the page ----------

ft = strip_front(FT)
ft_parts = dict()
ft_order = []
for t, b in sections(ft, 2):
    if t:
        ft_parts[t] = b
        ft_order.append(t)

read_first = ft_parts["Read this first"]
how = ft_parts["How every decision is built"]
glance = ft_parts["The five chapters at a glance"]
chapters = [(t, ft_parts[t]) for t in ft_order if t.startswith("Chapter ")]
results_t = next(t for t in ft_order if t.startswith("The results"))
results = sections(ft_parts[results_t], 3)
nexttake = ft_parts[next(t for t in ft_order if t.startswith("The Next take"))]
ft_qs = ft_parts["Questions for you"]
notes = ft_parts["Notes for the coordinator"]

wv = strip_front(WV)
wv_parts = sections(wv, 2)
wv_intro = "\n".join(ln for ln in wv_parts[0][1].splitlines()
                     if not ln.startswith("# ") and not ln.startswith("Where it lives"))
wv_world, wv_extra, wv_shared, wv_qs = [], [], "", ""
for t, b in wv_parts[1:]:
    if t.startswith("Shared words"):
        wv_shared = b
    elif t.startswith("Questions"):
        wv_qs = b
    elif t.split()[0].rstrip(":") in WORLDS and (": " in t or "(" in t):
        wv_world.append((t, b))
    else:
        wv_extra.append((t, b))


def results_html():
    out = [f'<div class="prose">{blocks(results[0][1])}</div><div class="cards">']
    for t, b in results[1:]:
        cls = " change" if t.startswith("The change card") else ""
        wait = " waiting" if "waiting" in t.lower() else ""
        out.append(f'<article class="rcard{cls}{wait}"><h3>{inline(t)}</h3>{blocks(b)}</article>')
    out.append("</div>")
    return "".join(out)


def world_story_html():
    out = []
    for t, b in wv_world:
        world = t.split()[0].rstrip(":")
        acc = WORLDS[world]
        sub = t.split(": ", 1)[1] if ": " in t else t.split(" ", 1)[1].strip("()")
        out.append(f'<article class="story w-{acc}"><div class="band band-{acc} band-sm"><div class="band-in">'
                   f'<h3 class="disp disp-{acc}">{world}</h3><p class="band-area">{inline(sub[0].upper() + sub[1:])}</p>'
                   f'</div></div><div class="story-body prose">{blocks(b)}</div></article>')
    return "".join(out)


def rich(md, tag="h4"):
    """Markdown with level-3 headings inside: each becomes a small heading over its blocks."""
    parts = sections(md, 3)
    out = [blocks(parts[0][1])] if parts[0][1].strip() else []
    for t, b in parts[1:]:
        out.append(f'<{tag} class="sub">{inline(t)}</{tag}>{blocks(b)}')
    return "".join(out)


def q_list(md):
    return rich(md).replace("<ol>", '<ol class="qs">')


def extra_html():
    out = []
    for t, b in wv_extra:
        world = t.split()[0].replace("'s", "")
        acc = WORLDS.get(world, "station")
        out.append(f'<section class="extra w-{acc}" id="{acc}-extra"><h3 class="sub">{inline(t[0].upper() + t[1:])}</h3>'
                   f'<div class="prose">{rich(b)}</div></section>')
    return "".join(out)

NAV = [("read", "Read first"), ("ch1", "1 Station"), ("ch2", "2 Lugdi"), ("ch3", "3 Jadugar"),
       ("ch4", "4 Cricket"), ("ch5", "5 Rukavat"), ("results", "Results"), ("next", "Next take"),
       ("stories", "World stories"), ("questions", "Questions")]

CSS = (Path(__file__).with_name("review.css")).read_text()

page = f"""<title>First Take Review</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hind:wght@500;700&family=Sarpanch:wght@900&family=Yatra+One&family=Khand:wght@700&family=Rozha+One&display=swap">
<style>
{CSS}
</style>
<header class="top">
  <div class="wrap">
    <p class="eyebrow">Retake · draft for your review · 22 Oct 2026</p>
    <h1>The First take, for your review</h1>
    <p class="lede">The 20-minute starter, written out in full: 40 decisions in five chapters, the five private result cards, and how a fresh set is made each month. Then each world's own daily story. Nothing is final. All the Hindi is a first draft for a native speaker.</p>
    <ul class="key" aria-label="How to read the decisions">
      <li><span class="k-same" aria-hidden="true"></span>Highlighted rows: the two with exactly the same numbers</li>
      <li><span class="k-nudge" aria-hidden="true">Kamla</span>Underlined name: the person the nudge is about</li>
      <li><span class="k-pair" aria-hidden="true"></span>Each pair: the same idea twice, the nudge on the other side</li>
    </ul>
  </div>
</header>
<nav class="nav" aria-label="Sections"><div class="nav-in">
{''.join(f'<a href="#{i}">{t}</a>' for i, t in NAV)}
</div></nav>
<main>
<section class="wrap narrow" id="read" aria-labelledby="read-h">
  <h2 id="read-h">Read this first</h2>
  <div class="prose">{blocks(read_first)}</div>
  <h2>How a decision works</h2>
  <div class="prose">{blocks(how)}</div>
  <h2>The five chapters at a glance</h2>
  <div class="prose">{blocks(glance)}</div>
</section>
{''.join(chapter_html(t, b, i) for i, (t, b) in enumerate(chapters))}
<section class="wrap" id="results" aria-labelledby="results-h">
  <h2 id="results-h">The results: five private cards</h2>
  {results_html()}
</section>
<section class="wrap narrow" id="next" aria-labelledby="next-h">
  <h2 id="next-h">The Next take: a fresh set each month</h2>
  <div class="prose">{blocks(nexttake)}</div>
</section>
<section class="wrap" id="stories" aria-labelledby="stories-h">
  <h2 id="stories-h">Each world's own daily story</h2>
  <div class="prose narrow-in">{blocks(wv_intro)}</div>
  <div class="stories">{world_story_html()}</div>
  {extra_html()}
  <h3 class="sub">Shared words made shorter</h3>
  <div class="prose">{blocks(wv_shared)}</div>
</section>
<section class="wrap narrow" id="questions" aria-labelledby="questions-h">
  <h2 id="questions-h">Questions for you</h2>
  <h3 class="sub">About the First take</h3>
  <div class="prose">{q_list(ft_qs)}</div>
  <h3 class="sub">About each world's story</h3>
  <div class="prose">{q_list(wv_qs)}</div>
  <details><summary>Notes for the coordinator</summary><div class="prose">{blocks(notes)}</div></details>
</section>
</main>
"""

OUT.write_text(page)
print(OUT, len(page))
