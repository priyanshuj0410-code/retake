---
type: content-draft
title: The First take, "Dadi's trunk", full script (draft for the owner)
description: Every cutscene panel (caption in English and Hindi, and what is painted), every decision (question, scene line, cards with numbers and notes, the hidden matched pair, the twin and which side the nudge is on, where family members sit), each chapter's closing and the diary finale. Built on the story bible in this folder. Decisions are in English; their Hindi waits for the research check. Nothing here is built.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-18/
---

# The First take: "Dadi's trunk"

People are in [people.md](people.md), years in [timeline.md](timeline.md), places and art in [situations.md](situations.md), and the family rules in [family-as-options.md](family-as-options.md). The premise is in [../content/narrative-draft-2026-10-23.md](../content/narrative-draft-2026-10-23.md).

## How to read this script

- **Cutscene panels** list: the era style, what is painted, then the caption in English and Hindi. Captions are at most 12 words, not counting who speaks, and they invite the player in: the family talking, a joke, a small mystery, a sound or a smell of the place. Never a test or a dare; the player is welcomed, and Dadi hands over the calls (owner, 23 Oct 2026: "they should invite the players in, engage them, not just challenge them"). `design-system/tools/captions_2026_10_23.py` holds this pass. The Hindi is a first draft for a native reader. Paintings carry no readable text and no religious or political symbols.
- **Decisions** list:
  - the kind and its twin;
  - the question;
  - the scene line, said by the chapter's speaker and naming no one;
  - the two numbers shown, under a key;
  - every card, as name (number, number), then its note.

  Note marks:

  | Mark | Means |
  |---|---|
  | **[N]** | the nudge, on one of the matched pair |
  | **[=]** | the pair's other half, a neutral note of the same weight |
  | **[d]** | a decoy note on a card outside the pair; "X says" marks gossip |
  | **[F]** | a family member, placed under [family-as-options.md](family-as-options.md) |
- **The matched pair** is always one woman and one man with the same numbers. Twins are four decisions apart in the same chapter. The two halves of a twin share no person except a family member. No pair repeats anywhere, except the batting order's two stages, which share theirs by design.
- **Hard facts** are said only of names that mark no community ([people.md](people.md)).
- **Every note in a decision runs the same length** (owner, 23 Oct 2026: "For quotes, we are falling in the trap that the longest quotes are the right one"; before, the longest note sat on the pair in 34 of 40 decisions). The words differ by at most 2, the pair's two match exactly, and the longest line falls on the pair in at most half the decisions. `story_take.length_faults` checks it and `demo.py` will not build a set that fails; `design-system/tools/notes_2026_10_23.py` holds the pass. A hard fact is trimmed to the decision's length, never padded around.
- **Answer buttons** follow the existing pattern: "Send {name}", "Lock the order", and so on.

## Opening (2026, the present-day style; about 60 seconds)

| # | What is painted | Caption |
|---|---|---|
| 0.1 | A rainy evening outside a Nashik flat; a small tempo unloading boxes under a streetlight | Seventy-eight years, one small tempo. Dadi is moving in. / अठहत्तर साल, एक छोटा-सा टेम्पो। दादी रहने आ रही हैं। |
| 0.2 | Dadi, 78, in a cardigan over a cotton sari, her steel watch, looking at the rain from the doorway | Dadi: "Careful with my trunk! It's older than all of you." / दादी: "मेरा संदूक ध्यान से! ये तुम सबसे पुराना है।" |
| 0.3 | Vikram dragging the long trunk up the stairs by its end handle, laughing at its weight | Vikram, her son: "Ma, what's in here? Bricks?" Dadi: "Half a century." / विक्रम, उनका बेटा: "माँ, इसमें क्या है? ईंटें?" दादी: "आधी सदी।" |
| 0.4 | Meera, 46, arriving with a tray of tea, eyebrows raised | Meera, his wife: "Half a century? Then I'm making more tea." / मीरा, उसकी पत्नी: "आधी सदी? तो मैं और चाय बनाती हूँ।" |
| 0.5 | Tara, 22, sitting cross-legged on the floor beside an old painted tin storage trunk, her hand on the painted parrots on its lid | Tara, their daughter: "Dadi, who were you before you were Dadi?" / तारा, उनकी बेटी: "दादी, दादी बनने से पहले आप कौन थीं?" |
| 0.6 | The trunk on the floor seen from above with its lid standing wide open, the plain maroon inside of the lid showing; laid inside on the flowered lining: a railway pass, a pulp novel, a ticket stub, a scorecard, a wedding card, a cloth-bound diary | Dadi: "Five days this family still argues about." / दादी: "पाँच दिन, जिन पर ये परिवार आज भी बहस करता है।" |
| 0.7 | Dadi holding out the railway pass to the viewer | Dadi: "Here, beta. You make the calls. I'll tell you what happened." / दादी: "लो बेटा। फ़ैसले तुम करोगे। क्या हुआ, वो मैं बताऊँगी।" |

## Chapter 1. 1971, Manmad junction: "The week the new engines came" (work)

**Speaker:** Gurpreet, station master. **Gossip:** Mohan. **Family option:** Mohan, in Station 2 and 6.

**Chapter card:** "1971 · Work · About 4 minutes", with the line "The new engines, and complaints of bullying in the shed." / "नए इंजन, और शेड में बदसलूकी की शिकायतें।"

### The way in

| # | Style | What is painted | Caption |
|---|---|---|---|
| 1.1 | 2026 | Dadi's hand lifting the railway pass from the trunk | My first railway pass. I slept with it under my pillow. / मेरा पहला रेलवे पास। तकिये के नीचे रखकर सोती थी। |
| 1.2 | seam, 2026 into 1971 | The pass's small photo of young Asha, opening into Manmad's platform | Me at twenty-three. Manmad junction, 1971: smoke, chai and whistles. / मैं, तेईस साल की। मनमाड जंक्शन, 1971: धुआँ, चाय और सीटियाँ। |
| 1.3 | 1971 | Young Asha at the crew board; beside her Mohan, sooty and grinning | My brother Mohan fed the steam engines. And sang to them. / मेरा भाई मोहन भाप के इंजन में कोयला झोंकता था। और उन्हें गाना सुनाता था। |
| 1.4 | 1971 | A boxy modern locomotive with no chimney and no smoke rolling into the steam shed, the sooty steam crews watching it | Then the new engines rolled in. Faster, and needing fewer hands. / फिर नए इंजन आए। ज़्यादा तेज़, और कम लोगों से चलने वाले। |

