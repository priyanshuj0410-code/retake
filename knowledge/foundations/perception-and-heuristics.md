---
type: research
title: Perception and usability heuristics for Equal Lens Daily
description: Gestalt grouping, visual hierarchy, Nielsen's ten heuristics, Norman's signifiers, mapping, constraints and feedback, Fitts's and Hick's laws, cognitive load and progressive disclosure, turned into numbered, testable rules for the rebuild of Equal Lens Daily, with every rule the EVAL-13 build broke traced to its screenshots.
plane_issues: [https://app.plane.so/the-equal-lens/browse/EVAL-14/]
---

# Perception and usability heuristics for Equal Lens Daily

This digest turns the classic perception and usability principles into binding rules for the rebuild. It has three parts:

1. **Principles**: what each one says (paraphrased), where it comes from, and why it matters for a small, one-handed daily puzzle.
2. **Rules for Equal Lens Daily**: PH-1 to PH-35, each with a test.
3. **Broken in the EVAL-13 build**: every rule the failed build broke, with the screenshots that show it.

**After the Stage 1 critique.**
- **Ids.** Rules carry the PH prefix (PH-1 to PH-35). The sibling digests carry DG, HIG, M3, UXW and UA, so a bare "R31" no longer means four things.
- **Shared parts.** The one step model for a puzzle step, the one set of size and timing numbers, and the settled small conflicts are in section 2.0 of [usability-and-accessibility.md](usability-and-accessibility.md). Rules here that disagreed now point there.
- **Owner questions** live in one list in [../ux/journeys.md](../ux/journeys.md) (OQ-1 to OQ-30); the trade-offs at the end of this file point there.
- **Old evidence** (before 2024, no newer source found) is marked "old, owner to accept"; **house numbers** are marked HOUSE.

How to use it:
- The rules sit alongside [design.md](../design.md) and the owner's standing rules. These are minimal text, design before build, and plain words.
- A rule that clashes with the approved Lugdi or Station samples is not settled here. It goes to the owner as a choice with two pictures (see "Trade-offs to put to the owner").
- The tests are necessary, not sufficient. A screen that passes every test can still be dull. The design gate stays the owner's side-by-side review against the samples at phone width.
- Scope: platform guidelines (Apple, Material 3), accessibility standards and UX writing are touched only where a rule here depends on them.

Evidence base: every page below was downloaded as raw HTML on 20 Oct 2026 and read as text. Nothing was taken from a model summary. Dates are the page's own publication or "last reviewed" dates. Anything not confirmed from raw text is marked **UNVERIFIED**.

Screens are cited by file name from [out/trainer-shots](../../out/trainer-shots/), captured at 390 by 844 CSS px (files are 2x). Pixel sizes in this digest are CSS px, measured from those files.

---

## Part 1. Principles that matter here

### 1.1 Gestalt grouping

**Proximity**
- **Says.** Things placed near each other are read as one group. Space between them reads as separation. Proximity can override colour or shape. A control placed far from the thing it acts on tends to go unseen: task-focused users have tunnel vision.
- **Source.** https://www.nngroup.com/articles/gestalt-proximity/ (NN/g, Aug 2020); https://www.nngroup.com/articles/closeness-of-actions-and-objects-gui/ (NN/g, 2010).
- **Here.** One question, its options and its commit must read as one cluster, with the next cluster clearly apart. A commit floating far from the cards it confirms gets missed, and so does a name row placed under the cards.

**Similarity**
- **Says.** Things that share colour, shape or size are read as related and as working the same way. Buttons of the same colour read as equally important, so the primary action needs a look of its own. Elements that share a shape make people overlook the small differences between them.
- **Source.** https://www.nngroup.com/articles/gestalt-similarity/ (NN/g, Sep 2020).
- **Here.** This is the core of "no consistency".
  - If an option, a commit and a fact strip are all the same yellow bar, the player cannot tell choosing from committing.
  - In a fairness game, similarity also carries meaning about people. Two people drawn differently look like two kinds of person before the player has judged them. Whether the samples' alternating yellow and white plates should stay is the owner's open question.

**Common region**
- **Says.** A boundary or a shared background makes its contents one group, and this beats proximity. Overused, boxes add clutter. Full-width bands can also create "false floors" that stop people scrolling. Use space first and a container only when space cannot do the job.
- **Source.** https://www.nngroup.com/articles/common-region/ (NN/g, Jul 2020).
- **Here.** One plate per thing (a person, a ticket, a slip) is right. Boxes inside boxes inside boxes read as a form.

**Uniform connectedness**
- **Says.** Elements joined by a line, colour, frame or shape are seen as more related than unjoined ones. A drawn connector, such as a line or an arrow, makes the link explicit.
- **Source.** https://lawsofux.com/law-of-uniform-connectedness/ (Laws of UX); https://www.interaction-design.org/literature/article/laws-of-proximity-uniform-connectedness-and-continuation-gestalt-principles-2 (IxDF, 2015, modified Sep 2026).
- **Here.** Several mechanics are about links: person to job, word to blank, check to person, rank to seat. The link should be drawn, not written twice as text.

**Continuity (continuation)**
- **Says.** The eye follows lines, curves and sequences, and groups what lies along them. Numbered steps or a path show that items belong to one sequence.
- **Source.** https://www.nngroup.com/videos/continuation-gestalt/ (NN/g video summary); IxDF part 2, URL above.
- **Here.**
  - The reading path of every puzzle screen should be one line, the same every day: object, then question, then options, then commit.
  - A rank must run along one ordered column.

**Closure**
- **Says.** People complete incomplete shapes and see a whole. It works only if enough of the shape is given; with too little, the parts stay separate.
- **Source.** https://www.nngroup.com/videos/closure-gestalt/ (NN/g video summary); https://www.smashingmagazine.com/2014/03/design-principles-visual-perception-and-the-principles-of-gestalt/ (Smashing Magazine, Mar 2014).
- **Here.** An empty slot drawn as an open outline invites filling: an empty team seat, a blank in a reference, a free berth. That only works if the open outline means "fill me" and nothing else.

**Figure and ground**
- **Says.** People separate a figure from its background first. Size and contrast decide which is which. When the two are close in contrast, the figure becomes unstable or ambiguous.
- **Source.** https://www.nngroup.com/videos/figure-ground-gestalt/ (NN/g video summary); https://www.interaction-design.org/literature/article/the-laws-of-figure-ground-praegnanz-closure-and-common-fate-gestalt-principles-3 (IxDF, 2015, modified Jan 2026).
- **Here.**
  - Both skins use dark grounds. A chosen card turned near-black sinks into the ground and reads as switched off.
  - An NN/g literature review found that people with normal vision read better with dark text on a light ground. In the study it reports, this held for older adults (60 to 85) too, though their gain on one task was smaller; some people with cataract and related conditions may do better with dark mode. Long reading on the dark grounds should therefore be avoided, which fits the minimal-text rule; PH-35 turns this into a rule. Source: https://www.nngroup.com/articles/dark-mode/ (NN/g, Feb 2020; old, owner to accept; rechecked raw on 20 Oct 2026).

**Common fate**
- **Says.** Things that move or change together are seen as one group, separate from things that stay still. Arrows and angles can imply that shared motion.
- **Source.** https://www.nngroup.com/videos/common-fate-gestalt/ (NN/g video summary); https://www.interaction-design.org/literature/topics/gestalt-principles (IxDF, updated 2026).
- **Here.** When a word chip and its blank, or a check mark and a ticket, move together, the player sees cause and effect without a sentence explaining it.

**Focal point (dominance, isolation)**
- **Says.** You cannot emphasise everything. One element must dominate, and the others must recede. About three levels of dominance are all most people can tell apart. Separately, the item that differs from a set of similar items is the one noticed and remembered (the Von Restorff, or isolation, effect).
- **Source.** https://www.smashingmagazine.com/2015/02/design-principles-dominance-focal-points-hierarchy/ (Smashing Magazine, Feb 2015); https://lawsofux.com/von-restorff-effect/ (Laws of UX).
- **Here.**
  - The approved samples have one focal point: the poster or the railway object.
  - The isolation effect is also a fairness risk. A person shown differently from the others gets noticed first. Before the choice, only the day's object may stand out, not one person.

**Prägnanz (simplicity, good figure)**
- **Says.** People read a complex or ambiguous image as the simplest form they can, because that takes the least effort. Simple, ordered figures are processed and remembered better.
- **Source.** https://lawsofux.com/law-of-pr%C3%A4gnanz/ (Laws of UX); IxDF topic page, URL above.
- **Here.** At a glance, the day must read as one simple object: a ticket, a split-flap board, a cover. It must not read as a stack of bars. This is how the owner judges a screen.

### 1.2 Visual hierarchy

- **Says.** Hierarchy guides the eye in order of importance, using contrast, scale and grouping. NN/g's working limits:
  - no more than three sizes;
  - no more than two big elements;
  - no more than three contrast variations;
  - bright colour reserved for what matters.
  To check, blur the screen (NN/g uses 5, 10 and 20 px) and see what still stands out.
- **Source.** https://www.nngroup.com/articles/visual-hierarchy-ux-definition/ (NN/g, Jan 2021); https://www.nngroup.com/articles/principles-visual-design/ (NN/g, 2020, last reviewed Sep 2026). That page also allows two to three type sizes, and treats scale, balance and contrast as related principles.
- **Neobrutalism.** The Lugdi skin's hard offset shadows and heavy display type are a neobrutalist move. NN/g's 2025 guidance on that style:
  - keep text contrast checked;
  - use two or three bold colours;
  - give dense shapes generous padding (24 to 32 px);
  - make headlines about twice the body size;
  - keep interactive elements recognisable, with clear state changes.
  Source: https://www.nngroup.com/articles/neobrutalism/ (NN/g, Apr 2025).
- **First impressions.** People form an aesthetic first impression in about 50 ms, roughly ten times faster than reading. Source: https://www.nngroup.com/articles/aesthetic-minimalist-design/ (NN/g, Jan 2021). People also forgive small usability faults in a design they find beautiful. Source: https://lawsofux.com/aesthetic-usability-effect/ (Laws of UX).
- **Here.** The owner's verdicts came within minutes and from a glance. The first 50 ms of each screen is the test that counts. A screen whose blur shows six equal blocks has already failed.

### 1.3 Nielsen's ten usability heuristics

Source for all ten: https://www.nngroup.com/articles/ten-usability-heuristics/ (Nielsen, 1994, last reviewed 30 Jan 2024). Supporting pages are given against each heuristic.

1. **Visibility of system status.**
   - **Says.** Keep people informed through quick, fitting feedback. Even a colour change or a tick on a chosen item tells people the system registered the choice. Source: https://www.nngroup.com/articles/visibility-system-status/ (NN/g, 2018).
   - **Here.** The player must always see what is chosen, what is left (checks, seats, lines) and that a commit has taken.
2. **Match between system and real world.**
   - **Says.** Use the user's words, not internal jargon, and follow real-world order. Controls laid out like what they control (natural mapping) are learnt fastest.
   - **Here.** Research terms must stay out of the player's screens, for example "lean size", "matching cases" and "transfer day". Railway and pulp objects are real-world conventions Indian players already read.
3. **User control and freedom.**
   - **Says.** Give a clearly marked exit and support undo, so people can back out of a mistaken action. Source: https://www.nngroup.com/articles/user-control-and-freedom/ (NN/g, 2020).
   - **Here.** The owner's rules match this: no auto-advance, answers kept when going back, nothing breaks on refresh.
4. **Consistency and standards.**
   - **Says.** The same word, look or action should mean the same thing everywhere (internal consistency), and the product should follow conventions people know from elsewhere (external consistency, or Jakob's law). Source: https://lawsofux.com/jakobs-law/.
   - **Here.** Externally, the conventions are those of the daily-puzzle games the owner cites (one clear play or commit at the bottom, a result card, a streak). Internally, the grammar must be fixed while the object changes.
5. **Error prevention.**
   - **Says.** Prevent errors rather than message them. Slips happen when attention is elsewhere and are prevented with constraints and good defaults. Mistakes come from a wrong mental model. Sources: https://www.nngroup.com/articles/slips/ (NN/g, 2015); https://www.nngroup.com/articles/error-prevention/ (NN/g, 2018).
   - **Here.** Players play one-handed and on the move, so slips are the main risk.
6. **Recognition rather than recall.**
   - **Says.** Keep what people need visible, so they do not have to remember it from another screen. Source: https://www.nngroup.com/articles/recognition-and-recall/ (NN/g, Jan 2024).
   - **Here.** The locked rule, the records and the case being predicted must be on screen when the player decides.
7. **Flexibility and efficiency of use.**
   - **Says.** Accelerators, such as gestures, can speed up experienced users while novices use the visible way.
   - **Here.** The swipe is an accelerator. The two buttons are the visible way. Hints vanish for returning players.
8. **Aesthetic and minimalist design.**
   - **Says.** Every extra piece of information competes with the relevant ones and lowers their visibility. This is not a call for flat design; it is about focus.
   - **Here.** This is the owner's most repeated complaint, "so much text again". Visual furniture counts as information too: hub rows, repeated streak strips, notices.
9. **Help users recognise, diagnose and recover from errors.**
   - **Says.** Explain in plain words what went wrong and offer the fix.
   - **Here.** A refused move (a seventh player, an unfilled blank) should show where the problem is, not raise an error box.
10. **Help and documentation.**
    - **Says.** Best if nothing needs explaining. If help is needed, make it short, task-focused and to hand. NN/g's 2023 research on tutorials adds to this:
      - tutorials that interrupt ("push revelations") are skipped and forgotten;
      - help shown at the moment of need ("pull revelations") works better;
      - help should never ask people to memorise steps.
      Source: https://www.nngroup.com/articles/onboarding-tutorials/ (NN/g, Feb 2023).
    - **Coach marks.** Earlier work found that one hint at a time works, and a stack of tips overloads memory, which fades in about 20 seconds. Source: https://www.nngroup.com/articles/mobile-instructional-overlay/ (NN/g, 2014; old, owner to accept).
    - **Here.** There should be no "Before you start" and no instruction lines in the flow. At most, one tiny hint the first time a mechanic appears.

### 1.4 Norman: affordances, signifiers, mapping, constraints, feedback

**Affordances and signifiers**
- **Says.** Norman says designers should provide signifiers rather than worry about affordances. An affordance is a relation: what an agent can do with a thing. What matters on a screen is whether people perceive that an action is possible. A signifier is any perceivable cue that tells people what to do, where and how. Sources: https://jnd.org/signifiers-not-affordances/ (Norman, ACM Interactions, 2008); https://jnd.org/affordances-and-design/ (Norman). The 2013 revised edition of The Design of Everyday Things brought "signifier" into design. Source: https://www.interaction-design.org/literature/topics/signifiers (IxDF).
- **Evidence.** An NN/g eyetracking study compared pages with strong and weak signifiers. Weak signifiers, such as ghost buttons and links styled like text, cost 22% more time and 25% more fixations. Source: https://www.nngroup.com/articles/flat-ui-less-attention-cause-uncertainty/ (NN/g, 2017). NN/g also advises:
  - make buttons look like buttons;
  - never make non-clickable things look like buttons;
  - avoid many colourful boxes competing;
  - make every part of an item that belongs together tappable.
  Source: https://www.nngroup.com/articles/clickable-elements/ (NN/g, 2015).
- **A caution for games.** Norman notes that a game may deliberately break the rules of discoverability. Source: the affordances essay above.
- **Here.** The difficulty of Equal Lens Daily must come from the case (the loaded words, the protective voice), never from working out which box is a button. A dashed ghost button is a weak signifier by NN/g's definition.

**Mapping**
- **Says.** Controls that correspond to what they control, in layout or order, can be understood without labels. The example is a stovetop whose knobs match the burners. Source: the heuristics page, heuristic 2.
- **Here.** In a rank, top must mean first. In an assignment, the job slot must show who is in it. A shared budget of three checks should be three marks, not nine.

**Constraints and conventions**
- **Says.** Norman describes three kinds of constraint:
  - physical constraints, which make an action impossible;
  - logical constraints, where reasoning narrows the options (if five places are asked for and four are visible, one is still to come);
  - cultural constraints, which are learnt conventions.
  On screens, much of what passes for affordance is really convention. Source: https://jnd.org/affordances-and-design/.
- **Here.** Six empty seats tell the player to pick six without the sentence "Pick 6 of 8". A full team that refuses a seventh pick is a physical constraint.

**Feedback**
- **Says.** People need to know at once whether their action registered. Without that they repeat taps or give up. Source: the visibility page above. NN/g's timing limits are about 0.1 s to feel instant, about 1 s to keep the flow of thought, and about 10 s to keep attention. Source: https://www.nngroup.com/articles/response-times-3-important-limits/ (Nielsen, 1993, reprinted on NN/g; old, owner to accept). A current measure agrees in spirit: Google rates a page's answer to a tap as good at 200 ms or less and poor above 500 ms (https://web.dev/articles/inp, last updated 2 Sep 2025, read raw).
- **UNVERIFIED.** Norman's book also says feedback must be immediate and informative, and that too much feedback is as bad as too little. This is from the revised edition (2013) and was not confirmed from raw text in this session.

**Conceptual model and the two gulfs**
- **Says.** With every action, people must work out how to act (the gulf of execution) and whether it worked (the gulf of evaluation). A clear conceptual model bridges both. NN/g's worked example is a switch whose label showed the current state, which the user read as the action. Source: https://www.nngroup.com/articles/two-ux-gulfs-evaluation-execution/ (NN/g, 2018). Commands should name the state the system will move into, use verbs, and run to two to four words. Source: https://www.nngroup.com/articles/ui-copy/ (NN/g, 2019).
- **UNVERIFIED.** Norman also describes forcing functions (interlocks that stop an action until a condition is met) and the seven stages of action. These are from the revised edition and were not confirmed from raw text.

**Button states**
- **Says.** Every button needs visibly different states:
  - **enabled**: high contrast, an optional shadow;
  - **disabled**: desaturated and lower in contrast, but still readable;
  - **pressed**: shown within about 100 to 150 ms;
  - **selected**: distinct from pressed.
  Buttons also have styles (primary, secondary, tertiary), and each button has exactly one. Avoid generic labels such as Continue or Next. Source: https://www.nngroup.com/articles/button-states-communicate-interaction/ (NN/g, Apr 2025).
- **Here.** This is the spec the build's components lacked: chosen went black, and inactive went dashed.

### 1.5 Fitts's law and Hick's law

**Fitts's law**
- **Says.** The time to reach a target grows with distance and shrinks with size. Small, distant targets also cause more errors. In practice:
  - make targets big, and make the whole item tappable;
  - place targets used in sequence near each other, for example the submit button next to the last field;
  - remember that on touch screens, targets at the very edge are slower to hit, unlike with a mouse;
  - know that invisible padding helps less than visible size, because people still slow down for what they see.
  Source: https://www.nngroup.com/articles/fitts-law/ (NN/g, Jul 2022).
- **Touch targets.** Minimum 1 cm by 1 cm. Fingertips are 1.6 to 2 cm wide, and a thumb's contact patch averages 2.5 cm. Primary actions deserve bigger targets than the minimum, and use on the move needs bigger still. Stacked thin buttons cause mistaps; placing a pair side by side gives more room. Fewer elements on screen let the key targets grow. Source: https://www.nngroup.com/articles/touch-target-size/ (NN/g, 2019).
- **Here.** The game is played one-handed, often in a queue or on a bus.
  - 1 cm is about 60 CSS px on a 390 px wide phone. This is an approximate conversion from a 64.6 mm wide, 460 ppi screen; the device figures are from memory: **UNVERIFIED**.
  - The shared floor is now 48 px and the main button 56 px (usability digest 2.0b), close to that 1 cm. The old EVAL-13 floor of 44 px in [design.md](../design.md) is retired.

**Hick's law (Hick-Hyman)**
- **Says.** Decision time rises with the number and complexity of choices. The usual advice:
  - cut choices where speed matters;
  - break complex tasks into steps;
  - disclose progressively;
  - do not simplify to the point of abstraction.
  Too many options also lower satisfaction (choice overload). Sources: https://www.nngroup.com/videos/hicks-law-long-menus/ (NN/g video summary); https://lawsofux.com/hicks-law/; https://lawsofux.com/choice-overload/.
- **Here.**
  - Each screen state should carry one decision.
  - Laws of UX also suggests highlighting a recommended option. That must **not** apply here: a highlighted or pre-selected person would steer the very choice being scored.
  - Defaults are normally good: NN/g advises selecting one radio button by default in most cases (https://www.nngroup.com/articles/radio-buttons-default-selection/, 2014; old, owner to accept). In a puzzle, a default is a nudge.

**Sliders and anchoring**
- **Says.** Sliders are hard to set to a precise value on touch. Labels must sit above or beside the slider, not under the finger. Use tappable alternatives when the value matters. Source: https://www.nngroup.com/articles/gui-slider-controls/ (NN/g, 2015). A first number seen anchors later estimates. Source: https://www.nngroup.com/articles/anchoring-principle/ (NN/g, 2018).
- **Here.** "Predict the crowd" is an estimate. A slider preset to 50% anchors it.

### 1.6 Cognitive load and progressive disclosure

**Cognitive load**
- **Says.**
  - The load an interface imposes is the working memory it takes.
  - Intrinsic load, the effort of the task itself, is wanted.
  - Extraneous load is processing that does not help: clutter, decorative type with no meaning, decoding the controls.
  - To cut extraneous load, remove clutter, build on familiar patterns, and offload work: show a picture, re-display earlier information, set a smart default.
  Sources: https://www.nngroup.com/articles/minimize-cognitive-load/ (NN/g, 2013); https://www.nngroup.com/articles/working-memory-external-memory/ (NN/g, 2018); https://lawsofux.com/cognitive-load/.
- **Mobile.** Reading on a small screen takes more working memory, because less of the text stays visible. Mobile sessions are short and interrupted, so the product should save state. Source: https://www.nngroup.com/articles/mobile-ux/ (NN/g, 2015).
- **Here.** The fairness judgement is the intrinsic load and is the whole point. Every word spent on operating the interface takes capacity away from it.

**Progressive disclosure**
- **Says.**
  - Show the few most important options first and the rest on request.
  - Whatever appears first is read as important.
  - More than two levels of disclosure usually fails.
  - Staged disclosure, one step at a time, suits tasks whose steps barely interact.
  Source: https://www.nngroup.com/articles/progressive-disclosure/ (NN/g, 2006).
- **Here.**
  - The result screen should show the headline and the size of the lean; the breakdown waits one tap away.
  - A two-decision mechanic, such as "pick the team, then answer the protective voice", should stage its second decision.

**Attention, motion and memory of the day**
- **Fold.** People spent about 57% of viewing time above the fold, and about 74% in the first two screenfuls. Source: https://www.nngroup.com/articles/scrolling-and-attention/ (NN/g, 2018).
- **Animation timing.**
  - Most animations should run 100 to 500 ms; simple feedback about 100 ms, a larger change of view 200 to 300 ms.
  - Around 500 ms starts to drag.
  - Respect the reduce-motion setting.
  Source: https://www.nngroup.com/articles/animation-duration/ (NN/g, 2020). Laws of UX puts the pace that keeps people engaged at under 400 ms (https://lawsofux.com/doherty-threshold/).
- **Peaks and endings.** People judge an experience mostly by its peak and its end. Sources: https://www.nngroup.com/articles/peak-end-rule/ (NN/g, 2018); https://lawsofux.com/peak-end-rule/. Visible progress towards a goal speeds people up near the end (https://lawsofux.com/goal-gradient-effect/).
- **Here.** The result card and Sunday are the "end" of each day and each week. They are the moments that set whether the player comes back.

---

## Part 2. Rules for Equal Lens Daily

Each rule has a test. "Puzzle screen" means any state of a day's puzzle. "Commit" means the one action that locks a move, such as "Lock rule" or "Send team".

### A. One screen, one focus

**PH-1. One focal point per screen: the day's object or its people.**
- The poster, ticket, departure board or slip dominates.
- The commit is the second thing seen.
- Nothing else competes: no hub rows, no settings rows, no repeated streak.
- *Test:* blur a 390 px screenshot by 8 px (HOUSE; NN/g uses 5, 10 and 20 px). Exactly one region dominates and the commit is next.
- *From:* focal point, visual hierarchy, Prägnanz.

**PH-2. At most four text styles per screen (the shared number, usability digest 2.0b), and aim for three sizes: display, question, body.**
- NN/g's working limit is three sizes; a fourth style should differ in weight, not size, where it can.
- Display is at least twice the body size.
- The question is larger or heavier than every status line.
- A status line, where one exists at all (status is shown as marks where it can be), is never the same size and weight as the question, and never larger.
- *Test:* list computed styles per state: four or fewer, with the question above every status line.
- *From:* visual hierarchy, neobrutalism guidance.

**PH-3. At most two big elements per screen: the object and the commit.**
- Display type is used only for titles. Whether Lugdi's commit label keeps the samples' display-face capitals is owner question OQ-3; Hindi commit labels are always in Hind (UA-15).
- *Test:* count elements set in display type or taller than 120 px: two or fewer, the art excepted.
- *From:* visual hierarchy (no more than two big elements).

**PH-4. Each puzzle step fits one phone screen, and the commit is pinned to the bottom.**
- The arriving state of every step fits without scrolling at 360 by 640 and 390 by 844 px.
- The commit sits pinned to the bottom, above the safe area, at the same height on every puzzle screen.
- When content runs long, the step is split in two. The art stays full-bleed behind the plates and is never compressed (M3-36, tested by UA-2); the controls do not shrink and the commit stays put. (The earlier "the art compresses" clause is removed after the critique, because it rebuilt the 120 px strip.)
- At 200% text a step may scroll, but the commit stays pinned and reachable (UA-16).
- The board is one designed sheet plus one tap for detail. Sunday's shape is owner question OQ-2.
- *Test:* compare screenshot heights, and the commit's bottom offset across all 14 days.
- *From:* scrolling and attention, Fitts (distance), consistency, the approved samples (button pinned at the bottom).

**PH-5. A chosen item gains contrast against the ground; it never loses it.**
- On the dark grounds, a chosen card never takes the ground's colour.
- Unchosen items keep their rest look until the commit.
- *Test:* in every ready state, the chosen item's contrast with the ground is at least its rest contrast.
- *From:* figure and ground, visibility of system status.

### B. Grouping and look

**PH-6. Space shows what belongs together.**
- Space inside a group is at most half the space between groups, for example 8 px inside and 16 to 24 px between.
- A label sits closer to its own value or control than to anything else.
- *Test:* measure computed gaps per screen.
- *From:* proximity.

**PH-7. One look per role, identical on every day of a skin.**
- The roles are: commit; option (person card, chip, slot, seat); secondary action (text or outline); information (no plate).
- The commit differs from any option in at least two of fill, shape and size.
- *Test:* inventory the tappable looks per skin: five or fewer (commit, person, chip, slot, secondary), and none shared across roles.
- *From:* similarity, consistency and standards, button styles.

**PH-8. Information never looks tappable, and anything tappable never looks like information.**
- Fact strips, scores and notices do not use the option or commit plate.
- No monogram tile stands in for a person or for "Neither".
- *Test:* every element with an option or commit look has a handler, and no handler sits on plain text.
- *From:* signifiers, clickable elements.

**PH-9. Containers only where space cannot do the grouping, and never more than two levels deep.**
- Two levels means the ground, then a plate.
- No full-width boxed bands.
- *Test:* the depth of nested filled or bordered regions is two or less.
- *From:* common region (overuse, false floors).

**PH-10. A dashed outline means one thing only: an empty place in the puzzle waiting to be filled.**
- It is never used for a disabled button, a notice, a spent item, an unpicked person or a streak day not yet played (settled after the critique, usability digest 2.0c).
- *Test:* every dashed border in the stylesheet belongs to the slot role.
- *From:* closure, similarity.

**PH-11. When a mechanic links two things, draw the link and move both ends together.**
- The person's portrait goes into the job slot.
- The chosen word travels into the blank.
- Rank positions fill one numbered column from the top.
- A spent check appears as a punch on that person's ticket.
- The two ends animate together over 100 to 300 ms.
- *Test:* after each placement, the target shows the source's portrait or word, not just a text label at both ends.
- *From:* uniform connectedness, common fate, continuity, mapping.

### C. Controls, signifiers and states

**PH-12. The thing is the control.**
- A person, word, rule or seat is chosen by tapping it.
- No second row of buttons repeats the same choice, such as names under the cards.
- *Test:* each decision has exactly one set of selectable elements.
- *From:* signifiers, closeness of actions and objects, minimalist design, Hick.

**PH-13. One commit per screen state, in a look nothing else uses.**
- A two-stage mechanic (lock the rule, then hand out the jobs) shows only the current stage's commit.
- Until it can be used, the commit follows the step model (usability digest 2.0a, point 3): shown in its fixed place as a muted version of the same shape, with a label at 4.5:1 that names what is missing, and still focusable. It is not hidden.
- It is never dashed and never a ghost.
- *Test:* at most one commit-style element per state.
- *From:* button states, weak signifiers (ghost buttons), similarity.

**PH-14. Every control has rest, pressed, chosen and unavailable states, drawn and tested.**
- **Pressed** shows within 100 ms.
- **Chosen** adds a mark (a tick, stamp, punch or the skin's selected colour) and keeps or raises contrast.
- **Unchosen** options do not change until the commit; after it, the result may dim them.
- *Test:* a state sheet for every control, plus a timing trace.
- *From:* button states, visibility of system status, figure and ground.

**PH-15. No hidden gestures.**
- Where a card can be swiped, the screen shows it on arrival: a stacked edge or a slight tilt, and the two outcomes at the sides.
- The two buttons do the same job.
- *Test:* the swipe signifier is visible in the arriving state.
- *From:* signifiers, flexibility and efficiency (the gesture is the accelerator).

**PH-16. A command names what will happen; a setting shows both states.**
- Commands lead with a verb, in one to three words ("Lock rule", "Send team", "Punch ticket").
- A two-state setting shows both options with the current one marked (EN | हिं), never one button whose label could be read as the state or the action.
- No generic labels ("Confirm my choice", "Continue").
- *Test:* review the label list; no command label describes the current state.
- *From:* UI copy, the gulf of evaluation, button states.

**PH-17. Mapping: screen order is meaning.**
- In a rank, top means first.
- Seat labels (CNF, RAC, WL 1) belong to positions, so they always appear in order.
- A shared budget appears once as its own number of marks, and each spend moves one mark onto a person.
- *Test:* rows top to bottom match ranks 1 to n; the marks on screen equal the budget.
- *From:* natural mapping, recognition rather than recall, Prägnanz.

**PH-18. Constraints explain the move; sentences do not.**
- The game makes a wrong move impossible instead of describing the right one:
  - a seventh pick is refused with a shake of the seat row;
  - tapping a filled blank empties it;
  - the commit wakes only when the move is complete.
- *Test:* after a mechanic's first appearance, no string on any screen begins with "Tap", "First" or "Pick".
- *From:* constraints, error prevention, slips.

### D. Reach and size

**PH-19. Target sizes** (the shared numbers, usability digest 2.0b).
- No target is smaller than 48 by 48 px, padding included.
- Options, chips, person cards and seats are at least 48 px tall.
- The commit is 56 px tall and the full content width less the gutters.
- NN/g's 1 cm is about 60 px on this phone (conversion **UNVERIFIED**, see 1.5); the 56 px commit is close to it. The earlier "aim for about 60 px" is dropped so that every digest uses one number.
- *Test:* measure rendered boxes at 360 and 390 px wide.
- *From:* Fitts, touch target size.

**PH-20. Spacing between targets.**
- At least 8 px between adjacent targets.
- Opposite actions (Cut and Keep, Fair and Loaded) sit side by side with at least 12 px between them, never as stacked thin bars.
- Three or fewer short options go in a row or grid, not a stack.
- *Test:* measure gaps.
- *From:* touch target size.

**PH-21. Reach and danger.**
- The commit sits in the bottom band. Choices sit in the middle and lower part of the screen. The top third holds what is read (the object and the question), not what is tapped each round.
- Reset and destructive actions ("Start again", "Remove friend", "Delete everything") are small, at least 48 px away from the commit, and either undoable or confirmed with a specific pair of labels ("Remove Pahiya" and "Keep").
- *Test:* the commit's y-position is the same everywhere, and no destructive action uses the commit or option look.
- *From:* Fitts, confirmation dialogs, error prevention.

**PH-22. No slider for a value the player must aim at.**
- The crowd prediction uses tappable bands, for example two rows of five from 10 to 100, each at least 48 px.
- No value is selected on arrival.
- If a slider is ever used, its value sits above the thumb and nothing needed sits under the finger.
- *Test:* the arriving state has no preset value.
- *From:* sliders, anchoring, Fitts.

### E. Choices, load and words

**PH-23. One question per screen state, ten words or fewer.**
- A mechanic with two decisions (pick the team, then answer the protective voice; spend checks, then appoint) stages them on the same object: the second appears when the first is done.
- No timers (owner rule): pressure comes from the case, never from a clock.
- *Test:* one question per state, counted in words.
- *From:* Hick, staged disclosure, cognitive load.

**PH-24. Choice counts and neutrality.**
- Response options: two or three.
- People: three to five per choice, never two (owner rule, 20 Oct), as a grid of identical tiles once there are more than four.
- Approved samples break this: p04 picks 6 of 8 for a team, and p02 and 3-p16 set two people side by side on twin days. Which wins is owner question OQ-8; until then the owner's rule stands.
- No option is highlighted, pre-selected or placed as a recommendation.
- People's order is shuffled for each player.
- *Test:* no default selection on any puzzle step; the tile sizes and looks of people are identical before the choice.
- *From:* Hick, choice overload, similarity, focal point (isolation risk).

**PH-25. A word budget for the whole rendered screen.**
- The owner's budget is 15 words on puzzle screens and 20 elsewhere, not counting names, numbers and quoted case lines.
- There are no operating instructions in the flow.
- Hint text follows the step model (usability digest 2.0a, point 4): none in the first build. Only if playtests show a mechanic cannot be learnt from the board does it get one hint of six words or fewer, next to the control it explains, on the first meeting only.
- *Test:* a script counts the words in the rendered page of every state, not just the puzzle strings.
- *From:* aesthetic and minimalist design, extraneous load, pull revelations, the owner's minimal-text rule.

**PH-26. Nothing is said twice on a screen.**
- The blurb, the question and any hint carry different content.
- The brand appears once in the whole first run.
- The same thing keeps the same word throughout: a note is not also an announcement.
- *Test:* no two strings on a screen share more than half their content words.
- *From:* minimalist design, consistency, signal-to-noise (https://www.nngroup.com/articles/signal-noise-ratio/, NN/g, 2018).

**PH-27. Plain words: no research or system terms on player screens.**
- **Banned terms:** "consistency" as a label, "lean size (direction hidden)", "matching cases", "check gap", "word gap", "transfer day", "part 1 of 2", "chart 219", "points off".
- **Notices:** draft, sample and prototype notices sit behind one chip, never in the flow (owner rule).
- *Test:* a banned-word list check on every state.
- *From:* match between system and real world.

**PH-28. Everything the player needs to decide is in view.**
- The locked rule shows as a stamp beside the people.
- The records sit on the cards.
- A prediction about an earlier day shows that day's line.
- Sunday shows the two cases side by side.
- *Test:* no question refers to something not visible on the same screen.
- *From:* recognition rather than recall, working memory.

### F. Feedback, control and the end of the day

**PH-29. Every action answers, at the right speed.**
- Pressed within 100 ms.
- The move's visible result (word in the blank, punch on the ticket, person in the seat) within 300 ms.
- Anything over 1 s shows progress.
- Motion runs 100 ms for small feedback and 200 to 300 ms for a change of view. Nothing that follows a tap exceeds 400 ms. The only longer moments are the three named in the shared numbers (the result reveal, 1.2 s; the ghost demonstration, 1.5 s; a milestone, 2 s; all HOUSE), each skippable by a tap, each with a still version under the reduce-motion setting (UA-21).
- *Test:* a performance trace of each mechanic.
- *From:* response times, animation duration, button states.

**PH-30. Every round shows its outcome in place.**
- After the last gossip line, the column shows what was kept and what was cut before it closes.
- Counts of what remains appear as marks inside the object (the samples' "item 4 of 12" in the card corner), never as a separate text line or a progress bar (the owner removed both).
- *Test:* the final state of every mechanic shows the player's choices.
- *From:* visibility of system status, goal gradient, closure.

**PH-31. Exits, undo and state.**
- Every puzzle step has a back control at the top left, with a 48 px target, that keeps answers (settled after the critique as the one way out, usability digest 2.0a).
- Every placement can be undone before the commit by tapping it again.
- The commit is the only point of no return, and its verb says so.
- State survives refresh and interruption. Nothing advances on its own.
- *Test:* back, undo, refresh and app switch on every step.
- *From:* user control and freedom, mobile UX (save state), owner rules.

**PH-32. The end of the day is a designed peak, drawn on the day's object.**
- The ticket is stamped; the cover gets its end band if the owner keeps "The End" (OQ-4).
- It shows one headline number, one line to reflect on, one primary action and at most one secondary.
- Whether the lean shows here at all, and in what form, is owner question OQ-1. Whatever the answer, the lean shows size only: no he or she, no tilt, and no left or right meaning. A bar that fills from one side is offered to the owner only with the warning that a side can read as a direction (OQ-1, picture C).
- The breakdown is one tap away (two disclosure levels at most).
- No equation layout and no settings rows.
- *Test:* the result fits one screen; its elements are counted; any lean graphic carries no side, tilt or pronoun.
- *From:* peak-end rule, progressive disclosure, minimalist design, owner rules (always show scores, never a dead end, size not direction).

**PH-33. The same grammar every day.**
- The kicker format, question position, commit position and state looks are fixed across all days and both skins.
- Only the object and the art change.
- *Test:* overlay the 14 arriving screenshots; the question's baseline and the commit's box match within 4 px (HOUSE).
- *From:* consistency and standards, similarity, continuity.

**PH-34. Repeated furniture appears once.**
- The streak appears in exactly two places: a small count in the cover's top bar, and this week's seven equal marks on the result (settled after the critique with DG-29). Sunday's day objects show the week; they are not a third streak strip. A difference in size reads as a difference in meaning, so any size difference must carry one meaning the player can see.
- "One missed day a week is forgiven" is explained once, at the first forgiven miss, in place and as a toast (DG-28); the forgiven mark keeps its shape and word after that.
- *Test:* count the streak instances per day; mark sizes are equal unless they carry a shown meaning.
- *From:* minimalist design, similarity (size).

**PH-35. Reading happens on a light surface.** (Added after the critique.)
- Any text longer than two lines (a reference note, a letter, a quoted record, the look-again pair's words, the Sunday note) sits on a light plate (paper or the skin's cream) with dark ink.
- The dark grounds carry only short labels, titles and numbers.
- *Test:* no block of more than two lines is set light on dark, on any screen, in either skin.
- *Clash with a sample:* Lugdi Sunday (ls/shots p05) sets the three-line look-again text in paper on a dark box; Station Sunday (p10) puts it on a white card. This is not settled here: it goes to the owner with the Sunday pictures (OQ-2).
- *From:* figure and ground (NN/g's 2020 review: light mode helps normal and older readers; old, owner to accept). Personas P3 and P5 have ageing eyes.

---

## Part 3. Broken in the EVAL-13 build

Word counts are my own, approximate, and leave out names, numbers and quoted case lines. Heights are CSS px, measured from the 2x files.

**PH-1 (one focal point)**
- `003-01-L-mon-cover.png`, `007-02-L-tue-cover.png`, `029-08-S-mon-cover.png`, `055-14-S-sun-cover.png`:
  - The Today hub stacks seven equal-weight blocks: title, art strip, Play, a road-name row, a practice row, the streak and a language button.
  - Play is one block among seven, and the hub is the same on all 14 days.
- `004-01-L-mon-assign-arrive.png`, `012-03-L-wed-pick-arrive.png`, `020-05-L-fri-checks-arrive.png`:
  - The painting is a 120 px strip squeezed between the blurb and the question, so it is neither ground nor figure.
  - In `011`/`012` it is rain streaks; in `019`/`020` it is a dark box.
- `028-07-L-sun-week.png`, `056-14-S-sun-week.png`: eight stacked sections with no dominant one.

**PH-2 (three sizes, the question above status)**
- `024-06-L-sat-team-arrive.png`: the status "0 of 6 picked" is set as large as the question "Pick the six for tonight." (both about 16 px of ink height), so the counter competes with the question.
- `020-05-L-fri-checks-arrive.png`, `048-12-S-fri-checks-arrive.png`: "Checks left: 3" sits at question size.
- `004-01-L-mon-assign-arrive.png`, `030-08-S-mon-rank-arrive.png`: "Who gets the three stall jobs?" and "First, lock a rule" read as equal.

**PH-3 (two big elements)**
- `003-01-L-mon-cover.png`: large type for the title, "Ghat Ka Jugnu", "0" and "0 days", plus two full-width heavy buttons.
- `006-01-L-mon-result.png`, `034-08-S-mon-result.png`: score block, "100%", "1 day" and two full-width buttons, all big.

**PH-4 (one screen, commit pinned at the bottom)**
- **Floating commit, empty bottom.**
  - `001-onboarding-language.png`: about 65% of the screen empty.
  - `009-02-L-tue-swipe-ready.png`: the commit at about 280 px from the top, about 60% empty below.
  - `004-01-L-mon-assign-arrive.png`, `032-08-S-mon-crowd-arrive.png`, `036-09-S-tue-pick-arrive.png`: the bottom quarter to third empty.
- **Commit below the fold.** `020-05-L-fri-checks-arrive.png` (914 px tall), `024-06-L-sat-team-arrive.png` (1,046 px), `005-01-L-mon-assign-ready.png` (1,044 px).
- **Long scrolls.** `028-07-L-sun-week.png` (1,784 px), `056-14-S-sun-week.png` (1,799 px), `057-board.png` (1,604 px).
- **Commit moves from day to day.** It sits about 280 px from the top in `009`, about 670 px in `013-03-L-wed-pick-ready.png`, and at the end of the page in `017-04-L-thu-words-ready.png`.

**PH-5 (chosen gains contrast)**
- `013-03-L-wed-pick-ready.png`, `045-11-S-thu-pick-ready.png`, `037-09-S-tue-pick-ready.png`:
  - The chosen driver turns black on a near-black ground.
  - The unchosen card stays bright yellow and looks like the selected one.
- `025-06-L-sat-team-ready.png`, `053-13-S-sat-team-ready.png`: the six picked players all sink to black; the finished screen reads as switched off.
- `021-05-L-fri-checks-ready.png`, `049-12-S-fri-checks-ready.png`: the chosen treasurer's name button goes black.

**PH-6 (space shows grouping)**
- `006-01-L-mon-result.png`: the "=" and "+" sit below the numbers, beside the labels. The sum reads as "= Consistency" and "+ Practice", not 110 = 100 + 10.
- `005-01-L-mon-assign-ready.png`:
  - Each job slot puts its label at the top and the name at the bottom, with an empty middle.
  - In the person rows, the "skill" figure sits nearer the job tag than the name.

**PH-7 (one look per role)**
- `004-01-L-mon-assign-arrive.png`, `030-08-S-mon-rank-arrive.png`: the rule options are full-width yellow bars of the commit's shape.
- `020-05-L-fri-checks-arrive.png`, `048-12-S-fri-checks-arrive.png`: person cards, name buttons and the commit are all yellow plates.
- `024-06-L-sat-team-arrive.png`: player tiles, response options and the commit are all yellow plates.
- `002-onboarding-road-name.png`, `003-01-L-mon-cover.png`, `006-01-L-mon-result.png`:
  - Road-name options look like the commit.
  - "Show three more", the language toggle and "Back to today" share one heavy white style with the red shadow, so a toggle, a "more" link and navigation look identical.

**PH-8 (information is not a button)**
- `016-04-L-thu-words-arrive.png`, `040-10-S-wed-words-arrive.png`: the fact strip uses the yellow plate the options use.
- `006-01-L-mon-result.png`, `028-07-L-sun-week.png`: the score block is a yellow plate like the commit.
- `036-09-S-tue-pick-arrive.png`: "Neither" gets an "N" monogram tile, as if it were a person.
- `031-08-S-mon-rank-ready.png`, `048-12-S-fri-checks-arrive.png`, `061-hindi-day-12.png`: "J", "F" and "फ" letter tiles stand in for missing portraits and look unfinished.

**PH-9 (two levels of container)**
- `028-07-L-sun-week.png`, `056-14-S-sun-week.png`: a ruled frame holds white cards, which hold portrait boxes and black "You chose" tags, beside a boxed text area.
- `057-board.png`:
  - A blue table sits under a blue header bar.
  - A "Friends" heading sits above a table also headed "Friends".
  - Settings rows sit above both.

**PH-10 (dashed means "fill me")**

The dashed line carries at least eight meanings:
- an inactive commit: `004`, `012`, `016`, `020`, `024`, `030`, `036`, `060`;
- a notice: `001`, `028`, `034`, `057`;
- an empty streak day: `003`;
- an empty job marker "[----]": `005`;
- a line counter: `009`;
- used word chips: `017`, `041`;
- spent cards: `021`, `049`;
- unpicked players: `025`, `053`;
- "Week closed": `028`, `056`.

**PH-11 (draw the link)**
- `005-01-L-mon-assign-ready.png`: each link is written twice and drawn nowhere. The slot holds the person's name as text, and the person's row holds the job name as a tag. No portrait goes into a slot.
- `031-08-S-mon-rank-ready.png`: the rank is shown by chips on rows that never move. The order is not a line the eye can follow.

**PH-12 (the thing is the control)**
- `020-05-L-fri-checks-arrive.png`, `048-12-S-fri-checks-arrive.png`, `061-hindi-day-12.png`: the player taps the cards to check, then must pick the same three people again from a row of name buttons ("Who keeps the cash box?").

**PH-13 (one commit, never a ghost)**
- `004-01-L-mon-assign-arrive.png`, `030-08-S-mon-rank-arrive.png`, `060-hindi-day-8.png`: two commits ("Lock the rule" and "Hand out the jobs"), both dashed ghosts, before anything is chosen.
- `008-02-L-tue-swipe-arrive.png`: a dashed "Close the column" waits from line 1 of 8.
- `031-08-S-mon-rank-ready.png`: "Start again" is a full-width white button stacked on the commit.
- `006-01-L-mon-result.png`, `010-02-L-tue-result.png`, `034-08-S-mon-result.png`: two full-width buttons of equal shape and shadow.

**PH-14 (states)**
- `017-04-L-thu-words-ready.png`, `041-10-S-wed-words-ready.png`:
  - Every chip turns dashed once the blanks are full, including the unused ones.
  - Yet each word may be reused, so the chips look spent when they are not.
- `021-05-L-fri-checks-ready.png`: all three cards turn dashed when the checks run out, before the choice is made.
- Pressed timing cannot be checked from stills.

**PH-15 (no hidden gestures)**
- `008-02-L-tue-swipe-arrive.png`: the gossip card can be dragged (per design.md) but shows nothing to say so: no stacked edge, no tilt, no side labels. The sample `shots3/p08` shows a paper stack with "Cut it" and "Keep it" arrows at its sides.

**PH-16 (labels name the action; settings show both states)**
- `003-01-L-mon-cover.png`, `007-02-L-tue-cover.png`, `029-08-S-mon-cover.png`: on an English screen, "भाषा: हिन्दी" could mean "the language is Hindi" or "switch to Hindi".
- `012-03-L-wed-pick-arrive.png`, `036-09-S-tue-pick-arrive.png`: the generic "Confirm my choice".
- `028-07-L-sun-week.png`, `056-14-S-sun-week.png`: "Week closed" is a status drawn as a button.

**PH-17 (mapping)**
- `031-08-S-mon-rank-ready.png`: the confirmed seat (CNF) sits on the second row, and RAC on the first. Position is not order.
- `020-05-L-fri-checks-arrive.png`, `048-12-S-fri-checks-arrive.png`: three people each carry three empty circles, nine marks for a budget of three, with a separate "Checks left: 3".

**PH-18 (constraints, not sentences)**
- `005-01-L-mon-assign-ready.png`: "Tap a person, then a job."
- `016-04-L-thu-words-arrive.png`, `040-10-S-wed-words-arrive.png`: "Tap a blank, then a word. Each word fits either note."
- `020-05-L-fri-checks-arrive.png`: "Tap a person to call their referee."
- `031-08-S-mon-rank-ready.png`: "Tap people in order, first place first."
- `048-12-S-fri-checks-arrive.png`: "Tap a ticket to punch it", with no ticket drawn.

**PH-19 (target sizes)**
- Options drawn 40 px tall, under the old 44 px floor and the shared 48 px one:
  - language buttons in `001`;
  - road names in `002`;
  - rule options in `004` and `030`;
  - name buttons in `020` and `048`;
  - responses in `024` and `053`.
- Word chips about 42 px (`016`).
- The slider thumb is drawn about 15 px across (`032`).
- The commit face is about 52 px (`003`, `057`), short of the shared 56 px.

**PH-20 (spacing; side by side, not stacked)**
- `004-01-L-mon-assign-arrive.png`, `030-08-S-mon-rank-arrive.png`: the rule options are stacked thin bars where sample `p01` uses one row of chips.
- `024-06-L-sat-team-arrive.png`, `053-13-S-sat-team-ready.png`: three stacked response bars.
- `057-board.png`: five stacked "Add ..." bars.

**PH-21 (reach and danger)**
- `057-board.png`: "Remove Highway Ka Pahiya" is a full-width button directly under the friends table.
- `058-prototype-menu.png`: "Delete everything on this phone" has the same size and style as "Back to the real date".
- `031-08-S-mon-rank-ready.png`: "Start again" touches the commit.

**PH-22 (no aiming slider)**
- `032-08-S-mon-crowd-arrive.png`:
  - The slider arrives preset at 50%, which anchors the guess.
  - The thumb is about 15 px.
  - The 0%, 50% and 100% labels sit under the track, beneath the finger.
- The approved sample `shots3/p14` uses tappable bands instead.

**PH-23 (one question, ten words)**
- `024-06-L-sat-team-arrive.png`, `052-13-S-sat-team-arrive.png`, `053-13-S-sat-team-ready.png`: two decisions on one screen ("Pick the six for tonight." and "And Salim chacha?").
- `020-05-L-fri-checks-arrive.png`: spending checks and appointing on one screen.
- `032-08-S-mon-crowd-arrive.png`: the question runs to 13 words.
- `036-09-S-tue-pick-arrive.png`: the question runs to 15 words.

**PH-24 (no default, neutral choices)**
- `032-08-S-mon-crowd-arrive.png`: a preset value.
- Shuffling cannot be checked from stills.

**PH-25 (word budget)**
- `001-onboarding-language.png`: about 24 words, against a budget of 20.
- `003-01-L-mon-cover.png`: about 35.
- Puzzle screens, against a budget of 15:
  - `004-01-L-mon-assign-arrive.png`: about 44;
  - `020-05-L-fri-checks-arrive.png`: about 50;
  - `016-04-L-thu-words-arrive.png`: about 60, the word chips included.
- `028-07-L-sun-week.png`: well over 100.

**PH-26 (said once)**
- `001-onboarding-language.png`: the brand twice on one screen, plus a tagline.
- `002-onboarding-road-name.png`: "Pick your road name" as the title and again as a label.
- `016-04-L-thu-words-arrive.png`: three sentences saying the same thing (blurb, question, hint).
- `008-02-L-tue-swipe-arrive.png`: the blurb "Keep each line, or cut it?" and the question "Does this line go in the column?"
- `040-10-S-wed-words-arrive.png`: the question says "announcements", while the hint and the commit say "notes".
- The forgiven-day line repeats on every Today and result screen: `003`, `006`, `029`, `034`.

**PH-27 (plain words, no notices in the flow)**
- `028-07-L-sun-week.png`, `056-14-S-sun-week.png`: "Lean size (of 100 · direction hidden)", "How consistency is made", "Matching cases treated alike", "Check gap between matching records" and "Word gap between the two notes".
- `022-05-L-fri-result.png`: "Check gap between matching records" and "Some of today's choices count later in the week".
- `034-08-S-mon-result.png`: "Crowd guess, points off".
- `036-09-S-tue-pick-arrive.png`: "Transfer day 220", "A new kind of puzzle" and "Nothing about jobs or teams today". These also announce a day the brief says is unannounced.
- `030-08-S-mon-rank-arrive.png`: "Part 1 of 2".
- `029-08-S-mon-cover.png`: "Chart 219".
- Notices in the flow: `001` ("The Hindi is a draft."), plus sample notices on `028`, `034`, `056` and `057`.

**PH-28 (in view, not remembered)**
- `032-08-S-mon-crowd-arrive.png`: asks what share of players cut "the line about Arjun crying" last Tuesday, but shows only his portrait, not the line.

**PH-30 (outcome in place)**
- `009-02-L-tue-swipe-ready.png`: after eight lines, the screen shows only "Line 8 of 8" and the button. There is no record of what was kept or cut.
- `008-02-L-tue-swipe-arrive.png`: progress is a separate text line ("Line 1 of 8") between the question and the card.

**PH-31 (exits and undo)**
- Every puzzle step has no back or exit control and no tab bar, so the only way out is the browser:
  - `004`, `008`, `012`, `016`, `020`, `024`;
  - `030`, `032`, `036`, `040`, `048`, `052`.
- Undo and refresh behaviour cannot be checked from stills.

**PH-32 (the end is a peak)**
- `006-01-L-mon-result.png`, `010-02-L-tue-result.png`, `022-05-L-fri-result.png`, `034-08-S-mon-result.png`:
  - a calculator layout ("110 Score = 100 Consistency + 10 Practice");
  - label and value rows;
  - the streak strip again;
  - two equal buttons;
  - no object and no art;
  - "THE END" over an empty dark lower half.

**PH-33 (same grammar)**
- Kickers drift:
  - "Ghat Series · No. 212 · Monday" (`003`);
  - "Chart 219 · Monday" (`029`);
  - "Transfer day 220 · Tuesday" (`036`);
  - "No. 221 · Wednesday" (`040`);
  - "PNR slip · Week 44" on the board (`057`).
- Header patterns differ across `001`, `003`, `006`, `027`, `029`, `034` and `057`.
- The commit position moves (see PH-4).

**PH-34 (furniture once)**
- `003-01-L-mon-cover.png`, `029-08-S-mon-cover.png`, `055-14-S-sun-cover.png`: 14 streak boxes in two heights, with no stated meaning for the difference.
- `006-01-L-mon-result.png`, `034-08-S-mon-result.png`: the same strip again on every result.

Not checkable from stills: PH-29 (timing and motion) and the timing parts of PH-14. These need a trace on a phone.

---

## Trade-offs to put to the owner

These are places where a rule above meets the approved samples. None is decided here. Each now sits, with its pictures, in the single owner list in [../ux/journeys.md](../ux/journeys.md):

| Was | Now |
|---|---|
| 1. Rule chips drawn about 36 px tall in sample p01, against PH-19's 48 px | OQ-10 |
| 2. Crowd bands: one row of ten in sample 3-p14, against two rows of five (PH-19, PH-22) | OQ-10 |
| 3. Transfer-day labels in sample 3-p16 and the build, against the brief (PH-27) | OQ-12 |
| 4. Alternating yellow and white plates on people | Removed: stale. The owner answered on 20 Oct that cards look the same before a choice |
| 5. Text over the painting: measure and keep the full-bleed poster, or move the text off | The rule is settled (M3-36 with the UA-2 test). How dark the tint must be is shown to the owner as OQ-11 |
| 6. "Lean size 18 / 100, direction hidden" on the samples' Sunday | OQ-1 |
| New: three to eight people (old PH-24) against the owner's three to five | OQ-8 |
| New: the look-again text set light on dark in sample p05 (PH-35) | OQ-2 |

## Verification notes

- **Raw pages.** Every source above was fetched as raw HTML with curl on 20 Oct 2026 and read as text. Where a page's own date is old, it is given so a reader can weigh it. The heuristics page (reviewed Jan 2024), button states (Apr 2025), neobrutalism (Apr 2025), recognition and recall (Jan 2024), onboarding tutorials (Feb 2023) and the IxDF Gestalt pages (modified 2026) are recent. The rest are standing references.
- **Video pages.** For the NN/g video pages (closure, figure and ground, continuation, common fate, Hick's law), only the page summary was available as text. The fuller descriptions come from the IxDF and Smashing pages cited alongside them.
- **UNVERIFIED** in this digest:
  - Norman's statements on feedback quality, forcing functions and the seven stages of action, from the revised edition (2013), not read in raw text;
  - the 1 cm to about 60 px conversion, which depends on device figures from memory.
- **Measurements.** Sizes and positions in Part 3 were measured from the screenshot files (yellow and white pixel runs, halved to CSS px). Word counts are approximate hand counts.
- **Rechecked after the critique (20 Oct 2026, raw):** NN/g's dark-mode article for the older-adult finding; web.dev's Interaction to Next Paint page (last updated 2 Sep 2025) as a current companion to NN/g 1993.

## Changes after critique

Applied from [../ux/critique-stage1.md](../ux/critique-stage1.md) on 20 Oct 2026.

- **Ids (should-fix 3).** Rules are PH-1 to PH-35 everywhere in the file.
- **Must-fix 4.** PH-4 loses the "art compresses" clause; art stays full-bleed under M3-36 with the UA-2 test.
- **Must-fix 3.** PH-32 no longer fixes the lean on the result; its form and place are OQ-1, with the no-side, no-tilt, no-pronoun limits kept.
- **Must-fix 6.** PH-24 states the owner's three to five people and sends the samples' exceptions to OQ-8; the stale alternating-plates trade-off is removed.
- **Must-fix 7.** PH-13 and PH-25 follow the shared step model: the not-ready commit is muted and readable, never hidden, and there is no hint text in the first build.
- **Must-fix 8 and 9.** PH-2 allows four styles (aiming for three sizes); PH-3 sends Lugdi's commit lettering to OQ-3; PH-19 uses 48 px and a 56 px commit and drops the 60 px aim; PH-4 tests at 360 x 640 and 390 x 844 and carries the 200% exception.
- **Should-fix 1.** PH-10 (no dashed streak days), PH-29 (one motion rule with named longer moments), PH-31 (back at top left, 48 px), PH-34 (streak on the cover bar and the result).
- **Should-fix 4.** The 8 px blur and the 4 px overlay tolerance are marked HOUSE.
- **Should-fix 12.** Added PH-35, a light reading surface for older readers, from the NN/g review, with its clash with sample p05 sent to the owner.
- **Should-fix 13.** NN/g 1993, 2014 (coach marks, radio defaults) and 2020 (dark mode) marked "old, owner to accept"; web.dev 2025 added beside the 1993 timing limits.
- **Should-fix 14.** The trade-offs list points to the single owner list.
