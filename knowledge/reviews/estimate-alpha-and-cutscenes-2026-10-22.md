---
type: review
title: Effort estimate, alpha launch and week-change cutscenes (22 Oct 2026)
description: The owner asked for an effort estimate for two things, getting Retake live for alpha users and comic-strip cutscenes that carry players from last week's world style to this week's. Ranges in working days, what they rest on, and the suggested order.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-18/
---

# Effort estimate: alpha launch and week-change cutscenes

## Where things stand (22 Oct 2026)

- **The app** (`trainer-daily`) is the first build the owner turned down: two worlds, 14 days of content, eight puzzle kinds, data kept on the phone. Its scoring, store and checks (`pnpm check`, e2e, pwa, ux) carry over.
- **The design library** (`design-system/`) is the approved direction, but it is a static page of parts, not the app. It covers five worlds, Retake, the First take, the cast and portraits, three language modes with a menu, and the golden-ratio scales. Its CSS can be reused as it is; the app would render the same markup.

## 1. Live for alpha users

| Piece | Working days |
|---|---|
| The pictured sheet of every screen, for sign-off before the build (the design-before-build rule) | 1 |
| App shell: worlds, three languages and the menu, fonts, installable app | 1 to 1.5 |
| Screens: cover, chapter card, step frame, result, week, board, help sheet | 2 |
| Eleven puzzle kinds: 8 restyled from the old build, 3 new (Believe, Split, Batting order) | 3 to 4 |
| The First take: 5 chapters, 40 decisions, the cards between chapters, the private result | 1.5 to 2 |
| Content as data: the First take plus about two weeks of dailies across five worlds | 1 to 2, plus reviews |
| Testing: screens, two phone sizes, 200% text, Hindi, accessibility, e2e | 1 to 2 |
| Hosting on the existing Equal Lens Firebase project (owner's go-ahead) | 0.5 |
| **Total** | **11 to 15**; about 3 to 4 calendar weeks under the weekly usage cap |

**A faster alternative, 6 to 8 days:** First take only, Hinglish and English, the board hidden, data on the phone.

**Things that depend on others:**
- The owner's sign-off on the screen sheet.
- The owner's marks in the Line Review (`lines.json`, database collection `verdicts`).
- A Hindi reader's check of the drafted Hindi.
- The owner's go-ahead for Firebase hosting.

## 2. Comic-strip cutscenes between weeks

**The idea:** when the week changes, a 4 to 6 panel strip plays. It opens in last week's style and ends in this week's, carrying one thread across. For example, Lugdi's truck pulls into Station's platform, and a passenger walks on into Jadugar's show. Captions are live text, so all three languages work. The player taps to advance, can skip, and reduced motion is honoured.

| Piece | Working days |
|---|---|
| The thread through the five worlds; a script and rough layout for each of the 5 transitions | 1 to 2, plus review |
| Art: about 25 panels and retries, painted locally through the heavy-job queue | 2 to 3 |
| The cutscene player: panels, live captions in 3 languages, tap, skip, reduced motion | 1 to 1.5 |
| **Total** | **5 to 7**; about 2 calendar weeks |

**Risk:** the image model does not keep a person looking the same across styles. Panels that blend two styles need re-painting from a shared layout. Prove one transition (Lugdi to Station) before committing to all five.

## Suggested order

1. Ship the faster alpha first.
2. Add the cutscenes after, once real players are moving between weeks.
3. After the usage reset (25 Oct 2026, 2:30 pm), start with the screen sheet.
