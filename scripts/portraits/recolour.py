"""Skin tone by recolour only: four shades of one base, changed inside the skin mask and nowhere else.

The model is "flat colour under multiplied ink and halftone", which is how the comic is drawn. Inside the mask every
pixel is multiplied, in linear RGB, by one per-channel gain that takes the base's mid-skin colour (the mask reference)
exactly to the target colour. Ratios between pixels are kept, so shading, halftone dots and ink lines keep their
relative depth; black stays black. A soft shoulder above 0.92 linear stops lightened highlights from clipping flat.
Partial mask weights blend the recoloured and original pixel (anti-aliased edges). A pixel with weight 0 is copied
byte for byte from the base, so the difference outside the mask is exactly 0 by construction, and check.py proves it.
"""
import numpy as np

from colour import hex2lab, lab2rgb, lin2srgb, srgb2lin

# lightest to darkest, the targets for the mid-skin colour. Owner, 20 Oct 2026: the darkest tone was too dark and the
# steps uneven (L* 82.4 / 71.4 / 47.4 / 32.5, steps 11.0, 24.0, 14.9). Now even steps of about 14.8 in CIELAB L*:
# l1 kept, d2 raised to L* 38, l2 and d1 between, with a* and b* interpolated in L* along the old tones (one-off m
# included), so hue and chroma follow the old curve. The one-offs' m (L* 59.8) sits between l2 and d1.
# Before: {"t1": "#EDC6A2", "t2": "#D9A47B", "t3": "#9A6440", "t4": "#6B4329"}
TONES = {"t1": "#EDC6A2", "t2": "#D09970", "t3": "#A9724B", "t4": "#7C4F31"}  # L* 82.4, 67.5, 52.9, 38.0


def shoulder(x, k=0.92):
    return np.where(x > k, k + (1 - k) * np.tanh((x - k) / (1 - k)), x)


def recolour(rgb8, w, ref_lab, target_hex):
    base = srgb2lin(rgb8 / 255.0)
    g = srgb2lin(lab2rgb(hex2lab(target_hex))) / srgb2lin(lab2rgb(np.asarray(ref_lab, float)))
    new = shoulder(base * g)
    mixed = lin2srgb(w[..., None] * new + (1 - w[..., None]) * base)
    out = np.round(mixed * 255).astype(np.uint8)
    return np.where((w > 0)[..., None], out, rgb8)
