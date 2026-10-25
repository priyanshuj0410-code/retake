---
type: playbook
title: Running and testing Retake
description: How to run Retake (the First take) on the dev server, jump to any screen, where its content and look come from and how to change them, the checks, and how a change reaches production on Vercel. Rewritten on 24 Oct 2026 for the app build (EVAL-18); the turned-down trainer's version is in git history.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-18/
  - https://app.plane.so/the-equal-lens/browse/EVAL-19/
---

# Running and testing Retake

## 1. Set up and run

```bash
pnpm install
pnpm dev                          # http://localhost:5173/
pnpm build && pnpm preview        # the installable PWA, offline once loaded
```

Node 22 or later. The browser checks drive Chromium through `playwright-core`: the installed Google Chrome, or the
one at `CHROMIUM` (in the cloud sessions, `CHROMIUM=/opt/pw-browsers/chromium`).

- **No backend yet:** the take is kept in the browser's localStorage under `retake.take` as
  `{ v, at, answers, lang, sound, birth? | opens?, retried? }`: the screen it is on, each decision's answer, the
  language and the sound switch; an adult's birth date, or for someone under 18 only the day the game opens and whether
  "Wrong date?" was used. Nothing else, and no times.
- **Answers carry their decision's content hash** (`s`, `store.SIG`: the kind, its limits, the people, their numbers
  and English notes). On opening, an answer that no longer fits its decision (another hash, another shape, a name not in
  it) is dropped, so a new export never mixes old answers into the reading. Rewording a question or the Hindi keeps them.
- **Any screen:** set `at` in that key to the screen's index in `content/take/first-take.json`'s `flow`, and reload.
  Delete the key to start again. Past the last screen the finished take rests on its reading.
- **Two windows** (two tabs, or the installed app beside the browser) share the key and follow each other; Delete all
  in one empties both.

## 2. Where things come from (change them there, never in the app)

| What | Where | Then |
|---|---|---|
| The story: panels, captions, decisions, people, notes | `knowledge/story/first-take-script.md`, Hindi in `first-take-hindi.md` | `python3 design-system/tools/app_content.py` |
| The look: every screen's styles, the worlds, the responsive frame | `design-system/library.css`, `design-system/worlds/*.css` (the library) | the same export, which copies them to `public/take/` |
| Pictures | `design-system/assets/` (painted by `design-system/art/`) | the same export |
| The app icon and link preview | `library.py` `icon_svg('ticket')` | the export, then `pnpm icons` |
| The install dialog's screenshots | the app itself | `pnpm pwa:screens` |

The export refuses to write while a note's length could point at the hidden pair or a string has no Hindi. It writes
`content/take/first-take.json` and `public/take/` (styles, self-hosted fonts, pictures, the sound engines); commit both.

## 3. The checks

```bash
pnpm check        # all of it: about 8 minutes
pnpm check:fast   # types, lint, content, scoring, privacy, bundle: seconds
pnpm e2e          # the whole take in 3 languages on a phone and a laptop
pnpm pwa          # installable, offline, two real versions and the Update toast
pnpm a11y         # axe-core, WCAG 2.2 AA, on every kind of screen, 2 languages, 2 sizes
pnpm markup       # each of the 40 decisions has the signed-off demo's markup structure
```

- `scripts/check-all.ts`: content and copy (the turned-down build's daily content, kept for M3), the scoring engine,
  privacy (nothing counts time, no timers, no time fields), and the built bundle (nothing from another origin, fonts
  self-hosted, the script under 130 KB gzipped).
- `scripts/e2e.ts`: every screen played through its own controls; 40 answers kept and nothing else; each kind's
  button waits until the decision is done; the reading's five cards; no sideways scroll; no page or console error.
  Then the first visit, Privacy and Delete all, Back, Delete all by every way out (the phone's back, a second window),
  the phone's back inside "?" and where there is nothing to go back to, focus on each new screen, and kept answers that
  no longer fit (EVAL-19).
- `scripts/pwa-check.ts`: see its header. It serves builds with `vercel.json`'s headers (`scripts/lib/serve.ts`), so
  the Content-Security-Policy is in force.

## 4. To production

`vercel.json` builds the app (`pnpm run build:web`) and copies the team's demo (`site/`) to `/demo/`. Every push to a
branch gets a Vercel preview; `main` is production (tel-retake.vercel.app). The rule (owner, 24 Oct 2026: "push commits
to prod after testing"): a change goes to `main` once `pnpm check` passes. An open app shows "New version ready" and
switches only when Update is tapped.
