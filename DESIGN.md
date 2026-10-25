---
type: design-system
title: Retake, design system
description: The visual system for Retake, recorded from the round 3 component library (design-system/library.css) and the three world modules in design-system/worlds/. Five printed worlds, Lugdi (1970s Hindi pulp covers), Station (Indian railway enamel and Edmondson tickets), Jadugar (the travelling magic show), Cricket (the old stadium scoreboard) and Rukavat (the 1980s family TV), take turns one week each over one fixed skeleton. Tokens, type, layout, depth, shapes, components, the worlds, guardrails and the owner's open choices. The binding behaviour rules are in knowledge/reference/design-rules-consolidated.md.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-19/
  - https://app.plane.so/the-equal-lens/browse/EVAL-18/
  - https://app.plane.so/the-equal-lens/browse/EVAL-17/
  - https://app.plane.so/the-equal-lens/browse/EVAL-14/
  - https://app.plane.so/the-equal-lens/browse/EVAL-13/
status: documented from the round 3 build (21 Oct 2026), the Jadugar, Cricket and Rukavat modules and the owner's decisions O11 to O15 (22 Oct 2026); the build is the source of truth, and this file follows it. The metal finish (O14) is a principle here until the library pass draws it
name: Retake
colors:
  pick: "#FFD23F"
  pick-ink: "#17110F"
  focus-outer: "#FFFFFF"
  focus-inner: "#17110F"
  scrim: "rgba(0,0,0,0.32)"
  lugdi-ground: "#1B0B2E"
  lugdi-ground-deep: "#120720"
  lugdi-paper: "#EFE7D4"
  lugdi-paper-shade: "#E2D7BE"
  lugdi-ink: "#17110F"
  lugdi-title: "#FFF3DC"
  lugdi-red: "#E4002B"
  lugdi-muted: "#4A3B57"
  lugdi-on-ground-soft: "#D9CDEB"
  station-ground: "#181A1B"
  station-ground-deep: "#101213"
  station-raised: "#22262A"
  station-ticket: "#E9DFC4"
  station-ticket-shade: "#DCD0B0"
  station-ink: "#121212"
  station-enamel-white: "#F4F1E8"
  station-cobalt: "#13308F"
  station-flap: "#262626"
  station-flap-hi: "#303030"
  station-flap-seam: "#0B0B0B"
  station-muted: "#3A3D40"
  station-on-ground-soft: "#C9CDD1"
  jadugar-night: "#1A1F4A"
  jadugar-night-deep: "#10132E"
  jadugar-card: "#FBF5E8"
  jadugar-card-shade: "#EFE4CC"
  jadugar-ink: "#17110F"
  jadugar-crimson: "#9E1B32"
  jadugar-gold: "#B08A3E"
  jadugar-emerald: "#1F6B4F"
  jadugar-showgold: "#F2D27A"
  jadugar-muted: "#4A4E80"
  jadugar-on-ground-soft: "#C9CBE6"
  cricket-ground: "#151816"
  cricket-ground-deep: "#0C0E0D"
  cricket-paper: "#F7F5EE"
  cricket-paper-shade: "#E5E2D6"
  cricket-ink: "#151816"
  cricket-chalk: "#EFEDE4"
  cricket-hung: "#222824"
  cricket-green: "#2F5D3A"
  cricket-red: "#B22234"
  cricket-muted: "#3A423D"
  cricket-on-ground-soft: "#C2CBC4"
  rukavat-ground: "#2A2F33"
  rukavat-ground-deep: "#1C2023"
  rukavat-paper: "#FBF4E4"
  rukavat-paper-shade: "#EEE2C7"
  rukavat-ink: "#2A1F17"
  rukavat-teak: "#6B4429"
  rukavat-teal: "#3E7C7B"
  rukavat-teal-deep: "#275453"
  rukavat-orange: "#E2662B"
  rukavat-on-ground-soft: "#C5CDC9"
typography:
  display-lugdi:
    fontFamily: "Sarpanch, Hind, sans-serif"
    fontSize: "2.8125rem"
    fontWeight: 900
    lineHeight: 1.15
  display-station:
    fontFamily: "Hind, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.15
  display-jadugar:
    fontFamily: "Yatra One, Hind, sans-serif"
    fontSize: "2.8125rem"
    fontWeight: 400
    lineHeight: 1.15
  display-cricket:
    fontFamily: "Khand, Hind, sans-serif"
    fontSize: "2.8125rem"
    fontWeight: 700
    lineHeight: 1.15
  display-rukavat:
    fontFamily: "Rozha One, Hind, serif"
    fontSize: "2.8125rem"
    fontWeight: 400
    lineHeight: 1.15
  score:
    fontFamily: "Hind, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.2
    fontFeature: "tnum"
  headline:
    fontFamily: "Hind, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.33
  title:
    fontFamily: "Hind, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.5
  body:
    fontFamily: "Hind, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "Hind, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.43
rounded:
  none: "0px"
  chip: "4px"
  full: "9999px"
spacing:
  s2: "2px"
  s4: "4px"
  s8: "8px"
  s12: "12px"
  s16: "16px"
  s24: "24px"
  s32: "32px"
  s48: "48px"
components:
  main-live:
    backgroundColor: "{colors.pick}"
    textColor: "{colors.pick-ink}"
    typography: "{typography.title}"
    height: "56px"
  main-wait-lugdi:
    backgroundColor: "{colors.lugdi-muted}"
    textColor: "{colors.lugdi-paper}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    height: "56px"
  main-wait-station:
    backgroundColor: "{colors.station-muted}"
    textColor: "{colors.station-ticket}"
    typography: "{typography.title}"
    rounded: "{rounded.chip}"
    height: "56px"
  main-out-lugdi:
    backgroundColor: "{colors.lugdi-paper}"
    textColor: "{colors.lugdi-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    height: "56px"
  main-out-station:
    backgroundColor: "{colors.station-enamel-white}"
    textColor: "{colors.station-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    height: "56px"
  person-card-lugdi:
    backgroundColor: "{colors.lugdi-paper}"
    textColor: "{colors.lugdi-ink}"
    rounded: "{rounded.none}"
    padding: "8px"
  person-card-station:
    backgroundColor: "{colors.station-ticket}"
    textColor: "{colors.station-ink}"
    rounded: "{rounded.chip}"
    padding: "4px 2px 2px"
  chip-lugdi:
    backgroundColor: "{colors.lugdi-paper}"
    textColor: "{colors.lugdi-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.chip}"
    padding: "0 16px"
    height: "48px"
  chip-station:
    backgroundColor: "{colors.station-ticket}"
    textColor: "{colors.station-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.chip}"
    padding: "0 16px"
    height: "48px"
  chip-selected:
    backgroundColor: "{colors.pick}"
    textColor: "{colors.pick-ink}"
    rounded: "{rounded.chip}"
    height: "48px"
  slot-filled:
    backgroundColor: "{colors.pick}"
    textColor: "{colors.pick-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.chip}"
    height: "56px"
  text-button-lugdi:
    backgroundColor: "{colors.lugdi-paper}"
    textColor: "{colors.lugdi-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "0 10px"
    height: "48px"
  text-button-station:
    textColor: "{colors.station-enamel-white}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "0 10px"
    height: "48px"
  switch-off:
    backgroundColor: "{colors.lugdi-paper}"
    textColor: "{colors.lugdi-ink}"
    rounded: "{rounded.full}"
    width: "52px"
    height: "32px"
  switch-on-lugdi:
    backgroundColor: "{colors.lugdi-red}"
    textColor: "{colors.lugdi-ink}"
    rounded: "{rounded.full}"
    width: "52px"
    height: "32px"
  switch-on-station:
    backgroundColor: "{colors.station-cobalt}"
    textColor: "{colors.station-ink}"
    rounded: "{rounded.full}"
    width: "52px"
    height: "32px"
---

# Design System: Retake

Recorded from the round 3 component library: `design-system/library.css` (shared tokens and components, and the Lugdi and Station dress), `design-system/library.py` (builds `index.html` and `preview.html`), `design-system/library.js`, the world modules `design-system/worlds/jadugar`, `cricket` and `rukavat` (`.py` and `.css` each; how they plug in is in [knowledge/architecture/world-modules.md](knowledge/architecture/world-modules.md)), and the rasters in `design-system/assets/`, each with a provenance sidecar. Measurements are in `.impeccable/review/measure.jsonl` (see its `INDEX.md`). The library is published for the owner's review at https://claude.ai/artifact/FXXMLDh6d1XWccVEUzTBku.

Sources:
- Binding rules: [knowledge/reference/design-rules-consolidated.md](knowledge/reference/design-rules-consolidated.md).
- Product truth: [PRODUCT.md](PRODUCT.md).
- Research behind the rules: [knowledge/foundations/](knowledge/foundations/) and [knowledge/ux/](knowledge/ux/).

## Overview

**Creative North Star: "One game, drawn by one hand, in five printed worlds"**

Each day the puzzle happens on a real printed object: a pulp cover, a reservation chart, an Edmondson ticket, a departure board, a luggage tag, a show bill, a hand-hung scoreboard, a TV name caption. The object changes; the skeleton never does. The same top bar, the question in the same place, the same five tappable looks and the one main button pinned at the bottom, with one meaning for every colour.

