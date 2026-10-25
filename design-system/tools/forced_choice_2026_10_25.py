# Audit, 25 Oct 2026: for each decision, the share of answers that compare the hidden two, for a player tapping at random
# and for one who goes only by the numbers (first number high, second low, ties at random). A plain twin that reads 0.00
# for the numbers player in both halves no longer forces the choice it was built for.
# Run:  python3 design-system/tools/forced_choice_2026_10_25.py .   (or the path of any checkout)
import sys, itertools, re
sys.path.insert(0, sys.argv[1] + '/design-system')
import story_take as S, first_take as FT
ch = S.parse()
def fav(kc, pair, resp):
    p, q = pair
    if kc == 'pick': return resp if resp in pair else None
    if kc == 'set':
        x, y = p in resp, q in resp
        return None if x == y else (p if x else q)
    i, j = resp.index(p), resp.index(q)
    return p if i < j else q
rows = []
for c in ch:
    for d in c['decisions']:
        kc = FT.kindcode(d)
        if kc == 'split': rows.append((c['world'], d['n'], d['kind'], '-', '-')); continue
        names = [p['en'] for p in d['people']]
        n = len(names)
        need = None
        if kc == 'set':
            m = re.search(r'(\d+) of \d+', d['kind'])
            need = int(m.group(1)) if m else int(re.search(r'up to (\d+)', d['kind']).group(1))
        # random player
        if kc == 'pick': space = [[x] for x in names]
        elif kc == 'set': space = [list(s) for s in itertools.combinations(names, need)]
        else: space = [list(s) for s in itertools.permutations(names)]
        def resp(r):
            return r[0] if kc == 'pick' else r
        rr = sum(fav(kc, d['pair'], resp(r)) is not None for r in space) / len(space)
        # numbers player: key1 high, key2 low (lexicographic), ties random
        if d['people'][0]['vals'] and c['world'] != 'rukavat':
            sc = {p['en']: (-int(p['vals'][0]), int(p['vals'][1])) for p in d['people']}
            perms = [list(s) for s in itertools.permutations(names) if all(sc[s[i]] <= sc[s[i+1]] for i in range(n-1))]
            def r2(perm):
                if kc == 'pick': return perm[0]
                if kc == 'set': return perm[:need]
                return perm
            nr = sum(fav(kc, d['pair'], r2(pp)) is not None for pp in perms) / len(perms)
            nr = f'{nr:.2f}'
        else: nr = 'n/a'
        rows.append((c['world'], d['n'], d['kind'], f'{rr:.2f}', nr))
for r in rows: print(f'{r[0]:<8} {r[1]} {r[2]:<48} random-read={r[3]} numbers-read={r[4]}')
