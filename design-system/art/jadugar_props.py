"""Jadugar's painted props and paper, drawn procedurally (numpy only, a few MB of memory, no model load).

    python3 art/jadugar_props.py            writes every file below into assets/
    python3 art/jadugar_props.py cloth      writes only the names that contain 'cloth'

The look follows the house painting style of the Jadugar scenes: a 1960s chromolithograph, so flat crimson and old-gold
inks with soft airbrushed blends between them, bold dark outlines, a little faded, paper grain.

jadugar-cloth-cover.webp     the show cloth hanging flat over the result's bill: velvet folds, gold cord, gold fringe
jadugar-cloth-gathered.webp  the same cloth drawn back and bunched at the bill's right edge, tied with a gold rope
jadugar-banner.webp          the cover title's hanging banner: the same velvet in its darker inks, so gold lettering holds
jadugar-fringe.webp          a seamless strip of the gold fringe, for the banner's foot
jadugar-cord.webp            a seamless strip of the twisted gold cord, for the banner's head
jadugar-box-frame.webp       9-slice frame (slice 24 of 96): a lacquered crimson box face, gold trim, brass corner caps
jadugar-basket-frame.webp    9-slice frame (slice 24 of 96): a woven cane panel with a wrapped cane rim
tex-cardstock.webp           256 px seamless linen-embossed playing-card stock, an overlay laid over the card colour
tex-showpaint.webp           256 px seamless dry-brush wear mask for the cover title"""
import json, os, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(os.path.dirname(HERE), 'assets')
ORIGIN = ('Origin: procedural, drawn in Python by art/jadugar_props.py (numpy folds, weave and grain in the Jadugar '
          'chromolithograph inks); no source image, no generator model.')


def hexrgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], dtype=float)


VELVET = [hexrgb(h) for h in ('#22030B', '#470817', '#6A0E22', '#8A172E', '#A3203A', '#BC2C45')]
DARK_VELVET = VELVET[:5]
GOLD = [hexrgb(h) for h in ('#4E3712', '#7A5A22', '#A88236', '#CDA756', '#EED394')]
OUTLINE = hexrgb('#160207')
CREAM = hexrgb('#F6F1E4')


def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def inks(t, pal):
    """Flat inks with a short airbrushed blend between neighbours: the chromolithograph posterisation."""
    n = len(pal)
    q = np.clip(t, 0, 0.9999) * (n - 1)
    i = np.floor(q).astype(int)
    s = smooth(0.38, 0.62, q - i)[..., None]
    P = np.stack(pal)
    j = np.minimum(i + 1, n - 1)
    return P[i] * (1 - s) + P[j] * s