- **Lugdi weeks** dress the game as the next issue of the "Ghat Series", a 1970s Hindi pulp. A gouache painting fills the phone, the title is printed on it in Sarpanch and worn by an ink mask, and every caption is a newsprint strip with a double ink rule.
- **Station weeks** dress it as Indian Railways ephemera: cobalt enamel plates with chipped white rims, cream Edmondson ticket card with its printed band, split-flap tiles. The Station paintings are regraded to a black and ticket-cream duotone so that blue belongs to the enamel alone.
- **Jadugar weeks** are one night each of a travelling magic show in a small town: people on playing cards, a show bill for the score, a crimson cloth pulled off it.
- **Cricket weeks** are a match at the old stadium under floodlights: scorecards, an over of balls, a hand-hung scoreboard.
- **Rukavat weeks** are an evening in front of the 1980s family TV: name captions, the channel knob, and the "sorry for the interruption" card the world is named after.
- **The worlds take turns, one a week,** in this order: Lugdi, Station, Jadugar, Cricket, Rukavat, then again from Lugdi, so each comes back every five weeks (O12, which replaces O7's two-world alternation). All five share one skeleton to the pixel. Each world is set out under Worlds below.
- **Every world tells its own story** (O15): its own people, lines, cover line and Board name. Lugdi keeps the ghat road; Station gets its own railway puzzle. All of it is drafted for the owner's review.

**The name (O13).** The game is called Retake (रीटेक) everywhere a player sees a name: the home-screen name under the icon ("Retake"), link previews, share cards and the store, whose title is "Retake: a daily fairness puzzle" (several photo apps are already called Retake, and a trademark check comes before launch). "Equal Lens Daily" and "Lens Daily" are gone. The 20-minute starter is the **First take** and each monthly redo the **Next take**. The Equal Lens appears only as a small credit in About.

**Key Characteristics:**
- Five world palettes over one shared pick yellow and one shared focus ring.
- Materials are rasters under live type: enamel and ticket plates are CSS border-images, newsprint, ticket grain and card stock are tiled textures, and the magician's boxes and the announcer's slide are painted plates.
- Hind for every word that is read; each world has at most one display face, for its cover title (Station has none).
- Three radii per world, a fixed eight-step spacing scale, and fixed question and dock positions.
- Every world gains a metal finish true to its own objects and fewer, finer borders, with no glass (O14; see Elevation & Depth).
- Every state is drawn in every world, in Hindi, at 200% text and at 360 x 640.

**What every screen must pass:**
- **One meaning per colour.** Yellow means only "you picked this" and the live button that confirms it [R-VIS-1].
- **3 to 5 people per choice,** all identical before the choice [R-NUM-19, R-CARD-2].
- **Pick, then confirm.** Nothing moves on by itself [R-STEP-8].
- **Almost no reading.** At most 15 words on a puzzle screen and 20 elsewhere [R-NUM-20].
- **The lean is a number on every result,** never its direction [R-LEAN-1, R-LEAN-2]. The one exception is the private results of a First take or Next take (O12); nowhere else, not on a share card or a board.
- **No timers, no countdowns, no shaming,** no research words on screen, and the starter is never called a test, or about attitude or bias [R-COPY-16, R-COPY-17, O9, O12].

## Colors

Each world is a full set of named roles; only pick yellow and the focus pair cross between them. Lugdi and Station are below; Jadugar, Cricket and Rukavat are under Worlds, with their hex values in the frontmatter. In every world the second colour (Lugdi red, Station cobalt, Jadugar crimson, Cricket red and green, Rukavat orange and teal) carries marks and rules, never reading text, and is never the only sign of a state [R-VIS-19].

### Primary
- **Pick Yellow** (pick): the one shared accent. It marks only the person, chip, slot or blank you picked, and the live main button that confirms it. On cards it prints over the stock with multiply, so grain and the ticket band survive. Pick ink on it measures 12.9:1.
- **Pick Ink** (pick-ink): text and marks on yellow.

### Secondary
- **Pulp Print Red** (lugdi-red): Lugdi's second ink. The misregistered layer under the cover title, the roundel rings, spent-check stamps, the forgiven-day mark, the active tab and the rank underline. It is a mark colour, not a reading colour (3.8:1 on the ground).
- **Enamel Cobalt** (station-cobalt): Station's accent, the blue of the enamel plate raster. Chart rules and header, the route-map lines and stops, the ticket stamp, the sheet and dialog top band. Enamel white on it measures 10.1:1, but on the platform ground it is only 1.5:1, so cobalt never sits bare on the ground; it arrives inside a white-rimmed plate or on ticket card and enamel white.

### Neutral
- **Night Violet** (lugdi-ground) and **Deep Violet** (lugdi-ground-deep): the Lugdi ground and the veil over the painting.
- **Newsprint** (lugdi-paper) and **Newsprint Shade** (lugdi-paper-shade): every Lugdi card, caption and option starts on newsprint; the shade is the pressed state and the stacked sheet behind.
- **Press Ink** (lugdi-ink): all text on Lugdi paper, 15.2:1.
- **Title White** (lugdi-title): cover lettering and roundel faces.
- **Not-Ready Violet** (lugdi-muted): the waiting main button, with newsprint text.
- **Soft Lilac** (lugdi-on-ground-soft): resting tab labels.
- **Platform Black** (station-ground), **Platform Deep** (station-ground-deep) and **Board Backing** (station-raised): the Station ground, veils and the flap housing rim.
- **Ticket Card** (station-ticket) and **Ticket Shade** (station-ticket-shade): every Station card and chip starts on ticket card.
- **Station Ink** (station-ink): text on ticket and enamel, 14.1:1 on ticket.
- **Enamel White** (station-enamel-white): white enamel lettering on cobalt plates, the reservation chart, sheets, dialogs, menus and the active tab chip.
- **Flap Black** (station-flap), **Flap Highlight** (station-flap-hi) and **Flap Seam** (station-flap-seam): the two halves and the seam of a split-flap tile.
- **Not-Ready Grey** (station-muted): the waiting main button, with ticket text.
- **Soft Steel** (station-on-ground-soft): resting tab labels.

**Contrast floors** [R-NUM-16 to R-NUM-18]: 4.5:1 for text under 24 px, 3:1 at 24 px and above, 7:1 for text on plates, tickets and buttons, and 3:1 for control edges and state marks. Text over a painting must pass at the darkest and lightest 5% of pixels under each line.

### Named Rules
**The One Yellow Rule.** Pick yellow means "you picked this" and its live confirm, nothing else. Never on Play, scores, the "you" row, streak marks, tabs, the board switch or the focus ring.

**The Blue Belongs to Enamel Rule.** In Station, blue lives only in the enamel and the cobalt marks drawn from it. Paintings are black and ticket-cream duotones; no blue in pictures.

**The Ink or Paper Rule.** Running text is ink on paper, or paper, title white or enamel white on a ground or plate. Red and cobalt carry marks and rules, not reading text.

## Typography

**Display Fonts:** one per world at most, each on its cover title only, with Hind as fallback: Sarpanch 900 (Lugdi), Yatra One 400 (Jadugar), Khand 700 (Cricket), Rozha One 400 (Rukavat). Station has none. All four carry Devanagari.
**Body Font:** Hind 500 and 700 (every word that is read, in every world and both scripts)

**Character:** a world's display face printed once per cover (a square-shouldered pulp face, a painted show-bill face, a narrow scoreboard face, a broadcast title-card serif), against a plain, sturdy Indian sans that carries Latin and Devanagari at the same weight.

### Hierarchy
- **The scales** (22 Oct 2026, owner: "go ahead" on [the golden-ratio ideas](knowledge/ux/golden-ratio-ideas.md) after a trial on the Station step). Type steps by √φ (1.272): **15, 19, 24, 31, 39, 50** (labels, quotes and body 15; names, numbers, titles and the main button 19; the question 24; wide screens one step up for the question, 31; score and Station's name board 39; cover titles 50). Spacing steps by the Fibonacci numbers: **5** inside one thing, **8** parts of one item, **13** items in a list, **21** one group from the next, **34** one section from the next (tokens `--f5` to `--f34`). The 16 px screen edge, 48 px tap targets, 1 to 3 px hairlines and room kept for a mark (36 px and up) stay off the scale. `tools/phi_apply.py` moved every padding, margin and gap onto it; new rules use the tokens. 200% text keeps its own sizes. Checked by the scroll census (no normal-size screen scrolls more than before; 31 scroll instead of 39), `tools/space_audit.cjs` and the broken-word scan.
- **Card portraits are 5:4 landscapes** (owner, 22 Oct 2026: "go for 5:4 landscapes for portraits"), in every world, language and size, including a card on its side; faces in rows and avatars stay square. The week's day paintings are the golden portrait (1:1.618). Real objects keep their own shape: Jadugar's playing cards 5:7, the share card 4:5 (the social platforms crop to it). The cost, accepted: the four-card steps run 55 to 108 px past a 390 x 844 phone (Rukavat's still fits), so any body that overflows shows the fade at its foot and the round "more" cue above the dock, set live by library.js and gone when the body is scrolled to its end.
- **The private reading** (owner, 23 Oct 2026: "Build the first take results page") is five cards after chapter 5, each one picture on its own ground plate over the world's painting, and one line in the question box. The cards follow first-take.md "The results":
  1. The two piles of picks, with woman and man under them. Height carries the side, never colour.
  2. One matched pair across both decisions of a twin: the pick is in pick yellow, and the swapped word is tagged under the person who carried it.
  3. The painting of the area that leaned most, with its real-life line.
  4. Two cards trading places.
  5. Five chapter marks, with "Not you? Remove this reading" as a text button.
  The page works the cards out from the player's own picks and sends nothing. No lean score shows until the research line sets one. Hard twins never appear on cards 2 or 3. The styles are `.respic` in `library.css`, and the library's "First take" section shows the cards with the draft's samples.
- **Every card on a step is the same size.** Three or five people sit in the same two columns as four, with the odd card centred under the rest, never one card stretched across the width. A bigger face draws the pick, which is exactly the lean the game reads. (22 Oct 2026: the First take demo's three-person steps first drew one card full width.) At 200% text all cards stack in one column.
- **The golden lines** (idea 4, 22 Oct): 38.2% and 61.8% down the phone. Covers and chapter cards put the title on the lower line (the painting takes the large golden rectangle above); results put the score on the upper line (the details take the large rectangle below). Set with container-height units on `.phone` and measured per world (`library.css`, end); a block stays put where its line would push it into the button. Not moved, by design: Station's cover (its name-board stack is too tall), Rukavat's cover (2% above the line, moving down would hit the button), Cricket's cover (the name board hangs at the top of the ground) and Station's result (the score is printed on the arrival ticket at the foot).
- **Display, Lugdi** (Sarpanch 900, 50 px, 1.15; Devanagari 1.3): the cover title, printed on the painting with a red then black misregistered layer and worn by the ink mask. Never on a puzzle step. In Devanagari the mask is dropped.
- **Display, Station** (Hind 700, 39 px, 1.15; Devanagari 1.3): the station name on the enamel name board only.
- **Display, Jadugar** (Yatra One 400, 50 px, 1.15; Devanagari 1.3): the cover title, lettered in show gold on the crimson banner. Nowhere else (the chapter title card is an open choice).
- **Display, Cricket** (Khand 700, 50 px; Devanagari 1.3): the ground's name on the cover name board. By default Khand 600 also sets the scoreboard numerals, which is an open choice because the rule keeps a display face to the cover title.
- **Display, Rukavat** (Rozha One 400, 50 px, 1.15; Devanagari 1.3): the programme title on the cover's broadcast title card only (the chapter title card is an open choice).
- **Score** (Hind 700, 39 px, 1.2, tabular; Devanagari 1.4): the one score per result, in the roundel or on flap tiles.
- **Headline** (Hind 700, 24 px, 1.33; Devanagari 1.4): the question, the screen's H1 on a step. Nothing else on a step is as loud.
- **A card's numbers sit on its foot** (owner, 23 Oct 2026: "align the stats to the bottom of the card"). The order runs face, name and serial, then the line, then the numbers. The line takes the spare room, so the numbers line up across a row however the name wraps or however long the line is. On wide screens the numbers sit at the foot of the text column beside the face. The exception is Rukavat. Its name sits in a fixed band across the picture, so its numbers, just under the band, already line up across a row.
- **A note on a card is marked with a rule, never a box** (owner, 23 Oct 2026: "Remove the box around the quote"; the card is the one frame). Each world draws its rule as its paperwork does: Station, a perforation; Lugdi, a red margin rule; Jadugar, one gold rule above, on the card's one left edge, never centred; Cricket, a thin line; Rukavat, a dotted edge. On a row, the numbers stay on the name's line and the note runs the full width under both (owner, 23 Oct 2026: "Align the stats with the name so the quotes can run end to end"). The name and its note sit 5 apart, as parts of one item. These styles live in `library.css` with the cutscene, progress and rank parts, and the library's "First take" section draws them from the First take itself (`demo.py sketch` writes `parts-first-take.html`, which `library.py` embeds).
- **A cutscene's header holds only "?" and Skip** (owner, 23 Oct 2026: "too many things in the header", then "put language in the ? menu" and "Sound should also go in the ? menu"; before, the panel dots, the sound switch, the language menu and Skip shared one row and the last dot slid under the sound switch). "?" sits left and Skip right, a plain underlined word, never boxed. The panel dots sit centred over the Next button, 13 apart. Every screen carries its "?" sheet, the quiet one the owner chose (23 Oct 2026, option C of three): one line of how to play, then the languages as chips beside the language icon, then one Sound switch for music and effects ("Sound should also go in the ? menu"), each row under a hairline. No title, no picture steps. The drag handle sits in the sheet's middle: a 48 spacer on the left balances the close on the right ("The cross is making the tab handle off centered").
- **Rank shows the place where the tick goes** (owner, 23 Oct 2026: "The rankings need to be more clear"; before, the place sat after the numbers and read as a third one). The place is type, never a disc or puck (one frame per level): Hind 700 at the headline's size, because it stands in for the pick mark as one glyph, never a line; in the world's accent, and in ink on a seat's pick colour. No tick is drawn on a rank row. Ranked rows move up into their order as they are tapped (240 ms; none under reduced motion) and the rest keep their shuffled order under them. Once the seats are filled, a perforation with an up arrow and the seat count ("2 seats") falls under the last seat, in the ground's text colour. The library's "First take" section shows it standing still with three places given.
- **Person card ladder** (22 Oct, owner: "the text hierarchy also needs to be better"; before, the numbers were as loud as the question and the name as small as the quote): **Name** (Hind 700, 19 px, 1.3), then **Numbers** (Hind 600, 19 px, tabular; Cricket's Khand at 1.08x), then **Quote** (Hind 400, 15 px, 1.5, ink at 82%). Tokens `--t-name`, `--t-stat`, `--t-quote`, scaled with the rest at 200% text and on wide screens.
- **Title** (Hind 700, 19 px, 1.5; Devanagari 1.5): names in rows and slots, button, chip and slot labels, plates, toasts.
- **Toasts** have even padding (16 px each side) unless they carry a text button such as Undo, which brings its own 48 px target and so sits 6 px from the right edge; that button never has a box of its own on the toast in any world (22 Oct: the owner caught uneven padding and a second box behind Undo).
- **Body** (Hind 500, 15 px, 1.5; Devanagari 1.5): the lines people say outside a card: voice balloons, the cover line, definitions and letters (a card's quote is Quote, above).
- **Label** (Hind 15 px, 1.43; Devanagari 1.43): 700 for tab labels, mastheads and plates; 600 for the speaker's byline and a card's serial (the serial at 70% ink); 500 at 85% for the stat key, which only explains.

At most 4 styles on any screen. Sentence case everywhere (the OQ-3 default).

### Named Rules
**The 500 Is Speech Rule.** Weight 500 appears only in Body, the lines people say. Everything else is 700.

**The One Cover Title Rule.** A world's display face appears once per cover, on the title, and nowhere in a puzzle step. Sarpanch is worn by the ink mask on Lugdi's cover; Station has no display face, and its board name is Hind 700. Cricket's scoreboard numerals and the Jadugar and Rukavat chapter title cards are the open exceptions (see Open owner choices); until the owner chooses, only the numerals carry one.

**The 14 Floor Rule.** Nothing is set under 14 px, in either script (measured: no text under 14 px on any phone). At 200% every role scales from its own variable.

## Layout

One skeleton, one column, 16 px gutters, measured at 390 x 844:

| Zone | Position | Contents |
|---|---|---|
| Status inset | 44 px | Above the top bar |
| Top bar | 56 px tall | Back (48 round), the day plate as the bar's title, "?" (48 round). Cover: streak count and "?" (its sheet holds the languages) |
| Question | top at 104 px on every puzzle step, in every world and in Hindi | Headline in a caption box |
| Body | scrolls internally only where a choice allows it | Plates, people, chips, slots, objects; 12 px between parts, 8 px in Hindi and on small phones |
| Dock | top at 748 px on every puzzle step | One main button, 56 tall, padded 16, 16, 24 |
| Tab bar | 64 px; tab screens dock at 682 px | Today, Board, Week. Absent on puzzle steps |

- **Spacing** uses only 2, 4, 8, 12, 16, 24, 32 and 48 px.
- **People per choice:** 2 or 4 as a two-column grid of tiles; rows for checks, team and the assign tray (88 tall, 64 compact; Station 80).
- **Small phones (360 x 640) and 200% text** scroll once, with a round cue over a 56 px fade at the foot of the body. At 200%, grids collapse to one column.
- **Word budget,** measured: at most 15 words on a step and 20 elsewhere; every target at least 48 px.
- **Reach:** the top third holds what is read, the middle the choices, the bottom band the action [R-NUM-27]. Choices that are not a grid sit at the foot of the body, above the dock.

### Larger screens
One page that rearranges itself by the space it gets (container queries on the app frame, so the same rules hold in a resized window). The painting fills the screen at every size; nothing is blurred.

| Format | Painting | Game | Tabs |
|---|---|---|---|
| Phone, upright | the portrait painting (`-l` where one exists) | the skeleton above | tab bar |
| Tablet, upright (600 wide and up, taller than wide) | the larger portrait painting | gathered low, at most 760 wide, so the top of the picture stays clear; cards turn on their side | tab bar |
| Anything wider than tall (700 wide and up) | the wide painting (`-w.webp`, 1440 x 810, subject in the left third) | a column on the right, `clamp(420px, 50%, 760px)` (half and half: the game and the painting share the width, owner 22 Oct; a phone on its side keeps 60% so all four people fit), over a dark fade (82% ground) that starts just left of it | a 96 px rail on the left |
| Short and wide (520 tall or less: a phone on its side) | the wide painting | a wider column (60%), headline 1.25rem, 8 px gaps, 56 px faces; four people scroll once | rail |

- **Cards on their side:** once the game column is 440 wide the person card puts the portrait left of the name, numbers and quote (80 px face); from 600 wide the face is 112 px.
- **Cover and result:** the masthead and roundel sit at the top of the column, the title and the result card low, like a printed cover. **Sunday and Board:** the week or friends list moves to the open left side, over a lighter fade (45%), and the game keeps the right column.
- **Type steps up one notch** when the frame is at least 760 wide and 700 tall (headline 1.75rem, body 1.125rem).
- **Puzzle steps** centre the question, people and dock in the column instead of pinning them to 104 and 748.

### Named Rules
**The Fixed Skeleton Rule.** On phones: question top at 104 px and dock top at 748 px on every puzzle step; tab screens dock at 682 px. A world changes its dress, never its places.

**The Full Painting Rule.** The day's painting fills the whole screen at every size. Text sits on plates or on a dark fade, never on a blur, a frosted panel or a letterboxed phone.

## Elevation & Depth

Depth is mostly printed. Three heights: the ground (with its painting), plates and cards on it, and overlays (sheet, dialog, menu) over the 32% scrim. Since O14, one light source, high on the left, lights every screen, and physical objects may sit on a soft, light shadow (see the relaxed rule below).

- **Lugdi** cards and captions are flat newsprint with ink rules. Pressing shifts a card 2 px down and right and thickens its frame to 4 px; arming lifts it 6 px with a ring. The paper stack shows two sheets behind at 6 and 12 px.
- **Station** tickets sit flat on a 1 px dark hairline. The live main button has an enamel lip (an inset 4 px dark band at the foot) that shrinks to 1 px when pressed. Enamel depth, rims and chips are painted into the plate raster.
- **Jadugar, Cricket and Rukavat** are flat in the build: gold rules on card stock, plates hung on two nails with a chalk rim, cream cards with teak bezels. None carries a hard offset.
- **Overlays** keep their lift and the strongest shadows.

### Metal and borders (O14)
The owner's decision of 22 Oct 2026, from the premium study ("I like the metal treatment of the premium look and less borders... glass is not doing a lot"). It applies to all five worlds. This section holds the principle; the per-world detail follows the library pass, and the frames, rules and shadows described elsewhere in this file are the round 3 build until then.
- **A metal finish in every world,** true to that world's own objects, never a generic chrome. The study's first two: Lugdi gets a foil-stamped title, a brass issue badge and paper stock with a laminate highlight; Station gets glossy enamel in a polished steel hairline rim and split-flaps of brushed aluminium. Jadugar, Cricket and Rukavat get theirs in the library pass.
- **One light,** high on the left, for every highlight and shadow on every screen.
- **Fewer and finer borders.** Heavy ink frames become hairlines tinted from their own surface, and most double rules go. Each world keeps only the one rule its identity needs.
- **No glass.** The tab bar, the round buttons, the switches and the "?" sheet stay solid. Nothing is frosted or blurred behind.
- **Kept from the study, unless the owner says otherwise:** its extra breathing space, and soft, light shadows under physical objects.
- The study's files are `design-system/explore/premium-lugdi.css` and `premium-station.css`.

### Shadow Vocabulary
- **Ticket hairline** (`box-shadow: 0 0 0 1px rgba(0,0,0,.55)`): Station cards, plates and slips on the ground.
- **Enamel lip** (`box-shadow: inset 0 -4px 0 rgba(0,0,0,.28)`, pressed `inset 0 -1px 0 rgba(0,0,0,.28)`): the Station live main button.
- **Sheet lift** (`box-shadow: 0 -12px 24px rgba(0,0,0,.28)`): sheets rising from the bottom.
- **Menu lift** (`box-shadow: 0 12px 24px rgba(0,0,0,.35)`): the board row menu.
- **Focus ring** (`outline: 3px solid #FFFFFF; outline-offset: 2px; box-shadow: 0 0 0 5px #17110F`): every focusable part, every world. A new screen's heading (a cutscene's frame) takes the focus when the screen changes, so a keyboard or a screen reader starts there; it is not a control, so it draws no ring (EVAL-19).

### Named Rules
**The Printed Not Lit Rule (relaxed by O14).** Edges are still printed: ink rules, hairlines, frames or painted rims. Physical objects (the cards, tickets, bills, boards and plates a world prints) may now sit on one soft, light shadow, about 6 to 14 percent, cast from the one light high on the left. Type, flat controls and the ground never carry one, no shadow is ever a hard offset, and overlays keep their lift.

**The Misregistration Rule.** Lugdi's red and black offset is a print shift. It appears on the cover title, worn by the ink mask, and under exactly one control: the live main button's 4 px red print edge (`--main-offset`), the single offset R-VIS-22 allows (the OQ-3 default). No other control carries an offset. The round 3 finish review reads the button's edge as neobrutalist, so whether to keep it is an open owner choice (see the table below).

## Shapes

Three radii per world, and nothing else:

| | Lugdi | Station |
|---|---|---|
| 0 | Cards, captions, plates, the main button, the text button, sheets and dialogs | The day count plate, enamel plates (the raster carries their corners), text buttons |
| 4 | Chips, slots, blanks, voice balloons, the board switch | Tickets, chips, slots, flap tiles, the chart, sheets, dialogs, the main button |
| Full | The issue roundel, the score roundel, stamps, portraits, round icon buttons | Punch holes, route stops, portraits, round icon buttons |

- **The new worlds** keep to three radii too: square, one soft corner of their own, and round. Jadugar's soft corner is the playing card's (cards, chips and slots), Rukavat's the TV screen's (screens, cards and controls), and Cricket keeps the small 4 for chips, slots and buttons with square scorecards and boards. The values are in each world's CSS.
- **Frames:** Lugdi controls carry a full 2.5 px ink frame; Lugdi captions carry only the double rule above and below. Station frames are 1.5 px. These thin to tinted hairlines in the library pass (O14), each world keeping only its one identity rule.
- **Dashes** mean one thing: an empty slot or blank (2 px). A valid target turns the dash solid at 3 px.
- **Holes by mask:** spent checks, played Sunday slips and the big ticket's notches are cut through the card with a radial mask, so whatever is behind shows through.
- **The luggage tag** is clipped with 24 px corner cuts and an eyelet ringed in the accent.
- **Negative space** (22 Oct audit of all 224 phone screens, `design-system/tools/space_audit.cjs`; run it after any layout change):
  - One side edge: the top bar's buttons stand on the body's 16 px gutter, like everything under them; 8 px of air below the bar.
  - Text is centred by the fonts, never by hand: `fonts.css` (made by `tools/fonts.py`) re-balances Hind's and Khand's ascent and descent so capitals sit in the middle of every button, chip, row and plate. Boxes take equal top and bottom padding; no `padding-top` nudges.
  - A row you can pick keeps 52 px on its right for its mark, before and after the pick, so nothing moves; the tick or the held arrow sits centred in it, 6 px from the edge, 7 px clear of the numbers. A row you cannot pick (the check rows) keeps 13 px, so its name never runs into its numbers (22 Oct: the tick covered the numbers; Rukavat's name tag ran into them).
  - A face in a list row keeps 8 px clear of the row's edges (48 px face in a 64 px row); a held row's arrow sits inside the row with 7 px to its numbers; a person's face sits 6 px from their name and 20 px from the job.
  - A word never breaks mid-word; a long name pushes its serial to the next line.
- **Hindi line heights** (22 Oct, owner: "more top bottom spacing than required"): the re-balanced Hind already holds the vowel marks, so running Hindi takes 1.5, one-line names 1.3, the question 1.4, labels 1.43, and digits keep 1.33. With this, the Hindi steps fit without a scroll.
- **Three language modes and a menu** (owner, 22 Oct 2026). **Hinglish**, the original and the default: English words, Hindi on the signs (the Station name board's Hindi line, Rukavat's interruption slide with an English caption). **हिन्दी**: every string in Hindi. **English**: no Hindi anywhere (the board shows only its English line; Rukavat's slide is the one lettered in English, `art/rukavat_slide.py en`). The phone carries `data-mode` = `mix`, `hi` or `en`. The switch lives in the "?" sheet (owner, 23 Oct 2026: "put language in the ? menu"; before, a top-bar menu): a row of chips beside the language icon, each language named in its own script, the current one filled in ink; chips are 44 tall and wrap onto more lines as languages are added ("Languages will scale to other languages"; the library shows eight). The chips are pressed buttons, not radios, because a step reads a checked radio on its screen as the pick. A new language is one more row in `LANGS` (library.py) and its strings.
  - **English says Hinglish's Hindi words in English** (owner, 22 Oct 2026: "'Udti Khaat', 'Purana Maidan' etc make sense in hinglish but not in english"). The titles become Flying Cot, The Box's Secret, The Old Ground, A Deal on the Ghat, Night in Court, Dadi's Chair and The Verdict; the barker's "Dekhiye, dekhiye!" becomes "Roll up, roll up!"; "chacha" becomes "uncle". An English title keeps about the Hinglish one's length, so its plate covers no more of the painting. Names stay in every mode: people, towns, the Chandni Mandal troupe and the players' road names on the Board. The pairs live in `ENG` (library.py), which gives each string a `data-eng` that English only shows.
- **One frame per level.** A thing inside a framed board, card, row or slot keeps its type and colour but never its own frame, plate, puck or screws: numbers, ranks and place numbers are type; the score's digits drop onto the board itself; in the lean row only this week is framed; the cricket week is balls and letters on the board, the Station week one slip split by perforations (each day its letter over its punched hole or "off" stamp). A selection may frame a row inside a board ("You"), and a portrait keeps its hairline. (22 Oct: the owner, "the box in a box is not looking good... there are multiple instances": the cricket score plates, number plates on cards and rows, rank boxes on three boards, Rukavat's rank pucks and You tag, the framed weeks.)
- **Icons** are filled shapes on one 256 grid (`design-system/icons.py`: Phosphor Icons, MIT, fill weight for things and numbers, bold for controls that are only a mark; the cricket bat and stumps drawn there to match), at 20 to 32 px; never emoji or text glyphs. A number's icon names what it counts without the key: steering wheel, warning sign, train, signal, theatre mask, crossed-out date, stumps, trophy, plasters, clock, wrench, notebook, cup. On cards and rows each world tints them: Lugdi pulp red, Station enamel cobalt, Jadugar crimson, Rukavat TV teal (each 3:1 or more on its card); Cricket's stay chalk in their scoreboard boxes; on dark plates they take the plate's text colour. (22 Oct: the owner asked for "a lot better" icons than the 2 px outline set, which read as specks beside the numbers and needed the key.)

## Components

Five tappable looks and nothing more: the main button, the person card (tile or row), the chip, the slot and the secondary text button. The top bar, the tab bar, the board switch and the level switch are navigation. Every component is drawn in every state, in every world, in the library, except the level switch and most of the First take screens, which are still to be drawn; the rule ids in knowledge/reference/design-rules-consolidated.md give the behaviour.

### Buttons
- **Main button:** full width less the gutters, 56 tall, Title type, icon at 20 px. Lugdi corners 0, Station 4.
  - **Wait:** muted fill, a 2 px paper or ticket outline, and a label naming what is missing ("Pick 2 more").
  - **Live:** pick yellow, a verb-first label naming the consequence ("Send Kamla"). Pressed moves 2 px.
  - **Committing:** stays down for 260 ms while the unpicked people dim to 55% and lock.
  - **Outside a puzzle** (Play, Continue, See your score, Share): Lugdi prints a newsprint coupon with a triple ink frame; Station uses the white enamel plate raster (`plate-enamel-white.webp`) with ink text. Never yellow. After a share falls back to copying, it reads "Copied" until the next tap.
- **Secondary text button:** 48 tall, Title type, a 2 px underline 5 px below. On Lugdi it sits on a newsprint strip; on Station on a dark veil. Destructive actions take a double underline and an alert icon, never a fill.

### Chips
- **Style:** 48 tall (56 when stacked), Title type, paper or ticket fill, a 1.5 px ink frame, 4 px corners, icon 20 px.
- **State:** pressed shifts 2 px with a 3 px frame and the shade fill; selected is pick yellow with a 3 px ink frame, an outer paper ring and a tick. A chip never commits a step.

### Cards / Containers
- **Person card, Lugdi:** newsprint with grain, a 2.5 px ink frame, 0 corners; a 16:9 portrait, name and serial, stat numerals in Headline, an optional quote in Body.
- **Person card, Station:** the Edmondson ticket raster (`plate-ticket.webp`) as a border-image with its printed band at the top, a 1 px hairline, 4 px corners.
- **Picked:** a pick-yellow layer multiplied over the stock, a 3 px ink frame, an outer paper ring and a round tick at the top right. Unpicked cards never change.
- **Armed** (held for a slot): lifted 6 px with a double ring and a dark arrow mark. **Revisited:** a small padlock top left. **Refused:** a 260 ms side shake and a one-line reason ("Team is full").
- **Rows** use the same look as tiles, in a line: a 72 px square portrait, name and stats, spent checks on the right.
- **Stats:** a Headline numeral with a 20 px filled icon; one shared key per set, its icons repeated on every number, each label one word [R-STAT-1].
- **Captions and plates:** Lugdi captions (question box, plates, stat key, byline, band, next line) are newsprint strips with a double ink rule top and bottom. Station words sit straight on the platform; small plates are enamel (the day count) or ticket card (panels, the next line, the result).
- **Voice:** a named speaker's portrait and a speech balloon on the ground; loaded words appear only in a named character's mouth [R-QUOTE-1, R-VOICE-1].

### Inputs / Fields
- **Slot:** 56 tall, Title type, 4 px corners. Empty is a 2 px dashed edge on a dark veil; target turns solid at 3 px; filled is pick yellow with a 3 px ink frame, the person's portrait and a tick; refused shakes and says why ("Lamps is full"); revisited adds a faint tint.
- **Text field:** paper fill, a 2 px inset ink frame, 4 px corners, Body type, no placeholder, the hint "Stays on this phone, never sent"; error swaps the frame for 3 px of the accent and says what to do.
- **Switch** (the "?" sheet's Settings view only): the whole 48 px row is the control (`role="switch"`), with a 24 px icon, a one-word Title label and a 52 x 32 pill.
  - **Off:** paper (Lugdi) or enamel white (Station) with a 2 px ink frame and the ink knob on the left.
  - **On:** the world's accent (Lugdi red 3.9:1 on newsprint, Station cobalt 10.1:1 on enamel), the knob moved right in paper or enamel white, and an ink tick in the knob, so on never rests on colour alone. Never yellow.
  - **Motion:** the knob slides in 160 ms; under reduced motion it jumps. **Hover:** the frame thickens to 3 px. **Lines:** none under a switch.
  - The view lists Music, Sounds, Vibration and Reminders, then the Road name and Privacy links, in 8 words. One level into the sheet, it fills half the screen (52% in Hindi).

### Navigation
- **Top bar:** 56 tall; round 48 px icon buttons on a dark veil. The day plate is the bar's title: a newsprint double-rule strip in Lugdi, a cobalt enamel plate raster (`plate-enamel.webp`, 10 px border-image) with enamel-white Title type in Station. On the cover: the day count ("Day 6", an enamel plate in Station) and "?", whose sheet holds the languages.
- **Tab bar:** 64 tall, three tabs, Label type, 24 px filled icons. Lugdi tops it with an ink and red rule and marks the active tab with a red icon and a red underline; Station tops it with an enamel and black rule and sets the active icon in an enamel-white chip.
- **Board switch:** a two-part segment, 48 tall, the chosen side filled with paper or enamel white and a tick, with the period switch (Today, This week, All time) beside it and the level switch under it (see Levels). The board opens on Friends; Everyone shows the band, the top 3, then two above and two below you. A tap on a row opens one action, "Add as a friend", with Undo in a toast. The board switch never uses yellow. The languages are rows in the "?" sheet (see "Three language modes").

### Levels: Easy, Medium and Hard
Three dailies a day, one per level, on top of a calendar that gets harder for everyone (O12). Not yet drawn in the library; until then its covers still print "Level 3 of 6", which goes.
- **The cover's level switch:** three segments, Easy, Medium and Hard, built like the board switch (48 tall, the chosen one filled with the world's paper and a tick, never yellow). It appears from the first done cover on, and on the first cover after a fresh First take reading; never on the first-visit cover before that, and never on a Sunday cover. A tap shows that level's cover in place (Play, Continue or done) and is remembered; new players start on Easy. The cover is the one place a level is chosen.
- **States:** a tick on each level played today, also said in its name (never colour alone); a level in progress reads Continue on its cover; once, after a fresh First take reading, one segment carries the word "Suggested", with no grade and no reason, and the remembered level stays until tapped; the ticks clear when the day changes. In Hindi it fits one line at 360 wide; at 200% the segments stack, each at least 48 tall.
- **No level number,** no "Level 3 of 6" and no sign of the calendar getting harder. "Level" now means only Easy, Medium or Hard.
- **Boards by level:** each level keeps its own Today, This week and All time, so nine boards in all; a level's score and practice count only there. On the Board the level switch is its own full-width row under the Friends and Everyone switch and the period switch, on every period, so nothing moves when the period changes. It opens on the cover's level every time, keeps the chosen level when the period changes, and never changes the cover's level. The three switches take 10 of the Board's 20 words.
- **The streak** counts a day if any one level is played.

### Enamel Plate (signature)
A border-image raster under live type: the cobalt plate with chipped white rim for the name board (26 px slice), the day count (8 px) and the day plate (10 px); a white variant for the main button outside a puzzle; a yellow variant used only in the A/B choice for the board colour.

### Split-Flap Tiles (signature)
Two flat halves (flap highlight over flap black), enamel-white numerals in tabular Hind 700, and the seam drawn behind the numeral so it never cuts the figure. Housed in a dark box with a raised rim for scores; smaller in departure rows, which sit inside an enamel-framed board.

### Spent Checks (signature)
Lugdi: a red ring stamp at a 12 degree tilt, with a struck icon. Station: a hole punched through the ticket by mask, one or two per row.

### Day objects
- **Lugdi:** the poster cover with masthead strip and issue roundel (an issue number, never a price), newsprint caption strips, the job page, the letters page, the gossip stack, the readers' poll, the bestsellers list, the back cover (Sunday) and the score roundel.
- **Station:** the enamel name board, the Edmondson ticket, the punched ticket row, the split-flap row, the reservation chart, the luggage tag, the route map, the PNR slip (Sunday) and the stamped "Arrived" ticket.
- **Jadugar, Cricket and Rukavat:** see Worlds below.
- Railway and pulp codes (PNR, serials, issue numbers, show numbers) are decoration only and hidden from screen readers.

### Hover (pointer devices only)
Hover exists only under `@media (hover: hover) and (pointer: fine)`, so touch never sees it, and it never replaces focus (the two-tone ring) or pressed.
- **Person card:** lifts 2 px; Lugdi thickens the ink frame to 3.5 px, Station adds a 2 px ink frame inside the ticket.
- **Main button, live:** Lugdi's red print edge grows from 4 to 6 px; Station's enamel lip deepens. **Outside a puzzle:** Lugdi shades the coupon; Station dims the enamel slightly.
- **Chip:** the frame thickens to 2.5 px. **Slot:** an empty slot's veil lightens; a filled slot's frame thickens. **Text button:** the underline thickens to 3 px. **Icon button, tab, board switch, language chip, board row:** a light wash or a brighter label.
- A pointer shows the hand only on controls; information never changes under the pointer.

### Web and installed app (PWA)
- **Browser on a laptop or desktop:** the wide layout in Layout, Larger screens. The browser bar takes the world colour each week (`theme-color`).
- **Laptop windows are often shorter than phones** (1280 x 650 is common with the browser bars): the column fits four people with their cards on their side, and a step scrolls once with the cue only when the window is shorter still.
- **Installed:** its own window with the world-coloured title bar; on phones, a launch screen of the ground colour and the icon.
- **Install offer:** one sheet, once, after the third day. Android installs in one tap; iPhone shows the two taps (Share, then Add to Home Screen). "Not now" is as plain as Install, and it never asks again.
- **Icon:** one icon for every world (default: the day's ticket, a cream Edmondson ticket with a cobalt band and a red equals stamp, on night violet). No Equal Lens logo.
- **Name:** "Retake" under the icon (six letters, never cut), on the launch screen, in the installed window's title bar and as the reminder's sender. The store title is "Retake: a daily fairness puzzle" (O13).
- **Reminders:** off until the player turns them on; at most 8 words, naming only the day's object [R-COPY-30]. On iPhone they need the installed app.

### The report over time
The report never shows which way a player leans, and never uses the word "bias" on screen.
- **Day 1:** the result shows every number, pulled towards zero while there is little to go on, with one line once: "Your numbers settle over your first week." The Week tab waits for Sunday.
- **First Sunday:** the week's six day objects, consistency, practice and the lean, then the look-again pair.
- **Second Sunday onwards:** weekly lean values side by side as printed stubs (newsprint or ticket), the first two weeks shaded as the baseline, the current week framed. No arrows, no colours, no lines; "Too early." until a change can be called.
- **A month:** a three-card recap (in Station, a monthly season ticket): the four weekly values with a plain reading ("Lower for 2 weeks. A change needs 3."), days played, practice and the best streak, and one tap on what the player noticed.
- **A real change:** the lean stays below the first two weeks by more than its normal wobble, three Sundays running (the exact line comes from the research line, RSE-164). Four cards: the stamp "3 weeks running" with the weekly values; "Puzzles get harder from Monday" with the next level and an honest warning that harder puzzles may raise the lean again; "What helped?"; and an optional, private "Did something like this come up?" that is never scored or shared. The same calm words if the lean stays higher instead, and no one else ever sees either.

### First take and Next take
The optional 20-minute starter (O12, O13): five chapters of about 4 minutes, one in each world, always in this order: Station (work), Lugdi (safety and justice), Jadugar (trust), Cricket (teams and leaders), Rukavat (home and family). It is never on a board, adds no practice and does not count for the streak. On screen it is never called a test, or about attitude or bias. Only the chapter title cards are drawn so far, in Jadugar, Cricket and Rukavat.
- **The offer.** On the first-visit cover, "First take" is a quieter text action under Play, which stays the one main button; never a second main button, never a sheet. Begun, it reads "Continue your First take" until the first daily result. After that it lives on the Week tab: "First take" with one small picture of the five worlds; begun, the five chapter marks with the finished ones filled, and Continue. Never on a Sunday whose week is open, and never for anyone under 18.
- **Chapter title card.** Full screen with no tabs: back at the top left, the plate "First take" or the world's own plate, "?" at the top right. The world's painting fills the screen; low on it, one plate holds the place in five marks drawn in the world's own objects (playing cards in Jadugar, balls in Cricket, plain marks in Rukavat), the area of life named plainly as the screen's heading, and "About 4 minutes". Start (Continue once begun) is the outside-a-puzzle button, never yellow. The marks are paint; "Chapter 3 of 5" says the same in words. No kicker above the heading. Lettering is Hind; the world's display face is an open choice.
- **Between chapters.** The five marks with the finished ones filled, the next world named, "Saved" in place (no toast), Next chapter and Later. No score, no lean, no practice and no reading yet.
- **The results.** Five cards, each one picture and at most 20 words: what we saw, how we know, in real life, what to practise, and what this can and cannot tell. The first card is the one screen in the game that says which way the player's choices leaned, privately, as a pattern in their own choices and never as a verdict about them. The last card holds a quiet "Not you? Remove this reading". No Share, no share card, no tabs, kept on the phone and never sent.
- **The Next take.** Once the First take is finished, the Week tab shows "Your reading" with its date (it opens the cards again, read-only). On the 1st of the month after the last reading, and never sooner than 28 days on (O17, rule B), "Next take" appears beside it: fresh puzzles from the next month's set, the same order. Before then the row shows the date it opens, never a countdown. No badge, no reminder, never asked twice. After a Next take, a change card leads the results: the two readings side by side with their dates, calling neither a change nor "about the same" until the research line sets how big a change must be.

### Motion
- **Timing, on the golden ratio** (22 Oct; each step 1.618 times the last: 100, 160, 260, 420, 680, 1100 ms, tokens `--m1` to `--m6`): press feedback within 100 ms; picks and colour changes in 160 ms on `cubic-bezier(0.2, 0, 0, 1)`, so they land together; a refusal shakes for 260 ms; committing holds 260 ms; sheets enter in 420 ms on `cubic-bezier(0.05, 0.7, 0.1, 1)` and leave in 260 ms; a result reveal runs on 420 and 680 ms beats and is done by 1100 ms (the rule's cap is 1.2 s), and a tap skips it. Cricket: pending 680, lamps at 100, 260 and 420, digits from 680, 160 apart, each 260. Jadugar: a 420 beat, then a 680 pull of the cloth.
- **Signature moves:** Lugdi's result reprints the cover, red ink, then black, then paper white. Station's figures arrive on split-flap tiles. Jadugar pulls a crimson cloth off the show bill. Cricket holds "Decision pending" on the third umpire's screen for a beat, then drops the score onto the scoreboard plate by plate. Rukavat cuts to the interruption card with its tone, then the picture comes back with the numbers. Each is the same every day, whatever the score, takes at most 1.2 s with a tap to skip, and has a designed still state.
- **Reduced motion** is a designed still state: instant cuts, no shake, a still stamp for the milestone.

### Sound
The owner's decisions of 21 Oct 2026; the playable sketches are on the sound page (https://claude.ai/artifact/8M55cYQKiSWS7czrCGC2yV).
- **On by default.** Music and Sounds are two switches in the "?" sheet's Settings view, the only place to change them; nothing on the cover. Sound begins with the player's first tap, never on opening, as browsers require.
- **One set per world.**
  - Lugdi has press sounds. Station has lever, latch and flap sounds. Jadugar, Cricket and Rukavat each get their own, still to be made; the only one drawn so far is the one soft tone on Rukavat's interruption card, the same every day.
  - **Music, the owner's picks:**
    - **Lugdi B, the radio-serial drama, trimmed:** only the drone and the tabla, played quietly, with the sting kept for the cover. Direction C is the fallback if the tabla ever sounds like a toy.
    - **Station B, the chime motif:** four notes, on the cover only; the result keeps its flap sound.
    - Neither plays a horn.
  - All of it is synthesised in the browser, so there is nothing to download.
- **Never a signal.** A sound is the same whatever was picked, scored or leaned: the result's reprint or flap sound never changes. No sound marks a lean, a right answer or a wrong one.
- **Quiet places.**
  - Sunday's look-again screen is silent except for sheets opening and closing.
  - The milestone stamp gets one soft note.
  - No train horn or announcement-like sound anywhere in the loop; at most one soft sound on the cover.
  - Music fades out after 3 minutes without a tap and stops when the screen locks or the page is hidden.
- **Reduced motion** plays the calm set and drops the milestone note.
- **No words** under the switches.

## Worlds

Five worlds take turns, one a week, in this order, then repeat, so each comes back every five weeks (O12, D16). A world changes the dress and the objects, never the places, the step order, the buttons or the words on the dock. The new worlds are modules in `design-system/worlds/` built on the same principles as Lugdi and Station, and the library of worlds may grow.

| Week | World | People are | Score and big moment | Display face | First take chapter |
|---|---|---|---|---|---|
| 1 | Lugdi, the pulp cover | newsprint cards | the score roundel; the cover reprints | Sarpanch | 2, safety and justice |
| 2 | Station, the railway | Edmondson tickets | split-flap tiles | none (Hind) | 1, work |
| 3 | Jadugar, the magic show | playing cards | the show bill; the cloth comes off | Yatra One | 3, trust |
| 4 | Cricket, the old stadium | scorecards | the hand-hung scoreboard; decision pending | Khand | 4, teams and leaders |
| 5 | Rukavat, the family TV | TV name captions | the good-night card; the interruption card | Rozha One | 5, home and family |

Each new world also brings one new kind of puzzle, drawn first in its home world and free to appear in any world after that (O12): Believe (Jadugar), the batting order (Cricket) and Split (Rukavat). Still to come for all three: the metal finish (O14), a sound set (O10), and their own story, people, lines and Board names (O15).

### Jadugar (जादूगर), the travelling magic show
**What it is.** One night of a travelling jadoo show that comes to a small town: kerosene lamps, a painted moon backdrop, a cot that floats, a rope that climbs into the sky. The troupe is Chandni Mandal and tonight's show is "Udti Khaat"; the cover line is "One night only. The cot flies." and the last line "Next show tomorrow". The paintings are the floating cot, the rope trick, the trunk, the rickshaw and the ticket booth.

**Palette.**
- **Night** (jadugar-night) and **Deep Night** (jadugar-night-deep): the ground and the veils.
- **Card Stock** (jadugar-card) and **Card Shade** (jadugar-card-shade): every card, bill and option starts here, with a linen grain.
- **Card Ink** (jadugar-ink): all text on card stock.
- **Curtain Crimson** (jadugar-crimson): the cloth, the card backs and, by default, the button outside a puzzle. Card-stock text on it passes 7:1. Never bare on the night: it always has its gold rim.
- **Old Gold** (jadugar-gold): rules, frames and the active tab only.
- **Emerald Felt** (jadugar-emerald): the card table, rimmed in gold.
- **Show Gold** (jadugar-showgold): the cover title only, lettered on the crimson banner.
- **Not-Ready Indigo** (jadugar-muted): the waiting main button. **Soft Lavender** (jadugar-on-ground-soft): resting tab labels.

**Display face.** Yatra One, on the cover title on the crimson banner, and nowhere else unless the owner chooses it for the chapter card.

**People.** Playing cards: card stock with a gold rule just inside the edge. They read top down like every world's card: the portrait across the top (a wide crop in the game, where four share the screen), then the name, the numbers in one row (each icon before its number), then the line, all on one left edge. On a wide game column the card lies on its side, portrait left. (Until 22 Oct the numbers stood in the top-left corner as a playing card's index; the owner called it bad: three left edges, numbers louder than the name, a small portrait.)

**Places.** The jobs are the magician's boxes (crimson lacquer, gold trim, brass corners) and a woven cane basket, painted plates, and each slot is the opening you put someone into. The day plate is a show ticket stub; the Board is the Front row; the words step is a note pinned in the booth; the quick sort is announced from the rickshaw; the crowd guess is ten cards dealt on the felt. The "?" sheet hangs under a curtain valance.

**Checks.** A card turned face down on the row, crimson back with a gold lattice. Spent cards leave a gold outline in the pool.

**Score.** The show bill: a handbill on card stock with the show number on a crimson head band and the score filled in on a ruled line.

**Big moment and signature move.** The reveal: a painted crimson velvet cloth with a gold fringe slides off the show bill and is left gathered at its edge. A tap skips it; reduced motion shows only the gathered cloth.

**Sunday.** A hand of six cards on the felt: face up showing the night's painting when played, face down with "off" for the forgiven day, an outline when not played.

**New kind.** Believe: 3 to 5 tellers say what happened, two of them the same story, and the player picks whom to believe, then confirms ("Believe Sarla"). A teller is the person card with its two numbers (owner, 22 Oct: Believe cards keep their numbers; the two who tell the same story match on both); one named voice sets the scene.

**Watch-outs.**
- The magician's call, "Dekhiye, dekhiye!", is an exclamation, which the rules keep for a real win. It stays on the world card unless the owner chooses otherwise.
- Crimson never sits bare on the night, gold is never a reading colour, and show gold is only ever the cover title.
- Crimson card backs mark a spent check and nothing else; shape, not red, carries every state.
- The rounder card corner belongs to cards, chips and slots; bills, plates, banners and sheets stay square.
- The share card still prints Lugdi's title, "Ghat Ka Jugnu"; it takes the show's own title in the story pass (O15).

### Cricket (क्रिकेट), the old stadium scoreboard
**What it is.** A match at Purana Maidan, the old ground, under floodlights: the hand-hung scoreboard, the scorecard and the commentator. The cover line is "One innings at the old ground." and the last line "Play resumes tomorrow". The paintings are the stumps, the scoreboard, the dressing room and the nets.

**Palette.**
- **Scoreboard Black** (cricket-ground) and **Deep Black** (cricket-ground-deep): the ground and the veils.
- **Sight-screen White** (cricket-paper) and **Sight-screen Shade** (cricket-paper-shade): every card starts here.
- **Score Ink** (cricket-ink): all text on paper.
- **Chalk** (cricket-chalk): the hung numerals, the cover title and control edges.
- **Hung Plate** (cricket-hung): the plates the numbers hang on.
- **Outfield Green** (cricket-green): bands and the field. Never a meaning.
- **Cherry Red** (cricket-red): the ball and its seam only. Never text, never a meaning, and on black only inside its chalk ball.
- **Not-Ready Grey** (cricket-muted): the waiting main button. **Soft Sage** (cricket-on-ground-soft): resting tab labels.

**Display face.** Khand 700 on the cover's name board. By default Khand 600 also sets the scoreboard numerals, an open choice.

**People.** Scorecards: sight-screen white with an ink frame and the printed outfield band at the top; the portrait, the name, the numbers on small hung plates, and the line.

**Places.** Fielding positions (Slip, Cover, Mid-on) on outfield green with a chalk boundary. The day plate is a hung plate ("Day 6"); Sunday and the look-again pair are the Scorecard; the Board is the Scoreboard; the words step is the commentator's card; the quick sort is the commentary box ("Say this on air?"); the crowd guess is the crowd board.

**Checks.** An over: balls on a hung plate. A check bowled is filled in and one to come is a hollow ring; each row shows the balls bowled at it.

**Score.** The hand-hung scoreboard: a black board with a chalk rim, one plate per digit, each on two nails.

**Big moment and signature move.** Decision pending: the third umpire's screen holds the score for a beat while its three lamps light, then the score drops onto the scoreboard plate by plate. It is the same every day and never hints at the score. Reduced motion cuts straight to the hung score.

**Sunday.** Six hung plates: a ball is a day played, a ball struck through is a day off.

**New kind.** The batting order ("Who opens the batting?"): one numbered column filled from the top. The next place is lit, a placed player tapped goes back, and the button reads "Lock the order" once all four are in. Two players share an average, the hidden pair.

**Watch-outs.**
- Red and green never carry a meaning. Every state is a shape (a filled or hollow ball, a ring, a tick), so the world reads the same to a colour-blind player.
- Khand on the numerals bends the one cover title rule unless the owner keeps it.
- A full over of six balls doubles the shared puzzle's three checks; an open choice.
- The chapter card puts "Chapter 4 of 5" above the heading, where it reads as a kicker; it belongs under the heading, as in Jadugar.
- The share card still prints Lugdi's title; the story pass gives it its own (O15).

### Rukavat (रुकावट), the family TV
**What it is.** An evening in front of the 1980s family TV: the rooftop antenna with a kite caught in it, the teak cabinet with its sliding shutters, the Sunday film and the arguments over who watches what. It is named after its big moment, the announcer's card "Rukavat ke liye khed hai". The cover is a broadcast title card ("Dadi Ki Kursi" | "दादी की कुर्सी", the owner's choice of 22 Oct 2026) with its time slot; the last line is "Same time tomorrow". The paintings are the roof, the room, the TV and the sofa.

**Palette.**
- **Screen Grey** (rukavat-ground) and **Deep Screen** (rukavat-ground-deep): the ground and the deep caption plate.
- **Cream** (rukavat-paper) and **Cream Shade** (rukavat-paper-shade): every card starts here.
- **Rukavat Ink** (rukavat-ink): all text on cream.
- **Teak** (rukavat-teak): bezels, the cabinet and the waiting main button.
- **Band Teal** (rukavat-teal): bands without words. Cream on it falls short of text contrast, so it never carries words.
- **Caption Teal** (rukavat-teal-deep): name captions and lower thirds; cream on it passes 7:1.
- **Signal Orange** (rukavat-orange): rules, knob clicks and the switch track. Never text.
- **Soft Grey-Green** (rukavat-on-ground-soft): resting tab labels.

**Display face.** Rozha One, on the cover's title card only, unless the owner chooses it for the chapter card.

**People.** TV name captions: a cream card, the portrait on a small screen in a teak bezel, the name on a deep-teal lower third with an orange rule, then the numbers and the line.

**Places.** Slots in the evening schedule, on a programme card. Every day plate is a time slot ("Wednesday · 9 pm"), and the Board is The sofa, each rank in a round channel button. The words step is a viewer's letter; the quick sort asks "Show this on TV?"; the crowd guess is the viewers' poll. The "?" sheet has the cabinet's teak edge.

**Checks.** The channel knob: cream with an ink ring while left, outlined and dim once spent; placed on a row, teal with an orange ring.

**Score.** The good-night sign-off card: the score on a screen, "Good night" on a teal caption.

**Big moment and signature move.** The interruption card: the announcer's painted slide, the Hindi line lettered on it, cuts in on the TV with one soft tone before the result, and then the picture comes back with the numbers. A tap skips it; reduced motion holds the slide still, then makes a hard cut.

**Sunday.** Six small screens, each with its day's painting and the day on a lower third; a forgiven day greyed with "off"; an unplayed day a switched-off screen with its dot.

**New kind.** Split ("Who does what this Sunday?"): six household chores to share among the family. Tap a chore, then a person; marks on each row count the chores, never a fraction. Two of the family share a record, the hidden pair, and Dadi's line sets the scene.

**Watch-outs.**
- Never the real broadcaster's name or logo; colour bars live only inside paintings.
- The English line under the slide quotes 1980s television. The default is "We regret the interruption", because the rules ban "sorry" on screen; the owner chooses.
- The slide is the one raster with words lettered into it: it is hidden from screen readers, the cut is named by its line, and the English is live type.
- Band teal and orange never carry words.
- The rounder screen corner belongs to screens, cards and controls; caption bands stay square.
- The chapter card puts "Chapter 5 of 5" above the heading; it belongs under it.
- The share card still prints Lugdi's title; the story pass gives it its own (O15).

## Do's and Don'ts

### Do:
- **Do** keep the question top at 104 px and the dock top at 748 px on every puzzle step, and dock tab screens at 682 px.
- **Do** start every card on the world's own stock (newsprint, ticket card, card stock, sight-screen white or cream), and print a pick by multiplying pick yellow over it.
- **Do** put enamel, ticket and newsprint materials under live type as rasters with provenance sidecars, never with baked-in text (the one exception is Rukavat's announcer slide, see Worlds).
- **Do** set Body (Hind 500) only for lines people say, and everything else in Hind 700.
- **Do** keep blue in Station to the enamel and its cobalt marks, and regrade Station paintings to black and ticket cream.
- **Do** keep the painting full bleed and put text on a caption strip or plate that passes contrast at the lightest and darkest pixels under it.
- **Do** draw every state in every world, in Hindi, at 200% text and at 360 x 640.
- **Do** give each world a metal finish true to its own objects, lit from one light high on the left, with fewer and finer borders (O14).
- **Do** carry every state by shape as well as colour, as Cricket does with its balls, rings and ticks.

### Don't:
- **Don't** use yellow for anything but the pick and its live confirm.
- **Don't** add a sixth tappable look; compose new steps, Believe, the batting order and Split among them, from the main button, person card, chip, slot and text button.
- **Don't** use a world's display face anywhere but its cover title, unless the owner chooses it for one of the open places.
- **Don't** add a fourth radius to any world.
- **Don't** use glass, frosted panels or blur behind the tab bar, round buttons, switches or the "?" sheet (O14).
- **Don't** put a soft shadow under type or a flat control, or make any shadow a hard offset.
- **Don't** show a level number, "Level 3 of 6", or any sign that the calendar is getting harder.
- **Don't** show the real broadcaster's name or logo in Rukavat.
- **Don't** use dashes for anything except an empty slot or blank.
- **Don't** put a hard offset on any control other than the Lugdi live main button's red print edge (R-VIS-22).
- **Don't** set reading text in a world's second colour: red, cobalt, crimson, gold, outfield green, cherry red, band teal or orange.
- **Don't** stack full-width boxes, settings-style label-and-value rows, or a hub of notices. That was EVAL-13.
- **Don't** show the lean's direction, a bar, a tilt, or the lean on a share card or the board. The private results of a First take or Next take are the one place its direction is said.
- **Don't** show research words on screen: transfer day, twin, consistency form, lean size. Never call the First take a test, or say it is about attitude or bias.
- **Don't** use a price, a countdown (the Next take shows a date instead), an exclamation outside a real win, or "please", "sorry" or "oops".
- **Don't** use emoji or text glyphs as icons, or kickers above headings.

## Open owner choices

Each is drawn as an A/B picture in the library's "Your choices" section (the new worlds' choices under their own world; the study's space and shadows in the premium study files). The default applies until the owner chooses.

| Choice | Default (applied) | Alternative | Note |
|---|---|---|---|
| Where the day plate sits | A: in the top bar, as its title | B: under the bar, as its own band | Changes R-TOP-1, which allows only back and "?" in a step's top bar |
| Small phones | A: scroll once, with a cue | B: 3-person sets on small phones | Changes R-NUM-26, which asks for no scroll at 100% |
| Who says the loaded lines | A: a named voice per set, with a portrait | B: no speaker | |
| The twin wording | A: "with attitude" and "with confidence" | B: the return day, words swapped | |
| Text over the paintings | A: small plates that hug the text | B: a dark band across the screen | |
| Button lettering | A: plain sentence case in Hind | B: display capitals in Sarpanch | |
| The red print edge on Lugdi's live button | A: keep it (R-VIS-22, the OQ-3 default) | B: a flat yellow button | The round 3 finish review reads the edge as neobrutalist |
| The last line of the day | A: "Next issue tomorrow" | B: "Issue 214 is out"; C: a "The End" band | |
| Which practice number players see | A: the running total everywhere | B: today's points on the result | |
| Station board colour | A: cobalt enamel | B: classic yellow enamel | Yellow now means the pick |
| A third script on Station boards | A: English and Hindi | B: the city's script as part of the picture | |
| How open the game is about what it hides | A: never named | B: said once in "?" | |
| Sunday's shape | A: two short screens | B: one long screen | |
| Hindi words still to test | A: एक-सा फ़ैसला, झुकाव, अभ्यास | B: loanwords | To try with 5 Hindi-first players. Settings already uses the spoken loanwords म्यूज़िक, साउंड, वाइब्रेशन, रिमाइंडर, प्राइवेसी |
| Station plates | A: always a station name | B: day themes | |
| App icon | A: the day's ticket | B: the issue roundel; C: two worlds, one punch | One icon for every world |
| Space and soft shadows from the premium study | A: keep them with the metal (O14) | B: keep the round 3 spacing and flat print | Kept unless the owner says otherwise |
| Rukavat's English line on the interruption card | A: "We regret the interruption" | B: "Sorry for the interruption"; C: the Hindi line only, in both languages | The rules ban "sorry" on screen; the line quotes 1980s television |
| Lettering on the chapter title cards | A: Hind, like every other word | B: the world's display face (Yatra One in Jadugar, Rozha One in Rukavat) | The rule keeps a display face to the cover title |
| The Board's name in each world | A: the world's own place: Front row (Jadugar), Scoreboard (Cricket), The sofa (Rukavat) | B: in Rukavat, "Viewers' choice" | Every world's names are drafted for the owner's review (O15) |
| Cricket's over | A: six balls, a full over | B: three balls, the shared count of checks | Six doubles the shared puzzle's checks |
| Cricket's scoreboard numerals | A: Khand, the world's display face | B: Hind 700, like Station's flaps | The rule allows a display face on the cover title only |
| Jadugar's button outside a puzzle (Play, Share, Start) | A: curtain crimson, gold rim | B: card white, ink frame | Never yellow either way |
| The magician's call | A: only on the world card | B: "Dekhiye, dekhiye!" once as the cloth comes off | The rules keep exclamations for a real win |
