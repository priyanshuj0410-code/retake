"""The cast: one style, one uniform, one backdrop, one skin tone; slot-specific face, hair, age and glasses.

Within a slot the woman and the man share every word except the sex noun, the hairstyle and (men only) facial hair.
Seeds are shared too: candidate k of slot s uses the same seed for both sexes.
"""
STYLE = ("Comic book panel art: bold black ink outlines, halftone dot shading in the shadows, flat colours, "
         "plain flat pale lavender background, no text, no letters, no speech bubble, no border.")

PERSON = ("Close-up head-and-shoulders headshot of one Indian {sex}, about {age} years old, {face}, {hair}{glasses}{facial}, "
          "medium brown skin, neutral expression with a slight closed-mouth smile, looking straight at the viewer, "
          "centred, the head large and filling the upper two-thirds of the frame, cropped at the upper chest, shoulders square to the viewer, hands out of frame. Wearing a plain deep violet short-collared work "
          "polo shirt with no pocket, the warehouse staff uniform, with a yellow lanyard around the neck holding a blank white ID "
          "card. Smooth even skin with light linework on the face. Bare forehead, no jewellery, no makeup, no head "
          "covering. ")

# slot: age, face, woman's hair, man's hair, glasses (both sexes), man's facial hair ("" = clean-shaven)
# glasses x facial hair is a balanced 2x2: both s4 s7; glasses only s3 s5; facial hair only s2 s6; neither s1 s8
SLOTS = {
    "s1": dict(age=30, face="an oval face", w="long straight black hair worn loose past the shoulders with a centre parting",
               m="short neat black hair with a side parting", glasses=False, facial=""),
    "s2": dict(age=34, face="a round face", w="black hair pulled up into a high top bun",
               m="short cropped black hair with closely trimmed sides", glasses=False, facial="a neatly trimmed moustache"),
    "s3": dict(age=32, face="a long narrow face", w="long black hair in a single plait over one shoulder",
               m="wavy black hair of medium length swept back", glasses=True, facial=""),
    "s4": dict(age=36, face="a heart-shaped face", w="shoulder-length wavy dark brown hair",
               m="short curly dark brown hair", glasses=True, facial="a short neatly trimmed full beard"),
    "s5": dict(age=29, face="a round face with full cheeks", w="black hair tied back in a low ponytail",
               m="short textured black hair brushed up at the front", glasses=True, facial=""),
    "s6": dict(age=38, face="an angular face with high cheekbones", w="a short black pixie cut",
               m="a very short black buzz cut", glasses=False, facial="a neatly trimmed moustache"),
    "s7": dict(age=33, face="an oval face with a broad forehead", w="curly shoulder-length black hair",
               m="medium-length wavy black hair with a side parting", glasses=True, facial="a short neatly trimmed full beard"),
    "s8": dict(age=37, face="a soft square face", w="dark brown hair in a low bun with a side parting",
               m="short dark brown hair combed back", glasses=False, facial=""),
}
SEX = {"w": "woman", "m": "man"}
CANDIDATES = 3
SIZE = 512
STEPS = 4


def seed(slot, k):
    return 7000 + int(slot[1:]) * 10 + k


def person_prompt(slot, sex):
    s = SLOTS[slot]
    glasses = ", wearing thin dark-rimmed glasses" if s["glasses"] else ", no glasses"
    facial = (", " + s["facial"]) if (sex == "m" and s["facial"]) else ""
    return PERSON.format(sex=SEX[sex], age=s["age"], face=s["face"], hair=s[sex], glasses=glasses, facial=facial) + STYLE


ANIMALS = ["bear", "panda", "frog", "koala", "elephant", "penguin", "rabbit", "tiger"]
MASCOT = ("Head-and-shoulders portrait of a friendly cartoon {animal} mascot, the whole head and both ears inside the "
          "frame with a clear margin of background above and beside the head, cropped at the upper chest, simple rounded shapes, moderate detail, calm friendly expression with a slight smile, looking "
          "straight at the viewer, centred, no clothes, no accessories. ")
MASCOT_CANDIDATES = 2


def mascot_seed(i, k):
    return 9000 + i * 10 + k


