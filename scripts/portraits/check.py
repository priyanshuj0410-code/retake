"""Stage 5: verification. Writes check-output.txt beside this file.

1. Outside the mask, every tone variant (512 px PNG) is byte-identical to its base: max |difference| must be 0.
2. After cropping and resizing (384 px PNG, before WebP), every pixel whose resampling window does not reach the
   mask (the mask dilated by 4 px, carried through the same resize) is identical to the base: must be 0.
3. After WebP (lossy, q 90) the same comparison is reported, not required to be 0: the codec encodes each file on
   its own, so it adds small differences everywhere.
4. Tone accuracy: the median Lab of the mask core in each variant against its target (Delta E 1976).
"""
import json
import os

import numpy as np
from PIL import Image
from scipy import ndimage

from build import OUT_PX, PAD, crop384
from colour import hex2lab, rgb2lab
from skinmask import mask

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.join(HERE, "work")
PUBLIC = os.path.join(HERE, "..", "..", "public", "portraits")


def resize_f(a, box):
    padded = np.pad(a.astype(np.float32), PAD, mode="constant")
    b = tuple(v + PAD for v in box)
    return np.asarray(Image.fromarray(padded).resize((OUT_PX, OUT_PX), Image.LANCZOS, box=b))


def main():
    rec = json.load(open(os.path.join(WORK, "build.json")))["record"]
    lines, fails = [], 0
    cache = {}
    for name, r in sorted(rec.items()):
        if name.startswith("mascot"):
            continue
        cid = r["base"]
        if cid not in cache:
            base = np.asarray(Image.open(os.path.join(WORK, "base", cid + ".png")).convert("RGB")).astype(int)
            w, _ = mask(base.astype(np.uint8), cid)
            foot = resize_f(ndimage.binary_dilation(w > 0, iterations=4), r["crop"]) != 0
            cache[cid] = (base, w, foot, crop384(base.astype(np.uint8), r["crop"]).astype(int))
        base, w, foot, base384 = cache[cid]
        v = np.asarray(Image.open(os.path.join(WORK, "variant", name + ".png")).convert("RGB")).astype(int)
        out = w == 0
        d512 = int(np.abs(v - base)[out].max())
        changed = int((np.abs(v - base).sum(-1) > 0).sum())
        v384 = np.asarray(Image.open(os.path.join(WORK, "out384", name + ".png"))).astype(int)
        d384 = int(np.abs(v384 - base384)[~foot].max())
        webp = np.asarray(Image.open(os.path.join(PUBLIC, name + ".webp")).convert("RGB")).astype(int)
        dw = np.abs(webp - base384)[~foot]
        core = (w >= 0.99) & (rgb2lab(base / 255.0)[..., 0] > 40)
        med = np.median(rgb2lab(v / 255.0)[core], 0)
        de = float(np.linalg.norm(med - hex2lab(r["target"])))
        ok = d512 == 0 and d384 == 0
        fails += not ok
        lines.append(f"{name:14s} base {cid:10s} outside-mask px {int(out.sum()):6d}  max|diff| 512px {d512}  "
                     f"384px {d384}  {'PASS' if ok else 'FAIL'}  | webp outside: max {int(dw.max())}, mean {dw.mean():.2f}"
                     f"  | changed px {changed:6d}  | core median vs target dE {de:.2f}")
    head = [f"variants checked: {len(lines)}, failures: {fails}",
            "rule: max|diff| outside the mask must be exactly 0 at 512 px and outside the resampling footprint at 384 px"]
    open(os.path.join(HERE, "check-output.txt"), "w").write("\n".join(head + lines) + "\n")
    print("\n".join(head))


if __name__ == "__main__":
    main()
