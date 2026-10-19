---
type: design-system
title: Equal Lens Evaluator design system
description: The tokens, surfaces, components and interaction patterns of the evaluator prototype. Every UI choice in src/ comes from here, and scripts/design-check.ts holds the code to it.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-1/
  - https://app.plane.so/the-equal-lens/browse/EVAL-2/
  - https://app.plane.so/the-equal-lens/browse/EVAL-3/
  - https://app.plane.so/the-equal-lens/browse/EVAL-4/
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

## 1. Rules the code is held to

`pnpm check` runs `scripts/design-check.ts`, which fails when:

- a raw colour, size or duration appears in any stylesheet but `src/styles/tokens.css`;
- a stylesheet reads a primitive token (only semantic and component tokens are read);
- a token is read that does not exist, or one exists that nothing reads;
- a screen (`src/screens/`) writes a `className` or a `style`: screens compose `src/ui` only;
- a class used in `src/ui` is defined by no stylesheet, or one defined is never used;
- a component exported from `src/ui` is missing from section 4 of this file.

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
| `--warm` | `#FAF8F4` | Out-of-fiction surface (the minimal register's warm paper) |
| `--mist` | `#E7E0F1` | Rules, dividers |
| `--line` | `#E7DEF4` | Card borders |
| `--tint` | `#F4F0FA` | Character card fill |
| `--sun` | `#FFC94D` | The demo badge only |
| `--teal-deep` | `#0F6E56` | "All shared" state |
| `--coral-deep` | `#C2553F` | Errors and refusals |
| `--grey-*` | neutral greys | The Committee Inbox's sober surface |
| dark set | `--night`, `--night-raised`, `--night-line`, `--moon`, `--moon-soft`, `--lilac` | Dark mode |

Type: Poppins 500/600/700 (`--face-display`) for headings, labels, buttons and numbers;
Nunito Sans 400/600/700 (`--face-body`) for text. Both self hosted, latin subsets, OFL, so no
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

Dark mode follows `prefers-color-scheme` and `data-theme`; every semantic token is re-pointed,
none is overridden in a component.

## 3. Surfaces: three registers that never mix

The design's own rule 8 is that out-of-fiction screens look different from the game. That is
the whole structure of the visual system:

| Surface | Where | Look |
|---|---|---|
| **Game** (`surface="game"`) | First week, your season, rounds after the note, ordinary decisions, the season result; in the season story: the picker, the opening, every decision, the reveal, the season's end | Paper ground, violet act label (the story's episode title), character cards on tint with a 2 px line border |
| **Out of fiction** (`surface="oof"`) | Disclosure, consent, screening block, survey, Off the Record, mid-season note, recall, direct block, the wrap's questions, debrief, code, withdrawal, explanation; in the season story: the statements grid, the wrap, the attitude-rating result and the profile | Warm paper ground, a hairline rule across the top, and the line "This part is not part of the game." as the first thing on the screen, in the body face, never violet |
| **Sober** (`surface="sober"`) | The Committee Inbox and its content note | Neutral grey ground, no violet, no illustration, no points, the Internal Committee route stated on every card |

The disclosure screen is out of fiction but shows **only** the four registered sentences and
the Continue button (in demo mode the demo notice is a separate screen before it). Every
mid-season note uses one identical layout: statistic, source line, instruction sentence.

## 4. Components (`src/ui`)

