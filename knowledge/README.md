---
type: index
title: Equal Lens Daily trainer knowledge
description: Index of this repo's knowledge base. The repo now holds The Equal Lens daily fairness trainer (EVAL-13), a mobile-first daily puzzle that replaced the evaluator's screens; the evaluator's notes are kept as history.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-1/
  - https://app.plane.so/the-equal-lens/browse/EVAL-12/
  - https://app.plane.so/the-equal-lens/browse/EVAL-13/
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
- `playbooks/`:
  - [run-and-test.md](playbooks/run-and-test.md): running the trainer, the date override, where
    the content lives, the checks and the screenshots.
  - [firebase.md](playbooks/firebase.md): the evaluator's rules piece (unchanged, unused here).
- `reference/`:
  - [acceptance-tests.md](reference/acceptance-tests.md): each requirement of EVAL-13 mapped to its check.
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
