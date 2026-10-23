---
type: reference
title: Equal Lens Daily, consolidated design rules
description: One deduplicated, conflict-free rule set for Equal Lens Daily, merged from the six foundation digests, the Stage 1 critique, the personas, the journeys' owner questions, PRODUCT.md and the owner's decisions of 21 and 22 Oct 2026 (O1 to O17), for the coordinator to paste into DESIGN.md.
plane_issues: [https://app.plane.so/the-equal-lens/browse/EVAL-14/, https://app.plane.so/the-equal-lens/browse/EVAL-18/]
---

# Equal Lens Daily: consolidated design rules

## How to read this

- Every rule has an id and its sources in brackets.
- **Precedence:** the owner's decisions of 21 and 22 Oct 2026 (O1 to O17), then the critique's resolutions, then section 2.0 of the usability digest, then the digests.
- **FLAG** marks a rule where none of those settled a conflict or gap, so the stricter rule was taken. The coordinator should confirm each FLAG with the owner.
- **HOUSE** marks a figure we chose; no source gives it.
- Every rule must work for all six personas at once (O1). No rule here is tuned to one persona.

**Source key.**
- Digest ids as written in the digests: DG (daily-game patterns), HIG (Apple HIG), M3 (Material 3), PH (perception and heuristics), UXW (UX writing), UA (usability and accessibility). UA-2.0a.n is point n of the step model, UA-2.0b the shared numbers, UA-2.0c the settled conflicts.
- CR-MFn and CR-SFn: the critique's must-fix and should-fix items.
- PROD: PRODUCT.md. PS1 to PS9: personas, "What all personas share". JR: journeys (designed cases, moments M1 to M5, screens list). OQ-n: the journeys' owner questions.
- **Owner decisions, 21 Oct 2026:**
  - O1: every rule works for all six personas at once; no persona leads.
  - O2: yellow means only the player's pick and the button that confirms it; every card starts on plain paper; all cards look the same before a choice. Settles OQ-7.
  - O3: every choice shows 3 to 5 people; a twin pair is hidden among them; team days pick from at most 5. Settles OQ-8.
  - O4: a one-pick step is pick, then confirm ("Send Kamla"); nothing moves on by itself. Settles OQ-9.
  - O5: the lean is a number on every day's result; never its direction, never on a share card or the board, never with he or she, never tilted. Settles OQ-1.
  - O6: The Equal Lens is a small credit only.
  - O7: Lugdi (pulp covers) and Station (railway boards) alternate weekly; Hind is the reading face.
  - O8: one question of at most 10 words; at most 15 words on a puzzle screen and 20 elsewhere, excluding names, numbers and character quotes.
  - O9: no timers; no shaming.
  - O10 (sound, answered on the sound page):
    - sound is on by default and switches off in the "?" sheet;
    - two sets, one per world;
    - the result sound is the same every time;
    - Sunday's look-again is silent but for sheets;
    - the milestone stamp gets one soft note;
    - no horn in the loop;
    - music fades out when nobody taps;
    - no line under the switches.
    This departs from DG-26's sound-off default.
  - O11 (the feature set's and the screen map's questions, answered 21 Oct 2026):
    - Q1 B: a small server from day one for the Board and friends, with the notice before anything is sent. The guessing puzzle waits until a week of real players gives a true figure.
    - Q2 B: a day ends at 4 am India time, for everyone.
    - Q3, login: an email login with a 6-digit code sent by email, and no password. It is offered on the first result ("Save your days with your email"). It is needed to join the Board and to get days back on a new phone. This reverses F-14's "no email, no account".
    - First visit: one birth-date screen, then today's puzzle at once, then the email offer on the result.
    - Q4: everyone who joins appears on Everyone, with no hide switch. A friend shows on your list only once they have added you back.
    - Q5: three boards, Today, This week and All time.
    - Q6: a date of birth is asked before the first puzzle. Anyone under 18 is told in how many days they can play, and plays nothing until then. This reverses F-14's "no screen before the cover".
    - Q7 B: one national help line in "?" on dowry, custody and safety days only, checked against the official source before launch.
    - Q8 A: all six kinds of puzzle in launch week, then one new kind a week.
    - Q9 B: four weeks of puzzles ready before launch, then always four weeks ahead.
    - Q10: players can play any past puzzle they have not played. This reverses F-49a's "past days never open".
    - Q11 B and C: each past week's number on the Week tab opens its note, and a "Your notes" list holds them all.
    - Q12 A: a month is the calendar month.
    - Q13 B: the under-18 wait screen offers "Wrong date?" once.
    - Q14, "sign out": a player who saved their days with an email can sign out in Privacy. That clears only this phone and keeps the saved days. Signing in on a new phone also signs the old phone out.
  - O12 (the starter profile and difficulty, 21 Oct 2026):
    - **The starter.** An optional 20-minute starter builds a player's first reading, so they need not wait a month. It is in V1 as the way people start, has 5 chapters of 4 minutes, and each chapter has its own visual world.
    - **Starter rules.** It is never on the boards, and a player may retake it once a month if they want.
    - **Results.** The results explain how the reading was made, how to spot it in real decisions and how to unlearn it, with more pictures. They DO show which way the player leans, privately, on this one screen: an exception to O5, which still holds for the daily result, share cards and boards. "We want to help people grow."
    - **New decision types.** The starter brings new kinds of decision, not only more of them.
    - **Visual worlds.** Three more worlds join Lugdi and Station, built on the same principles, so the dailies can use them too. The library of worlds grows over time.
    - **Difficulty.** Three dailies a day (Easy, Medium, Hard), each with its own Today board, on top of a calendar that gets harder for everyone. Every daily must work for a player who already knows how the reading is made.
    - **Solve.** The owner wants to bring MIT Solve a working app with active users; not planned in detail yet.
    - **Worlds.** The three new worlds are Jadugar (the travelling magic show), Cricket (the stadium scoreboard) and Doordarshan Sunday (the family TV; it needs its own in-game name, without the broadcaster's name or logo).
    - **Rotation.** The dailies rotate through all five worlds, one a week, so each world comes back every five weeks. This replaces O7's two-world alternation.
    - **The family TV world's name.** It is called **Rukavat (रुकावट)**, after its big moment, the "sorry for the interruption" card. "Doordarshan Sunday" was only a working name, and "Ravivaar" clashed with the Sunday screen.
    - **New kinds of puzzle.** Each new kind (Believe, the batting order, Split) first appears in its home world, then may appear in any world.
    - **The name (O13, 21 Oct 2026).**
      - The game is called **Retake** (रीटेक) everywhere a player sees a name: the home-screen icon, link previews, share cards and the store listing. In the stores it needs a fuller title, such as "Retake: a daily fairness puzzle", because several photo apps are already called Retake, and a trademark check comes before launch.
      - "Equal Lens Daily" and the home-screen name "Lens Daily" go. The Equal Lens stays a small credit (O6).
      - The 20-minute starter is the **First take**, and each monthly redo is the **Next take**. These replace "Quick start", "Take the 20-minute start" and "Get your reading now".
    - **Boards by level.** This week and All time are kept separately for each level. With Today, that makes three boards for each of Easy, Medium and Hard. This replaces D13's "count every level together".
  - O14 (the premium study, 22 Oct 2026). The owner's words: "I like the metal treatment of the premium look and less borders... glass is not doing a lot".
    - **Every world gains a metal finish** true to its objects. Lugdi gets a foil-stamped title, a brass issue badge, and paper stock with a laminate highlight. Station gets glossy enamel in a polished steel hairline rim, and split-flaps of brushed aluminium. One light source, high on the left, lights every screen.
    - **Fewer and finer borders.** Heavy ink frames become hairlines tinted from their surface, and most double rules go. Each world keeps only the one rule its identity needs.
    - **No glass.** The tab bar, the round buttons, the switches and the "?" sheet stay solid. The study's glass is dropped.
    - **Kept with the metal, unless the owner says otherwise:** the study's extra breathing space and its soft, light shadows (about 6 to 14 percent) under physical objects. This relaxes the Printed Not Lit Rule for objects. Overlays keep their lift.
    - **Applies to all five worlds.** The study's files are design-system/explore/premium-lugdi.css and premium-station.css.
  - O15 (22 Oct 2026): every world has its own story. Station gets its own railway puzzle instead of Lugdi's truck drivers: its own people and lines, cover line and Board names. So do Jadugar, Cricket and Rukavat. Lugdi keeps the ghat road. All of it is drafted for the owner's review.
  - O16 (the First take review, 22 Oct 2026). The owner answered the eleven questions in [first-take.md](../content/first-take.md) (1 to 7) and [world-voices.md](../content/world-voices.md) (8 to 11). The new cast and each chapter's hard topic are planned in [cast.md](../content/cast.md).
    - **1, Believe cards keep their numbers.** Each teller has two (years on stage, shows missed), so the two who tell the same story also match on every number. The drawn Believe card, which shows none, gains them (R-CARD-4). Changes F-215.
    - **2, ten new portraits.** One new woman and one new man in each of the five worlds, each only in their own world. The eight stay in every world. With the ten, no two people are tied twice in the First take's 40 decisions. People from the communities the new names come from read them before anything is painted (F-40); until a portrait is painted, the card shows the silhouette (R-CARD-5). Changes F-43 and F-207.
    - **3, a hard topic in every chapter.** The owner's words: "Add hard topics in every chapter... these are adults." Each First take chapter swaps one twin for a hard topic: a harassment complaint at the shed (Station), a car that followed a truck down the ghat at night (Lugdi), a harassment report backstage (Jadugar), a police complaint of violence at home (Cricket), and who the children live with after a separation (Rukavat). This also answers first-take.md's custody question: custody comes into Rukavat. The care rules do not move: the art shows the situation, never the harm (F-41, R-COPY-26, R-A11Y-22). Changes F-41; F-47 and SC-40 (the help line in "?" on every chapter, not only Lugdi's); F-202, SC-91 and FL-23 (every chapter's title card names its setting before Start, as a hard day's cover does, R-COVER-6). Still for the owner, in cast.md: dowry as a second hard twin for Rukavat (suggested: keep it for a Next take), and keeping hard twins off result card 2 (suggested).
    - **4, the exact lines.** The owner asked to see every speaker's exact lines before saying yes to them, so no speaker line is settled yet. The next draft of first-take.md writes every decision's lines in English and Hindi on cast.md's pairs, and they go to the owner word for word. Loaded words stay only in a named speaker's mouth (R-QUOTE-1).
    - **5, a mixed Sunday cricket side works.** Cricket's chapter keeps women and men in one side. Nothing changes.
    - **6, fewer side words on the results.** "Towards the men" (or "the women") on result card 1 and "Your choices, not who you are" on card 5: cut them if we can. The side stays in card 1's picture (the taller stack under the woman's or the man's figure) and in the words a screen reader says. The change card's "towards the men" is the same words, so it follows. Whether the cut holds is for the five-player read (R-COPY-23) to show. The side is still said only on this private screen (O12). Changes F-203.
    - **7, how a Next take could wait.** The owner asked how a wait could happen. Sets change on the 1st of each month, but a Next take falls due 30 days after the last reading. Only a reading finished on the 1st of a 31-day month falls due inside that same month: finished on 1 March, due on 31 March, while March's set, already played, is still the newest; the next set comes on 1 April, one day later. The drafted rule stands as a default to confirm (first-take.md, "The Next take: a fresh set each month", point 5): the offer waits for the next set and shows its date, never a countdown (O9). SC-94 and F-204 still say "due 30 days after"; they take the rule up once the owner confirms it.
    - **8, road names: yes.** A road name shows as typed, in English letters, on the English and the Hindi screens alike, as Lugdi's do. Each also has a Devanagari spelling, for a player who types in Devanagari. Like a brand name, a road name is an exception to R-COPY-24's Devanagari-only Hindi screens. Changes F-80, which said each viewer sees their own script.
    - **9, Rukavat's film title.** "Ghat Ki Raat" echoes Lugdi's ghat. The owner asked for new titles to be ideated and brought as options, from the family's own story as world-voices.md suggests. Nothing changes until the owner picks one: the cover and DESIGN.md keep "Ghat Ki Raat" until then.
    - **10, Station's two old-road words.** The words step's luggage tag says Anita "drives the night bus", and the result ticket says "Driver Raju". Both change to railway words. The owner's words: "think more Indian", so the new words are the ones an Indian railway really uses, drafted for the owner's review. They live in design-system/library.py.
    - **11, the loaded word pairs are fine.** Stubborn and firm, moody and intense, bossy and assertive, nervous and careful stay. In the five-player read (R-COPY-23), Hindi-first players check that each pair sounds, in Hindi too, like a word said of a woman and not of a man; a pair that does not is redrafted.
  - O17 (the rewritten First take, second round, 22 Oct 2026). The owner answered the four questions left open in [first-take.md](../content/first-take.md), and the line review: the four lines marked Change were "too complicated in the way they are written", so they were rewritten in two short sentences each; the other 74 lines are kept.
    - **1, bullying at the station.** Station 2 and 6 keep "bullying" (बदसलूकी), which means the same for a woman and a man, rather than "harassment".
    - **2, the cup match: more people.** Not either offered option. The owner wants more portraits made and more people in the story, so Cricket 7 gets a fresh pair of matching age.
    - **3, more people where pairs run short (option c).** More people go into the worlds that fall short, so a new face is in the matching two no more often than the eight, and a month can follow a month without the same two tied again in a world.
    - **4, dowry now.** Rukavat takes dowry as a second hard twin now, in place of whose name goes on the form (Rukavat 4 and 8).
    - **5, Rukavat's film title.** "Dadi Ki Kursi" (दादी की कुर्सी) or "Patang Aur Antenna" (पतंग और एंटीना); the coordinator set Dadi Ki Kursi, if it fits the title card at 360 px, with Patang Aur Antenna as the fallback. It replaces "Ghat Ki Raat".
    - **6, when the Next take opens: rule B.** On the 1st of the month after the last reading, and never sooner than 28 days on (finish 1 March, opens 1 April; finish 15 March, opens 12 April). It always uses the next month's set, so it never waits for one. This replaces the screen map's "due 30 days after".
    - **7, the research: move on.** The research line stops revising its candidate list and goes to the next step, checking the ideas against published studies, carrying the last review's three open problems as known gaps.

---

## 1. Numbers

All sizes are CSS px at a 100% root, authored in rem.

| Id | Item | Binding value | Sources |
|---|---|---|---|
| R-NUM-1 | Touch target | At least 48 x 48 including padding. Options, chips, person cards, seats and slots are at least 48 tall as drawn. Only icon controls (back, "?", "+", the language chip, a sheet handle) may draw smaller inside a 48 target. **FLAG:** PH-19 over M3-22's 32 px chip | UA-2.0b, UA-6, M3-22, HIG-8, DG-48, PH-19, CR-MF8 |
| R-NUM-2 | Gap between targets | At least 8; at least 12 when both neighbours have a visible edge. Opposite actions (Cut, Keep) sit side by side at least 12 apart, never as stacked thin bars | UA-2.0b, UA-6, M3-23, HIG-9, DG-48, PH-20 |
| R-NUM-3 | Clear zone round the main button | Nothing else tappable within 16. Destructive actions at least 48 away. At least 16 above the tab bar where it shows | UA-7, PH-21 |
| R-NUM-4 | Main button, size and position | 56 tall; full width less the 16 gutters; bottom edge 16 to 24 above the bottom safe-area inset. One position on every screen, every day, both worlds. Never scrolls away, at 200% text included | UA-2.0b, UA-7, DG-48, HIG-1, HIG-7, PH-4, PH-19, CR-MF8 |
| R-NUM-5 | Layout width | 16 side gutters; one column at phone width; in landscape the same column, centred | M3-17, UA-19, UXW-42 |
| R-NUM-6 | Spacing scale | 2, 4, 8, 12, 16, 24, 32, 48 only. Padding and gaps sit on the parent; no negative margins | M3-16 |
| R-NUM-7 | Grouping | Space inside a group is at most half the space between groups (8 inside, 16 to 24 between). A label sits nearer its own value than anything else | PH-6, M3-18 |
| R-NUM-8 | Type floor, Latin | 14 for any live text: kickers, tags, stat labels, notices and table heads included. Lettering drawn into art is art | UA-2.0b, UA-13, M3-8, HIG-20, CR-MF8 |
| R-NUM-9 | Type floor, Devanagari | 14, and never smaller than the English equivalent. All Devanagari reading text is in Hind | UA-14, UXW-39, O7 |
| R-NUM-10 | Body, numbers, question | Body 16. Numbers players compare at least 20 (set at 24). Question at least 20, set at 24. **FLAG:** UA-2.0b gives 20 as the floor; M3-5's 24 is taken | UA-2.0b, UA-13, M3-5, M3-7, HIG-20 |
| R-NUM-11 | Display face | Titles only. Latin at least 28, Devanagari at least 32 | UA-2.0b, UA-15, HIG-22, M3-12 |
| R-NUM-12 | Line heights | Unitless, never px. Latin: display at least 1.1, body 1.5. Devanagari: display at least 1.3; Hind that can wrap at least 1.6; single-line Hind at least 1.4. Where M3's medium-script value is higher, use it | UA-14, UA-15, M3-9, M3-10 |
| R-NUM-13 | Type scale steps | 14, 16, 24, 36, 45 (0.875, 1, 1.5, 2.25, 2.8125 rem). No two styles on a screen less than one step apart | M3-P3, M3-5, M3-6, UA-16 |
| R-NUM-14 | Text styles | At most 6 in the product and 4 on any screen (table below). Hind at 2 weights only, 500 and 700 | UA-2.0b, HIG-20, M3-5, PH-2, UA-41 |
| R-NUM-15 | Hierarchy | The question is at least 1.2 times any status line and at least as heavy. At most 2 big elements per screen (display type, or taller than 120; art excepted) | HIG-21, PH-2, PH-3 |
| R-NUM-16 | Text contrast | Under 24 (under 18.66 bold): 4.5:1. At 24 or more (18.66 bold): 3:1. Text on plates, tickets, sheets, cards and buttons: 7:1 (HOUSE; **FLAG:** cards and buttons counted as plates). Measured on rendered pixels, not token pairs | UA-1, HIG-26, M3-14, CR-MF1 |
| R-NUM-17 | Non-text contrast | 3:1 for control edges, slot edges, state marks, the selected fill against the ground, and grouped controls against the ground. Dashed and dotted strokes aim for 4.5:1 (HOUSE) | UA-3, M3-14, M3-P10 |
| R-NUM-18 | Text over a painting | The darkest and lightest 5% of pixels under each line still pass R-NUM-16 | UA-2, M3-36, CR-MF4 |
| R-NUM-19 | Choice counts | 3 to 5 people per choice, never 2. A twin pair sits among them. Team days pick from at most 5. Response options: 2 or 3. People sit in a grid of identical tiles above 4. At most 3 buttons in a group; never a lone chip | O3, PH-24, M3-33, M3-34 |
| R-NUM-20 | Word budgets | Question at most 10 words; puzzle screen at most 15; any other screen or sheet view at most 20. Not counted: character and road names, numbers, lines spoken by a named character. Count the rendered screen at 390 in the shown language, everything it scrolls to before the next tap, tab labels included | O8, UXW-1, UXW-2, HIG-45, PH-25, DG-6 |
| R-NUM-21 | Smaller word caps | **At most 4:** not-ready label, refusal reason, toast, meta line. **Buttons:** 1 to 3 words plus one name. **At most 6:** empty-state status, forgiven-day line, a hint if one is ever allowed. **At most 8:** a rule explained once, each "?" picture step, a reminder (**FLAG:** HIG-51's 8 over DG-39's 10). **At most 10:** result line. **At most 12:** cover line, error, any sentence. **Whole day:** at most 100 (HOUSE). **Characters:** chip labels at most 20, alt text at most 125 | UXW-2 to UXW-6, UXW-10, UXW-27, UXW-28, UXW-41, UA-2.0a, DG-10, DG-17, DG-22, DG-28, DG-39, DG-52, HIG-51, M3-25, M3-P30 |
| R-NUM-22 | Text growth | Every label fits one line at 360 in both languages. Layouts hold 1.5 times the English length for lines, and 2 times for labels under 10 characters | UXW-13, UXW-39, M3-44 |
| R-NUM-23 | Test sizes | 360 x 640 and 390 x 844, each at 100% and 200% text. Reflow at 320 wide with no sideways scroll | UA-2.0b, UA-18, CR-MF8 |
| R-NUM-24 | 200% text | At Android's largest font and Chrome zoom 200%, nothing clips or overlaps and side-by-side items stack. A step may then scroll, with the main button pinned and reachable. Every no-scroll rule carries this exception | UA-16, HIG-24, M3-21, M3-44, CR-MF9 |
| R-NUM-25 | Text spacing | Forcing line height 1.5, paragraph space 2, letter spacing 0.12 and word spacing 0.16 loses nothing. Nothing that holds text has a fixed height | UA-17, UA-P11 |
| R-NUM-26 | Fit | At 100% text every puzzle step, cover and result fits both test sizes without scrolling; split a step that will not fit. The Board scrolls at most once. No Sunday screen scrolls more than once. Empty space below the last element is at most 20% of the screen (HOUSE) | UA-8, HIG-2, HIG-5, M3-21, DG-50, PH-4 |
| R-NUM-27 | Reach zone | Top third: what is read (object, question). Middle and lower part: the choices. Bottom band: the main button. Top bar: only back, "?", the language chip and the streak count | PH-21, DG-17, DG-49, UA-7 |
| R-NUM-28 | Response and motion | Press feedback within 100 ms. A move's visible result within 300 ms. State changes 150 to 250 ms. Any movement after a tap ends within 400 ms. Anything over 1 s shows progress | UA-2.0b, PH-29, HIG-33, M3-31, DG-12 |
| R-NUM-29 | Longer moments | Result reveal at most 1.2 s; ghost demonstration at most 1.5 s; milestone at most 2 s (all HOUSE, all skipped by a tap, each with a still version). Next-target pulse at most 3 cycles (HOUSE). Nothing flashes more than 3 times a second | UA-2.0b, UA-22, UA-45, DG-8, DG-26 |
| R-NUM-30 | Toast | Its words also show in place. Stays at least 4 s, then goes on the next tap or at 10 s. One at a time; announced politely | UA-2.0b, M3-38, DG-12, DG-52, CR-MF2 |
| R-NUM-31 | Undo | Visible at least 5 s (HOUSE) | UA-2.0c, UA-12, HIG-19, UXW-29, DG-34 |
| R-NUM-32 | Weight and speed | First load at most 600 KB, fonts and the day's painting included (HOUSE). Painting at most 60 KB, portrait at most 25 KB, WebP drawn at 2x for 390 (HOUSE). At most 2 font weights per script per screen. Today's puzzle tappable within 3 s on a Galaxy A24 4G-class phone at 9 Mbps down and 100 ms round trip. Reopen to the same step in under 2 s (HOUSE) | UA-39, UA-41, UA-42, UA-34 |
| R-NUM-33 | Surfaces | 3 heights: ground, plate, overlay over a 32% scrim. At most 2 container levels. At most 3 corner radii per world, from 0, 4, 8, 12, 16, 20, 28, 32, 48 and full. At most 5 tappable looks per world: main button, person card, chip, slot, secondary | M3-29, M3-30, PH-7, PH-9 |
| R-NUM-34 | Sameness checks (HOUSE) | Across all days and both worlds, the question's baseline and the main button's box match within 4. An 8 px blur shows one dominant region, with the main button next | PH-33, PH-1 |
| R-NUM-35 | Streak and calendar | One forgiven day per ISO week. Streak in 2 places. 7 marks for the week, 28 for the month. Milestones on days 3, 7, 14, 30, 50, 100 and 365 (3, 14 and 50 HOUSE) | DG-26, DG-27, DG-29, DG-42, UA-2.0c |
| R-NUM-36 | Reminders | At most 1 a day. First offered on the day-2 result; offered again no sooner than 7 days later, and at most twice in all (HOUSE). At least 10 wordings per world, none repeated within 14 days (HOUSE) | DG-36, DG-38, DG-39 |
| R-NUM-37 | Session | First move within 2 taps of a link. Median day 5 to 7 min (in tests, first-timers within 7, returners within 5). Result read in under 10 s. At most 3 new things on a mechanic's first day; at most 1 new mechanic a week | DG-1, HIG-37, DG-20, UA-37, DG-9 |
| R-NUM-38 | Testing | 5 players per language group on a real Android phone under about ₹15,000, plus one 2 GB phone. 1 or 2 sessions each with a TalkBack user, a colour-blind player and a large-text player | UA-43, UA-44, UA-39 |

**R-NUM-14 table: the six text styles.**

| Style | Face and weight | Size | Line height, Latin | Line height, Devanagari | Used for |
|---|---|---|---|---|---|
| Display | the world's display face (Sarpanch, the owner's earlier choice, HIG-H13), one weight | one step per world: 36 or 45 | 1.15 | 1.3 | cover title, Station board name |
| Score | Hind 700, tabular figures | 36 | 1.2 | 1.4 | the one headline number on a result or Sunday |
| Headline | Hind 700, tabular for numbers | 24 | 1.33 | 1.6 | the question; numbers players compare (stats, consistency, practice, lean, board band) |
| Title | Hind 700 | 16 | 1.5 | 1.7 | names, button and chip labels, road names, toasts, the result line |
| Body | Hind 500 | 16 | 1.5 | 1.7 | quotes, voice lines, facts, cover line, sheet text |
| Label | Hind 500 | 14 | 1.43 | 1.65 | kicker, stat key, units, tab labels, credit |

**Styles per screen (at most 4).** The mapping is derived so that R-NUM-10, R-NUM-14 and UA-13 can hold at once.
- Cover: Display, Body, Title, Label.
- Puzzle step: Headline, Title, Body, Label. There is no display text on a puzzle step; the object carries the day (**FLAG**).
- Result: Score, Headline, Title, Label. Any lettering on the finished object is part of its picture (**FLAG**).
- Board and sheets: at most Headline, Title, Body and Label.

---

## 2. The step model

This applies to every puzzle step and every mechanic. It is UA-2.0a, with OQ-9 settled by O4.

**R-STEP-1. Arrive.**
- The question is the screen's heading, and focus lands on it.
- Every option sits at rest on plain paper. All cards are identical.
- Nothing is pre-selected, highlighted or recommended. People appear in a shuffled order for each player.
- The main button sits in its place, not ready (R-STEP-6).
- [O2, UA-5, UA-23, PH-24, DG-14]

**R-STEP-2. Pick.**
- The player taps the thing itself: a person, chip, slot, word or ticket.
- The selected state shows within 100 ms: yellow fill, a tick and a heavier frame, spoken as "chosen".
- Tapping the item again unpicks it. Tapping another item changes the pick.
- Nothing moves on by itself.
- [UA-2.0a.1, UA-5, HIG-10, HIG-11, M3-28, PH-12, O2, O4]

**R-STEP-3. Two-tap moves** (a person, then a job; a word, then a blank).
- The first tap arms the item: it lifts and gains its tick.
- The valid targets gain a solid ring, never yellow.
- A tap on a target places the item. Tapping the armed item again cancels it.
- TalkBack hears, for example, "Meena picked, choose a job".
- [UA-10, PH-11]

**R-STEP-4. Refused move.**
- The row shakes once (a static mark under reduced motion).
- A reason of at most 4 words sits beside it until the next tap and is announced politely.
- Constraints do the teaching: a full team refuses a seventh pick, and tapping a filled blank empties it.
- [UA-2.0a.6, DG-12, PH-18]

**R-STEP-5. Ready.**
- Once the step can be committed, the main button turns live (yellow).
- Its label names the consequence, for example "Send Kamla", "Lock rule" or "Punch 2 tickets".
- Every pick stays changeable until the commit.
- [UA-2.0a.2, UA-11, UXW-10, O2, O4]

**R-STEP-6. Not ready.**
- The main button keeps its place, shape and size, with a muted neutral fill. It is never yellow (**FLAG**), never dashed, never hidden and never more than one on screen.
- Its label names what is missing in at most 4 words ("Pick 2 more", "Pick a rule", "Fill 3 jobs") and meets R-NUM-16.
- It stays focusable (`aria-disabled`). A tap on it pulses the empty place once (a static ring under reduced motion), and TalkBack reads the label.
- A two-stage mechanic shows only the current stage's button.
- [UA-2.0a.3, UA-29, HIG-17, M3-27, PH-13, DG-7, UXW-12, CR-MF7]

**R-STEP-7. Confirm.**
- One tap on the live main button commits the step and brings the next step or the result in the same tap.
- There is never a separate "Next", and the same answer is never asked for twice.
- The commit is the only point of no return. It gives one short vibration, if vibration is on.
- [UA-2.0a.2, DG-13, DG-16, PH-31, HIG-35]

**R-STEP-8. One pick.** A step with one pick works the same way: pick, then confirm. A name tap never answers on its own. [O4, OQ-9]

**R-STEP-9. Back.**
- The back control at the top left (48 target) returns to the previous step, showing its answers. From the first step it returns to the cover with progress kept, and the cover then reads Continue.
- The phone's own back does the same (derived from UA-11).
- A revisited committed step is read-only: picks keep their chosen look plus a lock mark. The bottom slot holds one secondary-style button that returns to the current step (**FLAG:** no source sets this state).
- [UA-2.0a.5, UA-11, HIG-13, PH-31, DG-18]

**R-STEP-10. Exit and resume.**
- Leaving at any point loses nothing: back, an app switch, a call, a refresh or a discarded tab.
- Save on every change, and again when the page is hidden.
- Reopening lands on the same step with every pick showing (R-NUM-32).
- A day begun before the day's end finishes as that day.
- There are no timers anywhere, no pop-up alerts during play, and no confirm on leaving, because nothing is lost.
- [UA-34, UA-36, HIG-36, HIG-H35, O9]

**R-STEP-11. Teaching.**
- There are no instruction sentences and, in the first build, no hint text.
- The first target pulses at most 3 times, then stays still (a static ring under reduced motion). From a mechanic's second appearance there is no pulse (**FLAG:** HIG-38 limits it to the first meeting; UA-2.0a is silent).
- On a mechanic's first day, one ghost demonstration plays on the real board (R-NUM-29). A tap skips it; under reduced motion it is a still drawing, shown once.
- A hint of at most 6 words beside the first target is allowed only if the five-player test fails, and only on the first meeting.
- How to play sits behind "?" and opens only when tapped.
- [UA-2.0a.4, DG-7, DG-8, DG-10, HIG-38, PH-25, UXW-3]

**R-STEP-12. Status inside the object.**
- Counts and progress are marks in the object: punch holes, empty seats, the height of the stack.
- Never "2/6", "Line 1 of 8", "Part 1 of 2" or a progress bar.
- TalkBack hears each change as words, as a polite status message.
- [UA-2.0c, UA-35, DG-11, HIG-32, PH-30]

**R-STEP-13. Staged decisions.**
- One question per screen state.
- A mechanic with two decisions stages them on the same object: the second appears after the first is committed.
- Everything needed to decide stays in view: the locked rule as a stamp beside the people, the records on the cards, an earlier day's line for a prediction.
- [PH-23, PH-28, UXW-2]

**R-STEP-14. States to draw.**
- Every mechanic's states are drawn: arrive, picking, armed, refused, ready, committing, revisited.
- Each is drawn in both worlds, at both test sizes, at 200% text and under reduced motion, before it is built.
- [HIG-15, M3-25, UA-44]

---

## 3. Component rules

States named here are drawn for every component in both worlds (R-STEP-14, R-VIS-21).

### Person card
**States:** rest, pressed, selected, armed, focus, refused, revisited.

- **R-CARD-1.** The whole card is the control, with no buttons inside it and no second row of name buttons. [M3-35, HIG-10, PH-12, DG-13]
- **R-CARD-2.** Before a choice, every card in a set is identical on plain paper: size, tone, layout and portrait size. Nothing marks a twin. [O2, O3, M3-19, DG-14, UA-5]
- **R-CARD-3.** Selected adds yellow, a tick and a heavier frame, at 3:1 against the ground. Yellow against paper is about 1.4:1, so the tick and the frame carry the state. Unchosen cards stay exactly as they were, also after the commit (**FLAG:** UA-5 and DG-14 over PH-14's dimming after the commit). [UA-3, UA-4, UA-5, M3-28, PH-5]
- **R-CARD-4.** Contents: a portrait, the name (Title style), stats (R-STAT) and, where the mechanic needs one, a quote (R-QUOTE). [UA-24, HIG-52]
- **R-CARD-5.** Everyone has a portrait. A missing one is a silhouette in the week's style, never a letter tile. "Neither" or "nobody" is an option chip under the cards, never person-shaped. [HIG-52, DG-15, PH-8, UXW-43]
- **R-CARD-6.** TalkBack reaches the card in one stop: the name, each number with its label, the quote, then the state ("not chosen"). The portrait is hidden, because the name shows. [UA-24, UA-27, M3-46]
- **R-CARD-7.** Gender appears only where the puzzle needs it. Across a fortnight the cast varies in age, region, religion, caste and job, and goes against type at least as often as with it. [HIG-53, HIG-H44]

### Stat
**States:** information only, never tappable.

- **R-STAT-1.** A numeral in the Headline style (24, tabular), with a one-word unit or label in the Label style. [UA-13, UXW-43, M3-11]
- **R-STAT-2.** Stats sit on paper or the ground, never on an option or commit plate. They are never yellow. [PH-8, HIG-25, O2]
- **R-STAT-3.** Every card in a set has the same stats, in the same order and place. [M3-19, PH-17]
- **R-STAT-4.** The labels appear once for the set, as a shared key next to the values, not repeated on every card. With 3 labels on 5 cards, repeating them would spend the whole 15-word budget (**FLAG**, derived from R-NUM-20). TalkBack still hears each number with its label (R-CARD-6). [UXW-1, UA-24]
- **R-STAT-5.** No telegraphic shorthand ("2-year gap, family") and no codes. [UXW-21]

### Slot
**States:** empty, target-lit, filled, pressed, focus, refused, revisited.

- **R-SLOT-1.** A dashed outline means only "empty, put something here". No other component is ever dashed. [UA-32, PH-10, DG-7, M3-15, HIG-18]
- **R-SLOT-2.** A filled slot shows what was placed (the portrait or the word) in the selected look, not a text label repeated at both ends. [PH-11]
- **R-SLOT-3.** Tapping a filled slot empties it, which is free until the commit. A full row refuses another item (R-STEP-4). [PH-18, DG-16]
- **R-SLOT-4.** Seat and job labels belong to positions, in order (CNF before RAC before WL; top means first). Codes are decoration only. [PH-17, UXW-21]
- **R-SLOT-5.** A slot grows with its text and never has a fixed height. It reads as "Job 1, empty" or "Job 1, Meena". [UA-17, UA-28]

### Chip or token
**Chip states:** rest, pressed, selected, focus.

- **R-CHIP-1.** Chips are the options for the current step (rules, words, responses, crowd bands). A chip never commits a step. There is never a lone chip. [M3-34, M3-P25]
- **R-CHIP-2.** Selected adds yellow and a leading tick. [M3-P25, O2]
- **R-CHIP-3.** Three or fewer short options sit in a row or grid, never in a stack of full-width bars. [PH-20, M3-34]
- **R-CHIP-4.** Options in a set are written alike (R-COPY-20). A chip label is one line of at most 20 characters, in Title style. [UXW-34, M3-25]
- **R-CHIP-5.** A reusable word chip never looks spent. [PH-14]

**Token states:** unspent, spent.

- **R-TOKEN-1.** A shared budget shows once, as its own number of marks. Each spend moves one mark onto the person it was spent on (a punch on their ticket). [PH-17, HIG-32]
- **R-TOKEN-2.** Spent has its own shape cue, such as a hole or a punch. It is never dashed, never faded and never colour alone. [UA-32, UA-4]

### Quote
**States:** information only.

- **R-QUOTE-1.** Loaded words appear only as a line a named character says. The line shows its speaker's name and portrait, on the card or once for the set when one speaker describes everyone. The app's own voice never carries loaded words. [UXW-33, UXW-22]
- **R-QUOTE-2.** Body style, in quote marks. A quote longer than 2 lines sits on paper with dark ink. [PH-35]
- **R-QUOTE-3.** Quotes are outside the word budget, but hard-day lines never describe violence in detail. [O8, UXW-32, UA-46]

### Character voice
**States:** information only, never tappable.

- **R-VOICE-1.** A named character speaks to the player (for example, the protective voice on a team day) as its own element: portrait, name, line. It is never drawn as an option or a button. [PH-8, UXW-33]
- **R-VOICE-2.** It opens the second stage of a staged decision. The question and 2 or 3 options written alike follow it. [PH-23, UXW-34]
- **R-VOICE-3.** Its line is outside the word budget. TalkBack reads it as "Salim chacha says: ...". [O8, UA-28]

### Commit button (the main button)
**States:** not ready, live, pressed, focus.

- **R-COMMIT-1.** There is one main button per screen, sized and placed as in R-NUM-4. [UXW-11, HIG-14, M3-33]
- **R-COMMIT-2.** On a puzzle step, the live commit is yellow with an ink label (R-NUM-16). Its label is a verb first, 1 to 3 words plus at most one name, and names what happens. It is in Title style, Hind, one line. [O2, UXW-10, DG-51, HIG-47]
- **R-COMMIT-3.** Not ready follows R-STEP-6.
- **R-COMMIT-4.** Pressed changes the whole control (a shift, or a change at its edge) so it shows round a thumb within 100 ms. [HIG-15, HIG-H21, UA-21]
- **R-COMMIT-5.** The main button outside puzzle steps (Play, Continue, See today, Share) keeps the commit's shape, size and place, but is not yellow, because it confirms no pick (**FLAG:** a literal reading of O2; UA-30's "never changes colour" now holds among puzzle steps). [O2, UA-30]
- **R-COMMIT-6.** Answer options never share its look: they differ in at least 2 of fill, shape and size. A destructive action is never the main button. [UA-30, PH-7, HIG-H22]

### Secondary button
**States:** rest, pressed, focus.

- **R-SEC-1.** An outline or text button, never filled yellow and never with the heavy shadow. At most one visible beside the main button (tabs not counted). [HIG-14, M3-33, UXW-11]
- **R-SEC-2.** A verb-first label of 1 to 3 words, with a 48 target, kept clear of the main button (R-NUM-3). [UXW-10, UA-7]
- **R-SEC-3.** Destructive actions are text-style and set apart:
  - "Start again" is a small text action;
  - removing a friend happens at once, with Undo (R-NUM-31);
  - deleting all data asks once (R-DIALOG-1).
  [UA-12, HIG-19, UXW-29, PH-21]

### Back and exit
**States:** rest, pressed, focus.

- **R-BACK-1.** On every puzzle step, the back control sits at the top left (48 target), the same every day and in both worlds. "?" sits at the top right, in the same corner on every puzzle screen and on the cover. [UA-2.0a.5, UA-2.0c, UA-33, PH-31]
- **R-BACK-2.** There is no close control in a top corner. Back is the one way out (R-STEP-9). [UA-2.0c, CR-SF1]
- **R-BACK-3.** It has an accessible name in the current language. On hard days it leaves at any point and keeps the answers. [UA-28, UA-46]

### Title band or cover plate
**States:** Play, Continue, See today.

- **R-COVER-1.** The cover is the home and the first screen. No screen comes before it. [DG-1, DG-17, HIG-37, CR-MF5]
- **R-COVER-2.** Contents, top to bottom:
  - the top bar (streak count at the left; the language chip and "?" at the right; nothing else);
  - a kicker of at most 4 words;
  - the title in Display style;
  - one line of at most 12 words;
  - the painting, full-bleed behind everything;
  - the main button.
  [DG-17, UXW-6, PS2]
- **R-COVER-3.** Text over the painting sits on a plate or tint that passes R-NUM-18. The painting is never shrunk, never cut to a strip, and never compressed on any screen. There is no title band on puzzle steps. [M3-36, UA-2, CR-MF4, HIG-3 and HIG-6 removed]
- **R-COVER-4.** The button follows the state: Play, Continue (part-way) or See today (done). When the day is done, one static line under it gives the next puzzle time ("Next puzzle in 6 h"); it never ticks down. [DG-18, O9]
- **R-COVER-5.** No label-and-value rows (road name, practice) and no notices. The product name appears at most once. [DG-17, HIG-42, DG-5]
- **R-COVER-6.** On hard days, the cover names the setting plainly before Play. [UA-46]
- **R-COVER-7.** The ground and title appear before the art arrives. [HIG-40]

### Board, ticket and split-flap rows (world objects)
**States:** each object's spec page lists them (R-VIS-21).

- **R-OBJ-1.** An object row that is an option follows the chip and card rules. One that is information never looks tappable: no option plate and no button outline. [PH-8, M3-37]
- **R-OBJ-2.** Railway and pulp codes (RAC, CNF, WL, PNR, chart numbers) are decoration. The screen works without them, and they are never on a control. [UXW-21, M3-43]
- **R-OBJ-3.** A split-flap change obeys R-NUM-28 and R-NUM-29, and is instant under reduced motion. [UA-21, UA-45]
- **R-OBJ-4.** Ticket paper is the world's cream, never pure white. A punch is a hole, never colour alone. [HIG-28, UA-4]
- **R-OBJ-5.** A third-script line follows OQ-6. If it is kept, it is `lang`-marked and carries nothing the player needs. [UA-20, JR M5]
- **R-OBJ-6.** Rows grow with their text and use Hind line heights in Hindi. Fiction names ("PNR slip") never head a screen or a tab. [UA-14, UA-17, HIG-46, UXW-19]

### Score and lean number
**States:** settled, pending (same look).

- **R-SCORE-1.** The day's score is one large number in Score style. Consistency and practice sit under it as two figures in Headline style, with one-word captions. No "=" or "+". [DG-22, PH-6]
- **R-SCORE-2.** The same layout, labels and order every day. A pending part is never shown as zero, and there is never "No score today": every result has a reading. [UXW-17, UXW-24, DG-23, PROD]
- **R-LEAN-1.** The lean is a number on every day's result and on Sunday. It sits as a third figure beside consistency and practice, with its fixed glossary label on its 0 to 100 scale ("Lean 18 of 100", form A of OQ-1). [O5, OQ-1, UXW-26]
- **R-LEAN-2.** Never its direction, never he or she, and never tilted. No bar, no side, no left or right meaning, and no colour that hints at a side. Never on a share card or the board. Never ranked. Never in a vibration or a reminder. [O5, PH-32, HIG-30, HIG-H27, DG-24, DG-31]
- **R-LEAN-3.** The Sunday look-again pair never marks which person the player picked, because that would give away the direction for that pair (**FLAG:** OQ-1's open sub-part, read strictly). [O5, OQ-1]
- **R-SCORE-3.** Scores and the lean are not yellow. They are announced politely when they appear. [O2, UA-25]

### Streak marks
**States:** played, forgiven, missed, not yet played, today.

- **R-STREAK-1.** The streak shows in exactly 2 places: a small count in the cover's top bar, and this week's 7 marks on the result. Sunday's day objects show the week; they are not a third strip. The month strip (28 marks) is reached from Week. [UA-2.0c, DG-29, DG-42, PH-34]
- **R-STREAK-2.** Each state has its own shape or mark, and all marks are the same size. None is dashed, and none relies on colour alone. A forgiven day has its own shape plus a one-word label ("off"). [UA-4, DG-28, DG-30, PH-34, CR-MF2]
- **R-STREAK-3.** No zero streak and no empty strip on a first visit. The streak first appears on the first result as "Day 1". After a break the count restarts without comment, and the best streak is kept in Week. [DG-30]
- **R-STREAK-4.** The first forgiven day shows "Tuesday off. Streak kept." in place under the streak until Play is tapped, and may also show as a toast with the same words. The standing rule lives only in the "?" sheet. [DG-28, UXW-4]
- **R-STREAK-5.** TalkBack reaches the streak in one stop ("Streak 6 days. This week 6 played, 1 forgiven."). It is never yellow. [UA-26, O2]
- **R-STREAK-6.** Milestones obey R-NUM-29 and R-NUM-35, with sound off and a still stamp under reduced motion. There is never a countdown to losing the streak. [DG-26, DG-53]

### Board rows (leaderboard)
**States:** friend, you, everyone, offline.

- **R-BOARD-1.** The board is reached from the Board tab only. It opens on Friends, ranked by practice. [UA-2.0c, DG-21, DG-31, HIG-43, M3-40]
- **R-BOARD-2.** Everyone shows your band ("Top 9%"), you with 2 road names above and 2 below, and the top 3. No 10-row table and no raw-rank headline. [DG-31]
- **R-BOARD-3.** Road names only: no real name, photo, place or contact. No lean, ever. No bottom list. [DG-35, DG-31, DG-53, O5]
- **R-BOARD-4.** The "you" row is marked by a word ("You") and a heavier edge, never by yellow. [O2, UA-4]
- **R-BOARD-5.** Adding uses a "+" on the row (accessible name "Add Ghat Ka Dhuan"). Removing sits in the row menu, with Undo. No full-width Add or Remove bars. [DG-34, UXW rewrites]
- **R-BOARD-6.** Each row is one TalkBack stop. Numbers use tabular figures. Offline, the board shows when it last updated. [UA-24, M3-11, UA-40]

### Sheet
**States:** opening, open, closing.

- **R-SHEET-1.** A modal bottom sheet opens to at most half the screen at first, over a 32% scrim. It closes by a tap on the scrim, a swipe down, or a close control (48 target), and its handle has a 48 target. [M3-38, M3-P27]
- **R-SHEET-2.** It takes focus when it opens and gives focus back to the control that opened it. It obeys R-MOT-3. [M3-45, M3-31]
- **R-SHEET-3.** Every sheet view keeps to 20 words, except the itemised lines of the notice sheet. [UXW-1, UA-47]
- **R-SHEET-4.** The "?" sheet is the one settings place.
  - It opens on how to play: at most 3 picture steps, together within 20 words.
  - Below them, one tap deeper (**FLAG:** DG-10 allows 3 steps of 8 words each, which overflows 20; at most 2 disclosure levels, as in PH-32): music, sounds and vibration on or off (O10), reminders, road name, privacy (what stays on the phone, what is sent and why, one-tap delete), the "Prototype" chip that opens draft and sample notices, and the small Equal Lens credit.
  - Language is not there.
  [UA-2.0c, DG-10, DG-5, DG-40, HIG-44, HIG-55, UA-45, O6]
- **R-SHEET-5.** Other sheets:
  - road name (3 alternatives);
  - the Sunday note (saves as typed, any script, on paper);
  - add a friend (search in both scripts);
  - the notice sheet before anything leaves the phone (R-COPY-35).
  [DG-3, UA-34, UA-47, JR]

### Toast
**States:** shown, leaving.

- **R-TOAST-1.** At most 4 words, in Title style, and timed by R-NUM-30. It is never the only feedback: its words also show in place. [DG-52, UA-2.0b, M3-38, CR-MF2]
- **R-TOAST-2.** It never covers the main button or the focused item. An Undo toast carries a 48 target and stays at least 5 s. [UA-P22, R-NUM-31]
- **R-TOAST-3.** It is used only for brief confirmations: copied, forgiven day, near miss, note saved, friend added, removed with Undo. [DG-12, DG-25, M3-38]

### Language chip
**States:** current marked, pressed, focus.

- **R-LANG-1.** The switch has one home: a small chip in the cover's top bar showing both options, with the current one marked ("EN | हिं"). It is never a full-width button, and it never appears in the "?" sheet. [UA-2.0c, DG-2, UXW-11, CR-MF5]
- **R-LANG-2.** The current language is marked by shape and colour, never yellow, never by weight alone. TalkBack names each language in its own language ("English", "हिन्दी"). [PH-16, HIG-43, UA-20, O2]
- **R-LANG-3.** The language defaults from the phone (a Hindi phone gets Hindi, any other English). Switching keeps progress. A language appears only once it has passed review, with no "draft" label. [DG-2, HIG-37, UXW-38]

### Share card
**States:** card, copied fallback.

- **R-SHARE-1.** An image in the week's world style (a Lugdi mini-poster, a Station ticket), plus a text version and the link. [DG-24, JR]
- **R-SHARE-2.** It shows the puzzle number, the road name, the streak and a row of neutral marks for the steps played. It never shows the lean, the score, the people picked, the answers or the day's topic. The road name is kept from DG-24 so friends can add you; personas tension 8 lists fewer items. [DG-24, O5, PS6, UA-46]
- **R-SHARE-3.** It must be safe to land in a family group and must make sense out of context. No Equal Lens credit appears on it (**FLAG:** O6 read strictly, against the hostile screenshotter A2). [PS6, PROD, O6]
- **R-SHARE-4.** Share opens the phone's share sheet from the tap. Where that is not available, it copies: the button reads "Copied" until the next tap, plus a toast. It is never more than one tap from the result. [DG-25]

### Empty, loading, offline and error states

- **R-STATE-1. Empty.** One status line of at most 6 words and one action ("No friends yet", "Add by road name"). Never a blank area. [UXW-28, HIG-50]
- **R-STATE-2. Loading.** Text and Play come first and the painting after. The layout stays still (no content popping in). No false "nothing here" while loading, and no spinner without a time limit. [HIG-40, M3-P23, UXW-28, UA-40, JR]
- **R-STATE-3. Offline.**
  - Once opened, today's puzzle plays to the end with no network. The result shows at once and is sent later.
  - The board and friends show when they last updated.
  - A cover that has not loaded says so in one line in the chosen language, with "Try again", and says whose end the problem is on.
  - Only art, fonts and code are saved in advance (OQ-27 default).
  [UA-40, HIG-40, UA-P36, JR M3]
- **R-STATE-4. Error.** Shown next to where it happened. It says what happened and what to do in at most 12 words, keeps whatever was typed, and never blames: no "oops", "sorry", "please", "invalid" or "you forgot". "Storage full" is handled. [UXW-27, HIG-H41, JR]
- **R-STATE-5. New phone.** A quiet fresh start, with no "you lost everything". [JR M4]

### Also needed

- **R-TOP-1. Top bar.**
  - Cover: streak count at the left; the language chip and "?" at the right.
  - Puzzle step: back at the left, "?" at the right.
  - Nothing else in either.
  [DG-17, DG-49, UA-33]
- **R-TAB-1. Tab bar.**
  - Three tabs: Today, Board, Week. Each has a filled icon, a one-word label and a 48 target, in a fixed order.
  - The active tab is shown by shape and colour, never by weight alone, and never by yellow.
  - The bar is hidden during a puzzle step and never holds actions.
  [UA-31, HIG-43, M3-40, DG-21, O2]
- **R-RESULT-1. Result layout.**
  - Top to bottom: the finished object; the score and three figures (R-SCORE, R-LEAN); one line of at most 10 words; this week's marks with the count; Share as the main button; one tease of tomorrow that never names a transfer day; on the first result, the road-name line with "Change".
  - There is no Board button; the tab does that (UA-2.0c and UXW-11 over DG-22).
  - At 200% text it may scroll, with Share pinned.
  [DG-22, DG-3, DG-47, UXW-11]
- **R-SUNDAY-1. Sunday** (its shape is OQ-2).
  - On any shape: the 6 day objects with their marks, practice, the lean number, one look-again pair on paper, "Write a note" opening a sheet, and Share.
  - No breakdown rows, and no open text box on the page.
  - At most one main and one other action per screen; "Add a friend" lives on the Board tab (**FLAG:** UXW-11 over DG-41's three actions).
  - The tap answers to "What was different?" are never stored.
  [DG-41, PH-28, PH-35, UXW-11, JR]
- **R-DIALOG-1. Dialog.**
  - Only for deleting all data.
  - A specific question ("Delete all your days and notes?") with two outcome-labelled actions ("Delete all", "Keep"), the confirming one at the trailing edge.
  - Never "Are you sure?".
  [M3-39, UXW-29, HIG-19]
- **R-FIELD-1. Text field.**
  - Labelled, with a hint, and sized to the text it expects.
  - Accepts any script and saves as it is typed.
  - Notes stay folded until tapped and are never shown on Today or the result.
  [HIG-H43, UA-34, UA-38]
- **R-SWIPE-1. Quick-sort card.**
  - It shows on arrival that it can be dragged: a stacked edge, with the two outcomes labelled at its sides.
  - Cut and Keep buttons sit side by side and do the same job.
  - The height of the stack shows the lines left.
  - The column shows what was kept and cut, and can be changed, before the commit.
  [PH-15, PH-30, UA-9, HIG-12, HIG-11]
- **R-CROWD-1. Crowd guess.**
  - Tap bands of 10 points, each at least 48, with no value set on arrival (layout: OQ-10).
  - The earlier day's line is shown.
  - No slider.
  [PH-22, UA-9, PH-28]
- **R-RANK-1. Rank.**
  - One numbered column, top means first, filled from the top by tapping.
  - Tapping a placed item returns it.
  [PH-11, PH-17, UA-9]

---

## 4. Copy rules

- **R-COPY-1.** Budgets and caps as in R-NUM-20 and R-NUM-21. A script counts the rendered screen in both languages; a per-string check is not enough. [O8, UXW-1, UXW-44, PH-25]
- **R-COPY-2.** One question per screen state, of at most 10 words, phrased as the player's task. It ends with "?", or is an imperative for a pure picking step ("Pick 3 for tonight"). It is the only line that asks or instructs. The 10 words are a ceiling; the screen's total binds. [UXW-2, DG-6, PH-23]
- **R-COPY-3.** No instruction sentences in the flow. No line starts with "Tap" or "First". "Pick" is allowed only in the question and the not-ready label (UA-2.0a over PH-18's test). [UXW-3, PH-18, UA-2.0a.3]
- **R-COPY-4.** Nothing is said twice on a screen: title, blurb, label, question and counter each say something different. The brand appears once in the first run. [UXW-8, PH-26, UA-23]
- **R-COPY-5.** Front-load: the first 2 words (11 characters) carry the subject or the action. No filler openings ("Does this", "First,", "Some of"). [UXW-7]
- **R-COPY-6.** Order: the object, the question, the choices, the main button. At most one meta line of at most 4 words sits above. Nothing sits between the choices and the main button. [UXW-6, M3-20]
- **R-COPY-7.** Main-button labels follow R-COMMIT-2.
  - Banned: "OK", "Submit", "Confirm", "Next", "Done", a bare "Appoint", and "Continue" except as the cover's resume state.
  [UXW-10, DG-18, DG-51, HIG-47]
- **R-COPY-8.** "You" only. Never "my", "me" or "I" on a control, and never "we" ("Delete notes", not "Delete my notes"). [UXW-18, HIG-48, M3-42, UA-2.0c]
- **R-COPY-9.** Sentence case for all Latin text in both worlds. Lugdi capitals follow OQ-3. Hierarchy never depends on capitals. [UXW-15, M3-41, HIG-23]
- **R-COPY-10.** Punctuation:
  - no full stop on a single-sentence label;
  - no ellipses in buttons;
  - no em or en dashes;
  - an exclamation mark only for a real win (a completed week), and never on hard days.
  [M3-41, UXW-32]
- **R-COPY-11.** One word per concept, the same in the question, the button and the result, every day and in both worlds. Worlds change objects and titles, never action words. The glossary below is binding. [UXW-14, UXW-16, UXW-P13, HIG-46]
- **R-COPY-12.** Plain and literal:
  - words a 12-year-old knows;
  - sentences of at most 12 words, one point each;
  - no negative contractions in instructions, and no nested clauses;
  - no idioms, slang or double meanings in Indian English or Hindi ("cut the line" fails).
  [UXW-13, UXW-20, UXW-41]
- **R-COPY-13.** Fiction words (column, ticket, PNR, back cover) go only on titles and objects. Every control label makes sense without the fiction: 4 of 5 people must be able to say what it does. [UXW-19, UXW-14]
- **R-COPY-14.** No codes or abbreviations to decode (RAC, CNF, WL, "15k") unless the picture carries the meaning. [UXW-21, M3-43]
- **R-COPY-15.** Numbers are numerals, with Western digits in Hindi too. Money uses ₹, lakh and crore, with Indian grouping (1,20,000). [UXW-22]
- **R-COPY-16.** No research or system words on any player screen, in either language:
  - "transfer day", "new kind of puzzle", "counts later", "counts quietly", "direction hidden";
  - "twin", "held out", "consistency form", "lean size", "matching cases";
  - "check gap", "word gap", "part 1 of 2", "points off", chart numbers as kickers.
  - "Consistency" as a figure caption is a placeholder until players choose the word (**FLAG:** PH-27 bans it as a label; UXW-16 and UXW-17 list it).
  [UXW-25, PH-27, HIG-49, M3-43]
- **R-COPY-17.** Results never label the player.
  - Banned: "fair", "unfair", "biased", "wrong", "failed", "perfect", "well done", "Not enough to tell", "No score today", and "The End" unless OQ-4 keeps it.
  - An inconsistent day ends on a soft line that points to tomorrow.
  [UXW-23, DG-23, O9]
- **R-COPY-18.** The result is the tightest budget. Tab labels, figure captions and Share use about 9 of its 20 words, so its other lines share about 10. On the first result, the road-name line replaces the tease (**FLAG**, derived from R-NUM-20). [O8, DG-22, DG-3]
- **R-COPY-19.** The lean has one fixed glossary label in each language. No words about its direction or how it is worked out. [UXW-26, O5]
- **R-COPY-20.** Options in a set:
  - share their grammar, with lengths within 2 words of each other;
  - carry no value word ("everyone", "fair", "safe") in one option only;
  - include no option disguised as a person.
  - Consequences are stated neutrally, and no wording makes one option sound kinder.
  [UXW-34, UXW-P21]
- **R-COPY-21.** The app's own voice never generalises about women, men or any group, not even kindly. Loaded words follow R-QUOTE-1. [UXW-33]
- **R-COPY-22.** The player's gender is never assumed.
  - English uses "you".
  - Hindi uses आप and polite imperatives (चुनें, भेजें, रखें), with no past forms that mark gender (गए, गई) and no slash forms (सकता/सकती).
  - The game never asks the player's gender, caste, religion or community.
  [UXW-35, HIG-53, personas]
- **R-COPY-23.** Hindi is written fresh from the intent by a fluent writer, in everyday spoken words.
  - It uses common loanwords in Devanagari (लेवल, स्कोर, टीम) over formal words (स्तर, नियुक्त करें, जारी करें, चयन करें).
  - 5 Hindi-first players read each new screen aloud.
  [UXW-37, UXW-P26, UXW-P27]
- **R-COPY-24.** Only the chosen language shows, one script per string.
  - The English screens carry no Hindi or Hinglish beyond proper nouns and the switch.
  - The Hindi screens are in Devanagari only, apart from brand names.
  [UXW-36, PROD]
- **R-COPY-25.** Tone: casual, respectful, matter-of-fact. Play belongs on covers and titles; feedback on choices is never funny. No "please", "sorry", "thank you" or "oops". [UXW-32, M3-43, UXW-27]
- **R-COPY-26.** Hard days:
  - the cover names the setting plainly;
  - no line describes violence in detail;
  - the choice is never called harmful;
  - no puns;
  - the topic never appears in reminders, on the lock screen, in the Home Screen name or on a share card.
  [UXW-32, UA-46]
- **R-COPY-27.** Errors, empty states and confirmations follow R-STATE-1, R-STATE-4 and R-DIALOG-1. Routine actions get no confirmation. [UXW-27 to UXW-29]
- **R-COPY-28.** A rule is told once, when it first applies, in at most 8 words, in place (R-STREAK-4). [UXW-4, DG-28]
- **R-COPY-29.** No pressure words:
  - no countdowns and no "your streak ends tonight";
  - no confirmshaming ("Not now" is as plain as yes);
  - no "X overtook you" and no rank-drop notices;
  - no repeated install or share prompts.
  [DG-53, O9]
- **R-COPY-30.** Reminders are at most 8 words (**FLAG**) and name only the day's object ("Tonight: one seat left at the Tatkal counter"). Never the score, the lean, the topic or the app name. No guilt and no badge. [HIG-51, DG-39, HIG-H42]
- **R-COPY-31.** Draft, sample and prototype notices never appear in the flow (R-SHEET-4). Invented figures are never shown as real. [UXW-30, HIG-41, M3-38, PROD]
- **R-COPY-32.** No price or money marks outside the story (OQ-5). [UXW-31]
- **R-COPY-33.** Accessible names start with the visible words, in the same language, and say what a control does, never what it is. [UA-28, UXW-40, M3-46]
- **R-COPY-34.** The product name appears at most once per screen, and only on the cover or the launch screen. [HIG-42, PH-26]
- **R-COPY-35.** The notice sheet before anything leaves the phone:
  - it stands alone, in the chosen language, in plain words;
  - it gives one short line per item kept, plus one line on why;
  - its actions are an outcome verb and "Not now";
  - withdrawing takes no more effort than agreeing;
  - it is the only text allowed past 20 words;
  - a lawyer confirms the wording.
  [UA-47, UXW-1]

**Bilingual glossary** (one word per concept; "to choose" means chosen with Hindi-first players, UXW-37).

| Concept | English | Hindi |
|---|---|---|
| score | score | स्कोर |
| consistency | consistency (placeholder, R-COPY-16) | to choose |
| practice | practice | to choose |
| lean | lean | to choose |
| streak | streak | to choose |
| check | check | to choose |
| note | note | to choose |
| rule | rule | नियम |
| level | level | लेवल |
| road name | road name | to choose |
| board | board | to choose |
| friend | friend | दोस्त |
| week | week | हफ़्ता |
| team | team | टीम |
| you | you | आप |
| pick (verb) | pick | चुनें |
| change (verb) | change | बदलें |
| send (verb) | send | भेजें |
| keep (verb) | keep | रखें |

---

## 5. Accessibility rules

- **R-A11Y-1.** WCAG 2.2 AA throughout. TalkBack in Chrome on Android is the first screen-reader target. [PROD, UA-P26]
- **R-A11Y-2.** Never colour alone. Every state is colour plus a mark, a shape or words. Red against yellow and white against yellow are never the only difference. Test every state in greyscale and through protanopia and deuteranopia simulation. [UA-4, HIG-16, UA-45, PROD]
- **R-A11Y-3.** Contrast follows R-NUM-16 to R-NUM-18. When the phone asks for more contrast (`prefers-contrast: more`), edges thicken and text over art gets a solid backing. [UA-1 to UA-3, HIG-27]
- **R-A11Y-4.** Targets and gaps follow R-NUM-1 to R-NUM-3. Measure the hit box, not the paint. [UA-6, M3-22]
- **R-A11Y-5.** No gesture-only or drag-only action. Every swipe, drag or long press has a visible one-tap twin on the same screen. [UA-9, M3-24, HIG-12, PH-15]
- **R-A11Y-6.** Focus shows as a 3 px ring at 3:1, never yellow. It is never hidden behind the pinned main button or a toast: the scroll area keeps padding the height of the button zone. [UA-P22, UA-3, O2]
- **R-A11Y-7.** Structure:
  - one H1 per screen: the question on a puzzle step, the title on the cover, the score on a result;
  - focus moves to it when a screen arrives;
  - reading order matches what is seen;
  - sheets and dialogs take focus and give it back.
  [UA-23, M3-45]
- **R-A11Y-8.** Nothing is heard twice. No visible label repeats the heading. [UA-23]
- **R-A11Y-9.** One stop per thing: a person card (R-CARD-6), the streak (R-STREAK-5), a board row. [UA-24, UA-26]
- **R-A11Y-10.** Counts, picks, a locked rule, the score, the lean and every toast are polite status messages that do not move focus. [UA-25]
- **R-A11Y-11.** Pictures are decoration or information.
  - Paintings, and portraits beside a written name, are hidden.
  - A portrait without its name says the name only.
  - A picture that carries a fact says the fact.
  - No file names and no single letters are read out.
  [UA-27, M3-46, UA-2.0c]
- **R-A11Y-12.** `html lang` follows the chosen language, and every phrase in another language or script carries its own `lang`. [UA-20, UXW-40]
- **R-A11Y-13.** Text scales:
  - the root is 100% and sizes are in rem, with unitless line heights;
  - the page carries `<meta name="text-scale" content="scale">`;
  - R-NUM-24 and R-NUM-25 hold.
  [UA-16, UA-17, HIG-24]
- **R-A11Y-14.** Reflow at 320 (R-NUM-23). The manifest locks no orientation. [UA-18, UA-19]
- **R-A11Y-15.** Reduced motion is honoured as a designed state (R-MOT-10). [UA-21, PROD]
- **R-A11Y-16.** No flicker. Vibration can be turned off. Every setting is remembered. [UA-45, HIG-35]
- **R-A11Y-17.** No timers. Nothing disappears on a timer, except a toast whose words also stay in place. [O9, HIG-H32, PS7]
- **R-A11Y-18.** Save and resume as in R-STEP-10. [UA-34]
- **R-A11Y-19.** Consistency:
  - "?" sits in the same corner on every screen that has it;
  - the tabs keep the same order and labels;
  - every control keeps its place across days and worlds.
  [UA-30, UA-31, UA-33, HIG-56]
- **R-A11Y-20.** The question stays on screen while the player acts. [UA-45, PH-28]
- **R-A11Y-21.** Shared phones:
  - nothing private shows without a deliberate tap;
  - notes stay folded;
  - the Home Screen name and icon are neutral;
  - the game is for adults, and its handling of a child on the phone follows the designed case (OQ-17).
  [UA-38, JR, PROD]
- **R-A11Y-22.** Hard days are trauma-informed:
  - the art shows the situation, never the harm;
  - the cover names the setting;
  - back leaves at any point;
  - the topic stays private;
  - the tone stays plain.
  - A help line is OQ-30.
  [UA-46]
- **R-A11Y-23.** Nothing personal leaves the phone before the notice sheet (R-COPY-35). [UA-47]
- **R-A11Y-24.** An attached keyboard can reach and press every control. Each full day is played once with TalkBack and once with a keyboard. [HIG-56]
- **R-A11Y-25.** Every build gets the pass in UA-44, plus testing to R-NUM-38. A check passing never certifies the design. [UA-44, HIG-54]

---

## 6. Motion rules

- **R-MOT-1.** Timings follow R-NUM-28 and R-NUM-29. Nothing waits for an animation, and no animation blocks the next tap. [UA-22, HIG-33]
- **R-MOT-2.** Motion only with a purpose. Interactions repeated often get only their press and pick feedback. [HIG-H26]
- **R-MOT-3.** Curves come from M3 tokens only.
  - **Pick:** 200 ms on standard `cubic-bezier(0.2, 0, 0, 1)`, or 350 ms on expressive fast spatial `cubic-bezier(0.42, 1.67, 0.21, 0.90)` if it bounces.
  - **Colour and opacity:** 150 ms.
  - **Sheet entering:** 400 ms on emphasised decelerate `cubic-bezier(0.05, 0.7, 0.1, 1)`.
  - **Sheet leaving:** 200 ms on emphasised accelerate `cubic-bezier(0.3, 0, 0.8, 0.15)`.
  - **Screen to screen:** 300 ms on standard, the same every time, with no jump cuts.
  [M3-31]
- **R-MOT-4.** When a mechanic links two things, the two ends move together over 100 to 300 ms: a word travels into its blank, a portrait into its slot. [PH-11]
- **R-MOT-5.** Only the next-target cue loops, and it stops after 3 cycles. [UA-22, DG-7]
- **R-MOT-6.** The three longer moments (result reveal, ghost demonstration, milestone) are each skipped by a tap. [UA-2.0b]
- **R-MOT-7.** Vibration: one short pulse on the commit only, the same everywhere, never for a result or the lean, and switched off in the "?" sheet. [HIG-35, HIG-H27]
- **R-MOT-8.** Sound is on by default. [O10, over DG-26]
  - **Switches:** Music and Sounds each have a switch, in the "?" sheet only (R-SHEET-4), with no line of text under them. Sound starts with the player's first tap, never on opening.
  - **Sets:** one per world, synthesised in the browser.
  - **Music:** Lugdi plays B trimmed, a quiet drone and tabla, with its sting on the cover only. Station plays B, a four-note chime, on the cover only.
  - **Where it stays quiet:**
    - Sunday's look-again screen plays only sheet sounds.
    - The milestone stamp gets one soft note.
    - No horn or announcement-like sound plays in the loop, and the cover gets at most one soft sound.
  - **Fading:** music fades out after 3 minutes without a tap, and stops when the screen locks or the page is hidden.
  - **Reduced motion:** the calm set plays, without the milestone note.
- **R-MOT-9.** Layouts stay still while loading. [M3-P23]
- **R-MOT-10. Reduced motion as a designed state.**
  - Under `prefers-reduced-motion: reduce`, nothing slides, tilts, flips, zooms, rolls, pulses, bounces or shakes.
  - Changes are instant cuts (**FLAG:** UA-21's "instant" over M3-32 and HIG-34's fades).
  - Every moving cue has a drawn still twin:
    - ghost demonstration: a still drawing of the gesture on its target, shown once;
    - pulse: a static ring;
    - milestone: a still stamp;
    - result reveal: instant;
    - split-flap: an instant change;
    - refusal shake: a static mark beside the row;
    - swipe tilt: a stacked edge only.
  - Press feedback stays, as a colour or outline change within 100 ms.
  - *Test:* no CSS animation runs, every transform transition is 0 ms, and each still shows.
  [UA-21, HIG-34, M3-32, DG-7, DG-8, DG-26, PROD]
- **R-MOT-11.** No motion, colour, vibration or sound ever signals a lean or its direction. Every sound is the same whatever was picked, scored or leaned, including the result's. [O5, O10, HIG-30, HIG-H27]

---

## 7. Visual-system rules (world-neutral)

- **R-VIS-1. One meaning per colour.**
  - Yellow means only the player's pick and the live button that confirms it.
  - Nothing else is yellow: not the main button outside puzzle steps, the not-ready button, scores, facts, the "you" row, streak marks, the active tab, the current language, the focus ring or notices.
  [O2, HIG-25, M3-15, UA-32]
- **R-VIS-2.** Every card and option starts on plain paper (the world's cream). All cards look the same before a choice. [O2, M3-19, DG-14]
- **R-VIS-3.** A chosen item looks more "on", never "off". It gains yellow, a tick and a heavier frame. It is never darker or quieter than unchosen items, and unchosen items never change (R-CARD-3). [UA-5, M3-28, PH-5]
- **R-VIS-4.** One main button, pinned at the bottom, in one place on every screen, day and world. Its words change; its place, shape and size never do. Options never share its look. [UA-7, UA-30, HIG-1, PH-4, R-COMMIT]
- **R-VIS-5.** A dashed outline means only an empty puzzle slot. Not ready, spent, unchosen, notices and unplayed days each have their own cue. [UA-32, PH-10, DG-7, HIG-18, M3-15]
- **R-VIS-6.** One look per role, and at most 5 tappable looks per world (R-NUM-33). [PH-7]
- **R-VIS-7.** Information never looks tappable, and nothing tappable looks like information. A filled accent box is always tappable. [PH-8, M3-37, HIG-25]
- **R-VIS-8.** Group with space first. Use containers only where space cannot do the job, at most 2 levels deep, with no full-width boxed bands. [PH-9, M3-18, PH-6]
- **R-VIS-9.** One focal point per screen (the day's object or its people), with the main button second. [PH-1, PH-3]
- **R-VIS-10.** The painting fills the screen and is never shrunk, cropped to a strip or compressed. Text over it sits on a plate or tint that passes R-NUM-18. [M3-36, UA-2, HIG-H10, CR-MF4]
- **R-VIS-11.** No large pure white on the dark grounds; paper is the world's cream. [HIG-28]
- **R-VIS-12.** Any text longer than 2 lines sits on paper with dark ink. The dark grounds carry only short labels, titles and numbers. [PH-35]
- **R-VIS-13.** Two faces: the display face for titles only, and Hind for everything that is read. Styles follow the R-NUM-14 table. Check every screen in Hindi beside English. [O7, HIG-22, HIG-23, M3-12, UA-15]
- **R-VIS-14.** Status lives on the object (R-STEP-12). [UA-35, HIG-32]
- **R-VIS-15.** Same grammar every day: the kicker format, the question's position, the main button's position and the state looks are fixed. Only the object and the art change. [PH-33, DG-31, R-NUM-34]
- **R-VIS-16.** The worlds change the dress, not the places. Across Lugdi and Station, controls keep their size and position. [UA-30, HIG-56, JR M1]
- **R-VIS-17.** Every person has a portrait; there are no letter tiles. "Neither" is never person-shaped. [HIG-52, DG-15, UXW-43]
- **R-VIS-18.** Equal cases look equal. No person is shown differently before the choice. [M3-19, PH-24]
- **R-VIS-19.** No colour hints at a lean, and red is never the only signal for anything. [HIG-30, UA-4]
- **R-VIS-20.** Tokens come in three layers (reference, system, component), with no hex or raw px outside the token files. Every system token has a value for each world, script height and motion setting. [M3-1, M3-2]
- **R-VIS-21.** Every world object is a component with a spec page (anatomy, tokens, every state, accessibility) before it is built. [M3-3, HIG-15, M3-25]
- **R-VIS-22.** Three heights. Shadows are only for protection or invitation; Lugdi's red offset shadow follows OQ-3. [M3-29, R-NUM-33]
- **R-VIS-23.** There is no light or dark switch. Each world is one fixed look that honours higher contrast. [HIG-31, HIG-27]
- **R-VIS-24.** The launch screen has no text and no logo. Both worlds share one launch ground colour, so the manifest's colour matches the first screen every week (**FLAG**, derived from HIG-39 with the weekly switch). [HIG-39, O7]
- **R-VIS-25.** Brand:
  - "Equal Lens Daily" appears at most once per screen (R-COPY-34);
  - The Equal Lens is one small credit, in the "?" sheet only;
  - the NGO's colours, fonts and mascot never appear in play.
  [O6, PROD, HIG-H33]

---

## 8. What each world must still decide

Each world (Lugdi, Station) decides the items below within the rules above. Hind stays the reading face in both (O7).

- **R-WLD-1. Palette tokens:** ground, paper (cream), ink, yellow (its own value, the same meaning), the muted not-ready fill, the non-yellow fill of the main button outside puzzle steps, outline, scrim, focus-ring colour and forgiven-day colour. Every declared pair passes R-NUM-16 and R-NUM-17, and every painting passes R-NUM-18.
- **R-WLD-2. Display size:** one step (36 or 45). The display face is Sarpanch unless the owner says otherwise.
- **R-WLD-3. Corners:** at most 3 radii.
- **R-WLD-4. Chosen mark:** one mark per world (tick, stamp or punch), used by every pickable component, plus the lock mark for a revisited step.
- **R-WLD-5. Pressed:** how pressed shows round a thumb (an offset shift, or an edge change).
- **R-WLD-6. Main-button dress:** live, not ready, and outside puzzle steps, all in one shape. The red offset shadow follows OQ-3.
- **R-WLD-7. Secondary and destructive:** the secondary style (outline or text) and the destructive text style.
- **R-WLD-8. Slot dress:** the dash weight and length, meeting R-NUM-17, and the ring that lights a valid target.
- **R-WLD-9. Streak marks:** the shapes for played, forgiven (with its word), missed, not yet played and today.
- **R-WLD-10. Day objects and their spec pages.**
  - Lugdi: poster cover, plates, the end of the day (OQ-4), the roundel (OQ-5).
  - Station: enamel board, cream ticket, split-flap row, PNR slip, luggage tag, reservation chart, zone map, the third script (OQ-6).
- **R-WLD-11. Character voice and attribution:** how a character's line and a quote's speaker look.
- **R-WLD-12. Swipe signifier:** the stacked edge of the quick-sort card.
- **R-WLD-13. Share card:** the layout (mini-poster or ticket).
- **R-WLD-14. Finished object:** how the day's object looks finished on the result.
- **R-WLD-15. Portraits:** the portrait style and the missing-portrait silhouette.
- **R-WLD-16. Tab bar:** the icons and the shape of the active indicator.
- **R-WLD-17. Painting:** plate or tint over each painting (OQ-11).
- **R-WLD-18. Kicker:** its dress within the fixed format, and the art of the 1-to-6 difficulty mark.
- **R-WLD-19. Milestones:** the stamp art.
- **R-WLD-20. Motion character** within R-MOT: bounce or none; how the split-flap moves.

---

## 9. Remaining owner questions that affect the look

OQ-1, OQ-7, OQ-8 and OQ-9 are settled by O5, O2, O3 and O4.

| OQ | Question | Recommended default |
|---|---|---|
| OQ-3 | Lettering on Lugdi buttons | Sentence case in Hind on every button in both worlds; capitals only on cover titles of at most 4 words; the red shadow, if kept, on the main button only |
| OQ-4 | "The End" on Lugdi results | Drop it; use the day's object line ("Issue 212 is out") |
| OQ-5 | The "Price ₹2" roundel | Make it the issue number |
| OQ-6 | The city's script on Station boards | English and Hindi only |
| OQ-10 | Sizes the samples draw smaller | The rules win in all four pairs: 48 px chips, crowd bands in two rows of five, 14 px stat labels, Hindi names in Hind |
| OQ-11 | How dark the tint over a painting must be | A plate behind each text block instead of a tint over the whole painting; where a tint is needed, the lightest that passes R-NUM-18 |
| OQ-12 | Transfer days announced or not | Not announced; they look and score like any day |
| OQ-13 | Naming the day's trick | Never; the cover shows only the weekday difficulty mark (1 to 6) |
| OQ-14 | Being open about what the game hides | One line in the "?" sheet: your lean's side stays private, and some days bring new kinds of puzzle |

Not on this list but still open, and touching the look: OQ-2 (Sunday's shape). R-SUNDAY-1 holds for all three of its shapes.
