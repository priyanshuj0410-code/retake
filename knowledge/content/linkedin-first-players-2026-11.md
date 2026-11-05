---
type: content
title: LinkedIn carousel inviting Retake's first players
description: The seven-page carousel and post text asking adults to play the First take and rate it, what they deliberately leave out and why, and when they may be posted. The files are built by design-system/marketing/first_players.py.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-25/
  - https://app.plane.so/the-equal-lens/browse/EVAL-24/
---

# LinkedIn carousel: first players

Owner, 5 Nov 2026: "create a carousel for linkedin to onboard people to test this". The file is `design-system/marketing/retake-first-players.pdf`, seven pages at 1080 x 1350, uploaded as a LinkedIn document post. Links inside a document post are not reliably tappable, so the link goes in the first comment.

**Rebuild:** `npx vite build --outDir out/mkt-dist`, then from `design-system/marketing/`: `python3 first_players.py && DECISION=station-3 NODE_PATH=../../node_modules node first_players.cjs`.

## When it may be posted

Only after [the rating is live](../playbooks/firebase.md). Before that, the link has no rating, the old reading and no help lines. A public post also reaches strangers, while [data and privacy](../architecture/data-and-privacy.md) still lists a lawyer's reading and a contact for data questions as owed before any public launch: that is the owner's call.

## What it leaves out, on purpose

- **The word "test", and what the game looks for.** It never says bias, gender, men or women, or that two people are matched. [DESIGN.md](../../DESIGN.md) says the starter is never called a test or about attitude or bias (R-COPY-16, O9, O12), and a player who knows the trick plays differently ([team feedback](../reviews/team-feedback-2026-10-23.md)). So no slide shows the reading, and the sample question is `station-3`, not one with "Reckless" and "Bold" side by side.
- **Counts and quotes.** There are no players yet, and [PRODUCT.md](../../PRODUCT.md) forbids inventing them. The sample rating has no typed line, so it cannot read as a testimonial.
- **The Equal Lens's look.** A small credit only (PRODUCT.md, Brand Commitments).

## Post text

```text
I made a game, and I need first players.

It's called Retake. Dadi moves in with an old trunk, and inside it are five memories from 1971 to 1999: a railway junction, trucks on a ghat road, a travelling magic show, a cricket final, a wedding at home. In each one, you decide who gets the job.

It takes about 20 minutes on your phone, in English, Hinglish or Hindi. No sign-up and nothing to install. At the end it asks for a star rating and one line. That is all that comes to me; your answers stay on your phone.

Two things before you play:
- It's for adults only, so please don't pass it to anyone under 18.
- Some chapters touch on harassment, violence at home, custody and dowry. Each chapter's "?" has a help line.

It's early and there are rough edges. Tell me what's broken.

Link in the first comment.
```

## First comment

```text
Play it here, best on a phone: https://tel-retake.vercel.app
```

"About 20 minutes" is the title cards' estimate; nobody new has been timed.
