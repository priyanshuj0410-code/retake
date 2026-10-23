---
type: research
title: Daily game patterns for Equal Lens Daily
description: How the best daily and casual games (LinkedIn Games, NYT Games, Duolingo, Matiks) and game UX research handle the player's journey from first open to the month arc, turned into numbered, testable rules for Equal Lens Daily, with every rule the failed EVAL-13 build broke and the screenshot that shows it.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-14/
---

# Daily game patterns for Equal Lens Daily

This digest covers stage 1 of the order the owner set on 20 Oct 2026: persona and journeys, features, information architecture and flows, design system, and only then the app. It is about the player's journey, not the look. Colour, type and the per-day objects belong in the design-system stage. The EVAL-13 design system it critiques is [../design.md](../design.md).

**How the evidence was gathered (20 Oct 2026).**
- Every source page was downloaded raw with curl and read as text. No AI page summaries were used for any claim.
- The NYT game rules and screen wording come from the strings inside the live Wordle, Connections and Strands code on nytimes.com.
- Quotes are 15 words or fewer. Everything else is paraphrased.
- **UNVERIFIED** marks a claim that could not be confirmed from raw text.

**Screens referred to.**
- Failed build: `/Users/priyanshu/equal-lens-trainer/out/trainer-shots/NNN-*.png`, cited by number (for example 003).
- Approved samples: `ls/shots/pNN.png` and `ls/shots3/pNN.png` under the session scratchpad `/private/tmp/claude-501/-Users-priyanshu-Sex-Ed/ee410a71-fd9c-4ac3-9026-09778653ea55/scratchpad/`.

**Owner rules that bind everything below.** Almost no reading (15 words on a puzzle screen, 20 elsewhere, one question of 10 words or fewer). Never shame and never leave a player without a reading. Never auto-advance. Show only the language chosen. Choices are among 3 to 5 people (where the samples break this is owner question OQ-8). Cards look the same before a choice. Single column on phone. (Sources: memory `minimal-text-ui.md`, `design-before-build.md`, scratchpad `diag-feedback.md` section 4, resume note of 20 Oct 2026.)

