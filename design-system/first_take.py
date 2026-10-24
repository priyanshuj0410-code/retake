"""The First take as playable screens, read from knowledge/content/first-take.md (the owner's draft of 22 Oct 2026), for
the shared demo (demo.py). Owner, 22 Oct 2026: "Get the demo to run the whole first take then since we have the puzzles".

Every screen is drawn in the library's own markup (tiles, rows, the batting order's rank column, Split's chore card),
with the First take's people, numbers, lines and buttons in place of the library's samples. The hard decisions stay
out of the shared demo until each chapter's help line is checked against its official source (first-take.md, "Read
this first"): a shared link reaches people who may need that line. The owner's private review (demo.py review, owner,
23 Oct 2026: "The 12 hard decisions") has them all, with rank and spend checks, the two kinds only they use.
"""
import re
from pathlib import Path

import library as L

SRC = Path(__file__).resolve().parents[1] / 'knowledge' / 'content' / 'first-take.md'
# the hard twins, from "The five chapters at a glance"
HARD = {'station': {2, 6}, 'lugdi': {2, 6}, 'jadugar': {1, 5}, 'cricket': {2, 6}, 'rukavat': {2, 4, 6, 8}}
# each number's icon names what it counts (DESIGN.md "Icons"); the key under the question carries the word
ICON = {'trips': 'wheel', 'runs': 'wheel', 'crashes': 'crash', 'short': 'alert', 'faults': 'tool', 'loads': 'ledger',
        'late': 'clock', 'fines': 'stamp', 'marks': 'score', 'rating': 'cr-win', 'audits': 'ledger', 'shows': 'jd-stage',
        'towns': 'ticket', 'slips': 'jd-missed', 'nights': 'today', 'average': 'bat', 'matches': 'cr-match',
        'season runs': 'score', 'wins': 'cr-win', 'wickets': 'cr-match', 'catches': 'hand', 'hours': 'clock', 'skill': 'tool',
        'Sundays': 'week', 'jobs': 'hand', 'evenings home': 'today', 'school meetings': 'person', 'weddings': 'person', 'talks': 'speaker'}
BY_WORLD = {('lugdi', 'years'): 'wheel', ('station', 'years'): 'st-line', ('station', 'missed'): 'st-signal', ('jadugar', 'years'): 'jd-stage', ('jadugar', 'missed'): 'jd-missed'}


def pair(s):
    a, b = (x.strip() for x in s.split(' | ', 1))
    return a, b


def quoted(s):
    m = re.match(r'\s*"(.*)"\s*/\s*"(.*)"\s*$', s)
    return (m.group(1), m.group(2)) if m else None


