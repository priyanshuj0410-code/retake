"""The First take for the app (knowledge/reviews/app-build-plan-2026-10-24.md, M0.1): the same story the demo plays,
read from the same sources (story_take.parse(), panels(), the worlds), written as data for src/take/ and with the files
it reaches copied to public/take/.

The app renders the library's own markup and class names, so the library's CSS is copied, never edited in the app. What
differs by world and holds no state is resolved here: a step's plate, painting and serials; a chapter's hard cover and
the "?" sheet's dress come as markup fragments, as the library draws them. Steps, cutscenes and the reading are the
app's.

Run:  python3 design-system/tools/app_content.py   (writes content/take/first-take.json and public/take/)
It refuses to write while a note's length could point at the pair or a string has no Hindi.
"""
import json
import re
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
ROOT = HERE.parent
sys.path.insert(0, str(HERE))
import library as L
import first_take as FT
import story_take as S
import demo as D

OUT_JSON = ROOT / 'content' / 'take' / 'first-take.json'
OUT_PUB = ROOT / 'public' / 'take'
BASE = '/take/'


def pair(t):
    return list(t) if t else None


def cut(P, ids, world, label):
    """A cutscene as the demo strings it: the panels exported so far, in order; a present-day panel takes the colours of
    the chapter it belongs to."""
    rows = [(k, *P[k]) for k in ids if k in P and (HERE / f'assets/cut-st-{k.replace(".", "-")}.webp').exists()]
    if not rows:
        return []
    return [{'type': 'cut', 'label': list(label),
             'panels': [{'id': k, 'world': L.WORLDS[S.ERA.get(y, world)].cls, 'pic': f'assets/cut-st-{k.replace(".", "-")}.webp',
                         'cap': [en, hi]} for k, y, en, hi in rows]}]


def cover(c):
    """The chapter's hard cover, the setting named under the title, as the demo draws it (demo.chapter_cover)."""
    ph = D.chapter_cover(c, True)
    cls = re.search(r'class="phone world ([^"]*)"', ph).group(1)
    art = re.search(r'<div class="art ([^"]*)" style="background-image:url\(([^)]+)\)"', ph)
    inner = ph[ph.index('<div class="scr">') + len('<div class="scr">'):-len('</div></div>')]
    # a chapter's title card is a full screen with no tabs (ia-and-flows.md SC-91); the library's cover carries them
    inner = re.sub(r'<nav class="tabbar".*?</nav>', '', inner, flags=re.S)
    return {'type': 'cover', 'world': c['world'], 'cls': cls, 'art': [art.group(2), art.group(1)] if art else None, 'html': inner}


def kind_of(d):
    k = d['kind'].lower()
    if k.startswith(('pick one', 'believe')) or 'second stage' in k:
        return 'pick'
    if k.startswith('spend checks'):
        return 'checks'
    if k.startswith('rank'):
        return 'rank'
    if k.startswith(('pick a team', 'keep')):
        return 'team'
    if 'batting order' in k:
        return 'order'
    if k.startswith('split'):
        return 'split'
    raise SystemExit(f'no screen for the kind {d["kind"]!r}')


# the frame's moment for each kind, as first_take.step() passes it to frame()
MOMENT = {'pick': 'twin', 'checks': 'checks', 'rank': 'sort', 'team': 'team', 'order': 'team', 'split': 'split'}


def step(c, d, prog, i, total):
    W = L.WORLDS[c['world']]
    k = kind_of(d)
    art, ac = W.art(MOMENT[k])
    le, lh = FT.live_label(d)
    s = {'type': 'step', 'id': f'{c["world"]}-{d["n"]}', 'world': c['world'], 'cls': W.cls, 'n': i, 'total': total,
         'title': d['title'], 'kind': k, 'rawKind': d['kind'], 'q': list(d['q']),
         'speaker': list(c['speaker']), 'speakerFace': c['face'],
         'voice': [d['voice'][1], d['voice'][2]] if d['voice'] else None,
         'keys': [list(x) for x in d['keys']], 'plate': pair(W.plate(MOMENT[k])), 'art': [art, ac] if art else None,
         'button': [le, lh], 'teller': d['kind'].lower().startswith('believe'),
         'people': [{'en': p['en'], 'hi': p['hi'], 'vals': p['vals'], 'line': pair(p['line']), 'face': p['face'],
                     'serial': W.serial(j)} for j, p in enumerate(d['people'])],
         'prog': list(prog)}
    if k == 'checks':
        s['max'] = int(re.search(r'up to (\d+)', d['kind']).group(1))
    if k == 'rank':
        s['seats'] = int(re.search(r'(\d+) seats', d['kind']).group(1))
    if k == 'team':
        s['need'] = int((re.search(r'(\d+) of \d+', d['kind']) or re.search(r'(\d+)', d['q'][0])).group(1))
    if k == 'split':
        s['chores'] = [list(x) for x in d['chores']]
    return s


