---
type: design-system
title: Equal Lens Daily trainer design system
description: The tokens per skin, type, the text-colour rule, every component and its states, motion and copy rules of the daily fairness trainer. Every UI choice in src/ comes from here, and scripts/design-check.ts and scripts/content-check.ts hold the code and the content to it.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-13/
---

# Equal Lens Daily: design system

The trainer is one fairness puzzle a day, played on the player's own phone in 5 to 7 minutes.
It replaces the evaluator's screens (EVAL-1 to EVAL-12, kept in git history and on the
evaluator's own branch). The look is Indian craft vernacular in two skins that alternate by
ISO week: **Lugdi** (Hindi pulp-novel covers, the "Ghat Series") in odd weeks and **Station**
(railway enamel boards) in even weeks. Each day within a skin is a different object or genre.
The owner's samples are the source: the Lugdi and Station pages (five days each) and the range
page (eight more days each, a month calendar and the variety dials).

Product decisions are in the Sex Ed workspace: `Paper Analysis/Hypotheses/daily-fairness-trainer/brief-2026-10-20.md`
and the 20 Oct blocks of `workplace-gender-training-v2/resume-note-2026-10-18.md`. Scoring and
the ladder: `workplace-gender-training-v2/consistency-and-levels-2026-10-20.md`. The fortnight's
content and what the owner must review: [reviews/trainer-content-2026-10-20.md](reviews/trainer-content-2026-10-20.md).

## 1. Rules the code is held to

`pnpm check` runs `scripts/design-check.ts`, which fails when:

- a raw colour, size, duration or angle appears in any stylesheet but `src/styles/tokens.css`;
- a stylesheet reads a primitive token, or a token that does not exist, or a token is defined
  that nothing reads;
- **the text-colour rule** breaks (section 3): a `color` reads anything but an `--c-on-*` token
  (or `inherit`), an `--c-on-*` token resolves to anything but its skin's ink or paper in any
  skin or ground, the accent (`--c-display`) is read by anything but display type, or the
  accent resolves to red;
- any text and ground pair fails contrast (4.5:1 for text, 3:1 for the focus ring and control
  edges) in any skin or ground: 78 pairs over 7 skin and ground sets at present;
