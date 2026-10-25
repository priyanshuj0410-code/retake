---
type: review
title: Audit of the app build, 25 Oct 2026
description: An independent audit of the 16 commits (fbdbfbb to f790b5c) that turned the signed-off First take demo into the Retake app. It covers what is done and works, what is wrong (ranked, with evidence), the owner's open decisions, and what the plan itself still lists. Five auditors each took one angle; each finding then went to a skeptic who tried to refute it.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-18/
---

# Audit of the app build, 25 Oct 2026

Owner: "Pull and audit what's already done". The yardstick was [app-build-plan-2026-10-24.md](app-build-plan-2026-10-24.md), the signed-off demo (v32), [DESIGN.md](../../DESIGN.md), [PRODUCT.md](../../PRODUCT.md), [ia-and-flows.md](../ux/ia-and-flows.md), [feature-set.md](../ux/feature-set.md) and the owner's standing rules.

**Method.** Five auditors each read the code from one angle: the plan's claims, the content and the measurement, the design system, privacy and safety, and code correctness. None of them ran a browser. Each auditor's findings went to a skeptic who re-opened the evidence and tried to refute it. Out of 73 findings, 3 were refuted and 33 were cut down in detail or severity. The full browser suite ran once, separately, through the heavy-job queue.

## In short

The build is real and solid. Every check passes, and production serves the latest commit. The plan's claims about what is done hold up, apart from a few wrong numbers. There are four groups of problems, in this order:

1. **The 24 Oct change of decision kinds broke two twins.** It was made to fix the repetition the owner complained about, and it left two twins measuring nothing for most players.
2. **Two faults copied from the signed-off demo.** In the reading, Rukavat's chores are counted backwards. Cricket's batting order never shows the note that its twin depends on.
3. **New screens shipped before the owner saw them.** The library page, its published artifact and DESIGN.md were never updated.
4. **Delete all and the phone's back button.** Together, they can bring deleted answers back.

## What runs

| Check | Result |
|---|---|
| `pnpm check:fast`: types, lint, content, scoring, privacy, bundle | 46 of 46 (oxlint: 0 errors, 21 warnings) |
| `pnpm e2e`: first visit 10, Privacy and Delete all 8, Back 11, the take end to end 48 | all pass |
| `pnpm pwa`: two real versions, offline, Update on tap | 23 of 23 |
| `pnpm a11y` (axe, WCAG 2.2 AA) and `pnpm markup` | 4 of 4, 2 of 2 |
| The export run again in a throwaway copy | `first-take.json` byte for byte the same as the one committed |
| `site/` rebuilt from `demo.py` | byte for byte the same as the one committed |
| Production (tel-retake.vercel.app) | serves `index-B1th58Hx.js`, the same file a build of f790b5c makes; noindex and the CSP are in place; `/demo/` is up with its 63 screens |

## Done and verified

- **The content export** writes 59 screens (40 decisions, 13 cutscenes, 5 title cards, the reading). It refuses to write on a note-length fault or a missing Hindi string.
- **The library's CSS is the app's CSS.** `library.css` and the world stylesheets are byte for byte the same in `public/take/`. The app's own `take.css` only sizes the window.
- **Every decision kind** is built: pick one, Believe, spend checks, rank, pick a team, batting order, captain and split. In each, the button waits until the decision is done.
- **The reading's five cards** match the demo's arithmetic line for line. The one change is card 5, which no longer counts time.
- **The mix of kinds.** Every chapter has three or four kinds, and every twin keeps one kind in both halves. Each chapter has one plate (Manmad, Kasara Ghat, Chandni Mandal, Purana Maidan, First take).
- **The title cards** follow SC-91. Back on a card plays the chapter's way in again.
- **The first visit.** A date that does not exist, or one still to come, is refused. Under 18, the phone keeps only the day the game opens. "Wrong date?" is offered once.
- **Privacy and Delete all** use F-112's wording. The dialog opens with focus on Keep.
- **The PWA** precaches 3.8 MB. It answers the shell only from the cache of its own version, keeps pictures across updates and clears the old build's caches. The bundle is 397 KB, 110 KB gzipped, under its 130 KB budget.
- **The responsive frame**'s container queries match the plan's table of sizes.

## Fix first

### 1. The kind change removed the forced choice in two twins (new on 24 Oct, f790b5c)

A twin works by putting two people with equal numbers up for one choice. The player has to pick between them, so their pick shows the lean. The six twins that changed kind kept their people and numbers, but those numbers were set for the old kinds:

