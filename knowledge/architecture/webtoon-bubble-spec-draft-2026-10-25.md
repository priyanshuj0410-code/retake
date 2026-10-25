---
type: spec
title: Retake bubble system
description: The shared bubble system for both webtoon variants of Retake. It covers text-free painted panels, the stray-text check, the bubble data, bubble kinds per world, layout, reading order, the rules that keep the equal pair hidden, the word count, and the library-first build order. It is a draft for the owner's yes and nothing has been built.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-20/
---

# Retake bubble system (shared by both variants)

The owner's direction (25 Oct 2026): painted panels carry no words. The app lays every word over the picture as live text: speech, captions, sound words and signs. The player is one of the characters, and each chapter ends with what came of the player's choices.

This spec holds for both presentation variants. Where they differ (one panel per tap, or one bubble per tap), the rules are written per **beat**. A beat is everything new on screen between two taps.

Tags: **[R]** reuse as it is, **[C]** change, **[N]** new. Paths are relative to `/Users/priyanshu/equal-lens-trainer`. The prototype mentioned below is scratch work in `/private/tmp/claude-501/-Users-priyanshu-Sex-Ed/f50ea7ee-0855-46a2-8572-0aa08df5b855/scratchpad/webtoon/`, not repo code.

---

## 1. Painter rules: text-free panels with calm space

**Prompt lines.** File: `design-system/art/cutscenes.py`. Every new phrase goes into the glossary in `knowledge/story/situations.md` first, because `unclear()` and `glossary()` refuse words that have no definition (memory: painter-glossary-rule).

- **[R]** `NO` (line 43) and `STORY_NO` (line 106), including "no speech bubbles". No bubble shape turned up in any of the 69 shipped panels.
- **[N]** Add `UNSIGNED = " Unsigned: no painter's mark or initials in any corner."` to both endings. Signatures turned up in st-2-4 and st-3-2, inside the 3.5% export crop (line 476).
- **[N]** Add `ROOM`, appended only to panels that will carry bubbles. It is written as what to paint, never as what to leave out:
  `" The people stand in the lower part of the picture, heads about a third of the way down. Above and beside them is a plain {wall | open sky | ceiling} with nothing on it."`
- **[N]** Add `FACING`, chosen from the script's speakers:
  - one speaker: `" The speaker stands in the {left | right} third and looks across the picture into the plain space."`
  - two speakers: `" The first speaker stands in the left third facing right; the second stands in the right third facing left."`
  - talking to the player: `" The speaker looks straight out of the picture at the viewer."`
- **[N]** Surfaces that usually carry letters are described as plain, in positive words. Each one gets a glossary row: "plain yellow number plates", "a blank platform name board painted flat cream", "a tailgate painted only with flowers", "a plain striped stall awning", "a phone lying face up, its screen a plain glowing pale rectangle facing straight out", "a plain cream invitation card facing straight out".
- **[C]** Rewrite the glossary rows that ask for writing in `knowledge/story/situations.md`: line 89 (the pass and its rubber stamp), 93 (the scorecard "filled with columns of smudged pencil marks"), 126 ("two handwritten paper lists"), 132 ("a single handwritten sheet"). Also rewrite the script's "her handwriting" (`knowledge/story/first-take-script.md`, row 6.1). Each written object is shown shut, from the back, or as "plain ruled paper with no marks". All 16 panels that were flagged in all three seeds are written objects or boards.
- **[R]** "Names never reach the painter" (`situations.md:80`, `cutscenes.py` `role()` and `unnamed()`). **[C]** If "Dadi's trunk" stays, repaint the 14 panels painted before that rule: st-0-2, 0-4, 0-7, 1-10, 1-2, 1-3, 2-1, 3-1, 3-10, 3-3, 3-4, 4-1, 4-10, 5-1. If the new story replaces the trunk, every panel is painted fresh under these rules anyway.

