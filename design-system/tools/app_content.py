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
import hashlib
import json
import re
import shutil
import sys
import urllib.request
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
OUT_ICONS = ROOT / 'public' / 'icons'
FONT_CACHE = ROOT / 'out' / 'font-cache'
BASE = '/take/'
# a current browser's agent, so Google serves woff2 split by script (Devanagari, Latin) as the library's pages get it
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36'


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


def paint(W, moment, cls=None):
    """A screen's painting for the app frame: the phone's picture and veil, and the larger (-l) and wide (-w) paintings
    the library's responsive shell takes at those sizes, each falling back as library.art_img does."""
    url, art_cls = W.art(moment)
    stem = url[:-len('.webp')]
    there = lambda f: f if (HERE / f).exists() else None
    p = there(f'{stem}-l.webp') or url
    w = there(f'{stem}-w.webp')
    if not w:   # a wide screen then stretches the phone's painting: worth painting (responsive review, 24 Oct 2026)
        NO_WIDE.add(stem.split('/')[-1])
    return {'base': url, 'p': p, 'w': w or p, 'cls': cls or art_cls}


NO_WIDE = set()


def cover(c):
    """The chapter's hard cover, the setting named under the title, as the demo draws it (demo.chapter_cover)."""
    ph = D.chapter_cover(c, True)
    cls = re.search(r'class="phone world ([^"]*)"', ph).group(1)
    inner = ph[ph.index('<div class="scr">') + len('<div class="scr">'):-len('</div></div>')]
    # a chapter's title card is a full screen with no tabs (ia-and-flows.md SC-91); the library's cover carries them
    inner = re.sub(r'<nav class="tabbar".*?</nav>', '', inner, flags=re.S)
    # the hard cover's painting with the phone cover's low veil (library.cover)
    return {'type': 'cover', 'world': c['world'], 'cls': cls, 'art': paint(L.WORLDS[c['world']], 'cover_hard', 'veil-low'), 'html': inner}


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
    le, lh = FT.live_label(d)
    s = {'type': 'step', 'id': f'{c["world"]}-{d["n"]}', 'world': c['world'], 'cls': W.cls, 'n': i, 'total': total,
         'title': d['title'], 'kind': k, 'rawKind': d['kind'], 'q': list(d['q']),
         'speaker': list(c['speaker']), 'speakerFace': c['face'],
         'voice': [d['voice'][1], d['voice'][2]] if d['voice'] else None,
         'keys': [list(x) for x in d['keys']], 'plate': pair(W.plate(MOMENT[k])), 'art': paint(W, MOMENT[k]),
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
    return {'world': 'rukavat', 'cls': W.cls, 'art': paint(W, 'result', 'veil-low')}


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
            # the first visit's birth-date card stands on the first chapter's cover painting (library.birth_phone)
            'gate': {'world': chapters[0]['world'], 'art': paint(L.WORLDS[chapters[0]['world']], 'cover', 'veil-low')},
            'icons': {k: L.ic(k) for k in sorted({'tick', 'arrow', 'lock', 'help', 'back', 'close', 'language', 'speaker', 'down', 'alert'}
                                                 | {x[0] for c in chapters for d in c['decisions'] for x in d['keys']})},
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
    nfonts = fonts()
    icons()
    kinds = sorted({s['kind'] for s in flow if s['type'] == 'step'})
    if NO_WIDE:
        print('paintings with no wide (-w) version, stretched on wide screens:', ', '.join(sorted(NO_WIDE)))
    print(f'{OUT_JSON.relative_to(ROOT)}: {len(flow)} screens, {total} decisions ({", ".join(kinds)}), '
          f'{sum(1 for s in flow if s["type"] == "cut")} cutscenes; public/take/: {len(files | pics) + 2} files and {nfonts} fonts; public/icons/: the ticket')


def fetch(url):
    """A font file or stylesheet from Google, kept in out/font-cache so an export runs offline once fetched."""
    FONT_CACHE.mkdir(parents=True, exist_ok=True)
    hit = FONT_CACHE / hashlib.sha1(url.encode()).hexdigest()[:16]
    if not hit.exists():
        with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=30) as r:
            hit.write_bytes(r.read())
    return hit.read_bytes()


def self_host(css):
    """Every font the app uses, served from public/take/fonts/: nothing is fetched from another site (feature-set
    F-122b), and a weak signal pays no extra DNS and TLS round trip. The URLs in the CSS become local ones."""
    out = OUT_PUB / 'fonts'
    out.mkdir(parents=True, exist_ok=True)
    def local(m):
        url = m.group(1)
        name = re.sub(r'^https://fonts\.gstatic\.com/s/', '', url).replace('/', '-')
        (out / name).write_bytes(fetch(url))
        return f'url(fonts/{name})'
    return re.sub(r'url\((https://fonts\.gstatic\.com/[^)]+)\)', local, css)


def fonts():
    """fonts.css (Hind and Khand, re-balanced by tools/fonts.py) and the worlds' display faces, both self-hosted."""
    lib = (OUT_PUB / 'fonts.css').read_text(encoding='utf-8')
    (OUT_PUB / 'fonts.css').write_text(self_host(lib), encoding='utf-8')
    head = '/* The worlds\' display faces from Google Fonts (SIL Open Font Licence), self-hosted by tools/app_content.py. */\n'
    (OUT_PUB / 'display-fonts.css').write_text(head + self_host(fetch(L.font_link()).decode()), encoding='utf-8')
    return len(list((OUT_PUB / 'fonts').iterdir()))


def icons():
    """The app icon, DESIGN.md's default A, the day's ticket (library.icon_svg), one for every world; the maskable
    version keeps the ticket inside the safe circle. scripts/icons.ts draws the PNGs from these."""
    svg = L.icon_svg('ticket').replace(' class="appicon"', ' xmlns="http://www.w3.org/2000/svg"').replace(' aria-hidden="true"', '')
    OUT_ICONS.mkdir(parents=True, exist_ok=True)
    (OUT_ICONS / 'retake.svg').write_text(svg + '\n', encoding='utf-8')
    ground, art = re.match(r'(<svg[^>]*><rect width="96" height="96" fill="#[0-9A-F]+"/>)(.*)</svg>', svg).groups()
    (OUT_ICONS / 'retake-maskable.svg').write_text(f'{ground}<g transform="translate(48 48) scale(.8) translate(-48 -48)">{art}</g></svg>\n', encoding='utf-8')


if __name__ == '__main__':
    build()
