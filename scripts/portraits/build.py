"""Stage 4: build the delivered files from the chosen bases (scores.json "picks").

  python3 scripts/portraits/build.py
Cast: each chosen base -> four tones by recolour (l1, l2, d1, d2, lightest to darkest) -> eye-normalised crop -> 384 px
WebP. One-offs: their single base -> the constant medium tone (the game's 'm', #BC8459) by the same recolour.
Mascots: the chosen candidate, backdrop normalised, resized whole. Writes work/variant/ (512 px PNG after recolour),
work/out384/ (384 px PNG before WebP), public/portraits/*.webp and public/portraits/manifest.json.
"""
import json
import os

import numpy as np
from PIL import Image

from backdrop import BACKDROP, backdrop
from recolour import TONES, recolour
from skinmask import mask

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.join(HERE, "work")
PUBLIC = os.path.join(HERE, "..", "..", "public", "portraits")
OUT_PX, QUALITY, PAD = 384, 90, 200  # q 90, not 80: at 80 the files came out 8-20 KB and the halftone smeared
MEDIUM = "#BC8459"  # src/styles/tokens.css [data-tone='m'] --art-skin, the one-offs' constant tone
GAME_TONE = {"t1": "l1", "t2": "l2", "t3": "d1", "t4": "d2"}
SEXWORD = {"w": "woman", "m": "man"}


def cast_name(slot, sex, t):
    """s1..s8 here are the game's numeric cast slots 0..7 (session.ts drawCast); names follow portraitImages.ts."""
    return f"{int(slot[1:]) - 1}-{SEXWORD[sex]}-{GAME_TONE[t]}"


def oneoff_name(cid):
    slot, sex = cid.split("-")[0], cid.split("-")[1]
    return f"{slot}-{SEXWORD[sex]}"


def crop384(img8, box):
    bg = [int(BACKDROP[i:i + 2], 16) for i in (1, 3, 5)]
    padded = np.stack([np.pad(img8[..., c], PAD, mode="constant", constant_values=bg[c]) for c in range(3)], -1)
    b = tuple(v + PAD for v in box)
    return np.asarray(Image.fromarray(padded).resize((OUT_PX, OUT_PX), Image.LANCZOS, box=b))


def save(arr384, name, files):
    Image.fromarray(arr384).save(os.path.join(WORK, "out384", name + ".png"))
    Image.fromarray(arr384).save(os.path.join(PUBLIC, name + ".webp"), "WEBP", quality=QUALITY, method=6)
    files.append(name + ".webp")


def person(cid, out_names, targets, analysis, files, record):
    base = np.asarray(Image.open(os.path.join(WORK, "base", cid + ".png")).convert("RGB"))
    w, ref = mask(base, cid)
    box = analysis[cid]["crop"]
    for name, hexv in zip(out_names, targets):
        v = recolour(base, w, ref, hexv)
        Image.fromarray(v).save(os.path.join(WORK, "variant", name + ".png"))
        save(crop384(v, box), name, files)
        record[name] = dict(base=cid, target=hexv, crop=box)


def main():
    for d in ("variant", "out384"):
        os.makedirs(os.path.join(WORK, d), exist_ok=True)
    os.makedirs(PUBLIC, exist_ok=True)
    analysis = json.load(open(os.path.join(WORK, "analysis.json")))
    picks = json.load(open(os.path.join(HERE, "scores.json")))["picks"]
    files, record = [], {}
    for slot, pair in picks["cast"].items():
        for sex, cand in pair.items():
            names = [cast_name(slot, sex, t) for t in TONES]
            person(f"{slot}-{sex}-{cand}", names, list(TONES.values()), analysis, files, record)
    for cid in picks.get("oneoffs", []):
        person(cid, [oneoff_name(cid)], [MEDIUM], analysis, files, record)
    for animal, cand in picks["mascots"].items():
        raw = np.asarray(Image.open(os.path.join(WORK, "raw", f"mascot-{animal}-{cand}.png")).convert("RGB"))
        img, _ = backdrop(raw)
        arr = np.asarray(Image.fromarray(img).resize((OUT_PX, OUT_PX), Image.LANCZOS))
        save(arr, f"mascot-{animal}", files)
        record[f"mascot-{animal}"] = dict(base=f"mascot-{animal}-{cand}")
    sizes = {f: os.path.getsize(os.path.join(PUBLIC, f)) for f in files}
    manifest = {
        "_note": "Generated with FLUX.2 klein 4B (mflux 0.19.1); method and checks in scripts/portraits/README.md. "
                "Names follow src/ui/portraitImages.ts. Cast: {slot}-{sex}-{tone}.webp, slot 0-7, sex woman/man, "
                "tone l1, l2, d1, d2 lightest to darkest. One-offs: o{slot}-{sex}.webp, slot 100+, at the constant "
                "medium tone. Mascots: mascot-{animal}.webp.",
        "_tones": {GAME_TONE[t]: h for t, h in TONES.items()} | {"m (one-offs)": MEDIUM},
        "files": sorted(files),
    }
    json.dump(manifest, open(os.path.join(PUBLIC, "manifest.json"), "w"), indent=1)
    json.dump(dict(record=record, bytes=sizes), open(os.path.join(WORK, "build.json"), "w"), indent=1)
    kb = np.array(list(sizes.values())) / 1024
    print(f"{len(files)} files, {kb.min():.1f}-{kb.max():.1f} KB, median {np.median(kb):.1f} KB, total {kb.sum():.0f} KB")


if __name__ == "__main__":
    main()
