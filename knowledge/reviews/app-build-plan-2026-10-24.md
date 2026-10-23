---
type: plan
title: The app build, from the First take demo to the full V1 (24 Oct 2026)
description: How Retake goes from the signed-off demo (design-system/demo.py) to the installable app in src/, in six milestones, the First take first. What carries over from the turned-down build, how the app keeps one source of truth with the library, what waits on the research check and the owner, and what was started on 24 Oct.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-18/
---

# The app build plan, 24 Oct 2026

Owner: "Plan and start the full game development". The owner said on 22 Oct, "I'll sign off from the demo to start building the actual app", so the shared demo (v32) is the signed-off picture for the First take. The rest of V1 is drawn in the library (`design-system/`) and mapped in [ia-and-flows.md](../ux/ia-and-flows.md) (SC-00 to SC-96, FL-01 to FL-26) and [feature-set.md](../ux/feature-set.md) (176 V1 rows).

## How it is built

- **One app, in `src/`.** Vite, React and TypeScript, as installed. The turned-down build's screens and boards in `src/screens/` and `src/boards/` are retired as each new screen replaces them. Its engine (`src/engine/`: calendar, streak, score, rng), the store, the PWA wiring and the checks (`pnpm check`, e2e, pwa, ux) carry over.
- **The library's CSS is the app's CSS.** `design-system/library.css`, `fonts.css` and `worlds/*.css` are copied into the app by the content export, never edited there. The app renders the same markup and class names that `library.py` and `first_take.py` write, so a change made in the library reaches the app on the next export.
- **Content is data.** `design-system/tools/app_content.py` reads the same sources as the demo (`story_take.parse()`, `panels()`, the worlds) and writes `content/take/first-take.json` and the pictures it names into `public/take/`. It refuses to write when `story_take.length_faults` finds a fault or a string has no Hindi. The research check of 25 Oct can change notes, nudges and decisions: that is a change to the script and a new export, not to the app.
- **World dress stays in Python.** Pieces that differ by world and hold no state (covers, plates, the "?" sheet's dress, paintings, serials) are exported as resolved values, or as markup fragments where a world draws its own. Steps, rank, split, the batting order, cutscenes and the reading are React components with the library's markup.
- **Drift check.** `scripts/markup-check.ts` renders each step kind in the app and compares its class tree with the demo's for the same decision. It runs in `pnpm check`.
- **Three language modes** as in the demo: Hinglish (`mix`), Hindi and English, each string carrying `en`, `hi` and, where English-only differs, `eng`.

## Milestones

| # | Milestone | Screens and flows | Waits on |
|---|---|---|---|
| M0 | **Foundations**: the content export, the shell (worlds, languages, "?" sheet, sound switch, the `--app-h` height), one step kind end to end | SC-00, SC-40 | nothing |
| M1 | **The First take, playable on phones (alpha)**: the opening and the 13 cutscenes, chapter cards, all nine decision kinds, progress, chapter results, the private reading's five cards, the diary finale; resume at any decision; everything kept on the phone | SC-02 to SC-10, SC-91 to SC-93, FL-03, FL-23 | the research check (content only); the scoring for the reading's numbers (RSE-164) |
| M2 | **Alpha release**: installable PWA, offline, the update toast, the birth date and under-18 screens, Privacy with Delete all; checks at 390 and 320 px, 200% text, TalkBack labels, axe, the play-through in three modes; a Vercel preview for the team | SC-15, SC-16, SC-44, SC-49, SC-76, FL-12, FL-13, FL-15, FL-21 | the help line numbers checked; a native Hindi read before players outside the team |
| M3 | **The dailies**: three levels a day (Easy, Medium, Hard), cover with the level switch, result, the week and Sunday's look again and note, streak with one forgiven day, twins returning, transfer days, past puzzles, the five worlds a week each; two weeks of content across the five worlds | SC-01, SC-11, SC-20 to SC-28, SC-95, FL-02, FL-04, FL-05, FL-17 to FL-19, FL-25, FL-26 | owner review of the daily content; the scoring shown on the result |
| M4 | **The Board and accounts**: the email code login, road names, friends and requests, three boards per level, the notice sheet before anything leaves the phone; a server | SC-12, SC-14, SC-17, SC-30 to SC-35, SC-50, SC-63, SC-64, SC-96, FL-06, FL-20, FL-22 | the owner's choice of server (the repo holds the Equal Lens Firebase rules); DPDP advice |
| M5 | **Reach and the month**: share cards and the link preview, install offer, reminders, the month recap, the Next take, hard-day help lines, week-change cutscenes | SC-13, SC-47, SC-48, SC-60, SC-61, SC-70 to SC-75, SC-94, FL-07 to FL-09, FL-14, FL-24 | the trademark check before launch |

M0 to M2 is the "faster alpha" of the estimate of 22 Oct (6 to 8 working days); M3 to M5 bring it to the full V1 (11 to 15 in all).

## Decisions for the owner

1. **The server for M4.** Owner, 24 Oct 2026: "evaluate firebase vs neon vs supabase... use the best". Being evaluated.
2. **Hosting: Vercel's equal-lens-daily project** (owner, 24 Oct 2026: "yes... update vercel metadata"). Done the same day:
   - `vercel.json` builds the app (`pnpm run build:web`) and copies the team's demo to `/demo/`, so production keeps the demo's link working when the app replaces it. Until then production deploys from `main`, which still serves the demo; a branch push gets a preview of the app.
   - Headers: noindex, no referrer, a strict Content-Security-Policy on the app (everything from this origin), no camera, microphone or location, long caching for hashed files, none for the shell, the service worker and the manifest.
   - The name is Retake everywhere: the page title, the install name and the manifest (it said "Equal Lens Daily"), with the ticket icon (DESIGN.md default A) drawn from `library.py` by the export and `scripts/icons.ts`, and a link preview for WhatsApp (`og.png`, a stand-in until the library draws SC-71) at the production address Vercel gives the build.
   - Every font is self-hosted (`public/take/fonts/`), as F-122b requires; the demo still loads Google Fonts.
   - The service worker leaves `/demo/` alone and caches cutscene panels when first shown, so the install download fell from 6.7 MB to 3.9 MB.
   - Checked locally with the same headers: the take plays with no errors, the demo's 63 screens load. Not checked on Vercel itself: this container cannot reach it, and the project's name and settings in Vercel's dashboard are the owner's to change.
3. **Hinglish stays as a lasting mode** (owner, 24 Oct 2026: "yes"), the default of three; PRODUCT.md updated.
4. **The reading's numbers.** The five cards show counts of the player's picks until the research line sets the scoring, as in the demo.

## Started, 24 Oct 2026

- [x] This plan, on the branch `app-build`.
- [x] **M0.1 the content export:** `design-system/tools/app_content.py` writes `content/take/first-take.json` (59 screens: 40 decisions, 13 cutscenes, 5 title cards, the reading) and copies 154 files to `public/take/`. The title cards lose the library cover's tab bar (SC-91 has none).
- [x] **M0.2 the shell** (`src/take/`): the phone frame, top bar and plate, progress, the "?" sheet with the three languages and the sound switch, the world's sound beds and taps, the height fit, resume where left (FL-03), the take kept on the phone only (`store.ts`). `src/main.tsx` now opens the First take.
- [x] **M0.3 pick one and spend checks**, end to end, with the cutscene player and the title cards. Checked on a 412 px phone in Chromium: through the opening to Station's first decision, a pick, "?", Hindi, and a reload that came back on the same decision in Hindi, with no page errors.

**Next (M1):** rank, pick a team and keep, the batting order, split, then the reading's five cards (`steps/Soon.tsx` stands in for the four kinds not yet drawn, and the reading is skipped); the "more" cue on long screens; `scripts/markup-check.ts`.

**Known on the way:**
- `pnpm build` runs `tsc -b`, which already failed on `main`: 58 errors in the turned-down build's `src/boards/` and `src/screens/`, none in `src/take/`. Those files are retired in M1, which brings `pnpm check` back. Until then, build with `npx vite build`.
- The title cards are still the daily game's covers ("Kolkata, Platform 5", "Level 4 of 6"), as in the demo; open with the owner since 23 Oct.
- The bundle carries the whole take (365 KB, 103 KB gzipped). For 2 GB phones on a weak signal (P4), M2 splits it by chapter.
