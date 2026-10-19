---
type: review
title: Game redesign, 19 Oct 2026
description: The season-story redesign of the evaluator (EVAL-4) - why, what changed, the full 390 px Playwright play with its decision and click totals against the old build, the screen list, what is PENDING v17, and what to flag.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-4/
---

# Game redesign, 19 Oct 2026 (EVAL-4)

Branch `eval-game-redesign` (worktree `../equal-lens-evaluator-game`). Design rules:
[design.md](../design.md) sections 4, 4a and 4b. Run it: [run-and-test](../playbooks/run-and-test.md).

## Why

The owner played prototype v0 and found 202 questions, each taking 3 to 15 clicks, plus a Next
after every answer; agree/disagree items on separate screens; no continuity of characters;
emoji too small to notice and every animal the same; and nothing given back to the player.

## What changed

A fourth deployment, `season` (`src/story/`, `content/story.json`), played from a one-time
link like the panel games. The three card games of research plan v2 are untouched and still
pass every check.

- **NPQE's way in.** The player picks one of three seasons ("a story that reads you"): the
  warehouse is built; the newsroom and the clinic are stubs marked PENDING v17.
- **Five episodes, ten decisions each, one fixed cast.** The hiring sprint, the complaint (it
  says sexual harassment goes to the Internal Committee, never a team lead; its disputes are
  everyday ones), the budget crunch, the promotion round, the season close. Each opens with a
  title card. Eight colleagues for the whole season, 72 px portraits; in the first five
  decisions each is a different animal mascot, then a reveal maps mascot to person; each
  builds a track record.
- **Cues per player** from `content/identity.json`: four women and four men; in each sex a
  Hindu with a surname read as Scheduled Caste, a Hindu with one read as upper caste, a Muslim
  born in the south and one born in the north; one darker tone per religion per sex; rival
  pairs (one woman, one man) whose notes are tied when the season sets them against each other.
- **Consequences follow the notes only**: the next screen's line is keyed by the merit tier of
  the notes the player put first (X-12 replays 200 casts with one notes-only player and gets
  identical consequences and season points).
- **Fewer clicks.** Tap-to-order ranking (3 taps for 4, numbers shown, the last fills itself,
  Undo, auto-commit); one-tap picks and options; a quick split (one number per colleague);
  the twelve statements on one screen as a compact grid (works at 320 px, by keyboard, by
  screen reader); no Next after an answer; Back on the next screen.
