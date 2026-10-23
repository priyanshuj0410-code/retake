"""Procedural textures for the metal finish (O14) in Lugdi and Station, carried from the premium study's three throwaway
scripts (make_textures.py, make_textures_v2.py, make_station_textures.py) so they survive outside a session folder.
Same seeds and code, so a run reproduces the shipped files. No source images, no image models.
  lugdi-stock.webp     heavy uncoated stock overlay (the study's second pass; the first pass's stock is dropped)
  lugdi-laminate.png   fine grey grain for the painting's laminate
  lugdi-brass.webp     spun brass for the issue and score badges and the rims of the round buttons and switches
  lugdi-foil.webp      champagne gold foil for the cover title
  station-alu.webp     brushed anodised aluminium overlay for the split-flaps
  station-fibre.webp   fine fibre overlay for the ticket card
Every texture tiles (every blur wraps around). Usage: python3 art/metal_textures.py [--out <dir>] [--no-sidecars]
(default out: design-system/assets, each with a sidecar .json)."""
import sys
import json
import datetime
from pathlib import Path
import numpy as np
from PIL import Image

DS = Path(__file__).resolve().parent.parent
OUT = Path(sys.argv[sys.argv.index('--out') + 1]) if '--out' in sys.argv else DS / 'assets'
SIDECARS = '--no-sidecars' not in sys.argv
OUT.mkdir(parents=True, exist_ok=True)
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds')


def wrap_blur(a, sy, sx=None):
    """Gaussian blur by FFT (wraps, so the result tiles); sx differs from sy for brushed, anisotropic grain."""
    sx = sy if sx is None else sx
    h, w = a.shape
    fy = np.fft.fftfreq(h)[:, None]
    fx = np.fft.fftfreq(w)[None, :]
    g = np.exp(-2 * (np.pi ** 2) * ((sx * fx) ** 2 + (sy * fy) ** 2))
    return np.real(np.fft.ifft2(np.fft.fft2(a) * g))


def norm(a):
    a = a - a.mean()
    return a / (np.abs(a).max() + 1e-9)


def sidecar(name, world, method, params, used_by):
    if not SIDECARS:
        return
    meta = {
        'prompt': f'Origin: procedural texture drawn in Python (numpy, PIL), first for the {world} premium side study; no source image, no generator.',
        'method': method,
        'parameters': params,
        'script': 'design-system/art/metal_textures.py',
        'usedBy': used_by,
        'createdAt': NOW,
    }
    (OUT / f'{name}.json').write_text(json.dumps(meta, indent=2) + '\n')


def overlay(v, cap, dark=(0, 0, 0), light=(255, 255, 255)):
    """Signed field to an RGBA overlay: negative values darken, positive values lighten, alpha is the magnitude."""
    v = v / (np.abs(v).max() + 1e-9)
    rgba = np.zeros(v.shape + (4,))
    neg = v < 0
    rgba[neg, :3] = dark
    rgba[~neg, :3] = light
    rgba[..., 3] = np.clip(np.abs(v) * cap * 1.6, 0, cap)
    return Image.fromarray(rgba.astype(np.uint8))


def lugdi_stock(seed=314, size=512, cap=14):
    rng = np.random.default_rng(seed)
    mottle = norm(wrap_blur(rng.normal(size=(size, size)), 26)) * 0.22
    tooth = norm(wrap_blur(rng.normal(size=(size, size)), 0.6)) * 0.55
    fib = np.zeros((size, size))
    for _ in range(260):
        x, y = rng.uniform(0, size, 2)
        ang = rng.normal(0.1, 0.35)
        ln = rng.uniform(5, 14)
        val = rng.choice([-1, 1]) * rng.uniform(0.3, 0.7)
        for t in np.linspace(0, ln, int(ln * 2)):
            fib[int(y + t * np.sin(ang)) % size, int(x + t * np.cos(ang)) % size] += val
    fib = norm(wrap_blur(fib, 0.5)) * 0.35
    v = mottle + tooth + fib
    v = v / np.abs(v).max()
    rgba = np.zeros((size, size, 4))
    dark = v < 0
    rgba[dark, :3] = (23, 17, 15)
    rgba[~dark, :3] = (255, 252, 244)
    rgba[..., 3] = np.clip(np.abs(v) * cap * 1.6, 0, cap)
    Image.fromarray(rgba.astype(np.uint8)).save(OUT / 'lugdi-stock.webp', lossless=True)
    sidecar('lugdi-stock.webp', 'Lugdi', 'Tileable RGBA overlay for heavy uncoated stock: wrap-around Gaussian tooth (sigma 0.6 px, 55%), a faint mottle (sigma 26 px, 22%) '
            'and 260 short fibres (5 to 14 px along the grain, 35%). Negative values are press ink, positive values paper white; alpha is the magnitude, capped at 14 of 255, '
            'so the stock reads as a fine tooth, not as blotches or specks.',
            {'seed': seed, 'size': size, 'alphaCap': cap},
            'library.css, Lugdi metal finish: every paper surface (cards, plates, captions, the coupon button, the list page, the sheet, dialog, menu and toast), drawn at 256 px over --paper.')


