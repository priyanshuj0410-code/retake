"""Framing: every portrait is cropped so the eyes sit at the same place and the same distance apart.

The generator draws some people smaller in the frame than others (in the pilot the women came out smaller). Head
size is a cue in its own right, so each base is cropped to a square whose side is a fixed multiple of the distance
between the eyes, with the midpoint of the eyes at a fixed point. Eyes are found deterministically: the whites of the
eyes (L* > 75, chroma < 16, not skin) inside the face's bounding box above 55% of the image height, merged per eye by dilation
(8 px; then 6, 10, 12 px if no pair is found), and the largest pair side by side at the same height,
55 to 130 px apart, between 20% and 55% of the image height (centres of the whites, so the gaze direction can
move them by a pixel or two). masks.json may override them ("eyes": [[x, y], [x, y]]) where the rule fails; every override is listed.
The crop box is a function of the base only, so all tone variants of a base share it pixel for pixel.
"""
import json
import os

import numpy as np
from scipy import ndimage

from backdrop import BACKDROP
from colour import hex2lab, rgb2lab

EYE_SPAN = 5.2      # crop side = 5.2 x the distance between the eye centres
EYE_Y = 0.38        # eye midpoint at 38% of the crop height, centred horizontally
EDITS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "masks.json")


def eyes(rgb8, w, name=None):
    edits = json.load(open(EDITS)).get(name, {}) if (name and os.path.exists(EDITS)) else {}
    if "eyes" in edits:
        return [tuple(p) for p in edits["eyes"]], "manual"
    lab = rgb2lab(rgb8 / 255.0)
    skin = w > 0.5
    lbl, n = ndimage.label(skin)
    h = skin.shape[0]
    # the face: the skin component with most pixels in the upper 60% of the frame
    counts = ndimage.sum(skin[: int(h * .6)], lbl[: int(h * .6)], range(1, n + 1))
    face = lbl == 1 + int(np.argmax(counts))
    ys, xs = np.nonzero(face[: int(h * .6)])
    y0, x0, x1 = ys.min(), xs.min(), xs.max()
    C = np.hypot(lab[..., 1], lab[..., 2])
    white = (lab[..., 0] > 75) & (C < 16) & ~skin
    box = np.zeros_like(white)
    box[y0: int(0.55 * h), x0: x1 + 1] = True
    white &= box
    for it in (8, 6, 10, 12):
        found = _pair(white, it, h)
        if found:
            return found, f"auto (merge {it} px)"
    return None, "not found"


def _pair(white, it, h):
    # whites split by the iris are merged into one eye by dilation before labelling
    wl, wn = ndimage.label(ndimage.binary_dilation(white, iterations=it))
    if wn < 2:
        return None
    sizes = ndimage.sum(white, wl, range(1, wn + 1))
    order = np.argsort(sizes)[::-1][:10]
    cents = [ndimage.center_of_mass(white, wl, i + 1) for i in order]
    best = None
    for i in range(len(cents)):
        for j in range(i + 1, len(cents)):
            (ya, xa), (yb, xb) = cents[i], cents[j]
            plausible = 55 <= abs(xa - xb) <= 130 and 0.2 * h <= min(ya, yb) and max(ya, yb) <= 0.55 * h
            if abs(ya - yb) < 12 and plausible and min(sizes[order[i]], sizes[order[j]]) >= 15:
                score = sizes[order[i]] + sizes[order[j]]
                if best is None or score > best[0]:
                    best = (score, sorted([(xa, ya), (xb, yb)]))
    return best[1] if best else None


def crop_box(eye_pts, base8=None):
    """Square crop, side EYE_SPAN x eye distance, eye midpoint at (0.5, EYE_Y). Where the box leaves the 512 px image
    it is padded with the backdrop colour, unless the strip it would pad holds something other than backdrop (hair at
    the top edge, shoulders at a side, the shirt at the bottom): then the box is shifted back inside on that axis,
    which moves the eyes slightly in the frame. Returns the box and a note of any shift."""
    (xa, ya), (xb, yb) = eye_pts
    d = np.hypot(xb - xa, yb - ya)
    side = EYE_SPAN * d
    cx, cy = (xa + xb) / 2, (ya + yb) / 2
    x0, y0 = cx - side / 2, cy - EYE_Y * side
    note = []
    if base8 is not None:
        n = base8.shape[0]
        lab = rgb2lab(base8 / 255.0)
        bg = np.linalg.norm(lab - hex2lab(BACKDROP), axis=-1) < 6
        lo, hi = int(max(x0, 0)), int(min(x0 + side, n))
        if y0 < 0 and not bg[0, lo:hi].all():
            note.append(f"down {-y0:.1f}")
            y0 = 0.0
        if y0 + side > n:
            note.append(f"up {y0 + side - n:.1f}")
            y0 = n - side
        top, bot = int(max(y0, 0)), int(min(y0 + side, n))
        if x0 < 0 and not bg[top:bot, 0].all():
            note.append(f"right {-x0:.1f}")
            x0 = 0.0
        if x0 + side > n and not bg[top:bot, n - 1].all():
            note.append(f"left {x0 + side - n:.1f}")
            x0 = n - side
    return (x0, y0, x0 + side, y0 + side), "; ".join(note)
