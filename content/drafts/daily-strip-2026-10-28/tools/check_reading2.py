"""Checks the Easy level of the sample day in proposal-reading.md: ties, the pair, the near pair,
note lengths, chorus balance, appearances, and counted words per beat and per decision screen."""
import itertools, re

NAMES = {"Sarla", "Kishore", "Nusrat", "Meenal", "Rekha", "Farzana", "Sunil", "Imran", "Deepak",
         "Kishore's", "Sarla's", "किशोर", "सरला", "नुसरत"}
SEX = {"Meenal": "w", "Rekha": "w", "Farzana": "w", "Sunil": "m", "Imran": "m", "Deepak": "m"}
A = {"Meenal": (1, 2), "Rekha": (7, 6), "Farzana": (2, 4), "Sunil": (6, 5), "Imran": (3, 4), "Deepak": (6, 5)}
B = {"Meenal": (9, 0), "Farzana": (9, 0), "Rekha": (7, 1), "Sunil": (7, 1), "Imran": (5, 2), "Deepak": (5, 2)}

Q = {
 "E1": ("A", "team2", {
   "Rekha": (None, "Billing counter at the grocery.", "किराने की दुकान पर बिलिंग।"),
   "Sunil": (None, "Counter at the chemist's shop.", "केमिस्ट की दुकान पर काउंटर।"),
   "Meenal": ("Nusrat", "Up since five, poor thing.", "पाँच बजे से जगी है, बेचारी।"),
   "Farzana": (None, "Teaches at a coaching class.", "कोचिंग क्लास में पढ़ाती है।")}, "steady"),
 "E2": ("B", "pick1", {
   "Rekha": (None, "Grows chillies on her balcony.", "बालकनी में मिर्चें उगाती है।"),
   "Sunil": ("Kishore", "Moody, that one. Ask anyone.", "मूडी है वो, सब जानते।"),
   "Imran": (None, "Plays carrom every Sunday night.", "हर इतवार रात कैरम खेलता है।"),
   "Deepak": ("Nusrat", "Sulks if you correct him.", "टोको तो मुँह फुला लेता है।")}, "measured"),
 "E3": ("A", "rank_top2", {
   "Deepak": (None, "Photocopy counter by the bank.", "बैंक के पास फ़ोटोकॉपी काउंटर।"),
   "Imran": (None, "Cooks for a tiffin service.", "टिफ़िन सर्विस का खाना बनाता।"),
   "Farzana": ("Nusrat", "Works so hard, that girl.", "बड़ी मेहनती है ये लड़की।"),
   "Meenal": (None, "Counter at the post office.", "डाकघर में काउंटर पर।")}, "trap"),
 "E4": ("B", "team2", {
   "Meenal": ("Kishore", "Bossy, that one. Always was.", "हुक्म चलाती है। हमेशा से।"),
   "Farzana": (None, "Feeds the street's stray dogs.", "गली के कुत्तों को खिलाती है।"),
   "Rekha": (None, "Walks to work, rain or shine.", "धूप हो या बारिश, पैदल जाती।"),
   "Deepak": (None, "New in the street since May.", "मई से इस गली में आया।")}, "steady (return slot)"),
 "E5": ("A", "pick1", {
   "Rekha": ("Kishore", "Hours on the phone, daily.", "रोज़ घंटों फ़ोन पर रहती है।"),
   "Sunil": ("Nusrat", "Mended my sewing machine. Kind.", "मेरी मशीन ठीक की, भला है।"),
   "Deepak": (None, "Fixes his own scooter, mostly.", "स्कूटर ख़ुद ही ठीक करता है।"),
   "Imran": ("Kishore", "Pays on time. Only one.", "टाइम पर पैसे बस यही देता।")}, "steady"),
}
SETS = {"A": A, "B": B}

def words(s):
    toks = [t.strip(".,!?·:;।'\"") for t in s.split()]
    return [t for t in toks if t and not re.fullmatch(r"[\d:.]+", t) and t not in NAMES]