### The twins

| Twin | What it looks at | Kind | Nudge on the woman | Nudge on the man |
|---|---|---|---|---|
| 1 and 5 | The same firmness called "pushy" in one and "takes charge" in the other | plain, pick 2 of 4 | 1 | 5 |
| 2 and 6 | Six months off to nurse a sick father | plain, rank 2 seats, Mohan in both | 2 | 6 |
| 3 and 7 | Only one has learned the section | matters, pick one | 3 | 7 |
| 4 and 8 | A complaint of bullying moved a foreman: is the one who made it held back? | hard, pick one | 8 | 4 |

### The decisions

1. **The first run.** Pick 2 of 4; twin 5.
   - **Question:** Pick 2 to crew the first run to Bhusawal. | **Scene:** "The new engine leaves at dawn, with the press on the platform."
   - **Key:** years on the line, signals missed.
   - **Cards:**
     - Mumtaz (11, 0) "Pushy with the guards, every single shift." [N]
     - Nagsen (11, 0) "Takes charge with the guards, every shift." [=]
     - Prakash (7, 2) "Still learning the new controls, Mohan says." [d]
     - Annamma (4, 0) "New on the line, keen as anything." [d]
   - **Pair:** Mumtaz and Nagsen.
2. **The new-engine course.** Rank for 2 seats; twin 6.
   - **Question:** Rank them for the 2 seats on the new-engine course. | **Scene:** "Two seats. The steam men know what that means."
   - **Key:** marks, days late.
   - **Cards:**
     - Annamma (88, 0) "Came top of the steam exam this year." [d]
     - Mohan (78, 1) "Asha's brother. Fires the old steam engines." [F]
     - Yasmin (72, 2) "Took six months off to nurse her father." [N]
     - Rohit (72, 2) "Transferred here last year from the Pune shed." [=]
     - Nagsen (64, 4) "Asks for the day shift every single week." [d]
   - **Pair:** Yasmin and Rohit.
3. **The ghat section.** Pick one; twin 7; matters.
   - **Question:** Who drives the ghat section tonight? | **Scene:** "Rain on the ghat. Only a crew who has learned it may take it."
   - **Key:** years on the line, signals missed.
   - **Cards:**
     - Annamma (8, 1) "Has learned the whole ghat section." [N]
     - Francis (8, 1) "Knows the plains line by heart." [=]
     - Sunil (5, 0) "Wants every Sunday off this month." [d]
     - Yasmin (3, 2) "Never once late, never once early." [d]
   - **Pair:** Annamma and Francis.
4. **The safety armband.** Pick one; twin 8; hard.
   - **Question:** Who wears the shed's safety armband? | **Scene:** "The armband needs a new owner. The old foreman has been moved."
   - **Key:** years on the line, signals missed.
   - **Cards:**
     - Sunil (12, 0) "Reported bullying by the foreman, who was moved." [N]
     - Annamma (12, 0) "Runs the shed's first-aid box and stretcher drills." [=]
     - Rohit (9, 1) "Sharp on the rule book, quotes it daily." [d]
     - Yasmin (6, 2) "New to the shed, still finding her way." [d]
   - **Pair:** Annamma and Sunil.
5. **The Daund goods.** Pick 2 of 4; twin 1.
   - **Question:** Pick 2 to crew the Daund goods tonight. | **Scene:** "The yard wants a crew by ten. The rain has started."
   - **Cards:**
     - Kiran (9, 1) "Takes charge with the yard staff, always." [=]
     - Sunil (9, 1) "Pushy with the yard staff, every shift." [N]
     - Francis (5, 3) "Back from a week's leave, Mohan says." [d]
     - Yasmin (3, 0) "Asks a lot of questions in drills." [d]
   - **Pair:** Kiran and Sunil.
6. **The signal course.** Rank for 2 seats; twin 2.
   - **Question:** Rank them for the 2 seats on the signal course. | **Scene:** "The signal course takes two. The old foreman retires on Friday."
   - **Key:** marks, days late.
   - **Cards:**
     - Francis (86, 0) "Came top of his batch at training school." [d]
     - Mohan (77, 1) "Asha's brother. Fires the old steam engines." [F]
     - Kiran (71, 2) "Transferred here last year from the Kalyan shed." [=]
     - Prakash (71, 2) "Took six months off to nurse his father." [N]
     - Sunil (63, 4) "Late twice this month, both times on Mondays." [d]
   - **Pair:** Kiran and Prakash.
7. **The flood bridge.** Pick one; twin 3; matters.
   - **Question:** Who takes the night mail over the river in flood? | **Scene:** "The river is high. The bridge section needs someone who has learned it."
   - **Cards:**
     - Mumtaz (10, 0) "Knows every signal on the plains." [=]
     - Rohit (10, 0) "Has learned the whole bridge section." [N]
     - Kiran (6, 1) "Never missed a shift, Mohan says." [d]
     - Nagsen (4, 3) "Just back from the Pune shed." [d]
   - **Pair:** Mumtaz and Rohit.
8. **The safety school.** Pick one; twin 4; hard.
   - **Question:** Who goes to the safety school in Bhusawal? | **Scene:** "One seat at the safety school. The yard foreman has been transferred."
   - **Cards:**
     - Kiran (11, 1) "Reported the yard foreman's bullying; he was moved." [N]
     - Nagsen (11, 1) "Keeps the yard's logbook, neat to the minute." [=]
     - Francis (8, 2) "Wants the course badly, or so Mohan says." [d]
     - Mumtaz (5, 0) "Prefers the night shift, when the yard's quiet." [d]
   - **Pair:** Kiran and Nagsen.

**The pair rules hold:**
- Twin 1 and 5 share no one, and neither do 3 and 7 or 4 and 8.
- Twin 2 and 6 share only Mohan, second of five on marks in both.
- All eight pairs are different.
- The hard facts are on Sunil and Kiran.

### The way out