| Component | Source | What it is |
|---|---|---|
| `Page` | `src/ui/Page.tsx` | One screen: a `<header>` landmark (demo badge, act label, the hairline), `<main>` with the out-of-fiction line, the `h1`, body and one action row. On arrival focus moves to the `h1` (the title, or a question's `h1` inside its legend) and the document title becomes "`h1` · Team season". Long titles wrap |
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
| `DemoBadge` | `src/ui/DemoBadge.tsx` | The sun-coloured "Demo" strip at the top of every screen except the disclosure |
| `Table` | `src/ui/Table.tsx` | The demo results table in a named, focusable scroll region, with suppressed cells marked and an `empty` line |
| `Portrait` | `src/ui/Portrait.tsx` | A colleague's face, large (72 px box, 56 px emoji; never under 64 px on phones) or small (48 px, the roster): the animal mascot before the reveal, the human figure with its tone after the reveal, with the mascot as a corner badge |
| `Colleague` | `src/ui/Colleague.tsx` | A season colleague: `Portrait`, name (surname part of it), cue lines ("Born in"), this job's notes. All spans, so it can sit inside a button |
| `Beat` | `src/ui/Beat.tsx` | The top of a story screen: the last decision's consequence (violet rule at left) with the answer restated, the scene, and the question as the `h1`, which names the rest with `aria-describedby` |
| `TapOrder` | `src/ui/TapOrder.tsx` | Tap-to-order ranking: whole-card buttons take numbers 1, 2, 3 in the order tapped; the last fills itself and the order commits (k - 1 taps). Tap a numbered card to take it back; Undo takes back the last tap; every tap announced politely |
| `PickOne` | `src/ui/PickOne.tsx` | One colleague of two: a whole-card button that commits on the tap |
| `Options` | `src/ui/Options.tsx` | A single choice (ordinary decisions, the wrap's yes or no) as full-width buttons that commit on the tap; never radios that auto-advance, because arrow keys would answer |
| `QuickSplit` | `src/ui/QuickSplit.tsx` | Share a pool by tapping one number (0 to the cap) per colleague, `aria-pressed` chips, too-large numbers `aria-disabled`, the count left live; commits when all is shared; "Start again" clears |
| `AgreeGrid` | `src/ui/AgreeGrid.tsx` | Agree or disagree statements on one screen: one fieldset per statement, five native radios in a row numbered 1 to 5 with full spoken names ("1, Strongly disagree"), a key once above, the end words under each row; fits 320 px at 44 px targets |
| `Roster` | `src/ui/Roster.tsx` | The cast with running track records: collapsed (`details`) under decisions, open at the reveal (large portraits) and the season's end |
| `StoryPick` | `src/ui/StoryPick.tsx` | The season picker: one card per story (emoji, title, one-line premise); stories not built yet are `aria-disabled` with their PENDING line |
| `Spectrum` | `src/ui/Spectrum.tsx` | The strength bar: where the decisions sit between two groups, the middle the season cannot tell from chance shaded with dashed edges, a violet marker; one image with a spoken label and the same numbers in words under it |
| `ReadingGrid` | `src/ui/ReadingGrid.tsx` | "Your readings": one card per ground, label then the level in a neutral colour (violet lean, ink no lean, grey not enough to say; never green or red, `--c-level-*`), then a one-line meaning; the first card (sex) is wide and holds the strength bar, the long explanation and the reasons |
| `PointCard` | `src/ui/PointCard.tsx` | One finding in a decision area: the pattern's name, the counts, and for a blind spot the player's own decisive pairs as a list (never a made-up inner voice) |
| `ShareCard` | `src/ui/ShareCard.tsx` | The summary card, worded for every band, with Share (the device's share sheet, else copy) and a status line |
| `Timeline` | `src/ui/Timeline.tsx` | The profile's past seasons: a vertical line of dated entries, one band each |

## 4a. States of every component

"Yes" is a state the component has and `pnpm ux` or X-9 checks; "n/a" does not apply. Every
interactive state is also present in dark mode and on all three surfaces (the tokens re-point;
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
| DemoBadge | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | Wraps | Edge painted | n/a |
| Link | Thicker underline | Ring | Pressed colour | n/a | n/a | n/a | n/a | n/a | Wraps | Ring | No fade |
| List | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | Wraps; empty renders nothing | System colours | n/a |
| Text, Heading | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | Long words break | System colours | n/a |
| Table | n/a | Region ring | n/a | n/a | n/a | n/a | n/a | n/a | Scrolls in its region; empty line | System colours | n/a |
| Page | n/a | Heading on arrival | n/a | n/a | n/a | n/a | n/a | n/a | Title wraps | Hairline kept | Instant scroll |
| Portrait, Colleague | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | Wraps beside a 72 px face | Face keeps colour | n/a |
| TapOrder | Border | Ring on the card | `--press` | Number badge, `aria-pressed` | n/a | n/a | Commits on the last tap | n/a | Wraps | Highlight outline on numbered | No scale |
| PickOne, Options | Border | Ring | `--press` | n/a | n/a | n/a | Commits on the tap | n/a | Wraps | Ring | No scale |
| QuickSplit | n/a | Ring on a chip | `--press` | Filled chip, `aria-pressed` | `aria-disabled` past what is left | n/a | Commits when all is shared | n/a | Chips fit 320 at 44 px | Highlight outline on chosen | No scale |
| AgreeGrid | Border | Ring on the point | n/a | Filled point | n/a | n/a | n/a | n/a | Five points fit 320 at 44 px | Highlight outline on chosen | No transition |
| StoryPick | Border | Ring | `--press` | n/a | `aria-disabled` (not built) | n/a | n/a | n/a | Wraps | Ring | No scale |
| Roster, Timeline, ReadingGrid, PointCard, Spectrum, Beat | n/a | `summary` ring (Roster) | n/a | n/a | n/a | n/a | n/a | n/a | Wraps; grid drops to two columns | Borders kept; bar keeps colour | n/a |
| ShareCard | n/a | Button ring | Button | n/a | n/a | "cannot share" status | "Copied" status | n/a | Wraps | Border kept | n/a |

**No state judges an answer.** Checked rows, a placed card and "All shared" confirm that an
action happened; nothing is marked right, wrong, good or fair, nothing celebrates, and the
tick on "All shared" and on done notices confirms completion of an action only.

## 4b. The season story (EVAL-4, the game redesign)

The season story is a fourth deployment (`season`, `src/story/`, `content/story.json`): one team
season told in five short episodes of about ten decisions (50 in all, counts PENDING v17), each
opened by a title card, about 12 minutes. The player picks one of three seasons first (NPQE's
way in; the warehouse is built, the newsroom and the clinic are PENDING v17). Its rules:

- **One decision per screen, and no Next.** Every decision commits on its tap (`TapOrder`,
  `PickOne`, `QuickSplit`, `Options`), the next screen opens with its consequence (`Beat`), and a
  quiet "Back: change my last decision" reopens it. Nothing counts down; no auto-advance waits.
- **A fixed cast.** Eight colleagues for the whole season, large portraits (`Portrait`, never
  under 64 px on phones). In the first decisions each is a different animal mascot with a made-up name; the
  reveal maps each mascot to its person, and the mascot stays as a corner badge. Each builds a
  track record (`Roster`), kept off the decision cards so equal notes stay equal.
- **Consequences follow the notes only.** The consequence line is keyed by the merit tier of the
  notes the player put first, never by who carried them; nothing marks a choice right, wrong or
  fair.
- **The result page** is out of fiction and comes after submit, top to bottom (the owner's
  NPQE structure, our evidence and stance, 19 Oct 2026): a disarming opening (everyone's
  decisions lean somewhere; a view from outside; ask whether the point that feels off could
  still be true); "Your readings", a `ReadingGrid` with sex first and wide (band, `Spectrum`,
  the long explanation, the reasons); then one section per area (hiring and promotion,
  complaints and conduct, sharing resources), each with a short narrative, "Where your
  decisions followed the record" and "Your blind spots" as `PointCard`s (a blind spot ends with
  the actual decisive pairs), "Where it may come from" (prompts only, nothing asked or stored)
  and "How to keep watch" (habits, free, sources PENDING v17, no effect claimed); the Internal
  Committee line; keeping it (an optional profile, the retake as a date); the `ShareCard`; and
  an optional stay-in-touch form (name and email both optional, two separate unticked boxes,
  stored apart from answers and profile). It says "attitude rating", never "bias", and never
  moralises; a card appears only where the decisions support it, so the bands can land
  anywhere, and no weakness is dressed as a strength. No band is called unbiased; the no-lean
  band reads "No lean read in your decisions". No paywall, no self-rated accuracy.
- **The profile** (`#/profile`) is optional and pseudonymous, out of fiction: `Timeline`, the
  change line ("No change read yet" unless a change is read), the next retake as a date, never a
  timer, a separate research opt-in, and "Delete my profile and all my records".

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
  picker of three seasons (one built, two PENDING v17), a fixed cast, and one line of what
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
and `{g:}`, and every number v17 will fix is marked PENDING v17 in `content/config.json`
(`season.pendingV17`) and shown as such on screen in demo mode.

## 7. Old phones

No web fonts block rendering (`font-display: swap`); emoji are Unicode 6.0 animals plus the
human figures with skin-tone modifiers (Android 7 and later draw the modifiers; older phones
show the tone swatch beside the figure, which still carries the cue, a named limitation). No
animation library, no drag library: the drag is Pointer Events on the handle, with the
buttons as the always-working path.
