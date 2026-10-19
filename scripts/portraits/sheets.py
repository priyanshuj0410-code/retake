"""Stage 6: review contact sheets (PNG) for the owner and for P1.

  python3 scripts/portraits/sheets.py <out-dir> [candidates]
With "candidates" only the pre-pick candidate sheets are drawn (used while scoring). Otherwise:
  slot-sN.png      (sN = game slot N-1) all 3 candidates per sex at the base tone, eye-normalised crop, chosen pair marked, scores shown
  pairs-tones.png  every chosen pair across the four tones (from the delivered WebP files)
  mascots.png      the delivered mascots, then every mascot candidate with the chosen one marked
  oneoffs.png      the one-offs (delivered WebP), grouped by beat, focal / comparison / third labelled
  mask-check.png   for every chosen base: the mask overlay, then t1 and t4 face close-ups for halo and bleed checks
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from build import cast_name, crop384, oneoff_name

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.join(HERE, "work")
PUBLIC = os.path.join(HERE, "..", "..", "public", "portraits")
FONT = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 15)
BIG = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 22)
T = 256


def tile(img, label="", mark=False, sub=""):
    im = Image.new("RGB", (T, T + 44), "white")
    im.paste(img.convert("RGB").resize((T, T), Image.LANCZOS), (0, 0))
    d = ImageDraw.Draw(im)
    if mark:
        d.rectangle([0, 0, T - 1, T - 1], outline=(230, 0, 90), width=7)
        d.rectangle([0, 0, 92, 24], fill=(230, 0, 90))
        d.text((6, 3), "CHOSEN", fill="white", font=FONT)
    d.text((4, T + 3), label, fill="black", font=FONT)
    d.text((4, T + 23), sub, fill=(60, 60, 60), font=FONT)
    return im


def grid(tiles, cols, title, path):
    rows = (len(tiles) + cols - 1) // cols
    th = tiles[0].size[1]
    S = Image.new("RGB", (cols * (T + 8) + 8, rows * (th + 8) + 48), "white")
    ImageDraw.Draw(S).text((10, 10), title, fill="black", font=BIG)
    for i, t in enumerate(tiles):
        if t is not None:
            S.paste(t, (8 + (i % cols) * (T + 8), 48 + (i // cols) * (th + 8)))
    S.save(path)


def base_crop(cid, analysis):
    base = np.asarray(Image.open(os.path.join(WORK, "base", cid + ".png")).convert("RGB"))
    return Image.fromarray(crop384(base, analysis[cid]["crop"]))


def fmt(s):
    return f"age {s['age']}  attr {s['attractive']}  warm {s['warmth']}  comp {s['competence']}" if s else ""


def main():
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    analysis = json.load(open(os.path.join(WORK, "analysis.json")))
    sc = json.load(open(os.path.join(HERE, "scores.json"))) if os.path.exists(os.path.join(HERE, "scores.json")) else {}
    scores, picks = sc.get("scores", {}), sc.get("picks", {})
    slots = sorted({k.split("-")[0] for k in analysis if k.startswith("s")}, key=lambda s: int(s[1:]))
    for slot in slots:
        tiles = []
        for sex in "wm":
            for k in range(3):
                cid = f"{slot}-{sex}-c{k}"
                if cid not in analysis:
                    tiles.append(None)
                    continue
                chosen = picks.get("cast", {}).get(slot, {}).get(sex) == f"c{k}"
                tiles.append(tile(base_crop(cid, analysis), cid, chosen, fmt(scores.get(cid))))
        flag = sc.get("flags", {}).get(slot, "")
        grid(tiles, 3, f"{slot}: candidates at the base tone (top: woman, bottom: man). {flag}"[:150],
             os.path.join(out, f"slot-{slot}.png"))
    if len(sys.argv) > 2:
        return
    tiles = []
    for slot in picks["cast"]:
        for sex in "wm":
            for t in ("t1", "t2", "t3", "t4"):
                n = cast_name(slot, sex, t)
                tiles.append(tile(Image.open(os.path.join(PUBLIC, n + ".webp")), n, False, f"base {slot}-{sex}-{picks['cast'][slot][sex]}"))
    grid(tiles, 8, "Chosen pairs across the four tones (delivered WebP, 384 px): woman l1 l2 d1 d2, man l1 l2 d1 d2",
         os.path.join(out, "pairs-tones.png"))
    tiles = [tile(Image.open(os.path.join(PUBLIC, f"mascot-{a}.webp")), a) for a in picks["mascots"]]
    for a, cand in picks["mascots"].items():
        for k in range(2):
            p = os.path.join(WORK, "raw", f"mascot-{a}-c{k}.png")
            if os.path.exists(p):
                tiles.append(tile(Image.open(p), f"{a} c{k}", cand == f"c{k}"))
    grid(tiles, 8, "Mascots: delivered set (row 1), then every candidate with the chosen one marked",
         os.path.join(out, "mascots.png"))
    if picks.get("oneoffs"):
        gen = json.load(open(os.path.join(WORK, "generation-log.json")))["images"]
        tiles = []
        for cid in picks["oneoffs"]:
            j = gen[cid]
            tiles.append(tile(Image.open(os.path.join(PUBLIC, oneoff_name(cid) + ".webp")),
                              f"{oneoff_name(cid)} {j['role']}", False, f"{j['beat']} g{j['group']}  {fmt(scores.get(cid))}"[:40]))
        grid(tiles, 8, "One-offs at the constant medium tone (#BC8459), woman then man per slot",
             os.path.join(out, "oneoffs.png"))
    tiles = []
    for slot, pair in picks["cast"].items():
        for sex, cand in pair.items():
            cid = f"{slot}-{sex}-{cand}"
            tiles.append(tile(Image.fromarray(crop384(np.asarray(Image.open(os.path.join(WORK, "overlay", cid + ".png"))),
                                                      analysis[cid]["crop"])), cid + " mask"))
            for t in ("t1", "t4"):
                n = cast_name(slot, sex, t)
                v = np.asarray(Image.open(os.path.join(WORK, "out384", n + ".png")))
                tiles.append(tile(Image.fromarray(v[110:270, 110:274]), f"{n} face x1.6"))
    grid(tiles, 6, "Mask check: overlay (green = recoloured), then lightest and darkest face close-ups",
         os.path.join(out, "mask-check.png"))


if __name__ == "__main__":
    main()
