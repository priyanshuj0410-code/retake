---
type: review
title: Component states and micro-interactions, 19 October 2026
description: Every component in src/ui audited one at a time for its states and micro-interactions, with before and after matrices, the real products each pattern was checked against, what was redesigned, and the checks that now hold each state.
date: 2026-10-19
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-3/
---

# Component states and micro-interactions, 19 October 2026

The owner asked for every component to be audited and redesigned one by one, so that each
has all its states and micro-interactions. Design system: [../design.md](../design.md),
sections 2 (motion and forced-colour tokens), 4 and 4a. Previous review:
[ux-audit-2026-10-19.md](ux-audit-2026-10-19.md).

**Result:** all 16 components have every state that applies to them. `pnpm ux` now runs a
states pass with 87 browser checks (`scripts/ux-states.ts`), all passing. X-9 in `pnpm check`
renders the components and checks the markup for each state (15 checks), and `pnpm e2e` checks
the code field against the emulator (2 checks). `pnpm check` is green.

**Key:** present, missing, broken, n/a. "Before" is `main` at f534f8b; "after" is the
EVAL-3 commits.

## Constraints held

- Tokens only: two new scales (`--press` 0.98, `--lifted` 1.02, both 1 under reduced
  motion) and a forced-colours block. The one duration stays `--motion` (160 ms), with no
  second one. design-check passes.
- No animation or drag library: Pointer Events, CSS transitions and the Web Animations API.
- Nothing counts down, pulses, loops or times out. The copy confirmation stays. No key
  handler: the no-timers check forbids keystroke capture, so Enter uses a native one-field form.
- No state marks an answer right, wrong, good or fair, and nothing celebrates. Ticks appear
  only where an action is complete ("All shared", done notices).
- 48 px targets everywhere. Old Android: the checked row is a class, not `:has()`, and the
  `content: '✓' / ''` alt-text syntax falls back to plain `content`.
- The disclosure is untouched.

## Checked against real products (Lazyweb)

| Interaction | References | Taken | Not taken |
|---|---|---|---|
| Drag lift, settle, reorder movement | Raycast favourites, Vinyls album sections, Real Sports leagues, Google Assistant news sources | Handles, the whole list visible; the lifted card and the slide of the displaced rows | Remove icons per row (nothing may leave a card) |
| Stepper at a limit | Grubhub item quantity (max limit), Michelin Guide guest count, Best Buy cart quantity | Spent control greyed while the value stays in view | Disabling it outright: ours stays focusable and speaks |
| Remaining count, "All shared" | Chime's split deposit, Navan's remaining per-diem | The remainder always visible | Percent sliders, quick-pick amounts |
| Checked transition | Rays, Elevate and Lose It onboarding questionnaires, BoldVoice | Full-row highlight of the chosen option | Any "best answer" emphasis or progress praise |
| Field focus and invalid code | Acorns 2FA code, MSCHF SMS code, Mill and Dreamcash code errors | Inline message under the field and an error border | A modal error (Remind), resend timers |
| Copy or select a code | Believe tap-to-copy address, CapCut 2FA copy, Beeper recovery key | In-place confirmation | CapCut's expiry countdown |
| Live-region wording | (no visual reference) | "Dot, position 2 of 4" (was "Dot, Position 2 of 4"); the remaining line is said again at a limit | n/a |

## Before and after, per component

### Button

| State | Before | After |
|---|---|---|
| Default, dark, three surfaces | present | present |
| Hover (pointer) | missing | present: pressed colour (primary), raised fill (secondary), thicker underline (quiet) |
| Focus-visible | present (base ring) | present |
| Pressed | partial: colour on primary only | present: `--press` scale on all kinds, colour on primary |
| Disabled | partial: primary only | present: every kind, not-allowed cursor |
| Long label at 320 px | missing (no wrap rule) | present |
| Forced colours | missing: no rule, disabled not checked | present: GrayText disabled, Highlight ring |
| Reduced motion | partial | present: no scale |

### Choice

| State | Before | After |
|---|---|---|
| Hover (pointer) | missing | present: border |
| Focus-visible, checked plus focus | partial: ring on the radio only | present: ring on the radio and accent row border (focus-within) |
| Pressed | missing | present: `--press` |
| Checked | broken on old Android: `:has()` only | present: `choice__option--checked` class, 160 ms transition |
| Long legend or option at 320 px | broken: the legend pushed the page 164 px sideways | present |
| Forced colours | broken: checked row looked unchecked | present: Highlight outline |
| Reduced motion | n/a before (nothing moved) | present: no scale, no transition |

### Checks

As Choice: the ticked state was `:has()`-only (broken on old Android), hover and press were
missing, and there was no forced-colours outline. After the fixes all of these are present.

### SortList

