---
type: index
title: Equal Lens Evaluator knowledge
description: Index of this repo's knowledge base. The evaluator is The Equal Lens's single-session game-form decision task for the workplace gender-training study, built as the MIT Solve 2027 prototype.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-1/
---

# Equal Lens Evaluator knowledge

The app is the research instrument specified in the Sex Ed workspace's gated design (`Paper Analysis/Hypotheses/workplace-gender-training-v2/`: `candidates-v12-2026-10-19.md`, `tool-design-single-session-v3-2026-10-15.md` and the research plan). The design is the authority; this repo implements it.

## Structure

- [plane.config.md](plane.config.md): the Plane workspace and project.
- [design.md](design.md): the design system (tokens, surfaces, components, patterns). Read it before any UI change.
- `architecture/`: build and data decisions.
  - [data-and-privacy.md](architecture/data-and-privacy.md): the stores on the shared Firebase project, what the app enforces, and what Firebase cannot guarantee.
- `playbooks/`: how to run, test and register.
  - [run-and-test.md](playbooks/run-and-test.md): running the demo, where the content lives, the checks, session length.
  - [firebase.md](playbooks/firebase.md): the rules piece, the owner's apps.json registration, what this repo never does.
- `reference/`:
  - [acceptance-tests.md](reference/acceptance-tests.md): every registered acceptance test mapped to its check.

## Status (19 Oct 2026)

Prototype v0, demo mode only: fictional content, seeded demo players, no participant data, nothing deployed. Card counts follow research plan v2 (the panel as two games).