- **Station 1 and 5, "Pushy" against "Takes charge"**, went from pick one to pick 2 of 4. The hidden two have the best record (11, 0 and 9, 1), so a player who goes by the numbers simply takes both of them.
- **Lugdi 3 and 7, "Reckless" against "Bold"**, went from keep 2 of 4 to pick one. A third card (80, 0, "never scraped") beats both of the hidden two, so a player who goes by the numbers picks that card.

A player who goes by the numbers is the most common kind. For them, these four halves now compare the hidden two 0% of the time; before the change it was 100%. Both are the "words" twins, which feed card 2 and card 3 (Work, and Safety and justice). The research check has not seen the change. Jadugar 2 and 6 already had mismatched halves (a stronger card leads in one half only), and the change only swapped which half reads.

`design-system/tools/forced_choice_2026_10_25.py` prints this for every decision. Fix: put the old kinds back for these four, or give one other card the best record in Station's crews and weaken the third card in Lugdi. Then put it to the research check before the next export, and make the tool a check.

### 2. Rukavat's chores are counted in opposite directions (from the demo)

In the loft and storeroom decisions, the person given the chore counts as "favoured". In Split, the person spared the chore counts as favoured. As a result:

- a player who gives the loft and the storeroom to the woman in both halves reads "Same free hours, but **the man** gets the chores";
- a player who loads the women with every chore in all four Rukavat decisions reads "Close to even in every part of life".

`design-system/tools/reading_chores_2026_10_25.py` runs both cases. Fix: mark a decision whose choice is a burden, so that being left out counts as the favour, and add both cases as tests.

### 3. The batting order never shows the note its twin depends on (from the demo)

The only difference between Gita and Chandan (Cricket 1), and between Hari and Bindu (Cricket 5), is the note "Out first ball last Sunday." Neither the batting order's tray nor its slots draw notes, in the demo or in the app. Yet card 2 can still tell a player "The bad day swapped sides". Fix: draw the note on the tray rows in the library first. Until then, leave this twin out of the reading.

### 4. Built and shipped before the owner's look

Every one of the 16 commits went to production. None of them touched DESIGN.md, and the published Retake Library artifact is still at its 23 Oct version.

- **Nothing new is on the published artifact.** The birth date, Not yet 18, Privacy, Delete all, Deleted and the five title cards are all missing. The library page in the repo has them.
- **The library page's First take section is stale.** It still shows the daily plates (Nashik, "Day 6"), because `demo.py sketch` was never run again.
- **These parts have no specimen anywhere:** the wide full-screen cutscene, the "?" sheet in the column, the update toast in the column, and the revisited step.
- **DESIGN.md now contradicts the code in four places:** decisions are top-aligned, portraits on cards on their side are full height, all five title cards are drawn, and the rank line names trucks and keys.
- **Two design decisions were taken without asking.** The title cards put "Chapter n of 5" above the heading, which DESIGN.md flags as wrong. Lugdi's area is set in the display face, which settles an open lettering choice as B.

Fix: run `demo.py sketch` and then `library.py`, and republish the library. Bring DESIGN.md up to date. Show the owner one pictured sheet of every new screen, on a phone and on a wide screen, and ask which to keep.

## Next: real defects with a smaller reach

| What | Effect | Fix |
|---|---|---|
| Phone back while "Deleted." shows (Take.tsx:71-94; parts.tsx:140) | The sheet closes without starting again, so the deleted birth date and answers carry on in memory. Nothing more is saved, and the next open loses everything. | Reset the state the moment Delete all runs. While a sheet is open, phone back steps back through the sheet. |
| A second open window (tab or installed app) | Its next tap writes the deleted data back. Two windows also overwrite each other's progress. | Listen for the `storage` event on `retake.take`. |
| Phone back on a cutscene uses up the app's one history entry | The next phone back on a decision leaves the app. | Push the guard entry again on every popstate. |
| Focus is never moved when the screen changes | Keyboard and TalkBack users land on the page body after every Next. Closing "?" does not return focus. | Focus the new screen's h1. Return focus to "?". |
| A waiting button is rebuilt on each refused tap; a placed batter's button is hidden | Keyboard and TalkBack users lose their place. | Replay the shake without remounting. Move focus to the next batter. |
| Team, rank and split rows give TalkBack the name and numbers only | In 20 of 40 decisions, including every "the detail matters" twin, a screen-reader player never hears the note. | Link the note with `aria-describedby`, as Pick does. |
| Saved answers carry no content version | Anyone part way through on 24 Oct can finish with a twin's halves in two different kinds. Back then shows that step empty. The next research-check export does the same. | Put a content signature in the save, and drop answers whose decision changed. |
| The install screenshots are from 23 Oct | Android's install dialog shows the old Nashik plate and Station 1's hidden pair, labelled "same numbers". | Take them again on a screen with no hidden pair. |
| Word budget | Privacy is 31 words (37 in Hindi) against the cap of 20. Rukavat 3 and 7 are 11 words in Hindi against the cap of 10. "Go to the current step" is 5 words against 1 to 3. No check reads the First take: the 46 checks' copy rules run only on the retired dailies. | Cut. Point a word check at `first-take.json` and the app's strings. |
| Gossip notes ("..., Mohan says") | They appear on 23 of the 83 other cards and on none of the 80 cards of the hidden two, which gives the pair away. Not caused by the build. | For the research check, with these counts. |
| The plan's numbers | "Pick one fell from 22 to 12" counts Believe in the first number but not the second. Counted the same way, it fell from 22 to 16. | Correct the plan and first-take.md, and show the owner. |
| Strings typed twice | The birth date, Privacy, dialog, Deleted and how-line strings are copied by hand into Gate.tsx and parts.tsx, not exported. They match today, but no check would catch drift. | Export them through `app_content.py`. |