**After the Stage 1 critique.**
- **Ids.** Principles are DG-P1 to DG-P34 and rules DG-1 to DG-53. Other digests carry their own prefixes (HIG, M3, PH, UXW, UA), so a bare "R31" no longer means four things.
- **Shared parts.** The one step model for a puzzle step, the one set of size and timing numbers, and the settled small conflicts are in section 2.0 of [usability-and-accessibility.md](usability-and-accessibility.md). Rules here that disagreed now point there.
- **Owner questions** live in one list in [../ux/journeys.md](../ux/journeys.md) (OQ-1 to OQ-30).
- **Old evidence** (before 2024, with no newer source found) is marked "old, owner to accept". **House numbers** (our figures, not a source's) are marked HOUSE.

---

## 1. Principles

Each entry gives: what the source says (paraphrased), the source, and why it matters for a small, one-handed daily game.

### 1.1 First open, without sign-up

**DG-P1. Let people play before asking who they are.**
- **Says:**
  - Login walls before any content are among the things users hate most in testing, because the cost is certain and the value unknown.
  - Ask for an account only once the benefit is obvious (reciprocity).
- **Source:** NN/g, Login Walls Stop Users in Their Tracks, https://www.nngroup.com/articles/login-walls/ (2014; old, owner to accept; the same rule appears in the 2020 article in DG-P2).
- **Here:** a stranger arriving from a WhatsApp link must be inside today's puzzle before any setup.

**DG-P2. Skip onboarding; postpone setup; use defaults.**
- **Says:**
  - For most mobile apps, put users straight into the interface.
  - Onboarding adds interaction cost and memory strain, and tutorials did not improve task performance in NN/g tests.
  - Choosing content is fine in onboarding only when the app is useless without it; NN/g's example is picking a language in a language-learning app.
- **Sources:**
  - NN/g, Mobile-App Onboarding, https://www.nngroup.com/articles/mobile-app-onboarding/ (2020).
  - Apple HIG, Onboarding, https://developer.apple.com/design/human-interface-guidelines/onboarding. It says to postpone nonessential setup, give reasonable defaults so people can start at once, and show any splash only long enough to absorb at a glance.
- **Here:** the language is needed to read the puzzle; a road name is not. The language can default from the phone and be switched on the cover.

**DG-P3. Guests play fully; the account is offered later to save what they have.**
- **LinkedIn:**
  - Anyone can play LinkedIn games without an account.
  - A guest's score is kept for 30 minutes, and a guest has no streak, no leaderboard and no new-puzzle alerts.
  - The tip is to sign up before the score is deleted, to save it and the streak.
  - Source: LinkedIn Help, Play LinkedIn games in guest mode, https://www.linkedin.com/help/linkedin/answer/a6880616 (updated 2026).
- **NYT:**
  - Wordle and Connections offer a free account after play, to save stats, streaks and badges.
  - Wordle's pitch is that an account saves your stats on any device and protects your streak.
  - Source: the strings in the live game code at https://www.nytimes.com/games/wordle/index.html and https://www.nytimes.com/games/connections (read 20 Oct 2026).
- **Duolingo:**
  - The getting-started guide asks a few goal questions, offers reminders and a placement choice, then tells you to create a profile to save your progress.
  - Source: Duolingo 101, https://blog.duolingo.com/duolingo-101-how-to-learn-a-language-on-duolingo/ (Dec 2024).
  - **UNVERIFIED:** the exact order of today's first-run screens. The web app renders by script and could not be read raw.
- **Here:** the road name and friends need an identity, but the identity can be made silently on first play and offered as a reward on the first result.

### 1.2 Teaching through play, not instructions

**DG-P4. Learning by doing; at most three new things at once.**
- **Says:**
  - Tutorial text has no context, because players cannot try what they are told at that moment, so it is poorly remembered.
  - People learn best when active, with a goal.
  - While learning, 3 items processed at once is the maximum.
  - Teach the why rather than the how, and never more than 3 things in one place.
  - "Show the locks before giving the keys": let players meet the problem before handing them the tool.
- **Source:** Celia Hodent, The Gamer's Brain part 2: UX of Onboarding and Player Engagement (GDC 2016 transcript), https://celiahodent.com/gamers-brain-ux-onboarding/.
- **Here:** each mechanic has to be readable from its board, with no "Tap a blank, then a word" sentence.

**DG-P5. Help on pull, at the moment of need.**
- **Says:**
  - Tutorials interrupt, are often skipped and are quickly forgotten.
  - Help works when it appears in context, is easy to dismiss and to find again, skips the obvious, and needs no memorising.
- **Sources:**
  - NN/g, Onboarding Tutorials vs. Contextual Help, https://www.nngroup.com/articles/onboarding-tutorials/ (2023).
  - Apple HIG, Onboarding (URL in DG-P2): teach through interactivity, and show tips near the part of the screen they refer to.
- **Here:** how-to-play goes behind a "?" and opens only when tapped.

**DG-P6. Signifiers do the teaching; destroy false affordances.**
- **Says:**
  - What looks usable does not need teaching.
  - The visible cue for an action is a signifier.
  - A false affordance (something that looks like it does one thing but does another) misleads, frustrates and makes the right thing harder to teach.
  - Targets must be big enough and far enough apart to hit.
- **Source:** Hodent 2016 (URL in DG-P4). Her usability pillars are signs and feedback, clarity, form follows function, consistency, minimum workload, error prevention and recovery, and flexibility and accessibility, listed in Understanding the Success of Fortnite, https://celiahodent.com/understanding-the-success-of-fortnite-ux/ (2019).
- **Here:** a dashed outline that sometimes means "empty slot" and sometimes "button not ready yet" is a false affordance. So is a letter square standing in for a portrait.

**DG-P7. One-line rules, small examples, near-miss feedback.**
- **NYT:**
  - Each game's How to Play opens with one sentence, then a few bullets and examples. Wordle's opener is 6 tries for a 5-letter word; Connections' is groups of four that share something.
  - Mistakes get toasts of two to four words: "One away..." for a near miss, and others for a word not in the list or already tried.
  - Connections shows mistakes left as dots, not a sentence.
  - Source: NYT game code (URLs in DG-P3).
- **LinkedIn:**
  - Each game's rules fit in 2 to 4 bullets.
  - A Hint button points to where a piece must go (Queens), or rubs out the path back to the first mistake and shows the next correct step (Zip). Undo is always there.
  - Sources: https://www.linkedin.com/help/linkedin/answer/a6269510 and https://www.linkedin.com/help/linkedin/answer/a7445030.
- **Here:** status is shown as marks (punch holes, dots), and feedback is a toast of a few words.

**DG-P8. Help is earned through play.**
- **Says:** in Strands, every 3 non-theme words you find earn one hint.
- **Source:** NYT Strands code, https://www.nytimes.com/games/strands.
- **Here:** if Equal Lens ever gives help, it should come from playing, never be bought or simply handed out.

### 1.3 The daily ritual and the home screen

**DG-P9. One puzzle a day, the same for everyone, and yesterday's is gone.**
- **LinkedIn:**
  - Each game is playable once a day.
  - A new puzzle arrives at midnight Pacific Time, and the previous one expires and can no longer be played.
  - Sources: https://www.linkedin.com/help/linkedin/answer/a6863543 and https://www.linkedin.com/news/story/linkedin-news-introduces-games-6715874/ (Apr 2024).
- **NYT:** a lost Wordle ends on "Tomorrow's a new day, with a new puzzle. See you then." (NYT game code.)
- **Here:** scarcity makes the ritual, and a shared puzzle makes the board and sharing fair.

**DG-P10. The opening screen is one line and one button, and the button follows the state.**
- **Wordle's welcome screen** carries:
  - the game's name and one line of rules;
  - one main button reading Play, Continue or Admire puzzle, depending on progress;
  - the date, the puzzle number and the editor's name;
  - for a returning player, a greeting and a line inviting them to add another day to the streak.
  - Source: NYT game code.
- **NYT Games app redesign (2024):**
  - game cards that show your progress, so you see at a glance what you have played;
  - 3 tabs (Games, Stats, Leaderboard), down from 5 after testing;
  - greetings that change with the time of day.
  - Source: TechCrunch, https://techcrunch.com/2024/03/07/nyt-games-redesigned-app-boost-discovery-simplify-navigation/.
- **Here:** Equal Lens has one puzzle, so the day's cover is the home. Its button says what happens next.

**DG-P11. The streak is visible where the day starts and where it ends.**
- **LinkedIn:** your streak shows on the game's launch page and on the results page. (https://www.linkedin.com/help/linkedin/answer/a6863543)
- **Duolingo:** the streak sits on the home screen's top bar. (https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/, 2017; old, owner to accept)
- **Here:** two places are enough. Repeating it on every screen is noise.

### 1.4 The result and the share moment

**DG-P12. The result is the reward; make it feel good, and make losing soft.**
- **Duolingo:**
  - A new animation on the screen after a streak extension, with a bigger one on milestone days, raised the share of brand-new learners still active 7 days later by 1.7%.
  - The milestones named are one week, one month, 100 days and one year.
  - Sources: https://blog.duolingo.com/how-duolingo-streak-builds-habit/ (2022) and https://blog.duolingo.com/streak-milestone-design-animation/ (2022).
- **NYT:** a win gets a short congratulation and a link to your progress. A loss gets the same tomorrow line as in DG-P9, with no verdict. (NYT game code.)
- **Here:** the owner rejected a "Not enough to tell" result as "discouraging and terminal". A result is always a reading, and always points to tomorrow.

**DG-P13. Sharing is one tap, spoiler-free and recognisable.**
- **Wordle:** the share text is the puzzle number, the score out of 6 and a grid of coloured squares with no letters. High-contrast mode swaps the colours.
- **Connections:** the share text is the puzzle number and a grid in the four difficulty colours.
- Both have one share button at the end, and both confirm with a toast that the results were copied. (NYT game code.)
- **Duolingo:** a share card for streak milestones, saved or posted without leaving the app. (https://blog.duolingo.com/streak-milestone-design-animation/)
- **Web Share API:** the phone's share sheet can only be opened from a tap or other user action. (MDN, https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
- **Here:** a share must spread the game without spoiling the puzzle or exposing the player's lean.

**DG-P14. Results compare you with people you care about.**
- **Says:**
  - LinkedIn's results page compares your score with the average for all members, for your company and for CEOs.
  - It shows your streak, a connections leaderboard and a daily discussion post, and suggests other games you have not played today.
- **Source:** https://www.linkedin.com/help/linkedin/answer/a7445030.
- **Here:** comparing with friends motivates. Comparing the size of a lean is risky (see DG-31).

### 1.5 Streak and forgiveness

**DG-P15. The streak works differently by length, and early days matter most.**
- **Says:**
  - Going from 2 to 3 days is a 50% jump, so new streaks should feel big.
  - Long streaks keep people through loss aversion.
  - Losing a streak can demotivate, and fear of losing one can stop people starting.
  - Learners who reach 7 days are 3.6 times more likely to finish their course.
- **Source:** Duolingo, The habit-building research behind your Duolingo streak, https://blog.duolingo.com/how-duolingo-streak-builds-habit/ (2022).
- **Here:** days 1 to 7 deserve the most celebration. A first visit should never show an empty, failure-looking strip.

**DG-P16. Built-in slack keeps people going.**
- **Streak Freeze:**
  - Duolingo cites research that a little slack motivates more than rigid rules.
  - Letting learners hold up to 2 Streak Freezes raised daily active learners by 0.38% (a relative rise; checked raw in the critique, S-1).
  - Source: Duolingo 2022 (URL in DG-P15).
- **Weekend Amulet (2017 test; old, owner to accept):**
  - Learners offered a weekend pass were 4% more likely to return a week later, and 5% less likely to lose their streak.
  - Learners who binged were more likely to quit than those who paced themselves.
  - Source: https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/ (2017).
- **Here:** the owner's rule of one forgiven day a week is the same idea. It should be automatic, and visible only when it happens.

**DG-P17. Shared commitment beats solo commitment.**
- **Says:**
  - Duolingo's Friend Streak lets you keep a separate streak with each of up to 5 friends, and the friend must accept.
  - Learners with at least one are 22% more likely to do their daily lesson.
  - You can nudge a friend who has not played.
- **Sources:** https://blog.duolingo.com/friend-streak/ (Aug 2024) and https://blog.duolingo.com/product-lessons-friend-streak/ (Sep 2024).
- **Here:** a later feature to consider (a seedling, not a rule now).

### 1.6 Leaderboards and friends

**DG-P18. Compete in small, fair groups that reset.**
- **Says:**
  - Duolingo leagues start fresh every Sunday.
  - You are matched with people of similar study habits in a similar time zone.
  - There are 10 tiers, raised from 5 to make the top feel bigger.
  - You can leave the leaderboard by making your profile private.
- **Source:** https://blog.duolingo.com/duolingo-leagues-leaderboards/ (May 2023).
- **Here:** one global board by practice is the owner's decision. What it shows first, and whether it resets, is still design.

**DG-P19. Friends first.**
- **LinkedIn:** each game has a connections leaderboard, and company and school boards show only the top 50. (https://www.linkedin.com/help/linkedin/answer/a6863543)
- **NYT:** the Games app has a Leaderboard tab. (TechCrunch 2024, URL in DG-P10)
- **Duolingo:** friends were added to its leaderboards in 2025. (https://blog.duolingo.com/product-highlights/, Dec 2025)
- **Here:** your rank among 40,000 strangers means little. Your place among five friends means a lot.

**DG-P20. Rank on the behaviour you want, and make it hard to farm.**
- **Says:**
  - Duolingo found that grinding XP on short, easy sessions skewed its leaderboards and felt unfair.
  - It changed rewards so that they match effort and learning.
  - It moved its monthly challenge from XP to quests, so people return daily instead of cramming at month end.
- **Source:** Duolingo, Time Spent Learning Well, https://blog.duolingo.com/time-spent-learning-well/ (Jun 2024).
- **Here:** ranking by practice is safe only if practice cannot be farmed. One scored puzzle a day caps it.

### 1.7 Notifications

**DG-P21. Earn the right to notify; say what you will send; no bursts; easy off.**
- **NN/g** lists five mistakes:
  - asking at first launch;
  - not saying what notifications will contain;
  - sending them in bursts;
  - sending irrelevant ones;
  - hiding the off switch.
  - Its good example is a game that asks only after the player first levels up.
  - Source: NN/g, Five Mistakes in Designing Mobile Push Notifications, https://www.nngroup.com/articles/push-notification/ (2018).
- **Apple HIG:**
  - represent urgency honestly;
  - never send marketing without explicit opt-in;
  - let people change the choice inside the app.
  - Source: Managing notifications, https://developer.apple.com/design/human-interface-guidelines/managing-notifications.

**DG-P22. Ask in context, with your own soft ask first.**
- **web.dev:**
  - Ask when the benefit is obvious, right after the user has put something in.
  - Show your own dialog first, and call the browser prompt only on a yes. A blocked permission cannot be asked again by the site.
  - Never ask on page load.
  - Source: Permission UX, https://web.dev/articles/push-notifications-permissions-ux.
- **WebKit:**
  - On iPhone, web push works only for web apps added to the Home Screen.
  - The request must come from a tap.
  - Source: Web Push for Web Apps on iOS and iPadOS, https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/ (16 Feb 2023).
- **Here:** a PWA reminder needs two steps on iPhone (add to the Home Screen, then allow), and both must come after the player has had value.

**DG-P23. Reminders wear out; rotate them.**
- **Duolingo:**
  - New notification wording works best at first and then fades.
  - Its system therefore demotes wording a learner saw recently, spacing repeats on a forgetting curve.
  - Messages are personalised by language and streak.
  - Source: How the Duolingo Owl Decides What Notification To Send, https://blog.duolingo.com/hi-its-duo-the-ai-behind-the-meme/ (2020; old, owner to accept).
- **LinkedIn:** offers alerts for a new puzzle, reminders to play or finish, and notices when connections finish, all optional. (https://www.linkedin.com/help/linkedin/answer/a6863543)

### 1.8 The week and month arc

**DG-P24. A week that resets and a month that accumulates.**
- **Duolingo:**
  - Leagues reset every Sunday (DG-P18).
  - Streak milestones mark a week, a month, 100 days and a year (DG-P12).
  - Monthly challenges reward daily return rather than bulk (DG-P20).
- **Approved samples:** each Sunday shows practice, lean size ("18 of 100, direction hidden"), one look back with a note button, a top-3 board of all players with the player's own row, a strip of day marks ("Platform tickets this month" in p10), and Share and Add a friend, all on one screen (ls/shots p05, p10).
- **Here:** Sunday is the week's payoff; the month is a strip that fills.

**DG-P25. Depth comes from short, mid and long goals, and from needs being met.**
- **Says:**
  - Long engagement needs goals at several time scales.
  - Intrinsic motivation grows when a game meets three needs: competence (a sense of progress), autonomy (choice and self-expression) and relatedness (other people).
- **Sources:** Hodent 2016 (URL in DG-P4) and Hodent 2019 (URL in DG-P6).
- **Here:**
  - **Competence:** the lean shrinking over weeks.
  - **Autonomy:** the rule the player locks first.
  - **Relatedness:** friends by road name.

### 1.9 Difficulty curves

**DG-P26. Monday easy, harder through the week.**
- **NYT:** the Monday crossword is the easiest, and the puzzles get harder as the week goes on; newcomers are told to master Mondays first. (NYT, How to Solve a Crossword, https://www.nytimes.com/guides/crosswords/how-to-solve-a-crossword-puzzle, 2025)
- **LinkedIn:** fan coverage reports the same weekly ramp. **UNVERIFIED:** LinkedIn has not said so in any page read.

**DG-P27. A ramp inside each puzzle, revealed as you go.**
- **Says:**
  - Every Connections puzzle has groups of rising difficulty: yellow, green, blue, purple for four groups.
  - Each group's colour is revealed only once it is solved.
- **Source:** NYT Connections code.
- **Here:** a puzzle can open on a clear case and end on a muddled one.

**DG-P28. Flow: never too easy, never too hard, with rhythm.**
- **Hodent:** game flow means challenge that matches skill, and pacing that alternates intense and calmer moments. Onboarding is part of flow. (Hodent 2019, URL in DG-P6)
- **Matiks** (a Bengaluru maths game, founded 2024): it claims to adapt to the player's skill so each challenge stays fresh and fair. Its listing names live duels, daily workouts and global leaderboards. (Google Play, https://play.google.com/store/apps/details?id=com.matiks.app, updated 18 Oct 2026; Inc42, https://inc42.com/buzz/matiks-raises-3-1-mn-to-scale-maths-based-gaming-platform/, 2025; Entrepreneur India, https://india.entrepreneur.com/en-in/news-and-trends/math-gaming-startup-matiks-raises-usd-31-mn-funding/496397, for Bengaluru)
- **UNVERIFIED:** how Matiks adapts, or how its daily mode works. Only the listing text could be read.

### 1.10 Keeping each day fresh

**DG-P29. Repeat the skill, change the context.**
- **Says:**
  - Repetition is needed against forgetting, but spaced rather than at fixed intervals.
  - It should come in changing contexts (still targets, then moving, then partly hidden), which makes learning stick and carry over.
- **Source:** Hodent 2016 (URL in DG-P4).
- **Here:** this is the case for folded tricks and for unannounced transfer days.

**DG-P30. Novelty fades, so rotate, and sign the work.**
- **Says:**
  - Novelty wears off (DG-P23).
  - NYT credits the named constructor and editor on its launch screens, so each day reads as made by someone.
- **Source:** NYT Wordle and Strands code.
- **Here:** the owner's worst complaint is that things feel AI-made. A daily maker's mark (owner decides) is one cheap signal of human craft.

**DG-P31. Fixed grammar, changing object.**
- **Says:**
  - The approved samples keep one title face, one meaning per colour and the main button always at the bottom.
  - What changes each day is the object: poster, chart, ticket, departure board, PNR slip.
- **Sources:** scratchpad `diag-synthesis.md` headline, and ls/shots p01 to p10.
- **Here:** this is how a daily game avoids being "repetitive, mundane or boring" without being inconsistent.

### 1.11 One hand, one phone

**DG-P32. Design for the thumb, but not only the thumb.**
- **Says:** Hoober's team made 1,333 street observations; 780 of those people were touching the screen. Of those 780, 49% held the phone one-handed, 36% cradled it and 15% used two hands. (Base corrected after the critique, S-10, and rechecked against the raw page.)
- **Source:** Steven Hoober, How Do Users Really Hold Mobile Devices?, https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php (2013; old, owner to accept; no newer raw source was found).
- **Minimum target sizes:**
  - WCAG 2.2 (2.5.8): at least 24 x 24 CSS px, the legal floor, read from W3C for the usability digest (UA-P4).
  - Apple: a button's hit region is at least 44 x 44 pt (HIG Buttons, https://developer.apple.com/design/human-interface-guidelines/buttons).
  - Android: touch targets are at least 48 x 48 dp (https://developer.android.com/guide/topics/ui/accessibility/apps).
  - This product uses 48 CSS px (usability digest, section 2.0b).

**DG-P33. Feedback inside a tenth of a second.**
- **Says:** about 0.1 s feels instant, and about 1 s keeps the train of thought. Google's current measure of how fast a page answers a tap rates 200 ms or less as good and more than 500 ms as poor.
- **Sources:** NN/g, Response Times: The 3 Important Limits, https://www.nngroup.com/articles/response-times-3-important-limits/ (1993; old, owner to accept); web.dev, Interaction to Next Paint, https://web.dev/articles/inp (last updated 2 Sep 2025, read raw).

### 1.12 Pressure and fairness (added after the critique)

**DG-P34. Streaks and boards can push people in ways that work against reflection.**
- **Says:**
  - Fear of losing a streak can stop people starting, and losing one can demotivate (Duolingo, DG-P15).
  - "Confirmshaming" works by stirring guilt or shame to steer a choice, often through opt-out labels that belittle the person saying no. "Nagging" is a stream of interruptions asking for something the person did not want, which taxes their time and attention.
  - India's consumer regulator issued guidelines on such "dark patterns" in 2023, naming confirm shaming and nagging among them. Their text could not be read as raw text this session (UNVERIFIED).
- **Sources:** Deceptive Patterns, Confirmshaming, https://www.deceptive.design/types/confirmshaming, and Nagging, https://www.deceptive.design/types/nagging (read raw, 20 Oct 2026; undated in their text).
- **Here:** the owner's goal is reflection that leads to change, not engagement for its own sake. A streak that scares and a board that shames would teach players to protect a number rather than to look at their choices. DG-53 turns this into a rule.

---

## 2. Rules for Equal Lens Daily

Each rule can be checked on a phone at 360 x 640 and 390 x 844 CSS px, each also at 200% text (the test sizes in the usability digest, section 2.0b), or in the code. The DG-P numbers show where each rule comes from. Where a rule needs an owner decision, it names the owner question (OQ) in [../ux/journeys.md](../ux/journeys.md).

### First open

**DG-1. Straight to the puzzle.**
- From the shared link, a first-time player reaches a tappable part of today's puzzle in 2 taps or fewer: the cover's Play, then the board.
- No screen comes before the cover. (DG-P1, DG-P2)

**DG-2. Language is a chip, not a step.**
- The language defaults from the phone: Hindi if the phone is set to Hindi, otherwise English. Whether a shared link opens in the sender's language is OQ-16.
- The cover's top bar carries a small chip showing both options with the current one marked ("EN | हिं"), at icon size, never a full-width button. This chip is the switch's only home; it is not repeated in the "?" sheet or anywhere else (settled after the critique).
- Switching keeps progress, and only the chosen language appears anywhere. (DG-P2)

**DG-3. The road name is a reward, not a form.**
- It is generated silently on first play.
- It is revealed on the first result in one line (for example "You drive as Ghat Ka Jugnu").
- One text button, "Change", opens a sheet with 3 alternatives. Later it can be changed in the "?" sheet. (DG-P1, DG-P3)

**DG-4. No account before day 3.** If accounts or sync are ever added, they are offered on a result screen from the third completed day, framed as keeping the streak on any phone. Whether accounts exist at all is part of OQ-18. (DG-P3)

**DG-5. No notices in the flow.**
- Draft, sample and prototype notices live behind one "i" chip in the top bar.
- The brand name appears at most once per screen and is never repeated as a tagline. (owner rule, DG-P2)

### Teaching through play

**DG-6. One question per puzzle screen.**
- It has 10 words or fewer and is said once. It is never restated as a label, a blurb or a second heading.
- The whole screen stays within 15 words, not counting names, numbers and quotes. (DG-P4, owner rule)

**DG-7. The board shows the next move.**
- The next action is shown by the interface: empty slots, a target that pulses (at most 3 pulses, then still; a static ring under reduced motion), and the main button.
- The not-ready main button follows the step model (usability digest, 2.0a, point 3): in its place, same shape, muted fill, a label at 4.5:1 naming what is missing, focusable. It is never a dashed outline.
- A dashed outline means one thing only: an empty slot to fill in the puzzle. (DG-P6)

**DG-8. A mechanic's first day gets one ghost demonstration, on the real board.**
- A finger or dot moves through the gesture once, in 1.5 s or less (HOUSE). A tap skips it.
- Under reduced motion, a still drawing of the gesture on its target is shown once instead.
- There is no instruction sentence and no card. Hint text follows the step model: none in the first build.
- From the second appearance onwards there is no demonstration. (DG-P4, DG-P5)

**DG-9. At most 3 new things on a screen, on a mechanic's first day.**
- At most 1 new mechanic per week.
- A new trick (a level) never arrives on the same day as a new mechanic. (DG-P4)

**DG-10. How to play is behind a "?".**
- The "?" sits in the top bar on every puzzle, in the same corner.
- Its sheet opens on at most 3 picture steps of 8 words or fewer each. Below them sit reminders, road name, privacy and delete (the one settings place, usability digest 2.0c).
- It never opens by itself, not even on a mechanic's first day; DG-8 does the teaching. (DG-P5, DG-P7)

**DG-11. Status is marks, not sentences.**
- Checks left are punch holes. Items left are a filling column or the height of the card stack.
- Banned: "Checks left: 3", "Line 1 of 8", "Part 1 of 2", "0 of 6 picked", and "2/6" counters (settled after the critique).
- TalkBack hears each change as words, as a polite status message (UA-25). (DG-P7)

**DG-12. Every tap answers within 100 ms.**
- The answer is a selected state.
- An invalid or near-miss move shows where it happened: the refused row shakes once and a reason of 4 words or fewer sits beside it until the next tap.
- If a toast carries the same words, it stays at least 4 s, then goes on the next tap or at 10 s, and is announced as a polite status message (usability digest, 2.0b). (DG-P7, DG-P33)

**DG-13. The answer is given once.** This follows the step model (usability digest, 2.0a).
- Tapping a person or an option selects it. One main button at the bottom, labelled with the object's verb ("Punch 2 tickets", "Send the team"), commits it and moves on in the same tap.
- Never cards, then a row of name buttons, then a confirm button.
- Approved samples ls/shots p02 and p07 make the name buttons themselves the commit. Whether a one-pick step may work that way is OQ-9. (DG-P6)

**DG-14. Cards look identical before a choice** (owner answer, 20 Oct 2026).
- A choice adds a mark (a check badge and a thicker ink edge). It never turns a card black, dashed or faded.
- The unchosen cards stay exactly as they were. (DG-P6)

**DG-15. No false affordances.**
- Nothing looks like a person unless it is one: no letter squares and no avatar for "Neither".
- A missing portrait is a drawn silhouette in the week's style.
- "Neither" is a plain button under the cards. (DG-P6)

**DG-16. Undo is free until the lock.**
- Every placement can be undone until the player locks.
- The lock is the only step that cannot be undone, and nothing advances by itself after it (owner rule). (DG-P7)

### The daily ritual and the cover

**DG-17. The cover is the home.**
- It holds: a kicker (series, number, weekday), the title, one line of 12 words or fewer, the painting full-bleed behind the text, and one main button pinned at the bottom.
- Text over the painting sits on a plate or tint that passes the worst-patch test (UA-2); the painting is never shrunk to make room (M3-36).
- Its top bar holds: streak (left); language chip and "?" (right). Nothing else. The board is reached from the Board tab, not from a top-bar icon (settled after the critique).
- No label-and-value rows (Road name, Practice) on the cover. (DG-P10, DG-P31)

**DG-18. The button follows the state.**
- The cover's main button reads: Play (not started), Continue (part-way), See today (done).
- When done, one line under it gives the time to the next puzzle ("Next puzzle in 6 h"). (DG-P10)

**DG-19. One release time for everyone, written down in code.**
- The proposal is 00:00 India time, since the audience is India first. LinkedIn uses one global time, midnight Pacific. When a day ends is OQ-15.
- Past days cannot be played for practice points. Whether past days can be replayed for nothing is OQ-20. (DG-P9, DG-P20)

**DG-20. The session fits the brief.** The median time from Play to the result is 5 to 7 minutes, and the result can be read in under 10 s. (brief)

**DG-21. Bottom navigation has 3 tabs** (Today, Board, Week), as the NYT app chose after testing. It is the only route to the board. It is hidden while a puzzle is in progress. (DG-P10)

### The result and the share

**DG-22. The result fits one screen at both test sizes, in this order:**
1. the day's object, finished (the poster, with its end band if the owner keeps it, OQ-4; the punched ticket), with the painting;
2. one large number: today's score, with consistency and practice as two small figures under it and no "=" or "+" sums;
3. one line of 10 words or fewer saying what it means;
4. the streak as a count plus this week's 7 marks;
5. Share (main) and Board (secondary), side by side;
6. a one-line tease of tomorrow, which never names a transfer day.

Whether the size of the lean also shows here, or only on Sunday, is part of OQ-1. At 200% text the result may scroll, with Share pinned (UA-16). (DG-P12, DG-P13, DG-P14)

**DG-23. A soft line, never a verdict.**
- Every result carries a reading (owner rule). An inconsistent day ends on a soft line that points to tomorrow.
- Banned: "Not enough to tell", "No score today", and anything that names the player's direction. (DG-P12)

**DG-24. The share card never shows the lean or the answers.**
- The share is an image in the week's style (a Lugdi mini-poster, a Station ticket).
- It shows the puzzle number, road name, streak and a row of neutral marks for the steps played. It never shows the lean, the people picked, the answers or the day's topic.
- The text version carries the same, plus the link. (DG-P13)

**DG-25. Share opens the phone's share sheet from the tap.**
- Where that is not available, it copies, the button itself reads "Copied" until the next tap, and a 1 to 3 word toast says the same for at least 4 s (usability digest, 2.0b).
- The share button is never more than one tap from the result. (DG-P13)

**DG-26. Milestones are celebrated.**
- A streak milestone plays an animation of 2 s or less (HOUSE) that a tap can skip, with sound off by default. Under reduced motion it is a still stamp.
- Milestone days are 7, 30, 100 and 365, as Duolingo marks them, plus 3, 14 and 50 (HOUSE).
- Days 1 to 7 count up visibly on the result. (DG-P12, DG-P15)

### Streak and forgiveness

**DG-27. What the streak counts.**
- It counts days with a finished puzzle.
- One missed day per ISO week is forgiven automatically, with no purchase and no currency. The engine already does this (`src/engine/streak.ts`).
- Whether opening the Sunday week counts as Sunday's play is OQ-21. (DG-P16)

**DG-28. Forgiveness is clear, and never by colour alone.**
- The forgiven day is drawn as its own mark with its own shape (for example a stamped circle) and a one-word label ("off"), as well as its skin colour (the red spine in Lugdi, the white ticket in Station). White on yellow is only 1.44:1 (usability digest, finding on UA-4), so colour alone fails.
- The first time it happens, the next open shows one line of 6 words or fewer in place, under the streak in the cover's top bar ("Tuesday off. Streak kept."), until the player taps Play. A toast may carry the same words: at least 4 s, then gone on the next tap, and announced as a polite status message.
- The sentence "One missed day a week is forgiven" never sits on a screen permanently. It is in the "?" sheet. (DG-P16)

**DG-29. The streak appears in exactly 2 places:** the cover's top bar (a small count) and the result (this week's marks). Sunday's day objects show the week; they are not a third streak strip (settled after the critique). (DG-P11)

**DG-30. No empty strip on day 1.**
- A first visit shows no zero streak and no row of empty days. Days not yet played are never drawn dashed. The streak first appears on the first result, as "Day 1".
- After a break, the count restarts without comment, and the best streak is kept and shown in Week. (DG-P15; NYT stats keep a best streak beside the current one)

### Leaderboards and friends

**DG-31. The board opens on Friends.**
- Friends: every friend, ranked by practice.
- Everyone: your band ("Top 9%"), you with 2 road names above and 2 below, and the top 3.
- Banned: a 10-row table plus your row, or a raw rank (like "1,961") as the headline.
- The lean is never ranked or shown on any board. (DG-P18, DG-P19)

**DG-32. Practice is capped at one scored puzzle a day.** Replays and past days earn nothing, so the board rewards showing up, not grinding. (DG-P20)

**DG-33. Whether the board resets each week is OQ-22.**
- The proposal is a weekly ranking of practice, with all-time practice as a small figure, so newcomers can reach the top of a week.
- The owner's decision ("one global board, by practice") stands either way. (DG-P18)

**DG-34. Adding and removing friends.**
- Adding is one field with road-name suggestions. Results are rows with a small "Add" at the right edge.
- Removing a friend lives in that friend's row menu, with Undo for at least 5 s.
- Banned: full-width "Add X" bars and full-width "Remove X" buttons. (DG-P19)

**DG-35. Road names only on the board.**
- No real name, photo, place or contact detail appears on any board.
- A "Hide me from Everyone" switch (the equivalent of Duolingo's opt-out), and the research's proposal to keep new players off Everyone for their first 14 days, both change "one global board, all players". Both are OQ-23. (DG-P18)

### Notifications

**DG-36. Never ask on first open.**
- The first offer comes on the result of the second completed day, as the app's own one-line ask with "Remind me" and "Not now".
- The phone's permission prompt appears only after "Remind me".
- After "Not now", ask again no sooner than 7 days later, and at most twice in total (both HOUSE). (DG-P21, DG-P22)

**DG-37. On iPhone, the add-to-Home-Screen offer comes first,** on the result of day 2 or 3, and the reminder offer only after the app is on the Home Screen. (DG-P22)

**DG-38. At most one reminder a day,** at the time the player chooses (proposed default: one hour before their usual play time). None if they have already played. No bursts, and no notices about friends' activity in the first version. (DG-P21)

**DG-39. Reminder wording.**
- Reminders are 10 words or fewer and name the day's object, never the score, the lean or the day's topic (for example "Tonight: one seat left at the Tatkal counter").
- Each skin has at least 10 wordings, and none repeats within 14 days (both HOUSE).
- No guilt, no threats to the streak, no marketing. (DG-P21, DG-P23, DG-P34)

**DG-40. Turning reminders off** (and changing their time) takes one tap from the "?" sheet inside the app. (DG-P21)

### The week and the month

**DG-41. Sunday's shape is owner question OQ-2.** The choices are: one screen as in samples ls/shots p05 and p10, with a top-3 board; the same screen without the board; or a short sequence of screens. Whichever shape is chosen:
- the 6 days show as small objects with played, forgiven or missed marks;
- practice shows;
- the lean shows in the form OQ-1 decides, with no direction;
- one "look again" pair shows;
- a "Write a note" button opens a sheet;
- Share and Add a friend are there;
- there are no breakdown rows and no open text box on the page. (DG-P24)

**DG-42. The month is a strip of 28 marks** (as "Platform tickets this month" in ls/shots p10), reachable from Week. One special day a month (a festival puzzle) gets its own mark. (DG-P24)

**DG-43. Variety within the week.**
- No mechanic appears twice in one week.
- No two days in a week share an object.
- A scenario type returns in a new life area, never the same one. (DG-P29, DG-P31)

### Difficulty

**DG-44. Weekly shape.** Monday is the easiest and Saturday the hardest; Sunday is reflection. (DG-P26)

**DG-45. Across weeks the floor rises.** Each weekday is at least as hard as the same weekday the week before, until the ladder's top. A new mechanic first appears on a Monday or Tuesday. (DG-P26, DG-P28)

**DG-46. No raw ladder number on the puzzle screen.**
- If difficulty is shown, it is a mark of 1 to 6 for the weekday.
- Whether the day's trick is named on the cover (the approved samples name it, for example "Level 4 · Loaded words"), only after the result, or never, is OQ-13. (DG-P26, DG-P27)

**DG-47. Transfer days look exactly like any other day,** unless the owner decides otherwise (OQ-12):
- the same kicker pattern and the same difficulty mark;
- a score shown as usual;
- no "Transfer day", "A new kind of puzzle", "No score today" or "counts quietly";
- and the day before, a tomorrow tease that does not name it.

The brief says these days are unannounced, but the approved sample ls/shots3 p16 announces one. How open the game should be about what it hides is OQ-14. (DG-P29)

### One hand and layout

**DG-48. Targets and the main button** (the shared numbers, usability digest 2.0b).
- Every target is at least 48 x 48 CSS px, with at least 8 px between targets and 12 px between neighbours that both have a visible edge.
- The main button spans the width less 16 px gutters, is 56 px tall, and sits 16 to 24 px above the bottom safe area (the samples use 22 px). (DG-P32)

**DG-49. What playing needs sits in the bottom two thirds.** The top bar holds only rare actions ("?", language chip, streak). (DG-P32)

**DG-50. No scrolling where it matters.**
- Every puzzle, cover and result screen fits 360 x 640 and 390 x 844 without scrolling.
- At 200% text a screen may scroll, but the main button stays pinned and reachable (UA-16).
- The Board may scroll at most once. Sunday follows OQ-2. (DG-P24, DG-P31)

### Copy patterns

**DG-51. Main-button labels are 1 to 3 words: a verb plus the object** ("Lock the rule", "Punch 2 tickets", "Send the team"). "Confirm my choice", "Submit" and "Next" are banned. (DG-P6, samples)

**DG-52. Toasts are 4 words or fewer; end lines 10 words or fewer.** Every toast's words also show in place, and a toast stays at least 4 s (usability digest, 2.0b). Wording is warm and plain, and it is never the research's vocabulary (consistency forms, levels, transfer, lean direction). (DG-P7, DG-P12, owner rule)

### Pressure (added after the critique)

**DG-53. No pressure tricks on the streak or the board.** (DG-P34)
- No countdown to losing a streak, and no "your streak ends tonight" warnings, in the app or in reminders.
- No confirmshaming: "Not now", "Hide me" and leaving are worded as plainly as yes ("Not now", never "No, I don't care about my streak").
- No nagging: at most the one reminder a day (DG-38), the reminder offer at most twice (DG-36), and no repeated install or share prompts.
- No rank-drop notices, no "X overtook you" messages, and no bottom list on any board.
- *Test:* read every string about the streak, the board, reminders and leaving; none uses fear, guilt or urgency.

---

## 3. Broken in the EVAL-13 build

Screens are in `/Users/priyanshu/equal-lens-trainer/out/trainer-shots/`. "Per diag" marks a finding taken from scratchpad `diag-screens.md` for a screen not reopened here.

| DG rule | Screens | What is wrong |
|---|---|---|
| 1 | 001, 002, 003, 004 | Three screens and three taps (English, This is me, Play) before the first puzzle element appears. |
| 2 | 001; 003, 007, 023, 027, 029, 055 | Language is a whole first screen (001). Then every cover carries a full-width "भाषा: हिन्दी" button, as heavy as Play. |
| 3 | 002, 003 | The road name is a form before play. "Pick your road name" appears twice (title and label) above five stacked bars. 002 selects "Junction Ka Jugnu 44" but 003 shows "Ghat Ka Jugnu" (check whether the capture script seeded it). |
| 5 | 001; 028, 056, 057; 034 | Notices in the flow: "The Hindi is a draft.", "Sample board: the other players are made up for this prototype." and "Sample crowd ... Made up for this prototype." On 001 the brand appears twice, plus a tagline. |
| 6 | 004, 016, 020, 032 | The question is stated more than once, or is too long. 004: the blurb, the question and "First, lock a rule" all say it. 016: "Fill both notes from the same words." plus "Tap a blank, then a word. Each word fits either note." 020: two sentences of instructions, then a second question. 032: a 14-word question. |
| 7 | 004, 008, 012, 016, 030, 036, 059 | The not-ready main button is a dashed empty box. On 004 two of them are stacked, so the screen ends in two things that look like empty slots. |
| 8 | 016, 020; 048 per diag | Instruction sentences ("Tap a person to call their referee", "Tap a ticket to punch it") take the place of a demonstration. |
| 11 | 008, 009, 020, 030, 032 | Status as sentences: "Line 1 of 8", "Line 8 of 8" in a dashed box, "Checks left: 3" at the same size as the question, "Part 1 of 2". The sample uses punch holes (ls/shots p08). |
| 13 | 012, 013, 020 | The answer is asked twice. 020: cards, then a "Who keeps the cash box?" row of name buttons. 012 and 013: cards, then "Confirm my choice". The samples make the name buttons the action (ls/shots p02, p07). |
| 14 | 013; 021, 025, 049, 053 per diag | The chosen card turns black and the rest go dashed, so a finished screen looks switched off. |
| 15 | 036; 031, 048, 049, 061 per diag | "Neither: both show ID" has an "N" avatar that fakes a person. Letter squares ("J", "F", "फ") stand in for portraits. |
| 17 | 003, 007, 023, 027, 029, 055 (all 14 covers per diag) | The cover is a settings hub: rows for Road name, Practice and Streak, a strip of 14 boxes, a sentence and a language button. Play floats mid-screen (about 41% down on 003), and the painting is a 120 px strip. |
| 22 | 006, 010, 034, 038 | Results are a calculator: "110 Score = 100 Consistency + 10 Practice", label-and-value rows, a 14-box strip and a sentence. They have no painting, no object, no Share, and two stacked full-width buttons, and about a third of 006 is empty below them. |
| 23 | 038 | "No score today. This one counts quietly in your week." reads as a dead end, and tells the player this day is being measured. |
| 24, 25 | 006, 010, 034, 038; 028, 056 | There is no share anywhere. The daily results offer only "See the board" and "Back to today". Week has "Add a friend" but no Share, although the approved Sundays have both (ls/shots p05, p10). The source has no share code (`navigator.share` is absent from `src/`). |
| 28 | 003, 006, 010, 029, 034, 038, 028, 055, 056 | "One missed day a week is forgiven." is printed permanently on every cover, result and week screen. |
| 29 | 003, 006, 028 | The streak count and strip repeat on Today, Result and Week, and the board sits inside Week too (028). |
| 30 | 003 | The first cover a new player sees shows "Streak 0 days", "Practice 0" and 13 empty dashed boxes. |
| 31 | 057, 028 | The board leads with a 10-row global table and "Your rank 1,961". Friends come second, in a second table. The kicker reads "PNR slip · Week 44" on the board. |
| 34 | 057 | Five full-width yellow "Add ..." bars, a full-width "Remove Highway Ka Pahiya" button, and a separate Find button. |
| 36 to 40 | none | There is no reminder offer and no add-to-Home-Screen offer anywhere. There is no notification or install code in `src/`. This is a gap, not a misdesign. |
| 41 | 027 + 028; 055 + 056 | Sunday is a cover plus a 3,568 px (028) or 3,598 px (056) report. It holds four "How consistency is made" rows, an open textarea, the board table again, the streak again and a dashed "Week closed" button. The samples fit one screen. |
| 42 | 003, 028 | A 14-day (fortnight) strip, not the approved 28-day month strip (ls/shots p10). There is no month view. |
| 43 | 036, 044 | Station's week uses the pick mechanic twice (Tuesday 036, Thursday 044). |
| 45 | covers 003 to 051 | Week 1 runs Levels 2, 3, 4, 6, 7, 10. Week 2 runs Levels 2, (transfer), 3, 4, 7, 10. The ladder resets each Monday, and week 2's Wednesday (Level 3) is easier than week 1's (Level 4). |
| 46 | every puzzle screen, for example 023, 051 | A raw "Level 10" sits top right, and it jumps (7 to 10) between Friday and Saturday. |
| 47 | 034, 036, 038 | The transfer day is announced three ways: "Tomorrow: Cloak room" the day before (034), "Transfer day 220 · A new kind of puzzle" plus "Nothing about jobs or teams today." (036), and "No score today" (038). The approved sample ls/shots3 p16 does the same, which conflicts with the brief. |
| 48 | 001, 002, 004, 006, 009, 034 | The main button floats where the content ends instead of sitting at the bottom. About 65% of 001 and 60% of 009 are empty below it. |
| 50 | 005, 024, 025, 028, 056, 057, 058 | Scrolling screens: a puzzle at 2,088 px (005) and 2,092 px (024, 025); Week at 3,568 and 3,598 px; the board at 3,208 px. |
| 51 | 012, 059 | "Confirm my choice" (012), and its Hindi version (059), replace the sample's verb-plus-object labels ("Appoint treasurer", "Send the team"). |

---

## 4. Questions for the owner (plain words)

These now live in the single deduplicated list in [../ux/journeys.md](../ux/journeys.md), each with the pictures to show:

| Was | Now |
|---|---|
| 1. Transfer days: look like any day (DG-47) or carry the label | OQ-12 |
| 2. Naming the day's trick | OQ-13 |
| 3. Board reset: this week's practice or all time | OQ-22 |
| 4. Past days for fun, with no points | OQ-20 |
| 5. Sunday and the streak | OQ-21 |
| 6. Hide from the Everyone board | OQ-23 |
| Accounts at all (DG-4) | OQ-18 |
| Release time (DG-19) | OQ-15 |
| Sunday's shape, and a board on Sunday (DG-41) | OQ-2 |
| The lean on the result and on Sunday (DG-22, DG-41) | OQ-1 |
| A one-pick step answered by the tap (DG-13) | OQ-9 |

---

## Sources (all read raw on 20 Oct 2026)

**NYT**
- Wordle: https://www.nytimes.com/games/wordle/index.html
- Connections: https://www.nytimes.com/games/connections
- Strands: https://www.nytimes.com/games/strands
- (The three game pages above were read through the strings in their code bundles.)
- How to Solve a Crossword (2025): https://www.nytimes.com/guides/crosswords/how-to-solve-a-crossword-puzzle
- TechCrunch on the NYT Games app redesign (7 Mar 2024): https://techcrunch.com/2024/03/07/nyt-games-redesigned-app-boost-discovery-simplify-navigation/

**LinkedIn**
- Games on LinkedIn: https://www.linkedin.com/help/linkedin/answer/a6863543
- Queens: https://www.linkedin.com/help/linkedin/answer/a6269510
- Zip: https://www.linkedin.com/help/linkedin/answer/a7445030
- Guest mode: https://www.linkedin.com/help/linkedin/answer/a6880616
- LinkedIn News launch post (30 Apr 2024): https://www.linkedin.com/news/story/linkedin-news-introduces-games-6715874/

**Duolingo blog**
- Streak habit research (2022): https://blog.duolingo.com/how-duolingo-streak-builds-habit/
- Streak milestone animation (2022): https://blog.duolingo.com/streak-milestone-design-animation/
- Streak wager and Weekend Amulet tests (2017): https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/
- Friend Streak (2024): https://blog.duolingo.com/friend-streak/
- Friend Streak product lessons (2024): https://blog.duolingo.com/product-lessons-friend-streak/
- Leaderboards (2023): https://blog.duolingo.com/duolingo-leagues-leaderboards/
- Time Spent Learning Well (2024): https://blog.duolingo.com/time-spent-learning-well/
- Notifications (2020): https://blog.duolingo.com/hi-its-duo-the-ai-behind-the-meme/
- Duolingo 101 (2024): https://blog.duolingo.com/duolingo-101-how-to-learn-a-language-on-duolingo/
- 2025 Highlights: https://blog.duolingo.com/product-highlights/

**Matiks**
- Google Play listing: https://play.google.com/store/apps/details?id=com.matiks.app
- Inc42 (2025): https://inc42.com/buzz/matiks-raises-3-1-mn-to-scale-maths-based-gaming-platform/
- Entrepreneur India (2025): https://india.entrepreneur.com/en-in/news-and-trends/math-gaming-startup-matiks-raises-usd-31-mn-funding/496397
- matiks.com refused the request (403).

**Celia Hodent**
- Onboarding (2016): https://celiahodent.com/gamers-brain-ux-onboarding/
- Fortnite (2019): https://celiahodent.com/understanding-the-success-of-fortnite-ux/

**NN/g**
- Login walls (2014): https://www.nngroup.com/articles/login-walls/
- Mobile onboarding (2020): https://www.nngroup.com/articles/mobile-app-onboarding/
- Tutorials vs contextual help (2023): https://www.nngroup.com/articles/onboarding-tutorials/
- Push notifications (2018): https://www.nngroup.com/articles/push-notification/
- Response times (1993): https://www.nngroup.com/articles/response-times-3-important-limits/

**Platform guidance**
- Apple HIG, Onboarding: https://developer.apple.com/design/human-interface-guidelines/onboarding
- Apple HIG, Managing notifications: https://developer.apple.com/design/human-interface-guidelines/managing-notifications
- Apple HIG, Buttons: https://developer.apple.com/design/human-interface-guidelines/buttons
- (The three HIG pages were read through their JSON data.)
- Android accessibility: https://developer.android.com/guide/topics/ui/accessibility/apps
- web.dev permission UX: https://web.dev/articles/push-notifications-permissions-ux
- WebKit web push (2023): https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
- MDN Navigator.share: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share

**Grip**
- Hoober (2013; rechecked 20 Oct 2026 for the 780 base): https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php

**Added after the critique (read raw, 20 Oct 2026)**
- web.dev, Interaction to Next Paint (last updated 2 Sep 2025): https://web.dev/articles/inp
- Deceptive Patterns, Confirmshaming: https://www.deceptive.design/types/confirmshaming
- Deceptive Patterns, Nagging: https://www.deceptive.design/types/nagging
- WCAG 2.2's 24 px minimum target: read from W3C for the usability digest (UA-P4), https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html

**UNVERIFIED (not confirmed from raw text):**
- LinkedIn's Monday-to-weekend difficulty ramp (fan coverage only).
- Duolingo's current first-run order.
- How Matiks adapts difficulty.
- The wording of India's 2023 guidelines on dark patterns (the official PDF did not load).

---

## Changes after critique

Applied from [../ux/critique-stage1.md](../ux/critique-stage1.md) on 20 Oct 2026.

- **Ids (should-fix 3).** Principles are DG-P1 to DG-P34 and rules DG-1 to DG-53; all in-file references use them.
- **Must-fix 2.** DG-12, DG-25, DG-28 and DG-52: every toast's words also show in place, toasts stay at least 4 s and are announced, and the forgiven day gets a shape and a word, not only a colour.
- **Must-fix 3.** DG-22 and DG-41 no longer fix how or where the lean shows; that is OQ-1.
- **Must-fix 5.** DG-2 makes the cover chip the language switch's only home.
- **Must-fix 6.** DG-41 no longer bans a board on Sunday; Sunday's shape, with or without the samples' top-3 board, is OQ-2.
- **Must-fix 7.** DG-7, DG-8 and DG-13 follow the one step model in the usability digest (2.0a); DG-13 sends the samples' tap-to-answer to OQ-9.
- **Must-fix 8 and 9.** DG-48 uses the shared numbers (56 px main button, 12 px between bordered neighbours); DG-50 tests at 360 x 640 and 390 x 844 and carries the 200% text exception.
- **Should-fix 1.** Streak in two places (DG-29); marks, not "2/6" (DG-11); no dashed streak days (DG-30); board from the tab only (DG-17, DG-21); still versions under reduced motion (DG-7, DG-8, DG-26).
- **Should-fix 4.** Marked HOUSE: the 1.5 s demonstration, the 2 s milestone, milestone days 3, 14 and 50, the 7-day and twice-only re-ask, and the 10 wordings with no repeat in 14 days. The 52 px button became the shared 56 px.
- **Should-fix 10.** "Hide me" and the 14-day delay are owner question OQ-23 (DG-35).
- **Should-fix 12.** Added DG-P34 and DG-53 on pressure, guilt and nagging around the streak and board.
- **Should-fix 13.** Login walls 2014, Duolingo 2017 and 2020, Hoober 2013 and NN/g 1993 marked "old, owner to accept"; web.dev's 2025 responsiveness page added beside NN/g 1993.
- **Should-fix 14.** Section 4 points to the single owner list.
- **Spot-check S-10 and the source slip.** DG-P32 now gives Hoober's percentages against the 780 people touching the screen, and the WCAG 24 px target is no longer marked UNVERIFIED.
