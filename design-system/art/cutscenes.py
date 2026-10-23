"""Paints the comic-strip cutscenes that carry players from last week's world to this week's (owner, 22 Oct 2026:
"Designing comicstrip like cutscenes to take the users from the last week to the current week ... so that its not abrupt").

The thread is an object, not a person: the orange paper kite with three orange bows (Rukavat's slide and cover already
carry it). The image model cannot keep a face the same across styles; a kite reads as the same kite in any style. In
every world the kite is the one orange thing, so the eye follows it from panel to panel.

First proof, Lugdi to Station, four panels:
  1 lugdi   the kite tied to the truck's mirror on the ghat; the string snaps
  2 lugdi   the kite rising over the hairpin bend
  3 seam    one sky painted twice, Lugdi night and Station dawn, joined on a torn-paper edge, the kite on the tear
  4 station the kite caught on a signal arm over the platform as the train comes in

Paint (slow, local FLUX, through the queue):
  ~/.claude/heavy-queue/heavyq run --label "Cutscenes" -- bash -c '~/.local/share/uv/tools/mflux/bin/python art/cutscenes.py paint [prefix]'
  (prefix ls = the kite proof, ft = the First take's cutscenes; sheet takes the same prefix)
Contact sheet of every seed:  python3 art/cutscenes.py sheet
Take out painted extras, then the chosen four as one comic page:  python3 art/cutscenes.py clean; python3 art/cutscenes.py strip
The picks as the app's pictures:  python3 art/cutscenes.py export   (assets/cut-ls-1.webp to 4)\nRaw renders go to art/raw/cut/ (not shipped).
"""
import json, os, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, 'raw', 'cut')
SEEDS = (7100, 7203, 7319)
W, H = 1024, 768

STYLE = {
    'lugdi': (" Painted by one hand in 1970s Indian pulp-novel gouache: thick opaque brushwork, deep night violet and indigo "
              "shadows, hot vermilion and marigold lamp light, painted paper grain, a slightly faded print, dramatic angle."),
    'station': (" A screen print in the style of an old Indian Railways poster: deep enamel blue and black ink on cream paper, "
                "bold flat shapes, coarse halftone dots, slight ink misregistration."),
}
SPOT = " The kite is the only orange in the picture, printed as a third flat spot ink."   # the kite proof's Station panels
sys.path.insert(0, HERE)
from wides import STYLE as WIDE   # the other three worlds paint as their wide scenes do
STYLE.update(jadugar=WIDE['jadugar'], cricket=WIDE['cricket'], rukavat=WIDE['sunday'])
# the story's 1992 panels are paintings (owner, 23 Oct 2026, on the scoreboards: "not illustrations"); the covers' wide
# style, "a magazine centre spread, glossy print", drew photographs. The covers keep theirs.
STORY_STYLE = {'cricket': (" A hand-painted illustration in gouache and ink, like a 1980s Indian children's sports annual: bold inked "
                           "outlines, flat painted colour, deep outfield greens, chalk white and cherry red, visible brush texture on matt paper.")}
KITE = "a small orange diamond-shaped Indian paper kite with a tail of three orange cloth bows"
NO = (" One comic-book panel, full-bleed edge to edge, no border, no frame, no speech bubbles, no people, no faces, no hands. "
      "No text, no letters, no numbers, no words, no signboards, no number plates, no logos, no writing anywhere.")

PANELS = {
    'ls-1': ('lugdi', f"Close view of the side mirror of a red Indian truck on a ghat road at night in heavy monsoon rain, {KITE} "
                      "tied to the mirror by a thin string, the string snapping and the kite tugging free in the wind, headlights in mist."),
    'ls-2': ('lugdi', f"{KITE} rising free into a stormy night sky above a hairpin bend on a ghat road, a broken string trailing "
                      "below it, a tiny red truck with headlights far below on the bend, clouds lit by a roadside oil lamp."),
    'ls-3a': ('lugdi', f"{KITE} small in the exact centre of a wide open sky, flying from left to right, low hills along the "
                       "bottom edge, the sky fills the frame, night with rain clouds."),
    'ls-3b': ('station', f"{KITE} small in the exact centre of a wide open sky, flying from left to right, low hills along the "
                         "bottom edge, the sky fills the frame, early dawn with telegraph wires along the bottom."),
    'ls-4': ('station', f"An Indian railway platform at dawn, cast-iron pillars and a curved canopy, a long train with its "
                        f"headlamp lit arriving, a tall semaphore signal post, {KITE} caught on the signal arm, its tail of bows hanging."),
}


