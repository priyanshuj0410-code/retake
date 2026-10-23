"""Paints every cast member's portrait in every world's style (owner, 22 Oct 2026: "get each name a portrait in each
world... don't crash the system").

The cast comes from knowledge/content/cast.md ("The cast" table). A person whose portrait already exists for a world
(one person per old slot face; see "(drawn: <file>)" in the Look column) keeps that face there: the file is copied
to the new name. Every other (person, world) is painted with that world's prompt template.

Safe on a 24 GB Mac: one image at a time, low priority, the model's cache cleared after each image. It will not load
the model while any other FLUX job runs on the Mac (from any session), free memory is under 50% or swap is over 20 GB,
and it stops itself at once (exit 3, resumable) if another FLUX job starts while it paints. Run it alone: no browser,
no workflow. Two FLUX jobs at once crashed the Mac on 22 Oct.

Paint (slow, local FLUX, resumable; through the Mac-wide heavy-job queue, CLAUD-26; reruns itself after a stop):
  ~/.claude/heavy-queue/heavyq run --label "Retake portraits" -- bash -c 'for t in $(seq 30); do
    ~/.local/share/uv/tools/mflux/bin/python art/portraits.py paint && break; sleep 120; done'
Process into assets:                  python3 art/portraits.py process
Contact sheets for the art check:     python3 art/portraits.py sheets
"""
import json, os, re, shutil, subprocess, sys, time, zlib

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
RAW = os.path.join(HERE, 'raw', 'portraits')
ASSETS = os.path.join(os.path.dirname(HERE), 'assets')
CAST = os.path.join(ROOT, 'knowledge', 'content', 'cast.md')
IMP = '/Users/priyanshu/Sex Ed/.claude/skills/impeccable/scripts/impeccable'
NO = (" No text, no letters, no numbers, no words, no logos, no badges, no religious symbols, no writing anywhere.")
WORLDS = {  # world -> (file prefix, prompt template with {who}, seed offset)
    'Station': ('enamel', "Vintage Indian railway enamel sign portrait of {who}, head and shoulders, screen printed in two "
                "colours black and chrome yellow, bold halftone, plain background." + NO, 0),
    'Lugdi': ('pulp', "1970s Hindi pulp novel cover painting of {who}, head and shoulders, gouache, dramatic coloured lighting, "
              "saturated poster colours, painterly brushwork, plain dark background." + NO, 1),
    'Jadugar': ('jadugar', "Portrait for a vintage Indian travelling magic show's playing cards, printed by chromolithography: "
                "{who}, head and shoulders, facing the viewer, flat inks of crimson, midnight blue, old gold and cream, bold dark "
                "outlines, a plain midnight-blue background with a few small stars." + NO, 2),
    'Cricket': ('cricket-face', "1980s Indian sports-magazine portrait photograph of {who}, head and shoulders, outdoor "
                "late-afternoon light, a plain pale sky behind, slightly faded colour print." + NO, 3),
    'Rukavat': ('sunday', "1980s Indian family-magazine illustration in flat gouache of {who}, with South Asian features and warm "
                "brown skin, head and shoulders, warm soft light, a plain faded teal background, nostalgic." + NO, 4),
    # "South Asian features and warm brown skin" added 22 Oct: this style drew light-brown people as pale Europeans
}
# Drawn faces copied to a new name that carry a forehead mark: painted out on the copy (the library's file stays).
CLEAN = {'jadugar-kader': (170, 114, 5), 'enamel-gurpreet': (164, 93, 4)}
# Names that mark a community where a bindi or tilak would be wrong. The model paints a forehead dot on most Indian
# faces whatever the prompt says ("a bare forehead" did not stop it). `portraits.py dots` suggests each mark with
# find_dot() on a review sheet; the marks confirmed by eye go in DOTS (raw-image x, y, radius) and process() paints
# them out. A finder run unchecked also marked hair, wrinkles and eyes on faces with no dot.
BARE = {'Mumtaz', 'Rabia', 'Yasmin', 'Zarina', 'Agnes', 'Annamma', 'Shirin', 'Jasleen', 'Gurpreet', 'Kader', 'Firoz',
        'Cyrus', 'Francis', 'Anthony', 'Thomas', 'Baldev', 'Tenzing'}


