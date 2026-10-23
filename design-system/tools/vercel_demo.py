"""The shared demo as a static site for Vercel's equal-lens-daily project (owner, 23 Oct 2026: "Can you put the demo we have
on the vercel link?"). demo.html is written for an artifact page, which wraps it in a document with a viewport tag and a
small reset; here the site gets the same, so a phone lays it out at its own width, plus noindex: the demo carries the hard
topics and is for the team.

Build:   python3 design-system/demo.py demo && python3 design-system/tools/vercel_demo.py site
         (site/ is committed. Since 24 Oct 2026 the project builds the app (vercel.json, `pnpm run build:web`) and copies
         site/ to /demo/ on the same site, so the team's link keeps working once the app goes to production; commit and
         push site/ after every demo change)
Deploy by hand:  vercel link --yes --project equal-lens-daily --scope priyanshuj0410-5861s-projects && vercel deploy --prod --yes
         (from the repo root, so vercel.json applies)
"""
import json
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
HEAD = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        '<meta name="robots" content="noindex, nofollow">\n'
        '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
        'body{margin:0;background:#111}img{max-width:100%}[hidden]{display:none!important}</style>\n')


def build(out):
    out = Path(out); out.mkdir(parents=True, exist_ok=True)
    page = (HERE / 'demo.html').read_text(encoding='utf-8')
    head, body = page.split('<main', 1)
    (out / 'index.html').write_text(HEAD + head + '</head>\n<body>\n<main' + body + '</body>\n</html>\n', encoding='utf-8')
    files = json.loads((HERE / 'demo-files.json').read_text(encoding='utf-8'))
    for f in files:
        (out / f).parent.mkdir(parents=True, exist_ok=True); shutil.copy2(HERE / f, out / f)
    print(out / 'index.html', len(files), 'files')


if __name__ == '__main__':
    build(sys.argv[1])
