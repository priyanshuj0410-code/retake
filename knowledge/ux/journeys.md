---
type: ux-research
title: Equal Lens Daily user journeys
description: End-to-end journeys for the six primary personas of Equal Lens Daily across fifteen stages, from hearing about the game to leaving it, with what each player does, thinks and feels, the screen they meet, the risks and the opportunity, followed by the moments that matter most, where journeys split, and a raw list of the screens and features the journeys imply. Stage 1 of the design order the owner set.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-14/
---

# Equal Lens Daily: user journeys

## How to read this

- **What this is.** One journey per primary persona in [personas.md](personas.md) (P1 to P6), across the same 15 stages, so the six can be laid side by side. After the critique, P2 is the merged Ravi (shopkeeper and night-time competitor) and P4 is Meena, a rural player on a 2 GB phone. The anti-personas (A1 board farmer, A2 hostile screenshotter) and the people who share a phone appear inside the stages as risks. Five moments the 15 stages missed have their own section after the journeys.
- **What it builds on.**
  - The rules in [../foundations/daily-game-patterns.md](../foundations/daily-game-patterns.md) are cited as **DG-1** to **DG-53**. Rules from the other digests carry their own prefixes (HIG, M3, PH, UXW, UA), so no id means two things.
  - Every puzzle step follows the one step model, and every size and timing follows the one set of numbers, in section 2.0 of [../foundations/usability-and-accessibility.md](../foundations/usability-and-accessibility.md).
  - Each journey assumes the game follows those rules, and shows where a rule is not enough or where a new feature is needed.
- **Owner questions.** This file holds the single deduplicated list for all eight Stage 1 files: **OQ-1 to OQ-30**, at the end, each with the pictures to show.
- **What it is not.** No player has been interviewed. Every "thinks" and "feels" line is a design hypothesis for the first playtests. Anything I judged without a source is marked **ASSUMPTION**. A claim from a source I could not read as raw text is marked **UNVERIFIED**.
- **Evidence of what not to do.** The failed build EVAL-13 is cited by screenshot number, for example "EVAL-13 003" for `/Users/priyanshu/equal-lens-trainer/out/trainer-shots/003-01-L-mon-cover.png`. Approved samples are cited as "sample p05" (`ls/shots/p05.png`) and "sample 3-p16" (`ls/shots3/p16.png`) under the session scratchpad.
- **Owner rules that bind every row.** One question of 10 words or fewer; 15 words on a puzzle screen, 20 elsewhere; never shame; always a reading; never auto-advance; only the chosen language; 3 to 5 people per choice (the samples' exceptions are OQ-8); cards look the same before a choice; single column on phone ([I3], [I4]).

### Column key

| Column | Meaning |
|---|---|
| Does / Thinks / Feels | One line each. "Thinks" is in the player's voice. |
| Touchpoint | The screen, sheet, message or object the player meets. These names feed the information architecture stage. |
| Pain points and risks | Tagged **[Confusion]**, **[Text]** (too much reading), **[Pushback]** (reactance: the player resists being told what to think), **[Privacy]**, **[Phone and data]** (slow, full or old phone, data cost), **[Access]** (vision, one hand, large text, colour), **[Trust]**. |
| Opportunity | What the design can do at that moment. **NEW** marks an idea the patterns digest does not already cover. |
| Mood | Two ordinal guesses, not scores: first, how the player feels at this stage if the risk in the row happens; second, how they feel if the opportunity is built. The scale is **Quit** (likely to leave here), **Low**, **Mid**, **Good**, **Keen** (will come back). Where the row names no real risk, the first guess can be Good. These are **ASSUMPTION** for playtests to check, and they are never added up. |

### The 15 stages and what the game does at each (shared baseline)

| # | Stage | What the game does, as the digests propose | Rules | What EVAL-13 did instead |
|---|---|---|---|---|
| S1 | Hearing about it | A share card in the week's style (puzzle number, road name, streak, neutral marks) plus a link, landing in a WhatsApp group; or someone shows their phone | DG-24, DG-25 | No share anywhere (006, 010, 034, 038) |
| S2 | First open | The link opens today's cover. No sign-up, no screen before it | DG-1, DG-5, DG-17 | Three screens and three taps before the puzzle (001, 002, 003) |
| S3 | Choosing language | Defaults from the phone; a small chip in the cover's top bar ("EN \| हिं") is the switch's only home; switching keeps progress | DG-2 | A whole language screen (001), then a heavy language button on every cover (003) |
| S4 | Getting a road name | Made silently on first play, revealed on the first result, "Change" offers 3 others; later changed in the "?" sheet | DG-3, DG-35 | A form before play, title said twice (002) |
| S5 | First puzzle | One short question; the board shows the next move; one ghost demonstration on a mechanic's first day; tap to pick, one named main button to commit; a muted main button that names what is missing; "?" on pull; undo until the lock; back at top left | DG-6 to DG-16, DG-48 to DG-51; the step model (UA 2.0a) | Instruction sentences, dashed buttons, the answer asked twice (004, 012, 016, 020) |
| S6 | Day result | One screen: the finished object, one big number with consistency and practice under it, one line, "Day 1", Share and Board, a tease of tomorrow. Whether the lean shows here is OQ-1 | DG-22 to DG-26, DG-30 | A calculator sum, no art, no share (006) |
| S7 | Day 2 | The cover's button follows the state; the streak count in the top bar; the reminder offer and (on iPhone) the Home Screen offer on the day 2 result | DG-18, DG-29, DG-36, DG-37 | The same hub every day; no reminder or install code (003, 007) |
| S8 | First Sunday | The six days as marks, practice, the lean (form per OQ-1), one look-again pair, "Write a note", Share, Add a friend. One screen or a short sequence is OQ-2 | DG-41 | A 3,568 px report with an open text box and the board again (028) |
| S9 | Missing a day | One missed day per week forgiven automatically, drawn as its own mark with a shape and a word; the first time, one line in place under the streak until Play is tapped, plus a toast of at least 4 s | DG-27, DG-28 | "One missed day a week is forgiven." printed on every screen (003, 006, 028) |
| S10 | Adding a friend and the board | Reached from the Board tab; opens on Friends; Everyone shows your band, 2 above, 2 below and the top 3; add by road name | DG-31 to DG-35 | A 10-row table, "Your rank 1,961", five full-width Add bars (057) |
| S11 | A level getting harder | Monday easiest, Saturday hardest; the floor rises week on week; no raw level number; hard days handled with care | DG-9, DG-44 to DG-46; UA-46 | The ladder reset each Monday; a raw "Level 10" (023, 051) |
| S12 | A transfer day | Looks and scores like any other day; the day before's tease does not name it (OQ-12) | DG-47 | Announced three ways (034, 036, 038) |
| S13 | The first month | A 28-mark month strip from Week; a milestone at day 30; one festival day a month | DG-26, DG-42 | A 14-box strip, no month view (003, 028) |
| S14 | A lapse and return | The count restarts without comment; the best streak is kept in Week | DG-30 | Not covered |
| S15 | Leaving | Reminders off in one tap from the "?" sheet; history can be deleted; no notices about friends' activity | DG-38, DG-40, DG-53 | Not covered |

---

## P1. Shruti, the puzzle collector (27, Bengaluru, iPhone, English)

| Arrives through | Plays | Phone | Wants | Biggest risk |
|---|---|---|---|---|
| A colleague's result card in the office WhatsApp group | Morning bus (**ASSUMPTION**), bed after 11 pm | iPhone 13, 5G | A clever trap and a card worth posting | Losing everything on iPhone after a week away; preachy tone |

| # | Stage | Does | Thinks | Feels | Touchpoint | Pain points and risks | Opportunity | Mood |
|---|---|---|---|---|---|---|---|---|
| S1 | Hearing | Sees a colleague's card in the office group on the bus | "A fairness puzzle? Probably a POSH quiz." | Curious, a little wary | Share card and link preview in WhatsApp | **[Pushback]** a card or preview that reads like HR or an NGO campaign gets skipped. If HR sent it, it feels assigned [personas, non-players] | A card that looks like a game object (a Lugdi mini-poster), spoiler-free, with no cause slogan in the preview text (link previews are built from the page's title, description and image, UNVERIFIED for WhatsApp) | Low / Good |
| S2 | First open | Taps the link; it opens in a browser | "Where's the catch? Sign-up?" | Relieved to find a cover and Play | Today's cover | **[Text]** a splash, the brand twice or a sign-up wall and she closes the tab (EVAL-13 001). **[Trust]** a link opened inside another app's browser may keep its storage apart from Safari, so she looks new later (UNVERIFIED) | Cover with one line and Play pinned at the bottom (DG-1, DG-17) | Low / Keen |
| S3 | Language | Nothing; her phone is in English | Does not notice | Neutral | "EN \| हिं" chip in the cover's top bar | **[Confusion]** if the game guessed Hindi from her region she would struggle (her Hindi reading is slow) | Default from the phone's language, never from location (DG-2) | Mid / Good |
| S4 | Road name | Reads "You drive as Kilometre Kamli" on her result | "Ha. Is there a cooler one?" | Amused | Result line, road-name sheet | **[Confusion]** endless re-rolls turn the name into a toy | 3 alternatives, one tap (DG-3). **NEW:** name lists mix feminine, masculine and neutral names, so women get names that fit without being asked their gender | Good / Keen |
| S5 | First puzzle | Joins on a Thursday: fills two reference notes from one word bank | "Same words for both... wait, did I?" | Engaged, then caught | Puzzle board ("Readers write", sample 3-p06) | **[Confusion]** joining mid-week means a harder day and a mechanic she never met. **[Pushback]** an obvious "spot the sexist" trap bores her | One clever trap per puzzle; one ghost demonstration (DG-8); help behind "?" (DG-10); the step model's named main button. What a newcomer plays on a hard day is OQ-19 | Mid / Keen |
| S6 | Day result | Reads her score in a few seconds; taps Share | "Where did I slip?" | Stung, intrigued | Result; share sheet | **[Text]** a sum like "110 = 100 + 10" reads as a form (EVAL-13 006). **[Confusion]** a lower consistency with no clue where | One big number, two small figures, a soft line, a tease of Sunday's look back (DG-22, DG-23). The share card shows no lean (DG-24) | Low / Good |
| S7 | Day 2 | Opens the same WhatsApp link at 9 am | "Yesterday got me. Let's see today." | Keen | Cover (button reads Play) | **[Confusion]** if an old link opens the day it was shared, not today. **[Trust]** no reminders on iPhone unless the game is on the Home Screen [WebKit 2023 push post, via personas S31] | **NEW:** every link opens today's puzzle. Offer Add to Home Screen on the day 2 result, with a picture of the Share then Add steps (DG-37) | Good / Keen |
| S8 | First Sunday | Studies the look-again pair; writes one line | "Same record, different words. What did I do there?" | Caught, reflective | Week (Sunday); note sheet | **[Confusion]** she wants the direction and the game will not say. **[Text]** a long report or an open text box feels like homework (EVAL-13 028) | The look-again pair does the work the direction would have done (sample p05). Whether the pair marks her own pick is part of OQ-1. Share the week card | Mid / Keen |
| S9 | Missing a day | Works late Wednesday; opens Thursday | "Streak's dead." | Annoyed, then relieved | The streak in the cover's top bar; forgiven mark; toast | **[Confusion]** she started at 11:50 pm and finished after midnight, so the day may have counted as Thursday. **[Trust]** a 2 s toast is gone before she reads it | "Wednesday off. Streak kept." shows in place under the streak until she taps Play; a toast with the same words stays at least 4 s (DG-28, DG-52). The forgiven day has its own shape and a word as well as its skin colour. When a day ends is OQ-15 | Low / Good |
| S10 | Friends and board | Adds three colleagues from their cards | "Where am I against Priya?" | Competitive | Board tab: Friends; add-friend sheet | **[Confusion]** typing road names is fiddly. **[Trust]** a global rank among strangers means nothing; a farmed top (A1) looks fake | Board opens on Friends (DG-31). **NEW:** tapping a friend's share card offers "Add Raat Ki Rani?" after today's puzzle, never before it | Mid / Keen |
| S11 | Harder level | Saturday: picks a team while a "protective" voice speaks | "Keeping the girls home is just safety, surely?" | Unsure, challenged | Puzzle board (sample p04) | **[Pushback]** a lecture loses her; so does a puzzle that is too easy | A fair option that changes the situation for everyone ("A ride home for everyone", sample p04); mirrored cases on later days | Mid / Keen |
| S12 | Transfer day | Meets a new scenario type, unannounced | "Ooh, a new one." | Delighted | Cover and board of a new kind | **[Trust]** a "test day" label would make her play to the test (EVAL-13 036; the approved sample 3-p16 also announces it) | Looks like any day (DG-47); the novelty is the reward | Good / Keen |
| S13 | First month | Gets the 30-day milestone; posts the card | "My lean is half what it was in week one." | Proud | Milestone; month strip | **[Confusion]** a plateau; puzzles start to feel the same | Milestone card (DG-26); the month strip (DG-42); a festival special; the ladder keeps climbing (DG-45) | Good / Keen |
| S14 | Lapse and return | Back after two weeks of travel, from a colleague's card | "Did I lose everything?" | Guilty, then cross | Cover | **[Trust]** Safari evicts a site's stored data after 7 days of Safari use without interaction, unless it was added to the Home Screen [W1, W2]. Her road name, streak and friends are gone | Earn the Home Screen install early (DG-37); ask the browser for persistent storage [W2, W3]. A carry-over code or an optional account is OQ-18 | Quit / Good |
| S15 | Leaving | Drifts off when she feels she has cracked it | "I've got the trick." | Done | None, or the "?" sheet | **[Trust]** reminders keep coming; her road name stays on friends' boards | The ladder and transfer days keep it fresh; reminders off in one tap (DG-40); delete history [I1 section 4.4; D1] | Mid / Good |

