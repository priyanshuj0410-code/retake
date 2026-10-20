"""Deterministic skin mask for one base portrait (no learned model, no randomness).

1. Skin reference: the median Lab colour of the face core, i.e. pixels in a box at the image centre whose Lab colour
   is plausibly skin (L* 40-85, chroma 12+, hue 35-75 degrees). This is the base's "mid-skin" colour.
2. Membership w in [0, 1] per pixel, the product of four soft ramps:
     L* above the ink and hair range   (0 at L* <= 30, 1 at L* >= 42)
     chroma / L* like skin              (0 at <= 0.28, 1 at >= 0.38; drops whites, greys, black hair, lavender)
     hue near the reference hue         (1 within 9 degrees, 0 beyond 16; drops lips, violet, yellow lanyard)
     chroma at least 10                 (0 at <= 8, 1 at >= 12)
3. Spatial clean-up: keep only connected regions of w >= 0.5 larger than 150 px (drops stray skin-coloured specks in
   the hair or the shirt), dilated by 2 px so anti-aliased edge pixels keep their partial weight; everything else 0.
4. Refinement inside the face-and-neck silhouette (refine below): dark skin-hued pixels and small ink-free
   highlights are taken in, with a wider hue window (redder shadow shades such as under the chin); the holes holding
   the eyes and the mouth keep the step-1 weights. Within 12 px outside the silhouette, skin-hued shade with L* above
   34 is taken in too (a neck shadow running into the collar); the L* floor keeps dark brown hair out.
5. Every person, cast and one-offs (owner, 20 Oct 2026, after the tone change): below the mouth, or
   beside the jaw clear of the lips, shade on the red side of the skin hue is taken in within 30 px of the skin and
   wherever it connects to the skin. Neck shadows can be much redder than the skin (hue up to 65 degrees below the
   reference, many halftone dots under L* 34), which step 4 left as salmon halftone on the darkest tone.
   It also takes in small skin islands cut off between the lanyard and the collar, which the 150 px rule drops,
   and red cheek shading inside the face outline beside the nose and mouth (L* above 22-28, so hair stays out).
   Blue and teal shirts, green and navy lanyards and black hair sit far outside the hue or chroma window.
6. Manual edits from masks.json, per base: "exclude" ellipses [cx, cy, rx, ry] are forced to 0 (used for lips or
   anything the colour rule let through), "include" ellipses are allowed back in. Every edit is listed there.
"""
import json
import os
import re

import numpy as np
from PIL import Image
from scipy import ndimage

from colour import rgb2lab

HERE = os.path.dirname(os.path.abspath(__file__))
EDITS = os.path.join(HERE, "masks.json")


def ramp(x, lo, hi):
    return np.clip((x - lo) / (hi - lo), 0, 1)


def load(path):
    return np.asarray(Image.open(path).convert("RGB"))


def reference(lab):
    h, w = lab.shape[:2]
    core = lab[int(h * .25):int(h * .60), int(w * .35):int(w * .65)].reshape(-1, 3)
    L, A, B = core.T
    C, H = np.hypot(A, B), np.degrees(np.arctan2(B, A))
    k = (L > 40) & (L < 85) & (C > 12) & (H > 35) & (H < 75)
    return np.median(core[k], 0)


def ellipse(shape, cx, cy, rx, ry):
    yy, xx = np.mgrid[0:shape[0], 0:shape[1]]
    return ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1


def refine(w0, L, C, dh, rgb8):
    """Inside the face-and-neck silhouette, take in what the colour rule left out but which is shaded or lit skin:
    dark skin-hued pixels (skin mixed with ink or halftone; under the multiply model the gain maps them correctly, and
    black stays black) and small bright highlights (a nose-tip shine) in holes with no ink in them. The holes that hold
    the eyes and the mouth are left exactly as the colour rule had them, so irises, whites, lashes and lips are never
    touched."""
    from frame import eyes
    e, _ = eyes(rgb8, w0)
    if not e:
        return w0
    core = w0 >= 0.5
    sil = ndimage.binary_fill_holes(ndimage.binary_closing(core, iterations=3))
    hl, hn = ndimage.label(sil & ~core)
    eye_holes = np.isin(hl, [hl[int(round(y)), int(round(x))] for x, y in e if hl[int(round(y)), int(round(x))] > 0])
    # the mouth: the largest hole within a box around the expected mouth position (0.7 to 1.3 eye-distances below
    # the eyes, half an eye-distance either side of the midline); lips stay exactly as the colour rule had them
    (xa, ya), (xb, yb) = e
    d, cx, cy = xb - xa, (xa + xb) / 2, (ya + yb) / 2
    box = hl[int(cy + 0.7 * d): int(cy + 1.3 * d), int(cx - 0.5 * d): int(cx + 0.5 * d)]
    ids, counts = np.unique(box[box > 0], return_counts=True)
    mouth = np.isin(hl, ids[counts.argmax()]) if len(ids) else np.zeros_like(sil)
    inner = sil & ~eye_holes & ~mouth
    w_dark = ramp(C / np.maximum(L, 1), 0.28, 0.38) * (1 - ramp(dh, 18, 28)) * ramp(C, 3, 6)
    sizes = ndimage.sum(np.ones_like(L), hl, range(1, hn + 1))
    inky = ndimage.maximum(L < 35, hl, range(1, hn + 1))
    small = np.isin(hl, 1 + np.flatnonzero((sizes < 200) & ~inky.astype(bool)))
    w_hi = (small & (L > 60) & ((C < 5) | (dh < 30))).astype(float)
    # skin-hued shade just outside the silhouette (a neck shadow that runs into the collar), within 12 px of the
    # skin; L* above 34 keeps dark brown hair out
    near = ndimage.binary_dilation(core, iterations=12) & ~sil & ~eye_holes & ~mouth
    w_near = ramp(L, 34, 40) * ramp(C / np.maximum(L, 1), 0.28, 0.38) * (1 - ramp(dh, 18, 28)) * ramp(C, 8, 12)
    w = np.where(inner, np.maximum(w0, np.maximum(w_dark, w_hi)), w0)
    return np.where(near, np.maximum(w, w_near), w)