**Composition rules.** File: `knowledge/content/cutscenes.md`. **[N]**
1. Heads sit 30 to 45% down from the top of a dialogue panel. Today 16 of 31 face panels have the head top within 10% of the top edge.
2. Keep plain space beside the heads in the band from 20 to 60% of the height. That band is all a phone on its side shows of the stage.
3. In a two-speaker panel, the script's first speaker is on the LEFT. Today st-1-10, st-3-10 and st-4-10 have it the other way round.
4. Use a close-up only for one short line, with the face off centre. The st-0-7 close-up had no room on a phone on its side.
5. Never paint the player: no face, no back, no hands. Hand-overs are painted the instant before (the list held out) or after (the list on the table). See section 7.
6. Never paint a person from the cards. If the story needs them on screen, the app lays their card portraits on as live insets, all the same size.
7. Outcome panels show the event (the ball, the procession), never the person who was picked.
8. Words in the picture that matter (a station name, a score) are painted on a blank surface and lettered live (`sign`, section 4).

**Panel shapes and sizes.**
- **[R]** Keep 4:3 this round. Paint at 1024 x 768 (`cutscenes.py:26`), crop 3.5% each side and export at 800 x 600 WebP (`cutscenes.py:477`). The prototype placed bubbles on 13 of 13 panels at 328 px and on 4 of 4 wide frames.
- **[N, owner choice]** A wide 2:1 establishing panel costs the same to paint and crops well to 16:9. It touches `cutscenes.py` W and H and the export resize, `library.css:1613` (`aspect-ratio: 4 / 3`), `src/take/screens.tsx` (width and height 800 / 600 at lines 75 and 89), `design-system/demo.py:375`, and a `shape` field in the data.
- Tall 4:5 panels are not in this round. The wide stage would show only about half of one, which breaks the Full Painting Rule (DESIGN.md:395). Ask the owner with pictures.
- Weight: the panels average 75 KB against the 60 KB limit for a painting (R-NUM-32). Bubbles add no image weight, and one painting serves all three languages.

**Painting runs.** Only the owner's Mac paints, through `~/.claude/heavy-queue/heavyq`, one job at a time. Before the repaint, run this test on the owner's Mac: 6 panels x 3 seeds, with and without the words "no signboards, no number plates, no letters", scored by the text check below. A run with guidance above 1 and a real negative prompt needs a change to the mflux call and runs two passes per step, so it is a later, separate test.

---

## 2. Stray-text check

- **Tool [N]:** macOS Vision, through a Swift script compiled once with the installed `swiftc`. Copy the prototype's `textscan.swift` into `design-system/art/textcheck.swift`. It works on 3 x 3 overlapping tiles scaled up 2x, at the accurate level, with language correction off and a minimum text height of 0.02.
- **Not used:** tesseract 5.5.3. It flagged 58 of 69 panels, mostly rain, halftone and leaves, and still missed the handwriting.
- **Runs [N]:** `python3 design-system/art/cutscenes.py check-text`, after `paint` and before `sheet`. It is light (14 s for 69 panels, 69 s for 267 raw tries), runs on any Mac and needs no heavy queue.
- **Rule A, refuse:** any recognised string of 2 or more letters or digits. Tested on the shipped panels, it caught 16 of the 27 with visible glyphs and wrongly flagged 2 of 38 clean ones (st-5-3, st-5-10).
  **[C]** `export()` (`cutscenes.py:457`) refuses a pick that has a Rule A flag, unless an `ALLOW` entry gives the owner's reason. This follows the `REMOVE` pattern at line 414.
  A small flagged box, such as a number plate, can be painted out by a generalised `clean()` (line 417), or the panel repainted with a new seed.
- **Rule B, review only:** text rectangles with 3 or more character boxes. Together with Rule A it caught 24 of 27, but it wrongly flagged 21 clean panels, so it never refuses.
- **On the contact sheet [C]:** `sheet()` (line 369) draws Rule A boxes in red and Rule B boxes in magenta beside each seed.
- **Headroom, same run [N]:** Vision face boxes and a head-top figure (the face top minus half a face) go into the panel's sidecar, `design-system/assets/cut-*.webp.json`, which already holds the prompt. A panel marked for bubbles is flagged when a speaker's head top is above 25% of the height.
- **What no tool catches:** made-up or Devanagari-like glyphs. Everything missed ft-2-2's tailgate, st-0-7's stamp and st-1-1's pass. The owner's eye on the sheet stays the last check, and the prompt rules do the main work.

