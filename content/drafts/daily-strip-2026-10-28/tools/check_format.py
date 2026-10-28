"""Checks the sample day in daily-strip-format.md (Lugdi week, Monday, "The lights went at 8"), all three levels.

Decks: one woman-and-man tie a question (the pair), second ties, gender split, kind shape, rule 17 histories,
first appearances, bars and misses, notes (length, openings, longest, nudge), voices and balance, traps, the
note-word scan over every strip line, the Hindi scan of lines by or to the player, and word counts per screen in
English and Hindi. Run: python3 check_format.py
"""
import itertools, re, collections

H, N = 'Hari', 'Nusrat'          # the chorus: the only voices that sign a remark
ASKER = 'Shobha'

# ---------------------------------------------------------------------------------------------- people and decks
# name: (sex, age, a, b, marked)
LEVELS = {}

LEVELS['Easy'] = dict(
    key=('Answered', 'Late'), key_hi=('फ़ोन उठाए', 'देर'),
    people={
        'Sunita': ('w', 40, 12, 4, 0), 'Deepak': ('m', 43, 12, 4, 0),
        'Kavya': ('w', 31, 9, 5, 0), 'Rohit': ('m', 27, 9, 5, 0),
        'Farida': ('w', 34, 15, 2, 1), 'Imran': ('m', 36, 15, 2, 1),
        'Jyoti': ('w', 29, 12, 3, 0), 'Manoj': ('m', 33, 12, 3, 0),
        'Neeta': ('w', 45, 6, 8, 0), 'Lalita': ('w', 51, 6, 8, 0),
        'Suresh': ('m', 38, 12, 4, 0), 'Salim': ('m', 41, 11, 4, 1),
    },
    # kind, seats, pair, nudged (list), bar (k, op, v), trap card, notes {name: (en, hi, voice, tone)}
    # tone: plain | kind | unkind | heavy | matters | fact
    qs=[
        dict(job='Office call', kind='pick', pair=('Sunita', 'Deepak'), nudged=['Deepak'], bar=('a', '>=', 10),
             twin='opens', notes={
                 'Sunita': ('Counts cash at the bank counter.', 'बैंक काउंटर पर नक़दी गिनती है।', None, 'plain'),
                 'Deepak': ("Moody till he's had his dinner.", 'खाने से पहले उसका मूड ख़राब।', H, 'unkind'),
                 'Salim': ('Always smiling, whatever the weather.', 'मौसम कैसा भी हो, मुस्कुराता रहता।', N, 'kind'),
                 'Neeta': ('Lost her mother just last winter.', 'पिछली सर्दी में माँ चल बसीं।', None, 'heavy'),
                 'Lalita': ('Sulks when her serial gets cut.', 'सीरियल कटे तो मुँह फुला लेती।', N, 'unkind')}),
        dict(job='Candle money', kind='team2', pair=('Kavya', 'Rohit'), nudged=['Kavya'], bar=('b', '<=', 5),
             twin='unread', notes={
                 'Manoj': ('Sells bus tickets at the depot.', 'डिपो पर बस के टिकट बेचता है।', None, 'plain'),
                 'Kavya': ('Sweet to everyone she meets, that one.', 'जिससे मिले, उससे मीठा बोलती है।', H, 'kind'),
                 'Rohit': ('Does the books at a transport office.', 'ट्रांसपोर्ट दफ़्तर में हिसाब देखता है।', None, 'plain'),
                 'Neeta': ('Feeds every stray dog in the lane.', 'गली के हर कुत्ते को खिलाती है।', H, 'kind'),
                 'Lalita': ('Talks right through every film on TV.', 'टीवी की हर फ़िल्म में बोलती रहती।', N, 'unkind')}),
        dict(job='One plug', kind='pick', pair=('Farida', 'Imran'), nudged=['Imran'], bar=('b', '<=', 3),
             twin='opens', notes={
                 'Farida': ('Cooks lunch at the hospital canteen.', 'अस्पताल की कैंटीन में खाना बनाती।', None, 'plain'),
                 'Imran': ('Spoilt rotten since he was small.', 'बचपन से लाड़ में बिगड़ा हुआ।', N, 'unkind'),
                 'Jyoti': ('Teaches maths at a coaching centre.', 'कोचिंग सेंटर में गणित पढ़ाती है।', None, 'plain'),
                 'Deepak': ('Remembers every birthday in the lane.', 'गली के सबके जन्मदिन याद रखता।', N, 'kind'),
                 'Suresh': ('Throws the carrom striker when he loses.', 'हारने पर कैरम का स्ट्राइकर फेंक देता।', H, 'unkind')}),
        dict(job='Two lamps', kind='team2', pair=('Jyoti', 'Manoj'), nudged=['Jyoti'], bar=('b', '<=', 3),
             twin='unread', trap='Suresh', stereo='Farida', notes={
                 'Farida': ('Bossy with every one of her cousins.', 'अपने सब कज़िन पर हुक्म चलाती है।', H, 'unkind'),
                 'Jyoti': ('Makes everyone laugh, bless her heart.', 'जहाँ बैठे, सबको हँसा देती है।', N, 'kind'),
                 'Manoj': ('Checks bus passes at the gate.', 'गेट पर बस पास जाँचता है।', None, 'plain'),
                 'Deepak': ('Sorts letters at the post office.', 'डाकघर में चिट्ठियाँ छाँटता है।', None, 'plain'),
                 'Suresh': ('Brings sweets for every child here.', 'यहाँ हर बच्चे के लिए मिठाई लाता।', H, 'kind')}),
    ])