---

## P2. Ravi, the shop-counter competitor (26, Indore, ₹11,000 Android, Hindi, colour blind)

This journey merges the earlier Ravi and Aman journeys (personas, must-fix 10).

| Arrives through | Plays | Phone | Wants | Biggest risk |
|---|---|---|---|---|
| A cousin's screenshot with a funny road name in the family group, or a friend's road name in his squad group | Shop lull after lunch; late at night, often past midnight | ₹11,000 Android, 4 GB, prepaid | To climb above his cousins and friends, in Hindi that sounds like people talk | Feeling accused about protecting his sister; a fake-looking board; states shown only by red or green |

| # | Stage | Does | Thinks | Feels | Touchpoint | Pain points and risks | Opportunity | Mood |
|---|---|---|---|---|---|---|---|---|
| S1 | Hearing | Sees "Highway Ka Sher, Day 12" in the cousins' group | "What's this truck-name thing?" | Amused | A screenshot (no link) or a forward | **[Confusion]** a screenshot carries no link, so he has to ask for it. **[Pushback]** "gender equality NGO" on the card means a lecture | **NEW:** Share sends the image and the link together where the phone allows files [M1]. The card carries a short address he could type | Mid / Good |
| S2 | First open | Taps the link in WhatsApp at the counter; Chrome opens | "Will it ask for my number?" | Wary of scams | Today's cover | **[Trust]** any number, OTP or permission ask and he leaves (scams are a top worry online [personas S3]). **[Phone and data]** a heavy painting on a 4 GB phone loads slowly | No sign-up and no permission ask on open (DG-1, DG-36). **NEW:** text and Play appear first, the painting loads after | Low / Good |
| S3 | Language | His phone is set to English, so the game opens in English (**ASSUMPTION**: many Hindi readers keep phones in English) | "English. Can I switch?" | Second-class if the Hindi reads as translated | The cover's language chip | **[Confusion]** default-from-phone picks the wrong language. **[Trust]** EVAL-13 001 said "The Hindi is a draft", telling him his language came second | The chip shows "EN \| हिं" in the top bar. Whether a shared link opens in the sharer's language is OQ-16. Hindi written and checked by native speakers (UXW-37) | Low / Keen |
| S4 | Road name | Reads his road name in Devanagari on the result | "Mine should beat Pintu's. Can I type my own?" | Proud, a little impatient | Result; road-name sheet | **[Confusion]** a Latin-letter name on a Hindi screen. **[Trust]** a typed name would invite slurs and real handles (A1) | Names generated only, 3 alternatives (DG-3). **NEW:** every road name has a Devanagari and a Latin form; each viewer sees their own script on the board | Good / Keen |
| S5 | First puzzle | Monday: locks "most skill", then assigns jobs; a customer interrupts | "Set a rule first? Fine." | In control | Puzzle board (sample p01) | **[Access]** a customer interrupts mid-puzzle; glare on the counter. **[Access]** colour blind: a pick shown only by yellow against red vanishes for him. **[Text]** long Hindi sentences | Resume exactly where he left off (**NEW** as a rule: the digest covers undo, not resume). Every pick carries a tick and a heavier edge, not only a colour (UA-4). Stats as pictures | Mid / Keen |
| S6 | Day result | Sees a lower consistency than he expected; shares anyway | "How is that fair? Still, beat that, Pintu." | Challenged, then competitive | Result; share sheet | **[Pushback]** any line that sounds like "you are biased", read in front of his cousins. **[Confusion]** no reason given | A soft line (DG-23); the share card never shows the lean or the answers (DG-24); the Board tab one tap away | Low / Good |
| S7 | Day 2 | Plays at 12:30 am after a ranked match | "Did that count for yesterday?" | Confused | Cover | **[Confusion]** a midnight release turns his night into the next day [personas tension 9]. **[Phone and data]** finding the link again in a busy group | When a day ends is OQ-15; "Next puzzle in 3 h" under the button (DG-18). Language remembered. On Android, the game's own install button can call the browser's install prompt [W4] | Low / Good |
| S8 | First Sunday | Sees his lean and a look-again pair from a family day | "So am I biased or not? What did I do?" | Defensive, then curious | Week (Sunday); note sheet | **[Pushback]** a pair about marriage feels like a judgement on his family. **[Text]** typing a Hindi note is slow; he types Hinglish in Latin letters | **NEW:** reflection by tapping one of three answers (never stored, see "Reflection taps" below), the note optional and in any script. The look-again pair works as a spot-the-difference. The lean's form is OQ-1 | Low / Good |
| S9 | Missing a day | Diwali rush: misses Friday and Saturday | "Gone, after all that." | Let down | Cover after the break | **[Trust]** one forgiven day a week hits shopkeepers hardest in festival weeks; his cousins see the reset. **[Access]** a forgiven day shown only by a red spine looks like a played day to him | The forgiven day has its own shape and a word (DG-28); the best streak kept in Week (DG-30). Festival slack is OQ-25 | Low / Mid |
| S10 | Friends and board | Adds four cousins and his squad; checks Everyone | "Three places above Pintu. Are the top guys bots?" | Thrilled, then suspicious | Board tab: Friends, then Everyone; add-friend sheet | **[Confusion]** searching "Highway Ka Sher" brings many look-alikes. **[Trust]** a farmed top (A1). If the owner keeps new players off Everyone for 14 days (OQ-23), he cannot see himself there | **NEW:** friend search works in both scripts; the friend link from a share card adds the right person (DG-34). **NEW:** if OQ-23 keeps the delay, his own band is visible to him from day 1, with a mark for when others will see him. Weekly ranking is OQ-22 | Mid / Keen |
| S11 | Harder level | Saturday kind bias: "Keep the girls home tonight. It's for their safety." | "My sister rides home late from coaching. I'd keep her safe too." | Defensive | Puzzle board (sample p04) | **[Pushback]** if the game seems to say protecting her is wrong. A2 waits to clip exactly this | A third option that makes it safe for everyone; the twin case (a brother riding home late) on another day [I1 Level 10]; some days the consistent choice favours the man [I1 Level 14]; no verdict | Quit / Good |
| S12 | Transfer day | Meets lost bags at a cloak room; no rule to lock | "No rule today? Is it scored differently?" | Unsure, watchful | A new puzzle board | **[Text]** a new mechanic with more Hindi to read. **[Trust]** if his practice moves less on these days, he will notice | Every transfer format plays from taps and pictures, with its one ghost demonstration (DG-8). Whether transfer days count the same on the board is OQ-24 | Mid / Good |
| S13 | First month | Hits 30 days, top band among friends, posts the milestone | "Highway Ka Sher, 30 days. Roasted Vicky again." | Proud | Milestone card; month strip; board | **[Trust]** cousins drop off; a plateau, and he juggles 2 to 3 games [personas S4] | The ladder and a new mechanic each week (DG-9, DG-45); a weekly ranking so newcomers can catch up (OQ-22) | Good / Keen |
| S14 | Lapse and return | Wedding season: three weeks away; friends have overtaken him | "Will it scold me? No way I catch up now." | Sheepish, deflated | Cover; board | **[Phone and data]** Chrome clears the least recently used site's data when the phone runs low on space [W2]. **[Pushback]** guilt in reminders; an all-time board makes return hopeless | No guilt copy and no pressure tricks (DG-39, DG-53); ask for persistent storage [W2]; restart quietly (DG-30); a weekly fresh start (OQ-22) | Low / Good |
| S15 | Leaving | A clip in the family group says the NGO hates men | "Is this anti-men?" | Suspicious, dismissive | A clip out of context | **[Trust]** one bad clip spreads faster than the game [personas A2] | Every screen makes sense alone; twins show the rule cuts both ways; no share card states a direction (DG-24); reminders off in one tap (DG-40) | Low / Mid |