def parse(hard=False):
    """The chapters, each {world, area, line, speaker (en, hi), face, decisions}; each decision carries its kind,
    question, voice, chores, keys, people and button, as the draft writes them. hard=True keeps the hard decisions."""
    text = SRC.read_text(encoding='utf-8')
    text = text[text.index('## Chapter 1'):text.index('## The results')]
    chapters = []
    for ch in re.split(r'\n(?=## Chapter )', text):
        head = re.match(r'## Chapter (\d): (\w+), (.+)', ch)
        world = head.group(2).lower()
        sp = re.search(r'\*\*Speaker:\*\* (.+?) \((.+?)\)', ch)
        who = sp.group(1).split(',')[0].strip()
        line = re.search(r'\*\*Line under the area, naming the setting plainly:\*\* (.+)', ch)
        c = {'n': int(head.group(1)), 'world': world, 'area': head.group(3).strip(), 'speaker': (sp.group(1), sp.group(2)),
             'line': pair(line.group(1)), 'face': f'{L.A}{L.WORLDS[world].face_prefix}-{who.split()[0].lower()}.webp', 'decisions': []}
        for block in re.split(r'\n(?=### )', ch)[1:]:
            m = re.match(r'### \w+ (\d+)\. (.+)', block)
            n = int(m.group(1))
            if n in HARD[world] and not hard:
                continue
            g = lambda k: (re.search(rf'\*\*{k}:\*\* (.+)', block) or [None, None])[1]
            d = {'n': n, 'title': m.group(2).strip(), 'kind': g('Kind'), 'q': pair(g('Question')), 'button': pair(g('Button'))}
            v = re.search(r'\*\*Voice:\*\* ([^:]+): "(.+?)" \| "(.+?)"', block)
            d['voice'] = (v.group(1), v.group(2), v.group(3)) if v else None
            d['chores'] = list(zip(*(x.split(', ') for x in pair(g('Chores and TV'))))) if g('Chores and TV') else None
            lines = [ln for ln in block.splitlines() if ln.startswith('|')]
            cols = [x.strip() for x in lines[0].strip('|').split('|')]
            keys = []
            for col in cols[1:]:
                km = re.match(r'(.+?) \((.+)\)$', col)
                if km:
                    en = km.group(1)
                    keys.append((BY_WORLD.get((world, en)) or ICON[en], en, km.group(2)))
            d['keys'] = keys
            d['people'] = []
            for ln in lines[2:]:
                cells = [x.strip() for x in ln.strip('|').split('|')]
                nm = re.match(r'(.+?) \((.+)\)', cells[0])
                d['people'].append({'en': nm.group(1), 'hi': nm.group(2), 'vals': cells[1:1 + len(keys)],
                                    'line': quoted(cells[1 + len(keys)]) if len(cells) > 1 + len(keys) else None,
                                    'face': f'{L.A}{L.WORLDS[world].face_prefix}-{nm.group(1).lower()}.webp'})
            hp = re.search(r'\*\*Hidden pair:\*\* (\w+) and (\w+)', block)
            d['pair'] = [hp.group(1), hp.group(2)]
            c['decisions'].append(d)
        # for the results: each person's side from the cast table, and each twin with the decision whose nudge is on the woman
        c['sex'] = dict(re.findall(r'^\| (\w+) \| [^|]+ \| (woman|man) \|', ch, re.M))
        c['twins'] = [{'a': int(a), 'b': int(b), 'kind': k, 'on_woman': int(w)}
                      for a, b, k, w in re.findall(r'^\| \w+ (\d) and (\d) \| [^|]+ \| (plain|hard|matters) \| \w+ (\d) \|', ch, re.M)]
        chapters.append(c)
    return chapters


# ---------- parts, in the library's markup ----------
def statkey(keys):
    return '<div class="statkey" aria-hidden="true">' + ''.join(f'<span>{L.ic(k)}{L.tx("span", en, hi)}</span>' for k, en, hi in keys) + '</div>'


def stats(keys, vals):
    cls = {1: 'stats c1', 2: 'stats c2'}.get(len(vals), 'stats')
    return f'<span class="{cls}" aria-hidden="true">' + ''.join(f'<span class="stat">{L.ic(k)}{v}</span>' for (k, _, _), v in zip(keys, vals)) + '</span>'


def spoken(d, p):
    en = p['en'] + ', ' + ', '.join(f'{v} {k}' for (_, k, _), v in zip(d['keys'], p['vals']))
    hi = p['hi'] + ', ' + ', '.join(f'{v} {k}' for (_, _, k), v in zip(d['keys'], p['vals']))
    return en, hi


def byline(c):
    en, hi = c['speaker']
    return f'<div class="byline"><i style="background-image:url({c["face"]})" aria-hidden="true"></i>{L.tx("span", en, hi, "", L.NOCOUNT)}</div>'


def voice(c, d):
    """A spoken line takes the byline's place, with the speaker's name and role on the balloon: the speaker shows once
    (owner, 22 Oct 2026, of a step that had both: "Repetitive")."""
    if not d['voice']:
        return ''
    _, en, hi = d['voice']
    return (f'<div class="voice"><span class="av" style="background-image:url({c["face"]})" aria-hidden="true"></span>'
            f'<div class="balloon"{L.NOCOUNT}>{L.tx("b", *c["speaker"])}{L.tx("p", f"“{en}”", f"“{hi}”")}</div></div>')


