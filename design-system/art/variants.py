"""One panel painted with different definitions of one glossary word, side by side, for the owner to choose before the
choice becomes the glossary's row (owner, 23 Oct 2026, on the opening's tempo: "the tempo is not right... show me the
other options").

Paint (FLUX, through the Mac-wide queue only):
  ~/.claude/heavy-queue/heavyq run --label "Tempo options" -- bash -c '~/.local/share/uv/tools/mflux/bin/python art/variants.py paint'
Sheet:  python3 art/variants.py sheet
"""
import json, os, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.argv, _argv = sys.argv[:1], sys.argv   # cutscenes reads its own command from argv
import cutscenes as C
sys.argv = _argv

SEEDS = (7100, 7203)
# panel -> the glossary word -> {label: the definition tried in its place}
# st-0-1: the owner chose the opening's own third try (seed 7319) before these were painted (23 Oct 2026); its look is now
# the glossary's tempo, so these stay unpainted.
VARIANTS = {'st-0-1': ('tempo', {
    'A, Matador van': "The tempo is a 1990s Indian Matador goods van: a boxy white van with a short snub nose, a blue stripe along its side and its rear doors swung open.",
    'B, mini truck': "The tempo is a small Indian mini truck: a tiny square white cab and an open flat cargo bed with low drop sides, piled with cardboard boxes and a rolled mattress.",
    'C, three-wheeler': "The tempo is a three-wheeled Indian goods auto rickshaw: a yellow and black front cab over one front wheel and an open cargo box behind, piled with cardboard boxes.",
})}


def prompt(panel, definition):
    word = VARIANTS[panel][0]
    old = next(d for ps, d in C.GLOSSARY if word in ps)
    return C.prompt(panel).replace(old, definition)


def path(panel, label, seed):
    return os.path.join(C.RAW, f'{panel}-{label[0]}-{seed}.png')


def paint():
    import mlx.core as mx
    from mflux.models.common.config import ModelConfig
    from mflux.models.flux2.variants import Flux2Klein
    model = Flux2Klein(quantize=8, model_config=ModelConfig.flux2_klein_4b())
    logp = os.path.join(C.RAW, 'log.json'); log = json.load(open(logp)) if os.path.exists(logp) else {}
    for panel, (word, defs) in VARIANTS.items():
        for label, d in defs.items():
            for seed in SEEDS:
                out = path(panel, label, seed)
                if os.path.exists(out):
                    continue
                t = time.time(); p = prompt(panel, d)
                model.generate_image(seed=seed, prompt=p, num_inference_steps=4, width=C.W, height=C.H).save(out)
                mx.clear_cache(); print(os.path.basename(out), round(time.time() - t, 1), flush=True)
                log[os.path.basename(out)[:-4]] = dict(seed=seed, prompt=p, model=f'FLUX.2 klein 4B, 8-bit, mflux, 4 steps, {C.W}x{C.H}')
                json.dump(log, open(logp, 'w'), indent=1)


def sheet():
    from PIL import Image, ImageDraw
    for panel, (word, defs) in VARIANTS.items():
        w, h = 480, 360
        sh = Image.new('RGB', (10 + len(SEEDS) * (w + 10), 10 + len(defs) * (h + 30)), 'white'); dr = ImageDraw.Draw(sh)
        for r, label in enumerate(defs):
            for c, seed in enumerate(SEEDS):
                x, y = 10 + c * (w + 10), 10 + r * (h + 30)
                dr.text((x, y), f'{label}, try {c + 1}', fill='black')
                if os.path.exists(path(panel, label, seed)):
                    sh.paste(Image.open(path(panel, label, seed)).convert('RGB').resize((w, h)), (x, y + 18))
        out = os.path.join(C.RAW, f'sheet-{panel}-{word}.png'); sh.save(out); print(out)


if __name__ == '__main__':
    {'paint': paint, 'sheet': sheet}[sys.argv[1]]()
