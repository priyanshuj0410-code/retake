---
type: review
title: Team feedback on the First take demo (23 Oct 2026)
description: The team's three points on the shared demo, what was checked against the First take draft, and the options for the one finding that touches the research design. The opening remark names one of the hidden matching pair in 32 of 40 decisions, so it points straight at what the game measures.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-17/
  - https://app.plane.so/the-equal-lens/browse/EVAL-18/
---

# Team feedback on the First take demo, 23 Oct 2026

Relayed by the owner:
1. The shaadi story from the initial concept was easier to follow.
2. The bias was easier to spot in the shaadi story, which might not be a good thing, and "the comments at the start are sort of giving away the answers". The owner asked for this to be validated.
3. Add audio to the demo.

## 1. The shaadi story

It is not in this repo or the other Equal Lens repos searched (the evaluator, the evaluator game and profile, swipeed). The owner was asked for it before any comparison with [story.md](../content/story.md).

## 2. Do the opening remarks give the answers away? Checked: yes

Counted from [first-take.md](../content/first-take.md), all 40 decisions, with `design-system/first_take.py`:

- 38 decisions open with a remark from the chapter's speaker.
- 32 of those remarks name someone on the cards.
- In all 32, the person named is one of the two whose numbers match: the hidden pair the decision measures.

**What follows.** A player who notices this can find the pair every time, by reading whom the boss mentions. Each decision then becomes "do I go along with the boss's remark or not". Two effects:

- **Players perform fairness.** Once the cue is obvious, most players answer the way a fair person would, whatever they would otherwise lean to. Everyone then reads as fair, and the game cannot tell players apart. This is the classic demand problem in vignette studies, which is why such studies hide the changed detail among other details that also change.
- **The twin design does not break, but it gets blunt.** Doing the opposite of the boss, or doing what he says, every time reads as no lean. The reading still catches someone who resists the remark about a woman but goes along with the same remark about a man. Fewer players will show that once the remark is plainly the point.

The team's sense that an easy-to-spot bias "might not be a good thing" is right for the same reason.

## Options (not built; the nudge design belongs to the research line, RSE-164)

1. **Decoy remarks.** The boss also comments on people outside the pair, so being mentioned no longer marks someone as one of the two.
2. **The nudge in a card line.** The loaded word sits on one card among four lines of the same kind, not in the opening remark.
3. **Some decisions with no remark at all.**
4. **Measure it in playtests.** After a chapter, ask "What do you think this was about?" and count how many players name the boss's remarks or the matching pairs.

The recommendation is 1, 2 and 4 together, taken to the research line's validate stage after the usage reset.

## The owner's decisions on the changes, 23 Oct 2026

