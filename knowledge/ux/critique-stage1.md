---
type: review
title: Stage 1 critique
description: Adversarial review of the Stage 1 personas, journeys and six foundation digests for Equal Lens Daily, with a numbered must-fix and should-fix list, 12 spot-checks of sourced claims against raw pages, and every contradiction between the digests that the design-system stage would otherwise inherit.
plane_issues: [https://app.plane.so/the-equal-lens/browse/EVAL-14/]
---

# Stage 1 critique: personas, journeys and foundations

**Read in full:** [personas.md](personas.md), [journeys.md](journeys.md) and the six digests in [../foundations/](../foundations/). Also read: the owner's brief, the 20 Oct blocks of the resume note, the four owner-rule memories, the three diagnosis files, and the EVAL-13 screens and approved samples (001, 003, 006, 020; samples p01, p04, p05, p10 and 3-p16 looked at directly).

## Verdict

- **The sourcing is good.** I made 12 checks against raw pages, and every figure matches. There are three slips: the base for Hoober's percentages, WebAIM's denominator, and HIG skipping two of Apple's principles (table at the end).
- **The journeys respect the owner's decisions:**
  - no sign-up wall;
  - no outside-the-game test;
  - a board ranked by practice;
  - generated handles;
  - forgiveness;
  - no timers.
- **All eight areas the owner named are covered:** HIG, Material 3, Gestalt, Nielsen's ten heuristics, UX writing, usability, accessibility and affordance.
- **Two things block Stage 2.**
  1. **The six digests contradict each other on about 25 points.** Several of these are the exact points EVAL-13 got wrong: touch size, type floor, the not-ready button, toasts, art on puzzle screens, the first screen, and the lean.
  2. **Several digest rules quietly settle a conflict between a rule and the approved look.** That is the RC3 failure the diagnosis named.
- **Coverage gaps in the personas:** they miss rural players and disabled players, and one journey has a 17-year-old playing on her mother's phone.

## Must fix before Stage 2

1. **Contrast: HIG rule 26 is looser than WCAG.**
   - The digest copied Apple's table correctly: 3:1 for text of 18 pt or more, and for any bold text (verified, S-4 below).
   - WCAG 1.4.3, which M3 rule 14 and usability rule 1 use, sets large text at 24 px, or 18.66 px bold.
   - Under HIG 26, a 17 px bold label at 3:1 passes. It fails WCAG.
   - **Fix:** HIG rule 26 adopts the WCAG thresholds, and the 7:1 house target stays for text on plates.
2. **Messages that vanish break M3's web rule and lose P3 and P5.**
   - Daily-game rules 12, 28 and 52 use toasts that go after 2 s, and they tell the player about forgiveness only once, by toast. Journeys S9 depends on this.
   - M3 says snackbars without an action auto-dismiss after 4 to 10 s. It also says to "avoid using auto-dismissing snackbars on web unless there's also inline feedback" (verified, S-10).
   - The forgiven mark is also specified by colour only (red spine, white ticket). Usability rule 4 and the measured 1.44:1 white-on-yellow contrast both reject that.
   - **Fix:**
     - every toast's message also shows in place;
     - toasts last at least 4 s, or until the next tap;
     - each message goes out as a polite status message (usability rule 25);
     - the forgiven day gets a shape and a word, not only a colour.
3. **Settle the lean once, with the owner.** The files disagree on four things.
   - **Is it shown on the day result?**
     - No: daily-game rule 22 and journeys S6.
     - Yes: perception R32, ux-writing R17 and R23, usability rule 25.
   - **Picture or number?**
     - A picture: daily-game rule 41 and HIG rule 49.
     - "Lean 22" over a 0 to 100 bar: ux-writing R26.
     - A bare number: the journeys ("Lean down from 18 to 9", "Twenty-three of what?", "a lean size of 14").
     - "18 of 100": approved samples p05 and p10.
   - **Is a horizontal bar allowed?** Perception R32 bans left and right. A bar that fills from the left may break that.
   - **Does the look-again pair show which person the player picked?** Journeys P1 S8 has her think "I picked him", which is direction for that pair.
   - **Fix:** put these to the owner as one question with three pictures. Every file then follows the answer.
4. **Art on puzzle screens: two rules rebuild the strip the owner rejected.**
   - HIG rule 3 caps the title band at 25% once play starts. HIG rule 6 allows art on a puzzle step only as a band of at least 160 px.
   - Perception R4 says the art "compresses" when content runs long.
   - All three bring back EVAL-13's 120 px strip.
   - On the other side:
     - M3 rule 36 says the painting is never shrunk, and text sits on a plate or scrim;
     - usability rule 2 sets the worst-patch contrast test;
     - approved samples p01 and p04 put full-bleed art behind the plates.
   - **Fix:** delete HIG 3 and 6 and perception's compress clause. Adopt M3 36 with the usability rule 2 test.
5. **First run and the language switch.**
   - **Rewrites for screens that should not exist.** The ux-writing rewrite table keeps a language screen (001: "English" and "हिन्दी" as two buttons) and a road-name screen (002: "Use this name"). Daily-game rules 1 to 3, HIG rule 37 and journeys S2 to S4 all say no screen comes before the cover.
   - **Four homes for the language switch:**
     - a chip in the cover's top bar (daily-game rules 2 and 17);
     - the menu after first run (ux-writing R11);
     - a settings place reached from Board or Week (HIG rule 44);
     - the "?" sheet (journeys).
   - **Fix:** delete both rewrites, and pick one home for the switch.
6. **Stop settling rule-versus-look conflicts inside the digests.** The approved samples and these rules disagree, but each file decides on its own:
   - ux-writing R31 turns the "Price ₹2" roundel into an issue number. HIG and usability list the roundel as an owner choice.
   - ux-writing R23 bans "The end", yet the same file lists it as owner question 3. Daily-game rule 22 and perception R32 keep the end band.
   - ux-writing R15 settles capitals, yet lists them as owner question 2.
   - Daily-game rule 41 bans a board on Sunday, but samples p05 and p10 both show a top-3 board.
   - Perception R24 allows 3 to 8 people per choice. The owner said 3 to 5, never two.
     - Sample p04 picks 6 of 8.
     - Samples p02 and 3-p16 show two people.
     - Journeys question 5 covers only the two-person case.
   - Perception trade-off 4 (alternating plates) is stale. The owner answered on 20 Oct that cards look the same before a choice.
   - **Fix:** turn each of these into one owner choice with two pictures, and remove the stale question.
7. **One interaction model for a puzzle step.**
   - **How the answer is committed:**
     - tapping the option is the choice: daily-game rule 13 and sample p02;
     - the commit is always a deliberate tap on the main action: HIG rule 11, M3 rule 34 and usability rule 11 (usability conflict 5 asks the owner).
   - **The not-ready main button has five specs:**
     - 38% label, not focusable: M3 rule 27;
     - label at 4.5:1 that names what is missing: HIG rule 17;
     - visible but dimmed: daily-game rule 7;
     - absent, or muted: perception R13;
     - focusable, with the reason beside it: usability rule 29 and ux-writing R12.
   - **First-time hints:**
     - none, only a ghost demonstration: daily-game rule 8;
     - at most 6 words: perception R25 and ux-writing R3;
     - at most 8 words: HIG rule 38.
   - These are the owner's most repeated complaints: "a next and another next", the answer asked twice, the dead dashed button.
   - **Fix:** write one step model:
     - when a commit is needed;
     - what a not-ready commit looks like (recommended: usability rule 29, with a readable label);
     - whether any hint text exists.
8. **One set of size numbers.**

   | Item | The values in the files |
   |---|---|
   | Touch target | 44 (HIG 8, perception R19 floor); 48 (M3 22, daily-game 48, usability 6); about 60 (perception R19 aim) |
   | Gap between targets | 8 (M3, daily-game, perception); 12 and 24 (HIG 9) |
   | Type floor | 11 decorative (M3 8); 12 (HIG 20); 14 (usability 13) |
   | Body text | 16 (M3, usability); 17 (HIG) |
   | Question | 20+ (HIG); 24 (M3) |
   | Text sizes per screen | 3 (perception R2); 4 (M3, HIG) |
   | Display face | 28 px and up (HIG 22); Devanagari 32 px and up (usability 15); Lugdi commit label in display type (perception R3), against HIG 22, usability 15 and ux-writing R39 |
   | Commit height | 52 (daily-game 48); 56 (usability 7, perception R19) |
   | Test viewports | 390 x 844 (most); plus 360 x 780 (HIG); 360 x 640 (usability 8) |

   **Recommendation:**
   - 48 px targets;
   - 8 px minimum gap, and 12 px between bordered neighbours;
   - a 14 px floor (it suits Devanagari);
   - 16 px body;
   - at most 4 styles per screen;
   - Sarpanch Devanagari at 32 px and up only;
   - a 56 px commit;
   - testing at 360 x 640, 390 x 844 and 200% text.

   The design-system stage records the final set in one table.
9. **Sunday's shape, and no-scroll against 200% text.**
   - **Sunday:**
     - one screen: daily-game rule 41;
     - under 2 viewports: M3 21, usability 8 and perception R4;
     - a short sequence of screens: HIG rule 4 and ux-writing R42.
   - **No-scroll rules:** daily-game 50, HIG 2, M3 21 and perception R4 say steps never scroll. That cannot hold at 200% text, which WCAG 1.4.4 and HIG rule 24 require. Only usability rule 16 allows scrolling there while the commit stays pinned.
   - **Fix:**
     - Sunday's shape goes to the owner, with the samples as one option;
     - copy the usability 16 exception into every no-scroll rule.
10. **Persona coverage.**
    - **No rural player.** The evidence table says 55% of internet users are rural, but no persona lives in a village. Sunita lives in a small town.
    - **No disabled player apart from ageing eyes:**
      - no screen-reader user, although the usability digest designs for TalkBack;
      - no colour-blind player (about 1 in 12 men);
      - no player with a motor or cognitive disability.
    - **P2 Ravi and P4 Aman overlap.** Both are Hindi-belt men hooked by the road name and the board, with pushback on framing against men.
    - **Fix:** sharpen or merge P2 and P4, then use the freed place for a rural player on a 2 GB-class phone. Give one existing persona a disability (for example, Aman colour-blind), or add a TalkBack user.
11. **A minor on a shared phone.**
    - P3's 17-year-old daughter borrows the phone, and journeys P3 S8 has her days mixed into Sunita's week.
    - The game is adults only until a lawyer advises on DPDP s.9 (brief).
    - **Fix:** journeys questions 3 and 9 become one designed case, and the persona must not present a minor's play as normal.

## Should fix

1. **Smaller digest conflicts. Pick one each:**
   - **Streak:** the cover bar and the result (daily-game 29), or the result and Sunday (perception R34).
   - **Counters:** "2/6" text (ux-writing R9), or marks only (daily-game 11, perception R30).
   - **Dashed empty streak day:** allowed (usability 32), or banned (perception R10, daily-game 7).
   - **Motion:**
     - at most 400 ms: perception R29 and usability 22;
     - a 1.2 s reveal: HIG 33;
     - a 1.5 s ghost demonstration and a 2 s milestone: daily-game 8 and 26.
     - Neither the ghost demonstration nor the pulse has a still version under reduced motion, which usability 21 requires.
   - **Portrait alt text:** the name (M3 46), or empty (usability 27).
   - **Way out:** back at top left (perception R31), or close in a top corner (HIG 13).
   - **Board:** reached from both a top-bar icon (daily-game 17) and a tab (M3 40, HIG 43).
   - **Undo time:** "a few seconds" (ux-writing R29), or at least 5 s (usability 12).
   - **"My" on a label:** usability 38's "Delete my notes" breaks the no-"my" rule in three other digests.
2. **Offline cache against fairness.**
   - Usability rule 40 caches the next 6 days, and HIG 40 caches the next day.
   - A future puzzle in the cache can be read and shared, which helps A1. It also gives away transfer days.
   - **Fix:** limit the cache, or encrypt it, and write down the trade.
3. **Rule ids collide.** "R31" means a different rule in four files, and the journeys cite bare "R" numbers. **Fix:** prefix ids by digest (DG-31, HIG-31, M3-31, PH-31, UXW-31, UA-31).
4. **Mark every house number as HOUSE. Unmarked today:**
   - **Daily-game:**
     - 1.5 s;
     - 2 s;
     - 52 px;
     - milestone days 3, 14 and 50;
     - re-ask after 7 days, at most twice;
     - 10 wordings, no repeat within 14 days.
   - **Usability:**
     - 60 KB per painting and 25 KB per portrait;
     - 6 days cached;
     - reopen in under 2 s.
   - **Perception:**
     - an 8 px blur (NN/g uses 5, 10 and 20);
     - a 4 px overlay tolerance.
5. **Persona sourcing slips:**
   - Unflagged times and habits:
     - Shruti's 9 am bus;
     - Sunita's 2 to 3 pm and "almost no English";
     - Farida's 7:40 pm;
     - Aman's BGMI;
     - Natarajan's reading languages.
   - "Two-thirds of gamers live outside large metros" cites S6, which the file itself marks UNVERIFIED, without the flag.
   - The comparison table gives Ravi "Android 14", which the body never says.
6. **Stereotype risk.**
   - Pew population figures are pinned to individuals as traits, for example Sunita "holds many traditional views: 86%".
   - The women are a home tailor and a nurse, and the men a shopkeeper, a bank officer and a student.
   - **Fix:**
     - break type at least once (the cast already has women truck drivers);
     - state where Dalit or Adivasi players and non-binary players stand, since caste enters later levels and road names are gendered.
7. **Missing journey moments:**
   - the first weekly skin switch (Lugdi to Station);
   - a reminder landing on a lock screen and being tapped;
   - the offline or slow state as its own stage;
   - a new phone;
   - a Hindi player meeting a third script on a Station board.
8. **The mood scores.**
   - The column is defined as "if the risk lands", yet S4 scores +1.
   - Summing invented scores to rank the moments that matter gives false precision.
   - **Fix:** show them as ordinal hypotheses.
9. **The tap-to-answer reflection is new data.** The Profile C exception covers private notes only. **Fix:** state that the answers are never stored or analysed, or ask the owner.
10. **The board rules are presented as fact.**
    - "14 days off Everyone" and "Hide me" change "one global board, all players".
    - **Fix:** make them owner questions.
11. **HIG omits two of Apple's eight principles: Responsibility and Flexibility** (verified, S-11).
    - Responsibility asks products to be "transparent about what your product does and why".
    - That bears on unannounced transfer days and the hidden direction. Put the tension to the owner.
12. **Gaps inside the named areas:**
    - game-specific accessibility guidance (for example the Game Accessibility Guidelines);
    - trauma-informed handling of dowry, custody and safety screens;
    - ethical streak and board design (loss aversion against a reflective trainer);
    - DPDP notice and consent UX in the digests (only the journeys cite it);
    - a light reading surface for older players, since perception cites NN/g on dark mode but sets no rule.
13. **Old evidence.**
    - The owner asked for recent evidence.
    - Some rules rest only on pre-2024 sources:
      - Hoober 2013;
      - NN/g 1993, 1997, 2005 and 2014;
      - W3C mobile 2015;
      - Duolingo 2017 and 2020.
    - **Fix:** find a 2024 to 2026 source for each, or mark it "old, owner to accept".
14. **Too many owner questions.**
    - There are 39 questions across 7 files, with repeats:
      - capitals, three times;
      - the price roundel, three times;
      - the transfer label, three times;
      - the board reset, three times.
    - **Fix:** make one deduplicated list in plain words, with pictures.

## Spot-checks against raw pages (curl, 20 Oct 2026)

| # | Claim (file) | Raw page says | Result |
|---|---|---|---|
| S-1 | Two Streak Freezes raised daily active learners by 0.38% (daily-game P16) | "+0.38%", relative | Correct. https://blog.duolingo.com/how-duolingo-streak-builds-habit/ |
| S-2 | 7-day streak, 3.6 times more likely to finish; animation +1.7% (P15, P12) | Both figures present | Correct. Same URL |
| S-3 | Weak signifiers cost 22% more time and 25% more fixations (perception 1.4) | Both figures present | Correct. https://www.nngroup.com/articles/flat-ui-less-attention-cause-uncertainty/ |
| S-4 | Contrast table: up to 17 pt 4.5:1; 18 pt 3:1; any bold 3:1 (HIG H16) | Same table | Quoted correctly, but looser than WCAG (must-fix 1). https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json |
| S-5 | Targets 44 x 44 pt (minimum 28); padding about 12 and 24 pt (HIG H20) | Same | Correct. Same URL |
| S-6 | 91.3% use a mobile screen reader; iOS 70.6%, Android 27.6%; Asia iOS 40%; TalkBack 34.7% (usability P26) | Same figures | Correct, with two nits: 91.3% is of the 1,511 who answered, and Asia had only 97 respondents. https://webaim.org/projects/screenreadersurvey10/ |
| S-7 | Wife must obey: 87%; men as main earners: 43% (personas) | Both present | Correct. https://www.pewresearch.org/religion/2022/03/02/gender-roles-in-the-family/ |
| S-8 | Women 86%, men 89%; men 81% on jobs when scarce (personas) | All present | Correct. https://www.pewresearch.org/short-reads/2022/03/15/in-india-and-many-other-countries-there-is-little-gap-between-men-and-women-in-attitudes-on-gender-issues/ |
| S-9 | English "language" and "level" raised onboarding completion by 1%; promotions read as a paywall (ux-writing P26, R31) | Both present | Correct. https://blog.duolingo.com/language-learning-for-the-next-billion-duolingo-in-india/ |
| S-10 | 49% one-handed, 36% cradled, 15% two hands, "in 1,333 observations" (daily-game P32) | The percentages are of the 780 people touching the screen | Base misstated; fix the wording. https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php |
| S-11 | Snackbars auto-dismiss after 4 to 10 s; on the web, not without inline feedback (M3 P27) | Same, in M3's live content file for the snackbar page | Correct, and it contradicts daily-game rules 12 and 28. https://m3.material.io/components/snackbar (content file `_dsm/content/m3/2026-10-13_06-10-19/26cf2750-80f7-43f8-a155-834aa01276df.json`) |
| S-12 | Eight design principles, reintroduced 8 June 2026 (HIG H2) | Purpose, Agency, Responsibility, Familiarity, Flexibility, Simplicity, Craft, Delight | The date is correct, but the digest skips two of the eight (should-fix 11). https://developer.apple.com/tutorials/data/design/human-interface-guidelines/design-principles.json |

**Another source slip.** Daily-game marks WCAG's 24 px target as UNVERIFIED, while personas and usability read it from W3C. Align the flag.
