---
type: reference
title: Material Design 3, digested for Equal Lens Daily
description: What Google's Material Design 3 says about tokens, type, colour roles, spacing, touch targets, states, elevation, motion and the core components, turned into numbered, testable rules for Equal Lens Daily and checked against the failed EVAL-13 build.
plane_issues: [https://app.plane.so/the-equal-lens/browse/EVAL-14/]
sources_checked: 2026-10-20
---

# Material Design 3, digested for Equal Lens Daily

Material 3 (M3) is used here as a discipline, not as a look. The look stays Lugdi and Station. What M3 gives us is how a real system is put together: named values, a small type scale, colour roles with one meaning each, fixed sizes for touch, a full set of states for every control, and a short list of components with clear jobs. EVAL-13 had none of that discipline, which is why the same yellow bar meant six different things.

**How this was read.** m3.material.io draws its pages with script, so a plain fetch returns an empty shell. Instead I downloaded the content files the site itself loads (`https://m3.material.io/_dsm/content/m3/2026-10-13_06-10-19/<page>.json`) and the type token database (`.../_dsm/data/dsdb-m3/2026-10-13_06-10-19/TYPOGRAPHY.20543ce18892f7d9.json`), stripped them to text and read that. The pages were last updated between July and September 2026. Component values that the pages show only in pictures (heights, opacities, elevation levels, easing curves) come from Google's own token source files in the material-web repository (`tokens/versions/v0_192`, last changed 7 Oct 2025). No model summaries were used. Anything I could not confirm from raw text is marked UNVERIFIED. All text below is paraphrase.

**After the Stage 1 critique.**
- **Ids.** Principles are M3-P1 to M3-P31 and rules M3-1 to M3-46. The sibling digests carry their own prefixes (DG, HIG, PH, UXW, UA).
- **Shared parts.** The one step model for a puzzle step, the one set of size and timing numbers, and the settled small conflicts are in section 2.0 of [usability-and-accessibility.md](usability-and-accessibility.md). Rules here that disagreed now point there.
- **Owner questions** live in one list in [../ux/journeys.md](../ux/journeys.md) (OQ-1 to OQ-30).

## 0. How M3 organises a design system

M3's site has three layers, and a fourth idea that runs through them.

1. **Styles** (colour, type, shape, elevation, spacing, motion, icons). These are the raw choices, each expressed as tokens. https://m3.material.io/styles
2. **Components** (buttons, chips, cards, dialogs, sheets, navigation bar and about 30 more). Every component page has the same four tabs: Overview, Specs (anatomy, then tokens grouped first by state and then by part), Guidelines (when to use it, when not, do and don't pictures) and Accessibility (what a screen reader or keyboard user must be able to do). https://m3.material.io/components/buttons
3. **Foundations** (accessibility, layout, interaction states, selection, gestures, content design and writing, usability, tokens). This is where the cross-cutting rules live. https://m3.material.io/foundations/designing
4. **Patterns** are not a separate section in M3. They appear as canonical layouts (feed, list and detail, supporting pane), transition patterns (container transform, forward and back, lateral, enter and exit) and the interaction foundations. https://m3.material.io/foundations/layout/canonical-examples and https://m3.material.io/styles/motion/transitions

**Tokens come in three classes** (https://m3.material.io/foundations/design-tokens):
- *Reference* tokens hold every raw value available (a palette tone, a size). They never change with context.
- *System* tokens give a value a job ("primary", "on surface", "body large"). This is where theming happens: a system token can point at a different reference token in a different *context*, such as dark theme, a dense layout or right-to-left text.
- *Component* tokens say which system token each part of a component uses (for example, the colour of a button's label). The page says to point these at system tokens rather than hard values, and admits that not every stylistic choice can be a token.
- Names run from general to specific: system, class, then purpose (`md.sys.color.on-secondary-container`). M3 says to use tokens instead of hard-coded values everywhere.

**What this means for us.** Lugdi and Station, English and Hindi, and normal and reduced motion are all *contexts* in M3's sense. But EVAL-13 treated a skin as nothing more than a context, so only values changed and every day looked the same. In M3 terms, the poster, the ticket, the split-flap board and the PNR slip are *components*, each needing its own spec page (anatomy, states, tokens, accessibility). A skin therefore owns components as well as token values.

## 1. Principles that matter for a small, one-handed, game-like phone product

Each entry gives what M3 says (paraphrased), the source, and why it matters here.

### Type

**M3-P1. Five roles, three sizes each.** The scale has display, headline, title, body and label roles, each in large, medium and small: 15 baseline styles plus 15 heavier "emphasized" ones. Display is for short, important text or numbers. Headline is for short, high-emphasis text on small screens. Title is for shorter, medium-emphasis text. Body is for reading. Label is for text inside components, and buttons use label large. https://m3.material.io/styles/typography/applying-type
*Why:* it gives each piece of text a job. EVAL-13's question and status line were both 17 px bold, so neither led.

**M3-P2. Use a reduced set, with clear jumps between sizes.** No product needs all 15 styles. M3 shows a five-size set as an example and says sizes should contrast strongly, avoiding small differences. It also warns that changing sizes affects how components render. https://m3.material.io/styles/typography/type-scale-tokens
*Why:* EVAL-13 had 8 sizes (12, 13, 15, 17, 22, 28, 36, 44 px; `src/styles/tokens.css:69-76`), with 1 and 2 px steps that read as mistakes.

**M3-P3. The default values** (size / line height in px, from the 2026 token database):

| Role | Large | Medium | Small |
|---|---|---|---|
| Display | 57 / 64 | 45 / 52 | 36 / 44 |
| Headline | 32 / 40 | 28 / 36 | 24 / 32 |
| Title | 22 / 28 | 16 / 24 | 14 / 20 |
| Body | 16 / 24 | 14 / 20 | 12 / 16 |
| Label | 14 / 20 | 12 / 16 | 11 / 16 |

Baseline weights in Google's web tokens are regular (400) for display, headline, title large and body, and medium (500) for title medium and small and for labels (material-web `_md-sys-typescale.scss`, `_md-ref-typeface.scss`). The 2026 database stores weights per platform context under labels I could not decode, so those numbers are UNVERIFIED.
https://m3.material.io/styles/typography/type-scale-tokens

**M3-P4. Language height.** Since August 2026 the scale changes line height by script. Hindi, Bangla, Gujarati, Tamil, Kannada, Malayalam, Odia and Punjabi are in the "medium" group, described as about 7% taller. Telugu is "large" (about 30% taller). The default is medium, and ignoring this causes overlapping, clipped text. The token values for medium are: display 73 / 56 / 47, headline 42 / 38 / 35, title 31 / 27 / 23, body 27 / 23 / 18, label 23 / 18 / 18. https://m3.material.io/styles/typography/type-scale-tokens
*Why:* Devanagari is a launch language and Telugu is planned. Matras clip first.

**M3-P5. Readability.** Large type should have a line height of about 1.2 times its size and small type about 1.5 times. Body lines should be 40 to 60 characters long, and short lines 20 to 40. Use tabular (fixed-width) figures wherever numbers change or line up. Text contrast must be at least 4.5:1 for small text and 3:1 for large. https://m3.material.io/styles/typography/applying-type
*Why:* scores, streak counts and ranks change and line up in columns.

**M3-P6. Expressive faces belong on display and headline only.** Display and headline styles may use an expressive face if line height and spacing keep them readable. Be careful with expressive faces on titles, and avoid decorative faces for body text. https://m3.material.io/styles/typography/applying-type
*Why:* Sarpanch belongs on covers and titles. Hind does the reading.

### Colour

**M3-P7. Colours are roles, used only in their intended pairs.** A role is the "number" in a paint-by-number picture. *Surface* is for backgrounds. *Primary, secondary and tertiary* are accents in falling order of emphasis. *Container* roles are fills for things like buttons and are never used for text. Every "on" role is the colour for text and icons on its partner. *Variant* roles are lower-emphasis versions. Mixing roles outside their pairs breaks contrast. The system guarantees at least 3:1 between pairs. https://m3.material.io/styles/color/roles
*Why:* EVAL-13's yellow was the plate, the choice bar, the main button, the score box and the streak all at once. A role system makes each colour mean one thing.

**M3-P8. Outline versus outline variant.** *Outline* is for important boundaries such as a text field. *Outline variant* is for dividers and decoration, and may not be used to mark the edge of a tappable thing unless its contents already give 4.5:1. https://m3.material.io/styles/color/roles

**M3-P9. Tonal palettes and contrast levels.** One source colour produces five key colours (primary, secondary, tertiary, neutral, neutral variant). Each gets a palette of tones from 0 to 100, and fixed tones are assigned to the 26 or more roles in light and dark. Roles also come in standard, medium and high contrast; high contrast targets 7:1. https://m3.material.io/styles/color/system/how-the-system-works
*Why:* we do not use generated colour (the skins are hand-picked "static" schemes), but the role list and contrast levels are the checklist.

**M3-P10. Clustered controls need 3:1 against the background.** Controls placed in a group, such as a set of buttons, must each reach 3:1 between their container and the background so each can be told apart. Disabled controls are exempt. https://m3.material.io/foundations/designing/color-contrast

### Layout and spacing

**M3-P11. An 8 dp grid.** The base unit `space100` is 8 dp, and other units are multiples of it (`space150` is 12, `space225` is 18). Smaller "nested" values (2, 4, 6, 10) exist for components. Spacing comes in three kinds: padding (inside), gaps (between) and margins (outside). Prefer padding and gaps on the parent to margins on children. Keep spacing the same when text is scaled to 200%. https://m3.material.io/styles/spacing
*Why:* EVAL-13 used a negative margin to pull the painting into the blurb (`src/ui/masthead.css:56`), so nothing set a rhythm.

**M3-P12. Compact windows (under 600 dp wide) use one pane and 16 dp side margins, with navigation near the bottom edge where it is easy to reach.** https://m3.material.io/foundations/layout/breakpoints

**M3-P13. Group with space before boxes.** Explicit grouping uses outlines, dividers and shadows. Implicit grouping uses closeness and open space. M3 names rhythm, similarity, proximity and continuity (these are Gestalt laws). Similar things should have the same size and spacing so they read as related. Buttons should sit near what they affect. A row of chips reads as one control. The most important content gets generous space. https://m3.material.io/foundations/layout/grids-spacing
*Why:* fairness depends on similarity. Equal cases must look equal, and an option that is not a person must not look like one.

### Touch targets

**M3-P14. 48 x 48 dp minimum, at least 8 dp apart.** A 48 dp target is about 9 mm on any screen, and M3 recommends 7 to 10 mm. The visible element can be smaller (a 24 dp icon) as long as its padding makes up the 48. Pointer targets can be 44. Density settings must never shrink a target below 48. A state layer is drawn at 40 dp inside a 48 dp target. https://m3.material.io/foundations/designing/structure and https://m3.material.io/foundations/interaction/states/state-layers
*Why:* one-handed play on a cheap phone, often on a bus.

### States

**M3-P15. Six interaction states plus selected and activated.** The states are enabled, disabled, hovered, focused, pressed and dragged. Selected shows a chosen option. Activated shows the current destination in navigation. States can combine (selected and hovered). Each state has two visual cues, for accessibility. Apply states the same way across all components. https://m3.material.io/foundations/interaction/states

**M3-P16. State layers.** Hover, focus, press and drag are shown with a see-through overlay in the content's own colour: hover 8%, focus 10%, press 10%, drag 16%, according to the 2026 page. Google's October 2025 web tokens still use 12% for focus and press (`_md-sys-state.scss`). Only one state layer shows at a time, and there is only one hover, one focus and one press on screen at once. https://m3.material.io/foundations/interaction/states/state-layers

**M3-P17. Disabled.** A disabled control is shown through colour and lower elevation, cannot be focused, pressed or hovered, and need not meet contrast rules. In Google's web tokens a disabled filled button has its container at 12% opacity and its label at 38% (`_md-comp-filled-button.scss`). If a floating main action is unavailable, M3 says it should not appear at all. In dialogs, the confirming action stays disabled until a choice is made, but a dismissive action is never disabled. https://m3.material.io/foundations/interaction/states/applying-states and https://m3.material.io/components/dialogs/guidelines

**M3-P18. Selection.** Selection is shown with a check mark, a checkbox, a change in surface colour, or a mix of these. Navigation shows the active destination with an *active indicator*, and only one can be active. https://m3.material.io/foundations/interaction/selection

### Elevation and shape

**M3-P19. Few levels, tone before shadow.** There are six levels (0 to +5; in dp, 0, 1, 3, 6, 8 and 12 in the web tokens). Resting elements use 0 to +3. Levels +4 and +5 are only for hover and drag. M3 separates surfaces by tone by default and uses shadows only to protect against a busy background or to invite interaction. A modal sits over a scrim (32% opacity in the web tokens). Do not change components' default elevation. Use few levels. https://m3.material.io/styles/elevation

**M3-P20. Corner radius scale.** The scale is none 0, extra small 4, small 8, medium 12, large 16, large increased 20, extra large 28, extra large increased 32, extra extra large 48, and full. All rounded shapes take a step from it. https://m3.material.io/styles/shape/corner-radius-scale

### Motion

**M3-P21. Easing and duration tokens.** Durations are short (50, 100, 150, 200 ms; selection controls use 200), medium (250 to 400; a button growing into a sheet uses 400), long (450 to 600; a card opening to full screen uses 500) and extra long (700 to 1000; ambient only). Exits are shorter than entries. Entering uses emphasized decelerate `cubic-bezier(0.05, 0.7, 0.1, 1)` at about 400 ms. Leaving for good uses emphasized accelerate `cubic-bezier(0.3, 0, 0.8, 0.15)` at about 200 ms. Small utility moves use standard `cubic-bezier(0.2, 0, 0, 1)` at about 300 ms, which is also the web fallback for emphasized. https://m3.material.io/styles/motion/easing-and-duration

**M3-P22. Springs, converted for the web.** Since May 2025, components use physics springs in two schemes: expressive (overshoots a little and bounces) and standard (minimal bounce). Each has fast, default and slow speeds, split into *spatial* (position, size, rotation; may overshoot) and *effects* (colour, opacity; must not overshoot). For the web, M3 publishes matching curves, for example: expressive fast spatial `cubic-bezier(0.42, 1.67, 0.21, 0.90)` over 350 ms; expressive default spatial `cubic-bezier(0.38, 1.21, 0.22, 1.00)` over 500 ms; fast effects `cubic-bezier(0.31, 0.94, 0.34, 1.00)` over 150 ms; default effects `cubic-bezier(0.34, 0.80, 0.34, 1.00)` over 200 ms. https://m3.material.io/styles/motion/overview/specs
*Why:* a game needs a little bounce on a pick or a stamp. These curves give it without guessing.

**M3-P23. Transitions.** Use one pattern consistently for each kind of move. Avoid jump cuts. Keep layouts stable while loading (skeletons, no content popping in). With reduced motion turned on, use soft fades and turn off decorative effects such as parallax and shape changes. https://m3.material.io/styles/motion/transitions/applying-transitions

### Components

**M3-P24. Buttons and emphasis.** There are five styles in falling order of emphasis: elevated, filled, tonal, outlined and text. Filled is the strongest after the floating action button and is for the important final action of a flow, used sparingly, ideally on one action per page. Tonal suits a lower-priority step such as Next in onboarding. Outlined is for important secondary actions. Text is for the lowest-priority actions. Labels are 1 to 3 words, in sentence case, on one line, never cut off. A button is never narrower than its label. Too many buttons wreck the hierarchy. The default height is 40 dp (web tokens), with optional sizes; icon buttons come in 32, 40, 56, 96 and 136 dp. Small buttons need a 48 dp target. Outlined buttons look like chips, so take care when they sit side by side. https://m3.material.io/components/buttons/guidelines

**M3-P25. Chips are not buttons.** Chips offer options for the current task and appear as a set. Never show a single chip. Chips should not be used to finish or move a task forward; buttons do that. There should be no more than three buttons in one arrangement. Chip labels are 20 characters or fewer and use the button type style. A selected filter chip gets a leading check mark. Chips are 32 dp high with an 8 dp corner (web tokens). A secondary action inside a chip still needs its own 48 dp target. https://m3.material.io/components/chips/guidelines

**M3-P26. Cards.** A card holds content and actions on one subject. Do not force content into a card when spacing, headings or dividers would do. A card is either directly actionable (the whole card is the target, with a ripple and no buttons inside) or a plain container that holds buttons. It should never be both, because an action should not sit on an actionable surface. Cards in a set rest at the same elevation and rise only when dragged. Each card has one swipe action at most, and every drag or swipe needs a single-tap alternative. Text on images is not recommended. If needed, put it on a translucent scrim or a bounding shape that meets contrast. Cards do not scroll inside themselves on phones. https://m3.material.io/components/cards/guidelines and https://m3.material.io/components/cards/accessibility

**M3-P27. Dialogs, sheets and snackbars, by importance.**
- *Dialogs* interrupt on purpose, so use them sparingly and only for high-importance decisions that block the app. Give them a clear question as the headline, never "Are you sure?" or "Warning!". Allow at most two actions, with the confirming action at the trailing edge. A single action must be an acknowledgement.
- *Snackbars* carry low-importance messages, one at a time. Without an action they disappear after 4 to 10 seconds, and on the web they should not auto-dismiss unless there is also inline feedback.
- *Modal bottom sheets* hold secondary content on phones. They open to at most half the screen height and close by tapping the scrim, swiping down or using a close control. The drag handle needs a 48 dp target. Sheets have a 28 dp top corner and a maximum width of 640 dp.

https://m3.material.io/components/dialogs/guidelines, https://m3.material.io/components/snackbar/guidelines, https://m3.material.io/components/bottom-sheets/guidelines

**M3-P28. Navigation bar.** The bar holds 3 to 5 destinations of equal importance and sits at the bottom of the screen. Every item has an icon and a 1 to 2 word label; labels are never removed or wrapped. The active item gets a filled icon and a pill-shaped active indicator, on one item only. Items keep fixed positions. A flow may cover the bar for a while (a sheet or the keyboard), but no screen may block it permanently. Baseline web tokens give an 80 dp bar, a 64 x 32 dp indicator and 24 dp icons; the 2025 "flexible" bar is shorter, but its height is UNVERIFIED. https://m3.material.io/components/navigation-bar/guidelines

### Accessibility, usability and writing

**M3-P29. Fewer things, clear hierarchy, key actions at the edges.** Every added button, image and line of text makes a screen more complex. Keep key information readable at a glance. Put important actions at the top or bottom of the screen. M3's usability page adds: one main task per page, with empty space to focus attention; the main action is the largest element; do not pile up expressive tricks at once. Its Aura example puts the start button large and low, where a thumb reaches it. M3 cites Nielsen Norman Group's five parts of usability: efficiency, errors, learnability, memorability and satisfaction. https://m3.material.io/foundations/designing/structure and https://m3.material.io/foundations/usability

**M3-P30. Structure for assistive tech.** Use one H1 per page, do not skip heading levels, and label landmark regions. Focus order follows source order. Set the starting focus on each screen. A dialog takes focus and returns it to the control that opened it. Accessible names describe purpose and never include the role ("button"). Hide decorative images. Alt text runs to 125 characters at most. Support at least 200% text size, with text and line height scaling and padding staying the same. Let side-by-side controls stack when text grows, and scroll in one direction only. https://m3.material.io/foundations/designing/structure, https://m3.material.io/foundations/designing/elements, https://m3.material.io/foundations/writing/text-resizing

**M3-P31. UX writing.** Use sentence case everywhere, including titles and buttons. Address the user as "you", and do not mix "my" and "you" on one screen. Avoid "we". State consequences neutrally, without alarm or pressure. Skip full stops on single-sentence labels. Use exclamation marks only for real achievements. Put no ellipses in buttons. Avoid em dashes. Spell words out instead of abbreviating them. For translation, keep sentences short, cut jargon, and avoid "please", "sorry" and "thank you". Other languages run about 1.5 times longer than English. https://m3.material.io/foundations/content-design/style-guide and https://m3.material.io/foundations/content-design/global-writing

## 2. Rules for Equal Lens Daily

Each rule is meant to be checked on a rendered screen or in code. "Px" means CSS px (1 px = 1 dp), tested at 360 x 640 and 390 x 844, each also at 200% text (usability digest 2.0b). Where a rule goes beyond M3, it says *derived*.

### A. System structure

**M3-1. Three token layers.** These are reference (raw values per skin), system (roles) and component (parts of each component). Component and screen styles reference only system or component tokens. *Test:* no hex value or raw px value outside the token files. (section 0)

**M3-2. Contexts.** Each system token has a value for every combination of skin (Lugdi, Station), script height (Latin "small", Devanagari "medium") and motion (standard, reduced), or states plainly that it inherits one. (section 0, M3-P4)

**M3-3. Skin objects are components.** Each one has an M3-style spec page before it is built: anatomy, tokens, all states (M3-25) and accessibility. The objects are poster cover, yellow plate, white plate, enamel board, cream ticket, split-flap row, PNR slip, luggage tag, reservation chart and zone map. *Test:* no screen uses an object with no spec page. (section 0)

**M3-4. Patterns are written once and reused.** These are the puzzle screen, result screen, Sunday screen, board screen, sheet and dialog. Each has a fixed slot order (M3-20). *Derived from M3's canonical layouts.*

### B. Type

**M3-5. At most 6 type styles across the product and at most 4 on any one screen, all from the M3 scale** (the shared numbers, usability digest 2.0b). Proposed set, for the owner to approve:

| Role | Size / line (Latin) | Devanagari line | Use |
|---|---|---|---|
| Display M | 45 / 52 | 56 | Lugdi cover title (Sarpanch) |
| Display S | 36 / 44 | 47 | Station board name, headline score |
| Headline S | 24 / 32 | 35 | The day's question |
| Title M, bold | 16 / 24 | 27 | Person names, button labels |
| Body L | 16 / 24 | 27 | Blurb, facts, quotes |
| Label L | 14 / 20 | 23 | Kicker, stat captions |

Label L replaces the earlier Label M (12 px), which fell under the shared 14 px floor. The Devanagari line for Label L (23) is the medium-script value from M3-P4. Sarpanch in Devanagari appears only at 32 px and up (UA-15), so Hindi cover titles use Display S or larger.

**M3-6. No two styles on a screen differ by less than one step of the M3 scale.** *Test:* no 13 next to 14, and no 15 next to 16. (M3-P2)

**M3-7. The question and the status line never share a style.** The question is Headline S. Status is shown as marks where it can be (usability digest 2.0c); any spoken or written count is Label L or Title S. (M3-P1)

**M3-8. Reading text is at least 16 px. No live text is below 14 px** (the shared floor). Label M (12 px) and Label S (11 px) are not used. Lettering drawn into a painting or object image (a ticket's printed serial) is art, not live text. (M3-P3)

**M3-9. Devanagari uses M3's medium line heights** (column above), and Telugu uses large when it ships. *Test:* render every Hindi string at 360 and 390 px and at 200% text size, with no clipped matras and no overlaps. (M3-P4)

**M3-10. Display line height is at least 1.1 times the size; body is about 1.5.** Body lines are 40 to 60 characters, and blurbs 20 to 40. Devanagari body follows UA-14 (1.6 or more). (M3-P5)

**M3-11. Tabular figures** for every score, count, rank and streak number. (M3-P5)

**M3-12. The display face appears only in display and headline roles.** Body, labels and stats are set in Hind. Sarpanch capitals on Lugdi buttons are owner question OQ-3. (M3-P6)

### C. Colour

**M3-13. Colours are named by role, and only declared pairs are used.** The roles are ground and on-ground; plate and on-plate; plate-alt and on-plate-alt; accent and on-accent; selected and on-selected; outline; outline-variant; scrim. Text is ink or paper only, and accent appears only on display type (owner rule). What yellow means is OQ-7. (M3-P7)

**M3-14. Contrast.** Text under 24 px (or under 18.66 px bold) must reach at least 4.5:1, and text on plates, tickets and sheets 7:1 (HOUSE, as UA-1). Larger text must reach 3:1. The edge or fill of grouped controls (plates, chips, choice tiles) must reach 3:1 against the ground. Truly unavailable controls are exempt; the not-ready main button is not exempt (usability digest 2.0a). *Test:* every declared pair in both skins, plus the worst patch of every painting that has text over it (UA-2). (M3-P5, M3-P10)

**M3-15. One meaning per colour role across the product.** Accent fill means "the main action". Selected means "chosen". A dashed outline means only "empty slot to fill" in a puzzle; streak days not yet played are never dashed. *Test:* list every use of each role; any second meaning fails. (M3-P7, M3-P18)

### D. Layout and spacing

**M3-16. Spacing comes only from the 8 dp scale:** 2, 4, 8, 12, 16, 24, 32, 48. Padding and gaps sit on the parent. No negative margins. (M3-P11)

**M3-17. 16 px side margins and a single column at phone width.** (M3-P12)

**M3-18. Related items sit closer together than separate groups.** For example, 8 px inside a group and 24 px between groups. Do not draw a box where space already does the grouping. (M3-P13, M3-P26)

**M3-19. Equal cases look equal.** Before a choice, every person card in a set has the same size, tone, layout and portrait size (owner, 20 Oct). An option that is not a person (such as "Neither") must not use the person-card shape. (M3-P13)

**M3-20. Puzzle screen slot order:** kicker, title or object, question, the playing area, then the main action pinned to the bottom of the viewport. The main action is the largest control and stays in the same slot on every puzzle, result and Sunday screen. (M3-P29)

**M3-21. Puzzle and result screens fit one viewport at both test sizes, with the main action visible without scrolling.** At 200% text a screen may scroll, but the main action stays pinned and reachable (UA-16). The board screen stays under 2 viewports, and anything beyond that goes into a sheet. Sunday's shape is owner question OQ-2. *Derived from M3-P29.*

### E. Touch

**M3-22. Every tappable thing has a hit area of at least 48 x 48 px.** This includes chips, word tokens, name buttons, slots, nav items, sheet handles, "?" buttons and inline links. The visible shape can be smaller (a 32 px chip) if padding makes up the rest. *Test:* measure the hit box, not the paint. (M3-P14)

**M3-23. At least 8 px between separate targets, and 12 px between neighbours that both have a visible edge** (the shared numbers). (M3-P14)

**M3-24. Every drag or swipe (rank, quick sort) has a tap alternative that does the same thing.** (M3-P26)

### F. States

**M3-25. Every interactive component specifies and shows** enabled, hovered (the owner plays on a laptop too), focused (a visible ring), pressed, not ready (for the main action) and selected, plus dragged where it can be dragged. *Test:* the spec sheet shows every state, in both skins, for each component. (M3-P15)

**M3-26. Hover, focus, press and drag use a state layer** in the content colour at 8, 10, 10 and 16%. Write these as tokens. Only one state layer shows at a time. (M3-P16)

**M3-27. The main action is never drawn in M3's disabled style.** M3's disabled look (12% container, 38% label, not focusable) is too faint to read and gives no reason. Before it is ready, the main action follows the step model (usability digest 2.0a, point 3): in its place, a muted fill, a label at 4.5:1 that names what is missing, and still focusable. Never dashed, and never more than one on screen. The choice between "dimmed" and "hidden" is made once for the product: dimmed, in place. A control that cannot be used at all on a step is hidden rather than disabled (HIG-H23). (M3-P17)

**M3-28. Selected uses two cues:** a fill change to the selected role, and a check mark or filled icon. Unselected options keep their enabled look (no dimming, no dashes) until the step is committed. Selected must never be darker or quieter than unselected on the same ground. (M3-P15, M3-P18)

### G. Elevation and shape

**M3-29. Three heights only:** ground, plate (resting) and overlay (a sheet or dialog over a 32% scrim). A dragged card rises one level. Lugdi's red offset shadow is decoration belonging to the Lugdi button component, not an elevation level; whether it stays is part of OQ-3. (M3-P19)

**M3-30. Each skin uses at most 3 corner radii from the M3 scale** (for example, Lugdi 0 and full, Station 4 and 8). (M3-P20)

### H. Motion

**M3-31. Durations and curves come only from M3 tokens,** inside the shared limit that any movement after a tap ends within 400 ms (usability digest 2.0b). Selection or pick: 200 ms standard, or the expressive fast spatial curve over 350 ms if it should bounce. Colour and opacity: fast effects, 150 ms. Sheet enter: emphasized decelerate, 400 ms. Sheet exit: emphasized accelerate, 200 ms. Screen to screen: 300 ms standard, the same pattern every time. No jump cuts. The only longer moments are the three named in 2.0b (result reveal, ghost demonstration, milestone), each skippable. (M3-P21, M3-P22, M3-P23)

**M3-32. Reduced motion:** fades only, with tilt, stamp, parallax and bounce turned off. Moving cues get still versions (UA-21). (M3-P23)

### I. Components

**M3-33. One filled (accent) button per screen. At most 3 buttons in any group.** Secondary actions are outlined or text buttons. Labels are 1 to 3 words, start with a verb, fit on one line, and are never narrower than the button. (M3-P24)

**M3-34. Options for the current step are a chip set or a set of plates, never a stack of full-width buttons.** This covers the rule to lock, the words and the responses. There is never a lone chip. Labels are 20 characters or fewer. A selected chip shows a leading check. Chips never commit the step; the main action does (the step model, usability digest 2.0a). Whether a one-pick step may answer on the tap, as in sample p02, is OQ-9. (M3-P25)

**M3-35. When the answer is a person, the person card is the control.** The whole card is tappable, with no buttons inside and no second row of name buttons asking the same thing. A card is either tappable or holds buttons, never both. (M3-P26)

**M3-36. Text over a painting sits on a plate (a bounding shape) or a scrim** that passes M3-14 against the worst patch beneath it, measured as UA-2 sets out. The painting is not shrunk to make room, on any screen. After the critique this is the single rule for art behind text in all six digests; the tint it needs is shown to the owner as OQ-11. (M3-P26)

**M3-37. Things that cannot be tapped must not look tappable.** Status tags (RAC, CNF, WL), counters and notices never use the button or chip outline. *Derived from M3-P8, M3-P24 and M3-P25.*

**M3-38. Notices never sit in the flow.** Draft, sample-data and how-scoring-works notes go behind one chip that opens a modal bottom sheet (half the screen at most at first, closed by scrim, swipe or close, with a 48 px handle). Brief confirmations ("Note saved", "Friend added") use a snackbar: one at a time, at least 4 s and then gone on the next tap or at 10 s, with the same words shown in place as well, and announced as a polite status message (usability digest 2.0b). (M3-P27)

**M3-39. Dialogs only for blocking or destructive choices**, such as wiping the phone's data. The headline is a specific question. There are two actions at most, and the confirming action sits at the trailing edge. (M3-P27)

**M3-40. Navigation bar:** Today, Board and Week, each with an icon and a 1 to 2 word label. The active item gets a filled icon and a pill indicator; the order is fixed; each item has a 48 px target. The bar is the only route to the board (no board icon on the cover). It is hidden while a puzzle is being played. (M3-P28)

### J. Writing and accessibility

**M3-41. Sentence case for all Latin text**, unless the owner keeps Lugdi capitals (OQ-3). No full stop on a single-sentence label. No ellipses in buttons. Exclamation marks only for real wins (a completed week). No em or en dashes. (M3-P31)

**M3-42. Speak to the player as "you".** Never use "my" or "me" on a screen that also says "you" or "your" (so "Confirm", not "Confirm my choice"). (M3-P31)

**M3-43. No codes or research words a player has to decode.** That means no RAC, CNF, WL, "lean size", "check gap" or "consistency" without a picture. Railway and pulp codes may appear as decoration only if the screen still works without them. No "please", "sorry" or "thank you". (M3-P31)

**M3-44. Every string fits when it is 50% longer.** At 200% text size, side-by-side controls stack and padding stays the same. (M3-P30, M3-P31)

**M3-45. One H1 per screen. Reading order matches what you see.** Focus moves to the H1 when a screen arrives. Sheets and dialogs take focus and give it back. (M3-P30)

**M3-46. Accessible names say what a control does, not what it is.** Paintings are hidden as decoration. A portrait shown beside the person's written name is hidden too, so TalkBack does not read the name twice; a portrait shown without its name says the name only, so the alt text adds no loaded words (settled with UA-27, usability digest 2.0c). (M3-P30)

## 3. Broken in the EVAL-13 build

Screens are in `/Users/priyanshu/equal-lens-trainer/out/trainer-shots/`. Code references are to the build at commit 7902955 and were read, not changed.

| M3 rule | Screens | What is wrong |
|---|---|---|
| 1, 3 | 048, 052, 056, 058 | There are tokens, but no object components. The copy says "Tap a ticket to punch it" (048) and the menu names "Card tickets" and "Departure board" (058), but every day draws the same yellow rows. No component had a spec page with states. |
| 5, 6 | all screens; `tokens.css:69-76` | Eight sizes (12, 13, 15, 17, 22, 28, 36, 44) with 1 and 2 px steps, none taken from a scale. |
| 7 | 020, 024, 048, 052 | The question ("Spend up to three checks…", "Pick the six for tonight.") and the status ("Checks left: 3", "0 of 6 picked") are both 17 px bold, so the eye has no lead. |
| 8 | 003, 006, 028 and other row text; `tokens.css:71` | Body text is 15 px, below M3's 16. |
| 13, 15 | 004, 020, 025, 006, 003 | Yellow means plate, option bar, main button, score box and streak at once. In 004, the three rule options are filled yellow bars that look exactly like the main action. |
| 15 | 001, 009, 017, 021, 025, 028, 034, 049, 053, 056, 057 | The dashed line means disabled button, notice, spent word, spent card, unpicked player, empty slot and "Week closed", where it should mean one thing. |
| 19 | 024 to 025, 052 to 053, 036 | After picks, unpicked players turn dashed and look switched off. In 036, "Neither" is drawn as a person card with an "N" portrait square, as if it were a person. (The arrive screens 012 and 024 do keep cards equal before the choice, which is right.) |
| 20, 21 | 001, 004, 009, 038 (empty bottoms); 005 (2088 px), 024 and 025 (2092 px), 028 (3568 px), 056 (3598 px), 057 (3208 px) | The main action floats wherever the content ends: dead space on short screens, and on long ones a scroll before the action can be reached. Sunday and the board are long reports. |
| 20, M3-P29 | 003, 029, 055 | The Today hub stacks Play, road name, practice, streak and a language button on one screen, so it has no single task. |
| 22 | 001, 004, 020, 030, 060 (bars measure 40 px of fill inside 2 px edges, 44 px in all); 016, 040 (word tokens); 003, 006, 057 (nav items) | `--tap-min` is 44 px (`tokens.css:92`), used for choices (`choices.css:26`), words (`words.css:19`, `:42`) and nav (`nav.css:7`). M3 asks for 48. |
| 25, 26 | every screen (shown on a laptop) | No hover state anywhere: there are 0 `:hover` rules in `src/ui/*.css`. Pressed is a 2 px shift and outline, with no state layer. Only the global focus ring exists. |
| 27 | 004 (two disabled buttons stacked), 008, 012, 016, 020, 024, 036, 040, 048, 052, 059, 060, 061 | Disabled is drawn as a dashed outline with a full-strength bold label (`button.css:42-52`), so it reads as an outlined button, not as unavailable. In 004, "Lock the rule" and "Hand out the jobs" are both disabled at once. |
| 28 | 002, 013, 021, 025, 049, 053 | Selected turns ink black with a paper border (`choices.css:45-47`, `person.css:29-32`, `--c-selected: lugdi-ink`). On a dark ground the chosen item gets darker and quieter than the rest. There is no check mark, so the only cue is a reversal in colour. |
| 33 | 057 | Five filled yellow "Add …" buttons, plus "Remove" and "Find", all at high emphasis. |
| 33 | 002, 003, 006, 008 | Two heavy buttons per screen: "Show three more" next to "This is me" (002); the language switch styled as heavily as "Play today's puzzle" (003); "See the board" and "Back to today" (006); "Cut it" and "Keep it" with a red shadow, plus a third, dashed button (008). |
| 34 | 004, 030, 060 (rules); 025, 053 (responses); 002 (names) | Options are stacked full-width bars that look like buttons, where M3 would use a chip set. The approved sample p01 already does this right: a chip row with "✓ Most free time". |
| 35 | 020, 021, 048, 049, 061 | The person cards are tappable, and then a second row of name buttons ("Pammi / Anita / Vikram") plus "Appoint" asks for the answer again. In 005, "Tap a person, then a job" splits one decision across two controls. |
| 36 | 003, 011, 019, 023 against samples ls/shots p01 to p04 | The painting was cut to a 120 px strip to keep text off it (`design.md:104-105`, `masthead.css:54-61`). M3 does not require this: it allows text on images on a plate or scrim that meets contrast, which is exactly what the samples did. |
| 37 | 005 ("Sweets counter", "Lights" tags), 031 (RAC, CNF, WL1), 001 and 009 (dashed boxes) | Status tags are `<span>`s (`Tag.tsx:6`) drawn with a button-like outline. "Line 8 of 8" (009) and "The Hindi is a draft." (001) sit in dashed boxes that look like disabled buttons. |
| 38 | 001, 034, 038, 028, 056, 057 | Notices sit in the flow: "The Hindi is a draft.", "Sample crowd… Made up for this prototype.", "No score today. This one counts quietly in your week." and "Sample board: the other players are made up…" (twice on the Sunday screen). |
| 39 | 058 | "Delete everything on this phone" is styled the same as "Back to the real date". Whether a confirmation dialog follows was not checked (UNVERIFIED). |
| 40 | 003, 006, 028, 034, 056, 057 | The nav has text labels only, no icons. The active item is marked by a thin rule along its top edge instead of a pill indicator, and the target is 44 px. |
| 41 | 002, 003, 004, 006, 008, 012, 016, 024 (Lugdi capitals) | All-caps button labels go against M3's sentence case. The approved Lugdi samples use capitals too, so this goes to the owner (OQ-3) and is not counted as a defect. |
| 42 | 002 ("Pick your road name" with "This is me"), 012, 036 ("Confirm my choice"), 059 ("मेरा चुनाव पक्का") | "My" and "your" are mixed on the same screen. |
| 43 | 028, 056 ("Lean size (of 100 · direction hidden)", "Check gap between matching records", "Word gap between the two notes"), 031 (RAC, CNF, WL) | Research terms and railway codes carry meaning the player needs. |
| M3-P29 with owner rule | 005, 016, 020, 040, 048 | Instruction sentences ("Tap a blank, then a word. Each word fits either note.") do work the interface should do. In 048 the instruction names tickets that are not drawn. |

**What EVAL-13 got right (keep):** reduced motion drops movement and tilt (`tokens.css:124-133`); focus moves to the screen's H1 on arrival (`Shell.tsx:19`); tabular figures for numbers (`ranks.css:24`, `figures.css:25`); a 56 px main button; 16 px side margins; and identical person cards before a choice (012, 024).

**Also seen, outside M3:** 036 and 038 label the transfer day "A new kind of puzzle", though the brief says transfer days are unannounced. Sample shots3 p16 carries the same label.

## 4. Where M3 and the approved look disagree (owner decides)

These are choices to show the owner with pictures, not rules to settle quietly. They now sit in the single owner list in [../ux/journeys.md](../ux/journeys.md):
1. **Capitals on Lugdi buttons**, and **the red offset shadow** (M3 keeps shadows for protection or invitation; in Lugdi it is part of the printed look, and the proposal is to keep it on the one main button only). Both are part of OQ-3, the lettering of Lugdi buttons.
2. **What yellow means** is OQ-7.

Settled, so no longer questions:
- **Alternating yellow and white plates on people.** The owner answered on 20 Oct that cards look the same before a choice. White plates can still appear for objects that are not people (notes, letters).
- **M3's own shapes and colours** (rounded 8 dp chips, tonal purples) are not adopted. Only the structure (roles, scale, sizes, states, timings) is.

## 5. UNVERIFIED or open
- The type weights in the 2026 token database are stored per platform context under labels I could not decode. The weights given above come from the October 2025 web tokens.
- The focus and press state layer is 10% on the 2026 page and 12% in the October 2025 web tokens.
- The flexible navigation bar's height, and button heights beyond small (40) for text buttons, appear only in pictures on the pages. The 32, 40, 56, 96 and 136 dp sizes are confirmed in text for icon buttons only.
- M3 describes Hindi as about 7% taller, but its medium line-height tokens are 10 to 14% taller than Latin. The token values are used here.
- Whether 058's delete action opens a confirmation.

## Sources
- Design tokens: https://m3.material.io/foundations/design-tokens
- Typography (overview, type scale and tokens, applying type): https://m3.material.io/styles/typography
- Colour roles: https://m3.material.io/styles/color/roles ; colour system: https://m3.material.io/styles/color/system
- Grids and spacing: https://m3.material.io/foundations/layout/grids-spacing ; spacing: https://m3.material.io/styles/spacing ; breakpoints: https://m3.material.io/foundations/layout/breakpoints
- States and state layers: https://m3.material.io/foundations/interaction/states ; selection: https://m3.material.io/foundations/interaction/selection ; gestures: https://m3.material.io/foundations/interaction/gestures
- Elevation: https://m3.material.io/styles/elevation ; shape: https://m3.material.io/styles/shape
- Motion: https://m3.material.io/styles/motion/overview ; https://m3.material.io/styles/motion/easing-and-duration ; https://m3.material.io/styles/motion/transitions
- Buttons: https://m3.material.io/components/buttons ; button groups: https://m3.material.io/components/button-groups ; icon buttons: https://m3.material.io/components/icon-buttons ; chips: https://m3.material.io/components/chips ; cards: https://m3.material.io/components/cards ; dialogs: https://m3.material.io/components/dialogs ; bottom sheets: https://m3.material.io/components/bottom-sheets ; snackbar: https://m3.material.io/components/snackbar ; navigation bar: https://m3.material.io/components/navigation-bar
- Accessible design (contrast, structure, flow, elements): https://m3.material.io/foundations/designing ; accessibility principles: https://m3.material.io/foundations/overview ; writing and text resizing: https://m3.material.io/foundations/writing ; usability: https://m3.material.io/foundations/usability
- UX writing: https://m3.material.io/foundations/content-design/style-guide ; global writing: https://m3.material.io/foundations/content-design/global-writing
- Google's web token sources (state, elevation, shape, motion, type scale; filled button, chips, cards, dialog, scrim, navigation bar): https://github.com/material-components/material-web/tree/main/tokens/versions/v0_192
- The snackbar rule (4 to 10 s; on the web, not auto-dismissing without inline feedback) was rechecked against the live content file in the critique (S-11).

## Changes after critique

Applied from [../ux/critique-stage1.md](../ux/critique-stage1.md) on 20 Oct 2026.

- **Ids (should-fix 3).** Principles are M3-P1 to M3-P31 and rules M3-1 to M3-46.
- **Must-fix 1 and 8.** M3-14 adds the 7:1 house target for text on plates. M3-5 replaces Label M (12 px) with Label L (14 px); M3-8 sets the shared 14 px floor and drops the 11 px decorative exception for live text; M3-23 adds 12 px between bordered neighbours.
- **Must-fix 2.** M3-38: snackbars stay at least 4 s, show their words in place and are announced.
- **Must-fix 4.** M3-36 is now the single art rule for all six digests, tested by UA-2.
- **Must-fix 7.** M3-27 no longer draws the main action in M3's faint, unfocusable disabled style; it follows the shared step model. M3-34 points to OQ-9.
- **Must-fix 9.** M3-21 carries the 200% text exception and sends Sunday's shape to OQ-2.
- **Should-fix 1.** M3-40: the tab bar is the only route to the board. M3-46: portrait text alternatives settled with UA-27. M3-31 and M3-32: the shared motion limit and still versions.
- **Should-fix 14.** Section 4 points to the single owner list; the stale alternating-plates question is marked settled.
