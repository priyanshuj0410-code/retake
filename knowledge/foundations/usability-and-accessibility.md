---
type: research
title: Usability and accessibility for Equal Lens Daily
description: WCAG 2.2 AA criteria that matter for a one-handed touch game, Android and TalkBack, colour-blind safety, reduced motion, readable Devanagari, low-end phones and patchy data in India, reach zones, interruption and resume, and usability testing, turned into numbered, testable rules for Equal Lens Daily, with every rule the EVAL-13 build broke traced to its screenshots.
plane_issues: [https://app.plane.so/the-equal-lens/browse/EVAL-14/]
sources_checked: 2026-10-20
---

# Usability and accessibility for Equal Lens Daily

This digest covers the parts of usability and accessibility that decide whether an adult in India can play one fairness puzzle a day, on a cheap Android phone, with one thumb, on a bus, in English or Hindi, with or without a screen reader. It is not a WCAG summary: criteria that do not touch this product are left out.

Sibling digests in this folder cover the same ground from other angles. Read them alongside this one: [material-3.md](material-3.md), [apple-hig.md](apple-hig.md), [perception-and-heuristics.md](perception-and-heuristics.md), [ux-writing.md](ux-writing.md) and [daily-game-patterns.md](daily-game-patterns.md). The design system these rules feed is [../design.md](../design.md).

**Ids and shared parts (after the Stage 1 critique).**
- Every id carries its digest's prefix, so no two files share one: DG (daily-game patterns), HIG (Apple HIG), M3 (Material 3), PH (perception and heuristics), UXW (UX writing), UA (this file). Here, principles are UA-P1 to UA-P40 and rules UA-1 to UA-47.
- **Section 2.0 of this file is shared by all six digests.** It holds the one step model for a puzzle step, the one set of size and timing numbers, and the small conflicts the critique asked to settle. Where another digest gave a different answer, it now points here.
- **Owner questions** live in one deduplicated list in [../ux/journeys.md](../ux/journeys.md), as OQ-1 to OQ-30. This file no longer keeps its own list.
- **Old evidence.** The owner asked for 2024 to 2026 material. A source dated before 2024 with no newer replacement found is marked "old, owner to accept".
- **House numbers.** A figure we chose, not one a source gives, is marked HOUSE.

## How this was read

- **Sources.** Every page cited below was fetched with curl on 20 Oct 2026 and read as raw text. Apple's HIG was read from the JSON data its pages load. Quotes are under 15 words; the rest is paraphrase.
- **Not readable by script, so marked UNVERIFIED where used:** Ericsson's Mobility Report pages and Opensignal's India reports (both answered with a bot check, which I did not try to get round), and the Material 3 site (it draws its pages with script; [material-3.md](material-3.md) read its content files, I did not re-read them).
- **Build evidence.** The EVAL-13 screenshots in `/Users/priyanshu/equal-lens-trainer/out/trainer-shots/` (390 CSS px wide, drawn at 2x). Code was read at commit `7902955` with `git show`. The working tree now holds newer, uncommitted changes, which this digest does not judge.
- **My own measurements**, marked "measured":
  - colours and sizes sampled from the screenshot pixels;
  - computed font sizes, line heights, page heights and button positions from a clean export of commit `7902955`, run at 320 and 360 CSS px in English and Hindi;
  - the vertical size of Hind and Sarpanch glyphs, read from the shipped font files with fontTools.

---

## 1. The principles that matter here

Each principle gives what it says (paraphrased), its source, and why it matters for this product.

### 1.1 Seeing: contrast and colour

**UA-P1. Text contrast (WCAG 1.4.3, AA).**
- *What it says:* normal text needs at least 4.5:1 against its background. Large text needs 3:1; large means about 24 px, or about 18.7 px bold. Text that is pure decoration, or inside an inactive control, is exempt.
- *Source:* https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- *Why here:* players read on a moving bus, often in daylight, on cheap screens with low brightness. The approved Lugdi samples put titles and plates over a full-bleed painting, where contrast changes from pixel to pixel.

**UA-P2. Contrast of controls and states (WCAG 1.4.11, AA).**
- *What it says:* anything a person needs to see to find a control, or to tell its state, must reach 3:1 against the colours next to it. That covers its edge, a tick, or the fill that shows "selected". Inactive controls are exempt.
- *Source:* https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- *Why here:* the game is mostly states: chosen, not chosen, empty slot, spent check, locked rule, today in the streak. If a state cannot be seen, the puzzle cannot be played.

**UA-P3. Never colour alone (WCAG 1.4.1, A; Apple HIG).**
- *What it says:* colour must not be the only way to show information, an action or a state. Apple's HIG says the same thing for colour-blind players: give the same information another way.
- *Sources:* https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html and https://developer.apple.com/design/human-interface-guidelines/color
- *How common:* Colour Blind Awareness, a UK charity, puts colour blindness at about 1 in 12 men and 1 in 200 women (https://www.colourblindawareness.org/colour-blindness/). UNVERIFIED for adult Indians: I found no recent national prevalence study in raw text.
- *Why here:* the palette is yellow, red, black, white and blue. Red against yellow is about 3.4:1 in luminance (measured), and many people with red-green colour blindness cannot tell those two hues apart. White against yellow is only 1.4:1 (measured).

### 1.2 Touch and reach

**UA-P4. Minimum target size (WCAG 2.5.8, AA, new in 2.2).**
- *What it says:* a tap target must be at least 24 by 24 CSS px. A smaller one passes only if a 24 px circle centred on it does not overlap any other target. Text links inside a sentence, and controls the browser draws itself, are exempt.
- *Source:* https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- *Why here:* 24 px is the legal floor, not a good size for a thumb.

**UA-P5. The comfortable size: 44 to 48.**
- *WCAG 2.5.5 (AAA):* at least 44 by 44 CSS px (https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html).
- *Android:* every touch target at least 48 dp by 48 dp, and the guide adds that larger is better (https://developer.android.com/guide/topics/ui/accessibility/apps). One dp is about one pixel on a 160 dpi screen (https://developer.android.com/training/multiscreen/screendensities), so 48 dp is about 7.6 mm. On a phone, a CSS px is about one dp.
- *Apple HIG:* a hit region of at least 44 by 44 pt, with 28 pt as the floor. It also says about 12 pt of padding works around a bordered control, and about 24 pt around one without a border (https://developer.apple.com/design/human-interface-guidelines/accessibility and https://developer.apple.com/design/human-interface-guidelines/buttons).
- *Material 3:* also 48 dp; see [material-3.md](material-3.md), M3-P14.
- *Why here:* most players are on Android, so the Android figure is the one to build to.

**UA-P6. The edges of the screen are harder to hit (Hoober, 2013; old, owner to accept).**
- *What it says:* taps near the top and bottom edges are less accurate, slower and less confident than taps in the middle. The left and right edges are only slightly worse. Hoober puts targets in the centre as close as 7 mm apart, centre to centre, and 10 to 12 mm apart near the top and bottom edges. At 160 dpi, 10 to 12 mm is about 63 to 76 CSS px.
- *Source:* https://www.uxmatters.com/mt/archives/2013/11/design-for-fingers-and-thumbs-instead-of-touch.php
- *Later citation:* a 2023 Smashing Magazine cheatsheet quotes his later book as 11 mm at the top, 12 mm at the bottom and 7 mm in the centre (https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/). That is a secondary source; I did not read the book.
- *Why here:* the main button lives at the bottom edge, where errors are most likely, so it needs extra height and space.

**UA-P7. No gesture-only or drag-only actions (WCAG 2.5.1, A, and 2.5.7, AA, new in 2.2).**
- *What it says:* anything done with a swipe, a path or several fingers must also be possible with a single tap (2.5.1). Anything done by dragging must also be possible with one pointer and no drag, unless the drag is essential (2.5.7).
- *Sources:* https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html and https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html
- *Apple HIG:* also asks for simple gestures for common actions.
- *Why here:* the mechanics include a quick-sort swipe card, a crowd-prediction slider and ranking. TalkBack uses one-finger swipes for itself (UA-P27), so a swipe-only card cannot be played with it on.

**UA-P8. Put buttons where they can be reached, and important things before the scroll (W3C mobile note, 2015; old, owner to accept).** W3C's newer Group Draft Note on applying WCAG 2.2 to mobile apps (6 May 2025, in the sources) was not checked for this point.
- *What it says:* designing for one hand helps people with only one hand free, but left and right hands differ, so keep layouts flexible. Put important information where it shows without scrolling: that helps people using screen magnifiers and people with short-term memory problems.
- *Source:* https://www.w3.org/TR/mobile-accessibility-mapping/ (sections 3.5 and 4.3)
- *Why here:* a commuter holding a strap plays with one thumb. A commit button below the fold costs a scroll on every step.

### 1.3 Reading, resizing and scripts

**UA-P9. Type sizes (Apple HIG).**
- *What it says:* on iPhone, body text defaults to 17 pt, and 11 pt is the smallest the HIG lists. Font weight also changes how easy text is to read.
- *Source:* https://developer.apple.com/design/human-interface-guidelines/typography
- *Why here:* the HIG's 11 pt is a floor for short system labels, not a target. Hindi needs more room than Latin (UA-P15).

**UA-P10. Text must grow to 200% (WCAG 1.4.4, AA), and Android lets it.**
- *WCAG:* text must be resizable to 200% without losing content or function (https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html).
- *Android 14:* system font size goes up to 200%, with large text growing less than small text (https://developer.android.com/about/versions/14/features).
- *Chrome:* by default, Chrome on Android does not apply the system font size to web pages; Firefox does. Chrome is adding an opt-in tag, `<meta name="text-scale" content="scale">`, and it works only if the page avoids fixed pixel font sizes (Adrian Roselli, Feb 2026, https://adrianroselli.com/2026/02/honoring-mobile-os-text-size.html). Roselli tested it in Chrome Canary. Whether it is in stable Chrome today is UNVERIFIED.
- *Why here:* older players and players with low vision set large text on their phones. A page fixed in px ignores that setting.

**UA-P11. Text spacing (WCAG 1.4.12, AA).**
- *What it says:* nothing may be lost when a player forces these settings:
  - line height to 1.5 times the font size;
  - space after paragraphs to 2 times;
  - letter spacing to 0.12 times;
  - word spacing to 0.16 times.
- *Source:* https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html
- *Why here:* fixed-height slots, chips and plates clip text as soon as it grows.

**UA-P12. Reflow at 320 px (WCAG 1.4.10, AA).**
- *What it says:* content must work at 320 CSS px wide with no scrolling in two directions.
- *Source:* https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- *Why here:* small Androids are 360 px wide, and Hindi strings run longer than English.

**UA-P13. Do not lock orientation (WCAG 1.3.4, AA).**
- *What it says:* do not force portrait or landscape unless one is essential. Some people have their phone fixed in a mount and cannot turn it.
- *Source:* https://www.w3.org/WAI/WCAG22/Understanding/orientation.html
- *Why here:* a daily puzzle does not need portrait. A web app manifest that sets `"orientation": "portrait"` locks the installed app.

**UA-P14. Mark the language of every part (WCAG 3.1.2, AA).**
- *What it says:* a screen reader can only choose the right voice and pronunciation if each phrase in another language is marked with that language.
- *Source:* https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html
- *Why here:* Station boards carry Gujarati, Bengali, Tamil and Telugu lines, and Hindi screens carry English words.

**UA-P15. Devanagari needs more height than Latin.**
- *W3C:* the W3C's Devanagari gap analysis notes that Indian scripts often come out a different physical size from Latin at the same font size, which upsets alignment when the two are mixed (https://www.w3.org/TR/deva-gap/, section 7.4).
- *An old real-world case (2013):* a Wikimedia bug report found Hindi vowel marks cut off by a fixed 14 px line height. Raising it to 17 px fixed it (https://phabricator.wikimedia.org/T57995).
- *Measured in the fonts this app ships:*
  - **Hind.** Devanagari letters with the headline stand 0.64 em tall, almost the same as Latin capitals at 0.67 em. Hindi does not need a bigger font size to look the same size. But the marks above and below go much further: Devanagari glyphs span 1.44 em at weight 400 and 1.56 em at weight 700, against 0.99 em for Latin letters.
  - **Sarpanch,** the display face, spans 1.48 em in Devanagari against 0.94 em in Latin.
- *Why here:* a line height of 1.05 or 1.25 suits Latin, but stacks Hindi vowel marks into the line above.

### 1.4 Motion

**UA-P16. Let players turn motion off (WCAG 2.3.3, AAA; MDN; Apple HIG).**
- *WCAG:* motion triggered by a tap can be turned off unless it is essential. For people with vestibular disorders, motion can cause dizziness, nausea and migraines (https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).
- *MDN:* `prefers-reduced-motion` reports the phone's setting. On Android 9 and later that setting is Settings, Accessibility, Remove animations (https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).
- *Apple HIG:* when Reduce Motion is on, cut zooming, scaling and motion at the edges of the screen.
- *Why here:* the skins invite motion: split-flap boards, stamps, tilted plates and ticket punches. A commuter on a moving bus is already prone to motion sickness.

### 1.5 Knowing what is going on

**UA-P17. Text alternatives (WCAG 1.1.1, A).**
- *What it says:* every picture that carries meaning has a text alternative that does the same job. Pure decoration is hidden from screen readers.
- *Source:* https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html
- *Why here:* portraits, cover paintings, streak marks and punch holes all either carry meaning or are decoration, and each needs to be treated as one or the other.

**UA-P18. Status messages (WCAG 4.1.3, AA).**
- *What it says:* results, progress and errors must reach a screen reader without moving the reading position to them.
- *Source:* https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
- *Why here:* "2 checks left", "4 of 6 picked" and "Rule locked" change after each tap.

**UA-P19. The spoken name contains the visible label (WCAG 2.5.3, A).**
- *What it says:* a control's spoken name includes its visible words, ideally at the start, so voice users can say what they see.
- *Source:* https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html

**UA-P20. Consistent navigation (WCAG 3.2.3, AA).**
- *What it says:* navigation that repeats across screens keeps the same order each time.
- *Source:* https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html

**UA-P21. Consistent identification (WCAG 3.2.4, AA).**
- *What it says:* parts with the same job are identified the same way everywhere. People can then carry what they learn from one screen to the next.
- *Source:* https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html
- *Why here:* a game that changes object every day has to keep the same controls in the same look and place. Otherwise every day starts from zero.

**UA-P22. Focus that shows and is not covered (WCAG 2.4.7, AA, and 2.4.11, AA, new in 2.2).**
- *What it says:* the item with focus shows a visible indicator (2.4.7). It must not be fully hidden by the page's own content, such as a pinned bar (2.4.11).
- *Sources:* https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html and https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html
- *Why here:* switch users and people with keyboards attached to their phones use focus. A pinned main button can cover the item that has focus.

**UA-P23. Help in the same place (WCAG 3.2.6, A, new in 2.2).**
- *What it says:* if help is offered on several screens, it sits in the same relative place on each.
- *Source:* https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html

**UA-P24. Four of Nielsen's heuristics (NN/g; updated 2020, unchanged since 1994).**
- *1, visibility of system status:* keep players informed through feedback within a reasonable time.
- *3, user control and freedom:* give a clearly marked emergency exit, and support undo.
- *5, error prevention:* remove error-prone conditions, or confirm before the player commits.
- *6, recognition rather than recall:* keep the options and the state visible, so nothing has to be remembered from one part of the screen to another.
- *Source:* https://www.nngroup.com/articles/ten-usability-heuristics/
- *Fuller treatment:* [perception-and-heuristics.md](perception-and-heuristics.md).

**UA-P25. Disabled buttons leave people stuck (Smashing Magazine, 2021).**
- *What it says:* a greyed-out button says something is wrong, but not what. Explain what is missing next to it, or keep it enabled and explain on tap.
- *Source:* https://www.smashingmagazine.com/2021/08/frustrating-design-patterns-disabled-buttons/
- *Why here:* every puzzle step in EVAL-13 opens with a dead, dashed commit button.

### 1.6 Screen readers on Android

**UA-P26. In Asia, screen reader users are mostly on Android (WebAIM survey 10, Dec 2023 to Jan 2024).**
- *Overall:* the survey had 1,539 valid responses. Of the 1,511 who answered the question, 91.3% (1,379) use a screen reader on a phone. 70.6% are on iOS and 27.6% on Android.
- *By region:* iOS use was 84% in North America, but only 40% in Asia, 34% in Africa and the Middle East, and 31% in South America. 34.7% use TalkBack.
- *Caveat:* the sample was not controlled, and Asia had only 97 respondents (6.4%), so the Asian figure is thin (checked against the raw page, 20 Oct 2026).
- *Source:* https://webaim.org/projects/screenreadersurvey10/
- *Why here:* combine this with India's 94% Android share (UA-P29) and TalkBack in Chrome is the screen-reader set-up to design and test for.

**UA-P27. How TalkBack is used (Google support).**
- *Moving:* swipe right or left to move to the next or previous item; drag a finger to hear what is under it.
- *Acting:* double-tap to activate. Scrolling takes two fingers. A slider moves with up and down swipes.
- *Source:* https://support.google.com/accessibility/android/answer/6151827
- *What follows (my inference from the gesture table):* with TalkBack on, a page's own one-finger swipe never reaches the page, and every item the player swipes through is one more step.

**UA-P28. Google's TalkBack check (Android developers).**
- *What to check, swiping through every element in order:*
  - each spoken label gives the content or purpose;
  - announcements are short, not wordy;
  - the main flows can be finished;
  - every element can be reached by swiping;
  - temporary messages are read aloud.
- *Source:* https://developer.android.com/guide/topics/ui/accessibility/testing

### 1.7 Phones and networks in India, 2024 to 2026

**UA-P29. Android is the platform.**
- *What it says:* in September 2026, Android had 93.89% of mobile operating system share in India, and iOS 6.05% (StatCounter, which counts page views, not people).
- *Source:* https://gs.statcounter.com/os-market-share/mobile/india

**UA-P30. Most phones sold are cheap (IDC, Feb 2026).**
- *2025 shipments:* 152 million smartphones. 16% cost under US$100 and 41% cost US$100 to 200, so 57% sold for under US$200. The average price rose to US$282.
- *2026:* IDC expects volumes to fall, because a memory shortage is pushing prices up.
- *Source:* https://www.idc.com/resource-center/press-releases/india-smartphone-market-2025-2026/
- *Why here:* the typical player's phone is a budget Android with a slow processor, not the developer's phone.

**UA-P31. Women in India are less likely to own a smartphone, and often borrow one (GSMA Mobile Gender Gap Report 2025).**
- *Ownership:* in India, the gender gap in smartphone ownership widened from 32% in 2023 to 39% in 2024. Men's ownership rose slightly; women's did not.
- *Borrowing:* 18% of Indian women who use mobile internet use it only on someone else's phone, against 7% of men.
- *Source:* https://www.gsma.com/wp-content/uploads/2025/12/The-Mobile-Gender-Gap-Report-2025.pdf (the smartphone ownership and phone borrowing sections)
- *Why here:* for a gender-equality game, a shared phone is a privacy issue. The private Sunday note, and anything else private, must not be on show to the next person who opens the app.

**UA-P32. A baseline phone and network to build for (Alex Russell, "The Performance Inequality Gap, 2026", Nov 2025).**
- *Network:* to match the 75th-percentile user, test at 9 Mbps down, 3 Mbps up and 100 ms round trip.
- *Phone:* a Samsung Galaxy A24 4G or similar. Budget phone processors have not got meaningfully faster since 2022.
- *Budget:* for a page whose bytes are half JavaScript, a 3-second load allows about 1.2 MiB of critical-path bytes, of which 0.62 MiB is script. Fewer connections leave more room.
- *Source:* https://infrequently.org/2025/11/performance-inequality-gap-2026/

**UA-P33. UNVERIFIED context (pages blocked to scripted reads).**
- *Ericsson:* the November 2025 Mobility Report reportedly puts India's average use at about 37 GB per smartphone per month.
- *Opensignal:* its February 2026 India report reportedly covers falling 5G speeds under congestion.
- *Status:* I could not read either page as raw text. Do not cite these numbers until someone reads the reports themselves.

### 1.8 Interruptions, resume and offline

**UA-P34. Phones get interrupted, so save state (NN/g, 2015; old, owner to accept).**
- *What it says:* mobile sessions are short, averaging 72 seconds against 150 on desktop. Save state at all times, let people pick up where they left off without redoing work, and put the gist before the detail.
- *Source:* https://www.nngroup.com/articles/mobile-ux/
- *Why here:* a 5 to 7 minute puzzle on a commute will be broken by a stop, a call or a WhatsApp message.

**UA-P35. Treat "hidden" as the end of the session (Chrome Page Lifecycle, updated Oct 2026).**
- *What it says:* browsers freeze or discard background pages to save memory. On a phone, the move to hidden is often the last event a page can rely on, because closing the tab or the app fires no later events. Save everything unsaved at that point. A discarded page must reload to be used again.
- *Source:* https://developer.chrome.com/docs/web-platform/page-lifecycle-api
- *Why here:* low-memory Androids discard background tabs often.

**UA-P36. Say what works offline (web.dev, 2016; old, owner to accept).**
- *What it says:*
  - tell people the app's state and what they can still do;
  - cache by default when the data is small;
  - say whose end the connection problem is on.
- *Source:* https://web.dev/articles/offline-ux-design-guidelines

### 1.9 Usability testing

**UA-P37. Five people per group (NN/g, 2012; old, owner to accept).**
- *What it says:* a qualitative test with 5 people finds almost as many problems as a much larger one, and the same holds for mobile apps. When groups differ, test 3 to 5 from each.
- *Source:* https://www.nngroup.com/articles/how-many-test-users/
- *Why here:* English and Hindi players are two groups. TalkBack users and players with large text are worth one or two sessions each.

### 1.10 Gaps the critique found (added 20 Oct 2026)

**UA-P38. Game accessibility has its own checklist (Game Accessibility Guidelines).**
- *What it says:* a list written by a group of studios, specialists and academics, sorted into basic items (easy to do, wide reaching, fit for almost any mechanic), intermediate items (some planning) and advanced items (complex adaptations). Basic items that touch this game include:
  - no essential information carried by a fixed colour alone;
  - interactive elements large and well spaced, above all on small touch screens;
  - simple, clear language and text formatting, and an easily readable default font size;
  - players move through text at their own pace;
  - no flickering images or repetitive patterns;
  - a toggle for any haptics;
  - every setting saved and remembered.
- *Intermediate items that touch it:* an autosave; a reminder of the current objective during play; contextual in-game help; a way to practise without failing; a clear sign that interactive elements are interactive; no essential information (above all instructions) carried by text alone; people with impairments among the playtesters.
- *Source:* https://gameaccessibilityguidelines.com/full-list/ (read raw, 20 Oct 2026). The page gives no date in its text, so its age is UNVERIFIED.
- *Why here:* WCAG is written for web pages. This list is written for games, and several items (practise without failing, a reminder of the objective) answer questions WCAG does not ask.

**UA-P39. Trauma-informed design (Chayn).**
- *What it says:* Chayn, a charity working on gender-based violence, says its trauma-informed design principles shape everything from its HR to its product design, and publishes them in a white paper (the year is UNVERIFIED). A Welsh charity's guide lists the eight principles as safety, agency, equity, privacy, accountability, plurality, sharing power and hope, and adds practical steps:
  - make spaces calm, positive and affirming;
  - give people control over how and when they meet information;
  - for people who may be at risk at home, offer a clear, large exit in the same place on every page;
  - co-design with the people affected, and treat every interaction as an intervention.
- *Sources:* https://org.chayn.co/research (the white paper is listed there; its full text was not read, so the definitions of each principle are UNVERIFIED) and https://promo.cymru/?p=18736 (Promo Cymru, which lists the eight principles from a Catalyst guide; undated in its text, UNVERIFIED date).
- *Why here:* the owner chose to address dowry, custody and safety directly. Players such as P3 and P6 may be living what the puzzle shows, and the phone may be shared with the person the puzzle is about.

**UA-P40. Notice and consent under India's data law (DPDP Act 2023 and Rules 2025).**
- *What it says:*
  - The Act asks for consent requests in clear, plain language, in English or an Eighth Schedule language, with withdrawal about as easy as giving consent (s.6(3) and s.6(4), as read raw for the journeys, source D1).
  - The Digital Personal Data Protection Rules 2025 (G.S.R. 846(E), notified 13 November 2025), Rule 3: the notice must be understandable on its own, without other information; must give, in clear and plain language, an itemised description of the personal data and the specified purpose; and must say how to withdraw consent with ease comparable to giving it, how to exercise rights and how to complain to the Board.
  - Rule 10: verifiable consent of a parent is needed before processing any child's personal data.
  - Rules 3 and 10 come into force 18 months after publication (Rule 1(4)), that is, from about May 2027 by my count. Which sections of the Act itself are in force today was not checked (UNVERIFIED).
- *Source:* the Gazette text, https://egazette.gov.in/WriteReadData/2025/267650.pdf (read raw, 20 Oct 2026).
- *Why here:* the board, friends and play-day dates need a server. A notice that must stand alone and be itemised has to be designed into the flow without breaking the owner's minimal-text rule. A lawyer still has to advise on children (brief).

---

## 2. Rules for Equal Lens Daily

Each rule is binding for the rebuild and ends with how to test it. Where a rule conflicts with an approved sample or an owner decision, it says so. That trade goes to the owner as a choice with pictures, not settled silently; it is listed in the single owner list in [../ux/journeys.md](../ux/journeys.md).

### 2.0 Shared across all six digests

The critique found the six digests giving different answers to the same questions. This section gives one answer for each. The other five digests point here.

#### 2.0a One step model for every puzzle step

1. **Pick.** The player answers by tapping the thing itself: a person, a rule chip, a slot, a word, a ticket. The tap shows the selected state at once (UA-5). Tapping it again, or tapping another, changes the pick. Nothing moves on by itself.
2. **Commit.** One main button, pinned at the bottom in the same place on every step, names what will happen: "Send Kamla", "Lock rule", "Punch 2 tickets". One tap on it commits the step and brings the next step or the result. There is never a separate "Next" after a commit, and the same answer is never asked for twice.
   - Whether a step with a single pick may skip the button, so that tapping a name answers at once as in approved sample p02, is owner question OQ-9. Until the owner answers, this model applies to every step.
3. **Not ready.** Until the step can be committed, the main button stays in its place and keeps its shape:
   - a muted fill, with a label at 4.5:1 or better that names what is missing in 4 words or fewer ("Pick 2 more");
   - it stays focusable (`aria-disabled`); a tap on it pulses the empty place once, and TalkBack reads the label;
   - it is never dashed and never hidden, and there is never more than one on screen;
   - a two-stage mechanic (lock a rule, then hand out jobs) shows only the current stage's button.
4. **Teaching.** There are no instruction sentences and, in the first build, no hint text.
   - The board teaches: empty slots, and one pulse on the first target (at most 3 pulses, then still; HOUSE).
   - On a mechanic's first day, one ghost demonstration plays the gesture on the real board in 1.5 s or less (HOUSE). A tap skips it. Under reduced motion, a still drawing of the gesture is shown once instead.
   - If the five-player test (UA-43) shows a mechanic cannot be learnt this way, that mechanic gets one hint of 6 words or fewer beside its first target, on the first meeting only.
   - How to play sits behind "?" and opens only when tapped.
5. **Way out.** A back control at the top left, with a 48 px target, returns to the previous step with its answers kept, or from the first step to the cover with progress kept. A committed step shows its answer and cannot be changed. Every state survives refresh, an app switch and an interruption (UA-34).
6. **Feedback.** A refused move shows where it happened: the seat row shakes once, and a reason of 4 words or fewer sits beside it until the next tap. Counts are marks inside the object (punch holes, empty seats), and changes are announced as polite status messages (UA-25).

This model replaces the rules that disagreed: DG-7, DG-8 and DG-13; HIG-11, HIG-17 and HIG-38; M3-27 and M3-34; PH-13 and PH-25; UXW-3 and UXW-12; and UA-29 below.

#### 2.0b One set of numbers

The design-system stage confirms these in its own table. Until then every digest uses them.

| Item | Value |
|---|---|
| Touch target | 48 x 48 CSS px including padding; the visible shape may be smaller |
| Gap between targets | at least 8 px; 12 px between neighbours that both have a visible edge |
| Main button | 56 px tall, full width less the 16 px gutters, 16 to 24 px above the bottom safe area |
| Type floor | 14 px for any live text; lettering drawn into a painting is art, not text |
| Body text | 16 px |
| Question | 20 px or more (the M3 digest proposes 24) |
| Text styles | at most 6 in the product, at most 4 on any one screen |
| Display face | titles only: Latin at 28 px and up, Devanagari at 32 px and up |
| Contrast | WCAG 1.4.3: text under 24 px (18.66 px bold) at 4.5:1, larger text at 3:1; text on plates, tickets and sheets at 7:1 (HOUSE); control edges and state marks at 3:1 |
| Motion | press feedback within 100 ms; any movement after a tap ends within 400 ms; three named longer moments, all HOUSE, all skippable by a tap, each with a still version under reduced motion: the result reveal (1.2 s or less), the ghost demonstration (1.5 s or less), a milestone (2 s or less) |
| Toasts | the message also shows in place; a toast stays at least 4 s, then goes on the next tap or at 10 s; each is a polite status message |
| Undo | visible for at least 5 s (HOUSE) |
| No-scroll rules | every puzzle step fits the test sizes without scrolling; at 200% text a step may scroll, but the main button stays pinned and reachable (UA-16) |
| Test sizes | 360 x 640 and 390 x 844 CSS px, each also at 200% text |

#### 2.0c Smaller conflicts, settled

| Question | Answer for every digest |
|---|---|
| Where the streak shows | Two places: a small count in the cover's top bar, and this week's marks on the day result (DG-29). Sunday's day objects show the week; they are not a third streak strip |
| Counters | Marks inside the object, never "2/6" text. TalkBack hears the count as words ("2 of 6 picked") |
| Dashed outline | Means only an empty puzzle slot to fill. Days not yet played are never dashed |
| Portrait text alternative | Hidden when the person's name shows as text in the same card (the card is one stop, UA-24). Where no name shows, the alternative is the name only |
| Way out | The back control at the top left (2.0a, point 5) |
| Board | Reached from the Board tab only (Today, Board, Week), not also from a cover icon |
| Language switch | One home: a small chip in the cover's top bar, showing both options with the current one marked ("EN \| हिं") |
| Settings | One place: the "?" sheet holds how to play, then reminders, road name, privacy and delete. Language is not there |
| Undo time | At least 5 s (HOUSE) |
| "My" on labels | Never: "Delete notes", not "Delete my notes" |

### A. Seeing

**UA-1. Text contrast.**
- Text on a plate, ticket or sheet reaches at least 7:1, a house rule for reading in daylight (HOUSE). Other text under 24 px, or under 18.66 px bold, reaches at least 4.5:1.
- Text of at least 24 px, or 18.66 px bold, reaches at least 3:1.
- Contrast is measured against the rendered background, not the token pair. (UA-P1)
- *Test:* a contrast script reads every text node against the pixels behind it.

**UA-2. Text over a painting.** This is the one test for art behind text on every screen, used with M3-36 (the painting is never shrunk to make room).
- Text may sit on the painting (the approved Lugdi look) only on a plate, tint or band.
- The darkest and lightest 5% of painting pixels under each line must still pass UA-1. (UA-P1)
- *Test:* sample the rendered pixels under each line at 360 and 390 px.

**UA-3. Edges and states at 3:1.**
- Every control edge, slot edge and state mark reaches 3:1 against what touches it.
- A "selected" fill reaches 3:1 against the page ground, so a chosen card never melts into the page.
- Thin dashed or dotted strokes aim for 4.5:1, because breaking the line weakens it (HOUSE). (UA-P2)
- *Test:* pixel sampling on each state screenshot.

**UA-4. No meaning by colour alone.**
- Every state is shown by colour plus at least one of: a mark (tick, punch hole, stamp), a shape change, or words.
- Red against yellow, and white against yellow, are never the only difference. The forgiven streak day has its own shape and a word (DG-28). (UA-P3, UA-P38)
- *Test:* each state screenshot in greyscale and through a protanopia and deuteranopia simulator. All states must still be told apart.

**UA-5. Chosen looks more "on", never "off".**
- A chosen card keeps or brightens its fill and gains a tick and a heavier frame, and its spoken state says "chosen".
- Unchosen cards stay exactly as they were before the choice.
- Nothing turns dashed, dark or faded because something else was chosen.
- Before a choice, every person card looks the same (owner decision, 20 Oct). (UA-P2, UA-P24)
- *Test:* compare "arrive" and "ready" screenshots. Only the chosen items may change.

### B. Touch and reach

**UA-6. Target size.**
- Every tappable thing is at least 48 by 48 CSS px including its padding (2.0b).
- Neighbours are at least 8 px apart; bordered controls in a row at least 12 px.
- Visual size can be smaller than the target. (UA-P4, UA-P5)
- *Test:* a script lists every `button`, `[role=button]`, `[role=radio]` and `a` on each screen with its box.

**UA-7. The main action sits in the thumb's zone.**
- Each screen has one main action, pinned to the bottom 16 to 24 px above the phone's safe area. It is full width less the 16 px gutters and 56 px tall.
- It sits in the same place on every day and in both skins.
- Nothing else tappable sits within 16 px of it. On screens with the tab bar, it sits at least 16 px above the bar. (UA-P6, UA-P8)
- *Test:* at 360 by 640 and 390 by 844, the main action's box sits fully inside the viewport, without scrolling, on every step of all 14 days.

**UA-8. One step fits one screen.**
- The question, everyone in it and the main action fit on a 360 by 640 screen, and on a 390 by 844 screen, for every mechanic, in English and in Hindi.
- If a step cannot fit, split it into two steps rather than make it scroll.
- At 200% text a step may scroll, with the main action pinned (UA-16).
- The Board may scroll. Sunday's shape is owner question OQ-2 (one screen as in the samples, or a short sequence); whichever is chosen, no single screen of it scrolls more than once. (UA-P8, UA-P34)
- *Test:* page height of every step at 360 by 640 is at most 640.

**UA-9. No gesture-only or drag-only actions.**
- Every swipe, drag, long press or two-finger action has a visible one-tap twin on the same screen.
- The quick-sort card keeps its two buttons.
- The crowd slider gets tap chips for 0 to 100 in steps of 10, as in approved sample shots3 p14, or minus and plus steppers. (How the bands are laid out is OQ-10.)
- Ranking is done by tapping. (UA-P7)
- *Test:* play every mechanic with taps only, and again with TalkBack on.

**UA-10. Two-tap moves show their state.**
- Where a move takes two taps ("a person, then a job"), the first tap lifts the item and marks it with a tick, and the valid targets light up.
- A second tap on the same item cancels.
- TalkBack says, for example, "Meena picked, choose a job".
- The armed item stays visible while the targets are tapped, so no instruction sentence is needed. (UA-P24, recognition rather than recall)
- *Test:* a first-time player completes the move without reading any instruction.

**UA-11. The player stays in control.**
- Every puzzle step has the back control at the top left, the same every day, which keeps the answers given so far (2.0a, point 5).
- Every choice can be changed until the main action is pressed, and nothing moves on by itself (owner rule, 19 Oct).
- The main action names its consequence where it can, for example "Appoint Farida" rather than "Appoint". (UA-P24)
- *Test:* on each step, change a choice, leave, come back. The choices are intact.

**UA-12. Destructive actions look different and can be undone.**
- Removing a friend, deleting notes or deleting everything are text-style actions, away from the main action.
- Each either asks once or offers Undo for at least 5 seconds (HOUSE). (UA-P24, error prevention)
- *Test:* each destructive action can be reversed or needs a second, separate tap.

### C. Reading, size and scripts

**UA-13. Type floor.**
- Body text is at least 16 px, and no live text is ever under 14 px: table headers, kickers, tags, stat labels and notices included (2.0b).
- Numbers players compare (stats, scores) are at least 20 px. (UA-P9)
- *Conflict:* the approved samples, drawn at 340 px wide, have stat labels of about 9 to 10 px. This goes to the owner as OQ-10.
- *Test:* a script lists computed font sizes under 14 px; the list must be empty.

**UA-14. Hindi body and labels.**
- Hind Devanagari runs at the same pixel size as English.
- Line height is at least 1.6 for anything that can wrap, and at least 1.4 for single-line labels. Line heights are unitless, never fixed px.
- Wrapped Hindi labels inside fixed-height boxes are not allowed. (UA-P11, UA-P15)
- *Test:* render the longest Hindi string of every component at 320 px. No vowel mark touches the line above or below, and none is clipped.

**UA-15. Devanagari display type.**
- Sarpanch Devanagari is used only for titles of 32 px or more.
- When a title wraps, its line height is at least 1.3.
- Hindi names, buttons and labels use Hind 600 or 700. (UA-P15)
- *Conflict:* in approved sample p02, names and name buttons are in the display face. This goes to the owner as OQ-10.
- *Test:* a native Hindi reader reads every button label aloud at a glance with no hesitation.

**UA-16. The phone's text size wins.** This is the one exception every no-scroll rule in the six digests carries.
- The root font size is 100%, and every font size is in rem, not px.
- The page carries `<meta name="text-scale" content="scale">` (Chrome support UNVERIFIED).
- At Android's largest font size (200%) and at Chrome page zoom 200%, no text is clipped or overlaps. A step may then scroll, but the main action stays pinned and reachable. (UA-P10)
- *Test:* screenshots at both settings for every step.

**UA-17. Text spacing does not break boxes.** Slots, chips, plates and buttons have no fixed heights for text; they grow. (UA-P11)
- *Test:* inject the WCAG 1.4.12 spacing stylesheet and screenshot every step.

**UA-18. Reflow.** There is no sideways scroll at 320 px in English or Hindi. (UA-P12)
- *Test:* `scrollWidth` equals the viewport width on every screen at 320 px.

**UA-19. Orientation is not locked.** The manifest sets no orientation. In landscape, the same single column sits centred. (UA-P13)
- *Test:* rotate the installed app; it plays.

**UA-20. Language is marked.** `html lang` follows the chosen language, and every phrase in another language or script carries its own `lang`. The language switch names each language in its own script ("English", "हिन्दी") wherever it is named in full. (UA-P14, UA-P21)
- *Test:* TalkBack reads a station board line in the right voice.

### D. Motion

**UA-21. Remove animations is honoured.**
- Under `prefers-reduced-motion: reduce`, nothing slides, tilts, flips, zooms, rolls or pulses. Changes are instant and carry a static mark.
- Each moving cue has a still version:
  - the ghost demonstration becomes a still drawing of the gesture on its target, shown once;
  - the "next target" pulse becomes a static ring;
  - the milestone becomes a still stamp;
  - the result reveal is instant.
- Press feedback stays, as a colour or outline change within 100 ms, on every tappable thing. (UA-P16)
- *Test:* with reduced motion on, no CSS animation runs, every transform transition is 0 ms, and each still version shows.

**UA-22. Motion stays short when it is on.**
- Any movement after a tap ends within 400 ms, and none blocks the next tap.
- The only longer moments are the three named in 2.0b (result reveal, ghost demonstration, milestone). A tap skips each one.
- Only the "next target" cue loops, and it stops after 3 cycles (HOUSE).
- *Test:* time the animations in a recording.

### E. Screen readers and structure

**UA-23. One heading per screen.** The question is the screen's heading, and focus lands on it when the screen arrives, as now. No visible label repeats the heading or the blurb, because TalkBack reads both. (UA-P28, and [ux-writing.md](ux-writing.md))
- *Test:* in a TalkBack pass, no sentence is heard twice on one screen.

**UA-24. A person card is one stop.** It reads its name, facts and quote, then its state. For example: "Kamla, 14 years, 0 crashes, 61 ghat trips, 'Drives very fast on the ghat', not chosen". Each number is read with its label. (UA-P27, UA-P28)
- *Test:* a linear TalkBack pass takes one swipe per card.

**UA-25. Counts and results are announced without moving focus.** This covers checks left, picked count, rule locked, line x of y, the day's score, the lean in whatever form OQ-1 decides, and every toast, all as polite status messages. (UA-P18)
- *Test:* with TalkBack on, each tap that changes a count is followed by the new count being spoken.

**UA-26. The streak is one stop.** For example: "Streak 6 days. This week 6 played, 1 forgiven." It is not 14 separate marks. (UA-P17, UA-P28)
- *Test:* in a TalkBack pass, the streak takes one swipe.

**UA-27. Pictures are either decoration or information.**
- Paintings, and portraits beside a written name, are hidden from TalkBack (empty alt). A portrait shown without its name says the name only (2.0c; matches M3-46).
- A picture that carries a fact says the fact.
- A missing portrait is never replaced by a letter square, and "Neither" is never drawn as a person. (UA-P17)
- *Test:* a TalkBack pass hears no file names and no single letters.

**UA-28. The spoken name starts with the visible words, in the same language.** (UA-P19)
- *Test:* compare the accessibility tree with the screenshot.

**UA-29. The not-ready main button.** It follows the step model (2.0a, point 3): in place, muted, focusable, with a label at 4.5:1 that names what is missing ("Pick 2 more"). Never two not-ready buttons at once. (UA-P25)
- *Test:* no screen shows two inactive buttons, and every inactive one names what is missing.

### F. Consistency

**UA-30. Same job, same look, same place.**
- Within a skin, the main action, the way out, the language switch, the streak and the tab bar look identical and sit in the same place every day.
- Across the two skins they keep their size and position, and only their dress changes.
- The day's verb may change the main action's words; it never changes its shape, colour or place.
- Answer options never share the main action's look. (UA-P21)
- *Test:* lay the 14 daily screenshots side by side; the controls line up.

**UA-31. The tab bar is the same three tabs (Today, Board, Week), in the same order and with the same labels, wherever it shows.** It is the only route to the board. During a puzzle step it is hidden and the back control takes its job. (UA-P20)
- *Test:* check every screen that shows the bar.

**UA-32. One visual cue, one meaning.**
- A dashed outline means only "empty, put something here" in a puzzle (an empty slot, seat or blank). Streak days not yet played are never dashed (2.0c).
- Not ready, spent, unchosen and notices each get their own cue. (UA-P21, and [perception-and-heuristics.md](perception-and-heuristics.md))
- *Test:* list every use of each cue in the design system; each cue has one meaning.

**UA-33. "How to play" sits behind the same "?" in the same corner on every puzzle screen.** (UA-P23)

### G. Interruption and resume

**UA-34. Save after every tap, and when the app is hidden.**
- Save on every change, and again on `visibilitychange` to hidden.
- Reopening lands on the same step, with every earlier choice showing, in under 2 seconds (HOUSE).
- The Sunday note saves as it is typed. (UA-P34, UA-P35)
- *Test:* mid-step, switch to another app, kill Chrome, reopen; the step and its choices are intact.

**UA-35. Show where the player is, inside the day's object.** Use punch holes, the height of the card stack, or ticket stubs, never a separate progress bar or "2/6" text (the owner removed bars on 20 Oct; 2.0c). The same idea is used in both skins. (UA-P24, visibility of system status)
- *Test:* every multi-part day shows the part on screen.

**UA-36. Midnight belongs to the day it started.** A day begun before the day's end finishes as that day and counts for the streak; the next puzzle opens after. When the day ends is owner question OQ-15. (UA-P34)
- *Test:* start two minutes before the day's end with a date override, finish three minutes after.

**UA-37. A day fits a commute.** In testing, first-time players finish a day in 7 minutes or less (median), and returning players in 5 or less. (UA-P34)

**UA-38. Shared phones are safe.**
- The Sunday note, and any past notes, stay folded until tapped, and are never shown on Today or on a result screen.
- "Delete notes" sits on the Week screen. (UA-P31)
- *Test:* open the app as a second person; no private text shows without a deliberate tap.

### H. Phones and data

**UA-39. Fast first open on the baseline.**
- On a Galaxy A24 4G-class phone at 9 Mbps down and 100 ms round trip, today's puzzle can be tapped within 3 seconds.
- The first load transfers 600 KB or less, fonts and the day's painting included (HOUSE, well inside the 1.2 MiB of UA-P32). (UA-P30, UA-P32)
- *Test:* Lighthouse or WebPageTest with those settings, and once on a 2 GB phone (persona P4).

**UA-40. Works offline after the first open, with a limited cache.**
- Today's puzzle, once opened, is saved on the phone and plays to the end with no network. The result shows at once and is sent when the phone is back online.
- In advance, only the paintings, fonts and mechanic code for the next 6 days are saved (HOUSE). Future puzzles themselves are not saved.
- The board and friends show when they last updated and say they update when the phone is online.
- No spinner runs without a time limit. (UA-P36)
- **The trade, written down.** A future puzzle saved on the phone can be read from storage and shared, which helps a board farmer (A1) and gives away transfer days. Encrypting it would only delay a determined reader, and the key would still need a connection when the day opens. So the cache is limited instead. The cost: a player who has no signal when a new day opens (P4 at home) cannot start that day until she finds one; the one forgiven day a week softens this. Whether to save tomorrow's puzzle anyway is owner question OQ-27.
- *Test:* open today's puzzle, go to flight mode, play the full day.

**UA-41. Fonts are lean.**
- Each screen loads only the scripts it shows, at no more than 2 weights per script.
- Regional lines on station boards are cut down to the glyphs they use. (UA-P32)
- *Test:* network log per screen.

**UA-42. Images are lean.** A painting is 60 KB or less, and a portrait 25 KB or less (both HOUSE; WebP, drawn at 2x for 390 px). The current files, 16 to 51 KB, pass. (UA-P32)

### I. Testing before any link goes out

**UA-43. Usability test.** Five players from each language group (English, Hindi) test on a real Android phone that costs under about ₹15,000. Each plays standing, one-handed, in portrait. (UA-P30, UA-P37)
- *Tasks:*
  - first open to first result;
  - leave for WhatsApp for 2 minutes mid-step, then come back;
  - play the Sunday week.
- *Pass marks:*
  - every player finishes without help;
  - median time within UA-37;
  - fewer than 1 mis-tap per step;
  - asked "what was this screen asking you?", each player answers correctly in their own words.

**UA-44. Accessibility pass on every build.** Each pass covers:
- TalkBack, using Google's check in UA-P28;
- 200% font size and 200% page zoom;
- Remove animations;
- greyscale and colour-blindness simulation;
- 320 px width;
- flight mode;
- the network and processor throttling of UA-39.

Where possible, 1 or 2 sessions are with a TalkBack user, a colour-blind player and a player who uses large text (UA-P38 asks for people with impairments among the playtesters). A check passing never certifies the design (owner rule, 20 Oct).

### J. Added after the critique

**UA-45. Game accessibility basics.** From the Game Accessibility Guidelines (UA-P38), the items this game must meet, each tied to a rule:
- no essential information by colour alone (UA-4);
- large, well-spaced targets (UA-6);
- simple language and a readable default size (UA-13; the ux-writing digest);
- no flicker or repeating flashing patterns: split-flap and stamp animations never flash more than three times a second (HOUSE);
- a haptics toggle in the "?" sheet (HIG-35);
- every setting remembered (UA-34);
- the day's question stays on screen while the player acts, as the reminder of the objective (PH-28);
- people with impairments among the playtesters (UA-44).
- *Open for the owner:* the guidelines also suggest a way to practise without failing. That is part of OQ-19 (what a newcomer plays).
- *Test:* walk the list on each mechanic before the parts sheet goes to the owner.

**UA-46. Hard days are handled with care (trauma-informed).** On days about dowry, custody, safety or violence (UA-P39):
- **Safety.** The art shows the situation, never the harm: no injury, no weapon, no gore.
- **Agency.** The cover names the day's setting plainly, so a player knows what the day is about before tapping Play. The back control leaves at any point, keeps the answers, and the day can be finished later.
- **Privacy.** Nothing about the day's topic appears in a reminder, on the lock screen, in the Home Screen name or on a share card (DG-24, DG-39).
- **Tone.** Lines on these days are plain and serious: no puns, no exclamation marks, and the player's choice is never called harmful (UXW-32).
- **Plurality and co-design.** Scenes are reviewed by the owner and, where possible, by people who have lived them (**ASSUMPTION** about process, for the owner).
- Whether these days carry a help line is owner question OQ-30.
- *Test:* read each hard day's screens as P3 and P6 would, on a shared phone; nothing exposes the player or shocks without purpose.

**UA-47. Notice and consent before anything leaves the phone (DPDP).** (UA-P40)
- Nothing personal is sent to the server until the player first does something that needs it: joining the board, adding a friend, or keeping a backup.
- At that moment one sheet appears. It stands on its own, in the chosen language, in plain words, and lists each item kept as its own short line (for example: road name, the dates you played, your practice count, your friends' road names) with one line on why. It says how to withdraw and delete, which takes no more effort than agreeing did (the "?" sheet's one-tap delete).
- The sheet's actions are an outcome verb and "Not now". After "Not now" the game plays on, with everything kept on the phone.
- Notes and reflection taps are never on the list, because they never leave the phone.
- This sheet is the one screen allowed past the 20-word budget, and only by its itemised lines. The owner should see it drawn (part of OQ-23).
- Whether the age statement for an adults-only game sits on this sheet is part of OQ-17.
- A lawyer confirms the wording before launch.
- *Test:* in a network log, nothing personal is sent before the sheet's yes; withdrawing and deleting take no more taps than agreeing.

---

## 3. Broken in the EVAL-13 build

Screenshots are in `/Users/priyanshu/equal-lens-trainer/out/trainer-shots/`. "Measured" means taken from the pixels, the shipped fonts or a clean run of commit `7902955`, as explained at the top.

| UA rule | Screenshot(s) | What is wrong |
|---|---|---|
| 3, 5 | 002, 013, 021, 025, 037, 045, 049, 053 | A chosen card or button turns ink black (`--c-selected` = #111111). Against the Lugdi ground #1B0B2E that is 1.02:1, and against the Station ground #1C1C1C 1.11:1 (measured). Only a thin white border keeps the chosen card from vanishing into the page, so the player's own choice reads as switched off. |
| 5, 32 | 021, 025, 049, 053 | After a choice the unchosen players (025, 053) and every checked card (021, 049) turn dashed, the same look as a not-ready button. A finished screen looks disabled. |
| 4 | streak on 003, 006, 029 (code) | `Streak.tsx` at `7902955` marks a forgiven day only by colour: a red spine in Lugdi, a white ticket in Station. White against yellow is 1.44:1 (measured). No forgiven day appears in the screenshots, so this comes from code only. |
| 6 | 004, 016, 020, 003 | Answer options, word chips and the cash-box name buttons are about 44 CSS px tall with 8 to 12 px gaps (measured), and so are the bottom tabs at the very edge of the screen. That is above WCAG's 24 but under Android's 48 dp, and the tabs sit in the edge zone Hoober marks as least accurate (UA-P6). |
| 7, 8 | 005, 020, 021, 024, 025, 052, 053; empty bottoms in 004, 009, 034, 038 | The main action floats wherever the content ends. On a 360 by 640 phone (measured on the first step of 7 sampled days) its top sits 616 to 966 px down the page (days 1, 3, 4, 5, 6 and 12), so it is not fully on screen on 6 of 7 days. Only Station Monday (464 px) fits. At 390 px, 005 is 1,044 CSS px tall and 024 is 1,046. On short steps the button sits mid-screen with the bottom 40 to 60% empty. |
| 8 | 028, 056, 057 | Sunday's week and the board are long forms: 1,784, 1,799 and 1,604 CSS px tall, two to three screens on a 390 by 844 phone. The private note sits in the middle of the scroll. |
| 9 | 032 | The crowd guess is a drag slider. Its visible handle is about 15 CSS px across (measured) and there is no tap alternative such as the chips in approved sample shots3 p14. Whether tapping the track counts for WCAG 2.5.7 is UNVERIFIED. Fine adjustment needs a drag either way. |
| 10 | 005, 016, 017, 040 | Two-tap moves rely on instruction text ("Tap a person, then a job.", "Tap a blank, then a word.") instead of showing the armed state. The armed blank is a black box (016, 040), the same black that means "chosen" elsewhere. |
| 11 | 004, 008, 012, 016, 020, 024, 030, 036, 040, 044, 048, 052, 059 | No puzzle step has a way out. `Play.tsx` at `7902955` has no back or exit control, the tab bar is hidden, and an installed app has no browser back button. In 009, the eight keep-or-cut calls cannot be reviewed or changed before "Close the column". Main actions do not name their consequence ("Confirm my choice", "Appoint"). |
| 12 | 057, 058 | "Remove Highway Ka Pahiya" (057) is styled like any other secondary button and sits next to the search. "Delete everything on this phone" (058) looks exactly like "Back to the real date". Nothing shows a confirm or undo. |
| 13 | 012, 044, 059 (stat labels); 028, 056, 057 (table headers, "You chose"); 003 ("Price ₹ 2"); every screen (kicker line); 020, 048, 061 (detail lines); 028, 034, 038, 056, 057 (notices) | Measured computed sizes: 12 px for the stat labels "years / crashes / ghat trips", for "Rank / Road name / Practice", for "You chose" and for the price roundel. 13 px for the kicker and level line, "One missed day a week is forgiven.", the detail lines "9 years of accounts · 2-year gap, family", the score labels, "Stays on this phone. Never scored, never read." and the sample notices. `tokens.css` sets `--text-xs: 12px` and `--text-s: 13px`. |
| 14 | 059, 061 | Hindi uses the English line heights (measured): quotes and facts at 15 px and 13 px with line height 1.25, and Station names at 17 px with 1.05. Hind Devanagari glyphs span 1.44 to 1.56 em, so wrapped lines such as "9 साल हिसाब-किताब · 2 साल का / ब्रेक, परिवार" (061) stack vowel marks into the next line. There is no Hindi-specific type rule in the CSS. |
| 15 | 059, Hindi Today screen (not in the set; seen at 320 px) | Hindi names and buttons are set in Sarpanch Devanagari at 17 px with line height 1.05 (measured): "कमला", "राजू", "मेरा चुनाव पक्का", "आज की पहेली खेलें". At a glance I misread the first word of the 059 button. Titles at 44 px with line height 1.05 wrap to two lines at 320 px ("घाट का / सौदा"), with the marks of line 2 nearly touching line 1, against a glyph span of 1.48 em. |
| 16 | all screens (code) | `base.css` at `7902955` sets the root to `font-size: var(--text-m)`, which is 15 px, and every size token is in px. `index.html` has no text-scale tag. Chrome on Android therefore ignores the player's font-size setting (UA-P10). |
| 19 | installed app (code) | `public/manifest.webmanifest` sets `"orientation": "portrait"`, which locks the installed app (WCAG 1.3.4). |
| 21 | press feedback (code) | The code audit (`diag-code.md`) found the press ring missing from slots, word chips and tabs. Under reduced motion those three give no press feedback at all. This is not visible in still screenshots. |
| 23 | 001, 002, 008, 016, 017, 040 | Headings and labels repeat each other, so TalkBack reads the same thing twice. In 001 the brand appears twice, plus "Choose your language". In 002, "Pick your road name" is both title and label. In 008 the blurb asks "Keep each line, or cut it?" and the question asks "Does this line go in the column?". In 016 and 040 the blurb and the instruction say the same. |
| 25 | 020, 024, 048, 052 | "Checks left: 3" and "0 of 6 picked" are plain text. At `7902955` only the slider value and the swipe progress are live regions, so TalkBack players do not hear the counts change. |
| 26 | 003, 006, 010, 029, 034, 038 | The streak is 14 list items, each with its own spoken label. That is 14 TalkBack stops on Today and again on every result screen, against Google's ask for short announcements (UA-P28). |
| 27 | 031, 036, 048, 049, 061 | Letter squares stand in for missing portraits: "J" for Joseph, "F" and "फ" for Farida. "Neither" is drawn as a person called "N". |
| 29 | two at once in 004, 030, 060; one in 008, 012, 016, 020, 024, 036, 040, 044, 048, 059, 061 | Every step opens with dashed, not-ready commit buttons and no reason beside them. 004, 030 and 060 show two not-ready buttons stacked ("Lock the rule" and "Hand out the jobs"). |
| 30 | 003, 007, 011, 027, 029 vs 001; 004, 020, 024 | The language switch has two looks: two yellow plates on onboarding (001), then one white plate with a red shadow on Today, styled as heavily as Play (003, 029). In 004, 020 and 024 the answer options are yellow plates, the same colour as the main action. |
| 32 | 001, 003, 004, 005, 009, 017, 021, 025, 034 | The dashed outline carries eight meanings: not-ready button, empty streak day, notice, spent word, spent check, unchosen player, empty job slot, unchosen locked option (listed in `diag-screens.md`). |
| 35 | 004 vs 030; 008 | Lugdi Monday has two parts and shows no position, while Station Monday says "Part 1 of 2" (030). The gossip column says "Line 1 of 8" in a small label above the card (008), not on the object. |
| 41 | network (code) | The app ships four Hind Devanagari weights (400, 500, 600, 700, about 70 to 75 KB each) plus two weights for each regional board script. That is more than two weights per script, though the total still fits the UA-39 budget. |

### Already right in EVAL-13 (keep these)

- **No sideways scroll** at 320 or 360 px, in English or Hindi, on 7 sampled days (measured; UA-18).
- **Target floor:** every rendered control on the first step of those days is at least 44 CSS px (measured; UA-6 asks for 48, so this is a start, not a pass).
- **Focus:** a 3 px focus ring in the accent colour (`base.css`). The commit button uses `aria-disabled`, so it stays focusable, and focus moves to the heading when a screen arrives.
- **Language:** `html lang` switches with the language, and regional board lines carry their own `lang` (UA-20).
- **Gestures:** the swipe card has Cut and Keep buttons, and ranking works by tapping (UA-9).
- **Saving:** answers and the current step are saved on the phone, so a reload resumes the step.
- **Weight:** the JavaScript is 95 KB compressed, fonts use `font-display: swap` and `unicode-range`, and the paintings are 16 to 51 KB WebP (UA-39 to UA-42).

### Conflicts to put to the owner

These now live in the single owner list in [../ux/journeys.md](../ux/journeys.md), each with the pictures to show:

| Was | Now |
|---|---|
| 1. Hindi names and name buttons in the display face (sample p02) or Hind 700 (UA-15) | OQ-10 |
| 2. Text on the full painting and the tint it needs (UA-2) | OQ-11 |
| 3. Tiny stat labels in the samples against the 14 px floor (UA-13) | OQ-10 |
| 4. The "Price ₹2" roundel | OQ-5 |
| 5. Name buttons as the commit (sample p02) against UA-11 | OQ-9 |

---

## Sources

All read as raw text on 20 Oct 2026 unless marked.

- **W3C, WCAG 2.2 Understanding pages,** at `https://www.w3.org/WAI/WCAG22/Understanding/<name>.html`. Names: contrast-minimum, non-text-contrast, use-of-color, target-size-minimum, target-size-enhanced, pointer-gestures, dragging-movements, reflow, resize-text, text-spacing, orientation, language-of-parts, animation-from-interactions, non-text-content, status-messages, label-in-name, consistent-navigation, consistent-identification, focus-visible, focus-not-obscured-minimum, consistent-help.
- **W3C, other:**
  - Guidance on Applying WCAG 2.2 to Mobile Applications, Group Draft Note, 6 May 2025: https://www.w3.org/TR/wcag2mobile-22/
  - Mobile Accessibility mapping, 2015: https://www.w3.org/TR/mobile-accessibility-mapping/
  - Devanagari gap analysis: https://www.w3.org/TR/deva-gap/
- **Apple HIG** (read from its page data): https://developer.apple.com/design/human-interface-guidelines/accessibility, /buttons, /typography, /color
- **Android:**
  - https://developer.android.com/guide/topics/ui/accessibility/apps
  - https://developer.android.com/guide/topics/ui/accessibility/testing
  - https://developer.android.com/about/versions/14/features
  - https://developer.android.com/training/multiscreen/screendensities
- **TalkBack gestures:** https://support.google.com/accessibility/android/answer/6151827
- **MDN, prefers-reduced-motion:** https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- **Chrome, Page Lifecycle API** (updated 16 Oct 2026): https://developer.chrome.com/docs/web-platform/page-lifecycle-api
- **web.dev, Offline UX design guidelines** (2016): https://web.dev/articles/offline-ux-design-guidelines
- **Adrian Roselli, Honoring Mobile OS Text Size** (Feb 2026): https://adrianroselli.com/2026/02/honoring-mobile-os-text-size.html
- **WebAIM, Screen Reader User Survey #10** (2024): https://webaim.org/projects/screenreadersurvey10/
- **StatCounter, mobile OS share in India** (Sep 2026): https://gs.statcounter.com/os-market-share/mobile/india
- **IDC, India smartphone market 2025** (16 Feb 2026): https://www.idc.com/resource-center/press-releases/india-smartphone-market-2025-2026/
- **GSMA, The Mobile Gender Gap Report 2025:** https://www.gsma.com/wp-content/uploads/2025/12/The-Mobile-Gender-Gap-Report-2025.pdf
- **Alex Russell, The Performance Inequality Gap, 2026** (24 Nov 2025): https://infrequently.org/2025/11/performance-inequality-gap-2026/
- **Steven Hoober, Design for Fingers and Thumbs Instead of Touch** (UXmatters, Nov 2013): https://www.uxmatters.com/mt/archives/2013/11/design-for-fingers-and-thumbs-instead-of-touch.php
- **Smashing Magazine:**
  - Accessible tap target sizes (Apr 2023): https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/
  - Disabled buttons (Aug 2021): https://www.smashingmagazine.com/2021/08/frustrating-design-patterns-disabled-buttons/
- **NN/g:**
  - 10 usability heuristics (updated 2020): https://www.nngroup.com/articles/ten-usability-heuristics/
  - Mobile UX (2015): https://www.nngroup.com/articles/mobile-ux/
  - How many test users (2012): https://www.nngroup.com/articles/how-many-test-users/
- **Colour Blind Awareness:** https://www.colourblindawareness.org/colour-blindness/
- **Wikimedia Phabricator T57995** (2013): https://phabricator.wikimedia.org/T57995
- **Added after the critique (all read raw on 20 Oct 2026):**
  - Game Accessibility Guidelines, full list (undated in its text): https://gameaccessibilityguidelines.com/full-list/
  - Chayn, research page listing its trauma-informed design white paper (the paper itself not read; its year UNVERIFIED): https://org.chayn.co/research
  - Promo Cymru, trauma-informed design principles and how to apply them (undated in its text): https://promo.cymru/?p=18736
  - Digital Personal Data Protection Rules, 2025, G.S.R. 846(E), Gazette of India, 13 Nov 2025 (Rules 1, 3 and 10): https://egazette.gov.in/WriteReadData/2025/267650.pdf
  - WebAIM survey 10 rechecked for its base (1,511 answered the mobile question; Asia 97 respondents).
- **UNVERIFIED, blocked to scripted reads:**
  - Ericsson Mobility Report: https://www.ericsson.com/en/reports-and-papers/mobility-report/dataforecasts/mobile-traffic-forecast
  - Opensignal India report (Feb 2026): https://insights.opensignal.com/reports/2026/02/india/mobile-network-experience
- **Build evidence:**
  - EVAL-13 screenshots: `out/trainer-shots/`
  - code at commit `7902955`
  - diagnosis notes `diag-screens.md` and `diag-code.md` (session scratchpad)
  - Hind and Sarpanch metrics read from `public/fonts/*.woff2`

---

## Changes after critique

Applied from [../ux/critique-stage1.md](../ux/critique-stage1.md) on 20 Oct 2026.

- **Ids (should-fix 3).** Principles are now UA-P1 to UA-P40 and rules UA-1 to UA-47.
- **Shared section 2.0 (must-fix 7, 8 and 9; should-fix 1).** Added the one step model for a puzzle step, the one set of size, contrast, motion, toast and test numbers, and a table settling the smaller conflicts (streak, counters, dashed outline, portrait text, way out, board, language, settings, undo, "my").
- **Must-fix 1.** UA-1 states the WCAG large-text threshold as 24 px or 18.66 px bold.
- **Must-fix 2.** Toasts stay at least 4 s, show in place too and are announced (2.0b, UA-25). The forgiven day gets a shape and a word (UA-4).
- **Must-fix 4.** UA-2 is now the single art test for every screen, with M3-36.
- **Must-fix 9.** Sunday's two-screen limit is replaced by owner question OQ-2; UA-16 is named as the exception every no-scroll rule carries.
- **Should-fix 1.** UA-12 and 2.0c set undo at 5 s; UA-21 adds still versions of the ghost demonstration, pulse and milestone; UA-27 and UA-32 settled; UA-38 says "Delete notes".
- **Should-fix 2.** UA-40 limits the offline cache to art, fonts and code for the next 6 days and writes down the trade (OQ-27).
- **Should-fix 4.** Marked HOUSE: image budgets, the 6-day cache, reopening in 2 s, the loop count, undo time.
- **Should-fix 12.** Added UA-P38 and UA-45 (game accessibility), UA-P39 and UA-46 (trauma-informed hard days), and UA-P40 and UA-47 (DPDP notice and consent), all from raw text.
- **Should-fix 13.** Hoober 2013, W3C mobile 2015, NN/g 2012 and 2015 and web.dev 2016 marked "old, owner to accept".
- **Should-fix 14.** The conflicts list now points to the single owner list in the journeys.
- **Spot-check S-6.** WebAIM's 91.3% is now given against the 1,511 who answered, with Asia's 97 respondents noted.
