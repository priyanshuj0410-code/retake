---
type: reference
title: Situations, places and eras
description: The places, eras, events and art styles of Retake's story, and the recurring objects. Each memory is one event on one day, painted in the popular art of its year. Read before setting a scene or painting a panel.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-18/
---

# Situations, places and eras

Years and ages are in [timeline.md](timeline.md); people are in [people.md](people.md).

## The places

| Place | What it is | Used in |
|---|---|---|
| **Manmad junction** | A busy railway junction about 70 km from Nashik: the crew lobby, the running shed, the yard, the platform, the signal cabin | 1971 |
| **The Kasara ghat road** | The hill road down to Mumbai: hairpin bends, a roadside shrine light, dhabas, rain | 1977 |
| **Bauji's depot** | A truck yard at the foot of the ghat: four trucks, an office with a logbook, a chai stall at the gate | 1977 |
| **The Purana Maidan, Nashik Road** | The old ground. The winter fair camps on it, and the club plays on it. The tin scoreboard stands under the neem tree | 1984, 1992 |
| **The family flat, Nashik Road** | Two rooms and a balcony. The TV on a lace-covered table, Badi Amma's chair, the kitchen, the loft above the door | 1999 |
| **Vikram's flat, Nashik** | A newer flat with a store room where the trunk is put | 2026 frame |

## The eras and their art

A memory is painted in the popular art of its year. That is the whole reason the worlds look different, and why each transition is time travel.

| Era | World | Art (the style prompt lives in `design-system/art/`) | Signature colour |
|---|---|---|---|
| 1971 | Station | A railway poster screen print: enamel blue and black on cream, halftone, misregistration | Enamel blue |
| 1977 | Lugdi | A pulp-novel cover in gouache: night violet, vermilion, marigold | Vermilion |
| 1984 | Jadugar | A travelling-show chromolithograph: indigo, vermilion, gold | Gold |
| 1992 | Cricket | A sports-magazine centre spread: outfield greens, chalk, cherry red | Cherry red |
| 1999 | Rukavat | A family-magazine illustration in flat gouache, and the Doordarshan screen with its interruption slide | Teal and one signal orange |
| 2026 | The frame | **New:** a modern Indian graphic-novel look: clean ink lines, soft flat colour, warm lamplight. Calm, so the five eras pop against it | Warm lamplight |

The 2026 style needs a prompt and a test sheet before any frame panel is painted.

## The five events (one day each)

1. **1971, "The week the new engines came".**
   - The new engines arrive at Manmad. The steam crews must be retrained, and Mohan fears for his trade. The first run to Bhusawal leaves on Friday at dawn.
   - **The day's stakes:** who drives, who trains and who rises, as the old work ends.
   - *(fact-check: the engine type and year on this section; until checked, say "the new engines".)*
2. **1977, "Onion season".**
   - The harvest must go up the ghat to Mumbai in the monsoon, and there has been a run of highway robberies.
   - **The day's stakes:** who drives the dangerous night runs, whose warnings are believed, and who is blamed when a truck is scraped.
3. **1984, "The magician's cash box".**
   - The Chandni Mandal's last week at the winter fair. On the last night the cash box is short, and the troupe leaves for the next town at dawn.
   - **The day's stakes:** whom to believe, whom to trust with money and keys, and who gets the star slot.
4. **1992, "The final".**
   - The Nashik Road club against the mill team. The club picks its side, its order and its captain in one evening, and plays on Sunday.
   - **The day's stakes:** who leads, who bats where, and who is rested or kept.
5. **1999, "The World Cup and a wedding".**
   - Rani's wedding is being fixed, the flat is full of relatives, and the World Cup is on TV.
   - **The day's stakes:** who does what at home, who gets the TV, who goes to the wedding talks, and who the children live with when a cousin separates.
   - *(fact-check: name no match or result until checked.)*

## The trunk and its keepsakes

