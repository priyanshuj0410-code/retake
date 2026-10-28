import itertools, sys, collections
sys.argv=['x','hard']
exec(open('solve_daily2.py').read().replace('\nmain()\n','\n'))
PLAN = [('midany', 5, True), ('trade', 5, False), ('midany', 5, True), ('mid', 5, False)]
PT = [(15, 2), (14, 2), (13, 3), (12, 3), (11, 4), (10, 4), (9, 5)]
OWN = [(17, 5), (8, 1), (7, 6), (6, 8)]
C=collections.Counter()
def why(sets,T):
    seen={p:[] for p in PEOPLE}; weak=set()
    for k,cards in enumerate(sets):
        w,m=PAIRS[k]
        if seen[w]!=seen[m]: return 'hist'
        if w in weak or m in weak: return 'weak'
        new=[c for c in cards if not seen[c]]
        if k>0 and not seen[w] and len([c for c in new if c not in (w,m)])<1: return 'new'
        half,wk=info(cards,T)
        for c in cards: seen[c].append(half[c])
        weak|=wk
    counts=[len(v) for v in seen.values()]
    if min(counts)<1: return 'unseen'
    if max(counts)>3: return 'over3'
    return 'ok'
import random
random.seed(3)
allp=list(itertools.permutations(PT,4))
for tups in random.sample(allp,100):
    base={}
    for (w,m),t in zip(PAIRS,tups): base[w]=base[m]=t
    for ex in itertools.product(list(tups)+OWN, repeat=4):
        T=dict(base); T.update(zip(EXTRA,ex))
        per=[]
        for k,(kind,size,tie) in enumerate(PLAN):
            pair=PAIRS[k]; rest=[p for p in PEOPLE if p not in pair]
            opts=[list(pair)+list(e) for e in itertools.combinations(rest,size-2) if valid_q(kind,list(pair)+list(e),pair,T,tie)]
            if not opts: C['noopt%d'%(k+1)]+=1; break
            per.append(opts)
        else:
            for sets in itertools.product(*per):
                C[why(sets,T)]+=1
print(C)