---

## P3. Sunita, the small-town tailor on a hand-me-down phone (41, Sitapur district, Android 11, Hindi)

| Arrives through | Plays | Phone | Wants | Biggest risk |
|---|---|---|---|---|
| A self-help group facilitator shows it, or a cousin forwards it (**ASSUMPTION**, as in personas) | About 2 to 3 pm and late at night (**ASSUMPTION**) | Husband's old ₹8,000 Android 11, 3 GB, storage nearly full; her daughter borrows it for school (see the designed case) | A private daily ritual about her own life | Too much reading; anything private showing where family can see it |

| # | Stage | Does | Thinks | Feels | Touchpoint | Pain points and risks | Opportunity | Mood |
|---|---|---|---|---|---|---|---|---|
| S1 | Hearing | Watches the facilitator play one on her phone at a meeting | "Is this for women like me? Is it safe?" | Shy, curious | A person and a phone; then a forwarded link | **[Trust]** a facilitator's group may include under-18s, and the game is for adults only [personas, non-players]. **[Trust]** fear of scams | **NEW:** a facilitator kit: one sentence, a poster with a short address, no per-person report. The card shows a familiar scene (a wedding) | Mid / Good |
| S2 | First open | Taps the link; the phone stalls | "It's stuck." | Anxious | Today's cover | **[Phone and data]** a heavy painting on a 3 GB phone with full storage; Android 11 [personas S8] | **NEW:** a small first page: text and Play first, the painting after, and an image budget per day. Works on Android 11 browsers | Quit / Good |
| S3 | Language | The phone is in English; she cannot read the cover | "I can't read this." | Shut out | The cover's language chip | **[Access]** a small "हिं" chip is easy to miss with near-vision loss. **[Confusion]** the default from the phone is wrong for her | Whether the link opens in the facilitator's language is OQ-16. The chip shows "हिं" in Devanagari at a readable size, with a 48 px target | Quit / Good |
| S4 | Road name | Reads her road name on the first result | "Nobody will know it's me?" | Amused, and safe | Result line | **[Privacy]** fear that her real name shows; a male truck name may feel odd | Feminine and neutral names in the lists (**NEW**, as for P1); no real name anywhere (DG-35) | Good / Keen |
| S5 | First puzzle | Joins on a Friday: spend checks on three people | "What do I press?" | Lost | Puzzle board (sample p03) | **[Text]** instruction sentences (EVAL-13 020). **[Access]** small portraits, letter squares (EVAL-13 048), unfamiliar gestures. **[Confusion]** her first day is the week's hardest | One ghost demonstration (DG-8); big portraits, stats as pictures; one question read once (DG-6); undo (DG-16); the main button names what is missing ("Spend 3 checks"). What a newcomer plays on a hard day is OQ-19 | Quit / Good |
| S6 | Day result | Looks at a number | "Is this good or bad?" | Worried about being judged | Result | **[Pushback]** any verdict. **[Privacy]** her mother-in-law glances at the screen | A warm line of 10 words or fewer (DG-23); the number backed by a simple picture of filled marks; nothing private on screen | Low / Good |
| S7 | Day 2 | Looks for the game in her quiet hour | "Where was that game?" | Unsure | WhatsApp search; Home Screen offer | **[Confusion]** the link is buried in a family group. **[Privacy]** a reminder on the lock screen tells the family what she plays | Add to Home Screen with a neutral icon and name (**NEW**: test what the icon says on a shared phone). Reminders name the day's object, never the topic or score (DG-39), and can be refused | Mid / Good |
| S8 | First Sunday | Reads the week; pauses at "Write a note" | "If I write, will he read it?" | Exposed | Week (Sunday); note sheet | **[Privacy]** a note anyone can open on a shared phone; her daughter borrows the phone (see the designed case below). **[Text]** typing Devanagari is slow | Tap-to-answer reflection (**NEW**, as for P2; never stored). **NEW:** notes are never shown on an open screen; reading one takes a tap (UA-38). Where notes live is OQ-26 | Low / Good |
| S9 | Missing a day | Guests arrive; misses Tuesday and Wednesday | "I failed it." | Small guilt | Cover after the break | **[Pushback]** a red mark that looks like failure. **[Access]** a short toast is gone before she finds her glasses | The forgiven mark looks friendly and has its own shape and word; the line sits in place until she taps Play; the count restarts without comment (DG-28, DG-30) | Low / Mid |
| S10 | Friends and board | Adds only the facilitator, or nobody | "I don't want strangers to see me." | Wary | Board tab (rarely opened) | **[Privacy]** being on the Everyone board at all | A "Hide me from Everyone" switch is OQ-23; nothing leaves the phone before the notice sheet (UA-47); the board is never in the daily path | Mid / Good |
| S11 | Harder level | Dowry day: sorts gifts from dowry at a wedding (sample 3-p05) | "This is my own family's story." | Seen, maybe pained | Puzzle board | **[Pushback]** anything that mocks family or religion. **[Text]** more reading as levels rise | Owner-reviewed, respectful scenes from her life, handled with care (UA-46): the cover names the setting plainly, and she can leave mid-puzzle and lose nothing | Low / Keen |
| S12 | Transfer day | Meets a format she has not seen | "Now I have to type?" | Uneasy | A new puzzle board | **[Text]** the research lists a written WhatsApp reference and a voice-note choice as transfer formats [I1, "Beyond the ladder"]: typing is slow and sound is heard by the household | **NEW:** every transfer format plays with taps and pictures, with no typing and no sound needed | Low / Good |
| S13 | First month | Keeps her afternoons; the month strip fills | "My afternoons." | Quiet pride | Month strip; milestone | **[Privacy]** a milestone with sound in a quiet house; repeated prompts to share | Sound is on by default (owner, 21 Oct 2026, over DG-26), so the milestone's one soft note can be heard in a quiet house. What protects her now: Music and Sounds switch off in the "?" sheet, the note is soft and the same every time, and a private milestone has no push to share | Good / Keen |
| S14 | Lapse and return | Her husband takes the phone to the city for a month; she uses his new one | "It's all gone." | Resigned | Cover on a different phone | **[Trust]** her road name and streak live on the old phone | A carry-over code with no phone number or email, or an account, is OQ-18. A quiet fresh start meanwhile | Low / Mid |
| S15 | Leaving | Her husband asks what the game is | "Better remove it." | Uneasy | "?" sheet | **[Privacy]** the icon, old notifications and the note stay behind | **NEW:** one tap deletes everything on this phone and on the server; consent must be as easy to withdraw as it was to give [D1 s.6(4), s.12(3)] | Low / Good |

---

## P4. Meena, the village banking agent on a 2 GB phone (30, Gumla district, ₹6,500 Android, Hindi)

New after the critique (personas, must-fix 10): the rural player the cast lacked.

| Arrives through | Plays | Phone | Wants | Biggest risk |
|---|---|---|---|---|
| A cousin's forward of a card asking "Who keeps the cash box?" (**ASSUMPTION**, as in personas) | Dusk after her last customer; Sunday mornings | ₹6,500 Android, 2 GB, storage full; signal weak at home | A quiet daily puzzle about a life like hers, that works on her phone | A page that will not load, or loses her place when the signal drops; village life drawn as backward |

| # | Stage | Does | Thinks | Feels | Touchpoint | Pain points and risks | Opportunity | Mood |
|---|---|---|---|---|---|---|---|---|
| S1 | Hearing | Sees the forward in the family group at the market, where the signal is good | "This one is about my job." | Curious | Share card and link preview | **[Phone and data]** at home the preview image may not load. **[Pushback]** a card that looks like a government or NGO awareness campaign | The card's words read without its image; a light preview image (**NEW**) | Mid / Good |
| S2 | First open | Opens it at home in the evening, on one bar of signal | "Still loading..." | Anxious | Today's cover | **[Phone and data]** 2 GB of memory, a full phone, a slow network (personas P4) | A light first page: text and Play first, the painting after, within the 600 KB first-load budget (UA-39); tested once on a 2 GB phone | Quit / Good |
| S3 | Language | Her phone is in Hindi (**ASSUMPTION**), so the game opens in Hindi | "Good, Hindi." | Relieved | The cover's language chip | **[Trust]** a "draft" notice (EVAL-13 001) would tell her Hindi comes second | Default from the phone (DG-2); a language is offered only when it is ready, with no draft label (UXW-38) | Mid / Good |
| S4 | Road name | Reads "Kachchi Sadak Ki Rani" (queen of the dirt road) on her first result | "Kachchi sadak. That's our road." | Pleased | Result line | None expected | **NEW:** name lists include village roads and rural places, not only highways and cities, as well as feminine, masculine and neutral names | Good / Keen |
| S5 | First puzzle | Friday: spends three checks on three people for a cash box; a customer arrives and she switches to her banking app | "Did it go?" | Anxious | Puzzle board (sample p03) | **[Phone and data]** the browser throws the game out of memory while she is in the other app (UA-P35), and the signal drops | Save after every tap and when the app is hidden (UA-34); today's puzzle, once opened, plays to the end offline (UA-40); the step model's named main button | Low / Keen |
| S6 | Day result | Finishes; the phone is offline | "Did it save?" | Unsure | Result | **[Confusion]** an endless spinner, or an "offline" error that sounds like her fault | The result shows at once from the phone, with a small mark that it will send when online; no spinner without a time limit (UA-40); errors never blame (UXW-27) | Low / Good |
| S7 | Day 2 | Looks for the game the next evening | "Where was that link?" | Unsure | WhatsApp search; Home Screen offer | **[Confusion]** the link is buried in a busy family group. **[Phone and data]** whether her browser offers installing is UNVERIFIED | Every link opens today's puzzle (**NEW**); the game's own install button on Android where the browser allows it [W4] | Mid / Good |
| S8 | First Sunday | Opens the week on Sunday morning | "Same years of accounts, different words." | Reflective | Week (Sunday) | **[Text]** a long Sunday on a small screen. **[Phone and data]** a heavy Sunday page | Sunday sized for 360 x 640 in whichever shape OQ-2 picks; tap answers before any typing; the look-again pair on a light card (PH-35) | Mid / Good |
| S9 | Missing a day | Pension day: a queue of customers, and she misses Thursday | "Did I lose it?" | Mild worry | Cover after the break | **[Trust]** a forgiveness message that vanishes before a slow phone has drawn the screen | The line sits in place under the streak until she taps Play, and the forgiven day keeps its shape and word (DG-28) | Mid / Good |
| S10 | Friends and board | Adds only her cousin | "My cousin is enough." | Indifferent | Board tab | **[Phone and data]** the board needs the network; it may spin or show old rows | The board says when it last updated (UA-40); Friends first (DG-31). The notice before joining the board (UA-47) is short and in Hindi | Mid / Good |
| S11 | Harder level | A land-records day: whose name goes on the family plot; a relative says "she will go to her in-laws anyway" | "That is what everyone here says." | Uncomfortable, then thoughtful | Puzzle board | **[Pushback]** if the village is drawn as backward or as a charity case. **[Trust]** a scene that makes a joke of her community's customs | Owner-reviewed scenes, with the same case set in a city on another day, so the village is not the only place bias lives; respectful art; review by people from the communities shown (personas, "Who these personas leave out") | Low / Good |
| S12 | Transfer day | Meets a new format: a ration queue | "A new one." | Interested | A new puzzle board | **[Phone and data]** a new mechanic's code and art to download on a weak signal | The next 6 days' art, fonts and mechanic code are saved in advance; the puzzle itself is not (UA-40, OQ-27) | Mid / Good |
| S13 | First month | The month strip fills; her sister-in-law wants to play too | "I'm good at this." | Quiet pride | Month strip; milestone | **[Trust]** a second adult wants to play on the same phone | Two adults on one phone is part of OQ-17 | Good / Keen |
| S14 | Lapse and return | Her phone breaks; she buys another cheap one | "Everything's gone." | Resigned | Cover on a new phone | **[Trust]** her road name and streak lived on the old phone | How players keep their data across phones is OQ-18; a quiet fresh start meanwhile | Low / Mid |
| S15 | Leaving | Her data pack runs out at month end; a week passes and she does not come back | "It needs data I don't have." | Drifting | None | **[Phone and data]** the data cost of a day's puzzle | A day's puzzle costs very little data (UA-39, UA-42); on return, today's cover only, no "you missed" message (DG-30, DG-53) | Low / Mid |