def live_label(d):
    """The button names its consequence with the picked person: "Send Kamla" becomes "Send {n}"."""
    en, hi = d['button']
    for p in d['people']:
        if p['en'] in en:
            return en.replace(p['en'], '{n}'), hi.replace(p['hi'], '{n}')
    return en, hi


def frame(c, d, i, total, parts, kind, cls, btn):
    W = L.WORLDS[c['world']]
    prog = [progress(*d['prog'])] if d.get('prog') else []
    inner = L.topbar('step', W.take_plate or W.plate(kind)) + L.body(*prog, *parts) + L.dock(btn)
    art, ac = W.art(kind)
    # data-ft names the decision, so the results can read the pick made on it
    return L.phone(c['world'], inner, f'{W.title} {i} of {total}: {d["title"]}', f'{cls}" data-ft="{c["world"]}-{d["n"]}', art, ac)


# ---------- the four kinds the First take uses outside its hard twins ----------
def step_pick(c, d, i, total, many=0):
    """Pick one, and Believe (the same card with the person's own account as the line). many > 0 is spend checks: the
    same cards, each tapped one takes a check, up to many."""
    W = L.WORLDS[c['world']]
    qid = L.uid('h')
    role = 'checkbox' if many else 'radio'
    tl = ''
    for j, p in enumerate(d['people']):
        qq = L.uid('q')
        if not p['line']:
            line = ''
        elif d.get('notes'):   # a note in the world's own paperwork, not a quote (change 7, ideas A and B)
            line = L.tx('span', *p['line'], 'note', f' id="{qq}"')
        else:
            line = L.tx('span', f'“{p["line"][0]}”', f'“{p["line"][1]}”', 'quote', f' id="{qq}"')
        ser = f'<span class="serial" aria-hidden="true">{L.tx("span", "No.", "क्र.")} {W.serial(j)}</span>' if W.serial(j) else ''
        teller = ' jd-teller' if d['kind'].lower().startswith('believe') else ''   # Believe's playing card (worlds/jadugar.py)
        tl += (f'<button class="tile{teller}" type="button" role="{role}" aria-checked="false"{L.al(*spoken(d, p))} aria-describedby="{qq}" data-en="{p["en"]}" data-hi-name="{p["hi"]}">'
               f'<span class="tick" aria-hidden="true">{L.ic("tick")}</span><span class="armmark" aria-hidden="true">{L.ic("arrow")}</span><span class="lockmark" aria-hidden="true">{L.ic("lock")}</span>'
               f'<span class="face" style="background-image:url({p["face"]})" aria-hidden="true"></span>'
               f'<span class="nmrow" aria-hidden="true"><span class="nm" data-hi="{p["hi"]}">{p["en"]}</span>{ser}</span>{stats(d["keys"], p["vals"])}{line}</button>')
    le, lh = live_label(d)
    btn = L.main('Take up at least one', 'कम से कम एक चुनें', *d['button']) if many else L.main('Pick one', 'किसी एक को चुनें', le, lh)
    parts = [L.h1q(*d['q'], qid), voice(c, d) or byline(c), statkey(d['keys']),
             f'<div class="tiles" data-n="{len(d["people"])}" data-shuffle role="{"group" if many else "radiogroup"}" aria-labelledby="{qid}">{tl}</div>']
    # phone() takes classes only; a step's limit rides in after the class list, as the team size does
    return frame(c, d, i, total, parts, 'checks' if many else 'twin', f'js-checks" data-max="{many}' if many else 'js-pick', btn)