def lowfreq(h, w, scale, seed):
    """Smooth noise field (zero mean, unit spread) for mottling and wobble."""
    g = np.random.default_rng(seed).standard_normal((max(2, h // scale + 3), max(2, w // scale + 3)))
    im = Image.fromarray(((g - g.min()) / (np.ptp(g) + 1e-9) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    a = np.asarray(im, dtype=float)
    return (a - a.mean()) / (a.std() + 1e-9)


def finish(rgb, alpha=None, seed=0, grain=5.0, fade=0.05):
    """Paper grain, a faint fade towards cream and a little mottling, as on the printed scenes."""
    h, w = rgb.shape[:2]
    rng = np.random.default_rng(seed)
    rgb = rgb + rng.normal(0, grain, (h, w, 1)) + 2 * lowfreq(h, w, 24, seed + 1)[..., None]
    rgb = rgb * (1 - fade) + CREAM * fade
    rgb = np.clip(rgb, 0, 255).astype(np.uint8)
    if alpha is None:
        return Image.fromarray(rgb, 'RGB')
    a = np.clip(alpha * 255, 0, 255).astype(np.uint8)
    return Image.fromarray(np.dstack([rgb, a]), 'RGBA')


def velvet(W, H, k, seed, pal, x0=None, glow=(0.5, 0.0)):
    """Hanging velvet: vertical folds of uneven width that deepen towards the hem, lit from the upper left, with a
    dark painted outline down each valley. x0 (array per row, 0..1) is the cloth's left edge for a gathered shape."""
    X, Y = np.meshgrid((np.arange(W) + .5) / W, (np.arange(H) + .5) / H)
    rng = np.random.default_rng(seed)
    if x0 is None:
        U = X.copy()
    else:
        L = x0[:, None]
        U = np.clip((X - L) / np.maximum(1 - L, 1e-3), 0, 1)
    warp = sum(rng.uniform(.012, .03) * np.sin(2 * np.pi * (f * U + rng.uniform())) for f in (1.3, 2.1, 3.4))
    U2 = U + warp + 0.025 * np.sin(2 * np.pi * (1.4 * U + .2)) * Y
    ph = 2 * np.pi * k * U2
    deep = 0.7 + 0.3 * Y
    hgt = np.sin(ph) * deep + 0.28 * np.sin(2 * ph + 1.1 + .8 * Y)
    slope = np.cos(ph) * deep + 0.56 * np.cos(2 * ph + 1.1 + .8 * Y)
    t = 0.50 + 0.26 * hgt / 1.3 - 0.20 * slope / 1.6
    t -= 0.22 * np.clip(-hgt, 0, None) ** 2
    gx, gy = glow
    t += 0.14 * np.exp(-((X - gx) ** 2 / .09 + (Y - gy) ** 2 / .35))
    t -= 0.20 * (1 - Y) ** 14
    t += 0.012 * lowfreq(H, W, 40, seed + 5)
    rgb = inks(np.clip(t, 0, 1), pal)
    # painted outline down each valley, thicker where the folds hang deep
    period = W * (1 if x0 is None else (1 - x0[:, None])) / k
    d = np.abs(((ph - 1.5 * np.pi) + np.pi) % (2 * np.pi) - np.pi) / (2 * np.pi) * period
    wline = (0.7 + 1.5 * Y) * W / 600 * 2
    line = np.exp(-(d / np.maximum(wline, .6)) ** 2) * 0.85 * smooth(0.0, 0.18, Y)
    rgb = rgb * (1 - line[..., None]) + OUTLINE * line[..., None]
    # a thin sheen just left of each crest
    dc = np.abs(((ph - 0.42 * np.pi) + np.pi) % (2 * np.pi) - np.pi) / (2 * np.pi) * period
    sheen = np.exp(-(dc / np.maximum(wline * .8, .5)) ** 2) * 0.35 * smooth(0.05, 0.4, Y)
    rgb = rgb * (1 - sheen[..., None]) + pal[-1] * sheen[..., None]
    return rgb, U


def cord(rgb, y0, y1, period, phase=0.0, x_from=0):
    """A twisted gold cord across the image between rows y0 and y1, outlined dark."""
    H, W = rgb.shape[:2]
    yy, xx = np.mgrid[y0:y1, x_from:W].astype(float)
    v = (yy - y0 + .5) / (y1 - y0)
    tw = np.sin(2 * np.pi * ((xx + 1.6 * (yy - y0)) / period + phase))
    t = 0.55 + 0.25 * tw + 0.25 * np.sin(np.pi * v) - 0.15
    col = inks(np.clip(t, 0, 1), GOLD)
    edge = np.clip(1 - np.minimum(yy - y0, y1 - 1 - yy) / 1.5, 0, 1)
    col = col * (1 - edge[..., None]) + OUTLINE * edge[..., None]
    rgb[y0:y1, x_from:] = col


def fringe(rgb, alpha, top, x_lo, x_hi, length, pitch, seed, lining=None):
    """Gold bullion fringe: a twisted header band, then hanging strands with shaded round bodies."""
    H, W = rgb.shape[:2]
    rng = np.random.default_rng(seed)
    band = max(4, round(length * 0.3))
    for y in range(top, min(H, top + band)):
        lo, hi = int(x_lo[y]), int(x_hi[y])
        if hi <= lo:
            continue
        xs = np.arange(lo, hi, dtype=float)
        v = (y - top + .5) / band
        t = 0.5 + 0.28 * np.sin(2 * np.pi * (xs - 1.4 * (y - top)) / (pitch * 1.6)) + 0.2 * np.sin(np.pi * v) - 0.1
        c = inks(np.clip(t, 0, 1)[None, :], GOLD)[0]
        if y - top < 1.5 or top + band - 1 - y < 1.5:
            c = OUTLINE[None, :].repeat(len(xs), 0)
        rgb[y, lo:hi] = c
        alpha[y, lo:hi] = 1
    s0 = top + band
    for y in range(s0, H):
        lo, hi = int(x_lo[min(y, H - 1)]), int(x_hi[min(y, H - 1)])
        if lining is None:
            alpha[y, lo:hi] = 0
        else:
            rgb[y, lo:hi] = lining
            alpha[y, lo:hi] = 1
    lo0, hi0 = int(x_lo[s0:].min()) if s0 < H else 0, int(x_hi[s0:].max()) if s0 < H else 0
    x = lo0 + pitch / 2
    while x < hi0:
        ln = (length - band) * rng.uniform(.82, 1.0)
        sway = rng.uniform(-.6, .6)
        for y in range(s0, min(H, int(s0 + ln))):
            v = (y - s0) / max(ln, 1)
            cx = x + sway * v * 2
            half = pitch * 0.36 * (1 - 0.35 * v ** 3)
            xa, xb = int(np.floor(cx - half - 1)), int(np.ceil(cx + half + 1))
            for xi in range(max(xa, int(x_lo[y])), min(xb, int(x_hi[y]))):
                u = (xi + .5 - cx) / half
                if abs(u) > 1.15:
                    continue
                if abs(u) > .8:
                    c = OUTLINE
                else:
                    t = 0.62 - 0.38 * u - 0.25 * v
                    c = inks(np.array([[np.clip(t, 0, 1)]]), GOLD)[0, 0]
                a = 1.0 if abs(u) <= 1 else (1.15 - abs(u)) / .15
                rgb[y, xi] = c * a + rgb[y, xi] * (1 - a) if alpha[y, xi] else c
                alpha[y, xi] = max(alpha[y, xi], a)
        x += pitch


def cloth_cover():
    W, H = 600, 320
    rgb, _ = velvet(W, H, 6.5, 214, VELVET, glow=(.42, .05))
    alpha = np.ones((H, W))
    cord(rgb, 0, 7, 10)
    fl = 44
    fringe(rgb, alpha, H - fl, np.zeros(H), np.full(H, W), fl, 9, 5, lining=VELVET[0])
    return finish(rgb, None, 11)


def cloth_gathered():
    W, H = 112, 320
    Y = (np.arange(H) + .5) / H
    tie = 0.44
    # silhouette: full at the rod, pinched at the tie, flaring above the hem
    width = np.where(Y < tie, 1 - 0.46 * smooth(0, tie, Y) ** 1.2, 0.54 + 0.30 * smooth(tie, 0.92, Y))
    x0 = 1 - width
    rgb, U = velvet(W, H, 2.6, 215, VELVET, x0=x0, glow=(.8, .1))
    X = (np.arange(W) + .5) / W
    edge_px = (X[None, :] - x0[:, None]) * W
    alpha = smooth(-0.6, 0.6, edge_px)
    # the cloth turns away at its free edge: darken, then outline it
    turn = np.exp(-np.clip(edge_px, 0, None) / 7.0)[..., None]
    rgb = rgb * (1 - .55 * turn) + VELVET[0] * .55 * turn
    ol = np.exp(-(edge_px / 1.6) ** 2)[..., None] * .9
    rgb = rgb * (1 - ol) + OUTLINE * ol
    cord(rgb, 0, 7, 10)
    # the gold rope tie-back, sagging a little across the pinch, then its tassel on the free side
    yt = int(tie * H)
    th = 13
    for xi in range(W):
        if X[xi] < x0[yt] - .02:
            continue
        sag = int(round(3 * np.sin(np.pi * np.clip((X[xi] - x0[yt]) / (1 - x0[yt]), 0, 1))))
        for y in range(yt - th // 2 + sag, yt + th // 2 + sag):
            v = (y - (yt - th // 2 + sag) + .5) / th
            t = 0.52 + 0.3 * np.sin(2 * np.pi * (xi * 1.0 + 2.2 * y) / 9) + 0.22 * np.sin(np.pi * v) - 0.12
            c = inks(np.array([[np.clip(t, 0, 1)]]), GOLD)[0, 0]
            if v < .1 or v > .9:
                c = OUTLINE
            rgb[y, xi] = c
            alpha[y, xi] = 1
    kx, ky = int(x0[yt] * W) + 5, yt + 5
    yy, xx = np.mgrid[0:H, 0:W]
    knot = ((xx - kx) ** 2 + (yy - ky) ** 2) ** .5
    m = knot < 6.5
    t = 0.75 - 0.05 * (xx - kx) - 0.05 * (yy - ky)
    rgb[m] = inks(np.clip(t, 0, 1), GOLD)[m]
    rgb[(knot >= 5.5) & (knot < 7)] = OUTLINE
    alpha[knot < 7] = 1
    for i, dx in enumerate(range(-5, 6, 2)):
        ln = 38 + (3 if i % 2 else 0)
        for y in range(ky + 6, ky + 6 + ln):
            v = (y - ky - 6) / ln
            cx = kx + dx * (1 + 0.9 * v)
            for xi in range(int(cx - 2), int(cx + 3)):
                if 0 <= xi < W:
                    u = (xi + .5 - cx) / 1.4
                    if abs(u) > 1.3:
                        continue
                    rgb[y, xi] = OUTLINE if abs(u) > .9 else inks(np.array([[np.clip(.66 - .3 * u - .25 * v, 0, 1)]]), GOLD)[0, 0]
                    alpha[y, xi] = 1
    fl = 44
    lo = x0 * W
    fringe(rgb, alpha, H - fl, lo, np.full(H, W), fl, 7, 6)
    return finish(rgb, alpha, 12)


def banner():
    """The banner's velvet alone, in the darker inks; its cord and fringe are the repeating strips below, so they keep
    their size however tall the title runs."""
    W, H = 640, 160
    rgb, _ = velvet(W, H, 7.5, 216, DARK_VELVET, glow=(.3, .1))
    return finish(rgb, None, 13)


def fringe_strip():
    """A seamless strip of gold bullion fringe (64 x 36, shown at 32 x 18): braid, strands, open gaps between them."""
    W, H = 64, 36
    rgb = np.zeros((H, W, 3))
    alpha = np.zeros((H, W))
    fringe(rgb, alpha, 0, np.zeros(H), np.full(H, W), H, 8, 8)
    return finish(rgb, alpha, 14, grain=3, fade=.02)


def cord_strip():
    """A seamless strip of twisted gold cord (40 x 8, shown at 20 x 4) for the banner's top edge."""
    rgb = np.zeros((8, 40, 3))
    cord(rgb, 0, 8, 10)
    return finish(rgb, None, 15, grain=3, fade=.02)


def frame_dist(N):
    yy, xx = np.mgrid[0:N, 0:N].astype(float) + .5
    return np.minimum(np.minimum(xx, yy), np.minimum(N - xx, N - yy)), xx, yy


def box_frame():
    N, S = 96, 24
    d, xx, yy = frame_dist(N)
    t = np.where(d < 9, 0.86 - 0.04 * d, 0.58 - 0.012 * (d - 9))
    t = np.where(d > 19, 0.24, t)
    rgb = inks(np.clip(t, 0, 1), VELVET)
    gloss = np.exp(-((d - 4.5) / 1.1) ** 2)[..., None] * .55
    rgb = rgb * (1 - gloss) + hexrgb('#E06A7C') * gloss
    trim = (np.abs(d - 15) < 1.1)[..., None]
    rgb = np.where(trim, GOLD[3], rgb)
    rgb = np.where((d < 2.5)[..., None], OUTLINE, rgb)
    rgb = np.where(((d > 21.5) & (d < 23.5))[..., None], OUTLINE, rgb)
    # brass corner caps: a triangular plate filling each corner square, outlined, with one rivet; big enough to read at 12 px
    for cx, cy in ((0, 0), (N, 0), (0, N), (N, N)):
        ax, ay = np.abs(xx - cx), np.abs(yy - cy)
        cap = (ax < S) & (ay < S) & (ax + ay < 38)
        t = 0.9 - 0.016 * (ax + ay) + 0.15 * np.exp(-((ax - 9) ** 2 + (ay - 9) ** 2) / 40)
        brass = inks(np.clip(t, 0, 1), GOLD)
        rgb = np.where(cap[..., None], brass, rgb)
        rim = cap & ((ax + ay > 34.5) | (ax > S - 2.5) | (ay > S - 2.5))
        rgb = np.where(rim[..., None], OUTLINE, rgb)
        r = ((ax - 10) ** 2 + (ay - 10) ** 2) ** .5
        rgb = np.where((r < 3.4)[..., None], GOLD[2], rgb)
        rgb = np.where(((r >= 3.4) & (r < 4.8))[..., None], OUTLINE, rgb)
        rgb = np.where(((ax - 9) ** 2 + (ay - 9) ** 2 < 1.6)[..., None], GOLD[4], rgb)
    rgb = np.where((d < 2.5)[..., None], OUTLINE, rgb)
    return finish(rgb, None, 21, grain=4, fade=.03)


def basket_frame():
    N, S = 96, 24
    d, xx, yy = frame_dist(N)
    cane = [hexrgb(h) for h in ('#3A2410', '#6E4A1E', '#A2733A', '#C9974A', '#E8C27A')]
    # the weave: 6 px cells, a horizontal cane in one, a vertical one in the next; the period of 12 divides the 48 px edge tile
    cx, cy = np.floor(xx / 6), np.floor(yy / 6)
    fx, fy = (xx % 6) / 6, (yy % 6) / 6
    horiz = ((cx + cy) % 2) == 0
    across = np.where(horiz, fy, fx)
    along = np.where(horiz, fx, fy)
    t = 0.5 + 0.38 * np.sin(np.pi * across) - 0.18 * np.abs(along - .5) - 0.12
    rgb = inks(np.clip(t, 0, 1), cane)
    gap = (np.minimum(across, 1 - across) < .1)[..., None]
    rgb = np.where(gap, cane[0], rgb)
    # the rim: a thick wrapped cane round the edge, bound with diagonal wraps every 6 px
    v = d / 12
    tr = 0.45 + 0.45 * np.sin(np.pi * np.clip(v, 0, 1)) - 0.15 * v
    wrap = ((xx + yy) % 6 < 1.3) | ((xx - yy) % 6 < 1.3)
    tr = np.where(wrap, tr - 0.35, tr)
    rim = inks(np.clip(tr, 0, 1), cane)
    rgb = np.where((d < 12)[..., None], rim, rgb)
    rgb = np.where(((d < 1.8) | ((d > 11.2) & (d < 12.8)) | ((d > 22.4) & (d < 24)))[..., None], OUTLINE, rgb)
    return finish(rgb, None, 22, grain=4, fade=.03)


N = 256
fy = np.fft.fftfreq(N)[:, None]
fx = np.fft.fftfreq(N)[None, :]


def field(sx, sy, seed):
    """Periodic noise smoothed by an anisotropic Gaussian (sx, sy in pixels): seamless by construction."""
    g = np.random.default_rng(seed).standard_normal((N, N))
    k = np.exp(-2 * (np.pi ** 2) * ((fx * sx) ** 2 + (fy * sy) ** 2))
    f = np.real(np.fft.ifft2(np.fft.fft2(g) * k))
    return (f - f.mean()) / (f.std() + 1e-9)


def cardstock():
    """Linen emboss: a fine weave of threads at about 3 px, each with slubs, lit from the top left; white where a ridge
    catches the lamp, warm brown where it falls into shadow, and a broad soft tone of the board."""
    y, x = np.mgrid[0:N, 0:N].astype(float)
    pitch = N / 86
    h = np.cos(2 * np.pi * y / pitch) * (0.65 + 0.35 * field(24, 0.6, 1))
    v = np.cos(2 * np.pi * x / pitch) * (0.65 + 0.35 * field(0.6, 24, 2))
    weave = 0.55 * h + 0.45 * v + 0.35 * field(1.2, 1.2, 3) + 0.25 * field(10, 10, 4)
    gx = np.roll(weave, -1, 1) - np.roll(weave, 1, 1)
    gy = np.roll(weave, -1, 0) - np.roll(weave, 1, 0)
    shade = np.clip(-(gx + gy) / np.percentile(np.abs(gx + gy), 99), -1, 1)
    rgba = np.zeros((N, N, 4))
    lit = shade > 0
    rgba[lit, :3] = (255, 255, 252)
    rgba[~lit, :3] = (92, 70, 40)
    rgba[..., 3] = np.where(lit, shade * 40, -shade * 26)
    tone = np.clip(-field(40, 40, 5), 0, None) * 4
    flat = rgba[..., 3] < tone
    rgba[flat, 3] = tone[flat]
    rgba[flat, :3] = (92, 70, 40)
    return Image.fromarray(np.clip(rgba, 0, 255).astype(np.uint8), 'RGBA')


def showpaint():
    """Dry brush: long horizontal bristle streaks where the paint skipped, over a fine canvas tooth (alpha carries it)."""
    streak = field(9, 0.7, 11) + 0.5 * field(30, 6, 12)
    tooth = field(0.7, 0.7, 13)
    y, x = np.mgrid[0:N, 0:N].astype(float)
    canvas = np.cos(2 * np.pi * y / (N / 64)) * np.cos(2 * np.pi * x / (N / 64))
    skip = np.clip((streak - 1.7) / 0.6, 0, 1)
    speck = np.clip((tooth - 2.1) / 0.5, 0, 1)
    alpha = np.clip(255 * (1 - 0.8 * np.maximum(skip, speck)) - 12 * np.clip(canvas, 0, 1) * (tooth > 0.8), 40, 255)
    rgba = np.zeros((N, N, 4), dtype=np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = alpha.astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA')


MAKERS = {'jadugar-cloth-cover.webp': cloth_cover, 'jadugar-cloth-gathered.webp': cloth_gathered, 'jadugar-banner.webp': banner,
          'jadugar-fringe.webp': fringe_strip, 'jadugar-cord.webp': cord_strip,
          'jadugar-box-frame.webp': box_frame, 'jadugar-basket-frame.webp': basket_frame,
          'tex-cardstock.webp': cardstock, 'tex-showpaint.webp': showpaint}

if __name__ == '__main__':
    want = sys.argv[1] if len(sys.argv) > 1 else ''
    for name, make in MAKERS.items():
        if want not in name:
            continue
        im = make()
        out = os.path.join(ASSETS, name)
        lossless = name.startswith('tex-') or 'frame' in name
        im.save(out, 'WEBP', lossless=lossless, quality=82, method=6)
        json.dump({'prompt': ORIGIN, 'createdAt': '2026-10-21'}, open(out + '.json', 'w'), indent=2)
        print(name, im.size, im.mode, os.path.getsize(out))