After reading "Five Days to the Shaadi" (https://claude.ai/artifact/5ESSfiiVJVcJBcKmFEkhdA) and the pros and cons of each change:

1. **Event-specific chapters.** A wedding is one example of an event a chapter can be built around, not the frame for the whole First take. The team thought an easier-to-spot bias was a good thing; the owner disagrees.
   - A way to hold both views: measure with subtle cues, then make the bias visible after the choice, in the result and in "Look again". That is where seeing it teaches.
2. **No group chat.** Instead, a clear, slightly longer opening cutscene that brings players into the story.
3. **Results that close each chapter:** yes. A result never depends on which of the equal two was picked.
4. **A slightly wider cast,** and each person keeps one world and one role: never the same person as a truck driver and then a magician. This narrows the earlier answer of 22 Oct ("anyone can appear in any world"). The First take already gives each chapter its own people.
5. **Visible progress:** yes.
6. **Decoy remarks:** yes.
7. **The loaded word on a card:** to be explored; the options are below.

## Ideas for change 7: the nudge on a card

**The constraint:** the twin reading only counts if the player saw both halves' nudges. So the nudge must always be visible, never behind a tap.

| Idea | How it looks | For | Against |
|---|---|---|---|
| A. **A line on every card** | Each card carries one short line of the same length and tone, said of that person. The nudge is one line among them, and the others include decoys about people outside the pair. | Simple. Pick-one cards already do this. | Rows (team picks, rank) need a line slot, which makes them taller. |
| B. **Each world's own record** | The note looks like the world's paperwork: Station's roster remark, Lugdi's logbook entry, Jadugar's playbill blurb, Cricket's scorebook comment, Rukavat's chit on the fridge. Every card has one. | Reads as part of the world, not as a hint. Feels real. | A design pass for each world. Still needs room on rows. |
| C. **A tag or stamp** | A small label on the card ("New father", "Complaint filed", "Family worries"), as a staff file would mark someone. | Very few words, and works on rows. | Blunt. A label can read as the point of the decision, the same problem again. |
| D. **Said earlier, in the story** | The loaded fact is told in the chapter's opening cutscene among other facts about several people. The decision comes later with no remark. | The least obvious. Uses the longer onboarding the owner wants. | Depends on memory. Players who forget make the reading noisy. |
| E. **Said by a peer** | The line comes from another card person ("Raju says Kamla is pushy"), not the boss. | Spreads the voice. Peers' talk is how bias travels in real life. | A person on the cards speaking about another can make one face disliked, which leaks into the picks. |
| F. **Tap to read** | Cards show numbers; tapping opens a fuller note. | Clean cards. | The nudge is not always seen. Rejected on the constraint above. |

**The recommendation** is B with A's rule: every card carries a note in its world's paperwork, the nudge is one note among them, and some notes are decoys about people outside the pair. D can add a few decoy facts in the opening cutscene. This is a change to the nudge design, so it goes to the research line (RSE-164) with change 6 before any content is rewritten.

## Built for approval, 23 Oct 2026

Owner: "I like A, B and D... Let's try the sketchsheet, cutscenes and getting them atleast ready for the demo... Research check after the reset".

- **Sketch sheet:** https://claude.ai/artifact/LKaGohXJjsWHMSMxuKsN5h (`python3 design-system/demo.py sketch`). It shows each new part in every world.
- **Preview:** https://claude.ai/artifact/7Rms27NqHD5nhG7ZhqjqPt (`demo.py next`). The whole First take with the new parts on. It replaces the shared demo once approved.
- **The longer opening:** six panels, one per place: the line, the ghat, the tent, the ground, Dadi's house. Each is in its own world's style, and the last ends on "Everyone needs people. Tonight, you choose who." It is in the `OPENING` setting in `demo.py`, and its panels are in `art/cutscenes.py` (ft-0-3 to ft-0-6).
- **Notes on the cards (ideas A and B):** one sample decision in each world, in `first_take.py` `SKETCH`. Station 1's existing lines become roster remarks. Lugdi 1, Jadugar 4, Cricket 3 and Rukavat 3 get a note on every card: the loaded word is one note, the rest are decoys, and the boss's remark becomes a scene line with no names.
  - The paperwork for each world: Station, a roster remark under a perforation; Lugdi, a logbook entry with a red rule; Jadugar, a playbill blurb between gold rules; Cricket, chalk on the scorebook's slate; Rukavat, a chit.
  - These styles sit in `demo.py` until approved, then move to `library.css` and DESIGN.md.
- **Progress:** five segments under the top bar, filling decision by decision.
- **Chapter results:** a fixed closing line for each world, the same for every player.
- **Not yet done:**
  - Idea D, a loaded fact told in a cutscene: needs the research check first.
  - Notes for the other 23 decisions: wait for the content rewrite after the research check.
  - The research check itself: after the usage reset on 25 Oct 2026.
- **Owner, on Lugdi 6 in the review: "The message in the chat bubble and then on each card feels repetitive".** Mehul seth restates Kusum's report, which is already on her card, and then adds "She scares easily". This is the giveaway pattern again. The rule for the rewrite: the speaker's line only sets the scene and never names or repeats a card. The loaded word becomes one short note on the card, under the person's own words where the card has them, among decoy notes on the other cards.
- **Found and fixed on the way:** on Rukavat, the speech bubble had squeezed the key since the speaker began showing once. The bubble now takes the full row, in every page.

## 3. Audio: added

Both demo pages play each world's suggested default from the sound pages:

| World | Sound |
|---|---|
| Lugdi | radio-serial drone and tabla |
| Station | the chime, on its cover only |
| Jadugar | lamp and night |
| Cricket | transistor in the stands |
| Rukavat | the interlude santoor |

How it plays:
- It starts at the first tap, through the pages' own engines.
- Picks, sends, fills, checks and refusals have their tap sounds. Every person gets the same sound, so sound never hints at a lean.
- A sound button sits on each cover and cutscene.

The owner has not yet chosen between the sound pages' options, so these defaults stand in.