print("== ties per set (whole circle)")
for k, S in SETS.items():
    for x, y in itertools.combinations(S, 2):
        if S[x] == S[y]:
            print(f"  set {k}: {x}={y} {S[x]} {'W-M' if SEX[x] != SEX[y] else 'same-sex'}")

print("== per question")
seen = {}
for q, (st, kind, cards, role) in Q.items():
    S = SETS[st]
    ppl = list(cards)
    ties = [(x, y) for x, y in itertools.combinations(ppl, 2) if S[x] == S[y]]
    wm = [t for t in ties if SEX[t[0]] != SEX[t[1]]]
    en = [len(words(c[1])) for c in cards.values()]
    hi = [len(words(c[2])) for c in cards.values()]
    sexes = "".join(SEX[p] for p in ppl)
    nums = {p: S[p] for p in ppl}
    print(f"  {q} {kind:9} set {st} {role:22} {nums} ties={ties} W-M={wm} "
          f"{sexes.count('w')}w{sexes.count('m')}m EN={en} (spread {max(en)-min(en)}) HI={hi} (spread {max(hi)-min(hi)})")
    for p in ppl:
        seen.setdefault(p, []).append(q)

print("== appearances", {p: len(v) for p, v in seen.items()}, "total", sum(len(v) for v in seen.values()))

print("== chorus remarks")
tally = {}
for q, (_, _, cards, _) in Q.items():
    for p, (v, en, _) in cards.items():
        if v:
            tally.setdefault(v, []).append((q, p, SEX[p]))
for v, rows in tally.items():
    print(f"  {v}: {rows}  women={sum(r[2]=='w' for r in rows)} men={sum(r[2]=='m' for r in rows)}")

