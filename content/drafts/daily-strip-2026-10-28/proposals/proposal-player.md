---
type: proposal
title: Retake dailies, player-first design (one scene in three parts)
description: One of three independent designs for the Retake dailies, 28 Oct 2026. Each day is one everyday scene told as a three-part comic strip (Easy is its start, Medium its middle, Hard its end); each part is a two-minute strip of six beats and four questions, asked by the weekday's own character, ending on what came of the player's choices. Includes a full sample day (Lugdi week, Monday, a power cut in a lane), its paint list, word counts and timings. Nothing here is built or decided.
---

# Retake dailies: one scene in three parts

Written for the player first: a commuter with a phone in one hand and two minutes between stops. Read-only design; nothing is built. Sources: the ground rules draft (answers 1 to 17, sections 1 to 9), the bubble spec, Saal Bhar chapter 1, the dailies map, DESIGN.md and `src/take/steps/`.

## In one paragraph

Every day is one everyday scene (Monday: the lights go out in the lane at 8). Easy, Medium and Hard are its three parts in story time: Easy is 8 to 9 pm, Medium 9 to 10, Hard 10 to 11. Each part stands alone and plays in about two minutes as one short scrolling strip with the same shape every day: the place, the asker at your door, a list of four jobs, two questions, a breather, two questions, what came of it, then a plain result. One character asks every question that day (Shobha Aunty on Mondays, every week, in that week's look), and a second character banters with her, so the characters talk to each other and to you, as in the shaadi demo. You are never drawn; you answer as yourself with fixed lines. A player who plays all three parts gets the whole evening with nothing repeated, ending on the lights coming back. The day needs seven paintings.

## 1. The five promises to the player

1. **You always know where you are.** Every part opens on a list of four jobs. The list rides in the top bar as four boxes beside the story clock ("8:20 pm"), and a box fills when its job is settled. Scrolling up shows the strip so far, with each settled job stamped in it.
2. **You always know what to do next.** One button at the bottom of every screen, in the thumb's reach, naming the next thing: Next, First job, Pick one, "Sunita makes the call", See today, Back to today. A tap anywhere on a story panel does what Next does.
3. **One thumb is enough.** No swipes, no timers, nothing moves on by itself. Story beats are one tap each; a question is a tap on a card and a tap on the button.
4. **You can stop at any stop.** Every beat and every settled job is saved. The cover then reads Continue, and the strip reopens at the same beat with what came before above it. A part begun before 4 am finishes as that day.
5. **You want tomorrow.** Each part ends on a warm outcome and the world's big moment (in Lugdi, the panel reprints as a pulp cover with the stamp). The evening goes on in the next part. The weekday's character comes back next week. The done cover says when the next puzzle opens and names tomorrow's object in a few words (an owner choice, section 10). The Week tab collects the week's six reprinted covers.

## 2. How a part plays, screen by screen

Same twelve stops in every part, every day, every world. Timings are estimates for a player who has met the kinds before, to be measured with the six players before anything ships.

| # | Screen | What the player sees | Taps | Easy | Medium | Hard |
|---|---|---|---|---|---|---|
| 0 | Cover | The day's painting, title, level switch, the part's start time, Play | 1 | 4 s | 3 s | 3 s |
| 1 | The place | The lane painting, a time box, tonight's twelve neighbours as small faces with names | 1 | 4 s | 3 s | 3 s |
| 2 | At your door | The asker and the second voice talk; your fixed line | 1 | 5 s | 5 s | 5 s |
| 3 | The list | The four jobs with empty boxes; button "First job" | 1 | 4 s | 4 s | 4 s |
| 4 | Question 1 | The question sheet rises: asker's balloon, key, cards; pick, confirm | 2 to 5 | 16 s | 18 s | 26 s |
| 5 | Stamp | The sheet folds into "Office call: settled"; box 1 fills; "Next job" | 1 | 2 s | 2 s | 2 s |
| 6 | Question 2 | As above | 2 to 5 | 20 s | 24 s | 24 s |
| 7 | Breather | The second voice's panel: a two-line exchange about the event, never the cards | 1 | 4 s | 4 s | 4 s |
| 8 | Question 3 | As above | 2 to 5 | 15 s | 20 s | 26 s |
| 9 | Stamp | "One plug: settled"; "Next job" | 1 | 2 s | 2 s | 2 s |
| 10 | Question 4 | As above | 2 to 5 | 18 s | 17 s | 20 s |
| 11 | What came of it | The outcome painting reprints as the world's cover; the stamp lands by band | 1 | 5 s | 5 s | 5 s |
| 12 | Reaction | The asker's line by band, your fixed reply; "See today" | 1 | 4 s | 4 s | 4 s |
| 13 | Result | Plain counts, the next part, Back to today | 1 | 5 s | 5 s | 5 s |
| | **Total** | | about 20 | **1:48** | **1:56** | **2:13** |

All three parts: about 6 minutes, inside the owner's 5 to 7. First-time costs come on top: a moving hand the first time each kind is met (about 4 s each), and name labels the first time the cast is met. A launch-day Easy for someone who skipped the First take runs about 1:56.

If the playtest median for a part runs past 2:15, or the day past 7 minutes, cut in this order: the breather beat (stop 7) first, then merge the place and the door into one beat. Never cut a question.

## 3. The questions in the strip

**Where they sit.** Four questions, always at the same four places: two after the list, a breather, two more. The rhythm "two, a breather, two" is the same every day, so a regular player knows how far along they are without reading anything. Four, not five: with four or five cards on each question, five questions would push a part past 2:30 and the day past 7 minutes.

**Who asks.** One asker a day for all three parts, and the same asker every week on that weekday (Monday is always Shobha Aunty, in that week's look). This also keeps rule 37 (both halves of a twin asked by the same person), because a twin's second half comes back next week on the same weekday. The asker is never on the cards. Six askers in all, three women and three men, each drawn from a model sheet, plus Hari Chacha, the one comic voice, who never asks and never sits on a card. The question sits in the asker's balloon with her face chip at the question's fixed place (104 px). On a hard-topic question it sits in the plain question box instead, never in a bubble.

**How the cards appear.** A tap on "First job" or "Next job" raises the question as a full-screen sheet over the strip (420 ms; at once under reduced motion), in the fixed skeleton the First take uses: top bar (Back, the four boxes and the clock, "?"), the asker's balloon, the key ("Answered · Late"), the cards, the dock. All cards arrive together in a fresh shuffled order, never one by one. Four cards in a pick one sit as a 2 x 2 grid of tiles; five cards in a team, or any rank or checks, sit as rows. Every card has a portrait, a name, the two numbers with their icons and one note with the world's margin rule; a judging note carries the speaker's face chip.

**How the player answers.** As today: tap a card (pick yellow), the button wakes and names what will happen ("Sunita makes the call", "Send Deepak and Kavya"), tap it. The commit holds 260 ms, then the sheet folds down into the job's stamp in the strip ("Office call: settled") and the job's box fills in the top bar. Back before the commit returns to the strip with nothing answered; the question reopens from the same stamp. A settled job can be reopened read-only, with a padlock. On resume, a question keeps the card order it was first shown in.

**What never happens after a pick.** Until the part's last question, every reaction is the same whoever was picked: the same stamp (the job word only, never a name or a face), the same sound, the same next beat.

## 4. Easy, Medium and Hard: three parts of one evening

**The three parts.** Easy is the start of the scene, Medium the middle, Hard the end. Each opens on its own time box ("8:05 pm", "9:00 pm", "10:00 pm") and its own people panel, has its own list of four jobs and its own outcome, and stands alone: a Medium-only player starts at 9 pm with one line that says where things are ("Still dark. The motor's off too."). Levels never depend on each other's answers or bands.

**What changes by level** (the owner's 28 Oct answer 11, and rule 55):

| | Easy | Medium | Hard |
|---|---|---|---|
| Lean on the equal two | One leaning note, on one of the two | A second leaning note on a card outside the two, or a reason that matters on one of the two | The two in the middle of the numbers, each with a leaning note (which change sides in the twin), or a returning pair that differs only in something that is not gender |
| Numbers | Clear: in a pick one the two are best on both numbers | One card above the two on each number in rank, team and checks | The two below the top; a card that leads on one number misses the bar on the other (the day's trap) |
| Kinds | Pick one, pick a team | Pick one, rank, checks | Rank, pick a team |
| Cards a question | 4 or 5 | 4 | 4 or 5 |
| Second tie (two women or two men) | In 2 of 4 questions | In 2 of 4 | In at least 1 of 4 |
| Time | about 1:48 | about 1:56 | about 2:13 |

Every level keeps rule 20's decoy (a card outside the two with a note of the nudge's kind) and a heavy-sounding fact on one decoy. The day's three parts use at least three kinds between them.

**The second and third time.** A player who plays all three never sees the same strip twice. They see the next part of the evening: a new time box on the same lane painting (one tap), a new people panel, a new list, four new questions, a new outcome, and Hard ends on the lights coming back. What carries over is what helps: the key is the same all day (shown in its short form after the first part), the asker and Hari are already known (no labels), and a kind already met gets no moving hand. So the story costs of the second and third part fall to about 20 seconds each. Playing out of order is fine: each part is complete, and the cover's level switch shows each part's start time so the order reads at a glance.

**Who is on the cards.** The day has one lane of 18 neighbours (9 women, 9 men) drawn from a standing pool of about 60 faces, each with one name and one job for good. Each part's circle is 12 of the 18, shown as small faces on its first beat. A neighbour can appear in more than one part, but nobody sits in an equal pair at more than one level that day (rule 53). Each person keeps the same two numbers all evening, at every level, because the numbers are facts about them.

## 5. Panels per day

Seven paintings a day, 42 a week, 84 for the two weeks before launch. Bubbles add no image weight, and one painting serves all three languages.

| Painting | Shape | Used by | Shared? |
|---|---|---|---|
| L. The place, people-free | wide 2:1, with a portrait crop for phones | The cover; the first beat of all three parts (with each part's time box and faces); the backdrop behind all twelve questions | all three levels |
| E-W. Easy's people panel | wide 2:1 | left crop: Easy's door beat; right crop: Easy's breather | Easy |
| E-O. Easy's outcome | 4:3 | Easy's outcome and reaction beats | Easy |
| M-W, M-O | as above | Medium | Medium |
| H-W, H-O | as above (H-O is L's view with every light on) | Hard | Hard |

Not paintings: the list of four jobs (an app part in the world's paperwork: Lugdi's newsprint strip), the stamps, the cast's face chips (one present-day portrait each, painted once), and the card portraits (from the portrait library).

One wide painting gives two panels: its left crop and its right crop each make a 4:3 panel on a phone, and the whole painting shows on a laptop. Wide 2:1 panels are still an owner choice in the bubble spec; without them the day needs ten paintings. In the queue, 46 First take panels took 2.5 to 4 hours, so a week's 42 is one night, plus repaints after the text check.

## 6. Keeping the equal two hidden

1. **Every question has an equal two,** so no question looks special, and every part has a second tie between two women or two men.
2. **The strip never touches the cards.** Card people are never painted; they appear only as cards, and once as the part's row of small faces, all the same size, in a shuffled order. No bubble, caption, stamp or line names, points at, describes or uses the note words of anyone on the cards. The asker's balloon gives only the goal of the moment ("Shop shuts at 8:30"), never the number the two tie on. The breather is about the event (Hari's radio), never the people.
3. **The nudge lives only in a card note,** said by a named voice with a face chip (Shobha or Hari, both women and men voices each part), with a decoy note of the same kind on another card. Notes in a question are within 2 words of each other in each language; the two's notes are the same length, never share an opening word or a frame, and the longest note falls on the two in a quarter to a half of the questions.
4. **Fixed lines and fixed reactions.** The player's lines never change with the pick and never state a rule for choosing. Stamps name the job, never the person. The outcome comes only after the fourth question.
5. **Outcomes from numbers only.** Each question's bar sits at or below the two's numbers, so picking either of them gives the same outcome; "always the woman" and "always the man" end the same. Cards that miss a bar are as often men as women. Outcome lines name the event, never a person; a reason that matters has a fixed outcome.
6. **Across levels and weeks.** Nobody sits in a pair at more than one level that day. A twin's second half comes next week, same weekday, same level, same question place, same asker, in the next world's look, with a new place, task and people and the nudge on the other side. Weekly bookkeeping: each part opens two twins and closes two (launch week opens two and has two whose pair is never read).
7. **The result never lists picks.** No names, no faces, no row of who got what; only counts (section 7).

## 7. Words

Counted: speech, your lines, narration, sound words, labels, sign words and buttons. Not counted: names, kinship names used as names, numbers and times. Budgets: 15 on a puzzle screen (question at most 10 words; card notes are held by the note-length rule), 20 everywhere else, a spoken line at most 10, narration at most 12. Speech is counted here, which is stricter than the owner's 21 Oct rule (question 14 is still open). Counts from `check_sample.py`, English; each language is counted on its own by the build.

| Screen | Words | Budget |
|---|---|---|
| Cover | 11 | 20 |
| 1 The place | 8 | 20 |
| 2 At your door, first meeting (with labels) | 20 | 20 |
| 2 At your door, later Mondays | 14 | 20 |
| 3 The list | 12 | 20 |
| Q1 (button live) | 13 | 15 |
| Q2 (button waiting / live) | 12 / 12 | 15 |
| Q3 (button live) | 14 | 15 |
| Q4 (button live) | 13 | 15 |
| Stamp beat | 5 | 20 |
| 7 Breather | 12 | 20 |
| 11 What came of it | 9 | 20 |
| 12 Reaction (band A, band C) | 10, 10 | 20 |
| Result | 15 | 20 |
| Done cover | 16 | 20 |

Every spoken line is 10 words or fewer (the longest is 7). The first-meeting beat sits exactly at 20, so its labels show only the first time a player meets the cast.

## 8. The sample day: Lugdi week, Monday, "The lights went at 8"

**The scene.** A weekday evening in a present-day lane of plain two-storey houses with a corner shop at the end. At 8 pm the power goes in the whole lane. No city is named; the lane could be in a town or a city. Area: safety and justice (who the lane trusts when it is dark). Not a hard-topic day.

**Look.** Lugdi pulp cover over today's lane: bold black ink outlines, flat red, mustard and night blue, coarse halftone, hard torch and candle light, deep shadow; present-day clothes, phones, steel glasses, plastic chairs. Painter rules for every panel: text-free (boards painted flat, number plates plain yellow), unsigned, a plain wall or sky above the heads, heads 30 to 45% down, the first speaker in the left third, at most three people, no bindi or sindoor, never the player (no hand, sleeve or shadow) and never anyone from the cards.

**The cast.**
- **Shobha Aunty** (शोभा आंटी), 58, Monday's asker. Keeps the lane's spare keys and its phone list in a small brown notebook. Retired school clerk. Faded cotton saree, grey cardigan, reading glasses pushed up into her hair, a steel torch with a cracked lens. Short sentences, gives orders kindly, never wastes a word. Says तुम to you only in lines that show no gender.
- **Hari Chacha** (हरि चाचा), 67, next door, the comic voice. Retired bus conductor. White kurta-pyjama, brown muffler in every season, a red plastic chair, a transistor radio he trusts more than anyone. Counts everything ("Third time this week!"). Never asks, never on a card.
- **You.** You live in the lane; when something goes wrong, people knock on your door. Never drawn, no name, no gender. Your lines are fixed.

**The key, all day, every level.** From Shobha's phone list. **Answered**: of her last 20 calls, how many they picked up (higher is better; phone icon). **Late**: times late for a lane job this year (lower is better; clock icon). On screen: "Answered · Late" | "फ़ोन उठाए · देर".

### Easy: 8 to 9 pm, "Before nine"

**Easy's circle** (12 of the day's 18; jobs most people can do):
women: Sunita, 40, bank counter; Kavya, 31, accounts clerk at a transport office; Farida, 34, chemist's counter; Jyoti, 28, primary school teacher; Neeta, 45, ration shop counter; Lalita, 51, school office clerk.
men: Deepak, 43, post office counter; Rohit, 27, sweet shop counter; Imran, 36, college canteen cook; Manoj, 33, bus depot ticket counter; Suresh, 38, hospital billing desk; Salim, 41, cook for a wedding caterer.
Their numbers all evening (Answered / Late): Sunita, Deepak 14 / 2; Kavya, Rohit 12 / 3; Farida, Imran 16 / 1; Jyoti, Manoj 9 / 5; Neeta, Lalita 7 / 6; Suresh, Salim 6 / 8.

**Cover.** Painting L. Lugdi masthead and issue roundel (decoration, hidden from screen readers). Title "The lights went at 8" | "बत्ती आठ बजे गई". Level switch Easy · Medium · Hard (new players on Easy). Under it: "8 pm. About 2 minutes." Button Play.

**Beat 1, the place.** Painting L (portrait crop on phones). *A narrow present-day lane of plain two-storey houses at night in a power cut: every window dark, plastic chairs and two parked scooters with plain yellow number plates, a tangle of overhead wires and one electric pole on the right, a corner shop at the far end with its shutter half down and one bare bulb glowing inside, a few candles on doorsteps, one torch beam crossing the lane from the left edge. No people. Calm space: a plain night-blue sky band across the top third. The shop board painted flat mustard; no letters or numbers anywhere.*
- Narration: "8:05 pm. Lights out. The whole lane is outside." | "रात 8:05। बत्ती गुल। पूरी गली बाहर।"
- Over the painting's lower half: Easy's 12 neighbours as small card portraits, all one size (56 px), names under them at body size, in a new order each load.

**Beat 2, at your door.** Painting E-W, left crop. *Left third: Shobha Aunty in a doorway facing straight out of the picture at the viewer, a steel torch held low in her right hand so its beam lights her face from below, the shut brown notebook against her chest in her left. Right third, across the lane: Hari Chacha on a red plastic chair at his own door, the radio on his knee, mouth open mid-complaint, looking across at Shobha. Between them the dark lane and one candle on a step. Two people, heads 30 to 45% down; calm space: the plain dark wall above each head.* On a phone the left crop shows Shobha; Hari speaks from the right edge.
- Shobha (tag "Shobha Aunty, keeps the lane's keys", first meeting only): "Lights gone. You're on my list." | "बत्ती गई। तुम मेरी लिस्ट पर हो।"
- Hari, off the right edge (tag "Hari Chacha, next door", first meeting only): "Third time this week!" | "इस हफ़्ते तीसरी बार!"
- You: "Okay. What first?" | "ठीक है। पहले क्या?"

**Beat 3, the list.** App part: Lugdi newsprint strip with a double ink rule, Shobha's face chip at its corner, four empty boxes. It shrinks into the top bar when the first question opens.
- "Before nine" | "नौ से पहले"
- "Office call · Candle money · One plug · Two lamps" | "दफ़्तर का फ़ोन · मोमबत्ती के पैसे · एक प्लग · दो लैंप"
- Button: "First job" | "पहला काम"

**Question 1, the office call.** Pick one. Backdrop L. Clock "8:10 pm".
- Shobha's balloon: "Office line's open. Who speaks for the lane?" | "दफ़्तर की लाइन खुली। गली की ओर से कौन बोले?"
- Button: "Pick one" | "किसी एक को चुनें", live "{name} makes the call" | "{name} फ़ोन करें". A gain (speaking for the lane), to be confirmed by the five players (rule 23).

| Card | Answered | Late | Note |
|---|---|---|---|
| Sunita | 14 | 2 | Counts cash at the bank counter. / बैंक काउंटर पर नक़दी गिनती है। |
| Deepak | 14 | 2 | [Hari's chip] Moody till he's had his dinner. / खाना खाने तक उसका मूड ख़राब। |
| Neeta | 7 | 6 | [Shobha's chip] Sulks when her serial gets cut. / सीरियल कटे तो मुँह फुला लेती। |
| Manoj | 9 | 5 | Sells tickets at the bus depot counter. / बस डिपो के काउंटर पर टिकट बेचता। |

Equal two: Sunita and Deepak. Nudge: "moody", on the man (a loaded word that has nothing to do with the call). Decoy of its kind: Neeta. Bar: Answered 12 or more (the office calls back). Misses: Neeta, Manoj. Opens a plain twin: next Monday, Easy, question 1, Shobha asks, Station look, a new place and task, a new pair, a loaded word on the woman.
- Stamp: "Office call: settled" | "दफ़्तर का फ़ोन: तय". Button "Next job" | "अगला काम".

**Question 2, the candle money.** Pick a team, 2 of 5. Clock "8:20 pm".
- Shobha's balloon: "Shop shuts at 8:30. Which two collect the candle money?" | "8:30 पर दुकान बंद। पैसे कौन दो इकट्ठा करें?"
- Button: "Pick 2 more" | "2 और चुनें", live "Send {a} and {b}" | "{a} और {b} को भेजें". A gain (trusted with money).

| Card | Answered | Late | Note |
|---|---|---|---|
| Deepak | 14 | 2 | Sorts letters at the post office. / डाकघर में चिट्ठियाँ छाँटता है। |
| Kavya | 12 | 3 | [Shobha's chip] Bossy with every one of her cousins. / अपने सब कज़िन पर हुक्म चलाती है। |
| Rohit | 12 | 3 | Works the counter at a sweet shop. / मिठाई की दुकान पर काउंटर संभालता है। |
| Neeta | 7 | 6 | Lost her mother just last winter. / पिछली सर्दी में माँ चल बसीं। |
| Lalita | 7 | 6 | [Hari's chip] Can't watch a sad film without tissues. / उदास फ़िल्म बिना रुमाल के नहीं देखती। |

Equal two: Kavya and Rohit, below Deepak, the one card above them on each number. Nudge: "bossy", on the woman. Decoy of its kind: Lalita. Heavy-sounding fact on a decoy: Neeta. Second tie: Neeta and Lalita. Bar: Late 3 or fewer for both picks (before the shop shuts). Misses: Neeta, Lalita. Launch week: its pair is never read; from week 2 this place opens a twin.

**Beat 7, the breather.** Painting E-W, right crop (Hari with his radio on his knee). The stamp "Candle money: settled" sits above it.
- Narration: "8:35 pm." | "रात 8:35।"
- Hari: "Radio says two more hours." | "रेडियो कहता है, दो घंटे और।"
- Shobha, off the left edge: "It says that every time." | "हर बार यही कहता है।"
- Button "Next job".

**Question 3, the one plug.** Pick one. Clock "8:40 pm".
- Shobha's balloon: "One free plug at the shop. Whose phone goes in?" | "दुकान पर एक प्लग ख़ाली। किसका फ़ोन लगे?"
- Button: "Pick one", live "Charge {name}'s phone" | "{name} का फ़ोन लगाएँ". A gain.

| Card | Answered | Late | Note |
|---|---|---|---|
| Farida | 16 | 1 | Works the late shift at the chemist. / केमिस्ट की दुकान पर देर की शिफ़्ट। |
| Imran | 16 | 1 | [Shobha's chip] Goes red the moment you tease him. / ज़रा छेड़ो तो लाल हो जाता है। |
| Jyoti | 9 | 5 | Teaches Class 2 at the government school. / सरकारी स्कूल में दूसरी कक्षा को पढ़ाती है। |
| Suresh | 6 | 8 | [Hari's chip] Throws the carrom striker when he loses. / हारने पर कैरम का स्ट्राइकर फेंक देता। |

Equal two: Farida and Imran (both names mark the same community; Salim, at the bottom of question 4, keeps marked names at the top and the bottom). Nudge: going red when teased, on the man. Decoy of its kind: Suresh. Bar: Answered 13 or more (the lane must reach whoever is charged). Misses: Jyoti, Suresh. Opens a plain twin (next Monday, Easy, question 3).
- Stamp: "One plug: settled" | "एक प्लग: तय". Button "Next job".

**Question 4, the two lamps.** Pick a team, 2 of 5. Clock "8:50 pm".
- Shobha's balloon: "Two lamps for the night. Who keeps them?" | "रात के लिए दो लैंप। कौन दो रखें?"
- Button: "Pick 2 more", live "Lamps to {a} and {b}" | "लैंप {a} और {b} को". A gain (light, and trust).

| Card | Answered | Late | Note |
|---|---|---|---|
| Farida | 16 | 1 | Opens the chemist's shutter every morning. / रोज़ सुबह केमिस्ट का शटर खोलती है। |
| Jyoti | 9 | 5 | [Hari's chip] Too emotional, cries at every wedding. / बहुत भावुक, हर शादी में रोती है। |
| Manoj | 9 | 5 | Sells tickets at the bus depot. / बस डिपो पर रोज़ टिकट बेचता है। |
| Suresh | 6 | 8 | Runs the billing desk at the hospital. / अस्पताल में बिलिंग डेस्क संभालता है। |
| Salim | 6 | 8 | [Shobha's chip] Combs his hair ten times a day. / दिन में दस बार बाल सँवारता है। |

Equal two: Jyoti and Manoj, below Farida. Before this question each of them was on one card, in the bottom half, with a plain note (Manoj in question 1, Jyoti in question 3), and neither was the weakest, so they match (rule 17). Nudge: "too emotional", on the woman. Decoy of its kind: Salim. Second tie: Suresh and Salim. Bar: Late 5 or fewer for both. Misses: Suresh, Salim. Launch week: its pair is never read.

**Beat 11, what came of it.** Painting E-O. *The lane from L's viewpoint, a little closer: a candle in every window and on every doorstep, warm mustard glow against night blue, two steel glasses of chai steaming on a doorstep beside a switched-off steel torch, the shop's bulb, an empty red plastic chair with the radio on it. No people. Calm space: the night sky above the roofs.* Lugdi's big moment: the panel snaps into the pulp-cover reprint frame (red, then black, then paper white, within 1.2 s, a tap skips it) and the stamp lands. One sound for every band.
- Stamp, by how many jobs met their bar: 4 "All set: 9:00", 3 "All set: 9:15", 2 or fewer "All set: 9:40" | "सब तैयार: 9:00 / 9:15 / 9:40"
- Narration: "A candle in every window." | "हर खिड़की में मोमबत्ती।"
- Sound: "khan" | "खन"

**Beat 12, the reaction.** Same painting; Shobha off the left edge. Her line changes by band only, about the event, warm in every band; your reply never changes.
- Band A: "Nine sharp. Chai's on my step." | "ठीक नौ। चाय मेरी सीढ़ी पर।"
- Band B: "Quarter past. Chai's still hot." | "सवा नौ। चाय अभी गरम है।"
- Band C: "Quarter to ten. Chai's ready anyway." | "पौने दस। चाय फिर भी तैयार।"
- You: "Chai, then." | "तो चाय।"
- Button: "See today" | "आज देखें"

**Result.** Lugdi's result card, no tabs, no Share.
- "Easy", with a tick (also said in words)
- "Before nine: 4 of 4 on time" | "नौ से पहले: 4 में से 4 समय पर"
- "Day 1 · 1 day running" | "दिन 1 · लगातार 1 दिन"
- Secondary text button: "Medium: 9 pm, still dark" | "मीडियम: रात 9, अब भी अँधेरा"
- Main button (outside-a-puzzle style, never yellow): "Back to today" | "आज पर वापस"

Checked by `check_sample.py` (all pass): one woman-and-man tie a question, no second one; nobody above the two in a pick one, exactly one card above them on each number in a team; two women and two men in each pick one, 3 to 2 in each team; ages within 8; matching earlier appearances and nobody weakest earlier in a later pair; no pair's numbers twice; bars at or below the two; misses 4 women and 4 men; notes within 2 words in English and Hindi, the two's notes the same length, never the same opening word; longest note on the two in 2 of 4; judging notes 4 from Shobha, 4 from Hari.

### Medium: 9 to 10 pm, "Before ten"

What differs from Easy:
- **Beat 1:** L again, "9:00 pm. Still dark. The motor's off too." with Medium's 12 faces (some neighbours from Easy come back; nobody from an Easy pair sits in a Medium pair).
- **Beat 2, painting M-W, left crop:** *Shobha in the left third at the corner shop's counter under its one bare bulb, her phone to her ear with its back to the viewer, a row of phones charging on the counter with dark screens; Hari in the right third holding his radio up, arguing.* Shobha: "Office says a lineman's coming. Maybe." Hari: "Maybe means midnight!" You: "Then let's get ready."
- **List:** "Before ten: Tank key · Charging order · Two torches · Lineman's call".
- **Q1, pick one (4):** "Motor's off. Who keeps the roof tank key?" The second leaning note sits on a card outside the two.
- **Q2, rank (4):** "Shop's inverter. Whose phones charge first? Rank them." One card above the two on each number, so the two compete for second and third.
- **Breather, M-W right crop:** Hari: "My radio needs charging too." Shobha: "Your radio takes batteries."
- **Q3, checks (up to 2 of 4 rows):** "Two torches left. Give them out."
- **Q4, pick one (4), a reason that matters:** "The lineman calls one number. Whose?" Its outcome is fixed for everyone ("Lineman: found the lane"). Full example:

| Card | Answered | Late | Note |
|---|---|---|---|
| Geeta | 13 | 3 | Keeps the register at the school office. / स्कूल ऑफ़िस का रजिस्टर वही रखती है। |
| Sanjay | 13 | 3 | Has the lineman's number in his phone. / लाइनमैन का नंबर उसके फ़ोन में है। |
| Rekha | 7 | 6 | [Hari's chip] Gossips at the ration queue every week. / राशन की लाइन में हर हफ़्ते गपशप। |
| Vikram | 10 | 4 | Weighs parcels at the courier counter. / कूरियर काउंटर पर पार्सल तौलता है। |

  The reason that matters sits on one of the two (here the man); in its twin next Monday it sits on the woman, and following it both times is fair.
- **Outcome, painting M-O:** *The electric pole at the lane's end, a bamboo ladder against it, a torch beam up the pole, a lineman seen from behind at the top in a plain blue shirt (not a card person, not a voice).* Stamp "Lineman in: 9:50 / 10:05 / 10:20". Shobha: "He's up the pole. Good." (band B and C lines as warm). You: "Chai, then."
- **Result:** "Before ten: 3 of 3 on time" (the fixed job is not counted), next "Hard: 10 pm, last push".

### Hard: 10 to 11 pm, "Before eleven"

What differs:
- **Beat 1:** L, "10:00 pm. Still no lights. Nobody's sleeping." with Hard's 12 faces.
- **Beat 2, painting H-W, left crop:** *A flat rooftop with two plastic water tanks and a clothesline, Shobha in the left third with her torch, looking out at the viewer; Hari in the right third fanning himself with a folded blank newspaper; dark rooftops beyond, no landmarks.* Shobha: "Lineman's on it. One last push." Hari: "I'm staying up here till the fan's on." You: "Okay. Last list."
- **List:** "Before eleven: Last charge · Spare keys · Back room · Shobha's list".
- **Q1, rank (4):** "Inverter's last charge. Rank whose phone goes first." The two below the top.
- **Q2, pick a team (2 of 5), the two in the middle, a note on each:** "Spare keys overnight. Which two keep them?" Full example:

| Card | Answered | Late | Note |
|---|---|---|---|
| Anita | 18 | 6 | Packs orders at the courier office. / कूरियर ऑफ़िस में ऑर्डर पैक करती। |
| Ramesh | 8 | 0 | Cooks lunch at the hospital canteen. / अस्पताल की कैंटीन में खाना बनाता। |
| Meena | 12 | 2 | [Shobha's chip] Too soft to ever say no. / कभी ना नहीं कह पाती, बहुत नरम। |
| Ajay | 12 | 2 | [Hari's chip] Snaps at everyone when he's tired. / थकने पर सब पर भड़क जाता है। |
| Usha | 7 | 6 | [Hari's chip] Talks right through every film on TV. / टीवी की हर फ़िल्म में बोलती रहती। |

  Anita leads on Answered, Ramesh on Late, and the two sit between. Bar: Late 2 or fewer, so a player who goes only by Answered and takes Anita misses: the day's trap. In the twin, the two notes change sides.
- **Breather, H-W right crop:** Hari: "In my day, a cut lasted a week." Shobha: "In your day, nobody had phones."
- **Q3, rank (4), a returning pair:** "Shop's back room is cool. Rank who rests there." Two people met earlier in this part come back differing only in something that is not gender.
- **Q4, pick one (4), a leaning note on each of the two:** "Who keeps my list tonight?" (Shobha hands over her phone list).
- **Outcome, painting H-O:** *L's view with every window lit yellow, the shop fully lit, a ceiling fan turning behind one window, chairs empty, the radio on the red chair. No people.* The reprint lands bigger, sound "khat!", stamp "Lights back: 10:40 / 10:55 / 11:15". Shobha: "Lights! Bed, all of you." You: "Goodnight, Aunty." | "शुभ रात्रि, आंटी।"
- **Result:** "Before eleven: 4 of 4 on time"; when all three are done the cover reads "Next puzzle in 3 h" and "Tomorrow, 7 am: the school bus".

## 9. Hard-topic days (at most one a week, never a Monday)

On that day each part carries one hard question, on the cards only: the asker's balloon gives way to the plain question box, the cover names the setting plainly before Play, no panel, bubble, stamp or reminder touches the topic, the hard question feeds no outcome, and the help line sits in "?" for women and men alike. The rest of the strip is as warm as any other day.

## 10. Questions for the owner, in plain words

1. **Three parts of one evening, or three versions of it?** Example: Easy is 8 pm when the lights go, Medium 9 pm when the motor stops, Hard 10 pm when the lights come back. Playing all three tells the whole evening with nothing repeated. The other way, all three start at 8 pm with different jobs: cheaper to paint (four paintings, not seven) but the second and third play re-read the same strip.
2. **One asker per weekday, every week?** Example: Shobha Aunty asks every Monday, painted in Lugdi this week and in Station's look next week. Players get to know six people, and both halves of a pair of questions are asked by the same person. It means the dailies' characters cross worlds.
3. **May the done cover name tomorrow's object?** Example: "Tomorrow, 7 am: the school bus." It gives a reason to come back; it also tells the setting a day early.
4. **Wide paintings cut in two?** Example: one painting of Shobha at your door and Hari across the lane makes two phone panels and one laptop picture. Yes keeps the day at seven paintings; no makes it ten.

## 11. Risks

1. **Timing is estimated, not measured.** Four questions of four or five cards may run past two minutes for slower readers, the 61-year-old and Hindi readers, and the day past 7. First cut: the breather; second: merge the place and the door.
2. **Painting load.** Seven a day, 42 a week, 84 before launch, plus repaints after the text check, all on the owner's 24 GB Mac through heavyq. Keeping Shobha the same face across five looks is hard for FLUX. Fallback: three versions of one moment (four paintings a day), at the cost of repeats.
3. **Three parts can read as an order.** Medium-only players always start mid-evening; some may feel they must play Easy first; a Hard-first player knows the lights come back before playing Easy.
4. **The weekday asker crosses worlds,** beyond the owner's 23 Oct "one person, one world" (said of the First take household). The same asker every Monday may come to feel like "the easy one".
5. **Twin bookkeeping.** Each part opens two twins and closes two; in launch week two questions a part carry a pair that is never read, and Sunday's "What was different?" has no finished twin until week 2. The research line has to agree.
6. **A player who knows the rules can still find the pair.** The equal two are the only woman-and-man tie and the second tie is always two women or two men; in the sample, the pair's members first appear on cards in their own question in three of four questions.
7. **One key all day** (Answered, Late) can feel samey across twelve questions and makes writers strain to tie every job to it.
8. **Faces recur** across parts and days; liking a face leaks into picks, the shaadi demo's lesson. Cap it: a face on at most two days a week and in at most one pair a week.
9. **Word budgets are tight.** The first-meeting beat is exactly 20; Hindi questions sit near the 10-word cap; every screen must be counted in each language by the build.
10. **The scene and the look.** A power cut may fail the twice-a-week test for the metro player (a prediction only), and Lugdi's torchlit pulp drama can tip into menace on the easiest day of the week.
11. **The result and the teaser.** "4 of 4 on time" may read as a score; the teaser may read as a push and could hint at a hard-topic day's setting.
12. **Five-card questions** run past a 360 x 640 phone in Hindi behind the "more" cue (question 16 is open).
13. **Wide 2:1 paintings** are an owner choice not yet made; without them the day needs ten paintings.
14. **Jobs on every card.** Jobs show only in plain notes, so some cards never show one; putting a job on every card would need it held by the note rule, not the 15-word budget.

## 12. What it reuses and what is new

**Reused from the First take app:** the step screens (`Pick` for pick one and checks, `Team`, `Rank`, `Order`, `Split`, `Row`) with their wait and live buttons and the 260 ms commit; `Frame` and `StepProps` (progress becomes part, job, 4), `useShuffled`, the revisit lock; the asker's balloon and face chip (`Voice`, `Question`) and the plain question box; the person card in five worlds with notes and their margin rules; the store's kept answers; `lang.tsx` (three modes); the birth-date gate; `pwa.ts` caching; world sounds; the result card; `streak.ts` and `calendar.ts` from the old engine (4 am, one forgiven day).
**Reused from the strip spec:** all of it: text-free painting rules and `check-text`, the lines table and `bubbles.json` anchors, bubble kinds and their per-world plates, the placer and tails, the 200% and no-picture stacks, reading order and screen-reader prefixes, reduced motion, the casts and note-word refusals, the per-beat word counter and the library-first order. Wide 2:1 panels are the spec's own open option.
**Reused from Saal Bhar:** the target list, the settled plate (now the stamp), band stamps on the world's big moment, the band-only reaction with a fixed reply, the outcome swap test, and its checkers (notes, words, Hindi gender scan, deck solver), which lived in the scratchpad and need rebuilding in the project.
**New:** the daily strip runner (one screen that plays cover, beats, question sheets, outcome and result); the question sheet that rises and folds into a stamp; the four-box progress plate and the job list part in five worlds; the level switch with each part's start time; Continue mid-part; the daily content format (day, scene, key, lane of 18, three parts of beats, questions and bands) and its export; a deck solver for a whole day with fixed numbers per person; the twin scheduler across weeks; the dailies' outcome engine with the swap test; the result with plain counts and the next-part offer; serving each day from our site; the six weekday askers and Hari on model sheets; a face pool of about 60; the per-day paint list in `cutscenes.py`; the Week tab's shelf of reprinted covers.

## Checks run

- `../tools/check_sample.py`: Easy's deck and every screen's word count (FAILS: none).
- `../tools/check_examples.py`: the Medium and Hard examples (FAILS: none).
- Not checked: Hindi word counts on screens (only notes), the Hindi gender scan (lines written to avoid it; a native reader clears them), the six-player test (prediction only), timings (estimates).
