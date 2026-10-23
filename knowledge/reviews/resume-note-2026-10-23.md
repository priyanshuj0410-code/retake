---
type: runbook
title: Resume note, 23 Oct 2026 ("Dadi's trunk" in the demo)
description: Where the First take's new story stands, what is running, and the exact steps left so it is ready in all three languages before the research resumes after the usage reset on 25 Oct 2026, 2:30 pm. Written at 96% weekly usage.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-18/
  - https://app.plane.so/the-equal-lens/browse/RSE-164/
---

# Resume note, 23 Oct 2026

Owner: "Start painting... I need this in the demo"; "Get the hindi and hinglish modes working as well... everything should be ready before we resume the research on 25th".

## Done

- **The story bible:** `knowledge/story/` (README, timeline, people, situations, family-as-options, first-take-script, first-take-hindi).
  - Review page: https://claude.ai/artifact/PTjgvyL3JEAPZP6q4FNE6S. Rebuild it with `python3 design-system/tools/md_page.py knowledge/story/first-take-script.md <out.html> "First Take Script"`.
- **The story demo build:** `python3 design-system/demo.py story` writes `story.html` from the script.
  - It has all 40 decisions, with notes, progress, family options and the results.
  - Hindi for every decision string is in `knowledge/story/first-take-hindi.md`, and the build reports any string still missing (none at writing).
  - Hinglish is the default mode.
  - Cutscenes appear once their panels are exported.
- **The painting pipeline:**
  - `art/cutscenes.py` reads every panel from the script (prefix `st`) and the six portraits (prefix `pt-`: Mohan, Ramesh, Rani, Vikram, Bauji, Badi Amma).
  - A new present-day style is in place (`STYLE['now']`), and fixed looks for each person at each age are in `LOOKS`.

## Running (in the heavy-job queue, in order)

1. "Dadi's trunk panels": 51 panels, 3 tries each, about 2.5 hours from 23 Oct, evening.
2. "Family portraits": 6 portraits, 3 tries each.
3. "Story demo check": the story demo played in Hinglish, Hindi and English (screens under the scratchpad `story-*`).

## Left, in order

1. **Check the opening's seven panels** (the 2026 style, and how alike Dadi looks). If they fail, stop the queue, fix `STYLE['now']` and `LOOKS`, and repaint `st-0`.
2. **Make the sheets and pick:** `python3 art/cutscenes.py sheet st` and `sheet pt-`.
   - Picks go in `PICKS_ST` and `FACE_PICKS`.
   - The owner swaps any panel. Unpicked panels export the first try.
3. **Export:**
   - `python3 art/cutscenes.py sheet st`, then `export st`, which writes `assets/cut-st-*.webp`.
   - `python3 art/cutscenes.py faces`, which writes the six card faces.
4. **Rebuild:** `python3 design-system/demo.py story`, then play it in all three languages (`PAGE=story.html` in `tools/demo_check.cjs`) and look at the Hindi screens.
5. **Republish the shared demo as panels come in.** `python3 design-system/demo.py demo` builds the story with all 40 decisions and every hard cover (owner, 23 Oct 2026: "include the hard questions... these are my team members"). A cutscene shows whichever of its panels are exported so far.
   - Stage `demo.html` and the files in `demo-files.json` into a new scratchpad folder, then publish to https://claude.ai/artifact/XGE6JfvFLsmRHYSbuxjdZQ (v15 carries the opening without 0.5).
   - No help line number is printed in it. Check each chapter's line against its official source before anyone outside the team plays.
   - Update the library's "First take" section if any part changed.
   - **Trunk prompts:** "trunk" alone painted a tree trunk (st-0-5), so `art/cutscenes.py` now says "tin storage trunk". The running job loaded the old wording, so look hard at st-1-1, st-5-10 and st-6-9 on their sheets. Move any bad tries to `art/raw/cut/old/` and run `paint st` through heavyq again. "Repaint the trunk panel" (st-0-5) is queued.