| # | Style | What is painted | Caption |
|---|---|---|---|
| 1.9 | 1971 | Dawn; the new engine pulling out; a crowd on the platform | Friday, dawn. The first run left on time. Half the town came. / शुक्रवार, सुबह-सुबह। पहली गाड़ी समय पर निकली। आधा शहर देखने आया। |
| 1.10 | 2026 | Tara turning to Dadi, curious; Dadi holding up a finger | Tara: "Did Mohan nana get the course?" Dadi: "All in good time." / तारा: "मोहन नाना को कोर्स मिला?" दादी: "सब्र करो, बताऊँगी।" |

## Chapter 2. 1977, the Kasara ghat: "Onion season" (safety and justice)

**Speaker:** Bauji. **Gossip:** Mohan, now a driver. **Family option:** Ramesh, in Lugdi 1 and 5.

**Chapter card:** "1977 · Safety and justice · About 4 minutes", with the line "Night runs, and reports of being followed." / "रात के फेरे, और पीछा किए जाने की रिपोर्टें।"

### The way in

| # | Style | What is painted | Caption |
|---|---|---|---|
| 2.1 | 2026 | Dadi's hand lifting a dog-eared pulp novel | By 1977 I'd married into a trucking family. Loud, all of them. / 1977 तक मैं ट्रक वाले परिवार की बहू बन चुकी थी। सब के सब ऊँची आवाज़ वाले। |
| 2.2 | seam, 2026 into 1977 | The pulp novel's painted cover, opening into the family's truck depot at night | Bauji ran four trucks over the Kasara ghat. Nobody argued with Bauji. / बाऊजी के चार ट्रक कसारा घाट पर चलते थे। बाऊजी से कोई बहस नहीं करता था। |
| 2.3 | 1977 | Ramesh, bare-headed, at the wheel and humming; Mohan, clean-shaven, beside him in a driver's cap pushed back | My husband Ramesh drove, humming film songs. Mohan rode beside him now. / मेरे पति रमेश फ़िल्मी गाने गुनगुनाते हुए ट्रक चलाते। अब मोहन भी साथ होता। |
| 2.4 | 1977 | Onion sacks under tarpaulins in the rain; a lantern; men talking low | Onion season. Rain, lanterns, and talk of robbers on the ghat. / प्याज़ का मौसम। बारिश, लालटेन, और घाट पर लुटेरों की बातें। |

### The twins

| Twin | What it looks at | Kind | Nudge on the woman | Nudge on the man |
|---|---|---|---|---|
| 1 and 5 | Family worry keeps someone off paid night work | plain, rank for 3 trucks, Ramesh in both | 1 | 5 |
| 2 and 6 | A report of being followed at night, doubted | hard, spend checks (up to 2) | 6 | 2 |
| 3 and 7 | The same driving called "reckless" in one and "bold" in the other | plain, pick one | 3 | 7 |
| 4 and 8 | Only one holds the hazardous-goods licence | matters, pick 3 | 4 | 8 |

### The decisions

1. **The night convoy.** Rank for 3 trucks; twin 5.
   - **Question:** Rank them for the 3 trucks in the night convoy. | **Scene:** "Onions for Mumbai. Three trucks leave at midnight."
   - **Key:** trips, crashes.
   - **Cards:**
     - Etwari (75, 0) "Loads fastest at the depot, every time." [d]
     - Ramesh (60, 1) "Asha's husband. Drives the old green truck." [F]
     - Jasleen (41, 1) "Her family worries about her night runs." [N]
     - Dinesh (41, 1) "Drives the blue truck, mostly on nights." [=]
     - Nirmala (30, 2) "Keeps asking for night runs, Mohan says." [d]
   - **Pair:** Jasleen and Dinesh.
2. **The road reports.** Spend checks, up to 2; twin 6; hard.
   - **Question:** Whose reports do you take up? | **Scene:** "This week's road reports, open in the logbook."
   - **Key:** years on the road, night runs this month.
   - **Cards:**
     - Dinesh (9, 5) "Says a car followed his truck down the ghat. Scares easily." [N]
     - Kusum (9, 5) "Says a car followed her truck down the ghat. Drives nights." [=]
     - Baldev (22, 2) "Says a tyre burst near the toll last night. Hates delays." [d]
     - Nirmala (14, 7) "Says she was fined at the check post. Short on cash." [d]
   - **Pair:** Kusum and Dinesh.
3. **The hill route.** Pick one; twin 7.
   - **Question:** Who stays on the hill route? | **Scene:** "Two trucks scraped the hairpin last month. One stays on the hill route."
   - **Key:** loads, days late.
   - **Cards:**
     - Baldev (80, 0) "Slow, but never scraped." [d]
     - Nirmala (64, 1) "Reckless on the bends." [N]
     - Velu (64, 1) "Bold on the bends." [=]
     - Kusum (52, 3) "Brakes too late, Mohan says." [d]
   - **Pair:** Nirmala and Velu.
4. **The gas cylinder run.** Pick 3 of 5; twin 8; matters.
   - **Question:** Pick 3 for the gas cylinder run. | **Scene:** "One truck carries gas cylinders. It needs the hazardous-goods licence."
   - **Key:** runs, fines.
   - **Cards:**
     - Anthony (44, 0) "Steady on the ghat road." [d]
     - Velu (36, 2) "Careful on bends, Mohan says." [d]
     - Kusum (30, 1) "Holds the hazardous-goods licence now." [N]
     - Baldev (30, 1) "Drives the long Mumbai run." [=]
     - Nirmala (18, 3) "Wants the day shift again." [d]
   - **Pair:** Kusum and Baldev.
5. **The cash run.** Rank for 3 trucks; twin 1.
   - **Question:** Rank them for the 3 trucks on the cash run. | **Scene:** "Cash for the onion growers goes down at dawn. Three trucks."
   - **Key:** trips, crashes.
   - **Cards:**
     - Saroj (72, 0) "Never once late in six whole years." [d]
     - Ramesh (58, 1) "Asha's husband. Drives the old green truck." [F]
     - Kusum (40, 1) "Drives the red truck, mostly on nights." [=]
     - Velu (40, 1) "His family worries about his ghat runs." [N]
     - Anthony (28, 2) "Back from leave this week, Mohan says." [d]
   - **Pair:** Kusum and Velu.