# The First take's cutscenes (owner, 22 Oct 2026: the player stays an unnamed decider; "the story should keep moving so
# the cutscenes would evolve"; the kite is "a weak connection"). One rainy night and the day after, carried by what
# moves between the places: the freight off the closed line, the truck with the show's trunks, the ground the tent
# leaves, the score on the evening news. knowledge/content/story.md has the captions. Each seam is two paintings of one
# composition, <name>a in last chapter's world and <name>b in the next, joined on a torn edge.
PANELS.update({
    'ft-0-1': ('station', "Monsoon rain over a railway junction at night, a long passenger train's headlamp cutting through the rain, red and green signal lamps glowing."),
    'ft-0-2': ('station', "A railway crew lobby at night, a wall board of blank brass name slots with one slot empty, a glass of tea on the counter, rain on the window."),
    # the longer opening (owner, 23 Oct 2026: "a clear, maybe slightly longer cutscene onboarding users into the story"):
    # one panel for each place the night will pass through, each in its own world's style, before the crew board
    'ft-0-3': ('lugdi', "Painted Indian trucks lined up at night at the foot of a ghat road in monsoon rain, headlights on, jute sacks under tarpaulins, the road climbing into the hills behind."),
    'ft-0-4': ('jadugar', "A travelling magic show's striped tent being raised at dusk in a small Indian town square, ropes taut, painted trunks around it, strings of unlit bulbs."),
    'ft-0-5': ('cricket', "An old Indian cricket ground at night in the rain, the pitch under covers, the pavilion lit, a hand-painted tin scoreboard dark under a big neem tree."),
    'ft-0-6': ('rukavat', "An Indian family house at night seen from the street in light rain, one window glowing blue from a television, a scooter parked by the gate."),
    'ft-1-1': ('station', "A goods train halted at a red signal at night in heavy rain, open wagons stacked with jute sacks of onions, a hand lamp held up in the dark, mud on the line ahead."),
    'ft-1-2a': ('station', "A mountain pass at night in rain, a railway line climbing up the left side of the hill and a winding road climbing up the right side, side by side up the same slope, small lights on both."),
    'ft-1-2b': ('lugdi', "A mountain pass at night in rain, a railway line climbing up the left side of the hill and a winding road climbing up the right side, side by side up the same slope, small lights on both."),
    'ft-1-3': ('lugdi', "Jute sacks of onions being loaded onto painted Indian trucks at a roadside depot at night in rain, hurricane lanterns, the ghat road climbing behind."),
    'ft-2-1': ('lugdi', "Painted wooden trunks and a rolled striped tent roped down on the back of an Indian truck at a depot gate at midnight, its headlights on."),
    # what happens, not a visual rhyme: the headlights-into-spotlights panel read as nonsense (owner, 23 Oct 2026: "wtf is
    # this story?"); the same road in both styles, the truck on it carrying the show's rolled tent towards a small town
    'ft-2-2a': ('lugdi', "A painted Indian truck with a rolled striped tent and painted trunks roped on its back, driving along a wet highway at night, the lights of a small town ahead on the right."),
    'ft-2-2b': ('jadugar', "A painted Indian truck with a rolled striped tent and painted trunks roped on its back, driving along a wet highway at night, the lights of a small town ahead on the right."),
    'ft-2-3': ('jadugar', "A small travelling magic show tent glowing at night in a small Indian town, strings of bulbs, rows of empty folding chairs waiting."),
    'ft-3-1': ('jadugar', "A travelling show tent being taken down at dawn on an open dusty ground, poles leaning, the canvas sliding off, painted trunks packed."),
    # one composition in both, as the rail-and-road seam: the first tries drew a lone post, never a wicket (22 Oct 2026)
    'ft-3-2a': ('jadugar', "Close up at ground level on wet earth at dawn: on the left, a wooden tent peg pulled half out of the ground with a slack rope; on the right, a cricket wicket of three upright wooden stumps side by side with two small bails resting across their tops."),
    'ft-3-2b': ('cricket', "Close up at ground level on wet earth at dawn: on the left, a wooden tent peg pulled half out of the ground with a slack rope; on the right, a cricket wicket of three upright wooden stumps side by side with two small bails resting across their tops."),
    'ft-3-3': ('cricket', "An old Indian cricket ground in the morning, a hand-painted tin scoreboard with blank panels under a big neem tree, a heavy roller on the pitch."),
    # said so the model cannot guess: "cup" painted a steel tumbler, and blank plates and a blank screen said nothing of a
    # score or the news (owner, 23 Oct 2026: "the illustrations are wrong")
    'ft-4-1': ('cricket', "A large shining silver cricket trophy with two curved handles and a lid, the winners' trophy, standing on a white plastic chair by the boundary rope of an old cricket ground at sunset, the ground emptying, long shadows."),
    'ft-4-2a': ('cricket', "On the left, an old cricket ground at dusk with a large silver winners' trophy with two handles on a chair by the boundary rope; on the right, an old wooden-cabinet television in a dim family room, its screen showing the same cricket ground and the same trophy."),
    'ft-4-2b': ('rukavat', "On the left, an old cricket ground at dusk with a large silver winners' trophy with two handles on a chair by the boundary rope; on the right, an old wooden-cabinet television in a dim family room, its screen showing the same cricket ground and the same trophy."),
    'ft-4-3': ('rukavat', "An Indian family front room at nine at night, an old television on a lace-covered table, an armchair with a folded shawl and spectacles on the arm, a sofa, glasses of tea."),
    'ft-5-1': ('rukavat', "A house at night after rain, one window still lit, far off a train's lamp crossing a bridge in the distance."),
})