- a screen, a board or `App.tsx` writes a `className` or a `style` (they compose `src/ui`);
- a component, board or screen mentions a gender (so no colour, shape or position can be
  gender-coded: the cast's gender reaches the scoring only);
- an answer option's stylesheet styles by position (`:nth-child` and the like);
- a class is used and owned by no stylesheet, owned twice, or owned and never used; class
  names are static, and variants and states are `data-*` or `aria-*` attributes;
- a component exported from `src/ui` is missing from section 4;
- press feedback starts later than 100 ms, the hit-stop in code differs from its token, the
  reduced-motion state is missing, or a transition reads no `--dur-*` token;
- a face other than Hind and Sarpanch is declared, or the manifest's colours are not tokens.

`pnpm ux` (`scripts/ux-audit.ts`) then plays every screen of all 14 days in Chrome at 390, 320
and 1280 px and fails on: computed text contrast below AA against the real ground, a target
under 44 px on phones (24 px on desktop), a control without a name, more or fewer than one
`h1`, a heading skip, sideways scroll, text under 12 px, any axe-core violation, focus not on the
new screen's `h1`, or a set of answer options whose resting options are not drawn alike.

## 2. Tokens per skin

Three tiers in `tokens.css`. **Primitives** hold every raw value (the skins' colours, a pixel
scale, durations, line heights, the two families). The **semantic tier** names what a value is
for; it is set per skin on `html[data-skin]` and per ground on `html[data-ground]`, which
`App.tsx` sets from the day being shown. Components read the semantic tier only.

| Token | Lugdi | Station | Use |
|---|---|---|---|
| `--c-ground` | night `#1B0B2E` (jungle `#0B1A12`, navy `#0A1630`, plum `#2B0F2E`, blood `#2A0A12` by genre) | platform black `#1C1C1C` | the page |
| `--c-on-ground` | paper `#FFFFFF` | paper `#FFFFFF` | text on the page |
| `--c-plate` / `--c-on-plate` | cover yellow `#FFD23F` / ink `#111111` | board yellow `#F7C600` / ink `#141414` | answer options, the score plate |
| `--c-sheet` / `--c-on-sheet` | paper / ink | paper / ink | notes, reflection columns, inputs |
| `--c-ticket` / `--c-on-ticket` | paper / ink | card `#E9DFC4` / ink | ticket surfaces |
| `--c-band` / `--c-on-band` | the ground / paper | enamel blue `#0F4C9C` / paper | the cover band, blue boards, the board table |
| `--c-button` / `--c-on-button` | yellow / ink | yellow / ink | the commit |
| `--c-button-alt` / `--c-on-button-alt` | paper / ink | paper / ink | secondary actions |
| `--c-selected` / `--c-on-selected` | ink / paper | ink / paper | a chosen option, the stamped commit |
| `--c-display` | yellow (accent) | yellow (accent) | display titles only |
| `--c-roundel` | red `#E4002B` | blue | the price roundel (a fill, never text) |
| `--c-streak` / `--c-streak-forgiven` / `--c-streak-empty` | yellow spine / **red spine** / dim | yellow ticket / **white ticket** / dim | the streak |
| `--c-edge`, `--c-edge-ground`, `--c-muted-edge`, `--c-focus` | ink, paper, dim `#6B6478`, yellow | ink, paper, dim `#6F6F6F`, yellow | edges and the focus ring |
| `--shadow-display`, `--shadow-button` | red then black offset | none | the pulp offset print |
| `--font-display`, `--weight-display`, `--case-display` | Sarpanch 900, capitals | Hind 700, as written | display type |
| `--radius-plate`, `--radius-button`, `--inset-board` | 0 (printed covers) | 6 px, with the inset enamel rule | corners |

Shared semantic tokens: type sizes `--text-xs` 12 to `--text-4xl` 44 px; gaps `--gap-hair` 2 to
`--gap-xl` 24 px with a 16 px `--gutter`; `--tap-min` 44 px; `--button-height` 56 px;
`--page-max` 480 px; portraits 44, 64 and 96 px; motion tokens in section 5.

No colour is gender-coded: there is no pink and blue, and the Station blue is a board colour,
never a person's. The answer options in a set are one tone.

## 3. Type and the text-colour rule

- **Reading face: Hind** (400 to 700) for Latin and Devanagari, with Hind Vadodara (Gujarati),
  Hind Siliguri (Bangla), Hind Madurai (Tamil) and Hind Guntur (Telugu) declared under the same
  family through `unicode-range`, so one stack reads every script a Station board carries.
  Kannada, Malayalam, Gurmukhi and Odia are not covered by the Hind family; no day uses them
  yet (a Noto Sans face per script would be the fallback, an owner decision).
- **Display face: Sarpanch** 900 (Latin and Devanagari) for Lugdi titles, names on plates and
  button labels, set in capitals with the red-then-black offset shadow. **Station displays in
  Hind bold**, as written. Numbers (scores, stats) are Hind bold with tabular figures in both
  skins, because Sarpanch's figures read poorly at small sizes.
- Self hosted from the Fontsource packages (`pnpm fonts` copies them into `public/fonts`), so
  no third party is contacted. Hind's fi and fl ligatures are switched off.
- **The text-colour rule (owner, 20 Oct 2026).** Text is only ink or paper. An accent colour
  appears on display type alone (the yellow title). Lugdi red is never text: it is the title
  shadow, the price roundel, the button's offset shadow and the forgiven spine. Contrast is
  checked twice: statically on the tokens (`design-check`) and in the browser on every screen
  (`pnpm ux`). Cover paintings never sit behind text: the title and blurb sit on a solid band
  and the painting is a decorative strip below it.

## 4. Components and their states (`src/ui`)

Screens (`src/screens`) and mechanic boards (`src/boards`) compose these and nothing else.
States are attributes: `aria-checked` and `aria-pressed` for chosen, `aria-disabled` for
inactive (never `disabled`, so focus stays), `data-state`, `data-tone`, `data-mark`.

| Component | What | States |
|---|---|---|
| `Shell` | The frame: series line, `main`, the tab bar after it. Moves focus to the new screen's `h1` when `screen` changes | one per screen |
| `Nav` | Today, Board, Week | current (`aria-current`, a paper rule above), pressed |
| `Masthead` | Lugdi: the cover band (title, blurb, price roundel) and the painting strip. Station: the enamel board (city script line, title, city, sub line) in yellow, blue or white | Lugdi grounds by genre; Station board tones |
| `Title` | A screen's display heading (results, board, onboarding) | none |
| `Text`, `Heading`, `Link` | Body text (s, m, l), a section heading, a text link | link pressed |
| `Stack`, `Cluster`, `Split` | Layout for screens, which write no styles | gap s, m, l |
| `Button` | The full-width action, primary or secondary. `useCommit` gives it the hit-stop | rest, hover, pressed (sinks into its shadow within 60 ms), focus ring, inactive (dashed, `aria-disabled`), stamped (ink, "Locked", tilted, held 140 ms) |
| `Choices` | A radio group of equal options: rules, responses, languages, road names, a pick of names. Arrow keys move | rest, pressed, chosen (ink), locked (the chosen one stays, the rest go dashed) |
| `Options` | The container of one set of answer options; `pnpm ux` checks its children look alike | none |
| `Person` | One person as information or as an option (radio, checkbox or button): portrait or monogram, name, record, stats, quote, an aside (punches) and a mark (slot or position) | rest, pressed, chosen, inactive, marked, mark empty (dashed) |
| `Portrait` | The cast member in the skin's art (`pulp-*` or `enamel-*`), or a monogram plate for a new character. Decorative (`alt=""`) | sizes s, m, l, fill; round |
| `Stats` | Numbers with labels as a description list | none |
| `Slots` | The places to fill (jobs, berths) as buttons | empty (dashed), filled (paper), armed (a person is chosen and waiting) |
| `Punches` | Checks as punch holes, filled when spent; holes stay | per hole on or off |
| `Voice` | A character's pressing line with a round portrait | none |
| `WordNote` | A note with blanks; each blank is a button | empty, active (ink with a yellow rule), filled |
| `WordBank` | The shared word bank; every word fits either note | rest, pressed, inactive |
| `Swipe` | Quick-fire keep or cut: drag the card, or the two buttons (always there, and the keyboard path) | resting, dragging (follows the finger, no transition), released (springs back over `--dur-move`) |
| `Slider` | A share guess, 0 to 100 in fives, the number large | focus |
| `Score` | The headline as its sum: score = consistency + practice | none |
| `Figures` | Clear numbers, one per row | none |
| `Streak` | The count and the fortnight strip: Lugdi spines, Station tickets | played, forgiven (red spine or white ticket), missed, today (outlined), still to come (dashed) |
| `Ranks` | The board table: top ranks, a gap, the player's row. Never a bottom list | your row (plate) |
| `Reflect` | A twin pair side by side for the Sunday look back; marks "You chose", gives no verdict | chosen mark |
| `Field` | A labelled search box with its action (find a friend) | focus |
| `NoteBox` | The private Sunday note, stored on the phone only and never read by the scoring | focus |
| `Notice` | A plain dashed label: sample data, drafts, status | live (role status) when it reports a result |
| `Plate` | A surface for information, not an option: plate, sheet, ticket, band, or the ground with an accent rule | tones |
| `UpdateReady` | A new version is waiting; nothing reloads until the tap | none |

**Mechanic boards (`src/boards`), the puzzle engine's UI.** One per step kind, registered in
`src/boards/index.tsx` with its commit label: `assign` (lock a rule with `Choices`, then the
people appear; tap a `Person`, then a `Slots` place), `pick` (two `Person` tiles, or rows with an
even option), `checks` (`Voice`, `Person` rows with `Punches`, then `Choices`), `team` (`Person`
checkboxes, `Voice`, `Choices` of responses), `rank` (lock a rule, then tap `Person` rows in
order; marks show CNF, RAC, WL), `words` (`WordNote` twice and a `WordBank`), `swipe` (`Swipe`)
and `crowd` (`Slider`). Every board orders its people per player and step (a hash of the
player's seed, date, step and person), so no twin is always on the left.

## 5. Motion

- **Press feedback within 100 ms.** Every pressable sinks by `--press-shift` (2 px) over
  `--dur-press` (60 ms); the Lugdi button's red offset shadow shortens with it and a paper ring
  appears. The ring is the part that survives reduced motion.
- **Hit-stop on commit.** The commit is stamped at once (ink, "Locked", tilted by
  `--stamp-tilt`, with no transition) and held still for `--dur-hitstop` (140 ms, `HIT_STOP_MS`
  in `src/ui/Button.tsx`) before the next screen. The hold is the only timeout in the app.
- **Reduced motion is a designed state**, not motion switched off by accident: under
  `prefers-reduced-motion: reduce` the travel, the tilts and every transition time go to 0,
  while the ring on press, the stamped colour and the 140 ms hold stay, so a press and a commit
  still read as events. The swipe card follows the finger (direct manipulation) and returns
  with no animation.
- No animation library and no timers on screen.

## 6. Screens

`#/` today (the day's cover and the one action: play, carry on, see the result, or open the
week on Sunday; the road name, practice, the streak, the language switch); `#/play` the steps;
`#/result` the day's result; `#/week` the week (on Sunday the back cover or the PNR slip, with
the look back and the closing action; other days the week so far); `#/board` the board and
friends; `#/dev` the prototype menu. First run: language, then a road name. The tab bar sits at
the end of every screen but play, so nothing focusable comes before the content.

**Date override (prototype).** `?day=1` to `14` (the anchor fortnight, 19 Oct to 1 Nov 2026) or
`?date=YYYY-MM-DD`, in the hash's query or the page's; it is held for the tab until `?day=0` or
"Back to the real date" in `#/dev`.

## 7. Scoring as the player sees it

- **Lean** is the size only, 0 to 100, labelled "direction hidden". Each mirrored judgement
  gives a signed unit (positive when the woman's side came out better); the lean is the
  absolute value of their sum over the count plus 2 (shrinkage, so one choice is never a
  verdict). The sign never leaves `src/engine/score.ts`. Favouring women costs exactly what
  favouring men costs, and a player who overcorrects shows a lean like any other: lean is
  each player's own absolute lean.
- **Consistency** (0 to 100) is the mean of the parts present: rules kept (the player's own
  locked rule), matching cases treated alike (mirrored gossip lines, and twins that come back
  days later with the genders swapped), check-spending parity (the gap in checks between
  matching records) and word-choice parity (the gap between two notes' words); over a week,
  evenness (100 minus the lean) is added.
- **Headline score = consistency + practice**, always shown as its sum. Practice is 10 per
  puzzle solved and 10 for closing the week; the board ranks practice alone.
- A twin's first half shows no consistency number ("Some of today's choices count later in
  the week."); the returning half shows the matched case. The transfer day shows no score.
- The streak counts days played; one missed day in each ISO week is forgiven and shown.
- The Sunday look back shows a twin pair side by side, asks "What was different?" and gives
  no verdict. The optional note stays on the phone and is never read by anything.

## 8. Copy rules

- British spelling; no em or en dashes (the middle dot `·` separates); sentence case except
  Lugdi display type, which is set in capitals by CSS, never in the strings.
- **Minimal reading** (owner): prompts at most 18 words, blurbs 12, quotes, lines, records and
  findings 14, titles 6 (held by `content-check`). Stats are numbers, not sentences.
- **No visible timers**, and no word of seconds, countdowns or hurrying.
- **Symmetric answer options**: one component and one tone per set; mirrored people share the
  same record, numbers, findings and word bank; each mirror is one woman and one man.
- Never say which way a player leaned. Never call a player fair or biased. The board reads "by
  practice".
- Sample data says so on the screen it appears on (the board, the crowd figure).
- **Languages**: English is the source; Hindi (Devanagari) is a draft, marked `_status: draft` in
  `content/i18n/hi.json` and said on the language screen. Every string has a Hindi draft with
  the same `{slots}`. Station boards carry the city's own script line as a draft too.
- Road names are generated from place, time and thing words (`content/handles.json`), never a
  person's word, so no handle carries a gender; a number is added only when a name is taken.

## 9. Accessibility

One `h1` per screen, focused on arrival (no ring: headings are not controls). Inactive controls
are `aria-disabled`. Radio groups take arrow keys. Every mark in the streak says its state in
words. The board is a table with a caption. Portraits are decorative; names are always written.
All checked by `pnpm ux` at three widths.