def find_dot(im, xs=(0.34, 0.62)):
    """A small round mark between the brows of a raw portrait: (x, y, r), or None. Looks in the forehead strip only,
    for a compact blob that stands out from a 15 px median of its surroundings."""
    import numpy as np
    from PIL import ImageFilter
    w, h = im.size
    x0, x1, y0, y1 = int(w * xs[0]), int(w * xs[1]), int(h * 0.18), int(h * 0.36)
    roi = im.crop((x0, y0, x1, y1))
    a = np.asarray(roi).astype(float)
    bg = np.asarray(roi.filter(ImageFilter.MedianFilter(15))).astype(float)
    diff = np.abs(a - bg).sum(axis=2)
    mask = diff > 70
    seen, best = np.zeros_like(mask), None
    for sy, sx in zip(*np.nonzero(mask)):
        if seen[sy, sx]:
            continue
        stack, pts = [(sy, sx)], []
        seen[sy, sx] = True
        while stack:
            y, x = stack.pop()
            pts.append((y, x))
            for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                if 0 <= ny < mask.shape[0] and 0 <= nx < mask.shape[1] and mask[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    stack.append((ny, nx))
        ys, xs = np.array([p[0] for p in pts]), np.array([p[1] for p in pts])
        bh, bw = np.ptp(ys) + 1, np.ptp(xs) + 1
        if not (10 <= len(pts) <= 400 and max(bh, bw) <= 1.7 * min(bh, bw) and len(pts) >= 0.5 * bh * bw):
            continue
        score = diff[ys, xs].mean() * len(pts) ** 0.5
        if best is None or score > best[0]:
            best = (score, x0 + xs.mean(), y0 + ys.mean(), max(bh, bw) / 2)
    return None if best is None else (int(round(best[1])), int(round(best[2])), int(round(best[3])) + 3)


def clean_dot(im, x, y, r):
    """Paints out a small mark: the disc takes the median colour of a ring just outside it, then a light blur."""
    import numpy as np
    from PIL import Image, ImageDraw, ImageFilter
    a = np.asarray(im).astype(float)
    yy, xx = np.mgrid[0:a.shape[0], 0:a.shape[1]]
    d = ((xx - x) ** 2 + (yy - y) ** 2) ** 0.5
    fill = tuple(int(v) for v in np.median(a[(d > r + 2) & (d < r + 6)], axis=0))
    out = im.copy()
    ImageDraw.Draw(out).ellipse((x - r, y - r, x + r, y + r), fill=fill)
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).ellipse((x - r - 2, y - r - 2, x + r + 2, y + r + 2), fill=255)
    return Image.composite(out.filter(ImageFilter.GaussianBlur(1.2)), im, mask.filter(ImageFilter.GaussianBlur(1.5)))


DADI = dict(name='Dadi', gender='woman', age=78,  # older than her son Mahesh (55) by a generation (owner, 22 Oct)
            look='dark brown skin, thin white hair pulled into a small bun, deep lines round the eyes and mouth, a small '
                 'round bindi, a plain white cotton saree with a thin border over one shoulder', drawn={})


# The family members who sit on cards or speak, each in the one world of their memory and at that year's age
# (knowledge/story/people.md; owner, 23 Oct 2026). Painted with the world's own template, so they match its cast;
# the cutscene style made them wide, coloured shots that stood out on the cards.
FAMILY = [
    dict(name='Mohan', gender='man', age=21, only={'Station'}, drawn={},
         look='medium brown skin, short black hair, a thin moustache, a grin, a fireman\'s vest over a work shirt, soot smudged on one cheek'),
    dict(name='Ramesh', gender='man', age=33, only={'Lugdi'}, drawn={},
         look='dark brown skin, short black hair, a thick black moustache, a checked shirt with the sleeves rolled'),
    dict(name='Bauji', gender='man', age=57, only={'Lugdi'}, drawn={},
         look='dark brown skin, short white hair under a soft cloth cap, a white handlebar moustache, a plain cotton shirt, a stern look'),
    dict(name='Rani', gender='woman', age=18, only={'Cricket'}, drawn={},
         look='medium brown skin, black hair in a low ponytail, a bare forehead, a white cricket shirt'),
    dict(name='Vikram', gender='man', age=21, only={'Rukavat'}, drawn={},
         look='medium brown skin, short black hair, a college T-shirt'),
    dict(name='Badi', gender='woman', age=75, only={'Rukavat'}, drawn={},   # Badi Amma; a widow by 1999, so a bare forehead
         look='dark brown skin, thin white hair pulled into a small bun, deep lines round the eyes, a bare forehead, a plain white cotton sari over one shoulder'),
]