# ---------- "Dadi's trunk": every panel of knowledge/story/first-take-script.md (owner, 23 Oct 2026: "Start painting... I
# need this in the demo"). The script is the one source: each row's era, what is painted and its caption are read from
# it, so a panel changed in review is repainted from the same words. Seams are two paintings of one composition, the
# present day (a) and the era (b), joined on the torn edge. People appear here, so the panels have their own ending.
STYLE['now'] = (" A modern Indian graphic-novel illustration: clean confident ink outlines, soft flat colour fills, warm "
                "lamplight against cool rainy-evening blues, gentle paper grain, calm and intimate.")
ERA = {'1971': 'station', '1977': 'lugdi', '1984': 'jadugar', '1992': 'cricket', '1999': 'rukavat', '2026': 'now'}
STORY_NO = (" One illustration panel, full-bleed edge to edge, no border, no frame, no speech bubbles. No text, no letters, "
            "no numbers, no words, no signboards, no number plates, no logos, no religious symbols, no writing anywhere.")
# the image model keeps no face from panel to panel, so each person is described the same way every time at each age
# (knowledge/story/people.md); "any" is used when a year has no entry of its own
LOOKS = {
    'Dadi': {'any': "a 78-year-old Indian grandmother with white hair in a bun, round spectacles, a grey cardigan over a cotton sari and a steel wristwatch"},
    'Asha': {'1971': "a 23-year-old Indian woman with a thin plait, a plain cotton sari, a small railway badge and a steel wristwatch",
             '1977': "a 29-year-old Indian woman with her hair in a low bun, a cotton sari and a steel wristwatch",
             '1984': "a 36-year-old Indian woman with her hair in a low bun, a cotton sari, a shawl and a steel wristwatch",
             '1992': "a 44-year-old Indian woman with greying hair in a low bun, a cotton sari and a steel wristwatch",
             '1999': "a 51-year-old Indian woman with grey streaks in her hair, spectacles on a chain, a cotton sari and a steel wristwatch"},
    'Vikram': {'1984': "a 6-year-old Indian boy", '1992': "a 14-year-old Indian boy in a too-big school sweater",
               '1999': "a 21-year-old Indian man in a college T-shirt", 'any': "a fit Indian man who looks barely forty, with thick black hair greying only at the temples, a short black beard and smooth skin, in a kurta over jeans"},
    'Meera': {'any': "a 46-year-old Indian woman in a salwar kameez with her hair tied back"},
    'Tara': {'any': "a 22-year-old Indian woman with short hair, a T-shirt and jeans"},
    'Mohan': {'1971': "a 21-year-old Indian man in a fireman's vest with soot on his forearms", 'any': "a 27-year-old Indian man in a driver's cap pushed back"},
    'Ramesh': {'1992': "a 48-year-old Indian man with a greying moustache and a checked shirt", 'any': "a 33-year-old Indian man with a moustache and a checked shirt, sleeves rolled"},
    'Bauji': {'any': "a 57-year-old Indian man with a white moustache, a cap and a ledger"},
    'Badi Amma': {'any': "a 75-year-old Indian grandmother in a white sari"},
    'Pallavi': {'any': "a 22-year-old Indian woman in a sequinned stage costume"},
    'Rani': {'1984': "a 10-year-old Indian girl", '1992': "an 18-year-old Indian woman in cricket whites", 'any': "a 25-year-old Indian woman in a red wedding sari"},
    # the chapters' speakers, as their card portraits draw them (knowledge/content/cast.md)
    'Shirin': {'any': "a 60-year-old Indian woman cricket coach with light brown skin, a short grey bob, a whistle on a cord round her neck and a navy tracksuit jacket"},
    'Kader': {'any': "a 55-year-old Indian magician with brown skin, a trimmed grey beard and a white kurta"},
    'Gurpreet': {'any': "a 35-year-old Indian woman station master with medium brown skin, shoulder-length hair, small spectacles and a plain cotton salwar"},
}
# Names never reach the painter: a name in a prompt is painted as writing ("BAUJI" across the novel's cover, "VIKRAM"
# across the scoreboard; 23 Oct 2026). Each person goes in as a role and the look above; "young Asha" counts as Asha.
ROLE = {'Dadi': 'the grandmother', 'Asha': {'1971': 'the young woman', '1977': 'the young woman', 'any': 'the woman'},
        'Vikram': {'1984': 'the little boy', '1992': 'the boy', '1999': 'the young man', 'any': 'the man'},
        'Meera': 'the woman', 'Tara': 'the young woman', 'Mohan': 'the young man', 'Ramesh': 'the man', 'Bauji': 'the old man',
        'Badi Amma': 'the old woman', 'Pallavi': 'the performer', 'Rani': {'1984': 'the girl', '1992': 'the young cricketer', 'any': 'the bride'},
        'Shirin': 'the coach', 'Kader': 'the magician', 'Gurpreet': 'the station master'}
