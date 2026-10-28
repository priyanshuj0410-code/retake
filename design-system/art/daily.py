"""Paints the dailies' sample day, Lugdi week, Monday, "The lights went at 8" (EVAL-23; the format is
knowledge/architecture/daily-strip-format-2026-10-28.md, section 9). The first test of painting the dailies' standing
cast from reference pictures (owner, 28 Oct 2026: "Yes, the same 8 people" in every world's look).

Three rounds, each through the queue, with a pick by eye between them (knowledge/story/characters/method.md, 5.4):
  1  masters    each person once in the present-day look, plus every panel with no cast in it
  2  looks      each person restyled into Lugdi from their master, plus the outcomes painted from the place
  3  people     the three wide people panels, from the Lugdi references and the place
  ~/.claude/heavy-queue/heavyq run --label "Daily sample <n>" -- bash -c '~/.local/share/uv/tools/mflux/bin/python art/daily.py paint <n>'
Contact sheet of a round's seeds:   python3 art/daily.py sheet <n>
Keep a try as a reference:          python3 art/daily.py pick <name> <seed>   (masters, looks and the place)
The prompts, refused while a word with more than one meaning is undefined:   python3 art/daily.py check
Raw renders go to art/raw/daily/ (not shipped); references to art/refs/daily-*.png.
"""
import json, os, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from cutscenes import STYLE, SEEDS, terms, unclear

RAW = os.path.join(HERE, 'raw', 'daily')
REF = os.path.join(HERE, 'refs')
NO = (" One comic panel, full-bleed edge to edge, no border, no frame, no speech bubbles. No text, no letters, no numbers, "
      "no words, no signboards, no number plates, no logos, no religious symbols, no writing anywhere.")
EMPTY = " No people, no faces, no hands."
# the bubble spec's painter rules for a panel with people in it: room above the heads for the bubbles, at most three
ROOM = " Plain dark wall or night sky across the top third, above every head; at most three people, all from the knees up."

# Names never reach the painter (they are painted as lettering); each person goes in as a role and the same look every
# time. Contrasting anchors so the two in the lane never swap: white clothes and a moustache against a dark green suit
# and a plait. "South Asian features and warm brown skin" stopped the whitening (flux-portrait-biases); forehead dots are
# found by eye and repainted with a new seed.
CAST = {
    'shobha': ('the older woman', "a 58-year-old Indian woman with grey hair in a low bun, glasses pushed up into her hair, "
                                  "a faded blue cotton sari and a grey cardigan, South Asian features and warm brown skin"),
    'hari': ('the old man', "a 67-year-old Indian man with a thick white moustache and thin white hair, a white kurta-pyjama "
                            "and a brown woollen muffler round his neck, South Asian features and warm brown skin"),
    'nusrat': ('the tailor', "a 45-year-old Indian woman with her hair in a long black plait, a dark green salwar kameez and a "
                             "tailor's yellow measuring tape round her neck, South Asian features and warm brown skin"),
}
MASTER = ("Character reference picture: {look}, standing, full figure from head to feet, facing the viewer, arms relaxed, "
          "against a plain pale blue-grey wall in soft even light.")
LOOK = (" The same person as in the reference picture, with exactly the same face, age, hair and clothes, standing full figure "
        "from head to feet, facing the viewer, against a plain dark wall, now painted in this style.")

PLACE = ("A narrow present-day Indian lane of plain two-storey houses at night in a power cut: every window dark, empty plastic "
         "chairs outside two doors, two parked scooters, overhead wires and one electric pole on the right, a small corner "
         "shop at the far end with its rolling shutter half down and one bare bulb glowing inside, candles burning on the "
         "doorsteps, a torch beam crossing from the left edge. A plain night-blue sky across the top third.")
SAME = " The same lane as in the reference picture, seen from the same place."

