"""Checks the sample day's Easy deck and screen word counts (proposal-player.md).

Numbers: a = Answered (of Shobha's last 20 calls, higher is better), b = Late (times late for a lane job this
year, lower is better). Every person keeps the same numbers all evening, at every level.
"""
import itertools, re

P = {  # name: (sex, age, a, b, marked)
    'Sunita': ('w', 40, 14, 2, False), 'Deepak': ('m', 43, 14, 2, False),
    'Kavya': ('w', 31, 12, 3, False), 'Rohit': ('m', 27, 12, 3, False),
    'Farida': ('w', 34, 16, 1, True), 'Imran': ('m', 36, 16, 1, True),
    'Jyoti': ('w', 28, 9, 5, False), 'Manoj': ('m', 33, 9, 5, False),
    'Neeta': ('w', 45, 7, 6, False), 'Lalita': ('w', 51, 7, 6, False),
    'Suresh': ('m', 38, 6, 8, False), 'Salim': ('m', 41, 6, 8, True),
}

# kind, cards, equal two, nudged, bar (number, threshold), notes {name: (note_en, note_hi, voice or None, kind)}
Q = [
    ('pick', ['Sunita', 'Deepak', 'Neeta', 'Manoj'], ('Sunita', 'Deepak'), 'Deepak', ('a', 12), {
        'Sunita': ('Counts cash at the bank counter.', 'बैंक काउंटर पर नक़दी गिनती है।', None, 'plain'),
        'Deepak': ("Moody till he's had his dinner.", 'खाना खाने तक उसका मूड ख़राब।', 'Hari', 'judging'),
        'Neeta': ('Sulks when her serial gets cut.', 'सीरियल कटे तो मुँह फुला लेती।', 'Shobha', 'judging'),
        'Manoj': ('Sells tickets at the bus depot counter.', 'बस डिपो के काउंटर पर टिकट बेचता।', None, 'plain')}),
    ('team', ['Deepak', 'Kavya', 'Rohit', 'Neeta', 'Lalita'], ('Kavya', 'Rohit'), 'Kavya', ('b', 3), {
        'Deepak': ('Sorts letters at the post office.', 'डाकघर में चिट्ठियाँ छाँटता है।', None, 'plain'),
        'Kavya': ('Bossy with every one of her cousins.', 'अपने सब कज़िन पर हुक्म चलाती है।', 'Shobha', 'judging'),
        'Rohit': ('Works the counter at a sweet shop.', 'मिठाई की दुकान पर काउंटर संभालता है।', None, 'plain'),
        'Neeta': ('Lost her mother just last winter.', 'पिछली सर्दी में माँ चल बसीं।', None, 'heavy'),
        'Lalita': ("Can't watch a sad film without tissues.", 'उदास फ़िल्म बिना रुमाल के नहीं देखती।', 'Hari', 'judging')}),
    ('pick', ['Farida', 'Imran', 'Jyoti', 'Suresh'], ('Farida', 'Imran'), 'Imran', ('a', 13), {
        'Farida': ('Works the late shift at the chemist.', 'केमिस्ट की दुकान पर देर की शिफ़्ट।', None, 'plain'),
        'Imran': ('Goes red the moment you tease him.', 'ज़रा छेड़ो तो लाल हो जाता है।', 'Shobha', 'judging'),
        'Jyoti': ('Teaches Class 2 at the government school.', 'सरकारी स्कूल में दूसरी कक्षा को पढ़ाती है।', None, 'plain'),
        'Suresh': ('Throws the carrom striker when he loses.', 'हारने पर कैरम का स्ट्राइकर फेंक देता।', 'Hari', 'judging')}),
    ('team', ['Farida', 'Jyoti', 'Manoj', 'Suresh', 'Salim'], ('Jyoti', 'Manoj'), 'Jyoti', ('b', 5), {
        'Farida': ("Opens the chemist's shutter every morning.", 'रोज़ सुबह केमिस्ट का शटर खोलती है।', None, 'plain'),
        'Jyoti': ('Too emotional, cries at every wedding.', 'बहुत भावुक, हर शादी में रोती है।', 'Hari', 'judging'),
        'Manoj': ('Sells tickets at the bus depot.', 'बस डिपो पर रोज़ टिकट बेचता है।', None, 'plain'),
        'Suresh': ('Runs the billing desk at the hospital.', 'अस्पताल में बिलिंग डेस्क संभालता है।', None, 'plain'),
        'Salim': ('Combs his hair ten times a day.', 'दिन में दस बार बाल सँवारता है।', 'Shobha', 'judging')}),
]