6. **The river road reports.** Spend checks, up to 2; twin 2; hard.
   - **Question:** Whose reports go to the police post? | **Scene:** "Another week. The river road this time."
   - **Key:** years on the road, night runs this month.
   - **Cards:**
     - Saroj (14, 7) "Says a car stayed behind her along the river road. Imagines things." [N]
     - Anthony (14, 7) "Says a car stayed behind him along the river road. Drives nights." [=]
     - Jasleen (6, 2) "Says a fallen tree blocked the river road at dusk. Hates detours." [d]
     - Etwari (30, 1) "Says the brakes felt soft on the long slope down. Wants repairs." [d]
   - **Pair:** Saroj and Anthony.
7. **The river route.** Pick one; twin 3.
   - **Question:** Who stays on the river route? | **Scene:** "Two dents at the river bend this month. One stays on that route."
   - **Key:** loads, days late.
   - **Cards:**
     - Saroj (80, 0) "Never once scraped the paint." [d]
     - Etwari (64, 1) "Bold at the river bend." [=]
     - Dinesh (64, 1) "Reckless at the river bend." [N]
     - Jasleen (52, 3) "Takes it wide, Mohan says." [d]
   - **Pair:** Etwari and Dinesh.
8. **The kerosene run.** Pick 3 of 4; twin 4; matters.
   - **Question:** Pick 3 for the kerosene run. | **Scene:** "One truck carries kerosene drums. It needs the hazardous-goods licence."
   - **Key:** runs, fines.
   - **Cards:**
     - Jasleen (44, 0) "Steady in the heavy rain." [d]
     - Saroj (30, 1) "Drives the short local runs." [=]
     - Dinesh (30, 1) "Holds the hazardous-goods licence now." [N]
     - Etwari (22, 2) "Just back from her leave." [d]
   - **Pair:** Saroj and Dinesh.

**The pair rules hold:**
- The halves of each twin share no one, except Ramesh, second of five on trips in both halves of 1 and 5.
- All eight pairs are different.
- The hard facts are on Dinesh and Saroj.

### The way out

| # | Style | What is painted | Caption |
|---|---|---|---|
| 2.9 | 1977 | Dawn at the depot: four trucks parked in one straight row under the tin roof, seen from a little way off, mud to the axles | Every truck came home that season. Muddy to the axles, but home. / उस मौसम हर ट्रक घर लौटा। कीचड़ में सना, पर घर। |
| 2.10 | 2026 | Meera smiling and leaning in to tease Dadi; Dadi unimpressed, arms folded, in Dadi's room | Meera: "You waited up every night?" Dadi: "I counted every truck home." / मीरा: "आप हर रात जागती थीं?" दादी: "हर ट्रक लौटने तक गिनती रहती थी।" |

## Chapter 3. 1984, the winter fair: "The magician's cash box" (trust)

**Speaker:** Kader, the magician. **Gossip:** Pallavi. **Family option:** none; every decision is a single pick.

**Chapter card:** "1984 · Trust · About 4 minutes", with the line "Show nights, and harassment reports backstage." / "शो की रातें, और परदे के पीछे छेड़छाड़ की शिकायतें।"

### The way in

| # | Style | What is painted | Caption |
|---|---|---|---|
| 3.1 | 2026 | Dadi's hand lifting a red-and-gold ticket stub | 1984. My cousin Pallavi ran away. With a magic show! / 1984। मेरी बहन पल्लवी भाग गई। एक जादू के शो के साथ! |
| 3.2 | seam, 2026 into 1984 | The stub's gold stars, opening into the show's banner over the fair | Drums and lamps: the Chandni Mandal had come to the winter fair. / ढोल और लालटेनें: चाँदनी मंडल सर्दियों के मेले में आया था। |
| 3.3 | 1984 | Pallavi in a sequinned costume, laughing backstage; Asha with Rani and Vikram in the crowd | Pallavi was the magician's assistant. She knew every trick, and every secret. / पल्लवी जादूगर की सहायक थी। हर करतब जानती थी, और हर राज़। |
| 3.4 | 1984 | A tin cash box open on a table backstage, a lamp, an empty stool | Then, on the last night, the cash box came up short. / फिर, आख़िरी रात, पैसों का डिब्बा कम निकला। |

### The twins

| Twin | What it looks at | Kind | Nudge on the woman | Nudge on the man |
|---|---|---|---|---|
| 1 and 5 | A harassment report backstage; the witness called dramatic | hard, Believe | 1 | 5 |
| 2 and 6 | Money trusted by gender ("careful, the way women are"; "a man for the highway") | plain, pick 2 of 4 | 2 | 6 |
| 3 and 7 | Who saw it, and who was only told | matters, Believe | 7 (she saw) | 3 (he saw) |
| 4 and 8 | A sibling in the rival troupe | plain, rank for 2 keys | 4 | 8 |

**Believe cards** show each person's account as the line and the note under it. That needs a second line on the card, a small design change for the sketch sheet.

### The decisions

1. **The costume tent.** Believe; twin 5; hard.
   - **Question:** Whose statement goes in the report? | **Scene:** "A man from the audience followed a dancer backstage. The fair's officials want one statement."
   - **Key:** years on stage, shows missed.
   - **Cards:**
     - Sarla (9, 0): "He followed her to the costume tent and would not go." / "Makes a drama out of everything." [N]
     - Thomas (9, 0): the same account / "Has worked the lights nine years." [=]
     - Jonali (7, 1): "He came in by the back gate after the last show." / "Saw him near the gate, Pallavi says." [d]
     - Gopal (4, 3): "He left the grounds when the watchman came with a lamp." / "New with the troupe this season." [d]
   - **Pair:** Sarla and Thomas.
2. **Cash to the next town.** Pick 2 of 4; twin 6.
   - **Question:** Pick 2 to carry the cash to the next town. | **Scene:** "The lorry leaves at dawn. Two go with the cash box."
   - **Key:** trips, times short.
   - **Cards:**
     - Dolly (30, 0) "Careful with money, the way women are." [N]
     - Gopal (30, 0) "Rides with the lorry on every move." [=]
     - Mitali (22, 2) "Always counts the takings twice, Pallavi says." [d]
     - Cyrus (15, 4) "Loses his ticket book every other week." [d]
   - **Pair:** Dolly and Gopal.