def mascot_prompt(animal):
    return MASCOT.format(animal=animal) + STYLE


# Round two (owner, 19 Oct): the tiger came out head-only and the penguin and frog with no neck, unlike the bear,
# panda and koala. Same frame plus one sentence asking for a bust: head on a neck, shoulders, upper chest.
BUST = {
    "tiger": "Draw it as a bust: the head sits on a short neck, with the rounded shoulders and upper chest of its "
             "striped body visible at the bottom of the frame. Only a few simple stripes. ",
    "penguin": "Draw it as a bust: a round head clearly separate from the body, with a visible neck line and rounded "
               "shoulders, the upper chest at the bottom of the frame. ",
    "frog": "Draw it as a bust: the head sits on a short neck, with clearly rounded shoulders and the upper chest at "
            "the bottom of the frame. ",
}
BUST_CANDIDATES = (2, 3, 4)


def bust_prompt(animal):
    return MASCOT.format(animal=animal) + BUST[animal] + STYLE


def jobs(only=None, groups=("cast", "mascots")):
    """GROUP cast is the cast of the story in PORTRAIT_STORY (story.py): the warehouse by default."""
    out = []
    if "cast" in groups and not story.WAREHOUSE:
        out += story_cast_jobs(story.STORY)
    for k in (range(CANDIDATES) if "cast" in groups and story.WAREHOUSE else []):
        for slot in SLOTS:
            for sex in SEX:
                out.append(dict(id=f"{slot}-{sex}-c{k}", kind="person", slot=slot, sex=sex, cand=k,
                                seed=seed(slot, k), prompt=person_prompt(slot, sex)))
    for k in (range(MASCOT_CANDIDATES) if "mascots" in groups else []):
        for i, a in enumerate(ANIMALS):
            out.append(dict(id=f"mascot-{a}-c{k}", kind="mascot", animal=a, cand=k, seed=mascot_seed(i, k),
                            prompt=mascot_prompt(a)))
    if "mascots2" in groups:
        for k in BUST_CANDIDATES:
            for a in BUST:
                out.append(dict(id=f"mascot-{a}-c{k}", kind="mascot", animal=a, cand=k,
                                seed=mascot_seed(ANIMALS.index(a), k), prompt=bust_prompt(a)))
    if "oneoffs" in groups:
        out += oneoff_jobs()
    return [j for j in out if not only or j["id"] in only]


# ---- one-off characters (slots 100 and up) ----
# The game draws their sex per player (session.ts sexDraw), so every slot gets a woman and a man. Their tone is the
# constant medium tone. Slot order follows the order of the oneoff beats in content/story.json: a rank beat makes a
# caste pair then a birthplace pair (focal first), a pick beat one pair (focal first), a split beat a third person
# then a pair. All one-offs come from outside the warehouse team and wear one plain shirt, the same for everyone.
import json as _json
import os as _os

import story

ONEOFF_PERSON = PERSON.replace(
    "Wearing a plain deep violet short-collared work polo shirt with no pocket, the warehouse staff uniform, with a "
    "yellow lanyard around the neck holding a blank white ID card.",
    "Wearing a plain mid-grey collared button-up shirt with no pocket, nothing around the neck.")
assert ONEOFF_PERSON != PERSON
ONEOFF_HAIR = {
    "w": ["chin-length straight black hair in a bob", "long wavy black hair worn loose",
          "black hair in a side plait over one shoulder", "black hair in a neat high ponytail",
          "short layered black hair", "long black hair half tied back",
          "black hair in a twisted low knot", "shoulder-length straight black hair tucked behind the ears"],
    "m": ["short wavy black hair", "a neat black crew cut", "short black hair with a quiff",
          "medium-length straight black hair parted in the middle", "short black hair with faded sides",
          "thick short black hair brushed forward", "short black hair combed to the side",
          "short tousled black hair"],
}
FACES = [s["face"] for s in SLOTS.values()]
AGES = [30, 33, 36, 29, 35, 32, 38, 31, 34, 37, 28, 40]
FACIAL = ["", "a neatly trimmed moustache", "a short neatly trimmed full beard"]
# one-offs re-rolled once (seed + 1) because the first draw put a dot between the brows that reads as a bindi;
# the first draws are kept in work/rejected/
ONEOFF_RESEED = {"o133-w": 1, "o139-w": 1, "o142-w": 1}
ONEOFF_LIMIT = None  # all 44 (the cap of 20 applied only if compute would pass ~3 hours; at ~30 s an image it does not)