---

## P5. Mr Natarajan, the retired rule-keeper (61, Coimbatore, large text, English until Tamil)

| Arrives through | Plays | Phone | Wants | Biggest risk |
|---|---|---|---|---|
| His son's forward in the family group | 6:30 am with coffee, after lunch | ₹16,000 Samsung, large font and display zoom | To lock a rule and see it hold | Broken layouts at large text; feeling called biased |

| # | Stage | Does | Thinks | Feels | Touchpoint | Pain points and risks | Opportunity | Mood |
|---|---|---|---|---|---|---|---|---|
| S1 | Hearing | Sees his son's forward at 6:30 am | "Is it like Wordle?" | Mildly interested | Share card and link | **[Pushback]** preview text that sounds like a sermon. **[Access]** small text on the card | A card that reads like a newspaper puzzle ("No. 212") with one large line | Mid / Good |
| S2 | First open | Opens with large text and zoom on | "The words are cut off." | Irritated | Today's cover | **[Access]** fixed poster frames break at 200% text; content must reflow without loss (WCAG 1.4.4, 1.4.10, via personas S30) | Layouts that reflow; Play always reachable; no sideways scrolling | Quit / Good |
| S3 | Language | Stays in English; looks for Tamil | "Tamil, when?" | Patient | The cover's language chip | **[Confusion]** Hindi leaking onto an English screen (an old owner complaint [I4]) | Only the chosen language anywhere (DG-2). No "coming soon" notices in the flow (DG-5) | Mid / Good |
| S4 | Road name | Gets a truck name | "A truck driver, at my age?" | Amused, or a little put off | Result; road-name sheet | **[Access]** a small "Change" link | Gentler names among the 3 alternatives ("Ghat Ka Jugnu", the firefly); a large target for Change (DG-48) | Mid / Good |
| S5 | First puzzle | Monday: locks "most experience" first | "Rule locked. Now apply it." | At home | Puzzle board (sample p01) | **[Access]** swipe-only controls, small targets, any timer | Locking a rule suits him. Every gesture has a tap equivalent; targets at least 48 px (DG-48) | Good / Keen |
| S6 | Day result | Sees his rule kept for all five | "As expected." | Vindicated | Result; share sheet | **[Pushback]** a line hinting that he could be biased | Confirm the rule held; share to the family group | Good / Keen |
| S7 | Day 2 | Looks for the game at 6:30 am | "Where did my son's message go?" | Mildly lost | Home Screen offer | **[Confusion]** the Add to Home Screen steps are unfamiliar | One picture showing the steps on his phone; a reminder at a time he picks (DG-38) | Mid / Good |
| S8 | First Sunday | Sees the size of his lean, but not its side | "Tell me which way!" | Frustrated, possibly accused | Week (Sunday) | **[Pushback]** size without direction [personas tension 5]; any use of the word "bias" | The look-again pair lets him find the difference himself and show Lakshmi; no "bias" on screen; the lean's form is OQ-1, and how open the game is about hiding the side is OQ-14 | Quit / Good |
| S9 | Missing a day | A hospital visit; misses Thursday | "Forty days. Gone?" | Worried | The streak in the cover's top bar; forgiven mark | **[Confusion]** he assumes the streak is lost. **[Access]** at large text a short toast may sit off screen or vanish before he reads it | "Thursday off. Streak kept." in place under the streak until he taps Play, and announced (DG-28) | Low / Good |
| S10 | Friends and board | His son adds him | "My son is ahead of me." | Pleasant | Board tab: Friends | **[Access]** typing road names at large text; small board rows | The friend link from his son's card (**NEW**, as for P1); rows that reflow at 200% | Mid / Good |
| S11 | Harder level | Marriage day: "What if she leaves after the wedding?" | "That's only realistic." | Defensive | Puzzle board (sample p03) | **[Pushback]** feeling accused; his locked rule did not cover this | His own locked rule is the answer key [I1]; the twin case, judged by that rule, shows him the gap | Quit / Good |
| S12 | Transfer day | Meets a format with no rule to lock | "What's the rule here?" | Thrown | A new puzzle board | **[Confusion]** a new gesture and no lock step | One ghost demonstration (DG-8); taps only; the same cover pattern (DG-47) | Low / Good |
| S13 | First month | Day 30; forwards the milestone | "Thirty days. The rule held." | Satisfied | Milestone card; month strip | **[Confusion]** nothing new for a rule-keeper | Milestone card (DG-26). A personal rulebook after Level 8 [I1, seedling, owner decides] | Good / Keen |
| S14 | Lapse and return | Ten days at his son's in Bengaluru | "Start again from one?" | Disappointed | Cover; Week | **[Pushback]** a reset that feels like a penalty | The best streak kept and shown in Week (DG-30) | Low / Good |
| S15 | Leaving | Tamil does not come, or he feels judged | "This is not for me." | Quietly offended | "?" sheet | **[Trust]** no way to hear when Tamil arrives without giving an email or phone number | Reminders off in one tap (DG-40); news of Tamil can travel through his son's forward | Low / Mid |

---

## P6. Farida, the nurse on the evening local (32, Kalyan and Thane, Samsung A-series, Hindi)

| Arrives through | Plays | Phone | Wants | Biggest risk |
|---|---|---|---|---|
| A nursing colleague's forward in the ward group | Evening train, about 7:40 pm (**ASSUMPTION**); odd hours after night shifts | ₹18,000 Samsung, prepaid | Real issues taken seriously, in four minutes, one-handed | Losing her place; scoring that feels like false balance |

| # | Stage | Does | Thinks | Feels | Touchpoint | Pain points and risks | Opportunity | Mood |
|---|---|---|---|---|---|---|---|---|
| S1 | Hearing | Sees a colleague's forward in the ward group | "A game about this? Let's see if it's real." | Hopeful, guarded | Share card | **[Pushback]** a cute or "both sides" framing; a hospital HR forward feels like a chore | A card that names a real setting (a ward, a ticket queue) | Mid / Good |
| S2 | First open | Opens it standing, one hand on the pole | "Load, please." | Impatient | Today's cover | **[Phone and data]** signal drops between stations (**ASSUMPTION**). **[Access]** two-handed gestures | **NEW:** once loaded, today's puzzle plays without a connection and sends its result later. Play within thumb reach (DG-49) | Low / Good |
| S3 | Language | Switches to Hindi with her thumb | "Hindi's easier on the train." | Fine | The cover's language chip | **[Access]** the chip at the top is a stretch for one thumb | Acceptable as a rare action (DG-49); her choice is remembered. Urdu script is not offered, which she may notice | Mid / Good |
| S4 | Road name | Gets "Raat Ki Rani Express" | "Night shift queen. Fair." | Pleased | Result line | None expected | Names that fit women (**NEW**, as for P1) | Good / Keen |
| S5 | First puzzle | The train jolts at Diva; the app goes to the background | "Did I lose it?" | Anxious | Puzzle board | **[Access]** losing her place. **[Confusion]** a card tap, then a separate confirm bar (EVAL-13 012) | Resume exactly (**NEW**, as for P2); the tap picks and one named button commits, never a card and then a confirm bar (DG-13; the step model). Whether a one-pick step answers on the tap is OQ-9 | Low / Keen |
| S6 | Day result | Sees a consistency figure below 100 | "I favoured the woman. So what?" | Indignant | Result | **[Pushback]** from the other side: penalising favour for women feels like false balance [personas P6] | "The same rule for everyone" shown through mirrored cases in play, never as a sentence that favouring women is bad | Low / Good |
| S7 | Day 2 | Plays at 9 am after a night shift | "Is it still yesterday's?" | Tired | Cover | **[Confusion]** rotating shifts break a fixed day and a fixed reminder time | When a day ends is OQ-15; reminders at a time she sets, or none (DG-38) | Mid / Good |
| S8 | First Sunday | Opens the week on a Sunday shift break | "The nurse with a child. That's my ward." | Validated | Week (Sunday); note sheet | **[Privacy]** her mother-in-law shares the home. **[Confusion]** if Sunday is a work day she may miss the week | The week stays open until the next puzzle (**ASSUMPTION** to test). Notes need a tap to open (**NEW**, as for P3) | Mid / Keen |
| S9 | Missing a day | A double shift; misses two days | "Of course." | Weary | Cover after the break | **[Trust]** shift workers miss more than one day a week | Best streak kept (DG-30); shift slack is OQ-25 | Low / Mid |
| S10 | Friends and board | Adds two ward colleagues | "Nice, Rekha plays too." | Warm | Board tab: Friends | **[Confusion]** little interest in strangers | Friends first (DG-31) | Mid / Good |
| S11 | Harder level | Motherhood day: a nurse passed over for shift lead "because she has a child" | "That's exactly my ward." | Seen | Puzzle board | **[Pushback]** if it is played as "both sides". **[Trust]** a painful topic made light | Precise, serious scenarios reviewed by the owner and handled with care (UA-46); the twin is a father asking for flexible hours [I1 Level 8] | Good / Keen |
| S12 | Transfer day | Meets a new format on the train | "Do I need sound?" | Unsure | A new puzzle board | **[Access]** a voice-note format [I1] needs sound she cannot use on the train | No transfer format needs sound (**NEW**, as for P3) | Mid / Good |
| S13 | First month | Levels climb; religion is due in later levels [brief] | "How will they show Muslim families?" | Watchful | Cover; cast | **[Trust]** a stereotyped picture of her community and she leaves | The recurring cast already includes Muslim characters drawn with care (Salim, Farida in the samples); owner review [brief] | Low / Good |
| S14 | Lapse and return | A month of night rotations, then back | "Still here?" | Neutral | Cover | **[Confusion]** a pile of missed weeks | Today's cover only; no "you missed 28 days" | Mid / Good |
| S15 | Leaving | False balance builds up, or life gets busier | "It's not built for people like me." | Tired of it | "?" sheet | **[Trust]** friends being told she left | No notices about friends' activity (DG-38); delete in one tap | Low / Mid |

