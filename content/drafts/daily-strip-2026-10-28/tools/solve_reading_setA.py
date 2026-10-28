"""Search set A numbers and card sets for Easy E1, E3, E5 of the sample day (proposal-reading.md).
E2 and E4 use set B (fixed). P1 = Rekha, Sunil (the E2 pair).
E1: team 2 of 4, P1 both picked (top half, neither weakest), the other two clearly below.
E3: rank 4, top 2 seated: a clear 1st, a woman-man near pair (one apart on one number) at 2nd/3rd, a clear 4th.
E5: pick 1 of 4: a clear best, and a same-sex tie among the others.
Set A: no woman-man exact tie anywhere. Each person 3-4 appearances over E1..E5."""
import itertools

W = ["Meenal", "Rekha", "Farzana"]; M = ["Sunil", "Imran", "Deepak"]
P = W + M; SEX = {p: ("w" if p in W else "m") for p in P}
E2 = ["Rekha", "Sunil", "Imran", "Deepak"]; E4 = ["Meenal", "Farzana", "Rekha", "Deepak"]

def dom(a, b):  # a clearly above b: >= on both, > on at least one
    return a[0] >= b[0] and a[1] >= b[1] and a != b

def solve():
    out = []
    others = [p for p in P if p not in ("Rekha", "Sunil")]
    for e1x in itertools.combinations(others, 2):
        E1 = ["Rekha", "Sunil", *e1x]
        for E3 in itertools.combinations(P, 4):
            for E5 in itertools.combinations(P, 4):
                cnt = {p: (p in E1) + (p in E2) + (p in E3) + (p in E4) + (p in E5) for p in P}
                if not all(3 <= c <= 4 for c in cnt.values()):
                    continue
                out.append((E1, list(E3), list(E5)))
    return out

vals = [(a, b) for a in range(1, 8) for b in range(1, 8)]
found = 0
for E1, E3, E5 in solve():
    # near-pair candidates in E3
    for near in itertools.permutations(E3, 2):
        hi, lo = near
        if SEX[hi] == SEX[lo] or {hi, lo} == {"Rekha", "Sunil"}:
            continue
        rest = [p for p in E3 if p not in near]
        for first, last in itertools.permutations(rest, 2):
            # assign numbers greedily by brute force over a small grid for the 6 people
            for A in ([dict(zip(P, combo)) for combo in []]):
                pass
            # build candidate value sets smartly: enumerate per person
            def ok(A):
                if any(A[x] == A[y] and SEX[x] != SEX[y] for x, y in itertools.combinations(P, 2)):
                    return False
                top = ["Rekha", "Sunil"]; bot = list(e for e in E1 if e not in top)
                if not all(dom(A[t], A[b]) for t in top for b in bot):
                    return False
                h, l = A[hi], A[lo]
                if not ((h[0] == l[0] and h[1] == l[1] + 1) or (h[1] == l[1] and h[0] == l[0] + 1)):
                    return False
                if not (dom(A[first], h) and dom(A[first], l) and dom(h, A[last]) and dom(l, A[last])):
                    return False
                best = [p for p in E5 if all(dom(A[p], A[q]) for q in E5 if q != p)]
                if len(best) != 1:
                    return False
                rest5 = [q for q in E5 if q != best[0]]
                if not any(A[x] == A[y] and SEX[x] == SEX[y] for x, y in itertools.combinations(rest5, 2)):
                    return False
                return True
            yield_ = None
            import random
            random.seed(1)
            for _ in range(20000):
                A = {p: random.choice(vals) for p in P}
                if ok(A):
                    print("E1", E1, "E3", E3, "near", near, "first", first, "last", last, "E5", E5)
                    print("   A =", A)
                    found += 1
                    break
            if found >= 6:
                raise SystemExit
print("found", found)
