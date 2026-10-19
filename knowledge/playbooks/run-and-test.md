---
type: playbook
title: Running and testing the evaluator
description: How to run the prototype in demo mode (no backend, or the Firebase emulator), where every piece of content lives for researchers to replace, how to change card counts, and how to run the checks and screenshots.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-1/
  - https://app.plane.so/the-equal-lens/browse/EVAL-4/
---

# Running and testing the evaluator

## 1. Set up

```bash
cd ~/equal-lens-evaluator
pnpm install
```

Node 22 or later. The emulator checks also need the Firebase CLI and a Java runtime (Homebrew
`openjdk`; the scripts add `/opt/homebrew/opt/openjdk/bin` to the path). Screenshots and the
browser run use the installed Google Chrome through `playwright-core`.

## 2. Run it

| Command | What runs |
|---|---|
| `pnpm dev` | The demo build on the **demo store**: everything in the browser's own storage, no backend. The home page issues demo tokens, so each button starts a fresh one-time session. |
| `pnpm emulators`, then `pnpm seed`, then `pnpm dev:emu` | The same app on the **Firebase emulator** (`demo-eval`), with the real rules. `pnpm seed [n]` writes release dates, the demo firm, the explanation and tokens, prints play links, and with `n` writes `n` demo players' records. |

Demo-only aids, all under `config.demo: true`: the home page; the demo notice before the
disclosure; the "Demo" strip on every screen after it; `?now=YYYY-MM-DD` on the address to
pretend a date (try `#/explain?now=2027-03-02` to open the explanation after release, or the
firm play link the enrolment page offers); `#/results` plays 120 or 400 seeded demo players and
shows their numbers through the release rule.

Routes: `#/play/<token>` (panel games), `#/enrol/<firm>` and `#/firm/<enrolment code>` (the
firm), `#/explain`, `#/withdraw`.

## 2a. The season story (EVAL-4)

On the demo home page, "Team season: pick a story" issues a `season` token and plays the
redesigned game: the season picker, five episodes, the result page, the optional profile.
"Your profile" opens `#/profile`; "Open the demo profile" there writes and opens a demo profile
with two made-up past seasons (recovery code `DEMQ-PRQF-2XE7`; `pnpm seed` writes it to the
emulator too and prints season links). `pnpm season` plays one whole season in Chrome at
390 px through the accessible roles and prints the decision and click totals (`BASE=http://localhost:5184/`
plays a running dev server; `POLICY=order` taps in the order shown). The branch's dev server
runs with `pnpm dev --port 5184`. Content: `content/story.json` (stories, episodes, beats,
screens, result and profile words); planning values: `content/config.json` `season`, every one
PENDING v17. Review: [game-redesign-2026-10-19](../reviews/game-redesign-2026-10-19.md).

## 3. Where the content lives (replace it here, never in code)

| File | What | Status |
|---|---|---|
| `content/config.json` | Every count, probability, timing value and date. **Card counts per act are single values here**; when research plan v2 sets them, change them and run `pnpm length` and `pnpm check` | Planning values |
| `content/disclosure.json` | The four sentences per language | English registered; Hinglish not pre-tested |
| `content/cards/opportunity.json`, `npt.json`, `conduct.json` | The people-card bank: roles, role sex-typing band, four merit-close descriptions, the fixed continuation | Demo, written for the prototype; P1 rates bands and merit spread |
| `content/identity.json` | First names, surnames, cities, tones, species, badge | Illustrative, not yet pre-tested |
| `content/ordinary.json` | Budget, vendor, schedule and risk decisions; which are scored | Demo |
| `content/inbox.json` | 48 Committee Inbox incidents, 24 harassment and 24 near-miss under the 2013 Act | Demo; not truthed by a POSH panel |
| `content/notes.json` | The three mid-season notes | (a) and (b) statistics are placeholders until sourced |
| `content/survey.json`, `direct-block.json`, `screening.json`, `crosswise.json` | The matched survey, the firm's victim-blame block, the screening block, the crosswise sets | Demo, not pre-tested; screening keying set by the builder |
| `content/screens.json` | Every other word on screen, including consent and the short debrief | Hinglish is a draft |
| `content/explanation.json` | The scoring explanation. **Never imported by the app**: it reaches players only from the database after the release date | Draft for review |
| `content/merit-reference.json` | Each description's merit-only rank, used by M3's device label | Demo values from seeded players (`pnpm merit-reference`); P1's pilot replaces it |

Text fields are `{ "en": ..., "hinglish": ... }`. Tokens in card texts: `{name}`, `{first}`,
`{recall}`, `{g:he|she|they}` (`src/content/types.ts`). `pnpm check` validates every file.

## 4. Check it

| Command | What |
|---|---|
| `pnpm check` | Everything: types, lint, every acceptance test, the rules in the emulator, the browser run ([acceptance tests](../reference/acceptance-tests.md)) |
| `pnpm check:fast` | Without the emulator (about 10 s) |
| `pnpm length` | The session-length table, act by act, at 25 s a card, at the configured counts and at the research plan's targets |
| `pnpm rules`, `pnpm e2e` | The emulator parts alone |
| `pnpm shots` | Screenshots of every act and page at 390 and 1440 px, light and dark, into `out/shots/` (git-ignored) with `index.txt` |

`RAND_N=2000 pnpm check:fast` runs the randomisation check faster while editing.

## 5. Session length (19 Oct 2026, 25 s a card)

The counts follow research plan v2 (1.1), which supersedes v1's (the panel as two games).

| Session | Longest route | Plan v2's figure (`cap_fit_v2.py 25`) |
|---|---|---|
| Panel game 1, low scorers (M1-L) | 29.8 min (37 people cards) | 29.86 min |
| Panel game 1, high scorers (M1-H route; others padded to it) | 25.2 min | 25.27 min |
| Panel game 1, R1's partial arms | 16.4 min | 16.43 min |
| Panel game 2 (Inbox 24) | 30.0 min (29.97; 20 people cards) | 29.88 min |
| Firm (two conduct rematch cards, Inbox 42) | 29.9 min (24 people cards) | 29.77 min at Inbox 44 |

This build counts two screens `cap_fit_v2.py` does not: the content note before the Committee
Inbox (15 s, a planning value of this build) and, in the firm, the direct block's four repeat
pairs. Game 2 still fits at plan v2's 24 Inbox cards (with 2.5 s to spare); the firm does not
fit at 44 (30.6 min), so its Inbox gives two cards, to 42 (21 and 21). Game 1 has no rematch
card (plan v2 1.2: one would take the low branch to 30.3 minutes); the firm has two conduct
rematch cards, each returning with its starting order flipped.
