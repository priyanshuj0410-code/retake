"""The First take as "Dadi's trunk", read from knowledge/story/first-take-script.md (owner, 23 Oct 2026: "Start
painting... I need this in the demo") into the same shapes first_take.py draws, so every screen uses the library's
own steps, notes, progress and results.

The script is the one source: its panels (captions in English and Hindi) become the cutscenes, its decisions the steps.
The decisions are written in English only until the research check; until their Hindi is drafted, the Hindi mode
shows them in English (a known gap, said in the build's output).
"""
import os
import re
from pathlib import Path

import library as L
import first_take as FT

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / 'knowledge' / 'story' / 'first-take-script.md'
PEOPLE = ROOT / 'knowledge' / 'story' / 'people.md'
ERA = {'1971': 'station', '1977': 'lugdi', '1984': 'jadugar', '1992': 'cricket', '1999': 'rukavat'}
# the script's keys: (icon, label, Hindi label); the icons follow DESIGN.md "Icons"
KEYS = {'years on the line': ('st-line', 'years', 'साल'), 'signals missed': ('st-signal', 'missed', 'चूके'),
        'marks': ('score', 'marks', 'नंबर'), 'days late': ('clock', 'late', 'देर'),
        'trips': ('wheel', 'trips', 'ट्रिप'), 'crashes': ('crash', 'crashes', 'हादसे'),
        'years on the road': ('wheel', 'years', 'साल'), 'night runs this month': ('today', 'nights', 'रातें'),
        'loads': ('ledger', 'loads', 'लोड'), 'runs': ('wheel', 'runs', 'फेरे'), 'fines': ('stamp', 'fines', 'जुर्माने'),
        'years on stage': ('jd-stage', 'years', 'साल'), 'shows missed': ('jd-missed', 'missed', 'छूटे'),
        'trips': ('wheel', 'trips', 'ट्रिप'), 'times short': ('alert', 'short', 'कमी'), 'towns': ('ticket', 'towns', 'शहर'),
        'slips': ('jd-missed', 'slips', 'चूक'), 'shows': ('jd-stage', 'shows', 'शो'),
        'average': ('bat', 'average', 'औसत'), 'matches': ('cr-match', 'matches', 'मैच'), 'wickets': ('cr-match', 'wickets', 'विकेट'),
        'catches': ('hand', 'catches', 'कैच'), 'season runs': ('score', 'season runs', 'सीज़न रन'), 'wins': ('cr-win', 'wins', 'जीत'),
        'free hours': ('clock', 'hours', 'घंटे'), 'skill': ('tool', 'skill', 'हुनर'), 'evenings at home': ('today', 'evenings home', 'शामें घर पर'),
        'school meetings': ('person', 'school meetings', 'स्कूल मीटिंग'), 'Sundays free': ('week', 'Sundays', 'रविवार'),
        'jobs done': ('hand', 'jobs', 'काम'), 'weddings arranged': ('person', 'weddings', 'शादियाँ'), 'talks led': ('speaker', 'talks', 'बातचीत')}
KIND = [(r'^pick one', 'pick one'), (r'^believe', 'believe'), (r'^rank for (\d+) (seats|trucks|keys)', r'rank, \1 \2'),
        (r'^pick (\d+) of (\d+)', r'pick a team, \1 of \2'), (r'^keep (\d+) of (\d+)', r'keep, \1 of \2'),
        (r'^spend checks, up to (\d+)', r'spend checks, up to \1'), (r'^batting order, first stage', 'the batting order, first stage'),
        (r'^second stage', 'the batting order, second stage'), (r'^split', 'split')]
BUTTON = {'pick one': ('Send {n}', '{n} को भेजें'), 'believe': ('Believe {n}', '{n} की बात मानें'), 'rank': ('Send the list', 'लिस्ट भेजें'),
          'pick a team': ('Lock the team', 'टीम पक्की करें'), 'keep': ('Keep these', 'इन्हें रखें'), 'spend checks': ('Take them up', 'आगे बढ़ाएँ'),
          'the batting order, first stage': ('Lock the order', 'ऑर्डर पक्का करें'), 'the batting order, second stage': ('Make {n} captain', '{n} को कप्तान बनाएँ'),
          'split': ('Lock chores', 'पक्का करें')}