- **The payoff.** An attitude-rating page in the owner's NPQE structure with our evidence and
  stance: a disarming opening; "Your readings" (sex first and wide with a named band, a
  strength bar and the reasons; then religion, skin tone, surname, birthplace); one section
  per area (hiring and promotion, complaints and conduct, sharing resources) with where the
  decisions followed the record, the blind spots ending with the player's own decisive pairs
  ("When Sunita Sharma and Manoj Trivedi had the same record, you put Manoj Trivedi first 8
  times out of 9"), reflection prompts (not stored) and habits (free, sources PENDING v17); the
  Internal Committee line; save to a profile and retake later; a share card that works for
  every band ("Take it and compare"); an optional, separate stay-in-touch form.
- **Three zones per cue** against a per-person noise floor: the signed sum over decisive pairs
  under every balanced relabelling of the cast (70 for sex, religion and tone). Seeded checks:
  a notes-only player reads as a lean in at most about 5 per cent of seasons; a player who
  strongly favours men reads "Leans towards men" in at least 80 per cent; a content-blind
  player reads "Not enough to say" in at least 95 per cent.
- **Optional profile** (`#/profile`): pseudonymous, no email, a recovery code; the store holds
  only AES-GCM ciphertext at a code-derived key; timeline, change line ("No change read yet"
  unless a change is read), the next retake as a date, a separate longitudinal opt-in, and
  "Delete my profile and all my records". A demo profile with two made-up past seasons opens
  from the profile page (and `pnpm seed` writes it to the emulator, code `DEMQ-PRQF-2XE7`).
- **Kept:** the disclosure flow (sentence 3 shown as `PENDING owner wording`), consent (a
  season variant, draft), the withdrawal code, no timers, demo mode, the eval- stores (new:
  `eval-profile`, `eval-long`, `eval-contact`, and `season` in every dep field), the tokens, the
  out-of-fiction rules and the three surfaces.

## The full play, 390 x 844, Playwright (`BASE=http://localhost:5184/ pnpm season`)

Policy: follow the stronger notes, put the man first on equal notes, split 4 and 2, first
option, "4" on every statement. Result: "Leans towards men" (28 of 30 equal pairs).

| | Old build (prototype v0) | Season story |
|---|---|---|
| Decisions | 202 questions (owner's count) | **50** story decisions, plus 12 statements on one screen and 2 wrap questions |
| Clicks | 3 to 15 per question plus a Next after each (owner's count): at least 606 (202 x 3) before the Nexts | **122** from the demo notice to the result (120 after the demo notice and disclosure; the 50 decisions take 88 taps) |
| Screens | 127 to 163 per game 1 session, 135 game 2, 137 firm (`pnpm ux` walkthroughs) | **71** to the result |
| Length at planning timings (PENDING v17) | about 30 minutes per game | 12.9 min story, 2.8 min wrap |

Clicks by kind: rank 16 screens x 3 = 48; pick 19 x 1; ordinary 9 x 1; split 6 x 2 = 12;
episode cards 5; statements 12 taps and Done; the rest one each (the language step 2, the code
step 2).

### Screen list

| # | Screen | Clicks | Heading |
|---|---|---|---|
| 1 | demo | 1 | Demo mode |
| 2 | disclosure | 1 |  |
| 3 | consent | 1 | Before you start |
| 4 | language | 2 | Choose your language |
| 5 | story:pick | 1 | Pick your season |
| 6 | story:intro | 1 | Your season at Kite Logistics |
| 7 | story:episode | 1 | Episode 1: The hiring sprint |
| 8 | story:beat:rank | 3 | Who should draft the peak plan? Put them in order. |
| 9 | story:beat:pick | 1 | Who should take the transport call? |
| 10 | story:beat:ordinary | 1 | Snacks for the first team call? |
| 11 | story:beat:split | 2 | Share the 6 training days. |
| 12 | story:beat:rank | 3 | Who should lead the floor walk? Put them in order. |
| 13 | story:reveal | 1 | You visit the warehouse |
| 14 | story:beat:pick | 1 | Who should write this week's update? |
| 15 | story:beat:rank | 3 | Who should lead the interview panel? Put them in order. |
| 16 | story:beat:rank | 3 | Who should run the temp staff plan? Put them in order. |
| 17 | story:beat:pick | 1 | Who should write to the agency? |
| 18 | story:beat:ordinary | 1 | What about the Saturday count? |
| 19 | story:episode | 1 | Episode 2: The complaint |
| 20 | story:beat:pick | 1 | Whose complaint do you take up first? |
| 21 | story:beat:rank | 3 | Whose account do you rely on most? Put them in order. |
| 22 | story:beat:pick | 1 | Whose concern goes to payroll first? |
| 23 | story:beat:ordinary | 1 | How should concerns be raised? |
| 24 | story:beat:pick | 1 | You have time for one this week. Who do you meet first? |
| 25 | story:beat:pick | 1 | Whose account goes in the incident report? |
| 26 | story:beat:rank | 3 | Whose concern goes to the safety meeting first? Put them in order. |
| 27 | story:beat:pick | 1 | Whose packing record do you send to the customer team? |
| 28 | story:beat:rank | 3 | Whose case do you look at first? Put them in order. |
| 29 | story:beat:ordinary | 1 | How do you close the week? |
| 30 | story:episode | 1 | Episode 3: The budget crunch |
| 31 | story:beat:pick | 1 | Who should own the budget sheet? |
| 32 | story:beat:ordinary | 1 | Which box supplier? |
| 33 | story:beat:split | 2 | Share the 6 course days. |
| 34 | story:beat:rank | 3 | Who should lead the supplier deals? Put them in order. |
| 35 | story:beat:ordinary | 1 | What about the loading dock? |
| 36 | story:beat:split | 2 | Share the 6 sets of minutes. |
| 37 | story:beat:rank | 3 | Who should handle the truck crisis? Put them in order. |
| 38 | story:beat:ordinary | 1 | How do you catch up? |
| 39 | story:beat:pick | 1 | Who should set up the returns desk? |
| 40 | story:beat:pick | 1 | Who should run the conveyor test? |
| 41 | story:episode | 1 | Episode 4: The promotion round |
| 42 | story:beat:rank | 3 | Who should present the plan? Put them in order. |
| 43 | story:beat:pick | 1 | Who should write the packing standard? |
| 44 | story:beat:pick | 1 | Who should plan the shelf layout? |
| 45 | story:beat:pick | 1 | Who should get in touch with the sellers? |
| 46 | story:beat:rank | 3 | Who should host the audit? Put them in order. |
| 47 | story:beat:pick | 1 | Who should take the directors through the plan? |
| 48 | story:beat:split | 2 | Share the 6 mentoring hours. |
| 49 | story:beat:pick | 1 | Who should check the signs? |
| 50 | story:beat:rank | 3 | Who should lead the night shift? Put them in order. |
| 51 | story:beat:pick | 1 | Whose name do you put forward? |
| 52 | story:episode | 1 | Episode 5: The season close |
| 53 | story:beat:rank | 3 | Who should lead the dry run? Put them in order. |
| 54 | story:beat:split | 2 | Share the 6 early shifts. |
| 55 | story:beat:rank | 3 | Who should host the visit? Put them in order. |
| 56 | story:beat:rank | 3 | Who should give the sale day briefing? Put them in order. |
| 57 | story:beat:pick | 1 | Who should lead the client debrief? |
| 58 | story:beat:split | 2 | Share the 6 expo day passes. |
| 59 | story:beat:pick | 1 | Who should write it? |
| 60 | story:beat:ordinary | 1 | What do you do with it? |
| 61 | story:beat:ordinary | 1 | When should the team celebrate? |
| 62 | story:beat:rank | 3 | Who should present to the board? Put them in order. |
| 63 | story:season | 1 | Season over |
| 64 | story:survey | 13 | A few statements |
| 65 | story:prior | 1 | Before today, had anyone told you how this test reads attitudes? |
| 66 | story:prior | 1 | Had you heard about this game before today? |
| 67 | story:debrief | 1 | What this season measured |
| 68 | story:code | 2 | Your withdrawal code |
| 69 | story:demographics | 1 | About you (optional) |
| 70 | story:submit | 1 | Submit or withdraw |
| 71 | story:result | 0 | Your attitude rating |

Screenshots: [rank](assets/game-redesign-2026-10-19-rank.jpg),
[pick](assets/game-redesign-2026-10-19-pick.jpg),
[reveal](assets/game-redesign-2026-10-19-reveal.jpg),
[statements grid](assets/game-redesign-2026-10-19-grid.jpg),
[result](assets/game-redesign-2026-10-19-result.jpg),
[profile](assets/game-redesign-2026-10-19-profile.jpg).

## Verification

`pnpm check`: 280 of 280 in `check-all` (new: X-10 to X-15, the season disclosure, the new
component states), 43 of 43 rules in the emulator (new: season records, profile, research
link, contact), 13 of 13 e2e (new: a whole season, a profile and the contact form on the
emulator), and `pnpm ux` with every new season screen at six variants: no contrast,
target, name, heading, overflow, axe or focus failure; keyboard paths for tap-to-order,
the quick split and the grid pass; 87 of 87 component states.

## PENDING v17 (marked in `content/config.json` `season.pendingV17`, `content/story.json`, on screen in demo mode)

- Cast size (8), episodes (5), decisions per episode (10), split cap (4), every planning timing.
- The rating: q 0.95 (a lean at p 0.05 or less), at least 8 decisive pairs, engagement at 0.7
  of clear pairs; the area cards (at least 3 pairs, two thirds one way).
- The change rule between profile seasons (0.5 on the -1 to +1 weight) and the retake gap
  (none set; shown as a date when set).
- The newsroom and clinic seasons; the longitudinal research consent text (profile and
  stay-in-touch); the "keep watch" habits' sources.
- Owner wording: disclosure sentence 3; the season consent (draft).

## To flag

1. **The result conflicts with registered rules.** The registered disclosure says attitudes
   are read for groups only, the consent says no score is shown, and the scoring explanation
   is held until play closes. The season shows an individual rating at once, so sentence 3 is
   `PENDING owner wording` and the season consent is a draft. A result shown at the end can
   also spread how the test reads attitudes to players still to play.
2. **Retakes and profiles link a person's seasons.** The profile is encrypted on the device
   and links seasons for research only on opt-in, but a retake measures a player who now
   knows the method. v17 must say how retakes are read (test-retest, practice effects).
3. **Contact details are new personal data** (`eval-contact`, name and email, unlinked):
   needs a DPDP basis, retention and a deletion route before any participant.
4. **Caste and birthplace can never read** with eight colleagues (two of each per sex, so
   four relabellings): they always say "Not enough to say". Within each sex the two Hindus
   always differ on tone (and so do the two Muslims), so caste and birthplace are confounded
   with tone inside a person. v17 must choose the cast layout.
5. **Power is modest.** Seeded players over 300 seasons each: a notes-only player reads as a
   lean in 3 per cent (alpha 5); a strong lean (cue weight 2) in 97 per cent; a mild one (0.6,
   against tier gaps of 2) in 63 per cent. 30 sex pairs per season is what 50 decisions give.
6. **Track records** are kept off decision cards so equal notes stay equal, but a player's own
   earlier picks build them (cumulative advantage). v17 decides whether they show at all.
7. **Merit tiers and all story text are the builder's**, not pre-tested (P1); Hinglish is a
   draft. The complaint episode adds conduct decisions about the fixed cast: everyday
   disputes only.
8. The other agent's EVAL-3 work (component states) was merged in on this branch; no conflict
   remains.