STORY = set()
SCRIPT = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'knowledge', 'story', 'first-take-script.md')


def story_panels():
    """Every panel row of the script: (id, era, what is painted, caption in English, caption in Hindi); seam rows give
    the era they open into."""
    import re
    out = []
    for line in open(SCRIPT, encoding='utf-8'):
        cells = [c.strip() for c in line.strip().strip('|').split('|')] if line.startswith('| ') else []
        if not cells or not re.fullmatch(r'\d+\.\d+', cells[0]):
            continue
        pid, style, what, cap = (cells[0], '2026', cells[1], cells[2]) if len(cells) == 3 else cells[:4]
        en, _, hi = cap.partition(' / ')
        out.append((pid, style, what, en.strip(), hi.strip()))
    return out


def looks(what, year):
    import re
    found = [n for n in LOOKS if re.search(rf'\b{n}\b', what)]
    return ''.join(f" {n} is {LOOKS[n].get(year) or LOOKS[n]['any']}." for n in found)


def role(n, year):
    r = ROLE[n]
    return r if isinstance(r, str) else r.get(year) or r['any']


def unnamed(text, year):
    """The prompt with every name swapped for its role ("Vikram's pencil" -> "the boy's pencil")."""
    import re
    for n in sorted(ROLE, key=len, reverse=True):
        text = re.sub(rf"(?:\b[Yy]oung )?\b{n}\b", role(n, year), text)
    text = re.sub(r'(^|\. )the ', lambda m: m.group(1) + 'The ', text)
    return text[:1].upper() + text[1:]


def clash(what, year):
    """Two people in one panel who would go in under the same role."""
    import re
    rs = [role(n, year) for n in ROLE if re.search(rf'\b{n}\b', what)]
    return sorted({r for r in rs if rs.count(r) > 1})


# The painter's glossary (knowledge/story/situations.md; owner, 23 Oct 2026: "Define the trunk in more detail so it comes
# out consistent in the illustrations. Make that a rule everytime you are using words that have multiple meanings"):
# each thing's one look, added to every prompt that names it, and the words that may not be painted undefined.
SITUATIONS = os.path.join(os.path.dirname(SCRIPT), 'situations.md')


def glossary():
    """[(phrases, definition)] and the words that need a definition, read from situations.md."""
    import re
    text = open(SITUATIONS, encoding='utf-8').read()
    sec = text.split("## The painter's glossary", 1)[1].split('\n## ', 1)[0]
    rows = [([w.strip() for w in a.split(',')], d.strip()) for a, d in re.findall(r'^\| ([^|]+?) \| ([^|]+?) \|$', sec, re.M)
            if a not in ('Words', '---')]
    need = [w.strip() for w in re.search(r'\*\*Words that need a definition:\*\* ([^\n]+)', sec).group(1).rstrip('.').split(',')]
    return rows, need


GLOSSARY, NEED = glossary()


def _phrase(p):
    import re
    return re.compile(rf"\b{re.escape(p)}(?:s|es)?\b", re.I)


def terms(what):
    """The glossary's definitions for every thing the description names, each once; the longest phrase wins, so "TV room"
    is never also "room"."""
    rest, found = what, set()
    for p, i in sorted(((p, i) for i, (ps, _) in enumerate(GLOSSARY) for p in ps), key=lambda x: -len(x[0])):
        if _phrase(p).search(rest):
            rest = _phrase(p).sub(' ', rest); found.add(i)
    return ''.join(f' {GLOSSARY[i][1]}' for i in sorted(found))


def unclear(what):
    """Words from the need list left in a description once every glossary phrase in it is taken out."""
    import re
    rest = what
    for p in sorted((p for ps, _ in GLOSSARY for p in ps), key=len, reverse=True):
        rest = _phrase(p).sub(' ', rest)
    return sorted({w for w in NEED if re.search(rf'\b{re.escape(w)}\b', rest, re.I)})


