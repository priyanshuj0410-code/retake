---
type: design-system
title: Equal Lens Evaluator design system
description: The tokens, surfaces, components and interaction patterns of the evaluator prototype. Every UI choice in src/ comes from here, and scripts/design-check.ts holds the code to it.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-1/
  - https://app.plane.so/the-equal-lens/browse/EVAL-2/
  - https://app.plane.so/the-equal-lens/browse/EVAL-3/
  - https://app.plane.so/the-equal-lens/browse/EVAL-4/
  - https://app.plane.so/the-equal-lens/browse/EVAL-5/
  - https://app.plane.so/the-equal-lens/browse/EVAL-6/
  - https://app.plane.so/the-equal-lens/browse/EVAL-7/
  - https://app.plane.so/the-equal-lens/browse/EVAL-8/
---

# Equal Lens Evaluator design system

The evaluator is a research instrument dressed as a short game. Players use their own phones,
often old Android phones on slow connections, so the system is **mobile first, light, and
plain**. It takes The Equal Lens brand (the `equal-lens` canon: Poppins for display, Nunito
Sans for body, core violet `#553286`, ink `#221436`, paper `#FBF9FF`) in its **minimal
register**: the content is the hero, violet only where it orders the page, no mascot. Lensy
does not appear: the instrument must not carry a voice that could read as telling players
what is right. (The season story's week-one animal mascots are the colleagues themselves, not a
brand mascot; see section 4b.)

