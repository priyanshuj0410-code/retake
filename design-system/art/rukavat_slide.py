"""Rukavat's interruption slide, drawn procedurally (numpy and PIL, a few MB of memory, no model load).

    python3 art/rukavat_slide.py        writes assets/sunday-cut-slide.webp (960 x 720, 4:3) and its .json
    python3 art/rukavat_slide.py en     writes assets/sunday-cut-slide-en.webp: the same slide lettered "We regret the
                                        interruption", for the English version (owner, 22 Oct 2026: "one full english
                                        version for players who don't understand hindi")

The slide the announcer put up when the picture failed, in the house painting style of the Rukavat scenes (a 1980s
Indian family-magazine illustration in flat gouache): an evening sky in the world's teals, a cream haze on the
horizon, teak rooftops with ink outlines, the rooftop antenna with the orange kite caught in it, and the line
"रुकावट के लिए खेद है" lettered in cream with an ink shadow. No broadcaster's name or logo, no colour bars.

The lettering is shaped by Chromium (PIL here has no Devanagari shaping): one headless browser renders the two lines
in Hind 700 from the project's own font file to a transparent PNG, then closes."""
import base64, json, os, subprocess, sys, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(os.path.dirname(HERE), 'assets')
FONT = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'public', 'fonts', 'hind-devanagari-700-normal.woff2')
PW = '/Users/priyanshu/equal-lens-evaluator-game/node_modules/playwright-core'
EXE = ('/Users/priyanshu/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/'
       'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing')
EN = len(sys.argv) > 1 and sys.argv[1] == 'en'
LINES = ('We regret', 'the interruption') if EN else ('रुकावट के', 'लिए खेद है')
OUT = 'sunday-cut-slide-en.webp' if EN else 'sunday-cut-slide.webp'
LANG, SIZE = ('en', 168) if EN else ('hi', 260)
if EN:   # the Devanagari file carries no Latin letters
    FONT = FONT.replace('hind-devanagari-700', 'hind-latin-700')
ORIGIN = ('Origin: procedural, drawn in Python by art/rukavat_slide.py (numpy sky inks, PIL rooftops, antenna and kite, '
          'grain in the Rukavat gouache palette); lettering shaped by headless Chromium in Hind 700 from public/fonts; '
          'no source image, no generator model.')

S = 2                      # drawn at twice the size, then reduced, for soft painted edges
W, H = 960 * S, 720 * S


def hexrgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], dtype=float)


INK = hexrgb('#2A1F17')
CREAM = hexrgb('#FBF4E4')
SKY = [hexrgb(h) for h in ('#18302F', '#1F4140', '#275453', '#2F6463', '#3E7C7B', '#7FA79F', '#D9D3B6', '#F3E6C8')]
FAR = hexrgb('#4F6E68')
TEAK = hexrgb('#6B4429')
TEAK_DARK = hexrgb('#4E301D')
TEAK_LIGHT = hexrgb('#82553A')
WINDOW = hexrgb('#EEDDB4')
ORANGE = hexrgb('#E2662B')
ORANGE_DARK = hexrgb('#B4471A')


def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def inks(t, pal):
    """Flat inks with a short airbrushed blend between neighbours, as the scenes are painted."""
    n = len(pal)
    q = np.clip(t, 0, 0.9999) * (n - 1)
    i = np.floor(q).astype(int)
    s = smooth(0.3, 0.7, q - i)[..., None]
    P = np.stack(pal)
    j = np.minimum(i + 1, n - 1)
    return P[i] * (1 - s) + P[j] * s