def step_rank(c, d, i, total, ranked=()):
    """Rank, filled from the top by tapping; a ranked person tapped comes out. The place is type in the pick mark's spot,
    the ranked rows move up into their order, the places that win a seat show as picks, and a perforation falls after the
    last seat (owner, 23 Oct 2026: "The rankings need to be more clear"). ranked, names in order, draws a state standing
    still, for the library."""
    qid = L.uid('h')
    seats = int(re.search(r'(\d+) seats', d['kind']).group(1))
    rws = []
    for p in sorted(d['people'], key=lambda p: ranked.index(p['en']) if p['en'] in ranked else len(ranked)):
        k = ranked.index(p['en']) + 1 if p['en'] in ranked else 0
        r = row(d, p, stats(d['keys'], p['vals']), f'<b class="rkno" aria-hidden="true">{k or ""}</b>')
        rws.append(r.replace('class="row"', 'class="row is-selected"', 1).replace('aria-checked="false"', 'aria-checked="true"', 1) if 0 < k <= seats else r)
    # the cut rides in the rows, hidden until the seats are filled; the page's script moves it under the last seat
    rws.insert(seats if len(ranked) >= seats else len(rws),
               f'<div class="rkcut"{"" if len(ranked) >= seats else " hidden"}>{L.ic("arrow")}{L.tx("span", f"{seats} seats", f"{seats} सीटें")}</div>')
    rws = ''.join(rws)
    n = len(d['people']) - len(ranked)
    btn = L.main(f'Rank {n} more', f'{n} और क्रम में लगाएँ', *d['button'])
    parts = [L.h1q(*d['q'], qid), voice(c, d) or byline(c), statkey(d['keys']),
             f'<div class="rows is-compact" data-shuffle role="group" aria-labelledby="{qid}">{rws}</div>']
    return frame(c, d, i, total, parts, 'sort', f'js-rank" data-seats="{seats}', btn)


def row(d, p, side, mark=''):
    note = L.tx('span', *p['line'], 'note') if d.get('notes') and p['line'] else ''
    return (f'<button class="row" type="button" role="checkbox" aria-checked="false"{L.al(*spoken(d, p))} data-en="{p["en"]}" data-hi-name="{p["hi"]}">'
            f'<span class="tick" aria-hidden="true">{L.ic("tick")}</span><span class="armmark" aria-hidden="true">{L.ic("arrow")}</span>'
            f'<span class="face" style="background-image:url({p["face"]})" aria-hidden="true"></span>'
            f'<span class="who" aria-hidden="true"><span class="nm" data-hi="{p["hi"]}">{p["en"]}</span></span><span class="side" aria-hidden="true">{side}</span>{mark}{note}</button>')


def step_team(c, d, i, total):
    """Pick a team: N of the people, as rows."""
    qid = L.uid('h')
    need = int((re.search(r'(\d+) of \d+', d['kind']) or re.search(r'(\d+)', d['q'][0])).group(1))
    rws = ''.join(row(d, p, stats(d['keys'], p['vals'])) for p in d['people'])
    btn = L.main(f'Pick {need} more', f'{need} और चुनें', *d['button'])
    parts = [L.h1q(*d['q'], qid), voice(c, d) or byline(c), statkey(d['keys']),
             f'<div class="rows is-compact" data-shuffle role="group" aria-labelledby="{qid}">{rws}</div>']
    # phone() takes classes only; the team size rides in after the class list
    return frame(c, d, i, total, parts, 'team', f'js-multi" data-need="{need}', btn)