WHAT, YEAR = {}, {}   # each story panel's description as the script has it, and its year, for the check
for _pid, _style, _what, _en, _hi in story_panels():
    _key = 'st-' + _pid.replace('.', '-')
    _year = _style.split()[-1]
    YEAR[_key] = _year
    _scene = unnamed(_what.rstrip('.') + '.' + looks(_what, _year), _year) + terms(_what)
    if _style.startswith('seam'):
        for _half, _world in (('a', 'now'), ('b', ERA[_year])):
            PANELS[_key + _half] = (_world, _scene); STORY.add(_key + _half); WHAT[_key + _half] = _what
    else:
        PANELS[_key] = (ERA[_year], _scene); STORY.add(_key); WHAT[_key] = _what


# The family's card faces are painted by portraits.py (FAMILY), with each world's own card template, not here: the
# cutscene style made them wide, coloured shots that stood out on the cards (23 Oct 2026). Their first tries
# stay in raw/cut/pt-*.


def prompt(name):
    world, scene = PANELS[name]
    if name in STORY:
        return scene + STORY_STYLE.get(world, STYLE[world]) + STORY_NO
    return scene + STYLE[world] + (SPOT if world == 'station' and 'kite' in scene else '') + NO


# Things painted from one reference picture (owner, 23 Oct 2026: "The trunk is not consistent still"): words alone let the
# trunk change shape, colour and painting from panel to panel. The reference is painted first (paint-ref) and picked by
# eye into art/refs/ (pick-ref); every panel that names the thing is then painted by FLUX.2 klein's edit model with that
# picture as its reference (paint-refs), and the plain painter leaves those panels alone.
REFS = {'trunk': (('trunk',), os.path.join(HERE, 'refs', 'trunk.png'),
                  "The trunk alone on a smooth grey cement floor, seen from the front and a little above so that the top of its "
                  "lid and its front both show, against a plain pale blue-grey wall.",
                  # what the picture alone did not hold (owner, 23 Oct 2026: "the proportions of the trunk are not correct and
                  # now it only has one parrot"): the size and the two parrots are said in words as well
                  " The trunk is exactly the one in the reference picture: a long, low trunk about twice as long as it is high, "
                  "maroon with chipped grey steel edges and brass corners, a padlock in the middle of the front, a handle on each "
                  "end, and on its lid a vine border with two green parrots.")}


def refs_of(name):
    w = WHAT.get(name, '')
    return [k for k, (ps, _, _, _) in REFS.items() if any(_phrase(p).search(w) for p in ps)]


def ref_prompt(name):
    """The panel's prompt with each referenced thing's long definition swapped for a pointer to its picture."""
    p = prompt(name)
    for k in refs_of(name):
        d = next(d for ps, d in GLOSSARY if k in ps)
        p = p.replace(' ' + d, REFS[k][3])
    return p


def paint_ref():
    """Three tries at each reference picture: raw/cut/ref-<thing>-<seed>.png."""
    import mlx.core as mx
    from mflux.models.common.config import ModelConfig
    from mflux.models.flux2.variants import Flux2Klein
    model = Flux2Klein(quantize=8, model_config=ModelConfig.flux2_klein_4b())
    for k, (ps, _, scene, _) in REFS.items():
        p = scene + terms(scene) + STYLE['now'] + STORY_NO
        for seed in SEEDS:
            out = os.path.join(RAW, f'ref-{k}-{seed}.png')
            if not os.path.exists(out):
                model.generate_image(seed=seed, prompt=p, num_inference_steps=4, width=W, height=H).save(out); mx.clear_cache(); print(out, flush=True)


def pick_ref():
    """pick-ref <thing> <seed>: the chosen try becomes the reference."""
    import shutil
    k, seed = sys.argv[2], sys.argv[3]
    os.makedirs(os.path.dirname(REFS[k][1]), exist_ok=True)
    shutil.copy2(os.path.join(RAW, f'ref-{k}-{seed}.png'), REFS[k][1]); print(REFS[k][1])


def paint_refs():
    """The panels that name a referenced thing, painted by the edit model from its picture."""
    import mlx.core as mx
    from mflux.models.common.config import ModelConfig
    from mflux.models.flux2.variants import Flux2KleinEdit
    todo = [n for n in PANELS if refs_of(n) and any(not os.path.exists(os.path.join(RAW, f'{n}-{s}.png')) for s in SEEDS)]
    missing = sorted({k for n in todo for k in refs_of(n) if not os.path.exists(REFS[k][1])})
    if missing:
        sys.exit('no reference picture yet for: ' + ', '.join(missing) + ' (paint-ref, then pick-ref)')
    model = Flux2KleinEdit(quantize=8, model_config=ModelConfig.flux2_klein_4b())
    logp = os.path.join(RAW, 'log.json'); log = json.load(open(logp)) if os.path.exists(logp) else {}
    for name in todo:
        refs = [REFS[k][1] for k in refs_of(name)]
        for seed in SEEDS:
            key = f'{name}-{seed}'; path = os.path.join(RAW, key + '.png')
            if os.path.exists(path):
                continue
            t = time.time(); p = ref_prompt(name)
            model.generate_image(seed=seed, prompt=p, num_inference_steps=4, width=W, height=H, image_paths=refs).save(path)
            mx.clear_cache(); print(key, round(time.time() - t, 1), flush=True)
            log[key] = dict(seed=seed, prompt=p, references=[os.path.relpath(r, HERE) for r in refs],
                            model=f'FLUX.2 klein 4B edit, 8-bit, mflux, 4 steps, {W}x{H}')
            json.dump(log, open(logp, 'w'), indent=1)