FAMILY_SEX = {'Mohan': 'man', 'Ramesh': 'man', 'Rani': 'woman', 'Vikram': 'man'}
# card 2 of the results names what swapped sides in the twin it shows
NUDGE = {('station', 1): ('the words', 'शब्दों'), ('station', 2): ('the time off', 'छुट्टी'), ('station', 3): ('the section', 'सेक्शन'),
         ('lugdi', 1): ('the family worry', 'घर की फ़िक्र'), ('lugdi', 3): ('the words', 'शब्दों'), ('lugdi', 4): ('the licence', 'लाइसेंस'),
         ('jadugar', 2): ('the money talk', 'पैसों की बात'), ('jadugar', 3): ('who saw it', 'देखने वाले'), ('jadugar', 4): ('the rival troupe', 'दूसरी मंडली'),
         ('cricket', 1): ('the bad day', 'बुरे दिन'), ('cricket', 3): ('the rest', 'आराम'), ('cricket', 4): ('the keeper', 'कीपर'),
         ('rukavat', 1): ('the match', 'मैच'), ('rukavat', 3): ('the dust', 'धूल')}


def sexes():
    """Each town person's side, from people.md's table of the town's people; the family from FAMILY_SEX."""
    out = {k: v for k, v in FAMILY_SEX.items()}
    for row in re.findall(r'^\| \d{4}, [^|]+\| ([^|]+)\| ([^|]+)\|', PEOPLE.read_text(encoding='utf-8'), re.M):
        out.update({n.strip(): 'woman' for n in row[0].split(',')})
        out.update({n.strip(): 'man' for n in row[1].split(',')})
    return out


def face(world, name):
    path = f'{L.A}{L.WORLDS[world].face_prefix}-{re.split(r"[ ,]", name)[0].lower()}.webp'   # "Gurpreet, station master"
    return path if (Path(__file__).parent / path).exists() else f'{L.A}tex-cardstock.webp'   # a family portrait not yet painted


HINDI = ROOT / 'knowledge' / 'story' / 'first-take-hindi.md'
OLD = ROOT / 'knowledge' / 'content' / 'first-take.md'
MISSING = []


def hindi():
    """English to Hindi, from first-take-hindi.md, and the town's people's names from the old cast tables."""
    hi = dict(re.findall(r'^\| ([^|]+?) \| ([^|]+?) \|$', HINDI.read_text(encoding='utf-8'), re.M))
    hi.update(re.findall(r'^\| (\w+) \| ([^|]+?) \| (?:woman|man) \|', OLD.read_text(encoding='utf-8'), re.M))
    return hi


def card(c):
    """A chapter's words for its title card (library.chapter_card): its number, area, year and setting."""
    return {'n': c['n'], 'area': c['area_name'], 'year': c['year'], 'line': c['line']}