def step_order(c, d, i, total):
    """The batting order: the rank column fills from the top; a placed player tapped goes back (Cricket's own kind)."""
    qid = L.uid('h')
    slots = ''.join(f'<li><button class="slot cr-pos{" is-target" if j == 0 else ""}" type="button" data-n="{j + 1}"{L.al(f"{j + 1}, empty", f"{j + 1}, ख़ाली")}>'
                    f'<b class="cr-no" aria-hidden="true">{j + 1}</b></button></li>' for j in range(len(d['people'])))
    tray = ''
    for p in d['people']:
        tray += (f'<button class="row cr-mini" type="button"{L.al(*spoken(d, p))} data-en="{p["en"]}" data-hi-name="{p["hi"]}">'
                 f'<span class="face" style="background-image:url({p["face"]})" aria-hidden="true"></span>'
                 f'<span class="who" aria-hidden="true"><span class="nm" data-hi="{p["hi"]}">{p["en"]}</span>{stats(d["keys"], p["vals"])}</span></button>')
    n = len(d['people'])
    btn = L.main(f'Place {n} more', f'{n} और रखें', *d['button'])
    parts = [L.h1q(*d['q'], qid), voice(c, d) or byline(c), statkey(d['keys']), f'<ol class="cr-order" aria-labelledby="{qid}">{slots}</ol>',
             f'<div class="cr-tray at-end" data-shuffle role="group"{L.al("Players", "खिलाड़ी")}>{tray}</div>']
    return frame(c, d, i, total, parts, 'team', 'js-order', btn)


def step_split(c, d, i, total):
    """Split: tap a chore, then a person; a filled chore tapped comes free (Rukavat's own kind)."""
    qid = L.uid('h')
    slots = ''.join(f'<div class="slotwrap"><button class="slot" type="button"{" data-tv" if en == "TV" else ""}{L.al(f"{en}, empty", f"{hi}, ख़ाली")}>{L.tx("b", en, hi)}</button></div>'
                    for en, hi in d['chores'])
    obj = f'<div class="rk-card on-paper rk-sched"><div class="rk-slots" role="group" aria-labelledby="{qid}">{slots}</div></div>'
    rows = ''.join(row(d, p, stats(d['keys'], p['vals']) + '<span class="rk-marks"></span>').replace('role="checkbox" aria-checked="false"', '')
                   for p in d['people'])
    n = len(d['chores'])
    btn = L.main(f'Share {n} more', f'{n} और बाँटें', *d['button'])
    parts = [L.h1q(*d['q'], qid), voice(c, d) or byline(c), obj,
             f'<div class="at-end rk-family">{statkey(d["keys"])}<div class="rows is-compact" role="group" aria-labelledby="{qid}">{rows}</div></div>']
    return frame(c, d, i, total, parts, 'split', 'rk-split js-split', btn)


def step(c, d, i, total):
    k = d['kind'].lower()
    if k.startswith('pick one') or k.startswith('believe') or 'second stage' in k:   # the captain: one of the order's four
        return step_pick(c, d, i, total)
    if k.startswith('spend checks'):
        return step_pick(c, d, i, total, many=int(re.search(r'up to (\d+)', k).group(1)))
    if k.startswith('rank'):
        return step_rank(c, d, i, total)
    if k.startswith('pick a team') or k.startswith('keep'):
        return step_team(c, d, i, total)
    if 'batting order' in k:
        return step_order(c, d, i, total)
    if k.startswith('split'):
        return step_split(c, d, i, total)
    raise SystemExit(f'{c["world"]} {d["n"]}: no screen for the kind {d["kind"]!r}')