6. **On 25 Oct, after 2:30 pm, the research check** of:
   - family members as options (`knowledge/story/family-as-options.md`);
   - the decoy and gossip notes;
   - Believe cards carrying an account and a note;
   - then RSE-164's validate stage, as in `resume-note-2026-10-22.md`.

## Owner feedback on the shared demo, 23 Oct 2026 (late)

The owner's feedback: "The rankings need to be more clear", "Vikram looks too old", and "The cutscene story texts have to be a lot better... they should invite the players in, engage them, not just challenge them".

- **Captions:** all 46 rewritten in English and Hindi (`design-system/tools/captions_2026_10_23.py`). They use family voices, jokes and small mysteries, and Dadi hands over the calls. The voice rule is in the script's "How to read". The script page is republished: https://claude.ai/artifact/PTjgvyL3JEAPZP6q4FNE6S (v2).
- **Rank:**
  - The place now sits where the tick goes, at the headline's size, in the world's accent.
  - Ranked rows move up into their order.
  - A "2 seats" perforation falls under the last seat.
  - It is recorded in `first_take.py`, the `demo.py` script, `library.css`, DESIGN.md and the library's "First take" section. The library page is rebuilt but not yet republished.
  - `tools/rank_check.cjs` shoots it in all three modes.
- **Vikram:**
  - His 2026 look in `art/cutscenes.py` and `people.md` is now younger.
  - "48" and "wincing" are out of panels 0.3 and 4.10.
  - His old tries are in `art/raw/cut/old/`.
