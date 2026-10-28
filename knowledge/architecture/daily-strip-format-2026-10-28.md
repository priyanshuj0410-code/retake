---
type: spec
title: Retake daily, the strip format
description: The format spec for the Retake dailies (M3), 28 October 2026. Each day is one present-day evening told in three parts (Easy 8 pm, Medium 9 pm, Hard 10 pm); each part is a two-minute comic strip with four questions, asked by the weekday's own character, with two lane neighbours who sign every remark on the cards. Covers how a level plays screen by screen with timings, how the strip and the cards fit, what the levels share, how the hidden pair stays hidden, word counts in English and Hindi, the paintings a day needs, the cover, result, Week, Sunday, Past puzzles and help line, a full sample day checked by script, the library parts to draw and the owner's open questions. A draft; nothing is built.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-23/
---

# Retake daily: the strip format

A draft for the owner's yes. Nothing here is built, painted or decided. Sources: the owner's answers 1 to 17 and sections 1 to 9 of [ground-rules-draft-2026-10-25.md](../story/ground-rules-draft-2026-10-25.md), the bubble spec ([webtoon-bubble-spec-draft-2026-10-25.md](webtoon-bubble-spec-draft-2026-10-25.md)), Saal Bhar chapter 1 ([chapter-1.json](../../content/drafts/saal-bhar-2026-10-26/chapter-1.json)), the app's step screens (`src/take/steps/`), DESIGN.md (Layout, Components, Levels, Motion), the dailies map ([dailies-map-2026-10-28.md](../reviews/dailies-map-2026-10-28.md)), the three proposals ([proposals/](../../content/drafts/daily-strip-2026-10-28/proposals/)) and the three judges ([assets/daily-strip-format-2026-10-28.json](assets/daily-strip-format-2026-10-28.json)).

## In one paragraph

Every day is one everyday evening in a present-day lane (Monday of launch week: the lights go out at 8). Easy, Medium and Hard are its three parts in story time: 8 to 9 pm, 9 to 10 pm, 10 to 11 pm. Each part stands alone and plays in about two minutes as one short scrolling comic strip with the same shape every day: the lane, the asker at your door, a list of four jobs, two questions, a breather, two questions, what came of it, then plain counts. The weekday's own character asks every question (Shobha Aunty every Monday, in whatever look the week has), and two neighbours who comment on everybody, Hari Chacha and Nusrat, sign every remark on the cards, kind and unkind, about women and men alike. The asker signs none. You are never drawn and your lines never change. Each level has its own twelve people, its own two numbers and its own trap. Someone who plays all three gets the whole evening, ending on the lights coming back, with nothing repeated. The worlds are only the look. The day needs ten paintings, seven on a lean day.

---

## 0. Where this comes from

**The ranking.** Each judge scored seven things from 1 to 10 (owner fit, two minutes, hiding the pair, art cost, clarity, fun, minimal text). Summed over the three judges:

| Proposal | Judge 1 | Judge 2 | Judge 3 | Total | Fatal flaws |
|---|---|---|---|---|---|
| One scene in three parts (player) | 53 | 51 | 50 | **154** | 0 |
| The six-painting day (cost) | 49 | 49 | 52 | 150 | 2 |
| The chorus strip (reading) | 46 | 42 | 47 | 135 | 2 |

So this spec starts from "One scene in three parts". It had no fatal flaw; the judges named weaknesses, and each is fixed or stated honestly below.

| What the judges found in the base | What this spec does |
|---|---|
| The asker signed judging notes herself | The asker never signs a remark. Two standing chorus voices sign them all (from "The chorus strip") |
| Two Easy nudges were textbook stereotypes on women ("bossy", "too emotional") | Nudges are everyday remarks said of anyone ("moody", "spoilt", "sweet to everyone"); the day's one stereotyped remark sits on a clear top card where the numbers already decide (from "The chorus strip") |
| Only Hard had a trap; rule 54 asks one a daily | One trap per level, and across a week the trap pulls towards women and men equally |
| Questions 1 and 3 showed the pair as the only tie, at the top | Every five-card question shows a second tie between two women or two men, and that tie carries a remark on at least one of its two, so it looks like the pair |
| Pair members first appeared on cards in their own question in 3 of 4 | Diluted, not removed: whenever a pair is new on cards, another new face sits beside them, and every level's last pair has been met on earlier cards. Section 5.4 says why more is not possible with fixed numbers |
| Twelve named faces on the place beat looked busy | Kept at twelve (the deck needs them, section 5.2), but moved out of the painting into a calm band of their own: faces and first names only, no jobs |
| "One lane of 18" did not add up: Medium and Hard used new people | Each level has its own twelve. Nobody sits on cards at two levels in a day. Thirty-six card faces a day |
| One key all day felt samey | One key per level, from a standing library of number sets |
| Hindi screen totals were not counted | Every screen is counted in both languages by `check_format.py` |
| The tomorrow teaser could read as a push and hint at a hard day | Off by default |
| "4 of 4 on time" may read as a score | Put to the owner (question 4), since it is the rulebook's open question 5 |

**Grafted in.**
- From "The chorus strip": the two-voice chorus met before any card, remarks balanced by speaker, sex and warmth, the stereotyped remark where numbers decide, traps that cut both ways, no pair count on the daily result (finished pairs go to Sunday only), the ghost hand on blank cards, and the note-word scan over every line in the level.
- From "The six-painting day": the place painting in portrait and wide, edit-model painting with the place as reference, people-free close-ups as the cheapest panels, a lean-day fallback, a fifth question only if timing allows, and questions with no hidden pair as an owner option (question 5).

**Patterns from shipped apps** (Lazyweb, descriptions only; no screen was opened):
- Epic keeps reading and answering apart: story pages carry no controls, and questions are their own screens.
- Duolingo keeps the button inert until a pick, which matches pick then confirm.
- NYT Sudoku shows three equal level buttons.
- The Guardian's crossword check shows counts in buckets with no score.
- Couple Joy's done state says when the next one comes.
- The Connections archive is a calendar that opens a day on a tap.
- Drops marks a rescued day differently from a played or a missed one.

Nobody shows a strip handing over to a decision, so that join has to be drawn on the parts sheet and played by the owner.

---

## 1. How a level plays, screen by screen

Fourteen stops, the same in every part, every day and every world. One button at the bottom always names the next step; a tap anywhere on a story panel does the same. No swipes, no timers, nothing moves on by itself, and scrolling up rereads. Every beat is saved.

Times are estimates for a player who has met the kinds before. They must be timed with the five newcomers and the six players before anything ships.

| # | Stop | What the player sees | Easy | Medium | Hard |
|---|---|---|---|---|---|
| 0 | Cover | The day's painting, title, level switch with each part's start time, Play | 4 s | 3 s | 3 s |
| 1 | The lane | Left crop of the part's wide panel: Hari and Nusrat, a time box, one line each about the evening. Under it, the circle band: the part's twelve card faces with first names | 6 s | 5 s | 5 s |
| 2 | At your door | Right crop of the same panel: the asker looks out at you and gives the goal; your fixed reply | 4 s | 4 s | 4 s |
| 3 | The list | Four jobs with empty boxes under a deadline ("Before nine"); button "First job" | 4 s | 4 s | 4 s |
| 4 | Question 1 | The question sheet rises: the asker's balloon, the key, the cards; pick, then confirm | 18 s | 19 s | 28 s |
| 5 | Stamp | The sheet folds into "Office call: settled"; box 1 fills; "Next job" | 2 s | 2 s | 2 s |
| 6 | Question 2 | As above | 20 s | 26 s | 24 s |
| 7 | Breather | Stamp 2 above a people-free close-up; Hari and Nusrat from off the panel, two lines about the evening | 4 s | 4 s | 4 s |
| 8 | Question 3 | As above | 17 s | 22 s | 26 s |
| 9 | Stamp | "One plug: settled"; "Next job" | 2 s | 2 s | 2 s |
| 10 | Question 4 | As above; its commit goes straight to the outcome | 20 s | 17 s | 20 s |
| 11 | What came of it | The outcome painting, the world's big moment (Lugdi reprints the panel as a pulp cover, at most 1.2 s, a tap skips it), the band stamp | 5 s | 5 s | 5 s |
| 12 | Reaction | The asker's line, by band only and warm in every band; your fixed reply; "See today" | 4 s | 4 s | 4 s |
| 13 | Result | Plain counts, the next part offered as a text button, "Back to today" | 5 s | 5 s | 5 s |
| | **Total** | about 19 taps | **1:55** | **2:02** | **2:16** |

All three parts come to about 6 minutes 13 seconds, inside the owner's 5 to 7.

**First-time extras.**
- A ghost hand shows each kind on blank cards the first time a player meets it, at any level: about 4 s each.
- Name tags show the first time a player meets the cast: about 2 s.
- A launch-day Easy for someone who skipped the First take runs about 2:05.

**Hindi.** Reading is slower and the notes are longer, so a Hindi day may run nearer 6:50. That is the first thing to time.

**If a part runs long.** If the newcomers' median for a part passes 2:20, or a day passes 7 minutes, cut in this order:
1. The breather beat (stop 7). Its stamp moves onto the next question's sheet.
2. Merge the lane and the door into one beat, showing the whole wide panel.
3. Hard's five-card ranks drop to four cards, losing their second tie.

A question is never cut.

---

## 2. How the strip, the questions and the cards fit together

### 2.1 The strip

- A part is one scrolling column of beats. A beat is everything new between two taps (bubble spec). Panels are painted with no words in them; every word is live text in bubbles, captions, signs and plates, so one painting serves Hinglish, Hindi and English.
- Story panels carry no controls except the one button. The decision is never inside a panel: it rises as its own sheet (2.4) and folds back into the strip as a stamp. Reading and answering stay apart.
- Every bubble rule of the bubble spec applies unchanged:
  - kinds and their per-world plates;
  - anchors in `bubbles.json`, the placer and tails;
  - a name tag on a speaker's first line and on every off-panel voice;
  - at most two spoken lines, one narration box and one sound word a beat, three pieces in all;
  - the 200% and no-picture stacks;
  - "Name: line" for screen readers;
  - reduced motion shows a beat's bubbles at once.