# ---------- the changes the owner chose on 23 Oct 2026 (knowledge/reviews/team-feedback-2026-10-23.md) ----------
# Change 7, ideas A and B: every card carries a note in its world's own paperwork, the loaded word is one note among
# them, and the others are decoys about people outside the pair; the boss's remark becomes a scene line with no names.
# Sketch content for one decision in each world, until the research line checks the design and the 40 are rewritten.
SKETCH = {
    ('lugdi', 1): (('The convoy leaves at midnight.', 'काफ़िला आधी रात को निकलेगा।'), {
        'Etwari': ('Loads fastest at the depot.', 'डिपो पर सबसे तेज़ लोड करती है।'),
        'Anthony': ("Back from a week's leave.", 'हफ़्ते भर की छुट्टी से लौटा है।'),
        'Jasleen': ('Family worries about her night runs.', 'घरवाले उसके रात के फेरों से फ़िक्र करते हैं।'),
        'Dinesh': ('Drives the green truck.', 'हरा ट्रक चलाता है।'),
        'Nirmala': ('Asked for more night runs.', 'उसने और रात के फेरे माँगे हैं।')}),
    ('jadugar', 4): (('The ticket tin needs a keeper.', 'टिकट के डिब्बे को एक रखवाला चाहिए।'), {
        'Mitali': ('Her brother works for the rival troupe.', 'उसका भाई दूसरी मंडली में काम करता है।'),
        'Lalit': ("Lodges with the drummer's family.", 'ढोलक वाले के परिवार के साथ रहता है।'),
        'Jonali': ('Counts the tickets every night.', 'हर रात टिकट गिनती है।'),
        'Thomas': ('Joined in Nashik last month.', 'पिछले महीने नाशिक में जुड़ा।')}),
    ('cricket', 3): (('Three places left on the team sheet.', 'टीम शीट में तीन जगह बाक़ी हैं।'), {
        'Zarina': ('Rest her for the final, it gets rough.', 'फ़ाइनल में उसे आराम दो, खेल सख़्त होता है।'),
        'Mani': ('Plays in his lucky cap.', 'अपनी लकी टोपी में खेलता है।'),
        'Kabir': ('Fielded every ball last Sunday.', 'पिछले इतवार हर गेंद पर फ़ील्डिंग की।'),
        'Leena': ('Bats left-handed.', 'बाएँ हाथ से बल्लेबाज़ी करती है।'),
        'Chandan': ('New bat this season.', 'इस सीज़न नया बल्ला।')}),
    ('rukavat', 3): (('Nobody has cleared the loft in years.', 'बरसों से किसी ने टांड साफ़ नहीं की।'), {
        'Deepa': ('Allergic to dust.', 'धूल से एलर्जी है।'),
        'Chetan': ('Home from hostel for the week.', 'हफ़्ते भर के लिए हॉस्टल से आया है।'),
        'Uma': ('Cleared the storeroom last year.', 'पिछले साल स्टोर रूम साफ़ किया था।')}),
}
SKETCH_PLAIN = {('station', 1)}   # its cards already carry one line each: only the paperwork changes


def sketched(c, d):
    """The decision with its notes on the cards and its scene line, for the sketch; None if it has no sketch."""
    key = (c['world'], d['n'])
    if key in SKETCH_PLAIN:
        return dict(d, notes=True)
    if key not in SKETCH:
        return None
    scene, notes = SKETCH[key]
    missing = [p['en'] for p in d['people'] if p['en'] not in notes]
    if missing:
        raise SystemExit(f'{key}: no note for {missing}')
    return dict(d, notes=True, voice=(None, *scene), people=[dict(p, line=notes[p['en']]) for p in d['people']])


def progress(chapter, step, steps):
    """Five segments, one a chapter: the chapters done are full, this one fills step by step (change 5)."""
    segs = ''.join(f'<i style="--f:{100 if k < chapter else round(100 * step / steps) if k == chapter else 0}%"></i>' for k in range(1, 6))
    return f'<div class="ftprog"{L.al(f"Chapter {chapter} of 5, {step} of {steps}", f"अध्याय {chapter}/5, {step}/{steps}")} role="img">{segs}</div>'


# Change 3: each chapter closes on a result. The same for every player, whoever they picked, so no ending rewards a side.
RESULTS = {'station': ('Every train ran tonight.', 'हर गाड़ी आज रात चली।'),
           'lugdi': ('The convoys reached the top.', 'काफ़िले ऊपर पहुँच गए।'),
           'jadugar': ('The show went on.', 'शो चलता रहा।'),
           'cricket': ('The final was played.', 'फ़ाइनल खेला गया।'),
           'rukavat': ('The week is planned.', 'हफ़्ते का हिसाब बन गया।')}


