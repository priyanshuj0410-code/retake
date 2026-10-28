"""Single-question checks for the Medium and Hard examples in proposal-player.md (same key: a = Answered, b = Late)."""
import itertools, re
P = {'Geeta': ('w', 37, 13, 3), 'Sanjay': ('m', 35, 13, 3), 'Rekha': ('w', 47, 7, 6), 'Usha': ('w', 49, 7, 6), 'Vikram': ('m', 42, 10, 4),
     'Anita': ('w', 44, 18, 6), 'Ramesh': ('m', 39, 8, 0), 'Meena': ('w', 32, 12, 2), 'Ajay': ('m', 29, 12, 2)}
wc = lambda s: len([x for x in re.split(r'\s+', re.sub(r'[।.,!?:]', ' ', s)) if x])
num = lambda n: P[n][2:]
better = lambda x, y, k: (P[x][2] > P[y][2]) if k == 'a' else (P[x][3] < P[y][3])
EX = {
 'Medium Q4 (pick one, a reason that matters)': ('pick', ('Geeta', 'Sanjay'), ('b', 4), {
   'Geeta': ("Keeps the register at the school office.", 'स्कूल ऑफ़िस का रजिस्टर वही रखती है।'),
   'Sanjay': ("Has the lineman's number in his phone.", 'लाइनमैन का नंबर उसके फ़ोन में है।'),
   'Rekha': ('Gossips at the ration queue every week.', 'राशन की लाइन में हर हफ़्ते गपशप।'),
   'Vikram': ('Weighs parcels at the courier counter.', 'कूरियर काउंटर पर पार्सल तौलता है।')}),
 'Hard Q2 (pick a team, the two in the middle, a note on each)': ('team', ('Meena', 'Ajay'), ('b', 2), {
   'Anita': ('Packs orders at the courier office.', 'कूरियर ऑफ़िस में ऑर्डर पैक करती।'),
   'Ramesh': ('Cooks lunch at the hospital canteen.', 'अस्पताल की कैंटीन में खाना बनाता।'),
   'Meena': ('Too soft to ever say no.', 'कभी ना नहीं कह पाती, बहुत नरम।'),
   'Ajay': ("Snaps at everyone when he's tired.", 'थकने पर सब पर भड़क जाता है।'),
   'Usha': ('Talks right through every film on TV.', 'टीवी की हर फ़िल्म में बोलती रहती।')}),
}
for t, (kind, (w, m), (k, th), notes) in EX.items():
    cards = list(notes); others = [c for c in cards if c not in (w, m)]; f = []
    if num(w) != num(m) or abs(P[w][1] - P[m][1]) > 8: f.append('pair')
    for x, y in itertools.combinations(cards, 2):
        if {x, y} != {w, m} and P[x][0] != P[y][0] and num(x) == num(y): f.append(f'second w-m tie {x}/{y}')
    if kind == 'pick' and any(better(c, w, q) for c in others for q in 'ab'): f.append('beaten')
    if kind == 'team':
        for q in 'ab':
            if sum(better(c, w, q) for c in others) != 1: f.append(f'not exactly one above on {q}')
        top2 = sorted(cards, key=lambda c: (-P[c][2], P[c][3]))[:2]
        if set(top2) == {w, m}: f.append('pair are the top two')
    meets = lambda c: P[c][2] >= th if k == 'a' else P[c][3] <= th
    if not meets(w): f.append('bar above pair')
    for i in (0, 1):
        L = {c: wc(notes[c][i]) for c in cards}
        if max(L.values()) - min(L.values()) > 2 or L[w] != L[m]: f.append(f'notes {"en hi".split()[i]} {L}')
    print(t, '| misses:', [c for c in cards if not meets(c)], '| sexes:', ''.join(P[c][0] for c in cards), '| FAILS:', f or 'none')