# A repaint with the same seed and a slightly changed prompt comes back nearly identical; a bump gives a new picture.
SEED_BUMP = {f'sunday-{n}': 1 for n in ('baldev', 'bindu', 'cyrus', 'deepa', 'ganga', 'jasleen', 'jonali', 'kiran', 'kunal',
             'mahesh', 'mehul', 'mitali', 'naresh', 'neha', 'sarla', 'shampa', 'shirin', 'tapan', 'vivek', 'yasmin', 'zarina')}
SEED_BUMP['enamel-ganga'] = 1  # her first station face read as European (owner: "repaint ganga", 22 Oct)


def cells(line):
    return [c.strip() for c in line.strip().strip('|').split('|')]


def cast():
    people, inside = [], False
    for ln in open(CAST, encoding='utf-8'):
        if ln.startswith('## '):
            inside = ln.startswith('## The cast')
        c = cells(ln) if inside and ln.startswith('| ') else []
        if len(c) < 6 or c[2] not in ('woman', 'man') or not re.fullmatch(r'[A-Z][a-z]+', c[0]):
            continue
        age = int(re.search(r'\d+', c[4]).group())
        look = c[5]
        drawn = {}
        m = re.search(r'\s*\(drawn: ([\w.-]+)\)', look)
        if m:
            world = re.search(r'First take: (\w+)', c[3])
            drawn[world.group(1) if world else c[3]] = m.group(1)
            look = look[:m.start()] + look[m.end():]
        look = re.sub(r'^[A-Z][a-z]+(?: [a-z]+)*;\s*', '', look)  # "Punjabi; ..." -> the look only
        people.append(dict(name=c[0], gender=c[2], age=age, look=look.strip(), drawn=drawn))
    people.append(DADI)
    return people + FAMILY


def who(p):
    return f"an Indian {p['gender']} about {p['age']} years old, {p['look']}"


def jobs():
    out = []
    for p in cast():
        for world, (prefix, tpl, off) in WORLDS.items():
            if world in p['drawn'] or world not in p.get('only', WORLDS):
                continue
            seed = 20000 + zlib.crc32(p['name'].encode()) % 50000 + 101 * off + 7919 * SEED_BUMP.get(f"{prefix}-{p['name'].lower()}", 0)
            out.append((p, world, prefix, tpl.format(who=who(p)), seed))
    return out


def free_pct():
    try:
        out = subprocess.run(['memory_pressure'], capture_output=True, text=True, timeout=20).stdout
        return int(re.search(r'free percentage: (\d+)%', out).group(1))
    except Exception:
        return 100


def other_flux():
    """Every other FLUX job on this Mac, from any session (22 Oct: another session's FLUX job plus this one crashed the Mac):
    a FLUX-named process holding over 1 GB (a shell or a small helper that only names FLUX does not count), or any
    process over 6 GB, that is not this one or its parent shells."""
    rows = {}
    for ln in subprocess.run(['ps', '-axo', 'pid=,ppid=,rss=,command='], capture_output=True, text=True).stdout.splitlines():
        f = ln.split(None, 3)
        if len(f) == 4:
            rows[int(f[0])] = (int(f[1]), int(f[2]), f[3])
    mine, pid = set(), os.getpid()
    while pid in rows and pid not in mine:
        mine.add(pid)
        pid = rows[pid][0]
    return [f"{pid} {cmd[:90]}" for pid, (_, rss, cmd) in rows.items()
            if pid not in mine and not cmd.startswith(('ps ', 'grep ')) and 'heavyq' not in cmd  # queued jobs wait their turn
            and ((re.search(r'mflux|klein|flux', cmd, re.I) and rss > 2 ** 20) or rss > 6 * 2 ** 20)]


def swap_gb():
    out = subprocess.run(['sysctl', '-n', 'vm.swapusage'], capture_output=True, text=True).stdout
    m = re.search(r'used = ([\d.]+)M', out)
    return float(m.group(1)) / 1024 if m else 0.0


def watch():
    """Stops this job at once (resumable) if another FLUX job starts, or if free memory stays under 5% for two checks
    running. Each image itself dips free memory well under 15% while it generates, so a higher bar stops healthy runs."""
    low = 0
    while True:
        time.sleep(5)
        others = other_flux()
        low = low + 1 if free_pct() < 5 else 0
        if others or low >= 2:
            print('stopping: ' + ('; '.join(others) or 'free memory under 5% for 10 seconds'), flush=True)
            os._exit(3)


