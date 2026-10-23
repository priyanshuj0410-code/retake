---
type: content-draft
title: Week-change cutscenes, the kite thread
description: How Retake's comic-strip cutscenes carry a player from last week's world style into this week's, with the first proof (Lugdi to Station), the owner's panel picks of 22 Oct 2026, and how to rebuild it. Captions and the other four transitions are still to come.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-18/
---

# Week-change cutscenes: the kite thread

Owner, 22 Oct 2026: comic-strip cutscenes that take players "from the last week to the current week ... so that its not abrupt or confusing and it feels like a single story". Effort and order are in [the estimate](../reviews/estimate-alpha-and-cutscenes-2026-10-22.md).

## The thread is a kite, not a person

- The image model does not keep a face the same across styles, so the thread is an object: the orange paper kite with three orange bows, which Rukavat's slide and cover already carry.
- In every world the kite is the one orange thing, printed as a spot colour in the two-ink worlds, so the eye follows it from panel to panel.
- The proof confirmed it: the kite reads as the same kite in Lugdi gouache and in the Station screen print.

## First proof: Lugdi to Station (four panels)

1. Lugdi: the kite tied to the red truck's mirror on the ghat in the rain; the string snaps.
2. Lugdi: the kite rises over the hairpin bend, the truck small below.
3. The seam: one sky painted twice, Lugdi night and Station dawn, joined on a torn-paper edge with the kite on the tear.
4. Station: the kite caught on the signal arm as the train comes in.

The owner picked the left try of panels 1, 2 and 4 and the right try of panel 3. Panel 4's try had a second kite and a loose tail, which were painted out with the owner's yes, so one kite runs through the strip.

## In the demo (22 Oct 2026)

Owner: "Add this cutscene in the demo with the story". The shared demo (`design-system/demo.py`) now starts in Lugdi, and the cutscene plays between Lugdi and Station.
- **How it plays:** panels arrive one per tap, down the page like a comic strip. The screen's ground, type and button change from Lugdi to Station with the newest panel. Skip is in the top bar, and reduced motion drops the slide-in.
- **The story**, one caption per panel (Hindi is a first draft for a native speaker):
  1. "Last night, on the ghat road, the string snapped." / "कल रात, घाट की सड़क पर, डोर टूट गई।"
  2. "The kite climbed over the bend and into the storm." / "पतंग मोड़ के ऊपर से तूफ़ान में उड़ गई।"
  3. "All night the wind carried it, out of one story and into the next." / "रात भर हवा उसे उड़ाती रही, एक कहानी से अगली में।"
  4. "At dawn it caught on a signal, just as the train came in." / "सुबह वह एक सिग्नल में अटक गई, ठीक जब गाड़ी आई।"

## Superseded as a story

The owner called the kite "an ok placeholder" (22 Oct 2026). The continuous story for the First take and the first five weeks is drafted in [story.md](story.md). In it, the first week change runs Station to Lugdi, so this proof's direction reverses. The kite stays only as a small find in the paintings.

## Still to do

- The cutscene as a library component, drawn in every state, before the app build (design before build).
- The other four transitions (Station to Jadugar, Jadugar to Cricket, Cricket to Rukavat, Rukavat to Lugdi), after the owner approves this direction.

## Rebuild

`design-system/art/cutscenes.py`: `paint` (through the heavy-job queue), `sheet` (every try), `clean` (paints out extras listed in `REMOVE`), `strip` (the picks in `PICKS` as one page). Raw renders and the strip are in `design-system/art/raw/cut/`.