def help_dress():
    """The "?" sheet's dress: one empty div's class in the worlds that draw one (a valance, a crease, a cabinet)."""
    out = {}
    for w, W in L.WORLDS.items():
        html = W.sheet_dress(1)
        m = re.fullmatch(r'<div class="([\w-]+)" aria-hidden="true"></div>', html)
        if html and not m:
            sys.exit(f'{w}: the sheet dress is more than one div; the app draws only one')
        out[w] = m.group(1) if m else ''
    return out


def results_cards():
    """The five cards' frames: Rukavat's result painting behind each (first_take.results_phones)."""
    W = L.WORLDS['rukavat']
    return {'world': 'rukavat', 'cls': W.cls, 'art': [W.scene(W.moment('result')), 'veil-low']}


def build():
    chapters, P = S.parse(), S.panels()
    faults = S.length_faults(chapters)
    if faults:
        sys.exit('not written, note lengths: ' + '; '.join(faults))
    if S.MISSING:
        sys.exit('not written, strings with no Hindi: ' + '; '.join(sorted(set(S.MISSING))))
    total = sum(len(c['decisions']) for c in chapters)
    flow, i = cut(P, [f'0.{k}' for k in range(1, 8)], 'station', ("Dadi's trunk", 'दादी का संदूक')), 0
    for c in chapters:
        n = c['n']
        flow += cut(P, [f'{n}.{k}' for k in range(1, 5)], c['world'], c['title']) + [cover(c)]
        for j, d in enumerate(c['decisions'], 1):
            i += 1
            flow.append(step(c, d, (n, j, len(c['decisions'])), i, total))
        flow += cut(P, [f'{n}.9', f'{n}.10'], c['world'], c['title'])
    flow += cut(P, [f'6.{k}' for k in range(1, 9)], 'rukavat', ("Dadi's diary", 'दादी की डायरी'))
    flow += [{'type': 'results'}] + cut(P, ['6.9'], 'rukavat', ('The trunk', 'संदूक'))
    data = {'version': 1, 'langs': [list(x) for x in L.LANGS], 'eng': [list(x) for x in L.ENG],
            'worlds': {w: {'cls': W.cls, 'title': list(W.name)} for w, W in L.WORLDS.items()},
            'help': help_dress(), 'results': dict(FT.results_data(chapters, S.NUDGE), card=results_cards()),
            'icons': {k: L.ic(k) for k in {'tick', 'arrow', 'lock', 'help', 'back', 'close', 'language', 'speaker', 'down'}
                      | {x[0] for c in chapters for d in c['decisions'] for x in d['keys']}},
            'flow': flow}
    text = json.dumps(data, ensure_ascii=False, indent=1)
    # every picture is served from public/take/
    text = re.sub(r'(?<=[("])assets/', BASE + 'assets/', text)
    files = {'fonts.css', 'library.css'} | {f'worlds/{W.id}.css' for W in L.WORLDS.values() if (HERE / 'worlds' / f'{W.id}.css').exists()}
    pics = set(re.findall(re.escape(BASE) + r'(assets/[\w./-]+\.(?:webp|png|jpg|svg))', text))
    for f in sorted(x for x in files if x.endswith('.css')):
        for u in re.findall(r'url\(["\']?([^)"\']+)', (HERE / f).read_text(encoding='utf-8')):
            if not u.startswith(('http', 'data:', '#')):
                pics.add(str((HERE / Path(f).parent / u).resolve().relative_to(HERE)))
    missing = sorted(p for p in pics if not (HERE / p).exists())
    if missing:
        sys.exit('not written, pictures not found: ' + ', '.join(missing))
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(text + '\n', encoding='utf-8')
    if OUT_PUB.exists():
        shutil.rmtree(OUT_PUB)
    for f in sorted(files | pics):
        (OUT_PUB / f).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(HERE / f, OUT_PUB / f)
    (OUT_PUB / 'sound.js').write_text(D.sound_engines(), encoding='utf-8')
    (OUT_PUB / 'fonts.txt').write_text(L.font_link() + '\n', encoding='utf-8')
    kinds = sorted({s['kind'] for s in flow if s['type'] == 'step'})
    print(f'{OUT_JSON.relative_to(ROOT)}: {len(flow)} screens, {total} decisions ({", ".join(kinds)}), '
          f'{sum(1 for s in flow if s["type"] == "cut")} cutscenes; public/take/: {len(files | pics) + 2} files')


if __name__ == '__main__':
    build()