def lugdi_laminate(seed=215, size=256):
    rng = np.random.default_rng(seed)
    g = norm(wrap_blur(rng.normal(size=(size, size)), 0.55)) * 0.8 + norm(wrap_blur(rng.normal(size=(size, size)), 3)) * 0.2
    g = g / np.abs(g).max()
    Image.fromarray(np.clip(128 + g * 60, 0, 255).astype(np.uint8)).save(OUT / 'lugdi-laminate.png', optimize=True)
    sidecar('lugdi-laminate.png', 'Lugdi', 'Tileable grey grain centred on mid grey: wrap-around Gaussian noise at sigma 0.55 px (80%) and 3 px (20%), +/-60 levels. '
            'Mid grey is neutral under soft-light, so the grain adds texture without shifting the painting\'s tone.',
            {'seed': seed, 'size': size, 'amplitude': 60},
            'library.css, Lugdi metal finish: the laminate over every Lugdi painting (phone .art and the app\'s .art-img), a 128 px tile under one soft specular band from the top left, '
            'the pair blended soft-light at 55% opacity.')


def lugdi_brass(seed=216, size=512):
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:size, 0:size] + 0.5
    cx = cy = size / 2
    r = np.hypot(xx - cx, yy - cy)
    th = np.arctan2(yy - cy, xx - cx)
    rings_1d = norm(np.convolve(rng.normal(size=size * 2), np.ones(3) / 3, mode='same'))
    rings = rings_1d[np.clip((r * 2).astype(int), 0, size * 2 - 1)]
    light = -3 * np.pi / 4  # top left in screen coordinates
    lobes = (np.cos(2 * (th - light)) * 0.5 + 0.5) ** 3
    side = np.cos(th - light) * 0.5 + 0.5
    v = np.clip(0.42 + 0.30 * lobes + 0.16 * side + 0.06 * rings, 0, 1)
    shadow = np.array([122, 98, 56])
    mid = np.array([196, 168, 112])
    hi = np.array([246, 234, 204])
    col = np.where(v[..., None] < 0.55, shadow + (mid - shadow) * (v[..., None] / 0.55), mid + (hi - mid) * ((v[..., None] - 0.55) / 0.45))
    Image.fromarray(np.clip(col, 0, 255).astype(np.uint8)).save(OUT / 'lugdi-brass.webp', quality=90)
    sidecar('lugdi-brass.webp', 'Lugdi', 'Radial brushed (spun) brass: 1D smoothed noise mapped to radius for the fine rings, cos(2 theta) highlight lobes and a cos(theta) side light, '
            'both aimed at the top left (the one light), mapped through shadow #7A6238, mid #C4A870 and highlight #F6EACC.',
            {'seed': seed, 'size': size, 'light': 'top left'},
            'library.css, Lugdi metal finish: the spun-brass rim of the issue roundel, the score roundel, the milestone and the change stamp, and the 1 px brass rim '
            'of the round buttons, the streak pill, the language switch and the board switch.')