# ---------- the five private cards after chapter 5 (first-take.md, "The results"; owner, 23 Oct 2026: "Build the first take
# results page") ----------
# The page works them out from the player's own picks and sends nothing. The lean out of 100 and "how sure" wait on the
# research line (RSE-164), so the cards show only counts of the player's picks, never a score.
NUDGE = {('station', 1): ('the words', 'शब्दों'), ('station', 3): ('the time off', 'छुट्टी'), ('station', 4): ('the section', 'सेक्शन'),
         ('lugdi', 1): ('the family worry', 'घर की फ़िक्र'), ('lugdi', 3): ('the words', 'शब्दों'), ('lugdi', 4): ('the licence', 'लाइसेंस'),
         ('jadugar', 2): ('the money talk', 'पैसों की बात'), ('jadugar', 3): ('who saw it', 'देखने वाले'), ('jadugar', 4): ('the rival troupe', 'दूसरी मंडली'),
         ('cricket', 1): ('the bad day', 'बुरे दिन'), ('cricket', 3): ('the rest', 'आराम'), ('cricket', 4): ('the keeper', 'कीपर'),
         ('rukavat', 1): ('the film', 'फ़िल्म'), ('rukavat', 3): ('the dust', 'धूल')}
# card 3, said for "the men picked more often"; the page swaps man and woman for the other side
REAL = {'work': ('At work: same record, but the man is promoted.', 'काम पर: एक जैसा रिकॉर्ड, पर तरक्की आदमी को मिलती है।'),
        'safety and justice': ('On the road: same record, but the woman is kept off the night run.', 'सड़क पर: एक जैसा रिकॉर्ड, पर रात की ट्रिप से औरत को रोका जाता है।'),
        'trust': ('Same story, but it is believed when the man tells it.', 'बात एक ही, पर मानी तब जाती है जब आदमी कहे।'),
        'teams and leaders': ('Same record, but the woman is left out of the big match.', 'एक जैसा रिकॉर्ड, पर बड़े मैच से औरत को बाहर रखा जाता है।'),
        'home and family': ('Same free hours, but the woman gets the chores.', 'फ़ुर्सत एक जैसी, पर घर के काम औरत को मिलते हैं।')}


def kindcode(d):
    k = d['kind'].lower()
    if k.startswith(('pick one', 'believe')) or 'second stage' in k:
        return 'pick'
    if k.startswith(('pick a team', 'keep', 'spend checks')):
        return 'set'
    return 'order' if 'batting order' in k else 'rank' if k.startswith('rank') else 'split'


def results_data(chapters, nudge=None):
    """What the page needs to read the picks: each decision's hidden two, their sides and faces; each twin and its nudge."""
    dec, twins, areas = {}, [], {}
    for c in chapters:
        w = c['world']
        W = L.WORLDS[w]
        areas[w] = {'real': REAL[c['area'].lower()], 'scene': W.scene(W.moment('cover'))}
        played = {d['n']: d for d in c['decisions']}
        for t in c['twins']:
            for n in (t['a'], t['b']):
                if n not in played:
                    continue
                d = played[n]
                sex = {p: c['sex'][p][0] for p in d['pair']}
                woman = next(p for p in d['pair'] if sex[p] == 'w')
                dec[f'{w}-{n}'] = {'kind': kindcode(d), 'pair': d['pair'], 'sex': sex, 'q': d['q'],
                                   'nudged': woman if t['on_woman'] == n else next(p for p in d['pair'] if p != woman),
                                   'faces': {p['en']: p['face'] for p in d['people'] if p['en'] in d['pair']},
                                   'hi': {p['en']: p['hi'] for p in d['people'] if p['en'] in d['pair']}}
            if t['a'] in played and t['b'] in played:
                twins.append({'a': f'{w}-{t["a"]}', 'b': f'{w}-{t["b"]}', 'world': w, 'kind': t['kind'],
                              'nudge': (nudge or NUDGE).get((w, t['a']), ('the nudge', 'बात'))})
    return {'decisions': dec, 'twins': twins, 'areas': areas}