| Keepsake | Opens | Detail |
|---|---|---|
| Asha's first railway pass, 1970 | 1971 | Card, stamped, her young photo |
| A dog-eared pulp novel from a ghat dhaba | 1977 | Its painted cover is the memory's first frame |
| A Chandni Mandal ticket stub | 1984 | Printed in gold on red card |
| A scorecard in Vikram's handwriting | 1992 | Pencil and smudges |
| Rani's wedding card | 1999 | Red and gold |
| Asha's diary, kept since 1966 | The finale | A cloth-bound book, many volumes in one bundle |

The trunk itself is Asha's wedding trunk of 1973, an Indian steel storage trunk, painted maroon. Ramesh painted two parrots facing each other on the lid that year, in a border of vines. It carries no letter or name, because paintings carry no readable text. Its full look for every painting is in "The painter's glossary" below.

## The painter's glossary

**The rule** (owner, 23 Oct 2026: "Define the trunk in more detail so it comes out consistent in the illustrations. Make that a rule everytime you are using words that have multiple meanings"):

- Every keepsake and every recurring thing has one fixed look, written here once.
- Every word in a panel's "What is painted" that can mean more than one thing is defined here, with what it means in a painting. For example, "trunk" has been painted as a tree trunk and as a car boot.
- `design-system/art/cutscenes.py` adds each definition to every prompt that names the thing, the way it adds a person's look.
- It refuses to paint a panel whose description holds a word from the list below that no definition covers, and names the word.
- **Names never reach the painter.** A name in a prompt is painted as writing: "BAUJI" across the novel's cover and "VIKRAM" across the scoreboard (23 Oct 2026). The script names people; the prompt swaps each name for a role ("the grandmother", "the boy", "the coach") and adds the person's look, and refuses two people with the same role in one panel.
- **A definition names nobody and nothing readable.** "For a travelling magic show" printed those words on the ticket, and "winter" brought snow to Nashik. `python3 art/cutscenes.py check` lists them all.
- A new panel that needs a new meaning gets its row here first.

Definitions describe what to paint, never what not to paint: naming the wrong thing in a prompt draws it.