LEVELS['Medium'] = dict(
    key=('Turns', 'Missed'), key_hi=('बारी', 'छूटी'),
    people={
        'Geeta': ('w', 44, 12, 4, 0), 'Sanjay': ('m', 41, 12, 4, 0),
        'Rekha': ('w', 38, 11, 4, 0), 'Vikram': ('m', 35, 11, 4, 0),
        'Shabnam': ('w', 33, 13, 3, 1), 'Arif': ('m', 31, 13, 3, 1),
        'Pooja': ('w', 30, 14, 2, 0), 'Nitin': ('m', 28, 14, 2, 0),
        'Meera': ('w', 50, 12, 4, 0), 'Asha': ('w', 36, 11, 4, 0),
        'Gopal': ('m', 47, 9, 5, 0), 'Prakash': ('m', 40, 9, 5, 0),
    },
    qs=[
        dict(job='Tank key', kind='pick', pair=('Geeta', 'Sanjay'), nudged=['Geeta'], bar=('a', '>=', 10),
             twin='opens', notes={
                 'Geeta': ('Never lets anyone finish a sentence.', 'किसी को बात पूरी नहीं करने देती।', H, 'unkind'),
                 'Sanjay': ('Runs the photocopy shop in town.', 'बाज़ार में फ़ोटोकॉपी की दुकान चलाता है।', None, 'plain'),
                 'Asha': ('Sweetest smile in the whole lane.', 'पूरी गली में सबसे प्यारी मुस्कान।', N, 'kind'),
                 'Gopal': ('Snores through every wedding he attends.', 'हर शादी में बैठे-बैठे खर्राटे लेता।', N, 'unkind'),
                 'Prakash': ('Drives a car for a travel agency.', 'ट्रैवल एजेंसी की गाड़ी चलाता है।', None, 'plain')}),
        dict(job='Charging order', kind='mid', seats=2, pair=('Rekha', 'Vikram'), nudged=['Vikram'],
             bar=('a', '>=', 9), twin='unread', notes={
                 'Pooja': ('Works in the school office.', 'स्कूल के दफ़्तर में काम करती है।', None, 'plain'),
                 'Rekha': ('Books gas cylinders at the agency counter.', 'गैस एजेंसी काउंटर पर सिलेंडर बुक करती।', None, 'plain'),
                 'Vikram': ("Can't say no to anyone, bless him.", 'किसी को मना नहीं कर पाता, बेचारा।', N, 'kind'),
                 'Gopal': ("Fixes everyone's fan for free, that one.", 'सबका पंखा मुफ़्त में ठीक करता, वो।', H, 'kind'),
                 'Prakash': ('Waves at every child he passes.', 'रास्ते के हर बच्चे को हाथ हिलाता।', N, 'kind')}),
        dict(job='Two torches', kind='mid', seats=2, pair=('Shabnam', 'Arif'), nudged=['Shabnam'],
             bar=('b', '<=', 3), twin='opens', trap='Meera', notes={
                 'Nitin': ('Sells phone covers at the market.', 'बाज़ार में फ़ोन कवर बेचता है।', None, 'plain'),
                 'Shabnam': ('Picks a fight over every parking spot.', 'हर पार्किंग पर झगड़ा कर लेती है।', H, 'unkind'),
                 'Arif': ('Cooks for a big catering company nearby.', 'एक कैटरिंग कंपनी में खाना बनाता है।', None, 'plain'),
                 'Geeta': ('Bargains ten minutes over coriander.', 'धनिए के लिए दस मिनट मोलभाव।', N, 'unkind'),
                 'Meera': ('Kindest heart on this road, that one.', 'इस सड़क का सबसे नरम दिल, वो।', H, 'kind')}),
        dict(job="Lineman's call", kind='pick', pair=('Pooja', 'Nitin'), nudged=[], matters='Nitin',
             bar=None, twin='unread', notes={
                 'Pooja': ('Minds the register at the school office.', 'स्कूल ऑफ़िस का रजिस्टर वही देखती है।', None, 'plain'),
                 'Nitin': ("Has the lineman's number in his phone.", 'लाइनमैन का नंबर उसके फ़ोन में है।', None, 'matters'),
                 'Geeta': ('Lives right next to the big transformer box.', 'बड़े ट्रांसफ़ॉर्मर बॉक्स के ठीक बगल रहती है।', None, 'fact'),
                 'Vikram': ('Argues with every shopkeeper, that one.', 'हर दुकानदार से बहस करता है, वो।', H, 'unkind')}),
    ])