def paint():
    import mlx.core as mx
    from mflux.models.common.config import ModelConfig
    from mflux.models.flux2.variants import Flux2Klein
    os.makedirs(RAW, exist_ok=True)
    only = sys.argv[2] if len(sys.argv) > 2 else ''
    todo = [n for n in PANELS if n.startswith(only) and any(not os.path.exists(os.path.join(RAW, f'{n}-{s}.png')) for s in SEEDS)]
    bad = {n: unclear(WHAT[n]) + clash(WHAT[n], YEAR[n.rstrip('ab')]) for n in todo if n in WHAT and (unclear(WHAT[n]) or clash(WHAT[n], YEAR[n.rstrip('ab')]))}
    if bad:   # a word with more than one meaning, undefined: define it in situations.md's glossary first
        sys.exit('not painted, words with no definition in the glossary: ' + '; '.join(f'{n}: {", ".join(w)}' for n, w in bad.items()))
    model = Flux2Klein(quantize=8, model_config=ModelConfig.flux2_klein_4b())
    logp = os.path.join(RAW, 'log.json'); log = json.load(open(logp)) if os.path.exists(logp) else {}
    only = sys.argv[2] if len(sys.argv) > 2 else ''   # a name prefix, e.g. ft
    for name in [n for n in PANELS if n.startswith(only) and not refs_of(n)]:   # a referenced thing's panels: paint-refs
        for seed in SEEDS:
            key = f'{name}-{seed}'; path = os.path.join(RAW, key + '.png')
            if os.path.exists(path):
                continue
            t = time.time(); img = model.generate_image(seed=seed, prompt=prompt(name), num_inference_steps=4, width=W, height=H)
            img.save(path); mx.clear_cache(); print(key, round(time.time() - t, 1), flush=True)
            log[key] = dict(seed=seed, prompt=prompt(name), model=f'FLUX.2 klein 4B, 8-bit, mflux, 4 steps, {W}x{H}')
            json.dump(log, open(logp, 'w'), indent=1)


def torn(a, b, seed):
    """Joins two paintings on a torn-paper edge running top to bottom near the middle: a on the left, b on the right."""
    import random
    from PIL import Image, ImageDraw, ImageFilter
    rnd = random.Random(seed); w, h = a.size
    xs, x = [], w * 0.5
    for y in range(0, h + 8, 8):
        x = min(w * 0.6, max(w * 0.4, x + rnd.uniform(-9, 9))); xs.append((x + rnd.uniform(-3, 3), y))
    mask = Image.new('L', a.size, 0); ImageDraw.Draw(mask).polygon([(w, 0)] + xs + [(w, h)], fill=255)
    out = Image.composite(b, a, mask)
    # the torn paper shows a thin cream fibre along the edge, as a real tear does
    edge = mask.filter(ImageFilter.MaxFilter(7)); fibre = Image.new('RGB', a.size, (238, 230, 212))
    lip = Image.composite(edge, Image.new('L', a.size, 0), Image.eval(mask, lambda v: 255 - v))
    return Image.composite(fibre, out, lip)


def sheet():
    from PIL import Image, ImageDraw
    only = sys.argv[2] if len(sys.argv) > 2 else ''
    seam = lambda n: n.endswith('a') and n[:-1] + 'b' in PANELS
    rows = [n for n in PANELS if n.startswith(only) and not (n.endswith('b') and n[:-1] + 'a' in PANELS)]
    tw, th = 384, 288
    out = Image.new('RGB', (tw * len(SEEDS) + 16 * (len(SEEDS) + 1), (th + 28) * len(rows) + 16), (233, 230, 223))
    d = ImageDraw.Draw(out)
    for r, name in enumerate(rows):
        for c, seed in enumerate(SEEDS):
            p = os.path.join(RAW, f'{name}-{seed}.png')
            if seam(name):
                q = os.path.join(RAW, f'{name[:-1]}b-{seed}.png')
                if not (os.path.exists(p) and os.path.exists(q)):
                    continue
                im = torn(Image.open(p).convert('RGB'), Image.open(q).convert('RGB'), seed)
                im.save(os.path.join(RAW, f'{name[:-1]}-{seed}.png'))
            elif os.path.exists(p):
                im = Image.open(p).convert('RGB')
            else:
                continue
            x, y = 16 + c * (tw + 16), 16 + r * (th + 28)
            out.paste(im.resize((tw, th), Image.LANCZOS), (x, y + 20))
            d.text((x, y + 4), f'{name[:-1] if seam(name) else name}  seed {seed}', fill=(23, 17, 15))
    path = os.path.join(RAW, f'sheet{"-" + only if only else ""}.png'); out.save(path); print(path)