| Words | In a painting |
|---|---|
| trunk, tin trunk, storage trunk, tin storage trunk | The trunk is an old Indian steel storage trunk of the kind kept under a bed: a plain rectangular box about a metre long and half a metre high with a flat lid, painted deep maroon, the paint chipped to bare grey steel along the edges with spots of rust, brass caps on all eight corners, one brass hasp with a small brass padlock in the middle of the front, and a folding iron handle on each short end, none on the front. On top of the lid a thin pale yellow border of leafy vines runs round the edge, and in the middle two small green parrots face each other on one branch. The inside of the lid is plain maroon, and a faded flowered cotton lining covers the inside. |
| railway pass, pass | The railway pass is a small folded buff cardboard pass with a round violet rubber stamp and a tiny black-and-white passport photo of a young woman with a plait. |
| pulp novel, novel | The pulp novel is a thin, dog-eared 1970s Indian paperback whose painted cover shows a lorry on a mountain road at night. |
| painted cover, cover | The painted cover is the front of the pulp novel. |
| ticket stub, stub | The ticket stub is a torn ticket of red card printed with a pattern of small gold stars. |
| scorecard, pencil scorecard | The scorecard is a sheet of ruled paper in a worn cardboard folder, filled with columns of smudged pencil marks. |
| wedding card | The wedding card is a folded Indian wedding invitation, deep red with a gold paisley border. |
| cloth-bound diary, diary | The diary is a thick book bound in faded blue cloth, tied with string, its pages swollen with use. |
| handwriting | The handwriting is lines of small, unreadable ink script. |
| steel watch, watch | The watch is a plain steel wristwatch on a steel strap. |
| tempo | The tempo is a small boxy Indian goods van in the old Matador style: a pale blue body with a cream roof and a thin green stripe, a short flat nose with round headlamps and a square grille, wide windows, and its side door slid open on cardboard boxes stacked inside (owner, 23 Oct 2026: the opening's third try "looks correct"). |
| flat | The flat is a home in a small Indian apartment building. |
| Dadi's room, floor | The room is a bedroom in the family's Nashik flat in 2026: a smooth grey cement floor, pale blue-grey walls, a window streaked with rain, and one warm lamp. |
| TV room | The TV room is a crowded 1999 Indian sitting room, a television on a wooden cabinet and mattresses along the walls. |
| platform | The platform is a railway station platform under a tin canopy on iron pillars. |
| crew board | The crew board is a wooden wall board in the station office with rows of brass hooks and blank wooden name tags. |
| steam shed, shed gate, shed | The shed is a railway engine shed: a long brick building with tall arched doors and rails running inside. |
| new engine, new engines | The new engine is a boxy modern locomotive with a flat front, a long box-shaped body and no chimney. |
| steam engine, steam engines | The steam engine is a black steam locomotive with a tall chimney and big spoked wheels. |
| tin box | The tin box is a small dented steel box for a worker's belongings, carried by its handle. |
| depot | The depot is a family truck yard: a muddy open yard with a tin-roofed shelter and parked lorries. |
| trucks, truck, lorries, lorry | The trucks are 1970s Indian goods lorries, each with a rounded bonnet in front of the cab and a tall wooden cargo body painted in bright folk patterns. |
| onion sacks | The onion sacks are bulging jute sacks full of onions, one open with onions spilling out. |
| at the wheel, wheel | At the wheel means driving a lorry, both hands on the steering wheel in the cab. |
| driver's cap, cap | The driver's cap is a soft peaked cloth cap. |
| driver's seat, seat | The driver's seat is the bench seat in a lorry's cab, seen through the open door. |
| winter fair, fair | The fair is a small-town Indian fairground on a dry, dusty winter night, with stalls, strings of bulbs and a striped tent. |
| banner | The banner is a long painted cloth banner of stars and swirling flourishes. |
| cash box, tin cash box | The cash box is a small grey tin box with a hinged lid and a carrying handle. |
| stool | The stool is a low wooden stool for sitting on. |
| stage boards | The stage boards are the wooden planks of a raised show stage, with a dark gap underneath. |
| tin scoreboard, scoreboard | The scoreboard is a painted tin cricket scoreboard on two wooden legs, with rows of hooks holding blank white number plates. |
| scorer's bench, bench | The scorer's bench is a wooden bench at a small table beside the cricket field. |
| padding up | Padding up means strapping white cricket batting pads onto the legs. |
| batting pads | The batting pads are white cricket leg guards strapped over the shins; only the batter wears them. |
| stands | The stands are rows of wooden spectator benches beside a small cricket field. |
| flask | The flask is a steel thermos flask of tea. |
| pavilion | The pavilion is a small cricket club house with a deep veranda. |
| team sheets | The team sheets are two handwritten paper lists of players. |
| match | The match is a cricket match on the television screen. |
| interruption slide | The interruption slide is the television screen frozen on one still card of soft coloured vertical bars, the sign of a broadcast break. |
| TV, television | The TV is a boxy 1990s Indian colour television with a curved glass screen and wood-grain sides, on a wooden cabinet. |
| garland | The garland is a string of orange marigolds. |
| police post | The police post is a small one-room police outpost with a wooden desk and a lamp. |
| statement | The statement is a single handwritten sheet of paper. |

**Words that need a definition:** trunk, room, floor, TV, engine, truck, sack, pass, novel, cover, stub, card, diary, watch, tempo, flat, platform, board, boards, shed, box, depot, wheel, cap, seat, fair, stage, stool, scoreboard, bench, padding, pads, stands, flask, pavilion, sheet, sheets, match, slide, post, statement, run, ground, pitch, bat.

## Things that stay true in every scene

- No religious symbols or festivals named. The fair is "the winter fair".
- No political posters, parties or strikes.
- No readable text in paintings: numbers, signs and plates stay blank, as every prompt says.
- A thing with one fixed look, and a word with more than one meaning, takes its definition from "The painter's glossary".
- Rain belongs to 1971 and 1977, the monsoon years. 1984 is a winter night. 1992 is a hot Sunday. 1999 is June. 2026 is a rainy evening.