---

## Cross-journey

### Mood across the journeys (first guess: if the risk lands)

Read across for where several personas are at risk at once. The second guess in each persona table is the target. The words are ordinal guesses for playtests (see the column key), so the last column counts personas at Quit or Low; it is a count of guesses, not a sum of scores.

| Stage | P1 Shruti | P2 Ravi | P3 Sunita | P4 Meena | P5 Natarajan | P6 Farida | At Quit or Low |
|---|---|---|---|---|---|---|---|
| S1 Hearing | Low | Mid | Mid | Mid | Mid | Mid | 1 of 6 |
| S2 First open | Low | Low | Quit | Quit | Quit | Low | **6 of 6** (3 at Quit) |
| S3 Language | Mid | Low | Quit | Mid | Mid | Mid | 2 of 6 |
| S4 Road name | Good | Good | Good | Good | Mid | Good | 0 of 6 |
| S5 First puzzle | Mid | Mid | Quit | Low | Good | Low | 3 of 6 |
| S6 Day result | Low | Low | Low | Low | Good | Low | **5 of 6** |
| S7 Day 2 | Good | Low | Mid | Mid | Mid | Mid | 1 of 6 |
| S8 First Sunday | Mid | Low | Low | Mid | Quit | Mid | 3 of 6 |
| S9 Missing a day | Low | Low | Low | Mid | Low | Low | **5 of 6** |
| S10 Friends and board | Mid | Mid | Mid | Mid | Mid | Mid | 0 of 6 |
| S11 Harder level | Mid | Quit | Low | Low | Quit | Good | 4 of 6 (2 at Quit) |
| S12 Transfer day | Good | Mid | Low | Mid | Low | Mid | 2 of 6 |
| S13 First month | Good | Good | Good | Good | Good | Low | 1 of 6 |
| S14 Lapse and return | Quit | Low | Low | Low | Low | Mid | **5 of 6** |
| S15 Leaving | Mid | Low | Low | Low | Low | Low | **5 of 6** |

### The moments that matter most (top 8)

The order is a judgement, informed by the counts above and by how many later stages each moment unlocks. It is not computed.

| Rank | Moment | Why it matters | Who is most at risk | What wins it |
|---|---|---|---|---|
| 1 | **The first open from a forwarded link** (S1 to S3) | Every persona meets it, and EVAL-13 lost all six here (001 to 003). All six are at Quit or Low if it goes wrong | P3 (old phone, wrong language), P4 (2 GB phone, one bar of signal), P5 (large text), P2 (scam fear) | Today's cover in one tap, light enough for a 2 GB phone, readable at 200% text, nothing asked |
| 2 | **The first puzzle, on whatever day they join** (S5) | Learning must come from the board alone, and a newcomer may join on the week's hardest day | P3, P4, P6 | One ghost demonstration, pictures before words, resume exactly, undo until the lock, a decision on newcomers (OQ-19) |
| 3 | **The first result, the road-name reveal and the share** (S4, S6) | The share card is how the game spreads, and the result is where a player decides whether they were judged | P1, P2 share; P3, P5 feel judged; P4 offline | One screen, a soft line, a name that fits, a card that shows no lean, image and link sent together, a result that shows offline |
| 4 | **The second day** (S7) | No reminder exists yet, so return depends on WhatsApp, habit and the Home Screen. On iPhone this is also what keeps the data safe (S14) | P1 (iPhone), P3 and P4 (cannot find the link), P2 (after midnight) | Every link opens today; the Home Screen offer with a picture; the day-end time settled (OQ-15) |
| 5 | **The first Sunday** (S8) | The reflection has to do the work the hidden direction would have done, without exposing anyone | P1, P5 (want the direction); P3, P6 (privacy) | Sunday's shape (OQ-2), the look-again pair, tap-to-answer reflection, notes behind a tap |
| 6 | **The first level that touches home** (S11) | Kind bias, marriage, land and dowry are where pushback and validation split, and where A2 looks for a clip | P2, P5 (pushback); P3, P4, P6 (validation that can hurt) | A fair third option, mirrored cases on other days, the player's own rule as the answer key, no verdict text, trauma-informed handling (UA-46) |
| 7 | **The first missed day and the first long lapse** (S9, S14) | Streak loss stops people starting again; on iPhone, on full phones and on a new phone the whole identity can vanish | P1 (Safari storage), P3 and P4 (phone passed on or broken), P2 and P6 (festival weeks, shifts) | Forgiveness shown in place with a shape and a word, best streak kept, persistent storage, a decision on keeping data (OQ-18) |
| 8 | **The first look at the board** (S10) | The board must look alive and fair, or the competitive players leave and the others never care | P2 | Friends first, your own band from day 1, a weekly ranking (OQ-22), no farmed top, adding a friend from their card |

### Where the journeys split

| Point of split | Branches and who takes them | What the design must hold for both |
|---|---|---|
| How they hear | A friend's or cousin's card (P1, P2, P4, P5, P6); a person showing it (P3); an institution such as HR or a college cell (P1, P6 on a bad day) | The same cover for all; kits for facilitators and institutions that keep play voluntary and never report on a person |
| Which day they join | Monday (easy) against Thursday to Saturday (hard) | A newcomer who joins on a hard day still learns from the board (OQ-19) |
| Language | English (P1, P5); Hindi in Devanagari (P2, P3, P4, P6); Hinglish in Latin letters wished for (P2, P6); waiting for Tamil (P5) | Only the chosen language shows; the default comes from the phone (and the link, if OQ-16 says yes); switching keeps progress |
| Phone | iPhone (P1): Home Screen needed for push and safe storage. Old Android (P3) and 2 GB phone (P4): speed, memory and storage eviction. Large text (P5): reflow | One layout grammar that reflows; a light first page; persistent storage asked for; tested once on a 2 GB phone |
| Network | Steady (P1, P5) against patchy (P4 at home, P6 between stations) | Today's puzzle, once opened, plays offline; the result sends later; future puzzles are not saved (UA-40, OQ-27) |
| Time of play | Morning (P5, P1); afternoon (P2, P3); dusk (P4); after midnight (P2, P1); shift-dependent (P6) | One release time, a day end late enough for night players (OQ-15), reminders at a time the player sets |
| Competition | Board-driven (P2, P1) against a private ritual (P3, P4, P6, partly P5) | The board is one tap away on its tab and never in the daily path; who appears on Everyone is OQ-23 |
| Sharing | Posts (P1, P2, P5) against never (P3, P4, often P6) | Share is always a choice, one tap, and the card is safe in a family group |
| Scoring both ways | Welcomed as fair to men (P2) against felt as false balance (P6) | Symmetry shown through twins and mirrored cases in play, never stated as a rule |
| Size without direction | Frustrating (P1, P5) against a relief (P3) | The look-again pair carries the reflection; the lean's form is OQ-1 |
| One phone, more than one person | Natarajan and Lakshmi (two adults); Meena and her sister-in-law (two adults); a child picking up Sunita's phone | Two adults on one phone, and the age line, are OQ-17; the child case is designed below, not presented as normal play |
| How they reflect | Write a line (P1, P6) against tap an answer (P2, P3, P4) | Tap answers first, the note optional; tap answers never stored |

### Where the anti-personas strike

| Anti-persona | Stages | Design answer already in the rules or research |
|---|---|---|
| A1, the board farmer | S4 (wants a typed name), S10 (farms the top), S12 (probes scoring) | Generated names (DG-3); practice capped at one scored puzzle a day (DG-32); per-player variations and pattern checks [I1 section 4.5]; future puzzles not saved on the phone (UA-40). Keeping new players off Everyone for 14 days is proposed by the research but changes the owner's "all players" board, so it is OQ-23 |
| A2, the hostile screenshotter | S1 (a clip spreads first), S6 (a result screenshot), S11 (protective and marriage days) | Every screen makes sense alone; no direction on any card (DG-24); twins show the rule cuts both ways; owner review of every scenario [personas A2] |

### Designed case: a child picks up a shared phone

Critique must-fix 11 asked for one designed case in place of two loose questions. The game is for adults only until a lawyer advises on the children's data rules [brief].