# the owner's picks from the sheet, 22 Oct 2026 ("1. Left 2. Left 3. Right 4. Left")
PICKS = {'ls-1': 7100, 'ls-2': 7100, 'ls-3': 7319, 'ls-4': 7100}
# the First take's panels, one try each, from the sheet (sheet ft); the owner swaps any of them
PICKS_ST = {'st-0-1': 7319, 'st-0-2': 7100, 'st-0-3': 7203, 'st-0-4': 7203, 'st-0-5': 7100, 'st-0-6': 7203, 'st-0-7': 7100,
            'st-1-1': 7100, 'st-1-2': 7319, 'st-1-3': 7100, 'st-1-4': 7319, 'st-1-9': 7100, 'st-1-10': 7319,
            'st-2-1': 7100, 'st-2-2': 7203, 'st-2-4': 7100, 'st-3-1': 7319, 'st-3-3': 7319, 'st-3-4': 7203, 'st-3-10': 7203,
            'st-4-1': 7100, 'st-4-10': 7203, 'st-5-1': 7319,
            'st-2-9': 7203, 'st-2-10': 7319, 'st-3-2': 7100, 'st-3-9': 7100, 'st-5-10': 7100, 'st-6-9': 7100,
            'st-5-3': 7203, 'st-5-9': 7203, 'st-6-1': 7100, 'st-6-2': 7203,
            'st-6-3': 7319, 'st-6-5': 7100, 'st-6-7': 7203, 'st-6-8': 7100, 'st-5-4': 7319, 'st-6-4': 7203,
            'st-2-3': 7203, 'st-4-2': 7100, 'st-4-3': 7319, 'st-4-4': 7203, 'st-4-9': 7319, 'st-5-2': 7203, 'st-6-6': 7203}   # "Dadi's trunk": a panel's chosen seed once picked from the sheet
PICKS_FT = {'ft-0-1': 7100, 'ft-0-2': 7100, 'ft-0-3': 7319, 'ft-0-4': 7203, 'ft-0-5': 7319, 'ft-0-6': 7100, 'ft-1-1': 7203, 'ft-1-2': 7203, 'ft-1-3': 7319,
            'ft-2-1': 7100, 'ft-2-2': 7203, 'ft-2-3': 7203, 'ft-3-1': 7203, 'ft-3-2': 7319, 'ft-3-3': 7100,
            'ft-4-1': 7100, 'ft-4-2': 7203, 'ft-4-3': 7203, 'ft-5-1': 7203}


# painted extras to take out, as (x range, the side whose sky fills it): the owner kept panel 4's left try, which has a
# second kite and a loose tail on the signal arm (22 Oct 2026, "yes" to painting out the second kite)
REMOVE = {'ls-4-7100': [((460, 660), 'right'), ((660, 735), 'left')]}


def clean():
    """Takes the stray kite out: its orange, grown over the ink edge, is filled row by row from the same row beside it,
    which keeps the sky's fade and halftone dots and carries the signal arm on. Writes <panel>-clean.png beside it."""
    import numpy as np
    from PIL import Image, ImageFilter
    wmax = 80   # a long gap repeats the 80 px beside it, so the fill never reaches the signal post
    for key, cuts in REMOVE.items():
        a = np.asarray(Image.open(os.path.join(RAW, key + '.png')).convert('RGB')).copy()
        r, g, b = (a[..., i].astype(int) for i in range(3))
        orange = (r > 170) & (g > 60) & (g < 200) & (b < 120) & (r - b > 90)
        grown = np.asarray(Image.fromarray((orange * 255).astype('uint8')).filter(ImageFilter.MaxFilter(9))) > 0
        for (x0, x1), side in cuts:
            for y in np.nonzero(grown[:, x0:x1].any(axis=1))[0]:
                xs = np.nonzero(grown[y, x0:x1])[0] + x0
                runs = np.split(xs, np.nonzero(np.diff(xs) > 1)[0] + 1)
                for run in sorted(runs, key=lambda q: q[0], reverse=side == 'right'):
                    lo, hi = run[0], run[-1] + 1; w = min(hi - lo, wmax)
                    if side == 'right':
                        for end in range(hi, lo, -w):
                            st = max(lo, end - w); a[y, st:end] = a[y, st + w:end + w]
                    else:
                        for st in range(lo, hi, w):
                            end = min(hi, st + w); a[y, st:end] = a[y, st - w:end - w]
        Image.fromarray(a).save(os.path.join(RAW, key + '-clean.png'))


