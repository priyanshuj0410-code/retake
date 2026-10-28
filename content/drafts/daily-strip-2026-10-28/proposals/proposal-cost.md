---
type: proposal
title: The six-painting day, a cost-first design for the Retake dailies
description: One of three independent designs for the dailies (EVAL-23), written production first. A day is one everyday scene in six text-free paintings; each level reads as a four-beat comic strip carrying four questions in about two minutes; the launch fortnight costs 72 painting jobs plus 18 character references. Includes a full sample day (Tuesday, Lugdi week). A draft for the owner's yes; nothing is built.
---

# The six-painting day

**In one line:** each day is one everyday scene painted as six text-free pictures; all three levels share the place picture, the asker's panel and the world's big moment, and each level adds one painted turn of its own, so a level reads as a four-beat comic with four questions in about two minutes.

Sources read: the owner's answers 1 to 17 and sections 1 to 9 of `knowledge/story/ground-rules-draft-2026-10-25.md`; all of `knowledge/architecture/webtoon-bubble-spec-draft-2026-10-25.md`; Saal Bhar `chapter-1.json` (41 beats, 13 story panels, 8 painted "happened" panels and 8 painted decision backgrounds for 8 decisions); `src/take/data.ts` and the step files; DESIGN.md Layout, Cards, Levels and First take; `knowledge/reviews/dailies-map-2026-10-28.md`; `design-system/art/cutscenes.py` and `paint.log` (FLUX.2 klein 4B, 4 steps, 1024 x 768, about 80 to 90 s a try, 3 seeds a panel; the edit model takes at most 4 reference pictures).

---

## 1. The cost case

- **The painter is not the dear part; people are.** A try takes about 1.5 minutes, so even 30 panels a day is a night's queue. What does not scale is the human work on each panel: the owner picking a seed from the contact sheet, the close-up face check (painted bindis, lightened skin), the stray-text flags, labelling faces and placing every bubble twice (strip and wide stage, 1 to 3 minutes each, spec section 9.5). Each painted face is also a chance for the character to drift.
- **So the design paints few pictures, and spends the care where they are seen most.** The day picture is seen behind all 12 questions, on the cover and in the outcome, so it gets 6 seeds instead of 3. Only one panel a day shows a face.
- **The story comes from things that cost no paint:** live narration boxes, off-panel voices with tails to the edge, sound words on paper chips, card faces as live insets, a regular cast whose faces ride on every bubble as present-day chips, and the world's big moment laid over the day picture as live text.
- **For comparison:** written the First take's way (a painted lead-in and a painted "happened" beat for every decision), a day of 12 questions would need about 27 jobs. This design needs 6.

---

## 2. One day at a glance

| Beat | Picture | Painting job | Shared or own |
|---|---|---|---|
| Cover | the day picture, portrait (`-l`) | **job 1** (portrait), **job 2** (wide `-w`) | shared by all three level covers |
| B1 Opening | the left 4:3 of the wide day picture (1080 x 810 crop), people-free | none extra | shown on the first level played today only |
| B2 The ask | the day's regular, face-on, looking out of the picture at you | **job 3** | shared: the same painting at all three levels, with new bubbles each time |
| Q1, Q2 | the app's step screens over the day picture | none | own cards per level |
| B3 The turn | the level's own complication: a people-free close-up of an object, or the regular seen from behind | **jobs 4, 5, 6** (one per level) | own |
| Q3, Q4 | step screens over the day picture | none | own cards per level |
| B4 Outcome | the day picture dressed in the world's big moment (Lugdi: the cover reprints) with the level's stamp in live text | none | shared painting, own stamp |
| Result | the library's result card without Share | none | own counts |

The camera moves the way a comic page does: wide place (B1), face (B2), close-up of an object (B3), full-bleed payoff (B4). Every picture is a whole painted scene in the week's look: no cut-out figures pasted over backgrounds and no blur.

---

## 3. How a level plays

One tap brings the next beat into the scroll (owner, 25 Oct: "Scroll strip"); nothing moves by itself, scrolling up rereads, Back works. A question opens as the app's step screen over the day picture. Its confirm tap folds the step into a **settled stub** in the strip (a tick, the job word, a lock: "Drawer: settled"; no name, no face) and brings the next beat or question.

**Easy, played first today (about 1 min 50 s)**

| Screen | What the player does | s | Running |
|---|---|---|---|
| Cover, Easy | reads the day's title and the level's problem, taps Play | 4 | 0:04 |
| B1 | narration and the regular's line from off the panel; Next | 5 | 0:09 |
| B2 | the regular asks for help; the player's fixed reply; Next | 6 | 0:15 |
| Q1 pick one, 4 cards | reads, picks, confirms | 18 | 0:33 |
| Q2 pick one, 4 cards | reads, picks, confirms | 20 | 0:53 |
| B3 | the turn; Next | 6 | 0:59 |
| Q3 pick a team of 2 from 5 | picks two, confirms | 22 | 1:21 |
| Q4 pick one, 4 cards | reads, picks, confirms | 18 | 1:39 |
| B4 | the stamp and the regular's reaction; Next | 6 | 1:45 |
| Result | plain counts; Back to today | 5 | 1:50 |

**Medium, played second (about 1 min 55 s):** cover 4, B2 6 (B1 skipped), Q1 pick one 18, Q2 pick one with a reason that matters 22, B3 6, Q3 spend 2 checks among 5 22, Q4 rank 4 26, B4 6, result 5.

