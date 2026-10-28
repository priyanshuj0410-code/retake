---
type: reference
title: Trainer requirements and the checks that hold them
description: Each requirement of EVAL-13 (the daily fairness trainer's first working version) mapped to the script that checks it under pnpm check, and what is not covered.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-13/
  - https://app.plane.so/the-equal-lens/browse/EVAL-23/
---

# Requirements and their checks

`pnpm check` runs `tsc -b`, `oxlint`, `scripts/check-all.ts` (design, content, scoring, privacy,
bundle), then `pnpm ux`, `pnpm e2e` and `pnpm pwa`. The evaluator's acceptance tests (research
plan v1, section 9) were retired with its code; they live on the evaluator's branch.

| Requirement | Check | What it does |
|---|---|---|
| Design system: tokens only, the text-colour rule, contrast, composition, no gender in the UI, motion | `scripts/design-check.ts` (D) | Static: tokens, `color` reads, every `--c-on-*` resolves to ink or paper in every skin and ground, accent never red, 78 contrast pairs, class ownership, design.md section 4, press 100 ms, hit-stop, reduced motion, faces |
| Contrast on the real screens, targets, names, axe, symmetric options, focus | `scripts/ux-audit.ts` (U) | Every screen of the 14 days, onboarding, board, menu and Hindi screens at three widths |
| Fortnight shape: two skins, Monday easy to Saturday hard, Sunday results, rotating areas, all mechanics, objects differ, twins, transfer day, cast mix | `scripts/content-check.ts` (C) | Reads the content files |
| Copy: British spelling, no dashes, minimal reading, no timers, sample labels, Hindi drafts, neutral road names | `scripts/content-check.ts` (C) | Every string in content and i18n |
| Two-way scoring, per-person absolute lean, overcorrection not fair, noise not lean, shrinkage, twins, transfer no feedback, headline sum, note never read, streak forgiveness, board ranks, handles | `scripts/scoring-check.ts` (S) | Synthetic players (`scripts/lib/policies.ts`) answer every step |
| The dailies' groundwork (EVAL-23): the day changes at 4 am India time and a day begun before it finishes as that day, five worlds a week each from launch Monday, the streak on any level's own-day play with one day off a week, past puzzles on All time only, the twin holdback in Past puzzles, the daily store's checks on load and across a content change, a late finish and a clock set back mending no gap, reopening a play across 4 am, two windows, a full phone, a store this version cannot read set aside, Delete all | `scripts/daily-check.ts` (Y) | Pure functions of `src/engine/calendar.ts`, `src/engine/streak.ts` and `src/daily/store.ts`, with the phone's store as a map in memory and a second window as a second copy of the store module |
| Dates only; no timers; no response times or keystrokes | `scripts/privacy-check.ts` (P), `scripts/daily-check.ts` (Y), `scripts/e2e.ts` | Source scan (the daily store included, a missing file failing), the daily store's saved JSON walked key by key after a played week, and the saved state after real play |
| No third party | `scripts/bundle-check.ts` (B) | The built app loads nothing from another origin |
| Play end to end: handle, today's puzzle, day result, streak, board and friends, Sunday week, date override, Hindi, reload resume, press and hit-stop | `scripts/e2e.ts` (E) | All 12 puzzle days through the accessible roles, plus a one-sided player |
| Installable and offline | `scripts/pwa-check.ts` (W) | Production build in Chrome |

**Not covered:** native-speaker review of the Hindi and the board scripts; the owner's review of
every scenario and word coding; any real crowd or board data; behaviour outside the game.