def oneoff_slots(story_path=None):
    """[(slot, beat id, group kind, role, group index)] from the story's oneoff beats, in the order the game uses."""
    story_path = story_path or _os.path.join(_os.path.dirname(__file__), "..", "..", "content", "story.json")
    beats = _json.load(open(story_path))["stories"][0]["beats"]
    out, slot, g = [], 100, 0
    for b in beats:
        if b.get("shape") != "oneoff":
            continue
        groups = {"rank": [["focal", "comparison"], ["focal", "comparison"]], "pick": [["focal", "comparison"]]}.get(
            b["kind"], [["third"], ["focal", "comparison"]])
        for grp in groups:
            for role in grp:
                out.append(dict(slot=slot, beat=b["id"], who=b.get("oneoff"), role=role, group=g))
                slot += 1
            g += 1
    return out


def oneoff_look(o):
    i, g = o["slot"] - 100, o["group"]
    return dict(age=AGES[g % len(AGES)], face=FACES[(i * 5 + 1) % 8], w=ONEOFF_HAIR["w"][(i * 3) % 8],
                m=ONEOFF_HAIR["m"][(i * 3 + 1) % 8], glasses=(g % 3 == 0), facial=FACIAL[g % 3])


def oneoff_prompt(o, sex):
    s = oneoff_look(o)
    glasses = ", wearing thin dark-rimmed glasses" if s["glasses"] else ", no glasses"
    facial = (", " + s["facial"]) if (sex == "m" and s["facial"]) else ""
    return ONEOFF_PERSON.format(sex=SEX[sex], age=s["age"], face=s["face"], hair=s[sex], glasses=glasses,
                                facial=facial) + STYLE


def oneoff_jobs():
    out = []
    for o in oneoff_slots()[:ONEOFF_LIMIT]:
        for sex in SEX:
            oid = f"o{o['slot']}-{sex}"
            out.append(dict(id=oid, kind="oneoff", sex=sex, cand=0,
                            seed=8000 + (o["slot"] - 100) * 10 + ONEOFF_RESEED.get(oid, 0),
                            prompt=oneoff_prompt(o, sex), **{k: o[k] for k in ("slot", "beat", "who", "role", "group")}))
    return out


# ---- the casts of the other stories (owner, 20 Oct 2026: every story gets its own cast of 8, towards about 10) ----
# Same frame, style, backdrop, base tone, expression and candidate count as the warehouse; only the uniform (one for
# the whole story) and the slot looks change. Within a slot the woman and the man again share every word except the
# sex noun, the hairstyle and (men only) facial hair, and they share the seed. Glasses x facial hair is a balanced 2x2
# across each story's slots, arranged differently from the warehouse. Facial hair is 2 moustaches and 2 short beards.
WAREHOUSE_UNIFORM = ("Wearing a plain deep violet short-collared work polo shirt with no pocket, the warehouse staff "
                     "uniform, with a yellow lanyard around the neck holding a blank white ID card.")
assert WAREHOUSE_UNIFORM in PERSON


def L(age, face, w, m, glasses, facial=""):
    return dict(age=age, face=face, w=w, m=m, glasses=glasses, facial=facial)