def results_samples(chapters):
    """The five cards filled with first-take.md's own samples (the men picked more often), for the library and the
    sketch, where there are no picks to read: (picture class, picture, English, Hindi) for each card."""
    D = results_data(chapters)['decisions']
    def pp(d, picked):
        return ''.join(f'<span class="pp{" is-picked" if p == picked else ""}"><i style="background-image:url({d["faces"][p]})"></i>'
                       f'{L.tx("b", p, d["hi"][p])}{L.tx("em", "the words", "शब्दों") if d["nudged"] == p else ""}</span>' for p in d['pair'])
    halves = ''.join(f'<span class="half">{pp(D[k], next(p for p in D[k]["pair"] if D[k]["sex"][p] == "m"))}</span>' for k in ('station-1', 'station-5'))
    stacks = ''.join(f'<span class="resstack"><span class="bars">{"<i></i>" * n}</span>{L.tx("b", en, hi)}</span>' for n, en, hi in ((14, 'woman', 'औरत'), (26, 'man', 'आदमी')))
    W = L.WORLDS['station']
    return [('stacks', stacks, '40 times, 2 people had the same numbers. You picked the man 26 times.', '40 बार, 2 लोगों के नंबर एक जैसे थे। आपने 26 बार आदमी को चुना।'),
            ('twin', halves, 'Same numbers both times. The words swapped sides. You picked the man both times.', 'दोनों बार नंबर एक जैसे थे। बस शब्दों की जगह बदली। आपने दोनों बार आदमी को चुना।'),
            ('', f'<span class="scene" style="background-image:url({W.scene(W.moment("cover"))})"></span>', *REAL['work']),
            ('', f'<span class="trade"><i></i>{L.ic("arrow") * 2}<i></i></span>', 'Before you choose, swap the 2 people in your head. Would you still choose the same?', 'चुनने से पहले, मन में दोनों को आपस में बदल दें। क्या तब भी वही चुनाव होगा?'),
            ('', '<span class="marks"><i></i><i></i><i></i><i></i><i></i></span>', '40 choices in 20 minutes. A first reading, from one sitting.', '20 मिनट, 40 चुनाव। एक बैठक की पहली रीडिंग।')]


def results_phones(samples=None, end=True):
    """The five cards; empty for the page to fill from the player's picks, or filled with samples."""
    W = L.WORLDS['rukavat']
    out = []
    for n in range(1, 6):
        last = n == 5 and end   # "Dadi's trunk" closes on a cutscene after the cards, so its card 5 moves on
        pcls, pic, en, hi = samples[n - 1] if samples else ('', '', '', '')
        forget = f'<button class="textbtn resforget" type="button">{L.tx("span", "Not you? Remove this reading", "आप नहीं? यह रीडिंग हटाएँ")}</button>' if n == 5 else ''
        inner = (L.topbar('cover', first=True) + L.body(f'<div class="respic {pcls}">{pic}</div>', f'<div class="qbox"><h1 class="q restext" data-hi="{hi}">{en}</h1></div>', forget)
                 + L.dock(L.out_btn(*(('Done', 'हो गया') if last else ('Next', 'आगे')))))
        out.append(L.phone('rukavat', inner, f'Your reading, card {n} of 5', f'js-res{" js-end" if last else ""}" data-card="{n}',
                           W.scene(W.moment('result')), 'veil-low'))
    return out


def chapter_end(c):
    W = L.WORLDS[c['world']]
    last = c['n'] == 5
    inner = (L.topbar('cover', first=True)
             + L.body(L.h1q(*RESULTS[c['world']]), L.tx('p', f'Chapter {c["n"]} of 5 done', f'अध्याय {c["n"]}/5 पूरा', 'nextline'),
                      progress(c['n'] + 1, 0, 1), cls='is-cover')
             + L.dock(L.out_btn(*(('Finish', 'पूरा करें') if last else ('Next chapter', 'अगला अध्याय')))))
    return L.phone(c['world'], inner, f'{W.title}: chapter {c["n"]} done', 'js-done', W.scene(W.moment('result')), 'veil-low')
