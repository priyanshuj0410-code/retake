"""Stage 2: for every generated person candidate, normalise the backdrop, build the skin mask, find the eyes and the
crop box, and save the base, the mask and a mask overlay for the manual check.

  python3 scripts/portraits/analyse.py            # all raw candidates not yet analysed
  python3 scripts/portraits/analyse.py --force    # redo all (after editing masks.json)
Writes work/base/<id>.png, work/mask/<id>.png (weight x 255), work/overlay/<id>.png and work/analysis.json.
"""
import glob
import json
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

from backdrop import backdrop
from colour import rgb2lab
from frame import crop_box, eyes
from skinmask import mask

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.join(HERE, "work")
OUT = os.path.join(WORK, "analysis.json")


def linework(base, w):
    """Share of near-black pixels inside the filled face region: a crude, objective proxy for facial line density."""
    face = ndimage.binary_fill_holes(ndimage.binary_closing(w > 0.5, iterations=4))
    lab = rgb2lab(base / 255.0)
    inner = ndimage.binary_erosion(face, iterations=6)
    return float(((lab[..., 0] < 35) & inner).sum() / max(inner.sum(), 1))


def main():
    force = "--force" in sys.argv
    for d in ("base", "mask", "overlay"):
        os.makedirs(os.path.join(WORK, d), exist_ok=True)
    res = json.load(open(OUT)) if os.path.exists(OUT) else {}
    for path in sorted(glob.glob(os.path.join(WORK, "raw", "*.png"))):
        cid = os.path.basename(path)[:-4]
        if cid.startswith("mascot") or (cid in res and not force):
            continue
        raw = np.asarray(Image.open(path).convert("RGB"))
        base, bd = backdrop(raw)
        w, ref = mask(base, cid)
        e, how = eyes(base, w, cid)
        box, shift = crop_box(e, base) if e else (None, "")
        Image.fromarray(base).save(os.path.join(WORK, "base", cid + ".png"))
        Image.fromarray(np.round(w * 255).astype(np.uint8)).save(os.path.join(WORK, "mask", cid + ".png"))
        ov = base * (1 - 0.65 * w[..., None]) + np.array([0, 230, 60]) * 0.65 * w[..., None]
        Image.fromarray(ov.astype(np.uint8)).save(os.path.join(WORK, "overlay", cid + ".png"))
        res[cid] = dict(ref_lab=[round(float(v), 2) for v in ref], eyes=[[round(float(c), 1) for c in p] for p in e] if e else None,
                        eyes_how=how, crop=[round(float(v), 1) for v in box] if e else None, crop_shift=shift,
                        eye_dist=round(float(e[1][0] - e[0][0]), 1) if e else None,
                        mask_px=int((w > 0).sum()), linework=round(linework(base, w), 4), **bd)
        print(cid, how, res[cid]["crop"], res[cid]["ref_lab"], flush=True)
        json.dump(res, open(OUT, "w"), indent=1)


if __name__ == "__main__":
    main()
