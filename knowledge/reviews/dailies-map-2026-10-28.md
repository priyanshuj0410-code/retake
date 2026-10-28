---
type: review
title: The dailies (M3), what exists and what is missing, 28 October 2026
description: A read-only map of everything the dailies need (code, content, library parts, the owner's rules, the scoring research), made by five readers and a completeness critic on 28 Oct 2026, with the conflicts found, the rules already decided, the questions only the owner can answer, and the staged plan for building M3.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-23/
---

# The dailies (M3): what exists and what is missing

The owner asked on 28 Oct 2026: "Let's get the dailies working on the app". This is milestone M3 in [app-build-plan-2026-10-24.md](app-build-plan-2026-10-24.md). The Board and accounts (M4) are not in it. Five read-only readers mapped the code, content, design, rules and scoring, and a sixth checked their maps. Their full maps, with file and line evidence for every claim, are in [assets/dailies-map-2026-10-28.json](assets/dailies-map-2026-10-28.json); this note keeps what the build needs.

## In one paragraph

Nothing the dailies need runs in the app today. The engine for them (calendar, streak, score, results) and the 14 days of content were written for the build the owner turned down on 20 Oct, and they do not fit the app that was built after it: different answer shapes, two worlds instead of five, one puzzle a day instead of three levels, a day that ends at midnight instead of 4 am. None of the 14 days survives the owner's 25 to 26 Oct rules. The library draws a cover, a result, Sunday's week and Sunday's look again in all five worlds, but for the old one-puzzle game: no level switch, no Past puzzles, no Week tab on weekdays, and every cover still prints "Level 3 of 6". The research line has not set a scoring rule.

## What carries over

- **From the First take:** the step screens for pick one, Believe, spend checks, rank, pick a team, the batting order and split; the store's checks of kept answers; the two-window sync; the birth-date gate; the offline cache.
- **From the old engine, with changes:** `src/engine/streak.ts` (one forgiven day a week, already decided) and `calendar.ts` (dates), both tested by `scripts/scoring-check.ts`.
- **From the library:** the cover, result, Sunday and look-again drawings as a starting point in all five worlds.

## What is missing

1. **Daily content in the owner's style.** None exists: no three levels, no Jadugar, Cricket or Rukavat days, no present-day everyday scenes, and the old days use the replaced cast, a female truck driver, festivals and named cities.
2. **Library parts drawn and approved before the build:** the level switch, Past puzzles, the Week tab on weekdays, Your notes, the cover states with three levels, the result without Share, and what the Board tab shows before accounts.
3. **An app shell:** the cover as the first screen, with the First take as a quieter offer, and the tabs.
4. **A daily store:** records by puzzle date and level, marked played on the day or later. Past puzzles never count for the streak or the week.
5. **The calendar the owner decided:** the day changes at 4 am India time, a day begun before 4 am finishes as that day, and five worlds take a week each from launch Monday.
6. **Scoring for the app's step kinds,** with the "scored both ways" tests carried over, and an honest result.
7. **Three step kinds with no app screen** (rule then jobs, word bank, quick sort), if launch week keeps all six kinds (O11 Q8 A).
8. **A way to serve content** that keeps tomorrow's puzzle off the phone (F-173, Never) and fetches a past day only when it is opened (F-49a). Static hosting cannot do this alone.
9. **Rules no map listed at first:** the other half of a hidden pair is kept out of Past puzzles for 7 days (F-49f); a ghost demonstration the first time a kind appears (F-25); Sunday's look-again taps are never stored (F-69, F-77); new versions arrive without an Update button (F-173a, which the live toast breaks); a content fix after release must not silently erase finished days.
10. **Room in the script budget:** the app script was 110 of its 130 KB gzipped on 25 Oct, and the First take's content rides inside it.

## Already decided: build these without asking

The day changes at 4 am (F-08, F-09, O11 Q2). One forgiven day per week, and opening the week counts on Sunday (F-62, R-NUM-35, F-66). The done cover says "Next puzzle in 3 h" (F-03). A transfer day looks and scores like any day (F-35, F-53, R-SCORE-2). Past puzzles add to All time only (F-49a, FL-19). All six kinds in launch week (O11 Q8 A). Updates arrive quietly (F-173a). Tomorrow's puzzle is never on the phone (F-173).

## Conflicts to settle (each listed with its source in the maps)

- PRODUCT.md still says one puzzle a day and two alternating worlds; the owner's 21 Oct decisions say three levels a day and five worlds.
- F-43's "women truck drivers as deliberate satire" against the owner's 26 Oct rule on jobs most people can do.
- Worlds as their own stories (O15, 22 Oct) against "just the look" (25 Oct), recorded for the First take only.
- Hard-topic days on the M3 cover (F-06) against help lines placed in M5.
- The result's Share button (R-RESULT-1) against sharing being M5.
- The engine adds a missing part as zero into the score, against R-SCORE-2.
- Two weeks of content (M3) against four weeks ready ahead (O11 Q9, F-39); at one world a week, two weeks reach two worlds.

## What the result may honestly show now

Counts of the player's own choices ("kept your rule in 3 of 4", "treated 2 of 3 matching pairs alike"), practice, puzzles solved, days played and the streak. Not a lean or consistency number presented as a reading, no change over time, no comparison between levels. The research line's latest draft says "levels are never compared", and with three levels a day the old engine would pool them into one lean.

## The staged plan

1. **Decisions:** the owner answers the open questions (content, time per day, look, score, serving, launch size, hard-topic days, the Board tab).
2. **Design:** the missing daily parts drawn in the library in all five worlds and both languages, for the owner's approval.
3. **Content:** the first weeks written in the owner's style at three levels sharing one scene, through the checkers (twins, note lengths, cast, help lines), then the owner's review and a Hindi read.
4. **Engine and store:** the decided rules first (4 am, five worlds, the streak with past puzzles kept out, the pair holdback, quiet updates), with tests; this needs no design approval and can start at once.
5. **Build:** the shell, cover, level switch, daily play, result, Week, Sunday and Past puzzles, any new step kinds, the content export, and the checks (privacy, content, e2e at phone sizes in three languages).
6. **Owner plays it, then push.**