wc = lambda s: len([x for x in re.split(r'\s+', re.sub(r'[।.,!?:]', ' ', s)) if x])
num = lambda n: (P[n][2], P[n][3])
better = lambda x, y, k: (P[x][2] > P[y][2]) if k == 'a' else (P[x][3] < P[y][3])
fails, seen_pairs, weakest_before, appear = [], set(), set(), {n: [] for n in P}

for i, (kind, cards, two, nudged, bar, notes) in enumerate(Q, 1):
    w, m = two
    t = f'Q{i}'
    if P[w][0] != 'w' or P[m][0] != 'm' or num(w) != num(m): fails.append(f'{t}: equal two not a tied woman and man')
    if abs(P[w][1] - P[m][1]) > 8: fails.append(f'{t}: ages more than 8 apart')
    if P[w][4] != P[m][4]: fails.append(f'{t}: community marking differs inside the pair')
    for x, y in itertools.combinations(cards, 2):
        if {x, y} != {w, m} and P[x][0] != P[y][0] and num(x) == num(y): fails.append(f'{t}: second woman-man tie {x}/{y}')
    others = [c for c in cards if c not in two]
    same_tie = any(P[x][0] == P[y][0] and num(x) == num(y) for x, y in itertools.combinations(others, 2))
    sexes = [P[c][0] for c in cards]
    if kind == 'pick':
        if any(better(c, w, k) for c in others for k in 'ab'): fails.append(f'{t}: someone beats the pair in a pick one')
        if sexes.count('w') != 2: fails.append(f'{t}: pick one is not two women and two men')
    else:
        for k in 'ab':
            if sum(better(c, w, k) for c in others) != 1: fails.append(f'{t}: not exactly one card above the pair on {k}')
        if not same_tie: fails.append(f'{t}: team has no same-gender second tie')
        if sorted(sexes) not in (['m', 'm', 'w', 'w', 'w'], ['m', 'm', 'm', 'w', 'w']): fails.append(f'{t}: team not 3:2')
    # rule 17: matched earlier appearances, and nobody weakest earlier sits in a later pair
    if [h for _, h in appear[w]] != [h for _, h in appear[m]] or [n for n, _ in appear[w]] != [n for n, _ in appear[m]] and len(appear[w]) != len(appear[m]):
        fails.append(f'{t}: pair earlier appearances differ {appear[w]} / {appear[m]}')
    for p in two:
        if p in weakest_before: fails.append(f'{t}: {p} was weakest earlier')
    if num(w) in seen_pairs: fails.append(f'{t}: a pair\'s numbers return')
    seen_pairs.add(num(w))
    # bar at or below the pair; who misses
    k, th = bar
    meets = lambda c: P[c][2] >= th if k == 'a' else P[c][3] <= th
    if not meets(w): fails.append(f'{t}: bar above the pair')
    miss = [c for c in cards if not meets(c)]
    # notes
    lens_en = {c: wc(notes[c][0]) for c in cards}
    lens_hi = {c: wc(notes[c][1]) for c in cards}
    for lang, L in (('en', lens_en), ('hi', lens_hi)):
        if max(L.values()) - min(L.values()) > 2: fails.append(f'{t}: {lang} notes differ by more than 2 words {L}')
        if L[w] != L[m]: fails.append(f'{t}: {lang} pair notes differ in length {L[w]}/{L[m]}')
    if notes[w][0].split()[0] == notes[m][0].split()[0]: fails.append(f'{t}: pair notes share an opening word')
    if notes[nudged][3] != 'judging': fails.append(f'{t}: nudge is not a judging note')
    if not any(notes[c][3] == 'judging' for c in others): fails.append(f'{t}: no decoy of the nudge kind')
    longest_on_pair = lens_en[w] == max(lens_en.values())
    ranked = sorted(cards, key=lambda c: (-P[c][2], P[c][3]))
    weakest = [c for c in cards if num(c) == num(ranked[-1])]
    half = {c: ('top' if ranked.index(c) < len(cards) / 2 else 'bottom') for c in cards}
    for c in cards:
        if c not in two: appear[c].append((t, half[c]))
    weakest_before.update(weakest)
    print(f'{t} {kind:4} two={w}/{m} {num(w)} nudge={nudged} bar {k}{"≥" if k=="a" else "≤"}{th} misses={miss} '
          f'second-tie={same_tie} notes en={list(lens_en.values())} hi={list(lens_hi.values())} longest-on-pair={longest_on_pair}')