BEATS = [
 ("Cover", ["Lights out", "Easy Medium Hard", "Play"], ["बत्ती गुल", "आसान मध्यम कठिन", "खेलें"]),
 ("L-01", ["9:10 am. The corner transformer.", "phat!"], ["सुबह 9:10। नुक्कड़ का ट्रांसफ़ॉर्मर।", "फट!"]),
 ("L-02a", ["Lineman by noon. Till then, the lane's yours.", "Okay. What's first?"],
           ["लाइनमैन दोपहर तक। तब तक गली तुम्हारे हाथ में।", "ठीक है। पहले क्या?"]),
 ("L-03", ["Third cut this month. Typical.", "Chai? My gas is fine."],
          ["इस महीने तीसरी बार। हमेशा यही।", "चाय? मेरी गैस ठीक है।"]),
 ("L-04 circle", ["9:30 am. Outside Kishore's.", "By 1 pm: power where it's needed", "Cash and keys: nothing missing"],
                 ["सुबह 9:30। किशोर के यहाँ।", "1 बजे तक: जहाँ ज़रूरत, वहाँ बिजली", "पैसे और चाबियाँ: कुछ कम नहीं"]),
 ("E1 screen", ["Day", "Kishore's two sockets. Who charges first?", "Calls Hours home", "Charge them first"],
               ["दिन", "किशोर के दो सॉकेट। पहले चार्ज कौन करे?", "कॉल घर पर", "इन्हें चार्ज दें"]),
 ("L-06 lead-in", ["Sockets: settled", "Lineman's tea, the diesel. All from this box."],
                  ["सॉकेट: तय", "लाइनमैन की चाय, डीज़ल। इसी डिब्बे से।"]),
 ("E2 screen", ["Day", "Who keeps the lane's cash box today?", "Times held Times short", "Hand it over"],
               ["दिन", "आज गली का कैश बॉक्स कौन रखे?", "कितनी बार रखा कितनी बार कम", "डिब्बा सौंपें"]),
 ("L-03 lead-in", ["Cash box: settled", "My back room has the fan. Two chairs.", "Just two, mind. No fighting."],
                  ["कैश बॉक्स: तय", "पीछे के कमरे में पंखा है। दो कुर्सियाँ।", "सिर्फ़ दो, याद रहे। झगड़ा नहीं।"]),
 ("E3 screen", ["Day", "Two chairs under the fan. Rank all four.", "Calls Hours home", "Seat the top two"],
               ["दिन", "पंखे के नीचे दो कुर्सियाँ। चारों का क्रम लगाओ।", "कॉल घर पर", "ऊपर के दो बिठाएँ"]),
 ("L-08 lead-in", ["Chairs: settled", "Committee room opens at four. Two key sets."],
                  ["कुर्सियाँ: तय", "कमेटी रूम चार बजे खुलता है। चाबी के दो सेट।"]),
 ("E4 screen", ["Day", "Two key sets. Who keeps them?", "Times held Times short", "Hand them over"],
               ["दिन", "चाबी के दो सेट। कौन रखे?", "कितनी बार रखा कितनी बार कम", "चाबियाँ सौंपें"]),
 ("L-05 lead-in", ["Keys: settled", "Last thing: the inverter's spare point."],
                  ["चाबियाँ: तय", "आख़िरी बात: इन्वर्टर का बचा पॉइंट।"]),
 ("E5 screen", ["Day", "One plug point on the inverter. Who gets it?", "Calls Hours home", "Plug them in"],
               ["दिन", "इन्वर्टर का बचा पॉइंट। किसे मिले?", "कॉल घर पर", "इन्हें लगाने दें"]),
 ("Outcome stamp", ["1 pm: power where it was needed.", "Cash and keys: nothing missing.", "thak!"],
                   ["1 बजे: जहाँ ज़रूरत थी, वहाँ बिजली।", "पैसे और चाबियाँ: कुछ कम नहीं।", "ठक!"]),
 ("Outcome Sarla", ["Lineman's up the pole. Go and eat."], ["लाइनमैन खंभे पर है। जाकर कुछ खा लो।"]),
 ("Result", ["Lights out Easy", "Power where needed: 5 of 5", "Nothing missing: 3 of 3", "Day", "Back to today"],
            ["बत्ती गुल आसान", "ज़रूरत पर बिजली: 5 में से 5", "कुछ कम नहीं: 3 में से 3", "दिन", "आज पर लौटें"]),
]
BEATS = [b for b in BEATS if b[0] not in ("E2 screen", "E3 screen", "E4 screen", "E5 screen")] + [
 ("E2 screen", ["Day", "Who keeps the lane's cash box today?", "Cash kept Came short", "Hand it over"],
               ["दिन", "आज गली का कैश बॉक्स कौन रखे?", "पैसे रखे कम निकले", "डिब्बा सौंपें"]),
 ("E3 screen", ["Day", "Two chairs under the fan. Rank them.", "Calls Hours home", "Seat the top two"],
               ["दिन", "पंखे के नीचे दो कुर्सियाँ। क्रम लगाओ।", "कॉल घर पर", "ऊपर के दो बिठाएँ"]),
 ("E4 screen", ["Day", "Two key sets. Who keeps them?", "Cash kept Came short", "Hand them over"],
               ["दिन", "चाबी के दो सेट। कौन रखे?", "पैसे रखे कम निकले", "चाबियाँ सौंपें"]),
 ("E5 screen", ["Day", "The inverter's spare plug point. Who gets it?", "Calls Hours home", "Plug them in"],
               ["दिन", "इन्वर्टर का बचा पॉइंट। किसे मिले?", "कॉल घर पर", "इन्हें लगाने दें"]),
 ("L-02b", ["Milk's turning. The dairy has one ice box.", "Okay. Show me."],
           ["दूध फट रहा है। डेरी में एक ही आइस बॉक्स।", "ठीक है। दिखाइए।"]),
 ("M1 screen", ["Day", "The ice box takes three bags. Rank them.", "Cold Away", "Fill the ice box"],
               ["दिन", "आइस बॉक्स में तीन थैले। क्रम लगाओ।", "ठंडा बाहर", "आइस बॉक्स भरें"]),
 ("M3 screen", ["Day", "Sarla's car, for ice and diesel. Who drives?", "Errands Late", "Give the car keys"],
               ["दिन", "सरला की गाड़ी, बर्फ़ और डीज़ल। कौन चलाए?", "काम देर", "गाड़ी की चाबी दें"]),
 ("M4 screen", ["Day", "Complaints about the ice box. Take up two.", "Cold Away", "Take these up"],
               ["दिन", "आइस बॉक्स की शिकायतें। दो उठाओ।", "ठंडा बाहर", "इन्हें उठाएँ"]),
 ("L-02c", ["Dark by seven. Lineman says nine.", "Okay. What's left?"],
           ["सात बजे अँधेरा। लाइनमैन कहता नौ बजे।", "ठीक है। क्या बचा?"]),
 ("H2 screen", ["Day", "The generator's last two hours. Rank them.", "Calls Hours home", "Give the top two"],
               ["दिन", "जनरेटर के आख़िरी दो घंटे। क्रम लगाओ।", "कॉल घर पर", "पहले दो को दें"]),
]
MH = {
 "M3": ({"Anjali": (8, 1), "Ravi": (8, 1), "Lata": (6, 2), "Salim": (5, 2), "Manoj": (5, 2)},
        {"Anjali": "w", "Ravi": "m", "Lata": "w", "Salim": "m", "Manoj": "m"},
        {"Anjali": ("Only one here with a licence.", "यहाँ बस इसी के पास लाइसेंस।"),
         "Ravi": ("Sings old songs while cooking dal.", "दाल बनाते हुए पुराने गाने गाता।"),
         "Lata": ("Talks back, that one. Always.", "पलटकर जवाब देती है। हमेशा।"),
         "Salim": ("Gentle soul, wouldn't hurt a fly.", "सीधा आदमी, मक्खी भी न मारे।"),
         "Manoj": ("Counter at the sweet shop.", "मिठाई की दुकान पर काउंटर।")}),
 "H2": ({"Kavya": (6, 6), "Sneha": (4, 4), "Harish": (4, 4), "Mumtaz": (3, 4), "Arun": (2, 2)},
        {"Kavya": "w", "Sneha": "w", "Harish": "m", "Mumtaz": "w", "Arun": "m"},
        {"Kavya": ("Counter at the medical store.", "मेडिकल स्टोर पर काउंटर।"),
         "Sneha": ("Fusses over every little thing.", "हर छोटी बात पर नख़रे।"),
         "Harish": ("Spoilt, if you ask me.", "बिगड़ा हुआ है, सच कहूँ।"),
         "Mumtaz": ("Never says no to anyone.", "किसी को मना नहीं करती।"),
         "Arun": ("Lost his job last month.", "पिछले महीने नौकरी गई।")}),
}
NAMES.update({"Anjali", "Shabnam", "Ravi", "Lata", "Salim", "Manoj", "Kavya", "Sneha", "Harish", "Mumtaz", "Arun", "सरला"})
for q, (nums, sex, notes) in MH.items():
    ties = [(x, y) for x, y in itertools.combinations(nums, 2) if nums[x] == nums[y]]
    en = {p: len(words(n[0])) for p, n in notes.items()}
    hi = {p: len(words(n[1])) for p, n in notes.items()}
    print(f"  {q}: ties={[(t, 'W-M' if sex[t[0]] != sex[t[1]] else 'same') for t in ties]} EN={en} HI={hi}")
    by1 = sorted(nums, key=lambda p: -nums[p][0]); by2 = sorted(nums, key=lambda p: -nums[p][1])
    print(f"     by first number {[(p, nums[p][0]) for p in by1]}\n     by second number {[(p, nums[p][1]) for p in by2]}")

print("== counted words per beat / screen (EN, HI); limit 15 on decision screens, 20 elsewhere")
for name, en, hi in BEATS:
    ce = [len(words(s)) for s in en]
    ch = [len(words(s)) for s in hi]
    lim = 15 if "screen" in name else 20
    flag = "" if sum(ce) <= lim and sum(ch) <= lim else "  OVER"
    print(f"  {name:15} EN {sum(ce):2} {ce}  HI {sum(ch):2} {ch}  limit {lim}{flag}")