- **Queue order:** "Family portraits", then "Opening repaint (Vikram, trunk)" (`paint st-0`), then "Rank and story check" (shots in the scratchpad's `rank-check/` and `story2-*`), then "Dadi's trunk panels, resumed" (`paint st`). Always paint with `~/.local/share/uv/tools/mflux/bin/python`, never `python3`.
- **Then:**
  1. Sheet st-0 and pick st-0-3 and st-0-5.
  2. Export, and rebuild `demo` and `story`.
  3. Look at the rank shots.
  4. Republish the shared demo (XGE6Jf…) and the library (FXXMLDh6…).

## The painter's glossary and names, 23 Oct 2026 (evening)

- The rule and its table are in `knowledge/story/situations.md`, "The painter's glossary".
  - `art/cutscenes.py` adds the definitions and swaps each name for a role and a look.
  - It refuses undefined words and role clashes. `python3 art/cutscenes.py check` must report 0.
- The reviewed picks are in `PICKS_ST`, covering the opening, chapters 1 to 4 and 5.1.
  - The faulty tries are in `art/raw/cut/old/glossary-2026-10-23/` and `old/names-2026-10-23/`.
  - "Dadi's trunk panels, roles and glossary" repaints 1.9, 2.2, 2.4, 2.9, 3.2, 3.9, 4.4 and 4.9, then chapter 5 and the finale.
- The family card faces now come from `art/portraits.py` (FAMILY), in each world's own card style. After they are painted, run `ONLY=Mohan,Ramesh,Bauji,Rani,Vikram,Badi python3 art/portraits.py process`.
- The family faces are processed. The shared demo is at v16 (10 of 13 cutscenes) and the library at v35.
  - The last browser check ran before the faces and the `.rkcut[hidden]` rule. Run `tools/rank_check.cjs` and `tools/demo_check.cjs` through heavyq once the painting ends.

## Late evening, 23 Oct 2026

**Notes:**
- The notes are the same length (`tools/notes_2026_10_23.py`), and `story_take.length_faults` blocks the build otherwise.
- This changes the stimuli, so the research check on 25 Oct must review the new notes.

**The "?" sheet:**
- The owner chose option C of three (`help_options.py`, `help-options.html`).
- It is built: one line of how to play, the languages as chips, sound as a switch, and the handle centred.
- The library shows eight languages wrapping.

**The trunk:**
- It is painted from a reference picture (`art/refs/trunk.png`, try 7203).
- `cutscenes.py paint-refs` uses FLUX.2 klein edit for the six trunk panels, and plain `paint` skips them.
- The room has one definition (grey cement floor). The 1999 TV room has its own.

**The queue now:**
1. "Trunk panels from the reference".
2. "Quiet sheet check".
3. "Dadi's trunk panels, the rest".

**Then:**
1. Sheet and pick st-0-3, st-0-5, st-0-6 and st-1-1, the trunk panels.
2. Reset their `PICKS_ST`, export, rebuild, and republish the demo (v17 is live) and the library (v36 is live).

## Owner's picks, 23 Oct 2026 (night)

**Swapped:** 1.9 to 7100, 1.10 to 7319, 2.2 to 7203, 3.3 to 7319, 3.10 to 7203. 0.3 is 7203 and 0.5 is 7100, both from the reference.

**Repainting with rewritten scenes:**
- 2.9: the trucks were distorted. They are now in one row, seen from a distance.
- 2.10: Meera smiles and teases.
- 4.2: there was a scorecard on a tree trunk. The scene is now a hand and the scoreboard by the field.
- 4.3: everyone wore pads. Now only Rani does; a "batting pads" glossary row was added.
- 0.6: the trunk now stands open with its plain inside lid showing.

**Exports:** `export st` now exports only panels in `PICKS_ST`, so an unreviewed try never reaches the demo.

**Still in the demo:** the stale 0.6 and 1.1 pictures, until their repaints are reviewed. The demo is at v20.

**Checklist for trunk panels:** two parrots; long and low; padlock centred; handles on the ends; lid open only where the scene says so.

## All panels painted, 23 Oct 2026 (late night)

**Coverage:**
- Every panel is painted, and 13 of 13 cutscenes have pictures. The demo is at v23.
- The batch sheets for the owner are `Sex Ed/demo-alternatives.png`, `demo-batch-2.png` and `demo-batch-3.png`.

**Last repaints:**
- 5.4: a boxy 1990s TV frozen on colour bars, and relatives throwing up their hands.
- 6.4: an old lorry's cab.
- 6.6: the scoreboard beside the field at dusk.
- These came with a new glossary row, "TV, television", and "TV" was added to the need list.

**After the last repaints:**
1. Pick them and export.
2. Run a full browser check: `tools/help_check.cjs`, `rank_check.cjs`, and `demo_check.cjs` in mix, hi and en.
3. Republish the demo.

## Done, 23 Oct 2026 (close)

**Published:**
- The shared demo is at v24. Every one of the 51 panels is picked and exported, 13 of 13 cutscenes are in, and the queue is empty.
- The full browser check passed: the "?" sheet, the rank step in mix, hi and en, and 63 screens in each mode with no page errors.
- The diary finale was looked at in Hindi.

**Picks still open to the owner's review:**
- 3.9: the cash box is on the stage rather than under it.
- 5.4: the relatives wail rather than groan.
- 5.10: the diary covers the parrots.
- 1.1: the pass covers one parrot.

**Next:**
1. The research check after the reset on 25 Oct, 2:30 pm (see above).
2. The help line row in "?" for the hard chapters, once each number is checked.
3. A native Hindi read.
4. The two fact checks.
5. The kinship words "Mohan nana" and "Pallavi masi".
6. Possibly painting Dadi from a reference picture, as was done for the trunk.

## Second review round, 23 Oct 2026 (late night)

**Swapped:** 3.2 to 7100, 5.1 to 7319, 5.4 to 7319. The demo is at v25.

**Repainting:** 2.3, 4.2, 4.4, 4.9, 5.2 and 6.6.
- The 1992 panels came out as photographs, not illustrations. `STORY_STYLE['cricket']` in `cutscenes.py` now makes the story's 1992 panels gouache and ink. The covers keep the wide style from `wides.py`.
- 2.3: Ramesh is bare-headed and Mohan clean-shaven in the cap.
- 5.2: Dadi now holds the card in her room. It no longer floats on white.

**Note:** 4.3 was painted in the old 1992 style. Offer to repaint it so chapter 4 is one style.
- The owner said yes. All seven repaints are now picked:

  | Panel | Pick |
  |---|---|
  | 2.3 | 7203 |
  | 4.2 | 7100 |
  | 4.3 | 7319 |
  | 4.4 | 7203 |
  | 4.9 | 7319 |
  | 5.2 | 7203 |
  | 6.6 | 7203 |

  The sheet is `Sex Ed/demo-batch-4.png`.
- The demo is at v26.
- The storyboard is https://claude.ai/artifact/Af7z5a5id1Ykg6iQgpCJBu (v2), rebuilt with `python3 design-system/tools/storyboard.py <out>`.

## Type scale cut to 0.8, 23 Oct 2026 (night)

**The owner's instruction:** "Reduce all the 15px CSS to 12px CSS and mediums to regulars... scale down the other sizes accordingly".

**What changed:**
- The type tokens in `library.css` were cut to 0.8, including at 200% text and on wide screens. The steps are now 12, 15, 19, 25, 31 and 40.
- Medium (500) is Regular (400) in game text.
- The changes are recorded in DESIGN.md's type entries.

**Checked:** on an emulated Pixel 9 (`tools/type_pixel9.cjs`, then the page from `tools/type_page.py`), and the play-through passed in all three modes.

**Published:**
- Demo: v29.
- Library: v38.
- The Pixel 9 type page: https://claude.ai/artifact/WCwsgmMw1yHxp6bFpyrdZ1 (v2).

**Open:** the chapter covers are still the daily game's cover ("Kolkata, Platform 5", tabs). This has been raised with the owner and is not changed.

**Superseded the same night.** The owner said: "Update the icons and components accordingly... everything's all over the place."
- The type tokens are back to 15, 19, 24, 31, 39 and 50.
- The phone draws its screen at 0.8 instead: `--k`, a zoom on `.phone > .scr`, the sheets, toasts, dialogs and menus, and `.app > .shell`. Type, icons, faces, buttons and spacing therefore keep their proportions. The CSS 15 shows at 12.
- Medium is still Regular.
- `.scr` keeps 44 px on the glass for the notch.
- The rank's moving rows divide by `currentCSSZoom`, and `type_pixel9.cjs` reports sizes on the glass.
- Every check passed.
- Published: the demo at v30, the library at v39, and the type page at v3.

## Vercel and the app's height, 23 Oct 2026 (night)

**The Vercel site:**
- `design-system/tools/vercel_demo.py <dir>` builds the demo as a static site for Vercel's equal-lens-daily project, with a viewport tag, a reset and noindex.
- Claude Code's safety check blocks production deploys, so the owner runs `vercel deploy --prod --yes` in that folder. The folder is already linked to equal-lens-daily.

**Height fix (owner: "The app's height is not scaling based on the viewport"):**
- **The cause:** a library rule, `.phone:not(.is-thumb):not(.is-small)` with `aspect-ratio: 390/844` at 440 px and below, outranked the demo's full-height rule. A 412-wide phone was held at 892 tall.
- **The fix:** the demo now sets the height from `visualViewport` (`--app-h`) with a rule that wins. On desktop the frame scales up as well as down to fill the height.
- **Checked:** `tools/height_check.cjs` on a Pixel 9 (923 of 923), a laptop and a short screen.
- The demo is at v31.

## Type and scale reverted, 23 Oct 2026 (night)

**The owner's instruction:** "go back on the font and scaling changes".

**What went back:**
- The 0.8 screen zoom (`--k`) is removed.
- The 13 Medium weights are restored.
- The DESIGN.md scale entry is removed, and Body and the stat key are back to 500.
- The rank's movement code is back to its original.

**What stays:**
- The height fix (`--app-h`, the demo's full-height rule).
- The zoom-aware measuring in `type_pixel9.cjs`.

**State:** the sizes are back to 15, 19, 24 and 39 with Medium. Every check passed. Published: the demo at v32, the library at v40, and the type page at v4. The Vercel folder is rebuilt; the owner runs the deploy.

## Known gaps

- **Likeness:** the image model keeps no face from panel to panel. The fixed looks only approximate one.
- **Fact-checks still open:** the 1971 engines at Manmad; whether a woman could be station master in 1971.
- **Hindi:** a first draft. It needs a native reader before alpha players see it.
