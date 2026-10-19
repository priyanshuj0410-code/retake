---
type: design-system
title: Equal Lens Evaluator design system
description: The tokens, surfaces, components and interaction patterns of the evaluator prototype. Every UI choice in src/ comes from here, and scripts/design-check.ts holds the code to it.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-1/
  - https://app.plane.so/the-equal-lens/browse/EVAL-2/
---

# Equal Lens Evaluator design system

The evaluator is a research instrument dressed as a short game. Players use their own phones,
often old Android phones on slow connections, so the system is **mobile first, light, and
plain**. It takes The Equal Lens brand (the `equal-lens` canon: Poppins for display, Nunito
Sans for body, core violet `#553286`, ink `#221436`, paper `#FBF9FF`) in its **minimal
register**: the content is the hero, violet only where it orders the page, no mascot. Lensy
does not appear: the instrument must not carry a voice that could read as telling players
what is right.

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
type of both panel games and the firm session and fails on any of: text below AA contrast
against its real background, a target under 44 px on phones or 24 px on desktop, a control
without a name, a heading skip, a screen without one `h1` or its own document title, sideways
scroll at 320 px, a ranking or allocation card without a live region, text under 12 px, any
axe-core violation, focus not on the new screen's heading, or a ranking or allocation card
that cannot be finished by keyboard with focus kept.

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

Motion: one duration (160 ms) for state changes, and none at all under
`prefers-reduced-motion`. **Nothing in the product counts down, pulses or times out.** No
timer exists anywhere (the exam rule; `scripts/no-timers.ts`).

Dark mode follows `prefers-color-scheme` and `data-theme`; every semantic token is re-pointed,
none is overridden in a component.

## 3. Surfaces: three registers that never mix

The design's own rule 8 is that out-of-fiction screens look different from the game. That is
the whole structure of the visual system:

| Surface | Where | Look |
|---|---|---|
| **Game** (`surface="game"`) | First week, your season, rounds after the note, ordinary decisions, the season result | Paper ground, violet act label, character cards on tint with a 2 px line border |
| **Out of fiction** (`surface="oof"`) | Disclosure, consent, screening block, survey, Off the Record, mid-season note, recall, direct block, the wrap's questions, debrief, code, withdrawal, explanation | Warm paper ground, a hairline rule across the top, and the line "This part is not part of the game." as the first thing on the screen, in the body face, never violet |
| **Sober** (`surface="sober"`) | The Committee Inbox and its content note | Neutral grey ground, no violet, no illustration, no points, the Internal Committee route stated on every card |

The disclosure screen is out of fiction but shows **only** the four registered sentences and
the Continue button (in demo mode the demo notice is a separate screen before it). Every
mid-season note uses one identical layout: statistic, source line, instruction sentence.

## 4. Components (`src/ui`)

| Component | Source | What it is |
|---|---|---|
| `Page` | `src/ui/Page.tsx` | One screen: a `<header>` landmark (demo badge, act label, the hairline), `<main>` with the out-of-fiction line, the `h1`, body and one action row. On arrival focus moves to the `h1` (the title, or a question's `h1` inside its legend) and the document title becomes "`h1` · Team season" |
| `Button` | `src/ui/Button.tsx` | `primary` (violet fill), `secondary` (violet outline), `quiet` (text). 48 px tall, full width on phones |
| `Text` | `src/ui/Text.tsx` | Paragraph, `lead`, `small`, `muted`, `strong` |
| `Heading` | `src/ui/Text.tsx` | A section heading inside a page (explanation sections, demo tables) |
| `Link` | `src/ui/Link.tsx` | A text link with a 48 px target (the calendar file, demo links) |
| `List` | `src/ui/List.tsx` | A plain bulleted list of text points (consent, tutorial, debrief) |
| `Character` | `src/ui/Character.tsx` | One colleague: emoji figure (or species), name, cue lines (surname is part of the name; "Born in"; badge), description |
| `SortList` | `src/ui/SortList.tsx` | Drag-to-sort list of `Character`s with up and down buttons on every row |
| `Allocate` | `src/ui/Allocate.tsx` | Share a fixed pool between `Character`s with minus and plus steppers and a remaining count |
| `Choice` | `src/ui/Choice.tsx` | Single choice as full-width radio rows (scales, vignettes, menus). `heading` puts the question in the screen's `h1`, inside the legend, on screens whose question is the page |
| `Checks` | `src/ui/Choice.tsx` | Any-number choice as full-width checkbox rows (the noticing probe); takes `heading` too |
| `Statement` | `src/ui/Statement.tsx` | A crosswise pair: statement A and statement B in two labelled boxes |
| `Code` | `src/ui/Code.tsx` | The withdrawal code in large monospace groups of four |
| `Field` | `src/ui/Field.tsx` | A labelled text input (code entry) |
| `Notice` | `src/ui/Notice.tsx` | A boxed message: `info`, `error`, `demo` |
| `DemoBadge` | `src/ui/DemoBadge.tsx` | The sun-coloured "Demo" strip at the top of every screen except the disclosure |
| `Table` | `src/ui/Table.tsx` | The demo results table, with suppressed cells marked |

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
stayed ahead of plan.") and never names what decides the season. The recall item offers only
the note the player saw and "I do not remember", and each explanation quotes only the notes its
game shows (owner decisions O1 to O3, [ux audit](reviews/ux-audit-2026-10-19.md)); both are held
by `content-check`. `scripts/content-check.ts` checks the dashes and American spellings, and fills every gendered
text as a man, a woman and neutral: a gendered word carries its verb ("they were", never "they
was") and takes a capital when it opens a sentence, both done by the generator
(`src/engine/text.ts`), never string by string. Every release and withdrawal date comes from
`releaseOf` in `src/engine/config.ts` and is shown as "15 March 2027" (`formatDate`).

## 7. Old phones

No web fonts block rendering (`font-display: swap`); emoji are Unicode 6.0 animals plus the
human figures with skin-tone modifiers (Android 7 and later draw the modifiers; older phones
show the tone swatch beside the figure, which still carries the cue, a named limitation). No
animation library, no drag library: the drag is Pointer Events on the handle, with the
buttons as the always-working path.