## The owner's decisions

1. **The team's demo is on the players' address.** `/demo/` on tel-retake.vercel.app plays all 12 hard decisions with no birth date and no help line, and production's link preview points at the same address. The owner chose both: hard decisions in the demo for the team, and the demo kept at `/demo/`. That was before the app took the root. Options: move the demo to its own Vercel project or a protected preview; build it without the hard decisions; or put the birth date in front of it.
2. **Help lines.** No chapter's "?" has one yet, as the owner's rule requires until each number is checked. Meanwhile the app at the root also plays the hard chapters to anyone with the link.
3. **What the phone keeps.**
   - An adult's full birth date is kept, but the app only ever checks that one was entered.
   - Under 18, the day the game opens is the birth date plus 18 years, so the birth date can be worked out from it.
   - Privacy says "what you type" is kept nowhere, yet the typed birth date is kept.
   - F-111's contact for data questions still needs the owner's address.
4. **The pacing note.** Station now brings three kinds new to the player; the older note said at most two.

## Low, one line each

- **The take loops.** After the last cutscene it goes back to the opening with the old answers kept, and there is no end state.
- **Card 1** gives the number of clear choices as if it were the number of equal pairs.
- **Card 5** says "from one sitting", but a take can run over several sittings. The owner signed off this wording.
- **"Lock the team"** is also the button for household chores and for carrying cash.
- **Hindi mode.** Decision screens have an English-only accessible name.
- **Sound** never starts for keyboard-only players. The demo does the same.
- **Ghost demonstration.** None plays the first time a player meets a kind (F-25), in the demo or in the app.
- **Two dialog wordings.** The cover's dialog specimen still has the old wording beside F-112's.
- **CSP and caching.**
  - `style-src` allows inline styles.
  - `/demo/` has no CSP and loads Google Fonts.
  - With no service worker, card 3's picture request shows which area leaned most.
  - The worker does not check downloaded files against their revisions.
- **Stale docs.**
  - The plan says production serves the demo, names a `pnpm ux` that does not exist, and gives the old bundle size.
  - The playbook's stored shape leaves out the birth date.
  - ia-and-flows.md still says SC-15, SC-16, SC-44 and SC-91 are "Not drawn".
  - The plan says the birth-date card's top padding matches its sides. It is 13 px against 16 px.
- **is-200.** The large-text layout keys on the root font size, which phone text scaling may not change. This needs a device check.
- **Tests.**
  - e2e does not test partial answers or the reading's numbers.
  - Nothing in the repo repeats the eight-size sweep or the 200% text check.

**Refuted:** that Delete all should also clear the old trainer's keys (that build never ran at this address), and that the plan's file count of 154 is out of date (it was a dated log).

## What the plan itself still lists

**M2:**
- the help lines, checked;
- a native Hindi read;
- checks at 390 and 320 px, at 200% text and with TalkBack;
- the bundle split by chapter;
- F-111's contact.

**Paintings:**
- wide versions of `pulp-s-cricket`, `pulp-s-money` and `cricket-s-board`;
- larger versions of the two Lugdi paintings.

**Other:**
- compact wide layouts for the row kinds on a laptop;
- the owner's look at the new screens;
- the research check and the reading's scoring;
- the backend choice, redone for free tiers;
- M3 to M5, not started.
