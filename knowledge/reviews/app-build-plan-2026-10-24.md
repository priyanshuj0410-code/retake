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

1. **The server for M4: Supabase Pro in Mumbai (ap-south-1), reached only through a thin same-origin proxy of Vercel Functions in Mumbai (bom1), with Amazon SES in Mumbai sending the code emails** (owner, 24 Oct 2026: "evaluate firebase vs neon vs supabase... use the best"). The record, with the comparison, the architecture and the costs, is [backend-choice-2026-10-24.md](../architecture/backend-choice-2026-10-24.md). Neon is the fallback if a week-one check fails. Needed from the owner before M4 starts:
   - a Supabase organisation on Pro ($25 a month) with one project in Mumbai, and a card that takes recurring US-dollar charges;
   - an AWS account for SES in Mumbai, with a sending domain (DKIM, SPF, DMARC) and production access;
   - Vercel Pro ($20 a month), or Vercel Support's answer on whether the NGO may stay on Hobby;
   - the lawyer's answers on the questions at the end of the record (log and data retention under the DPDP Rules, breach timing, processing outside India, the notice wording).
2. **Hosting: Vercel's equal-lens-daily project** (owner, 24 Oct 2026: "yes... update vercel metadata"). Done the same day:
   - `vercel.json` builds the app (`pnpm run build:web`) and copies the team's demo to `/demo/`, so production keeps the demo's link working when the app replaces it. Until then production deploys from `main`, which still serves the demo; a branch push gets a preview of the app.
   - Headers: noindex, no referrer, a strict Content-Security-Policy on the app (everything from this origin), no camera, microphone or location, long caching for hashed files, none for the shell, the service worker and the manifest.
   - The name is Retake everywhere: the page title, the install name and the manifest (it said "Equal Lens Daily"), with the ticket icon (DESIGN.md default A) drawn from `library.py` by the export and `scripts/icons.ts`, and a link preview for WhatsApp (`og.png`, a stand-in until the library draws SC-71) at the production address Vercel gives the build.
   - Every font is self-hosted (`public/take/fonts/`), as F-122b requires; the demo still loads Google Fonts.
   - The service worker leaves `/demo/` alone and caches cutscene panels when first shown, so the install download fell from 6.7 MB to 3.9 MB.
   - Checked locally with the same headers: the take plays with no errors, the demo's 63 screens load. Not checked on Vercel itself: this container cannot reach it, and the project's name and settings in Vercel's dashboard are the owner's to change.
3. **Hinglish stays as a lasting mode** (owner, 24 Oct 2026: "yes"), the default of three; PRODUCT.md updated.
4. **The reading's numbers.** The five cards show counts of the player's picks until the research line sets the scoring, as in the demo.

## Retake as a PWA, 24 Oct 2026

Owner: "make sure retake is a pwa". `pnpm pwa` (`scripts/pwa-check.ts`, rewritten for the First take) passes 15 of 15 on a production build served with `vercel.json`'s headers, so the Content-Security-Policy is in force:

