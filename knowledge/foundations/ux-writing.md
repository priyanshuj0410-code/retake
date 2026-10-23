---
type: ux-research
title: UX writing foundations for Equal Lens Daily
description: Research digest on UX writing (NN/g, Material 3, Apple HIG, GOV.UK, W3C, Google and Microsoft style guides, and Indian-language guidance from Google, Duolingo, Blackbuck and Microsoft's Hindi guide), turned into numbered, testable writing rules for Equal Lens Daily and checked against every screen of the failed EVAL-13 build.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-14/
---

# UX writing foundations for Equal Lens Daily

This digest is a foundation for stage 4 of the owner's design order (persona and journeys, then features, then information architecture and flows, then design system and patterns, then the build). Its rules bind the new build. They replace section 8, "Copy rules", of the EVAL-13 [design.md](../design.md), which allowed 18-word prompts where the owner allows 10.

Related: [personas](../ux/personas.md). Owner rules this digest builds on (memory files, outside this repo):
- `minimal-text-ui.md`: 15 words on puzzle screens, 20 elsewhere; one question of 10 words or fewer; no notices in the flow.
- `design-before-build.md` and `plain-questions.md`.

The owner's standard for reading is "as minimum as possible to none at all".

**How sources were read.** Every claim below comes from the raw text of the page:
- most pages were fetched with curl and stripped to text;
- Material 3, a script-rendered site, was read through the rendered page text in a browser;
- PDFs were read with pdftotext, and the Devanagari examples in Microsoft's Hindi guide were checked against rendered page images (pages 6 and 13).

Everything is paraphrased. Older sources are flagged with their year, and anything not confirmed from raw text is marked UNVERIFIED.

**After the Stage 1 critique.**
- **Ids.** Principles are UXW-P1 to UXW-P28 and rules UXW-1 to UXW-44. The sibling digests carry DG, HIG, M3, PH and UA.
- **Shared parts.** The one step model for a puzzle step, the one set of numbers, and the settled small conflicts (counters, the language switch's one home, undo time and others) are in section 2.0 of [usability-and-accessibility.md](usability-and-accessibility.md).
- **Owner questions** live in one list in [../ux/journeys.md](../ux/journeys.md) (OQ-1 to OQ-30). Where this file used to settle a clash between a rule and the approved look, it now points there.
- **Old evidence.** A source before 2024 with no newer replacement found is marked "old, owner to accept".

---

## 1. Principles that matter for a small, game-like, one-handed phone product

### A. Reading and scanning

**UXW-P1. People scan; they do not read.**
- **What it says.** In NN/g's early web studies, 79% of users scanned a new page and only 16% read word by word. Rewriting the same content to be concise raised measured usability by 58%; making it scannable raised it by 47%; doing both plus objective wording raised it by 124%. A later log study found that users have time to read at most 28% of a page's words, and about 20% is more likely. At 200 to 250 words a minute that is roughly 18 words in 4 to 5 seconds. GOV.UK repeats the 20 to 28% figure and the F-shaped scanning pattern in its own guidance.
- **Sources.**
  - https://www.nngroup.com/articles/how-users-read-on-the-web/ (1997; old, owner to accept; GOV.UK's current guidance repeats the finding)
  - https://www.nngroup.com/articles/how-little-do-users-read/ (2008)
  - https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/clear-structure/
- **Why it matters here.** A 5 to 7 minute session has no room for reading. If eight screens carry 50 words each, that is 400 words, about two minutes at 200 words a minute: a third of the session spent reading instead of playing. The owner's 15 and 20 word budgets match what people actually take in at a glance.

**UXW-P2. Clarity first, concision second.**
- **What it says.** NN/g's newest microcopy guidance ranks clarity above concision. A few extra words are fine if they make a phrase understood. Microcopy is, by definition, shorter than 3 sentences, so every word has to earn its place.
- **Source.** https://www.nngroup.com/articles/3-cs-microcopy/ (March 2026)
- **Why it matters here.** "No text" is the target, but never at the cost of the player understanding the question. The question stays; everything that only repeats or explains it goes.

**UXW-P3. Front-load. The first two words do the work.**
- **What it says.** Scanning eyes take in about the first 2 words, or 11 characters, of a line or link. Lines that start with filler ("Introducing...") fail. GOV.UK asks for the most important information first (the "inverted pyramid"), headings that are descriptive and front-loaded, and no repeating of the summary in the next paragraph.
- **Sources.**
  - https://www.nngroup.com/articles/first-2-words-a-signal-for-scanning/ (2009; old, owner to accept)
  - https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/clear-structure/
- **Why it matters here.** One-handed players glance between taps. Every question, label and button must say what it is about in its first two words.

**UXW-P4. Easy text reads as well on a phone; hard text does not.**
- **What it says.** NN/g found that comprehension of short, simple text on phones matched computers. Difficult text slowed readers down more on mobile.
- **Source.** https://www.nngroup.com/articles/mobile-content-is-twice-as-difficult/ (2016)
- **Why it matters here.** The phone is not the problem; hard or long text is.

**UXW-P5. Numbers as numerals.**
- **What it says.**
  - Numerals ("23") catch scanning eyes better than words ("twenty-three").
  - GOV.UK writes all numbers from 2 upward as numerals and uses commas above 999.
- **Sources.**
  - https://www.nngroup.com/articles/web-writing-show-numbers-as-numerals/ (2007; old, owner to accept; GOV.UK's current style guide says the same)
  - https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/style-guides/a-to-z-style-guide/
- **Why it matters here.** Stats, counters and scores carry most of the game's information, so they should be numbers, not sentences.

### B. Questions, instructions and teaching

**UXW-P6. One question per page.**
- **What it says.** The GOV.UK Design System starts every form by asking one question per page. This helps users understand what is being asked and focus on it. The question can be the page heading.
- **Source.** https://design-system.service.gov.uk/patterns/question-pages/
- **Why it matters here.** Each puzzle step is one question. A second prompt on the same screen (an instruction heading plus a question) splits attention.

**UXW-P7. Teach by doing, not by telling.**
- **What it says.**
  - Apple: ideally people understand an app or game simply by using it. People learn better by doing the task than by reading instructions. Context-specific tips beat one up-front tour, and any tutorial should be brief and optional.
  - NN/g: tutorials and other "push" help interrupt users, are often skipped and are quickly forgotten. Help that appears in context, when the user needs it ("pull" help), works better.
- **Sources.**
  - https://developer.apple.com/design/human-interface-guidelines/onboarding (change log June 2024)
  - https://www.nngroup.com/articles/onboarding-tutorials/ (February 2023)
- **Why it matters here.** "Tap a person, then a job" sentences are push help repeated on every play. The board itself (empty slots, a pulse on the first target, a selected state) should teach the mechanic.

### C. Buttons and controls

**UXW-P8. Buttons name the outcome, start with a verb, and stay short.**
- **What it says.**
  - **Material 3:** the label is the most important part of a button. It describes the action that will happen, ideally in 1 to 3 words, in sentence case, and never truncated or wrapped.
  - **GOV.UK:** button text describes the action, in sentence case; add words when they make the action clearer ("Add another address").
  - **Apple:** use a verb, prefer clear over clever (a plain "Send" beats a chatty label), and use consistent words across a multi-step flow.
  - **NN/g:** lead with a verb, avoid "OK", and add a noun when the verb alone is ambiguous.
- **Sources.**
  - https://m3.material.io/components/buttons/guidelines
  - https://design-system.service.gov.uk/components/button/
  - https://developer.apple.com/design/human-interface-guidelines/writing (change log December 2025)
  - https://www.nngroup.com/articles/ui-copy/ (2019)
- **Why it matters here.** The main button is often the only text a player reads. "Confirm my choice" says nothing; "Send Kamla" says what happens.

**UXW-P9. One main call to action.**
- **What it says.**
  - GOV.UK: avoid more than one main button on a page, because it weakens each one and makes the next step unclear.
  - Duolingo: newly online learners in India tended to tap whatever button was most prominent.
- **Sources.**
  - https://design-system.service.gov.uk/components/button/
  - https://blog.duolingo.com/language-learning-for-the-next-billion-duolingo-in-india/ (September 2020; old, owner to accept)
- **Why it matters here.** If the language switch is drawn as heavily as Play, some players will tap it.

**UXW-P10. Disabled buttons confuse; avoid them or say why.**
- **What it says.**
  - GOV.UK: disabled buttons have poor contrast and confuse some users, so avoid them unless research shows they help.
  - NN/g: disabled buttons look tappable but give no response. Use them sparingly, keep them accessible (`aria-disabled`), and make the reason visible.
- **Sources.**
  - https://design-system.service.gov.uk/components/button/
  - https://www.nngroup.com/articles/button-states-communicate-interaction/ (April 2025)
  - https://www.nngroup.com/videos/why-disabled-buttons-hurt-ux-and-how-to-fix-them/ (2025)
- **Why it matters here.** EVAL-13 put a dashed dead button on almost every puzzle screen.

**UXW-P11. Sentence case; capitals read as shouting.**
- **What it says.**
  - **GOV.UK:** block capitals are hard to read and can come across as shouting; always use sentence case, even in titles.
  - **Material 3:** sentence case for all UI text, buttons included.
  - **Microsoft:** don't use all capitals in running text; they are acceptable only as an occasional design element.
  - **Apple:** choose a capitalisation style for each element type and keep it everywhere.
- **Sources.**
  - https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/right-tone/
  - https://m3.material.io/foundations/content-design/style-guide/ux-writing-best-practices
  - https://learn.microsoft.com/en-us/style-guide/capitalization
  - https://developer.apple.com/design/human-interface-guidelines/writing
- **Why it matters here.** Lugdi's capitals belong to the cover lettering. They should not spread to buttons, where Station uses sentence case for the same labels.

**UXW-P12. Text labels for icons, unless the icon is truly universal.**
- **What it says.**
  - NN/g: only a few icons are understood almost everywhere (home, print, search); most need a visible text label.
  - Google's Indian-language research: abstract icons and standalone symbols confused users; realistic pictures worked better.
- **Sources.**
  - https://www.nngroup.com/articles/icon-usability/ (2014; old, owner to accept)
  - https://www.thinkwithgoogle.com/_qs/documents/13326/App_and_website_localization_for_Indian_users.pdf (undated playbook; its statistics cite a January 2021 survey)
- **Why it matters here.** Cutting words must not create mystery icons. Where a word is removed, a picture the player already knows must carry the meaning.

### D. Consistency and word choice

**UXW-P13. One word per concept.**
- **What it says.**
  - NN/g's consistency heuristic: users should never have to wonder whether different words mean the same thing.
  - Google's style guide: use the exact same term for a concept everywhere, because translators may read different words as different concepts.
  - Apple: keep a list of common terms.
- **Sources.**
  - https://www.nngroup.com/articles/ten-usability-heuristics/
  - https://developers.google.com/style/translation (updated October 2026)
  - https://developer.apple.com/design/human-interface-guidelines/writing
- **Why it matters here.** EVAL-13 used five labels for consistency and two meanings for "practice". In a game scored on consistency, the scoring words must be the most consistent words in the app.

**UXW-P14. The user's words, not internal jargon or codes.**
- **What it says.**
  - NN/g: the design should speak the users' language.
  - Material 3 and GOV.UK: spell words out and avoid abbreviations; explain any code at first use.
  - Google's Indian-language playbook: avoid standalone acronyms and codes.
- **Sources.**
  - https://www.nngroup.com/articles/ten-usability-heuristics/
  - https://m3.material.io/foundations/content-design/style-guide/ux-writing-best-practices
  - https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/style-guides/a-to-z-style-guide/
  - Google playbook as in UXW-P12.
- **Why it matters here.** Research words ("transfer day", "matching records", "direction hidden") and railway codes (RAC, CNF, WL) are both jargon to a player.

**UXW-P15. Literal language; no idioms.**
- **What it says.**
  - The W3C cognitive accessibility guidance asks for literal, concrete language, with no metaphors unless they are explained. It also asks for short sentences with one point each.
  - Google and Material 3: avoid idioms, colloquialisms and humour, which confuse readers and translators.
  - Microsoft's Hindi guide: if an idiom can be dropped without losing meaning, drop it rather than find a Hindi equivalent.
- **Sources.**
  - https://www.w3.org/TR/coga-usable/ (W3C Working Group Note, April 2021)
  - https://developers.google.com/style/translation
  - https://m3.material.io/foundations/content-design/global-writing/word-choice
  - https://aka.ms/hindi-styleguide (Microsoft Hindi Style Guide, PDF, undated)
- **Why it matters here.** Fiction words (column, ticket, PNR, back cover) give the skins their flavour. They must not be the only words on a control.

**UXW-P16. Speak to "you"; don't mix in "my".**
- **What it says.**
  - Material 3: use the second person, and do not mix "my" with "you" on the same screen.
  - Apple: use possessives sparingly and avoid "we", because it is unclear who "we" is.
- **Sources.**
  - https://m3.material.io/foundations/content-design/style-guide/word-choice
  - https://developer.apple.com/design/human-interface-guidelines/writing
- **Why it matters here.** "Lock my guess" sits above "Your guess" on the same EVAL-13 screen.

### E. Feedback, errors, empty states and confirmations

**UXW-P17. Errors: near the problem, plain, constructive, never blaming.**
- **What it says.**
  - **NN/g:**
    - show the message next to its source, in plain words, with a remedy;
    - never blame the user, and avoid words like "invalid" or "incorrect";
    - avoid humour;
    - keep the user's input;
    - don't show errors before the user has had a chance to act.
  - **GOV.UK:** bans "forbidden", "illegal", "you forgot", "please", "sorry", "valid" and "invalid", and "oops"; never clear a field.
  - **Apple:** interjections like "oops" can sound insincere.
- **Sources.**
  - https://www.nngroup.com/articles/error-message-guidelines/ (May 2023)
  - https://design-system.service.gov.uk/components/error-message/
  - https://developer.apple.com/design/human-interface-guidelines/writing
- **Why it matters here.** The game has few true errors (friend not found, offline, storage), but these rules also set the tone for results. A result is feedback on a choice and must never read as blame.

**UXW-P18. Empty and pending states say what is going on and give one next step.**
- **What it says.**
  - NN/g: an empty area leaves users wondering whether the system is working. A wrong "no items" message shown while content is still coming is worse than nothing.
  - Apple: blank screens should offer a clear next action, and since empty states are temporary, they shouldn't hold crucial information.
- **Sources.**
  - https://www.nngroup.com/articles/empty-state-interface-design/ (2021)
  - https://developer.apple.com/design/human-interface-guidelines/writing
- **Why it matters here.** A "0" for a score that will only be settled later is a false empty state. The owner has also ruled that a player is never left without a reading.

**UXW-P19. Confirm only what cannot be undone; make the buttons say what happens.**
- **What it says.** NN/g:
  - confirm only actions with serious consequences, and never routine ones;
  - be specific about what will happen;
  - label the buttons by outcome (for example "Delete file" and "Keep file"), with no default "Yes";
  - prefer undo.
- **Source.** https://www.nngroup.com/articles/confirmation-dialog/ (2018, last reviewed August 2026)
- **Why it matters here.** "Remove friend" wants undo, not a dialog. "Delete everything on this phone" wants one specific confirmation.

### F. Voice, tone and inclusion

**UXW-P20. One voice; tone moves with the moment.**
- **What it says.**
  - NN/g: tone has four dimensions (funny or serious, formal or casual, respectful or irreverent, enthusiastic or matter-of-fact).
  - Apple: fix the app's voice, then vary the tone with the situation. The same app is direct when things are serious and light when celebrating.
- **Sources.**
  - https://www.nngroup.com/articles/tone-of-voice-dimensions/ (2016, last reviewed August 2023)
  - https://developer.apple.com/design/human-interface-guidelines/writing
- **Why it matters here.** The scenarios touch dowry, custody and safety. Pulp and railway play belongs on covers and titles, never in feedback about the player's choices.

**UXW-P21. Explain consequences neutrally; never steer the choice.**
- **What it says.** Material 3: state the result of an action in neutral, direct language. Don't misrepresent consequences or try to influence the user's decision.
- **Source.** https://m3.material.io/foundations/content-design/style-guide/ux-writing-best-practices
- **Why it matters here.** In a scored fairness puzzle, wording that makes one option sound kinder or more sensible becomes a hidden answer key.

**UXW-P22. No generalisations about groups, even kind ones; gender-neutral references.**
- **What it says.**
  - **Microsoft:**
    - don't generalise about people, cultures or regions, not even positively or neutrally;
    - avoid stereotyped job roles in invented scenarios;
    - refer to people by role and use gender-neutral forms.
  - **Google:** avoid unnecessarily gendered language and use diverse names.
  - **GOV.UK:** keep third-person text gender-neutral.
- **Sources.**
  - https://learn.microsoft.com/en-us/style-guide/bias-free-communication (April 2024)
  - https://developers.google.com/style/inclusive-documentation (updated October 2026)
  - https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/right-tone/
- **Why it matters here.** The game shows loaded words on purpose, as the puzzle. The app's own voice must never carry them, and the player has to be able to see whose words they are.

### G. Low literacy and accessibility

**UXW-P23. Lower-literacy readers plough, miss things and lose their place.**
- **What it says.** NN/g found that lower-literacy users:
  - read word by word ("plough" the text) rather than scan;
  - have a narrower field of view, so they miss what sits outside the main column;
  - skip ahead when text gets dense;
  - lose their place when they scroll.

  NN/g's advice:
  - write key pages at about a 6th-grade level, and the rest at about 8th grade;
  - put the main point first;
  - use one column.

  GOV.UK:
  - between 1 in 8 and 1 in 4 adults across the UK nations have poor literacy;
  - specialists also prefer plain English;
  - split sentences over 25 words;
  - avoid negative contractions (they are often misread);
  - drop "please".

  WCAG's reading-level criterion (AAA) asks for text that needs no more than lower-secondary reading ability, or a simpler alternative.
- **Sources.**
  - https://www.nngroup.com/articles/writing-for-lower-literacy-users/ (2005; old, owner to accept; GOV.UK's current clear-language guidance points the same way)
  - https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/clear-language/
  - https://www.w3.org/WAI/WCAG22/Understanding/reading-level.html
- **Why it matters here.** The players are Indian adults of every schooling level, often reading in a second language. Long scrolls (EVAL-13's Sunday page is 3,568 px tall) are where they get lost.

**UXW-P24. Hidden words still need names, in the right language.**
- **What it says.**
  - WCAG 2.5.3: a control's accessible name should contain its visible label text, ideally at the start, so that speech users can say what they see.
  - WCAG 3.1.2: the language of each passage must be marked so screen readers pronounce it correctly.
- **Sources.**
  - https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html
  - https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html
- **Why it matters here.** Cutting visible text does not cut accessible names. A Devanagari line inside an English screen must carry `lang="hi"`.

### H. Hindi and Indian languages

**UXW-P25. Conversational Hindi, all of it translated, one script, English digits.**
- **What it says.** Google's UX Playbook for Indian Languages draws on interviews with 72 users in Hindi, Telugu and Tamil.
  - Use everyday spoken language, not academic translations. One user had not heard a formal Hindi word for "liquid" since school.
  - Translate everything, including errors and buttons.
  - Keep each string to one script; brand names may stay in English.
  - Use English digits, the ₹ sign, and lakh and crore; never abbreviations like "15k".
  - Avoid abstract icons.
  - Show users where they are and how far they have to go.
  - Users scan headings and rarely read paragraphs.
  - Its cover statistic: 98% of Indian internet users use an Indian language, alone or alongside English. The cited sources are Kantar ICube 2015 to 2020 and a Google and Kantar survey of 3,596 urban consumers in January 2021. The date of the 72 interviews is not stated.
- **Source.** https://www.thinkwithgoogle.com/_qs/documents/13326/App_and_website_localization_for_Indian_users.pdf (undated)
- **Why it matters here.** This is the closest thing to an official Indian-language UI writing guide. It backs the owner's rule that a player sees only the language they chose.

**UXW-P26. Literary Hindi fails; the words players actually say win.**
- **What it says.**
  - **Duolingo:**
    - its Hindi interface was too hard even for native speakers, because it used accurate but uncommon words;
    - users called the in-app currency "coin" or "diamond", not the Hindi word Duolingo had chosen;
    - writing "level" and "language" as the English words people use raised onboarding completion by 1%.
  - **Blackbuck (an Indian trucking app):**
    - set a conversational, colloquial voice;
    - found that truck owners' own words (such as "Deal") worked better than translations;
    - found that some English words are better transliterated;
    - ordered the language list by the user's city, with English second;
    - tested every copy update with users (over 100 people in feedback sessions).
- **Sources.**
  - https://blog.duolingo.com/language-learning-for-the-next-billion-duolingo-in-india/ (September 2020; old, owner to accept)
  - https://eng.blackbuck.com/why-humanization-and-localization-of-product-is-critical-in-fueling-digital-inclusion-part-ii/ (October 2022)
- **Why it matters here.** Both are game or trucking products for exactly the players this game wants. Prefer "लेवल" to "स्तर", for example.

**UXW-P27. Microsoft's Hindi guide: everyday words, translate the intent, gender-neutral forms.**
- **What it says.** The guide:
  - asks for a clear, friendly, concise style close to everyday speech;
  - lets translators depart from standard translations to keep the intent, and warns that literal translation fails;
  - gives example pairs (checked on page 6): चुनें rather than चयन करें for "select", and बदलें rather than परिवर्तित करें for "change";
  - allows sentence fragments and imperative verbs in menus;
  - for gender neutrality (page 13), asks writers to use plural pronouns or a person's role, and never slash forms like वह पुरुष/वह महिला.
- **Source.** https://aka.ms/hindi-styleguide (resolves to download.microsoft.com, hin-ind-StyleGuide.pdf, 45 pages)
- **Why it matters here.** The game is about gender, so it must never assume the player's own gender. Hindi verbs and adjectives agree with gender, so this has to be designed into the Hindi wording, not patched afterwards.

**UXW-P28. Translations grow; language names go in their own script.**
- **What it says.**
  - Material 3: other languages average 1.5 times the length of English.
  - W3C, citing IBM: short strings grow the most when translated into European languages, 200 to 300% for strings under 10 characters.
  - W3C: a language menu should name each language in its own language and script (for example "français").
- **Sources.**
  - https://m3.material.io/foundations/content-design/global-writing/word-choice
  - https://www.w3.org/International/articles/article-text-size
  - https://www.w3.org/International/questions/qa-navigation-select
- **Why it matters here.** The expansion figures are for European languages. A Hindi-specific factor was not found: UNVERIFIED, to be measured on our own strings.

---

## 2. Rules for Equal Lens Daily

**Counting rule** (used by UXW-1 to UXW-5):
- Count words on the rendered screen at 390 px wide, in the language shown.
- Exclude:
  - character names and road names;
  - numbers;
  - lines spoken by a named character.
- A "screen" is everything the player can scroll to before the next tap that changes it.
- Count the rendered page, not single strings, because EVAL-13 passed a per-string check while every screen was over budget.

### Budgets

**UXW-1.** A puzzle screen carries at most 15 words; any other screen at most 20 (owner rule). Both languages are counted.
- One exception: the notice sheet before anything leaves the phone (UA-47) must list each item of data kept, so it may run past 20 words by those short itemised lines only. The owner sees it drawn.
- *Test:* a word counter on the rendered page fails the build.

**UXW-2.** Each screen asks exactly one question, of at most 10 words, phrased as the player's task.
- The question ends with "?", or is an imperative for a pure picking step ("Pick 6 for tonight").
- No other line asks, instructs or restates it.
- *Test:* mark every line that tells the player what to do; there is exactly one.

**UXW-3.** Puzzle screens carry no instruction sentences. The board shows the next step:
- empty slots;
- a pulse on the first target;
- the selected state;
- a counter.

Hint text follows the step model (usability digest 2.0a, point 4): none in the first build. Only if the five-player test shows a mechanic cannot be learnt from the board does it get one hint of at most 6 words beside the first target, which goes after the first correct action and never comes back.
- *Test:* on a second play of any mechanic, no hint string renders.

**UXW-4.** Each game rule is explained once, at the moment it first applies, in at most 8 words.
- *Example:* the forgiven missed day is told on the first day a player actually misses: "You missed Tuesday. Streak kept." The line shows in place under the streak until the player taps Play, and any toast with the same words stays at least 4 s (DG-28).
- *Test:* rule sentences on the Today and result screens: 0.

**UXW-5.** A whole day's flow, from cover to result, carries at most 100 words, about 30 seconds of reading at 200 words a minute. The scenario's own spoken lines are not counted.
- This is our derivation from UXW-P1, not a published number (HOUSE).

### Order and front-loading

**UXW-6.** Fixed order, top to bottom:
1. the scene or object;
2. the question;
3. the choices;
4. one main button at the bottom, in the thumb zone.

At most one meta line (day, issue number or level), of at most 4 words, sits above the scene. Nothing sits between the choices and the main button.

**UXW-7.** Front-load. The first 2 words of every question, label and button carry the subject or the action.
- Never open with filler ("Does this...", "First,...", "Some of...").
- *Test:* cut each string to 11 characters; someone new can still say what it is about.

**UXW-8.** Never repeat on one screen. No title, blurb, label, question or counter may restate another.
- *Test:* delete each line in turn; if nothing is lost, it stays deleted.

**UXW-9.** Progress and limits are tokens inside the object (three check tokens, six empty seats, the height of the card stack), never sentences and never "2/6" text (settled after the critique, usability digest 2.0c). TalkBack hears the count in words ("2 of 6 picked").

### Buttons and controls

**UXW-10.** The main button label:
- starts with a verb;
- is 1 to 3 words plus at most one name;
- is in sentence case;
- names what happens in the game.

Examples: "Send Kamla", "Hand out jobs", "Send the team", "Cut" and "Keep".

Banned:
- "OK", "Submit", "Confirm", "Continue", "Next" and "Done" wherever a specific verb exists;
- any label containing "my".

**UXW-11.** One main button per screen, plus at most one other visible action, styled clearly lower (text or outline). Tabs don't count.
- The language switch has one home: a small chip in the cover's top bar ("EN | हिं"), never a button styled like Play (settled after the critique, usability digest 2.0c).
- Result screens offer only one next step that the tab bar doesn't already offer.

**UXW-12.** No dead buttons. Before the step can be completed, the main button follows the step model (usability digest 2.0a, point 3): it stays in its place, muted, and its own label says what is missing, in at most 4 words ("Pick 2 more").
- It is `aria-disabled`, stays focusable and says why.
- A status ("Week closed") is never drawn as a button.

**UXW-13.** Every label fits on one line at 360 px in both languages, at the set size: no truncation, no wrapping.
- *Test:* a 360 px screenshot sweep of every screen in English and Hindi.

**UXW-14.** The same action always uses the same word in the same place, every day and in both skins. Skins change objects and titles, never action words. The action words are a fixed list in the glossary (UXW-16).

**UXW-15.** Sentence case for every question, label and line, in both skins, and for every button in Station and in Hindi.
- Whether Lugdi's English buttons keep the samples' capitals, and whether capitals stay on cover titles of at most 4 words that are part of the art, is owner question OQ-3. This file no longer settles it.
- Devanagari has no capitals, and its questions and buttons are never set in a display face (UXW-39).

### Words and terms

**UXW-16.** Keep one bilingual glossary, with exactly one word per concept in each language. Minimum entries:

| Concept | English | Hindi |
|---|---|---|
| score | score | स्कोर |
| consistency | consistency | to be chosen with players |
| practice | practice | to be chosen with players |
| lean | lean | to be chosen with players |
| streak | streak | to be chosen with players |
| check | check | to be chosen with players |
| note | note | to be chosen with players |
| rule | rule | नियम |
| level | level | लेवल |
| road name | road name | to be chosen with players |
| board | board | to be chosen with players |
| friend | friend | दोस्त |
| week | week | हफ़्ता |

- *Test:* search the content for synonyms of each concept; there are none.

**UXW-17.** The result shows the same labels, in the same order, every day: score, consistency, practice, and the lean (size only) if the owner puts it on the day result (OQ-1).
- Mechanic details (rule kept, word gap, check gap) never become new labelled rows. If they are shown at all, they are pictures, such as the two twin cards side by side.

**UXW-18.** The player is "you". Never "my", "me" or "I" on a control, and never "we" for the app.

**UXW-19.** Words on controls and questions are literal. Fiction words may sit on titles and objects, but each button label must make sense to someone who has not read the fiction.
- *Test:* show each label alone to 5 people; at least 4 say what will happen.

**UXW-20.** No idioms, slang, or phrases with a second meaning in Indian English or Hindi. Every string gets one read for double meanings before it ships ("cut the line" fails, because in India it also means jumping a queue).

**UXW-21.** No abbreviation or code that the player must decode (RAC, CNF, WL), unless the picture already carries the meaning.

**UXW-22.** All numbers are numerals, with Western digits in Hindi too. Money uses ₹, lakh and crore, and Indian grouping (1,20,000), never "15k".

### Results, pending, errors, empty states

**UXW-23.** A result never labels the person.
- None of these words: fair, unfair, biased, wrong, failed, perfect, well done.
- It shows what happened to the cases: the score and, on the days and in the form OQ-1 decides, the lean size and the look-again pair.
- It always has one next step.
- Whether the Lugdi result keeps the pulp "The End" band or names the day's object instead is owner question OQ-4. This file no longer settles it.

**UXW-24.** A pending score is never shown as zero. Every day's result has the same layout and the same words, whether or not that day carries a hidden item.
- *Test:* the results of an ordinary day, a twin day and a transfer day differ only in their numbers.

**UXW-25.** The interface never names the research design. Banned in both languages:
- "transfer day";
- "new kind of puzzle";
- "counts later";
- "counts quietly";
- "direction hidden";
- "twin";
- "held out".
- *Test:* a banned-word search over all content.

**UXW-26.** The lean is shown as size only, never with words about its direction or how it is worked out. Its form is owner question OQ-1: the samples' "18 of 100"; a picture with no number; or "Lean 22" over a 0 to 100 bar (this file's earlier proposal, with the risk that a bar filling from one side reads as a direction). Whatever is chosen, it keeps one fixed label in each language, from the glossary (UXW-16).

**UXW-27.** Errors and blocked states (friend not found, offline, storage full, name taken):
- appear next to where they happened;
- say what happened and what to do, in at most 12 words;
- avoid "oops", "sorry", "please", "invalid" and "you forgot";
- keep whatever the player typed.
- *Example:* "No road name 'Ka'. Check the spelling."

**UXW-28.** Empty states (no friends yet, the board before the first play, a Sunday with one day played) show one status line of at most 6 words and one action. Never a blank area, and never a false "nothing here" while content loads.
- *Example:* "No friends yet" with "Add by road name".

**UXW-29.** Destructive actions:
- removing a friend happens at once, with an "Undo" visible for at least 5 seconds (HOUSE, usability digest 2.0c);
- deleting all data asks once, naming what goes ("Delete all your days and notes?"), with the buttons "Delete all" and "Keep";
- routine actions get no confirmation;
- "Start again" is a small text action, never a large button beside the main one.

**UXW-30.** Draft, sample and prototype notices never appear in the flow; they go behind one chip in the menu. Invented figures (a crowd of 41,302) are not shown to players as if real.

**UXW-31.** No price or money marks on this free game outside the story itself (the ₹6 lakh chit fund is story). The pulp "Price ₹2" roundel is the one open case: keep it as decoration, turn it into an issue number, or drop it is owner question OQ-5. Duolingo found that newly online Indian users read promotions as paywalls (UXW-P26), which is the risk to show the owner.

### Voice and inclusion

**UXW-32.** The voice is casual, respectful and matter-of-fact.
- Play belongs on covers and titles only.
- Any screen about harm (dowry, safety, custody, violence) is serious and plain: no puns, no exclamation marks.
- Feedback on the player's choices is never funny.
- On those hard days (trauma-informed handling, UA-46): the cover names the setting plainly, so the player knows what the day is about before starting; no line describes violence in detail; the player's choice is never called harmful; and reminders, share cards and the lock screen never mention the topic.

**UXW-33.** The app's own voice never generalises about women, men or any group, not even kindly. Loaded words appear only in a line a named character says, shown with their name and portrait. Every quoted line has a visible speaker.

**UXW-34.** Answer options in a set are written alike:
- same grammar;
- lengths within 2 words of each other;
- no value word ("everyone", "fair", "safe") in one option only;
- no option disguised as a person.
- *Test:* strip the names; the options give no hint which is "right".

**UXW-35.** The app never assumes the player's gender.
- English uses "you".
- Hindi uses आप and polite imperatives (चुनें, भेजें, रखें), and avoids past-tense forms that mark the player's gender (for example गए or गई).
- No slash forms such as सकता/सकती.

### Hindi and other languages

**UXW-36.** Show only the chosen language.
- The English interface carries no Hindi or Hinglish except proper nouns and the language switch.
- The Hindi interface is in Devanagari only, except brand names.
- Each string uses one script.
- The switch names each language in its own script: "English" and "हिन्दी".
- Whether the regional-script line on Station boards stays is owner question OQ-6.

**UXW-37.** Hindi is written fresh from the intent by a fluent writer, in everyday spoken Hindi, using the glossary.
- Prefer the words players say, including common English loanwords in Devanagari (लेवल, स्कोर, टीम), over formal words such as स्तर, नियुक्त करें, जारी करें or चयन करें.
- *Test:* 5 Hindi-first players read each new screen aloud. Every word they stumble on, or replace with their own, goes into the glossary.

**UXW-38.** A language is offered only after it passes UXW-37. There is no "draft" label: the switch stays hidden until then.

**UXW-39.** Hindi questions, buttons and labels are set in the reading face (Hind), at the same size as English or larger. The display face is for titles only.
- Layouts hold 1.5 times the English length for lines, and twice for labels under 10 characters, without wrapping or clipping.
- The real Hindi factor is UNVERIFIED and must be measured.

**UXW-40.** Every element carries its language (`lang="en"` or `lang="hi"`). Every icon-only control has an accessible name in the current language, and that name contains any visible text, at its start.

### Low literacy and pictures

**UXW-41.** Writing level:
- use words a 12-year-old knows;
- keep every sentence to 12 words or fewer, with one point each;
- no negative contractions in instructions;
- no nested clauses.

The 12-word cap is derived from GOV.UK's 25-word ceiling for web pages and COGA's one point per sentence, tightened for a game.

**UXW-42.** Everything a step needs is visible without scrolling at 360 by 640 and 390 by 844, in one column; at 200% text a step may scroll with the main button pinned (UA-16). The Sunday week is never one long page; whether it is one screen or a short sequence of cards is owner question OQ-2.

**UXW-43.** Stats are numbers with a one-word unit, or pictures (pips, bars).
- Icons that are not universal carry a one-word label.
- Realistic pictures beat abstract icons.
- Never use a letter square in place of a portrait.

### Checks before anything is shown

**UXW-44.** Every screen ships with:
- a rendered word count in both languages;
- an 11-character truncation check on titles and buttons;
- a 5-second look by someone who has not seen it ("what do you do here?").

These checks certify hygiene only; the owner approves the look (`design-before-build.md`).

---

## 3. Broken in the EVAL-13 build

**Evidence.** All 61 screenshots in `/Users/priyanshu/equal-lens-trainer/out/trainer-shots/` were read. Word counts were made by eye from the screenshots, using the counting rule in section 2; "about" means within a few words.

### Word budgets (UXW-1, UXW-5)

| Screen | Budget | About | Where the words go |
|---|---|---|---|
| 001-onboarding-language | 20 | 24 | Brand twice, a tagline, "Choose your language" and a draft notice, around two buttons |
| Today hub, the same layout 14 times (003, 007, 011, 015, 019, 023, 027, 029, 035, 039, 043, 047, 051, 055) | 20 | 39 | Kicker, level, price roundel, blurb, Play, road name, practice, streak, the forgiveness sentence, language switch, tabs |
| 016-04-L-thu-words-arrive | 15 | 60 | 35 even before the record, the two notes and the word bank are counted |
| 020 and 048 (checks) | 15 | 53 | |
| 024 and 052 (team) | 15 | 48 | |
| 028 and 056 (Sunday week) | 20 | 130 | On one page about 3,570 px tall |
| 057-board | 20 | 50 | |

The Monday flow alone (003 to 006) carries about 180 words, against UXW-5's 100 for a whole day.

### Rule by rule

**UXW-2: one question of 10 words or fewer.**
- **004 and 030:** the question is followed by a second prompt, "First, lock a rule".
- **008:** two questions: the blurb's "Keep each line, or cut it?" and "Does this line go in the column?".
- **020 and 048:** an instruction heading ("Spend up to three checks. Tap a person to call their referee.") plus a separate "Who keeps the cash box?".
- **024 and 052:** "Pick the six for tonight." plus "And Salim chacha?" (and "And Meena aunty?" on 052), two tasks on one screen.
- **032:** a 17-word question.
- **036:** two set-up sentences plus the question, 15 words.

**UXW-3: no instruction sentences.**
- **005:** "Tap a person, then a job."
- **016, 017, 040 and 041:** "Tap a blank, then a word. Each word fits either note."
- **020:** "Tap a person to call their referee."
- **031:** "Tap people in order, first place first."
- **048:** "Tap a ticket to punch it.", although no ticket is drawn.

**UXW-4: rules told once.** "One missed day a week is forgiven." appears on every Today and result screen, about 28 times in the fortnight (for example 003, 006, 010, 029, 034, 055).

**UXW-6: order and meta lines.**
- Every screen opens with a kicker plus a level ("Ghat Series · No. 212 · Monday", "Level 2").
- Monday also carries a price roundel (003 to 005).
- On 020 and 048 the question comes after the cards.
- On 005, 024 and 025 the main button sits below the first screenful.

**UXW-7: front-loading.** These lines open with filler or bury the subject:
- "Does this line go in the column?" (008);
- "Some of today's choices count later in the week." (014, 022, 026);
- "Lean size (of 100 · direction hidden)" (028, 056);
- "Check gap between matching records" (022, 050);
- "Crowd guess, points off" (034).

**UXW-8: repetition.**
- **001:** the brand twice.
- **002:** the title "Pick your road name" plus the label "Pick your road name".
- **004:** "You set the rule first." plus "First, lock a rule".
- **008:** the blurb repeats the question.
- **016:** the blurb, heading and instruction say the same thing three times.
- **020:** checks are stated three times (blurb, heading, counter).
- **024:** "pick 6" is stated three times (blurb, heading, counter).
- **057:** the heading "Friends" appears twice.

**UXW-9: counters, not sentences.**
- "Checks left: 3" sits beside a sentence that says the same (020).
- "0 of 6 picked" sits beside "Pick the six" (024).
- "Line 8 of 8" is boxed like a notice, under a question with no line left to answer (009).

**UXW-10: button labels.**
- **"Confirm my choice":** generic, and uses "my" (012, 013, 036, 037, 044, 045). The Hindi "मेरा चुनाव पक्का" (059) has the same problems.
- **"Lock my guess":** uses "my" (032, 033).
- **"Appoint" / "नियुक्त करें":** a bare verb with no object (020, 021, 048, 049, 061).
- **"This is me":** does not say that it keeps the name (002).
- **"Close the column":** fiction-only (008, 009).

**UXW-11: one main action.**
- **057:** five full-width yellow "Add ..." bars, plus "Remove ..." and "Find".
- **Every Today hub (for example 003, 029):** the language switch is drawn as heavily as Play.
- **031:** a large "Start again" sits directly above the main button.
- **Result screens:** "Back to today" repeats the Today tab (006, 010, 034).

**UXW-12: dead buttons.** Dashed buttons that do nothing and give no reason:
- 004 (two of them), 008, 012, 016, 020, 024, 030 (two), 036, 040, 044, 048 and 052;
- in Hindi: 059, 060 (two) and 061.

On 028 and 056, the status "Week closed" is drawn as a dashed button.

**UXW-14 and UXW-15: same words, same case.** Lugdi sets buttons in capitals in the display face (003 "PLAY TODAY'S PUZZLE", 004, 006, 008, 017, 025, 028 "ADD A FRIEND"). Station sets the same labels in sentence case (029, 034, 041, 053, 056). One element type ends up in two styles.

**UXW-16 and UXW-17: one word per concept.**
- **Consistency appears under five labels:**
  - "Rule kept" (006, 034);
  - "Matching cases treated alike" (010, 046, 050, 054);
  - "Word gap between the two notes" (018, 042);
  - "Check gap between matching records" (022, 050);
  - "How consistency is made" (028, 056).
- **"Practice"** is points on the hub (003, "Practice 70") but a count on Sunday (028, "6 puzzles solved").
- **Checks are also "punched":** "Spend up to three checks. Tap a ticket to punch it." (048).
- **Three words for one thing:** "announcements" in the heading, "note" in the instruction, "notes" on the button (040, 041).
- **Kicker wording drifts:** "Ghat Series · No. 212", "Chart 219", "Transfer day 220", "No. 221", "Back cover · Week 43", "PNR slip · Week 44". The board tab also reads "PNR slip" (057).

**UXW-18: "you", not "my".** "Confirm my choice", "Lock my guess" and "मेरा चुनाव पक्का" sit beside "Your guess" (032), "Your rank" and "Your band" (057), and "Your week in numbers" (027).

**UXW-20: double meanings.** 032 and 033 ask what share of players "cut the line" about Arjun, on a Tatkal queue screen, where "cut the line" reads as jumping the queue.

**UXW-21: codes.**
- "RAC", "CNF", "WL 1" and "WL 2" are not explained (031).
- "2-year gap, family" is telegraphic shorthand (020, 048).

**UXW-23: results that label or end.**
- "THE END" heads every Lugdi result (006, 010, 014, 018, 022, 026). The owner has already called a result "very discouraging and terminal" in an earlier build.
- Every result shows the score as a formula ("110 Score = 100 Consistency + 10 Practice").

**UXW-24: pending is never zero.**
- **014 and 026:** "0 Consistency", with "Some of today's choices count later in the week.". It reads as failure.
- **038:** no score at all ("No score today. This one counts quietly in your week."). This breaks the owner's rule of always showing a reading.

**UXW-25: the research design is named on screen.**
- **035 to 038:** "Transfer day 220 · Tuesday", "A new kind of puzzle" and "Nothing about jobs or teams today." announce the unannounced transfer day.
- **014, 022 and 026:** they tell the player that a delayed twin is coming.
- **028 and 056:** "direction hidden".

**UXW-26: the lean.** "Lean size (of 100 · direction hidden) 22" sits above rows reading 100%, 4 of 4, 0 checks and 0 of 100 (028). A lean of 22 among perfect rows looks like a contradiction, and nothing explains it.

**UXW-29: destructive actions.**
- **057:** "Remove Highway Ka Pahiya" is a full-width button with no undo in view.
- **058:** "Delete everything on this phone" is styled exactly like "Back to the real date". Whether a confirmation follows is not visible in the screenshot: UNVERIFIED.
- **031:** "Start again" clears the order and sits as a large button beside the main one.

**UXW-30: notices in the flow.**
- "The Hindi is a draft." (001).
- "Sample crowd: 71% of 41,302 players. Made up for this prototype." (034).
- "Sample board: the other players are made up for this prototype." (028, 056, 057).

**UXW-31: money marks.** "Price ₹ 2" sits on a free game's first daily screens (003, 004, 005). Duolingo found that newly online Indian users take promotions for paywalls.

**UXW-33: unattributed loaded words.** On 012, 013, 044 and 045, "Drives very fast on the ghat." and "Drives the ghat with full confidence." are in quote marks with no speaker. The player cannot tell whose judgement it is.

**UXW-34: options written alike.**
- **024 and 052:** only one option carries a value word ("A ride home for everyone"). The others are "Do as Salim chacha says" and "Leave the team as it is".
- **036:** "Neither: both show ID" is set in a portrait frame with a letter "N", posing as a person, and reads as the principled answer.

**UXW-36: one language.**
- **English interface:** Station boards print Gujarati, Telugu, Bengali and Tamil lines (029, 039, 047, 051).
- **Hindi interface:** Gujarati and Bengali appear above Hindi (060, 061).

Both put a third script on every Station day. Owner decision below.

**UXW-37: Hindi register.**
- **061:** "तीन जाँचें तक करें।" is a word-for-word rendering of "spend up to three checks" and reads unnaturally; "नियुक्त करें" is formal.
- **060:** "टिकट जारी करें" is office Hindi.
- **059 to 061:** "स्तर" is used for level, where Duolingo found players understand the English word "level" better.

**UXW-38: draft language.** The Hindi is offered with a "draft" notice (001) instead of being held back until reviewed.

**UXW-39: Devanagari in the display face.** On 059, the button "मेरा चुनाव पक्का" and the names "कमला" and "राजू" are set in the heavy display face and are hard to read at a glance.

**UXW-42: scrolling.** 028 is 3,568 px tall, 056 is 3,598 px and 057 is 3,208 px. On 005, 024 and 025 the main button is below the first screenful.

**UXW-43: letter squares.** "J" (031), "F" (048, 049), "फ" (061) and "N" (036, 037) stand in for portraits.

### Rewrites for the worst strings

These are starting points for the new copy, under the rules above. The Hindi lines are for the Hindi writer to check (UXW-37).

The rewrites for 001 (the language screen) and 002 (the road-name screen) are deleted after the critique: neither screen should exist, because no screen comes before the cover (DG-1, HIG-37). The language becomes the cover chip (UXW-11) and the road name is revealed on the first result (DG-3).

| Screen | EVAL-13 | Rewrite |
|---|---|---|
| 004 | "Who gets the three stall jobs?" with "First, lock a rule" and two dead buttons | Step 1: "Which rule decides the jobs?" with three rule chips; the main button reads "Pick a rule", then "Lock rule" after a pick. Step 2: "Who gets each job?"; the button reads "Fill 3 jobs" until all 3 slots are filled, then "Hand out jobs". |
| 008 | "Does this line go in the column?", "Line 1 of 8", dead "Close the column" | "Print this line?" with "Cut" and "Keep"; the height of the paper stack shows the lines left; after line 8, "Print column" |
| 012 | "Confirm my choice" | Tapping a card selects it; the button reads "Send Kamla" |
| 020 | Instruction heading, "Checks left: 3", "Who keeps the cash box?", "Appoint" | "Who keeps the cash box?" with three check tokens; the button reads "Appoint Farida". Hindi: "गल्ला किसके पास रहेगा?" and "फ़रीदा को चुनें" |
| 024 | Pick 6 stated three times, then "And Salim chacha?" on the same screen | Screen 1: "Pick 6 for tonight" with six empty seats that fill as players are picked. Screen 2: Salim's line, then "What do you do?" with three options written alike. (How many people a team day shows is OQ-8.) |
| 014, 026, 038 | "0 Consistency" with "counts later"; "No score today" | The same result layout every day: practice added, consistency shown as the week's running value |
| 035 | "Transfer day 220 · A new kind of puzzle"; "Nothing about jobs or teams today." | The same kicker as any other day |
| 028 | "Lean size (of 100 · direction hidden) 22" | The form is OQ-1; whichever is chosen, no "direction hidden" and one fixed label |
| 057 | Five "Add ..." bars; "Remove Highway Ka Pahiya" | Rows with a "+" control (accessible name "Add Ghat Ka Dhuan"); remove from a row menu with "Removed. Undo" |
| 003 | "One missed day a week is forgiven." on every screen | Nothing, until the first missed day: "You missed Tuesday. Streak kept.", in place under the streak until Play is tapped (DG-28) |

### What EVAL-13 got right (keep)

- **Outcome verbs:** "Cut it" and "Keep it" (008), "Hand out the jobs" (005), "Post both notes" (017), "Send the team" (025).
- **The language buttons** name each language in its own script (001).
- **The Hindi screens** use Western digits (059 to 061).
- **Everyday Hindi in places:** "गल्ला किसके पास रहेगा?" (061), and "ट्रिप" as a loanword (059).
- **Short privacy lines:** "Stays on this phone. Never scored, never read." (028) and "Other players see this name. Never your real one." (002).
- **"A note for yourself (optional)" and "What was different?"** (028): the optional label follows GOV.UK, and the reflection question is the owner's.

### For the owner to decide

These now sit, in plain words and with the pictures to show, in the single owner list in [../ux/journeys.md](../ux/journeys.md). Where UXW-15, UXW-23 and UXW-31 used to settle them, they now point there.

| Was | Now |
|---|---|
| 1. The city-script line on Station boards | OQ-6 |
| 2. Capitals on Lugdi covers and buttons (UXW-15) | OQ-3 |
| 3. "The End" on Lugdi results (UXW-23) | OQ-4 |
| The "Price ₹2" roundel (UXW-31) | OQ-5 |
| How the lean is shown (UXW-26) | OQ-1 |
| Sunday as one screen or a sequence of cards (UXW-42) | OQ-2 |

---

## Changes after critique

Applied from [../ux/critique-stage1.md](../ux/critique-stage1.md) on 20 Oct 2026.

- **Ids (should-fix 3).** Principles are UXW-P1 to UXW-P28 and rules UXW-1 to UXW-44, including in section 3.
- **Must-fix 3.** UXW-17, UXW-23 and UXW-26 no longer fix the lean's form or place; that is OQ-1, with "Lean 22 over a bar" kept as one of the three pictures.
- **Must-fix 5.** Deleted the rewrites for screens 001 and 002, which should not exist. UXW-11 gives the language switch one home, the cover chip.
- **Must-fix 6.** UXW-15 (capitals), UXW-23 ("The End") and UXW-31 (the price roundel) no longer settle rule-versus-look clashes; they point to OQ-3, OQ-4 and OQ-5.
- **Must-fix 7.** UXW-3 and UXW-12 follow the shared step model: no hint text in the first build, and the muted main button names what is missing.
- **Must-fix 9.** UXW-42 tests at 360 x 640 and 390 x 844, carries the 200% exception and sends Sunday's shape to OQ-2.
- **Should-fix 1.** UXW-9: marks inside the object, not "2/6" text. UXW-29: undo for at least 5 s. The rewrites table follows both.
- **Should-fix 12.** UXW-32 adds the words rules for hard days (dowry, custody, safety), tied to UA-46; UXW-1 notes the itemised consent sheet (UA-47) as the one exception to the word budget.
- **Should-fix 13.** NN/g 1997, 2005, 2007, 2009 and 2014 and Duolingo 2020 marked "old, owner to accept".
- **Should-fix 14.** "For the owner to decide" points to the single owner list.