def paint():
    os.nice(10)
    while True:
        others, free, swap = other_flux(), free_pct(), swap_gb()
        if not others and free >= 50 and swap < 20:
            break
        print('waiting: ' + ('; '.join(others) or f'free memory {free}%, swap {swap:.1f} GB'), flush=True)
        time.sleep(60)
    import threading
    threading.Thread(target=watch, daemon=True).start()
    import mlx.core as mx
    from mflux.models.common.config import ModelConfig
    from mflux.models.flux2.variants import Flux2Klein
    os.makedirs(RAW, exist_ok=True)
    todo = [j for j in jobs() if not os.path.exists(os.path.join(RAW, f"{j[2]}-{j[0]['name'].lower()}.png"))]
    only = os.environ.get('ONLY')
    if only:
        todo = [j for j in todo if j[0]['name'] in only.split(',')]
    print(f"{len(todo)} portraits to paint", flush=True)
    if not todo:
        return
    model = Flux2Klein(quantize=8, model_config=ModelConfig.flux2_klein_4b())
    logp = os.path.join(RAW, 'log.json')
    log = json.load(open(logp)) if os.path.exists(logp) else {}
    for i, (p, world, prefix, prompt, seed) in enumerate(todo, 1):
        while free_pct() < 30:
            print('waiting: free memory under 30%', flush=True)
            time.sleep(30)
        key = f"{prefix}-{p['name'].lower()}"
        t = time.time()
        img = model.generate_image(seed=seed, prompt=prompt, num_inference_steps=4, width=512, height=512)
        img.save(os.path.join(RAW, key + '.png'))
        mx.clear_cache()
        log[key] = dict(seed=seed, prompt=prompt, model='FLUX.2 klein 4B, 8-bit, mflux, 4 steps, 512x512')
        json.dump(log, open(logp, 'w'), indent=1)
        print(f"{i}/{len(todo)} {key} {round(time.time() - t, 1)}s", flush=True)
        time.sleep(1)
    print('done', flush=True)


def crop_resize(im, m):
    from PIL import Image
    w, h = im.size
    im = im.crop((int(w * m), int(h * m), int(w * (1 - m)), int(h * (1 - m))))
    return im.resize((340, 340), Image.LANCZOS)


def reink(im):
    """Station: the generated enamel source re-inked as a black dot screen on cream, as the drawn portraits were."""
    import numpy as np
    from PIL import Image, ImageOps
    g = ImageOps.autocontrast(im.convert('L'), cutoff=1)
    a = np.asarray(g).astype(float) / 255
    h, w = a.shape
    yy, xx = np.mgrid[0:h, 0:w]
    cell = 5
    d = ((xx % cell - cell / 2) ** 2 + (yy % cell - cell / 2) ** 2) ** 0.5
    a = a ** 1.25
    ink = d < (1 - a) * cell * 0.74
    cream, black = np.array(CREAM, float), np.array([18, 18, 18.0])
    out = np.where(ink[..., None], black, cream)
    return Image.fromarray(out.astype('uint8'))


def regrade(im):
    """Cricket card portraits: midtones down about 15%, highlights capped near #E6DCC4, the pale sky behind the head
    darkened to a sepia backdrop, local contrast raised over the face."""
    import numpy as np
    from PIL import Image, ImageFilter
    a = np.asarray(im).astype(float) / 255
    a = a ** 1.32
    cap = np.array([0xE6, 0xDC, 0xC4]) / 255
    a = np.minimum(a, cap)
    lum = a.mean(axis=2)
    h, w = lum.shape
    yy = np.mgrid[0:h, 0:w][0] / h
    sky = np.clip((lum - 0.55) / 0.25, 0, 1) * np.clip(1.2 - yy * 1.6, 0, 1)
    sepia = np.array([0.52, 0.40, 0.28])
    a = a * (1 - 0.7 * sky[..., None]) + sepia * 0.7 * sky[..., None]
    a = a * np.array([1.0, 0.95, 0.86])
    im = Image.fromarray((a.clip(0, 1) * 255).astype('uint8'))
    sharp = im.filter(ImageFilter.UnsharpMask(radius=6, percent=35, threshold=2))
    mask = Image.new('L', im.size, 0)
    from PIL import ImageDraw
    ImageDraw.Draw(mask).ellipse((w * 0.22, h * 0.12, w * 0.78, h * 0.78), fill=255)
    return Image.composite(sharp, im, mask.filter(ImageFilter.GaussianBlur(30)))


