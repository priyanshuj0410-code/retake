# Audit, 25 Oct 2026: a line-for-line port of src/take/reading.ts favoured() and Results.tsx cards 1 and 3, run on the repo's JSON
# Run:  python3 design-system/tools/reading_chores_2026_10_25.py content/take/first-take.json
import json, re, sys
T = json.load(open(sys.argv[1], encoding='utf-8'))
R = T['results']; D = R['decisions']
def favoured(i, a):
    d = D.get(i)
    if not d or not a: return None
    p, q = d['pair']
    if 'pick' in a: return a['pick'] if a['pick'] in d['pair'] else None
    if 'set' in a:
        x, y = p in a['set'], q in a['set']
        return None if x == y else (p if x else q)
    if 'chores' in a:
        x, y = a['chores'].get(p, 0), a['chores'].get(q, 0)
        return None if x == y else (p if x < y else q)
    o = a['order']; return p if o.index(p) < o.index(q) else q
def run(answers, label):
    picks = {i: favoured(i, answers.get(i)) for i in D}
    sex = lambda i: D[i]['sex'][picks[i]] if picks[i] else None
    read = [i for i in D if sex(i)]; m = sum(sex(i) == 'm' for i in read); w = len(read) - m
    twins = [dict(t, ga=sex(t['a']), gb=sex(t['b'])) for t in R['twins'] if t['kind'] != 'hard']
    score = {}
    for t in twins:
        if t['ga'] and t['ga'] == t['gb']: score[t['world']] = score.get(t['world'], 0) + (1 if t['ga'] == 'm' else -1)
    top = sorted(score.items(), key=lambda x: -abs(x[1]))[:1]
    if not top or not top[0][1]: txt = 'Close to even in every part of life.'
    else:
        real = R['areas'][top[0][0]]['real'][0]
        txt = real if top[0][1] > 0 else re.sub(r'\b(man|woman)\b', lambda x: 'woman' if x.group(0) == 'man' else 'man', real)
    print(f'{label}\n   card 1 reads: {len(read)} times; man {m}, woman {w}\n   score {score}\n   card 3: {txt}')
# A: the only lean is the dust twin, both chores given to the women
run({'rukavat-3': {'set': ['Deepa', 'Uma']}, 'rukavat-7': {'set': ['Pooja', 'Kunal']}}, 'A. loft and storeroom both given to the women (Deepa+Uma, Pooja+Kunal)')
# B: the same player also loads the women in both Splits
run({'rukavat-3': {'set': ['Deepa', 'Uma']}, 'rukavat-7': {'set': ['Pooja', 'Kunal']},
     'rukavat-1': {'chores': {'Uma': 3, 'Vivek': 0}}, 'rukavat-5': {'chores': {'Shampa': 3, 'Kunal': 0}}}, 'B. A, plus the women given every chore in both Splits')
