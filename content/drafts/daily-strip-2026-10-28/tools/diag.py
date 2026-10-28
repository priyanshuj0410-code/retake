import sys, itertools, random, collections
sys.argv=['x','hard','60000']
src=open('solve_daily2.py').read().replace('\nmain()\n','\n')
exec(src)
C=collections.Counter()
def score2(sets,T):
    seen={p:[] for p in PEOPLE}; weak=set()
    for k,cards in enumerate(sets):
        w,m=PAIRS[k]
        if seen[w]!=seen[m]: return 'hist'
        if w in weak or m in weak: return 'weak'
        new=[c for c in cards if not seen[c]]
        if k>0 and not seen[w] and len([c for c in new if c not in (w,m)])<2: return 'new'
        half,wk=info(cards,T)
        for c in cards: seen[c].append(half[c])
        weak|=wk
    counts=[len(v) for v in seen.values()]
    if min(counts)<1: return 'unseen'
    if max(counts)>3: return 'over3'
    return 'ok'
for _ in range(60000):
    T=sample_T(); per=[]
    for k,(kind,size,tie) in enumerate(PLAN):
        pair=PAIRS[k]; rest=[p for p in PEOPLE if p not in pair]
        opts=[list(pair)+list(e) for e in itertools.combinations(rest,size-2) if valid_q(kind,list(pair)+list(e),pair,T,tie)]
        if not opts: C['noopt%d'%(k+1)]+=1; break
        per.append(opts)
    else:
        C['allopts']+=1
        for sets in itertools.product(*per):
            C[score2(sets,T)]+=1
print(C)