def strip():
    """The four picks as one comic page for the owner: 2 x 2, ink gutters, each panel's painted paper margin cropped."""
    from PIL import Image
    pw, ph, g = 720, 540, 18
    page = Image.new('RGB', (2 * pw + 3 * g, 2 * ph + 3 * g), (23, 17, 15))
    for i, (name, seed) in enumerate(PICKS.items()):
        p = os.path.join(RAW, f'{name}-{seed}-clean.png')
        im = Image.open(p if os.path.exists(p) else os.path.join(RAW, f'{name}-{seed}.png')).convert('RGB'); w, h = im.size; m = 0.035
        im = im.crop((int(w * m), int(h * m), int(w * (1 - m)), int(h * (1 - m)))).resize((pw, ph), Image.LANCZOS)
        page.paste(im, (g + (i % 2) * (pw + g), g + (i // 2) * (ph + g)))
    path = os.path.join(RAW, 'strip-lugdi-station.png'); page.save(path); print(path)



def export():
    """The picks as the app's pictures, 800 x 600, each with its prompt and edits embedded: the kite proof as
    assets/cut-ls-<n>.webp, the First take's as assets/cut-<panel>.webp (export ft; run sheet ft first for its seams)."""
    import subprocess
    from PIL import Image
    imp = '/Users/priyanshu/Sex Ed/.claude/skills/impeccable/scripts/impeccable'
    log = json.load(open(os.path.join(RAW, 'log.json')))
    which = sys.argv[2] if len(sys.argv) > 2 else 'ls'
    ft = which in ('ft', 'st')
    if which == 'st':   # only the story panels picked by eye: an unreviewed try never reaches the demo (run sheet st first for the seams)
        names = [n[:-1] if n[-1] in 'ab' and n[:-1] + 'a' in PANELS else n for n in PANELS if n.startswith('st-')]
        picks = {n: PICKS_ST[n] for n in dict.fromkeys(names) if n in PICKS_ST}
    else:
        picks = PICKS_FT if ft else PICKS
    for i, (name, seed) in enumerate(picks.items()):
        if not os.path.exists(os.path.join(RAW, f'{name}-{seed}.png')) and not os.path.exists(os.path.join(RAW, f'{name}-{seed}-clean.png')):
            continue
        cleaned = os.path.join(RAW, f'{name}-{seed}-clean.png')
        im = Image.open(cleaned if os.path.exists(cleaned) else os.path.join(RAW, f'{name}-{seed}.png')).convert('RGB')
        w, h = im.size; m = 0.035
        im = im.crop((int(w * m), int(h * m), int(w * (1 - m)), int(h * (1 - m)))).resize((800, 600), Image.LANCZOS)
        out = os.path.join(os.path.dirname(HERE), 'assets', f'cut-{name}.webp' if ft else f'cut-ls-{i + 1}.webp')
        im.save(out, 'WEBP', quality=74, method=6)
        seam = name + 'a' in PANELS
        keys = [f'{name}a-{seed}', f'{name}b-{seed}'] if seam else [f'{name}-{seed}']
        notes = ['margins cropped 3.5%', 'resized 800x600']
        if seam:
            notes.append('the two paintings joined on a torn-paper edge')
        if os.path.exists(cleaned):
            notes.append('a second kite and a loose tail painted out with the sky beside them')
        prompt = ' || '.join(f"{log[k]['prompt']} [{log[k]['model']}, seed {log[k]['seed']}]" for k in keys)
        subprocess.run([imp, 'embed-prompt', out, '--prompt', f"{prompt}\n[edits: {'; '.join(notes)}]"], capture_output=True)
        print(out, os.path.getsize(out))


def check():
    """Every story panel whose description holds a word the glossary does not define."""
    bad = {n: unclear(w) + clash(w, YEAR[n.rstrip('ab')]) for n, w in WHAT.items() if unclear(w) or clash(w, YEAR[n.rstrip('ab')])}
    for n, w in bad.items():
        print(n, ', '.join(w))
    print(len(WHAT), 'panels;', len(bad), 'with an undefined word or two people under one role')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    {'paint': paint, 'sheet': sheet, 'clean': clean, 'strip': strip, 'export': export, 'check': check,
     'paint-ref': paint_ref, 'pick-ref': pick_ref, 'paint-refs': paint_refs}[sys.argv[1]]()
