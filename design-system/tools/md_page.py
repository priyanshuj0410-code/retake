"""Turns one knowledge file into a readable review page (owner, 23 Oct 2026: "Show me the script for review").

Handles what the story bible uses: headings, tables, nested lists, paragraphs, bold, italics, code and links. The
script's card marks become small tags: [N] nudge, [=] the pair's other half, [d] decoy, [F] family.

Run:  python3 design-system/tools/md_page.py <file.md> <out.html> "<Title>"
"""
import html
import re
import sys
from pathlib import Path

MARKS = {'[N]': ('nudge', 'tag-n'), '[=]': ('pair', 'tag-p'), '[d]': ('decoy', 'tag-d'), '[F]': ('family', 'tag-f')}

CSS = """
:root { --bg: #FBF8F2; --fg: #221A14; --soft: #6B5E52; --line: #E3DACC; --card: #FFFFFF; --accent: #8C2F1B;
  --n: #FBE3DC; --n-ink: #8C2F1B; --p: #E2ECF8; --p-ink: #1F4A80; --d: #ECE8E1; --d-ink: #5A5047; --f: #E5F2E2; --f-ink: #2E6B2A; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #17130F; --fg: #EEE6DA; --soft: #A89B8C; --line: #3A322A; --card: #211B16; --accent: #E59A82;
  --n: #4A231A; --n-ink: #F4B8A6; --p: #1E2D42; --p-ink: #A9C6EC; --d: #2E2924; --d-ink: #C9BFB3; --f: #1F3420; --f-ink: #A8D8A1; color-scheme: dark; } }
:root[data-theme="dark"] { --bg: #17130F; --fg: #EEE6DA; --soft: #A89B8C; --line: #3A322A; --card: #211B16; --accent: #E59A82;
  --n: #4A231A; --n-ink: #F4B8A6; --p: #1E2D42; --p-ink: #A9C6EC; --d: #2E2924; --d-ink: #C9BFB3; --f: #1F3420; --f-ink: #A8D8A1; color-scheme: dark; }
body { background: var(--bg); color: var(--fg); font: 400 16px/1.6 'Hind', system-ui, sans-serif; }
.wrap { max-width: 860px; margin: 0 auto; padding-block: 32px 96px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
h1 { font: 700 34px/1.15 'Hind', sans-serif; margin: 0 0 8px; text-wrap: balance; }
.lede { color: var(--soft); margin: 0 0 24px; }
h2 { font: 700 26px/1.2 'Hind', sans-serif; margin: 48px 0 12px; padding-top: 16px; border-top: 2px solid var(--fg); text-wrap: balance; }
h3 { font: 700 19px/1.3 'Hind', sans-serif; margin: 28px 0 8px; }
h4 { font: 700 16px/1.3 'Hind', sans-serif; margin: 20px 0 6px; }
p { margin: 8px 0; max-width: 72ch; }
a { color: var(--accent); }
code { font: 14px/1.4 ui-monospace, monospace; background: var(--d); padding: 1px 5px; border-radius: 4px; }
ul, ol { padding-left: 22px; margin: 8px 0; }
li { margin: 4px 0; }
li > ul, li > ol { margin: 4px 0; }
.tbl { overflow-x: auto; margin: 12px 0; border: 1px solid var(--line); border-radius: 8px; background: var(--card); }
table { border-collapse: collapse; width: 100%; font-size: 15px; }
th, td { text-align: left; vertical-align: top; padding: 8px 10px; border-bottom: 1px solid var(--line); }
th { font-weight: 700; background: color-mix(in srgb, var(--line) 45%, var(--card)); }
tr:last-child td { border-bottom: 0; }
.tag { display: inline-block; font: 600 12px/1 'Hind', sans-serif; padding: 3px 7px 2px; border-radius: 999px; vertical-align: 1px; white-space: nowrap; }
.tag-n { background: var(--n); color: var(--n-ink); } .tag-p { background: var(--p); color: var(--p-ink); }
.tag-d { background: var(--d); color: var(--d-ink); } .tag-f { background: var(--f); color: var(--f-ink); }
.toc { display: flex; flex-wrap: wrap; gap: 6px 14px; margin: 0 0 8px; padding: 12px 0; border-block: 1px solid var(--line); font-size: 15px; }
.legend { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 0; color: var(--soft); font-size: 14px; align-items: center; }
"""