| State | Before | After |
|---|---|---|
| Move button hover, pressed | missing | present |
| Focus-visible | present | present |
| aria-disabled at a limit | present (EVAL-2) | present, and pressing it says the position again |
| Dragging (lift) | partial: shadow and border only | present: `--lifted` scale, shadow, grabbing cursor |
| Settle on drop | partial | present: lift transitions back; the drag no longer sticks when a row passes another (pointer capture was lost when React moved the row; listeners are now on the window) |
| Drop target | n/a | n/a: the list reorders live, so the lifted card is the drop position |
| Row reorder movement | missing (rows jumped) | present: FLIP slide at `--motion`, none under reduced motion |
| Live wording | broken: "Dot, Position 2 of 4" | present: "Dot, position 2 of 4" |
| Long names at 320 px | broken: the middle column would not shrink | present |
| Forced colours | present (GrayText limit) | present |

### Allocate

| State | Before | After |
|---|---|---|
| Stepper hover, pressed | missing | present |
| aria-disabled at a limit | present (EVAL-2), silent | present, and pressing it says the remaining line again |
| Remaining count change | present, instant | present: tabular figures, colour change at `--motion` |
| "All shared" arrival | partial: colour only | present: a tick that is not read aloud, and the ok colour |
| Long names at 320 px | broken (via Character) | present |
| Forced colours | present | present |

### Character

| State | Before | After |
|---|---|---|
| Long names, cues and descriptions at 320 px | broken: the grid's text column would not shrink, names did not wrap | present |
| Forced colours | missing: no rule for the figure | present: the figure keeps its colours (the skin tone is the cue) |

### Statement

| State | Before | After |
|---|---|---|
| Long statement or label at 320 px | broken: labels overflowed | present |
| Forced colours | present | present (borders checked) |

### Field

| State | Before | After |
|---|---|---|
| Hover (pointer) | missing | present: border |
| Focus | partial: ring only | present: ring and accent border |
| Invalid | missing: the error was only a notice below | present: `aria-invalid`, `aria-describedby` to the alert, error border, cleared on edit |
| Enter submits | missing | present: native one-field form |
| Forced colours | n/a | present: dashed border when invalid |
| Long label at 320 px | present | present |

### Code

| State | Before | After |
|---|---|---|
| Select | partial: a drag-select across groups | present: one tap selects it all |
| Copy | missing | present: copy button and a status line that stays |
| Long code at 320 px | present | present |

### Notice

| State | Before | After |
|---|---|---|
| Error versus done | colour only (WCAG 1.4.1) | present: heavier left edge, and a "!" or tick glyph that is not read aloud |
| id for a field's description | missing | present |
| Long message at 320 px | missing (no wrap rule) | present |
| Forced colours | colour-only difference lost | present: edge width kept |

### DemoBadge

| State | Before | After |
|---|---|---|
| Forced colours | missing: no edge once the system removes the fill | present: a transparent border the system paints |
| Long Hinglish at 320 px | missing (no wrap rule) | present |

### Link

| State | Before | After |
|---|---|---|
| Hover (pointer) | missing | present: thicker underline |
| Pressed | missing | present: pressed colour |
| Focus-visible | present | present |
| Long link text at 320 px | missing (no wrap rule) | present |

### List

| State | Before | After |
|---|---|---|
| Empty | broken: an empty `<ul>` | present: renders nothing |
| Markers | body colour | muted |
| Long points at 320 px | missing (no wrap rule) | present |

### Text and Heading

| State | Before | After |
|---|---|---|
| Long unbroken words at 320 px | broken: pushed the page sideways | present |

### Table

| State | Before | After |
|---|---|---|
| Keyboard scrolling of a wide table | broken: the scroll box was not focusable | present: named region, focus ring |
| Empty | broken: header only | present: one full-width line |
| Suppressed | present | present |

### Page

| State | Before | After |
|---|---|---|
| Three surfaces, dark | present | present (checked: three grounds, each re-pointed in dark) |
| Focus on arrival, title | present (EVAL-2) | present |
| Long title or act label at 320 px | missing (no wrap rule) | present |

## How it was tested

- `pnpm ux:states` (also run by `pnpm ux`) plays one English game 2 session in the demo build
  at 412 × 915, light. On the first screen that shows each component, it checks:
  - hover by pointer, focus-visible by Tab, and press by holding the mouse down;
  - checked by clicking a row, and the limit by pressing Enter on an `aria-disabled` control;
  - the drag lift, the slide and the settle with a real pointer drag;
  - the invalid code with Enter, and copy through the clipboard;
  - long content by putting long Hinglish words into a clone of the screen at 320 px;
  - forced colours and reduced motion through Playwright's media emulation.
  It then checks the explanation and withdrawal pages and firm enrolment (Link).
- X-9 (`scripts/component-states-check.ts`) renders each component with React's server
  renderer in each state and checks its markup.
- `pnpm e2e` checks the code field against the emulator's store.
- `pnpm check` is green, including the full audit (141 screens × 6 viewports, all counts
  zero).

## Still for a person

- The drag on a real old Android phone (touch slop, the lift's shadow on a slow GPU).
- TalkBack and VoiceOver: how a position said again at a limit, and an `aria-disabled` plus,
  are announced.
- Windows High Contrast on a real machine: the emulation covers Chromium's forced colours only.