misses = [c for (kind, cards, two, nudged, (k, th), notes) in Q for c in cards
          if not (P[c][2] >= th if k == 'a' else P[c][3] <= th)]
print('misses by sex:', {s: sum(P[c][0] == s for c in misses) for s in 'wm'})
voices = [n[2] for (_, _, _, _, _, notes) in Q for n in notes.values() if n[2]]
print('judging-note voices:', {v: voices.count(v) for v in set(voices)})
print('appearances:', {n: len([1 for q in Q if n in q[1]]) for n in P})
print('FAILS:', fails or 'none')

# Screen word counts (counted: everything but names, kinship names used as names, numbers and times)
NAMES = set(P) | {'Shobha', 'Aunty', 'Hari', 'Chacha'}
def count(*parts):
    words = [x for p in parts for x in re.findall(r"[A-Za-z'’]+", p)]
    return len([x for x in words if x.rstrip("'s").rstrip('’s') not in NAMES and x not in NAMES and x.lower() not in ('pm', 'am')])
S = {
    'Cover': ['Day', 'The lights went at 8', 'Easy Medium Hard', '8 pm. About 2 minutes.', 'Play'],
    'E1 the lane': ['8:05 pm. Lights out. The whole lane is outside.', 'Next'],
    'E2 at your door (first meeting, labels)': ["Lights gone. You're on my list.", 'Third time this week!', 'Okay. What first?',
                                                "Shobha Aunty, keeps the lane's keys", 'Hari Chacha, next door', 'Next'],
    'E2 later Mondays (no labels)': ["Lights gone. You're on my list.", 'Third time this week!', 'Okay. What first?', 'Next'],
    'E3 the list': ['Before nine', 'Office call', 'Candle money', 'One plug', 'Two lamps', 'First job'],
    'Q1 (live button)': ["Office line's open. Who speaks for the lane?", 'Answered Late', 'Sunita makes the call'],
    'Q2 (wait button)': ['Shop shuts at 8:30. Two collect the candle money.', 'Answered Late', 'Pick 2 more'],
    'Q2 (live button)': ['Shop shuts at 8:30. Two collect the candle money.', 'Answered Late', 'Send Deepak and Kavya'],
    'Q3 (live button)': ['One free plug at the shop. Whose phone goes in?', 'Answered Late', "Charge Farida's phone"],
    'Q4 (live button)': ['Two lamps for the night. Who keeps them?', 'Answered Late', 'Lamps to Farida and Jyoti'],
    'Stamp beat': ['Office call: settled', 'Next job'],
    'E4 midway': ['8:35 pm.', 'Radio says two more hours.', 'It says that every time.', 'Next job'],
    'E5 outcome': ['All set: 9:00', '9:00 pm. A candle in every window.', 'khan', 'Next'],
    'E6 reaction, band A': ["Nine sharp. Chai's on my step.", 'Chai, then.', 'See today'],
    'E6 reaction, band C': ["Quarter to ten. Chai's ready anyway.", 'Chai, then.', 'See today'],
    'Result': ['Easy', 'Before nine: 4 of 4 on time', 'Day 1, 1 day running', 'Medium: 9 pm, still dark', 'Back to today'],
    'Done cover (all three played)': ['Day', 'The lights went at 8', 'Easy Medium Hard', 'Next puzzle in 3 h', 'Tomorrow, 7 am: the school bus'],
}
for k, v in S.items():
    print(f'{count(*v):3}  {k}')
