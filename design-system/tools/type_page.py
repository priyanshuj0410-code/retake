"""The demo's type as a Pixel 9 shows it, as one page (owner, 23 Oct 2026: "Show me the font weights and sizes as they will
appear on my pixel 9"). Reads the measurements tools/type_pixel9.cjs writes (type.json and one shot per screen) and writes
a page whose samples render at true size on the phone itself.

Run:  python3 design-system/tools/type_page.py <measure-dir> <out-dir>   (writes <out-dir>/pixel9.html and <out-dir>/shots/)
"""
import html
import json
import sys
from pathlib import Path

from PIL import Image

MM = 2.625 / 422 * 25.4   # one CSS pixel on a Pixel 9, in millimetres
# what each class is, in words, and where the eye meets it; vh is a hidden reader label, so it is left out
ROLE = {
 'bs': ('Cover title: the station name board', 'chapter cover'), 'bn': ('Cover title in Devanagari', 'chapter cover'),
 'q': ('The question', 'every step'), 'rkno': ('Rank place number', 'rank'), 'flaps': ('Train number tiles', 'chapter cover'),
 'cap': ('Cutscene caption', 'every cutscene'), 'howline': ('"?" sheet: how to play', '"?" sheet'), 'langchips': ('Language chips', '"?" sheet'),
 'setrow': ('Sound switch label', '"?" sheet'), 'main': ('Main button (Next, Pick one)', 'every screen'), 'textbtn': ('Skip', 'cutscenes'),
 'nm': ("Person's name", 'cards and rows'), 'stat': ('The numbers on a card', 'cards and rows'), 'dayplate': ('Place plate in the top bar', 'every step'),
 'note': ('Note on a card', 'cards and rows'), 'serial': ('Card serial (No. 02140)', 'Station cards'), 'balloon': ('Speaker and their line', 'every step'),
 'statkey': ('Key to the numbers (years, missed)', 'every step'), 'rkcut': ('"2 seats" line', 'rank'), 'coverline': ('Chapter line on the cover', 'chapter cover'),
 'level': ('Train / level line', 'chapter cover'), 'bm': ('Platform line on the name board', 'chapter cover'), 'tab': ('Tab labels', 'chapter cover'),
}
WN = {'400': 'Regular', '500': 'Medium', '600': 'SemiBold', '700': 'Bold'}
SHOTS = {1: 'Opening cutscene', 2: 'Chapter cover', 3: 'Pick one, notes on cards', 4: 'Rank', 5: 'Team, rows with notes', 6: 'Believe', 8: '"?" sheet'}


