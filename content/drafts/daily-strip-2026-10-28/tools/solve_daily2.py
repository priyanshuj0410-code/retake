"""Random search for one level's deck under the format's rules (daily-strip-format.md, section 6).

12 people a level (6 women, 6 men): four cross pairs P1..P4 and four others (two women, two men) whose numbers may
copy a pair's numbers (making a same-gender tie with that pair's member of their gender) or be their own.
Question k's equal two is Pk. Numbers are fixed for the whole level. Prints decks that pass, best first.
Usage: python3 solve_daily2.py easy|medium|hard [samples]
"""
import itertools, random, sys

LEVEL = sys.argv[1] if len(sys.argv) > 1 else 'easy'
N = int(sys.argv[2]) if len(sys.argv) > 2 else 200000
random.seed(7)
import os
MINO = int(os.environ.get('MINO', '1'))
MAXNEW = int(os.environ.get('MAXNEW', '2'))

PLAN = {  # (kind, cards, second tie required)
    'easy':   [('pick', 5, True), ('team2', 5, True), ('pick', 5, True), ('team2', 5, True)],
    'medium': [('pick', 5, True), ('mid', 5, True), ('mid', 5, True), ('pick', 4, False)],
    'hard':   [('midany', 5, True), ('trade', 5, False), ('midany', 5, True), ('midany', 5, False)],
}[LEVEL]
TUP = {
    'easy': [(16, 1), (15, 2), (14, 2), (13, 3), (12, 3), (12, 4), (11, 4), (10, 4), (9, 5), (8, 6), (7, 6), (6, 8)],
    'medium': [(16, 1), (15, 2), (14, 2), (13, 3), (12, 3), (12, 4), (11, 4), (10, 4), (9, 5), (8, 6), (7, 6), (6, 8)],
    'hard': [(17, 5), (16, 4), (9, 1), (8, 0), (15, 2), (14, 2), (13, 3), (12, 3), (12, 4), (11, 4), (10, 4), (9, 5), (7, 6), (6, 8)],
}[LEVEL]

PAIRS = [('P%dw' % i, 'P%dm' % i) for i in range(1, 5)]
EXTRA = ['Xw1', 'Xw2', 'Xm1', 'Xm2']
PEOPLE = [p for pr in PAIRS for p in pr] + EXTRA
SEX = {p: ('w' if 'w' in p else 'm') for p in PEOPLE}


def better(x, y, k):
    return x[0] > y[0] if k == 0 else x[1] < y[1]


def valid_q(kind, cards, pair, T, need_tie):
    w, m = pair
    tw = T[w]
    for x, y in itertools.combinations(cards, 2):
        if {x, y} != {w, m} and SEX[x] != SEX[y] and T[x] == T[y]:
            return False
    others = [c for c in cards if c not in pair]
    tie = any(SEX[x] == SEX[y] and T[x] == T[y] for x, y in itertools.combinations(others, 2))
    if need_tie and not tie:
        return False
    nw = sum(SEX[c] == 'w' for c in cards)
    if len(cards) == 5 and nw not in (2, 3):
        return False
    if len(cards) == 4 and nw != 2:
        return False
    up = [sum(better(T[c], tw, k) for c in others) for k in (0, 1)]
    both = [c for c in others if better(T[c], tw, 0) and better(T[c], tw, 1)]
    if kind == 'pick':
        return up == [0, 0]
    if kind == 'team2':
        return up == [1, 1] and len(both) == 1
    if kind == 'mid':
        return up == [1, 1]
    if kind == 'rank2':
        return up == [2, 2]
    if kind == 'midany':
        return up in ([1, 1], [2, 2])
    if kind == 'trade':
        return up == [1, 1] and not both
    return False


def info(cards, T):
    ranked = sorted(cards, key=lambda c: (-T[c][0], T[c][1]))
    n = len(cards)
    half = {c: ('top' if ranked.index(c) < n / 2 else 'bot') for c in cards}
    worst = T[ranked[-1]]
    return half, {c for c in cards if T[c] == worst}


def score_deck(sets, T):
    seen = {p: [] for p in PEOPLE}
    weak = set()
    new_pair_qs, returning = 0, 0
    for k, cards in enumerate(sets):
        w, m = PAIRS[k]
        if [h for h in seen[w]] != [h for h in seen[m]]:
            return None
        if w in weak or m in weak:
            return None
        new = [c for c in cards if not seen[c]]
        if k > 0:
            if seen[w]:
                returning += 1
            else:
                new_pair_qs += 1
                if len([c for c in new if c not in (w, m)]) < MINO:
                    return None
        half, weakest = info(cards, T)
        for c in cards:
            seen[c].append(half[c])
        weak |= weakest
    counts = [len(v) for v in seen.values()]
    if min(counts) < 1 or max(counts) > 3 or new_pair_qs > MAXNEW:
        return None
    return returning


def sample_T():
    if LEVEL == 'hardfixed':
        pool = [t for t in TUP if t not in ((16, 5), (9, 1))]
        tups = random.sample(pool, 4)
        T = {}
        for (w, m), t in zip(PAIRS, tups):
            T[w] = T[m] = t
        T['Xw1'], T['Xm1'] = (16, 5), (9, 1)
        for x in ('Xw2', 'Xm2'):
            T[x] = random.choice(tups) if random.random() < 0.7 else random.choice(pool)
        return T
    tups = random.sample(TUP, 4)
    T = {}
    for (w, m), t in zip(PAIRS, tups):
        T[w] = T[m] = t
    for x in EXTRA:
        if random.random() < 0.5:
            T[x] = random.choice(tups)
        else:
            T[x] = random.choice(TUP)
    return T


def main():
    found = {}
    for _ in range(N):
        T = sample_T()
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
            if any(len(o) > 400 for o in per):
                continue
            for sets in itertools.product(*per):
                r = score_deck(sets, T)
                if r is not None:
                    key = tuple(sorted(T.items()))
                    if key not in found or found[key][0] < r:
                        found[key] = (r, sets, T)
    best = sorted(found.values(), key=lambda v: -v[0])[:3]
    print('decks found:', len(found))
    for r, sets, T in best:
        print('returning pairs in Q2-Q4:', r)
        print(' numbers:', {p: T[p] for p in PEOPLE})
        for i, c in enumerate(sets, 1):
            print('  Q%d' % i, PLAN[i - 1][0], [(x, T[x]) for x in sorted(c, key=lambda c: (-T[c][0], T[c][1]))])


main()