LEVELS['Hard'] = dict(
    key=('Kept', 'Lost'), key_hi=('सँभाले', 'खोए'),
    people={
        'Anita': ('w', 36, 13, 3, 0), 'Ramesh': ('m', 38, 13, 3, 0),
        'Meena': ('w', 33, 14, 2, 0), 'Ajay': ('m', 35, 14, 2, 0),
        'Usha': ('w', 42, 12, 3, 0), 'Harish': ('m', 45, 12, 3, 0),
        'Kusum': ('w', 39, 15, 2, 0), 'Dinesh': ('m', 37, 15, 2, 0),
        'Rani': ('w', 46, 14, 2, 0), 'Shalini': ('w', 30, 15, 2, 0),
        'Arun': ('m', 50, 8, 1, 0), 'Mohan': ('m', 44, 7, 6, 0),
    },
    qs=[
        dict(job='Spare keys', kind='rank2', seats=3, pair=('Anita', 'Ramesh'), nudged=['Ramesh'],
             bar=('b', '<=', 5), twin='opens', notes={
                 'Kusum': ('Writes up accounts at the dairy.', 'डेयरी का हिसाब-किताब लिखती है।', None, 'plain'),
                 'Shalini': ('Hogs the bench outside the shop.', 'दुकान के बाहर की बेंच घेरे रहती।', H, 'unkind'),
                 'Anita': ('Packs orders at the courier office.', 'कूरियर दफ़्तर में ऑर्डर पैक करती है।', None, 'plain'),
                 'Ramesh': ('Shouts at the TV during matches.', 'मैच के दौरान टीवी पर चिल्लाता है।', N, 'unkind'),
                 'Mohan': ('Grows chillies and mint on his roof.', 'छत पर मिर्च और पुदीना उगाता है।', None, 'plain')}),
        dict(job='Cash tin', kind='trade', pair=('Meena', 'Ajay'), nudged=['Meena', 'Ajay'],
             bar=('a', '>=', 14), twin='unread', trap='Arun', notes={
                 'Dinesh': ('Runs the stationery shop near the school.', 'स्कूल के पास स्टेशनरी की दुकान चलाता।', None, 'plain'),
                 'Meena': ('Laughs far too loudly at weddings.', 'शादियों में बहुत ज़ोर से हँसती है।', H, 'unkind'),
                 'Ajay': ('Sulks for days after any argument.', 'बहस के बाद कई दिन रूठा रहता।', N, 'unkind'),
                 'Anita': ('Works nights at the courier office.', 'कूरियर दफ़्तर में रात की ड्यूटी।', None, 'plain'),
                 'Arun': ('Grumbles about everything, that one.', 'हर बात पर बड़बड़ाता है, वो।', H, 'unkind')}),
        dict(job='Night lights', kind='rank2', seats=3, pair=('Usha', 'Harish'), nudged=['Usha'],
             bar=('a', '>=', 7), twin='opens', notes={
                 'Meena': ('Works the till at a medical store.', 'मेडिकल स्टोर के गल्ले पर बैठती है।', None, 'plain'),
                 'Rani': ('Sat up all last night in hospital.', 'कल पूरी रात अस्पताल में जागी।', None, 'heavy'),
                 'Usha': ('Looks after every new tenant, bless her.', 'हर नए किरायेदार का ख़याल रखती है।', N, 'kind'),
                 'Harish': ('Sells vegetables from a cart each morning.', 'रोज़ सुबह ठेले पर सब्ज़ी बेचता है।', None, 'plain'),
                 'Mohan': ("Fixes everyone's bicycle for free, that one.", 'सबकी साइकिल मुफ़्त में ठीक करता, वो।', H, 'kind')}),
        dict(job='The notebook', kind='pick', pair=('Kusum', 'Dinesh'), nudged=['Kusum', 'Dinesh'],
             bar=('b', '<=', 2), twin='unread', notes={
                 'Kusum': ('Feeds every stray cat she sees.', 'हर आवारा बिल्ली को खिलाती है।', H, 'kind'),
                 'Dinesh': ('Knows a joke for every occasion.', 'हर मौक़े के लिए एक चुटकुला।', N, 'kind'),
                 'Ajay': ('Drives a delivery van for a bakery.', 'बेकरी की डिलीवरी वैन चलाता है।', None, 'plain'),
                 'Anita': ('Sends sweets to every new neighbour.', 'हर नए पड़ोसी को मिठाई भेजती।', N, 'kind')}),
    ])