3. **The lamp at rehearsal.** Believe; twin 7; matters (he saw it).
   - **Question:** Whose story do you believe? | **Scene:** "The big lamp fell at rehearsal. Nobody was hurt."
   - **Key:** towns, slips.
   - **Cards:**
     - Jonali (60, 1): "Someone told me. The hook gave way." [=]
     - Cyrus (60, 1): "I saw it. The hook gave way." [N, the detail that matters]
     - Thomas (40, 1): "The stand was never tied down properly." [d]
     - Gopal (22, 2): "I think someone knocked it by mistake." [d]
   - **Pair:** Jonali and Cyrus.
4. **The ticket tin.** Rank for 2 keys; twin 8.
   - **Question:** Rank them for the 2 keys to the ticket tin. | **Scene:** "The ticket tin has two keys for the move."
   - **Key:** shows, days late.
   - **Cards:**
     - Mitali (48, 1) "Her brother works for the rival troupe." [N]
     - Naresh (48, 1) "Lodges with the drummer's family in town." [=]
     - Jonali (40, 2) "Counts the tickets every night before bed." [d]
     - Thomas (26, 0) "Joined the troupe in Nashik last month." [d]
   - **Pair:** Mitali and Naresh.
5. **The make-up tent.** Believe; twin 1; hard.
   - **Question:** Whose statement goes to the police post? | **Scene:** "At the next town, a man pushed into the make-up tent after the late show."
   - **Key:** years on stage, shows missed.
   - **Cards:**
     - Naresh (8, 1): "He pushed into the make-up tent and would not leave." / "Always making a scene about something." [N]
     - Pushpa (8, 1): the same account / "Does the make-up for the troupe." [=]
     - Rabia (6, 0): "He ran off the moment the drums started up again." / "Sings the songs in the interval." [d]
     - Lalit (3, 2): "I only heard the shouting from behind the stage curtain." / "New this season, so Pallavi says." [d]
   - **Pair:** Pushpa and Naresh.
6. **The takings.** Pick 2 of 4; twin 2.
   - **Question:** Pick 2 to take the takings to the bank. | **Scene:** "A cloth bag of notes. The bank is across the highway."
   - **Key:** trips, times short.
   - **Cards:**
     - Sarla (35, 0) "Never forgets a receipt, so Pallavi says." [d]
     - Rabia (28, 1) "Knows the bank clerk from her village." [=]
     - Lalit (28, 1) "A man should carry it on highways." [N]
     - Naresh (12, 3) "Late with every errand he is given." [d]
   - **Pair:** Rabia and Lalit.
7. **The generator.** Believe; twin 3; matters (she saw it).
   - **Question:** Whose story do you believe? | **Scene:** "The generator stopped in the second act."
   - **Key:** towns, slips.
   - **Cards:**
     - Dolly (52, 0): "I think the fan belt slipped, that's all." [d]
     - Pushpa (40, 1): "The engine got far too hot, it seems." [d]
     - Mitali (16, 2): "I saw it. It ran out of diesel." [N, the detail that matters]
     - Lalit (16, 2): "Someone told me. It ran out of diesel." [=]
   - **Pair:** Mitali and Lalit.
8. **The cash box key.** Rank for 2 keys; twin 4.
   - **Question:** Rank them for the 2 keys to the cash box. | **Scene:** "Two keys hang on a red thread under the magician's table."
   - **Key:** shows, days late.
   - **Cards:**
     - Pushpa (52, 0) "Sews all the costumes for the troupe." [=]
     - Cyrus (52, 0) "His sister works for the rival troupe." [N]
     - Rabia (35, 1) "Sings in the interval on show nights." [d]
     - Dolly (18, 4) "Always late for the parade, Pallavi says." [d]
   - **Pair:** Pushpa and Cyrus.

**The pair rules hold:**
- The halves of each twin share no one.
- All eight pairs are different.
- The hard facts are on Sarla and Naresh.

### The way out

| # | Style | What is painted | Caption |
|---|---|---|---|
| 3.9 | 1984 | The tin cash box being pulled out from the dark gap under the stage boards by lamplight, the troupe laughing | It had slipped under the stage. Everyone laughed, mostly from relief. / डिब्बा मंच के नीचे खिसक गया था। सब हँसे, ज़्यादातर राहत से। |
| 3.10 | 2026 | Tara wide-eyed; Dadi sipping tea | Tara: "Pallavi masi joined a magic show?" Dadi: "Then taught school. Same skills." / तारा: "पल्लवी मासी जादू के शो में थीं?" दादी: "फिर स्कूल में पढ़ाया। हुनर वही।" |

## Chapter 4. 1992, the old ground: "Two finals" (teams and leaders)

**Speaker:** Shirin, the coach. **Gossip:** Vikram, 14, the scorer. **Family option:** Rani, 18, in Cricket 3 and 7.

**The event:** on one Sunday, the club's first XI plays the mill team and its second XI plays the railway team. The coach picks both sides on Friday night, so the two halves of each twin are different sides and share no one.

**Chapter card:** "1992 · Teams and leaders · About 4 minutes", with the line "Sunday's finals, and complaints of violence at home." / "इतवार के फ़ाइनल, और घरेलू हिंसा की शिकायतें।"

### The way in

| # | Style | What is painted | Caption |
|---|---|---|---|
| 4.1 | 2026 | Dadi's hand lifting a pencil scorecard | Vikram's scorecard. Fourteen, and more serious than the players. / विक्रम का स्कोरकार्ड। चौदह साल का, और खिलाड़ियों से ज़्यादा गंभीर। |
| 4.2 | seam, 2026 into 1992 | The pencil scorecard held in a hand, opening into the tin scoreboard beside a sunny cricket field | Sunday at the old ground. Two finals, one neem tree, everyone watching. / पुराने मैदान पर इतवार। दो फ़ाइनल, एक नीम का पेड़, और सबकी नज़रें। |
| 4.3 | 1992 | Rani alone strapping batting pads onto her own legs at the edge of the field; Vikram at the scorer's table in long trousers, a pencil behind his ear; Ramesh in the stands in trousers, holding a flask | My Rani padded up that year. Her father never missed a ball. / उस साल मेरी रानी ने पैड बाँधे। उसके पापा ने एक भी गेंद नहीं छोड़ी। |
| 4.4 | 1992 | Shirin at a table in the pavilion with two team sheets, evening light | Friday night, the coach had two teams to pick. And a headache. / शुक्रवार रात, कोच को दो टीमें चुननी थीं। और सिरदर्द अलग। |