# name: (round, size, scene, references); a reference is a person's Lugdi look or 'place'
W, H, WIDE, TALL, SQ = 1024, 768, (1536, 768), (768, 1344), (768, 1024)
PANELS = {
    'L': (1, TALL, PLACE + EMPTY, ()),
    'L-w': (1, WIDE, PLACE + EMPTY, ()),
    'E-B': (1, (W, H), "Close view: a transistor radio on an empty red plastic chair, a steel tumbler of tea on the step "
                       "beside it, one candle burning, warm light on a plain wall." + EMPTY, ()),
    'M-B': (1, (W, H), "Close view: a row of mobile phones on a shop counter, all plugged into one power strip, their screens "
                       "dark and blank, a small inverter with one green light, a steel tumbler." + EMPTY, ()),
    'M-O': (1, (W, H), "The electric pole at the end of the lane at night, a bamboo ladder leaning against it, a torch beam "
                       "shining up the pole, the lineman at the top of the ladder seen from behind. Nobody else, no faces.", ()),
    'H-B': (1, (W, H), "Close view: a mosquito coil smoking on a roof parapet beside a steel tumbler and a transistor radio, "
                       "stars above." + EMPTY, ()),
    'E-O': (2, (W, H), "The lane a little closer: a candle burning in every window and on every doorstep, two steel tumblers "
                       "of tea steaming on a step beside a switched-off steel torch, an empty red plastic chair with a "
                       "transistor radio on it, night sky above the roofs." + EMPTY + SAME, ('place',)),
    'H-O': (2, (W, H), "The lights are back: every window lit yellow, the corner shop fully lit, a ceiling fan turning behind "
                       "one window, the plastic chairs empty, a transistor radio on the red plastic chair." + EMPTY + SAME,
            ('place',)),
    'E-W': (3, WIDE, "Wide. In the left two thirds, across the lane, the old man from the first reference sits on a red "
                     "plastic chair with a transistor radio on his knee, complaining; beside him the tailor from the second "
                     "reference is standing, holding two steel tumblers of tea, laughing; both face right. In the right third, "
                     "the older woman from the third reference is standing in a doorway holding a steel torch low so it lights "
                     "her face from below, a brown notebook held to her chest, looking straight out at the viewer. The lane "
                     "from the fourth reference." + ROOM, ('hari', 'nusrat', 'shobha', 'place')),
    'M-W': (3, WIDE, "Wide. In the left two thirds, the old man from the first reference and the tailor from the second "
                     "reference are standing on the step of the corner shop, he holding up a transistor radio, she carrying two "
                     "plastic buckets of water. In the right third, the older woman from the third reference is standing behind "
                     "the shop counter under one bare bulb, a mobile phone held to her ear, looking straight out at the "
                     "viewer. The corner shop of the lane in the fourth reference." + ROOM, ('hari', 'nusrat', 'shobha', 'place')),
    'H-W': (3, WIDE, "Wide. A level rooftop at night with two black plastic water tanks and a clothesline. In the left two "
                     "thirds, the old man from the first reference sits on a low stool fanning himself with a woven "
                     "palm-leaf hand fan, and the tailor from the second reference takes clothes off the line. In the right "
                     "third, the older woman from the third reference holds a steel torch low, looking straight out at the "
                     "viewer. Dark rooftops beyond." + ROOM, ('hari', 'nusrat', 'shobha')),
}
for _who, (_role, _look) in CAST.items():
    PANELS[f'm-{_who}'] = (1, SQ, MASTER.format(look=_look), ())
    PANELS[f'lugdi-{_who}'] = (2, SQ, LOOK, (f'm-{_who}',))


def ref_path(r):
    """A reference's picture: a master (m-<who>), a person's Lugdi look (<who>) or the place."""
    return os.path.join(REF, {'place': 'daily-lights-place'}.get(r, 'daily-' + (r[2:] + '-now' if r.startswith('m-') else r + '-lugdi')) + '.png')


def prompt(name):
    rnd, size, scene, refs = PANELS[name]
    style = STYLE['now'] if name.startswith('m-') else STYLE['lugdi']
    return scene + terms(scene) + style + NO


def check():
    """Every prompt, and the words with more than one meaning left undefined (painting refuses them)."""
    bad = {}
    for n, (_, _, scene, _) in PANELS.items():
        if unclear(scene):
            bad[n] = unclear(scene)
        print(f'{n}: {prompt(n)}\n')
    for n, ws in bad.items():
        print('UNDEFINED', n, ws)
    return bad


