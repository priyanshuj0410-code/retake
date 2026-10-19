---
type: reference
title: Acceptance tests and the checks that run them
description: Each prototype acceptance test registered in research plan v1, section 9, mapped to the script that runs it under pnpm check, what the script does, and what it does not cover. Also the build's own checks.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-1/
---

# Acceptance tests and the checks that run them

Source: `Paper Analysis/Hypotheses/workplace-gender-training-v2/research-plan-v1-2026-10-19.md`,
section 9 (the Sex Ed workspace). Research plan v2 (19 Oct 2026) is a delta that leaves section 9 standing and replaces the card
layout; its counts are in `content/config.json`. If a later plan changes a test or a count,
change the check or the configuration and this table together.

`pnpm check` runs, in order: `tsc -b`, `oxlint`, `scripts/check-all.ts` (every test on the demo
store and the content), `pnpm rules` (the rules in the emulator) and `pnpm e2e` (a browser
session on the emulator). Last run, 19 Oct 2026: **226 of 226 checks pass** (191 in
`check-all`, 28 in `rules`, 7 in `e2e`). The plan asks that an independent reviewer signs each
test off before any pilot datum: that sign-off is not part of this build.

| # | Registered test | Script | What the script does | Not covered |
|---|---|---|---|---|
| 1 | One-time tokens | `scripts/store-checks.ts`, `scripts/rules-check.ts`, `scripts/e2e.ts` | 1000 synthetic sessions start and submit once; every replay of a spent token and every second submission is refused, on the demo store and by the real rules in the emulator; the same link in a browser is refused; no record carries a token | The panel provider's written confirmation of its repeat-entry block (an owner action) |
| 2 | Per-card and per-player randomisation | `scripts/randomisation-check.ts` | 20000 seeded sessions per deployment: chi-square at 0.01 for R1's arm, every ground's two-of-four labelling, the 24 starting orders, presentation, language, the baseline card, the notes within split, the M1-H share, the crosswise subsample and the firm window; independence of every cue from description and starting position, and of each ground from sex (corrected for the two-of-four restriction, `scripts/lib/stats.ts`); the restricted counts and coverage of plan v1 4.1 in every session; the rematches (count, family, flipped order, returning later); the same seed played with opposite answers meets the same draws except the registered route and note | Blocked randomisation of firm windows and of M2's note within stratum: both are simple 1:1 here (see data and privacy) |
| 3 | The four-sentence disclosure verbatim | `scripts/disclosure-check.ts` | The registered English sentences are written into the check a second time and compared byte for byte with `content/disclosure.json`; the first screen is rendered for English, Hinglish and bilingual players and must hold the four sentences per language and the Continue button and nothing else; Play and firm enrolment open on it | The Hinglish strings are a draft, not pre-tested (PO-12); there is no Hindi (Devanagari) build |
| 4 | No timers | `scripts/no-timers.ts`, `scripts/rules-check.ts`, `scripts/e2e.ts` | Source audit (no timer, countdown, deadline, animation loop or keystroke capture); schema audit of every record type and of real submissions; the rules refuse a record with a time, response-time or session-id field; a browser network capture of a whole session shows two writes (token, submit) and no time field | Provider-side request logs (see data and privacy) |
| 5 | No instructed items | `scripts/no-instructed.ts` | Bank audit of every item for instructed, dummy or attention-check wording; every item asked in a session is a registered bank item; every repeat is a real item asked earlier, word for word | |
| 6 | The withdrawal code | `scripts/store-checks.ts`, `scripts/rules-check.ts` | Create, submit, withdraw and verify deletion end to end in all three stores, on the demo store and in the emulator; the other player's records are untouched; the explanation is closed before the release date and opens after it; withdrawal is refused after `deleteUntil`; no store holds the code | Destroying codes and keys and the deletion log by date and count (owner steps, not scripted); the custodian-held keys (not possible on this stack) |
| 7 | Release only in cells of 50 or more | `scripts/release-check.ts` | Cells of 49 refused and 50 released; small categories merged or suppressed; firm batch-months merged within the firm-month, never across timing arms; "prefer not to say" its own cell; the employer's sex result only at 50 or more | |
| 8 | Unlinked demographics, with the sex-label exception | `scripts/store-checks.ts` | Every join between the stores attempted on real submissions (no shared key or value); crosswise and demographic records hold only their whitelisted fields; firm records carry the sex label, timing arm and batch-month and nothing else identifying; panel records no sex label | |
| 9 | No arrival order in the store | `scripts/store-checks.ts`, `scripts/rules-check.ts` | Known records inserted in sequence on the demo store (120) and in the emulator (60): the stored order does not recover the insertion order; keys are random or code-derived; no write time, batch id or session id | The mixing pool's random-position queue (no pool on this stack) |
| 10 | M3's device label | `scripts/store-checks.ts`, `scripts/e2e.ts` | The device computes the label from the player's own conduct cards (`src/engine/m3.ts`); only "upper", "lower" or "not-engaged" reaches the crosswise records; nothing of it in the person-level record; the browser's storage holds no label and no answer after a session | The merit references are demo values until P1 |

## The build's own checks

| Check | Script | What it holds |
|---|---|---|
| X-1 Session length | `scripts/session-length.ts` (`pnpm length` prints the table) | Each game's longest route fits 30 minutes at 25 s a card, on plan-scripts/cap_fit.py's timing model; the firm enrolment sitting too |
| X-2 Content and writing | `scripts/content-check.ts` | Card banks large enough for every configured session; continuations are fixed templates; the survey's balanced keying and repeat pairs; the three notes' equal format and length; placeholders and "not yet pre-tested" markers present; British spelling; no em or en dash anywhere |
| X-3 Game rules | `scripts/game-rules-check.ts` | People decisions never change the season result; unscored ordinary decisions appear; one act order; out-of-fiction screens flagged |
| X-4 Design system | `scripts/design-check.ts` | [design.md](../design.md)'s rules |
| X-5 The explanation is not in the app | `scripts/bundle-check.ts` | Builds the app and finds no sentence of the scoring explanation in it |
| X-6 Rules refusals | `scripts/rules-check.ts` | No device reads a record or lists tokens or codes; no write without an open session, no overwrite, nothing outside `eval-` nodes; owner-only dates; firm enrolment created and spent once |

## The predecessor's crosswise build checks

Research plan v1 carries the predecessor's crosswise build checks (its research plan v4, 4.3,
items 1 to 9) "as written for the crosswise store". Item 1 (records carry only item, answer,
subsample and label) and item 8 (no arrival order) are covered above. Items 2 to 7 and 9 (a
separately administered relay with no access log or IP, random-position queueing, release in
blocks of 50, table rewrites, blind-signed tokens, memory-only holding with purge, the
cell-open pre-check) **are not built and cannot be on this stack**; [data and
privacy](../architecture/data-and-privacy.md), section 3, says what would be needed. They block
any crosswise datum.
