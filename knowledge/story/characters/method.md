---
type: method
title: Characters that stay themselves across five looks (method and template)
description: How comics, webtoons and animation keep a character recognisable and memorable across many panels and many hands, what long-running Indian comics and TV teach, what holds a face on Retake's local FLUX.2 klein painter, and a step-by-step method and fillable template for defining every Saal Bhar character before any panel is painted. Research only; nothing painted, built or changed in the repo.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-20/
---

# Characters that stay themselves

**What the owner asked (26 Oct 2026).** "Giving characters a unique visual identity that stays consistent across boards", and "define each character in depth, how they would talk, how they would type, the words they'll use, the clothes they'll wear, their postures everything". Also: "no cap on number of characters... just make them real and memorable", "entirely story driven", and cards carry jobs most people can do.

**What this note is.** Research and a method. Every outside claim has a number that points to the source list at the end, and says whether I read the page's own text (checked) or only a search summary (summary only). Claims about our own pictures come from a contact sheet I made from `design-system/assets/` (`drift-sheet.png` and `forehead-check.png`, next to this file). Raw page text I fetched is in `src/` next to this file.

---

## The answer in one screen

1. **Write the person before drawing them.** Comics and TV both start from a written bible entry: want, fear, contradiction, history, voice. The draft's cast table gives each person one temperament line ("exact and dry"); that is a type, not a character (section 4).
2. **Give every person an identity stack, strongest anchor first:** silhouette and height, hair as a shape, one face accessory or facial hair, one garment with a pattern and a light or dark value, one prop, one posture. No two people share the same anchor at the same level (section 6, step 3).
3. **Words for what holds, pictures for what drifts, a checklist for both.** Our own portraits, painted in five looks from the same words, kept hair shape, spectacles, beards, a checked pattern and white clothes in every look, and lost the face, the apparent age and the colour of clothes (section 5.1). So the face is carried by a reference picture, never by words alone, and every panel is audited against the stack.
4. **One master model sheet per person in the present-day look, then one reference picture per world look derived from it,** both picked by eye. Panels are painted with FLUX.2 klein's edit model from those references, as `cutscenes.py paint-refs` already does for the trunk (section 5.3, 5.4).
5. **Colour key per look, not one colour.** Station prints in two inks, so hue cannot carry anyone there; pattern and value can. Each person's signature garment gets a value and a pattern that hold in two inks, plus one named ink in each world (section 5.8).
6. **Voice is the anchor that never drifts.** Speech and typing are live text, so they are the only identity channel the painter cannot spoil. Each person gets pet words, a speech habit, a "never says" list, a typing style and gender-free ways of addressing you, in all three languages and inside the 10-word line cap (section 3).
7. **Memorable, not a type:** a specific want, one contradiction that shows the same way every time, one thing you could draw in five strokes, one line people quote back, one friction with another household member, and a change across the year (section 4).
8. **A per-character LoRA is phase two, not phase one.** The installed mflux can train one on the FLUX.2 klein base model, but that model is not on the Mac, and I found no figure for its memory or time on 24 GB. Test one person through the heavy queue only if reference editing fails the audit (section 5.7).

---

## 1. How comics, webtoons and animation do it

### 1.1 Model sheets and turnarounds
- A model sheet (character sheet) standardises a character's look, poses and gestures so that many artists can draw one character as if one hand did; a drawing that strays is "off-model" [1, checked].
- A sheet usually shows the head and body at several angles ("model rotation"), hands and feet, and several basic expressions, with notes on head shape, hair, and the size and place of eyes and mouth [1, checked].
- How tightly artists must follow the model is a trade-off between expressiveness and consistency, and studios choose differently [1, checked].
- A turnaround (front, side, three-quarter, back) lines up eyes, shoulders and waist with level guide lines across the views; in 2D animation one character can be drawn thousands of times by dozens of artists, so the sheet is the shared blueprint [2, checked].
- **For Retake:** our "dozens of artists" is one painter that forgets the face between panels (the `cutscenes.py` comment above `LOOKS` says as much). A model sheet is even more needed, and it has to be a picture the painter can be given, not only words.

### 1.2 Expression sheets
- Model sheets include basic facial expressions, and often several sheets cover subtler attitudes [1, checked]. McCloud's *Making Comics* lists body language and facial expression as its own topic, beside giving characters an inner life and an unforgettable look [3, checked: the book's own page lists the topics].
- Tinkle's founding editor, Anant Pai, told an illustrator who once drew dot eyes to go back to big expressive eyes, because children would not read the dots; Tinkle's writers say they picture each character's reaction as they write [4, checked].
- **For Retake:** a face that drifts between panels cannot carry fine expression. Write each expression as what the whole body does (shoulders, hands, head tilt) as well as the face, so it still reads if the face comes out a little different.

### 1.3 The silhouette test and the cast line-up
- Matt Groening's rule for cartoon characters is that you can tell who each one is in silhouette, learned from Mickey Mouse's ears; he names the Simpsons' hair shapes as the proof [5, checked]. The family's simple designs were chosen so their expressions change easily and so they read in silhouette [6, checked].
- A cast comparison chart (all characters side by side with height lines, like an identity parade) shows silhouette and proportion together; distinct silhouettes let readers find each person quickly in a crowded panel [7, checked].
- **For Retake:** test the whole household as black shapes at the two sizes the strip really shows: a figure in a panel on a 360 px phone, and the face chip on a bubble. Station's two-ink print is close to this test already.