---

## 3. Bubble data

**Words live in the story script [C].** File: `knowledge/story/first-take-script.md`, or the new story's script. Under each panel row there is a lines table:

| Panel | Who | To | Kind | English | Hindi |
|---|---|---|---|---|---|
| 1.10 | tara | dadi | say | Did Mohan nana get the course? | मोहन नाना को कोर्स मिला? |
| 1.10 | you | dadi | you | ... | ... |

- `Who` is a family-voice id from the story's people file, or `you`, or `-` for narration, sound words and signs.
- `To` is a person id or `you`. It feeds the name checks and the Hindi gender scan (section 7).
- `Kind` is one of the kinds in section 4.
- Today the speaker is written inside the caption (`Dadi: "..."`). A one-off migration splits it: a quoted line becomes a `say` line, and any other caption becomes a `narr` line.
- Placement is layout, not words, so it never goes in the script.

**Placement lives in its own file [N].** File: `content/take/bubbles.json`. The placement page in the library writes it (section 9), and it is keyed by panel id. All numbers are percentages of the painted panel, origin top left, to one decimal place.

```json
{"st-1-10": {
  "shape": "4:3",
  "focus": [50, 30],
  "faces": [{"who": "dadi", "box": [30.2, 19.9, 12, 16]}, {"who": "tara", "box": [59.2, 18.3, 13.5, 18]}],
  "lines": {"a": {"tail": {"to": "tara"},
                  "at": {"strip": {"x": 57.1, "y": 62.4, "side": "bl"}, "stage": {"x": 71.0, "y": 30.2, "side": "bl"}},
                  "tag": true}}
}}
```

What the fields mean:
- `focus`: the object-position for the wide crop. Default `[50, 30]`, as `library.css:922` has it today.
- `faces`: copied from the sidecar and checked by eye.
- `at.strip`: the anchor in the phone and tablet comic strip. `at.stage`: the anchor on the full-screen wide panel. `side` (tl, tr, bl or br) is the bubble corner nearest its speaker.
- `tail`: one of `{to: id}`, a point `{x, y}`, `{edge: "bottom" | "left" | "right"}` for an off-panel speaker, or `null`.
- `tag`: show the visible name tag on this line.
- A line with no `at` stacks under the picture (the fallback, section 5).
- `sign` lines add `quad`, the four corner points of the blank surface.

**Export [C].**
- `design-system/story_take.py` `panels()` reads the lines table instead of the 3 or 4 cell row. `hindi()` and `MISSING` keep working on every line.
- `design-system/tools/app_content.py` `cut()` (lines 42 to 50) merges `bubbles.json` and the sidecar faces, keeps the rule that only painted panels ship, and writes `content/take/first-take.json` and `public/take/`.

**App type [C].** File: `src/take/data.ts`, the Cut type at lines 55 to 59:

```ts
type Kind = 'say' | 'whisper' | 'shout' | 'think' | 'narr' | 'you' | 'sfx' | 'sign'
interface Anchor { x: number; y: number; side: 'tl' | 'tr' | 'bl' | 'br' }
interface Line {
  id: string; order: number; kind: Kind
  who: string | null; name?: Bi; to?: string        // name: the speaker's tag and screen-reader name
  t: Bi                                              // English mode comes from eng(), as every string does
  tail: { to: string } | { x: number; y: number } | { edge: 'bottom' | 'left' | 'right' } | null
  at?: { strip: Anchor; stage: Anchor }
  quad?: [number, number][]; tag?: boolean
}
interface Panel { id: string; world: string; pic: string; shape: '4:3' | '2:1'; focus: [number, number]; lines: Line[]; alt?: Bi }
```