CREAM = (236, 228, 205)


def process():
    from PIL import Image
    import numpy as np
    global CREAM
    ref = np.asarray(Image.open(os.path.join(ASSETS, 'enamel-kamla.webp')).convert('RGB')).reshape(-1, 3)
    light = ref[ref.mean(axis=1) > 200]
    if len(light):
        CREAM = tuple(int(x) for x in np.median(light, axis=0))
    sys.path.insert(0, HERE)
    from wides import printlook
    log = json.load(open(os.path.join(RAW, 'log.json'))) if os.path.exists(os.path.join(RAW, 'log.json')) else {}
    made = copied = 0
    only = os.environ.get('ONLY')   # names, comma separated: process just these
    for p in cast():
        if only and p['name'] not in only.split(','):
            continue
        for world, (prefix, tpl, off) in WORLDS.items():
            if world not in p.get('only', WORLDS):
                continue
            key = f"{prefix}-{p['name'].lower()}"
            out = os.path.join(ASSETS, key + '.webp')
            if world in p['drawn']:
                src = os.path.join(ASSETS, p['drawn'][world])
                if os.path.abspath(src) != os.path.abspath(out):
                    shutil.copy2(src, out)
                    if key in CLEAN:
                        clean_dot(Image.open(out).convert('RGB'), *CLEAN[key]).save(out, 'WEBP', quality=90, method=6)
                    if os.path.exists(src + '.json'):
                        shutil.copy2(src + '.json', out + '.json')
                    copied += 1
                continue
            raw = os.path.join(RAW, key + '.png')
            if not os.path.exists(raw):
                continue
            im = Image.open(raw).convert('RGB')
            for dot in DOTS.get(key, []):
                im = clean_dot(im, *dot)
            if world == 'Station':
                im = reink(crop_resize(im, 0.07)); notes = ['cropped 7%', 'autocontrast', '5 px dot screen, black ink on cream only']
            elif world == 'Lugdi':
                im = crop_resize(im, 0.04); notes = ['painted border cropped 4% on each side', 'resized 340x340']
            elif world == 'Cricket':
                im = regrade(printlook(crop_resize(im, 0.03)))
                notes = ['margins cropped 3%', 'resized 340x340', 'magazine print finish',
                         're-graded: midtones down, highlights capped near #E6DCC4, sky darkened to sepia, face contrast up']
            else:
                im = crop_resize(im, 0.03); notes = ['margins cropped 3%', 'resized 340x340']
            if key in DOTS:
                notes.insert(0, 'marks painted out at ' + ', '.join(f'({x}, {y}) r{r}' for x, y, r in DOTS[key]))
            im.save(out, 'WEBP', quality=80, method=6)
            meta = log.get(key, {})
            prompt = f"{meta.get('prompt', '')}\n[{meta.get('model')}, seed {meta.get('seed')}; edits: {'; '.join(notes)}]"
            subprocess.run([IMP, 'embed-prompt', out, '--prompt', prompt], capture_output=True)
            made += 1
    print(f"processed {made}, copied {copied} drawn faces to their new names")


DOTS = {  # reviewed by eye on sheets/dots.png and a close-up sheet, 22 Oct: raw-image (x, y, radius) of each mark
    'sunday-jasleen': [(250, 142, 7)],
    'sunday-shirin': [(248, 164, 7)],
    'sunday-zarina': [(238, 147, 7)],
    'cricket-face-agnes': [(254, 122, 7), (253, 149, 7)],
    'cricket-face-jasleen': [(253, 119, 7)],
    'cricket-face-mumtaz': [(256, 157, 7)],
    'cricket-face-rabia': [(249, 172, 7)],
    'cricket-face-yasmin': [(225, 143, 6)],
    'cricket-face-zarina': [(247, 150, 7)],
    'enamel-agnes': [(248, 161, 11)],
    'enamel-jasleen': [(247, 131, 7)],
    'enamel-rabia': [(249, 169, 7)],
    'enamel-shirin': [(243, 162, 7)],
    'enamel-yasmin': [(248, 158, 6)],
    'enamel-zarina': [(244, 152, 7)],
    'jadugar-agnes': [(244, 168, 8)],
    'jadugar-baldev': [(256, 172, 7)],
    'jadugar-firoz': [(241, 158, 6)],
    'jadugar-gurpreet': [(249, 157, 6)],
    'jadugar-jasleen': [(255, 148, 6)],
    'jadugar-mumtaz': [(255, 158, 6)],
    'jadugar-rabia': [(250, 155, 8)],
    'jadugar-shirin': [(258, 165, 6)],
    'jadugar-thomas': [(255, 157, 5)],
    'jadugar-zarina': [(254, 159, 8)],
    'pulp-agnes': [(217, 164, 9)],
    'pulp-gurpreet': [(247, 126, 6)],
    'pulp-jasleen': [(239, 117, 7)],
    'pulp-mumtaz': [(197, 141, 5)],
    'pulp-rabia': [(224, 156, 7)],
    'pulp-zarina': [(246, 149, 7)],
    'sunday-agnes': [(239, 161, 8)],
    'sunday-annamma': [(257, 177, 7)],
    'sunday-mumtaz': [(237, 155, 6)],
    'sunday-rabia': [(250, 162, 7)],
}


