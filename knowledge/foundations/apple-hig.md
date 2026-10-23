---
type: reference
title: Apple HIG digest for Equal Lens Daily
description: What Apple's Human Interface Guidelines, read from Apple's raw page data on 20 Oct 2026, ask of a small, one-handed daily puzzle game. It turns that guidance into numbered, testable rules for Equal Lens Daily and lists every rule the EVAL-13 build broke, with the screenshots that show it.
plane_issues: [https://app.plane.so/the-equal-lens/browse/EVAL-14/]
---

# Apple HIG digest for Equal Lens Daily

This is one of the foundation digests for the EVAL-14 redesign. It feeds the design-system and patterns stage. It sits under the owner's standing rules (minimal text, design before build, plain questions), which are not repeated here. It does not describe the EVAL-13 system in [../design.md](../design.md), which this work replaces.

**How to read it.**
- Section 1 lists the HIG principles that matter for this product, HIG-H1 to HIG-H46.
- Section 2 turns them into rules, HIG-1 to HIG-56.
- Section 3 lists what EVAL-13 broke, rule by rule.
- Section 4 lists the places where HIG and the approved look disagree. They now sit, as choices for the owner, in the single list in [../ux/journeys.md](../ux/journeys.md) (OQ-1 to OQ-30).
- Every id carries a prefix (HIG here; DG, M3, PH, UXW and UA in the sibling digests), so no two files share an id.
- The one step model for a puzzle step, the one set of size and timing numbers, and the settled small conflicts are in section 2.0 of [usability-and-accessibility.md](usability-and-accessibility.md). Where this digest gave a different answer, it now points there.

**Method.**
- Every HIG claim was taken from the raw text of Apple's own page data. That data is the JSON file behind each page: `https://developer.apple.com/tutorials/data/design/human-interface-guidelines/<page>.json`, fetched on 20 Oct 2026. No summary tool was used.
- The 2025 home page was read from its Wayback Machine copy, and the WWDC talk from Apple's transcript page.
- Screen measurements come from the EVAL-13 captures in `/Users/priyanshu/equal-lens-trainer/out/trainer-shots/`. They are 780 px wide at 2x, so they show a 390 x 844 CSS px phone, and every figure below is in CSS px.
- Code facts were read, without changes, from `~/equal-lens-trainer`.
- Anything I could not confirm from raw text is marked UNVERIFIED.

**Translating HIG to this product.**
- HIG is written for native Apple apps. Equal Lens Daily is a web app (PWA), and most Indian players will use Android browsers.
- We take HIG's principles and numbers. We ignore its materials (Liquid Glass) and its system components. The two skins are printed objects, not glass.
- This digest treats 1 HIG point as 1 CSS px at default zoom. That is the usual working equivalence on iPhone Safari, but it is UNVERIFIED as a general rule.
- Where this digest and the Material 3 digest disagree, the design system picks one answer and writes it down.

## 1. Principles that matter here

### Foundations

**HIG-H1. Hierarchy, harmony, consistency.**
- Says: Apple's 2025 redesign rested on three ideas.
  - Hierarchy: controls lift above the content and stand apart from it.
  - Harmony: shapes follow the rounded, nested geometry of the device.
  - Consistency: follow platform conventions so the design adapts to every size.
  - The companion talk tells designers to remove extra borders and backgrounds, because "hierarchy should be expressed through layout and grouping".
- Source:
  - HIG home page as published in Sept 2025 (archived data: https://web.archive.org/web/20250922031220/https://developer.apple.com/tutorials/data/design/human-interface-guidelines.json);
  - https://developer.apple.com/videos/play/wwdc2025/356/
- Here:
  - EVAL-13 gave most buttons a thick edge and a red drop shadow, so weight replaced placement as the signal and nothing led.
  - In June 2026 Apple replaced the trio on the home page with eight design principles: Purpose, Agency, Responsibility, Familiarity, Flexibility, Simplicity, Craft and Delight. They are HIG-H2 to HIG-H6 below, with Responsibility and Flexibility as HIG-H45 and HIG-H46 (added after the critique, which found them missing). The trio still describes the current design system.

**HIG-H2. Purpose and agency: get people straight to the task.**
- Says:
  - Focus on the product's most important features.
  - Stay out of the way and take people directly to the task. When a guided flow is needed, make it easy to skip.
  - Help people recover from mistakes so they feel free to explore.
- Source: https://developer.apple.com/design/human-interface-guidelines/design-principles (reintroduced 8 June 2026).
- Here:
  - The product is one puzzle a day, so every screen between opening the app and the first move is a cost.
  - Recovery matters: a fairness choice made by a slip of the thumb still gets scored.

**HIG-H3. Familiarity: one look, one behaviour, everywhere.**
- Says:
  - Build on concepts people know from the physical world and from other software.
  - Once an element has a look or a behaviour, apply it everywhere.
  - Give clear feedback: show when controls are available and when content changes.
- Source: design-principles (as above).
- Here:
  - A punched ticket, a split-flap board and a pulp cover are exactly the familiar physical concepts HIG means. This supports a different object each day.
  - But a dashed outline or a yellow fill must keep one meaning across all 14 days.

**HIG-H4. Simplicity and concision.**
- Says:
  - "Simplicity isn't minimalism."
  - Keep what is needed and let the rest fall away. Use exactly the words needed.
  - Set a hierarchy so people know where they are and what comes next.
- Source: design-principles.
- Here: this supports the owner's word budget. It also warns against the opposite failure, screens left empty with nothing to look at.

**HIG-H5. Craft: test in real settings.**
- Says: prototype early, discard what fails, and test the product in real-world settings.
- Source: design-principles.
- Here:
  - The owner found every EVAL-13 defect himself.
  - The real setting for this game: one hand, a mid-range Android phone, daylight, Hindi.

**HIG-H6. Delight is not decoration.**
- Says:
  - Know the feeling you want to create.
  - Create defining moments; even an error message can carry character.
  - Never let delight get in the way of the task.
- Source: design-principles.
- Here:
  - The defining moments are the result reveal and Sunday's "What was different?".
  - Long title bands and heavy frames slow the puzzle down. They are decoration, not delight.

**HIG-H45. Responsibility: act in people's best interest, and be open about what the product does.** (Added after the critique.)
- Says:
  - Earn trust by putting safety and privacy first, and be transparent about what your product does and why.
  - Make the product's intentions clear from the first interaction. Give a clear reason when asking for permission, and say what data you collect and how you use it.
  - Collect only what the product needs, handle it with care, and anticipate how it could be misused or cause harm.
- Source: https://developer.apple.com/design/human-interface-guidelines/design-principles (read raw from its page data, 20 Oct 2026; the principle's short line is quoted in the critique, S-12).
- Here:
  - This supports the privacy rules: road names, no real identity, notes that never leave the phone, and a plain notice before anything leaves it (UA-47).
  - It also pulls against two owner decisions. The game hides the direction of a player's lean, and it does not announce transfer days. Neither is deceptive in intent, but a player who later learns of them may feel the game was not open. This tension goes to the owner as OQ-14.

**HIG-H46. Flexibility: adapt to diverse contexts and needs.** (Added after the critique.)
- Says:
  - Design for everyone: take the range of people's experiences, perspectives and needs into account, and treat accessibility as a priority from the start.
  - Preserve a person's context: keep content and controls in consistent, predictable positions as the design adapts.
  - Support as many input methods as possible, such as voice, touch and keyboard.
- Source: design-principles (as above).
- Here:
  - The two skins change every week, so the controls must stay in the same places while the dress changes (UA-30).
  - Every action must work by tap alone, with TalkBack, at 200% text and in both languages (UA-9, UA-16, UA-23).

### Layout and one-handed use

**HIG-H7. Order by importance; group; reveal gradually.**
- Says:
  - People read from top to bottom, so the most important items go near the top.
  - Alignment shows that items are related.
  - Group related items with space, containers or separator lines.
  - When there are too many choices, show fewer at first and reveal the rest step by step.
- Source: https://developer.apple.com/design/human-interface-guidelines/layout (updated 9 Sept 2026).
- Here:
  - In EVAL-13 the series line, a two-line title, a blurb and an art strip push the question about 320 px (38%) down the screen (004).
  - Sunday (028) stacks seven kinds of content into one scroll.

**HIG-H8. Reach, and few controls.**
- Says:
  - Limit the number of controls on screen and keep secondary actions easy to find.
  - On iPhone, controls in the middle or bottom of the screen are easier to reach.
- Source: https://developer.apple.com/design/human-interface-guidelines/designing-for-ios
- Here: the game is played one-handed. The main action belongs at the bottom, where the approved samples already put it: their buttons are pinned near the bottom of every sample screen.

**HIG-H9. Safe areas and full screen.**
- Says:
  - Respect the safe areas, so the Dynamic Island, the home indicator and the system bars never cover content or controls.
  - Games must allow for rounded corners and camera housings.
  - People like to play games full screen.
- Source: layout; https://developer.apple.com/design/human-interface-guidelines/designing-for-games
- Here: an installed PWA with a translucent status bar draws under the system bars. A button pinned to the bottom must sit above the home indicator.

**HIG-H10. Art fills its space; it is not cut to a strip.**
- Says: when the display changes, scale background art so it fills the screen, and keep its proportions.
- Source: layout (Adaptability).
- Here: the Lugdi samples are full-screen posters. EVAL-13 cut the painting down to a 120 px band.

**HIG-H11. The layout survives larger text.**
- Says:
  - When text grows, side-by-side items may need to stack and rows may need to grow; text should not be cut off.
  - Test the largest and the smallest layouts first.
- Source: layout; https://developer.apple.com/design/human-interface-guidelines/typography
- Here: many adults set large text on their phones. Two-up cards and rows of stats must reflow.

### Type

**HIG-H12. Sizes and weights.**
- Says:
  - On iOS, text defaults to 17 pt, and the minimum is 11 pt. This applies to custom fonts as well as system ones.
  - Avoid light weights. Thin custom fonts need larger sizes.
- Source: typography; https://developer.apple.com/design/human-interface-guidelines/accessibility
- Here: Hind has a 300 weight, and it should not be used for reading text.

**HIG-H13. Hierarchy through size, weight and colour, with few typefaces.**
- Says:
  - Use weight, size and colour to show what matters, and keep that order when text size changes.
  - Use as few typefaces as possible, even in a custom interface.
  - A brand face can work for headings, with a highly legible face for body text and small labels.
- Source: typography; https://developer.apple.com/design/human-interface-guidelines/branding (refined 9 Sept 2026).
- Here:
  - This matches the owner's choice: Sarpanch for display, Hind for reading.
  - EVAL-13 set the question and the status line at the same 17 px (020).
  - It used Sarpanch for small Devanagari names and button labels (059), where it is hard to read.

**HIG-H14. Text can be enlarged to 200%.**
- Says:
  - Ideally, let people enlarge text by at least 200 percent, through the system text size or a control of your own.
  - Custom fonts must respond to the same accessibility settings as system fonts.
- Source: accessibility (updated 9 June 2025); typography (updated 16 Dec 2025).
- Here:
  - On the web, the equivalents are the browser's text-size setting and zoom.
  - Whether iPhone Safari's Larger Text setting enlarges web text set in px is UNVERIFIED. Sizes set in rem are the safe path.

### Colour and appearance

**HIG-H15. One colour, one meaning; use the accent sparingly.**
- Says:
  - Never let one colour mean different things, especially for status or for what can be tapped.
  - Apply the accent colour with restraint, mainly to primary actions and status.
- Source: https://developer.apple.com/design/human-interface-guidelines/color (updated 16 Dec 2025); branding.
- Here: in EVAL-13, yellow meant seven things: the main button, an option bar, a person card, a fact strip, the score box, the "you" row and a done streak day.

**HIG-H16. Minimum contrast.**
- Says:
  - Apple's Accessibility Inspector uses the WCAG AA levels: 4.5:1 for text up to 17 pt; 3:1 for text of 18 pt or more, or any bold text.
  - For custom colours on dark backgrounds, aim for 7:1, especially for small text.
  - If the default look cannot meet the minimum, offer a higher-contrast look when the phone's Increase Contrast setting is on.
- Source: accessibility; https://developer.apple.com/design/human-interface-guidelines/dark-mode
- Here:
  - Apple's table is looser than WCAG 1.4.3, which counts text as large only at 24 px, or 18.66 px bold. Under Apple's table a 17 px bold label at 3:1 passes; under WCAG it fails. This product follows WCAG (HIG-26, after the critique).
  - Both skins are dark grounds with custom colours, so 7:1 is the target for text on plates, tickets and sheets.

**HIG-H17. Never rely on colour alone.**
- Says:
  - Show states and differences with shapes, icons or labels as well as colour.
  - Red with green, and blue with orange, are hard pairs for colour-blind people.
- Source: accessibility; color.
- Here: "chosen", "spent" and "empty" each need a mark, not just a fill.

**HIG-H18. Daylight, culture and white glare.**
- Says:
  - Test colours in bright sun, which makes them look darker and more muted, and in dim light.
  - Colours mean different things in different cultures. HIG's examples: red can mean danger or something good; white can mean death or purity.
  - On dark backgrounds, soften large white areas so they do not glow.
- Source: color; https://developer.apple.com/design/human-interface-guidelines/inclusion; dark-mode.
- Here:
  - Indian daylight is harsh.
  - In India, red and white carry strong meanings (weddings, mourning). This is our own reading, not HIG's.
  - Pure white cards and buttons glare on the dark skins (016, 031, 034).

**HIG-H19. No light or dark switch inside the app.**
- Says:
  - Do not offer an app-only light or dark setting; follow the system setting.
  - A permanently dark look is acceptable in rare cases, such as immersive media.
- Source: dark-mode.
- Here: each skin is a fixed printed look, which is a fair "rare case". It must still honour higher contrast (HIG-H16).

### Touch, controls and feedback

**HIG-H20. Tap areas and spacing.**
- Says:
  - A control needs a tap area of at least 44 x 44 pt. Less important controls need at least 28 x 28 pt.
  - Spacing matters as much as size: about 12 pt around controls with a visible edge, and about 24 pt around borderless ones.
- Source: https://developer.apple.com/design/human-interface-guidelines/buttons; accessibility; https://developer.apple.com/design/human-interface-guidelines/game-controls
- Here: word chips, slots and person cards are tapped quickly one after another, and a mis-tap changes a scored answer.

**HIG-H21. Press states that show around the finger.**
- Says:
  - Every custom button needs a pressed state.
  - In touch games, the pressed state must show even when a finger covers the control, for example a glow. Pair it with sound and vibration.
- Source: buttons; game-controls.
- Here: every control in EVAL-13 is custom.

**HIG-H22. One or two prominent buttons; mark the preferred one by style, not size.**
- Says:
  - "Keep the number of prominent buttons to one or two per view."
  - Show the preferred option through its style, not its size. Buttons of equal size read as a set of equal choices.
  - Never make a destructive action the main button.
- Source: buttons (updated 16 Dec 2025).
- Here: the board shows five filled "Add" buttons (057), and the language button is as heavy as Play (003).

**HIG-H23. Tap the object itself.**
- Says:
  - In touch games, cut extra controls by letting players act on game objects directly, for example tapping an object to select it instead of adding a select button.
  - Hide controls that are not available or not relevant.
- Source: game-controls (updated 9 June 2025).
- Here:
  - The person card, the ticket and the word are the controls.
  - EVAL-13 added a second row of name buttons for the same choice (020, 048).

**HIG-H24. Gestures are extras, never the only way.**
- Says:
  - Use standard gestures with their usual meanings.
  - A custom gesture must be easy to discover, easy to do, distinct from others, and never the only way to do something important.
  - Offer an on-screen alternative to every gesture.
  - When something is unavailable, make that state clearly different from the available state.
- Source: https://developer.apple.com/design/human-interface-guidelines/gestures; accessibility.
- Here: the quick-sort swipe also has buttons, which should stay. But the card gives no hint that it can be dragged (008).

**HIG-H25. Feedback matched to importance.**
- Says:
  - Match the strength of feedback to its importance.
  - Put status next to the items it describes.
  - Confirm only significant completions.
  - Say why a command cannot run.
  - Warn before data loss that is unexpected and cannot be undone, but not when the loss is the expected result.
- Source: https://developer.apple.com/design/human-interface-guidelines/feedback
- Here:
  - "Checks left" belongs on the checks themselves.
  - "Delete everything" needs a warning; removing a friend does not.

**HIG-H26. Motion: brief, skippable, optional.**
- Says:
  - Add motion only when it has a purpose, and keep feedback animations short and precise.
  - Avoid motion on interactions people repeat often.
  - Let people cancel motion rather than wait for it, and never make motion the only signal.
  - Under Reduce Motion, cut zooms, scaling and movement at the edges, and replace slides with fades.
- Source: https://developer.apple.com/design/human-interface-guidelines/motion (updated 9 Sept 2025); accessibility.
- Here: a 5 to 7 minute daily session cannot spend seconds on transitions.

**HIG-H27. Vibration: consistent and optional.**
- Says:
  - Give each vibration pattern one cause, and use it the same way every time.
  - Use vibration to support what is on screen, not too often.
  - Let people turn it off.
- Source: https://developer.apple.com/design/human-interface-guidelines/playing-haptics
- Here:
  - A vibration must never signal "you leaned", because the player must never learn the direction of their lean.
  - Whether a web page can vibrate an iPhone is UNVERIFIED. Android browsers mostly can, also UNVERIFIED for each browser.

**HIG-H28. Sliders.**
- Says:
  - The minimum sits on the leading side and the maximum on the trailing side.
  - Consider showing the exact value, and a stepper for precise input.
- Source: https://developer.apple.com/design/human-interface-guidelines/sliders
- Here: predict-the-crowd (032) already follows this.

### Launch, onboarding and games

**HIG-H29. Open instantly; the launch screen matches the first screen.**
- Says:
  - People want to start within a couple of seconds.
  - The launch screen should look almost the same as the first screen, with no text and no logo, or people see an unpleasant flash.
  - When people come back, restore where they left off.
- Source: https://developer.apple.com/design/human-interface-guidelines/launching
- Here: a PWA takes its launch colour from its manifest, so that colour must match whatever ground greets the player.

**HIG-H30. Onboarding: play first, set up later.**
- Says:
  - Ideally people understand the app just by using it. If onboarding is needed, it should be fast, fun and optional.
  - Teach by letting people do the thing.
  - Prefer tips in context, placed next to what they explain.
  - Put off setup that is not essential, and provide sensible defaults.
  - Keep licences and disclaimers out of the flow.
- Source: https://developer.apple.com/design/human-interface-guidelines/onboarding
- Here: choosing a language and a road name are setup, and both can have good defaults.

**HIG-H31. Games: start playing straight away.**
- Says:
  - Let people play as soon as possible.
  - Choose good defaults from the device, including its accessibility settings.
  - Teach through play, and keep any written tutorial as a reference.
  - Ask for things only at the moment they are needed.
  - Keep text legible.
- Source: designing-for-games (updated 9 June 2025).
- Here: the first session is the trial. A day-one player decides within a minute.

**HIG-H32. Mental load: one thing per screen, no timers.**
- Says:
  - Keep interactions simple and familiar.
  - Avoid controls that disappear on a timer.
  - Consider letting players adjust difficulty.
  - For Assistive Access (Apple's simplified mode), split multistep tasks so each screen holds a single interaction, and ask for confirmation twice before actions that are hard to undo.
- Source: accessibility.
- Here: the puzzles are meant to be tricky; the interface must not add to the load.

**HIG-H33. The brand gives way to content.**
- Says:
  - Branding should give way to content.
  - "Resist the temptation to display your logo throughout your app or game".
  - Express the brand through familiar components.
  - The launch screen is not a branding moment.
- Source: branding.
- Here: EVAL-13's first screen shows the product name twice (001).

### Navigation

**HIG-H34. Tab bars.**
- Says:
  - Tab bars are for moving between sections, not for actions.
  - Keep the bar visible in every section, except under a full-screen task.
  - Fewer tabs are easier to use.
  - Label each tab with one word, and prefer filled icons.
  - Never hide or disable tabs.
  - Keep badges for critical information.
- Source: https://developer.apple.com/design/human-interface-guidelines/tab-bars (updated 8 June 2026).
- Here: Today, Board and Week is a sensible count.

**HIG-H35. Full-screen tasks.**
- Says:
  - Take over the screen only when it helps people focus, and keep that task short.
  - Always give an obvious way out.
  - Confirm before closing would lose something the person made.
  - Name the task on screen.
- Source: https://developer.apple.com/design/human-interface-guidelines/modality
- Here: a puzzle is a full-screen task with no tab bar, so it needs its own way out that keeps progress.

**HIG-H36. Leaderboards.**
- Says:
  - A classic board tracks best all-time results.
  - A recurring board resets on a schedule, which gives more players a chance to lead. HIG names daily rotating puzzles as a good fit for recurring boards.
  - Players compare themselves with friends and with everyone.
- Source: https://developer.apple.com/design/human-interface-guidelines/game-center
- Here: the owner chose one global board ranked by practice. A weekly board is an option to offer, not a rule (section 4).

### Writing

**HIG-H37. One voice and one term list.**
- Says:
  - Decide the app's voice.
  - Keep a list of common terms and stick to it.
  - Match the tone to the moment.
  - Use plain language without jargon, and cut every word that is not needed.
- Source: https://developer.apple.com/design/human-interface-guidelines/writing (updated 16 Dec 2025).
- Here: EVAL-13 called the same thing an "announcement" and a "note" on one screen (040).

**HIG-H38. Each screen has a purpose, and its order follows that purpose.**
- Says:
  - Put the most important information first.
  - A screen that carries more than one idea should be split across screens.
- Source: writing.
- Here: Sunday and Today each carry four or more ideas.

**HIG-H39. Labels and steps.**
- Says:
  - Start button labels with a verb, and avoid cute labels.
  - Choose one way to label moving from step to step, and keep it.
  - Make the end of a flow clear.
  - Name gestures correctly: "tap", not "click".
- Source: writing; buttons.
- Here: "This is me" has no verb, and "Confirm my choice" is generic.

**HIG-H40. Capitals and pronouns.**
- Says:
  - Choose one capitalisation style for each kind of element and keep it.
  - Use "my" and "your" sparingly, and do not switch between them.
  - Avoid "we".
- Source: writing.
- Here: Devanagari has no capital letters, so a hierarchy built on ALL CAPS disappears in Hindi. This is our own observation, not HIG's.

**HIG-H41. Empty states and errors.**
- Says:
  - An empty screen shows the next step and a button for it.
  - An error appears next to the problem, does not blame, says how to fix it, and skips "oops".
- Source: writing.
- Here: a friend search that finds nobody; a first Sunday with only one day played.

**HIG-H42. Notifications.**
- Says:
  - Be brief, never repeat a notification about the same thing, and keep private information out.
  - Leave the app's name out of the text.
  - A badge counts unread notifications only; never use it for game scores.
- Source: https://developer.apple.com/design/human-interface-guidelines/notifications
- Here:
  - A streak reminder is the only notification this product needs.
  - The lean and the score are private.

**HIG-H43. Text fields.**
- Says: label the field, give a hint, and size the field to the text you expect.
- Source: https://developer.apple.com/design/human-interface-guidelines/text-fields
- Here: Sunday's private note.

### Inclusion

**HIG-H44. People, settings and stereotypes.**
- Says:
  - Show a range of people, and avoid stereotyped pictures of jobs and roles.
  - Avoid references to gender that are not needed. Most apps never need to know a person's gender.
  - Show settings and objects most people know, not affluence.
  - In games, check stories and characters for stereotypes.
- Source: inclusion; designing-for-games.
- Here:
  - In this game gender is the subject, not an accident, so the HIG advice becomes three rules:
    - gender appears only where the puzzle needs it;
    - the cast varies in every other way;
    - the player is never asked their own gender.

## 2. Rules for Equal Lens Daily

Unless a rule says otherwise, test it at 360 x 640 and 390 x 844 CSS px, each also at 200% text (the shared test sizes, usability digest 2.0b). "Ours" marks a number we chose (HOUSE): HIG gives the principle but not the figure.

### Screen structure and reach

**HIG-1. One main action, pinned to the bottom.**
- Each puzzle step has exactly one main action, pinned to the bottom of the screen above the safe area. Bottom padding is the larger of 16 px and the safe-area inset.
- It never scrolls away, and it never moves between steps of the same puzzle.
- The approved samples already pin it there. (HIG-H8, HIG-H9, HIG-H22)

**HIG-2. A puzzle step fits on one screen.** The question, every choice and the main action are visible without scrolling at both test sizes. If a step will not fit, split it into two steps. At 200% text a step may scroll, but the main action stays pinned and reachable (UA-16). (HIG-H7, HIG-H32)

**HIG-3. Removed after the critique.** It capped the title band at 25% of the screen once play starts, which rebuilt the 120 px art strip the owner rejected. Art behind any screen now follows M3-36 (the painting is never shrunk; text sits on a plate or scrim), tested by UA-2 (the worst patch of painting under each line).

**HIG-4. One idea per screen.**
- Today: the cover and Play.
- Result: one reveal.
- Sunday: its shape (one screen as in the samples, or a short sequence) is owner question OQ-2. (HIG-H38, HIG-H32)

**HIG-5. No dead space.** On any screen, empty space below the last element is no more than 20% of the screen height (HOUSE). On short screens, let the object or the art fill the space. (HIG-H4, HIG-H10)

**HIG-6. Removed after the critique.** It allowed art on a puzzle step only as a band of at least 160 px, which also rebuilt the strip. M3-36 with the UA-2 test governs art on every screen.

**HIG-7. Safe areas when installed.** The page sets `viewport-fit=cover`, and every element at a screen edge allows for the safe area (`env(safe-area-inset-*)`). Check on a notched iPhone and on an Android phone with a gesture bar. (HIG-H9)

### Touch and controls

**HIG-8. Tap areas.** Everything tappable has a tap area of at least 48 x 48 px, the shared number (usability digest 2.0b), above Apple's 44 pt. The visible shape may be smaller if padding brings the tap area up to 48 px. Change `--tap-min` from 44px to 48px. (HIG-H20)

**HIG-9. Gaps between controls.** Leave at least 8 px between any two targets, and at least 12 px between neighbours that both have a visible edge (shared numbers). Apple's larger figure of about 24 pt around borderless controls is not adopted separately; the 48 px target already carries padding. (HIG-H20)

**HIG-10. The object is the control.** Tapping a person card, ticket, word or slot selects it. No screen has two controls that set the same answer. (HIG-H23)

**HIG-11. Picks stay changeable until the commit.** This follows the step model (usability digest 2.0a).
- Before the commit, the player can change any pick by tapping again.
- The commit is a deliberate tap on the main action, unless the owner allows a one-pick step to answer on the tap (OQ-9).
- Nothing moves on by itself, and nothing is timed. (HIG-H2, HIG-H32)

**HIG-12. Gestures have buttons and look draggable.**
- Every gesture has a visible button that does the same thing.
- Anything that can be dragged looks it, for example a stacked deck, a lifted corner or a slight tilt.
- The drag is taught once, by doing it. (HIG-H24)

**HIG-13. A way out that keeps progress.**
- Every puzzle has a back control at the top left with a 48 px target (settled after the critique; usability digest 2.0a, point 5). It returns to the previous step, or from the first step to the cover, and keeps the player's progress.
- Reopening or refreshing returns to the same step with all picks kept. (HIG-H35, HIG-H29)

### Buttons and states

**HIG-14. One filled accent button per screen.** Any second action uses a quieter style at the same height, an outline or plain text. No two buttons carry the heavy shadow. (HIG-H22)

**HIG-15. Every state is drawn.**
- The parts sheet draws every control in each of these states: rest, pressed, selected, not ready and keyboard focus.
- Person cards also get "chosen" and "not chosen" for after the commit.
- The pressed state changes the whole control (a shift, or a change at its edge), so it still shows around a thumb. (HIG-H21, HIG-H3)

**HIG-16. Selection carries a mark.**
- A selected item gains a mark (a tick, a stamp or a punch hole) as well as a colour change.
- Unchosen items keep their rest look.
- Test: in a greyscale screenshot, the choice is still obvious. (HIG-H17)

**HIG-17. A main action that is not ready yet** follows the step model (usability digest 2.0a, point 3):
- it stays in place and looks visibly muted, with the label still at 4.5:1 or better;
- its label names what is missing in four words or fewer, for example "Pick a rule";
- it stays focusable, and a tap on it points to what is missing. (HIG-H24, HIG-H25)

**HIG-18. One look, one meaning.**
- A dashed outline means only "empty slot to fill" in a puzzle.
- Not ready, spent, notice and unchosen each get their own look, listed in the parts sheet. (HIG-H3, HIG-H15)

**HIG-19. Destructive actions stand apart.**
- They never use the accent style, and they sit apart from other actions.
- "Delete everything" asks once and names what will be lost.
- Removing a friend happens at once, because that is the expected result, with Undo for at least 5 s (HOUSE). (HIG-H22, HIG-H25, HIG-H32)

### Type

**HIG-20. Six text styles at most** (the shared numbers, usability digest 2.0b).
- The whole app uses at most six named styles: display, title, question, body, label, number. Any one screen uses at most four.
- Sizes: questions 20 px or more (the M3 digest proposes 24); body text and quotes 16 px; labels 14 to 15 px.
- No live text goes below 14 px. This is stricter than HIG's 11 pt, because Devanagari vowel marks blur at small sizes.
- The approved samples use many 12 to 13 px labels and a few 11 px ones. They were drawn on a 340 px frame (counted in the samples' `index.html` and `range.html`). How far the parts sheet moves them up is owner question OQ-10. (HIG-H12, HIG-H13)

**HIG-21. The question leads.** On every screen the question is at least 1.2 times the size of any status line, and at least as heavy. Status, shown as marks where it can be (usability digest 2.0c), is smaller and lighter. (HIG-H13)

**HIG-22. Two typefaces.**
- The display face is for titles only: Latin at 28 px and above, Devanagari at 32 px and above (UA-15).
- Hind is for everything people read, including names, stats and button labels in Devanagari.
- Reading text uses weight 500 or heavier.
- Whether Lugdi's English buttons keep the samples' display-face capitals is owner question OQ-3. (HIG-H12, HIG-H13)

**HIG-23. Hierarchy does not depend on capitals.** Check every screen in Hindi beside English: the main button and the question must still lead. (HIG-H13, HIG-H40)

**HIG-24. Text can grow.** Text sizes are set in rem. Every screen works at 200% text size with nothing cut off or overlapping; two-up cards stack into one column. (HIG-H11, HIG-H14)

### Colour

**HIG-25. Each colour has one job.**
- The parts sheet writes down one job for each colour in each skin, and every use of that colour fits that job.
- What yellow means is owner question OQ-7. The proposal: yellow, the accent, means "your pick, and the button that confirms it".
- Facts, stats and scores sit on paper or on the ground colour.
- A filled accent box is always tappable. (HIG-H15)

**HIG-26. Contrast** (WCAG 1.4.3 thresholds, adopted after the critique).
- Text on plates, tickets and sheets: at least 7:1 (HOUSE, as UA-1).
- Other text under 24 px, or under 18.66 px bold: at least 4.5:1.
- Text of at least 24 px, or 18.66 px bold: at least 3:1.
- Apple's own table (3:1 from 18 pt, and for any bold text) is looser and is not used (HIG-H16).
- Text over art is measured against the worst patch of art under each line (UA-2). (HIG-H16)

**HIG-27. Higher contrast on request.** When the phone asks for more contrast (`prefers-contrast: more`), edges get thicker and text over art gets a solid backing. Whether iOS's Increase Contrast setting triggers this media query is UNVERIFIED. (HIG-H16)

**HIG-28. No glaring white.** No large pure white surfaces on the dark skins. Paper is the skin's cream; Station already defines `#E9DFC4`. (HIG-H18)

**HIG-29. Daylight check.** Check each skin outdoors at full brightness on a mid-range Android phone. The question and the main action must be readable at arm's length. (HIG-H18)

**HIG-30. No colour hints at a lean.** Red is never the only signal for "wrong", "late" or "lean", and no colour hints at the direction of a lean. (HIG-H17, HIG-H18)

**HIG-31. No light or dark switch.** The app has no light or dark switch; each skin is one fixed look. (HIG-H19)

### Feedback and motion

**HIG-32. Status sits on the thing it counts.**
- The checks left are the unpunched holes.
- Lines left are shown by the height of the deck, the same idea in every mechanic, never "Line 3 of 8" text (usability digest 2.0c). (HIG-H25)

**HIG-33. Short, skippable animation** (the shared motion rule, usability digest 2.0b).
- State changes animate in 150 to 250 ms; nothing that follows a tap runs past 400 ms.
- The result reveal takes no more than 1.2 s (HOUSE), and a tap skips it.
- Nothing waits for an animation to finish. (HIG-H26)

**HIG-34. Reduce Motion.** Under Reduce Motion, tilts, slides and zooms become fades or cuts, and nothing loops. The ghost demonstration becomes a still drawing, the pulse a static ring and the milestone a still stamp (UA-21). `tokens.css` already handles the first part; keep it. (HIG-H26)

**HIG-35. Vibration, where available.** One short pulse when the player commits, and nowhere else. It is the same everywhere, never used for a result, and can be switched off in the "?" sheet. (HIG-H27)

**HIG-36. No pop-up alerts during play.** The only warnings are for destructive actions (HIG-19). (HIG-H25)

### Launch and onboarding

**HIG-37. Two taps to the first move.**
- A new player reaches the first puzzle move in two taps: open the app, tap Play on the cover, then play.
- The language follows the phone: a phone set to Hindi gets Hindi, any other gets English. A small chip in the cover's top bar is the switch's only home (usability digest 2.0c).
- A road name is given automatically, shown on the first result with "Change", and can be changed later in the "?" sheet. (HIG-H30, HIG-H31, HIG-H2)

**HIG-38. Teach by doing** (the step model, usability digest 2.0a, point 4).
- The first time a mechanic appears, the interface shows the next move, for example a pulsing empty slot or a lifted card, and one ghost demonstration plays.
- No hint text in the first build. If playtests show a mechanic cannot be learnt without words, one hint of 6 words or fewer sits next to its target, on the first meeting only. (HIG-H30)

**HIG-39. The launch matches the first screen.** The manifest's background and theme colours match the ground of the first screen the player sees. The launch screen has no text and no logo. (HIG-H29)

**HIG-40. Today is kept; tomorrow's look is saved in advance** (changed after the critique; UA-40).
- Once today's puzzle is opened, it is saved on the phone and plays offline to the end.
- The next days' art and fonts are saved in advance, so the next cover opens fast, but tomorrow's puzzle itself is not, because a saved future puzzle can be read and shared early. Whether to save it anyway is owner question OQ-27.
- The cover's ground and title appear before the art arrives. (HIG-H29, HIG-H31)

**HIG-41. No notices in the flow.** No prototype, draft or sample notices appear in the flow. One "Prototype" chip opens them. (HIG-H30; owner rule)

**HIG-42. The product name once.** It appears at most once per screen, and only on the cover or the launch screen. Never use it as the heading of a screen that has another job. (HIG-H33)

### Navigation

**HIG-43. Tabs.**
- Three tabs: Today, Board, Week. The tab bar is the only route to the board (usability digest 2.0c).
- Each tab has a filled icon and a one-word label.
- The selected tab differs by shape and colour, not by weight alone.
- The bar never holds actions, and it hides only during a puzzle. (HIG-H34)

**HIG-44. Settings in one place.** Reminders, road name, privacy and data deletion live in the "?" sheet, below how to play (usability digest 2.0c). The language switch is not there; it is the cover chip. None of them is ever a cover button styled like Play. (HIG-H22, HIG-H30)

### Writing

**HIG-45. Word budget (owner).**
- Puzzle screens carry at most 15 words, other screens at most 20, not counting names, numbers and quotes.
- The question has 10 words or fewer.
- No blurb repeats the question. (HIG-H4, HIG-H37)

**HIG-46. One term list per language.** Every object has one name, used in the question, the button and the result. The content check enforces this. (HIG-H37)

**HIG-47. Button labels.**
- A verb comes first, in one to three words, naming the day's object where that helps: "Punch tickets", "Send the team".
- Each kind of element keeps one capitalisation style within a skin; Lugdi's button capitals are OQ-3. (HIG-H39, HIG-H40)

**HIG-48. "You", never "my" or "we".** The game speaks to the player as "you" only. Labels never say "my", and the game never says "we". (HIG-H40)

**HIG-49. No research words on screen.**
- No screen uses words from the research or the pipeline: transfer, twin, held-out, consistency form, lean size of 100, word gap, check gap.
- Transfer days are never named or hinted at, unless the owner decides otherwise (OQ-12).
- How the size of the lean is shown (a picture, a number on a scale, or a bar) is owner question OQ-1. (HIG-H37)

**HIG-50. Empty and error states.** One line, plus the action that fixes the problem, placed where the problem is. (HIG-H41)

**HIG-51. Notifications, if built.**
- At most one a day, in eight words or fewer.
- No score, lean or day's topic, and no app name in the text.
- No repeat when a notification is ignored.
- No badge for streaks or scores. (HIG-H42)

### People

**HIG-52. Everyone has a portrait.**
- Everyone on screen has a portrait; no letter tiles.
- A "Neither" or "nobody" option is drawn as a different object, such as a stamp or an empty seat, never as a person card. (HIG-H44, HIG-H3)

**HIG-53. A varied cast.**
- Across each fortnight, the cast varies in age, region, religion, caste and job.
- Roles that go against stereotype appear at least as often as stereotyped ones; the content check counts them.
- Settings are everyday Indian places, village as well as city.
- The player is never asked their own gender. (HIG-H44)

### Process

**HIG-54. Play it before sharing it.** Before any link goes out:
- play the first-run path one-handed on a real phone;
- in both skins, in English and in Hindi;
- at 200% text size, with Reduce Motion on;
- and compare each screen with its approved sample. (HIG-H5)

### Responsibility and flexibility (added after the critique)

**HIG-55. Say what the game keeps, and why.** (HIG-H45)
- The "?" sheet's privacy part says, in plain words, what stays on the phone, what goes to the server and why, and how to delete it. The notice before anything leaves the phone follows UA-47.
- The game asks for nothing it does not need: no name, number, email, age beyond what OQ-17 decides, gender or location.
- How open the game is about the two things it hides from players (the side of a lean, and which days are transfer days) is owner question OQ-14.

**HIG-56. Same places, any way in.** (HIG-H46)
- Controls keep their positions across both skins and all days (UA-30).
- Every action works by tap alone, with TalkBack, at 200% text, and in both languages; a keyboard attached to a phone can reach and press every control.
- *Test:* play one full day with TalkBack and once with a keyboard; both finish.

## 3. Broken in the EVAL-13 build

All file names refer to `/Users/priyanshu/equal-lens-trainer/out/trainer-shots/`. A full-page capture taller than 844 px means content below the bottom of the screen.

- **HIG-1 (one main action, pinned to the bottom).**
  - On these screens the button floats mid-screen with empty ground beneath it:
    - 001 and 002 (onboarding);
    - 004 (button ends about 670 px down an 844 px screen);
    - 008;
    - 009 (button ends at 334 px);
    - 012, 030, 036, 044 and 048.
  - On these screens the main button sits below the bottom of the screen and needs a scroll:
    - 005 (page 1,044 px tall);
    - 016 and 017 (852 px);
    - 020 (914 px) and 021 (982 px);
    - 024 and 025 (1,046 px);
    - 049 (865 px);
    - 052 and 053 (934 px).
- **HIG-2 (a step fits on one screen).** The same screens as the second list above, plus:
  - Sunday: 028 (1,784 px) and 056 (1,799 px);
  - the board: 057 (1,604 px);
  - the prototype menu: 058 (1,048 px).
- **HIG-H7 (order by importance; this finding was filed under the removed HIG-3).** In 004, 008, 012, 016, 020 and 024, the series line, the two-line title, the blurb and the art strip all come first. The question starts about 320 px down, 38% of the screen.
- **HIG-4 (one idea per screen).**
  - Today, 003 and 029: Play, road name, practice, streak strip, the forgiveness line and the language button.
  - Results, 006 and 034: score, rule kept, streak, tomorrow's object and two buttons.
  - Sunday, 028 and 056: score, six measures, Look again, the note, the board, a sample notice, the streak, "Week closed" and "Add a friend".
- **HIG-5 (no dead space).** Empty share of the screen:
  - 001: about 65%;
  - 009: about 60%;
  - 038: about 45%;
  - 030: about 38%;
  - 036: about 30%;
  - 006: about 30% above the tab bar.
- **HIG-H10 and M3-36 (art fills its space and is never shrunk; this finding was filed under the removed HIG-6).**
  - In 003, 004, 011, 012, 019, 020, 023 and 024 the painting is a 120 px band, about 14% of the screen. The masthead reuses the `--swipe-height` token and zooms the art to 116%.
  - 007, 015 and 027 have no art at all, and no result screen has any.
- **HIG-7 (safe areas).**
  - `index.html` sets a black-translucent status bar but no `viewport-fit=cover`, and `src` never uses `env(safe-area-inset-*)`.
  - The effect in installed mode is UNVERIFIED, because the captures are browser renders.
- **HIG-9 (gaps between controls).** `choices.css`, `options.css` and `words.css` set 8 px gaps. This shows in:
  - the stacked choice bars in 004, 024 and 052;
  - the name buttons in 020;
  - the word chips in 016 and 040.
- **HIG-10 (the object is the control).** In 020 and 021, 048 and 049, and 061 the player:
  - taps a person to spend checks,
  - then picks the same person again from a row of name buttons,
  - then presses Appoint.
- **HIG-11 (picks stay changeable).** In 009, once line 8 is done the card disappears. The eight calls cannot be reviewed or changed before closing the column.
- **HIG-12 (gestures look draggable).** In 008 the swipe card is a flat box with no sign that it can be dragged. The code supports both dragging and buttons (`Swipe.tsx`).
- **HIG-13 (a way out).** No puzzle screen from 004 to 053 has a close or back control, and `Play.tsx` has none.
- **HIG-14 (one filled accent button).**
  - 057: five filled yellow "Add ..." buttons.
  - 002: "Show three more" and "This is me" are both full-width with the red shadow.
  - 003: the language button is styled like Play.
  - 006, 034 and 038: "Back to today" is as heavy as "See the board".
  - 031: "Start again" is a full-width white button above the main button.
- **HIG-16 (selection carries a mark).**
  - In 002, 013, 021, 025, 045 and 053, a chosen item turns from yellow to black, with no mark.
  - In 025 and 053 the unchosen players turn dashed, the same look as disabled, so the finished screen looks switched off.
- **HIG-17 (a main action not ready yet).**
  - 004 and 030 stack two dashed, disabled buttons. Their labels are as bright as live ones, and nothing says what is missing.
  - The same dashed main button appears in 008, 012, 016, 020, 024, 036, 040, 044, 048 and 059.
- **HIG-18 (one look, one meaning).** The dashed outline has eight meanings:
  1. a disabled button (004);
  2. an empty streak day (003);
  3. a notice (001, 034, 038);
  4. a spent word (017);
  5. a spent check card (021);
  6. an unchosen player (025);
  7. an empty job slot (005);
  8. a progress notice (009).

  In addition, 028 and 056 draw a status, "Week closed", as a disabled button.
- **HIG-19 (destructive actions stand apart).**
  - 058: "Delete everything on this phone" has the same style as "Back to the real date", and one tap resets everything (`Dev.tsx` calls `store.reset()` directly).
  - 057: "Remove Highway Ka Pahiya" is a full-width button styled like the others, and one tap removes the friend (`Board.tsx`).
- **HIG-20 (six text styles).** `tokens.css` defines eight text sizes (12, 13, 15, 17, 22, 28, 36 and 44 px). The diagnosis counted 32 combinations of size and weight.
- **HIG-21 (the question leads).**
  - In 020 and 048, "Checks left: 3" is as large as the question.
  - In 024 and 052, "0 of 6 picked" reads larger than "Pick the six for tonight."
- **HIG-22 (two typefaces).**
  - In 059 the names (कमला, राजू) and the main button label are set small in the display face, and are hard to read.
  - In 005 and 024 Latin names are set in the display face at about 17 px.
- **HIG-23 (hierarchy without capitals).** In English (012) the Lugdi main button leads through its capitals. In Hindi (059) there are no capitals, so the same button falls back on small display-face Devanagari, the least readable text on the screen.
- **HIG-24 (text can grow).** Every size in `src` is set in px, with no rem. The 200% text test was never run, so whether the screens break is UNVERIFIED.
- **HIG-25 (each colour has one job).** Yellow fills mean seven things:
  - the main button (003);
  - an option bar (004);
  - a person card (020);
  - a fact strip that cannot be tapped (016, 040);
  - the score box (006, 034);
  - the "you" row (057);
  - a done streak day (029).
- **HIG-27 (higher contrast).** `src` has no `prefers-contrast` handling; it handles only `prefers-reduced-motion`.
- **HIG-28 (no glaring white).**
  - Pure white surfaces sit on the dark grounds:
    - the note cards (016, 040);
    - the job slots (005);
    - the "Start again", "Back to today" and "Remove" buttons (031, 034, 057).
  - The ticket-cream token `--c-ticket` is defined but never used.
- **HIG-32 (status on the thing it counts).**
  - 008 shows "Line 1 of 8" as plain text, but 009 puts "Line 8 of 8" in a dashed notice.
  - 020 shows "Checks left: 3" apart from the circles that show the same count.
  - 030 shows "Part 1 of 2" in yet another style.
- **HIG-37 (two taps to the first move).**
  - The language screen (001), the road-name screen (002) and the Today hub (003) all come before the first puzzle move.
  - That is at least four taps (English, a name, "This is me", Play) before the player acts.
  - Nothing in `src` reads `navigator.language`, so the language never follows the phone.
- **HIG-38 (teach by doing).** These screens explain moves in sentences instead of showing them:
  - 005: "Tap a person, then a job."
  - 016 and 040: "Tap a blank, then a word. Each word fits either note."
  - 020: "Spend up to three checks. Tap a person to call their referee."
  - 031: "Tap people in order, first place first."
  - 048: "Tap a ticket to punch it.", though no ticket is drawn.
- **HIG-39 (the launch matches the first screen).**
  - `manifest.webmanifest` and `index.html` fix the theme and background colour at `#1b0b2e`, Lugdi night.
  - Station's ground is `#1c1c1c` (029), and many Lugdi days use other grounds (016 navy, 020 jungle).
  - So on most days the colour changes with a flash when the app opens.
- **HIG-41 (no notices in the flow).**
  - 001: "The Hindi is a draft."
  - 028, 056 and 057: "Sample board: the other players are made up for this prototype."
  - 034: "Sample crowd ... Made up for this prototype."
- **HIG-42 (the product name once).**
  - 001 shows the name twice (a small line and a giant title), plus a tagline.
  - 002 and 058 show the "Equal Lens Daily" header line on screens that have other jobs.
- **HIG-43 (tabs).** In 003, 006, 028 and 057 the tabs are text only, and the selected tab is shown only by a thin bar and a bolder weight.
- **HIG-44 (settings in one place).** In 003 and 029 the language switch is a full-width button directly under Play.
- **HIG-45 (word budget).**
  - 001: the brand, a tagline, a label and a notice on a screen with two buttons.
  - 008: the blurb "Keep each line, or cut it?" is followed by the question "Does this line go in the column?".
  - 016: three lines of instructions, 25 words, before the notes even appear.
  - 020: a blurb, a question with an instruction, a quote, a status line and a second question.
- **HIG-46 (one term list).**
  - 040 says "Write both announcements", then "either note" and "Post both notes".
  - 048 says "checks" in the question and "punch it" in the hint, but shows no ticket.
  - The series line drifts: "Ghat Series · No. 212", "Chart 219", "Transfer day 220", "No. 221".
  - The board (057) is headed "PNR slip".
- **HIG-47 (button labels).**
  - 002: "This is me" has no verb.
  - 012, 036 and 044: "Confirm my choice" is generic and says "my".
- **HIG-48 ("you", never "my").**
  - 032: "Your guess" sits above "Lock my guess".
  - 002: "Pick your road name", then "This is me".
- **HIG-49 (no research words on screen).**
  - 028 and 056 use:
    - "Lean size (of 100 · direction hidden)";
    - "How consistency is made";
    - "Matching cases treated alike";
    - "Check gap between matching records";
    - "Word gap between the two notes".
  - 036 and 038 announce the day the brief says is unannounced:
    - the header "Transfer day 220 · A new kind of puzzle";
    - the sign "Nothing about jobs or teams today.";
    - the result "No score today. This one counts quietly in your week."
- **HIG-52 (everyone has a portrait).**
  - Letter tiles stand in for portraits: "J" (031), "F" (048, 049) and "फ" (061).
  - In 036, "N" for "Neither" is drawn as a person card.
- **HIG-54 (play it before sharing it).** The diagnosis records that this is the sixth time work reached the owner before anyone had played it. It also found that the builder never opened its own capture of the language screen (001).

**Already right in EVAL-13, to keep.**
- A consistent minimum tap area on choices, person cards, tabs, words and the slider (`tokens.css`). It is 44 px; the shared number is now 48 px (HIG-8), so the token moves up.
- Reduce Motion support in `tokens.css`.
- The swipe works both by dragging and with buttons.
- The slider runs from 0% on the left to 100% on the right.
- No timers.
- Three labelled tabs.

## 4. Choices for the owner

These are the places where HIG and the approved look, or HIG and an owner decision, pull in different directions. Each now sits, in plain words and with the pictures to show, in the single owner list in [../ux/journeys.md](../ux/journeys.md):

| Was | Now |
|---|---|
| 1. The "Price ₹2" circle on Lugdi covers | OQ-5 |
| 2. A third script on Station signs | OQ-6 |
| 3. What yellow means (HIG-25) | OQ-7 |
| 4. Capitals on Lugdi buttons | OQ-3 |
| 5. A weekly board beside the all-time board | OQ-22 |
| New: Responsibility against the hidden lean direction and unannounced transfer days (HIG-H45) | OQ-14 |
| New: Sunday as one screen or a short sequence (HIG-4) | OQ-2 |
| New: a one-pick step answered on the tap (HIG-11) | OQ-9 |

## Sources

All pages were read on 20 Oct 2026 from Apple's page data. The date shown is the latest change-log entry on each page.

| Page | URL | Latest change |
|---|---|---|
| Design principles (all eight read, including Responsibility and Flexibility, rechecked after the critique) | https://developer.apple.com/design/human-interface-guidelines/design-principles | 8 June 2026 |
| HIG home, Sept 2025 version (hierarchy, harmony, consistency) | https://web.archive.org/web/20250922031220/https://developer.apple.com/tutorials/data/design/human-interface-guidelines.json | archived 22 Sept 2025 |
| WWDC25, Get to know the new design system | https://developer.apple.com/videos/play/wwdc2025/356/ | June 2025 |
| Designing for iOS | https://developer.apple.com/design/human-interface-guidelines/designing-for-ios | not dated |
| Designing for games | https://developer.apple.com/design/human-interface-guidelines/designing-for-games | 9 June 2025 |
| Layout | https://developer.apple.com/design/human-interface-guidelines/layout | 9 Sept 2026 |
| Typography | https://developer.apple.com/design/human-interface-guidelines/typography | 16 Dec 2025 |
| Color | https://developer.apple.com/design/human-interface-guidelines/color | 16 Dec 2025 |
| Dark Mode | https://developer.apple.com/design/human-interface-guidelines/dark-mode | 6 Aug 2024 |
| Accessibility | https://developer.apple.com/design/human-interface-guidelines/accessibility | 9 June 2025 |
| Buttons | https://developer.apple.com/design/human-interface-guidelines/buttons | 16 Dec 2025 |
| Game controls | https://developer.apple.com/design/human-interface-guidelines/game-controls | 9 June 2025 |
| Gestures | https://developer.apple.com/design/human-interface-guidelines/gestures | 9 Sept 2024 |
| Feedback | https://developer.apple.com/design/human-interface-guidelines/feedback | not dated |
| Motion | https://developer.apple.com/design/human-interface-guidelines/motion | 9 Sept 2025 |
| Playing haptics | https://developer.apple.com/design/human-interface-guidelines/playing-haptics | 7 May 2024 |
| Sliders | https://developer.apple.com/design/human-interface-guidelines/sliders | 21 June 2023 |
| Launching | https://developer.apple.com/design/human-interface-guidelines/launching | 10 June 2024 |
| Onboarding | https://developer.apple.com/design/human-interface-guidelines/onboarding | 10 June 2024 |
| Loading | https://developer.apple.com/design/human-interface-guidelines/loading | 9 June 2025 |
| Branding | https://developer.apple.com/design/human-interface-guidelines/branding | 9 Sept 2026 |
| Tab bars | https://developer.apple.com/design/human-interface-guidelines/tab-bars | 8 June 2026 |
| Modality | https://developer.apple.com/design/human-interface-guidelines/modality | 5 Dec 2023 |
| Game Center | https://developer.apple.com/design/human-interface-guidelines/game-center | 9 June 2025 |
| Writing | https://developer.apple.com/design/human-interface-guidelines/writing | 16 Dec 2025 |
| Notifications | https://developer.apple.com/design/human-interface-guidelines/notifications | 24 Oct 2023 |
| Text fields | https://developer.apple.com/design/human-interface-guidelines/text-fields | 5 June 2023 |
| Inclusion | https://developer.apple.com/design/human-interface-guidelines/inclusion | not dated |

**Other inputs.**
- The owner's brief: `Sex Ed/Paper Analysis/Hypotheses/daily-fairness-trainer/brief-2026-10-20.md`.
- The 20 Oct blocks of the resume note in `workplace-gender-training-v2`.
- The read-only diagnosis of the build (scratchpad `diag-feedback.md`, `diag-synthesis.md`, `diag-screens.md`).
- The approved Lugdi and Station samples (scratchpad `ls/shots`, `ls/shots3`).
- The Stage 1 critique: [../ux/critique-stage1.md](../ux/critique-stage1.md).

## Changes after critique

Applied from [../ux/critique-stage1.md](../ux/critique-stage1.md) on 20 Oct 2026.

- **Ids (should-fix 3).** Principles are HIG-H1 to HIG-H46 and rules HIG-1 to HIG-56; the findings in section 3 use the same ids.
- **Must-fix 1.** HIG-26 adopts the WCAG thresholds (24 px, or 18.66 px bold, for large text) and keeps 7:1 for text on plates. HIG-H16 says why Apple's table is looser.
- **Must-fix 4.** HIG-3 (the 25% title band) and HIG-6 (the 160 px art band) are removed, with stubs so the numbers do not shift. Art on every screen follows M3-36 with the UA-2 test.
- **Must-fix 5.** HIG-37 and HIG-44: the cover chip is the language switch's only home; settings live in the "?" sheet.
- **Must-fix 7.** HIG-11, HIG-17 and HIG-38 follow the one step model in the usability digest (2.0a): a muted, focusable not-ready button that names what is missing, and no hint text in the first build.
- **Must-fix 8 and 9.** HIG-8 (48 px), HIG-9 (8 and 12 px), HIG-20 (16 px body, 14 px floor), HIG-22 (Devanagari display at 32 px and up) and the test sizes use the shared numbers. HIG-2 carries the 200% text exception. HIG-4 sends Sunday's shape to OQ-2.
- **Must-fix 3 and 6.** HIG-49 no longer fixes the lean as a picture (OQ-1); HIG-22, HIG-25 and HIG-47 point to OQ-3 and OQ-7.
- **Should-fix 1.** Back control at top left (HIG-13); board from the tab only (HIG-43); one motion rule with still versions (HIG-33, HIG-34); undo for 5 s (HIG-19).
- **Should-fix 2.** HIG-40 no longer saves tomorrow's puzzle in advance, only its art and fonts (OQ-27).
- **Should-fix 11.** Added Apple's two missing principles, Responsibility (HIG-H45) and Flexibility (HIG-H46), with rules HIG-55 and HIG-56, and put the transparency tension to the owner (OQ-14).
- **Should-fix 14.** Section 4 points to the single owner list.