Since EVAL-6 (19 Oct 2026, the owner's Direction C) the system has **two registers that never
mix**. The **game register** is an editorial comic: ink-ruled panels on white paper with a lilac
tint, yellow narration captions, violet rank stamps, halftone-shaded portraits, Big Shoulders
Display for display and Literata for the story (section 4c). The **plain register** (out of
fiction) is cool grey and ink in Nunito Sans and Poppins, with no panels, captions, stamps or
violet. **One light theme, on purpose:** both registers were designed as a single light look,
so `color-scheme: light` is set and there are no dark overrides; the OS dark setting changes
nothing (`pnpm ux` checks each surface's ground is the same under dark). The demo landing goes
straight into the season story; the old card games (panel games 1 and 2, the firm session and
its enrolment) open only on the Vite dev server in demo mode, from the developer menu at
`#/dev`, which no player-facing page links to (`devRoutes`), and are kept for the checks.

## 1. Rules the code is held to

`pnpm check` runs `scripts/design-check.ts`, which fails when:

- a raw colour, size or duration appears in any stylesheet but `src/styles/tokens.css`;
- a stylesheet reads a primitive token (only semantic and component tokens are read);
- a token is read that does not exist, or one exists that nothing reads;
- a screen (`src/screens/`) writes a `className` or a `style`: screens compose `src/ui` only;
- a class used in `src/ui` is defined by no stylesheet, or one defined is never used;
- a component exported from `src/ui` is missing from section 4 of this file;
- an art token (the pictures' raw colours, `@tier art`, section 4c) is read by any stylesheet
  but `portrait.css` and `panelart.css`, or the art tier holds anything but a colour (EVAL-6);
- a component or screen (`src/ui/*.tsx`, `src/screens/*.tsx`) writes a colour: the SVG
  pictures fill from art classes, never from hex in the markup (EVAL-6).

`pnpm check` runs X-16 (`scripts/pending-check.ts`, EVAL-6): no content string a player can see
holds a placeholder (`scripts/lib/placeholder.ts`: PENDING, PLACEHOLDER, TODO, TBD, FIXME,
"owner wording", `{{ }}`, `[[ ]]`; markers live in underscore keys such as `_pending`, and an
unsourced note statistic is a record marked `placeholder: true` that the note screens never
render), no string or JSX text in `src/` holds one, the dev-only `DevNotes` panel renders nothing
outside the Vite dev server, and the season disclosure's sentence 3 is the interim line held in
`src/engine/config.ts` (`seasonSentence3`, commented as awaiting the owner's wording). `pnpm ux`
and `pnpm season` read every rendered screen with the same pattern, leaving out only `[data-dev]`.

`pnpm check` also runs `pnpm ux` (`scripts/ux-audit.ts`, from the audit in
[reviews/ux-audit-2026-10-19.md](reviews/ux-audit-2026-10-19.md)), which plays every screen
type of both panel games, the firm session and the season story (its result and profile pages too) and fails on any of: text below AA contrast
against its real background, a target under 44 px on phones or 24 px on desktop, a control
without a name, a heading skip, a screen without one `h1` or its own document title, sideways
scroll at 320 px, a ranking or allocation card without a live region, text under 12 px, any
axe-core violation, focus not on the new screen's heading, or a ranking or allocation card
that cannot be finished by keyboard with focus kept. After the audit, `pnpm ux` runs the
component states pass (`scripts/ux-states.ts`, `pnpm ux:states` alone), which checks every
state in section 4a in the browser, and `pnpm check` runs X-9 (`scripts/component-states-check.ts`),
which renders each component in each state and checks the markup that carries it.

## 2. Tokens

Primitives (in `tokens.css` only):

| Token | Value | Use |
|---|---|---|
| `--violet` | `#553286` | Core brand. Headings, primary buttons, focus |
| `--violet-deep` | `#42266B` | Pressed primary |
| `--ink` | `#221436` | Text at full contrast (15.9:1 on paper) |
| `--body` | `#574B70` | Running text (7.6:1 on paper) |
| `--soft` | `#6B5A8C` | Secondary text (5.6:1 on paper; darker than the canon's `#7F65A4`, which is 4.3:1 and fails AA for small text) |
| `--paper` | `#FBF9FF` | Game page background |
| `--mist` | `#E7E0F1` | Rules, dividers |
| `--line` | `#E7DEF4` | Card borders |
| `--tint` | `#F4F0FA` | Character card fill |
| `--teal-deep` | `#0F6E56` | "All shared" state |
| `--coral-deep` | `#C2553F` | Errors and refusals |
| `--grey-*` | neutral greys | The Committee Inbox's sober surface |
| `--comic-paper`, `--comic-ink` | `#FFFFFF`, `#121212` | Game register: the page and every panel rule (18.7:1) |
| `--comic-soft` | `#3D3846` | Game register: secondary text (11.4:1 on paper) |
| `--comic-tint` | `#EFE8F8` | Game register: the panel fill |
| `--comic-caption` | `#FFE27A` | Game register: narration captions and cast name plates, always with ink text (14.6:1) |
| `--comic-rule` | `#8F879C` | Game register: inactive rules |
| `--note-paper`, `--note-hero`, `--note-soft`, `--note-rule`, `--note-lines` | `#FBF6EC`, `#F2EADB`, `#544B3E`, `#CDBFA6`, rule lines `#EFE6D4` every 32 px | Note register (out of fiction): paper (ink 17.4:1), the result hero band (ink 15.7:1), secondary text (7.9:1 on paper, 7.2:1 on the band), rules and the tan button shadow, the faint ruled texture |
| `--note-line` | `#8A7D66` | Note register: a control's resting edge (fields, radios, checkboxes, survey points), 3.7:1 on paper (WCAG 1.4.11) |
| `--grey-500` | `#7A7874` | Sober surface: control edges and ink lines, 4.0:1 on its grey |
| `--shadow-ink-2`, `--shadow-violet` (and small) | offset shadows, no blur: resting panels and captions 2 px ink, the chosen card 5 px violet, the primary button 4 px violet | Game register |
| `--bw-1`, `--bw-1-5`, `--bw-3` | 1, 1.5, 3 px | Ink weights, read through `--ink-divider`, `--ink-frame`, `--ink-heavy` (below) |

**Visual weight (owner, 19 Oct 2026).** Frames recede so faces, names and the question read first.
`--ink-frame` (1.5 px) is every card, panel, page frame and control edge (`--edge` and the note
register's `--frame` point at it); `--ink-divider` (1 px) is every inner divider (the colleague's
name rule, the season card's art column, the caption's rule, a fold's top rule, the episode pips);
`--ink-heavy` (3 px) is read only by a selected or stamped state (a stamped ranking card), and the
filled primary button is the other heavy mark. Resting offset shadows are 2 px. Control
boundaries and focus rings keep 3:1 on every surface. `pnpm check` (X-4) holds all three: frames
at most 2 px, the heavy weight only on a selected state, and 3:1 boundaries.

Type: Poppins 500/600/700 (`--face-display`) for headings, labels, buttons and numbers;
Nunito Sans 400/600/700 (`--face-body`) for text. The game register re-points `--font-display`
to **Big Shoulders Display 800** (`--face-comic-display`, upper case through `--case-display`,
30 px questions, 38 px splash titles) and `--font-body` to **Literata 400, 600 and 400 italic**
(`--face-comic-text`, 17 px; italic for narration in splashes and the "then" panel). All four
families are self hosted latin subsets (`public/fonts/`, OFL, from the Fontsource packages),
`font-display: swap`, so no third party is fetched at run time. Both self hosted, latin subsets, OFL, so no
third party is contacted. Hindi is not set in Devanagari in this prototype: the second language
is Hinglish in Latin script. The scale is 14, 16, 18, 20, 24, 28 px; body is 18 px on phones
(older phones, older eyes) and 17 px from 600 px up.

Space is a 4 then 8 px grid (`--s-1` to `--s-7`). Radii 8, 12, 16. Every touch target is at
least 48 by 48 px (`--target`).

Motion: one duration (`--motion`, 160 ms) for every state change, and two scales:
`--press` (0.98, a pressed control) and `--lifted` (1.02, a card being dragged), with the
`--lift` shadow. Under `prefers-reduced-motion` the duration is 0 and both scales are 1, so
nothing moves, scales or slides. The reorder slide (FLIP) reads `--motion` at run time, so it
follows the same rule. **Nothing in the product counts down, pulses, loops or times out.** No
timer exists anywhere (the exam rule; `scripts/no-timers.ts`), and no key handler: Enter on
the code field submits a native one-field form.

| Token | Value | Use |
|---|---|---|
| `--scale-98`, `--scale-100`, `--scale-102` | 0.98, 1, 1.02 | Primitives for the two scales |
| `--press` | `--scale-98` (1 reduced) | Buttons, option rows, move buttons, steppers while pressed |
| `--lifted` | `--scale-102` (1 reduced) | The ranking card being dragged |

Forced colours (`forced-colors: active`): `--c-rule` becomes `GrayText` and `--c-focus`
becomes `Highlight` on every surface. Inactive controls therefore read as inactive, the focus
ring stays, and a checked option row gets a `Highlight` outline. Transparent borders on the
demo strip, and the heavier left edge on notices, keep their shapes. The emoji figure keeps
its own colours (`forced-color-adjust: none`), since the skin tone is the cue.

There is no dark mode (EVAL-6, a deliberate single light theme); every semantic token is
re-pointed by surface only, none is overridden in a component. The surfaces re-point type and shape too (EVAL-6): on the
game `--radius-card`, `--radius-m` and `--radius-s` are 0 (square panels), `--edge` is 1.5 px
(`--ink-frame`), `--shadow-panel` and `--shadow-caption` are 2 px ink offsets, `--shadow-chosen`
and `--shadow-action` violet offsets, `--c-action` (the primary button) is ink with a violet shadow; out of fiction
`--edge` is 1 px, every shadow is none, and `--c-accent`, `--c-action` and the reading levels
are ink, never violet.

## 3. Surfaces: three registers that never mix

The design's own rule 8 is that out-of-fiction screens look different from the game. That is
the whole structure of the visual system:

| Surface | Where | Look |
|---|---|---|
| **Game** (`surface="game"`) | First week, your season, rounds after the note, ordinary decisions, the season result; in the season story: the picker, the opening, every decision, the reveal, the interludes, the season's end | The comic register (section 4c): white paper, ink-ruled square panels, yellow captions, violet stamps, Big Shoulders Display and Literata; the top bar carries the episode in words, its pips and "Page n of N" (progress, never a countdown) |
| **Out of fiction** (`surface="oof"`) | Disclosure, consent, screening block, survey, Off the Record, mid-season note, recall, direct block, the wrap's questions, debrief, code, withdrawal, explanation; in the season story: the statements grid, the wrap, the attitude-rating result and the profile | The note register: warm off-white paper (`#FBF6EC`) with faint rule lines, the content inside a 3 px ink frame, Big Shoulders Display headings and Literata text in ink, square ink buttons with a tan offset shadow. The registered line "This part is not part of the game." is the first thing on the screen, as its exact text, set as a tilted ink stamp with a silent "Note ·" prefix. No portraits, yellow captions, halftone art, lilac panels or violet. The disclosure keeps no heading and no stamp |
| **Sober** (`surface="sober"`) | The Committee Inbox and its content note | Neutral grey ground, no violet, no illustration, no points, the Internal Committee route stated on every card |

The disclosure screen is out of fiction but shows **only** the four registered sentences and
the Continue button. There is no demo badge and no demo notice screen (owner, 19 Oct 2026): the
shareable build says it is a prototype once, on the landing screen only (the season's
eligibility items, the first screen a visitor sees), as a quiet `page__footnote` line in the note
register: "Prototype. Fictional people and stories; your answers stay in this browser." Every
mid-season note uses one identical layout: statistic, source line, instruction sentence; while
the statistic is an unsourced placeholder the note shows its instruction only.

**Short points first, full text one tap away (owner, 19 Oct 2026).** No note-register screen
shows a block of more than about 60 words. Consent is a heading, five one-line points (what you
do, how long, stop any time, no name, what you get at the end) and the agree action, with the
decline as a quiet button; the complete consent text, unchanged, sits under "Read the full
details" (`Details`). The content note before the Committee Inbox is four points with the full
note and the Internal Committee route in `Details`; the result band shows its first sentence with
the rest in `Details`; the opened explanation is one `Fold` per section, all closed, so it scans
as a list of headings.

**The note register's baseline grid.** One pitch, 28 px (`--pitch-28`): running text and lists
take it as their line-height and draw the ruling behind themselves (`--ruling`, a rule 23 px down
each pitch, 2 px under the 17 px Literata baseline measured at 21 px), so every line of text sits
just above its rule at any width; the page's flow gap is one pitch and list items have no gap, so
the ruling runs on through a list. Headings, the stamp, buttons, cards, the survey grid and the
result band are framed or solid and break the ruling cleanly, and the text after them takes up
its own ruling again; no text straddles a rule. `pnpm ux` fails if a ruled block on an
out-of-fiction screen is not a whole number of pitches tall.

**Option states, both registers.** Radios and checkboxes (`Choice`, `Checks`), the survey points
(`AgreeGrid`) and the code field rest on `--c-option-rest` (tan in the note register, ink in the
game); hover (pointer only) takes the accent (ink in the note register, violet in the game);
focus-visible is a 3 px ring in `--c-focus` (17.4:1 on note paper); pressed is the `--press`
scale; checked is the filled native mark, the accent edge and the `--c-raised` tint; checked and
focused keep both. `pnpm ux` checks each, once per register.

**How rule 8 holds between two registers of one family.** Story and note share faces, ink and
square shapes, so they read as one product; they differ on every cue that says "you are in the
game": the game is white paper with lilac panels, yellow captions, violet stamps, portraits and
the episode bar; the note is warm ruled paper inside one ink frame with the "Note" stamp, no
panels, no captions, no pictures, no violet and no episode bar. The result keeps its number-first
layout in the note register, its readings in ink only (both poles alike, no green or red).

## 4. Components (`src/ui`)

| Component | Source | What it is |
|---|---|---|
| `Page` | `src/ui/Page.tsx` | One screen: on story screens a sticky `<header>` landmark (`position: sticky`, `top: 0`, solid paper, the ink rule under it; the chapter label and the `SeasonMap`; no page count, owner 19 Oct 2026); its measured height is `--head-h`, and every focusable element and heading in `<main>` has `scroll-margin-top` of that height, so focus never lands under it. Nothing in the header is interactive. `<main>` with the out-of-fiction line, the `h1`, body and one action row; with `pin` (the story's short page-turn screens only: episode and interlude) the row stays at the foot of the screen, with `scroll-padding-bottom` so focus is never under it. On arrival focus moves to the `h1` and the document title becomes "`h1` · Team season". Long titles wrap |
| `Button` | `src/ui/Button.tsx` | `primary` (violet fill), `secondary` (violet outline), `quiet` (text). 48 px tall, full width on phones. Hover on pointer devices, `--press` while pressed, disabled for every kind |
| `Text` | `src/ui/Text.tsx` | Paragraph, `lead`, `small`, `muted`, `strong`; long words break |
| `Heading` | `src/ui/Text.tsx` | A section heading inside a page (explanation sections, demo tables); `level={3}` for a sub-heading inside a section (the result page's areas) |
| `Link` | `src/ui/Link.tsx` | A text link with a 48 px target (the calendar file, demo links); thin offset underline that thickens on hover, pressed colour |
| `List` | `src/ui/List.tsx` | A plain bulleted list of text points (consent, tutorial, debrief); muted markers; empty renders nothing |
| `Character` | `src/ui/Character.tsx` | One colleague: emoji figure (or species), name, cue lines (surname is part of the name; "Born in"; badge), description. Text column shrinks and wraps at 320 px |
| `SortList` | `src/ui/SortList.tsx` | Drag-to-sort list of `Character`s with up and down buttons on every row. The dragged card lifts and settles; displaced rows slide (FLIP); a button at a limit is `aria-disabled` and says the position again |
| `Allocate` | `src/ui/Allocate.tsx` | Share a fixed pool between `Character`s with minus and plus steppers and a remaining count. A stepper at its limit is `aria-disabled` and says the remaining line again; "All shared" arrives with a tick |
| `Choice` | `src/ui/Choice.tsx` | Single choice as full-width radio rows (scales, vignettes, menus). `heading` puts the question in the screen's `h1`, inside the legend, on screens whose question is the page. The checked row carries `choice__option--checked` (no `:has()`) |
| `Checks` | `src/ui/Choice.tsx` | Any-number choice as full-width checkbox rows (the noticing probe, the code saved box); takes `heading` too |
| `Statement` | `src/ui/Statement.tsx` | A crosswise pair: statement A and statement B in two labelled boxes |
| `Code` | `src/ui/Code.tsx` | The withdrawal code in large monospace groups of four; one tap selects it all; with `copy`, a copy button and a status line |
| `Field` | `src/ui/Field.tsx` | A labelled text input (code entry) in a one-field form: Enter submits; `invalid` and `errorId` set `aria-invalid` and `aria-describedby`; `type="email"` for the optional stay-in-touch form (no upper-casing) |
| `Notice` | `src/ui/Notice.tsx` | A boxed message: `info`, `error` (`role=alert`, "!"), `ok` (`role=status`, a tick); takes an `id` for a field's description |
| `Table` | `src/ui/Table.tsx` | The demo results table in a named, focusable scroll region, with suppressed cells marked and an `empty` line |
| `Portrait` | `src/ui/Portrait.tsx` | A face (section 4c): the generated WebP headshot when `public/portraits/manifest.json` lists it (cast by slot, sex and tone, one-offs by `o{slot}-{sex}`, mascots by animal), on the panel's tint and halftone backdrop, with `width`/`height`, lazy loading except `eager` faces above the fold; otherwise the drawn SVG person or mascot animal (`look`), `role="img"` with an accurate `aria-label` ("woman, darker skin tone, glasses", "panda"), sizes `panel` (fills its card), `row` (72 px) and `then` (64 px); with `inset`, the mascot in the bottom corner, used on the reveal only, as the bridge: before it mascots only, after it faces only |
| `Colleague` | `src/ui/Colleague.tsx` | A season colleague: `Portrait` panel on top (`cell`) or a 72 px face beside the words (`row`), name in display caps, cue lines ("Born in"), this job's notes. All spans, so it can sit inside a button |
| `Beat` | `src/ui/Beat.tsx` | The top of a story screen: the last decision's consequence as a small `Then` panel, then the scene as a `Panel` with its narration in a `Caption` and the question as the display `h1`, which names the rest with `aria-describedby` |
| `TapOrder` | `src/ui/TapOrder.tsx` | Tap-to-order ranking as portrait panels, two across on phones and four from 600 px: tapped cards are stamped 1st, 2nd, 3rd (`Stamp`) with a violet offset shadow; the last fills itself. Nothing advances on its own: "Lock in this order" confirms (owner, 19 Oct 2026). Tap a stamped card to take it back; "Clear the stamps" lifts them all; Back reopens it with the saved order stamped (`initial`); every tap announced politely |
| `PickOne` | `src/ui/PickOne.tsx` | One colleague of two (the conduct picks): portrait panels side by side, a whole-card button that commits on the tap |
| `Options` | `src/ui/Options.tsx` | A single choice (ordinary decisions, the wrap's yes or no) as full-width buttons that commit on the tap; never radios that auto-advance, because arrow keys would answer |
| `QuickSplit` | `src/ui/QuickSplit.tsx` | Share a pool by tapping one number (0 to the cap) per colleague. Nothing starts chosen: each row's `Stamp` is an empty dashed ring and no chip is pressed until a tap; the stamp then shows the number. `aria-pressed` chips, too-large numbers `aria-disabled`, the count left live. Nothing advances on its own: once all is shared "Lock in this split" confirms; "Start again" clears; Back reopens it with the saved split exactly (`initial`) |
| `AgreeGrid` | `src/ui/AgreeGrid.tsx` | Agree or disagree statements on one screen: one fieldset per statement, five native radios in a row numbered 1 to 5 with full spoken names ("1, Strongly disagree"); the key once, in a sticky header that stays at the top while the statements scroll, never repeated per row; fits 320 px at 44 px targets |
| `StoryPick` | `src/ui/StoryPick.tsx` | The season picker: one card per story in a grid of equal rows (`--rows-equal`, every card as tall as the tallest at each width), a fixed-width art column with the drawn `PanelArt` cover centred, title and premise top-aligned, and the "After your rating." line pinned to the foot so the lines sit level; stories not open are `aria-disabled` (no emoji, no PENDING) |
| `Spectrum` | `src/ui/Spectrum.tsx` | The strength bar: where the decisions sit between two groups, the middle the season cannot tell from chance as a white band with dashed edges, an ink marker; one image with a spoken label and the same numbers in words under it |
| `ReadingList` | `src/ui/ReadingList.tsx` | Readings as a plain list, label then level, every level in the same ink and weight ("Leans towards men" looks exactly like "No lean read"); only "Not enough to say" is quieter. No colour reads as good or bad |
| `ResultHero` | `src/ui/ResultHero.tsx` | The top of the result: one number to remember ("38 of 46 equal pairs where you put the man ahead"), the same pairs as a dot grid (`role="img"`, filled: the man ahead, ring: the woman ahead, dashed: neither), the band and its sentence, then the bar and reasons as children; ink on grey only. Without a sex reading it shows the band line alone |
| `Fold` | `src/ui/Fold.tsx` | A section that folds: native `details` with the `h2` in the summary and a drawn marker; the result's areas, the first open; the opened explanation's sections, all closed |
| `UpdateReady` | `src/ui/UpdateReady.tsx` | "Update ready. Your season is kept." with an Update button, a fixed bar at the foot of the screen on paper with the ink rule above it (`role="status"`), shown when a new version of the installed app is waiting (EVAL-7); it never reloads on its own |
| `SeasonMap` | `src/ui/SeasonMap.tsx` | The season map in the sticky header (EVAL-8, concept D), in place of a page count: six stops on one line (chapters 1 to 5 as numbered rounds, the finale square), done filled ink, the current one violet, the rest outlined at `--ink-frame`; and dots for the current chapter's cards only (8 px, `--ink-divider`, violet when done), so progress resets each chapter. One `role="img"` with a spoken label ("Chapter 2 of 5, The complaint: 4 of 11 cards done"). No countdown, no motion; nothing in it is interactive |
| `PairShare` | `src/ui/PairShare.tsx` | A share as a one-tap pair (EVAL-8, concept B1): two colleague panels side by side (`tapcard`) and a full-width "Share them evenly" option under them; one tap chooses (`aria-pressed`, the stamped weight: `--ink-heavy` and the chosen shadow), "Lock in this choice" confirms; nothing advances on its own; Back reopens it with the saved choice. Stored as units (the whole pool to one, or half each), so scoring and records are unchanged |
| `Details` | `src/ui/Details.tsx` | "Read the full details": a native `details`, closed, with a quiet display-face summary (a `--control` target, 56 px on the note pitch) and the complete text behind a screen's short points (consent, the content note, the result band). Nothing is cut; Enter or Space toggles it |
| `DevNotes` | `src/ui/DevNotes.tsx` | Pending markers for the research team, folded, `data-dev`, rendered only by the Vite dev server (`import.meta.env.DEV`); never player copy |
| `PointCard` | `src/ui/PointCard.tsx` | One finding in a decision area: the pattern's name, the counts, and for a blind spot the player's own decisive pairs as a list (never a made-up inner voice) |
| `ShareCard` | `src/ui/ShareCard.tsx` | The summary card, worded for every band, with Share (the device's share sheet, else copy) and a status line |
| `Timeline` | `src/ui/Timeline.tsx` | The profile's past seasons: a vertical line of dated entries, one band each |
| `Group` | `src/ui/Group.tsx` | A named section whose parts (heading, text, each label with its field, the button, a notice) are spaced on the flow, one rule pitch in the note register, so nothing touches and fields and buttons keep the baseline grid |
| `Panel` | `src/ui/Comic.tsx` | Game register: an ink-ruled square box, tinted or paper; holds a scene and its question |
| `Caption` | `src/ui/Comic.tsx` | Game register: a yellow narration box with a 1.5 px ink border and a 2 px offset shadow; ink text on yellow at 14.6:1 |
| `Stamp` | `src/ui/Comic.tsx` | Game register: a 52 px round violet stamp tilted 8 degrees (a rank, a share); empty it is a dashed ring with nothing in it. `aria-hidden`: the button's name says the state |
| `Splash` | `src/ui/Comic.tsx` | Game register: the violet halftone panel that opens a season, an episode, the reveal and the season's end, with the screen's `h1` in 38 px display caps and an italic line |
| `Then` | `src/ui/Comic.tsx` | Game register: what came of the last decision, a small paper panel with the 64 px face of whoever led it and the story line in 16 px italic only (no recap of the answer; Back reopens it); always smaller than the new scene |
| `Strip` | `src/ui/Comic.tsx` | Game register: an interlude as two or three panels, the first full width, each a yellow caption over a drawn scene (`PanelArt`); a named group |
| `CastGrid` | `src/ui/Comic.tsx` | Game register: the cast as portrait panels over yellow name plates; `sheet` (four across, the week-one mascots) and `reveal` (two across on phones, four from 600 px: the reveal with the mascot inset and "Kiwi the bear is Huma.", the season's end with the jobs led) |
| `PanelArt` | `src/ui/PanelArt.tsx` | Game register: the drawn scenes (crowd, table, crates, letters, chat, note, ledger, coffee, glance, board, backs, truck, dashboard; the season covers warehouse, newsroom, clinic), light inline SVG, decorative, no faces |

## 4a. States of every component

"Yes" is a state the component has and `pnpm ux` or X-9 checks; "n/a" does not apply. Every
interactive state is also present on all three surfaces (the tokens re-point;
no component knows its surface). Full before and after matrices:
[reviews/component-states-2026-10-19.md](reviews/component-states-2026-10-19.md).

| Component | Hover | Focus | Pressed | Checked | Disabled or limit | Error | Done | Drag | Long text at 320 | Forced colours | Reduced motion |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Button | Yes (pointer) | Ring | `--press` | n/a | `disabled`, all kinds | n/a | n/a | n/a | Wraps | Ring, GrayText disabled | No scale |
| Choice | Border | Ring on the radio, row border | `--press` | Class, 160 ms | n/a | n/a | n/a | n/a | Wraps | Highlight outline | No scale, no transition |
| Checks | Border | Ring on the box | `--press` | Class, 160 ms | n/a | n/a | n/a | n/a | Wraps | Highlight outline | As Choice |
| SortList | Move buttons | Ring | `--press` | n/a | `aria-disabled`, says position | n/a | n/a | Lift, slide, settle | Wraps | GrayText at a limit | No lift, no slide |
| Allocate | Steppers | Ring | `--press` | n/a | `aria-disabled`, says remaining | n/a | Tick, ok colour | n/a | Wraps | GrayText at a limit | No scale, no fade |
| Character | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | Wraps | Figure keeps colour | n/a |
| Statement | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | Wraps | Borders kept | n/a |
| Field | Border | Ring and accent border | n/a | n/a | n/a | `aria-invalid`, described, cleared on edit | n/a | n/a | Wraps | Ring; dashed when invalid | No fade |
| Code | n/a | Copy button ring | Copy button | n/a | n/a | n/a | "Copied" line | n/a | Wraps | Border kept | n/a |
| Notice | n/a | n/a | n/a | n/a | n/a | "!" and edge | Tick and edge | n/a | Wraps | Edge kept | n/a |
| Details | Underline | Ring | n/a | Open (marker turns) | n/a | n/a | n/a | n/a | Wraps | Ring | n/a |
| Link | Thicker underline | Ring | Pressed colour | n/a | n/a | n/a | n/a | n/a | Wraps | Ring | No fade |
| List | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | Wraps; empty renders nothing | System colours | n/a |
| Text, Heading | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | Long words break | System colours | n/a |
| Table | n/a | Region ring | n/a | n/a | n/a | n/a | n/a | n/a | Scrolls in its region; empty line | System colours | n/a |
| Page | n/a | Heading on arrival | n/a | n/a | n/a | n/a | n/a | n/a | Title wraps | Hairline kept | Instant scroll |
| Portrait, Colleague | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | Wraps under the panel or beside a 72 px face | Picture keeps its colours (`forced-color-adjust: none`) | n/a |
| TapOrder | 2 px ink offset | Ring on the card | `--press` | Rank `Stamp`, 3 px ink edge (`--ink-heavy`) and violet offset shadow, `aria-pressed` | n/a | n/a | "Lock in this order" once all are stamped; never on the last tap | n/a | Wraps | Highlight outline on stamped | No scale |
| PickOne, Options | Border | Ring | `--press` | n/a | n/a | n/a | Commits on the tap | n/a | Wraps | Ring | No scale |
| QuickSplit | n/a | Ring on a chip | `--press` | Filled chip, `aria-pressed`, the row's stamp shows the number; empty ring and no pressed chip before a tap | `aria-disabled` past what is left (dashed) | n/a | Commits when all is shared | n/a | Chips fit 320 at 44 px | Highlight outline on chosen | No scale |
| AgreeGrid | Border | Ring on the point | n/a | Filled point (ink) | n/a | n/a | n/a | n/a | Five points fit 320 at 44 px; the key stays at the top | Highlight outline on chosen | No transition |
| StoryPick | Violet offset shadow | Ring | `--press` | n/a | `aria-disabled` (not open), tinted, no shadow | n/a | n/a | n/a | Wraps | Ring | No scale |
| Timeline, ReadingList, ResultHero, PointCard, Spectrum, Beat, Panel, Caption, Splash, Then, Strip, CastGrid, PanelArt | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | Wraps; the cast grid drops to two columns | Borders kept; pictures and the bar keep colour | n/a |
| Fold, DevNotes | n/a | `summary` ring | n/a | Open marker ▾ | n/a | n/a | n/a | n/a | Wraps | Ring | n/a |
| Stamp | n/a | n/a | n/a | Filled and tilted | Empty: dashed ring, upright | n/a | n/a | n/a | n/a | Border kept | n/a |
| ShareCard | n/a | Button ring | Button | n/a | n/a | "cannot share" status | "Copied" status | n/a | Wraps | Border kept | n/a |

**No state judges an answer.** Checked rows, a placed card and "All shared" confirm that an
action happened; nothing is marked right, wrong, good or fair, nothing celebrates, and the
tick on "All shared" and on done notices confirms completion of an action only.

## 4b. The season story (EVAL-4, the game redesign)

The season story is a fourth deployment (`season`, `src/story/`, `content/story.json`): one team
season in five episodes, each opened by a title card and broken once by an interlude (a short
scene with one Continue), on the owner's 80-decision layout (EVAL-5, Game 1's low branch, all
counts PENDING v18): 4 mascot cards, 57 rating cards (19 per domain), then out of fiction the
screening grid, the survey grid and the note, 6 form-B cards back in the story, the survey grid
again and the recall item; about 26 minutes. The tool draws the story (candidates v17 3.17); the
season card shows it with the newsroom and the clinic as "After your rating." (their pending
marker is a `_pending` note in the content, never on screen).
Applicants, complainants and vendors are one-off characters with the same `Colleague` card,
drawn by the same portrait system at the medium tone with a look fixed by their id (section 4c),
and no mascot inset; they carry caste and birthplace, the fixed cast sex, religion and tone. Agree
or disagree blocks (screening, survey) are `AgreeGrid` screens; the recall and wrap items are
`Options`; the noticing probe is `Checks` with one Done. Consequence lines are equal in
valence, and the season's end lists the jobs each colleague led, with no outcome word. Its rules:

- **One decision per screen.** Picks and ordinary decisions commit on their tap (`PickOne`,
  `Options`); a ranking and a share wait for the player's "Lock in this order" or "Lock in this
  choice" and never advance on their own (owner, 19 Oct 2026). A share is a one-tap pair
  (`PairShare`, EVAL-8): one tap chooses a colleague or "Share them evenly", the lock-in tap
  confirms, so the no-auto-advance rule holds for pairs as for rankings. The next screen opens with its
  consequence (`Beat`), and a quiet "Back: change my last decision" reopens the last decision
  with its saved answer on screen. The answer given last is the one scored; each re-answer after
  Back is counted and stored with the play as an `edit` item. Nothing counts down; no auto-advance waits.
  The consequence is a small `Then` panel above the new scene and always smaller than it, the
  story line only: no admin recap of the answer. No roster sits under a decision (EVAL-6 removed the
  collapsed "Your team so far" heading that read as broken).
- **A fixed cast.** Eight colleagues for the whole season, drawn portraits (`Portrait`, never
  under 64 px on phones). In the first decisions each is a different animal mascot with a made-up
  name, shown together on the opening's mascot sheet; the reveal turns each mascot panel into its
  person with the mascot beside the face, once, and the caption "Kiwi the bear is Huma."; after the reveal, faces only Each builds a track
  record, shown at the season's end and kept off the decision cards so equal notes stay equal.
- **Consequences follow the notes only.** The consequence line is keyed by the merit tier of the
  notes the player put first, never by who carried them; nothing marks a choice right, wrong or
  fair.
- **Readings (owner decisions O2 and O3, 19 Oct 2026).** Five levels from the cue's permutation
  p: "Your decisions clearly lean towards ..." (strong), "Your decisions lean towards ..."
  (moderate), "There's a hint your decisions lean towards ...; more seasons would tell"
  (possible), "No lean read", "Not enough to say". The size is shown apart, as the decisive-pair
  count ("38 of 46"). The quantiles live in `config.season.rating.levels` (PENDING v20; demo 0.99,
  0.95, 0.85), never in player copy. With 70 balanced relabellings the smallest p on a cast cue
  is 2/70, so strong cannot be reached at 0.99 (flagged for v20). An area names a lean on a cue
  only when that cue's headline is at least possible; otherwise it shows its equal-notes
  decisions as examples with no lean label. Caste and birthplace are read for groups only: no
  per-person card, row or area card on the result page or the profile; religion and skin tone
  stay.
- **The result page** is out of fiction (the plain register) and comes after submit, top to
  bottom in the owner's set order (19 Oct 2026, EVAL-6): the disarming opening first, in two or
  three sentences (everyone's decisions lean somewhere; a view from outside; ask whether the
  point that feels off could still be true); then the `ResultHero` for sex ("38 of 46 equal
  pairs where you put the man ahead", the dot grid, the band, its sentence, `Spectrum` and the
  reasons); "Your other readings" as a `ReadingList` (religion, skin tone, surname,
  birthplace), so a player with no sex reading still sees the readings they do have (owner
  decision 5); then "Your decisions, area by area", one `Fold` per area (hiring and promotion,
  complaints and conduct, sharing resources; the first open), each with a short narrative, "Where your
  decisions followed the record" and "Your blind spots" as `PointCard`s (a blind spot ends with
  the actual decisive pairs), "Where it may come from" (prompts only, nothing asked or stored)
  and "How to keep watch" (habits, free, no effect claimed; sources pending in a content note); the Internal
  Committee line; the plain "Your answers are in" notice (no tick, no green); keeping it (an optional profile, the retake as a date); the `ShareCard`; and
  an optional stay-in-touch form (name and email both optional, two separate unticked boxes,
  stored apart from answers and profile). It says "attitude rating", never "bias", and never
  moralises; a card appears only where the decisions support it, so the bands can land
  anywhere, and no weakness is dressed as a strength. No band is called unbiased; the no-lean
  band reads "No lean read in your decisions". No paywall, no self-rated accuracy.
- **The profile** (`#/profile`) is optional and pseudonymous, out of fiction: `Timeline`, the
  change line ("No change read yet" unless a change is read), the next retake as a date, never a
  timer, a separate research opt-in, and "Delete my profile and all my records".

### The season in chapters (EVAL-8; every count PENDING v21)

The owner approved concepts A, B1, C and D (20 Oct 2026). **Five story chapters and a finale.**
A chapter is one episode's form-A cards; its opening line (25 words or fewer) is folded into the
first card's caption, the consequence stays on the next card's `Then` line, and there are no
episode splash or interlude screens. Each chapter ends on a three-panel payoff strip (`Strip`)
that follows two fixed cast slots' running stories, the same for every player, equal in valence
and never contingent on an answer, then a "Saved on this phone" screen (note register) with
"Start chapter n" (or "Start the finale") and a quiet "Stop here, carry on later". The finale
holds screening, the first survey, the note, form B, the second survey, recall, the wrap's three
items on one screen with one Done, the optional background questions, and one closing screen
with the debrief, the withdrawal code and Submit; the result comes after it only. Ordinary
decisions are back to the registered two (the tutorial and the season decision); eligibility and
the language choice share one screen. **Saves.** The season is saved on the device after every
answer and resumes in the same browser for 7 days, after which the save is deleted unsent;
between the first survey's answer and the recall item nothing is saved, so a reload there
returns to the first survey and the note's effect never straddles a break. The submitted record
carries `meta.sit`, the number of sittings (1 to 6, a reopening at a save point counts), never a
time. Back never leaves the story run it is in. Values: `content/config.json` `season.chapters`.

## 4c. The comic register and the portrait system (EVAL-6, Direction C)

The owner chose Direction C, "comic panels", from the three directions in the 19 Oct 2026
review sheet. Its references come from the saved Lazyweb search "Equal Lens evaluator game:
three visual directions" (19 Oct 2026, private to the owner's account): The New Yorker's cartoon
view (a full-width drawing with its caption), The Atlantic's article (kicker, display headline,
cover illustration), Duolingo's chat (dialogue carried by small cartoon avatars) and 222's
result reveal (one sentence owns the screen, used for "38 of 46"); Episode and Choices
(chaptered story with characters on every beat) are outside Lazyweb.

**Pieces.** A screen in the game is built from panels: `Splash` (violet halftone, the `h1`)
opens a season, an episode, the reveal and the season's end; `Then` (small, paper) says what came
of the last decision; `Panel` holds a scene with its `Caption` (yellow, offset ink shadow) and the
question in 30 px display caps; decisions are portrait panels (`TapOrder`, `PickOne`) or
portrait rows (`QuickSplit`); a `Stamp` marks a rank or a share; interludes are a `Strip` of two
or three `PanelArt` scenes with captions; the cast appears as a `CastGrid`. Hierarchy runs
forwards: the new scene and question are always larger than the consequence of the last one.
The episode track in the sticky top bar is progress ("Episode 2 of 5" and its pips; the page
count was removed, owner 19 Oct 2026), never a countdown.

**Generated images first, the drawing as the fallback** (owner decision, 19 Oct 2026). People
and mascots are meant to come from generated WebP headshots made by a separate agent:
`public/portraits/{slot}-{sex}-{tone}.webp` (the cast slot, 0 to 7, women 0 to 3 and men 4 to
7; one pre-rendered image per skin tone, `l1`, `l2`, `d1`, `d2`) and
`public/portraits/o{slot}-{sex}.webp` for one-off characters (their slot, 100 and up; one image
each, as one-offs all share the medium tone), and `public/portraits/mascot-{animal}.webp`, with
`manifest.json` listing what exists (a list of file
names, or `{ "files": [...] }`). `src/ui/portraitImages.ts` fetches the manifest once from the
app's own origin; `Portrait` shows an image only when the manifest lists it, so a missing file
never shows a broken picture, and falls back to the drawing otherwise (no manifest, an unlisted
slot or tone). The comic frame stays: the ink border and the
tint and halftone backdrop sit around the image, which is drawn with `object-fit: cover`.
Images carry their own size, `width="384" height="384"` (square, cropped to the panel by `object-fit: cover`), `loading="lazy"` except the faces above the fold (the
first two cards, the first four cast tiles, the consequence face), and the portrait's label
(the wrapping `role="img"` keeps the same `aria-label`). X-9 checks every branch.

**Delivered (19 Oct 2026).** 160 WebPs, 384 x 384, opaque lavender ground, made with FLUX.2 klein
4B (method, ratings and checks in `scripts/portraits/README.md`): 64 cast (slots 0 to 7, each with
a matched woman and man sharing every prompt word but the sex noun, hairstyle and facial hair,
each in the four tones), 88 one-offs (slots 100 to 143, both sexes, medium tone; both faces of a
tied pair share glasses and facial hair) and 8 mascots. **Sex is drawn per slot**
(`session.ts`): a random permutation puts the 4 women and 4 men on the 8 slots, so each slot's
woman and man act as a control for the face; religion and tone stay the balanced factorial. In a
one-off tied pair, which face carries the focal cue is drawn per player. The drawn fallback
follows the same per-slot glasses and facial hair (`looks.ts`), so the label is right for either.
The generated hair is black or dark brown, not one dark brown (to settle with P1).

**The portrait system** (`src/ui/portraitArt.tsx`, `Portrait`), the fallback. One geometry for every person
(head, neck, the uniform: a violet polo with a lanyard and badge, one expression) and one for each
of the eight mascot animals (bear, panda, frog, koala, elephant, penguin, rabbit, tiger), drawn as
light inline SVG of about 25 shapes with a 2.6 unit ink line and halftone shading (a pattern of
ink dots on the shaded side of the face; a violet halftone corner on the lilac ground). Options:

- Five skin tones (`l1`, `l2`, `m`, `d1`, `d2`), from the tone each cast member was drawn with;
  one-off characters are all `m`.
- Women: long hair, a bun, a plait, wavy hair with glasses. Men: curly hair with a beard, a side
  parting with a moustache, a quiff with glasses, a crew cut. **Every hair colour is the same dark
  brown** (`--art-hair`). Within each sex the four looks go by the colleague's place in the cast,
  which the draw shuffles against religion and tone, so across players no look goes with a
  religion or a tone (`src/story/looks.ts`).
- One-off characters (applicants, complainants, other teams' colleagues) take a look fixed by a
  hash of their id (slot and first name): the same character never changes between renders, and
  as the name is a random draw the look is unrelated to the cue they carry.
- **No attire layer.** Hijab, bindi, cap and tilak are not built or shipped; religion is carried
  by names only, as before.
- `role="img"` with an accurate label: sex, tone words, then glasses or facial hair ("man, darker
  skin tone, beard"); a mascot is named by its animal.

Colours come from the **art tier** of `tokens.css` (`--art-*`, raw colours for pictures only:
line, ground, the dark brown, the uniform, five tone sets selected by `data-tone`, eight animal
sets selected by `data-animal`), read only by `portrait.css` and `panelart.css`
(design-check). Pictures keep their colours in forced-colours mode.

**Contrast and halftone.** No text sits on halftone: captions, name plates and the splash text
have solid grounds (ink on `#FFE27A` 14.6:1; white on violet 9.6:1, and 6.2:1 at the centre of one of the splash white dots at
16 per cent, so AA holds everywhere). The halftone dots are 5 and 7 units apart in a 200-unit
picture, about 4 px at 1x on a 170 px panel and 2 px on the 64 px face, which read as a tint
rather than a moire at 1x and 2x (checked in the 19 Oct screenshots).

**Old phones.** No image download, no font fetch from a third party, no library; one display and
one text face added (about 78 KB of woff2 for the four files). Motion stays the 160 ms press;
reduced motion makes it instant, and nothing moves on its own.

## 5. Interaction patterns, checked against real products (Lazyweb, 19 Oct 2026)

- **Sorting.** Spotify's playlist editor, Deezer's library customisation and Real Sports'
  league order all reorder a list by a drag handle on each row, with a list that stays fully
  visible. We take the handle and the visible list, and add what none of them has: **up and
  down buttons on every row**, because drag alone fails keyboard users, screen readers, and
  thumbs on small old phones. Each move is announced ("Priya, position 2 of 4") in a polite
  live region. The starting order is the tool's random draw, so nothing is pre-sorted.
- **Allocating.** Chime's split-direct-deposit screen splits one total across destinations by
  number with the remaining amount always shown; sliders (eBay, Artsy price filters) suit a
  range, not a fixed pool. We use **steppers per colleague and a remaining count**, and the
  card cannot be confirmed until everything is shared. No slider: sliders are hard to set
  exactly on a small screen and poor with a screen reader.
- **Agreement scales.** Rise and Spring Health ask one statement per screen; Rise uses a
  vertical list of labelled options, Spring Health a slider. We use **one item per screen and a
  vertical list of fully labelled radio rows**: every point has its words, which matters for a
  scale whose fair end alternates.
- **Content note before the Inbox.** Content-advisory splash screens (the photosensitivity
  warning pattern) put the note on its own screen before the material, with one action to go
  on. We do the same, sober, with the Internal Committee route in the note.
- **Debrief.** Quiz products (Duolingo, Sololearn) pair an answer with an explanation of why.
  The evaluator must not: **no answer is ever marked right or wrong**, and the scoring
  explanation opens only after all play closes. The debrief page is plain sections of prose
  with headings, in the out-of-fiction register, opened with the code.

- **Micro-interactions (Lazyweb, 19 Oct 2026, EVAL-3).** Reorder lists (Raycast, Vinyls,
  Real Sports) keep handles and the whole list visible; we add the lift and a short slide
  of the displaced rows so the move is seen, not inferred. Steppers with a ceiling (Grubhub's
  item quantity, Michelin's guest count) grey the spent control and keep the value in view;
  ours stay focusable and say the remaining line again. Inline code errors (Acorns, MSCHF,
  Mill's promo code) sit under the field and colour its border; ours also mark the field
  `aria-invalid`, point to the message and clear as soon as the code is edited. Tap-to-copy
  (Believe's wallet address, CapCut's 2FA code) confirms in place; we take the in-place
  confirmation and leave out CapCut's countdown. Questionnaires (Rays, Elevate, Lose It)
  highlight the chosen row; ours does, without any sign of which row is better. Split screens
  (Chime, Navan's remaining budget) keep the remainder visible; ours ticks when nothing is
  left, as a fact about the action.
- **Tap-to-order.** MetaMask's recovery-phrase check fills numbered slots by tapping words in
  order, and Sleeper's onboarding picks leagues in order by tapping chips. We take tap order with
  the number shown on each card as it is tapped, and add what ranking needs: the last card fills
  itself, a numbered card can be taken back, Undo, and a spoken line per tap. It replaces drag in
  the season story (3 taps for 4 cards, against a drag and a Confirm).
- **Pick one of two people.** Couple Joy's "who is most likely to" and MSCHF's two-button
  decision put two large choices on one screen with back navigation. Ours are whole colleague
  cards that commit on the tap, with Back on the next screen.
- **Faster allocation.** Bitrig's tip presets and Chime's split by number set an amount in one
  tap rather than stepping it. `QuickSplit` gives one row of number chips per colleague (0 to a
  cap), so a 6-unit split takes two or three taps instead of six.
- **Agreement grid.** 15Five's manager survey sets statements as rows of a 1 to 5 scale on one
  page; on phones Rise, 222 and Spring Health ask one statement per screen. We keep the rows (12
  statements, one screen, one Done) and make each row a real fieldset with five native radios
  whose spoken names carry the full words, so it works at 320 px, by keyboard and by screen
  reader.
- **Story-driven play.** Duolingo's stories carry a lesson with recurring cartoon characters,
  and Tapotron's dialogue screens move a story one line at a time. NPQE (16Personalities' story
  test, "a story that reads you") lets the player pick one of several short stories. We use a
  drawn season shown beside the other two (one built, two PENDING v18), a fixed cast, and one line of what
  happened at the top of each decision.
- **The result page.** 16Personalities shows a named type, trait bars with percentages, and a
  long free explanation; Storia and Tolan in Lazyweb show a named result with a paragraph and a
  share action; Elevate names bands on a scale. We take the named band, the strength bar and the
  long plain explanation, and add what a rating of attitudes needs: the reasons from the
  player's own decisions, the shaded no-lean middle, and no self-rated "how accurate was this?".
- **Summary card.** Result-sharing screens (Airbuds, Couple Joy) share a compact card. Ours
  names the season and the band only, works for every band, and invites "Take it and compare",
  with no score table.

## 5a. Accessibility rules set by the October audit

- **One `h1` per screen**, and focus on it when the screen arrives. A screen whose question is
  the page puts the question in the `h1` inside the legend (`Choice heading`). A state change
  that is a new screen (a card's continuation, the recall item's continuation, a finished
  withdrawal) is a new `stepKey`, so focus moves with it. The disclosure alone has no heading,
  as registered.
- **A control at its limit is `aria-disabled`, never `disabled`**, when the person is likely
  to be on it: the up and down buttons at the ends of the ranking list and the allocation
  steppers. A `disabled` button drops keyboard focus to the page; an `aria-disabled` one keeps
  it and does nothing. Inactive glyphs stay faint, which WCAG 1.4.3 allows.
- **No skip link**: nothing focusable comes before `<main>`, and focus already lands on the
  heading. If anything focusable is ever added to the header, add a skip link with it; `pnpm
  ux` fails until then.
- Results shown on the same screen (a bad code, the explanation's release date) are `status`
  or `alert` notices and leave focus on the button that asked.

## 6. Writing on screens

British spelling; no em or en dashes; sentence case; second person; short sentences.
Buttons name what happens ("Submit my answers", "Delete my records"). The word "fair" is never
used in anything shown before the explanation page, and no screen before it says how
attitudes are scored. The season result is a plain band line ("A strong season. The team
stayed ahead of plan.") and never names what decides the season. The recall item offers the
note the player saw, three made-up notes (a statistic on another topic, no instruction), in
an order shuffled per player, and "I do not remember" last, and each explanation quotes only the notes its
game shows (owner decisions O1 to O3, [ux audit](reviews/ux-audit-2026-10-19.md)); both are held
by `content-check`. `scripts/content-check.ts` checks the dashes and American spellings, and fills every gendered
text as a man, a woman and neutral: a gendered word carries its verb ("they were", never "they
was") and takes a capital when it opens a sentence, both done by the generator
(`src/engine/text.ts`), never string by string. Every release and withdrawal date comes from
`releaseOf` in `src/engine/config.ts` and is shown as "15 March 2027" (`formatDate`).

The season story's words follow the same rules, held by `scripts/story-check.ts`: no "fair"
and no "bias" in any story text, descriptions carry no pronoun, consequences use only `{name}`
and `{g:}`, and every number v18 will fix is marked PENDING v18 in `content/config.json`
(`season.pendingV18`). **No player-facing string says PENDING** (X-16, EVAL-6): markers live in
underscore keys of the content and reach the research team only through the dev-only
`DevNotes` panel. There is no exception: the season disclosure's sentence 3 is the interim line
"Attitudes are read; you see yours." (Hinglish "Attitudes padhe jaate hain; aapko apne dikhte
hain."), set in `src/engine/config.ts` (`seasonSentence3`) with a comment that it awaits the
owner's wording, never a placeholder.

**A card's question is the question only (owner, 19 Oct 2026).** "Whose account do you rely on
most?", never "... Put them in order."; the helper line under it carries the action ("Tap them
in order, first choice first."; a split's "6 days to share, up to 4 each."). An allocation card
asks "Who gets the 6 training days?" rather than "Share the 6 training days.". X-2 fails any
ranking, allocation or pick question that repeats its helper's action words.

**A reload resumes (owner, 19 Oct 2026).** A season in progress is kept on this device
(`src/store/progress.ts`: localStorage under the local store, never sent), so a refresh mid-season
reopens the same screen with the same answers and the same draw (the season's seed, so cast,
cues, episodes, cards and mascot pairing are redrawn identically). The one-time link refuses a
reload only once the session is submitted or withdrawn; a reload of the result shows the same
result. `pnpm e2e` reloads at week one, mid-episode and the result.

## 6a. The installed app (EVAL-7)

Team season is a PWA. `public/manifest.webmanifest`: name and short name "Team season",
`display: standalone`, `start_url` and `scope` "./", `theme_color` `--violet` (#553286) and
`background_color` `--note-paper` (#FBF6EC), held to the tokens by X-4. Icons are drawn by
`pnpm icons` (`scripts/icons.ts`) in the comic register and never show a face: a square
ink-ruled panel on caption yellow holding the violet round stamp, tilted 8 degrees, with "TS"
in Big Shoulders; 192 and 512 px, a maskable 512 px with the art inside the central 60 per cent,
`apple-touch-icon` at 180 px and a 32 px favicon. `index.html` carries the iOS meta tags.
The service worker (`scripts/pwa/sw.js`, written into the build with its precache list by
`scripts/pwa/plugin.ts`; none on the dev server) precaches the shell, hashed assets, fonts,
icons and every portrait; `index.html` is network-first, everything else cache-first; it never
touches another origin, so nothing from Firebase is cached, and it never touches localStorage,
where the season in progress lives. A new version waits for the player's tap on `UpdateReady`;
nothing reloads mid-season on its own. `pnpm pwa` (X-18) checks installability (Chrome's own
check, the one Lighthouse reads), the precache, an offline reload that resumes the season, and
the update prompt.

## 7. Old phones

The season story draws its people and mascots as inline SVG (section 4c), so its look no longer
depends on the phone's emoji font. No web fonts block rendering (`font-display: swap`); emoji are Unicode 6.0 animals plus the
human figures with skin-tone modifiers (Android 7 and later draw the modifiers; older phones
show the tone swatch beside the figure, which still carries the cue, a named limitation). No
animation library, no drag library: the drag is Pointer Events on the handle, with the
buttons as the always-working path.
