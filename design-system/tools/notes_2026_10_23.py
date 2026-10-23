"""The card notes made the same length (owner, 23 Oct 2026: "For quotes, we are falling in the trap that the longest quotes
are the right one"). Before this pass the longest note sat on the hidden pair in 34 of 40 decisions, and on the nudge in
27, so a player could find the pair by length alone. Every note in a decision now runs the same length, the pair's two the
same, and story_take.length_faults refuses a set where length points at the pair again.

Writes each new note (and Believe account) into knowledge/story/first-take-script.md, and its Hindi into
first-take-hindi.md, replacing the old row when the old English is no longer used anywhere.
Run:  python3 design-system/tools/notes_2026_10_23.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2] / 'knowledge' / 'story'
SCRIPT, HINDI = ROOT / 'first-take-script.md', ROOT / 'first-take-hindi.md'
WORLD = {'1971': 'station', '1977': 'lugdi', '1984': 'jadugar', '1992': 'cricket', '1999': 'rukavat'}

# (world, decision, name) -> new note, or (new account, new note) for a Believe card
NEW = {
    ('station', 1, 'Mumtaz'): 'Pushy with the guards, every single shift.',
    ('station', 1, 'Nagsen'): 'Takes charge with the guards, every shift.',
    ('station', 1, 'Annamma'): 'New on the line, keen as anything.',
    ('station', 2, 'Annamma'): 'Came top of the steam exam this year.',
    ('station', 2, 'Mohan'): "Asha's brother. Fires the old steam engines.",
    ('station', 2, 'Yasmin'): 'Took six months off to nurse her father.',
    ('station', 2, 'Rohit'): 'Transferred here last year from the Pune shed.',
    ('station', 2, 'Nagsen'): 'Asks for the day shift every single week.',
    ('station', 3, 'Annamma'): 'Has learned the whole ghat section.',
    ('station', 3, 'Sunil'): 'Wants every Sunday off this month.',
    ('station', 3, 'Yasmin'): 'Never once late, never once early.',
    ('station', 4, 'Sunil'): 'Reported bullying by the foreman, who was moved.',
    ('station', 4, 'Annamma'): "Runs the shed's first-aid box and stretcher drills.",
    ('station', 4, 'Rohit'): 'Sharp on the rule book, quotes it daily.',
    ('station', 4, 'Yasmin'): 'New to the shed, still finding her way.',
    ('station', 5, 'Kiran'): 'Takes charge with the yard staff, always.',
    ('station', 5, 'Sunil'): 'Pushy with the yard staff, every shift.',
    ('station', 5, 'Yasmin'): 'Asks a lot of questions in drills.',
    ('station', 6, 'Francis'): 'Came top of his batch at training school.',
    ('station', 6, 'Mohan'): "Asha's brother. Fires the old steam engines.",
    ('station', 6, 'Kiran'): 'Transferred here last year from the Kalyan shed.',
    ('station', 6, 'Prakash'): 'Took six months off to nurse his father.',
    ('station', 6, 'Sunil'): 'Late twice this month, both times on Mondays.',
    ('station', 7, 'Rohit'): 'Has learned the whole bridge section.',
    ('station', 7, 'Nagsen'): 'Just back from the Pune shed.',
    ('station', 8, 'Kiran'): "Reported the yard foreman's bullying; he was moved.",
    ('station', 8, 'Nagsen'): "Keeps the yard's logbook, neat to the minute.",
    ('station', 8, 'Francis'): 'Wants the course badly, or so Mohan says.',
    ('station', 8, 'Mumtaz'): "Prefers the night shift, when the yard's quiet.",
    ('lugdi', 1, 'Etwari'): 'Loads fastest at the depot, every time.',
    ('lugdi', 1, 'Ramesh'): "Asha's husband. Drives the old green truck.",
    ('lugdi', 1, 'Dinesh'): 'Drives the blue truck, mostly on nights.',
    ('lugdi', 1, 'Nirmala'): 'Keeps asking for night runs, Mohan says.',
    ('lugdi', 2, 'Kusum'): 'Says a car followed her truck down the ghat. Drives nights.',
    ('lugdi', 2, 'Baldev'): 'Says a tyre burst near the toll last night. Hates delays.',
    ('lugdi', 2, 'Nirmala'): 'Says she was fined at the check post. Short on cash.',
    ('lugdi', 4, 'Anthony'): 'Steady on the ghat road.',
    ('lugdi', 4, 'Velu'): 'Careful on bends, Mohan says.',
    ('lugdi', 4, 'Kusum'): 'Holds the hazardous-goods licence now.',
    ('lugdi', 4, 'Nirmala'): 'Wants the day shift again.',
    ('lugdi', 5, 'Saroj'): 'Never once late in six whole years.',
    ('lugdi', 5, 'Ramesh'): "Asha's husband. Drives the old green truck.",
    ('lugdi', 5, 'Kusum'): 'Drives the red truck, mostly on nights.',
    ('lugdi', 5, 'Velu'): 'His family worries about his ghat runs.',
    ('lugdi', 5, 'Anthony'): 'Back from leave this week, Mohan says.',
    ('lugdi', 6, 'Saroj'): 'Says a car stayed behind her along the river road. Imagines things.',
    ('lugdi', 6, 'Anthony'): 'Says a car stayed behind him along the river road. Drives nights.',
    ('lugdi', 6, 'Jasleen'): 'Says a fallen tree blocked the river road at dusk. Hates detours.',
    ('lugdi', 6, 'Etwari'): 'Says the brakes felt soft on the long slope down. Wants repairs.',
    ('lugdi', 7, 'Saroj'): 'Never once scraped the paint.',
    ('lugdi', 7, 'Jasleen'): 'Takes it wide, Mohan says.',
    ('lugdi', 8, 'Jasleen'): 'Steady in the heavy rain.',
    ('lugdi', 8, 'Saroj'): 'Drives the short local runs.',
    ('lugdi', 8, 'Dinesh'): 'Holds the hazardous-goods licence now.',
    ('lugdi', 8, 'Etwari'): 'Just back from her leave.',
    ('jadugar', 1, 'Sarla'): (None, 'Makes a drama out of everything.'),
    ('jadugar', 1, 'Thomas'): (None, 'Has worked the lights nine years.'),
    ('jadugar', 1, 'Jonali'): ('He came in by the back gate after the last show.', 'Saw him near the gate, Pallavi says.'),
    ('jadugar', 1, 'Gopal'): ('He left the grounds when the watchman came with a lamp.', 'New with the troupe this season.'),
    ('jadugar', 2, 'Gopal'): 'Rides with the lorry on every move.',
    ('jadugar', 2, 'Mitali'): 'Always counts the takings twice, Pallavi says.',
    ('jadugar', 2, 'Cyrus'): 'Loses his ticket book every other week.',
    ('jadugar', 3, 'Thomas'): 'The stand was never tied down properly.',
    ('jadugar', 3, 'Gopal'): 'I think someone knocked it by mistake.',
    ('jadugar', 4, 'Naresh'): "Lodges with the drummer's family in town.",
    ('jadugar', 4, 'Jonali'): 'Counts the tickets every night before bed.',
    ('jadugar', 4, 'Thomas'): 'Joined the troupe in Nashik last month.',
    ('jadugar', 5, 'Naresh'): (None, 'Always making a scene about something.'),
    ('jadugar', 5, 'Pushpa'): (None, 'Does the make-up for the troupe.'),
    ('jadugar', 5, 'Rabia'): ('He ran off the moment the drums started up again.', 'Sings the songs in the interval.'),
    ('jadugar', 5, 'Lalit'): ('I only heard the shouting from behind the stage curtain.', 'New this season, so Pallavi says.'),
    ('jadugar', 6, 'Sarla'): 'Never forgets a receipt, so Pallavi says.',
    ('jadugar', 6, 'Rabia'): 'Knows the bank clerk from her village.',
    ('jadugar', 6, 'Lalit'): 'A man should carry it on highways.',
    ('jadugar', 6, 'Naresh'): 'Late with every errand he is given.',
    ('jadugar', 7, 'Dolly'): "I think the fan belt slipped, that's all.",
    ('jadugar', 7, 'Pushpa'): 'The engine got far too hot, it seems.',
    ('jadugar', 8, 'Pushpa'): 'Sews all the costumes for the troupe.',
    ('jadugar', 8, 'Rabia'): 'Sings in the interval on show nights.',
    ('jadugar', 8, 'Dolly'): 'Always late for the parade, Pallavi says.',
    ('cricket', 1, 'Chandan'): 'Fields at slip, most matches.',
    ('cricket', 1, 'Leena'): 'In good form, Vikram says.',
    ('cricket', 1, 'Uday'): 'Bats left-handed and hooks well.',
    ('cricket', 2, 'Gita'): "Captained the club's juniors for two full seasons.",
    ('cricket', 2, 'Chandan'): 'Faces a police complaint for violence at home.',
    ('cricket', 2, 'Leena'): 'Always chatting with the umpires between the overs.',
    ('cricket', 2, 'Uday'): 'New to the side, quiet in the nets.',
    ('cricket', 3, 'Kabir'): "Fielded every ball in last Sunday's match.",
    ('cricket', 3, 'Rani'): "Asha's daughter. Bowls tidy off-spin, rarely loose.",
    ('cricket', 3, 'Zarina'): "Rest her for the final, it's rough.",
    ('cricket', 3, 'Tenzing'): 'Always plays in his lucky blue cap.',
    ('cricket', 3, 'Leena'): 'Drops all the easy ones, Vikram says.',
    ('cricket', 4, 'Mani'): 'Bowls a bit of leg-spin when asked.',
    ('cricket', 4, 'Tenzing'): 'Back in good form lately, Vikram says.',
    ('cricket', 4, 'Agnes'): 'New to the side this season, keen.',
    ('cricket', 4, 'Uday'): 'Bats at nine, fields at fine leg.',
    ('cricket', 5, 'Bindu'): 'Fields at point, most matches.',
    ('cricket', 5, 'Agnes'): 'Bowls quick, so Vikram says.',
    ('cricket', 5, 'Mani'): 'Bought a new bat this season.',
    ('cricket', 6, 'Bindu'): "A neighbour's police complaint says violence at home.",
    ('cricket', 6, 'Hari'): "Ran the club's nets all through the winter.",
    ('cricket', 6, 'Agnes'): 'Argues with the umpires over every single call.',
    ('cricket', 6, 'Mani'): 'New to the side, still learning the field.',
    ('cricket', 7, 'Gita'): "Took five catches in last Sunday's game.",
    ('cricket', 7, 'Rani'): "Asha's daughter. Bowls tidy off-spin, rarely loose.",
    ('cricket', 7, 'Bindu'): 'Bowls in the nets every single morning.',
    ('cricket', 7, 'Uday'): "Rest him for the final, it's rough.",
    ('cricket', 7, 'Hari'): 'Very slow between the wickets, Vikram says.',
    ('cricket', 8, 'Zarina'): 'Bowls fast, but only in short spells.',
    ('cricket', 8, 'Kabir'): 'Never misses the nets, rain or shine.',
    ('cricket', 8, 'Gita'): 'Back from a knock on the knee.',
    ('cricket', 8, 'Chandan'): 'Bats at ten, bowls a few overs.',
    ('rukavat', 1, 'Uma'): 'Home from her long shift at the mill.',
    ('rukavat', 1, 'Vikram'): "Asha's son, home from college for the week.",
    ('rukavat', 1, 'Chetan'): 'Hides from the chores every time, Rani says.',
    ('rukavat', 2, 'Rajan'): 'Wants to marry again, and soon.',
    ('rukavat', 2, 'Shampa'): 'Moved back in with her mother.',
    ('rukavat', 3, 'Deepa'): 'Has a dust allergy since childhood.',
    ('rukavat', 3, 'Uma'): 'Cleared out the storeroom last year.',
    ('rukavat', 4, 'Mahesh'): 'Told them plainly: no dowry, ever.',
    ('rukavat', 4, 'Rajan'): 'Agrees with everyone, so Rani says.',
    ('rukavat', 5, 'Kunal'): 'Fixed the window cooler first thing this morning.',
    ('rukavat', 5, 'Vikram'): "Asha's son, home from college for the week.",
    ('rukavat', 5, 'Rajan'): 'On the phone all day long, Rani says.',
    ('rukavat', 6, 'Chetan'): 'Moved in with his elder brother.',
    ('rukavat', 6, 'Deepa'): "The children's aunt, close to them.",
    ('rukavat', 7, 'Mahesh'): 'Has a dust allergy since childhood.',
    ('rukavat', 7, 'Pooja'): 'Sorts all the papers by date.',
    ('rukavat', 8, 'Vivek'): 'Drives everyone to the station, every time.',
    ('rukavat', 8, 'Kunal'): 'Talks far too much, so Rani says.',
}

HI = {
    'Pushy with the guards, every single shift.': 'हर शिफ़्ट में गार्ड पर हुक्म चलाती है।',
    'Takes charge with the guards, every shift.': 'हर शिफ़्ट में गार्ड के साथ कमान सँभालता है।',
    'New on the line, keen as anything.': 'लाइन पर नई है, बड़ी लगन वाली।',
    'Came top of the steam exam this year.': 'इस साल भाप की परीक्षा में सबसे आगे रही।',
    "Asha's brother. Fires the old steam engines.": 'आशा का भाई। पुराने भाप इंजन में कोयला झोंकता है।',
    'Took six months off to nurse her father.': 'पिता की देखभाल के लिए छह महीने की छुट्टी ली।',
    'Transferred here last year from the Pune shed.': 'पिछले साल पुणे शेड से तबादला होकर आया।',
    'Asks for the day shift every single week.': 'हर हफ़्ते दिन की शिफ़्ट माँगता है।',
    'Has learned the whole ghat section.': 'पूरा घाट सेक्शन सीख चुकी है।',
    'Wants every Sunday off this month.': 'इस महीने हर इतवार छुट्टी चाहता है।',
    'Never once late, never once early.': 'एक बार भी न देर, न जल्दी।',
    'Reported bullying by the foreman, who was moved.': 'फ़ोरमैन की बदसलूकी की शिकायत की, फ़ोरमैन हटाया गया।',
    "Runs the shed's first-aid box and stretcher drills.": 'शेड का फ़र्स्ट-एड बक्सा और स्ट्रेचर ड्रिल सँभालती है।',
    'Sharp on the rule book, quotes it daily.': 'नियमों का पक्का, रोज़ उनका हवाला देता है।',
    'New to the shed, still finding her way.': 'शेड में नई है, अभी राह खोज रही है।',
    'Takes charge with the yard staff, always.': 'यार्ड के लोगों के साथ हमेशा कमान सँभालती है।',
    'Pushy with the yard staff, every shift.': 'हर शिफ़्ट में यार्ड के लोगों पर हुक्म चलाता है।',
    'Asks a lot of questions in drills.': 'ड्रिल में बहुत सवाल पूछती है।',
    'Came top of his batch at training school.': 'ट्रेनिंग स्कूल में अपने बैच में सबसे आगे रहा।',
    'Transferred here last year from the Kalyan shed.': 'पिछले साल कल्याण शेड से तबादला होकर आई।',
    'Took six months off to nurse his father.': 'पिता की देखभाल के लिए छह महीने की छुट्टी ली।',
    'Late twice this month, both times on Mondays.': 'इस महीने दो बार देर से आया, दोनों बार सोमवार को।',
    'Has learned the whole bridge section.': 'पूरा पुल वाला सेक्शन सीख चुका है।',
    'Just back from the Pune shed.': 'अभी-अभी पुणे शेड से लौटा है।',
    "Reported the yard foreman's bullying; he was moved.": 'यार्ड फ़ोरमैन की बदसलूकी की शिकायत की; उसका तबादला हुआ।',
    "Keeps the yard's logbook, neat to the minute.": 'यार्ड की लॉगबुक रखता है, मिनट-मिनट का हिसाब।',
    'Wants the course badly, or so Mohan says.': 'मोहन कहता है, उसे कोर्स की बहुत चाह है।',
    "Prefers the night shift, when the yard's quiet.": 'रात की शिफ़्ट पसंद करती है, जब यार्ड शांत रहता है।',
    'Loads fastest at the depot, every time.': 'डिपो पर हर बार सबसे तेज़ लोड करती है।',
    "Asha's husband. Drives the old green truck.": 'आशा के पति। पुराना हरा ट्रक चलाते हैं।',
    'Drives the blue truck, mostly on nights.': 'नीला ट्रक चलाता है, ज़्यादातर रात में।',
    'Keeps asking for night runs, Mohan says.': 'मोहन कहता है, रात के फेरे माँगती रहती है।',
    'Says a car followed her truck down the ghat. Drives nights.': 'कहती है घाट पर एक गाड़ी उसके ट्रक के पीछे लगी रही। रात में चलाती है।',
    'Says a tyre burst near the toll last night. Hates delays.': 'कहता है कल रात टोल के पास टायर फट गया। देरी से चिढ़ता है।',
    'Says she was fined at the check post. Short on cash.': 'कहती है चेक पोस्ट पर उसका चालान कटा। पैसों की तंगी है।',
    'Steady on the ghat road.': 'घाट वाली सड़क पर सधा हुआ।',
    'Careful on bends, Mohan says.': 'मोहन कहता है, मोड़ों पर सावधान है।',
    'Holds the hazardous-goods licence now.': 'अब ख़तरनाक माल का लाइसेंस है।',
    'Wants the day shift again.': 'फिर से दिन की शिफ़्ट चाहती है।',
    'Never once late in six whole years.': 'छह साल में एक बार भी देर नहीं की।',
    'Drives the red truck, mostly on nights.': 'लाल ट्रक चलाती है, ज़्यादातर रात में।',
    'His family worries about his ghat runs.': 'घाट के फेरों से उसके घरवाले फ़िक्र करते हैं।',
    'Back from leave this week, Mohan says.': 'मोहन कहता है, इस हफ़्ते छुट्टी से लौटा है।',
    'Says a car stayed behind her along the river road. Imagines things.': 'कहती है नदी वाली सड़क पर एक गाड़ी उसके पीछे रही। वहम करती है।',
    'Says a car stayed behind him along the river road. Drives nights.': 'कहता है नदी वाली सड़क पर एक गाड़ी उसके पीछे रही। रात में चलाता है।',
    'Says a fallen tree blocked the river road at dusk. Hates detours.': 'कहती है शाम को गिरे पेड़ ने नदी वाली सड़क रोक दी। घूमकर जाना नापसंद है।',
    'Says the brakes felt soft on the long slope down. Wants repairs.': 'कहती है लंबी ढलान पर ब्रेक ढीले लगे। मरम्मत चाहती है।',
    'Never once scraped the paint.': 'पेंट पर एक खरोंच तक नहीं आई।',
    'Takes it wide, Mohan says.': 'मोहन कहता है, मोड़ चौड़ा काटती है।',
    'Steady in the heavy rain.': 'तेज़ बारिश में सधी हुई।',
    'Drives the short local runs.': 'छोटे लोकल फेरे चलाती है।',
    'Just back from her leave.': 'अभी-अभी छुट्टी से लौटी है।',
    'Makes a drama out of everything.': 'हर बात का तमाशा बना देती है।',
    'Has worked the lights nine years.': 'नौ साल से लाइटें सँभालता है।',
    'He came in by the back gate after the last show.': 'आख़िरी शो के बाद वह पीछे वाले गेट से आया था।',
    'Saw him near the gate, Pallavi says.': 'पल्लवी कहती है, उसने उसे गेट के पास देखा।',
    'He left the grounds when the watchman came with a lamp.': 'चौकीदार लालटेन लेकर आया, तब वह मैदान से गया।',
    'New with the troupe this season.': 'इस सीज़न मंडली में नया है।',
    'Rides with the lorry on every move.': 'हर बार लॉरी के साथ जाता है।',
    'Always counts the takings twice, Pallavi says.': 'पल्लवी कहती है, कमाई हमेशा दो बार गिनती है।',
    'Loses his ticket book every other week.': 'हर दूसरे हफ़्ते अपनी टिकट बुक खो देता है।',
    'The stand was never tied down properly.': 'स्टैंड ठीक से कभी बाँधा ही नहीं गया था।',
    'I think someone knocked it by mistake.': 'मुझे लगता है किसी से ग़लती से धक्का लग गया।',
    "Lodges with the drummer's family in town.": 'शहर में ढोलक वाले के परिवार के साथ रहता है।',
    'Counts the tickets every night before bed.': 'सोने से पहले हर रात टिकट गिनती है।',
    'Joined the troupe in Nashik last month.': 'पिछले महीने नाशिक में मंडली से जुड़ा।',
    'Always making a scene about something.': 'हमेशा किसी बात पर हंगामा करता है।',
    'Does the make-up for the troupe.': 'मंडली का मेकअप करती है।',
    'He ran off the moment the drums started up again.': 'ढोल फिर बजते ही वह भाग गया।',
    'Sings the songs in the interval.': 'इंटरवल में गाने गाती है।',
    'I only heard the shouting from behind the stage curtain.': 'मैंने परदे के पीछे से बस चिल्लाना सुना।',
    'New this season, so Pallavi says.': 'पल्लवी कहती है, इस सीज़न नया है।',
    'Never forgets a receipt, so Pallavi says.': 'पल्लवी कहती है, रसीद कभी नहीं भूलती।',
    'Knows the bank clerk from her village.': 'बैंक के क्लर्क को अपने गाँव से जानती है।',
    'A man should carry it on highways.': 'हाईवे पर इसे आदमी को ले जाना चाहिए।',
    'Late with every errand he is given.': 'जो भी काम मिले, उसमें देर करता है।',
    "I think the fan belt slipped, that's all.": 'मुझे लगता है पंखे का पट्टा खिसक गया, बस।',
    'The engine got far too hot, it seems.': 'लगता है इंजन बहुत ज़्यादा गरम हो गया।',
    'Sews all the costumes for the troupe.': 'मंडली की सारी पोशाकें सिलती है।',
    'Sings in the interval on show nights.': 'शो की रातों में इंटरवल में गाती है।',
    'Always late for the parade, Pallavi says.': 'पल्लवी कहती है, परेड में हमेशा देर करती है।',
    'Fields at slip, most matches.': 'ज़्यादातर मैचों में स्लिप पर फ़ील्डिंग करता है।',
    'In good form, Vikram says.': 'विक्रम कहता है, अच्छे फ़ॉर्म में है।',
    'Bats left-handed and hooks well.': 'बाएँ हाथ से खेलता है, हुक अच्छा मारता है।',
    "Captained the club's juniors for two full seasons.": 'दो पूरे सीज़न क्लब की जूनियर टीम की कप्तानी की।',
    'Faces a police complaint for violence at home.': 'उस पर घरेलू हिंसा की पुलिस शिकायत दर्ज है।',
    'Always chatting with the umpires between the overs.': 'ओवरों के बीच हमेशा अंपायर से बतियाती है।',
    'New to the side, quiet in the nets.': 'टीम में नया है, नेट में चुप रहता है।',
    "Fielded every ball in last Sunday's match.": 'पिछले इतवार के मैच में हर गेंद पर फ़ील्डिंग की।',
    "Asha's daughter. Bowls tidy off-spin, rarely loose.": 'आशा की बेटी। सधी हुई ऑफ़-स्पिन, शायद ही कभी ढीली।',
    "Rest her for the final, it's rough.": 'फ़ाइनल में उसे आराम दो, खेल सख़्त है।',
    'Always plays in his lucky blue cap.': 'हमेशा अपनी नीली लकी टोपी में खेलता है।',
    'Drops all the easy ones, Vikram says.': 'विक्रम कहता है, सारे आसान कैच छोड़ देती है।',
    'Bowls a bit of leg-spin when asked.': 'कहने पर थोड़ी लेग-स्पिन डालता है।',
    'Back in good form lately, Vikram says.': 'विक्रम कहता है, आजकल अच्छे फ़ॉर्म में लौट आया है।',
    'New to the side this season, keen.': 'इस सीज़न टीम में नई है, लगन वाली।',
    'Bats at nine, fields at fine leg.': 'नौवें नंबर पर बल्लेबाज़ी, फ़ाइन लेग पर फ़ील्डिंग।',
    'Fields at point, most matches.': 'ज़्यादातर मैचों में पॉइंट पर फ़ील्डिंग करती है।',
    'Bowls quick, so Vikram says.': 'विक्रम कहता है, तेज़ गेंद डालती है।',
    'Bought a new bat this season.': 'इस सीज़न नया बल्ला ख़रीदा।',
    "A neighbour's police complaint says violence at home.": 'एक पड़ोसी की पुलिस शिकायत: घर में हिंसा।',
    "Ran the club's nets all through the winter.": 'पूरी सर्दी क्लब की नेट प्रैक्टिस चलाई।',
    'Argues with the umpires over every single call.': 'हर फ़ैसले पर अंपायर से बहस करती है।',
    'New to the side, still learning the field.': 'टीम में नया है, अभी फ़ील्ड सीख रहा है।',
    "Took five catches in last Sunday's game.": 'पिछले इतवार के खेल में पाँच कैच लिए।',
    'Bowls in the nets every single morning.': 'हर सुबह नेट में गेंदबाज़ी करती है।',
    "Rest him for the final, it's rough.": 'फ़ाइनल में उसे आराम दो, खेल सख़्त है।',
    'Very slow between the wickets, Vikram says.': 'विक्रम कहता है, विकेटों के बीच बहुत धीमा है।',
    'Bowls fast, but only in short spells.': 'तेज़ गेंद डालती है, पर बस छोटे स्पेल में।',
    'Never misses the nets, rain or shine.': 'नेट कभी नहीं छोड़ता, धूप हो या बारिश।',
    'Back from a knock on the knee.': 'घुटने की चोट से लौटी है।',
    'Bats at ten, bowls a few overs.': 'दसवें नंबर पर बल्लेबाज़ी, कुछ ओवर गेंदबाज़ी।',
    'Home from her long shift at the mill.': 'मिल की लंबी शिफ़्ट से घर आई है।',
    "Asha's son, home from college for the week.": 'आशा का बेटा, हफ़्ते भर के लिए कॉलेज से घर आया है।',
    'Hides from the chores every time, Rani says.': 'रानी कहती है, हर बार काम से छिपता है।',
    'Wants to marry again, and soon.': 'दोबारा शादी करना चाहता है, और जल्दी।',
    'Moved back in with her mother.': 'अपनी माँ के घर लौट गई है।',
    'Has a dust allergy since childhood.': 'बचपन से धूल से एलर्जी है।',
    'Cleared out the storeroom last year.': 'पिछले साल स्टोर रूम ख़ाली किया था।',
    'Told them plainly: no dowry, ever.': 'साफ़ कह दिया: दहेज कभी नहीं।',
    'Agrees with everyone, so Rani says.': 'रानी कहती है, सबकी हाँ में हाँ मिलाता है।',
    'Fixed the window cooler first thing this morning.': 'आज सुबह सबसे पहले खिड़की वाला कूलर ठीक किया।',
    'On the phone all day long, Rani says.': 'रानी कहती है, दिन भर फ़ोन पर रहता है।',
    'Moved in with his elder brother.': 'अपने बड़े भाई के घर रहने चला गया है।',
    "The children's aunt, close to them.": 'बच्चों की मौसी, उनके क़रीब।',
    'Sorts all the papers by date.': 'सारे अख़बार तारीख़ से छाँटती है।',
    'Drives everyone to the station, every time.': 'हर बार सबको स्टेशन छोड़ता है।',
    'Talks far too much, so Rani says.': 'रानी कहती है, बहुत ज़्यादा बोलता है।',
}


def apply():
    text = SCRIPT.read_text(encoding='utf-8')
    head, *blocks = re.split(r'\n(?=## Chapter \d)', text)
    done, old_strings = set(), set()
    out = [head]
    for block in blocks:
        year = re.match(r'## Chapter \d\. (\d{4})', block).group(1)
        world = WORLD[year]
        parts = re.split(r'(?m)^(?=\d\. \*\*)', block)
        for i, part in enumerate(parts):
            m = re.match(r'(\d)\. \*\*', part)
            if not m:
                continue
            n = int(m.group(1))
            lines = part.split('\n')
            for j, line in enumerate(lines):
                cm = re.match(r'^(\s+- )(\w+)( \(\d+, \d+\))?(:?) (.+?) (\[(?:N|=|d|F)\].*)$', line)
                if not cm or (world, n, cm.group(2)) not in NEW:
                    continue
                new = NEW[(world, n, cm.group(2))]
                quotes = re.findall(r'"([^"]+)"', cm.group(5))
                if isinstance(new, tuple):   # a Believe card: its account, then its note
                    acc = new[0] or quotes[0]
                    old_strings.update(quotes)
                    body = f'"{acc}" / "{new[1]}"'
                else:
                    old_strings.update(quotes)
                    body = f'"{new}"'
                lines[j] = f'{cm.group(1)}{cm.group(2)}{cm.group(3) or ""}{cm.group(4)} {body} {cm.group(6)}'
                done.add((world, n, cm.group(2)))
            parts[i] = '\n'.join(lines)
        out.append(''.join(parts))
    missing = set(NEW) - done
    assert not missing, f'cards not found: {sorted(missing)}'
    text = '\n'.join(out)
    SCRIPT.write_text(text, encoding='utf-8')

    # the Hindi: a new row for each new string; an old row goes once its English is used nowhere in the script
    hi = HINDI.read_text(encoding='utf-8')
    gone = {s for s in old_strings if f'"{s}"' not in text}
    kept = [ln for ln in hi.split('\n') if not (ln.startswith('| ') and ln.split(' | ')[0][2:] in gone)]
    hi = '\n'.join(kept)
    news = {s: h for s, h in HI.items() if f'| {s} |' not in hi}
    hi = hi.rstrip('\n') + '\n\n## Card notes made the same length (23 Oct 2026)\n\n| English | Hindi |\n|---|---|\n' + ''.join(f'| {s} | {h} |\n' for s, h in news.items())
    HINDI.write_text(hi, encoding='utf-8')
    print(len(done), 'cards rewritten;', len(gone), 'old Hindi rows retired;', len(news), 'new Hindi rows')


if __name__ == '__main__':
    apply()