# ---------------------------------------------------------------------------------------------- the strip lines
# per level: list of (screen, kind, who, en, hi). kind: narr say you sfx list stamp q btn tag cover result
STRIP = {
    'Easy': [
        ('Cover', 'cover', None, 'Day', 'दिन'),
        ('Cover', 'cover', None, 'The lights went at 8', 'बत्ती आठ बजे गई'),
        ('Cover', 'cover', None, 'Easy · Medium · Hard', 'ईज़ी · मीडियम · हार्ड'),
        ('Cover', 'cover', None, '8 pm · 9 pm · 10 pm', 'रात 8 · रात 9 · रात 10'),
        ('Cover', 'btn', None, 'Play', 'खेलिए'),
        ('1 The lane', 'narr', None, "8:05 pm. Lights out. Whole lane's outside.", 'रात 8:05। बत्ती गुल। पूरी गली बाहर।'),
        ('1 The lane', 'say', H, 'Third time this week!', 'इस हफ़्ते तीसरी बार!'),
        ('1 The lane', 'tag', H, 'Hari Chacha, next door', 'हरि चाचा, बगल वाले'),
        ('1 The lane', 'say', N, "Chai's on. My gas works.", 'चाय चढ़ी है। मेरी गैस चालू।'),
        ('1 The lane', 'tag', N, 'Nusrat, the tailor', 'नुसरत, दर्ज़ी'),
        ('1 The lane', 'btn', None, 'Next', 'आगे'),
        ('2 At your door', 'say', ASKER, "Lights gone. You're on my list.", 'बत्ती गई। तुम मेरी लिस्ट पर हो।'),
        ('2 At your door', 'tag', ASKER, 'Shobha Aunty, keeps the keys', 'शोभा आंटी, चाबियाँ इनके पास'),
        ('2 At your door', 'you', 'you', 'Okay. What first?', 'ठीक है। पहले क्या?'),
        ('2 At your door', 'btn', None, 'Next', 'आगे'),
        ('3 The list', 'list', None, 'Before nine', 'नौ से पहले'),
        ('3 The list', 'list', None, 'Office call · Candle money · One plug · Two lamps',
         'दफ़्तर का फ़ोन · मोमबत्ती के पैसे · एक प्लग · दो लैंप'),
        ('3 The list', 'btn', None, 'First job', 'पहला काम'),
        ('Q1', 'q', ASKER, "Office line's open. Who speaks for the lane?", 'दफ़्तर की लाइन खुली। गली की ओर से कौन बोले?'),
        ('Q1', 'key', None, 'Answered · Late', 'फ़ोन उठाए · देर'),
        ('Q1', 'btn', None, '{name} makes the call', '{name} फ़ोन करें'),
        ('Stamp 1', 'stamp', None, 'Office call: settled', 'दफ़्तर का फ़ोन: तय'),
        ('Stamp 1', 'btn', None, 'Next job', 'अगला काम'),
        ('Q2', 'q', ASKER, 'Shop shuts at 8:30. Which two collect the candle money?', '8:30 पर दुकान बंद। पैसे कौन दो जमा करें?'),
        ('Q2', 'key', None, 'Answered · Late', 'फ़ोन उठाए · देर'),
        ('Q2', 'btn', None, 'Send {a} and {b}', '{a} और {b} को भेजिए'),
        ('7 Breather', 'stamp', None, 'Candle money: settled', 'मोमबत्ती के पैसे: तय'),
        ('7 Breather', 'narr', None, '8:35 pm.', 'रात 8:35।'),
        ('7 Breather', 'say', H, 'Radio says two more hours.', 'रेडियो कहता है, दो घंटे और।'),
        ('7 Breather', 'say', N, 'It says that every time.', 'हर बार यही कहता है।'),
        ('7 Breather', 'btn', None, 'Next job', 'अगला काम'),
        ('Q3', 'q', ASKER, 'One free plug at the shop. Whose phone goes in?', 'दुकान पर एक प्लग ख़ाली। किसका फ़ोन लगे?'),
        ('Q3', 'key', None, 'Answered · Late', 'फ़ोन उठाए · देर'),
        ('Q3', 'btn', None, "Charge {name}'s phone", '{name} का फ़ोन लगाइए'),
        ('Stamp 3', 'stamp', None, 'One plug: settled', 'एक प्लग: तय'),
        ('Stamp 3', 'btn', None, 'Next job', 'अगला काम'),
        ('Q4', 'q', ASKER, 'Two lamps for the night. Who keeps them?', 'रात के लिए दो लैंप। कौन दो रखें?'),
        ('Q4', 'key', None, 'Answered · Late', 'फ़ोन उठाए · देर'),
        ('Q4', 'btn', None, 'Lamps to {a} and {b}', 'लैंप {a} और {b} को'),
        ('11 Outcome', 'stamp', None, 'All set: 9:00', 'सब तैयार: 9:00'),
        ('11 Outcome', 'narr', None, 'A candle in every window.', 'हर खिड़की में मोमबत्ती।'),
        ('11 Outcome', 'sfx', None, 'khan', 'खन'),
        ('11 Outcome', 'btn', None, 'Next', 'आगे'),
        ('12 Reaction A', 'say', ASKER, "Nine sharp. Chai's on my step.", 'ठीक नौ। चाय मेरी सीढ़ी पर।'),
        ('12 Reaction A', 'you', 'you', 'Chai, then.', 'तो चाय।'),
        ('12 Reaction A', 'btn', None, 'See today', 'आज देखिए'),
        ('12 Reaction C', 'say', ASKER, "Quarter to ten. Chai's ready anyway.", 'पौने दस। चाय फिर भी तैयार।'),
        ('12 Reaction C', 'you', 'you', 'Chai, then.', 'तो चाय।'),
        ('12 Reaction C', 'btn', None, 'See today', 'आज देखिए'),
        ('13 Result', 'result', None, 'Easy', 'ईज़ी'),
        ('13 Result', 'result', None, 'On time: 4 of 4 jobs', 'समय पर: 4 में से 4 काम'),
        ('13 Result', 'result', None, 'Day 1 · 1 day running', 'दिन 1 · लगातार 1 दिन'),
        ('13 Result', 'btn', None, 'Medium: 9 pm, still dark', 'मीडियम: रात 9, अब भी अँधेरा'),
        ('13 Result', 'btn', None, 'Back to today', 'आज पर वापस'),
    ],
    'Medium': [
        ('1 The lane', 'narr', None, "9:00 pm. Still dark. Motor's off too.", 'रात 9:00। अब भी अँधेरा। मोटर भी बंद।'),
        ('1 The lane', 'say', H, 'No water either. Wonderful.', 'पानी भी नहीं। वाह।'),
        ('1 The lane', 'say', N, 'I filled two buckets at six.', 'मैंने छह बजे दो बाल्टी भर लीं।'),
        ('1 The lane', 'btn', None, 'Next', 'आगे'),
        ('2 At your door', 'say', ASKER, "Office says a lineman's coming. Maybe.", 'दफ़्तर कहता है, लाइनमैन आ रहा है। शायद।'),
        ('2 At your door', 'you', 'you', "Then let's get ready.", 'तो तैयारी शुरू।'),
        ('2 At your door', 'btn', None, 'Next', 'आगे'),
        ('3 The list', 'list', None, 'Before ten', 'दस से पहले'),
        ('3 The list', 'list', None, "Tank key · Charging order · Two torches · Lineman's call",
         'टंकी की चाबी · चार्ज की बारी · दो टॉर्च · लाइनमैन का फ़ोन'),
        ('3 The list', 'btn', None, 'First job', 'पहला काम'),
        ('Q1', 'q', ASKER, "Motor's off. Who keeps the roof tank key?", 'मोटर बंद। छत की टंकी की चाबी कौन रखे?'),
        ('Q1', 'key', None, 'Turns · Missed', 'बारी · छूटी'),
        ('Q1', 'btn', None, '{name} keeps the key', 'चाबी {name} के पास'),
        ('Stamp 1', 'stamp', None, 'Tank key: settled', 'टंकी की चाबी: तय'),
        ('Stamp 1', 'btn', None, 'Next job', 'अगला काम'),
        ('Q2', 'q', ASKER, 'Inverter has two plugs. Whose phones charge first?', 'इन्वर्टर में दो प्लग। पहले किसके फ़ोन लगें?'),
        ('Q2', 'key', None, 'Turns · Missed', 'बारी · छूटी'),
        ('Q2', 'cut', None, '2 plugs', '2 प्लग'),
        ('Q2', 'btn', None, 'Settle the charging', 'चार्जिंग तय कीजिए'),
        ('7 Breather', 'stamp', None, 'Charging order: settled', 'चार्ज की बारी: तय'),
        ('7 Breather', 'narr', None, '9:35 pm.', 'रात 9:35।'),
        ('7 Breather', 'say', H, 'My radio needs charging too.', 'मेरे रेडियो को भी चार्ज चाहिए।'),
        ('7 Breather', 'say', N, 'Your radio takes batteries, Chacha.', 'आपका रेडियो सेल से चलता है, चाचा।'),
        ('7 Breather', 'btn', None, 'Next job', 'अगला काम'),
        ('Q3', 'q', ASKER, 'Two torches left. Who gets them?', 'दो टॉर्च बचीं। किसे मिलें?'),
        ('Q3', 'key', None, 'Turns · Missed', 'बारी · छूटी'),
        ('Q3', 'btn', None, 'Hand out the torches', 'टॉर्च दे दीजिए'),
        ('Stamp 3', 'stamp', None, 'Two torches: settled', 'दो टॉर्च: तय'),
        ('Stamp 3', 'btn', None, 'Next job', 'अगला काम'),
        ('Q4', 'q', ASKER, 'The lineman calls one number. Whose?', 'लाइनमैन एक ही नंबर पर फ़ोन करेगा। किसका?'),
        ('Q4', 'key', None, 'Turns · Missed', 'बारी · छूटी'),
        ('Q4', 'btn', None, "Give him {name}'s number", '{name} का नंबर दीजिए'),
        ('11 Outcome', 'stamp', None, 'Lineman in: 9:50', 'लाइनमैन पहुँचा: 9:50'),
        ('11 Outcome', 'narr', None, 'Up the pole, torch in his teeth.', 'दाँतों में टॉर्च, खंभे पर।'),
        ('11 Outcome', 'sfx', None, 'thak', 'ठक'),
        ('11 Outcome', 'btn', None, 'Next', 'आगे'),
        ('12 Reaction A', 'say', ASKER, "He's up already. Not long now.", 'ऊपर चढ़ गया। अब थोड़ी देर।'),
        ('12 Reaction A', 'you', 'you', 'Fingers crossed.', 'उम्मीद है।'),
        ('12 Reaction A', 'btn', None, 'See today', 'आज देखिए'),
        ('13 Result', 'result', None, 'Medium', 'मीडियम'),
        ('13 Result', 'result', None, 'On time: 3 of 3 jobs', 'समय पर: 3 में से 3 काम'),
        ('13 Result', 'result', None, 'Day 1 · 1 day running', 'दिन 1 · लगातार 1 दिन'),
        ('13 Result', 'btn', None, 'Hard: 10 pm, last push', 'हार्ड: रात 10, आख़िरी ज़ोर'),
        ('13 Result', 'btn', None, 'Back to today', 'आज पर वापस'),
    ],
    'Hard': [
        ('1 The lane', 'narr', None, "10:00 pm. Still no lights. Nobody's sleeping.", 'रात 10:00। अब भी बत्ती नहीं। कोई नहीं सोया।'),
        ('1 The lane', 'say', H, "I'm sleeping up here tonight.", 'आज रात मैं यहीं सोऊँगा।'),
        ('1 The lane', 'say', N, 'With that snoring? Poor stars.', 'उन खर्राटों के साथ? बेचारे तारे।'),
        ('1 The lane', 'btn', None, 'Next', 'आगे'),
        ('2 At your door', 'say', ASKER, "Lineman's on the pole. One last push.", 'लाइनमैन खंभे पर है। बस आख़िरी ज़ोर।'),
        ('2 At your door', 'you', 'you', 'Okay. Last list.', 'ठीक है। आख़िरी लिस्ट।'),
        ('2 At your door', 'btn', None, 'Next', 'आगे'),
        ('3 The list', 'list', None, 'Before eleven', 'ग्यारह से पहले'),
        ('3 The list', 'list', None, 'Spare keys · Cash tin · Night lights · The notebook',
         'चाबियाँ · गल्ला · रात की बत्तियाँ · नोटबुक'),
        ('3 The list', 'btn', None, 'First job', 'पहला काम'),
        ('Q1', 'q', ASKER, 'Three sets of spare keys. Rank who keeps one.', 'चाबी के तीन सेट। किसे मिलें, क्रम लगाओ।'),
        ('Q1', 'key', None, 'Kept · Lost', 'सँभाले · खोए'),
        ('Q1', 'cut', None, '3 sets', '3 सेट'),
        ('Q1', 'btn', None, 'Settle the keys', 'चाबियाँ तय कीजिए'),
        ('Stamp 1', 'stamp', None, 'Spare keys: settled', 'चाबियाँ: तय'),
        ('Stamp 1', 'btn', None, 'Next job', 'अगला काम'),
        ('Q2', 'q', ASKER, "Shop's cash tin, overnight. Which two keep it?", 'दुकान का गल्ला, रात भर। कौन दो रखें?'),
        ('Q2', 'key', None, 'Kept · Lost', 'सँभाले · खोए'),
        ('Q2', 'btn', None, 'Tin to {a} and {b}', 'गल्ला {a} और {b} को'),
        ('7 Breather', 'stamp', None, 'Cash tin: settled', 'गल्ला: तय'),
        ('7 Breather', 'narr', None, '10:35 pm.', 'रात 10:35।'),
        ('7 Breather', 'say', H, 'In my day, cuts lasted a week.', 'हमारे ज़माने में बत्ती हफ़्ता भर जाती थी।'),
        ('7 Breather', 'say', N, 'In your day, nobody had phones.', 'आपके ज़माने में फ़ोन ही नहीं थे।'),
        ('7 Breather', 'btn', None, 'Next job', 'अगला काम'),
        ('Q3', 'q', ASKER, 'Three lights for the night. Rank who gets one.', 'रात की तीन बत्तियाँ। किसे मिलें, क्रम लगाओ।'),
        ('Q3', 'key', None, 'Kept · Lost', 'सँभाले · खोए'),
        ('Q3', 'cut', None, '3 lights', '3 बत्तियाँ'),
        ('Q3', 'btn', None, 'Settle the lights', 'बत्तियाँ तय कीजिए'),
        ('Stamp 3', 'stamp', None, 'Night lights: settled', 'रात की बत्तियाँ: तय'),
        ('Stamp 3', 'btn', None, 'Next job', 'अगला काम'),
        ('Q4', 'q', ASKER, 'Who keeps my notebook tonight?', 'आज रात मेरी नोटबुक कौन रखे?'),
        ('Q4', 'key', None, 'Kept · Lost', 'सँभाले · खोए'),
        ('Q4', 'btn', None, '{name} keeps it', '{name} के पास रहे'),
        ('11 Outcome', 'sfx', None, 'khat!', 'खट!'),
        ('11 Outcome', 'stamp', None, 'Lights back: 10:40', 'बत्ती आई: 10:40'),
        ('11 Outcome', 'narr', None, 'Every fan in the lane, at once.', 'पूरी गली के पंखे, एक साथ।'),
        ('11 Outcome', 'btn', None, 'Next', 'आगे'),
        ('12 Reaction A', 'say', ASKER, 'Lights! Bed, all of you.', 'बत्ती आ गई! चलो, सब सो जाओ।'),
        ('12 Reaction A', 'you', 'you', 'Goodnight, Aunty.', 'शुभ रात्रि, आंटी।'),
        ('12 Reaction A', 'btn', None, 'See today', 'आज देखिए'),
        ('13 Result', 'result', None, 'Hard', 'हार्ड'),
        ('13 Result', 'result', None, 'On time: 4 of 4 jobs', 'समय पर: 4 में से 4 काम'),
        ('13 Result', 'result', None, 'Day 1 · 1 day running', 'दिन 1 · लगातार 1 दिन'),
        ('13 Result', 'btn', None, 'Back to today', 'आज पर वापस'),
        ('Done cover', 'cover', None, 'Day', 'दिन'),
        ('Done cover', 'cover', None, 'The lights went at 8', 'बत्ती आठ बजे गई'),
        ('Done cover', 'cover', None, 'Easy · Medium · Hard', 'ईज़ी · मीडियम · हार्ड'),
        ('Done cover', 'cover', None, 'Next puzzle in 3 h', 'अगली पहेली 3 घंटे में'),
    ],
}