MOUSTACHE, BEARD = "a neatly trimmed moustache", "a short neatly trimmed full beard"
STORY_CASTS = {
    # a plain shirt with a press lanyard; mid-blue keeps clear of the lavender backdrop and of the skin hue window
    "newsroom": dict(
        seed=11000,
        uniform=("Wearing a plain mid-blue collared button-up shirt with no pocket, the newsroom staff dress, with a "
                 "green lanyard around the neck holding a blank white press card."),
        # both: s2 s7; glasses only: s4 s5; facial hair only: s1 s6; neither: s3 s8
        slots={
            "s1": L(31, "a heart-shaped face", "a sleek chin-length black bob", "short black hair with a quiff", False, MOUSTACHE),
            "s2": L(36, "a soft square face", "black hair in a neat French braid down the back", "a neat black crew cut", True, BEARD),
            "s3": L(28, "an oval face", "shoulder-length straight black hair tucked behind the ears",
                    "medium-length straight black hair parted in the middle", False),
            "s4": L(34, "an angular face with high cheekbones", "black hair in a high ponytail",
                    "short black hair with faded sides", True),
            "s5": L(30, "a long narrow face", "long straight black hair worn loose with a side parting",
                    "thick short black hair brushed forward", True),
            "s6": L(39, "a round face", "short layered black hair", "short tousled black hair", False, BEARD),
            "s7": L(33, "an oval face with a broad forehead", "black hair in a twisted low knot", "short wavy black hair", True, MOUSTACHE),
            "s8": L(37, "a round face with full cheeks", "dark brown hair half tied back",
                    "short dark brown hair combed to the side", False),
        }),
    # scrubs, not a white coat: a coat reads as doctor and scrubs do not, so role (doctor or nurse) is not cued by sex;
    # no stethoscope for the same reason. Teal keeps clear of the backdrop and the skin hue window.
    "clinic": dict(
        seed=12000,
        uniform=("Wearing a plain teal medical scrubs top with a short V-neck and no pocket, the clinic staff uniform, "
                 "with a navy blue lanyard around the neck holding a blank white ID badge."),
        # both: s1 s6; glasses only: s3 s8; facial hair only: s4 s5; neither: s2 s7
        slots={
            "s1": L(35, "a round face", "black hair in a neat low bun", "short black hair with a neat side parting", True, BEARD),
            "s2": L(29, "an angular face with high cheekbones", "a short black crop with a side fringe", "a black buzz cut", False),
            "s3": L(39, "a soft square face", "long black hair in a single braid down the back", "short curly black hair", True),
            "s4": L(32, "an oval face", "chin-length wavy black hair", "short black hair swept back", False, MOUSTACHE),
            "s5": L(30, "a heart-shaped face", "black hair in a high bun", "short black hair with a fringe brushed forward", False, BEARD),
            "s6": L(37, "a long narrow face", "shoulder-length straight black hair with a centre parting",
                    "medium-length black hair tucked behind the ears", True, MOUSTACHE),
            "s7": L(33, "a round face with full cheeks", "black hair tied back in a short ponytail", "short spiky black hair", False),
            "s8": L(34, "an oval face with a broad forehead", "dark brown curly hair tied back", "short wavy dark brown hair", True),
        }),
}
# candidates re-rolled (seed + 100 x n): a forehead dot that reads as a bindi, or facial hair the slot does not have.
# The first draws stay in that story's work/stories/<story>/rejected/, logged under "rejected" in its generation log.
STORY_RESEED = {"newsroom": {"s2-w-c0": 1, "s7-w-c1": 1, "s7-w-c2": 1, "s5-m-c2": 1}, "clinic": {"s8-w-c0": 1}}


def story_prompt(st, slot, sex):
    c = STORY_CASTS[st]
    s = c["slots"][slot]
    glasses = ", wearing thin dark-rimmed glasses" if s["glasses"] else ", no glasses"
    facial = (", " + s["facial"]) if (sex == "m" and s["facial"]) else ""
    frame = PERSON.replace(WAREHOUSE_UNIFORM, c["uniform"])
    return frame.format(sex=SEX[sex], age=s["age"], face=s["face"], hair=s[sex], glasses=glasses, facial=facial) + STYLE


def story_cast_jobs(st):
    c, out = STORY_CASTS[st], []
    for k in range(CANDIDATES):
        for slot in c["slots"]:
            for sex in SEX:
                cid = f"{slot}-{sex}-c{k}"
                out.append(dict(id=cid, story=st, kind="person", slot=slot, sex=sex, cand=k,
                                seed=c["seed"] + int(slot[1:]) * 10 + k + 100 * STORY_RESEED[st].get(cid, 0),
                                prompt=story_prompt(st, slot, sex)))
    return out