`cap` goes, because narration is a `narr` line. **[R]** Each line's text is a `Bi` pair. `T`, `say()` and `eng()` (`src/take/lang.tsx` lines 9 and 11) work unchanged, so a line has three renderings: Hinglish (`en`), English (`eng(en)`) and Hindi.

---

## 4. Bubble kinds and their look per world

**What every bubble shares [N]** (`library.css`, a `.bub` block after the `.cutpanel` rules at lines 1610 to 1618):
- It is an opaque plate: `var(--paper)` with the world's `var(--tex)`, text in `var(--ink)`, a `var(--frame)` solid `var(--ink)` edge, and `border-radius: var(--r-chip)`. The Full Painting Rule says plates, never blur (DESIGN.md:395, 705).
- Text is the Body style, Hind 500 at `var(--t-body)`, line height 1.5. This is "the lines people say" (DESIGN.md:346).
- The name tag `.who` reuses `.voice b` (`library.css:389`). It is a Label, shown when `tag` is true and hidden from screen readers.
- No new colours, sizes or radii. `--t-body` is already 15 px on phones and 19 px on wide screens (`library.css:16`, `:861`).
- **[R]** The look starts from `.voice .balloon` and its wedge tail (`library.css:385` to `390`).
- **Owner choice [N]:** round comic corners against today's 4 px balloon (DESIGN.md:434). It goes on the library page as an `ab_item` (`library.py:946`).

| Kind | Look | Limits |
|---|---|---|
| `say` | The shared plate, with a wedge tail to the mouth | at most 10 words |
| `whisper` | Dashed edge, at 4.5:1 for dashed strokes (R-NUM-17). Text is never smaller | at most 10 words |
| `shout` | A double edge: the ink frame plus a ring in `var(--accent)`, with square corners. Never capitals, which Devanagari lacks, and never larger text | at most 1 per chapter |
| `think` | A pill shape (`9999px`) with a tail of two small circles. Family voices only | rare |
| `narr` | A square box hard against a panel edge (top left by default), with no tail. Label style, so it never looks like speech. Time and place only, never a judgement of a person | at most 12 words |
| `you` | The shared plate with a `var(--accent)` edge, never `--pick` yellow (O2). It sits bottom right, with its tail running off the bottom edge. Tagged "You" / "आप" | at most 10 words |
| `sfx` | One sound word in Hind 700 at `var(--t-title)`, on a small paper chip turned 4 degrees. A plate is needed because R-COVER-3 requires one on a painting | 1 word |
| `sign` | Live text set on a painted blank surface through `quad`, drawn with a CSS `matrix3d`. Hinglish mode puts the Hindi here (DESIGN.md:449) | as the surface allows |

How each world dresses the plate. All values are the world's own tokens (`library.css:110` to `121`, `design-system/worlds/*.css`). Whisper and shout follow the shared rule in every world.

| World | Plate | `narr` box |
|---|---|---|
| Lugdi | newsprint paper, 2.5 px frame, 4 px corners | the newsprint caption strip (DESIGN.md:251), with Lugdi's red offset shadow |
| Station | ticket paper, 1.5 px frame | an enamel name plate (`--enamel` with `--ink`) |
| Jadugar | cardstock, 1 px frame, 8 px corners | a playbill strip ruled in `--accent` |
| Cricket | plain paper, 1 px frame, 4 px chip | a scoreboard plate: `--ground-deep` with `--on-ground` |
| Rukavat | warm paper, 1 px frame, 12 px corners | a TV subtitle strip across the panel's foot: `--ground-deep` at 85% with `--on-ground` |

Present-day panels (2026) take the colours of the chapter they belong to, as `cut()` does today.

**Open owner choices, kept out of the default:**
- A display face for sound words. The One Cover Title Rule (DESIGN.md:354) keeps display faces on cover titles.
- Phone screens (notifications, the family chat) as a `sign` on a painted blank phone. The "no group chat" decision is softened, not withdrawn.
- Rukavat's lettered slide, the one raster with words in it (DESIGN.md:691).