def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r'`([^`]+)`', r'<code>\1</code>', s)
    s = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'(?<![\w*])\*([^*]+)\*(?![\w*])', r'<i>\1</i>', s)
    # links to other knowledge files are not published with the page, so they show as plain text
    s = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', lambda m: f'<a href="{m.group(2)}">{m.group(1)}</a>' if m.group(2).startswith('http') else m.group(1), s)
    for k, (word, cls) in MARKS.items():
        s = s.replace(html.escape(k, quote=False), f'<span class="tag {cls}">{word}</span>')
    return s


def slug(t):
    return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')


def convert(md):
    md = re.sub(r'\A---\n.*?\n---\n', '', md, flags=re.S)
    lines, out, i, toc, title = md.split('\n'), [], 0, [], ''
    while i < len(lines):
        ln = lines[i]
        if not ln.strip():
            i += 1
            continue
        h = re.match(r'(#{1,4}) (.+)', ln)
        if h:
            lvl, text = len(h.group(1)), h.group(2)
            if lvl == 1:
                title = text
            else:
                out.append(f'<h{lvl} id="{slug(text)}">{inline(text)}</h{lvl}>')
                if lvl == 2:
                    toc.append((slug(text), text))
            i += 1
            continue
        if ln.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].startswith('|'):
                rows.append([c.strip() for c in lines[i].strip().strip('|').split('|')])
                i += 1
            body = [r for r in rows[1:] if not all(re.fullmatch(r':?-+:?', c) for c in r)]
            out.append('<div class="tbl"><table><thead><tr>' + ''.join(f'<th>{inline(c)}</th>' for c in rows[0]) + '</tr></thead><tbody>'
                       + ''.join('<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in r) + '</tr>' for r in body) + '</tbody></table></div>')
            continue
        if re.match(r'\s*(-|\d+\.) ', ln):
            block = []
            while i < len(lines) and (re.match(r'\s*(-|\d+\.) ', lines[i]) or (lines[i].startswith('   ') and lines[i].strip())):
                block.append(lines[i])
                i += 1
            out.append(listing(block))
            continue
        para = [ln]
        i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r'(#|\||\s*(-|\d+\.) )', lines[i]):
            para.append(lines[i])
            i += 1
        out.append(f'<p>{inline(" ".join(x.strip() for x in para))}</p>')
    return title, toc, '\n'.join(out)


def listing(block):
    """Nested lists from indentation: each item's children are the lines indented deeper than it."""
    def build(items, base):
        tag = 'ol' if re.match(r'\s*\d+\.', items[0]) else 'ul'
        html_, j = f'<{tag}>', 0
        while j < len(items):
            m = re.match(r'(\s*)(?:-|\d+\.) (.*)', items[j])
            text, j = m.group(2), j + 1
            kids = []
            while j < len(items) and len(items[j]) - len(items[j].lstrip()) > base:
                kids.append(items[j])
                j += 1
            sub = [k for k in kids if re.match(r'\s*(-|\d+\.) ', k)]
            extra = ' '.join(k.strip() for k in kids if not re.match(r'\s*(-|\d+\.) ', k))
            child = build(sub, len(sub[0]) - len(sub[0].lstrip())) if sub else ''
            html_ += f'<li>{inline(text + (" " + extra if extra else ""))}{child}</li>'
        return html_ + f'</{tag}>'
    return build(block, len(block[0]) - len(block[0].lstrip()))


def main():
    src, dst, name = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3]
    title, toc, body = convert(src.read_text(encoding='utf-8'))
    legend = ''.join(f'<span class="tag {c}">{w}</span>' for w, c in MARKS.values())
    page = (f'<title>{html.escape(name)}</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
            '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hind:wght@400;600;700&display=swap">\n'
            f'<style>{CSS}</style>\n<main class="wrap"><h1>{inline(title)}</h1>'
            f'<p class="lede">Draft for review. Card marks: </p><div class="legend">{legend}</div>'
            f'<nav class="toc">{"".join(f"<a href=#{s}>{inline(t)}</a>" for s, t in toc)}</nav>\n{body}\n</main>\n')
    dst.write_text(page, encoding='utf-8')
    print(dst, len(page))


if __name__ == '__main__':
    main()