- **Installable:** Chrome's installability check and manifest parse report nothing. The manifest is Retake's, with icons at 192, 512, maskable and SVG, and three screenshots for Android's fuller install dialog (`pnpm pwa:screens` takes them from the app). The iPhone tags and the theme colour match.
- **Offline:** the shell, the library's styles, every font and the sound engines are precached (3.9 MB). Cutscene panels are cached as each cutscene is reached; the opening's, which load before the worker is in charge on a first visit, are handed to it by `src/pwa.ts`. Offline, the app reopens on the same decision in the chosen language, with its faces, fonts and the panels already seen.
- **The demo at `/demo/` never takes the app's place in the cache.** A mutation run with that guard removed fails the check, so the check has teeth.
- **Updates wait for a tap:** the library's toast, "New version ready." with Update, in the chosen language, on every screen; the take resumes where it was.
- **Installed on an iPhone,** the screen starts below the see-through status bar and ends above the home bar. **Installed anywhere,** the app asks the browser to keep its storage (P4's 2 GB phone).
- **Fixed on the way:** Vercel's clean URLs (set the same day) redirected `/index.html`, and a redirected shell cannot open offline; they are off, and the check guards it. The cache is renamed `retake-` and clears the turned-down build's `elt-` caches.
- **Left for M5 (F-123):** the game's own one-time install sheet after the third day. Until then Android's own install prompt shows, and an iPhone installs through Share, then Add to Home Screen.

## The responsive app, 24 Oct 2026

Owner: "make sure you develop the full responsive app not just the mobile version". Every screen is now drawn in the library's responsive app frame (`library.py` `app()`, the `.app` shell in `library.css`), not a phone frame: one window-sized container (`src/take/take.css`) whose container queries lay each screen out by the room it gets, as DESIGN.md's "Larger screens" sets out.

| Size | What the app does |
|---|---|
| Phone, upright (under 600 wide) | the same screens as before, the painting behind the game |
| Tablet, upright (600 wide and up) | the larger painting (`-l`); the game gathered low, at most 760 wide; cards on their side |
| Wider than tall (700 wide and up): tablets on their side, laptops, desktops | the wide painting (`-w`) fills the screen; the game in a column on the right, `clamp(420px, 50%, 760px)`, over a dark fade; type a notch larger from 760 by 700 |
| A phone on its side (520 tall or less) | a 60% column, smaller faces, one scroll |

- **New in the library** (`library.css`, "the app frame for every screen"): a cutscene wider than tall is full screen (below); the "?" sheet, its scrim and the update toast rise inside the column at its width, so the painting stays whole (the Full Painting Rule; ia-and-flows.md, Wide screens). The phone-only content rules (Hindi spacing, the cover arrangement, Rukavat's pick, Jadugar's Hindi faces, cutscenes, rank) now hold in both frames; the library's phone specimens are unchanged.
- **The export** gives every screen its painting with the larger and wide versions; those are cached when a tablet or wider screen first draws them, never in a phone's install download.
- **Checked:** every screen kind at 360 x 640, 412 x 915, 768 x 1024, 1024 x 768, 844 x 390, 1280 x 650, 1440 x 900 and 1920 x 1080, with no overflow and no page error; `pnpm pwa` still 15 of 15.
- **For the owner's look:** the wide cutscene and the sheet in the column are new designs, made from the library's rules; the library page does not yet show them as specimens.

## The PWA review and the owner's phone, 24 Oct 2026

An independent review (three angles, each finding put to a skeptic: 20 confirmed, 7 refuted) and the owner's phone found the same fault from two sides: the shell came from the network first, so a new deploy's code could run with the last version's cached styles (the owner's phone drew the cutscene with an old `library.css`: the large panel behind the strip, Skip in a box, the dots off-centre), and on a stalled signal an installed app sat on its splash for 20 s with everything cached. Fixed:

