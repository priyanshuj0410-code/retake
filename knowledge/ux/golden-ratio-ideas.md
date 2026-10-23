---
type: proposal
title: The golden ratio in Retake, ideas
description: What the evidence says about the golden ratio, what the library uses today (eleven gap sizes, ten picture proportions), and six ways one ratio could make Retake more coherent, ranked, for the owner to choose from before anything is built.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-18/
---

# The golden ratio in Retake: ideas

Owner, 22 Oct 2026: "Read about the golden ratio... ideate how we can use it to make the app more visually coherent and interesting." These are options to choose from, not a build.

## What the evidence says

- The golden ratio (φ, about 1.618) is real and simple: a line cut so that the whole is to the long part as the long part is to the short part. The Fibonacci numbers (5, 8, 13, 21, 34, 55) approach it.
- The claim that people **prefer** it is weak:
  - Fechner's 19th-century rectangle studies are the source of the idea.
  - Later studies found no special pull. Davis and Jahnke (1991) found a strong preference for squares instead.
  - Swami and Stieger (2015) found no preference for it in real artworks, by explicit or implicit measures.
- What a single ratio does reliably give a designer is **coherence**: sizes, gaps and shapes that are visibly related, because each is a step on one scale. That is the use proposed here, not a promise that φ looks better by itself.

## What the library uses today (measured 22 Oct)

- **Gaps and padding:** eleven sizes in use (2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 32), most of them written by hand, not as the eight spacing tokens. This is the root of the proximity faults the owner keeps finding: nothing says how far apart "related" and "separate" should be.
- **Pictures:** ten proportions (4:3, 1:1, 21:9, 5:2, 2:1, 5:7, 4:5, 3:4, 3:2 and the phone itself).
- **Type:** quote 15, name and numbers 20, question 24, score 36, display 45. This is already close to a scale of √φ (about 1.27) per step: 15, 19, 24, 31, 39, 50.

## Ideas, ranked

1. **One spacing scale from the Fibonacci numbers: 5, 8, 13, 21, 34.** Each step is a meaning:
   - 5: inside one thing (an icon and its number);
   - 8: the parts of one item (name, numbers, quote);
   - 13: items in a list;
   - 21: one group from the next (the question and its people from the cards);
   - 34: one section from the next.

   The 16 px screen edge and 48 px tap targets stay. It fixes the cause of the proximity faults, not each fault, and the space audit can check it.

   **Cost:** every gap in five worlds, a day's work, then one audit.
2. **One type scale at √φ per step: 15, 19, 24, 31, 39, 50.**
   - Quote 15, name and numbers 19, question 24, score 31, chapter title 39, cover title 50.
   - It keeps today's ladder but makes every jump the same proportion, so the hierarchy reads as one family.
   - It pairs with idea 1: 24 × φ is about 39, and 13 × φ is about 21.

   **Cost:** small (seven tokens), plus a check of every screen at 200% text.
3. **One picture shape: the golden rectangle (1.618:1) for every wide crop, and the square for every face.**
   - That is two shapes where there are ten today.
   - The person card's portrait, the week's day paintings, the Board's banner and the share card would all match across worlds.

   **Cost:** medium; some crops need repainting or re-cropping, so it is checked against the portraits first.
4. **The golden line on the full-screen moments.**
   - The cover's title plate, the result's score and the chapter card's plate sit on the line 61.8% down the screen, not "low".
   - The painting gets the top golden rectangle; the words get the rest.

   **Cost:** small, on about eight screen types. It is visible and distinctive.
5. **The step screen divided at φ.** The question and its context take the top 38%, the choices the lower 62%. It is clear in principle, but four cards on a small phone may not fit; this is the riskiest idea.
6. **Motion timed at φ.** The result's reveal steps run 200, 320, 520 and 840 ms, so the sequence feels like one gesture. It is subtle; only a few people would notice.

## Recommendation

Ideas 1 and 2 together: one spacing scale and one type scale built on the same ratio. They answer the faults the owner has found by eye (proximity, padding, hierarchy) at their cause. Try them first on one screen in one world (the Station twin step), shown before and after side by side, before touching the rest. Idea 4 is the most visible "interesting" one and could follow.

## Trial, 22 Oct 2026 (ideas 1 and 2 on the Station twin step)

