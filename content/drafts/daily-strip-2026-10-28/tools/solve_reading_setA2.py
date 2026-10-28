"""Second search for the sample day's Easy set A (proposal-reading.md): E3 fixed to the four people outside the E2
pair; set A's same-sex ties must differ from set B's (Meenal=Farzana, Imran=Deepak)."""
import itertools, random
W = ["Meenal", "Rekha", "Farzana"]; M = ["Sunil", "Imran", "Deepak"]
P = W + M; SEX = {p: ("w" if p in W else "m") for p in P}
E2 = ["Rekha", "Sunil", "Imran", "Deepak"]; E4 = ["Meenal", "Farzana", "Rekha", "Deepak"]
E3 = ["Meenal", "Farzana", "Imran", "Deepak"]
BTIES = [{"Meenal", "Farzana"}, {"Imran", "Deepak"}]
dom = lambda a, b: a[0] >= b[0] and a[1] >= b[1] and a != b
vals = [(a, b) for a in range(1, 8) for b in range(1, 8)]
random.seed(7); shown = 0
for e1x in itertools.combinations([p for p in P if p not in ("Rekha", "Sunil")], 2):
    E1 = ["Rekha", "Sunil", *e1x]
    for E5 in itertools.combinations(P, 4):
        cnt = {p: sum(p in E for E in (E1, E2, E3, E4, E5)) for p in P}
        if not all(3 <= c <= 4 for c in cnt.values()):
            continue
        for hi, lo in itertools.permutations(E3, 2):
            if SEX[hi] == SEX[lo]:
                continue
            rest = [p for p in E3 if p not in (hi, lo)]
            for first, last in itertools.permutations(rest, 2):
                for _ in range(40000):
                    A = {p: random.choice(vals) for p in P}
                    ties = [{x, y} for x, y in itertools.combinations(P, 2) if A[x] == A[y]]
                    if any(SEX[min(t)] != SEX[max(t)] for t in ties) or any(t in BTIES for t in ties):
                        continue
                    bot = [e for e in E1 if e not in ("Rekha", "Sunil")]
                    if not all(dom(A[t], A[b]) for t in ("Rekha", "Sunil") for b in bot):
                        continue
                    h, l = A[hi], A[lo]
                    if not ((h[0] == l[0] and h[1] == l[1] + 1) or (h[1] == l[1] and h[0] == l[0] + 1)):
                        continue
                    if not (dom(A[first], h) and dom(A[first], l) and dom(h, A[last]) and dom(l, A[last])):
                        continue
                    best = [p for p in E5 if all(dom(A[p], A[q]) for q in E5 if q != p)]
                    if len(best) != 1:
                        continue
                    r5 = [q for q in E5 if q != best[0]]
                    if not any(A[x] == A[y] for x, y in itertools.combinations(r5, 2)):
                        continue
                    print("E1", E1, "| E3 first", first, "near", (hi, lo), "last", last, "| E5", list(E5), "best", best[0])
                    print("   A =", A, "ties", ties)
                    shown += 1
                    break
                if shown >= 8:
                    raise SystemExit
print("shown", shown)