- **The situation.** Sunita's daughter, 17, borrows the phone for school videos. The game is on its Home Screen. The game cannot tell who is holding the phone. The personas no longer treat her play as normal; this case designs for the risk.
- **What the law says, as read.** The Digital Personal Data Protection Rules 2025 require verifiable consent of a parent before processing any child's personal data (Rule 10), from about May 2027 (Rule 1(4)) [D2]. Which parts of the Act apply today was not checked (UNVERIFIED).
- **What the design does now, whatever the owner decides:**
  - It asks no one for personal details, so nothing identifies a child.
  - Nothing personal leaves the phone before the notice sheet (UA-47), so a child who only taps through a puzzle sends nothing to the server.
  - Nothing private shows without a tap: notes stay folded (UA-38), and the lean never shows on the cover or in a reminder.
  - The Home Screen name and icon, and every reminder, say nothing about the topic or the score (DG-39).
  - Kits and shares are never aimed at under-18 groups [personas, non-players].
  - Days played on the phone count for the phone's one road name. The game does not try to tell players apart by behaviour, because that would be new data.
- **What the owner decides (OQ-17):** whether the notice sheet carries a one-tap "I am 18 or older" line, and what happens after a "no".

### Reflection taps are never stored

The Sunday reflection by tapping one of three answers (P2, P3 and P4 at S8) would be new data. The Profile C exception covers private notes only [brief]. So the taps are a prompt and nothing more: they are not stored, not sent and not analysed, and they leave no record once the sheet closes. Keeping them would need the owner's decision first.

### Five moments the 15 stages missed

Added after the critique (should-fix 7). Each is one row for all personas rather than a stage in every table.

| Moment | Who it hits hardest | What happens | Pain points and risks | Opportunity | Mood |
|---|---|---|---|---|---|
| M1. The first weekly skin switch (Lugdi to Station) | P5, P3 (learnt the controls once); P1 (likes novelty) | Monday opens on a railway board instead of a pulp cover | **[Confusion]** controls that moved or changed shape; "is this the same game?" | The controls keep their size and place, only their dress changes (UA-30, HIG-56); the day's question in the same position (PH-33); the road name and streak carried over | Low / Good |
| M2. A reminder lands on a lock screen and is tapped | P3, P6 (shared home); P1 | "Tonight: one seat left at the Tatkal counter" shows on the lock screen; she taps it | **[Privacy]** a reminder that names the topic, the score or the lean. **[Confusion]** a tap that opens a hub or yesterday | Reminder text names only the day's object (DG-39); a tap opens today's cover with Play ready (DG-1); never more than one a day (DG-38) | Low / Good |
| M3. Offline or slow, as its own stage | P4, P6 | The network drops mid-puzzle or before the cover has loaded | **[Phone and data]** a blank screen, an endless spinner, an error that blames the player | Today's puzzle plays on once opened; the result shows at once and sends later; a cover that has not loaded says so in one line, in the chosen language, and offers "Try again" (UA-40, UXW-27) | Quit / Good |
| M4. A new phone | P4 (phone broke), P3 (phone handed on), P1 (upgrade) | The game opens on a new phone as a stranger | **[Trust]** the road name, streak and friends lived on the old phone | How data follows a player is OQ-18; until then a quiet fresh start, with no guilt and no "you lost everything" message | Low / Mid |
| M5. A Hindi player meets a third script on a Station board | P2, P3, P4 | A Hindi screen shows a board with a Bengali or Tamil line | **[Confusion]** "is this my language?"; Hinglish and third-script leaks were an old owner complaint [I4] | Whether the city's own script stays as part of the board's picture is OQ-6; if it stays, it carries its own language mark so TalkBack reads it right (UA-20) and nothing the player needs is written only in it | Mid / Good |

---

## Screens and features the journeys imply (raw list for the feature stage)

Each item names the personas (P1 to P6) and stages (S1 to S15, plus the added moments M1 to M5) that need it, and its basis: a digest rule (DG, HIG, M3, PH, UXW or UA), the research [I1], an owner question (OQ), or **NEW** from these journeys. Nothing here is decided; the feature stage sorts, merges and cuts.

### Screens and sheets

| Screen or sheet | Personas | Stages | Basis |
|---|---|---|---|
| Today's cover in three states (Play, Continue, See today) with "Next puzzle in"; top bar holds the streak count, the language chip and "?" | All | S2, S7, S14 | DG-17, DG-18 |
| Puzzle board, one per mechanic (assign under a locked rule, pick, checks, team under a voice, rank, words, quick sort, predict the crowd), all following the one step model | All | S5, S11 | brief; samples; UA 2.0a |
| Transfer-day boards in new formats that need no typing and no sound | P3, P6, P5 | S12 | DG-47; **NEW** constraint |
| "?" sheet: at most 3 picture steps for today's mechanic, then reminders, road name, privacy and delete (the one settings place) | All | S5, S15 | DG-10, DG-40; UA 2.0c |
| Language chip in the cover's top bar ("EN \| हिं"), the switch's only home | P2, P3, P6 | S3 | DG-2; UA 2.0c |
| Day result (one screen) | All | S6 | DG-22 |
| Road-name sheet (3 alternatives) | All | S4 | DG-3 |
| Share card in each skin (Lugdi mini-poster, Station ticket), image plus link | P1, P2, P5 | S1, S6, S8, S13 | DG-24, DG-25; **NEW** image plus link |
| Friend-link landing: "Add this road name?" shown after today's puzzle | P1, P2, P5 | S10 | **NEW** |
| Add to Home Screen offer: iPhone picture steps; Android own button calling the install prompt | P1, P3, P4, P5, P2 | S7 | DG-37; [W4] |
| Reminder soft ask and a reminder time picker | P1, P2, P5, P6 | S7 | DG-36, DG-38 |
| Week (Sunday): marks, practice, the lean, look-again pair, Share, Add a friend; one screen or a sequence | All | S8 | DG-41; OQ-1, OQ-2 |
| Reflection: three tap answers (never stored), then an optional note sheet | P2, P3, P4 | S8 | [I1 3.5a]; **NEW** as the default |
| Month strip (28 marks, festival mark) | All | S13 | DG-42 |
| Milestone moment (days 3, 7, 14, 30 and on): the stamp and one soft note, with a still stamp and no note under reduced motion | All | S13 | DG-26, owner 21 Oct 2026 |
| Board tab: Friends, then Everyone (your band, 2 above, 2 below, top 3) | P1, P2 | S10 | DG-31 |
| Add-friend sheet with search in both scripts; friend row menu with Remove and Undo | P1, P2, P4, P5 | S10 | DG-34; **NEW** both scripts |
| Notice sheet before anything leaves the phone: itemised, plain, in the chosen language, with an outcome verb and "Not now" | All | S10 | UA-47; OQ-17, OQ-23 |
| Toasts (forgiven day, copied, near miss), each with its words also shown in place, at least 4 s, announced | All | S5, S9 | DG-12, DG-28; UA 2.0b |
| "i" chip sheet for any prototype or draft notice | All | S2 | DG-5 |
| Privacy part of the "?" sheet: what is kept, where and why, and a one-tap delete | P3, P4, P6, P1 | S15 | [I1 4.4]; [D1]; HIG-55 |
| Carry-over code sheet (seedling) | P1, P3, P4 | S14, M4 | OQ-18 |
| Offline and slow states: today's puzzle kept once opened, result sent later; a cover that has not loaded says so in one line with "Try again"; "storage full" handled | P3, P4, P6, P2 | S2, S5, M3 | UA-40; **NEW** |
| Festival special cover | All | S13 | DG-42; range page |

### Features and behaviours

**Entry and links**
- Every link opens today's puzzle, never the day it was shared. (All; S7) **NEW**
- Whether a link carries the sharer's language. (P2, P3; S3) OQ-16
- Link preview title, description and image that read as a game, not a campaign, and whose words work without the image. (P1, P4; S1) **NEW**, preview behaviour UNVERIFIED
- No sign-up, no permission prompt and no screen before the cover. (All; S2) DG-1, DG-36
- A light first page: text and Play first, the painting after; an image budget per day. (P3, P4, P2; S2) UA-39, UA-42

**Language**
- Only the chosen language shows anywhere; switching keeps progress. (All; S3) DG-2
- Hindi written and checked by native speakers, in everyday words. (P2, P3, P4; S3) UXW-37
- Road names in Devanagari and Latin forms; each viewer sees their own script. (P2, P3; S4, S10) **NEW**
- Hinglish in Latin letters. (P2, P6; S3) OQ-28
- A third script on Station boards. (P2, P3, P4; M5) OQ-6

**Identity and road names**
- The road name is made on first play and shown on the first result. (All; S4) DG-3
- Name lists that include feminine, masculine and neutral names, and village as well as highway places, with no gender question. (P1, P3, P4, P6; S4) **NEW**
- No real name, photo, place or contact anywhere. (All; S10) DG-35
- Persistent storage asked for, so the browser does not clear the player's data. (P1, P3, P2; S14) [W2, W3] **NEW**
- Keeping a player's data across a long gap or a new phone: Home Screen sooner, a carry-over code with no phone number or email, or an optional account. (P1, P3, P4; S14, M4) OQ-18

**Playing**
- The one step model: tap to pick, one named main button to commit, a muted main button that names what is missing, back at top left, no hint text in the first build. (All; S5) UA 2.0a
- Resume exactly where the player left off, after an interruption, a background switch or a reload. (P2, P4, P6; S5) UA-34 (the owner asked earlier that the game must not break on refresh [I4])
- Today's puzzle playable without a connection once opened; the result sent when back online; future puzzles not saved in advance. (P6, P4, P3; S2, S5, M3) UA-40; OQ-27
- Every gesture has a tap equivalent; targets at least 48 px; Play within thumb reach. (P5, P6; S5) DG-48, DG-49
- No state shown by colour alone. (P2; S5, S9) UA-4
- Layouts that reflow at 200% text with no sideways scroll. (P5, P3; S2) UA-16, UA-18
- No timers anywhere. (All; S5) personas S30
- One ghost demonstration on a mechanic's first day, with a still version under reduced motion; help on pull. (P3, P5; S5, S12) DG-8, DG-10
- What a newcomer plays when they join on a hard day. (P3, P5, P1; S5) OQ-19

**Results, streak and sharing**
- One-screen result with a soft line, never a verdict. (All; S6) DG-22, DG-23
- Share sends image and link together where the phone allows files; otherwise text and link. (P2, P1; S1, S6) DG-25; [M1] **NEW**
- Streak with one forgiven day a week, drawn with its own shape and word, explained in place the first time. (All; S9) DG-27, DG-28
- Best streak kept; restart without comment. (All; S14) DG-30
- When a day ends, for night players and shift workers. (P2, P6, P1; S7, S9) OQ-15
- Festival or shift slack (seedling). (P2, P6; S9) OQ-25

