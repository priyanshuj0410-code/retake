"""A small markdown renderer for the review pages: paragraphs, lists, tables, code fences and
mermaid blocks, with English | Hindi pairs set on two lines."""
import html
import re

DEV = re.compile(r"[ऀ-ॿ]")


def strip_front(md):
    return md.split("\n---\n", 1)[1] if md.startswith("---") else md


def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r"\[([^\]]+)\]\(([^)]+)\)",
               lambda m: m.group(1) if not m.group(2).startswith("http")
               else f'<a href="{m.group(2)}">{m.group(1)}</a>', s)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)
    s = re.sub(r"(?<![\w*])\*([^*]+)\*(?![\w*])", r"<i>\1</i>", s)
    return s


def bilingual(s):
    """'English | हिंदी' or 'English / हिंदी' -> English with the Hindi on its own line."""
    for sep in (" | ", " / "):
        if sep in s:
            a, b = s.rsplit(sep, 1)
            if DEV.search(b) and not DEV.search(a) and not re.search(r"[A-Za-z]{3,}", re.sub(r"\{[^}]*\}", "", b)):
                return f'{inline(a)}<span class="hi">{inline(b)}</span>'
    return inline(s)


def cells(line):
    return [c.strip().replace("\\|", "|") for c in re.split(r"(?<!\\)\|", line.strip().strip("|"))]


def table(lines, rowclass=None):
    head = cells(lines[0])
    out = ['<div class="tw"><table><thead><tr>']
    out += [f"<th>{inline(h)}</th>" for h in head]
    out.append("</tr></thead><tbody>")
    for ln in lines[2:]:
        row = cells(ln)
        cls = rowclass(row) if rowclass else ""
        out.append(f'<tr{cls}>' + "".join(f"<td>{bilingual(c)}</td>" for c in row) + "</tr>")
    out.append("</tbody></table></div>")
    return "".join(out)


LIST_RE = re.compile(r"^(\s*)([-*]|\d+\.) (.*)$")


def render_list(lines):
    items = []
    for ln in lines:
        m = LIST_RE.match(ln)
        if not m:
            items[-1][1] += " " + ln.strip()
            continue
        depth = 1 if len(m.group(1)) >= 2 else 0
        if depth == 0 or not items:
            items.append([m.group(3), "", []])
        else:
            items[-1][2].append(m.group(3))
    ordered = bool(re.match(r"^\d+\.", lines[0].strip()))
    tag = "ol" if ordered else "ul"
    out = [f"<{tag}>"]
    for text, extra, subs in items:
        out.append(f"<li>{bilingual(text + extra)}")
        if subs:
            out.append("<ul>" + "".join(f"<li>{bilingual(x)}</li>" for x in subs) + "</ul>")
        out.append("</li>")
    out.append(f"</{tag}>")
    return "".join(out)


def blocks(md):
    """Render a run of markdown paragraphs, lists and tables (no headings)."""
    out, buf, kind = [], [], None

    def flush():
        nonlocal buf, kind
        if not buf:
            return
        if kind == "table":
            out.append(table(buf))
        elif kind == "list":
            out.append(render_list(buf))
        else:
            out.append(f"<p>{bilingual(' '.join(x.strip() for x in buf))}</p>")
        buf, kind = [], None

    fence = None
    for ln in md.splitlines():
        if fence is not None:
            if ln.strip().startswith("```"):
                body = html.escape("\n".join(fence[1]), quote=False)
                cls = ' class="mermaid"' if fence[0] == "mermaid" else ""
                out.append(f"<pre{cls}>{body}</pre>" if cls else f"<pre><code>{body}</code></pre>")
                fence = None
            else:
                fence[1].append(ln)
            continue
        if ln.strip().startswith("```"):
            flush()
            fence = [ln.strip()[3:].strip(), []]
            continue
        if not ln.strip() or ln.strip() == "---":
            flush()
            continue
        k = "table" if ln.lstrip().startswith("|") else "list" if LIST_RE.match(ln) else "p"
        if kind == "list" and k == "p" and ln.startswith(" "):
            k = "list"
        if kind and k != kind:
            flush()
        kind = k
        buf.append(ln)
    flush()
    return "".join(out)


def sections(md, level):
    """Split markdown on headings of one level: [(title, body)], with the text before the first."""
    mark = "#" * level + " "
    parts, title, buf = [], None, []
    for ln in md.splitlines():
        if ln.startswith(mark):
            parts.append((title, "\n".join(buf)))
            title, buf = ln[len(mark):].strip(), []
        else:
            buf.append(ln)
    parts.append((title, "\n".join(buf)))
    return parts
