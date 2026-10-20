---
type: review
title: Game redesign, 19 Oct 2026
description: The season-story redesign of the evaluator (EVAL-4) and its rebuild to the owner's 80-decision layout (EVAL-5) - why, what changed, the full 390 px Playwright play with counted and asked decisions, clicks, screens and time against the old build, the screen list, what is PENDING v18, and what to flag; then the owner's Direction C (comic panels) built in (EVAL-6), defect by defect, the season in five chapters and a finale (EVAL-8), and the prototype pass (EVAL-10).
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-4/
  - https://app.plane.so/the-equal-lens/browse/EVAL-5/
  - https://app.plane.so/the-equal-lens/browse/EVAL-6/
  - https://app.plane.so/the-equal-lens/browse/EVAL-8/
  - https://app.plane.so/the-equal-lens/browse/EVAL-10/
---

# Game redesign, 19 Oct 2026 (EVAL-4, rebuilt for 80 decisions in EVAL-5)

Branch `eval-game-redesign` (worktree `../equal-lens-evaluator-game`). Design rules:
[design.md](../design.md) sections 4, 4a and 4b. Run it: [run-and-test](../playbooks/run-and-test.md).
Layout source: the Sex Ed workspace's
`Paper Analysis/Hypotheses/workplace-gender-training-v2/scenario-80-decisions-2026-10-19.md`
(Game 1's low branch, the demo route).

## Prototype pass (EVAL-10, owner decisions of 20 Oct 2026)

Plane: [EVAL-10](https://app.plane.so/the-equal-lens/browse/EVAL-10/) (EVAL-9, an earlier attempt
cut off before it committed anything, is closed as superseded). Design rules:
[design.md](../design.md) sections 4, 4a, 4b, 4d and 6. Inputs: the owner's eight decisions,
the persona copy audit (ten fixes and a glossary), and the owner's review of the live build
(nine binding points). Screenshots at 390 px, with before shots from the live build
(`00-before-*`): the session scratchpad's `build-v5/`.

### What changed

1. **Padding.** Option rows sit in `choice__rows`, half a pitch (14 px) apart in the note
   register, so no frames touch; groups are a full pitch apart; a checked row is a fill with the
   resting border, never a heavier one. `pnpm ux` and `ux:states` fail touching rows, groups
   closer than a pitch, and a heavier checked border.
2. **Shares back to splits** (EVAL-8's one-tap pairs reverted): three colleagues (the tied pair
   and a third with weaker descriptions, as before EVAL-8, so the draws match the pre-EVAL-8
   layout), an empty start, the count left, "Confirm these shares", the saved answer on Back.
   Chapters, saves, the map and the story in the card are kept.
3. **Copy audit, both languages** (446 strings in `story.json`, 52 in `screens.json`, the
   Hinglish of the season's screening and survey items, the message instruction): language first
   with a bilingual heading; "Both, mixed" made real as **"English with Hinglish help"** (English
   on screen, the Hinglish under every question, description, consent point and the message;
   chosen over two full languages, which doubled every screen); "Your result"; the hero explains
   a pair and drops "chance would explain" and "shaded middle"; "Not enough to tell" shows nothing
   of the result below it; the glossary ("description", "message", "chapter", no "rounds"); plain
   Hinglish ("nakhra", "utpeedan", "svabhavik" and the rest gone); plain consent with the
   committees glossed and "Delete my answers"; "Confirm this order" and "Confirm these shares";
   one session length (`sessionMinutes`, 30 minutes now); digits; roster, comp-off, pareshaani;
   "After your last decision:"; descriptions at 17 px; questions in sentence case.
4. **Tags** ("Clear pattern: men first" to "Not enough to tell"), thresholds still in config; the
   **position with range** (`RangeLine`): a dot on a men-first to women-first line with a shaded
   range from `config.season.rating.range` (a Beta posterior interval, 90 per cent, flat prior;
   PENDING v22, which will likely use a posterior model). Nothing pending in player copy.
5. **Share card**: by default the season only; an unticked "Include my result" adds the tag and a
   chance line computed from the reading levels in config ("about 1 in 20 players who go by the
   descriptions get this tag or a clearer one"). Religion and skin tone never.
6. **Profile**: each season as a compact position with range, and "Two results can differ by
   chance; overlapping ranges mean no change shown." The change line now follows that rule
   (seasons saved before EVAL-10 have no counts and keep the old weight rule).
7. **Firm per-chapter flag**, `meta.chapter_timing`: one letter per chapter and the finale, "y"
   when played after the player's own training date, "n" when not (before it, or on the day
   itself); never a date or a time. Set at each chapter's first answer from the device clock; the
   training date stays on the device. Wired through the runner and `Play` for an entry that
   carries the enrolment's training date; the firm route still plays the card game today, so only
   a firm season will carry it.
8. **Scoring rule**: no in-game copy says how answers are read ("a story that reads you",
   "decisions that count", "rating" and "chance" are gone from the picker, opening, chapters,
   consent points and practice); X-20 holds it.

From the owner's live review (binding): device-neutral "Saved in this browser"; the disclosure
and every screen show only the chosen language; one hierarchy (one `h1`, lead, body, muted meta,
one primary, one quiet secondary) with the chapter-end screen rebuilt to it; the ruling made a
faint texture; one thin season bar in the header (the six-stop map moved to the chapter end);
an **opt-in practice round** in place of the up-front instructions ("Practise first" or "Start
the season", one rank, share and pick with the mascots at a picnic, never recorded, `meta.practice`
y or n, `content-check` fails a practice cue); one action pattern (`Actions`, Back as the top nav
link); equal option sizes (checked by `pnpm ux`); ranking cards fit 320 to 1440 px (checked at
eight widths).

**Decision pages as comic pages** (owner, during the pass): panel 1 what happened (the
consequence with the leader's headshot, or the chapter's title panel on its first decision),
panel 2 how it unfolds (a drawn prop beside the scene caption), panel 3 the decision (the
question in a caption box, the equal-size cards, the action), 8 px gutters, captions of 25 words
or fewer. Measured at 390 x 844 over a whole season of 69 decisions: **54 exceed one scroll**
(all 28 rankings, 1,030 to 1,220 px; all 20 splits, 1,070 to 1,310 px; 6 picks, 857 to 930 px);
15 fit (13 picks, 2 ordinary). Before the change 63 exceeded it (rankings to 1,305 px). Before
and after for three consecutive decisions: `build-v5/30-before-decision-6..8` and
`30-after-decision-6..8`.

### Shared rules change (must land before this ships)

The rules piece in this repo (`database.rules.json`) now accepts `meta.chapter_timing` (exactly
six of y or n, season records only) and `meta.practice` (y or n). **The shared ruleset in The
Equal Lens repo's firebase/ must take the same two changes**, with EVAL-8's `meta.sit` and
EVAL-6's `edit` item, or season submits will be refused.

### To flag (EVAL-10)

1. **The range is a planning model.** Beta(1 + women first, 1 + men first), even pairs half each,
   90 per cent; v22 sets the real one. The position is clamped inside its range at the extremes.
2. **"Not enough to tell" now hides the other readings too** (the owner's G5 instruction),
   superseding owner decision 5's "a player with no sex reading still sees the readings they
   have".
3. **Practice uses the season's mascot animals** (by species name, not their mascot names). It
   precedes the 4 mascot baseline cards; a liking formed in practice could touch them. Worth a
   pilot look, or practice could use objects.
4. **Stimulus wording moved**: the copy sweep changed description and question wording (digits,
   "description", "problem", plain Hinglish) on both sides of every matched pair alike; P1 must
   re-rate valence and merit tiers, and the screening and survey Hinglish needs the matched-pair
   equivalence pre-test. The registered note (c) instruction now says "chapters", not "rounds".
5. **Copy register**: "chapter" was kept over the audit's "episode" because the owner's share
   card says "5 chapters".

## Direction C, comic panels (EVAL-6)

The owner played the 80-decision build at 390 px, could not judge it for the look, and chose
Direction C from the review sheet (`ui-directions.html`, 19 Oct 2026). Design rules:
[design.md](../design.md) sections 2, 3, 4, 4a, 4b and the new 4c. Plane:
[EVAL-6](https://app.plane.so/the-equal-lens/browse/EVAL-6/). Screenshots of the full play at
390 and 1440 px (light), 390 px dark and 390 px at 2x: the session scratchpad's `comic-build/`.

### Every defect in the diagnosis, and what fixed it

| # | Defect | Fix |
|---|---|---|
| 1 | A research form with a story pasted on; the episode opener a heading and a button | Every game screen is built from comic panels: a violet halftone `Splash` opens the season, each episode, the reveal and the season's end; the scene sits in a `Panel` with a yellow `Caption` and the question in 30 px display caps; interludes are drawn strips |
| 2 | The cast missing: emoji faces that vary by phone, one haircut for all women, Javed blond, mascots as stock emoji | An SVG portrait system (one geometry, five tones, eight hair and face looks dealt against religion and tone, every hair the same dark brown, one uniform) and eight drawn mascot animals; one-offs from the same system, fixed by id; no attire layer |
| 3 | The reveal has no reveal (a 1,224 px settings list) | The mascot sheet on the opening, then the reveal as a grid of portrait panels with the mascot inset and "Kiwi the bear is Huma." on a yellow plate; four across from 600 px |
| 4 | Hierarchy backwards; admin recap in story position; empty "Your team so far" | The consequence is a small `Then` panel (64 px face, 16 px italic, the recap at 14 px inside it) above a larger scene panel; the collapsed roster is gone from every decision, interlude and episode screen |
| 5 | No game feel: radio rings, a pre-filled violet "0" | Rank stamps on portrait cards with "Clear the stamps"; the split starts with empty dashed stamps and no pressed chip; the episode pips and "Page n of N" in the top bar (progress, never a countdown) |
| 6 | Type with no voice | Big Shoulders Display 800 and Literata 400, 600 and italic, self hosted latin subsets |
| 7 | Game and out of fiction look the same; the demo badge loudest; a green tick by the rating | The plain register: cool grey, ink buttons, 1 px rules, no violet, no panels; the demo note is a quiet outlined chip; the result opens with a plain notice, no tick |
| 8 | Density: empty halves, long scrolls, a survey legend repeated 12 times, a 8,284 px result, the button moving | Strips and splashes fill the short screens; the survey key is one sticky header; the result areas fold (first open), so the 390 px result is about 5,500 px with one area open; on the page-turn screens the action row stays at the foot of the screen; decisions have no button at all (they commit on the tap) |
| 9 | The result has no shape | "38 of 46 equal pairs where you put the man ahead", a dot grid, the band and its sentence, the bar and reasons, then "Your other readings" as a plain list; no colour reads good or bad |
| 10 | "PENDING v18" in player copy; emoji episode art | Every pending marker moved to underscore keys and the dev-only `DevNotes` panel; X-16 and `pnpm ux` fail on any rendered PENDING (the demo disclosure placeholder aside); the season cards use drawn covers (warehouse, newsroom, clinic) |

### Verification (EVAL-6)

- `pnpm check` green: tsc and oxlint; 299 of 299 build checks (design-check with the art tier
  and the no-colour-in-markup rule, X-9 with the stamps, the empty split and every portrait
  branch, X-10 with the strips and drawn covers, X-16 no PENDING in player copy); `pnpm ux` 170
  screens at 412, 320 and 1280 px, light and dark: 0 contrast fails, 0 targets under size, 0
  axe violations, 0 heading or focus fails, keyboard paths for tap-to-order, the split and the
  grid all pass, 87 of 87 component states (each surface's ground unchanged under OS dark), 0 rendered PENDING; `pnpm rules` 43 of 43;
  `pnpm e2e` passes, the season playing to the result on the emulator.
- The whole season played with Playwright at 390 and 1440 px and 390 px at 2x, and at 390 px
  with the OS in dark mode to prove the light pin (`comic-build/v2/`): no page errors, no PENDING on any rendered screen but the demo disclosure placeholder.
  The 390 px result is about 5,500 px with the first area open (8,284 px before).
- Halftone: the face shading and panel corners read as an even tint at 1x and 2x with no moire;
  no text sits on halftone (captions and plates have solid grounds; white on the splash violet
  is 9.6:1, 6.2:1 at a dot's centre).
- The generated-image path was checked in the browser with temporary placeholder WebPs and a
  manifest (removed): images sat inside the ink frame on the tint and halftone, mascots by animal,
  tones by shade. An empty `public/portraits/manifest.json` ships so the lookup never 404s.
- Mascot insets are the SVG mascots (or the manifest's `mascot-{animal}.webp`), never system emoji; `pnpm season` and `pnpm ux` now fail on any pictographic character on a season screen or text inside a portrait. In the 72 px split rows and the 64 px consequence face the inset is 45 per cent wide in the bottom corner, over the uniform, so the animal stays legible without covering the face. The consequence panel shows the story line only; the order recap is gone from player view (Back still reopens the decision). Only the short page-turn screens (episode, interlude) pin their button; the reveal, the opening and the season's end do not, so nothing sits under it at rest.
- An early run of `pnpm ux` found the action row, pinned to the foot of every screen, covering a
  move button on game 2's ranking card (axe target-size); the row is now pinned only on the
  story's page-turn screens (opening, episode, reveal, interlude, season's end).

### To flag (EVAL-6)

1. **The portraits change the stimulus.** Drawn faces make sex and tone cues stronger than the
   old small emoji. P1 should rate the portraits as it rates names, and a pilot should run before
   data. Within a one-off tied pair the two looks differ at random (hairstyle, glasses, facial
   hair from a hash of the id): unrelated to the cue across players, but visible within a pair.
2. **Result order (owner decision).** The owner set the order: the disarming opening first,
   cut to three sentences, then "38 of 46" with the dots and the band, the other readings and
   the folded areas. `story-check` holds the order and the two-to-three-sentence limit.
3. **Hinglish drafts.** The new strings (the hero line and its dots, "Clear the stamps", the strip
   captions split from the old interludes, "Page n / k") are builder drafts for the cognitive
   interviews.
4. **Sentence 3.** The disclosure showed `PENDING owner wording` to players and X-16 let it through
   (it exempted the demo build). Fixed: sentence 3 is the interim line "Attitudes are read; you see
   yours." until the owner writes it, and X-16, `pnpm ux` and `pnpm season` fail on any rendered
   PENDING or owner-wording placeholder, the disclosure included. **Open:** the mid-season notes
   (`content/notes.json`, and the explanation quoting them) still show `[PLACEHOLDER: a sourced
   statistic ...]` to players; they need sourced statistics, which I did not invent.
5. **Old card games retired from the menu (owner request).** The demo landing goes straight
   into the season; panel games 1 and 2 and the firm session open only on the dev server at
   `#/dev`, kept for the checks. A player link to one outside the dev server is refused. One light
   theme: the dark overrides are gone and `color-scheme: light` is set (owner request).
6. **Generated portraits (owner decision during the build).** `Portrait` now shows
   `public/portraits/{slot}-{sex}-{tone}.webp` and `mascot-{animal}.webp` when
   `public/portraits/manifest.json` lists them, on the same comic frame, and draws the SVG
   otherwise. The images have not landed yet; the path was tested with temporary placeholder
   WebPs (removed). One-offs look up `o{slot}-{sex}.webp` (slot 100 and up) the same way.
   For the image agent: the cast slot's look is dealt by place within sex (looks.ts), so an
   image set should keep each slot's look constant across its four tones.
7. **Generated portraits delivered and wired** (19 Oct 2026): every person and mascot on the
   reveal, the cards, the split rows and the consequence panels shows its WebP (no broken image,
   alt as the drawn label, eager above the fold and lazy below, checked in the v2 play); strips
   and the result carry no faces. Sex is now drawn per slot, and one-off focal faces are drawn
   per player. Flags: the generated hair is black or dark brown, not one dark brown; and the
   strong level cannot be reached at the 0.99 quantile with 70 relabellings (smallest p 2/70),
   so v20 needs a quantile the cast can reach or more relabelling power.
8. **Owner decisions O2 and O3** are in: five reading levels with the size shown apart, area
   lean labels only at possible or above, and no per-person caste or birthplace reading.
9. **Out of fiction in the comic family (owner request).** The cool plain register is replaced by
   the note register: same faces and ink, warm ruled paper in a 3 px ink frame, the registered line
   as a "Note" stamp, ink buttons; rule 8 holds by the absence of panels, captions, pictures,
   lilac, violet and the episode bar (design.md section 3). Screenshots: `comic-build/v3/`.
10. **Note register fixes (owner).** Baseline grid at a 28 px pitch with text on its rules (checked
   by `pnpm ux` and by zoomed screenshots at 390 and 1440 px), option states in the note register
   checked once per register, and equal-height season cards. Screenshots: `comic-build/v3/`.
11. **No auto-advance on ranking and split; Back restores (owner).** Research consequence, checked:
    before this, Back deleted the saved answer and the re-answer replaced it, so the scored answer
    was already the final one and no edit was recorded. Scoring is unchanged (the final answer is
    still the one scored); what is new is that Back no longer deletes the answer (it is shown
    again, to edit or confirm) and each re-answer is counted and stored as an item `{ k: 'edit',
    i: <card id>, v: <count> }`. The rules piece in this repo (`database.rules.json`) now accepts
    `k: 'edit'`; **the shared ruleset in The Equal Lens repo's firebase/ must take the same change
    before this ships**, or season submits that carry an edit will be refused. Mascot insets now
    appear on the reveal only. The profile save and stay-in-touch forms are spaced on the pitch
    (`Group`; fields and buttons 56 px, two pitches).
12. **A reload resumes; the prototype says so once (owner, 19 Oct 2026).** The live build broke on
    refresh: the token was spent at the start and the answers lived in memory, so a reload was
    refused as "already used". A season in progress is now kept on the device
    (`src/store/progress.ts`) with its seed, so a reload resumes the same screen, answers and draw;
    `store.resume` reopens a started token without a write, and the link is refused only once the
    session is submitted or withdrawn. The server still sees two writes (AT-4). Research flag: the
    device now holds the season's answers and its withdrawal code in localStorage after play (the
    card games still keep nothing, AT-10); clearing site data removes them. The demo badge and the
    demo notice screen are gone; the landing screen carries one quiet prototype line.
13. **Scannable note screens, lighter frames, quieter copy (owner, 19 Oct 2026).** Consent, the
    content note, the result band and the explanation show short points with the complete text
    under "Read the full details" (nothing cut). Frames are 1.5 px, dividers 1 px, resting shadows
    2 px; the 3 px ink marks only a stamped card. Ranking and allocation questions no longer repeat
    their helper line's action (X-2). The header is sticky and the page count is gone. Research
    flag: the mid-season note's statistic is still an unsourced placeholder. The live build showed
    "[PLACEHOLDER: a sourced statistic ...]" and "Source: [PLACEHOLDER: ...]" to players in both
    languages. Choice (owner's options: hide the line, or a dev-only flag): **hide**. While a note
    is marked `placeholder: true` in `content/notes.json`, the note screen (season and card games)
    renders no statistic and no source line; its title, instruction sentence and Continue keep the
    note's format, and the manipulation still reads by its instruction. A sourced figure needs only
    the content edit and `placeholder: false`. The explanation's quotes of the notes now describe
    the statistic ("A sourced statistic on how many Indian employees ..., with its source.")
    instead of repeating the marker. The source line is one string, so no stray space can split
    "Source:". X-16 now reads every content file (the explanation and the notes included) with a
    pattern that catches "[PLACEHOLDER", any bracketed upper-case or TODO-like marker, PENDING, TBD,
    `{{ }}`; only the statistic and source of a marked placeholder note are exempt in content, and
    every rendered screen is read with the same pattern by `pnpm ux`.
14. **Chapters, story in the card, pairs, the map (EVAL-8, owner approval 20 Oct 2026).**
    Concepts A, B1, C and D from `engagement-concepts.html`. Five chapters and a finale; every count
    and threshold is in `content/config.json` `season.chapters`, PENDING v21, never in player copy.
    Research flags for v21: (a) shares are one-tap pairs with "Share them evenly", stored as units
    (the pool to one, or half each), so the scoring code is unchanged, but the allocation construct
    is now who-gets-it, and the 19 retired third colleagues drop their clear pairs; each retired
    third's one-off slot is still drawn (never shown) so one-off looks and portraits keep their
    numbering; (b) `meta.sit` (sittings, 1 to 6) is new on the submitted record: the rules piece
    here accepts it, and **the shared ruleset in The Equal Lens repo's firebase/ must take the same
    change before this ships**, with the `edit` item from item 11; (c) the save keeps a device-only
    timestamp for its 7-day expiry, never sent; (d) the no-save window from the first survey to
    recall means a reload there replays the first survey and the note; (e) ordinary decisions are
    two, so the season band varies less; (f) the payoff lines and the chapter openings need the same
    valence pre-test as the consequence lines (PO-18, PO-39).
15. **Comic register for a workplace study** may read as less serious (the review sheet's own
   trade-off); worth a line in the P1 interviews.

## The 80-decision rebuild (EVAL-5)

**Counted (80):** 4 mascot cards in week one (one per domain plus a second hiring card); the
screening block's 4 items on one grid; the faking test's 15 (the survey's 4 items on one grid,
the note, 6 form-B cards (promotion 3, conduct 3), the same 4 items again, the recall item);
57 cue-carrying rating cards, 19 per domain (hiring and promotion; complaints and conduct;
resource sharing, 11 allocation and 8 unwanted work), spread over the five episodes (11, 12, 12,
12, 10). **Asked, not counted (16):** the two eligibility items (18 or over; working in India,
before the four sentences), 10 ordinary story decisions, and the wrap's four (the noticing
probe, prior knowledge, origin, replay).

- **Order (candidates v17's act order):** week one's mascot cards, the reveal, the 57 rating
  cards over the five episodes, then out of fiction the screening block, survey 1 and the note,
  then the 6 form-B cards back in the story, survey 2, the recall item, the probe, the season
  result, the wrap items, submit, the rating. The note is drawn 1:1 (b honest retake, c
  faking), as plan v2's low branch.
- **Episodes read as a season:** each opens with a title card, each has one interlude (a short
  scene between card runs: the pickers arrive, the budget lands in red ink, the promotion list
  goes up, sale day), and every decision screen opens with what came of the last one.
- **Consequences are equal in valence** (candidates v17 3.17): every line now differs in
  content, never in success ("the directors ask about costs first" against "about timing
  first"), still keyed by the merit tier of the notes, never by who held them. The roster
  shows the jobs each colleague led, with no outcome word.
- **Cue carriers (PENDING v18, which decides it):** the fixed cast of 8 carries sex, religion
  and skin tone only; caste (a surname read as Scheduled Caste or upper caste) and birthplace
  (born in the south or the north) ride on 44 one-off characters, applicants (6 ranks),
  complainants (4 picks) and vendors (4 splits), each met once, at the medium tone, in tied
  pairs of one sex.
- **The story is drawn, not chosen** (candidates v17 3.17): the season card shows the drawn
  story; the newsroom and the clinic are shown as "after your rating", PENDING v18.
- **Rating on all 57 cards:** sex, religion and tone against the cast's 70 relabellings; caste
  and birthplace against sign flips of the one-off pairs; each domain panel reads sex on its own
  19 cards (thresholds PENDING v18). Seeded players, 200 seasons each (`pnpm check` X-13 runs
  the same models): a strong lean towards men is read in 100 per cent overall and in 96 to 100
  per cent per domain; a mild one in 93 per cent overall and 42 to 48 per cent per domain; a
  notes-only player is read as leaning in 5.5 per cent overall and 2 to 5 per cent per domain,
  and never "not enough to say" in a domain; a player against surnames read as Scheduled Caste
  is read on caste in 100 per cent (a notes-only player in 1 per cent); a content-blind player
  is never read.

### Fresh Playwright totals, 390 x 844 (`BASE=http://localhost:5184/ pnpm season`)

| | Old build (prototype v0) | First redesign (EVAL-4) | **80-decision rebuild (EVAL-5)** |
|---|---|---|---|
| Decisions counted | 202 questions (owner's count) | 50 | **80** |
| Decisions asked | 202 | 64 (50 + 12 statements + 2 wrap) | **96** (80 + 2 eligibility + 10 ordinary + 4 wrap) |
| Clicks to the result | at least 606 (202 x 3) before the Nexts | 122 | **202** |
| Screens to the result | 127 to 163 (game 1) | 71 | **110** |
| Time at 12 to 20 s per decision | | | **16.0 to 26.7 min** counted; **19.2 to 32.0 min** asked |
| Time at the scenario's per-type paces (PENDING v18) | about 30 min | 15.7 | **27.5 min** (the scenario's own estimate: 26.0, without this build's 10 ordinary decisions, episode cards and interludes) |

Clicks by kind: rank 28 x 3 = 84; split 20 x 2 = 40; pick 19; ordinary 10; screening grid 4
and Done; each survey grid 4 and Done; recall 1; probe 1 and Done; episode cards 5;
interludes 5; eligibility 2 and Continue; the rest one each (language 2, code 2).

### Screen list (80-decision rebuild)

| # | Screen | Clicks | Heading |
|---|---|---|---|
| 1 | demo | 1 | Demo mode |
| 2 | eligibility | 3 | Before the season |
| 3 | disclosure | 1 |  |
| 4 | consent | 1 | Before you start |
| 5 | language | 2 | Choose your language |
| 6 | story:pick | 1 | Your season |
| 7 | story:intro | 1 | Your season at Kite Logistics |
| 8 | story:episode | 1 | Episode 1: The hiring sprint |
| 9 | story:beat:rank | 3 | Who should draft the peak plan? (mascot) |
| 10 | story:beat:rank | 3 | Whose account do you rely on most? (mascot) |
| 11 | story:beat:ordinary | 1 | Snacks for the first team call? |
| 12 | story:beat:split | 2 | Share the 6 training days. (mascot) |
| 13 | story:beat:rank | 3 | Who should lead the floor walk? (mascot) |
| 14 | story:reveal | 1 | You visit the warehouse |
| 15 | story:beat:rank | 3 | Who should lead the interview panel? |
| 16 | story:beat:rank | 3 | Who should get the supervisor job? (applicants) |
| 17 | story:beat:split | 2 | Share the 6 course places. |
| 18 | story:beat:rank | 3 | Who should run the temp staff plan? |
| 19 | story:interlude | 1 | The hiring sprint |
| 20 | story:beat:rank | 3 | Who should drive for the peak? (applicants) |
| 21 | story:beat:pick | 1 | Whose complaint do you take up first? (complainants) |
| 22 | story:beat:rank | 3 | Who should lead the supplier deals? |
| 23 | story:beat:ordinary | 1 | What about the Saturday count? |
| 24 | story:beat:rank | 3 | Who should be the returns clerk? (applicants) |
| 25 | story:beat:split | 2 | Share the 6 stock checks. |
| 26 | story:beat:pick | 1 | Whose account do you take first? |
| 27 | story:beat:pick | 1 | Who should own the budget sheet? |
| 28 | story:episode | 1 | Episode 2: The complaint |
| 29 | story:beat:pick | 1 | Whose complaint do you take up first? |
| 30 | story:beat:rank | 3 | Whose account do you rely on most? |
| 31 | story:beat:pick | 1 | Whose concern goes to payroll first? |
| 32 | story:beat:ordinary | 1 | How should concerns be raised? |
| 33 | story:beat:pick | 1 | You have time for one this week. Who do you meet first? |
| 34 | story:beat:rank | 3 | Whose account do you rely on most? |
| 35 | story:interlude | 1 | The complaint |
| 36 | story:beat:rank | 3 | Who should coordinate next year's peak? (applicants) |
| 37 | story:beat:split | 2 | Share the 6 write-ups. |
| 38 | story:beat:rank | 3 | Whose concern goes to the safety meeting first? |
| 39 | story:beat:pick | 1 | Whose complaint do you take up first? (complainants) |
| 40 | story:beat:pick | 1 | Whose packing record do you send to the customer team? |
| 41 | story:beat:split | 2 | Share the 6 sessions. (vendors) |
| 42 | story:beat:rank | 3 | Whose case do you look at first? |
| 43 | story:beat:ordinary | 1 | How do you close the week? |
| 44 | story:episode | 1 | Episode 3: The budget crunch |
| 45 | story:beat:ordinary | 1 | Which box supplier? |
| 46 | story:beat:split | 2 | Share the 6 course days. |
| 47 | story:beat:rank | 3 | Who should handle the truck crisis? |
| 48 | story:beat:split | 2 | Share the 6 trial orders. (vendors) |
| 49 | story:beat:split | 2 | Share the 6 sets of minutes. |
| 50 | story:beat:pick | 1 | Whose account goes in the incident report? |
| 51 | story:beat:split | 2 | Share the 6 visit days. |
| 52 | story:beat:ordinary | 1 | What about the loading dock? |
| 53 | story:beat:split | 2 | Share the 6 on-call days. |
| 54 | story:beat:split | 2 | Share the 6 runs. (vendors) |
| 55 | story:interlude | 1 | The budget crunch |
| 56 | story:beat:rank | 3 | Who should host the audit? |
| 57 | story:beat:split | 2 | Share the 6 hours. |
| 58 | story:beat:rank | 3 | Whose account do you rely on most? |
| 59 | story:beat:split | 2 | Share the 6 mentoring hours. |
| 60 | story:beat:ordinary | 1 | How do you catch up? |
| 61 | story:episode | 1 | Episode 4: The promotion round |
| 62 | story:beat:rank | 3 | Who should present the plan? |
| 63 | story:beat:rank | 3 | Who should be the quality lead? (applicants) |
| 64 | story:interlude | 1 | The promotion round |
| 65 | story:beat:split | 2 | Share the 6 slots. |
| 66 | story:beat:rank | 3 | Whose account of the call do you rely on most? |
| 67 | story:beat:rank | 3 | Who should lead the night shift? |
| 68 | story:beat:split | 2 | Share the 6 lunch days. (vendors) |
| 69 | story:beat:pick | 1 | Whose complaint goes to the agency first? (complainants) |
| 70 | story:beat:rank | 3 | Who should supervise nights? (applicants) |
| 71 | story:beat:ordinary | 1 | How should the shifts work? |
| 72 | story:beat:pick | 1 | You have time for one this week. Who do you meet first? |
| 73 | story:beat:split | 2 | Share the 6 days. |
| 74 | story:beat:rank | 3 | Who should host the visit? |
| 75 | story:beat:pick | 1 | Whose name do you put forward? |
| 76 | story:episode | 1 | Episode 5: The season close |
| 77 | story:beat:rank | 3 | Who should lead the dry run? |
| 78 | story:beat:split | 2 | Share the 6 early shifts. |
| 79 | story:interlude | 1 | The season close |
| 80 | story:beat:rank | 3 | Whose account do you rely on most? |
| 81 | story:beat:split | 2 | Share the 6 hours. |
| 82 | story:beat:rank | 3 | Who should give the sale day briefing? |
| 83 | story:beat:pick | 1 | Whose complaint do you take up first? (complainants) |
| 84 | story:beat:split | 2 | Share the 6 expo day passes. |
| 85 | story:beat:rank | 3 | Whose concern goes first? |
| 86 | story:beat:rank | 3 | Who should present to the board? |
| 87 | story:beat:split | 2 | Share the 6 late shifts. |
| 88 | story:beat:ordinary | 1 | What do you do with it? |
| 89 | story:screening | 5 | A few statements about women and men at work (4 items) |
| 90 | story:fsurvey | 5 | A few statements (4 items) |
| 91 | story:note | 1 | A note before the next part |
| 92 | story:beat:pick | 1 | Who gets the stretch assignment? (form B) |
| 93 | story:beat:pick | 1 | Whose report goes into the safety log first? (form B) |
| 94 | story:beat:pick | 1 | Whose name goes on the shortlist? (form B) |
| 95 | story:beat:ordinary | 1 | When should the team celebrate? |
| 96 | story:beat:pick | 1 | Whose request do you look at first? (form B) |
| 97 | story:beat:pick | 1 | Who should mentor the new hires? (form B) |
| 98 | story:beat:pick | 1 | Whose concern do you take up first? (form B) |
| 99 | story:fsurvey | 5 | The same statements again (4 items) |
| 100 | story:recall | 1 | What did the note before this part say? |
| 101 | story:probe | 2 | Spot the pattern |
| 102 | story:season | 1 | Season over |
| 103 | story:prior | 1 | Before today, had anyone told you how this test reads attitudes? |
| 104 | story:prior | 1 | How did you come to play today? |
| 105 | story:prior | 1 | Have you played this game before? |
| 106 | story:demographics | 1 | About you (optional) |
| 107 | story:debrief | 1 | What this season measured |
| 108 | story:code | 2 | Your withdrawal code |
| 109 | story:submit | 1 | Submit or withdraw |
| 110 | story:result | 0 | Your attitude rating |

## The first redesign (EVAL-4)

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

### Screen list (first redesign, superseded by the 80-decision list above)

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

## Verification (after the 80-decision rebuild)

`pnpm check`: 285 of 285 in `check-all` (X-10 now holds the 80 counted decisions, 19 per
domain, form B, the grids' keying and the cue carriers; X-11 the one-off characters; X-13 the
per-domain and caste and birthplace readings), 43 of 43 rules in the emulator, 13 of 13 e2e (a
whole 80-decision season, a profile and the contact form on the emulator), and `pnpm ux` with
every new screen (eligibility, interludes, the screening and survey grids, the note, recall,
the probe, the wrap items) at six variants: no contrast, target, name, heading, overflow, axe
or focus failure; keyboard paths pass; 87 of 87 component states.

## PENDING v18 (marked in `content/config.json` `season.pendingV18` and underscore keys of `content/story.json`; since EVAL-6 never on screen, only in the dev-only notes panel)

- The layout: cast size (8), episodes (5), the 80 counted decisions and their split (4 + 4 +
  15 + 57, 19 per domain), the faking test's items (screening scr-01, 02, 03, 06; survey sv-01,
  03, 04, 02) and form-B count, the low-branch demo route, the split cap (4), every pace.
- Which characters carry which cue: the cast sex, religion and tone; one-offs caste and
  birthplace.
- The rating: q 0.95, at least 8 decisive pairs overall and per domain, engagement at 0.7 of
  clear pairs, 4000 sign-flip draws above 12 one-off pairs; the area cards (3 pairs, two thirds).
- The change rule between profile seasons (0.5) and the retake gap (none set; a date when set).
- The newsroom and clinic seasons; the longitudinal research consent text; the habits' sources.
- Owner wording: disclosure sentence 3; the season consent (draft).

## To flag (80-decision rebuild)

1. **Length.** 27.5 minutes at the scenario's paces, 19 to 32 minutes at 12 to 20 seconds per
   asked decision: well past the 12-minute target and close to the 30-minute cap at slow paces.
2. **Content written fast.** 34 new beats and every consequence line rewritten to equal valence;
   none is pre-tested (P1 must rate valence and merit tiers), and the Hinglish is a draft.
3. **One-off characters are many (44 per season)** and use the same name pools as the cast, so a
   first name can repeat across people; v18 decides whether caste and birthplace stay on
   one-offs.
4. **Not yet to v17's letter:** running stories are not registered per slot (notes are drawn
   per card), and the week-one merit baseline is not yet used in the reasons.
5. The original list below still applies, except item 4 (caste and birthplace now read) and
   item 5 (power is now as in the rebuild section above).

## To flag (first redesign)

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
