---
type: index
title: Equal Lens Daily trainer knowledge
description: Index of this repo's knowledge base. The repo now holds The Equal Lens daily fairness trainer (EVAL-13), a mobile-first daily puzzle that replaced the evaluator's screens; the evaluator's notes are kept as history.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-1/
  - https://app.plane.so/the-equal-lens/browse/EVAL-12/
  - https://app.plane.so/the-equal-lens/browse/EVAL-13/
  - https://app.plane.so/the-equal-lens/browse/EVAL-14/
  - https://app.plane.so/the-equal-lens/browse/EVAL-15/
  - https://app.plane.so/the-equal-lens/browse/EVAL-16/
  - https://app.plane.so/the-equal-lens/browse/EVAL-17/
---

# Equal Lens Daily trainer knowledge

Branch `trainer-daily` (EVAL-13): one fairness puzzle a day, scored on consistency both ways,
in two skins (Lugdi and Station) that alternate by ISO week. The product decisions live in the
Sex Ed workspace (`Paper Analysis/Hypotheses/daily-fairness-trainer/brief-2026-10-20.md`); this
repo implements them.

## Structure

- [plane.config.md](plane.config.md): the Plane workspace and project.
- [design.md](design.md): the trainer's design system (tokens per skin, type, the text-colour
  rule, components and states, motion, scoring as shown, copy rules). Read it before any UI change.
- `architecture/`:
  - [data-and-privacy.md](architecture/data-and-privacy.md): the trainer stores on the phone only
    (note at the top); the rest describes the evaluator's Firebase storage.
  - [world-modules.md](architecture/world-modules.md): how a visual world plugs into the component
    library generator (worlds/<id>.py and .css, the LIB_WORLDS and LIB_OUT switches).
- `playbooks/`:
  - [run-and-test.md](playbooks/run-and-test.md): running the trainer, the date override, where
    the content lives, the checks and the screenshots.
  - [firebase.md](playbooks/firebase.md): the evaluator's rules piece (unchanged, unused here).
- `ux/`: the owner's design order (EVAL-14 to EVAL-16), in stages.
  - [personas.md](ux/personas.md) and [journeys.md](ux/journeys.md): stage 1, with [critique-stage1.md](ux/critique-stage1.md).
  - [feature-set.md](ux/feature-set.md): stage 2, every feature tagged V1, Later or Never, with the owner's questions Q1 to Q9.
  - [ia-and-flows.md](ux/ia-and-flows.md): stage 3, the screen map (SC-00 to SC-80), 18 flows, the persona walk-through, what is still to draw, and Q10 to Q12.
  - Both are shown to the owner as one page, "Retake Features and Map", built by
    `design-system/review/build_features_map.py` (the shared renderer is `design-system/review/mdlite.py`).
  - The design system for this order is the root [DESIGN.md](../DESIGN.md) and the library in `design-system/`; [design.md](design.md) here belongs to the rejected first build.
- `funding/`:
  - [solve-2027-learning.md](funding/solve-2027-learning.md): MIT Solve 2027 Global Learning Challenge (assessment dimension), the raw material for each answer on the form; the owner writes the answers.
  - The team's PDF workbooks, every form question in order with notes and drafting space: `MIT Solve 2027 Application Workbook.pdf` (Learning) and `MIT Solve 2027 Economic Prosperity Workbook.pdf` (the workplace framing, "pathways to quality employment"). Sources in `workbook/`: the Learning page, `econ-body.html` built into it by `build_econ.py`, rendered by `render.cjs`.
- `story/`: the story bible for "the family's trunk" (owner, 23 Oct 2026). [README.md](story/README.md) holds the consistency rules, [timeline.md](story/timeline.md) the dates and ages, [people.md](story/people.md) the people and their personas, [situations.md](story/situations.md) the places, eras and art, [family-as-options.md](story/family-as-options.md) how family members appear on cards without diluting the reading, and [first-take-script.md](story/first-take-script.md) the full First take script.
- `content/`:
  - [world-voices.md](content/world-voices.md): each world's own story (EVAL-17): the twin step, cover and
    hard-day lines, Board road names and share card for Station, Jadugar, Cricket and Rukavat, in English and Hindi,
    and the shared words shortened for the word limits; a draft for the owner's review.
  - [first-take.md](content/first-take.md): the 20-minute First take (O12, O13): 40 decisions in five chapters,
    English and Hindi, the five private result cards and the monthly Next take; a draft for the owner's review.
    Its review page is built by `design-system/review/build_first_take.py` (published as "First Take Review").
    Rewritten on 22 Oct for the owner's answers (EVAL-18); `design-system/tools/check_first_take.py` gates it.
  - [cast.md](content/cast.md): one pan-India, cross-faith cast (60 people, anyone in any world), the hard topic in
    each chapter and the First take's pair plan. Every person's portrait in every world's style is painted by
    `design-system/art/portraits.py` (paint through the Mac-wide heavy-job queue, then process, then sheets and the close-up forehead check: `portraits.py dots`); since 22 Oct the library draws
    each world's own people too (library.py `ROLE`, `R()`, `named()`: the shared code keeps the eight roles, each world fills them);
    the eight old slot files (enamel-kamla.webp and so on) are no longer used by the library.
  - Every slanted line, for the owner to keep, change or cut: `design-system/review/lines.json`, built into
    "Retake Line Review" by `design-system/review/build_lines.py`; the owner's marks are in that artifact's
    database, collection `verdicts`.
- Sound pages: `design-system/sound/index.html` (Lugdi and Station, O10) and `design-system/sound/worlds.html`
  (Jadugar, Cricket and Rukavat, published as "New World Sounds"; owner's picks pending).
- Checks on the library page: `design-system/tools/space_audit.cjs` (negative space: gutters, padding, centring, touching and
  colliding boxes on every phone screen) and `design-system/tools/fonts.py` (writes `fonts.css`, the re-balanced Hind and Khand).
- `reference/`:
  - [acceptance-tests.md](reference/acceptance-tests.md): each requirement of EVAL-13 mapped to its check.
  - [help-lines-2026-10-27.md](reference/help-lines-2026-10-27.md): the three national help lines for the First take's hard chapters, checked against official sources (EVAL-22).
- `reviews/`:
  - [trainer-content-2026-10-20.md](reviews/trainer-content-2026-10-20.md): the fortnight's content
    for the owner's review, and the decisions to confirm.
  - Evaluator history: [ux-audit-2026-10-19.md](reviews/ux-audit-2026-10-19.md),
    [game-redesign-2026-10-19.md](reviews/game-redesign-2026-10-19.md),
    [component-states-2026-10-19.md](reviews/component-states-2026-10-19.md),
    [landing-profile-2026-10-20.md](reviews/landing-profile-2026-10-20.md).

## Status (20 Oct 2026)

First working version: 14 days of content, eight mechanics, local storage only, a sample board.
Nothing is deployed or pushed.