# ---------------------------------------------------------------------------------------------- helpers
fails, notes_out = [], []
PUNCT = r"[।.,!?:·;—()]"


def words(s):
    return [x for x in re.split(r'\s+', re.sub(PUNCT, ' ', s)) if x]


ALLNAMES = {n for L in LEVELS.values() for n in L['people']} | {'Shobha', 'Aunty', 'Hari', 'Chacha', 'Nusrat',
                                                                  'शोभा', 'आंटी', 'हरि', 'चाचा', 'नुसरत'}


def counted(s):
    out = []
    for w in words(s):
        bare = re.sub(r"['’]s$", '', w)
        if re.fullmatch(r'[\d:]+', w) or w in ('pm', 'am', 'h') or '{' in w:
            continue
        if bare in ALLNAMES or w in ALLNAMES:
            continue
        out.append(w)
    return len(out)


def better(x, y, k):
    return x[2] > y[2] if k == 'a' else x[3] < y[3]


def meets(p, bar):
    k, op, v = bar
    return p[2] >= v if k == 'a' else p[3] <= v


# ---------------------------------------------------------------------------------------------- deck checks
tally = collections.Counter()
for lvl, L in LEVELS.items():
    P = L['people']
    seen = {n: [] for n in P}
    weak_before = set()
    misses = collections.Counter()
    longest_on_pair = 0
    traps = 0
    new_pair_qs = returning = 0
    pairs_numbers = set()
    in_pair = collections.Counter()
    print(f'\n== {lvl} (key {L["key"][0]} · {L["key"][1]})')
    for i, q in enumerate(L['qs'], 1):
        t = f'{lvl} Q{i}'
        cards = list(q['notes'])
        w, m = q['pair']
        pw, pm = P[w], P[m]
        num = lambda c: (P[c][2], P[c][3])
        if pw[0] != 'w' or pm[0] != 'm' or num(w) != num(m):
            fails.append(f'{t}: the pair is not a woman and a man with the same numbers')
        if abs(pw[1] - pm[1]) > 8:
            fails.append(f'{t}: pair ages more than 8 apart')
        if pw[4] != pm[4]:
            fails.append(f'{t}: community marking differs inside the pair')
        if num(w) in pairs_numbers:
            fails.append(f'{t}: a pair\'s numbers return')
        pairs_numbers.add(num(w))
        for x in (w, m):
            in_pair[x] += 1
        for x, y in itertools.combinations(cards, 2):
            if {x, y} != {w, m} and P[x][0] != P[y][0] and num(x) == num(y):
                fails.append(f'{t}: a second woman-and-man tie {x}/{y}')
        others = [c for c in cards if c not in (w, m)]
        ties = [(x, y) for x, y in itertools.combinations(others, 2) if P[x][0] == P[y][0] and num(x) == num(y)]
        if len(cards) == 5 and not ties and q['kind'] != 'trade':
            fails.append(f'{t}: a five-card question with no second tie')
        nw = sum(P[c][0] == 'w' for c in cards)
        if (len(cards) == 5 and nw not in (2, 3)) or (len(cards) == 4 and nw != 2):
            fails.append(f'{t}: gender split {nw} women of {len(cards)}')
        up = [sum(better(P[c], pw, k) for c in others) for k in 'ab']
        both = [c for c in others if better(P[c], pw, 'a') and better(P[c], pw, 'b')]
        shape_ok = {'pick': up == [0, 0], 'team2': up == [1, 1] and len(both) == 1, 'mid': up == [1, 1],
                    'rank2': up == [2, 2], 'trade': up == [1, 1] and not both}[q['kind']]
        if not shape_ok:
            fails.append(f'{t}: numbers do not fit the kind {q["kind"]} (cards above on each number: {up})')
        # rule 17: matched earlier appearances (count, halves, note warmth), nobody weakest earlier in a later pair
        hw = [(h, tone) for h, tone in seen[w]]
        hm = [(h, tone) for h, tone in seen[m]]
        if [h for h, _ in hw] != [h for h, _ in hm] or [x for _, x in hw] != [x for _, x in hm]:
            fails.append(f'{t}: the pair\'s earlier appearances differ {hw} / {hm}')
        if w in weak_before or m in weak_before:
            fails.append(f'{t}: a pair member was the weakest card earlier')
        new = [c for c in cards if not seen[c]]
        if i > 1:
            if seen[w]:
                returning += 1
            else:
                new_pair_qs += 1
                if len([c for c in new if c not in (w, m)]) < 1:
                    fails.append(f'{t}: the pair are the only new faces')
        ranked = sorted(cards, key=lambda c: (-P[c][2], P[c][3]))
        worst = num(ranked[-1])
        weakest = {c for c in cards if num(c) == worst}
        for c in cards:
            r = ranked.index(c)
            half = 'top' if r < len(cards) / 2 else 'bottom'
            if num(c) == num(w) and c in (w, m):
                half = 'top' if ranked.index(w) < len(cards) / 2 else 'bottom'
            tone = q['notes'][c][3]
            warmth = 'plain' if tone in ('plain', 'fact', 'matters') else ('heavy' if tone == 'heavy' else 'remark')
            seen[c].append((half, warmth))
        weak_before |= weakest
        # bars and misses
        if q['bar']:
            if not meets(pw, q['bar']):
                fails.append(f'{t}: the bar sits above the pair')
            miss = [c for c in cards if not meets(P[c], q['bar'])]
            for c in miss:
                misses[P[c][0]] += 1
        else:
            miss = ['(fixed outcome)']
        # notes
        en = {c: len(words(q['notes'][c][0])) for c in cards}
        hi = {c: len(words(q['notes'][c][1])) for c in cards}
        for lang, Ls in (('en', en), ('hi', hi)):
            if max(Ls.values()) - min(Ls.values()) > 2:
                fails.append(f'{t}: {lang} notes differ by more than 2 words {Ls}')
            if Ls[w] != Ls[m]:
                fails.append(f'{t}: {lang} pair notes differ in length {Ls[w]}/{Ls[m]}')
        if words(q['notes'][w][0])[0] == words(q['notes'][m][0])[0]:
            fails.append(f'{t}: pair notes share an opening word')
        if en[w] == max(en.values()):
            longest_on_pair += 1
        for c in q['nudged']:
            if q['notes'][c][2] not in (H, N):
                fails.append(f'{t}: the nudge on {c} has no chorus voice')
            if en[c] > max(v for k2, v in en.items() if k2 != c):
                fails.append(f'{t}: the nudge on {c} is the longest note')
        remarks = [c for c in cards if q['notes'][c][2]]
        if q['nudged'] and len(remarks) < 2:
            fails.append(f'{t}: the nudge is the only remark on the screen')
        nudge_tones = {q['notes'][c][3] for c in q['nudged']}
        if q['nudged'] and not any(q['notes'][c][3] in nudge_tones for c in others if q['notes'][c][2]):
            fails.append(f'{t}: no decoy of the nudge\'s kind outside the pair')
        if 'matters' in q and q['matters'] not in (w, m):
            fails.append(f'{t}: the reason that matters is not on the pair')
        for c in others:
            if q['notes'][c][3] == 'matters':
                fails.append(f'{t}: a reason that matters sits on a decoy')
            if q['notes'][c][3] == 'heavy' and P[c][4]:
                fails.append(f'{t}: a heavy fact on a community-marked name')
        for c in cards:
            v = q['notes'][c][2]
            if v == ASKER:
                fails.append(f'{t}: the asker signs a remark')
            if v:
                tally[(lvl, v, P[c][0])] += 1
                tally[(lvl, 'tone', P[c][0], q['notes'][c][3])] += 1
        if q.get('trap'):
            tc = q['trap']
            traps += 1
            if q['bar'] and meets(P[tc], q['bar']):
                fails.append(f'{t}: the trap card {tc} meets the bar')
        if q.get('stereo'):
            sc = q['stereo']
            if sc in (w, m) or ranked[0] != sc:
                fails.append(f'{t}: the stereotyped remark is not on the clear top card outside the pair')
        print(f'  Q{i} {q["kind"]:5} pair {w}/{m} {num(w)}  cards above {up}  ties {ties}  '
              f'bar {q["bar"]}  misses {miss}  notes en {list(en.values())} hi {list(hi.values())}')
    if traps != 1:
        fails.append(f'{lvl}: {traps} traps (one a level)')
    if misses['w'] != misses['m']:
        fails.append(f'{lvl}: misses are {misses["w"]} women and {misses["m"]} men')
    n = len(L['qs'])
    if not (n / 4 <= longest_on_pair <= n / 2):
        fails.append(f'{lvl}: longest English note on the pair in {longest_on_pair} of {n}')
    for c, k in in_pair.items():
        if k > 1:
            fails.append(f'{lvl}: {c} sits in {k} pairs')
    counts = {c: len(v) for c, v in seen.items()}
    if min(counts.values()) < 1 or max(counts.values()) > 3:
        fails.append(f'{lvl}: card appearances {counts}')
    print(f'  misses women {misses["w"]}, men {misses["m"]}; longest note on the pair in {longest_on_pair} of {n}; '
          f'pairs new in Q2-Q4: {new_pair_qs}, returning: {returning}; appearances {counts}')