**[R] Decision steps** keep `Voice`, `Question` (the H1 at 104 px, DESIGN.md:366), the cards and the one button (`src/take/parts.tsx`, `src/take/steps/*`). The last panel before a decision ends on the asker's goal for the moment. The task itself stays in the question.

---

## 5. Layout rules

**Anchors [N].**
- Each line is anchored by its corner nearest the speaker, in percentages of the painting. A bubble that comes out smaller at a wider size keeps that corner, so it stays by the mouth and inside the box that was checked.
- Placements are authored at the narrowest strip (328 px, a 360 px phone), using the largest box of the three renderings (Hinglish, English, Hindi).

**Placer, which proposes and is never final [N].** It searches a grid in 1.5% steps.
- Hard rules: no bubble on a head box (the face box grown 30% on each side and 70% upwards), and no bubble on another bubble.
- It then picks the spot with the least picture detail under the bubble (a Sobel map on a 40 x 30 grid), the shortest distance to the mouth, and the fewest breaks of reading order.
- It lives in a shared module, `design-system/tools/bubbles.js`, ported from the prototype's `place()`, `tails()` and `clampWide()`. The placement page and the check both use it.

**Tails [N].**
- The mouth point is the face box's horizontal centre at 85% of its height.
- A tail stops about 55% of the way from the bubble to the mouth, never crosses another tail, and never ends on a card person (section 7).
- An off-panel speaker's tail butts against the panel edge. Every `you` tail runs to the bottom edge.
- Tails are drawn by one SVG layer per panel: an outlined wedge under the bubble, and a fill-only wedge over it to hide the join. This is a small shared module, `src/take/tails.ts`, also loaded by the demo.

**Phones and upright tablets, the strip [C].**
- The panel is the column minus the 16 px gutters (`library.css:1609`).
- The layer sits inside `.cutpanel`, which gains `position: relative` and `container-type: inline-size`.
- Speech bubbles are at most `min(58cqi, 17em)` wide. A `narr` box may run the panel's width minus 3% margins.

