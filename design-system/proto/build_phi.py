"""Builds proto/phi-compare.html: the Station twin step as the library draws it today, beside the same screen with
proto/phi.css (the golden-ratio spacing and type scales), on a 390 x 844 phone and a 360 x 640 phone.

Run after `python3 library.py`:  python3 design-system/proto/build_phi.py
"""
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
LIB = HERE.parent / 'index.html'


def phone(html, label, small):
    for m in re.finditer(r'<div class="phone world ([^"]*)" role="group" aria-label="' + re.escape(label) + '"', html):
        if ('is-small' in m.group(1)) == small and 'is-200' not in m.group(1) and 'data-lang' not in html[m.start():m.start() + 400]:
            depth, i = 0, m.start()
            for t in re.finditer(r'<(/?)div\b', html[i:]):
                depth += -1 if t.group(1) else 1
                if depth == 0:
                    return html[i:i + t.end() + 1]   # through the closing '>' of the phone's last </div>
    raise SystemExit(f'no {"small " if small else ""}phone labelled {label!r}')


def main():
    html = LIB.read_text(encoding='utf-8')
    head = html[:html.index('<div class="page">')]
    head = head.replace('href="library.css"', 'href="../library.css"').replace('href="fonts.css"', 'href="../fonts.css"')
    head = re.sub(r'href="worlds/', 'href="../worlds/', head)
    head = head.replace('<title>Retake Library</title>', '<title>Golden Ratio Trial</title>')
    cells = []
    for small in (False, True):
        ph = phone(html, 'Station twin step', small).replace('url(assets/', 'url(../assets/')
        trial = ph.replace('class="phone world ', 'class="phone world phi ', 1)
        size = '360 x 640' if small else '390 x 844'
        cells.append(f'<figure><figcaption>Today, {size}</figcaption>{ph}</figure>')
        cells.append(f'<figure><figcaption>Golden ratio, {size}</figcaption>{trial}</figure>')
    page = (head + '<link rel="stylesheet" href="phi.css">\n'
            '<style>body{margin:0;background:#E9E6DF;font:600 15px/1.4 Hind,sans-serif;color:#17110F}'
            '.phicmp{display:grid;grid-template-columns:390px 390px;gap:40px 56px;padding:32px;width:max-content}'
            'figure{margin:0;display:grid;gap:12px;justify-items:start}</style>\n'
            '<div class="phicmp">' + ''.join(cells) + '</div>\n')
    out = HERE / 'phi-compare.html'
    out.write_text(page, encoding='utf-8')
    print(out)


if __name__ == '__main__':
    main()