### 2.2 Who talks

| Who | Role | Rules |
|---|---|---|
| The weekday asker (Monday: Shobha Aunty) | Asks every question that day, at all three levels, and every week on that weekday | Never on a card, never comic, never signs a remark. Six askers, 3 women and 3 men, each on a model sheet |
| Hari Chacha and Nusrat, the chorus | Banter about the evening in the lane beat and the breather, and sign every judging remark on the cards, with a 24 px voice chip | The same two every day of every week, in each week's look. They never ask and never sit on a card. Hari grumbles about everyone ("that one"); Nusrat teases everyone fondly ("bless her"). Both say kind and unkind things |
| You | Live in the lane; when something goes wrong, people knock on your door | Never drawn (no hand, sleeve or shadow), no name, no gender. Your lines are fixed and the same whatever you pick |
| Card people | The part's twelve neighbours | Never painted, never speak. They appear only as card portraits and once together in the circle band, all one size, in a new order each load |

The chorus is met in the lane beat before any card, talking only about the evening ("Third time this week!"). When their faces then sign remarks on the cards, the tone belongs to the speaker, and the nudge is one voice among many the player already knows.

### 2.3 The list and the four boxes

The list beat is an app part in the world's paperwork (Lugdi: a newsprint strip with a double ink rule), with the asker's face chip at its corner, a deadline heading ("Before nine") and four jobs with empty boxes. Every job is a gain, to be confirmed by the five players (rule 23).

When the first question opens, the list shrinks into the question sheet's top bar as four boxes beside the story clock ("8:20 pm"). A box fills when its job is settled. Progress shows without a word being read. The rhythm "two, a breather, two" is the same every day, so a regular player knows how far along they are.

### 2.4 A question

1. **The sheet rises.** "First job" or "Next job" raises the question as a full-screen sheet over the strip (420 ms; at once under reduced motion), in the First take's fixed skeleton:
   - top bar: Back, the four boxes and the clock, "?";
   - the asker's balloon with her face chip at the question's fixed place (top at 104 px);
   - the key, one line with icons ("Answered · Late");
   - the cards;
   - the dock at 748 px.

   The painting behind the sheet is the day's people-free place painting, so no painted face ever sits behind the cards (rule 32).
2. **The balloon gives the goal of the moment and the ask**, in at most 10 words ("Shop shuts at 8:30. Which two collect the candle money?"). It never names, describes or points at a card person, and never gives the number the two tie on. On a hard-topic question it sits in the plain question box, never in a bubble.
3. **The cards arrive all together** in a fresh shuffled order, which is kept on resume.
   - Five cards sit as rows (pick one, team, rank, checks); four cards in a pick one sit as a 2 x 2 grid of tiles.
   - Each card shows a portrait, a first name, the two numbers with their icons and one note under the world's margin rule.
   - A remark carries its speaker's voice chip, never a name in the text.
4. **The player answers as today** (`src/take/steps`: Pick, Team, Rank, Pick with checks). Tap a card and it turns pick yellow. The button wakes and names the consequence ("Sunita makes the call", "Send Kavya and Rohit"), then a tap confirms. The commit holds 260 ms.
5. **The sheet folds into the stamp.** It folds down into a plate in the strip that names the job only ("Office call: settled"), with a tick and a lock: never a name or a face. That job's box fills.
   - Back before the commit returns to the strip with nothing answered.
   - A settled job reopens read-only with its padlock.
6. **Nothing reacts to a pick** until the fourth question is settled: the same stamp, the same sound and the same next beat, whoever was picked.

### 2.5 Four questions, not five

Every part has four questions. The owner allowed 4 or 5. With five cards a question, a fifth question would push Hard past 2:40 and the day past 7 minutes. A fifth question is added to a level only if the newcomers' timing shows that level under 1:45, and then always in the same place (after the breather), so the rhythm stays fixed.

### 2.6 Kinds and the ghost hand

- **Kinds by level.** Easy uses pick one and pick a team; Medium pick one, rank and spend checks; Hard rank, pick a team and pick one. A day uses at least three kinds, and a part uses no kind more than twice.
- **Ghost hand.** The first time a player meets a kind, at any level, a ghost hand shows it on blank cards, so it never moves towards a real person.
- **Launch week.** The rulebook asks for all six daily kinds in launch week. The four the app already has (pick one, pick a team, rank, spend checks) can run from Monday. The two with no screen yet would each take one question place on their launch day if built in time: lock a rule then assign (Wednesday) and choose words (Friday). Quick sort waits for real players' figures. This changes "one new kind a day", which was written for one puzzle a day (question 6).

### 2.7 After the fourth question

- **What came of it** shows one painting of the event, never a person: the candles lit, the lineman up the pole, every window lit. The world's big moment lands with the band stamp. The stamp comes from the numbers only (section 5, rule 12) and reads by band ("All set: 9:00", "9:15" or "9:40"). One sound plays for every band.
- **The reaction** is the asker's line by band, about the event and warm in every band, then your fixed reply.
- **The result** follows (8.2).

---

## 3. What the three levels share and what changes

| | Shared by all three | Each level's own |
|---|---|---|
| Story | The evening, the place, the day's title, the asker, the chorus, the world's look | Its hour (8, 9 or 10 pm), its spot in the lane (the doorsteps, the corner shop, the roof), its four jobs, its outcome |
| Paintings | The place painting L: the cover and the backdrop behind all twelve questions | Its wide people panel W (the lane crop and the door crop), its breather close-up B, its outcome O |
| People | The face pool of the week's world | Its circle of twelve (6 women, 6 men); nobody sits on cards at two levels in a day |
| Numbers | The way keys work (two numbers, one icon each, one word each) | Its own key: Easy "Answered · Late", Medium "Turns · Missed", Hard "Kept · Lost". Each person keeps the same two numbers for the whole level |
| Shape | The fourteen stops, the four boxes, the stamps, the result | Kinds, difficulty, trap (below) |

