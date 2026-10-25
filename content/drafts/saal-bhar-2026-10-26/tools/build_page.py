"""Run: python3 content/drafts/saal-bhar-2026-10-26/tools/build_page.py (writes marked.html beside it).
Builds marked.html: the written Saal Bhar First take in strip order, every rule break marked (26 Oct 2026)."""
import json, re
from pathlib import Path

HERE = Path(__file__).parent
DATA = HERE.parent
R = json.loads((DATA / 'result.json').read_text())
RULES_MD = Path('/Users/priyanshu/equal-lens-trainer/knowledge/story/ground-rules-draft-2026-10-25.md').read_text()
RTEXT = {int(m.group(1)): m.group(2) for m in re.finditer(r'^(\d+)\. (.*)$', RULES_MD.split('## Questions only you can answer')[0], flags=re.M)}


def short_rule(n):
    t = RTEXT.get(n, '')
    t = re.sub(r'\s*\((you decided|house rule|new)[^)]*\)\s*$', '', t)
    t = re.sub(r'\*\*', '', t)
    return t if len(t) < 260 else t[:257].rsplit(' ', 1)[0] + '...'


chapters = []
for n in range(1, 6):
    ch = json.loads((DATA / f'chapter-{n}.json').read_text())
    verdicts = next(c['verdicts'] for c in R['chapters'] if c['n'] == n)
    ids = [b['id'] for b in ch['beats']]
    flags, loose = {}, []
    for v in verdicts:
        if v['verdict'] == 'wrong':
            continue
        found = [i for i in re.findall(r'\b(\d\.\d{2})\b', v['beat']) if i in ids]
        rules = sorted({int(k) for k in re.findall(r'\b(\d{1,2})\b', v['rule'].split('(')[0]) if 1 <= int(k) <= 66})
        f = {'sev': v['severity'], 'wait': v['verdict'] == 'doubtful', 'rules': rules,
             'rule_text': [short_rule(r) for r in rules], 'breaks': v['breaks'], 'fix': v['fix'], 'where': v['beat']}
        if found:
            f['also'] = found[1:]
            flags.setdefault(found[0], []).append(f)
        else:
            loose.append(f)
    beats = []
    for b in ch['beats']:
        pic = b.get('painting', '')
        marks = re.findall(r'\[(BREAKS|WAITS)[^\]]*\]', pic)
        marks = [m.group(0)[1:-1] for m in re.finditer(r'\[(?:BREAKS|WAITS)[^\]]*\]', pic)]
        pic = re.sub(r'\s*MARKS?:.*$', '', re.sub(r'\[(?:BREAKS|WAITS)[^\]]*\];?', '', pic)).strip()
        beats.append({'id': b['id'], 'kind': b['kind'], 'pic': pic, 'marks': marks, 'bubbles': b.get('bubbles', []),
                      'decision': b.get('decision'), 'flags': flags.get(b['id'], [])})
    chapters.append({'n': n, 'title': ch['title'], 'look': ch['look'].split(':')[0].split('.')[0][:90], 'area': ch['area'],
                     'goals': ch.get('goals', []), 'beats': beats, 'loose': loose, 'notes': ch.get('writer_notes', [])})

judges = {v['lens']: v for v in R['verdicts']}
DATA = {'chapters': chapters, 'judges': judges, 'open': R['bible'].get('open_for_owner', [])}
counts = {s: sum(1 for c in chapters for b in c['beats'] for f in b['flags'] if f['sev'] == s and not f['wait']) + sum(1 for c in chapters for f in c['loose'] if f['sev'] == s and not f['wait']) for s in ('blocks', 'weakens', 'polish')}
waits = sum(1 for c in chapters for b in c['beats'] for f in b['flags'] if f['wait']) + sum(1 for c in chapters for f in c['loose'] if f['wait'])

html = (HERE / 'page.tpl.html').read_text(encoding='utf-8')
html = html.replace('__DATA__', json.dumps(DATA, ensure_ascii=False).replace('</', '<\\/'))
for k, v in {**{f'__N_{k.upper()}__': str(v) for k, v in counts.items()}, '__N_WAITS__': str(waits)}.items():
    html = html.replace(k, v)
(HERE / 'marked.html').write_text(html, encoding='utf-8')
print(len(html), 'bytes', counts, 'waits', waits, 'loose', sum(len(c['loose']) for c in chapters))