def neck(w0, L, C, dh, rgb8):
    """Step 5 (every person): red-side shade below the mouth and on the cheeks."""
    from frame import eyes
    e, _ = eyes(rgb8, w0)
    if not e:
        return w0
    (xa, ya), (xb, yb) = e
    d, cx, cy = xb - xa, (xa + xb) / 2, (ya + yb) / 2
    yy, xx = np.mgrid[0:w0.shape[0], 0:w0.shape[1]]
    # under the mouth, or beside the jaw well clear of the lips
    below = (yy > cy + 1.45 * d) | ((yy > cy + 0.9 * d) & (np.abs(xx - cx) > 0.6 * d))
    core = w0 >= 0.5
    w_neck = ramp(C / np.maximum(L, 1), 0.30, 0.40) * ramp(C, 4, 8) * ramp(dh, -70, -60) * (1 - ramp(dh, 12, 18))
    # a wide shadow can run further than 30 px from the skin: also grow through red-side shade connected to it
    lbl, _ = ndimage.label(below & (core | (w_neck >= 0.3)))
    grown = np.isin(lbl, np.unique(lbl[below & core])[1:])
    region = below & (ndimage.binary_dilation(core, iterations=30) | ndimage.binary_dilation(grown, iterations=2))
    w = np.where(region, np.maximum(w0, w_neck), w0)
    # the cheeks beside the nose and mouth, inside the face outline: red cheek shading; an L* floor keeps hair out
    sil = ndimage.binary_fill_holes(ndimage.binary_closing(core, iterations=6))
    cheeks = sil & (yy > cy + 0.25 * d) & (yy <= cy + 0.9 * d) & (np.abs(xx - cx) > 0.55 * d)
    return np.where(cheeks, np.maximum(w, w_neck * ramp(L, 22, 28)), w)


def mask(rgb8, name=None):
    lab = rgb2lab(rgb8 / 255.0)
    ref = reference(lab)
    L, A, B = lab[..., 0], lab[..., 1], lab[..., 2]
    C = np.hypot(A, B)
    H = np.degrees(np.arctan2(B, A))
    href = np.degrees(np.arctan2(ref[2], ref[1]))
    dh = np.abs((H - href + 180) % 360 - 180)
    w = ramp(L, 30, 42) * ramp(C / np.maximum(L, 1), 0.28, 0.38) * (1 - ramp(dh, 9, 16)) * ramp(C, 8, 12)
    lbl, n = ndimage.label(w >= 0.5)
    sizes = ndimage.sum(np.ones_like(w), lbl, range(1, n + 1))
    keep = np.isin(lbl, 1 + np.flatnonzero(sizes > 150))
    keep = ndimage.binary_dilation(keep, iterations=2)
    w = np.where(keep, w, 0.0)
    w = refine(w, L, C, dh, rgb8)
    if name and re.fullmatch(r"([a-z]+/)?(s[1-8]-[wm]-c\d+|o\d+-[wm])", name):  # every person: casts (story.key), one-offs
        dhs = (H - href + 180) % 360 - 180
        w = neck(w, L, C, dhs, rgb8)
    edits = json.load(open(EDITS)).get(name, {}) if (name and os.path.exists(EDITS)) else {}
    for e in edits.get("exclude", []):
        w[ellipse(w.shape, *e)] = 0.0
    for e in edits.get("include", []):
        r = ellipse(w.shape, *e)
        w[r] = np.maximum(w[r], ramp(L, 30, 42)[r] * ramp(C / np.maximum(L, 1), 0.28, 0.38)[r])
    return w.astype(np.float64), ref