### 1.4 Shape language, and its trap in a fairness game
- Character designers use round, square and triangular base shapes to suggest friendliness, stability or danger, then check the result with the silhouette test [8, checked; a university teaching article, so typical practice rather than a standard].
- **The trap:** if every woman is round and soft and every man square and hard, the art itself teaches the gender script the game measures. Assign shapes by personality across the cast so that, for example, a woman carries the square "steady" shape and a man the round "gentle" one. Check this on the line-up (section 8).

### 1.5 A fixed colour key, and a second key for each kind of light
- In animation each character gets a master palette with one swatch per zone (skin, hair, shirt), so every artist uses the same colours; studios also make extra palettes for the same character at night or in rain [9, checked].
- **For Retake:** the five worlds are like five lighting palettes. A character's colour key is therefore a table: in each look, which of that look's own inks their signature garment takes (section 5.8).

### 1.6 Costume rules and signature props
- Chacha Chaudhary's dress is fixed: a red turban, a wooden stick, a waistcoat with a double inside pocket, and a pocket watch [10, checked]. A journalist who drew him as a boy remembers the big red turban, the round face behind a white moustache, the waistcoat and shoes, and says the appeal was the simplicity of line, plot and dialogue [11, checked].
- Sabu's giant earrings were a gift from his mother when he left home [10, checked]: a prop with a story is remembered better than a prop.
- Shikari Shambu's creators slowly dropped his hunting gun after a few episodes, but kept the hat pulled down over his eyes, which his artist Vasant Halbe chose from his first sketches [12, checked; 13, checked].
- Raj Comics' Nagraj was drawn in turn by several artists over 44 issues; one parallel version is told apart by a jacket, trousers and longer hair [14, checked].
- **For Retake:** keep clothes fixed per person and per occasion (everyday, and one set for the wedding), and give each person one prop with a reason in their life. The turban that makes Chacha Chaudhary readable is exactly what rule 3 forbids, so our anchors must come from secular things: spectacles, a shawl, a cardigan, a pen in a pocket, a watch, a cane, a scorebook.

### 1.7 Hair as a shape
- Groening says he thinks about hair a great deal, because the Simpsons' silhouettes are their hair [5, checked].
- Face research points the same way: in Sinha and Poggio's illusion, two famous men given identical eyes, nose and mouth still look like two different people, and the authors conclude that people lean on whole head shape and hair more than on fine inner features [15, checked].
- **For Retake:** hair is the strongest single anchor we have (section 5.1). Write it as a shape in one sentence the painter cannot misread, and make every person's hair shape different from everyone else's.

### 1.8 Few features, chosen to be redrawn
- A Clip Studio guide to webtoon characters says to pick the few features that carry the personality, because fine details (freckles, flowers in the hair, armour trim) are hard to repeat in every panel, and to keep the colouring simple [16, checked].
- **For Retake:** the painter is our "artist who must redraw it every panel". Choose anchors big enough to survive a 4-step painter at phone size.

### 1.9 Lettering as voice (an option to ask about)
- On *The Sandman*, letterer Todd Klein gave Dream and each of his siblings a distinct balloon and lettering style, of equal weight [17, checked].
- Retake's bubble spec says no new colours, sizes or radii in bubbles and a name tag carries the speaker. A per-person balloon edge or letter style would be a new pattern for the owner and `DESIGN.md`, so it is a question (section 10), not a rule.

---

## 2. Long-running Indian comics: what makes them instantly readable

| Comic | What makes the character readable | What Retake can borrow |
|---|---|---|
| Chacha Chaudhary (Pran, from 1971) | Fixed costume and props [10]; a saying others repeat about him, that his brain is faster than a computer [10]; a small old man who beats villains with wits, not muscle [10]; simple line, plot and dialogue [11] | A fixed outfit, one prop, a line other people say about the person, and one big contrast (small body, big mind) |
| Suppandi (Tinkle, 1983, drawn by Ram Waeerkar) | A flat head because he has no brains [18, checked]; the editor's one-line behaviour rule, that he is not a buffoon but simple and takes everything literally [4, checked]; drawn by the same family for decades, Waeerkar then his daughter and son [19, checked] | Shape that says the personality; one rule of behaviour that writes the jokes; the same hands on a character for a long time |
| Shikari Shambu (Tinkle, 1983) | Hat over the eyes [12, 13]; a contradiction, a coward the world thinks is brave [12] | A contradiction that shows the same way every time; one shape (the hat) that outlasted the props |
| Tinkle as a house | Says it is completely secular, with names like Aisha and Kabir that could be from any religion [4, checked] | The same line our rules 3 and 21 already take |
| Nagraj (Raj Comics, from the late 1980s) | Drawn by several artists in turn; parallel versions told apart by costume and hair [14] | Costume and hair as the version marker, which is our "one person, five looks" problem |
| Amar Chitra Katha (from 1967) | Many artists drew it [20, checked], but I found no source on how it kept faces the same across them | A gap. Its gods and kings are known by attributes of dress and ornament, which rule 3 rules out for us anyway |