def parse():
    text = SCRIPT.read_text(encoding='utf-8')
    sex = sexes()
    HI = hindi()
    def h(en):   # a string with no Hindi yet shows in English, and the build says so
        if en not in HI:
            MISSING.append(en)
        return HI.get(en, en)
    chapters = []
    for n, block in enumerate(re.split(r'\n(?=## Chapter \d)', text)[1:], 1):
        head = re.match(r'## Chapter \d\. (\d{4}), [^:]+: "([^"]+)" \(([^)]+)\)', block)
        world, area = ERA[head.group(1)], head.group(3)
        sp = re.search(r'\*\*Speaker:\*\* ([^.]+)\.', block).group(1)
        line = re.search(r'with the line "([^"]+)" / "([^"]+)"', block)
        c = {'n': n, 'world': world, 'area': area, 'area_name': (area.capitalize(), h(area.capitalize())), 'year': head.group(1),
             'title': (head.group(2), h(head.group(2))),
             'speaker': (sp, h(sp)), 'face': face(world, sp), 'line': (line.group(1), line.group(2)), 'decisions': [],
             'sex': {}, 'twins': []}
        for a, b, kind, w in re.findall(r'^\| (\d) and (\d) \| [^|]+\| (plain|hard|matters)[^|]*\| (\d)', block, re.M):
            c['twins'].append({'a': int(a), 'b': int(b), 'kind': kind, 'on_woman': int(w)})
        for m in re.finditer(r'^(\d)\. \*\*([^*]+)\.\*\* ([^\n]+)\n(.*?)(?=^\d\. \*\*|^\*\*The pair rules|\Z)', block, re.M | re.S):
            num, title, kindline, body = int(m.group(1)), m.group(2), m.group(3), m.group(4)
            raw = kindline.split(';')[0].strip().lower()
            kind = next(re.sub(p, r, raw) for p, r in KIND if re.match(p, raw))
            q = re.search(r'\*\*Question:\*\* (.+?) \| \*\*Scene:\*\* "(.+?)"', body)
            keyline = re.search(r'\*\*Key:\*\* ([^.\n]+)', body)
            keys = [KEYS[k.strip()] for k in keyline.group(1).split(',')] if keyline else None
            chores = re.search(r'\*\*Chores:\*\* ([^.\n]+)', body)
            people = []
            for cm in re.finditer(r'^\s+- (\w+)(?: \((\d+), (\d+)\))?:? (.+?) \[(N|=|d|F)', body, re.M):
                name, v1, v2, rest = cm.group(1), cm.group(2), cm.group(3), cm.group(4)
                quotes = re.findall(r'"([^"]+)"', rest)
                # Believe cards carry the person's account, then the note; the pair's other half tells the same story
                account = people[0]['account'] if 'the same account' in rest else (quotes[0] if len(quotes) > 1 else '')
                note = quotes[-1] if quotes else rest.strip(' /')
                text = f'“{account}” {note}' if account else note
                text_hi = f'“{h(account)}” {h(note)}' if account else h(note)
                people.append({'en': name, 'hi': h(name), 'vals': [v1, v2] if v1 else None, 'line': (text, text_hi), 'account': account,
                               'face': face(world, name), 'mark': cm.group(5)})
            if keys is None and people[0]['vals']:   # the script names the key once a twin: the other half's
                keys = next(x['keys'] for x in c['decisions'] if x['n'] == num - 4)
            elif keys is None:   # the captain: the same four, numbers from the order before it
                prev = c['decisions'][-1]
                keys = prev['keys']
                for p in people:
                    p['vals'] = next(x['vals'] for x in prev['people'] if x['en'] == p['en'])
            pair = re.search(r'\*\*Pair:\*\* (\w+) and (\w+)', body)
            for p in people:
                c['sex'][p['en']] = sex.get(p['en'], 'woman')
            btn = next(v for k, v in BUTTON.items() if kind.startswith(k))
            c['decisions'].append({'n': num, 'title': title, 'kind': kind, 'q': (q.group(1), h(q.group(1))),
                                   'voice': (sp, q.group(2), h(q.group(2))), 'keys': keys, 'people': people,
                                   'chores': [(e, h(e)) for e in ('TV' if x.strip() == 'the TV' else x.strip().capitalize() for x in chores.group(1).split(','))] if chores else None,
                                   'pair': [pair.group(1), pair.group(2)], 'button': btn, 'notes': True})
        chapters.append(c)
    return chapters


def length_faults(chapters):
    """Where a note's length could point at the hidden pair (owner, 23 Oct 2026: "For quotes, we are falling in the trap that
    the longest quotes are the right one"; before, the longest note sat on the pair in 34 of 40 decisions). Each card's
    whole line (a Believe card's account and note) is measured: within a decision the words differ by at most 2, the
    pair's two lines match in words, and the longest line by letters falls on the pair in at most half the decisions."""
    faults, on_pair, n = [], 0, 0
    for c in chapters:
        for d in c['decisions']:
            text = {p['en']: re.sub(r'[“”"]', '', p['line'][0]) for p in d['people']}
            words = {k: len(v.split()) for k, v in text.items()}
            pair = [p['en'] for p in d['people'] if p['mark'] in 'N=']
            where = f"{c['world']} {d['n']}"
            if max(words.values()) - min(words.values()) > 2:
                faults.append(f'{where}: notes run {min(words.values())} to {max(words.values())} words')
            if len(pair) == 2 and words[pair[0]] != words[pair[1]]:
                faults.append(f'{where}: the pair runs {words[pair[0]]} and {words[pair[1]]} words')
            longest = max(len(v) for v in text.values())
            on_pair += any(len(text[k]) == longest for k in pair); n += 1
    if on_pair > n / 2:
        faults.append(f'the longest line is on the pair in {on_pair} of {n} decisions')
    return faults


def panels():
    """The script's panels: {id: (era, caption en, caption hi)}."""
    out = {}
    for line in SCRIPT.read_text(encoding='utf-8').splitlines():
        cells = [x.strip() for x in line.strip().strip('|').split('|')] if line.startswith('| ') else []
        if cells and re.fullmatch(r'\d+\.\d+', cells[0]):
            pid, style, cap = (cells[0], '2026', cells[2]) if len(cells) == 3 else (cells[0], cells[1], cells[3])
            en, _, hi = cap.partition(' / ')
            out[pid] = (style.split()[-1], en.strip(), hi.strip())
    return out
