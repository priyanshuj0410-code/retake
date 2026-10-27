---
type: reference
title: Retake, product record
description: Durable product truth for Retake (users, purpose, positioning, operating context, constraints, evidence, principles, accessibility), confirmed by the owner on 21 Oct 2026 and kept apart from visual decisions.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-14/
  - https://app.plane.so/the-equal-lens/browse/EVAL-13/
  - https://app.plane.so/the-equal-lens/browse/EVAL-22/
---

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

A mobile web app installable as a PWA. It is played on phones, mostly Android. Most players hold a phone priced from ₹6,000 to ₹18,000, and some use iPhones.

## Users

The players are adults (18+) anywhere in India. They play one short daily puzzle, one-handed, between other things: on a train, at a shop counter, in a tea break, or in bed after 11 pm. Each session lasts 5 to 7 minutes and can be stopped and resumed at any point.

The owner decided (21 Oct 2026) that no group leads: every rule must work for all six personas at once. The personas, from `knowledge/ux/personas.md`, are:

| Persona | Who they are | How they play |
|---|---|---|
| P1 Shruti | English-first, metro | Already plays LinkedIn and NYT puzzles |
| P2 Ravi | Hindi, shop counter | Competitive, colour-blind |
| P3 Sunita | Hindi, small town | Shares an old phone |
| P4 Meena | Hindi, village | 2 GB phone, weak signal |
| P5 Mr Natarajan | 61 | Uses large text; English until Tamil is available |
| P6 Farida | Nurse | Plays on the evening local train |

The game is designed against two anti-personas:
- A1, someone who farms the leaderboard;
- A2, someone who screenshots scenarios to attack the NGO.

Secondary stakeholders shape play without playing, for example HR or college leads who share the link.

Children are out of scope for now. DPDP s.9 needs legal advice first. A minor on a shared parent's phone is a case the design must handle.

The owner's rule (27 Oct 2026, EVAL-22): "We will design for students after the evaluation method passes. A strict no on testing not validated tools on kids." Validation runs with adults only. A student version is designed only once the reading has passed validation with adults, and no tool that is not validated is ever tried on anyone under 18.

## Product Purpose

The game is a trainer, not a test. Each day's puzzle quietly shows the player when they judge the same thing two ways, so they notice it themselves. The owner put it this way: "measurement is not the goal... measurement should lead to reflection and that should lead to real change". The game succeeds when players come back daily and grow more consistent on situations they have never seen before.

## Positioning

**Core truth (owner, 21 Oct 2026): a daily puzzle that shows you your two ways.** Other daily puzzles have a right answer. This one has none set by the game. The answer key is the player's own locked rules and earlier choices. Fairness is scored both ways, so favouring women costs as much as favouring men. The player sees only the size of their lean, never its direction, and works out the rest through reflection.

## Operating Context

- **One puzzle a day.** It is the same puzzle for everyone, on one track; repeats and new situations share that single sequence. Difficulty rises from Monday to Saturday, and Sunday is the week and its reflection.
- **Mechanics** include:
  - lock a rule, then assign people;
  - pick between two people with the same record described in loaded words;
  - spend checks;
  - pick a team under a "protective" voice;
  - rank;
  - choose words for references;
  - quick sort;
  - predict the crowd.
- **Life areas rotate:** home, road, money, sport, care, community and work.
- **Levels escalate:** loaded words, assumptions about marriage and family, kind or protective bias, pressure, muddled cases. Later levels add caste, religion and disability.
- **Twins return days later** with the people swapped.
- **Transfer days** bring new scenario types without warning.
- **Streaks** forgive one missed day a week.
- **The board** is one global leaderboard ranked by practice, under generated Indian truck-driver-style road names. Friends are added by road name.
- **Reflection** happens on Sunday ("What was different?"), with an optional private note that is never analysed.
- **Sharing** happens through WhatsApp. A share card must be safe to land in a family group.
- **The cast** mixes recurring and new characters, women truck drivers among them as deliberate satire.

## Capabilities and Constraints