**Pran's own brief** for Chacha Chaudhary was a type everyone knows, made specific: "Each family has its own wise old man" [10, checked]. That is the design brief for Nani, and the lesson is that the type is the starting point, then fixed props, one contrast and one saying make it one person.

---

## 3. How writers keep a voice consistent

### 3.1 What a voice entry holds
- **A household of distinct voices.** *Sarabhai vs Sarabhai* is an Indian family sitcom whose people are told apart by want and irritation, not by plot [21, checked]: Maya's catchphrase damns things as middle-class, and her daughter-in-law's thrift is her constant pet peeve; Indravadan jokes even in the worst moment; Sahil is the calm one caught between his mother and his wife; Dushyant, an engineer, has a catchphrase promising to explain, which annoys the whole family; Madhusudan is deaf, refuses a hearing aid and blames others for speaking softly.
  - Each person has one want, one irritation aimed at another family member, and one habit of speech. Retake's household needs the same: a friction line between every pair (template section 2).
- **Flat and round.** Forster split characters into flat ones (one trait, summed up in a sentence) and round ones; he allowed that flat characters have two advantages, being recognisable and memorable, and that great novelists use them [22, checked: a review's summary of the book; 23, checked: an encyclopedia summary].
  - For Retake: a chapter voice met in one chapter (Mausi, Masterji) can be deliberately flat, one strong trait and one habit. The household, met all year, must be round.
- **A contradiction, held steady.** McKee is quoted as saying that dimension means contradiction, inside the character or between how they seem and who they are (his example is a charming thief), and that the contradictions must be consistent [24, checked: a forum post quoting *Story*, not the book itself]. The same post quotes him saying the protagonist creates the rest of the cast.
  - For Retake: the protagonist is you, never drawn. So each person is partly defined by what they want from you and how they treat you, which is also what keeps the player inside the story.

### 3.2 How they type
- In a study of 126 students, a one-word text reply ending in a full stop read as less sincere than the same reply without one; the same reply in a handwritten note did not [25, checked: NPR's report of the Binghamton study].
  - So punctuation is characterisation on a phone. A person who ends every text with a full stop reads as stiff or cross to the family, which can be the point (Papa) or a misreading the story plays with.
- Our own personas note (assumptions, not survey facts) that the shop-counter worker and the nurse type Hinglish in Latin letters on WhatsApp, and that the retired 61-year-old forwards good-morning messages to the family group [26, checked].
- Typing fields for each person: script (Devanagari, Hinglish in Latin letters, English), length, full stops or none, emoji or none, voice notes, forwards, time of day, typos. Messages show as live text on a painted blank phone (rule 30), so typing never drifts.

### 3.3 Retake's own rules that shape every voice
- A spoken line is at most 10 words (rule 62, waiting on question 14), so a catchphrase must be short.
- Every line exists in Hinglish, Hindi and English (rule 65), so a habit of speech has to survive translation. A habit (counts everything, answers with a time, asks two questions at once) travels better than a word-play slogan.
- Hindi to or from you marks no gender (rule 66): each person's way of addressing you is written in advance from commands, "who should" asks and lines where you are not the doer, and checked by the script and a native reader.
- Polite forms to elders; the household never sits on a card, never doubts a report of harassment or a dowry demand, and the chapter's asker is never the comic one (rule 37).
- Writers already mark beats that break a rule; the voice entry adds a "never says" list that a script can check, in the same way the painter's glossary refuses undefined words (the tool-backed pattern in `painter-glossary-rule`).

---

## 4. Memorable, not a type

The draft bible's cast table gives each person a relation, a role in the year and one way of speaking: "short orders, counts heads", "lists, times and prices", "exact and dry", "fast, generous, worried", "teasing, quick". The chapter voices get even less ("talks over everyone", "a coach's verdicts"). The review found the strip "shows a clock, not people". The sources above suggest what is missing. A person is memorable when the team can answer all seven of these; a type answers only the first.

1. **Role and temperament** (what the draft has).
2. **A specific want this year, and what they want from you.** (McKee's protagonist-made cast [24]; Sarabhai's wants [21].)
3. **One contradiction that shows the same way every time.** (Shambu the brave coward [12]; McKee's consistent contradiction [24].)
4. **One thing you could draw in five strokes that is only theirs.** (Shambu's hat, Suppandi's flat head, Chacha's turban and stick [10, 12, 18].)
5. **One line people would quote back, or one habit of speech.** (Chacha's saying, Maya's catchphrase [10, 21].)
6. **One friction and one tenderness with another household member.** (Sarabhai [21].)
7. **A change across the year:** who they are in January and what is different by December.

Plus Retake's own test: **one of our six players can say "I know this person"** (the small-town tailor should recognise Masterji; the 61-year-old should recognise Papa or Captain sahab).

---

## 5. The painter: what keeps identity on FLUX.2 klein

### 5.1 What our own portraits already show
I put four people from `design-system/assets/` side by side in all five worlds (`drift-sheet.png`). Each was painted from the same description words in every world, with a different seed and the world's own style words. By eye:

| Anchor | Anita | Arjun | Kamla | Salim | Held in all five looks? |
|---|---|---|---|---|---|
| Hair as a shape | shoulder-length bob | short curls | tight top bun | grey hair swept back | **Yes, all four** |
| Face accessory or facial hair | round spectacles | light stubble | none | trimmed grey beard | **Yes, all three that had one** |
| Garment pattern | plain | plain | checked shirt | plain | **Yes:** the check survived even the two-ink Station print |
| Garment value (light or dark) | light top in four, red in Jadugar | light to mid, five different colours | the check stayed, its colour changed | white kurta or shirt in all five | **Mostly:** white held; mid tones did not |
| Garment hue | cream, cream, cream paper, red, white | white, pale blue, grey, yellow, brown | orange, orange, black, red, peach | white throughout | **No** |
| Face shape and apparent age | Rukavat young and round-faced, Lugdi older and heavier | close, but not clearly one man | varies | varies | **No** |
| Skin tone | shifts with each look's light; Cricket's faded print and Station's ink change it most | | | | **No** |

**A side finding.** A close-up of eight of these faces (`forehead-check.png`) shows a painted forehead dot on six, including a man (`jadugar-salim`). None of the six is in the `DOTS` clean-up list in `portraits.py`, which covered names that mark a community. These faces are not this cast, but any face reused for Saal Bhar must pass the close-up check first (rule 33; `flux-portrait-biases`).

### 5.2 Why panels painted one at a time drift, and why two people swap
- A 2025 paper on comic-strip generation says that painting each panel's caption on its own gives no way to carry identity from panel to panel, so hairstyle, clothing colour and face structure drift unpredictably; its fix keeps a list of each character's fixed attributes, audits every panel against it, and repairs the failures [27, checked]. That is the trunk checklist in `painter-glossary-rule`, made general.
- Text-to-image models often attach a description to the wrong thing: the SynGen paper's example is a prompt for a pink sunflower and a yellow flamingo that comes back yellow sunflower, pink flamingo [28, checked]. It studied older models, but the risk is plain for a panel with two people described in one prompt: they can swap clothes or props.
  - For Retake: when two people share a panel, give them contrasting anchors at the top of the stack (different heights, different hair shapes, one light and one dark garment), paint them from references, and check both.

### 5.3 Reference-image editing, as `cutscenes.py` already does
- Black Forest Labs' own guide says character consistency in FLUX.2 comes from multi-reference editing: give one or more pictures of the character, describe the new scene, and the model keeps the identity; one of their examples places a couple from one picture into another picture's street and asks for that picture's style to be applied to them [29, checked].
- FLUX.2 klein takes **up to 4 reference pictures**; the larger models take more [30, checked].
- `cutscenes.py` already paints from references: `paint-ref` makes three tries at a reference, `pick-ref` keeps one by eye in `art/refs/`, and `paint-refs` paints each panel that names that thing with `Flux2KleinEdit` (8-bit, 4 steps, 1024 x 768, seeds 7100, 7203 and 7319). Today `REFS` holds only the trunk.
- What our own work found (`painter-glossary-rule`): the edit model still drops details and changes size (a one-parrot, boxy trunk passed review and the owner caught it), so every referenced panel needs an explicit checklist; a name in a prompt gets painted as lettering, so people go in as a role and a look; a prop in a person's fixed look gave Vikram three hands, so props go in the scene with the hand that holds them.
- **The budget of 4 references** sets a working rule: a panel can carry at most two people from references, plus a prop and a place, or one person with two views of them. Anyone else in the panel is painted from words, small, at a distance or from behind. The draft's opening already keeps to at most two people a panel.

### 5.4 A fixed reference sheet per person, and one per look
- **Master sheet (present day).** In `STYLE['now']`: front face, three-quarter, profile, back, full figure standing, full figure in their usual posture, and four to six expressions. Untested: whether klein can paint a clean multi-view sheet in one picture. If not, paint the front view first, pick it, then paint the other views from it with the edit model, one picture each.
- **Per-look reference.** For each world a person appears in, restyle the picked front view and full figure into that world with the edit model (the style-transfer example in [29]), three seeds, pick by eye against the person's anchor checklist. This is the reference that world's panels use, so the painter is never asked to change style and keep a face in the same step.
- **Untested and worth testing first:** does a present-day reference pull its own style into a Lugdi or Station panel? If it does not, per-look references may be needed only for faces; if it does, they are needed for everything.
- Cost: only for the looks a person appears in. Chapter voices appear in one world and the present-day pages, so two references each; the household may need all six.

### 5.5 Seeds
- A seed fixes one picture for one prompt. Our portraits found that a repaint with the same seed and slightly changed words comes back nearly the same, logos and skin tone included, so a repaint needs a new seed (`SEED_BUMP` in `portraits.py`; `flux-portrait-biases`).
- A seed does not hold a face across different prompts. Record seeds for reproducibility (`log.json` already does), never rely on them for identity.

### 5.6 Prompt anchors
- The same words every time, per person and per age, as `LOOKS` does now; the painter keeps no face from panel to panel, which is why `LOOKS` exists.
- Role, never name ("the grandmother", not "Nani").
- Props out of the fixed look; in the scene, with which hand holds them.
- Say what to paint, never what not to paint, for glossary words (naming the wrong thing draws it); every garment and prop word with more than one meaning gets a glossary row first.
- Bias anchors that worked: "South Asian features and warm brown skin" in the soft family-magazine style stopped the whitening; prompt words did not stop forehead dots, which had to be found by eye and painted out (`flux-portrait-biases`).

### 5.7 A per-character LoRA: what it would cost
A LoRA is a small add-on file, trained on pictures of one person, that teaches the painter that person.
- **Possible with what is installed.** mflux 0.19.1 on the Mac can train LoRAs for FLUX.2 klein, but only on the undistilled "base" models (`flux2-klein-base-4b` or `-9b`), including an edit mode trained on before-and-after pairs (its own README, read locally).
- **Not on the Mac yet.** Only the distilled `FLUX.2-klein-4B` is in the Hugging Face cache (15 GB). The base 4B is a separate download; Hugging Face lists the same file sizes for it as for the distilled 4B, under Apache 2.0 and not gated [31, checked]. The 9B models are under a non-commercial licence [30], so they are out.
- **Memory and time on 24 GB: unknown.** No source I opened gives a training figure for Apple silicon. What we know: painting alone takes most of the Mac's memory, and two FLUX models at about 16 GB each crashed it on 22 Oct (`mac-memory-limit`); training adds optimiser state on top. mflux's training config has `quantize` and `low_ram` settings that may help. Any test runs alone through `heavyq`.
- **Untested:** whether a LoRA trained on the base model works with the 4-step distilled model `cutscenes.py` uses, and whether two people's LoRAs can be used in one panel.
- **The chicken and egg:** a LoRA needs a set of consistent pictures of the person in the first place, which is what reference editing has to produce anyway.
- **So:** reference editing first. Train one LoRA for one person only if the audit pass rate on reference-edited panels is poor, and measure peak memory, time and the pass rate before deciding on more.

### 5.8 Which anchors survive a change of style
Ranked from our sheet and the sources, strongest first:

| Rank | Anchor | Why | Evidence |
|---|---|---|---|
| 1 | Hair and head shape | Held in all five looks for four of four people; people recognise heads by hair and head shape more than inner features | sheet; [5], [15] |
| 2 | Spectacles, beard, moustache | Held in all five looks for every person who had one | sheet |
| 3 | Body silhouette, height and posture | The comics standard; **untested on our painter**, because our sheet is head and shoulders only | [5], [6], [7] |
| 4 | Garment pattern (check, stripe) | The check survived two inks; hue did not | sheet |
| 5 | Garment value (light or dark) | White held everywhere; mid tones drifted | sheet |
| 6 | Signature prop | Holds only when painted from its own reference, and still needs a checklist | `painter-glossary-rule` |
| 7 | Garment hue | Changed in every person; Station has two inks, Lugdi's lamp light recolours everything | sheet; `STYLE` |
| 8 | The face | Least stable across looks; carried by the reference picture, never by words alone | sheet; [27] |

**The colour key, per look**, from the style words in `cutscenes.py` and `wides.py`:

| Look | Inks the painter is told to use |
|---|---|
| Present day | clean ink outlines, soft flat colour, warm lamplight against cool rainy blues |
| Lugdi | night violet and indigo shadows, vermilion and marigold lamp light |
| Station | deep enamel blue and black on cream (scenes); black and chrome yellow, re-inked to black on cream (portraits) |
| Jadugar | vermilion and magenta on deep indigo, emerald and old gold (scenes); crimson, midnight blue, old gold and cream (portraits) |
| Cricket | deep outfield greens, chalk white, cherry red |
| Rukavat | warm teak browns, faded teal and cream with one signal orange |

So a person's colour key is "a light or dark value, a pattern, and one named ink per look". Example shape: "the darkest plain garment in any panel: midnight blue in Jadugar, black in Station, indigo in Lugdi, deep green in Cricket, teak brown in Rukavat".

---

## 6. The method for Retake, step by step

Each step names what it produces and what gate it must pass. Nothing heavy runs outside `heavyq`, and only one painting job at a time.

1. **Write the bible entry** for every person with the template in section 7, inner life and voice first. Gate: the seven questions in section 4 all answered; a writer who has not met the person can write a new line for them that the team agrees sounds right.
2. **Write the voice file**: pet words, habit of speech, never-says list, address forms to you, three sample lines and three sample messages, each in Hinglish, Hindi and English. Gate: rule 66 checker passes; a Hindi-first reader reads them aloud; every line within the word caps.
3. **Design the identity stack and run the line-up** (section 8): heights, builds, hair shapes, face accessories, patterns, values, props, postures, shape language. Gate: no two people share an anchor at ranks 1 to 4; the cast is told apart as black shapes at phone size and in two inks; shape language does not follow gender across the cast; rule 3 read by an Indian reader (no religious or caste marker, dress or symbol, no brand, no letters on clothes).
4. **Add glossary rows** for every garment and prop word with more than one meaning, and a reference picture plan for each prop (as the bible already lists for the list, cane, key ring, scorebook, umbrella).
5. **Paint the master model sheet** for each person in the present-day look, three seeds, pick by eye. Gate: the anchor checklist; forehead and skin close-up (no painted dot, no lightened skin); hands counted; nothing lettered. The owner approves the sheets as a pictured parts sheet before any panel is painted (`design-before-build`).
6. **Derive one reference per look** each person appears in, from the picked master. Gate: the same checklist, in that look.
7. **Paint by scene** (owner, 26 Oct): each scene's panels with `paint-refs`, at most two people from references per panel, roles not names, props in the scene with a named hand. Gate: every panel audited against each person's checklist; repaint failures with a new seed; record the pass rate per person.
8. **If one person keeps failing,** try more reference views for that person (up to the 4-picture budget) before anything else; then, only then, a one-person LoRA test (section 5.7).
9. **Read-through for voice**: the strip read with names covered; a reader should name the speaker of most lines from the words alone. Gate: the team's call; repeat after chapters 1 and 3 with players, beside rule 24's "What was this about?".
10. **Keep the bible live**: any change to a look or a voice goes into the person's entry, the glossary and the reference files the same day, so the next panel paints from the current person.

---

## 7. The character definition template

Copy one per person into its own file. Fields in brackets say what goes there and why.

```markdown
---
type: character
title: <What you call them> (<Hindi>), <their role in the year>
description: <One sentence: who they are and what they want this year.>
plane_issues: []
---

# <What you call them>

## 0. At a glance (the card the whole team reads)
- Called: <English> | <Hindi> | <first-time English label, rule 65, e.g. "Mama ji, Mummy's brother">
- Age; relation to you; where they live; what fills their day:
- The type in five words: <e.g. "the punctual father">
- What makes them not the type (one contradiction, said "X, but Y"):
- Wants this year:
- Wants from you:
- Fears:
- The line people would quote back, or their habit of speech (10 words at most, works in all three languages):
- Which of our six players would say "I know this person", and why:
- Flat or round: <chapter voices may be flat by design; the household is round>

## 1. Inner life
- Two or three facts from their past that still show, each one visible in a panel or heard in a line:
- How they show care (what they do, not what they say):
- What makes them cross; what makes them laugh:
- What they would never do (Retake: never doubts a report of harassment or a dowry demand; never on a card):
- Their year: who they are in January, what changes by December, and which chapter turns it:

## 2. Relationships (one friction and one tenderness each)
- With Nani:
- With Mummy:
- With Papa:
- With Mama ji:
- With Tinku:
- With you:
- With this chapter's voice, if they share a chapter:

## 3. Voice (spoken)
- Register and pace: <Hindi-first or English-first; short or long sentences; fast or slow>
- Pet words (3 to 5), each as Hinglish | Hindi | English:
- Habit of speech (one; a habit travels across languages better than a slogan):
- How they address you (rule 66: commands, "who should" asks, lines where you are not the doer; no gendered word):
- How they address elders, and younger ones:
- How they argue; how they praise; how they say sorry, or don't:
- Humour: <its kind, or none; the chapter's asker is never the comic one, rule 37>
- Never says (words and moves a script can check):
- Sample lines (3), each Hinglish | Hindi | English, 10 words at most, read aloud by a Hindi-first reader:

## 4. Typing (their phone)
- Script: <Devanagari | Hinglish in Latin letters | English>
- Length; full stops or none (a full stop reads stiff in a text); capitals:
- Emoji (which ones, or none); voice notes; forwards; stickers:
- When they message, and how fast they reply:
- Typos and habits:
- Three sample messages, as they would appear on the painted blank phone:

## 5. Look: the identity stack (strongest anchor first)
1. Silhouette: height rank on the line-up; build; the shape you would know in black at phone size:
2. Hair as a shape (one sentence the painter cannot misread: shape, length, parting, grey):
3. Face accessory or facial hair (or none; never shared with another person):
4. Everyday clothes: garment, pattern, value (light, mid or dark), fit:
   Wedding-week clothes (chapter 5):
5. Colour key per look (the signature garment's ink):
   | Now | Lugdi | Station | Jadugar | Cricket | Rukavat |
   |---|---|---|---|---|---|
   | | | | | | |
6. Signature prop, its story, and the hand that holds it (glossary row; own reference picture):
7. Posture at rest; the gesture they repeat; what their hands do when idle:
8. Skin and face: <skin words that resist whitening, e.g. "warm brown skin, South Asian features">; face shape; age signs:
- Rule 3 read: no religious or caste marker, dress or symbol; no brand; no letters on clothes. Read by an Indian reader: <name, date>
- Shape-language note (how this shape sits against the cast's gender spread):

## 6. Expressions (what the body does, since faces drift)
- Neutral:
- Pleased:
- Worried:
- Cross:
- Laughing:
- Tired:
- Moved:

## 7. Painter sheet (what goes into cutscenes.py)
- Role word (never the name):
- Fixed look words, present day (the same every time):
- Per-look additions (the colour key words for each look):
- Never in the fixed look (props go in the scene):
- Glossary rows needed:
- Files: master sheet <art/refs/...>; per-look references <...>; seeds tried; seed picked:
- Audit checklist for every panel: <ranks 1 to 6 above, one line each>; hands and faces counted; forehead and skin close-up; nothing lettered
- Known painter traps for this person: <forehead dot risk; whitening in soft looks; swap risk with whom when together>

## 8. Where they appear
- Chapters and looks; panels; spoken lines per chapter; the asker or the voice in which chapter:

## 9. Rule checks
- [ ] Never on a card (household)          - [ ] Not the comic one if an asker (rule 37)
- [ ] Hindi lines pass rule 66             - [ ] Polite forms to elders
- [ ] No rule 3 marker in words or sheet    - [ ] Line caps (rule 62)
- [ ] British spelling, no em or en dashes
```

**A short variant for circle people (the cards).** The owner lifted "no quirks" and wants circle people real and memorable. Their entry is short: first name, age, a job most people can do, where they stand to the household, one want and one habit shown in story panels only, hair shape and one anchor for the portrait. Every trait on a circle person is a possible nudge, so the measure judge checks that traits sit off the cards, fall as often on women as on men, and never follow gender across a pair (rules 17, 19, 20).

---

## 8. The cast line-up sheet

One table for everyone who speaks or is drawn. Fill it before any master sheet is painted; a repeated value in columns 3 to 7 is a clash to fix.

| Person | Height rank | Build | Hair shape | Face accessory | Garment pattern | Value | Prop | Posture | Base shape | Gender |
|---|---|---|---|---|---|---|---|---|---|---|
| Nani | | | | | | | | | | woman |
| Mummy | | | | | | | | | | woman |
| Papa | | | | | | | | | | man |
| Mama ji | | | | | | | | | | man |
| Tinku | | | | | | | | | | woman |
| Mausi | | | | | | | | | | woman |
| Mausa ji | | | | | | | | | | man |
| Masterji | | | | | | | | | | man |
| Captain sahab | | | | | | | | | | man |
| Mami | | | | | | | | | | woman |

Checks: black shapes at phone size; the same in two inks (Station's test); base shapes not sorted by gender; skin tones as varied as a real family; no two people in one chapter with the same top-two anchors.

---

## 9. A short worked example (illustration of the template, not the cast pass)

The draft gives Papa one line: 56, books every train months early, "exact and dry: Not 9:45. 9:40." The template turns that into a person:

- **Contradiction:** exact about time, unable to say what he feels; booking you the lower berth is how he says he missed you. (McKee's "seems one thing, is another", held the same way all year.)
- **Want this year:** fourteen people at his mother-in-law's door on time for her eightieth; being the son-in-law who managed it.
- **Wants from you:** to be the one who does not need reminding.
- **Habit of speech:** corrects any time to the minute; answers feelings with numbers. Never says "I missed you" or "don't worry".
- **Typing:** short English in Latin letters, every message ends with a full stop (which the family reads as cross, and is not); no emoji; sends the booking screenshot, painted blank.
- **Stack:** tallest on the line-up and thin (rank 1); short side-parted hair combed flat, grey at the sides (rank 2); no spectacles, so they stay free for someone else (rank 3); a light shirt with thin vertical stripes (ranks 4 and 5); the travel list in its clear plastic sleeve, held at his chest in the left hand (rank 6); stands leaning slightly forward, as if walking to a train (posture).
- **Friction and tenderness:** with Nani, he is formal and she teases him for it; she is the only one he lets finish his sentences.

Every item here is for the cast writers to keep, change or strike. It shows the depth the owner asked for, not a decision.

---

## 10. Questions this raises for the owner

1. **A cap or sun hat** for Captain sahab: the bible's list of things never painted says "cap". Is a plain cricket cap with no badge allowed, or is any cap out?
2. **Spectacles** are our strongest small anchor; may more than one person in a chapter wear them, if their shapes differ (round and square)?
3. **Per-person bubbles** (Todd Klein's way: one person's balloon edge or letter style), or name tags only, as the bubble spec says now?
4. **A one-person LoRA test** through the heavy queue, if reference editing fails the audit for someone: yes or not yet?
5. **The forehead dots** found on six reused faces (section 5.1): the card faces are not this task, but someone should check the library before any of them returns.

---

## Sources

Checked means I read the page's own text (fetched raw, saved in `src/`); summary only means a search summary, used only where marked.

1. Wikipedia, "Model sheet". https://en.wikipedia.org/wiki/Model_sheet (checked)
2. BINUS University, "Character Turnarounds: Understanding Form in 2D Space", 4 Nov 2025. https://binus.ac.id/bandung/dkv/2025/11/04/character-turnarounds-understanding-form-in-2d-space/ (checked)
3. Scott McCloud, *Making Comics* (2006), the book's page. https://www.scottmccloud.com/2-print/3-mc/index.html (checked; the book itself not read)
4. Aastha Atray Banan, "Neverending Tinkle Times", Open, 18 Dec 2013. https://openthemagazine.com/art-culture/neverending-tinkle-times (checked)
5. Austin Kleon, "Silhouettes and profiles", 28 Aug 2007, transcribing Matt Groening on Bob Dylan's radio show. https://austinkleon.com/2007/08/28/silhouettes-and-profiles/ (checked; a transcription, so second hand)
6. Wikipedia, "Simpson family". https://en.wikipedia.org/wiki/Simpson_family (checked)
7. Charles Merritt Houghton, "Character Comparison Charts", 18 Nov 2024. https://cmerritthoughton.substack.com/p/character-comparison-charts-establishing (checked)
8. BINUS University, "Designing Characters with Personality: From Sketch to Screen", 4 Nov 2025. https://binus.ac.id/bandung/dkv/2025/11/04/designing-characters-with-personality-from-sketch-to-screen (checked; the abstract only)
9. Toon Boom, Harmony 20 documentation, "About Palettes". https://docs.toonboom.com/help/harmony-20/premium/colour/about-palette.html (checked)
10. Wikipedia, "Chacha Chaudhary" (dress, Sabu, the saying, Pran's inspiration). https://en.wikipedia.org/wiki/Chacha_Chaudhary (checked)
11. Samanth Subramanian, "Letter from Delhi: Remembering India's Walt Disney", The National, 8 Aug 2014. https://thenationalnews.com/world/letter-from-delhi-remembering-india-s-walt-disney-1.578632 (checked)
12. Wikipedia, "Shikari Shambu". https://en.wikipedia.org/wiki/Shikari_Shambu (checked)
13. Sowmya Rajendran, "How Tinkle magazine remains in the hunt much like Shikari Shambu", The News Minute, 21 Sep 2016. https://www.thenewsminute.com/features/how-tinkle-magazine-remains-hunt-much-shikari-shambu-savio-mascarenhas-tells-us-50214 (checked)
14. Wikipedia, "Nagraj". https://en.wikipedia.org/wiki/Nagraj (checked)
15. P. Sinha and T. Poggio, "'United' we stand", Perception 31 (2002) 133, on their 1996 Nature illusion. https://web.mit.edu/sinhalab/Papers/Bush_Cheney.pdf (checked)
16. Clip Studio, "Simplifying Characters for Webtoons". https://www.clipstudio.net/how-to-draw/archives/166899 (checked)
17. Wikipedia, "Todd Klein", quoting Klein on the Sandman lettering. https://en.wikipedia.org/wiki/Todd_Klein (checked)
18. Wikipedia, "Ram Waeerkar". https://en.wikipedia.org/wiki/Ram_Waeerkar (checked)
19. Wikipedia, "Suppandi". https://en.wikipedia.org/wiki/Suppandi (checked)
20. Wikipedia, "Amar Chitra Katha". https://en.wikipedia.org/wiki/Amar_Chitra_Katha (checked; nothing found there or elsewhere on how its faces were kept consistent)
21. Wikipedia, "List of Sarabhai vs Sarabhai characters". https://en.wikipedia.org/wiki/List_of_Sarabhai_vs_Sarabhai_characters (checked)
22. John Pistelli, review of E. M. Forster, *Aspects of the Novel*, 19 May 2020. https://johnpistelli.com/2020/05/19/e-m-forster-aspects-of-the-novel/ (checked; a summary of the book, not the book)
23. Encyclopedia.com, "Aspects of the Novel". https://www.encyclopedia.com/arts/culture-magazines/aspects-novel (checked; a summary)
24. Dramatica forum, "Character dimensions: McKee vs Dramatica", quoting Robert McKee's *Story*. https://discuss.dramatica.com/t/character-dimensions-mckee-vs-dramatica/1290 (checked; the quotation is second hand)
25. NPR, "You Should Watch The Way You Punctuate Your Text Messages: Period", 20 Dec 2015, on Klin's Binghamton study. https://www.npr.org/sections/alltechconsidered/2015/12/20/459485722/you-should-watch-the-way-you-punctuate-your-text-messages-period (checked)
26. Retake, `knowledge/ux/personas.md` (P2, P5, P6; typing habits marked as assumptions there). (checked)
27. "Audit & Repair: An Agentic Framework for Consistent Story Visualization in Text-to-Image Diffusion Models", arXiv 2506.18900. https://arxiv.org/html/2506.18900v1 (checked)
28. Rassin et al., "Linguistic Binding in Diffusion Models" (SynGen), arXiv 2306.08877. https://arxiv.org/abs/2306.08877 (checked: the abstract)
29. Black Forest Labs, "Character & Style Consistency". https://docs.bfl.ai/guides/usecases_editing_character_consistency (checked)
30. Black Forest Labs, "FLUX.2 overview" (klein: up to 4 references; 4B Apache 2.0, 9B non-commercial; base models for LoRA training). https://docs.bfl.ai/flux_2/flux2_overview (checked)
31. Hugging Face model API, black-forest-labs/FLUX.2-klein-base-4B and FLUX.2-klein-4B (file sizes, licence, not gated), read 26 Oct 2026. https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B (checked)

**Local sources read:** `content/drafts/saal-bhar-2026-10-26/bible.md`; `knowledge/story/saal-bhar-draft-2026-10-26.md`; `knowledge/story/ground-rules-draft-2026-10-25.md` (owner answers 6 to 9, rules 3, 9 to 11, 30, 33, 37, 38, 62, 65, 66); `design-system/art/cutscenes.py` (`STYLE`, `LOOKS`, `ROLE`, `REFS`, `paint_ref`, `paint_refs`); `design-system/art/portraits.py` (`DOTS`, `SEED_BUMP`, `FAMILY`); `design-system/art/wides.py` (`STYLE`); `design-system/assets/*-anita|arjun|kamla|salim.webp(.json)`; `knowledge/story/people.md`; `knowledge/content/cast.md`; `knowledge/architecture/webtoon-bubble-spec-draft-2026-10-25.md`; the mflux 0.19.1 READMEs installed under `~/.local/share/uv/tools/mflux/`; the memory notes `flux-portrait-biases`, `painter-glossary-rule`, `mac-memory-limit`.

**Looked for and not found:** an Amar Chitra Katha style guide or model-sheet practice; a published TV series bible's "never says" list (one fan copy of a writers' guide was behind a browser check); any figure for FLUX.2 klein LoRA training memory or time on a Mac.