# nobody on cards at two levels
names = [set(L['people']) for L in LEVELS.values()]
if names[0] & names[1] or names[0] & names[2] or names[1] & names[2]:
    fails.append('a person sits on cards at two levels')

print('\n== remarks by voice and sex, and tone by sex')
for lvl in LEVELS:
    for v in (H, N):
        a, b = tally[(lvl, v, 'w')], tally[(lvl, v, 'm')]
        print(f'  {lvl} {v}: on women {a}, on men {b}')
        if abs(a - b) > 1:
            fails.append(f'{lvl}: {v} remarks on women {a}, men {b}')
    for s in 'wm':
        k, u = tally[(lvl, 'tone', s, 'kind')], tally[(lvl, 'tone', s, 'unkind')]
        print(f'  {lvl} remarks on {"women" if s == "w" else "men"}: kind {k}, unkind {u}')
    tw = sum(tally[(lvl, v, 'w')] for v in (H, N))
    tm = sum(tally[(lvl, v, 'm')] for v in (H, N))
    if tw != tm:
        fails.append(f'{lvl}: remarks on women {tw}, on men {tm}')

# ---------------------------------------------------------------------------------------------- strip checks
STOP = set('the a an at in on of to for and with every his her he she it its is was by from till this that one '
           'all last just whole when whose who which two some any off up out after over around near each own day '
           'days time times night nights first new right big lane shop phone phones office number lineman '
           'counter'.split())