- **One version at a time** (`scripts/pwa/sw.js`): only `/` and `/index.html` are answered, from the version's own cache, never written from the network; a new version arrives only on Update, or once every window has closed. A stalled launch now opens in about 120 ms.
- **Updates cost only their changes:** each file carries a revision (`scripts/pwa/plugin.ts`); install copies what is unchanged and fetches the rest past the browser's cache (4 requests for a styles change, was the whole 3.7 MB). Cutscene panels and the larger and wide paintings live in `retake-pics`, kept across updates and fetched again only when they change; each chapter's panels are cached at its title card, unless the browser asks to save data.
- **Fresh styles on every deploy:** the stylesheet links carry a fingerprint of their file (`vite.config.ts`), and `/take/` styles and scripts are revalidated, never reused for an hour.
- **The update toast** sits between the body and the button, never over a choice, Next or the "?" sheet; a second window gets its own working Update.
- **Smaller:** the install screenshots fell from 586 KB to 166 KB (Chrome fetches them on every visit); the manifest no longer locks portrait; persistent storage is asked for in browser tabs too (not Firefox's, which would ask the player); a failed sound load is tried again; a panel that cannot load leaves its caption, not a broken picture; the wide and larger paintings fall back to the phone's offline.
- **`pnpm pwa` now builds two real versions**, A and B, and checks 23 things: install, the cache, a stalled signal, offline after the demo, B waiting until the tap with A's styles, only B's changes fetched, the toast's place, two windows, and offline with the browser's cache cleared. Run with the old shell put back, it fails.

**Cutscenes on wide screens are full screen** (owner: "The cutscene illustrations should be fullscreen like the other illustrations"): the newest panel fills the screen, "?" and Skip on a fade at the top, the caption on its plate at the foot with the dots and Next beside it. Upright screens keep the comic strip. Skip on a cutscene is now light on every world (Lugdi's was ink on its dark ground, in the demo too).

## M1, the First take playable, 24 Oct 2026

Owner: "ok... keep building".

- **Every decision kind** (`src/take/steps/`): pick one and Believe, spend checks (`Pick.tsx`); rank for the seats, with rows that glide into their order and the perforation under the last seat (`Rank.tsx`); pick a team and keep, a tap past the number refused in place (`Team.tsx`); Cricket's batting order, the column filling from the top (`Order.tsx`); Rukavat's split, a chore then a person, the TV counted against whoever gets it (`Split.tsx`). Each draws the library's markup (`first_take.py`) in the responsive frame.
- **The private reading** (`Results.tsx`, `reading.ts`): the five cards worked out on the phone from the player's own answers, as the demo does it, and "Not you? Remove this reading" clears them and starts again. **One change from the demo:** card 5 says "40 choices. A first reading, from one sitting." The demo's "in 20 minutes" counted time, which PRODUCT.md and the privacy check rule out.
- **The turned-down build is retired:** its screens, boards, UI, strings, styles, art, fonts and the checks that drove them. Its content, scoring engine and store stay for the dailies (M3), with their checks. `tsc -b` is clean for the first time since the 20 Oct build, and `pnpm check` passes: 46 checks, the play-through (48) and the PWA (23).
- **Fixed on the way:** Cricket's plate showed its markup as text; the content check now skips strings left empty in English on purpose.
- **Done since:** the "more" cue on long screens; `pnpm markup` (`scripts/markup-check.ts`), which compares each of the 40 decisions' body structure with the signed-off demo's, leaving out text, the shuffled order and states, and fails when a class drifts (checked by renaming one). All 40 match. Both are in `pnpm check`.

## M2, the first visit, 24 Oct 2026

- **The birth date (SC-15) and not yet 18 (SC-16)**, drawn first in the library (`library.py` `birth_phone`, `notyet_phone`, in the covers section; `library.css`, "the first visit") and then built (`src/take/Gate.tsx`). A paper card at the foot of the first chapter's painting holds the languages (this screen has no "?", so the chips the "?" sheet carries stand here, as ia-and-flows.md's language-switch note asks), the question, three number fields on the number pad, the date in words under them, and one line: "Stays on this phone", or what is wrong with the date with the digits kept. The fields wrap as the text grows. A first visit starts in the phone's language.
- **What the phone keeps:** an adult's birth date; for someone under 18, only the day the game opens, and whether "Wrong date?" was used (D1). Today's date comes from the calendar module, the one place allowed to read the clock.
- **Checked** (`pnpm e2e`, "the first visit"): a first visit opens on the birth date; a date that does not exist and one still to come are refused in place; a real date shows in words; under 18 keeps only the opening day, stays shut on every open, and offers "Wrong date?" once; an adult goes on to the take with the birth date kept.
- **For the owner's look:** both screens are new designs from the spec, not yet seen. The Hindi lines are drafts for the native read.
- **Privacy and Delete all (F-111, F-112; SC-44, SC-49)**, drawn in the library (`library.py` `privacy_phone`, with the "?" sheet's other states) and built in the app's "?" sheet: option C keeps its three parts and gains one link, Privacy, whose level says what stays on this phone, that nothing leaves it, and what is kept nowhere. Delete all asks once in the one dialog, in F-112's words ("Delete all your days and notes?"), over its own scrim; it empties the phone at once, says "Deleted." (installed, with how to take the icon off the home screen), keeps nothing while the line shows, and starts again from the birth date. `pnpm e2e` checks it (8). **Open:** F-111's one contact for data questions needs the owner's address; nothing is invented in its place.
- **Accessibility check** (`pnpm a11y`, in `pnpm check`): axe-core's WCAG 2.2 A and AA rules on every kind of screen (the birth date, not yet 18, a cutscene, a title card, the six decision kinds, the reading, the "?" sheet, Privacy, the dialog), on a phone and a laptop, in Hinglish and Hindi: no violation. Colour contrast over the paintings stays with the library's pixel check, since axe cannot read text over a picture. A mutation run (the "?" button without its name) fails it.

## The responsive review, 24 Oct 2026

An independent review (three angles: layout across sizes; Hindi, 200% text, small phones and keyboard; the five worlds against the demo; each finding put to a skeptic) found 35 issues: 16 confirmed, 19 refuted, most of those because the signed-off demo does the same. Fixed:

- **Cards on their side** (high, found three times): a card's note fell into the face's column, in Jadugar most of all. The library's sideways rule and Jadugar's now move `.note` as they moved `.quote`.
- **200% text** (high): the library's 200% and small-phone layouts were keyed to its phone specimens. The app frame now carries `is-200` (root text at 150% or more) and `is-small` (360 x 640 or less), and the layout rules hold in both frames: at 200% the cards stack in one column and nothing is cut.
- **Back** (R-STEP-9): every decision's top bar has Back, as the demo's does. It shows the step before, read-only with its answer and a lock (the library's `is-revisited`), and one button, "Go to the current step"; from a chapter's first step it is the title card, reading Continue; the phone's own back does the same. Split now keeps which chore went to whom, so a revisited Split shows it. `pnpm e2e` checks it (8).
- **The cutscene's Next** is the world's own button outside a decision, as in the demo, not the yellow one.
- **Skip over a full-screen cutscene** failed contrast in four worlds: the fade at the top is deeper (never a box, owner 23 Oct).
- **A phone on its side** narrower than 700 gets full-screen cutscenes too; **a laptop window** (1280 x 650) gets a tighter tier, so four people fit in most decisions; the column's own width now turns cards on their side; Lugdi's roundel keeps to its masthead; the birth date and the reading get the "more" cue, and a wrong date's line comes into view.
- **`pnpm markup`** now compares each decision's top bar and dock as well as its body: all 40 match the demo.

**Open:**
- **Paintings, for the owner's Mac** (the painter runs there): wide (`-w`, 1440 x 810, the subject in the left third) versions of `pulp-s-cricket`, `pulp-s-money` and `cricket-s-board`, and larger (`-l`) ones of the two Lugdi paintings. Until then a wide screen stretches the phone's painting; the export names them.
- On a laptop window, the row kinds (rank, team, batting order, split) and Jadugar's Believe still scroll once, with the cue; compact wide layouts for them are a design step for the library.

## Started, 24 Oct 2026

- [x] This plan, on the branch `app-build`.
- [x] **M0.1 the content export:** `design-system/tools/app_content.py` writes `content/take/first-take.json` (59 screens: 40 decisions, 13 cutscenes, 5 title cards, the reading) and copies 154 files to `public/take/`. The title cards lose the library cover's tab bar (SC-91 has none).
- [x] **M0.2 the shell** (`src/take/`): the phone frame, top bar and plate, progress, the "?" sheet with the three languages and the sound switch, the world's sound beds and taps, the height fit, resume where left (FL-03), the take kept on the phone only (`store.ts`). `src/main.tsx` now opens the First take.
- [x] **M0.3 pick one and spend checks**, end to end, with the cutscene player and the title cards. Checked on a 412 px phone in Chromium: through the opening to Station's first decision, a pick, "?", Hindi, and a reload that came back on the same decision in Hindi, with no page errors.

**Next (M1):** done the same day; see "M1, the First take playable".

**Known on the way:**
- `pnpm build` runs `tsc -b`, which already failed on `main`: 58 errors in the turned-down build's `src/boards/` and `src/screens/`, none in `src/take/`. Those files are retired in M1, which brings `pnpm check` back. Until then, build with `npx vite build`.
- The title cards are still the daily game's covers ("Kolkata, Platform 5", "Level 4 of 6"), as in the demo; open with the owner since 23 Oct.
- The bundle carries the whole take (365 KB, 103 KB gzipped). For 2 GB phones on a weak signal (P4), M2 splits it by chapter.
