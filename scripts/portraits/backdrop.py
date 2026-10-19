"""One backdrop for everyone: the generator's pale lavender varies a little from picture to picture, so each base's
backdrop is shifted to one fixed colour before anything else. The backdrop colour of a base is the median of a 6 px
border strip along the top and the upper sides. Pixels connected to the border and within Delta E 10 of that colour
take the full shift; the shift fades to 0 at Delta E 22 (anti-aliased edges against the ink outline). Nothing on the
person is near the lavender, so the person is untouched. This runs on the base, so every tone shares it.
"""
import numpy as np
from scipy import ndimage

from colour import hex2lab, lab2rgb, rgb2lab

BACKDROP = "#DCD0EE"


def backdrop(rgb8):
    lab = rgb2lab(rgb8 / 255.0)
    h, w = lab.shape[:2]
    strip = np.concatenate([lab[:6].reshape(-1, 3), lab[: h // 2, :6].reshape(-1, 3), lab[: h // 2, -6:].reshape(-1, 3)])
    old = np.median(strip, 0)
    de = np.linalg.norm(lab - old, axis=-1)
    lbl, _ = ndimage.label(de < 22)
    border = np.unique(np.concatenate([lbl[0], lbl[:, 0], lbl[:, -1]]))
    region = np.isin(lbl, border[border > 0])
    k = np.where(region, np.clip((22 - de) / 12, 0, 1), 0.0)
    new = lab + k[..., None] * (hex2lab(BACKDROP) - old)
    out = np.round(lab2rgb(new) * 255).astype(np.uint8)
    out = np.where((k > 0)[..., None], out, rgb8)
    return out, dict(old_backdrop_lab=[round(float(v), 2) for v in old], pixels_shifted=int((k > 0).sum()))