def dots():
    """Review sheet of find_dot()'s suggestion on every raw portrait of a BARE name, each numbered, plus the
    suggestions as JSON, so the confirmed ones can be copied into DOTS."""
    from PIL import Image, ImageDraw
    out, tiles = {}, []
    for p in cast():
        if p['name'] not in BARE:
            continue
        for world, (prefix, _, _) in WORLDS.items():
            raw = os.path.join(RAW, f"{prefix}-{p['name'].lower()}.png")
            if os.path.exists(raw):
                im = Image.open(raw).convert('RGB')
                d = find_dot(im)
                if d:
                    out[f"{prefix}-{p['name'].lower()}"] = d
                    tiles.append((len(tiles) + 1, f"{prefix}-{p['name'].lower()}", im, d))
    T, cols = 200, 8
    box = (int(512 * .28), int(512 * .06), int(512 * .72), int(512 * .50))
    k = T / (box[2] - box[0])
    sheet = Image.new('RGB', (cols * (T + 4), ((len(tiles) + cols - 1) // cols) * (T + 16)), (250, 248, 242))
    dr = ImageDraw.Draw(sheet)
    for i, (n, key, im, (x, y, r)) in enumerate(tiles):
        ox, oy = (i % cols) * (T + 4), (i // cols) * (T + 16)
        sheet.paste(im.crop(box).resize((T, T)), (ox, oy))
        cx, cy, rr = (x - box[0]) * k + ox, (y - box[1]) * k + oy, r * k + 4
        dr.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), outline=(0, 230, 0), width=2)
        dr.text((ox + 3, oy + T + 2), f"{n}. {key}", fill=(0, 0, 0))
    os.makedirs(os.path.join(RAW, 'sheets'), exist_ok=True)
    sheet.save(os.path.join(RAW, 'sheets', 'dots.png'))
    json.dump(out, open(os.path.join(RAW, 'dot-candidates.json'), 'w'), indent=1)
    print(len(tiles), 'suggestions on sheets/dots.png')


def sheets():
    """One contact sheet per world: every cast member's portrait in that world's style, labelled, for the art check."""
    from PIL import Image, ImageDraw
    os.makedirs(os.path.join(RAW, 'sheets'), exist_ok=True)
    people = cast()
    for world, (prefix, _, _) in WORLDS.items():
        tiles = [(p['name'], os.path.join(ASSETS, f"{prefix}-{p['name'].lower()}.webp")) for p in people]
        tiles = [t for t in tiles if os.path.exists(t[1])]
        cols, size = 10, 170
        rows = (len(tiles) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * size, rows * (size + 22)), (250, 248, 242))
        d = ImageDraw.Draw(sheet)
        for i, (name, path) in enumerate(tiles):
            x, y = (i % cols) * size, (i // cols) * (size + 22)
            sheet.paste(Image.open(path).convert('RGB').resize((size - 6, size - 6)), (x + 3, y + 3))
            d.text((x + 6, y + size), name, fill=(20, 20, 20))
        out = os.path.join(RAW, 'sheets', f'{world.lower()}.png')
        sheet.save(out)
        print(out, len(tiles))


if __name__ == '__main__':
    {'paint': paint, 'process': process, 'sheets': sheets, 'dots': dots,
     'list': lambda: print(len(jobs()), 'to paint;', len(cast()), 'people')}[sys.argv[1]]()