**What changes by level** (owner's answer 11 and rule 55):

| | Easy | Medium | Hard |
|---|---|---|---|
| The lean | One leaning remark, on one of the two | One leaning remark, plus a second leaning remark on a card outside the two; or, once a level, a reason that matters on one of the two (that job's outcome is fixed) | The two sit below the top of the numbers with one remark; or a leaning remark on each of the two, which change sides in the next week's half |
| Numbers | Clear: in a pick one the two are best on both numbers; in a team one card is above them on both | One card above the two on each number in rank and checks | Two cards above the two in ranks; one card leads on one number only and another on the other number only |
| Trap | A warm remark on a card one notch under the bar | A warm remark on the second tie, one notch under the bar | A card best on one number misses the bar on the other |
| Kinds | Pick one, pick a team | Pick one, rank, spend checks | Rank, pick a team, pick one |
| Cards | 5, 5, 5, 5 | 5, 5, 5, 4 | 5, 5, 5, 4 |
| Time | about 1:55 | about 2:02 | about 2:16 |

Every level keeps rule 20's decoy: a card outside the two with a remark of the nudge's kind. Every day puts one heavy-sounding fact on a decoy. The four-card question, at most one a level, is only ever the "matters" question or the one with a remark on each of the two: those are the questions where the two already carry something extra.

---

## 4. The second and third level

A player who plays all three never sees the same strip twice. They see the next hour of the evening:

- The cover's switch shows each part's start time (8 pm, 9 pm, 10 pm), so the order reads at a glance and playing out of order is fine.
- The strip opens on its own lane beat: a new crop of a new panel, a new time box ("9:00 pm. Still dark. Motor's off too."), and new chorus lines. That one line of narration is all a Medium-only player needs to know where things are.
- New circle, new key, new list, four new questions, a new breather, a new outcome. Hard ends on the lights coming back.
- What carries over is only what helps:
  - the cast is known, so there are no name tags;
  - a kind already met gets no ghost hand;
  - the shape is the same.

  The story costs about 20 seconds less in a second or third part.
- No level depends on another level's answers or band. Someone who plays Hard first learns the lights come back; that is accepted.
- The result of each part offers the next unplayed part as a quiet text button ("Medium: 9 pm, still dark"). It is never a main button and never a sheet.

---

## 5. Keeping the equal two hidden

### 5.1 The rules

Each is a refusal in the day checker (`check_format.py` already runs most of them on the sample), unless marked by eye.

1. **Two casts.** Lines come only from the asker, the chorus, narration and you. Refuse any line whose speaker, listener or tail is a card person.
2. **The asker signs nothing.** Every remark on a card is signed by Hari or Nusrat with a voice chip. Refuse a remark from the asker or from no voice. A plain fact, a heavy fact and a reason that matters carry no voice.
3. **The chorus is balanced.** Within a level:
   - each voice signs as many remarks about women as about men, within one;
   - remarks on women and on men are equal in number;
   - kind and unkind remarks split the same way for women and for men, within one per level and equal across the day.

   The sample: Easy is exact (Hari 3 and 3, Nusrat 3 and 3; women and men each 3 kind and 3 unkind); Medium and Hard are within one. Across the day women and men each get 8 kind and 8 unkind.
4. **Exactly one woman-and-man tie a question**, the equal two (rule 13). Ages within 8 years. Both names mark the same community, or neither does.
5. **Second ties look like the pair.** Every five-card question shows a tie between two women or two men, split 3 to 2 by gender so no card is the only woman or the only man. In at least half the questions that tie carries a remark on one of its two, so "a tie with a remark on one" is never special. A four-card question (at most one a level) is split 2 and 2 and is only the "matters" question or the one with a remark on each of the two.
6. **Faces.** Everyone in the part is met first, together and equally, in the circle band. On the cards, whenever a pair is new, at least one other new face sits beside them. Each level's last pair has been met on earlier cards, with matching histories (6a).
   - **6a. Matching histories (rule 17).** Inside a pair the two have been on the same number of earlier cards, at the same height each time, with notes of the same warmth. Nobody who was the weakest card earlier sits in a later pair.
7. **Notes give nothing away** (rule 19).
   - In each question and each language, notes are within 2 words of each other, and the two's notes are the same length.
   - The two's notes never share an opening word or a sentence frame.
   - The longest English note falls on the two in a quarter to a half of a level's questions (sample: 2, 2 and 1 of 4).
   - The nudge is never the only remark on the screen and never the single longest note.
8. **The day's most stereotyped remark sits where the numbers decide**: on a clear top card outside the pair (sample: "Bossy with every one of her cousins." on Farida, who is plainly first for the lamps). The nudges themselves are everyday remarks said of anyone.
9. **One trap per level, cutting both ways.** The trap is a card the numbers rule out that something else pulls towards. Across a week the trap's pull falls on women and men equally (sample: Easy pulls towards a man, Medium towards a woman, Hard towards a man; the next day mirrors).
10. **No line points at a card.** No bubble, caption, sign, list, stamp, question or line of yours names a card person, describes one by relation, job or looks, or uses a content word from any card note in that level. The scan runs against every line in the level, before and after, not only the lead-in. Shared event words (lane, lights, phone, lineman, office) are declared per day and allowed.
11. **Fixed lines, fixed reactions.**
    - Your lines never change with the pick and never state a rule for choosing.
    - Stamps name the job only.
    - The live button names the pick only through a template that is the same for every card.
    - Nothing reacts before the fourth question.
    - The reaction changes by band only.
12. **Outcomes come from the numbers only.**
    - Each bar sits at or below the two's numbers, so picking either gives the same outcome, and "always the woman" ends the same as "always the man".
    - The cards that miss a bar are as often women as men in each level (sample: 4 and 4, 2 and 2, 2 and 2).
    - A "matters" question has a fixed outcome.
    - Hard-topic questions feed no outcome.
    - The build tries every answer and refuses on any difference when the pair is swapped.
13. **Twins a week apart** (5.3), with the same asker, slot, level, kind and chorus voice for the nudge. Refuse a closing half that differs in any of these.
14. **The result shows no picks**: no names, no faces, no row of who got what, and no count of matching pairs. Finished-pair counts appear only on Sunday (8.5), because a daily line like "1 of 1 alike" would send the player scrolling back to hunt for the pair.
15. **By eye on every panel:**
    - no card person painted;
    - nothing lit, held or pointed towards the cards;
    - no face painted fairer;
    - no painted bindi;
    - the player never painted.

### 5.2 The deck shape that makes this work

A level has twelve people because the rules leave no room for fewer.

- **The pairs.** With numbers fixed for the whole level, four questions need four woman-and-man pairs with different numbers: eight people.
- **The second ties** need people who share numbers with someone of the same gender. The deck gets them two ways:
  - two "others" share a set of numbers of their own (Easy: Neeta and Lalita, 6 · 8);
  - an "other" copies a pair's numbers (Easy: Suresh has Deepak's 12 · 4). He then ties with Deepak whenever Sunita is absent, and must never sit on a card with Sunita, or there would be a second woman-and-man tie.
- **The weakest card** in a question must not be someone in a later pair, so the low ties have to be "others" too.
- **Ten people do not work.** With four pairs and only two others, the second ties have to borrow a later pair member, who then sits at the bottom as the weakest card or beside their partner's copy, and both are refused (worked by hand). Twelve works: `solve_daily2.py` found 53 Easy and 73 Medium decks, and `solve_hard.py` found 104 Hard decks. A stricter rule, two other new faces beside every new pair, found no deck at all (`solve_daily.py`, exhaustive over its numbers, and 400,000 random tries).

A whole-day solver of this kind, rebuilt in the project, is a prerequisite for writing the two weeks.

### 5.3 Twins across weeks

- **Where the second half comes back.** A twin's second half comes next week on the same weekday, at the same level and the same question place. The same asker asks it. It is the same kind, with the nudge from the same chorus voice on the other person (a remark on each of the two swaps sides). Everything else is new: the next world's look, a new place, task and people, and the idea worded afresh.
- **Each part opens two twins and closes two**, alternating by week. Odd weeks open at questions 1 and 3 and close at 2 and 4; even weeks the other way round. Since every question carries a pair, a player cannot tell an opening half from a closing one.
- **Launch week** has nothing to close, so questions 2 and 4 carry a pair that is never read. Sunday's "What was different?" waits for week 2.
- **In the sample (launch week, Monday):**
  - Easy question 1 opens a plain twin (Hari's "moody" on the man; next Monday, Hari's word on a woman).
  - Easy question 3 opens a plain twin (Nusrat's "spoilt" on the man).
  - Medium questions 1 and 3 and Hard questions 1 and 3 open twins the same way.
  - Medium's "matters" question 4 sits in an even-week opening place, so in launch week its pair is never read; from week 2 a "matters" twin opens there, and its second half puts the reason on the other person.
- **Hard-topic twins** return on the same weekday, so two weeks running share a hard weekday. The hard weekday moves each fortnight and is never a Monday.
- **Sunday's pair.** Every week has one plain twin that fits side by side on Sunday, taken from the level the player played most (rule 58).

### 5.4 The honest limit

The equal two are the only woman and man on a screen with exactly the same numbers. A player who scans every card can always find them. This design makes finding them useless rather than impossible:
- there are ties everywhere;
- the same-gender tie carries remarks too;
- remarks come from a known chorus that comments on everyone;
- traps punish following a remark in either direction;
- "matters" questions break the rule "ignore every note when a woman and a man tie".

A smaller tell remains. With numbers fixed for a level and history matching, the searches found no level in which more than one pair was "returning" (met on earlier cards); in the other questions the pair are new faces, though never the only new ones. The circle band dilutes this, and the five-player playtest (rule 24: "What was this about?") measures it.

---

## 6. Words

**Counted:** speech, your lines, narration, sound words, labels, name tags' descriptions, list and stamp words, the key and buttons. **Not counted:** names, kinship names used as names (Aunty, Chacha), numbers and times. Card notes sit outside the screen count, held by the note rule (rule 19).

Speech is counted, which is the stricter reading, so every screen passes whichever way the owner answers rulebook question 14.

**Budgets:**
- a puzzle screen at most 15, with the question at most 10;
- any other screen at most 20;
- a spoken line at most 10 and narration at most 12;
- each language counted on its own.

Counted by `check_format.py` for the sample, English / Hindi:

| Screen | Easy | Medium | Hard |
|---|---|---|---|
| Cover | 9 / 12 | (same cover) | (same cover) |
| 1 The lane | 15 / 17; first meeting, with tags, 19 / 20 | 16 / 19 | 16 / 20 |
| 2 At your door | 10 / 12; first meeting 13 / 15 | 11 / 12 | 11 / 12 |
| 3 The list | 12 / 15 | 12 / 16 | 12 / 11 |
| Question 1 (live button) | 13 / 15 | 13 / 14 | 15 / 14 |
| Stamp beat | 5 / 6 | 5 / 6 | 5 / 4 |
| Question 2 | 13 / 14 | 14 / 14 | 13 / 13 |
| 7 Breather (with stamp 2) | 15 / 18 | 14 / 19 | 18 / 20 |
| Question 3 | 14 / 14 | 12 / 10 | 15 / 14 |
| Stamp beat | 5 / 5 | 5 / 5 | 5 / 6 |
| Question 4 | 13 / 14 | 11 / 13 | 9 / 11 |
| 11 What came of it | 9 / 8 | 11 / 9 | 11 / 10 |
| 12 Reaction (band A) | 10 / 10 | 10 / 10 | 8 / 11 |
| 13 Result | 14 / 17 | 14 / 16 | 11 / 12 |
| Done cover | | | 11 / 12 |

**Lines at the limit,** where any growth in translation must come out of a button or a narration word:
- Easy's first lane beat in Hindi (20);
- Hard's lane and breather in Hindi (20);
- Easy question 1 in Hindi (15);
- Hard questions 1 and 3 in English (15).

The longest spoken line is 8 words; the longest question is 9.

**Card notes** run 5 to 8 words in English and 5 to 8 in Hindi, within 2 in each question, with the pair's two the same length in both languages.

---

## 7. Panels a day

Ten paintings a day: 60 a week, 120 for the two weeks before launch.

| Painting | Shape | Used by | Shared? |
|---|---|---|---|
| L, the place, people-free | wide 2:1, with a portrait crop for phones | The cover of all three levels; the backdrop behind all twelve questions (portrait on phones, wide on laptops); Hard's outcome is painted from it | all three levels |
| E-W, M-W, H-W, each level's people panel | wide 2:1 | Left crop: the lane beat (the chorus). Right crop: the door beat (the asker looking out at you). A laptop shows the whole painting with the bubbles arriving in two taps | one per level |
| E-B, M-B, H-B, each level's breather | 4:3, people-free close-up | The breather beat, with the chorus speaking from off the panel | one per level |
| E-O, M-O, H-O, each level's outcome | 4:3 | What came of it, and the reaction beat | one per level |

**Not paintings:**
- the list, the boxes, the stamps and the result (app parts in the world's paperwork);
- the cast's face chips (one present-day portrait each, painted once);
- card portraits (the world's portrait library: 70 Lugdi faces and 69 Station faces today, each with one name and one job for good).

**Painter rules for every panel** (bubble spec section 1):
- text-free, with surfaces that usually carry letters painted plain, and unsigned;
- a plain wall or sky above the heads, heads 30 to 45% down;
- the first speaker in the left third, and at most three people;
- present-day clothes and objects, no bindi or sindoor, no religious or brand mark;
- never the player and never a card person;
- each painting under 60 KB.

**Characters.**
- **References.** Eight model sheets: six weekday askers, Hari and Nusrat. Each needs one master and one reference per world look: 24 references for the Lugdi and Station fortnight.
- **How a character panel is painted.** With the edit model, from the character's reference and with L as the place reference. This is untested; try it on the sample day first.
- **The fallback.** A character who keeps drifting is seen from behind or speaks from off the panel.

**Queue time.**
- The First take's 46 panels took 2.5 to 4 hours, so a week of 60 is about 3.5 to 5 hours: one night.
- The fortnight's 120, the 24 references and a third repainted after the text check come to 10 to 14 hours: three or four nights.
- Everything runs only through `heavyq` on the owner's Mac, never beside browsers or another FLUX job.

**Human time.** About 25 to 30 minutes a day: ten seed picks, two face close-ups, and about 25 bubble placements in two anchor sets (1 to 3 minutes per dialogue panel, less for the close-ups).

**Fallbacks.**
- **Lean day: seven paintings.** Drop the three breather close-ups, and let the breather play over L with a new time box.
- **No wide paintings: thirteen.** If the owner says no to wide 2:1 panels, each people panel becomes two 4:3 paintings.
- **People-free panels are the safest to cut and repaint.** The breather close-ups and the outcomes have no faces to drift, so they cost the least review.

---

## 8. The screens around the strip

### 8.1 The cover and the level switch

- **Layout.** The day's painting L fills the screen (Full Painting Rule). The top bar shows the day count and "?". The day's title is the cover's one display title. Under it sits the level switch: three equal segments, Easy, Medium and Hard, built like the board switch (48 tall, the chosen one filled with the world's paper and a tick, never yellow). Under each segment is its start time (8 pm, 9 pm, 10 pm), and below them "About 2 minutes" and Play, the outside-a-puzzle button.
- **States of a segment:**
  - to play;
  - Continue, for a part in progress, which reopens the strip at the same beat with the beats before it above;
  - played, with a tick that is also said in words.

  The ticks clear when the day changes at 4 am. A part begun before 4 am finishes as that day.
- **First-visit cover.** No switch (DESIGN, Levels): Easy, its start time, "About 2 minutes", Play, and the First take as a quieter text action under it.
- **Later covers.** The switch appears from the first done cover on. A tap shows that level's cover in place and is remembered.
- **Never on the cover:** "Level 3 of 6", any level number or grade, or a description under each level.
- **Hard-topic day.** The cover adds one plain line naming the setting and the case before Play, as a chapter title card does ("And a neighbour's report of being followed."). The help line never sits on the cover itself.

### 8.2 The result

A world-dressed result card with no tabs, no Share and no names or faces. For the sample's Easy:
- "Easy" with a tick;
- "On time: 4 of 4 jobs" (or "3 of 4", and so on, from the same numbers that set the band; a "matters" or hard question is not counted);
- "Day 1 · 1 day running";
- a quiet text button naming the next unplayed part ("Medium: 9 pm, still dark");
- the main button "Back to today".

There is no lean figure, no consistency figure, no pair count and no comparison between levels: the owner chose plain counts until the research line sets a score (answer 13), and "levels are never compared". If the owner says the result may not say how the evening went (question 4), the line becomes "4 jobs settled" and the outcome stamp loses its time.

### 8.3 The done cover

When all three parts are played: the cover with three ticks and "Next puzzle in 3 h" (already decided, F-03), counting to 4 am. No teaser for tomorrow's scene by default.

### 8.4 The Week tab on weekdays

The week, Monday to Saturday, as the world's day objects. In Lugdi that is a shelf of small reprinted covers, each the day's L, with three small level marks under it, played or not, also said in words. Station uses ticket stubs; each other world uses its own object from the library.
- Today's day is framed. A missed day shows an empty slot. The week's one forgiven day, taken automatically, has its own mark ("off"), so it looks different from both a played day and a missed one.
- Plain counts under the shelf: "Days played: 3 · In a row: 3 · 1 day off left".
- Below: "Past puzzles" (8.6) and "First take" (DESIGN, First take and Next take).
- Nothing on the Week tab names a person, a pick or a lean.

### 8.5 Sunday

Sunday has no new puzzle and no level switch. Its cover opens the week page:
- the six covers;
- plain counts (days played, parts played, the streak);
- from week 2, the look-again pair: one finished plain twin from the level the player played most, its two halves side by side as they were played. That is last Monday's Easy question 1 in the Lugdi look and this Monday's in the Station look, the asker's balloon, the cards and the player's own picks marked, and one question, "What was different?". Its taps are never stored (F-69, F-77).

The first Sunday has the week page only, saying plainly that the look-again starts next week.

Finished-twin counts live here and nowhere else. The wording is a draft for the owner and the research line, and must avoid the banned words "twin" and "matching cases": "Same choice, people swapped: picked alike 2 of 3".

### 8.6 Past puzzles

- A month list on the Week tab: each past day as its cover with three level chips. A tap fetches that day from our site (answer 14: the phone never holds tomorrow's day). Nothing is cached ahead.
- A part played from Past puzzles adds to All time only. It never counts for the streak or the week, and it is never read.
- A day joins Past puzzles only after its second halves have run, so the other half of a hidden pair is kept out for 7 days (F-49f). In practice a day appears 8 days after it ran. Until then its slot shows the date it opens.

### 8.7 Hard-topic days and the help line

- **When.** At most one a week, never a Monday, and never the day a new kind arrives (rule 60). All three parts carry one hard question.
- **Where it sits.** Always at question 3, after a breather played straight (narration and one warm line, no joke), so no joke touches it and the world's big moment never lands on it.
- **How it is asked.** In the plain question box, never a bubble. The topic is someone else's case (a neighbour's report), never the player's or the asker's (rule 27).
- **What the strip may show.** The topic never reaches a panel, a bubble, a stamp or a reminder. The list's third job and its stamp use a neutral word ("A neighbour's request" | "पड़ोसी की बात"). It feeds no outcome, so that part's result counts three jobs.
- **The help line.** Every "?" sheet that day, on the cover and on every beat and sheet of all three parts, holds one help line row for women and men alike. It is chosen by topic from [help-lines-2026-10-27.md](../reference/help-lines-2026-10-27.md): the national emergency line for safety, NALSA's legal aid line for custody or inheritance, Tele-MANAS for bullying at work and distress. It is checked against the official source before launch, and never printed on the cover face or a card.
- **The decoy.** A heavy-sounding fact on a decoy is required that day (rule 20).

### 8.8 Serving, offline and resume

- **Serving.** Each day's file (scene, keys, three levels of beats, questions and bands, in three languages) comes from our site on the day. The paintings for today are cached on first open. Tomorrow's are never on the phone.
- **Offline.** A part already opened plays offline. A picture that fails to load gives the no-picture stack, so bubbles never float in an empty box.
- **Resume.** Answers are kept per date, level and question, with the card order kept.

---

## 9. The sample day: Lugdi week, Monday, "The lights went at 8"

In Hindi: "बत्ती आठ बजे गई". Launch week, day 1.

**Scene.**
- **Where and when.** A weekday evening in a present-day lane of plain two-storey houses with a corner shop at the end and flat roofs with water tanks. At 8 pm the power goes in the whole lane. No city is named.
- **Area.** Safety and justice (who the lane trusts in the dark).
- **Kind of day.** Not a hard-topic day.
- **Six-player test.** Predicted only: a power cut should be met at least twice a week in the life of each of the six; the readers decide.

**Look.** A Lugdi pulp cover over today's lane:
- bold black ink outlines;
- flat red, mustard and night blue;
- coarse halftone;
- hard torch and candle light;
- present-day clothes, phones, steel glasses and plastic chairs.

**Cast.**
- **Shobha Aunty** (शोभा आंटी), 58, Monday's asker. Retired school clerk; keeps the lane's spare keys and its phone list in a small brown notebook. Faded cotton saree, grey cardigan, glasses pushed up into grey hair, a steel torch with a cracked lens. Short, kind orders.
- **Hari Chacha** (हरि चाचा), 67, next door, the chorus's grumbler. Retired bus conductor; white kurta-pyjama, brown muffler in every season, a red plastic chair, a transistor radio he trusts more than anyone. Counts everything. Says "that one".
- **Nusrat** (नुसरत), 45, the tailor at number 7, the chorus's fond teaser. A measuring tape round her neck, always carrying two steel cups of chai. Says "bless her" and "bless him".
- **You.** You live in the lane. Never drawn.

**Paint list** (role words only; every prompt ends with Lugdi's style line, the text-free and unsigned ending, ROOM and FACING):

| Id | Prompt |
|---|---|
| L | A narrow present-day lane of plain two-storey houses at night in a power cut: every window dark, plastic chairs and two parked scooters with plain yellow number plates, overhead wires and one electric pole on the right, a corner shop at the far end with its shutter half down and one bare bulb inside, candles on doorsteps, a torch beam crossing from the left edge. No people. A plain night-blue sky band across the top third. The shop board painted flat mustard; no letters anywhere |
| E-W | Wide. Left two thirds: across the lane, an old man in a white kurta-pyjama and brown muffler on a red plastic chair, a radio on his knee, mid-complaint; beside him a woman of 45 with a measuring tape round her neck holding two steel cups of chai, laughing. They face right. Right third: a woman of 58 in a faded cotton saree and grey cardigan in a doorway, a steel torch held low lighting her face from below, a brown notebook at her chest, looking straight out at the viewer. Plain dark wall above every head |
| E-B | Close: a transistor radio on the seat of an empty red plastic chair, a steel cup of chai on the step beside it, one candle, warm light on a plain wall. No people, no hands |
| E-O | The lane from L's viewpoint, a little closer: a candle in every window and on every doorstep, two steel glasses of chai steaming on a step beside a switched-off torch, the empty red chair with the radio. No people. Night sky above the roofs |
| M-W | Wide. Left two thirds: the old man and the tailor on the corner shop's step, he holding up his radio, she with two plastic buckets of water. Right third: the 58-year-old woman behind the shop counter under one bare bulb, a phone to her ear with its back to the viewer, looking out at the viewer. Plain dark wall above |
| M-B | Close: a row of phones on a shop counter plugged into one board, their screens painted dark and blank, an inverter's small plain green lamp, a steel tumbler. No people |
| M-O | The electric pole at the lane's end, a bamboo ladder against it, a torch beam up the pole, a lineman in a plain blue shirt seen from behind at the top. Nobody else |
| H-W | Wide. A flat rooftop with two plastic water tanks and a clothesline. Left two thirds: the old man on a plastic stool fanning himself with a folded blank newspaper, the tailor taking clothes off the line. Right third: the 58-year-old woman with her torch held low, looking out at the viewer. Dark rooftops beyond, no landmarks |
| H-B | Close: a green mosquito coil smoking on a roof parapet beside a steel tumbler and the radio, stars above. No people |
| H-O | L's view with every window lit yellow, the shop fully lit, a ceiling fan turning behind one window, the chairs empty, the radio on the red chair. No people (painted from L as the place reference) |

### 9.1 Easy: 8 to 9 pm, "Before nine" | "नौ से पहले"

**Key A:** "Answered · Late" | "फ़ोन उठाए · देर". Answered: of Shobha's last 20 calls, how many they picked up (higher is better; phone icon). Late: times late for a lane job this year (lower is better; clock icon).

**The circle** (twelve; jobs most people can do; numbers Answered / Late, fixed for the level):

| Woman | Age, job | Numbers | Man | Age, job | Numbers |
|---|---|---|---|---|---|
| Sunita | 40, bank counter | 12 / 4 | Deepak | 43, post office | 12 / 4 |
| Kavya | 31, gas agency counter | 9 / 5 | Rohit | 27, books at a transport office | 9 / 5 |
| Farida | 34, hospital canteen cook | 15 / 2 | Imran | 36, sweet shop counter | 15 / 2 |
| Jyoti | 29, maths at a coaching centre | 12 / 3 | Manoj | 33, bus depot | 12 / 3 |
| Neeta | 45, ration shop counter | 6 / 8 | Suresh | 38, hospital billing desk | 12 / 4 |
| Lalita | 51, school office clerk | 6 / 8 | Salim | 41, drives an office car | 11 / 4 |

Suresh copies Deepak's numbers, so he never sits on a card with Sunita. Farida, Imran and Salim are the community-marked names.

**Cover.** Painting L, the Lugdi masthead and issue roundel (decoration, hidden from screen readers).
- Title: "The lights went at 8" | "बत्ती आठ बजे गई".
- Switch: Easy · Medium · Hard, with 8 pm · 9 pm · 10 pm.
- "About 2 minutes", Play.

**Beat 1, the lane.** E-W, left crop.
- Narration: "8:05 pm. Lights out. Whole lane's outside." | "रात 8:05। बत्ती गुल। पूरी गली बाहर।"
- Hari (tag on first meeting: "Hari Chacha, next door" | "हरि चाचा, बगल वाले"): "Third time this week!" | "इस हफ़्ते तीसरी बार!"
- Nusrat (tag: "Nusrat, the tailor" | "नुसरत, दर्ज़ी"): "Chai's on. My gas works." | "चाय चढ़ी है। मेरी गैस चालू।"
- The circle band under the panel: the twelve as card faces, 56 px, first names only, 4 x 3, shuffled each load.

**Beat 2, at your door.** E-W, right crop.
- Shobha (tag: "Shobha Aunty, keeps the keys" | "शोभा आंटी, चाबियाँ इनके पास"): "Lights gone. You're on my list." | "बत्ती गई। तुम मेरी लिस्ट पर हो।"
- You: "Okay. What first?" | "ठीक है। पहले क्या?"

**Beat 3, the list.**
- "Before nine: Office call · Candle money · One plug · Two lamps" | "नौ से पहले: दफ़्तर का फ़ोन · मोमबत्ती के पैसे · एक प्लग · दो लैंप".
- Button "First job" | "पहला काम".

**Question 1, the office call. Pick one, 8:10 pm.**
- Shobha: "Office line's open. Who speaks for the lane?" | "दफ़्तर की लाइन खुली। गली की ओर से कौन बोले?"
- Buttons: "Pick one" | "किसी एक को चुनिए"; live "{name} makes the call" | "{name} फ़ोन करें".

| Card | Ans · Late | Note | हिंदी | Voice |
|---|---|---|---|---|
| Sunita | 12 · 4 | Counts cash at the bank counter. | बैंक काउंटर पर नक़दी गिनती है। | |
| Deepak | 12 · 4 | Moody till he's had his dinner. | खाने से पहले उसका मूड ख़राब। | Hari |
| Salim | 11 · 4 | Always smiling, whatever the weather. | मौसम कैसा भी हो, मुस्कुराता रहता। | Nusrat |
| Neeta | 6 · 8 | Lost her mother just last winter. | पिछली सर्दी में माँ चल बसीं। | |
| Lalita | 6 · 8 | Sulks when her serial gets cut. | सीरियल कटे तो मुँह फुला लेती। | Nusrat |

- **The pair and the nudge.** The equal two are Sunita and Deepak, best on both numbers. The nudge is Hari's "moody", on the man.
- **Decoy and second tie.** The decoy of its kind is Lalita's sulking, on the second tie (Neeta and Lalita). Easy's heavy-sounding fact sits on Neeta.
- **Bar, not shown:** Answered 10 or more. Neeta and Lalita miss.
- **Twin.** Opens a plain twin: next Monday, Easy, question 1, Shobha asks, Station look, Hari's loaded word on a woman.
- Stamp: "Office call: settled" | "दफ़्तर का फ़ोन: तय". Button "Next job" | "अगला काम".

**Question 2, the candle money. Pick a team, 2 of 5, 8:20 pm.**
- Shobha: "Shop shuts at 8:30. Which two collect the candle money?" | "8:30 पर दुकान बंद। पैसे कौन दो जमा करें?"
- Buttons: "Pick 2 more" | "2 और चुनिए"; live "Send {a} and {b}" | "{a} और {b} को भेजिए".

| Card | Ans · Late | Note | हिंदी | Voice |
|---|---|---|---|---|
| Manoj | 12 · 3 | Sells bus tickets at the depot. | डिपो पर बस के टिकट बेचता है। | |
| Kavya | 9 · 5 | Sweet to everyone she meets, that one. | जिससे मिले, उससे मीठा बोलती है। | Hari |
| Rohit | 9 · 5 | Does the books at a transport office. | ट्रांसपोर्ट दफ़्तर में हिसाब देखता है। | |
| Neeta | 6 · 8 | Feeds every stray dog in the lane. | गली के हर कुत्ते को खिलाती है। | Hari |
| Lalita | 6 · 8 | Talks right through every film on TV. | टीवी की हर फ़िल्म में बोलती रहती। | Nusrat |

- **The pair.** The equal two are Kavya and Rohit, below Manoj, the one card above them on both numbers; they compete for the second seat.
- **The nudge.** A kind remark from Hari, on the woman. The decoy of its kind is Neeta's, on the second tie.
- **Bar:** Late 5 or fewer for both picks. Neeta and Lalita miss.
- **Twin.** Launch week, so this pair is never read; in week 2 this place opens a twin.

**Beat 7, the breather.** E-B. The stamp "Candle money: settled" | "मोमबत्ती के पैसे: तय" sits above it.
- Narration "8:35 pm." | "रात 8:35।"
- Hari, off the right edge: "Radio says two more hours." | "रेडियो कहता है, दो घंटे और।"
- Nusrat, off the left edge: "It says that every time." | "हर बार यही कहता है।"
- Button "Next job".

**Question 3, the one plug. Pick one, 8:40 pm.**
- Shobha: "One free plug at the shop. Whose phone goes in?" | "दुकान पर एक प्लग ख़ाली। किसका फ़ोन लगे?"
- Live "Charge {name}'s phone" | "{name} का फ़ोन लगाइए".

| Card | Ans · Late | Note | हिंदी | Voice |
|---|---|---|---|---|
| Farida | 15 · 2 | Cooks lunch at the hospital canteen. | अस्पताल की कैंटीन में खाना बनाती। | |
| Imran | 15 · 2 | Spoilt rotten since he was small. | बचपन से लाड़ में बिगड़ा हुआ। | Nusrat |
| Jyoti | 12 · 3 | Teaches maths at a coaching centre. | कोचिंग सेंटर में गणित पढ़ाती है। | |
| Deepak | 12 · 4 | Remembers every birthday in the lane. | गली के सबके जन्मदिन याद रखता। | Nusrat |
| Suresh | 12 · 4 | Throws the carrom striker when he loses. | हारने पर कैरम का स्ट्राइकर फेंक देता। | Hari |

- **The pair.** The equal two are Farida and Imran, both community-marked names. The nudge is Nusrat's "spoilt", on the man.
- **Decoy and second tie.** The decoy of its kind is Suresh's, on the second tie (Deepak and Suresh).
- **Bar:** Late 3 or fewer. Deepak and Suresh miss.
- **Twin.** Opens a plain twin (next Monday, Easy, question 3, Nusrat's word on a woman).
- Stamp "One plug: settled" | "एक प्लग: तय".

**Question 4, the two lamps. Pick a team, 2 of 5, 8:50 pm.**
- Shobha: "Two lamps for the night. Who keeps them?" | "रात के लिए दो लैंप। कौन दो रखें?"
- Live "Lamps to {a} and {b}" | "लैंप {a} और {b} को".

| Card | Ans · Late | Note | हिंदी | Voice |
|---|---|---|---|---|
| Farida | 15 · 2 | Bossy with every one of her cousins. | अपने सब कज़िन पर हुक्म चलाती है। | Hari |
| Jyoti | 12 · 3 | Makes everyone laugh, bless her heart. | जहाँ बैठे, सबको हँसा देती है। | Nusrat |
| Manoj | 12 · 3 | Checks bus passes at the gate. | गेट पर बस पास जाँचता है। | |
| Deepak | 12 · 4 | Sorts letters at the post office. | डाकघर में चिट्ठियाँ छाँटता है। | |
| Suresh | 12 · 4 | Brings sweets for every child here. | यहाँ हर बच्चे के लिए मिठाई लाता। | Hari |

- **The pair.** The equal two are Jyoti and Manoj, below Farida. Each was once before on a card, in the top half of five, with a plain note (Manoj at question 2, Jyoti at question 3), and neither was ever the weakest, so their histories match.
- **The nudge.** A kind remark from Nusrat, on the woman.
- **The stereotyped remark.** The day's one ("bossy") sits on Farida, plainly first on both numbers.
- **The trap.** Going by Answered alone, four cards tie on 12. Only Late splits them, and Suresh, with the warm remark, sits one notch under the bar.
- **Bar:** Late 3 or fewer. Deepak and Suresh miss.
- **Twin.** Launch week: never read.

**Beat 11, what came of it.** E-O reprints as a pulp cover: red, then black, then paper white, at most 1.2 s, and a tap skips it.
- The stamp counts the jobs that met their bar. All four: "All set: 9:00" | "सब तैयार: 9:00". Three: "9:15". Two or fewer: "9:40".
- Narration "A candle in every window." | "हर खिड़की में मोमबत्ती।"
- Sound "khan" | "खन".

**Beat 12, the reaction.** Shobha off the left edge.

| Band | Shobha | हिंदी |
|---|---|---|
| A | "Nine sharp. Chai's on my step." | ठीक नौ। चाय मेरी सीढ़ी पर। |
| B | "Quarter past. Chai's still hot." | सवा नौ। चाय अभी गरम है। |
| C | "Quarter to ten. Chai's ready anyway." | पौने दस। चाय फिर भी तैयार। |

You, always: "Chai, then." | "तो चाय।". Button "See today" | "आज देखिए".

**Result.**
- "Easy", ticked.
- "On time: 4 of 4 jobs" | "समय पर: 4 में से 4 काम".
- "Day 1 · 1 day running" | "दिन 1 · लगातार 1 दिन".
- Text button "Medium: 9 pm, still dark" | "मीडियम: रात 9, अब भी अँधेरा".
- Main button "Back to today" | "आज पर वापस".

### 9.2 Medium: 9 to 10 pm, "Before ten" | "दस से पहले"

**Key B:** "Turns · Missed" | "बारी · छूटी". Turns: lane duty turns taken this year (higher is better). Missed: turns missed (lower is better).

**The circle:**

| Woman | Age, job | Numbers | Man | Age, job | Numbers |
|---|---|---|---|---|---|
| Geeta | 44, tuition teacher | 12 / 4 | Sanjay | 41, photocopy shop | 12 / 4 |
| Rekha | 38, gas agency counter | 11 / 4 | Vikram | 35, auto parts counter | 11 / 4 |
| Shabnam | 33, pharmacy counter | 13 / 3 | Arif | 31, cook for a caterer | 13 / 3 |
| Pooja | 30, school office | 14 / 2 | Nitin | 28, sells phone covers | 14 / 2 |
| Meera | 50, retired bank clerk | 12 / 4 | Gopal | 47, bakery counter | 9 / 5 |
| Asha | 36, clinic reception | 11 / 4 | Prakash | 40, drives for a travel agency | 9 / 5 |

Meera copies Geeta's numbers and never sits with Sanjay. Asha copies Rekha's and never sits with Vikram. Shabnam and Arif are the community-marked names.

**Beat 1, the lane.** M-W, left crop.
- Narration "9:00 pm. Still dark. Motor's off too." | "रात 9:00। अब भी अँधेरा। मोटर भी बंद।"
- Hari: "No water either. Wonderful." | "पानी भी नहीं। वाह।"
- Nusrat: "I filled two buckets at six." | "मैंने छह बजे दो बाल्टी भर लीं।"
- The circle band.

**Beat 2, at your door.** M-W, right crop.
- Shobha: "Office says a lineman's coming. Maybe." | "दफ़्तर कहता है, लाइनमैन आ रहा है। शायद।"
- You: "Then let's get ready." | "तो तैयारी शुरू।"

**Beat 3, the list.** "Before ten: Tank key · Charging order · Two torches · Lineman's call" | "दस से पहले: टंकी की चाबी · चार्ज की बारी · दो टॉर्च · लाइनमैन का फ़ोन".

**Question 1, the tank key. Pick one.**
- Shobha: "Motor's off. Who keeps the roof tank key?" | "मोटर बंद। छत की टंकी की चाबी कौन रखे?"
- Live "{name} keeps the key" | "चाबी {name} के पास".

| Card | Turns · Missed | Note | हिंदी | Voice |
|---|---|---|---|---|
| Geeta | 12 · 4 | Never lets anyone finish a sentence. | किसी को बात पूरी नहीं करने देती। | Hari |
| Sanjay | 12 · 4 | Runs the photocopy shop in town. | बाज़ार में फ़ोटोकॉपी की दुकान चलाता है। | |
| Asha | 11 · 4 | Sweetest smile in the whole lane. | पूरी गली में सबसे प्यारी मुस्कान। | Nusrat |
| Gopal | 9 · 5 | Snores through every wedding he attends. | हर शादी में बैठे-बैठे खर्राटे लेता। | Nusrat |
| Prakash | 9 · 5 | Drives a car for a travel agency. | ट्रैवल एजेंसी की गाड़ी चलाता है। | |

- **The pair and the nudge.** The equal two are Geeta and Sanjay; the nudge is on the woman.
- **The second leaning remark** is Asha's, outside the two. The decoy of the nudge's kind is Gopal's, on the second tie.
- **Bar:** Turns 10 or more. Gopal and Prakash miss.
- **Twin.** Opens a plain twin.

**Question 2, the charging order. Rank 5; the top two charge (cut plate "2 plugs" | "2 प्लग").**
- Shobha: "Inverter has two plugs. Whose phones charge first?" | "इन्वर्टर में दो प्लग। पहले किसके फ़ोन लगें?"
- Live "Settle the charging" | "चार्जिंग तय कीजिए".

| Card | Turns · Missed | Note | हिंदी | Voice |
|---|---|---|---|---|
| Pooja | 14 · 2 | Works in the school office. | स्कूल के दफ़्तर में काम करती है। | |
| Rekha | 11 · 4 | Books gas cylinders at the agency counter. | गैस एजेंसी काउंटर पर सिलेंडर बुक करती। | |
| Vikram | 11 · 4 | Can't say no to anyone, bless him. | किसी को मना नहीं कर पाता, बेचारा। | Nusrat |
| Gopal | 9 · 5 | Fixes everyone's fan for free, that one. | सबका पंखा मुफ़्त में ठीक करता, वो। | Hari |
| Prakash | 9 · 5 | Waves at every child he passes. | रास्ते के हर बच्चे को हाथ हिलाता। | Nusrat |

- **The pair.** The equal two are Rekha and Vikram, competing for second place under Pooja. The nudge is a kind remark on the man.
- **Second remark and decoy.** Both sit on the second tie (Gopal, Prakash).
- **Bar:** Turns 9 or more for both plugs. Nobody can miss.
- **Twin.** Launch week: never read.

**Beat 7, the breather.** M-B, with the stamp "Charging order: settled" | "चार्ज की बारी: तय".
- Narration "9:35 pm."
- Hari: "My radio needs charging too." | "मेरे रेडियो को भी चार्ज चाहिए।"
- Nusrat: "Your radio takes batteries, Chacha." | "आपका रेडियो सेल से चलता है, चाचा।"

**Question 3, the two torches. Spend up to 2 checks among 5.**
- Shobha: "Two torches left. Who gets them?" | "दो टॉर्च बचीं। किसे मिलें?"
- Buttons: "Give up to 2" | "2 तक दीजिए"; live "Hand out the torches" | "टॉर्च दे दीजिए".

| Card | Turns · Missed | Note | हिंदी | Voice |
|---|---|---|---|---|
| Nitin | 14 · 2 | Sells phone covers at the market. | बाज़ार में फ़ोन कवर बेचता है। | |
| Shabnam | 13 · 3 | Picks a fight over every parking spot. | हर पार्किंग पर झगड़ा कर लेती है। | Hari |
| Arif | 13 · 3 | Cooks for a big catering company nearby. | एक कैटरिंग कंपनी में खाना बनाता है। | |
| Geeta | 12 · 4 | Bargains ten minutes over coriander. | धनिए के लिए दस मिनट मोलभाव। | Nusrat |
| Meera | 12 · 4 | Kindest heart on this road, that one. | इस सड़क का सबसे नरम दिल, वो। | Hari |

- **The pair.** The equal two are Shabnam and Arif, both community-marked, under Nitin. The nudge is on the woman.
- **The decoy** of its kind is Geeta's. The second leaning remark is Meera's.
- **The trap.** Geeta and Meera tie one notch under the pair on both numbers, and Meera carries the warm remark. Missed 3 or fewer, so they miss.
- **Twin.** Opens a plain twin.

**Question 4, the lineman's call. Pick one of 4, a reason that matters.**
- Shobha: "The lineman calls one number. Whose?" | "लाइनमैन एक ही नंबर पर फ़ोन करेगा। किसका?"
- Live "Give him {name}'s number" | "{name} का नंबर दीजिए".

| Card | Turns · Missed | Note | हिंदी | Voice |
|---|---|---|---|---|
| Pooja | 14 · 2 | Minds the register at the school office. | स्कूल ऑफ़िस का रजिस्टर वही देखती है। | |
| Nitin | 14 · 2 | Has the lineman's number in his phone. | लाइनमैन का नंबर उसके फ़ोन में है। | |
| Geeta | 12 · 4 | Lives right next to the big transformer box. | बड़े ट्रांसफ़ॉर्मर बॉक्स के ठीक बगल रहती है। | |
| Vikram | 11 · 4 | Argues with every shopkeeper, that one. | हर दुकानदार से बहस करता है, वो। | Hari |

- **The reason that matters** sits on one of the two (here the man), and following it is fair. In launch week this pair is never read; from week 2 a "matters" twin opens in this place.
- **The practical-sounding fact** on Geeta sounds as if it matters and does not.
- **The outcome** is fixed for everyone ("Lineman: found the lane"), and the job is not counted.
- Pooja and Nitin were each once on earlier cards, at the top with a plain note, so their histories match.

**Beat 11, what came of it.** M-O reprints.
- Stamp by the three counted jobs: "Lineman in: 9:50" | "लाइनमैन पहुँचा: 9:50", or "10:05", or "10:20".
- Narration "Up the pole, torch in his teeth." | "दाँतों में टॉर्च, खंभे पर।"
- Sound "thak" | "ठक".

**Beat 12, the reaction.**

| Band | Shobha | हिंदी |
|---|---|---|
| A | "He's up already. Not long now." | ऊपर चढ़ गया। अब थोड़ी देर। |
| B | "Up by ten. Not long now." | दस तक ऊपर। अब थोड़ी देर। |
| C | "Up at last. Not long now." | आख़िर ऊपर। अब थोड़ी देर। |

You, always: "Fingers crossed." | "उम्मीद है।"

**Result.**
- "Medium", ticked.
- "On time: 3 of 3 jobs".
- "Day 1 · 1 day running".
- Text button "Hard: 10 pm, last push" | "हार्ड: रात 10, आख़िरी ज़ोर".
- "Back to today".

### 9.3 Hard: 10 to 11 pm, "Before eleven" | "ग्यारह से पहले"

**Key C:** "Kept · Lost" | "सँभाले · खोए". Kept: lane things they looked after this year (higher is better). Lost: things that went missing with them (lower is better).

**The circle:**

| Woman | Age, job | Numbers | Man | Age, job | Numbers |
|---|---|---|---|---|---|
| Anita | 36, courier office | 13 / 3 | Ramesh | 38, photo studio counter | 13 / 3 |
| Meena | 33, medical store till | 14 / 2 | Ajay | 35, bakery delivery van | 14 / 2 |
| Usha | 42, school canteen | 12 / 3 | Harish | 45, vegetable cart | 12 / 3 |
| Kusum | 39, dairy accounts | 15 / 2 | Dinesh | 37, stationery shop | 15 / 2 |
| Rani | 46, tailoring | 14 / 2 | Arun | 50, auto driver | 8 / 1 |
| Shalini | 30, phone shop counter | 15 / 2 | Mohan | 44, shoe shop counter | 7 / 6 |

Rani copies Meena's numbers and never sits with Ajay. Shalini copies Kusum's and never sits with Dinesh.

**Beat 1, the lane.** H-W, left crop.
- Narration "10:00 pm. Still no lights. Nobody's sleeping." | "रात 10:00। अब भी बत्ती नहीं। कोई नहीं सोया।"
- Hari: "I'm sleeping up here tonight." | "आज रात मैं यहीं सोऊँगा।"
- Nusrat: "With that snoring? Poor stars." | "उन खर्राटों के साथ? बेचारे तारे।"

**Beat 2, at your door.** H-W, right crop.
- Shobha: "Lineman's on the pole. One last push." | "लाइनमैन खंभे पर है। बस आख़िरी ज़ोर।"
- You: "Okay. Last list." | "ठीक है। आख़िरी लिस्ट।"

**Beat 3, the list.** "Before eleven: Spare keys · Cash tin · Night lights · The notebook" | "ग्यारह से पहले: चाबियाँ · गल्ला · रात की बत्तियाँ · नोटबुक".

**Question 1, the spare keys. Rank 5; the top three keep a set (cut plate "3 sets").**
- Shobha: "Three sets of spare keys. Rank who keeps one." | "चाबी के तीन सेट। किसे मिलें, क्रम लगाओ।"
- Live "Settle the keys" | "चाबियाँ तय कीजिए".

| Card | Kept · Lost | Note | हिंदी | Voice |
|---|---|---|---|---|
| Kusum | 15 · 2 | Writes up accounts at the dairy. | डेयरी का हिसाब-किताब लिखती है। | |
| Shalini | 15 · 2 | Hogs the bench outside the shop. | दुकान के बाहर की बेंच घेरे रहती। | Hari |
| Anita | 13 · 3 | Packs orders at the courier office. | कूरियर दफ़्तर में ऑर्डर पैक करती है। | |
| Ramesh | 13 · 3 | Shouts at the TV during matches. | मैच के दौरान टीवी पर चिल्लाता है। | Nusrat |
| Mohan | 7 · 6 | Grows chillies and mint on his roof. | छत पर मिर्च और पुदीना उगाता है। | |

- **The pair.** The equal two are Anita and Ramesh, third and fourth under two women tied at the top. They compete for the third set.
- **The nudge** is on the man. The decoy of its kind is Shalini's, on the top tie.
- **Bar:** Lost 5 or fewer. Mohan misses.
- **Twin.** Opens a plain twin.

**Question 2, the cash tin. Pick a team, 2 of 5.**
- Shobha: "Shop's cash tin, overnight. Which two keep it?" | "दुकान का गल्ला, रात भर। कौन दो रखें?"
- Live "Tin to {a} and {b}" | "गल्ला {a} और {b} को".

| Card | Kept · Lost | Note | हिंदी | Voice |
|---|---|---|---|---|
| Dinesh | 15 · 2 | Runs the stationery shop near the school. | स्कूल के पास स्टेशनरी की दुकान चलाता। | |
| Meena | 14 · 2 | Laughs far too loudly at weddings. | शादियों में बहुत ज़ोर से हँसती है। | Hari |
| Ajay | 14 · 2 | Sulks for days after any argument. | बहस के बाद कई दिन रूठा रहता। | Nusrat |
| Anita | 13 · 3 | Works nights at the courier office. | कूरियर दफ़्तर में रात की ड्यूटी। | |
| Arun | 8 · 1 | Grumbles about everything, that one. | हर बात पर बड़बड़ाता है, वो। | Hari |

- **The pair.** The equal two are Meena and Ajay, with a leaning remark on each of the same weight. In next week's half the remarks change sides.
- **The other cards.** Dinesh leads on Kept. The decoy of the remarks' kind is Arun's.
- **The trap.** Arun has the best Lost, but the bar is Kept 14 or more, so a player who goes by Lost alone misses. Anita misses too.
- **Twin.** Launch week: never read.

**Beat 7, the breather.** H-B, with the stamp "Cash tin: settled" | "गल्ला: तय".
- Narration "10:35 pm."
- Hari: "In my day, cuts lasted a week." | "हमारे ज़माने में बत्ती हफ़्ता भर जाती थी।"
- Nusrat: "In your day, nobody had phones." | "आपके ज़माने में फ़ोन ही नहीं थे।"

**Question 3, the night lights. Rank 5; the top three get a light (cut plate "3 lights").**
- Shobha: "Three lights for the night. Rank who gets one." | "रात की तीन बत्तियाँ। किसे मिलें, क्रम लगाओ।"
- Live "Settle the lights" | "बत्तियाँ तय कीजिए".

| Card | Kept · Lost | Note | हिंदी | Voice |
|---|---|---|---|---|
| Meena | 14 · 2 | Works the till at a medical store. | मेडिकल स्टोर के गल्ले पर बैठती है। | |
| Rani | 14 · 2 | Sat up all last night in hospital. | कल पूरी रात अस्पताल में जागी। | |
| Usha | 12 · 3 | Looks after every new tenant, bless her. | हर नए किरायेदार का ख़याल रखती है। | Nusrat |
| Harish | 12 · 3 | Sells vegetables from a cart each morning. | रोज़ सुबह ठेले पर सब्ज़ी बेचता है। | |
| Mohan | 7 · 6 | Fixes everyone's bicycle for free, that one. | सबकी साइकिल मुफ़्त में ठीक करता, वो। | Hari |

- **The pair.** The equal two are Usha and Harish, third and fourth under the tie of Meena and Rani. The nudge is a kind remark on the woman.
- **The decoy** of its kind is Mohan's. Rani carries the heavy-sounding fact.
- **Bar:** Kept 7 or more. Nobody can miss.
- **Twin.** Opens a plain twin.

**Question 4, the notebook. Pick one of 4, a leaning remark on each of the two.**
- Shobha: "Who keeps my notebook tonight?" | "आज रात मेरी नोटबुक कौन रखे?"
- Live "{name} keeps it" | "{name} के पास रहे".

| Card | Kept · Lost | Note | हिंदी | Voice |
|---|---|---|---|---|
| Kusum | 15 · 2 | Feeds every stray cat she sees. | हर आवारा बिल्ली को खिलाती है। | Hari |
| Dinesh | 15 · 2 | Knows a joke for every occasion. | हर मौक़े के लिए एक चुटकुला। | Nusrat |
| Ajay | 14 · 2 | Drives a delivery van for a bakery. | बेकरी की डिलीवरी वैन चलाता है। | |
| Anita | 13 · 3 | Sends sweets to every new neighbour. | हर नए पड़ोसी को मिठाई भेजती। | Nusrat |

- **The pair.** The equal two are Kusum and Dinesh, each with a kind remark. Each was once before on a card, at the top with a plain note (Kusum at question 1, Dinesh at question 2).
- **The decoy** of the remarks' kind is Anita's.
- **Bar:** Lost 2 or fewer. Anita misses.
- **Twin.** Launch week: never read.

**Beat 11, what came of it.** H-O, every window lit; the reprint lands bigger.
- Sound "khat!" | "खट!".
- Stamp "Lights back: 10:40" | "बत्ती आई: 10:40", or "10:55", or "11:15".
- Narration "Every fan in the lane, at once." | "पूरी गली के पंखे, एक साथ।"

**Beat 12, the reaction.**

| Band | Shobha | हिंदी |
|---|---|---|
| A | "Lights! Bed, all of you." | बत्ती आ गई! चलो, सब सो जाओ। |
| B | "Lights at last. Bed, everyone." | आख़िर बत्ती आई। सब सोने चलो। |
| C | "Late, but lights. Bed, everyone." | देर से सही, बत्ती आई। सब सो जाओ। |

You, always: "Goodnight, Aunty." | "शुभ रात्रि, आंटी।"

**Result.** "Hard", ticked; "On time: 4 of 4 jobs"; "Day 1 · 1 day running"; "Back to today".

**Done cover:** the title, three ticks and "Next puzzle in 3 h" | "अगली पहेली 3 घंटे में".

### 9.4 How the sample was checked

`check_format.py` reports no failures. It checks:
- each question's tie, gender split and kind shape, with second ties in every five-card question;
- matching histories and the weakest-card rule;
- first appearances (in every level, two pairs are new beside at least one other new face, and the last pair returns);
- bars and misses (4 and 4, 2 and 2, 2 and 2);
- note lengths, openings and the longest note;
- the nudge never alone and never the single longest;
- decoys, the reason that matters only on the pair, and no heavy fact on a community-marked name;
- the asker signing nothing, and voices balanced within one;
- one trap a level, and nobody on cards at two levels;
- the note-word scan over every line;
- the Hindi scan of lines by or to the player;
- the word count of every screen in both languages.

The Hindi scan flags five lines for a reader: "बत्ती गई", "दफ़्तर कहता है", "फ़ोन करेगा" (the lineman), "चढ़ गया" (the lineman) and "आ गई" (the lights). None has the player as its subject.

Not checked:
- the six-player test (prediction only);
- timings (estimates);
- how the Hindi reads (the five Hindi-first players);
- whether each job is a gain (rule 23, five players).

---

## 10. Rules this format sets or changes

| Rule | What this format does | Status |
|---|---|---|
| 53, one painting a day | Ten paintings a day, three shared levels of one scene | Owner's answer 12 replaces it |
| 11, the circle | Twelve per level, met together as faces in a band of their own | Reads the rule for dailies |
| 13, one woman-and-man tie | Kept in every question | Unchanged; question 5 offers a change |
| 15, second ties in half the decisions | In every five-card question, with a remark on one of the two in at least half | Stricter |
| 17, matching histories | Kept; a level's last pair returns, others are new beside other new faces | Unchanged |
| 22, judging notes | Signed only by the two chorus voices, balanced; the asker signs none | New, for your yes |
| 37 and 61, the asker | One weekday asker across all weeks and all worlds; the chorus also crosses worlds | Changes your 23 Oct "one person, one world" for the dailies (question 2) |
| 54, a trap a daily | One trap a level, pulling towards women and men equally across a week | Reads the rule per level |
| 57, launch-week kinds | The four app kinds from Monday, two new screens midweek | Changes "one a day" (question 6) |
| 59, variety by level | A level uses two or three kinds a day, no kind more than twice in a part; the day uses at least three | Rewritten for four questions a part |
| 42 and 43, the outcome | A list of four jobs, three bands, the world's big moment, the asker's band line | Reused from Saal Bhar |
| 58, the lean on every day's result | No lean figure on the daily result; plain counts only; finished pairs on Sunday | Owner's answer 13 |
| 62 and 63, word counts | Speech counted, every screen in both languages | Passes either way of rulebook question 14 |
| 41, Hindi fit at 360 x 640 | Five-card questions may show the "more" cue | Waits on rulebook question 16 |

---

## 11. Library parts to draw

Per design-before-build, every part below is drawn in the library in all five worlds and both languages, at 360 px and on the laptop stage, and shown to the owner on a pictured parts sheet before any app code. Each lands in `library.css`, the library page and DESIGN.md the same turn (library-in-sync).

**New:**
1. The daily strip reader: beats in one scrolling column, one Next button, tap anywhere on a panel, scroll back to reread, saved per beat. Phone and laptop stage.
2. The wide 2:1 people panel shown as two phone beats (left crop, then right crop) and whole on the laptop with bubbles arriving in two taps.
3. The circle band: twelve card faces, 56 px, first names only, 4 x 3, shuffled, under the lane panel.
4. The job list plate: deadline heading, four jobs with empty boxes, the asker's face chip.
5. The four job boxes with the story clock in the question sheet's top bar: empty, filled, and the hard-day neutral box.
6. The question sheet rising over the strip and folding into a stamp, with its reduced-motion still state.
7. The settled stamp in the strip: job word, tick, lock, and the read-only reopened state.
8. The voice chip on card notes: a 24 px face of Hari or Nusrat, with the name for screen readers only.
9. Pick one of five as rows (today a pick one is tiles).
10. The daily outcome beat in each world: the big moment with the band stamp (Lugdi reprint, Station split-flap, Jadugar cloth, Cricket scoreboard, Rukavat interruption card).
11. The reaction beat: the asker off the panel, your fixed reply, "See today".
12. The daily result card: level tick in words, "On time: 3 of 4 jobs", days played and streak, the next-part text button, "Back to today"; no Share.
13. The cover's level switch with start times under the segments, in four states (to play, Continue, played, all done), the first-visit cover without it, and the hard-day cover line.
14. The done cover with "Next puzzle in 3 h".
15. The ghost hand on blank cards, for each kind.
16. The daily "?" sheet: languages, one line on how to play, and the help line row on a hard-topic day.
17. The plain question box on a daily's hard question.
18. The Week tab on weekdays: the week as day objects (Lugdi's shelf of reprinted covers), three level marks a day, the forgiven-day mark, plain counts, Past puzzles and First take entries.
19. Past puzzles: the month list, covers with level chips, held-back days showing the date they open, a played-from-the-archive mark.
20. Sunday's week page: six covers, plain counts, the look-again pair side by side with "What was different?", and the first Sunday without it.
21. Continue mid-part: the strip reopened at a beat with the earlier beats and stamps above.
22. Key plates for the three new number sets, each with its two icons and Hindi words: "Answered · Late", "Turns · Missed", "Kept · Lost".
23. Face chips for the daily cast: six weekday askers, Hari and Nusrat. The art is their model sheets, one master and one per world look.

**Changed:**
24. The person card: a note with a voice chip, and five rows on every kind.
25. The bubble kinds from the bubble spec, applied to daily panels: a name tag on first meeting, an off-panel tail to the edge, the "You" plate, narration, sound words. The 200% text and no-picture stacks for the strip.
26. The level switch as DESIGN.md has it, gaining start times.
27. Every world's cover, losing "Level 3 of 6".
28. The result, losing Share.

---

## 12. Questions for the owner

1. **Three parts of one evening, or three versions of one moment?** Example: Easy is 8 pm when the lights go, Medium 9 pm while the lineman is on his way, Hard 10 pm when the lights come back. Someone who plays all three gets the whole evening with nothing repeated. The other way, all three start at 8 pm with different jobs: cheaper to paint, but the second and third play reread the same strip.
2. **May the dailies' characters appear in every world's look?** Example: Shobha Aunty asks every Monday, drawn as a pulp-cover character in Lugdi week and in railway-enamel style in Station week. Hari and Nusrat comment every day. You said "one person, one world" on 23 Oct, for the First take's family. Yes means both halves of a pair of questions are asked by the same person, and players get to know eight characters. No means about 30 characters, and the two halves asked by different people.
3. **May one wide painting be cut in two?** Example: one wide painting of Hari and Nusrat across the lane and Shobha at your door gives two phone panels (the lane, then your door) and one laptop picture. Yes keeps the day at ten paintings; no makes it thirteen.
4. **May the result say how the evening went?** Example: "On time: 3 of 4 jobs" on the result and "All set: 9:15" on the outcome. This is your open question 5 for the First take. If no, the result says "4 jobs settled" and the outcome stamp shows no time.
5. **Should some questions carry no hidden pair?** Example: on Tuesday's Easy, two of the four questions carry the hidden woman and man, and the other two only a tie between two women or one clear best with a remark. It halves the matched pairs to write and makes ties tell even less. But it changes your rule that every decision has one, and the research line must agree. Until you say, every question has one.
6. **Kinds in launch week.** Example: Monday already uses pick one, pick a team, rank and spend checks, the four the app has; the two new screens (lock a rule then assign people, choose words) join on Wednesday and Friday. Your 21 Oct plan was one new kind a day, made when a day had one puzzle. Is this pace fine?

---

## 13. Risks

1. **Timing is estimated, not measured.** Four questions of five cards may run past two minutes for slower readers, the 61-year-old and Hindi readers, and a Hindi day may near 7 minutes. Time the five newcomers before freezing week 1; the cut order is in section 1.
2. **The pair can always be found by numbers** (5.4). One pair a level is new on cards beside only one other new face. The playtest has to measure whether players hunt ties.
3. **Painting load.** Ten paintings a day, 120 for the fortnight, plus 24 character references and repaints, all through heavyq on a 24 GB Mac shared with other sessions. Keeping Shobha's, Hari's and Nusrat's faces the same across five looks is hard for FLUX, and edit-model painting is untested. Lean fallback: seven a day.
4. **Writing load.** 72 questions and about 340 notes a week in two scripts, each level a twelve-person deck that only a solver can balance, plus the weekly five-reader Hindi read. The Saal Bhar checkers and this spec's solvers live in a scratchpad that a reboot wipes; they must move into the project first.
5. **Faces.** 36 card faces a day is about 216 a week from a world pool of about 70, so each face appears about three days a week. Cap a face at three days and one pair a week, and paint about ten more faces per world for the fortnight. Liking a face leaks into picks (the shaadi demo's lesson).
6. **The same chorus every day** may grow stale or come to feel like "the easy one". Their lines must stay about the evening, never the cards, and fresh each part.
7. **Three parts can read as an order.** Medium-only players always start mid-evening, and a Hard-first player knows the ending.
8. **Jobs show only in plain notes,** so some cards never show one (Kavya, Lalita, Imran in the sample). A job on every card would add words held by the note rule.
9. **Twin bookkeeping.** Launch week reads only half its pairs, and Sunday's look-again waits for week 2. Hard-topic weekdays repeat a week apart.
10. **Word budgets are tight in Hindi.** Five screens sit exactly at their limit.
11. **The scene and the look.** A power cut may not pass the twice-a-week test for the metro player (a prediction only), and Lugdi's torchlit pulp can tip into menace. Keep every line warm.
12. **"On time: 3 of 4"** may read as a score (question 4).
13. **The strip-to-question join** has no shipped example to copy. Draw it, and let the owner play it first-run before any link goes out.

---

## 14. Files and checks

Tools in [content/drafts/daily-strip-2026-10-28/tools/](../../content/drafts/daily-strip-2026-10-28/tools/), run from that folder with `python3 -I <script>`:
- `check_format.py`: the sample day's three decks, every strip line in both languages, and all the checks in 9.4 (FAILS: none on 28 Oct).
- `solve_daily2.py`: the random-search deck solver for Easy and Medium.
- `solve_hard.py`: the exhaustive search for Hard.
- `solve_daily.py`, `diag.py` and `diag_hard.py`: the first exhaustive search and the diagnostics, which showed that the stricter first-appearance rule has no solution and which rule each failed deck broke.
- The three proposals' checkers: `check_sample.py`, `check_examples.py`, `check_reading.py`, `check_reading2.py`.

The three proposals are in [proposals/](../../content/drafts/daily-strip-2026-10-28/proposals/). The Lazyweb references, the judges' scores and best ideas, the owner questions and the parts list are in [assets/daily-strip-format-2026-10-28.json](assets/daily-strip-format-2026-10-28.json).