print('\n== note-word scan and Hindi scan')
for lvl, L in LEVELS.items():
    card_names = set(L['people'])
    note_words = {}
    for q in L['qs']:
        for c, (en, hi, v, tone) in q['notes'].items():
            for x in words(en.lower()):
                x = re.sub(r"['’]s$", '', x)
                if len(x) > 3 and x not in STOP:
                    note_words.setdefault(x, set()).add(c)
    for scr, kind, who, en, hi in STRIP[lvl]:
        if kind in ('btn', 'cover', 'result', 'key', 'cut'):
            continue
        for x in words(en):
            bare = re.sub(r"['’]s$", '', x)
            if bare in card_names:
                fails.append(f'{lvl} {scr}: a strip line names a card person ({bare})')
            if bare.lower() in note_words:
                fails.append(f'{lvl} {scr}: "{en}" uses a note word of {sorted(note_words[bare.lower()])} ({bare})')
    # Hindi: lines by or to the player, and the game's own voice
    for scr, kind, who, en, hi in STRIP[lvl]:
        if kind in ('you', 'q', 'btn') or (who == ASKER and kind == 'say'):
            flags = []
            if re.search(r'(ूँगा|ूँगी|ोगे|ोगी|ेगा|ेगी|ेंगे|ेंगी)', hi):
                flags.append('future that shows gender')
            if re.search(r'\S*[ाीे]\s+(हूँ|हो|है|हैं|था|थी|थे|थीं|नहीं)', hi):
                flags.append('-ा/-ी/-े before a helper')
            if re.search(r'(गया|गई|गए)[।!?]', hi):
                flags.append('past at a sentence end')
            if flags:
                notes_out.append(f'{lvl} {scr}: "{hi}" ({", ".join(flags)}) for a Hindi reader: '
                                 f'{"the player is not the subject" if kind in ("say", "q") else "check"}')