**Wide screens, the stage [C]** (`library.css:919` to `944`).
- Replace `object-fit: cover` (line 922) with an art box sized as the cover crop: width `max(100cqw, 133.33cqh)`, height three quarters of the width, offset by `focus`. The bubble layer goes inside the art box, so percentage anchors follow the painting. The layer belongs in `.cutstage`, not only in `.cutpanel`.
- Stage anchors must keep each bubble inside the band that stays visible between the top bar and the foot row: 9.3 to 79% of the painting at 1440 x 900, 15 to 68% at 1280 x 650, and 20 to 60% at 844 x 390.
- Reusing the phone anchors failed (Dadi's line landed on the scorecard). That is why there are two anchor sets.

**Hindi [C].**
- Same font size.
- Line height 1.6 under `:lang(hi)`, because bubbles wrap (R-NUM-12). DESIGN.md:346 says 1.5 for Body, so settle it in DESIGN.md in the same change.
- Lines break only at spaces and never inside a conjunct. No italics or slanting in any language (Devanagari), and no fixed heights.
- Measured in Hind 500 at 15 px, Hindi runs a median of 0.82 of the English width (from 0.65 to 1.22). The steady cost is height, which is why placement uses the largest box.

**200% text and every fallback [N].**
- Under `.is-200` (`library.css:601`), lines leave the picture and stack under it in reading order. The panel stays whole, and each line gets a short tail pointing up to its speaker's x position.
- The same fallback applies when a line has no `at`, when the picture fails to load or is not cached, and when a bubble rendered at run time overlaps a head box (for example after a font fails).
- At 200% no test panel had room: bubbles would have covered 38 to 72% of the panel.

**Sizes checked [N]:** 360 x 800, 390 x 844, 768 x 1024, 844 x 390, 1280 x 650 and 1440 x 900, in all three modes, at 100% and 200% text (section 9, `bubble_check.cjs`).

---

## 6. Reading order, screen readers, motion, offline

- **Order [N].** The page order equals `order`, which equals the reading order: top first, then left before right. Narration at the top comes first. Hindi and English both read left to right, so one rule serves all three modes.
- **Screen readers [C]** (`src/take/screens.tsx` Cutscene, lines 86 to 91).
  - Each line starts with a visually hidden prefix (`.vh`, `library.css:656`): "Riya says:" / "रिया:". The player's lines read "You:" / "आप:". Narration has no prefix. This is the R-VOICE-3 pattern.
  - All of a panel's lines enter the page together, inside the existing `aria-live="polite"` `.cutbody`, so each beat is read once and in order. Never insert lines one by one on a timer.
  - The picture's `alt` stays empty, because the words are live. A picture that alone carries a fact (a clock running late) gets that fact in words in the beat. Alt text never hints at who is better for a job.
  - **[R]** Focus moves as today (DESIGN.md:420).
- **Taps [R].** Nothing moves on by itself (O4, R-A11Y-17). One tap brings the next beat; scrolling is only for looking back; no swipes. **[N]** With motion on, a beat's lines fade in from scale 0.9 over 180 ms, 260 ms apart, through `animation-delay` from `--o`. A tap during that finishes the entrance, and the next tap moves on.
- **Reduced motion [R].** The global stop (`library.css:622`) plus `reduced()` (`screens.tsx:7`) shows every line with its panel at once: no fade, no scale, no shake.
- **Offline [C].**
  - Every line in all three languages is in `first-take.json`, which is cached with the app.
  - Paintings are cached one chapter ahead (`src/pwa.ts` `cacheAhead`), but not when the browser asks to save data.
  - Today `hide()` (`screens.tsx:9`) hides a failed picture and keeps its caption. **[C]** Instead, it adds `.is-nopic` to the figure: the picture box collapses and the lines stack, as in the 200% fallback, on the world's `--ground-deep`. A beat never shows bubbles floating in an empty box.

---

## 7. Dialogue rules that keep the equal pair hidden

The evidence: 38 of the 40 decisions open with a remark, 32 of those name someone, and all 32 name one of the hidden pair (`knowledge/reviews/team-feedback-2026-10-23.md`). Bubbles add many more lines that could do the same.

Each rule is backed by a refusal in the export (memory: tool-backed-rules), next to `length_faults` in `design-system/story_take.py`. Rules marked "by eye" go on the review list. **[N]** throughout.

1. **Two casts.**
   - Family voices talk to each other and to the player, and are never on a card.
   - Card people are never painted (inset portraits only, all the same size), speak no line before their decisions, and appear only all together.
   - *Refuse:* a line whose `who`, `to` or `tail.to` is a card person in that chapter.
2. **No line names or points at anyone on the cards to come.** No bubble, caption, sign or player line before or during a decision names a card person, or describes them by relation, pronoun, job or looks. The only exceptions are marked decoys about people outside the pair, which the owner said yes to on 23 Oct.
   - *Refuse:* any card name, or a card person's relation word, from a decision still to come in the chapter.
   - This is the owner's Lugdi rule, "the speaker's line only sets the scene and never names or repeats a card", applied to every character.
3. **No praise, doubt or gossip about a card person in panels.** The loaded word stays in the card note (ideas A and B). Idea D, a fact told earlier in the story, stays out of bubbles until the research check (RSE-164).
4. **The same asker and the same shape in both halves of a twin.** The same character asks both, with the same number of lines, the same kinds, and word counts within 2.
   - *Refuse* otherwise.
   - A character played for laughs never asks a decision. Across the whole take, the characters who talk are balanced between women and men.
5. **The ask gives only the goal of the moment** ("The baraat leaves at 7"), never the skill that decides the job. The key names the numbers for every card the same way.
6. **The player's lines are fixed.**
   - They are never options, and they are the same whatever will be picked.
   - They state no rule for choosing ("Experience first"), name no card person, and never agree or disagree with a remark.
   - After the commit, a line may carry the pick only as a template that is identical for every card ("{name}, the night mail is yours").
   - *Refuse:* a `you` line that changes with the pick, except through that template.
7. **No reaction to a pick before the chapter ends.** Inside a chapter, every face, bubble, sound and motion after a commit is the same for every card. Twins sit four decisions apart in the same chapter. Reactions wait for the chapter's outcome, where the reaction line comes from a family voice outside every pair, speaks about the event, and must pass the outcome swap test.
8. **No bubble emphasis on people.** If a line ever touches card people (a crew introduction):
   - every card person gets exactly one line, of the same kind, within 2 words of the others, and the pair's two match;
   - the lines come in the cards' shuffled order (`useShuffled`, `src/take/steps/common.tsx`);
   - no line points its tail or gaze at one card, and no word is bold, in capitals or in colour.
   Emphasis such as the shaadi's "YOU" belongs only in stakes lines.
9. **Stakes never point at gender.** No line mentions women, men, roles tied to gender, or what people say about a woman doing something. This extends R-COPY-21, which binds the app's own voice, to every character. Hard topics never appear in panels (`knowledge/content/story.md:39`).
   - *Refuse:* a word list in both languages (women, men, girls, boys, ladies, औरत, आदमी, महिला, पुरुष, लड़की, लड़का, and so on).
10. **The player has no gender** (R-COPY-22).
    - The player is never drawn, never named, and never given a kin word that fixes gender or age (beta, bhaiya, didi from a peer). Address the player by role ("in charge", इंचार्ज) or as "you".
    - Hindi said to or by the player uses commands, wishes, or sentences where the player is not the subject of the verb ("फ़ैसले अब तुम्हारे हाथ में", a draft for a native reader).
    - *Flag* in every line with `who` or `to` set to `you`: endings ोगे/ोगी, ूँगा/ूँगी, ेगा/ेगी, ता/ती/ते before हूँ/हो, गया/गई, था/थी, and the kin words बेटा, बेटी, भैया, दीदी. The export refuses until a native reader's `ALLOW` entry clears each flag.
    - Two known failures today: script 0.7, "लो बेटा। फ़ैसले तुम करोगे।", and demo.py OPENING, "आप तय करेंगे कौन".
11. **Relations to the player match inside a pair.** Both are cousins on the same side, or both are colleagues. Family members never sit in a pair (`knowledge/story/family-as-options.md`).
12. **Painted presence, by eye.** Check every panel for:
    - a crew member painted alone, or doing something brave or clumsy;
    - who stands in the ask panel;
    - a bubble's size, place or tail pointing at someone;
    - one face painted prettier or fairer (memory: flux-portrait-biases).
    Do this alongside the hands-and-faces count.
13. **Measure it.** After each chapter in the playtest, ask "What do you think this was about?" and count the players who name a character's line or the pair. A new tell found from surface features is raised with the research line and backed by a tool, never fixed silently.

---

## 8. Word count for panels with bubbles (a proposal for the owner's yes)

Why: today speech is free. O8 and R-NUM-20 leave out "lines spoken by a named character", every balloon carries `data-count="0"` (`library.py:141`, `parts.tsx` Voice), and `tools/frames.cjs:41` skips them. In a webtoon nearly every word is speech, so without a change the 15 and 20 word limits would count almost nothing.

- **Counted per beat**, at 390 and 360 wide, in each language separately. Both must pass. Hinglish is counted as it renders.
- **Story beat:** at most 20 counted words, at most 2 spoken lines (`say`, `whisper`, `shout`, `think`, `you`), at most 1 `narr` box and at most 1 `sfx`, with 3 pieces in all. A spoken line is at most 10 words and a `narr` box at most 12 (R-NUM-21's sentence cap). Of today's spoken lines, the median is 6 words and the longest is 11.
- **Outcome beat:** at most 20 counted words. Names and numbers in a ticker count 0.
- **Per chapter:** all story beats together come to at most 120 counted words. This is a house figure, to be tested by timing the five newcomers.
- **Decision steps are unchanged.** The 15-word cap stays, and the voice nudge stays outside it. Moving the nudge into the count is a research-line question.
- **What counts:** speech, the player's lines, narration, sound words (1 each), words on signs that are not names, buttons, Skip and Next.
- **What does not count:** names of people and places, kinship words used as names (Dadi, Bua), numbers, and text only a screen reader hears (the `.vh` prefix). Panels from earlier beats that stay visible above are not counted again.
- **Tools.**
  - **[N]** A beat counter in `design-system/tools/app_content.py` refuses to build. The 25 Oct audit found that no check reads the First take at all.
  - **[C]** Bubbles do not carry `data-count="0"` (`NOCOUNT`, `library.py:141`). **[N]** Names inside them are wrapped in `<span class="nm">`, which `frames.cjs:41` already skips, so the existing counter counts speech and skips names.

---

## 9. Library-first build order

Each step needs the one before it. Every part lands in `library.css`, on the library page and in `DESIGN.md` in the same turn, and the library is republished (memory: library-in-sync).

1. **Parts in the library [N]: `design-system/library.css`, `design-system/library.py`.**
   - Add the `.bub` block with its kinds, `data-side` translates, `.who`, the tail layer, the `.is-nopic` and `.is-200` stacks, and the stage art box.
   - Add a `bubble()` helper beside `voice()` (`library.py:146`).
   - Add a library page section showing every kind in all five worlds and the present day, in Hinglish, Hindi and English, at 360 px and on the 1440 stage, with reduced motion, 200% text and no picture.
   - Add `ab_item`s for round or square corners, and for the sound-word face.
2. **Rules in `DESIGN.md` [C]**, beside lines 346 (Body), 395 (Full Painting), 434 (radii) and 478 (Voice): the kinds, the 1.6 Devanagari line height, the per-beat word count and the casts rule.
3. **The pictured parts sheet for the owner's yes [N].** Per design-before-build, no app code is written before this.
   - It shows every bubble kind, a dialogue panel, a `you` line, the 200% and offline stacks, and the wide stage, in all five worlds, at phone width, in Hinglish and Hindi.
   - Build it from panels already painted (for example st-1-10, st-4-10, ft-*) and real script lines.
   - `design-system/demo.py` `sketch()` (line 497) writes `parts-first-take.html` and `library.py` embeds it.
   - Ask in plain words, with a game example: round or square bubbles? a name tag on a person's first line? sound words in the world's big lettering? the player's reply as a bubble? station names lettered by the app? wide 2:1 panels?
4. **Checks [N].**
   - `design-system/art/textcheck.swift` and `cutscenes.py check-text` (section 2).
   - The lines-table parser and the section 7 and 8 refusals in `story_take.py` and `app_content.py`.
   - `design-system/tools/bubble_check.cjs`, in the style of the other `tools/*.cjs`. It is one page with no screenshots, and it fails on a bubble on a head box, overlapping bubbles, a bubble outside the visible band, or an unplanned fallback, at the six sizes, three modes and two text sizes.
5. **The placement page in the library [N].** It shows each panel in both frames and all three modes with the placer's proposal. You drag to adjust, switch corners, and press "Copy JSON" into `content/take/bubbles.json`. Estimate: 1 to 3 minutes per dialogue panel.
6. **Painting [C]:** the prompt lines and glossary rows from section 1, then the owner queues repaints on their Mac through heavyq. Each try is scored by `check-text`, and the owner picks from the contact sheet.
7. **App [C].**
   - The `src/take/data.ts` types.
   - The Cutscene in `src/take/screens.tsx`: the layer, the fallback, `.is-nopic`, and the stage layer.
   - `src/take/tails.ts`.
   - The merge in `app_content.py`.
   - `demo.py` `cutscene()` (line 373) and `cutShow` (line 207).
   - **[R]** Keep Skip, "?", the dots, Next, the world switch and the focus move as they are.
8. **Verify.** Run `bubble_check.cjs`, then take a few screenshots. A batch render of every panel in every language is a heavy browser batch and goes through heavyq.

Rough build cost, an estimate from the prototype work:
- about 1 day for the parts, the rules and the library section;
- about 1 day for the placement page and the checks;
- about 1 day for the app.

That is roughly 3 days, plus the owner's picks. A full repaint of the 46 story panels takes about 2.5 to 4 hours in the queue, overnight.