### The twins

| Twin | What it looks at | Kind | Nudge on the woman | Nudge on the man |
|---|---|---|---|---|
| 1 and 5 | One bad day read as a reason to move someone down | plain, batting order (first stage) | 1 | 5 |
| 2 and 6 | A police complaint of violence at home and the captaincy | hard, batting order (second stage: the captain) | 6 | 2 |
| 3 and 7 | "Rest them for the final, it gets rough" | plain, pick 3 of 5, Rani in both | 3 | 7 |
| 4 and 8 | Only one other keeper | matters, pick 3 of 5 | 4 | 8 |

### The decisions

1. **The first XI's order.** Batting order, first stage; twin 5.
   - **Question:** Set the first XI's batting order. | **Scene:** "Four places at the top. The mill team bowls fast."
   - **Key:** average, matches.
   - **Cards:**
     - Gita (38, 40) "Out first ball last Sunday." [N]
     - Chandan (38, 40) "Fields at slip, most matches." [=]
     - Leena (33, 28) "In good form, Vikram says." [d]
     - Uday (29, 14) "Bats left-handed and hooks well." [d]
   - **Pair:** Gita and Chandan.
2. **The first XI's captain.** Second stage, the same four; twin 6; hard.
   - **Question:** Who captains the first XI? | **Scene:** "The order is locked. The armband is on the bench."
   - **Cards:**
     - Gita "Captained the club's juniors for two full seasons." [=]
     - Chandan "Faces a police complaint for violence at home." [N]
     - Leena "Always chatting with the umpires between the overs." [d]
     - Uday "New to the side, quiet in the nets." [d]
   - **Pair:** Gita and Chandan, shared by design with stage 1.
   - **Painting:** only the armband on the bench, never a home or the police.
3. **The first XI's last places.** Pick 3 of 5; twin 7.
   - **Question:** Pick the last 3 for the first XI. | **Scene:** "Three places left on the first XI's sheet."
   - **Key:** wickets, catches.
   - **Cards:**
     - Kabir (20, 9) "Fielded every ball in last Sunday's match." [d]
     - Rani (17, 7) "Asha's daughter. Bowls tidy off-spin, rarely loose." [F]
     - Zarina (14, 6) "Rest her for the final, it's rough." [N]
     - Tenzing (14, 6) "Always plays in his lucky blue cap." [=]
     - Leena (11, 5) "Drops all the easy ones, Vikram says." [d]
   - **Pair:** Zarina and Tenzing.
4. **The first XI's injuries.** Pick 3 of 5; twin 8; matters.
   - **Question:** Pick 3 to fill the first XI after the injuries. | **Scene:** "Three injured on Friday. Someone has to keep wicket."
   - **Key:** season runs, wins.
   - **Cards:**
     - Leena (220, 10) "The only other keeper in the club." [N]
     - Mani (220, 10) "Bowls a bit of leg-spin when asked." [=]
     - Tenzing (180, 9) "Back in good form lately, Vikram says." [d]
     - Agnes (140, 7) "New to the side this season, keen." [d]
     - Uday (90, 5) "Bats at nine, fields at fine leg." [d]
   - **Pair:** Leena and Mani.
5. **The second XI's order.** Batting order, first stage; twin 1.
   - **Question:** Set the second XI's batting order. | **Scene:** "The railway team has a spinner nobody can read."
   - **Key:** average, matches.
   - **Cards:**
     - Bindu (33, 28) "Fields at point, most matches." [=]
     - Hari (33, 28) "Out first ball last Sunday." [N]
     - Agnes (29, 14) "Bowls quick, so Vikram says." [d]
     - Mani (26, 10) "Bought a new bat this season." [d]
   - **Pair:** Bindu and Hari.
6. **The second XI's captain.** Second stage, the same four; twin 2; hard.
   - **Question:** Who captains the second XI? | **Scene:** "The second XI's armband, on the same bench."
   - **Cards:**
     - Bindu "A neighbour's police complaint says violence at home." [N]
     - Hari "Ran the club's nets all through the winter." [=]
     - Agnes "Argues with the umpires over every single call." [d]
     - Mani "New to the side, still learning the field." [d]
   - **Pair:** Bindu and Hari, shared by design.
7. **The second XI's last places.** Pick 3 of 5; twin 3.
   - **Question:** Pick the last 3 for the second XI. | **Scene:** "Three places left on the second XI's sheet."
   - **Key:** wickets, catches.
   - **Cards:**
     - Gita (20, 9) "Took five catches in last Sunday's game." [d]
     - Rani (17, 7) "Asha's daughter. Bowls tidy off-spin, rarely loose." [F]
     - Bindu (14, 6) "Bowls in the nets every single morning." [=]
     - Uday (14, 6) "Rest him for the final, it's rough." [N]
     - Hari (11, 5) "Very slow between the wickets, Vikram says." [d]
   - **Pair:** Bindu and Uday.
8. **The second XI's keeper.** Pick 3 of 5; twin 4; matters.
   - **Question:** Pick 3 to fill the second XI. | **Scene:** "The second XI's keeper is away."
   - **Key:** season runs, wins.
   - **Cards:**
     - Zarina (220, 10) "Bowls fast, but only in short spells." [=]
     - Hari (220, 10) "The only other keeper in the club." [N]
     - Kabir (180, 9) "Never misses the nets, rain or shine." [d]
     - Gita (140, 7) "Back from a knock on the knee." [d]
     - Chandan (90, 5) "Bats at ten, bowls a few overs." [d]
   - **Pair:** Zarina and Hari.

**The pair rules hold:**
- The halves of each twin share no one, except Rani, second of five on wickets in both halves of 3 and 7. Rani sits on both sides' lists, as the club's spare bowler.
- The pairs are all different, except each batting order's two stages, which share theirs.
- The hard facts are on Chandan and Bindu.

### The way out

