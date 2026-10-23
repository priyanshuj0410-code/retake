"""Paints and processes the wide (laptop) versions of the new worlds' scenes.

Paint (slow, local FLUX):  ~/.local/share/uv/tools/mflux/bin/python art/wides.py paint
Process into assets:       python3 art/wides.py process
Raw renders go to art/raw/ (not shipped); finished files are assets/<world>-s-<scene>-w.webp with their prompt embedded.
"""
import json, os, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, 'raw')
ASSETS = os.path.join(os.path.dirname(HERE), 'assets')
IMP = '/Users/priyanshu/Sex Ed/.claude/skills/impeccable/scripts/impeccable'
NO = (" Full-bleed edge to edge, no border, no frame, no people, no faces, no hands. No text, no letters, no numbers, no words, "
      "no logos, no badges, no religious symbols, no writing anywhere.")
WIDE = (" Wide panoramic composition: the main subject sits in the left third of the frame. Towards the right the same scene carries on, "
        "quieter and darker: open sky, distance and shadow, nothing important there, one continuous picture with no panels and no split.")
STYLE = {
    'jadugar': (" Painted like a 1960s Indian chromolithograph print for a travelling jadoo show: hand-painted gouache with soft airbrushed glows, "
                "saturated vermilion and magenta against a deep indigo night, emerald and old-gold highlights, bold dark outlines, dramatic and "
                "mysterious, a little faded, paper grain."),
    'cricket': (" Painted like a vintage Indian sports-magazine centre spread from the 1980s: deep outfield greens, chalk white and cherry red, "
                "dramatic angle, faded glossy print."),
    'sunday': (" Painted like a 1980s Indian family-magazine illustration in flat gouache: warm teak browns, faded teal and cream with one signal "
               "orange, soft grain, nostalgic Sunday light."),
}
SCENES = {
    'jadugar-s-rope-w': ('jadugar', "On a dusty small-town ground at night, a thick rope rises straight up out of a wicker basket into a starry indigo sky and vanishes into a cloud; hissing kerosene pressure lamps on bamboo poles light a small wooden stage with a painted moon backdrop."),
    'jadugar-s-trunk-w': ('jadugar', "Backstage at a travelling magic show: a big steamer trunk open with silk scarves spilling out, a wicker basket pierced by swords, a sequinned coat on a hanger, a mirror, a kerosene lamp, a painted canvas backdrop of a moon and clouds."),
    'jadugar-s-booth-w': ('jadugar', "The ticket window of a travelling magic show at night: a small wooden booth with a hatch, a hissing kerosene lamp, a rope queue line with nobody in it, the glowing tent behind, stars."),
    'jadugar-s-rickshaw-w': ('jadugar', "A cycle-rickshaw with a big brass loudspeaker horn parked by a striped canvas magic show tent at night in an Indian small town, kerosene lamps, the tent flap open on a lit stage, a clean dusty ground."),
    'cricket-s-scoreboard-w': ('cricket', "A giant old manual cricket scoreboard at a stadium at dusk, rows of blank black hanging plates with nothing written on them, a ladder leaning against it, floodlights coming on, empty stands."),
    'cricket-s-nets-w': ('cricket', "Practice nets on a dusty Indian maidan at dawn: a net cage, a set of stumps, a kit bag and a water bottle, a tree, long shadows and mist."),
    'cricket-s-dressing-w': ('cricket', "An old cricket pavilion dressing room in the afternoon: kit bags, pads and bats hanging on pegs, a wooden bench, a towel, sunlight through tall windows, the green ground seen outside."),
    'sunday-s-room-w': ('sunday', "A 1980s Indian living room on a Sunday morning: a wooden television cabinet with sliding shutter doors open, the screen showing colour test bars, a lace doily and a vase on top, a sofa with cushions, a ceiling fan, sunlight through a window."),
    'sunday-s-tv-w': ('sunday', "A close-up of a 1980s wooden television cabinet with its sliding shutter doors half open on a softly glowing blank screen, a lace doily and a small vase on top."),
    'sunday-s-sofa-w': ('sunday', "A family sofa on a Sunday afternoon in a 1980s Indian home: a folded newspaper, two cups of tea, cushions, a cooler in the window, the TV off in the corner."),
}


