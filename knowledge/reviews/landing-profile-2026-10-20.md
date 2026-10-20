---
type: review
title: Landing page, sign-in, the profile and the result redesign (EVAL-12)
description: The owner's four requests of 20 Oct 2026 on branch eval-landing-profile, what changed, the research rules the profile follows and where this build departs from them, the checks that hold it, and what to flag.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-12/
---

# Landing page, sign-in, the profile and the result redesign (EVAL-12, 20 Oct 2026)

Branch `eval-landing-profile` (worktree `../equal-lens-evaluator-profile`, from
`origin/eval-game-redesign`, with EVAL-11's print work merged in). Design rules:
[design.md](../design.md) sections 4, 4e, 4f and 4g. Run it:
[run-and-test](../playbooks/run-and-test.md). Screenshots: the session scratchpad's `build-v6/`.

## What changed

1. **The season bar is gone.** The story header is the chapter label only ("Chapter 1 of 5 · The
   hiring sprint"); Back stays the nav link under it. `SeasonBar`, its stylesheet, its tokens
   (`--bar-thin`, `--seg-gap`, `--bar-min`, `--c-track`, `--radius-pill` and their primitives),
   the runner's `seasonProgress` and its spoken-label copy are removed; `pnpm ux` now fails a header
   that holds anything but the label. The chapter-end screen's `SeasonMap` still shows where the
   player is.
2. **The landing page** (`#/`, comic register, one phone screen): "Team Season", one line, the
   mascot sheet, three facts (about {minutes} minutes in 5 chapters; a fictional workplace; your
   result with its range), "How this works", "Start a season" with the quiet "I've played
   before: sign in", and the prototype line (moved here from the language screen). Signed in:
   "Continue as <name>" and "Start a new season". A season in progress: "Resume chapter N" first.
   "How this works" (note register): what a season looks at, the four registered sentences
   verbatim, privacy; never how answers are read (`content-check`).
3. **Sign-in** is the recovery code: grouped in fours as typed, a character no code uses named at
   once, a short code on sending, a wrong code as the error pattern, and "Lost your code?" saying
   plainly it cannot be recovered. Signing in keeps the code in this browser until "Sign out on
   this browser". The demo profile's code is on the dev-only notes panel only.
4. **The profile** (`#/profile`, `/history`, `/season/<n>`, `/account`): the header counts; "You
   now" pooled since the last restart; the change line; seven readings with their season counts;
   "This season"; past seasons with the trend and read-only reports; account and privacy (code with
   copy, display name, optional email with two opt-ins, research opt-in, sign out, delete with an
   in-page confirmation). The demo profile has four past seasons across three stories with a
   restart after the second.
5. **The result page redesigned** (coordinator's request during the pass): repeated copy removed
   (the area row "Women and men in this area: ...", "Nothing to show here from this season.", the
   tag's first sentence that repeated the band, the religion-and-skin-tone list the strip now
   shows, the women-and-men tally the area dots already show) and pictures added: "At a glance"
   small multiples, per-area line and dots, tallies, pair rows with name chips, questions and
   habits in two columns. The unlock rule applies on the result page too.

## The profile against the research design

The profile follows research design v25, sections 3.18 and 3.20, with these values in
`content/config.json` `season.profile` (all PENDING v26, config only, never on screen):

- **Readings and their season counts** as the owner's brief sets them: women and men 1, skin tone
  2, religion 3, complaints and conduct 4, hiring and promotion 5, sharing resources 4, the role
  pattern none ("Not available yet"). v25 registered tone 2, religion 3, conduct 3, hiring 4,
  resources 4 and role 6; v26 must register the brief's values.
- **Pooling with equal weights**, not inverse variance. The brief named inverse-variance weighting;
  v25 withdrew it in v23 (it inflated an area reading's pooled false rate to 0.0175 against 0.01)
  and registers equal weights, so the build uses `pooling: "equal"` and keeps inverse variance as
  the config's other value. Each season's estimate is the Beta posterior mean of the share with
  the focal group first, with its variance; the pooled range is the estimate plus or minus the
  normal quantile for the range mass; the pooled level reads the same quantiles as one season.
- **The faster change rule**: the latest season against the pool before it, the difference over
  the root of the summed variances, above 2.576 (two-sided 0.01 on the normal; v25 uses Student's t
  on the latest season's degrees of freedom, which a share estimate does not carry). When it
  fires, that season is the change, shown untagged and not pooled, and the pool starts on the next
  season (v24). One restart point serves every reading.
- **Tags** only once the seasons pooled since the restart reach the reading's count; otherwise a
  hollow point, the range in words and "Tagged after N more seasons on your profile", N the count
  less the seasons pooled, the same for every player. Past seasons are always untagged.

## Checks added (all in `pnpm check`)

- `story-check` X-21 (new): equal and inverse-variance pooling, the restart after a firing season,
  the counts and N for every reading, the demo profile (4 seasons, 3 stories, a restart, confirmed
  and unconfirmed readings), the profile email kept apart, replaced, removed and deleted. X-13: on
  a first season no area, skin-tone or religion line is tagged (180 seeded seasons). X-15: the
  change line follows the faster rule.
- `content-check` X-2: landing, sign-in and profile copy in both languages, no verdict on the
  person, the landing and "How this works" never say how answers are read, the glossary.
- `component-states-check` X-9: `Glance`, `DotGrid`, `Tally`, `Pairs` and `Trend` carry their
  meaning in shape and words, each with a spoken sentence.
- `pnpm ux`: the landing signed out, signed in and with a season to resume (each one phone
  screen), "How this works", sign-in with its inline and wrong-code errors, every profile view and
  the delete confirmation; the header holds the chapter label only; the prototype line on the
  landing only.
- `pnpm e2e` X-22 (new): a wrong code (aria-invalid, described by the alert), the code grouped as
  typed, the demo code opening the profile, the history view (trend, four untagged seasons, the
  change, the reports), a read-only report, "Continue as" after a reload, "Resume chapter 1" first
  and reopening the same link, and on the demo store landing to "Before you start".
- `rules-check` X-14: a contact's key holder can replace and delete it; nobody can read it.

## To flag

1. **Shared rules change.** `eval-contact` was create-once; a profile's email needs replacing and
   deleting, so the rule is now `auth != null` for writes (the key is a 128-bit secret, as for
   `eval-profile`). The Equal Lens repo's shared `firebase/` ruleset must take the same change, or
   editing or deleting a profile's email is refused.
2. **Inverse variance against the registered model** (above): the brief and v25 disagree; the build
   follows v25 and keeps the brief's model one config value away.
3. **The demo seed repeats a story.** Four seasons across three stories cannot happen under "no
   repeats", so the demo profile is marked and blocks no story (the owner can still play the one
   built story while signed in to it).
4. **Signing in keeps the recovery code in this browser's storage** until sign-out. Anyone with the
   device can then open the profile; "How this works" says so.
5. **The landing and the profile are in English**; the Hinglish of every new string is in the
   content for the language pass.
6. **No retake gap is set** (`retakeGapDays` null, PENDING v17), so the "next season opens on"
   date does not show yet.

## Screenshots and the sample

`build-v6/` in the session scratchpad, each at 390 and 1440 px: `01-landing-signed-out`,
`02-landing-signed-in`, `03-signin-invalid-char`, `04-signin-wrong-code`, `05-profile-top` (and
`05-profile-full`), `06-history-trends`, `07-past-report`, `08-account`,
`09-account-delete-confirm`, `10-story-header-no-bar`, `11-result-redesigned`.
`knowledge/samples/sample-result-report.pdf` is re-exported with `pnpm sample-pdf` (the seeded
notes-then-men-first player): five A4 pages, the glance strip and the hero's number and dots on
page 1, the closing notices on page 5 beside the last area's columns, no near-empty page. Every
page was looked at.
