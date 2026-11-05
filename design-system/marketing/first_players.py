"""The LinkedIn carousel inviting adults to be Retake's first players (owner, 5 Nov 2026, EVAL-25): seven 1080 x 1350 pages,
real paintings and real screens. Copy and its limits: knowledge/content/linkedin-first-players-2026-11.md.

It never calls the game a test, says it is about bias, or shows the reading or the two matched people explained, since
knowing that changes how people play (DESIGN.md, R-COPY-16, O9, O12). No counts or quotes from players: there are none.

Build:  python3 first_players.py  &&  node first_players.cjs   (from this folder; the screens need `npx vite build --outDir out/mkt-dist`)
"""
import glob
import importlib.util
from pathlib import Path

from PIL import Image, ImageChops, ImageStat

HERE = Path(__file__).resolve().parent
DS = HERE.parent
spec = importlib.util.spec_from_file_location('icons', DS / 'icons.py')
icons = importlib.util.module_from_spec(spec)
spec.loader.exec_module(icons)


def ic(name):
    return f'<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">{icons.ICONS[name]}</svg>'


def panel(name):
    """The story panel as painted (1024 x 768): the raw try that became the shipped asset, or the asset itself."""
    out = HERE / 'art' / f'{name}.jpg'
    asset = Image.open(DS / 'assets' / f'cut-{name}.webp').convert('RGB')
    best, score = None, 1e9
    for f in glob.glob(str(DS / 'art' / 'raw' / 'cut' / f'{name}-*.png')):
        raw = Image.open(f).convert('RGB')
        d = sum(ImageStat.Stat(ImageChops.difference(raw.resize(asset.size), asset)).mean)
        if d < score:
            best, score = raw, d
    (best if best is not None and score < 12 else asset).save(out, quality=92)
    return f'art/{name}.jpg'


TICKET = (DS.parent / 'public' / 'icons' / 'retake.svg').read_text()
ARROW = f'<span class="next">{ic("arrow")}</span>'
A = '../../public/take/assets/'


def page(cls, body, more=True):
    return f'<section class="s {cls}">{body}{ARROW if more else ""}</section>'


WORLDS = [('station-s-platform-l', '1971', 'A railway junction'), ('pulp-s-ghat-l', '1977', 'Trucks on the ghat'),
          ('jadugar-s-rope-l', '1984', 'A magic show'), ('cricket-s-nets-l', '1992', 'A cricket final'),
          ('sunday-s-room-l', '1999', 'A wedding at home')]
ROWS = [('person', 'Adults only, 18 and over.', "Please don't pass it to anyone younger."),
        ('phone', 'Just a link.', 'No sign-up and nothing to install.'),
        ('alert', 'Some chapters touch hard topics.', 'Each has a help line in its “?”.'),
        ('tool', 'It is early.', 'Expect rough edges. The Hindi is a first draft.')]

pages = [
    page('cover', f'<img class="wide" src="{panel("st-0-5")}" alt=""><div class="txt"><div class="brand"><span class="ticket">{TICKET}</span><b>Retake</b></div>'
                  '<h1>I made a game.<br>I need first players.</h1></div>'),
    page('story', f'<div class="txt"><h1>Dadi moves in with an old trunk.</h1></div><img class="wide" src="{panel("st-0-7")}" alt="">'
                  '<p class="caption">Inside it: five memories, from 1971 to 1999.</p>'),
    page('worlds', '<div class="txt"><h1>Each memory is painted in the art of its year.</h1></div><div class="cols">'
         + ''.join(f'<figure><img src="{A}{a}.webp" alt=""><figcaption><b>{y}</b>{p}</figcaption></figure>' for a, y, p in WORLDS) + '</div>'),
    page('play', '<div class="txt"><h1>You decide who gets the job.</h1><p>Pick someone. Send them. At the end, see what you chose.</p></div>'
                 '<img class="phone" src="art/screen-decision.png" alt="A decision in the game">'),
    page('rate', '<div class="txt"><h1>About 20 minutes.<br>Then 5 stars and<br>one honest line.</h1></div>'
                 '<img class="sheet" src="art/screen-rating.png" alt="The rating sheet"><p class="note">That is all that comes to me. Your answers stay on your phone.</p>'),
    page('know', '<div class="txt"><h1>Before you play</h1></div><ul>'
         + ''.join(f'<li><span class="i">{ic(i)}</span><div><b>{a}</b><span>{b}</span></div></li>' for i, a, b in ROWS) + '</ul>'),
    page('cta', f'<img class="wide" src="{panel("st-6-9")}" alt=""><div class="txt"><h1>Play it. Rate it.</h1><p class="url">tel-retake.vercel.app</p>'
                '<p class="small">Link in the first comment. Best on a phone.</p><p class="credit">Retake, by The Equal Lens</p></div>', more=False),
]