| # | Style | What is painted | Caption |
|---|---|---|---|
| 4.9 | 1992 | Dusk by the tin scoreboard; Vikram seen side on, holding a full scorecard in his left hand and writing on it with a pencil in his right | Both finals went to the last over. Vikram forgot to breathe. / दोनों फ़ाइनल आख़िरी ओवर तक गए। विक्रम साँस लेना भूल गया। |
| 4.10 | 2026 | Vikram holding the old scorecard, sheepish; Dadi dry | Vikram: "I got the totals wrong, didn't I?" Dadi: "By eleven runs." / विक्रम: "मैंने जोड़ ग़लत किया था न?" दादी: "ग्यारह रन से।" |

## Chapter 5. 1999, the family flat: "The World Cup and a wedding" (home and family)

**Speaker:** Badi Amma. **Gossip:** Rani, 25, whose wedding it is. **Family option:** Vikram, 21, in Rukavat 1 and 5. The cards are the wider kin of the wedding week: cousins, in-laws and neighbours, none of them core family.

**Chapter card:** "1999 · Home and family · About 4 minutes", with the line "Family evenings, parents who separate, and a dowry demand." / "परिवार की शामें, अलग होते माँ-बाप, और दहेज की माँग।"

### The way in

| # | Style | What is painted | Caption |
|---|---|---|---|
| 5.1 | 2026 | Dadi's hand lifting a red-and-gold wedding card | 1999. We were fixing Rani's wedding, and everyone had an opinion. / 1999। रानी की शादी तय हो रही थी, और सबकी अपनी राय थी। |
| 5.2 | seam, 2026 into 1999 | Dadi's hand holding the red-and-gold wedding card by the lamp in Dadi's room, opening into the crowded TV room: a cricket match on the TV, relatives on every mattress | The World Cup on TV, and relatives on every mattress. / टीवी पर वर्ल्ड कप, और हर गद्दे पर रिश्तेदार। |
| 5.3 | 1999 | Badi Amma in her chair by the TV, pointing, commanding | My mother-in-law, Badi Amma, ran the whole house from that chair. / मेरी सास, बड़ी अम्मा, उसी कुर्सी से पूरा घर चलाती थीं। |
| 5.4 | 1999 | The boxy TV showing the interruption slide; the relatives on the mattresses throwing up their hands with a groan | Except the TV. It cut out at every good part. / बस टीवी उनकी नहीं सुनता था। हर अच्छे पल पर कट जाता था। |

### The twins

| Twin | What it looks at | Kind | Nudge on the woman | Nudge on the man |
|---|---|---|---|---|
| 1 and 5 | Rest asked for one of two with the same free time | plain, Split, Vikram in both | 5 | 1 |
| 2 and 6 | Who the children live with after a separation; one parent wants to remarry | hard, pick one | 6 | 2 |
| 3 and 7 | One is allergic to dust | matters, pick 2 of 3 | 3 | 7 |
| 4 and 8 | Who goes to the wedding talk after saying "no dowry" | hard, pick one | 8 | 4 |

### The decisions

1. **This Sunday.** Split; twin 5.
   - **Question:** Sunday: who does what? | **Scene:** "Relatives in every room, and the match at two."
   - **Chores:** sweeping, cooking, dishes, laundry, the TV.
   - **Key:** free hours, skill.
   - **People:**
     - Uma (3, 4) "Home from her long shift at the mill." [=]
     - Vivek (3, 4) "Works all week. Let him watch the match." [N]
     - Vikram (2, 3) "Asha's son, home from college for the week." [F]
     - Chetan (1, 2) "Hides from the chores every time, Rani says." [d]
   - **Pair:** Uma and Vivek.
   - **Reading:** chores to her minus chores to him, with the TV counted for whoever gets it.
2. **The lawyer's office.** Pick one; twin 6; hard.
   - **Question:** Who should the children live with? | **Scene:** "A cousin and her husband are separating. The family is asked."
   - **Key:** evenings at home, school meetings.
   - **Cards:**
     - Shampa (5, 6) "Moved back in with her mother." [=]
     - Rajan (5, 6) "Wants to marry again, and soon." [N]
     - Pooja (3, 2) "The children's aunt. Offers to help." [d]
   - **Pair:** Shampa and Rajan.
3. **The loft.** Pick 2 of 3; twin 7; matters.
   - **Question:** Pick 2 to clear the loft before the guests come. | **Scene:** "Nobody has cleared the loft in years."
   - **Key:** Sundays free, jobs done.
   - **Cards:**
     - Deepa (3, 6) "Has a dust allergy since childhood." [N]
     - Chetan (3, 6) "Home from hostel for the week." [=]
     - Uma (2, 4) "Cleared out the storeroom last year." [d]
   - **Pair:** Deepa and Chetan.
4. **The groom's side.** Pick one; twin 8; hard.
   - **Question:** Who goes to talk to the groom's side about the scooter they want? | **Scene:** "The groom's family wants a scooter. Someone has to go and talk."
   - **Key:** weddings arranged, talks led.
   - **Cards:**
     - Deepa (4, 6) "Knows the groom's aunt from school." [=]
     - Mahesh (4, 6) "Told them plainly: no dowry, ever." [N]
     - Rajan (2, 3) "Agrees with everyone, so Rani says." [d]
   - **Pair:** Deepa and Mahesh.
5. **Tonight.** Split; twin 1.
   - **Question:** Tonight: who does what? | **Scene:** "The groom's side comes tomorrow. Tonight, the house."
   - **Chores:** shopping, cooking, dishes, ironing, the TV.
   - **Key:** free hours, skill.
   - **People:**
     - Shampa (3, 4) "Works all week. Let her watch her serial." [N]
     - Kunal (3, 4) "Fixed the window cooler first thing this morning." [=]
     - Vikram (2, 3) "Asha's son, home from college for the week." [F]
     - Rajan (1, 2) "On the phone all day long, Rani says." [d]
   - **Pair:** Shampa and Kunal.
6. **The court bench.** Pick one; twin 2; hard.
   - **Question:** Who should the children live with? | **Scene:** "A neighbour's family asks Badi Amma to settle it."
   - **Key:** evenings at home, school meetings.
   - **Cards:**
     - Uma (5, 6) "Says she will remarry next year." [N]
     - Chetan (5, 6) "Moved in with his elder brother." [=]
     - Deepa (3, 2) "The children's aunt, close to them." [d]
   - **Pair:** Uma and Chetan.
