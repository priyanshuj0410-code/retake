---
type: reference
title: World modules for the component library
description: How a visual world plugs into design-system/library.py. What worlds/<id>.py must define (data, hooks and their signatures), how worlds/<id>.css is scoped, the LIB_WORLDS and LIB_OUT build switches, the regression check, and a minimal example module.
plane_issues: [https://app.plane.so/the-equal-lens/browse/EVAL-17/]
---

# World modules for the component library

`design-system/library.py` builds the component library page (`index.html`, and `preview.html` in a standards-mode shell). Everything that differs between worlds now comes through one interface, the `World` class. Lugdi and Station are two registered worlds like any other; their classes (`class Lugdi`, `class Station` in `library.py`) are the reference implementations. Further worlds arrive as modules in `design-system/worlds/`.

The binding design rules are in [DESIGN.md](../../DESIGN.md) and [design.md](../design.md); this page covers only the plumbing.

## Files

| File | What it holds |
|---|---|
| `design-system/library.py` | `World` (defaults and hooks), `Lugdi`, `Station`, the registry `WORLDS`, the loader, `SHOWS`, the page |
| `design-system/library.css` | shared components plus the `.w-lugdi` and `.w-station` dress |
| `design-system/library.js` | behaviour; the contrast table (Lugdi and Station pairs live in `PAIRS` there) |
| `design-system/worlds/<id>.py` | one world: a `WORLD` registration |
| `design-system/worlds/<id>.css` | that world's tokens and dress, scoped to `.w-<id>` |
| `design-system/assets/` | paintings `<base>.webp` (with optional `<base>-l.webp` portrait-large and `<base>-w.webp` wide), portraits `<face_prefix>-<who>.webp` |

## The registry and load order

1. `Lugdi` and `Station` register first, in that order.
2. The loader then imports `worlds/jadugar.py`, `worlds/cricket.py`, `worlds/rukavat.py` in that order, then any other `worlds/*.py` by name (files starting with `_` are skipped).
3. A missing module is simply absent: the build does not fail. A module that defines no `WORLD` is left out with a printed note.
4. A module that is present but broken stops the build: an exception in the module (with its traceback), or a one-line message for a `WORLD` id that differs from the file name, a missing required field, or a moment that names no scene.
5. If `worlds/<id>.css` exists, the page links it right after `library.css`, for each world drawn on the page.

## What worlds/<id>.py must define

The module runs with one injected global, `lib`, which is `library.py` itself. Do not `import library`: that would build the page a second time. Use `lib.World`, `lib.tx`, `lib.ic`, `lib.al`, `lib.flaps`, `lib.stats`, `lib.row`, `lib.tile`, `lib.slot`, `lib.byline`, `lib.spoken`, `lib.frame`, `lib.thumb`, `lib.cover`, `lib.h1q`, `lib.figs2`, `lib.figsx`, `lib.ab_item`, `lib.main`, `lib.topbar`, `lib.road_rows(world, part)` (Board rows from the world's road names), `lib.NOCOUNT` (the not-counted mark, below), and the sample data `lib.NM`, `lib.JOBS`. For the world's own people use `self.twin` and `self.twin_pair()`, never Lugdi's `lib.TWIN`.

`WORLD` is a subclass of `lib.World` or an instance of one.

### Required data

| Field | Shape | Notes |
|---|---|---|
| `id` | `'jadugar'` | lower case; must equal the file name; gives the CSS class `w-<id>` |
| `name` | `('Jadugar', 'जादूगर')` | English, Hindi |
| `palette` | `[(token, hex, use), ...]` | swatches in the Colour section and on the world card; the first entry is the ground (the installed app's title bar uses it) |
| `scenes` | `{key: asset base}` | `{'cot': 'jadugar-s-cot'}` means `assets/jadugar-s-cot.webp` |
| `moments` | `{moment: scene key}` | see Moments below; `'default'` covers any moment left out |
| `face_prefix` | `'jadugar'` | portraits are `assets/jadugar-<who>.webp` for kamla, salim, raju, pammi, arjun, anita, meena, vikram |
| `plates` | `{moment: (en, hi)}` | the day plate in the top bar; `'default'` is required |

### Optional data (defaults in brackets)

| Field | Shape | Use |
|---|---|---|
| `voice` | `(en, hi)` | one line on the world card |
| `contrast` | `[(pair, fg hex, bg hex, ratio, what), ...]` | rows added to the contrast table |
| `fonts` | Google Fonts family specs as in the css2 URL, e.g. `['Rozha+One']` ([]) | loaded when the world is drawn |
| `display_face` | family name (None) | named in the Type section; the display face sets the cover title only |
| `type_row` | `(css class, en, hi, note)` (None) | this world's display row in the type table |
| `shapes` | `{'radii', 'spent', 'depth'}` texts ({}) | this world's column in the shapes table |
| `card_word` | `'handbills'` ('') | what the person cards are, for the skeleton note |
| `art_cls` | `'veil'` | class on the painting behind puzzle steps; `veil` darkens it and is styled for every world; any other class must be styled in the world's CSS |
| `places` | tuple of plate texts (()) | plate texts that are names (a place, a series, a troupe); the build marks them `data-count="0"`, so the word count skips them |
| `week` | six scene keys ([]) | Monday to Saturday on Sunday's day objects; empty means the cover scene six times |
| `next_line` | `(en, hi)` ('Next issue tomorrow') | the next-puzzle line on the cover (after today) and the result |
| `twin`, `stat_keys`, `cover_line`, `hard_line`, `roads`, `share_label` | see "The day's story" below | the world's own story; the defaults are Lugdi's ghat road |
| `check_glyph` | `ic()` name ('stamp') | one check in the pool |
| `sort` | `((q en, hi), (line en, hi), (yes en, hi))` | the quick-sort question, the overheard line, the keep verb |
| `words` | four `(en, hi)` chips, the last 'None of these' | the words step, to match `letter_obj()` |
| `signature` | sentence ending, e.g. `'the curtain lifts once.'` ('') | the Motion section reads "Name: sentence" |
| `notes` | `{note key: caption}` ({}) | captions under this world's screens; keys below |
| `shows` | `{kind: [(screen, kwargs, title, note key)]}` ({}) | replaces the default screens drawn for a kind |

Never set `module`; the loader sets it.

### The day's story

Every world tells its own story (the owner's decision of 22 Oct 2026): its own people and lines, cover line and Board names. A world that sets none of these tells Lugdi's ghat road, so set all of them. The drafts for each world are listed for the owner in [world-voices.md](../content/world-voices.md).

| Field | Shape | What it draws |
|---|---|---|
| `twin` | dict, as `lib.TWIN_DAY` | the twin step, Sunday's look-again, the person-card specimens, the type table and the wide-screen step |
| `stat_keys` | `{key: (icon svg, (label en, hi), (spoken en, hi))}` ({}) | keys the twin's numbers use; `register()` adds them to `lib.IC` and `lib.KEY`. Prefix keys with the world (`st-`, `jd-`, `cr-`, `rk-`) |
| `cover_line` | `(en, hi)` | the cover's line on an ordinary day, at most 12 words, in the world's register |
| `hard_line` | `(en, hi)` | the hard day's cover line. It must name the setting plainly ("Today, in a family court.") and stay short: the hard cover holds 20 words in all |
| `next_line` | `(en, hi)` | the next-puzzle line (in the table above) |
| `roads` | `{'friends': 4, 'top': 3, 'near': 5}` road names | the Board rows, the row menu and the share card. `friends[2]` and `near[2]` are you; `near[0]` is `friends[1]` and `near[3]` is `friends[3]` (a friend near you keeps one practice figure). Ranks and practice are shared (`lib.BOARD_FIGS`) |
| `share_label` | `(en, hi)` (None) | the puzzle-number line on the share card; None means the default plate and "No. 214". The card's road name is `self.road_you` |

The `twin` dict:

| Key | Shape | Rule |
|---|---|---|
| `q` | `(en, hi)` | the question, at most 10 words; the button stays "Send {name}", so the Hindi asks किसे भेजें or another form that marks no one's gender |
| `speaker` | `(who, en, hi)` | the named voice of the lines on the cards, with its role ("Anita, station master"); never one of the people on the cards |
| `keys` | two stat keys | the shared key; every person's numbers come in this order |
| `people` | 3 to 5 `(who, [(key, value)], (line en, hi))` | people from the eight in `lib.NM`, each once; adults; no caste, religion or party |
| `pair` | two indices | the hidden pair: their numbers match exactly, and no one else shares a record |
| `words` | `(en, en)` | the one loaded word each of the pair says, as written in their English lines |
| `swapped` | two `(en, hi)` | the pair's lines with the words swapped, for the day the record returns (Hindi verbs keep each person's gender) |

`register()` checks these rules and stops the build with one line naming what is broken: 3 to 5 people from the eight, a speaker off the cards, every number under the key, one hidden pair, lines that differ by the one word and swapped lines that match, every string in both languages, and the road-name shape. It cannot check register, age, caste, religion or party: read those yourself.

Helpers: `self.twin_pair()` returns the pair as `(who, numbers, line)` twice, ready for `lib.tile(w, *person)`; `self.road_you` is your road name.

### The word count's not-counted mark

Names and the lines a named character says are not counted against the word budget (15 on a puzzle step, 20 elsewhere). `tools/frames.cjs` skips `.nm`, `.quote`, `.vh`, `[aria-hidden="true"]` and `[data-count="0"]`. The shared parts already carry the mark: `lib.byline` (the speaker's name), `lib.voice` (the balloon), the quick-sort line and the plates named in `places`. A world's own `letter_obj()` must put `lib.NOCOUNT` (` data-count="0"`) on its quoted sentence, as the five worlds do. Use it for names and quotes only, never for the game's own words.

### Moments

`twin, rule, jobs, checks, team, sort, words, crowd, look, board, cover, cover_hard, result, sunday, change, month`. Each names a scene key. Puzzle steps, the board, Sunday, change and month cards draw the painting with `art_cls`; the cover and result draw it with `veil-low`. Plates use the same moment names (`plates['board']`, `plates['sunday']` and so on), falling back to `plates['default']`.

### Hooks

Each hook is a method returning HTML (or a pair of HTML strings where noted). Every hook has a default in `World`: plain newsprint objects (most of them exactly what Lugdi draws) and the shared sample puzzle. Override only what the world dresses itself. Use only shared component classes or classes the world's CSS styles under `.w-<id>`; the hooks must keep the same roles, names and states as the defaults (one stop per person, `aria-checked`, `role="img"` with a spoken summary).

| Hook | Returns | Default |
|---|---|---|
| `serial(i)` | the serial printed beside the i-th person's name, or None | None (Station: `0214<i>`) |
| `cover_top(hard, line, level, nxt, kept)` | the cover body above Play. `line` is `cover_line` or `hard_line`, and None on a forgiven day (the `kept` line stands in its place); `level` is (en, hi); `nxt` is the next-day span or ''; `kept` is the forgiven-day line or ''. Must hold the cover `h1`, print `kept`, and print `line` only when it is set and `nxt` is '' | the world name as an h1 and a plate |
| `app_meta(kind, line=None, level=None)` | what sits over the painting on wide screens; `kind` is `'step'` or `'cover'` (the cover gets the line and level; the top bar is added for you) | '' for step; title and plate for cover |
| `jobs_obj(states)` | the assign object holding three slots; `states` is `JOB_STATES` | newsprint page of slots |
| `checks(p_eq, p_other)` | pair `(rows, pool)`: three person rows (Anita checked twice) and the check pool | rows with stamp marks; pool of `check_glyph` |
| `team_side(v)` | the right side of a team row for batting average `v` | `stats([('bat', v)])` |
| `letter_obj()` | the words object: the sentence with one `.blank` and a byline | the Letters page |
| `crowd_obj(qid)` | ten guesses 10% to 100% as a radiogroup labelled by `qid` | the readers' poll chips |
| `result_parts(score, figs_, week, line, end=' at-end')` | pair `(top, panel)`: `top` holds the score as the screen h1; `panel` holds `figs_`, `week` and `line`, with `end` appended to its class | a score plate and a newsprint slip |
| `dayobj(state, key, letter, stamp)` | one day on Sunday; `state` is played, forgiven or notplayed; `key` a scene key or None | a little cover with the scene |
| `week_obj(view, days)` | the paper holding the day grid; `view` is `'sunday'`, `'report'`, `'weeks'` or `'day1'` | newsprint page with the figures |
| `month_obj(lean)` | the month recap object holding the lean row | newsprint page |
| `rank(r)` | the rank cell of a board row | underlined number |
| `board_list(rows)` | the phone board list wrapping `<li>` rows | newsprint page |
| `board_panels(friends, everyone)` | pair `(friends, everyone)` for wide screens; the second needs class `board-everyone` | newsprint pages |
| `share_card()` | the share card, with class `sharecard world w-<id>`: `share_label`, `self.road_you`, the step marks and the streak, in both languages; never the score or the lean | painting plus a plate |
| `sheet_dress(layer)` | decoration drawn first inside the "?" sheet, before the handle row; aria-hidden | '' |
| `objects()` | list of `(title, picture html, anatomy, tokens, states, access)` for the Day objects section | [] (no section) |
| `choices()` | list of `(place, draw)` where `draw()` returns `lib.ab_item(...)`; the shared questions hold places 1 to 15, so use 100 and up | [] |
| `signature_demo()` | a live demo for the Motion section, usually `lib.frame(self.id, ...)` | '' |

Do not override `scene`, `moment`, `art`, `plate`, `face`, `note`, `show`, `title`, `cls`, `ground`, `twin_pair` or `road_you`.

### Screens per section (shows and notes)

Each section asks every drawn world for its screens, kind by kind. The defaults are in `SHOWS` in `library.py`; `{w}` in a title is the world name, and the caption is `notes[note key]`.

| Kind | Default screens (title, note key) |
|---|---|
| `twin` | not ready (`twin.wait`), Kamla picked (`twin.pick`) |
| `assign` | rule (`rule`), jobs (`jobs`) |
| `checks`, `team`, `sort`, `words`, `crowd` | one each, note key as the kind |
| `result`, `sunday`, `look` | one each, note key as the kind |
| `board` | Friends (`board.friends`), Everyone (`board.everyone`) |
| `board_more` | row menu (`board.menu`), friend added toast (`board.toast`) |
| `sheet_help`, `sheet_info`, `sheet_settings` | "?" (`sheet.help`); numbers (`sheet.numbers`) and About (`sheet.about`); settings (`sheet.settings`) |
| `hi_step`, `hi_cover` | Hindi (`hi.step`, `hi.cover`) |
| `big_step`, `big_cover`, `big_result`, `big_sunday`, `big_board` | 200% text (`big.*`) |
| `small_step`, `small_more` | 360 x 640 (`small.step`; `small.cover`, `small.result`) |

Story-section captions: `hero`, `resp.step`, `resp.cover`, `resp.result`, `resp.sunday`, `resp.board`, `resp.tablet`. Screens available to `shows`: `twin, rule, jobs, checks, team, sort, words, crowd, cover, result, sunday, look, board, toast, sheet`, with the keyword arguments those functions take (`sel`, `committing`, `lang`, `cls`, `view`, `menu`, `layer`).

## How worlds/<id>.css is scoped

- Every selector starts with `.w-<id>` (or `.app.w-<id>` for the wide-screen shell). The one exception is the type specimen class named in `type_row`, which sits outside any world: name it `.ts-<id>`.
- Define the tokens the shared components read, on `.w-<id>`: `--ground --ground-deep --paper --paper-shade --ink --title --accent --muted --on-muted --edge --on-ground --on-ground-soft --r-card --r-chip --frame --tex --main-offset --main-offset-pressed --plate-rule`. `--tex` is a texture `url()` or `none`. A world that borrows Station objects (flaps, departures, the name board) also needs `--enamel --flap --flap-hi --flap-seam --raised`.
- `library.css` styles these parts only for Lugdi and Station, so a new world must style them or they render bare: `.dayplate`; `.qbox`; `.tile` and `.row` at rest, pressed, selected (the ring; the yellow print is shared), `:hover` and `.is-hover`; `.toast > .t`; the active `.tab[aria-current="page"]` marker and the `.tabbar` top edge; `.app .rail`; `.app.w-<id>.is-step .art-img::after` (the veil behind steps on wide screens); `.w-<id> .art.<art_cls>` if `art_cls` is not `veil`. Worth checking too: `.statkey`, `.pool`, `.lrow .rk`, `.spine`, `.sheet`, `.dialog`, `.menu`, `.leanrow .wk`, `.changestamp`.
- The shared `.main.is-live:hover` and `.is-hover` rules draw a 6 px hard offset in the accent: that is Lugdi's sanctioned print edge and no one else's. Set `--main-offset` and `--main-offset-pressed` to `none` or an inset edge, and override `.w-<id> .main.is-live:hover` and `.w-<id> .main.is-live.is-hover`.
- Never move the skeleton: no changes to the height or padding of `.topbar`, `.qbox` margins, `.dock`, `.tabbar` or `.scr-body`, so the question stays at 104 px and the dock at 748 px.
- The rules in DESIGN.md bind every world: pick yellow `#FFD23F` only for a pick and its live confirm; ink or paper for running text; the painting full bleed; no blurred shadows on cards (blur only on overlays); 14 px floor; 48 px targets; 4.5:1 text and 3:1 large text and controls; Hind for every word that is read, at most one display face and only on the cover title; reduced motion as a still state; no eyebrow labels, side stripes, glass, hard offset shadows, emoji icons or gradient text.

## Build switches

Run from `design-system/`:

| Command | Result |
|---|---|
| `python3 library.py` | `index.html` and `preview.html` with every registered world |
| `LIB_WORLDS=lugdi,station python3 library.py` | only those worlds, in that order; reproduces the two-world page even when modules are present |
| `LIB_WORLDS=jadugar LIB_OUT=preview-jadugar python3 library.py` | `preview-jadugar.html` only, in the preview shell, drawn in Jadugar alone |

- `LIB_WORLDS` is a comma list of world ids; unknown ids are left out with a note; an empty result means every registered world.
- `LIB_OUT` is a plain file name without `.html`; the default `index` writes both `index.html` and `preview.html`.
- The showcase sections (Colour, Type, Shapes, Components, Day objects, Mechanics, Results, Covers, Hindi and access) draw every selected world. The story sections (the skeleton hero, the report over time, screen sizes, install, Your choices) are told in two worlds: the first two selected, `WA` and `WB` (one world alone fills both).
- "The worlds" section, one card per registered world, appears only when the build includes a module world.

## Regression

The two-world page must stay byte-identical. Keep a copy of `index.html` from before a change, then:

```
LIB_WORLDS=lugdi,station python3 library.py && cmp index.html /path/to/old-index.html
```

Element ids (`h1`, `q2` and so on) are numbered in call order, so a change that draws screens in a different order changes the bytes even when nothing looks different.

A change to the interface only (a new hook whose default is the old content) must leave a one-world page identical too:

```
LIB_WORLDS=lugdi LIB_OUT=voice-before python3 library.py     # before the change
LIB_WORLDS=lugdi LIB_OUT=voice-after python3 library.py      # after it
cmp voice-before.html voice-after.html
```

The story hooks were added this way on 22 Oct 2026 (EVAL-17) and the Lugdi page stayed byte-identical; the word-budget cuts that followed changed it on purpose.

Word budgets and contrast are checked one world at a time, one browser at a time (this Mac has crashed under the full five-world page):

```
LIB_WORLDS=<id> LIB_OUT=check-<id> python3 library.py
node tools/frames.cjs http://localhost:8790/check-<id>.html <outdir>        # add hi for Hindi
python3 tools/contrast_score.py <outdir>/frames.json --world <id>
```

Delete the `check-*.html` pages afterwards.

## Minimal example module

A skeleton that builds. The palette and captions are placeholders: replace every value with the world's own design before it is shown to anyone.

`design-system/worlds/jadugar.py`:

```python
"""Jadugar: a travelling magic show."""


class Jadugar(lib.World):
    id = 'jadugar'
    name = ('Jadugar', 'जादूगर')
    voice = ('Each day is a night of a travelling magic show.', 'हर दिन एक घूमते जादू के शो की एक रात है।')
    palette = [('jadugar-ground', '#12201C', 'Tent green ground'), ('jadugar-paper', '#F1E6CF', 'Handbill paper'),
               ('jadugar-ink', '#1A1410', 'Text on paper'), ('jadugar-accent', '#B8321E', 'Curtain red, marks only')]
    contrast = [('Ink on Jadugar paper', '#1A1410', '#F1E6CF', 7, 'text on paper')]
    card_word = 'handbills'
    scenes = {'cot': 'jadugar-s-cot', 'booth': 'jadugar-s-booth', 'rope': 'jadugar-s-rope'}
    moments = {'default': 'cot', 'rule': 'booth', 'jobs': 'booth', 'sunday': 'rope'}
    face_prefix = 'jadugar'
    plates = {'default': ('Jadugar Mandal', 'जादूगर मंडल')}
    signature = 'the curtain lifts once on the result.'
    notes = {'hero': 'The same day under the tent'}

    def sheet_dress(self, layer):
        return '<div class="jd-fringe" aria-hidden="true"></div>'


WORLD = Jadugar
```

`design-system/worlds/jadugar.css` (tokens, then the parts that are otherwise bare):

```css
.w-jadugar {
  --ground: #12201C; --ground-deep: #0B1512; --paper: #F1E6CF; --paper-shade: #E3D5B8; --ink: #1A1410; --title: #FFF4DE; --accent: #B8321E;
  --muted: #3B4A44; --on-muted: #F1E6CF; --edge: #F1E6CF; --on-ground: #FFF4DE; --on-ground-soft: #CFE0D8;
  --r-card: 0px; --r-chip: 4px; --frame: 2px; --tex: none;
  --main-offset: none; --main-offset-pressed: none;
  --plate-rule: inset 0 0 0 1px color-mix(in srgb, var(--title) 40%, transparent);
}
.w-jadugar .qbox, .w-jadugar .dayplate { background: color-mix(in srgb, var(--ground-deep) 92%, transparent); box-shadow: var(--plate-rule); }
.w-jadugar .tile, .w-jadugar .row { background: var(--paper); box-shadow: inset 0 0 0 var(--frame) var(--ink); }
.w-jadugar .jd-fringe { height: 6px; margin: 0 -16px; background: var(--accent); }
```

This was built in a scratch copy with `LIB_WORLDS=lugdi,station,jadugar` and with `LIB_WORLDS=jadugar LIB_OUT=preview-jadugar`, drawn in every section, its contrast row added; with `LIB_WORLDS=lugdi,station` the page stayed byte-identical.

## Things a world author must know

- Python here is 3.9: an f-string expression cannot hold a backslash, and inside a `'...'` f-string use `"` for nested strings.
- Every visible string needs English and Hindi: pass both to `lib.tx(tag, en, hi, cls)` and labels through `lib.al(en, hi)`; the page's Show Hindi switch swaps them inside phones.
- Steps and screens are built by the shared functions; a world changes objects and dress, never the step order, the buttons or the words on the dock.
- Lugdi's and Station's contrast pairs stay in `library.js` (`PAIRS`, tagged by world); a module lists its own in `contrast`, and a row shows only when its world is drawn.
- Create new files with Write; change existing files with Edit; never write files from the shell.
