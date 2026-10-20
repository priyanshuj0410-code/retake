---
type: playbook
title: Running and testing the trainer
description: How to run Equal Lens Daily on the dev server, jump to any of the fortnight's days, where every piece of content lives for the owner to change, and the checks and screenshots.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-13/
---

# Running and testing the trainer

## 1. Set up and run

```bash
cd ~/equal-lens-trainer
pnpm install
pnpm dev            # http://localhost:5173/
```

Node 22 or later; the browser checks use the installed Google Chrome through `playwright-core`.
No backend, no emulator: everything is in the browser's localStorage under `elt:v1`.

- **Any day:** `#/?day=1` to `#/?day=14` (the anchor fortnight, Monday 19 Oct to Sunday 1 Nov
  2026), or `?date=YYYY-MM-DD`. The date is held for the tab; `?day=0` clears it.
- **Prototype menu:** `#/dev` lists the 14 days, clears the date and deletes this phone's data.
- Routes: `#/` today, `#/play`, `#/result`, `#/week`, `#/board`.
- `pnpm build && pnpm preview` serves the installable PWA (offline once loaded).

## 2. Where the content lives (change it there, never in code)

| File | What |
|---|---|
| `content/days/01-lugdi-mon.json` to `14-station-sun.json` | One file per day: skin, ground, weekday, level, life area, object, masthead, steps, the Sunday reflection, and `_review` notes for the owner |
| `content/cast.json` | The cast: names in both languages, gender (read by the scoring only), whether art exists, recurring or new |
| `content/i18n/en.json`, `hi.json` | Every interface string; the Hindi is a draft (`_status`) |
| `content/handles.json` | Road-name words |
| `content/sample.json` | The sample board's size and curve |
| `public/art/` | `pulp-*` and `enamel-*` portraits, `pulp-s-*` cover paintings |

A day's steps take one of eight kinds (`src/content/types.ts`): `assign`, `pick`, `checks`,
`team`, `rank`, `words`, `swipe`, `crowd`. A new mechanic adds a step type there, an answer and
completion rule in `src/engine/answers.ts`, a scorer in `src/engine/score.ts` and a board in
`src/boards/`. A new language: [design.md](../design.md), section 8.

## 3. Check it

| Command | What |
|---|---|
| `pnpm check` | Everything: types, lint, the fast checks, `pnpm ux`, `pnpm e2e`, `pnpm pwa` |
| `pnpm check:fast` | Types, lint, design, content, scoring, privacy and bundle checks (about 2 s) |
| `pnpm ux` | Every screen of the 14 days at 390, 320 and 1280 px: contrast, targets, names, headings, axe, symmetric options, focus. Writes `out/ux-audit.json` |
| `pnpm e2e` | The fortnight played end to end through the screens |
| `pnpm pwa` | Installable, offline resume and update on tap, on a production build |
| `pnpm shots` | 61 full-page screenshots at 390 px into `out/trainer-shots/` with `index.txt` |
| `pnpm fonts`, `pnpm icons` | Copy the faces from Fontsource; redraw the icons |

What each check holds: [acceptance tests](../reference/acceptance-tests.md).