print('\n== words counted per screen (English / Hindi)')
for lvl in LEVELS:
    by = collections.OrderedDict()
    for scr, kind, who, en, hi in STRIP[lvl]:
        by.setdefault(scr, [[], []])
        by[scr][0].append((kind, en))
        by[scr][1].append((kind, hi))
    for scr, (ens, his) in by.items():
        if scr.startswith('1 The lane') and lvl == 'Easy':
            ce_first = sum(counted(t) for _, t in ens)
            ch_first = sum(counted(t) for _, t in his)
            ce = sum(counted(t) for k, t in ens if k != 'tag')
            ch = sum(counted(t) for k, t in his if k != 'tag')
            label = f'{scr} (first meeting {ce_first} / {ch_first})'
        elif scr.startswith('2 At your door') and lvl == 'Easy':
            ce_first = sum(counted(t) for _, t in ens)
            ch_first = sum(counted(t) for _, t in his)
            ce = sum(counted(t) for k, t in ens if k != 'tag')
            ch = sum(counted(t) for k, t in his if k != 'tag')
            label = f'{scr} (first meeting {ce_first} / {ch_first})'
        else:
            ce = sum(counted(t) for _, t in ens)
            ch = sum(counted(t) for _, t in his)
            ce_first, ch_first, label = ce, ch, scr
        limit = 15 if scr.startswith('Q') else 20
        if max(ce_first, ch_first) > limit:
            fails.append(f'{lvl} {scr}: {ce_first} / {ch_first} words, over {limit}')
        spoken = [t for k, t in ens + his if k in ('say', 'you')]
        for t in spoken:
            if counted(t) > 10:
                fails.append(f'{lvl} {scr}: a spoken line over 10 words: {t}')
        for k, t in ens + his:
            if k == 'narr' and counted(t) > 12:
                fails.append(f'{lvl} {scr}: narration over 12 words: {t}')
            if k == 'q' and counted(t) > 10:
                fails.append(f'{lvl} {scr}: question over 10 words: {t}')
        pieces = [k for k, _ in ens if k in ('say', 'you', 'narr', 'sfx')]
        if len([k for k in pieces if k in ('say', 'you')]) > 2 or len(pieces) > 3:
            fails.append(f'{lvl} {scr}: {len(pieces)} pieces on the panel')
        print(f'  {lvl:6} {label:44} {ce:3} / {ch:3}   (limit {limit})')

print('\nFor a Hindi reader:')
for x in notes_out:
    print('  ' + x)
print('\nFAILS:', fails or 'none')
