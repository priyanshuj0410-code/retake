"""Search card sets for one level of a daily under the format's deck rules (daily-strip-format.md, section 6).

People sit in tuple groups: four cross pairs P1..P4 (a woman and a man with the same numbers) and two same-gender
groups (two women, two men). Numbers are fixed for the whole level. Question k's equal two is pair Pk.
Usage: python3 solve_daily.py easy|medium|hard
"""
import itertools, sys, os
RELAX = set(os.environ.get('RELAX', '').split(','))
MINO = int(os.environ.get('MINO', '2'))
MAXNP = int(os.environ.get('MAXNP', '1'))

LEVEL = sys.argv[1] if len(sys.argv) > 1 else 'easy'

# kinds and sizes per level; 'pick' = pair best on both numbers; 'team2' = exactly one card above the pair on each
# number and the pair compete for the second seat; 'mid' = pair below the top with exactly one card above on each
# number (rank, checks, team of 2); 'mid2' = pair below the top, two cards above on the first number (team of 3 / rank)
PLAN = {
    'easy':   [('pick', 5), ('team2', 5), ('pick', 5), ('team2', 5)],
    'medium': [('pick', 5), ('mid', 5), ('mid', 5), ('pick', 4)],
    'hard':   [('mid', 5), ('trade', 5), ('mid', 5), ('pick', 5)],
}[LEVEL]

GROUPS = ['P1', 'P2', 'P3', 'P4', 'SW', 'SM']
MEMBERS = {g: [g + 'w', g + 'm'] for g in GROUPS[:4]}
MEMBERS['SW'] = ['SWa', 'SWb']
MEMBERS['SM'] = ['SMa', 'SMb']
SEX = {p: ('w' if p.endswith('w') or p.startswith('SW') else 'm') for g in GROUPS for p in MEMBERS[g]}
PEOPLE = [p for g in GROUPS for p in MEMBERS[g]]
GROUP = {p: g for g in GROUPS for p in MEMBERS[g]}

CAND = {
    'easy': [(16, 1), (14, 2), (13, 3), (12, 3), (12, 4), (10, 4), (9, 5), (7, 6), (6, 8)],
    'medium': [(16, 1), (15, 2), (13, 2), (13, 3), (11, 3), (11, 4), (10, 4), (9, 5), (7, 6)],
    'hard': [(18, 6), (8, 0), (14, 2), (12, 2), (12, 3), (10, 3), (9, 4), (7, 5), (6, 7)],
}[LEVEL]


def above(x, y, k):  # x strictly better than y on number k
    return x[0] > y[0] if k == 0 else x[1] < y[1]


def rank_key(t):
    return (-t[0], t[1])


def valid_q(kind, cards, pair, T):
    w, m = pair
    tw = T[GROUP[w]]
    nums = {c: T[GROUP[c]] for c in cards}
    # exactly one woman-and-man tie: the pair
    for x, y in itertools.combinations(cards, 2):
        if {x, y} != {w, m} and SEX[x] != SEX[y] and nums[x] == nums[y]:
            return False
    others = [c for c in cards if c not in pair]
    if not any(SEX[x] == SEX[y] and nums[x] == nums[y] for x, y in itertools.combinations(others, 2)):
        return False
    sexes = [SEX[c] for c in cards]
    if len(cards) == 5 and sorted(sexes) not in (['m', 'm', 'w', 'w', 'w'], ['m', 'm', 'm', 'w', 'w']):
        return False
    if len(cards) == 4 and sexes.count('w') not in (1, 3):
        return False
    up = [sum(above(nums[c], tw, k) for c in others) for k in (0, 1)]
    if kind == 'pick' and up != [0, 0]:
        return False
    if kind in ('team2', 'mid') and up != [1, 1]:
        return False
    if kind == 'team2':  # clear numbers: the one above is the same card on both numbers
        tops = [c for c in others if above(nums[c], tw, 0) and above(nums[c], tw, 1)]
        if len(tops) != 1:
            return False
    if kind == 'trade':  # one card above on the first number only, another on the second only (the Hard trap)
        if up != [1, 1]:
            return False
        if any(above(nums[c], tw, 0) and above(nums[c], tw, 1) for c in others):
            return False
    return True


def halves(cards, T):
    ranked = sorted(cards, key=lambda c: rank_key(T[GROUP[c]]))
    n = len(cards)
    h = {}
    for c in cards:
        i = ranked.index(c)
        h[c] = 'top' if i < n / 2 else 'bottom'
    worst = T[GROUP[ranked[-1]]]
    weakest = {c for c in cards if T[GROUP[c]] == worst}
    return h, weakest


def deck_ok(sets, T):
    seen = {p: [] for p in PEOPLE}
    weak_before = set()
    new_pair_qs = 0
    for k, cards in enumerate(sets):
        g = GROUPS[k]
        w, m = MEMBERS[g]
        if 'hist' not in RELAX and [x for _, x in seen[w]] != [x for _, x in seen[m]]:
            return False
        if 'weak' not in RELAX and (w in weak_before or m in weak_before):
            return False
        new = [c for c in cards if not seen[c]]
        new_pair = [c for c in (w, m) if not seen[c]]
        if k > 0 and new_pair and 'new' not in RELAX:
            new_pair_qs += 1
            if len([c for c in new if c not in (w, m)]) < MINO:
                return False
        h, weakest = halves(cards, T)
        for c in cards:
            seen[c].append((k, h[c]))
        weak_before |= weakest
    if new_pair_qs > MAXNP:
        return False
    counts = [len(v) for v in seen.values()]
    if min(counts) < 1 or max(counts) > 3:
        return False
    # no person in a pair and on the very next question's cards as a same-number partner issue is handled by valid_q
    return True


def main():
    best = []
    tuples = [t for t in CAND]
    for P in itertools.permutations(tuples, 6):
        T = dict(zip(GROUPS, P))
        # pair numbers differ (permutation guarantees), keep Easy's numbers in a clear chain except the trap
        per_q = []
        ok = True
        for k, (kind, size) in enumerate(PLAN):
            pair = tuple(MEMBERS[GROUPS[k]])
            rest = [p for p in PEOPLE if p not in pair]
            opts = []
            for extra in itertools.combinations(rest, size - 2):
                cards = list(pair) + list(extra)
                if valid_q(kind, cards, pair, T):
                    opts.append(cards)
            if not opts:
                ok = False
                break
            per_q.append(opts)
        if not ok:
            continue
        for sets in itertools.product(*per_q):
            if deck_ok(sets, T):
                best.append((T, sets))
                if len(best) >= 3:
                    for T_, s_ in best:
                        print(T_)
                        for i, c in enumerate(s_, 1):
                            print(' Q%d' % i, [(x, T_[GROUP[x]]) for x in c])
                    return
    print('found', len(best))


main()
