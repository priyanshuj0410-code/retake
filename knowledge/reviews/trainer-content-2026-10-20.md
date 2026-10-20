---
type: review
title: Trainer fortnight content for the owner's review
description: The fourteen days of the trainer's first version, where each lives, what each tests and scores, the twins and the transfer day, and the builder's decisions the owner should confirm.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-13/
---

# The fortnight, for review

Every word is in `content/` (one file per day under `content/days/`, each with a `_review`
note). Change it there; `pnpm check` re-checks the shape and the copy. Names, novels, stations
and trains are invented. All Hindi, and every regional board line, is a draft for a native
speaker.

## Lugdi week (ISO week 43, 19 to 25 Oct 2026)

| Day | Cover | Level | Area | Mechanic | What it scores |
|---|---|---|---|---|---|
| Mon | Diwali Ki Raat (family drama) | 2 Same rule for all | home | lock a rule, assign 5 relatives to 3 stall jobs | rule kept; Anita and Arjun tie under every rule (one lean unit) |
| Tue | Mohalla Masala (gossip magazine) | 3 Same yardstick | online | quick-fire keep or cut, 8 lines in 4 mirrored pairs | matching lines treated alike; keeping a line about a man counts against him, and the reverse |
| Wed | Ghat Ka Sauda (thriller) | 4 Loaded words | road | two-way pick: Kamla and Raju, same 14 years, 0 crashes, 61 trips, different words | twin T1, first half: no number today |
| Thu | Readers Write (letters page) | 6 Why did it happen? | work | words for two notes (Pammi, Arjun) from one bank of 8 | word-choice parity |
| Fri | Chit Fund Ka Raaz (crime) | 7 Marriage and family | money | spend 3 checks across Anita, Vikram (identical) and Pammi; Meena-ji: "Dig into Anita twice. What if she leaves after the wedding?" | check gap between the matching records; twin T2, first half |
| Sat | Night Match (sport) | 10 Safety framing | sport | pick 6 of 8; Salim chacha: "Keep the girls home tonight. It's for their safety." | Anita and Vikram tie for the sixth seat; twin T3, first half (the response) |
| Sun | Back cover | | | the week: score, lean size, the look back at Wednesday's pair, the board, the streak | |

## Station week (ISO week 44, 26 Oct to 1 Nov 2026)

| Day | Board | Level | Area | Mechanic | What it scores |
|---|---|---|---|---|---|
| Mon | Tatkal Counter, Ahmedabad (Gujarati) | 2 Same rule for all | travel | lock a rule, rank 4 for 1 seat (CNF, RAC, WL); then predict the crowd on last Tuesday's gossip line | rule kept; Anita and Vikram (both "child in hospital") tie under "most urgent"; the crowd guess's distance from a **sample** 71% |
| Tue | Cloak Room, Jaipur (Hindi) | transfer day | trust | who gets a bag back without ID: Pammi, Raju (same description) or neither | **no feedback**; one lean unit counted quietly in the week |
| Wed | Platform Announcement, Hyderabad (Telugu) | 3 Same yardstick | work | words for two announcements (Pammi, Vikram) | word-choice parity |
| Thu | Nashik Run (Marathi) | 4 Loaded words | road | Kamla and Raju again, the words swapped | twin T1 returns: the same words chosen both times is a matched case |
| Fri | Chit Fund Committee, Kolkata (Bangla) | 7 Marriage and family | money | the same checks; Meena: "Punch Vikram's ticket twice. What if he moves back to run his father's shop?"; Farida is new | twin T2 returns: the same spending towards the voice's target both times |
| Sat | Night Match, Madurai (Tamil) | 10 Safety framing | sport | pick 6 of 8; Meena aunty: "Keep the boys off the night bus. There was a fight last week." | twin T3 returns: the same response both times; Anita and Salim tie |
| Sun | PNR slip | | | the week, with Wednesday and Thursday's T1 halves side by side | |

## Decisions the builder made, for the owner to confirm

1. **Rotation.** Odd ISO weeks are Lugdi, even weeks Station. With one fortnight of content,
   every Lugdi week replays days 1 to 7 and every Station week days 8 to 14 until more is
   written. (Years with an ISO week 53 put two odd weeks together.)
2. **Lugdi titles and portraits.** Titles sit on a solid band with the painting as a strip
   below, not text over the painting, so contrast is real. Numbers are Hind, not Sarpanch.
3. **Lean** is the absolute value of the sum of signed units over (count + 2), per player,
   per week. One tie decided one way is a lean of 33. **Consistency** is the mean of rules
   kept, matching cases, check parity and word parity, with evenness added over the week.
   **Headline = consistency + practice**, shown as a sum; practice is 10 a puzzle and 10 for
   closing the week. All three numbers are placeholders for the research line to set.
4. **Twins with a confound** (loaded words, a pointing voice) count towards lean only when both
   halves are in, so following the words both times is never read as a gender lean.
5. **Word valences** (+1 or -1) and Tatkal urgencies (wedding 1, exam 2, hospital 3) are the
   builder's codes.
6. **Road names** use only place, time and thing words ("Ghat Ka Toofan", "Raat Ki Bijli"), so
   the brief's examples "Ghat Ka Baadshah", "Raat Ki Rani Express" and "Kilometre Kamli" (all
   gendered) are not offered.
7. **The transfer day** moved to Station Tuesday so no mechanic opens two days running; it still
   shows practice and the streak, just no score.
8. **The evaluator's code and checks were removed from this branch**, including the emulator
   rules check; `database.rules.json` is unchanged. The Firebase SDK was dropped.
9. **The date override** works in every build of this prototype (not only the dev server).
10. **New characters** (Joseph, Farida) show a monogram until portraits exist.