Owner: "go ahead". Built as a layer that applies only where it is switched on (`design-system/proto/phi.css`, the class `phi`). The page that sets today's screen beside the trial, on a 390 x 844 and a 360 x 640 phone, is `design-system/proto/build_phi.py` → `proto/phi-compare.html`. The library itself is unchanged.

| Gap or size | Today | Trial |
|---|---|---|
| question → who asks | 16 | 8 (one group) |
| who asks → cards | 24 | 21 (group to group) |
| card to card | 16 down, 12 across | 13 both ways |
| inside a card's edge | 18, 12, 14, 12 | 13 all round |
| face → name, name → numbers, numbers → quote | 6, 6, 6 | 8, 5, 8 |
| icon → number, pair to pair | 4, 16 | 5, 13 |
| labels (who asks, key, serial) | 14 | 15 |
| name and numbers | 20 | 19 |
| main button | 16 | 19 |
| scrolling on the 390 phone | 7 px | none |

Seen in the trial:
- The question now reads as one group with its speaker.
- The cards form one evenly spaced block.
- 54 px of unused space sits above the button on the 390 phone. Idea 3 (golden-rectangle portraits, a little taller) would fill it.
- At 15 px the speaker and the key fit on one line only with an 8 px gap between them, which is the scale's "parts of one group" step.

## Applied, 22 Oct 2026

The owner said "go ahead" after the trial. Ideas 1 and 2 now run through the whole library, in five worlds. The rules are recorded in DESIGN.md under "The scales".

How it was applied and checked:
- `tools/phi_apply.py` moved 433 padding, margin and gap declarations onto 5, 8, 13, 21 and 34.
- Grouping rules: a question binds to who asks it at 8, and a stat key binds to the cards it explains at 8. The next group sits 21 away, and the inside of a card runs 8, 5, 8.
- The type tokens moved to 15, 19, 24, 31, 39 and 50.
- Three margins that centre an element (the scroll cue, the held arrow, a dot) were put back, because they are not spacing.
- The 200% text sizes were restored.
- Hindi screens start 8 below the bar.
- Checks:
  - no normal-size screen scrolls more than before, except the Jadugar Believe step (10 to 14 px), which already scrolled;
  - 31 screens scroll, down from 39;
  - no word breaks;
  - icons sit within 0.2 px of their numbers.
- The trial layer `proto/phi.css` is kept as a record; it is now the default.

Ideas 3 and 4 followed the same day (owner: "go for it"). The picture shapes and the golden lines are recorded in DESIGN.md, with their exceptions:
- The four-card grid keeps its crop, so the steps still fit without scrolling.
- Real objects keep their shapes.
- Four screens keep their focal point where it is.

Checked by the scroll census: no normal-size screen scrolls more than at the start, except Jadugar Believe (+4 px). A capture with both lines drawn confirmed each focal point sits on its line.

Ideas 5 and 6 followed (owner: "go ahead"):
- **Idea 5 on phones, not applied.** Dividing the step screen at 38/62 would push the four cards about 110 px down and off the screen, and lift the choices away from the thumb.
- **Idea 5 on wide screens, applied.** The game column beside the painting is 38.2% of the width and the painting 61.8%: 550 px of 1440, with the four cards and the button fitting without a scroll. A phone on its side keeps 60%, so all four people fit.
- **Idea 6, applied.** Motion runs on steps of 100, 160, 260, 420, 680 and 1100 ms (tokens `--m1` to `--m6`), with the reveals done by 1100 ms under the 1.2 s cap. DESIGN.md "Timing" and the library's timing table are updated.

All six ideas are now decided. Two exceptions are left for the owner: the four-card grid's crop, and the Lugdi result's score roundel, which now sits over the truck in the painting.

## Sources

- Swami and Stieger, "Time to let go? No automatic aesthetic preference for the golden ratio in art pictures" (2015): https://westminsterresearch.westminster.ac.uk/item/8yvwz/time-to-let-go-no-automatic-aesthetic-preference-for-the-golden-ratio
- The review that reports Davis and Jahnke (1991), Boselie (1992) and the Fechner replication: https://pmc.ncbi.nlm.nih.gov/articles/PMC3485848 (found by a web search on 22 Oct; the findings above are as the search summarised them, not yet checked against the paper's own text).