**Hard, played third (about 2 min 7 s):** cover 4, B2 6, Q1 pick one from 5 22, Q2 pick a team of 3 from 5 28, B3 6, Q3 rank 5 30, Q4 pick one 20, B4 6, result 5.

**All three: about 5 min 52 s**, inside the owner's 5 to 7. A level played first today adds B1's 5 s. Hindi readers take longer (Hindi gets 1.5 times the room), so a Hindi day runs about 6 min 30 s. The moving hand the first time a kind appears adds about 5 s, once.

---

## 4. Panels per day and the painting bill

**Per day: 6 jobs.**

| Job | What | Model | Tries |
|---|---|---|---|
| 1 | day picture, portrait | plain | 6 |
| 2 | day picture, wide, subject in the left third | plain | 6 |
| 3 | B2, the regular face-on | edit model: the regular's reference for the week's look, plus job 2 as the place | 3 |
| 4 to 6 | B3 for Easy, Medium, Hard | edit model: job 2 as the place (plus a prop reference if the prop recurs) | 3 each |

Shared by all three levels: jobs 1, 2 and 3. Job 1 also serves the cover, every decision background on phones and the B4 outcome; job 2 serves B1, every decision background on wide screens and the stage. Own per level: one B3 each. The day picture is passed to the edit model as the place reference, so the shelves and the lamp stay the same across the day's panels.

**Queue time.** About 24 tries a day at 1.5 to 2 minutes each: **about 40 minutes a day.**

**The launch fortnight (12 days and 2 Sundays):**
- 72 day jobs, about 8 h.
- 18 one-off reference jobs (six regulars: one present-day master each, then a Lugdi and a Station reference), about 1.5 h.
- Repaints, budgeting a third of jobs once, about 2.5 h.
- **About 12 hours of queue: three nights, plus one for stragglers.** Sundays need no new painting: Sunday's week, look-again and cover are library drawings over the week's own pictures.

**Every week after:** 36 jobs, about 4 to 5 hours with repaints, which is **one night a week**. The first week of each new world (Jadugar, Cricket, Rukavat) also needs its six regular references once: 6 jobs, about 30 minutes.

**Human time on the art per day:** six seed picks, one face close-up, and 7 bubble placements (B1 once, B2 three times, B3 three times) in two anchor sets. That is **about 25 minutes a day**.

**A lean day,** when the queue is short: one B3 shared by all three levels with new bubbles, so **4 jobs**. Use it rarely, because then a player who plays all three sees every painting three times.

---

## 5. The questions