def lugdi_foil(seed=315, w=1024, h=256):
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(float)
    brushed = norm(wrap_blur(rng.normal(size=(h, w)), 0.45, 48))
    broad = norm(wrap_blur(rng.normal(size=(h, w)), 40, 90))
    ang = np.deg2rad(24)
    d = (xx - 0.30 * w) * np.cos(ang) + (yy - 0.5 * h) * np.sin(ang)
    band = 0.45 * np.exp(-(d / (0.09 * w)) ** 2) + 0.55 * np.exp(-(d / (0.008 * w)) ** 2)
    top = 1 - yy / h
    v = np.clip(0.50 + 0.04 * broad + 0.035 * brushed + 0.40 * band + 0.16 * top, 0, 1)
    stops = [(0.0, (200, 170, 110)), (0.45, (231, 208, 150)), (0.6, (242, 226, 184)), (0.78, (252, 245, 222)), (1.0, (255, 255, 250))]
    out = np.zeros((h, w, 3))
    for (a, ca), (b, cb) in zip(stops[:-1], stops[1:]):
        m = (v >= a) & (v <= b)
        t = ((v - a) / (b - a))[m][:, None]
        out[m] = np.array(ca) * (1 - t) + np.array(cb) * t
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(OUT / 'lugdi-foil.webp', quality=92)
    sidecar('lugdi-foil.webp', 'Lugdi', 'Champagne gold foil: anisotropic wrap-around noise (sigma 0.45 px across, 48 px along) for the brushed grain, a slow broad sheen (sigma 40 by 90 px), '
            'one specular band tilted 24 degrees from the top left (a soft body 9% of the width plus a crisp core 0.8% wide) and a top-lit gradient, '
            'mapped through #C8AA6E, #E7D096, #F2E2B8, #FCF5DE and #FFFFFA. The CSS color of the title is the foil\'s 10th-percentile tone (#EBD7A4), '
            'so the contrast check measures the darker foil, not the highlight.',
            {'seed': seed, 'size': [w, h], 'bandAngleDeg': 24, 'bandCentre': 0.30},
            'library.css, Lugdi metal finish: the cover title, filled through background-clip: text and still worn by the ink mask.')


def station_alu(seed=4211, w=512, h=128, cap=22):
    rng = np.random.default_rng(seed)
    strokes = norm(wrap_blur(rng.normal(size=(h, w)), 0.35, 60))
    fine = norm(wrap_blur(rng.normal(size=(h, w)), 0.3, 6))
    drift = norm(wrap_blur(rng.normal(size=(h, w)), 18, 120))
    overlay(0.62 * strokes + 0.26 * fine + 0.12 * drift, cap).save(OUT / 'station-alu.webp', lossless=True)
    sidecar('station-alu.webp', 'Station',
            'Tileable RGBA overlay for brushed, anodised aluminium: wrap-around anisotropic noise, long strokes (sigma 0.35 px across, 60 px along, 62%), '
            'a short tooth (sigma 0.3 by 6 px, 26%) and a slow drift (sigma 18 by 120 px, 12%). Negative values are black, positive values white; '
            'alpha is the magnitude, capped at 22 of 255, so on the graphite flap colours the grain reads as a fine machined finish, never as noise.',
            {'seed': seed, 'size': [w, h], 'alphaCap': cap},
            'library.css, Station metal finish: every split-flap tile (the cover train number, the result score, the board ranks) and the toast, drawn at 256 x 64 px over the flap gradient.')


def station_fibre(seed=4212, size=512, cap=13):
    rng = np.random.default_rng(seed)
    mottle = norm(wrap_blur(rng.normal(size=(size, size)), 30)) * 0.20
    tooth = norm(wrap_blur(rng.normal(size=(size, size)), 0.55)) * 0.50
    fib = np.zeros((size, size))
    for _ in range(420):
        x, y = rng.uniform(0, size, 2)
        ang = rng.uniform(0, np.pi)
        ln = rng.uniform(4, 12)
        val = rng.choice([-1, 1], p=[0.35, 0.65]) * rng.uniform(0.3, 0.8)
        for t in np.linspace(0, ln, int(ln * 2)):
            fib[int(y + t * np.sin(ang)) % size, int(x + t * np.cos(ang)) % size] += val
    fib = norm(wrap_blur(fib, 0.45)) * 0.40
    overlay(mottle + tooth + fib, cap, dark=(70, 52, 24), light=(255, 252, 240)).save(OUT / 'station-fibre.webp', lossless=True)
    sidecar('station-fibre.webp', 'Station',
            'Tileable RGBA overlay for thick Edmondson card: wrap-around Gaussian tooth (sigma 0.55 px, 50%), a faint mottle (sigma 30 px, 20%) and 420 short fibres '
            '(4 to 12 px, every direction, two in three lighter than the card) at 40%. Negative values are a warm umber, positive values card white; alpha is the magnitude, '
            'capped at 13 of 255, so the stock reads as fine fibre under the type and never lowers the ink contrast measurably.',
            {'seed': seed, 'size': size, 'alphaCap': cap},
            'library.css, Station metal finish: every ticket surface (person cards, the cover and result plates, the stamped ticket, the next line, the week\'s day tickets), '
            'drawn at 256 px over the ticket colour.')


lugdi_stock()
lugdi_laminate()
lugdi_brass()
lugdi_foil()
station_alu()
station_fibre()
print('written to', OUT)