def lowfreq(h, w, scale, seed):
    g = np.random.default_rng(seed).standard_normal((max(2, h // scale + 3), max(2, w // scale + 3)))
    im = Image.fromarray(((g - g.min()) / (np.ptp(g) + 1e-9) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    a = np.asarray(im, dtype=float)
    return (a - a.mean()) / (a.std() + 1e-9)


def mask(draw_fn):
    m = Image.new('L', (W, H), 0)
    draw_fn(ImageDraw.Draw(m))
    return m


def lay(canvas, m, colour, alpha=1.0):
    a = (np.asarray(m, dtype=float) / 255.0 * alpha)[..., None]
    canvas[:] = canvas * (1 - a) + colour * a


def outline(m, px):
    grown = m.filter(ImageFilter.MaxFilter(px * 2 + 1))
    return Image.fromarray(np.clip(np.asarray(grown, dtype=int) - np.asarray(m, dtype=int), 0, 255).astype(np.uint8))


def lettering():
    """The two lines, shaped by Chromium in Hind 700, as an RGBA image (cream on transparent)."""
    font = base64.b64encode(open(FONT, 'rb').read()).decode()
    html = ('<!doctype html><meta charset="utf-8"><style>'
            f'@font-face{{font-family:H;src:url(data:font/woff2;base64,{font}) format("woff2");font-weight:700}}'
            'html,body{margin:0;background:transparent}'
            f'#t{{display:inline-block;padding:40px 60px;font:700 {SIZE}px/1.32 H;color:#FBF4E4;text-align:center;white-space:nowrap}}'
            f'</style><div id="t" lang="{LANG}">{LINES[0]}<br>{LINES[1]}</div>')
    tmp = tempfile.mkdtemp(prefix='rk-slide-')
    src, png = os.path.join(tmp, 'l.html'), os.path.join(tmp, 'l.png')
    open(src, 'w', encoding='utf-8').write(html)
    js = (f"const {{chromium}}=require({json.dumps(PW)});(async()=>{{const b=await chromium.launch({{executablePath:{json.dumps(EXE)}}});"
          "const p=await b.newPage({viewport:{width:2200,height:1000},deviceScaleFactor:1});"
          f"await p.goto('file://'+{json.dumps(src)});await p.evaluate(()=>document.fonts.ready);"
          f"await (await p.$('#t')).screenshot({{path:{json.dumps(png)},omitBackground:true}});await b.close();}})();")
    subprocess.run(['node', '-e', js], check=True)
    im = Image.open(png).convert('RGBA')
    return im.crop(im.getchannel('A').getbbox())


def sky(canvas):
    y = np.linspace(0, 1, H)[:, None] * np.ones((1, W))
    # deep teal holds behind the lettering, then the haze comes up fast to the horizon at 0.70
    t = np.interp(y, [0, 0.42, 0.56, 0.64, 0.70, 1.0], [0.0, 0.30, 0.55, 0.78, 1.0, 1.0])
    t = t + 0.018 * lowfreq(H, W, 220, 11) + 0.006 * lowfreq(H, W, 40, 12)
    canvas[:] = inks(t, SKY)


def far_roofs(rng):
    def d(dr):
        x = -20
        while x < W:
            w = int(rng.uniform(110, 260) * S / 2)
            top = int(H * rng.uniform(0.625, 0.69))
            dr.rectangle([x, top, x + w, H], fill=255)
            if rng.random() < 0.45:
                tx = x + int(w * rng.uniform(0.2, 0.6))
                tw = int(rng.uniform(34, 52) * S / 2)
                dr.rectangle([tx, top - int(30 * S / 2), tx + tw, top], fill=255)
                dr.ellipse([tx, top - int(38 * S / 2), tx + tw, top - int(22 * S / 2)], fill=255)
            x += w - 2
    return mask(d)


NEAR = [(-10, 0.745, 0.37 * W), (0.37 * W - 6, 0.795, 0.62 * W), (0.62 * W - 6, 0.755, W + 10)]


def near_roofs():
    def d(dr):
        for x0, top, x1 in NEAR:
            ty = int(H * top)
            dr.rectangle([int(x0), ty, int(x1), H], fill=255)
            dr.rectangle([int(x0) - 6 * S, ty - 8 * S, int(x1) + 6 * S, ty + 4 * S], fill=255)   # the parapet lip
    return mask(d)


def lips():
    def d(dr):
        for x0, top, x1 in NEAR:
            ty = int(H * top)
            dr.rectangle([int(x0) - 6 * S, ty - 8 * S, int(x1) + 6 * S, ty + 4 * S], fill=255)
    return mask(d)


def windows():
    def d(dr):
        for cx, cy in ((0.13, 0.905), (0.24, 0.905), (0.47, 0.93), (0.70, 0.90), (0.86, 0.90)):
            x, y = int(cx * W), int(cy * H)
            dr.rectangle([x, y, x + 22 * S, y + 30 * S], fill=255)
    return mask(d)


MAST_X, MAST_TOP, MAST_FOOT = 0.735 * W, 0.47 * H, 0.755 * H
BOOM = (0.635 * W, 0.835 * W)


def antenna():
    lw = 4 * S
    def d(dr):
        dr.line([(MAST_X, MAST_FOOT), (MAST_X, MAST_TOP)], fill=255, width=lw + S)
        dr.line([(BOOM[0], MAST_TOP), (BOOM[1], MAST_TOP - 6 * S)], fill=255, width=lw)
        for k, frac in enumerate(np.linspace(0.04, 0.96, 7)):
            x = BOOM[0] + frac * (BOOM[1] - BOOM[0])
            y = MAST_TOP - 6 * S * frac
            half = (34 - 3 * k) * S / 2 * 2
            dr.line([(x - 5 * S, y - half), (x + 5 * S, y + half)], fill=255, width=lw - S)
        # the guy wires down to the parapet
        dr.line([(MAST_X, MAST_TOP + 0.10 * H), (MAST_X - 0.07 * W, MAST_FOOT)], fill=255, width=S)
        dr.line([(MAST_X, MAST_TOP + 0.10 * H), (MAST_X + 0.06 * W, MAST_FOOT)], fill=255, width=S)
    return mask(d)


KITE = (0.835 * W, 0.415 * H, 0.060 * W)     # centre x, centre y, half-height


def kite_parts():
    cx, cy, r = KITE
    rot = np.deg2rad(-18)
    pts = [(0, -r), (0.74 * r, -0.12 * r), (0, r * 1.05), (-0.74 * r, -0.12 * r)]
    def rp(p):
        x, y = p
        return (cx + x * np.cos(rot) - y * np.sin(rot), cy + x * np.sin(rot) + y * np.cos(rot))
    body = [rp(p) for p in pts]
    body_m = mask(lambda dr: dr.polygon(body, fill=255))
    def spars(dr):
        dr.line([body[0], body[2]], fill=255, width=3 * S)
        dr.line([body[1], body[3]], fill=255, width=3 * S)
    spar_m = mask(spars)
    tail_x, tail_y = body[2]
    def tail(dr):
        pts_ = [(tail_x + 14 * S * np.sin(k / 2.2) + 6 * S * k, tail_y + 16 * S * k) for k in range(0, 15)]
        dr.line(pts_, fill=255, width=2 * S)
    tail_m = mask(tail)
    def bows(dr):
        for k in (4, 8, 12):
            x, y = tail_x + 14 * S * np.sin(k / 2.2) + 6 * S * k, tail_y + 16 * S * k
            dr.polygon([(x - 13 * S, y - 7 * S), (x, y), (x - 13 * S, y + 7 * S)], fill=255)
            dr.polygon([(x + 13 * S, y - 7 * S), (x, y), (x + 13 * S, y + 7 * S)], fill=255)
    bows_m = mask(bows)
    def string(dr):
        x0, y0 = rp((0, 0.05 * r))
        pts_ = [(x0 + (BOOM[1] - 6 * S - x0) * u, y0 + (MAST_TOP - 10 * S - y0) * u + 40 * S * np.sin(np.pi * u)) for u in np.linspace(0, 1, 24)]
        dr.line(pts_, fill=255, width=S + 1)
    string_m = mask(string)
    return body_m, spar_m, tail_m, bows_m, string_m


def paint():
    rng = np.random.default_rng(1985)
    canvas = np.zeros((H, W, 3))
    sky(canvas)
    far = far_roofs(rng)
    lay(canvas, far, FAR)
    lay(canvas, outline(far, S), INK, 0.35)
    near = near_roofs()
    shade = 1 + 0.05 * lowfreq(H, W, 90, 21)[..., None]
    roof = np.clip(TEAK * shade, 0, 255)
    a = (np.asarray(near, dtype=float) / 255.0)[..., None]
    canvas[:] = canvas * (1 - a) + roof * a
    lay(canvas, lips(), TEAK_LIGHT)
    # the side walls in shadow, where the middle roof drops behind its neighbours
    lay(canvas, mask(lambda dr: dr.rectangle([int(0.37 * W) - 6, int(0.795 * H), int(0.37 * W) + 26 * S, H], fill=255)), TEAK_DARK)
    lay(canvas, mask(lambda dr: dr.rectangle([int(0.62 * W) - 26 * S, int(0.795 * H), int(0.62 * W) - 6, H], fill=255)), TEAK_DARK)
    lay(canvas, windows(), WINDOW)
    lay(canvas, outline(near, 2 * S), INK, 0.9)
    lay(canvas, outline(windows(), S), INK, 0.8)
    body_m, spar_m, tail_m, bows_m, string_m = kite_parts()
    lay(canvas, string_m, INK, 0.75)
    lay(canvas, antenna(), INK, 0.95)
    lay(canvas, tail_m, INK, 0.85)
    lay(canvas, bows_m, ORANGE)
    lay(canvas, body_m, ORANGE)
    lay(canvas, spar_m, ORANGE_DARK)
    lay(canvas, outline(body_m, S + 1), INK)
    lay(canvas, outline(bows_m, S), INK, 0.8)

    # the lettering: cream, with an ink shadow cast down and right, the block held clear of the 4:3 crop's edges
    let = lettering()
    lw_max, lh_max = int(0.66 * W), int(0.34 * H)
    k = min(lw_max / let.width, lh_max / let.height)
    let = let.resize((int(let.width * k), int(let.height * k)), Image.LANCZOS)
    ox, oy = (W - let.width) // 2, int(0.105 * H)
    alpha = Image.new('L', (W, H), 0)
    alpha.paste(let.getchannel('A'), (ox, oy))
    shadow = Image.new('L', (W, H), 0)
    shadow.paste(let.getchannel('A'), (ox + 7 * S, oy + 7 * S))
    lay(canvas, shadow.filter(ImageFilter.GaussianBlur(2 * S)), INK, 0.9)
    lay(canvas, alpha.filter(ImageFilter.GaussianBlur(0.6 * S)), CREAM)

    # paint and paper: gentle mottling, fine grain, a faded print, and the screen's darker edges
    canvas *= (1 + 0.025 * lowfreq(H, W, 160, 31))[..., None]
    canvas += rng.normal(0, 5.0, (H, W, 1))
    canvas = canvas * 0.94 + np.array([246, 238, 220]) * 0.06
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / np.sqrt(2)
    canvas *= (1 - 0.30 * smooth(0.45, 1.0, r) ** 1.4)[..., None]
    im = Image.fromarray(np.clip(canvas, 0, 255).astype(np.uint8), 'RGB').filter(ImageFilter.GaussianBlur(0.7))
    return im.resize((W // S, H // S), Image.LANCZOS)


if __name__ == '__main__':
    im = paint()
    out = os.path.join(ASSETS, OUT)
    im.save(out, 'WEBP', quality=84, method=6)
    json.dump({'prompt': ORIGIN, 'createdAt': '2026-10-21'}, open(out + '.json', 'w'), indent=2)
    print(OUT, im.size, os.path.getsize(out))