**Week and month**
- Sunday's shape, with the look-again pair as the main reflection. (All; S8) DG-41; OQ-2
- Tap answers before any typing, never stored; the note accepts any script. (P2, P3, P4; S8) **NEW**
- Notes never shown on an open screen; reading one takes a tap; long text on a light card. (P3, P6; S8) UA-38, PH-35
- The week stays open until the next puzzle, for Sunday workers (to test). (P6; S8) **NEW**, ASSUMPTION
- A month strip and milestones; a personal rulebook after Level 8 (seedling). (P5, P1; S13) DG-42; [I1]

**Board and friends**
- Board opens on Friends; Everyone shows a band, not a raw rank; reached from the Board tab only. (P1, P2; S10) DG-31, DG-21
- The player's own band visible to them from day 1, with a mark for when others will see them, if OQ-23 keeps a delay. (P2; S10) **NEW** around [I1 4.5]
- Weekly ranking so newcomers and returners can top a week. (P2; S10, S14) OQ-22
- Add a friend from their share card. (P1, P2, P5; S10) **NEW**
- Who appears on Everyone: a "Hide me" switch, and the 14-day delay for new players. (P3, P2; S10) OQ-23
- Anti-farming: practice capped at one puzzle a day, per-player variations, pattern checks, weekly audits. (P2 trust; S10) DG-32; [I1 4.5]
- No pressure tricks: no countdowns, no confirmshaming, no rank-drop notices. (All; S10, S14) DG-53

**Reminders and install**
- No ask on first open; the soft ask on the day 2 result; the browser prompt only after "Remind me". (P1, P2, P5; S7) DG-36
- On iPhone, the Home Screen offer before the reminder offer. (P1; S7) DG-37
- One reminder a day at a time the player sets; never if already played; no guilt. (All; S7, S14) DG-38, DG-39
- Reminder text names the day's object, never the topic, the score or the lean, so a lock screen on a shared phone gives nothing away; a tap opens today's cover. (P3, P6; S7, M2) DG-39
- A neutral Home Screen name and icon, tested on shared phones. (P3; S7, S15) **NEW**

**Content**
- Mirrored cases and twins that show the rule cuts both ways, including days where the consistent choice favours the man. (P2, P6; S5, S11) [I1]
- A fair third option on protective and safety days. (P2, P1; S11) samples p04, p09
- Respectful, owner-reviewed scenes of home life, dowry, land, marriage and care, handled with care on hard days. (P3, P4, P6, P2, P5; S11) brief; UA-46
- A recurring cast that includes Muslim, Dalit and Adivasi characters in ordinary roles, drawn with care before religion and caste enter later levels. (P6, P4; S13) brief; personas, "Who these personas leave out"
- Whether legal corrective rules (reservations) appear in scenarios. (P6; S11) OQ-29
- A help line on safety days. (P3, P6; S11) OQ-30

**Kits for people who pass the game on**
- A facilitator kit: one sentence, a poster with a short address, no per-person report. (P3; S1) **NEW**, after personas non-players
- A workplace or college kit that keeps play voluntary and is not aimed at under-18 groups. (P1, P6; S1) personas non-players

**Leaving**
- Reminders off in one tap. (All; S15) DG-40
- One tap deletes everything on this phone and on the server; as easy to withdraw as it was to start. (P3, P6, P1; S15) [D1 s.6(4), s.12(3)]; [D2 Rule 3]; [I1 4.4]
- No notices to friends when a player stops. (P6; S15) DG-38

---

## Questions for the owner (plain words)

This is the one list for all eight Stage 1 files: the six foundation digests, the personas and these journeys. The critique counted 39 questions across 7 files, with the same question asked up to three times. Each question now appears once. Every digest's old question points here by its OQ number.

**How to read each question.** It says what is being decided, gives an example from the game, and says what happens under each answer. "Pictures to show" names the approved samples or EVAL-13 screens to put side by side, or the sketch to draw, so the owner chooses by looking. Where a file recommends an answer, it says so; nothing is settled until the owner answers.

### A. How it looks (needed before the parts sheet)

**OQ-1. How the size of a lean is shown.** The game shows how much a player leaned, never which way. The files disagreed on how.
- **Pictures to show:**
  - A: the samples' number on a scale, "18 of 100" (samples p05 and p10, Sunday).
  - B: a picture with no number, such as a mark that grows outward from its centre, the same on both sides.
  - C: "Lean 18" over a bar from 0 to 100 that fills from the left. Warning: a bar that fills from one side may read as a direction.
- **Two smaller parts of the same choice:**
  - Does the lean show on every day's result, or only on Sunday?
  - In the Sunday look-again pair, does the game mark which person you picked? If yes ("I picked him"), you learn your direction for that pair.
- **Until you answer,** every file keeps only these limits: size only, never on a share card or a board, no he or she, no tilt.

**OQ-2. Sunday's shape.** Sunday shows the week, the lean, one look-again pair and a note button.
- **Pictures to show:**
  - A: one screen as in samples p05 and p10, including the top-3 board of all players.
  - B: the same one screen without the board.
  - C: a short sequence of screens: the week, then the look-again pair with the note, then the board.
- **Also on these pictures:** sample p05 sets the look-again lines in light text on a dark box; the perception digest asks for long text on a light card (PH-35). Show both.

**OQ-3. The lettering on Lugdi buttons.** The pulp samples set buttons in heavy display capitals with a red shadow ("SEND THE TEAM", sample p04). Hindi has no capitals, and the display face is hard to read in small Devanagari.
- **Pictures to show:**
  - A: the samples' capitals and red shadow on English Lugdi buttons; Hindi buttons in the reading face, leading by size.
  - B: sentence case in the reading face on every button in both skins, with capitals kept only on cover titles of 4 words or fewer.
- The red shadow could also stay on the one main button only, in either picture.

**OQ-4. "The End" on Lugdi results.** It is a pulp touch, but it reads as game over; the owner once called a result "very discouraging and terminal".
- **Pictures to show:** A: the end band kept (EVAL-13 006). B: the day's object line instead, for example "Issue 212 is out", with tomorrow's tease under it.

**OQ-5. The "Price ₹2" circle on Lugdi covers.** On a free game it may read as a charge; Duolingo found newly online Indian users read promotions as paywalls.
- **Pictures to show:** A: kept as decoration (sample p01). B: turned into an issue number. C: dropped.

**OQ-6. The city's own script on Station boards.** Real Indian station boards carry a third script, for example Gujarati at Ahmedabad. Your rule is that players see only the language they chose.
- **Pictures to show:** A: the third script kept as part of the board's picture, telling the player nothing they need (EVAL-13 029). B: English and Hindi only.

**OQ-7. What yellow means.** You said cards look the same before a choice.
- **Pictures to show:** A (recommended by the HIG digest): every card starts on paper, and yellow marks only your pick and the button that confirms it. B: every card starts yellow, and a pick gets a stamp and a heavier edge.

**OQ-8. How many people in a choice.** Your rule is three to five people, never two ("just two makes it man vs woman"). Some approved samples break it.
- **Pictures to show:** sample p04 (pick 6 of 8 for a team) and samples p02 and 3-p16 (two people side by side on a twin day).
- **Options:** A: always three to five people, so a team day picks fewer and a twin pair sits among three to five people. B: team picks may show up to eight, but never a two-person choice. C: two people allowed on twin days only.

**OQ-9. How a one-pick step is answered.** In sample p02, tapping a name answers at once.
- **Pictures to show:** A: tap a name and it is answered (fast, but a slip of the thumb counts). B (recommended by the step model): tap a name to pick it, then the bottom button says "Send Kamla" (one more tap, but a slip can be fixed, and nothing moves on by itself).

**OQ-10. Sizes the samples draw smaller than the rules allow.** The samples were drawn on a 340 px frame.
- **Pictures to show, each pair side by side at phone width:**
  - rule chips about 36 px tall (sample p01) against 48 px;
  - crowd bands in one row of ten (sample 3-p14) against two rows of five;
  - stat labels of about 9 to 10 px against the 14 px floor;
  - Hindi names in the display face (sample p02) against the reading face.

**OQ-11. How dark the tint over the painting must be.** The rule is settled: text sits on a plate or tint over the full painting, and the painting is never shrunk. To pass the contrast test at the darkest and lightest patch under each line, the tint may have to darken the art.
- **Pictures to show:** the sample cover (p01) at phone width with the measured contrast under each line, without and with the tint that passes. Does the painting still look right?

**OQ-12. Transfer days: announced or not.** The brief says players are never told a day is a test day. Sample 3-p16 labels it "Transfer day · A new kind of puzzle".
- **Pictures to show:** A: a transfer day that looks like any other day. B: the sample's label.

**OQ-13. Naming the day's trick.** The samples print it on the cover, for example "Level 4 · Loaded words".
- **Options:** before the puzzle (as the samples), only after the result, or never.

**OQ-14. Being open about what the game hides.** Apple's design principles ask products to be open about what they do and why. The game hides the side of a lean and does not announce transfer days. Neither is meant to deceive, but a player who finds out later may feel misled.
- **Options:** A: one line in the "?" sheet saying the game keeps the side of your lean private and sometimes brings new kinds of puzzle, without saying when. B: nothing said anywhere.

### B. How the game runs

**OQ-15. When a day ends.** Ravi finishes at 12:20 am. Should that count for Monday or Tuesday?
- **Options:** midnight India time for everyone; a late hour such as 4 am; the player's own clock.

**OQ-16. Should a shared link open in the sender's language?** Ravi's cousin plays in Hindi, but Ravi's phone is set to English. Yes: Ravi lands in Hindi and can still switch. No: he lands in English and has to find the chip.

**OQ-17. One phone, more than one person.** See the designed case above.
- **Two adults** (Mr Natarajan and Lakshmi; Meena and her sister-in-law) would mix two people's weeks and streaks. Options: say nothing; allow a second road name on the same phone; tell people the game is one player per phone.
- **The age line.** A child may pick up a parent's phone. Options: A: a one-tap "I am 18 or older" on the notice sheet the first time anything would leave the phone (no extra screen before play); after a "no", the game says it is for adults and keeps nothing. B: no age line, with kits aimed only at adults. A lawyer's advice is still pending [brief].

**OQ-18. Not losing everything.** If Shruti does not open the game for about a week and has not put it on her Home Screen, Safari can wipe it. Meena's phone breaks and her road name and streak go with it.
- **Options:** offer the Home Screen sooner; a carry-over code with no phone number or email; an optional account from day 3; or no accounts at all.

