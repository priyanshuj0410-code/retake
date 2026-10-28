"""Exhaustive search for the Hard level's deck (daily-strip-format.md, section 6), with quick prefilters.

Plan: Q1 rank of 5 with the pair below the top and a second tie; Q2 pick a team of 2 from 5, the trade trap (one card
leads on the first number only, another on the second only); Q3 rank of 5 with the pair below the top and a second
tie; Q4 pick a team of 2 from 5, one card above the pair, a leaning note on each of the two.
"""
import itertools, sys
sys.argv = ['x', 'hard']
src = open(__file__.replace('solve_hard.py', 'solve_daily2.py')).read().replace('\nmain()\n', '\n')
exec(src)

PLAN = [('midany', 5, True), ('trade', 5, False), ('midany', 5, True), ('pick', 4, False)]
PT = [(15, 2), (14, 2), (13, 3), (12, 3), (11, 4), (10, 4), (9, 5)]
OWN = [(17, 5), (8, 1), (7, 6), (6, 8)]
found = []
for tups in itertools.permutations(PT, 4):
    base = {}
    for (w, m), t in zip(PAIRS, tups):
        base[w] = base[m] = t
    t2 = tups[1]
    opts_x = list(tups) + OWN
    for ex in itertools.product(opts_x, repeat=4):
        T = dict(base)
        T.update(zip(EXTRA, ex))
        vals = [T[p] for p in PEOPLE if p not in PAIRS[1]]
        if not any(v[0] > t2[0] and v[1] >= t2[1] for v in vals):
            continue
        if not any(v[0] <= t2[0] and v[1] < t2[1] for v in vals):
            continue
        per = []
        for k, (kind, size, tie) in enumerate(PLAN):
            pair = PAIRS[k]
            rest = [p for p in PEOPLE if p not in pair]
            opts = [list(pair) + list(e) for e in itertools.combinations(rest, size - 2)
                    if valid_q(kind, list(pair) + list(e), pair, T, tie)]
            if not opts:
                break
            per.append(opts)
        else:
            if any(len(o) > 300 for o in per):
                continue
            for sets in itertools.product(*per):
                r = score_deck(sets, T)
                if r is not None:
                    found.append((r, sets, T))
                    break
    if len(found) > 40:
        break
found.sort(key=lambda v: -v[0])
print('decks found:', len(found))
for r, sets, T in found[:4]:
    print('returning pairs in Q2-Q4:', r)
    print(' numbers:', {p: T[p] for p in PEOPLE})
    for i, c in enumerate(sets, 1):
        print('  Q%d' % i, PLAN[i - 1][0], [(x, T[x]) for x in sorted(c, key=lambda c: (-T[c][0], T[c][1]))])
