"""Moves the library's spacing onto the golden-ratio scale (owner, 22 Oct 2026: "go ahead" on knowledge/ux/golden-ratio-ideas.md,
ideas 1 and 2, after the Station twin-step trial).

Every px value in a padding, margin or gap declaration of library.css and worlds/*.css goes to its nearest step of
5, 8, 13, 21, 34 (ties go up). Left as they are: 0 to 3 px (hairlines and accent offsets), and 36 px or more (room kept
for a mark or a fade). The 16 px screen edge is a token (--s16) and keeps its value. Tokens in those declarations move
the same way: --s4 to --f5, --s8 to --f8, --s12 to --f13, --s24 to --f21, --s32 to --f34; --s16 becomes --f13 except
on the screen's own side edges.

Run once:  python3 design-system/tools/phi_apply.py   (prints what it changed per file)
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = [ROOT / 'library.css'] + sorted((ROOT / 'worlds').glob('*.css'))
STEPS = [5, 8, 13, 21, 34]
DECL = re.compile(r'(?<![\w-])((?:padding|margin)(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?|gap|row-gap|column-gap)(\s*:\s*)([^;{}]+)')
TOKENS = {'--s4': '--f5', '--s8': '--f8', '--s12': '--f13', '--s24': '--f21', '--s32': '--f34'}


def step(px):
    n = abs(px)
    if n <= 3 or n >= 36:
        return px
    best = min(STEPS, key=lambda s: (abs(s - n), -s))
    return best if px > 0 else -best


def convert(prop, value, selector):
    def px(m):
        v = float(m.group(1))
        return f'{step(int(v)) if v == int(v) else v:g}px'.replace('.0px', 'px')
    value = re.sub(r'(?<![\w.])(-?\d+(?:\.\d+)?)px', px, value)
    for a, b in TOKENS.items():
        value = re.sub(rf'var\({a}\)', f'var({b})', value)
    # --s16 is the screen's side edge on the screen's own containers; anywhere else it is a gap and goes to 13
    edge = re.search(r'(^|[\s,])\.(scr-body|dock|topbar|page-play)\b', selector) and prop in ('padding', 'padding-left', 'padding-right', 'padding-inline')
    if not edge:
        value = value.replace('var(--s16)', 'var(--f13)')
    return value


def main():
    for f in FILES:
        s = f.read_text(encoding='utf-8')
        out, n, pos = [], 0, 0
        for m in DECL.finditer(s):
            sel_start = s.rfind('}', 0, m.start()) + 1
            selector = s[sel_start:s.find('{', sel_start)] if s.find('{', sel_start) < m.start() else ''
            # the library page's own chrome (.pg-*) is a document about the app, not the app: left alone
            new = m.group(3) if '.pg-' in selector else convert(m.group(1), m.group(3), selector)
            if new != m.group(3):
                n += 1
            out.append(s[pos:m.start(3)] + new)
            pos = m.end(3)
        out.append(s[pos:])
        f.write_text(''.join(out), encoding='utf-8')
        print(f'{f.relative_to(ROOT)}: {n} declarations moved onto the scale')


if __name__ == '__main__':
    main()
