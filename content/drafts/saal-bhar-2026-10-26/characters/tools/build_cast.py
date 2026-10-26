"""Run: python3 content/drafts/saal-bhar-2026-10-26/characters/tools/build_cast.py (writes cast.html beside it; --knowledge rewrites knowledge/story/characters/, which needs method.md, cast-map.md and realism.md beside the script).
Builds cast.html (the Saal Bhar cast page) and the knowledge files, one per character (26 Oct 2026)."""
import json, re, sys
from pathlib import Path

HERE = Path(__file__).parent
REPO = Path(__file__).resolve().parents[5]
D = json.loads((HERE.parent / 'result.json').read_text())
CAST = D['cast']


def slug(name):
    first = re.split(r'[\s(]', name.strip())[0].lower()
    return {'you': 'player', 'mama': 'mama-ji', 'mausa': 'mausa-ji', 'captain': 'captain-sahab'}.get(first, first)


def short(name):
    return re.split(r'\s*\(', name)[0].strip()


# ---- knowledge files ---------------------------------------------------------------------------------------------
def md_list(items):
    return '\n'.join(f'- {x}' for x in items)


def to_md(c):
    v, t, l, p = c['voice'], c['typing'], c['look'], c['posture']
    nm = short(c['name'])
    parts = [
        '---', 'type: character', f'title: {nm}, Saal Bhar', f'description: {c["essence"][:300].replace(chr(10), " ")}',
        'plane_issues:', '  - https://app.plane.so/the-equal-lens/browse/EVAL-20/', '---', '',
        f'# {c["name"]}', '', f'**Role.** {c["role"]}', '', f'**Essence.** {c["essence"]}', '',
        '## Inner life', '', c['backstory'], '', c['want_fear_contradiction'], '',
        '## Relationships', '', md_list(c['relationships']), '', '## The year', '', c['year_arc'], '',
        '## Voice', '', f'**Register.** {v["register"]}', '', f'**Hindi and English.** {v["mix"]}', '',
        '**Habits**', '', md_list(v['tics']), '', '**Catchphrases**', '', md_list(v['catchphrases']), '',
        '**Words they use**', '', md_list(v['uses']), '', '**Never says**', '', md_list(v['never']), '',
        '**How they address people**', '', md_list(v['address']), '', '**Sample lines**', '', md_list(v['samples']), '',
        '## Typing', '', md_list(t['habits']), '', '**Sample messages**', '', md_list(t['samples']), '',
    ]
    if l.get('build'):
        parts += ['## Look', '', *[f'**{k.replace("_", " ").capitalize()}.** {l[k]}\n' for k in ('silhouette', 'build', 'face', 'skin', 'hair', 'glasses_jewellery', 'colour_key', 'prop', 'shoes')],
                  '**Outfits**', '', md_list(l['outfits']), '',
                  '## Posture', '', f'**Stance.** {p["stance"]}', '', f'**Sitting.** {p["sitting"]}', '', f'**Walk.** {p["walk"]}', '',
                  '**Gestures**', '', md_list(p['gestures']), '', '**Expressions**', '', md_list(p['expressions']), '',
                  '## In every look', '', md_list(c['across_looks']), '',
                  '## For the painter', '', c['painter_prompt'], '', '**Avoid**', '', md_list(c['painter_avoid']), '',
                  '**Model sheet**', '', md_list(c['model_sheet']), '']
    parts += ['## In the story', '', '**Best scenes**', '', md_list(c['best_scenes']), '', '**Never does**', '', md_list(c['never_does']), '']
    text = '\n'.join(parts)
    return re.sub('[–—]', ',', text)


if '--knowledge' in sys.argv:
    out = REPO / 'knowledge/story/characters'
    out.mkdir(parents=True, exist_ok=True)
    rows = []
    for c in CAST:
        s = slug(c['name'])
        (out / f'{s}.md').write_text(to_md(c), encoding='utf-8')
        rows.append(f'| [{short(c["name"])}]({s}.md) | {c["essence"][:140].rstrip()}... |')
    for name, src in [('method.md', 'method.md'), ('cast-map.md', 'cast-map.md'), ('realism.md', 'realism.md')]:
        text = (HERE / src).read_text(encoding='utf-8')
        if not text.startswith('---'):
            title = {'method.md': 'How Retake keeps characters consistent and memorable', 'cast-map.md': 'The Saal Bhar cast map',
                     'realism.md': 'Everyday realism for the Saal Bhar cast'}[name]
            text = f'---\ntype: reference\ntitle: {title}\ndescription: Research for the Saal Bhar character bible, 26 Oct 2026.\nplane_issues:\n  - https://app.plane.so/the-equal-lens/browse/EVAL-20/\n---\n\n' + text
        (out / name).write_text(re.sub('[–—]', ',', text), encoding='utf-8')
    readme = ['---', 'type: index', 'title: The Saal Bhar cast', 'description: The character bible for Saal Bhar, Retake\'s story mode: the household, the five chapter voices and the player, each defined in depth (inner life, voice, typing, look, posture, painter notes, model sheet), plus the method, the cast map and the realism research behind them. Owner\'s direction, 26 Oct 2026: define each character in depth so each keeps one visual identity across panels.', 'plane_issues:', '  - https://app.plane.so/the-equal-lens/browse/EVAL-20/', '---', '',
              '# The Saal Bhar cast', '', 'Owner, 26 Oct 2026: "Let\'s see how comicbooks solve it... it\'s by giving characters a unique visual identity that stays consistent across boards... define each character in depth, how they would talk, how they would type, the words they\'ll use, the clothes they\'ll wear, their postures everything."', '',
              'How the cast is kept consistent: [method.md](method.md). Who differs from whom, and how: [cast-map.md](cast-map.md). How each generation talks, types, dresses and stands: [realism.md](realism.md). The draft story they come from: [../saal-bhar-draft-2026-10-26.md](../saal-bhar-draft-2026-10-26.md).', '',
              '| Character | Essence |', '|---|---|', *rows, '']
    (out / 'README.md').write_text('\n'.join(readme), encoding='utf-8')
    print('knowledge files:', len(CAST) + 4)

# ---- the page ------------------------------------------------------------------------------------------------------
page = (HERE / 'cast.tpl.html').read_text(encoding='utf-8')
data = [{'name': c['name'], 'short': short(c['name']), 'id': slug(c['name']), **{k: c[k] for k in c if k not in ('revision_notes',)}} for c in CAST]
page = page.replace('__DATA__', json.dumps(data, ensure_ascii=False).replace('</', '<\\/'))
page = re.sub('[–—]', ',', page)
(HERE / 'cast.html').write_text(page, encoding='utf-8')
print('cast.html', len(page), 'bytes')