def build(measure, out):
    measure, out = Path(measure), Path(out); (out / 'shots').mkdir(parents=True, exist_ok=True)
    rows = json.load(open(measure / 'type.json'))
    seen = {}
    for r in rows:
        if r['role'] in ROLE:
            seen.setdefault((r['role'], r['weight'], r['size']), r)
    order = sorted(seen.values(), key=lambda r: (-r['size'], -int(r['weight']), ROLE[r['role']][0]))
    sizes = sorted({r['size'] for r in order}, reverse=True)
    trs = ''
    for r in order:
        name, where = ROLE[r['role']]
        lh = '' if r['line'] == 'normal' else f"{round(r['line'])} px"
        hi = ' lang="hi"' if any(0x900 <= ord(c) <= 0x97F for c in r['text']) else ''
        trs += (f'<tr><td><span class="smp" style="font-size:{r["size"]}px;font-weight:{r["weight"]}"{hi}>{html.escape(r["text"][:44])}</span>'
                f'<span class="role">{html.escape(name)} <i>· {where}</i></span></td>'
                f'<td class="n">{r["size"]:g}</td><td class="n">{r.get("css", r["size"]):g}</td><td>{WN.get(r["weight"], r["weight"])} {r["weight"]}</td><td class="n">{lh}</td>'
                f'<td class="n">{round(r["size"] * 2.625)}</td><td class="n">{r["size"] * MM:.1f}</td></tr>')
    figs = ''
    for i, n in SHOTS.items():
        Image.open(measure / f'{i:02d}.png').convert('RGB').save(out / 'shots' / f'{i:02d}.webp', 'WEBP', quality=82, method=6)
        figs += f'<figure><img src="shots/{i:02d}.webp" alt="{html.escape(n)} on a Pixel 9" width="412" height="923"><figcaption>{html.escape(n)}</figcaption></figure>'
    page = f'''<title>Pixel 9 Type Scale</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hind:wght@400;500;600;700&display=swap">
<style>
:root {{
  /* the game's own dark ground; the samples sit on its paper, as the cards do */
  --bg: #121315; --paper: #EFE7D4; --ink: #17110F; --fg: #F1EDE4; --muted: #A9A49A; --rule: #2E2F33;
  --type: 'Hind', 'Noto Sans Devanagari', system-ui, sans-serif; color-scheme: dark;
}}
body {{ background: var(--bg); color: var(--fg); font: 400 16px/1.5 var(--type); margin: 0; }}
.wrap {{ max-width: 1180px; margin: 0 auto; padding-block: 32px 56px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }}
h1 {{ margin: 0; font: 700 clamp(26px, 4vw, 36px)/1.2 var(--type); text-wrap: balance; }}
.lede {{ margin: 8px 0 0; color: var(--muted); max-width: 64ch; }}
h2 {{ margin: 40px 0 12px; font: 700 20px/1.3 var(--type); }}
.scroll {{ overflow-x: auto; }}
table {{ width: 100%; border-collapse: collapse; min-width: 640px; }}
th {{ text-align: left; font: 600 12px/1.3 var(--type); letter-spacing: .06em; text-transform: uppercase; color: var(--muted); padding: 8px 10px; border-bottom: 1px solid var(--rule); }}
td {{ padding: 12px 10px; border-bottom: 1px solid var(--rule); vertical-align: middle; font-variant-numeric: tabular-nums; }}
td.n {{ text-align: right; white-space: nowrap; }}
th.n {{ text-align: right; }}
.smp {{ display: block; width: fit-content; max-width: 360px; padding: 6px 10px; border-radius: 4px; background: var(--paper); color: var(--ink); line-height: 1.3; }}
.role {{ display: block; margin-top: 6px; font: 500 13px/1.4 var(--type); color: var(--muted); }}
.role i {{ font-style: normal; opacity: .8; }}
.shots {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap: 24px 16px; }}
figure {{ margin: 0; display: grid; gap: 8px; }}
figure img {{ width: 100%; max-width: 412px; height: auto; border-radius: 14px; }}
figcaption {{ font: 600 14px/1.4 var(--type); color: var(--muted); }}
.note {{ color: var(--muted); max-width: 70ch; }}
</style>
<div class="wrap">
<h1>The demo's type on a Pixel 9</h1>
<p class="lede">Measured on a Pixel 9 as Chrome lays it out: 412 CSS pixels wide, 2.625 screen pixels to each, 422 per inch. The phone draws its screen at 0.8, so the CSS size and the size on your screen differ; both are given. Open this page on the Pixel 9 and the samples show at their true size.</p>
<h2>Every size and weight in use</h2>
<div class="scroll"><table>
<thead><tr><th>Sample and role</th><th class="n">On screen px</th><th class="n">CSS px</th><th>Weight</th><th class="n">Line</th><th class="n">Screen px</th><th class="n">mm</th></tr></thead>
<tbody>{trs}</tbody></table></div>
<p class="note">One typeface, Hind, in {len({r["weight"] for r in order})} weights and {len(sizes)} sizes on screen: {", ".join(f"{s:g}" for s in sizes)} px. Icons, faces, buttons and spacing are drawn at the same 0.8. The mm column is the type's full size; a lower-case letter stands about half of it. The notes on Lugdi and Jadugar cards are set in italic.</p>
<h2>The screens, as the phone draws them</h2>
<div class="shots">{figs}</div>
</div>
'''
    (out / 'pixel9.html').write_text(page, encoding='utf-8')
    print(out / 'pixel9.html', len(order), 'rows')


if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
