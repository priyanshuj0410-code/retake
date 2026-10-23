"""Pixel contrast check for library frames. Run after tools/frames.cjs:
    python3 tools/contrast_score.py <outdir>/frames.json [--world jadugar] [--all]
For every text run it finds the letters themselves (the pixels that change between the drawn frame and the text-free
frame), and compares the text colour with the background under those letters only (paintings, plates and textures
included), using the worst 5% of those pixels. A bar or thumbnail elsewhere in the line box no longer counts.
Targets: 4.5:1, or 3:1 for large text (24 px, or 18.66 px bold). Prints 'hits N' and one line per failing run."""
import json, re, sys
import numpy as np
from PIL import Image

def lum(a):
    a = a / 255.0
    a = np.where(a <= 0.03928, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)
    return 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]

def main():
    rows = json.load(open(sys.argv[1]))
    world = sys.argv[sys.argv.index('--world') + 1] if '--world' in sys.argv else None
    # ratios this close to 1 are almost always text clipped out of view or measured against its own ink: look at the shot before trusting them
    floor = float(sys.argv[sys.argv.index('--min') + 1]) if '--min' in sys.argv else 1.15
    hits, checked = [], 0
    for r in rows:
        if world and r.get('world') != world:
            continue
        im = np.asarray(Image.open(r['png']).convert('RGB'), dtype=float)
        H, W = im.shape[:2]
        L = lum(im)
        drawn = np.asarray(Image.open(r['shot']).convert('RGB'), dtype=float) if r.get('shot') else None
        if drawn is not None and drawn.shape != im.shape:
            drawn = None
        glyph = None
        if drawn is not None:
            g = np.abs(drawn - im).sum(axis=2) > 40
            # grow the letters by one pixel so their anti-aliased edges count as "under the letters"
            gg = g.copy(); gg[1:] |= g[:-1]; gg[:-1] |= g[1:]; gg[:, 1:] |= g[:, :-1]; gg[:, :-1] |= g[:, 1:]
            glyph = gg
        for t in r['runs']:
            m = re.findall(r'[\d.]+', t['color'])
            if len(m) < 3:
                continue
            alpha = float(m[3]) if len(m) > 3 else 1.0
            if alpha < 0.05:
                continue
            lt = float(lum(np.array([[float(v) for v in m[:3]]]))[0])
            x0, y0 = max(0, int(t['x'])), max(0, int(t['y']))
            x1, y1 = min(W, int(t['x'] + t['w'])), min(H, int(t['y'] + t['h']))
            if x1 - x0 < 2 or y1 - y0 < 2:
                continue
            box = L[y0:y1, x0:x1]
            if glyph is not None:
                under = glyph[y0:y1, x0:x1]
                if under.sum() < 8:
                    continue  # no visible letters here: clipped or covered
                box = box[under]
            bg = np.sort(box.ravel())
            # the worst background is the one closest to the text's own lightness
            worst = bg[int(len(bg) * 0.95)] if lt > 0.5 else bg[int(len(bg) * 0.05)]
            ratio = (max(lt, worst) + 0.05) / (min(lt, worst) + 0.05)
            large = t['size'] >= 24 or (t['size'] >= 18.66 and t['weight'] >= 700)
            need = 3.0 if large else 4.5
            checked += 1
            if floor <= ratio < need:
                hits.append((round(ratio, 2), need, r.get('world'), r.get('section'), r.get('caption', '')[:60], t['text']))
    hits.sort()
    print(f'checked {checked} text runs; hits {len(hits)}')
    for h in hits[: (None if '--all' in sys.argv else 60)]:
        print(f'  {h[0]} < {h[1]} [{h[2]}] {h[3]} | {h[4]} | "{h[5]}"')

if __name__ == '__main__':
    main()
