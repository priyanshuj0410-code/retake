"""Merges the finished voice files into the cast (characters/result.json -> characters/result-v2.json) and writes the
twelve moments for the page (voice/moments.json)."""
import json, re
from pathlib import Path

HERE = Path(__file__).parent
CH = HERE.parent / 'characters'
cast = json.loads((CH / 'result.json').read_text())
idx = json.loads((HERE / 'notes' / 'index.json').read_text())
first = lambda s: re.sub(r'[^a-z ]', ' ', s.lower()).split()[0]
voices = {first(r['name']): json.loads((HERE / r['file']).read_text()) for r in idx}

TEST = [re.sub(r'^\d+\.\s*', '', m).split(' (')[0].strip() for m in json.loads((HERE / 'result.json').read_text())['audit']['test_set'] if re.match(r'^\d+\.', m)]
moments, order = {m: {} for m in TEST}, TEST
for c in cast['cast']:
    v = voices[first(c['name'])]
    c['voice'] = v['voice']
    c['typing'] = v['typing']
    c['test_lines'] = v['test_lines']
    c['voice_changes'] = v.get('changed', [])
    for i, t in enumerate(v['test_lines'][:len(TEST)]):
        moments[TEST[i]][re.split(r'\s*\(', c['name'])[0]] = {k: t[k] for k in ('en', 'hinglish', 'hi')}
(CH / 'result-v2.json').write_text(json.dumps(cast, ensure_ascii=False, indent=1))
(HERE / 'moments.json').write_text(json.dumps([{'moment': m, 'lines': moments[m]} for m in order], ensure_ascii=False, indent=1))
print(len(cast['cast']), 'characters merged;', len(order), 'moments:', [len(moments[m]) for m in order])