**OQ-19. What a newcomer plays on a hard day.** Sunita joins on a Friday, the week's hardest.
- **Options:** the same puzzle with help she can open; a short first week of easier puzzles; the same scenario made gentler for her. The game accessibility guidelines also suggest a way to practise without failing.

**OQ-20. Past days for fun.** Can a player open yesterday's puzzle with no points? LinkedIn and NYT free play close it; an archive adds content but also lets people practise the answers.

**OQ-21. Sunday and the streak.** Does opening the week on Sunday keep the streak going, or is Sunday a free day?

**OQ-22. A weekly board or an all-time board.** You chose one global board ranked by practice. Weekly: newcomers can top a week, and a returner is not hopelessly behind. All time: long-time players stay on top.

**OQ-23. Who appears on the Everyone board.** You said one board for all players. Three things would change that:
- a "Hide me from Everyone" switch, so Sunita can keep only her friends;
- the research's proposal to keep new players off Everyone for their first 14 days, to stop board farmers;
- a player who says "Not now" on the notice sheet (UA-47) stays off the board, because nothing about them has left the phone.
- **Picture to show:** the notice sheet drawn, with its itemised lines.

**OQ-24. Do transfer days count the same on the board?** The research gives them less weight; the digests say they look and score like any other day. If they count less, Ravi will notice his practice moving less on those days.

**OQ-25. More slack in festival weeks or for shift workers?** Ravi loses his streak in the Diwali rush and Farida after double shifts.
- **Options:** one forgiven day a week for everyone; two in festival weeks; let players bank a day.

**OQ-26. Where Sunday notes live.** Only on the player's phone and never sent (safest on a shared phone, lost with the phone), or stored with their history (kept, but held by us). The brief already says notes are never analysed. The reflection taps are never stored either way (see above).

**OQ-27. Saving tomorrow's puzzle in advance.** Meena often has no signal at home when a new day opens. Saving the next days' puzzles on the phone would let her play, but a saved puzzle can be read and shared early, and it would give away transfer days.
- **Recommended (usability digest UA-40):** save only the art, fonts and code in advance, not the puzzles. Option: save tomorrow's puzzle as well.

### C. Content

**OQ-28. Hinglish.** Ravi and Farida type Hindi in Latin letters. Should Hinglish in Latin letters ever be a language option, or only English and Hindi in Devanagari?

**OQ-29. Reservations in scenarios.** Should legal corrective rules (reservations) appear in puzzles? The brief lists this as not yet asked. Farida may read scoring both ways as false balance without them; Ravi may read them as unfair.

**OQ-30. A help line on safety days.** On days about dowry, custody or safety, should the "?" sheet carry one national help line? Any number must be checked against the official source before use; none is named here.

### Seedlings, not questions yet

These came up in the files as ideas, not decisions. They wait until the owner wants to explore them: a daily maker's mark to show the work is made by people (DG-P30); friend streaks (DG-P17); a personal rulebook after Level 8 [I1]; festival specials beyond one a month.

### Where the old questions went

| Old question | Now |
|---|---|
| Journeys 1 to 10 (day end, link language, two on one phone, iPhone data, two people or three to five, transfer weight, newcomers, notes, adults only, slack) | OQ-15, OQ-16, OQ-17, OQ-18, OQ-8, OQ-24, OQ-19, OQ-26, OQ-17, OQ-25 |
| Daily-game 1 to 6 (transfer label, naming the trick, board reset, past days, Sunday streak, hide from board) | OQ-12, OQ-13, OQ-22, OQ-20, OQ-21, OQ-23 |
| HIG 1 to 5 (price circle, third script, yellow, capitals, weekly board) | OQ-5, OQ-6, OQ-7, OQ-3, OQ-22 |
| M3 1 to 4 (capitals, red shadow, alternating plates, M3's own shapes) | OQ-3, OQ-3, settled by the owner on 20 Oct, not a question |
| Perception 1 to 6 (rule chips, crowd bands, transfer label, alternating plates, text over painting, lean wording) | OQ-10, OQ-10, OQ-12, removed as stale, OQ-11, OQ-1 |
| Usability 1 to 5 (Hindi names in display face, text over painting, tiny labels, price circle, tap to answer) | OQ-10, OQ-11, OQ-10, OQ-5, OQ-9 |
| UX writing 1 to 3 (third script, capitals, "The End") | OQ-6, OQ-3, OQ-4 |
| Personas tensions 1, 3, 4, 5, 9, 10 | OQ-19, OQ-28, OQ-29, OQ-1 and OQ-14, OQ-15, OQ-18 |

---

## Sources

Web sources were read as raw page or PDF text on 20 Oct 2026. Quotes are under 15 words; everything else is paraphrased.

- [W1] WebKit, *Full Third-Party Cookie Blocking and More*, 24 Mar 2020 (older; the official statement of the 7-day cap on script-writable storage). https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
- [W2] web.dev, *Storage for the web*, last updated 23 Sep 2024. Site data is "best effort" unless persistent storage is granted. Chromium clears the least recently used origin first when space runs out. Safari's seven-day eviction "does not apply to installed PWAs". https://web.dev/articles/storage-for-the-web
- [W3] WebKit, *Updates to Storage Policy*, 10 Aug 2023. Eviction can follow storage pressure or a long gap without interaction. A site can request persistent mode, which WebKit grants by heuristics such as being a Home Screen web app. https://webkit.org/blog/14403/updates-to-storage-policy/
- [W4] web.dev, *What does it take to be installable?*, last updated 19 Sep 2024. When the criteria are met, many browsers fire an event that lets a site show its own install button. https://web.dev/articles/install-criteria
- [M1] MDN, *Navigator: canShare() method*. Checks whether data, including files, can be shared before calling share. https://developer.mozilla.org/en-US/docs/Web/API/Navigator/canShare
- [D1] *The Digital Personal Data Protection Act, 2023*, Gazette of India, 11 Aug 2023: s.6(3) consent requests in clear, plain language, in English or an Eighth Schedule language; s.6(4) withdrawal must be about as easy as giving consent; s.12(3) erasure on request. Which provisions are in force today was not checked (UNVERIFIED). https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf
- [D2] *The Digital Personal Data Protection Rules, 2025*, G.S.R. 846(E), Gazette of India, 13 Nov 2025 (read raw on 20 Oct 2026 for the usability digest): Rule 1(4), Rules 3 and 10 come into force 18 months after publication; Rule 3, a standalone, itemised, plain-language notice with withdrawal as easy as consent; Rule 10, verifiable consent of a parent before processing a child's data. https://egazette.gov.in/WriteReadData/2025/267650.pdf
- Via [personas.md](personas.md): GSMA 2025 on scams as a top worry (S3); StatCounter Android versions (S8); WCAG 2.2 criteria 1.4.4, 1.4.10 and 2.2.1 (S30); WebKit on web push for Home Screen web apps (S31); Lumikai on playing 2 to 3 games at once (S4); Colour Blind Awareness (S32).
- Via [daily-game-patterns.md](../foundations/daily-game-patterns.md): every DG rule and the sources behind it. Via the other digests: every HIG, M3, PH, UXW and UA rule, and the shared step model and numbers in [usability-and-accessibility.md](../foundations/usability-and-accessibility.md), section 2.0.
- **UNVERIFIED:** how WhatsApp builds link previews; whether in-app browsers keep storage apart from the main browser.

Project files:
- [I1] `/Users/priyanshu/Sex Ed/Paper Analysis/Hypotheses/workplace-gender-training-v2/consistency-and-levels-2026-10-20.md`: the 16 levels, transfer formats ("Beyond the ladder"), seedling features (3.5) and board ethics and anti-cheating (section 4).
- [brief] `/Users/priyanshu/Sex Ed/Paper Analysis/Hypotheses/daily-fairness-trainer/brief-2026-10-20.md`.
- [I3] `/Users/priyanshu/Sex Ed/Paper Analysis/Hypotheses/workplace-gender-training-v2/resume-note-2026-10-18.md`, the 20 Oct 2026 blocks.
- [I4] The EVAL-13 diagnosis (`diag-feedback.md`, `diag-synthesis.md`, `diag-screens.md`) in the session scratchpad `/private/tmp/claude-501/-Users-priyanshu-Sex-Ed/ee410a71-fd9c-4ac3-9026-09778653ea55/scratchpad/`, the screenshots in `/Users/priyanshu/equal-lens-trainer/out/trainer-shots/`, and the approved samples in that scratchpad's `ls/shots/` and `ls/shots3/`.
- Owner rules in memory: `minimal-text-ui.md`, `design-before-build.md`, `plain-questions.md`, `ideas-are-seedlings.md`.
- The Stage 1 critique: [critique-stage1.md](critique-stage1.md).

Related: [personas](personas.md), [daily game patterns](../foundations/daily-game-patterns.md), [usability and accessibility](../foundations/usability-and-accessibility.md), [knowledge index](../README.md).

---

## Changes after critique

Applied from [critique-stage1.md](critique-stage1.md) on 20 Oct 2026.

- **Must-fix 2.** S9 no longer relies on a 2 s toast: the forgiveness line shows in place, any toast stays at least 4 s and is announced, and the forgiven day has a shape and a word.
- **Must-fix 3.** The lean is no longer shown as a bare number ("Twenty-three of what?", "Lean down from 18 to 9", "a lean size of 14"), and the look-again pair no longer has the player think "I picked him". Its form and place are OQ-1.
- **Must-fix 5.** The language chip on the cover is the switch's only home; it left the "?" sheet.
- **Must-fix 10.** The P2 and P4 journeys follow the personas: the merged, colour-blind Ravi, and the new rural P4, Meena.
- **Must-fix 11.** The two loose questions on shared phones and adults only became one designed case and one owner question (OQ-17). Sunita's daughter's days are no longer shown mixed into her week.
- **Should-fix 3.** Rules are cited as DG-1 to DG-53, with the other digests' prefixes, never as bare "R" numbers.
- **Should-fix 7.** Added five moments: the first weekly skin switch, a reminder tapped from the lock screen, offline as its own stage, a new phone, and a third script on a Station board.
- **Should-fix 8.** Moods are ordinal words (Quit, Low, Mid, Good, Keen), never summed; the cross table counts personas at Quit or Low, and the moments ranking is stated as a judgement.
- **Should-fix 9.** Reflection taps are never stored, sent or analysed.
- **Should-fix 10.** "14 days off Everyone" and "Hide me" are owner questions (OQ-23), not facts.
- **Should-fix 14.** One deduplicated list of 30 owner questions, in plain words, each with the pictures to show, replacing 39 questions spread across 7 files.
