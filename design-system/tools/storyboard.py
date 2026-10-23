"""Every picked cutscene picture of "Dadi's trunk" in play order, with its caption in English and Hindi, as one page for
review (owner, 23 Oct 2026: "Show me all the illustrations in a single flow"). Where the decisions and the private reading
fall, the flow says so in one line, so the pictures read as the game shows them.

Run:  python3 design-system/tools/storyboard.py <out-dir>   (writes <out-dir>/storyboard.html and <out-dir>/assets/)
"""
import html
import re
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE))
import story_take as S  # noqa: E402

SCRIPT = HERE.parent / 'knowledge' / 'story' / 'first-take-script.md'

CSS = '''
:root {
  /* one dark screening room, as the game's own ground: the pictures carry the colour */
  --bg: #121315; --panel: #1C1D20; --fg: #F1EDE4; --muted: #A9A49A; --rule: #2E2F33; --accent: #FFD23F;
  --display: 'Hind', 'Noto Sans Devanagari', system-ui, sans-serif; --body: 'Hind', 'Noto Sans Devanagari', system-ui, sans-serif;
  color-scheme: dark;
}
body { background: var(--bg); color: var(--fg); font: 400 16px/1.5 var(--body); }
.wrap { max-width: 1240px; margin: 0 auto; padding-block: 40px 64px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
header h1 { margin: 0; font: 700 clamp(28px, 4vw, 40px)/1.15 var(--display); text-wrap: balance; }
header p { margin: 8px 0 0; color: var(--muted); max-width: 62ch; }
section { margin-top: 48px; }
.era { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px; padding-bottom: 12px; border-bottom: 1px solid var(--rule); }
.era b { font: 700 13px/1 var(--body); letter-spacing: .08em; text-transform: uppercase; color: var(--accent); }
.era h2 { margin: 0; font: 700 24px/1.25 var(--display); text-wrap: balance; }
.era span { color: var(--muted); }
.flow { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)); gap: 24px 20px; margin-top: 20px; }
figure { margin: 0; display: grid; gap: 10px; align-content: start; min-width: 0; }
figure img { display: block; width: 100%; height: auto; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 6px; background: var(--panel); }
figcaption { display: grid; gap: 4px; min-width: 0; }
.no { font: 700 12px/1 var(--body); letter-spacing: .06em; color: var(--muted); font-variant-numeric: tabular-nums; }
.en { font: 600 16px/1.4 var(--body); }
.hi { font: 400 15px/1.55 var(--body); color: var(--muted); }
.beat { grid-column: 1 / -1; display: flex; align-items: center; gap: 12px; color: var(--muted); font: 600 14px/1.4 var(--body); }
.beat::before, .beat::after { content: ''; flex: 1; border-top: 1px dashed var(--rule); }
'''


def build(out):
    out = Path(out); (out / 'assets').mkdir(parents=True, exist_ok=True)
    P = S.panels()
    heads = {int(n): (y, place, title) for n, y, place, title in re.findall(r'^## Chapter (\d)\. (\d{4}), ([^:]+): "([^"]+)"', SCRIPT.read_text(encoding='utf-8'), re.M)}
    count = 0

    def fig(pid):
        nonlocal count
        src = HERE / 'assets' / f'cut-st-{pid.replace(".", "-")}.webp'
        if not src.exists():
            return ''
        shutil.copy2(src, out / 'assets' / src.name); count += 1
        _, en, hi = P[pid]
        return (f'<figure><img src="assets/{src.name}" alt="" width="800" height="600" loading="lazy">'
                f'<figcaption><span class="no">{pid}</span><span class="en">{html.escape(en)}</span><span class="hi" lang="hi">{html.escape(hi)}</span></figcaption></figure>')

    def beat(text):
        return f'<div class="beat">{text}</div>'

    secs = [('2026', "Dadi's room, Nashik", 'The opening', [fig(f'0.{k}') for k in range(1, 8)])]
    for n in range(1, 6):
        y, place, title = heads[n]
        secs.append((y, place, f'Chapter {n}. {title}',
                     [fig(f'{n}.{k}') for k in range(1, 5)] + [beat('the chapter cover and its eight decisions')] + [fig(f'{n}.9'), fig(f'{n}.10')]))
    secs.append(('2026', "Dadi's room, Nashik", "The finale: Dadi's diary",
                 [fig(f'6.{k}') for k in range(1, 9)] + [beat('the private reading, five cards from your own picks')] + [fig('6.9')]))
    body = ''.join(f'<section><div class="era"><b>{y}</b><h2>{t}</h2><span>{html.escape(pl)}</span></div><div class="flow">{"".join(f for f in figs if f)}</div></section>'
                   for y, pl, t, figs in secs)
    page = ("<title>Dadi's Trunk Storyboard</title>\n<meta name=\"claude:viewport-fit-sides\" content=\"cover\">\n"
            '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
            '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hind:wght@400;600;700&display=swap">\n'
            f'<style>{CSS}</style>\n<div class="wrap"><header><h1>Dadi\'s trunk, every picture</h1>'
            f'<p>The First take\'s {count} cutscene pictures in the order a player meets them, each with its caption in English and Hindi.</p></header>{body}</div>\n')
    (out / 'storyboard.html').write_text(page, encoding='utf-8')
    print(out / 'storyboard.html', count, 'pictures')


if __name__ == '__main__':
    build(sys.argv[1])