def paint():
    import memguard; memguard.ready(); memguard.watch()
    import mlx.core as mx
    from mflux.models.common.config import ModelConfig
    rnd = int(sys.argv[2])
    todo = [n for n, p in PANELS.items() if p[0] == rnd]
    bad = {n: unclear(PANELS[n][2]) for n in todo if unclear(PANELS[n][2])}
    if bad:   # define it in knowledge/story/situations.md's glossary first
        sys.exit('not painted, words with no definition in the glossary: ' + '; '.join(f'{n}: {", ".join(w)}' for n, w in bad.items()))
    missing = sorted({ref_path(r) for n in todo for r in PANELS[n][3] if not os.path.exists(ref_path(r))})
    if missing:
        sys.exit('no reference picture yet (pick one first): ' + ', '.join(os.path.basename(m) for m in missing))
    os.makedirs(RAW, exist_ok=True)
    logp = os.path.join(RAW, 'log.json'); log = json.load(open(logp)) if os.path.exists(logp) else {}
    for edit in (False, True):
        names = [n for n in todo if bool(PANELS[n][3]) == edit and any(not os.path.exists(os.path.join(RAW, f'{n}-{s}.png')) for s in SEEDS)]
        if not names:
            continue
        if edit:
            from mflux.models.flux2.variants import Flux2KleinEdit as Model
        else:
            from mflux.models.flux2.variants import Flux2Klein as Model
        model = Model(quantize=8, model_config=ModelConfig.flux2_klein_4b())
        for name in names:
            _, (w, h), _, refs = PANELS[name]
            for seed in SEEDS:
                key = f'{name}-{seed}'; path = os.path.join(RAW, key + '.png')
                if os.path.exists(path):
                    continue
                t = time.time(); p = prompt(name)
                extra = dict(image_paths=[ref_path(r) for r in refs]) if edit else {}
                model.generate_image(seed=seed, prompt=p, num_inference_steps=4, width=w, height=h, **extra).save(path)
                mx.clear_cache(); print(key, round(time.time() - t, 1), flush=True)
                log[key] = dict(seed=seed, prompt=p, references=[os.path.relpath(ref_path(r), HERE) for r in refs],
                                model=f'FLUX.2 klein 4B{" edit" if edit else ""}, 8-bit, mflux, 4 steps, {w}x{h}')
                json.dump(log, open(logp, 'w'), indent=1)
        del model; mx.clear_cache()


def sheet():
    """art/raw/daily/sheet-<round>.png: every seed of the round, one row a panel, labelled."""
    from PIL import Image, ImageDraw
    rnd = int(sys.argv[2])
    names = [n for n, p in PANELS.items() if p[0] == rnd]
    cw, ch, lab = 420, 300, 22
    out = Image.new('RGB', (cw * len(SEEDS), (ch + lab) * len(names)), (24, 24, 28))
    d = ImageDraw.Draw(out)
    for i, n in enumerate(names):
        for j, s in enumerate(SEEDS):
            p = os.path.join(RAW, f'{n}-{s}.png')
            x, y = j * cw, i * (ch + lab)
            d.text((x + 6, y + 4), f'{n} {s}', fill=(240, 240, 240))
            if os.path.exists(p):
                im = Image.open(p).convert('RGB'); im.thumbnail((cw - 8, ch - 4))
                out.paste(im, (x + 4, y + lab))
    path = os.path.join(RAW, f'sheet-{rnd}.png'); out.save(path); print(path)


def pick():
    """pick <name> <seed>: the chosen try becomes a reference (m-<who>, lugdi-<who>, L-w for the place)."""
    import shutil
    name, seed = sys.argv[2], sys.argv[3]
    r = 'place' if name == 'L-w' else name[6:] if name.startswith('lugdi-') else name
    os.makedirs(REF, exist_ok=True)
    shutil.copy2(os.path.join(RAW, f'{name}-{seed}.png'), ref_path(r)); print(ref_path(r))


if __name__ == '__main__':
    {'paint': paint, 'sheet': sheet, 'pick': pick, 'check': lambda: sys.exit(1 if check() else 0)}[sys.argv[1]]()