INDOOR = (" Wide interior composition: the main subject sits in the left third of the frame. Towards the right the same room carries on, "
          "quieter and dimmer: a plain painted wall, a doorway, soft shadow. It is one continuous painted room with no panels, no split, "
          "no dark band and no second picture.")
INDOORS = {'sunday-s-room-w', 'sunday-s-tv-w', 'sunday-s-sofa-w', 'cricket-s-dressing-w'}


def prompt(name):
    world, scene = SCENES[name]
    # the outdoor "open sky on the right" wording split indoor rooms into two pictures; rooms get their own wording
    return scene + STYLE[world] + (INDOOR if name in INDOORS else WIDE) + NO


def paint():
    import mlx.core as mx
    from mflux.models.common.config import ModelConfig
    from mflux.models.flux2.variants import Flux2Klein
    os.makedirs(RAW, exist_ok=True)
    model = Flux2Klein(quantize=8, model_config=ModelConfig.flux2_klein_4b())
    logp = os.path.join(RAW, 'log.json'); log = json.load(open(logp)) if os.path.exists(logp) else {}
    for i, name in enumerate(SCENES):
        path = os.path.join(RAW, name + '.png')
        if os.path.exists(path):
            continue
        seed = 6900 + 101 * i
        t = time.time(); img = model.generate_image(seed=seed, prompt=prompt(name), num_inference_steps=4, width=1536, height=864)
        img.save(path); mx.clear_cache(); print(name, round(time.time() - t, 1), flush=True)
        log[name] = dict(seed=seed, prompt=prompt(name), model='FLUX.2 klein 4B, 8-bit, mflux, 4 steps, 1536x864')
        json.dump(log, open(logp, 'w'), indent=1)


def printlook(im):
    import numpy as np
    from PIL import Image, ImageEnhance
    im = ImageEnhance.Brightness(im).enhance(1.12); im = ImageEnhance.Contrast(im).enhance(1.08)
    q = im.quantize(colors=12, method=Image.MEDIANCUT).convert('RGB'); a = np.asarray(q).astype(float)
    h, w = a.shape[:2]; yy, xx = np.mgrid[0:h, 0:w]; cell = 5
    d = ((xx % cell - cell / 2) ** 2 + (yy % cell - cell / 2) ** 2) ** 0.5
    lum = a.mean(axis=2) / 255; dots = (d < (1 - lum) * cell * 0.55).astype(float)
    a = a * (1 - 0.16 * dots[..., None]); a[..., 0] = np.roll(a[..., 0], 1, axis=1)
    a = a * 0.94 + np.array([246, 241, 228.0]) * 0.06
    return Image.fromarray(a.clip(0, 255).astype('uint8'))


def process():
    from PIL import Image
    log = json.load(open(os.path.join(RAW, 'log.json')))
    for name in SCENES:
        src = os.path.join(RAW, name + '.png')
        if not os.path.exists(src):
            print('missing', name); continue
        im = Image.open(src).convert('RGB'); w, h = im.size; m = 0.03
        im = im.crop((int(w * m), int(h * m), int(w * (1 - m)), int(h * (1 - m))))
        r = max(1440 / im.width, 810 / im.height)
        im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
        l, t = (im.width - 1440) // 2, (im.height - 810) // 2
        im = im.crop((l, t, l + 1440, t + 810))
        notes = ['margins cropped 3%', 'resized 1440x810']
        if name.startswith('cricket'):
            im = printlook(im); notes.append('magazine print finish: 12 colours, dot screen, red shift')
        out = os.path.join(ASSETS, name + '.webp'); im.save(out, 'WEBP', quality=72, method=6)
        meta = log.get(name, {})
        p = f"{meta.get('prompt', prompt(name))}\n[{meta.get('model')}, seed {meta.get('seed')}; edits: {'; '.join(notes)}]"
        subprocess.run([IMP, 'embed-prompt', out, '--prompt', p], capture_output=True)
        print(name, os.path.getsize(out))


if __name__ == '__main__':
    {'paint': paint, 'process': process}[sys.argv[1]]()