- **Four questions a level, two each side of the turn:** B2, Q1, Q2, B3, Q3, Q4, B4. Four rather than five, because five would push Hard past 2 min 30 s. Allow a fifth only if the five-newcomer timing shows a level under 1 min 45 s.
- **Who asks.** The day's regular asks every question at every level. The question sits in their bubble at the fixed question place (top at 104 px), with their present-day face chip: today's `Step.speaker` and `speakerFace`. On a hard-topic question it sits in the plain question box, with no bubble (rule 37).
- **Two kinds of question (new; waits for the owner's yes, because it changes rule 13 for the dailies):**
  - **A pair question** carries the equal two and is one half of a twin.
  - **An open question** carries no woman-and-man tie anywhere. It has either a tie between two women or two men at the top or at a seat's edge, or one clear best who carries a remark: the daily's trap that is not obvious (rule 54).
  - Every question carries a tie or a trap, so nothing on a card tells a pair question from an open one.
  - Per strip, from week 2: **two pair questions** (one closing last week's twin, one opening a new one) **and two open questions.** In launch week the closing slot holds an open question.
  - Why: a player who knows the trick cannot tell which questions read anything, a day needs 6 pair questions instead of 12, and open questions need no twin bookkeeping.
- **Slots.** The writer chooses which two of the four slots carry pairs. A twin's second half sits in the same slot, at the same level, on the same weekday next week, asked by the same regular. This keeps rule 58, and it keeps rule 37's "same asker, same shape, same lead-in" by construction:
  - slot 1's lead-in is always B2 (the same regular, face-on);
  - slot 3's lead-in is always B3 (a picture with no faces);
  - slots 2 and 4 follow a settled stub.

  Across a week at one level, each slot carries a pair two to four times, and never the same two slots three days running. A script checks both.
- **How the cards appear.** Next on the beat before a question slides the strip up. The step screen fills the phone in the Fixed Skeleton:
  - the top bar, with the day plate as its title;
  - the regular's bubble with the question;
  - the stat key;
  - 4 or 5 cards from the week's face pool, in a fresh shuffle (`useShuffled`);
  - one button in the dock at 748 px.
- **How the player answers.** As in the First take, by the step kind: tap a card, then confirm (pick one); tap several, then the button (team, checks); move rows (rank). A revisited question is read-only, with its lock.
- **Kinds by level.** Hard pair questions use only rank, team, batting order or split (rule 55).
  - Easy uses only pick one and pick a team, the two fastest.
  - Medium adds spend checks and rank.
  - Hard uses rank, team, split and the batting order, with pick one for its open questions.
  - The launch fortnight uses only kinds the app already has (pick one, checks, rank, team). See section 14.

---

## 6. Levels

- **The same at all three levels:** the day picture, the regular, the B2 painting, the evening and the outcome's frame.
- **Each level's own:** a problem (named on its cover, live text), a B3 turn painting, a circle of 5 or 6 card people from the week's face pool (nobody sits in an equal pair at more than one level that day, rule 53), a number set, a target and a stamp.
- **What changes in the pair question** (owner's answer 11, rule 55):
  - **Easy:** one nudge, a loaded word in a named voice on one of the two; clear numbers, the two jointly best on both; a second tie between two women or two men lower down; a decoy remark of the nudge's kind.
  - **Medium:** Easy's features plus one of: a reason that truly matters on one of the two (a "matters" twin), or a second leaning note on a card outside the two.
  - **Hard:** a muddle. The two sit below the top (rank or team, tied for the last seat), and/or the nudge is two leaning notes, one on each of the two, which change sides in the twin.
- **What changes in the open questions:** Easy has one remark on a tied card. Medium puts a practical fact that sounds as if it matters on a decoy, and a heavy-sounding fact on one decoy a level (rule 20). Hard has two remarks on the tied cards and 5 cards.
- **Cards:** 4 at Easy, 4 or 5 at Medium, 5 at Hard. Hindi on a 360 x 640 phone follows rule 41's open question 16.
- **Playing a second and a third level:**
  - The cover's level switch ticks the levels played. The next level's cover shows the same picture with that level's problem ("The ice run").
  - The strip opens at B2. B1 is skipped, and Back rereads it.
  - B2 is the same painting of the regular with a new problem in the bubble, which reads as the next thing to land on them that evening: a repeated panel with new words, a strip device.
  - B3 is a painting the player has not seen.
  - The cards carry new people.
  - B4 is the same frame with this level's stamp.

  So each later level shows one new painting, two familiar ones with new words, and no repeated text.

---

## 7. Keeping the equal two hidden

Every rule below is a refusal in the day checker unless it says "by eye".

1. **Two casts.**
   - The regulars talk, ask and sign judging notes, and are never on a card.
   - Card people are never painted and speak no line. They appear only as their card portraits.
   - The player is never painted: people look out of the picture at them, and nothing is held from the player's side.
2. **No beat names, points at or describes anyone on the cards to come** (rule 36 and spec 7.2). The nudge lives only in card notes, a judging note always carrying its speaker's face chip. Each level's judging notes come from at least two regulars, a woman and a man.
3. **Stakes never point at gender.** The spec's word list refuses women, men, girls, boys and the rest, in both languages.
4. **Reactions are the same whoever is picked.**
   - The settled stub carries only the job word.
   - The outcome comes from the numbers only: each pair's numbers clear the question's bar, so swapping the two changes nothing visible.
   - The regular's B4 line is fixed for each band of the outcome.
5. **Every question has a tie or a trap,** so a tie is not a tell. Open questions never hold a woman-and-man tie anywhere, so the only such tie in a strip is the pair.
6. **The notes give nothing away** (rule 19, memory: note-length-tell).
   - Notes within a question run within 2 words in each language, and the pair's two notes are the same length.
   - The longest note falls on the pair in a quarter to a half of a week's pair questions.
   - The pair's notes never share an opening word or a sentence frame.
7. **Twins look unrelated.** They are a week apart, in the next world's look, with new people, a new task and freshly worded nudges. Only the slot, the asker and the kind carry over, and those carry over for every question anyway.
8. **The pictures never single anyone out.**
   - The day picture and every B3 have no people.
   - B2 shows only the regular.
   - Nothing in a picture is lit, held or pointed towards any card (by eye).

---

## 8. Words

Counted: speech, the player's lines, narration, sound words, sign words, buttons and settled stubs. Not counted: names, kin names, numbers and times. This counts speech, the stricter reading, so the page passes whichever way the owner answers question 14. Each language is counted on its own.

| Screen | Budget | Limits inside it | Sample Easy, EN / HI |
|---|---|---|---|
| Cover | 20 | day title at most 5, level problem at most 3 | 11 / 9 |
| B1 | 20 | at most 3 pieces; narration at most 12; a spoken line at most 10 | 13 / 11 |
| B2 | 20 | the goal at most 10; the player's fixed line at most 5 | 12 / 14 |
| Q1 | 15 | the question at most 10 | 12 / 14 |
| Q2 | 15 | the question at most 10 | 12 / 14 |
| B3 | 20 | sound word, one line, the stubs | 15 / 16 |
| Q3 | 15 | the question at most 10 | 14 / 14 |
| Q4 | 15 | the question at most 10 | 13 / 13 |
| B4 | 20 | stamp at most 4, reaction at most 10 | 11 / 11 |
| Result | 20 |  | 10 / 8 |

- **Card notes** are held by the note-length rule, not the count. Aim for 4 to 6 words.
- **Questions:** aim for at most 7 words, so the 4-word stat key fits.
- **The strip story** comes to about 130 counted words a day across all three levels.

---

## 9. The regulars: the lane's six voices

The dailies get their own small cast, never the First take's family. These are six neighbours from one lane, one for each weekday. Each asks on their own weekday, every week, in every world's look, so both halves of every twin have the same asker for free. They are 3 women and 3 men, aged 30 to 60, with ordinary jobs. On other days their face chips sign judging notes, so the whole lane is heard every day. Each is defined in depth before painting, as Saal Bhar's characters are: talk, words, clothes, posture, one prop. The prop is painted from its own reference, and each has a glossary row.

| Day | Regular | Age | Job | Anchors the painter keeps |
|---|---|---|---|---|
| Mon | Asha | 52 | bank cashier, secretary of the lane committee | maroon cardigan, a steel pen clipped at her collar, cloth shoulder bag |
| Tue | Manoj | 47 | runs the corner general store | thick black moustache, rectangular steel spectacles, mustard half-sleeve shirt under a grey sleeveless sweater, brass keys on a red cord, a square white emergency lamp |
| Wed | Rekha | 38 | runs a lunch-tiffin kitchen | green checked apron, hair in a low knot, a steel ladle |
| Thu | Joseph | 58 | retired railway clerk who does the lane's paperwork | white half-sleeve shirt, grey side-parted hair, brown leather satchel, steel flask |
| Fri | Nasreen | 34 | runs a phone-repair and recharge counter | blue dupatta knotted at the shoulder, a small screwdriver behind one ear |
| Sat | Ravi | 31 | bus-depot office clerk; runs the lane's Saturday football | red tracksuit jacket, a whistle on a cord |

**Faces.**
- Each regular has one present-day master sheet. From it comes one reference per world look, made with the edit model and picked by eye (the method in `characters/result-v2.json`), so the painter never changes style and keeps a face in the same step.
- The regular's present-day portrait is the chip on every bubble tag and on every question.
- Only B2 paints the face, once a day, checked close up against the chip. If it fails twice, that day's B2 becomes the regular seen from behind, with the chip on the bubble.
- Painter prompts use the role word ("the shopkeeper"), never the name.

This changes the owner's 23 Oct call that each person keeps one world, for the daily askers only (section 14).

---

## 10. Sample day: Tuesday, Lugdi week (launch week, day 2)

**Scene sheet.**
- **Title:** "Lights out at the store" | "दुकान की बत्ती गुल"
- **Place:** the corner general store in a narrow residential lane. **Time:** 7:40 pm, a power cut.
- **Life area:** work (the family shop is one of rule 1's own examples of a narrower daily). Prediction for the six players: power cuts and the corner shop pass for all six; readers confirm.
- **The regular:** Manoj, who has to keep the shop going in the dark with help from neighbours.
- **The three problems:** Easy, "The counter" | "काउंटर"; Medium, "The ice run" | "बर्फ़ का फेरा"; Hard, "The milk van" | "दूध की गाड़ी".
- **Card people:** lane neighbours (the same kind of relation for all), with jobs most people can do. Judging notes are signed by Asha (w) and Joseph (m) with their chips.
- **Number sets, from the standing library:** set A, "Counter evenings · Wrong sums" | "काउंटर की शामें · ग़लत हिसाब" (evenings they have run a shop or office counter this year, more is better; times their count came out wrong this year, fewer is better). Set B, "Errands · Times late" | "फेरे · देर से" (errands run for the lane this month; times late).
- **Launch week:** each level opens one twin, in slot 2, and slot 4 holds an open question.

### The six paintings

Every prompt ends with Lugdi's `STYLE['lugdi']` line and the text-free, unsigned ending (`STORY_NO` plus the spec's `UNSIGNED`). Each new phrase gets a glossary row first: emergency lamp, glass-topped counter, plain tins and packets in shadow, steel shutter, plain padlock, plain blue crates, plain white milk pouches, jute sacking, chest freezer. **The power cut is a text-free aid:** the shelves sit in deep shadow, so packets need no labels and the lamp lights only plain surfaces.

1. **Day picture, portrait (job 1), and 2. day picture, wide (job 2), 6 tries each.**
   - The front of a small corner general store in a narrow residential lane at night, during a power cut. The steel shutter is raised halfway.
   - Inside, a square white emergency lamp stands on a glass-topped counter and throws hard white light across it, while the shelves behind fall into deep violet shadow, showing only the rounded shapes of plain tins and packets.
   - Sacks of rice and dal with rolled-down tops stand at the step. The rest of the lane is dark: shut wooden doors, a parked scooter, a dead streetlamp.
   - No people. A plain night sky above the rooftops fills the top third.
   - Wide version: the store sits in the left third; to the right the dark lane carries on, quieter, with shut doors and sky.
3. **B2, the regular (job 3), 3 tries, edit model with the shopkeeper's Lugdi reference and job 2 as the place.**
   - Inside the same store at night. The shopkeeper, a man of 47, stands behind the glass-topped counter in the left third, face-on.
   - His look: medium-brown skin, a broad face, short hair greying at the temples, a thick black moustache, rectangular steel spectacles, a mustard half-sleeve shirt under a grey knitted sleeveless sweater, brass keys on a red cord at his belt.
   - He holds the square white emergency lamp up at shoulder height in his right hand and looks straight out of the picture at the viewer, mouth open mid-word. His head sits about a third of the way down.
   - Hard white lamp light from below, deep violet shadow behind. Calm space: the plain dark upper wall, upper right. No other people.
4. **B3 Easy, "the other shop" (job 4).**
   - Seen from inside the dark store, looking out across the lane: opposite stands a second small shop with its steel shutter pulled fully down and a plain brass padlock at its foot, faintly lit by white light spilling from behind the viewer.
   - A stray dog sleeps on its step, and the wet road lies between.
   - No people, no hands. Calm space: the dark sky above the opposite roof.
5. **B3 Medium, "the ice" (job 5).**
   - Floor-level view inside the dark store: a big block of ice wrapped in wet jute sacking sits in a wide steel tub.
   - Melt water spreads across the stone floor, catching the light of one candle on the counter's edge above. The white side of a chest freezer, lid shut, fills the right edge.
   - No people. Calm space: the dark counter front, top third.
6. **B3 Hard, "the van" (job 6).**
   - The store's front step at night, from a low angle: four stacked plain blue plastic crates of plain white milk pouches, caught in the hard white glare of headlights from the right edge, throwing long shadows left across the wet road.
   - The van itself is out of the picture. No people. Calm space: the night sky, top third.

### Easy, "The counter": every beat and every question

Each line is given in English, then Hindi, with its counted words. Bubble kinds are from the spec. Every bubble carries Manoj's name tag. His first bubble of the day reads "Manoj, the corner store" | "मनोज, नुक्कड़ की दुकान".

**Cover** (job 1 with live text): "Lights out at the store" · "The counter" · Easy | Medium | Hard · Play. EN 11 / HI 9.

**B1** (crop of job 2, first level today only):
- `narr`, top left: "Tuesday, 7:40 pm. The lane goes dark." | "मंगलवार, शाम 7:40। गली में अँधेरा।" (5 / 4)
- `say`, Manoj, off the panel, tail to the lit shutter: "Torches on, everyone. The shop stays open." | "सब टॉर्च जलाओ। दुकान खुली रहेगी।" (7 / 6)
- Next | आगे (1). Beat total: EN 13 / HI 11.

**B2** (job 3):
- `say`, Manoj to you: "Counter needs hands till 9. You're in charge." | "9 बजे तक काउंटर पर हाथ चाहिए। इंचार्ज तुम हो।" (7 / 9)
- `you`: "Tell me what's needed." | "बताइए, क्या करना है?" (4 / 4)
- Next (1). Beat total: EN 12 / HI 14.

**Q1, open, pick one** (a gain: trust):
- Question: "Who takes the cash drawer?" | "कैश की दराज़ कौन सँभाले?" (5 / 5)
- Key: set A (4 / 5). Button: "Pick one", then "Give the drawer" | "किसी एक को चुनें", then "दराज़ दीजिए".
- Screen: EN 12 / HI 14.

| Card | Numbers | Note (EN / HI) |
|---|---|---|
| Saroj (w, 45) | 14 · 1 | Runs the corner tea stall. / नुक्कड़ पर चाय की टपरी। |
| Meena (w, 60) | 14 · 1 | [Joseph's chip] Counts every coin twice. Slow. / हर सिक्का दो बार गिनती। धीमी। |
| Dinesh (m, 40) | 10 · 3 | Drives an office car by day. / दिन में दफ़्तर की गाड़ी चलाता। |
| Kunal (m, 27) | 9 · 2 | [Asha's chip] Always in a rush, that one. / हमेशा जल्दी में रहता है। |

Two women are tied at the top. The trap is Joseph's "slow". The bar for the target is wrong sums of 1 or fewer: Saroj or Meena meets it. Settled stub: "Drawer: settled" | "दराज़: तय".

**Q2, pair question, pick one** (opens twin Tue-Easy-slot 2; a plain twin; the nudge is a loaded word on the man; a gain: trust):
- Question: "Who keeps the credit book?" | "उधार की कॉपी कौन रखे?" (5 / 5)
- Button: "Give the book" | "कॉपी दीजिए". Screen: EN 12 / HI 14.

| Card | Numbers | Note (EN / HI) |
|---|---|---|
| Anita (w, 35) | 12 · 0 | Bank clerk, fills everyone's forms. / बैंक में क्लर्क, सबके फ़ॉर्म भरती। |
| Rohit (m, 34) | 12 · 0 | [Asha's chip] Tears up over small mistakes. / छोटी ग़लती पर आँखें भर आतीं। |
| Dinesh (m, 40) | 8 · 2 | Back from a double shift. / दोहरी शिफ़्ट करके लौटा। |
| Kunal (m, 27) | 8 · 2 | [Joseph's chip] Sulks when the queue is long. / लंबी लाइन देख मुँह फुला लेता। |

- **The equal two:** Anita and Rohit, jointly best on both numbers (rule 14), a year apart, neither name community-marked, and new to the evening, so their earlier appearances match.
- **The ties and the decoy:** Dinesh and Kunal are the second tie, two men. Kunal's remark is the decoy of the nudge's kind.
- **Notes:** EN 5, 5, 5, 6 and HI 6, 6, 4, 6. The pair's notes are the same length in both languages and share no frame.
- **The Hindi:** "आँखें भर आतीं" agrees with आँखें, so the note carries no verb gender. The five readers choose the loaded word.
- **The second half,** next Tuesday in Station's look: Manoj asks again in slot 2, a pick one with a new pair from the Station faces and a new task (say, who holds the spare key at the wholesale market's night counter). The same idea, worded afresh ("Frets over the smallest slip"), sits on the woman.
- Settled stub: "Book: settled" | "कॉपी: तय".

**B3** (job 4):
- `sfx`: "khat khat" | "खट खट" (2 / 2)
- `say`, Manoj, off the panel from the left edge: "Other shop's shut. The whole lane's coming here." | "दूसरी दुकान बंद। पूरी गली यहीं आ रही है।" (8 / 9)
- The two stubs above (4 / 4), then Next (1). Beat total: EN 15 / HI 16.

**Q3, open, pick a team of 2 from 5** (help at the counter; open questions are outside the twins, so rule 23's gain-or-load test is not needed here):
- Question: "Two more at the counter. Pick two." | "काउंटर पर दो और। दो चुनिए।" (7 / 6, counting "two" against us)
- Button: "Pick 2", then "Set the counter" | "दो चुनिए", then "काउंटर तय करें". Screen: EN 14 / HI 14.

| Card | Numbers | Note (EN / HI) |
|---|---|---|
| Saroj (w, 45) | 13 · 1 | Knows every regular by name. / हर ग्राहक को नाम से जानती। |
| Dinesh (m, 40) | 10 · 1 | Did the lane's census count. / गली की जनगणना में गिनती की। |
| Kunal (m, 27) | 10 · 1 | [Asha's chip] Chats with every single customer. / हर ग्राहक से गप्पें लड़ाता। |
| Meena (w, 60) | 7 · 2 | Retired teacher, knows every shelf. / रिटायर्ड टीचर, हर शेल्फ़ जानती। |
| Anita (w, 35) | 6 · 3 | Just back from the bank. / अभी-अभी बैंक से लौटी। |

Saroj takes the first seat. Two men tie for the second, and one carries a remark, so it looks exactly like a Hard pair question and reads nothing.

**Q4, open in launch week, pick one** (from week 2 this slot closes last week's twin):
- Question: "Who counts the till at 9?" | "9 बजे गल्ला कौन गिने?" (5 / 4)
- Button: "Hand over the till" | "गल्ला सौंपिए". Screen: EN 13 / HI 13.

| Card | Numbers | Note (EN / HI) |
|---|---|---|
| Anita (w, 35) | 13 · 0 | [Joseph's chip] Talks right through every count. / गिनते हुए भी बोलती रहती। |
| Meena (w, 60) | 11 · 1 | Kept school accounts for thirty years. / तीस साल स्कूल का हिसाब रखा। |
| Saroj (w, 45) | 11 · 1 | Shuts her own stall at 8. / अपनी टपरी 8 बजे बंद करती। |
| Rohit (m, 34) | 9 · 2 | Ten years at a pharmacy counter. / दस साल से दवा की दुकान पर। |

One clear best carries a remark (the trap), two women tie below her, and there is no woman-and-man tie anywhere.

**B4 outcome** (job 1 reprinted as a Lugdi pulp cover, the world's big moment; the stamp is live text in Lugdi's stamp). The outcome comes from the numbers only: each of the four bars met or not.
- Stamp: "Shutter down 9:00" if all four are met, "9:20" if one is missed, "9:45" if two or more are missed | "शटर बंद 9:00" (2 / 2).
- Manoj, off the panel, one fixed line for each band:
  - all met: "Every sum right. The lane got its milk." | "हर हिसाब सही। गली को दूध मिल गया।" (8 / 8)
  - one missed: "A bit late. Everyone still got their milk." | "थोड़ी देर हुई, पर सबको दूध मिला।" (8 / 7)
  - two or more missed: "Late night. Still, nobody went home empty-handed." | "रात हो गई। फिर भी कोई ख़ाली नहीं लौटा।" (7 / 8)
- Next (1). Beat total: EN 11 / HI 11. Warm in every band, no joke, about the event and never the person picked.

**Result** (library result card, no Share): "Shutter down 9:00" · "Days played 2 · In a row 2" · level ticks · "Back to today" | "शटर बंद 9:00" · "खेले दिन 2 · लगातार 2" · "आज पर लौटें". EN 10 / HI 8. There is no twin line in launch week (section 14).

### Medium, "The ice run": how it differs

- **Its cover** names "The ice run". **B1** is skipped if a level was played today.
- **B2** is the same painting with a new bubble: "Freezer's off. Ice within the hour, or it melts." | "फ़्रीज़र बंद। घंटे भर में बर्फ़ चाहिए, वरना सब पिघलेगा।" (9 / 10), the same `you` line and Next: EN 14 / HI 15.
- **Number set B.** A new circle of 6, with nobody from the Easy circle: Leena, Vikram, Rabia, Shampa, Gopal, Pushpa.
- **Q1, open, pick one:** "Who phones the ice depot?" Two men are tied at the top, and one carries Asha's remark "Argues with everyone".
- **Q2, pair question, a "matters" twin, pick one:** "Who takes the scooter to the depot?" | "स्कूटर लेकर डिपो कौन जाए?" (7 / 5)

| Card | Numbers | Note (EN / HI) |
|---|---|---|
| Leena (w, 33) | 9 · 1 | Holds a two-wheeler licence. / दोपहिया चलाने का लाइसेंस। |
| Vikram (m, 34) | 9 · 1 | Tutors maths every evening. / हर शाम गणित पढ़ाता। |
| Rabia (w, 30) | 7 · 2 | Own scooter's at the mechanic. / अपना स्कूटर मिस्त्री के पास। |
| Shampa (w, 45) | 7 · 2 | Runs the tailoring shop upstairs. / ऊपर सिलाई की दुकान चलाती। |

  - The reason that truly matters (the licence) sits on one of the two only, so following it is fair. In next Tuesday's half it sits on the man.
  - Rabia's practical fact sounds as if it matters but does not (she would ride Manoj's scooter): the decoy of the nudge's kind, and the not-obvious trap.
  - Two women are tied lower. The pair's notes are 4 and 4 words in both languages.
- **B3** (job 5): `sfx` "tap tap" | "टप टप"; Manoj off the panel: "Ice is here. Pack it round everything." | "बर्फ़ आ गई। सबके चारों ओर लगाओ।" (7 / 7).
- **Q3, open, spend 2 checks among 5** ("Tick two to pack the freezer"): one clear best, and two men tied for the second check. One of them carries the level's heavy-sounding decoy fact ("Back at work after a long illness"), never on a community-marked name.
- **Q4, open in launch week, rank 4** ("Who packs first? Rank all four", with a cut plate "2 shelves" under second place): a tie between two women in the middle.
- **B4:** the same reprint with a stamp of "Freezer saved: 3 of 3 shelves", "2 of 3" or "1 of 3", and Manoj's line for the band.

### Hard, "The milk van": how it differs

- **B2** is the same painting: "Milk van at 8:30. Count it, pay it, shelve it." | "8:30 पर दूध की गाड़ी। गिनो, पैसे दो, रखो।" (9 / 8).
- **Set A again.** A new circle of 6: Uma, Kusum, Deepa, Rajan, Hari, Ramesh.
- **Q1, open, pick one from 5** ("Who meets the van at the step?"): two women are tied at the top, each with a remark from a different regular.
- **Q2, pair question, pick a team of 3 from 5:** "Pick three to unload and count." | "उतारने और गिनने को तीन चुनिए।" (5 / 5)

| Card | Numbers | Note (EN / HI) |
|---|---|---|
| Uma (w, 34) | 14 · 0 | Ran a ration shop counter. / राशन दुकान का काउंटर सँभाला। |
| Kusum (w, 60) | 13 · 0 | Retired tailor, sharp with sums. / रिटायर्ड दर्ज़ी, हिसाब में तेज़। |
| Deepa (w, 35) | 11 · 1 | [Joseph's chip] Bossy with every van driver. / हर ड्राइवर पर हुक्म चलाती। |
| Rajan (m, 40) | 11 · 1 | [Asha's chip] Too soft to argue counts. / गिनती पर बहस से कतराता। |
| Hari (m, 40) | 8 · 2 | Off the night shift at 8. / 8 बजे रात की शिफ़्ट से छूटा। |

  - Uma and Kusum take the first two seats. The equal two, Deepa and Rajan, tie for the last seat, below the top, on both numbers, so a player going by either number alone still has to choose between them (rule 14).
  - Each carries a leaning note pulling away from them. The notes change sides in next Tuesday's half.
  - All notes are 5 words in both languages. The pair is 5 years apart, and neither name is community-marked.
- **B3** (job 6): `sfx` "peep peep" | "पीं पीं"; Manoj off the panel: "Early, and two crates short. Recount everything." | "जल्दी आ गई, और दो क्रेट कम। सब दोबारा गिनो।" (6 / 8).
- **Q3, open, rank 5** ("Rank five. Top two recount the crates."): two men are tied in the middle, and a heavy-sounding fact sits on a decoy.
- **Q4, open in launch week, pick one** ("Who pays the driver from the till?"): one clear best carries two remarks, and two women tie below.
- **B4 stamp:** "Van settled: 8:40", "9:00" or "9:25".

---

## 11. Production: the fortnight before launch, then every week

**Before launch (12 days and 2 Sundays):**
1. **Set-up (about 2 days).**
   - The six regulars, defined in depth.
   - The glossary rows.
   - A standing library of about 12 number sets, each with its icon pair and Hindi word, drawn once in the library and reused with new values (rule 18).
   - One fixed job line for each pool face, written and translated once (each face keeps one name and one role for good, rule 61). About a third of all notes are then standing lines that never need rewriting or re-translating.
   - The fortnight plan: 12 scene sheets (regular, place, time, three problems, three turns, targets), the 18 week-1 twins placed by weekday, level, slot, kind and nudge idea, and their week-2 second halves sketched beside 18 new openings.
2. **Night 1:** the 18 reference jobs; the owner picks the masters, then the Lugdi and Station references.
3. **Writing (about 8 working days at 1.5 days of content a day).**
   - Per day: the scene sheet and painter prompts (30 min), the strip lines (30 min), 12 questions with cards using a number solver like Saal Bhar's `milp.py` (2 h), the checks (15 min), and fresh Hindi (1 h).
   - Painter prompts need only the scene sheet, so each week's prompts are fixed on its first writing day, and the painting runs while the cards are written.
4. **Nights 2 and 3:** Lugdi week's 36 jobs, then Station's. **Night 4:** repaints.
5. **Placement:** about 25 minutes a day on the placement page, about 5 hours in all.
6. **Review:**
   - The owner gets each week as one contact sheet of strips with bubbles placed, plus a played run.
   - The five Hindi-first readers read each week's Hindi at once.
   - Fixes, then a freeze.
   - Someone plays the whole fortnight before any link goes out (rule 24).

**Every week after:** 6 scene sheets and 72 questions (36 pair, 36 open), about 20 to 25 hours of writing and checking; one painting night; about 2.5 hours of placement; one owner review and one Hindi read. Hold two weeks ahead, building to the four of rule 61.

---

## 12. Reuse and what is new

**Reused from the First take app:**
- the step screens Pick (with checks), Rank, Team, Order and Split, with `Frame`, pick-then-confirm, the revisited lock and `useShuffled`;
- the question in the asker's bubble with a face chip (`Step.speaker`, `speakerFace`);
- the person cards in each world's paperwork;
- the store's checks of kept answers;
- the "?" sheet, which holds the help line;
- `lang.tsx` (`Bi`, `eng()`) and the three language modes;
- the offline cache;
- the birth-date gate;
- the library's cover, result, Sunday and look-again drawings in all five worlds;
- the portrait pool: 70 Lugdi and 69 Station faces, each with one name;
- `cutscenes.py`: `paint`, `paint-ref`, `paint-refs` with the edit model, `sheet` and the glossary refusals;
- `streak.ts` and `calendar.ts`.

**Reused from the strip spec:**
- painter rules 1 to 8 and `ROOM`, `FACING` and `UNSIGNED`;
- the stray-text check (`textcheck.swift`);
- `bubbles.json`, with strip and stage anchors;
- the placer, tails, and the 200% and no-picture stacks;
- the bubble kinds and Lugdi's plates;
- the screen-reader order, reduced motion and the offline fallback;
- the per-beat word counter;
- the casts refusal, the card-name refusal, the gender word list and the Hindi gender scan.

**New to build:**
- the **day file**: shared beats B1, B2 and B4's frame; per-level B2 lines, B3 and four questions; the pair or open flag and the slot on each question;
- the **settled stub** in the strip;
- the **skip-B1 rule** for a later level, and the **level problem line** on each cover;
- the **B4 outcome**: the world's big moment over the day picture, with a stamp for each band;
- the **daily result** with plain counts;
- the **regulars file**: chips, references and the weekday;
- the **number-set library** with icons;
- the **day checker**:
  - open questions never hold a woman-and-man tie;
  - every question has a tie or a trap;
  - pair slots vary across the week;
  - a closing half matches its opening half's slot, level, weekday, asker and kind, with the nudge swapped;
  - note lengths;
  - nobody sits in a pair at two levels in one day;
- **edit-model painting with the day picture as the place reference**: untested, so try it on the sample day first.

The strip reader itself is new, but it is shared with Saal Bhar (the spec's roughly 3 days), so the dailies add only the pieces above.

---

## 13. Risks

1. **Lettered places.** Shops, crates, packets and boards draw stray letters. Dark scenes help, but shop and office days may need half their jobs repainted. Prefer scenes with few lettered surfaces, and budget for repaints.
2. **The face drifts in B2,** or the painter adds a bindi or lightens the skin of a woman regular. Only one panel a day is exposed, it is checked against the chip, and there is a from-behind fallback, but a regular who keeps failing needs more reference views, or a one-person LoRA test through heavyq.
3. **The same four-beat shape every day may read as a template,** which is the cheapness the owner wants to avoid. Vary B3's camera and subject, the slots of the pairs and the regulars' small threads. The upgrade is a B2 for each level (8 jobs a day).
4. **The story per level is thin:** about 45 words around four questions. Depth has to come from the regulars recurring week after week, and threads that run across days wait on the owner's question 11.
5. **Changing rule 13** (open questions without an equal two) needs the owner's yes and the research line's view. Without it, a day needs 12 pair questions, twice the twin bookkeeping, and a tie is always a tell.
6. **Regulars across all five worlds** changes the owner's 23 Oct one-world call for the daily askers. The alternative, six regulars per world, means 30 character sheets, and twins asked by different people.
7. **Launch week closes no twin,** so the first Sunday has no side-by-side for "What was different?" (rule 58), and results show no finished-twin count until week 2.
8. **Writing is the real bottleneck,** not the painter: 72 questions and about 300 notes a week in two scripts, plus the weekly five-reader Hindi read. If writing slips, the painting is ready but the day is not.
9. **Time.** Hard rank and team questions with five cards, in Hindi, may run past 2 min 30 s. Time the five newcomers before freezing week 1, and drop Hard to four cards if needed.
10. **Hard-topic twins return on the same weekday,** so two weeks running share a hard day. Move the hard weekday for each new pair of weeks so it never settles into a pattern.
11. **The queue is shared** with other sessions' FLUX work on a 24 GB Mac. Painting runs only through heavyq, never beside browsers, and the fortnight's four nights can slip if another chat is queued.
12. **The same picture sits behind all 12 questions.** That keeps the cost down, but the decision screens can feel static. The cards carry the change, and the wide stage can move its `focus` crop by question.

---

## 14. What needs the owner's yes (in plain words, with a game example)

1. **Not every question hides a pair.** In each daily, two of the four questions hide a woman and a man with the same numbers. The other two have two women or two men tied, or one clear best with a remark. Example: "Who takes the cash drawer?" puts Saroj and Meena level on the numbers. (This changes rule 13 for the dailies.)
2. **The six lane neighbours ask in every week's look.** Manoj asks every Tuesday, painted in Lugdi's pulp look one week and Station's poster look the next. (This changes your 23 Oct "one world each" for these six only.)
3. **Launch week opens twins and closes none,** so the first Sunday has no side-by-side.
4. **The launch fortnight uses the four kinds the app already has** (pick one, spend checks, rank, team). The rule-first, choose-words and quick-sort screens come later, one a week (O11 Q8 A said all six in launch week).
5. **The daily result shows the outcome, days played and the streak.** Any count of how the player treated a finished twin waits for words you and the research line approve, because "matching pairs" is a banned research phrase on screen (rule 64).
