---
type: content-draft
title: Each world's own story (draft for the owner)
description: The words each Retake world tells its day in, for the owner's review. Station's railway story and the new stories for Jadugar, Cricket and Rukavat, in English and Hindi, with the shared words shortened to fit the word limits. Lugdi keeps the ghat road. Station's last road words replaced with railway ones and its other strings audited, as a list to apply to the library; ten ideas for Rukavat's film title, each checked for a real film or serial of the same name. Hindi is a draft for a native speaker.
plane_issues: [https://app.plane.so/the-equal-lens/browse/EVAL-17/, https://app.plane.so/the-equal-lens/browse/EVAL-18/]
---

# Each world's own story

**Draft for your review.** You said on 22 Oct 2026 that every world gets its own story, and yes to Station's railway story. Until now Station, Jadugar, Cricket and Rukavat all borrowed Lugdi's truck drivers on the ghat road. Below is each world's own set. Nothing here is final: change any word. All the Hindi is a first draft for a native speaker to read aloud and fix.

Where it lives: Station in `design-system/library.py`, the others in `design-system/worlds/jadugar.py`, `cricket.py` and `rukavat.py`. How a world supplies these words is in [world-modules.md](../architecture/world-modules.md).

**What every set keeps.** 4 people (the rule allows 3 to 5), all looking the same before you pick. Two of them have exactly the same numbers, and their lines are the same except for one loaded word: the kind of word people use for a woman but not for a man. A later day swaps the two words. One named person says the lines. The people come from one cast of adults from across India and across faiths, and anyone can appear in any world where the story needs them (22 Oct 2026). No caste, religion or party as a topic.

**The button stays the same in every world:** "Pick one", then "Send" and the name picked. So each Hindi question asks whom to send, or asks in a form that does not guess anyone's gender.

**Every question fits on one line,** as Lugdi's does. A two-line question pushed the bottom cards' lines under the button, so the first drafts were cut: "Who drives the night train to Nashik?", "Who do you send out as captain?" and "Who takes Dadi to the doctor on Sunday?" became the questions below.

## Lugdi (kept as it is)

The ghat road: "Who do you send tonight?" Mehul seth says the lines; years driving and crashes; Saroj "Drives the ghats with attitude." and Dinesh "Drives the ghats with confidence." Cover line "One night run up the ghat." Road names Ghat Ka Jugnu and friends.

One change for the word limit: the hard day's line is now "Today, in a family court." (was "Today is set in a family court."). It still names the setting.

## Station: the night train to Nashik

| | English | Hindi |
|---|---|---|
| Question | Who drives to Nashik tonight? | रात की नाशिक गाड़ी पर किसे भेजें? |
| Who says the lines | Gurpreet, station master | गुरप्रीत, स्टेशन मास्टर |
| The two numbers | years (on the line), missed (signals missed) | साल (लाइन पर साल), चूके (चूके सिग्नल) |
| Cover line | Last train out before the rain. | बारिश से पहले की आख़िरी गाड़ी। |
| Hard day | Today, at a railway police post. | आज, रेलवे पुलिस चौकी पर। |
| Next puzzle (unchanged) | Next train tomorrow | अगली गाड़ी कल |
| Share card | Train 214, your road name, Day 6 | गाड़ी 214, आपका रोड नेम, दिन 6 |
| Words step, the luggage tag (Francis, guard, says it) | "Kiran is the loco pilot on the night train. Passengers call her ___." | "किरण रात की गाड़ी की लोको पायलट है। यात्री उसे ___ कहते हैं।" |
| Result ticket, the small line | Loco pilot Sunil | लोको पायलट सुनील |

The last two rows are new (your answer of 22 Oct 2026: change them, think more Indian). They used to say "Gurpreet drives the night bus" and "Driver Sunil", words from the old road. They are not in the library yet: see [Station strings to change in the library](#station-strings-to-change-in-the-library).

The loco pilots:

| Person | Years, missed | English line | Hindi line |
|---|---|---|---|
| Mumtaz | 12, 0 | Stubborn at every red signal. | हर लाल सिग्नल पर ज़िद्दी। |
| Rohit | 26, 2 | Old hand, slow with new engines. | पुराने उस्ताद, नए इंजन पर धीमे। |
| Sunil | 12, 0 | Firm at every red signal. | हर लाल सिग्नल पर सख़्त। |
| Annamma | 3, 0 | New on the line, very keen. | लाइन पर नई, बड़ी लगन वाली। |

The loaded words: Mumtaz is "stubborn" (ज़िद्दी), Sunil is "firm" (सख़्त), for the same careful habit. The return day swaps them.

Road names (railway places, all invented): friends Itarsi Ki Chai (इटारसी की चाय), Manmad Ki Patri (मनमाड की पटरी), **Kalyan Ki Seeti** (कल्याण की सीटी, you), Jhansi Ka Platform (झाँसी का प्लेटफ़ॉर्म). Top three Hari Batti (हरी बत्ती), Pehli Seeti (पहली सीटी), Raat Ki Rail (रात की रेल). Near you also Wardha Ka Kanta (वर्धा का काँटा) and Katni Ki Lalten (कटनी की लालटेन).

## Station strings to change in the library

The strings below are quoted as they stood in the code before 22 Oct, with the old shared names. Since then the library draws each world's own people (in Station: Gurpreet, Kiran, Sunil and the rest), so the same lines now show those names.

Not applied yet. `design-system/library.py` is in the middle of the metal pass, so these wait until it lands. Each item gives the exact old string, the new English and Hindi, and where it is: the function in the `Station` class, with its line on 22 Oct 2026 (lines will move). All Hindi is a draft for a native speaker.

Word limits: what a named person says, names, numbers and anything hidden from screen readers do not count (R-NUM-20). No change below adds a counted word to a screen unless its row says so.

### Agreed: your answer of 22 Oct 2026

Applied to `library.py` on 22 Oct 2026, after the metal pass (Station page re-checked: 0 words over budget, 0 contrast hits in English).

| # | Where | Old | New English | New Hindi |
|---|---|---|---|---|
| 1 | `letter_obj`, line 1011: the words step's luggage tag | “Anita drives the night bus. Passengers call her / “अनीता रात की बस चलाती है। यात्री उसे | “Pammi is the loco pilot on the night train. Passengers call her | “पम्मी रात की गाड़ी की लोको पायलट है। यात्री उसे |
| 2 | `result_parts`, line 1020: the small line on the stamped ticket | Driver Raju / ड्राइवर राजू | Loco pilot Raju | लोको पायलट राजू |

- **1, the tag.** The ending after the blank stays (".”" and "कहते हैं।”"), and the three words still fit it: यात्री उसे बहादुर कहते हैं। Anita is the station master in this story, so she cannot also drive the train; Pammi is a loco pilot in the First take. Salim stays as the voice ("Salim, guard", सलीम, गार्ड): the guard rides at the other end of the same train. The Railway Board renamed guards "train managers" in January 2022 (RBE No. 7/2022), but people still say guard, so the plain word stays. Another wording, with more platform life in it: “The whole platform comes to see Pammi in the engine. People call her ___.” | “पूरा प्लेटफ़ॉर्म पम्मी को इंजन में देखने आता है। लोग उसे ___ कहते हैं।”
- **2, the ticket.** "Loco pilot" is Indian Railways' own title for the driver. On duty rosters it is "LP" (एलपी राजू), which is truer still but not an everyday word, so "LP" goes on the duty chart instead (item 6). The ticket is hidden from screen readers, so it does not count.

### Proposed: your call

| # | Where | Old | New English | New Hindi | Why |
|---|---|---|---|---|---|
| 3 | `twin['q']`, line 942: the question | Who drives to Nashik tonight? | Who drives the Nashik train? | रात की नाशिक गाड़ी पर किसे भेजें? (unchanged) | Without "train", "drives to Nashik" reads as a car or a truck on the road, which is Lugdi's story. Same five words and a shorter line, so it stays on one line. "Tonight" lives on in the Hindi and on the cover. |
| 4 | `cover_line`, line 950 | Last train out before the rain. | Last train out before the rains. | बारिश से पहले की आख़िरी गाड़ी। (unchanged) | "The rains" is how Indian English says the monsoon. Or, with the kulhad: "Kulhad chai, then the night train." / "कुल्हड़ चाय, फिर रात की गाड़ी।" Both are six words in each language, as now. |
| 5 | `sort`, line 957: the quick sort | Anita laughs too loud at the counter. / अनीता काउंटर पर बहुत ज़ोर से हँसती है। The question in Hindi: क्या यह सूचना-पट पर लगे? | Anita laughs too loud at the ticket counter. | अनीता टिकट खिड़की पर बहुत ज़ोर से हँसती है। The question: क्या यह नोटिस बोर्ड पर लगे? | "The counter" could be any shop; at a small station the station master sells the tickets herself. सूचना-पट is the signboard word, and people say नोटिस बोर्ड. The Hindi question gains one counted word: by my hand count the step goes to 10 of 15. |
| 6 | `jobs_obj`, lines 995 to 997, which reads the shared `JOBS` (line 462) | Lamps, Rangoli, Ladder / दीये, रंगोली, सीढ़ी. The chart's header: "No. 12810", "A1" | Mail, Goods, Shunting. Header: "Duty chart", "LP" | मेल, मालगाड़ी, शंटिंग. Header: "ड्यूटी चार्ट", "एलपी" | Festival jobs at home (lamps, rangoli, a ladder) on a railway chart belong nowhere. A crew lobby books its loco pilots by train type: mail and express, goods, passenger, shunting. "Goods" on its own is how Indian railway English says a goods train. Station needs its own job list in `jobs_obj` in place of `JOBS`. The chart stays as drawn; the header is hidden from screen readers. The library caption "Jobs are berths on the reservation chart." becomes "Jobs are duties on the crew's chart." |
| 7 | `week_obj`, line 1033: the Sunday slip | PNR 214 3108 | PNR 214-3108265 | (the same) | A real PNR has ten digits, printed as 3 and 7. Decoration, hidden from screen readers. |
| 8 | Only if the First take's Station hard topic stands ([cast.md](cast.md): a harassment complaint at the shed). `hard_line`, line 951, and the hard board in `cover_top`, line 984 | Today, at a railway police post. / आज, रेलवे पुलिस चौकी पर। Board: Kolkata / कोलकाता, "Platform 5 · Thursday" | Today, at the loco shed. Board: Kalyan, "Loco shed · Thursday" | आज, लोको शेड में। Board: कल्याण, "लोको शेड · गुरुवार" | The hard day's line names the setting (R-COVER-6), and the complaint is at the shed, not at the police. Kalyan's electric loco shed, opened in 1928, was India's first, and it is on the Nashik line. The cover keeps the same number of words. If the police post stays, keep it: "GRP chowki" is the everyday name, but not plain for everyone. |

### Checked and kept

- **The board name, Nashik** (नाशिक). The main-line station is really Nashik Road (code NK), but on the cover board "Road" and "रोड" would add two counted words to a screen that is at 19 of 20 by my hand count. Keep Nashik unless a word goes elsewhere on the cover.
- **Next train tomorrow** (अगली गाड़ी कल) and **Train 214** (गाड़ी 214). Real train numbers have five digits, but 214 is the day's number in every world.
- **The two numbers**, years on the line and signals missed. In railway talk a red signal run past is a "SPAD", too technical for a card.
- **The four loco pilots' lines** and the loaded pair, stubborn and firm.
- **The road names.** All railway, all invented, from junctions across India.
- **Monthly season ticket** (मासिक सीज़न टिकट), the month recap: Indian Railways' own name for a commuter's monthly pass.
- **The "Arrived" stamp** (पहुँची). "Right time" is the more Indian railway phrase, but on a result it would read as "you were right".
- **The plates:** Howrah, Kolkata, Churchgate, Pune, Platform 3, Departures. You chose real station names. Keep Kasara and Igatpuri off them: they are Lugdi's road names, and the Nashik line climbs the same ghat as Lugdi's trucks.
- **The reminder,** "Tonight: one seat left at the Tatkal counter" (line 1375), already railway. It is shared by every world through the app icon, and whether a hurry-up line suits a daily puzzle is a separate question.

### Shared words Station shows but cannot change on its own

These come from steps every world shares, and the `Station` class has no hook for them yet, so each would need one first. For a later pass, after the metal pass.

- **`step_checks`, lines 476 to 486.** Station shows "Francis chacha" saying "Gurpreet may leave after the wedding.", over numbers for years keeping accounts and years on a break: a shop's books, not the railway. A Station version would use years on the line and signals missed, and the First take's own lines.
- **`step_team`, lines 488 to 498.** "Pick 3 for the team", with batting averages on Station's departure rows. A Station version: "Pick 3 for the night shift" / "रात की ड्यूटी के लिए 3 चुनें", with years on the line. Annamma aunty's line, "Keep the girls home tonight. It's late.", fits a night shift as it is.

Railway facts checked on 22 Oct 2026: [guards renamed train managers, RBE No. 7/2022](https://www.gconnect.in/orders-in-brief/railways-orders-in-brief/revision-designations-guard-train-manager-railway.html); [how a crew lobby books loco pilots, a Railway Board work study](https://indianrailways.gov.in/railwayboard/uploads/directorate/eff_res/work_Study/2019-20/3_CR_2019-20.pdf); [Electric Loco Shed, Kalyan](https://en.wikipedia.org/wiki/Electric_Loco_Shed,_Kalyan); [the ten-digit PNR](https://www.ixigo.com/pnr-status-enquiry); [Nashik Road, code NK, on the 12810 Mail's timetable](https://www.confirmtkt.com/train-schedule/12810-HWH-CSMT-MAIL).

## Jadugar: who closes the show

| | English | Hindi |
|---|---|---|
| Question | Who closes the show tonight? | आज रात आख़िरी खेल में किसे भेजें? |
| Who says the lines | Kader, magician | क़ादर, जादूगर |
| The two numbers | years (on stage), missed (shows missed) | साल (मंच पर साल), छूटे (छूटे शो) |
| Cover line (unchanged) | One night only. The cot flies. | सिर्फ़ एक रात। खाट उड़ेगी। |
| Hard day | Today, at a wedding. | आज, एक शादी में। |
| Next puzzle (unchanged) | Next show tomorrow | अगला शो कल |
| Share card | Chandni Mandal · Show 214, your road name, Day 6 | चाँदनी मंडल · शो 214, आपका रोड नेम, दिन 6 |

The troupe:

| Person | Years, missed | English line | Hindi line |
|---|---|---|---|
| Sarla | 9, 1 | Great on stage, but moody. | मंच पर कमाल, पर मूडी। |
| Cyrus | 15, 4 | Crowd favourite, often late. | भीड़ के चहेते, अक्सर लेट। |
| Naresh | 9, 1 | Great on stage, but intense. | मंच पर कमाल, पर जुनूनी। |
| Mitali | 3, 0 | New, still learning the rope trick. | नई हैं, रस्सी वाला खेल सीख रही हैं। |

The loaded words: Sarla is "moody" (मूडी), Naresh is "intense" (जुनूनी).

Road names (show names, all invented): friends Gayab Kabootar (ग़ायब कबूतर), Hawa Mein Gulab (हवा में गुलाब), **Rassi Ka Jadoo** (रस्सी का जादू, you), Khaali Topi (ख़ाली टोपी). Top three Udta Qaleen (उड़ता क़ालीन), Jaadui Lalten (जादुई लालटेन), Paani Mein Aag (पानी में आग). Near you also Chamakti Chadar (चमकती चादर) and Baksa Number Teen (बक्सा नंबर तीन).

## Cricket: who goes out as captain

| | English | Hindi |
|---|---|---|
| Question | Who do you send as captain? | कप्तान बनाकर किसे भेजें? |
| Who says the lines | Shirin, coach | शीरीं, कोच |
| The two numbers | matches (played), wins (matches won) | मैच (खेले मैच), जीत (जीते मैच) |
| Cover line (unchanged) | One innings at the old ground. | पुराने मैदान पर एक पारी। |
| Hard day | Today, at the team hostel. | आज, टीम के हॉस्टल में। |
| Next puzzle (unchanged) | Play resumes tomorrow | खेल कल फिर शुरू होगा |
| Share card | Purana Maidan · No. 214, your road name, Day 6 | पुराना मैदान · अंक 214, आपका रोड नेम, दिन 6 |

The side:

| Person | Matches, wins | English line | Hindi line |
|---|---|---|---|
| Agnes | 40, 22 | Bossy with the bowlers. | गेंदबाज़ों के साथ दबंग। |
| Mani | 64, 30 | Safe hands, slow to change plans. | भरोसेमंद, पर प्लान बदलने में धीमे। |
| Hari | 40, 22 | Assertive with the bowlers. | गेंदबाज़ों के साथ दमदार। |
| Gita | 12, 8 | New to the side, reads the pitch well. | टीम में नई, पिच अच्छी पढ़ती हैं। |

The loaded words: Agnes is "bossy" (दबंग), Hari is "assertive" (दमदार).

Road names (grounds, all invented): friends Neem Wala Maidan (नीम वाला मैदान), Taalab Ground (तालाब ग्राउंड), **Kachchi Pitch** (कच्ची पिच, you), Gali Number Chaar (गली नंबर चार). Top three Nadi Kinara Maidan (नदी किनारा मैदान), Lal Mitti Ground (लाल मिट्टी ग्राउंड), Purani Mill Ground (पुरानी मिल ग्राउंड). Near you also Bargad Ka Maidan (बरगद का मैदान) and Chhat Wali Pitch (छत वाली पिच).

## Rukavat: who takes Dadi to the doctor

| | English | Hindi |
|---|---|---|
| Question | Who drives Dadi to the clinic? | दादी को डॉक्टर तक कौन ले जाए? |
| Who says the lines | Dadi | दादी |
| The two numbers | years (driving), scrapes | साल (ड्राइविंग के साल), खरोंचें |
| Cover line | After the news, the family film. | समाचार के बाद, परिवार की फ़िल्म। |
| Hard day | Today, in a lawyer's office. | आज, एक वकील के दफ़्तर में। |
| Next puzzle (unchanged) | Same time tomorrow | कल इसी समय |
| Share card | Wednesday · 9 pm, your road name, Day 6 | बुधवार · रात 9 बजे, आपका रोड नेम, दिन 6 |

The family:

| Person | Years, scrapes | English line | Hindi line |
|---|---|---|---|
| Shampa | 8, 1 | Drives slowly, very nervous. | धीमी ड्राइविंग, बहुत नर्वस। |
| Kunal | 20, 3 | Knows every short cut, drives fast. | हर शॉर्टकट जानते हैं, तेज़ चलाते हैं। |
| Rajan | 8, 1 | Drives slowly, very careful. | धीमी ड्राइविंग, बहुत सावधान। |
| Pooja | 2, 0 | Just got a licence, keen to go. | अभी लाइसेंस मिला, जाने को तैयार। |

The loaded words: Shampa is "nervous" (नर्वस), Rajan is "careful" (सावधान), for the same slow driving.

Road names (Sunday programmes, all invented): friends Geet Ki Shaam (गीत की शाम), Bachchon Ka Ghanta (बच्चों का घंटा), **Sunday Ki Picture** (संडे की पिक्चर, you), Kheti Ki Baat (खेती की बात). Top three Raat Ka Natak (रात का नाटक), Nau Baje Ki Khabar (नौ बजे की ख़बर), Dopahar Ka Serial (दोपहर का सीरियल). Near you also Subah Ka Cartoon (सुबह का कार्टून) and Mausam Ka Haal (मौसम का हाल).

## Rukavat's film title: ideas

**Answered 22 Oct 2026: Dadi Ki Kursi** (दादी की कुर्सी). You chose between Dadi Ki Kursi and Patang Aur Antenna. Dadi Ki Kursi fits the title card at 360 px in English and Hindi, so it is now the title in `design-system/worlds/rukavat.py` (`TITLES`) and in DESIGN.md, in place of "Ghat Ki Raat".

You asked for ideas (your answer of 22 Oct 2026). The title is the evening film's broadcast card on Rukavat's cover, over the slot "Wednesday · 9 pm"; the hard day keeps its own title, "Faisla". A title is a name, so it does not count against the word limit.

**What I kept to.** From the family's own story (Dadi, the house, the TV, the evening); sounds like a 1980s Hindi family film; two to five words; no weekday, because the slot under it already names one; no broadcaster; no caste, religion or party; nothing that gives the day's puzzle away. Left out: "Itwaar Ki Shaam" (Sunday evening, but the slot says Wednesday), "Dadi Ka Faisla" (doubles the hard day's "Faisla"), "Ghar Wapsi" (a phrase tied to a religious conversion campaign) and "Ghar Ka Antenna" (too close to idea 4).

**How I checked.** One web search per title for a Hindi film or TV serial of the same or a very close name, and a second search in Devanagari for the three I recommend. The search tool hands back a summary with its links, so these findings rest on what the links themselves are; open them before you choose.

1. **Dadi Ki Gaadi** (दादी की गाड़ी), "Dadi's car".
   - Fits: it is this world's own puzzle, who drives Dadi to the clinic, and the title this draft first floated.
   - Risks: it gives the twin step away on the cover. It also rhymes with *Daadi Ki Shaadi*, a Hindi film with Neetu Kapoor and Kapil Sharma released in May 2026, so many players will hear that film.
   - Search: **near clash.** Nothing is called Dadi Ki Gaadi, but *Daadi Ki Shaadi* (2026) is one sound away.
2. **Dadi Ki Kursi** (दादी की कुर्सी), "Dadi's chair".
   - Fits: the best seat in front of the TV is Dadi's and no one sits in it. Who sits where is who counts in the house.
   - Risks: "kursi" is also everyday talk for political office, so a few will hear a power struggle. Mild, and no party.
   - Search: **clear.** Nothing of this name in English or Devanagari; the nearest is again *Daadi Ki Shaadi* (2026), a different word.
3. **Chabi Ka Guchha** (चाबी का गुच्छा), "The bunch of keys".
   - Fits: the keys at Dadi's waist are the house: the almirah, the store room, in many homes the TV cabinet too. Very 1980s, very Indian.
   - Risks: the keys passing from mother-in-law to daughter-in-law is a stock serial plot, so a few may expect a saas-bahu story.
   - Search: **clear.** Nothing of this name in English or Devanagari; the Devanagari search found only *Locke & Key*, an American Netflix series.
4. **Patang Aur Antenna** (पतंग और एंटीना), "The kite and the antenna".
   - Fits: the kite caught in the rooftop antenna is in Rukavat's own paintings, and the evening's picture hangs on that antenna.
   - Risks: it sounds more like a children's film than a family drama, and "antenna" may bring the 2021 film *Antenna* to mind.
   - Search: **clear.** Nothing of this name in English or Devanagari. It shares one word each with films called *Patang* (Goutam Ghose, 1993; Prashant Bhargava, 2011; a Telugu film, 2025) and with *Antenna* (2021).
5. **Antenna Ghumao** (एंटीना घुमाओ), "Turn the antenna".
   - Fits: someone on the roof turning the antenna while the family shouts "aaya? aaya?" from below is the era's shared memory.
   - Risks: a comedy title on a family film's card, and the memory is already a film's whole story.
   - Search: **near clash.** Nothing of this name, but *Antenna* (2021, directed by Shoib Nikash Shah, on ShemarooMe) is about this very memory; one link's headline says "'Antenna' would take '90s kids back to childhood".
6. **Bijli Chali Gayi** (बिजली चली गई), "The power's gone".
   - Fits: the power cut in the middle of the Sunday film is every family's 1980s evening.
   - Risks: a power cut is itself an interruption, so Rukavat's own interruption card ("Rukavat ke liye khed hai") would be making the same joke twice. It is also an everyday sentence more than a title.
   - Search: **clear.** Several films carry "Bijli" in the name (*Chamakti Bijli*, 1946; *Chanda Aur Bijli*, 1969), but none this one. The search summary says the phrase turns up as a line of dialogue in *Batti Gul Meter Chalu* (2018).
7. **Ek Shaam Dadi Ke Naam** (एक शाम दादी के नाम), "An evening for Dadi".
   - Fits: the warmest of the ten: it gives the evening to Dadi, who says every line.
   - Risks: "Ek shaam ... ke naam" is how tribute and memorial evenings are named, so it can read as if Dadi has died. At five words it is the longest and may take two lines on the card.
   - Search: **clear.** Nothing of this name.
8. **Aaj Sab Ghar Par** (आज सब घर पर), "Everyone's home tonight".
   - Fits: plain and true: the one night the whole house is in one room.
   - Risks: its last two words echo *Bhabiji Ghar Par Hain!*, a Hindi sitcom running since 2015, and it is plain to the point of flat.
   - Search: **clear, with an echo.** Nothing of this name; the nearest is *Bhabiji Ghar Par Hain!*.
9. **Khana Thanda Ho Gaya** (खाना ठंडा हो गया), "The food's gone cold".
   - Fits: dinner waits while the film runs; every house has said it.
   - Risks: it puts the cook, and the scolding, into the title, and in most homes of the time the cook was a woman: a gender script on the cover of a game about noticing them. Long, too.
   - Search: **clear.** Nothing of this name.
10. **Beti Ghar Aayi** (बेटी घर आई), "The daughter's come home".
    - Fits: Uma, Dadi's youngest, is back home with her husband; it is the household's own news.
    - Risks: Uma's return leads into the separation twin, so the cover would point at the hard topic, and "the daughter has come back" carries an old shame.
    - Search: **near clash.** *Lakshmi Ghar Aayi* (a TV serial from 2021, about dowry by the search summary) and *Mere Ghar Aayi Ek Nanhi Pari* (a serial from 2009) are both close, and Lakshmi brings a goddess's name with it.

**My three.**

1. **Chabi Ka Guchha.** From the house, right for the era, clear in both scripts, and it gives nothing away. Whoever holds the keys runs the house, which is what Rukavat's day is about without saying so.
2. **Dadi Ki Kursi.** Puts Dadi, the speaker, in the title without naming the puzzle. Clear; the political echo of "kursi" is mild.
3. **Patang Aur Antenna.** The only one drawn from Rukavat's own picture. Clear, and lighter in tone.

Not these: Dadi Ki Gaadi (gives the twin away and sounds like *Daadi Ki Shaadi*), Antenna Ghumao (the 2021 film's own story), Beti Ghar Aayi (points at the hard topic, and is near *Lakshmi Ghar Aayi*).

Done 22 Oct 2026: Dadi Ki Kursi is in `TITLES[False]` in `design-system/worlds/rukavat.py` and in DESIGN.md, and it fits the title card at 360 px.

Links the findings rest on: [Daadi Ki Shaadi, IANS](https://ianslive.in/neetu-kapoor-kapil-sharma-starrer-daadi-ki-shaadi-to-be-out-on-may-8th--20260410165747); [Patang (1993 film)](https://en.wikipedia.org/wiki/Patang_(1993_film)); [Patang (2025 film)](https://en.wikipedia.org/wiki/Patang_(2025_film)); [Antenna (2021), DT Next](https://www.dtnext.in/antenna-would-take-90s-kids-back-to-childhood-director-shoib-nikash-shah); [Chamakti Bijli](https://en.wikipedia.org/wiki/Chamakti_Bijli); [Chanda Aur Bijli](https://en.wikipedia.org/wiki/Chanda_Aur_Bijli); [Batti Gul Meter Chalu review, FilmiBeat](https://filmibeat.com/bollywood/reviews/2018/batti-gul-meter-chalu-review-and-rating-shahid-kapoor-shraddha-kapoor-277602.html); [Bhabiji Ghar Par Hain!](https://en.wikipedia.org/wiki/Bhabiji_Ghar_Par_Hain!); [Lakshmi Ghar Aayi](https://en.wikipedia.org/wiki/Lakshmi_Ghar_Aayi); [Mere Ghar Aayi Ek Nanhi Pari](https://en.wikipedia.org/wiki/Mere_Ghar_Aayi_Ek_Nanhi_Pari).

## Shared words made shorter

Every screen must stay within 15 words on a puzzle step and 20 elsewhere, in both languages. Names, numbers and what a named person says do not count. To get there, these shared words changed in every world:

| Where | Was | Now |
|---|---|---|
| Hard-day cover | Today is set in a family court. / आज की कहानी एक पारिवारिक अदालत में है। | Today, in a family court. / आज, एक पारिवारिक अदालत में। |
| Day off cover | the day's line under the title as well as "Tuesday off. Streak kept." | "Tuesday off. Streak kept." takes the line's place until Play |
| Cover level, Hindi | लेवल 3, 6 में से | लेवल 3/6 (English stays "Level 3 of 6") |
| Rule chips, Hindi | सबसे ज़्यादा ख़ाली घंटे · सबसे ज़्यादा हुनर | सबसे ज़्यादा फ़ुर्सत · सबसे हुनरमंद |
| Sunday button, Hindi | फिर से देखें | दोबारा देखें |
| Second Sunday | Weekly lean, of 100 / हर हफ़्ते का झुकाव, 100 में से | Lean, of 100 / झुकाव, 100 में से |
| Second Sunday | Too early yet. / अभी जल्दी है। | Too early. / अभी जल्दी। |
| "Your numbers" sheet | Picks that agree. How far you tip. 0 is none. Grows as you play. | Picks that agree. How far you tip. Grows with play. (Hindi: मेल खाते फ़ैसले। कितना झुकते हैं। खेलने से बढ़ता।) |
| Month recap | What did you notice this month? The words, Who gets checked, Who gets sent | What did you notice? Words, Checks, Picks (Hindi: आपने क्या देखा? शब्द, जाँच, किसे भेजा) |
| Month recap, Hindi | बदलाव के लिए 3 चाहिए। | बदलाव को 3 चाहिए। |
| What helped? | Checking the record, Noticing the words / किस चीज़ से मदद मिली? शब्दों पर ध्यान | Checking records, Noticing words / किससे मदद मिली? शब्द देखना |
| In life | Did something like this come up? I spoke up, It came up, Not yet. Stays on this phone. | Did this come up? Spoke up, Saw it, Not yet. This phone only. (Hindi: क्या ऐसा कभी हुआ? कुछ कहा, देखा, अभी नहीं। सिर्फ़ इस फ़ोन पर।) The old "I spoke up" also broke the rule against "I" on a button. |
| Week plate | "Ghat Series" and "Chandni Mandal" counted as words | they are names, so they no longer count, like Station's place names |

## Questions for you

1. **Road names in Hindi.** Road names are what players type, so the Board shows them as typed, in English letters, in both languages (as Lugdi's do). The Hindi spellings above are for players who type in Devanagari. Keep it that way? **Answered 22 Oct 2026: yes.** Every road name shows exactly as typed, in English letters on the English and the Hindi screens alike, and in Devanagari for a player who types it that way (F-80).
2. **Rukavat's film title is still "Ghat Ki Raat".** It is the title on Rukavat's cover and in DESIGN.md, and it echoes Lugdi's ghat. A title from the family's own story, such as "Dadi Ki Gaadi", would finish the split. Change it? **22 Oct 2026: you asked for ideas.** Ten are in [Rukavat's film title: ideas](#rukavats-film-title-ideas), with three recommended. **Answered 22 Oct 2026: Dadi Ki Kursi** (दादी की कुर्सी), chosen between Dadi Ki Kursi and Patang Aur Antenna. It fits the cover's title card at 360 px in English and Hindi, and replaces "Ghat Ki Raat" in `rukavat.py` and DESIGN.md.
3. **Two Station words still come from the old road.** The words step's luggage tag says Gurpreet "drives the night bus", and the result ticket says "Driver Sunil". A railway version would be a train and a loco pilot. Change them? **Answered 22 Oct 2026: yes, change them, and think more Indian.** The tag now has Kiran as the loco pilot of the night train, and the ticket says "Loco pilot Sunil". Both, with six more railway changes for you to look at, are in [Station strings to change in the library](#station-strings-to-change-in-the-library), to apply after the metal pass.
4. **The loaded words.** Each pair is a guess at a word people say of a woman and not of a man: stubborn and firm, moody and intense, bossy and assertive, nervous and careful. Please check each one sounds that way to Hindi-first players too. **Answered 22 Oct 2026: they stand.** All four pairs stay as written. They go to the five Hindi-first players' read aloud, who check that each pair sounds, in Hindi too, like a word said of a woman and not of a man; any pair that does not is redrafted.