- **Stack:** Vite, React and TypeScript PWA in this repo, hosted on Vercel's equal-lens-daily project (owner, 24 Oct 2026). `vercel.json` builds the app and keeps the team's demo at `/demo/`; the owner deploys to production.
- **No backend yet.** The board and the crowd figures are sample data until one exists.
- **Languages:** three modes, chosen in "?": Hinglish (English words with Hindi on the signs, and the Hinglish names such as "Udti Khaat"; the default), Hindi in Devanagari, and English only. Hinglish stays a lasting mode (owner, 24 Oct 2026). The game shows only the chosen language, and other Indian languages come later as more chips in the same menu.
- **Privacy:**
  - real identities never appear;
  - the lean is private;
  - stored data is limited to play-day dates (streaks, practice, dose), with no response times, keystrokes or per-answer timestamps;
  - the design follows the DPDP Act 2023.
- **No timers anywhere.**
- **Research build.** The research line `daily-fairness-trainer` (RSE-164) runs a study through a separate research build with comparison groups. The product itself never shows research words.
- **Owner reviews all content.** Dowry, custody and safety framing are addressed directly.
- **Undecided:**
  - the reset time for a day;
  - offline caching of future puzzles;
  - data recovery across phones;
  - whether reservations appear in scenarios;
  - whether a help line shows on hard-topic days.

## Brand Commitments

- **Product name:** Retake (रीटेक), on every surface a player sees (owner, O13, 21 Oct 2026). The store title is "Retake: a daily fairness puzzle", because several photo apps are already called Retake; a trademark check comes before launch. The 20-minute starter is the First take and each monthly redo the Next take. "Equal Lens Daily" and "Lens Daily" are retired.
- **The Equal Lens** appears as a small credit only (owner, 21 Oct 2026). The NGO's colours, fonts and mascot stay out of play.
- **Visual worlds** are pinned by the owner: Lugdi (1970s Hindi pulp-novel covers) and Station (Indian railway enamel boards, tickets, departure boards), alternating week by week. The reading face is Hind. Visual detail lives in DESIGN.md.
- **Approved samples:**
  - https://claude.ai/artifact/JKhCHhVzcf5ir6pmvHJYvn
  - https://claude.ai/artifact/LptaxYexpiuahMLXe8YZ12
- **Voice:**
  - almost no reading ("as minimum as possible to none at all");
  - plain, never lecturing, never shaming;
  - every result shows a score, so no dead ends.

## Evidence on Hand

- **Generated portraits** of the eight-person cast, in pulp and enamel styles, plus pulp cover paintings, in `public/art/`. No human illustrator is commissioned.
- **Two weeks of draft puzzle content** in `content/days/`. It is owner review pending and must not be presented as final.
- **Foundations research:** `knowledge/foundations/` (Apple HIG, Material 3, Gestalt and heuristics, UX writing, usability and accessibility, daily-game patterns).
- **UX research:** `knowledge/ux/personas.md` and `knowledge/ux/journeys.md`. No real player has been interviewed, so the personas are hypotheses for the first playtests.
- **Absent, and must not be fabricated:** player counts, testimonials, partner logos, real crowd figures.

## Product Principles

1. **The player is the answer key.** Judge consistency against their own rules and earlier choices, never the game's opinion.
2. **Reflection over verdict.** Show size, pairs and "What was different?". Never label, shame or lecture.
3. **Play, do not read.** The interface teaches by doing. Words are a last resort.
4. **Every day is new, by the same hand.** The object and setting change daily; the grammar stays fixed.
5. **Safe to share, safe to be seen playing.** Privacy and dignity come first on shared phones and in family groups.

## Accessibility & Inclusion

- WCAG 2.2 AA.
- Android TalkBack first.
- Text scales to 200% and reflows.
- Safe for colour blindness: never colour alone (P2).
- Reduced motion is a designed state.
- Devanagari gets its own sizes and line heights.
- Light enough for 2 GB phones and weak signal (P4).
- Tap targets of 48 px or more.
- Stop and resume at any point, with no timers.
- Trauma-informed handling on hard-topic days.