7. **The storeroom.** Pick 2 of 3; twin 3; matters.
   - **Question:** Pick 2 to clear the storeroom for the raddiwala. | **Scene:** "Old newspapers to the ceiling, and a broken cooler."
   - **Key:** Sundays free, jobs done.
   - **Cards:**
     - Pooja (3, 6) "Sorts all the papers by date." [=]
     - Mahesh (3, 6) "Has a dust allergy since childhood." [N]
     - Kunal (2, 4) "Carried the cooler down last summer." [d]
   - **Pair:** Pooja and Mahesh.
8. **The second talk.** Pick one; twin 4; hard.
   - **Question:** Who goes to the boy's family for the second talk? | **Scene:** "They still want the scooter. A second visit, across town."
   - **Key:** weddings arranged, talks led.
   - **Cards:**
     - Pooja (4, 6) "Said to their faces: not one paisa." [N]
     - Vivek (4, 6) "Drives everyone to the station, every time." [=]
     - Kunal (2, 3) "Talks far too much, so Rani says." [d]
   - **Pair:** Pooja and Vivek.

**The pair rules hold:**
- The halves of each twin share no one, except Vikram, in the same middle place in both Splits.
- All eight pairs are different.
- The hard facts are on Rajan, Uma, Mahesh and Pooja.

### The way out

| # | Style | What is painted | Caption |
|---|---|---|---|
| 5.9 | 1999 | The wedding card on the TV table, a garland, tired relatives asleep on mattresses | The date was fixed: December. Everyone slept where they fell. / तारीख़ तय हुई: दिसंबर। जो जहाँ थका, वहीं सो गया। |
| 5.10 | 2026 | Tara pointing at the cloth-bound diary in the trunk | Tara: "Dadi, what's that book?" Dadi: "The part I never told anyone." / तारा: "दादी, वो किताब क्या है?" दादी: "वो हिस्सा, जो मैंने किसी को नहीं बताया।" |

## The finale: Dadi's diary

Each line is painted in its memory's style, with the diary page in the corner. History cut both ways, so the diary says so.

| # | Style | What is painted | Caption |
|---|---|---|---|
| 6.1 | 2026 | The diary open on Dadi's lap, her handwriting, her watch | I wrote it all down. Every night, since I was eighteen. / मैंने सब लिखा। हर रात, अठारह साल की उम्र से। |
| 6.2 | 1971 | Mohan walking out of the shed gate with a tin box | No woman got a seat on that course. Mohan left in 1975. / उस कोर्स में किसी औरत को सीट नहीं मिली। मोहन 1975 में चला गया। |
| 6.3 | 1971 | An empty chair at the crew board | A driver asked for time with his newborn. They laughed him out. / एक ड्राइवर ने नवजात के लिए छुट्टी माँगी। सब हँसकर टाल गए। |
| 6.4 | 1977 | An empty driver's seat in an old lorry's open cab at the depot, rain, other trucks parked behind | A woman said a car followed her. Bauji said she imagined it. / एक औरत ने कहा, गाड़ी पीछा कर रही थी। बाऊजी बोले, वहम है। |
| 6.5 | 1984 | A police post at night, a single statement on the desk | They believed the man. Her statement said the same, word for word. / उन्होंने आदमी की बात मानी। उसका बयान भी हूबहू वही था। |
| 6.6 | 1992 | The tin scoreboard beside the cricket field at dusk, one of its white plates smeared over with chalk | One bad day dropped a girl. A boy kept his place. / एक बुरे दिन पर लड़की बाहर हुई। लड़का टीम में रहा। |
| 6.7 | 1999 | The scooter, never bought; Rani in her wedding red | We refused them a scooter. Rani heard about it for years. / हमने स्कूटर देने से मना किया। रानी को बरसों ताने सुनने पड़े। |
| 6.8 | 2026 | Dadi closing the diary and looking at the viewer | Dadi: "We got plenty wrong, beta. Now, let's see your five days." / दादी: "हमसे बहुत कुछ ग़लत हुआ, बेटा। अब तुम्हारे पाँच दिन देखते हैं।" |

Then the five private result cards ([../content/first-take.md](../content/first-take.md), "The results"), from the player's own picks.

| # | Style | What is painted | Caption |
|---|---|---|---|
| 6.9 | 2026 | Dadi pushing the trunk across the floor to Tara and the viewer | Dadi: "The trunk is yours now. Fill it with better days." / दादी: "अब ये संदूक तुम्हारा है। इसे बेहतर दिनों से भरना।" |

This hands over to the daily Next take, where the family's trunk continues ([../content/narrative-draft-2026-10-23.md](../content/narrative-draft-2026-10-23.md), "Does it scale?").

## What has to be painted

| What | How many | Note |
|---|---|---|
| A 2026 style prompt and test sheet | 1 | Before any frame panel |
| Opening, 2026 | 7 panels | |
| Seams, 2026 into each era | 5 | The keepsake in Dadi's hand turning into its era's first scene |
| Era scenes in the ways in | 15 (3 a chapter) | |
| Closings in each era | 5 | |
| Frame lines, 2026 | 5 | |
| Diary finale | 9 (6.1 to 6.9) | Six in era styles, three in 2026 |
| Decision scenes per era | about 10 (2 a chapter) | Backgrounds for each world's step screens, in its era |
| Family portraits | see [people.md](people.md), "Portraits needed" | Asha at six ages, likeness checked |
| **Total** | **about 57 panels**, plus the portraits | Three tries each through the heavy-job queue |

## Before any of this is built

1. The research check, after the usage reset (25 Oct 2026, 2:30 pm):
   - family members as options ([family-as-options.md](family-as-options.md));
   - the decoy notes;
   - the gossip-attributed notes;
   - Believe cards carrying both an account and a note.
2. Fact-checks:
   - the engines on the Manmad section in 1971;
   - women station masters in 1971;
   - nothing named about the 1999 World Cup until checked.
3. The owner's answers to [people.md](people.md), "Open questions".
4. The Hindi for all 40 decisions, then a native reader.
5. `design-system/tools/check_first_take.py` adapted to this script, so the pair rules are checked by machine, not by hand.