CSS = """
@page { size: 1080px 1350px; margin: 0; }
* { box-sizing: border-box; }
:root { --g: #1B0B2E; --t: #FFF3DC; --soft: #D9CDEB; --p: #EFE7D4; --i: #17110F; --r: #E4002B; }
html, body { margin: 0; background: var(--g); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.s { position: relative; width: 1080px; height: 1350px; overflow: hidden; break-after: page; background: var(--g); color: var(--t); font-family: 'Hind', sans-serif; }
.s:last-child { break-after: auto; }
h1 { margin: 0; font: 700 88px/1.08 'Hind', sans-serif; letter-spacing: -.01em; text-wrap: balance; }
p { margin: 0; }
.wide { display: block; width: 1080px; height: 810px; object-fit: cover; }
.txt { padding: 56px 64px 0; }
.next { position: absolute; right: 48px; bottom: 44px; width: 88px; height: 88px; border-radius: 50%; display: grid; place-items: center; background: var(--p); color: var(--i); }
.next svg { width: 44px; height: 44px; }

.cover .brand { display: flex; align-items: center; gap: 28px; margin-bottom: 30px; }
.cover .ticket { width: 96px; height: 96px; display: block; flex: none; border-radius: 8px; overflow: hidden; box-shadow: inset 0 0 0 2px var(--p); }
.cover .ticket svg { display: block; width: 100%; height: 100%; }
.cover .brand b { font: 900 104px/1 'Sarpanch', 'Hind', sans-serif; color: var(--p); }
.cover h1 { font-size: 80px; text-wrap: initial; }

.story .txt { padding-top: 96px; padding-bottom: 72px; }
.story h1 { font-size: 104px; }
.story .wide { position: absolute; left: 0; bottom: 0; }
.caption { position: absolute; left: 64px; right: 176px; bottom: 56px; padding: 26px 36px; background: var(--p); color: var(--i); font: 600 48px/1.25 'Hind', sans-serif; box-shadow: inset 0 0 0 3px var(--i); }

.worlds .txt { padding-top: 64px; padding-bottom: 48px; }
.worlds h1 { font-size: 76px; }
.cols { position: absolute; left: 0; right: 0; bottom: 0; top: 276px; display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
.cols figure { position: relative; margin: 0; overflow: hidden; }
.cols img { display: block; width: 100%; height: 100%; object-fit: cover; }
.cols figcaption { position: absolute; left: 0; right: 0; bottom: 0; padding: 18px 12px 170px; min-height: 340px; background: var(--g); font: 600 31px/1.2 'Hind', sans-serif; color: var(--t); }
.cols b { display: block; font: 700 54px/1.1 'Hind', sans-serif; }
.worlds .next { bottom: 40px; }

.play .txt { padding-top: 64px; }
.play h1 { font-size: 88px; }
.play p { margin-top: 24px; max-width: 900px; font: 500 44px/1.28 'Hind', sans-serif; color: var(--soft); }
.phone { position: absolute; left: 180px; top: 450px; width: 560px; border-radius: 48px; box-shadow: 0 0 0 10px #0B0612, 0 0 0 13px rgba(239,231,212,.45), 0 30px 60px rgba(0,0,0,.45); }

.rate .txt { padding-top: 64px; }
.rate h1 { font-size: 80px; text-wrap: initial; }
.sheet { position: absolute; left: 150px; top: 356px; width: 780px; border-radius: 20px; box-shadow: 0 24px 50px rgba(0,0,0,.4); }
.note { position: absolute; left: 64px; right: 176px; bottom: 56px; font: 600 42px/1.24 'Hind', sans-serif; color: var(--t); }

.know { background: var(--p); color: var(--i); }
.know .next { background: var(--g); color: var(--p); }
.know h1 { font-size: 112px; }
.know .txt { padding-top: 72px; }
.know ul { list-style: none; margin: 52px 64px 0; padding: 0; display: grid; gap: 0; }
.know li { display: grid; grid-template-columns: 88px minmax(0, 1fr); gap: 30px; align-items: start; padding: 40px 0 44px; box-shadow: inset 0 3px 0 var(--i); }
.know .i { width: 88px; height: 88px; display: grid; place-items: center; background: var(--g); color: var(--p); border-radius: 50%; }
.know .i svg { width: 46px; height: 46px; }
.know b { display: block; font: 700 54px/1.16 'Hind', sans-serif; }
.know li span:not(.i) { display: block; margin-top: 6px; font: 500 44px/1.25 'Hind', sans-serif; text-wrap: balance; }

.cta .txt { padding-top: 48px; }
.cta h1 { font-size: 112px; }
.url { display: inline-block; margin-top: 24px; padding: 14px 30px 10px; background: var(--p); color: var(--i); font: 700 66px/1.15 'Hind', sans-serif; box-shadow: inset 0 0 0 3px var(--i); }
.small { margin-top: 24px; font: 500 38px/1.25 'Hind', sans-serif; color: var(--soft); }
.credit { position: absolute; right: 64px; bottom: 44px; font: 500 30px/1.2 'Hind', sans-serif; color: var(--soft); }
"""

html = ('<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Retake first players</title>'
        '<link rel="stylesheet" href="../../public/take/fonts.css">'
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sarpanch:wght@900&display=swap">'
        f'<style>{CSS}</style></head><body>' + ''.join(pages) + '</body></html>')
(HERE / 'first-players.html').write_text(html, encoding='utf-8')
print('first-players.html', len(pages), 'pages')
