"""Builds design-system/index.html (the component library for owner review) and preview.html (the same page in a
standards-mode shell for local captures). Styles: library.css. Behaviour and Hindi: library.js.

Worlds: Lugdi and Station are registered below; each worlds/<id>.py module adds one more
(knowledge/architecture/world-modules.md). Switches: LIB_WORLDS=lugdi,jadugar draws only those worlds;
LIB_OUT=preview-jadugar writes preview-jadugar.html only, in the preview shell."""
from pathlib import Path
from html import escape
import importlib.util
import json
import os
import sys

A = 'assets/'

IC = {}   # world motifs with no shape in icons.py (the check-pool marks); worlds add them

_ispec = importlib.util.spec_from_file_location('icons', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'icons.py'))
_icons = importlib.util.module_from_spec(_ispec)
_ispec.loader.exec_module(_icons)
ICONS = _icons.ICONS   # the filled set (icons.py); IC keeps only the world motifs it has no shape for


def ic(name, label=None, fill=False):
    a = f' role="img" aria-label="{label}"' if label else ' aria-hidden="true"'
    if name in ICONS:
        return f'<svg viewBox="0 0 256 256" fill="currentColor"{a}>{ICONS[name]}</svg>'
    f = 'currentColor' if fill else 'none'
    return f'<svg viewBox="0 0 24 24" fill="{f}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"{a}>{IC[name]}</svg>'

# Hinglish keeps its Hindi words in Latin letters; English only says them in English (owner, 22 Oct 2026: "Udti Khaat",
# "Purana Maidan" etc make sense in hinglish but not in english). Names stay as they are in every mode: people, towns, the
# Chandni Mandal troupe, and the players' road names on the Board. Longer phrases come first, so a shorter one cannot split them.
ENG = [('Sandook Ka Raaz', "The Box's Secret"), ('Udti Khaat', 'Flying Cot'), ('Purana Maidan', 'The Old Ground'),
       ('Ghat Ka Sauda', 'A Deal on the Ghat'), ('Adalat Ki Raat', 'Night in Court'), ('Dadi Ki Kursi', "Dadi's Chair"),
       ('Faisla', 'The Verdict'), ('Dekhiye, dekhiye!', 'Roll up, roll up!'), ('the jadugar', 'the magician'), (' chacha', ' uncle')]

def eng(en):
    for a, b in ENG:
        en = en.replace(a, b)
    return en

def tx(tag, en, hi, cls='', attrs=''):
    c = f' class="{cls}"' if cls else ''
    h = f' data-hi="{escape(hi)}"' if hi else ''
    g = f' data-eng="{escape(eng(en))}"' if eng(en) != en else ''
    return f'<{tag}{c}{h}{g}{attrs}>{en}</{tag}>'

def al(en, hi):
    g = f' data-eng-label="{escape(eng(en))}"' if eng(en) != en else ''
    return f' aria-label="{escape(en)}" data-hi-label="{escape(hi)}"{g}'

_n = [0]
def uid(p='x'):
    _n[0] += 1
    return f'{p}{_n[0]}'

# The shared code is written in eight roles (kamla, salim, raju, pammi, arjun, anita, meena, vikram). Since 22 Oct 2026
# each world fills them with its own people, named from across India and across faiths (owner: "go pan india and be more
# secular"; the table is tools/rename_cast.py). R() gives the person in a role, nm() their names, named() rewrites any text
# written with the role names, and faces are assets/<prefix>-<person>.webp (art/portraits.py).
NM = {'kamla': ('Kamla', 'कमला'), 'salim': ('Salim', 'सलीम'), 'raju': ('Raju', 'राजू'), 'pammi': ('Pammi', 'पम्मी'),
      'arjun': ('Arjun', 'अर्जुन'), 'anita': ('Anita', 'अनीता'), 'meena': ('Meena', 'मीना'), 'vikram': ('Vikram', 'विक्रम')}
_spec = importlib.util.spec_from_file_location('rename_cast', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tools', 'rename_cast.py'))
_rc = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_rc)
ROLE = {w.lower(): {slot.lower(): en.lower() for slot, (en, hi, _) in m.items()} for w, m in _rc.NAMES.items()}
NM.update({en.lower(): (en, hi) for m in _rc.NAMES.values() for en, hi, _ in m.values()})
# how a loaded line's speaker is addressed: chacha by default, uncle where the name is Christian or Tamil, Dadi as herself
HONORIFIC = [('Francis chacha', 'Francis uncle'), ('फ़्रांसिस चाचा', 'फ़्रांसिस अंकल'), ('Anthony chacha', 'Anthony uncle'),
             ('एंथनी चाचा', 'एंथनी अंकल'), ('Mani chacha', 'Mani uncle'), ('मणि चाचा', 'मणि अंकल'), ('Dadi aunty', 'Dadi'), ('दादी आंटी', 'दादी')]


def R(world, who):
    return ROLE.get(world, {}).get(who, who)


def nm(world, who):
    return NM[R(world, who)]


def named(world, text):
    if not text or world not in ROLE:
        return text
    text = _rc.rename(text, world.capitalize())
    for a, b in HONORIFIC:
        text = text.replace(a, b)
    return text
# one-word key labels (R-STAT-1) and their spoken long forms
KEY = {'wheel': ('years', 'साल', 'years driving', 'ड्राइविंग के साल'), 'crash': ('crashes', 'हादसे', 'crashes', 'हादसे'),
       'clock': ('hours', 'घंटे', 'free hours', 'ख़ाली घंटे'), 'tool': ('skill', 'हुनर', 'skill', 'हुनर'),
       'ledger': ('years', 'साल', 'years keeping accounts', 'हिसाब के साल'), 'pause': ('break', 'ब्रेक', 'years on a break', 'ब्रेक के साल'),
       'bat': ('average', 'औसत', 'batting average', 'बैटिंग औसत')}
DAYS = [('M', 'सो'), ('T', 'मं'), ('W', 'बु'), ('T', 'गु'), ('F', 'शु'), ('S', 'श'), ('S', 'र')]

def face(world, who):
    return WORLDS[world].face(who)

def statkey(keys):
    items = ''.join(f'<span>{ic(k)}{tx("span", KEY[k][0], KEY[k][1])}</span>' for k in keys)
    return f'<div class="statkey" aria-hidden="true">{items}</div>'

def stats(pairs):
    cls = {1: 'stats c1', 2: 'stats c2'}.get(len(pairs), 'stats')
    return f'<span class="{cls}" aria-hidden="true">' + ''.join(f'<span class="stat">{ic(k)}{v}</span>' for k, v in pairs) + '</span>'

def spoken(who, pairs, extra_en='', extra_hi=''):
    en = NM[who][0] + ', ' + ', '.join(f'{v} {KEY[k][2]}' for k, v in pairs) + extra_en
    hi = NM[who][1] + ', ' + ', '.join(f'{v} {KEY[k][3]}' for k, v in pairs) + extra_hi
    return en, hi

def tile(world, who, pairs, q=None, state='', role='radio', serial=None):
    en, hi = nm(world, who)
    q = (named(world, q[0]), named(world, q[1])) if q else q
    on = 'true' if ('is-selected' in state or 'is-armed' in state) else 'false'
    qid = uid('q')
    quote = tx('span', f'“{q[0]}”', f'“{q[1]}”', 'quote', f' id="{qid}"') if q else ''
    desc = f' aria-describedby="{qid}"' if q else ''
    ser = f'<span class="serial" aria-hidden="true">{tx("span", "No.", "क्र.")} {serial}</span>' if serial else ''
    return (f'<button class="tile {state}" type="button" role="{role}" aria-checked="{on}"{al(*[named(world, x) for x in spoken(who, pairs)])}{desc} data-en="{en}" data-hi-name="{hi}">'
            f'<span class="tick" aria-hidden="true">{ic("tick")}</span><span class="armmark" aria-hidden="true">{ic("arrow")}</span><span class="lockmark" aria-hidden="true">{ic("lock")}</span>'
            f'<span class="face" style="background-image:url({face(world, who)})" aria-hidden="true"></span>'
            f'<span class="nmrow" aria-hidden="true"><span class="nm" data-hi="{hi}">{en}</span>{ser}</span>{stats(pairs)}{quote}</button>')

def row(world, who, side, state='', role='checkbox', holes=0, serial=None, label=None):
    en, hi = nm(world, who)
    on = 'true' if 'is-selected' in state or 'is-armed' in state else 'false'
    ser = f'<span class="serial" aria-hidden="true">{tx("span", "No.", "क्र.")} {serial}</span>' if serial else ''
    role_attr = f' role="{role}" aria-checked="{on}"' if role else ''
    lab = [named(world, x) for x in (label or (en, hi))]
    cls = f'row holes-{holes}' if holes else 'row'
    return (f'<button class="{cls} {state}" type="button"{role_attr}{al(*lab)} data-en="{en}" data-hi-name="{hi}">'
            f'<span class="tick" aria-hidden="true">{ic("tick")}</span><span class="armmark" aria-hidden="true">{ic("arrow")}</span><span class="face" style="background-image:url({face(world, who)})" aria-hidden="true"></span>'
            f'<span class="who" aria-hidden="true"><span class="nm" data-hi="{hi}">{en}</span>{ser}</span><span class="side" aria-hidden="true">{side}</span></button>')

def flaps(s):
    return '<span class="flaps" aria-hidden="true">' + ''.join(f'<i>{c}</i>' for c in s) + '</span>'

# Names and the lines a named character says are not counted against the word budget (R-NUM-20): they carry
# data-count="0", the mark tools/frames.cjs skips.
NOCOUNT = ' data-count="0"'

def byline(world, who, en, hi):
    return f'<div class="byline"><i style="background-image:url({face(world, who)})" aria-hidden="true"></i>{tx("span", named(world, en), named(world, hi), "", NOCOUNT)}</div>'

def voice(world, who, en_name, hi_name, line_en, line_hi):
    return (f'<div class="voice"><span class="av" style="background-image:url({face(world, who)})" aria-hidden="true"></span>'
            f'<div class="balloon"{NOCOUNT}>{tx("b", named(world, en_name), named(world, hi_name))}{tx("p", f"“{named(world, line_en)}”", f"“{named(world, line_hi)}”")}</div></div>')

def main(wait_en, wait_hi, live_en=None, live_hi=None, state='is-wait', extra='', icon='', n=None):
    dis = ' aria-disabled="true"' if state == 'is-wait' else ''
    data = f' data-wait-en="{wait_en}" data-wait-hi="{wait_hi}"'
    if live_en:
        data += f' data-live-en="{live_en}" data-live-hi="{live_hi}"'
    lab_en = wait_en if state == 'is-wait' or not live_en else live_en
    lab_hi = wait_hi if state == 'is-wait' or not live_en else live_hi
    if n:
        lab_en, lab_hi = lab_en.replace('{n}', n[0]), lab_hi.replace('{n}', n[1])
    return f'<button class="main {state} {extra}" type="button"{dis}{data}>{icon}{tx("span", lab_en, lab_hi)}</button>'

def out_btn(en, hi, icon='', extra=''):
    return f'<button class="main is-out {extra}" type="button">{icon}{tx("span", en, hi)}</button>'

def dock(*btns):
    return '<div class="dock">' + ''.join(btns) + '</div>'

# the languages, each named in its own script with a line in English under it (owner, 22 Oct 2026: the switch "should be
# menu so that we can scale it to other indian languages"). A new language is one more row here and its strings.
LANGS = [('mix', 'Hinglish', 'English with Hindi signs'), ('hi', 'हिन्दी', 'Hindi'), ('en', 'English', 'English only')]


def lang_list(extra=()):
    """The languages as chips in the "?" sheet (owner, 23 Oct 2026: "put language in the ? menu", then the quiet sheet, C):
    each named in its own script, the current one filled in ink; the chips wrap onto more lines as languages are added
    ("Languages will scale to other languages"). Pressed buttons, not radios: a step reads a checked radio on its screen
    as the pick. extra, (code, name) pairs, draws more languages for the library only."""
    hi = ' lang="hi"'
    chips = ''.join(f'<button type="button" aria-pressed="{str(k == "mix").lower()}" data-set-lang="{k}"{hi if k == "hi" else ""}>{n}</button>' for k, n, _ in LANGS)
    chips += ''.join(f'<button type="button" aria-pressed="false" lang="{k}">{n}</button>' for k, n in extra)
    return f'<div class="langrow">{ic("language")}<div class="langchips" role="group"{al("Language", "भाषा")}>{chips}</div></div>'

def daycount(n=6):
    return f'<span class="daycount" role="img"{al(f"Streak {n} days", f"स्ट्रीक {n} दिन")}><span aria-hidden="true">{tx("span", f"Day {n}", f"दिन {n}")}</span></span>'

PLACES = set()  # plate texts that are place names, gathered from every registered world's places
def dayplate(en, hi):
    dc = ' data-count="0"' if en in PLACES else ''
    return tx('span', f'<span>{en}</span>', f'<span>{hi}</span>', 'dayplate', dc)

HELP = f'<button class="ibtn" type="button" data-help{al("How to play", "कैसे खेलें")}>{ic("help")}</button>'
BACK = f'<button class="ibtn" type="button" data-back{al("Back", "वापस")}>{ic("back")}</button>'

def topbar(kind, plate=None, first=False):
    if kind == 'cover':
        return f'<div class="topbar"><div class="group">{"" if first else daycount()}</div><div class="group">{HELP}</div></div>'
    mid = dayplate(*plate) if plate else '<span class="spacer"></span>'
    if kind == 'root':
        return f'<div class="topbar"><span class="spacer"></span>{mid}{HELP}</div>'
    return f'<div class="topbar">{BACK}{mid}{HELP}</div>'

def tabbar(active='today'):
    t = [('today', 'Today', 'आज'), ('board', 'Board', 'बोर्ड'), ('week', 'Week', 'हफ़्ता')]
    out = f'<nav class="tabbar"{al("Main", "मुख्य")}>'
    for k, en, hi in t:
        cur = ' aria-current="page"' if k == active else ''
        out += f'<button class="tab" type="button"{cur}>{ic(k, fill=True)}{tx("span", en, hi)}</button>'
    return out + '</nav>'

def phone(world, inner, label, cls='', art=None, artcls='', lang=None):
    a = f'<div class="art {artcls}" style="background-image:url({art})" aria-hidden="true"></div>' if art else ''
    l = ' data-lang="hi"' if lang == 'hi' else ''
    return f'<div class="phone world {WORLDS[world].cls} {cls}" role="group" aria-label="{label}"{l}><span class="notch" aria-hidden="true"></span>{a}<div class="scr">{inner}</div></div>'

def body(*parts, cls=''):
    return f'<div class="scr-body {cls}">' + ''.join(parts) + '</div>'

def h1q(en, hi, idv=None):
    i = f' id="{idv}"' if idv else ''
    return f'<div class="qbox">{tx("h1", en, hi, "q", i)}</div>'

def more_cue(bottom):
    return f'<span class="morecue" style="bottom:{bottom}px" aria-hidden="true">{ic("down")}</span>'

# ---------- worlds: one registry, one interface ----------
# Everything that differs between worlds comes through a World. The defaults draw plain newsprint objects (most
# of them exactly what Lugdi draws) and the shared sample puzzle; a world overrides the data and hooks it dresses itself.
# Lugdi and Station are registered after the screens; worlds/<id>.py modules are appended after them.
MOMENTS = ('twin', 'rule', 'jobs', 'checks', 'team', 'sort', 'words', 'crowd', 'look', 'board',
           'cover', 'cover_hard', 'result', 'sunday', 'change', 'month')
JOB_STATES = [('is-filled', 'kamla'), ('is-target', None), ('', None)]

# ---------- the day's story (O15): each world tells its own; these defaults are Lugdi's ghat road ----------
# The twin step. q: the question. speaker: (who, en, hi), the named voice of the lines on the cards, never on a card.
# keys: the stat key, one icon per number. people: 3 to 5 of NM, each (who, [(key, value)], (line en, hi)). pair: the
# hidden pair's two indices; their numbers match exactly and their lines differ by one loaded word. words: those two
# words (en) as the pair says them. swapped: the pair's lines with the words swapped, for the day the record returns.
TWIN = [('kamla', [('wheel', '14'), ('crash', '0')], ('Drives the ghats with attitude.', 'घाट पर तेवर से चलाती है।')),
        ('salim', [('wheel', '22'), ('crash', '2')], ('Knows every bend, but tired.', 'हर मोड़ जानते हैं, पर थके हैं।')),
        ('raju', [('wheel', '14'), ('crash', '0')], ('Drives the ghats with confidence.', 'घाट पर आत्मविश्वास से चलाता है।')),
        ('pammi', [('wheel', '6'), ('crash', '0')], ('Careful, a little slow.', 'संभलकर, थोड़ा धीरे।'))]
TWIN_DAY = {'q': ('Who do you send tonight?', 'आज रात किसे भेजें?'), 'speaker': ('vikram', 'Vikram seth', 'विक्रम सेठ'),
            'keys': ['wheel', 'crash'], 'people': TWIN, 'pair': (0, 2), 'words': ('with attitude', 'with confidence'),
            'swapped': (('Drives the ghats with confidence.', 'घाट पर आत्मविश्वास से चलाती है।'), ('Drives the ghats with attitude.', 'घाट पर तेवर से चलाता है।'))}
# The Board's road names, all invented: four friends (you are the third), the top three on Everyone, and the five round
# you there (you in the middle). A friend who also sits near you keeps the same practice, so near[0] is friends[1] and
# near[3] is friends[3]. The ranks and practice figures are shared (BOARD_FIGS).
ROADS = {'friends': ('Lonavala Ki Barish', 'Kasara Ka Kohra', 'Ghat Ka Jugnu', 'Pune Ka Pahiya'),
         'top': ('Toofan Express', 'Sadak Ki Chai', 'Highway Ka Dhaba'),
         'near': ('Kasara Ka Kohra', 'Malshej Ki Dhund', 'Ghat Ka Jugnu', 'Pune Ka Pahiya', 'Igatpuri Ka Pul')}
BOARD_FIGS = {'friends': (('1', '96'), ('2', '44'), ('3', '41'), ('4', '38')), 'top': (('1', '412'), ('2', '398'), ('3', '391')),
              'near': (('1,958', '44'), ('1,959', '43'), ('1,960', '41'), ('1,961', '38'), ('1,962', '37'))}

class World:
    id = ''               # lower case; matches worlds/<id>.py and the CSS class w-<id>
    name = ('', '')       # (English, Hindi)
    voice = ('', '')      # one line on what the world is, (English, Hindi)
    palette = []          # [(token, hex, use)] for the swatches; the first entry is the ground
    contrast = []         # [(pair, foreground hex, background hex, needed ratio, what)] for the contrast table
    fonts = []            # Google Fonts families for the display face, e.g. 'Sarpanch:wght@900'
    display_face = None   # that family's name; it sets the cover title only
    type_row = None       # (css class, English, Hindi, note) for this world's display row in the type table
    shapes = {}           # 'radii', 'spent', 'depth': this world's cells in the shapes table
    card_word = ''        # what the person cards are, e.g. 'newsprint panels'
    scenes = {}           # scene key -> asset base: assets/<base>.webp, with optional <base>-l.webp and <base>-w.webp
    moments = {}          # screen moment (MOMENTS) -> scene key; 'default' covers any moment left out
    art_cls = 'veil'      # class on the painting behind puzzle steps; 'veil' darkens it
    face_prefix = ''      # portraits are assets/<face_prefix>-<who>.webp
    plates = {}           # day plate (English, Hindi) per moment; 'default' is required
    places = ()           # plate texts that are names (a place, a series, a troupe): not counted as words (R-NUM-20)
    week = []             # six scene keys, Monday to Saturday, for Sunday's day objects
    next_line = ('Next issue tomorrow', 'अगला अंक कल')   # the line for tomorrow on the cover and the result
    # the day's story (O15); the defaults are Lugdi's ghat road
    twin = TWIN_DAY       # the twin step: question, speaker, stat key, people, hidden pair (see TWIN_DAY)
    stat_keys = {}        # stat keys the world adds: key -> (icon, (label en, hi), (spoken en, hi)); the icon is None when icons.py draws it
    cover_line = ('One night run up the ghat.', 'घाट पर रात का एक सफ़र।')   # the cover's line on an ordinary day
    hard_line = ('Today, in a family court.', 'आज, एक पारिवारिक अदालत में।')   # a hard day's line; names the setting (R-COVER-6)
    roads = ROADS         # the Board's road names (see ROADS); friends[2] is you
    share_label = None    # (en, hi): the puzzle-number line on the share card; None means the default plate with "No. 214"
    check_glyph = 'stamp'  # ic() name of one check in the pool
    sort = (('Print this in the paper?', 'क्या यह अख़बार में छपे?'), ('Arjun cries at every film. Is he even a man?', 'अर्जुन हर फ़िल्म पर रो देता है। ये भी कोई मर्द है?'), ('Print', 'छापें'))
    words = [('soft', 'नरम'), ('proud', 'घमंडी'), ('young', 'छोटा'), ('None of these', 'इनमें से कोई नहीं')]
    signature = ''        # the signature move as the end of a sentence, for the motion section
    notes = {}            # captions in the library sections, by the note keys in SHOWS
    shows = {}            # kind -> [(screen, kwargs, title, note key)], replacing SHOWS[kind] for this world
    module = None         # set for a world loaded from worlds/<id>.py

    @property
    def title(self):
        return self.name[0]

    @property
    def cls(self):
        return f'w-{self.id}'

    @property
    def ground(self):
        return self.palette[0][1]

    def scene(self, key):
        return f'{A}{self.scenes[key]}.webp'

    def moment(self, m):
        return self.moments.get(m) or self.moments['default']

    def art(self, m):
        return self.scene(self.moment(m)), self.art_cls

    def plate(self, m):
        return self.plates.get(m, self.plates['default'])

    def face(self, who):
        return f'{A}{self.face_prefix}-{R(self.id, who)}.webp'

    def note(self, key):
        return self.notes.get(key, '')

    def show(self, kind):
        return [(SCREENS[s](self.id, **kw), t.format(w=self.title), self.note(k)) for s, kw, t, k in self.shows.get(kind, SHOWS[kind])]

    def twin_pair(self):
        """The hidden pair, each as (who, numbers, line)."""
        return [self.twin['people'][i] for i in self.twin['pair']]

    @property
    def road_you(self):
        return self.roads['friends'][2]

    # ----- markup hooks: each returns HTML, or a pair of HTML strings where noted -----
    def serial(self, i):
        return None

    def cover_top(self, hard, line, level, nxt, kept):
        return (kept + '<div class="coverstack">' + tx('h1', self.name[0], self.name[1], 'q') + '<div class="plate hug">'
                + ('' if nxt or not line else tx('p', line[0], line[1], 'coverline')) + tx('span', level[0], level[1], 'level') + nxt + '</div></div>')

    # the First take's chapter title card (chapter_card): this world's own chapter as the specimen, {n, area, year, line}
    chapter = None
    chapter_marks = 'chapmarks'   # the class on the five marks
    take_plate = None   # the plate on the First take chapter's decisions, naming its place; None keeps the day's plates

    def chapter_top(self, b):
        """The card's body from chapter_bits: the marks and the place, the area as the h1, the setting, the year."""
        return ('<div class="coverstack"><div class="plate hug chapplate">' + b['marks'] + tx('span', *b['of'], 'level')
                + tx('h1', *b['area'], 'chap-h') + tx('p', *b['line'], 'coverline') + tx('span', *b['when'], 'level') + '</div></div>')

    def app_meta(self, kind, line=None, level=None):
        if kind == 'step':
            return ''
        return ('<div class="coverstack">' + tx('h1', self.name[0], self.name[1], 'q') + '<div class="plate hug">'
                + tx('p', line[0], line[1], 'coverline') + tx('span', level[0], level[1], 'level') + '</div></div>')

    def jobs_obj(self, states):
        return ('<div class="paperpage"><div class="slots">' + ''.join(slot(j[0], st, who, self.id, job_hi=j[1]) for j, (st, who) in zip(JOBS, states)) + '</div></div>')

    def checks(self, p_eq, p_other):
        g = self.check_glyph
        marks = '<span class="stamps">' + ('<span class="stampmark">' + ic(g) + '</span>') * 2 + '</span>'
        none = '<span class="stamps"></span>'
        rws = (row(self.id, 'anita', stats(p_eq) + marks, role=None, label=spoken('anita', p_eq, ', checked twice', ', दो बार जाँचा'))
               + row(self.id, 'raju', stats(p_eq) + none, role=None, label=spoken('raju', p_eq))
               + row(self.id, 'pammi', stats(p_other) + none, role=None, label=spoken('pammi', p_other)))
        pool = f'<div class="pool" role="img"{al("1 check left", "1 जाँच बाकी")}>{ic(g, fill=True)}<span class="spent">{ic(g)}</span><span class="spent">{ic(g)}</span></div>'
        return rws, pool

    def team_side(self, v):
        return stats([('bat', v)])

    def letter_obj(self):
        return (f'<div class="paperpage"><div class="pphead" aria-hidden="true">{tx("span", "Letters", "चिट्ठियाँ")}<span>No. 214</span></div>'
                f'<p class="letter"{NOCOUNT}>{tx("span", "“My son wants to teach nursery. My mother says he is too", "“मेरा बेटा नर्सरी में पढ़ाना चाहता है। माँ कहती हैं, इसके लिए वह बहुत")} '
                f'<span class="blank" role="img"{al("blank", "ख़ाली जगह")}>&nbsp;</span> {tx("span", "for it.”", "है।”")}</p>' + byline(self.id, 'arjun', 'Arjun, Pune', 'अर्जुन, पुणे') + '</div>')

    def crowd_obj(self, qid):
        opts = ''.join(f'<button class="chip" type="button" role="radio" aria-checked="false">{v}%<span class="ctick" aria-hidden="true">{ic("tick")}</span></button>' for v in range(10, 101, 10))
        return (f'<div class="paperpage poll"><div class="pphead" aria-hidden="true">{tx("span", "Readers&#39; poll", "पाठकों का सर्वे")}<span>No. 214</span></div>'
                f'<div class="chips is-grid5" role="radiogroup" aria-labelledby="{qid}">{opts}</div></div>')

    def result_parts(self, score, figs_, week, line, end=' at-end'):
        top = f'<div class="plate hug">{tx("span", "Score", "स्कोर", "level")}<h1 class="score"><span class="vh">Score </span>{score}</h1></div>'
        return top, f'<div class="slip on-paper{end}">{figs_}{week}{tx("p", line[0], line[1], "letter")}</div>'

    def dayobj(self, state, key, letter, stamp):
        style = f' style="background-image:url({self.scene(key)})"' if key else ''
        return f'<span class="dayobj {state}"{style}>{stamp}{letter}</span>'

    def week_obj(self, view, days):
        if view == 'day1':
            return f'<div class="paperpage on-paper lockpage">{days}</div>'
        figs_ = figs2() if view == 'sunday' else figsx('88', '41', '12') if view == 'report' else ''
        return f'<div class="paperpage on-paper">{days}<div style="height:12px"></div>{figs_}</div>'

    def month_obj(self, lean):
        return f'<div class="paperpage on-paper"><div class="pphead">{tx("span", "October", "अक्टूबर")}<span>No. 218</span></div>{lean}</div>'

    def rank(self, r):
        return f'<span class="rk">{r}</span>'

    def board_list(self, rows):
        return f'<div class="paperpage on-paper"><ol class="list">{rows}</ol></div>'

    def board_panels(self, friends, everyone):
        fr = f'<div class="paperpage on-paper bestsellers"><div class="pphead">{tx("span", "Friends", "दोस्त")}<span>No. 214</span></div><ol class="list">{friends}</ol></div>'
        ev = f'<div class="paperpage on-paper bestsellers board-everyone"><div class="pphead">{tx("span", "Everyone", "सब")}<span>{tx("span", "Top 9%", "टॉप 9%")}</span></div><ol class="list">{everyone}</ol></div>'
        return fr, ev

    def share_card(self):
        p = self.plate('default')
        p = self.share_label or (p[0] + ' · No. 214', p[1] + ' · अंक 214')
        return (f'<div class="sharecard world {self.cls}"><div class="art" style="background-image:url({self.scene(self.moment("cover"))})"></div><div class="sc-in">'
                f'{tx("span", p[0], p[1], "level")}<span class="sc-line">{self.road_you}</span>'
                f'<span class="sc-marks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span class="sc-line">Day 6</span></div></div>')

    def sheet_dress(self, layer):
        return ''

    def objects(self):
        return []

    def choices(self):
        return []

    def signature_demo(self):
        return ''

# ---------- the twin day: the shared skeleton, told in the world's own story (World.twin) ----------
def step_twin(world, sel=None, cls='', lang=None, committing=False):
    W = WORLDS[world]
    T = W.twin
    qid = uid('h')
    tl = ''
    for i, (w, p, q) in enumerate(T['people']):
        st = ('is-selected' if w == sel else '') + (' is-committing' if committing else '')
        tl += tile(world, w, p, q, st, serial=W.serial(i))
    btn = main('Pick one', 'किसी एक को चुनें', 'Send {n}', '{n} को भेजें', 'is-live' if sel else 'is-wait', 'is-committing' if committing else '', n=nm(world, sel) if sel else None)
    grid_cls = 'tiles is-committing' if committing else 'tiles'
    small = 'is-small' in cls or 'is-200' in cls
    inner = (topbar('step', W.plate('twin')) + body(h1q(*T['q'], qid), byline(world, *T['speaker']), statkey(T['keys']),
                                                f'<div class="{grid_cls}" data-n="{len(T["people"])}" role="radiogroup" aria-labelledby="{qid}">{tl}</div>', cls='has-more' if small else '')
             + (more_cue(104) if small else '') + dock(btn))
    art, ac = W.art('twin')
    return phone(world, inner, f'{W.title} twin step', 'js-pick ' + cls, art, ac, lang)

# ---------- covers ----------
def cover(world, state='play', lang=None, cls='', first=False, hard=False, loading=False, kept=False, dialog=False):
    labels = {'play': ('Play', 'खेलें'), 'continue': ('Continue', 'जारी रखें'), 'done': ('See your score', 'स्कोर देखें')}
    en, hi = labels[state]
    W = WORLDS[world]
    nxt = tx('span', W.next_line[0], W.next_line[1], 'level') if state == 'done' else ''
    kept_line = tx('p', 'Tuesday off. Streak kept.', 'मंगलवार छुट्टी। स्ट्रीक बनी रही।', 'nextline', ' role="status"') if kept else ''
    line, lvl = ((W.hard_line, ('Level 4 of 6', 'लेवल 4/6')) if hard else (W.cover_line, ('Level 3 of 6', 'लेवल 3/6')))
    # a forgiven day's line stands in the cover line's place until Play (R-STREAK-4, R-NUM-20)
    top = W.cover_top(hard, None if kept else line, lvl, nxt, kept_line)
    overlay = ''
    if dialog:
        overlay = (f'<div class="scrim" aria-hidden="true"></div><div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dl{world}">{tx("h2", "Delete all your answers and notes?", "अपने सारे जवाब और नोट मिटाएँ?", "", f" id=dl{world}")}'
                   f'<div class="acts"><button type="button" class="textbtn on-paper">{tx("span", "Keep", "रखें")}</button><button type="button" class="textbtn on-paper is-danger">{ic("alert")}{tx("span", "Delete all", "सब मिटाएँ")}</button></div></div>')
    inner = topbar('cover', first=first) + body(top, cls='is-cover') + dock(out_btn(en, hi)) + tabbar('today')
    a = None if loading else W.scene(W.moment('cover_hard' if hard else 'cover'))
    ph = phone(world, inner, f'{W.title} cover', cls + (' is-loading' if loading else ''), a, 'veil-low', lang)
    return ph[:-6] + overlay + ph[-6:] if dialog else ph

# ---------- the first visit: the birth date (SC-15) and not yet 18 (SC-16), 24 Oct 2026 ----------
# The one screen before anything else (F-14a): the languages (this screen has no "?"), three number fields on the
# number pad, the date in words under them, and one line, where the date stays or what is wrong with it. Under 18,
# the same card says when the game opens, worked out on the phone, with "Wrong date?" once (F-14b). Hindi: drafts.
DATE_FIELDS = (('Day', 'दिन', 'bday-day', 2), ('Month', 'महीना', 'bday-month', 2), ('Year', 'साल', 'bday-year', 4))
BIRTH_Q = ('When were you born?', 'आपका जन्म कब हुआ?')
BIRTH_STAYS = ('Stays on this phone', 'यह इसी फ़ोन पर रहता है')


def birth_card(vals=('', '', ''), words=('', ''), error=None):
    hid = uid('bq')
    fields = ''
    for (en, hi, ac, n), v in zip(DATE_FIELDS, vals):
        i = uid('bd')
        inv = ' aria-invalid="true"' if error else ''
        fields += (f'<div><label for="{i}">{tx("span", en, hi)}</label><input id="{i}" type="text" inputmode="numeric" '
                   f'autocomplete="{ac}" maxlength="{n}" value="{v}"{inv}></div>')
    line, icon = (error, ic('alert')) if error else (BIRTH_STAYS, ic('lock'))
    return (f'<div class="gatecard at-end">{lang_list()}{tx("h1", *BIRTH_Q, "q", f" id={hid}")}'
            f'<div class="datefields" role="group" aria-labelledby="{hid}">{fields}</div>'
            f'{tx("p", *words, "datewords", " aria-live=polite") if words[0] else "<p class=datewords></p>"}'
            f'<p class="gatehint">{icon}{tx("span", *line)}</p></div>')


def birth_phone(world, state='empty'):
    W = WORLDS[world]
    card = {'empty': lambda: birth_card(),
            'filled': lambda: birth_card(('12', '03', '1956'), ('12 March 1956', '12 मार्च 1956')),
            'error': lambda: birth_card(('31', '02', '1990'), error=('That date does not exist.', 'यह तारीख़ होती ही नहीं।')),
            }[state]()
    btn = main('Type your birth date', 'अपनी जन्म तारीख़ लिखें', 'Start', 'शुरू करें', 'is-live' if state == 'filled' else 'is-wait')
    return phone(world, body(card, cls='is-cover') + dock(btn), f'{W.title}: the birth date', 'is-gate', W.scene(W.moment('cover')), 'veil-low')


def notyet_phone(world, retry=True, days=214):
    W = WORLDS[world]
    line = (f'You can play in {days} days.', f'आप {days} दिन बाद खेल सकते हैं।') if days > 1 else ('You can play tomorrow.', 'आप कल से खेल सकते हैं।')
    again = f'<button class="textbtn on-paper" type="button">{tx("span", "Wrong date?", "तारीख़ ग़लत है?")}</button>' if retry else ''
    return phone(world, body(f'<div class="gatecard at-end">{tx("h1", *line, "q")}{again}</div>', cls='is-cover'),
                 f'{W.title}: not yet 18', 'is-gate', W.scene(W.moment('cover')), 'veil-low')

# ---------- the First take's chapter title card (SC-91), 24 Oct 2026 ----------
# Full screen with no tabs, like a day's step: back at the top left, "?" at the top right, Start in the dock. It holds
# the chapter's place as five marks, the area named plainly as the h1, the chapter's setting on the line under it
# (every chapter carries a hard topic, so it is named before Start, as a hard day's cover names its setting: O16, F-06),
# and the year with "about 4 minutes" (first-take-script.md, each chapter's card). The words are the script's, read by
# story_take.parse; each world lays them out in its own dress (World.chapter_top), and its own chapter is its specimen.
MINUTES = ('About 4 minutes', 'लगभग 4 मिनट')


def chapter_bits(c, marks='chapmarks'):
    """A chapter's words for its card, c being {n, area, year, line}: the five marks (the finished ones filled, this
    one ringed), "Chapter n of 5", the area, the setting, and "1971 · About 4 minutes"."""
    n = c['n']
    states = ['is-done' if k < n else 'is-now' if k == n else '' for k in range(1, 6)]
    return {'marks': f'<span class="{marks}" aria-hidden="true">' + ''.join(f'<i class="{s}"></i>' if s else '<i></i>' for s in states) + '</span>',
            'of': (f'Chapter {n} of 5', f'अध्याय {n}, 5 में से'), 'area': c['area'], 'line': c['line'],
            'when': (f'{c["year"]} · {MINUTES[0]}', f'{c["year"]} · {MINUTES[1]}')}


def chapter_card(world, lang=None, cls='', c=None):
    W = WORLDS[world]
    inner = topbar('step', W.plate('chapter')) + body(W.chapter_top(chapter_bits(c or W.chapter, W.chapter_marks)), cls='is-cover') + dock(out_btn('Start', 'शुरू करें'))
    return phone(world, inner, f'{W.title} chapter title card', cls, W.scene(W.moment('chapter')), 'veil-low', lang)


# ---------- mechanics ----------
RULE_HOURS = ('Most free hours', 'सबसे ज़्यादा फ़ुर्सत')
RULE_SKILL = ('Most skill', 'सबसे हुनरमंद')
RULE_CHIPS = [('clock', *RULE_HOURS), ('tool', *RULE_SKILL), ('hand', 'First to ask', 'जो पहले माँगे')]
RULE_PPL = [('kamla', [('clock', '3'), ('tool', '4')]), ('arjun', [('clock', '3'), ('tool', '4')]), ('anita', [('clock', '1'), ('tool', '5')])]

def chip(en, hi, st='', icon=None, role='radio'):
    on = 'true' if 'is-selected' in st else 'false'
    i = ic(icon) if icon else ''
    return f'<button class="chip {st}" type="button" role="{role}" aria-checked="{on}">{i}{tx("span", en, hi)}<span class="ctick" aria-hidden="true">{ic("tick")}</span></button>'

def ctxlist(world, ppl):
    items = ''
    for w, p in ppl:
        sen, shi = (named(world, x) for x in spoken(w, p))
        items += (f'<li class="ctx"><i style="background-image:url({face(world, w)})" aria-hidden="true"></i><span class="nm" aria-hidden="true" data-hi="{nm(world, w)[1]}">{nm(world, w)[0]}</span>'
                  f'{stats(p)}{tx("span", sen, shi, "vh")}</li>')
    return f'<ul class="ctxlist plate">{items}</ul>'

def step_rule(world):
    qid = uid('h')
    chips = ''.join(chip(en, hi, 'is-selected' if i == 0 else '', k) for i, (k, en, hi) in enumerate(RULE_CHIPS))
    W = WORLDS[world]
    inner = (topbar('step', W.plate('rule')) + body(h1q('Pick a rule', 'नियम चुनें', qid), ctxlist(world, RULE_PPL),
             f'<div class="chips is-stack at-end" role="radiogroup" aria-labelledby="{qid}">{chips}</div>')
             + dock(main('Pick a rule', 'नियम चुनें', 'Lock rule', 'नियम पक्का करें', 'is-live')))
    art, ac = W.art('rule')
    return phone(world, inner, f'{W.title} assign, pick a rule', 'js-chips', art, ac)

def slot(job, st='', who=None, world=None, reason=None, label=None, job_hi=None):
    w = f'<span class="who"><i style="background-image:url({face(world, who)})"></i>{tx("span", *nm(world, who))}<span class="stick">{ic("tick")}</span></span>' if who else ''
    lab_en = named(world, label) or (f'{job}, {nm(world, who)[0]}' if who else f'{job}, empty')
    lab_hi = (f'{job_hi or job}, {nm(world, who)[1]}' if who else f'{job_hi or job}, ख़ाली')
    r = f'<span class="refusal" role="status">{ic("alert")}{tx("span", reason[0], reason[1])}</span>' if reason else ''
    jb = tx('b', job, job_hi) if job else '<b></b>'
    return f'<div class="slotwrap"><button class="slot {st}" type="button"{al(lab_en, lab_hi)}>{jb}{w}</button>{r}</div>'

JOBS = [('Lamps', 'दीये'), ('Rangoli', 'रंगोली'), ('Ladder', 'सीढ़ी')]

def step_jobs(world):
    W = WORLDS[world]
    qid = uid('h')
    obj = W.jobs_obj(JOB_STATES)
    tray = ''.join(row(world, w, stats(p), 'is-armed' if w == 'arjun' else '', None, label=spoken(w, p, ', held' if w == 'arjun' else '', ', उठाया हुआ' if w == 'arjun' else ''))
                   for w, p in RULE_PPL[1:])
    inner = (topbar('step', W.plate('jobs')) + body(h1q('Fill the jobs', 'काम भरें', qid), tx('span', *RULE_HOURS, 'rulelabel'), obj,
             statkey(['clock', 'tool']), f'<div class="rows is-compact">{tray}</div>')
             + dock(main('Fill 2 more', '2 और भरें')))
    art, ac = W.art('jobs')
    return phone(world, inner, f'{W.title} assign, fill the jobs', '', art, ac)

def step_checks(world):
    W = WORLDS[world]
    qid = uid('h')
    p_eq, p_other = [('ledger', '9'), ('pause', '2')], [('ledger', '6'), ('pause', '0')]
    rws, pool = W.checks(p_eq, p_other)
    inner = (topbar('step', W.plate('checks')) + body(h1q('Whose record do you check?', 'किसका रिकॉर्ड जाँचें?', qid),
             voice(world, 'salim', 'Salim chacha', 'सलीम चाचा', 'Anita may leave after the wedding.', 'शादी के बाद अनीता छोड़ सकती है।'),
             statkey(['ledger', 'pause']), pool, f'<div class="rows">{rws}</div>')
             + dock(main('Check someone', 'किसी को जाँचें', named(world, 'Check Anita twice'), named(world, 'अनीता को दो बार जाँचें'), 'is-live')))
    art, ac = W.art('checks')
    return phone(world, inner, f'{W.title} spend checks', '', art, ac)

def step_team(world):
    W = WORLDS[world]
    qid = uid('h')
    ppl = [('pammi', '41', ''), ('arjun', '41', 'is-selected'), ('kamla', '38', 'is-selected'), ('raju', '33', ''), ('anita', '35', '')]
    rws = ''.join(row(world, w, W.team_side(v), st, 'checkbox', label=spoken(w, [('bat', v)])) for w, v, st in ppl)
    inner = (topbar('step', W.plate('team')) + body(h1q('Pick 3 for the team', 'टीम के लिए 3 चुनें', qid),
             voice(world, 'meena', 'Meena aunty', 'मीना आंटी', "Keep the girls home tonight. It's late.", 'आज लड़कियों को घर पर ही रखो। देर हो गई है।'),
             statkey(['bat']), f'<div class="rows is-compact" role="group" aria-labelledby="{qid}">{rws}</div>')
             + dock(main('Pick 1 more', '1 और चुनें', 'Lock the team', 'टीम पक्की करें')))
    art, ac = W.art('team')
    return phone(world, inner, f'{W.title} team pick', 'js-multi', art, ac)

def step_sort(world):
    W = WORLDS[world]
    qid = uid('h')
    q, line, yes = W.sort
    line = (named(world, line[0]), named(world, line[1]))
    stack = '<div class="stackwrap"><div class="stack">' + byline(world, 'meena', 'Meena aunty', 'मीना आंटी') + tx('p', f'“{line[0]}”', f'“{line[1]}”', '', NOCOUNT) + '</div></div>'
    acts = f'<div class="pairbtns at-end"><button class="chip" type="button">{tx("span", yes[0], yes[1])}</button><button class="chip" type="button">{tx("span", "Cut", "हटाएँ")}</button></div>'
    inner = (topbar('step', W.plate('sort')) + body(h1q(q[0], q[1], qid), stack, acts) + dock(main('Sort 4 more', '4 और छाँटें')))
    art, ac = W.art('sort')
    return phone(world, inner, f'{W.title} quick sort', '', art, ac)

def step_words(world):
    W = WORLDS[world]
    qid = uid('h')
    obj = W.letter_obj()
    chips = ''.join(chip(en, hi) for en, hi in W.words)
    inner = (topbar('step', W.plate('words')) + body(h1q('Fill the blank', 'ख़ाली जगह भरें', qid), obj, f'<div class="chips at-end" role="radiogroup" aria-labelledby="{qid}">{chips}</div>')
             + dock(main('Pick a word', 'एक शब्द चुनें', 'Fill in {n}', '{n} भरें')))
    art, ac = W.art('words')
    return phone(world, inner, f'{W.title} words', 'js-chips', art, ac)

def step_crowd(world):
    W = WORLDS[world]
    qid = uid('h')
    obj = W.crowd_obj(qid)
    inner = (topbar('step', W.plate('crowd')) + body(h1q(named(world, 'How many players sent Raju?'), named(world, 'कितने खिलाड़ियों ने राजू को भेजा?'), qid), f'<div class="at-end">{obj}</div>')
             + dock(main('Pick a guess', 'अंदाज़ा चुनें', 'Guess {n}', '{n} चुनें')))
    art, ac = W.art('crowd')
    return phone(world, inner, f'{W.title} crowd guess', 'js-chips', art, ac)

# ---------- results, week, board ----------
def spines(states, letters=False):
    lab = {'played': ('played', 'खेला'), 'forgiven': ('off', 'छुट्टी'), 'notplayed': ('not played', 'नहीं खेला'), 'today': ('today, played', 'आज, खेला'), 'todo': ('not yet', 'अभी नहीं')}
    out = ''
    for s, (d, dh) in zip(states, DAYS):
        t = tx('span', 'off', 'छुट्टी') if s == 'forgiven' else (tx('span', d, dh) if letters else '')
        out += f'<span class="spine {s}"><i></i>{t}</span>'
    en = 'This week: ' + ', '.join(lab[s][0] for s in states)
    hi = 'यह हफ़्ता: ' + ', '.join(lab[s][1] for s in states)
    return f'<div class="spines" role="img"{al(en, hi)}>{out}</div>'

def figs(practice='41', cls=''):
    return (f'<div class="figs {cls}">' + f'<div class="fig">{tx("span", "Consistency", "एक-सा फ़ैसला")}<b>90</b></div>'
            f'<div class="fig">{tx("span", "Practice", "अभ्यास")}<b>{practice}</b></div>'
            f'<div class="fig">{tx("span", "Lean", "झुकाव")}<b>12 {tx("small", "of 100", "/ 100")}</b></div></div>')

def figs2():
    return (f'<div class="figs c2"><div class="fig">{tx("span", "Practice", "अभ्यास")}<b>41</b></div>'
            f'<div class="fig">{tx("span", "Lean", "झुकाव")}<b>12 {tx("small", "of 100", "/ 100")}</b></div></div>')

def figsx(cons, practice, lean):
    return (f'<div class="figs">' + f'<div class="fig">{tx("span", "Consistency", "एक-सा फ़ैसला")}<b>{cons}</b></div>'
            f'<div class="fig">{tx("span", "Practice", "अभ्यास")}<b>{practice}</b></div>'
            f'<div class="fig">{tx("span", "Lean", "झुकाव")}<b>{lean} {tx("small", "of 100", "/ 100")}</b></div></div>')

def result(world, cls='', day1=False):
    W = WORLDS[world]
    if day1:
        week = spines(['today', 'todo', 'todo', 'todo', 'todo', 'todo', 'todo'])
        top, panel = W.result_parts('78', figsx('80', '7', '4'), week, ('Your numbers settle over your first week.', 'पहले हफ़्ते में आपके नंबर स्थिर होते हैं।'))
    else:
        week = spines(['played', 'played', 'today', 'todo', 'todo', 'todo', 'todo'])
        top, panel = W.result_parts('86', figs(), week, W.next_line)
    inner = topbar('step', W.plate('result')) + body(top, panel, cls='is-cover') + dock(out_btn('Share', 'शेयर करें', ic('share'))) + tabbar('today')
    return phone(world, inner, f'{W.title} result' + (', day 1' if day1 else ''), cls, W.scene(W.moment('result')), 'veil-low')

WEEK = ['played', 'forgiven', 'played', 'played', 'played', 'played']

def dayobjs(world):
    W = WORLDS[world]
    out = ''
    for s, k, (d, dh) in zip(WEEK, W.week or [W.moment('cover')] * 6, DAYS):
        stamp = f'<span class="offstamp">{tx("span", "off", "छुट्टी")}</span>' if s == 'forgiven' else ''
        out += W.dayobj(s, k, tx('b', d, dh), stamp)
    return f'<div class="daygrid" role="img"{al("This week: 5 played, Tuesday off", "यह हफ़्ता: 5 खेले, मंगलवार छुट्टी")}>{out}</div>'

def sunday_week(world, cls=''):
    W = WORLDS[world]
    share = f'<button class="textbtn" type="button">{ic("share")}{tx("span", "Share", "शेयर करें")}</button>'
    obj = W.week_obj('sunday', dayobjs(world))
    art, ac = W.art('sunday')
    inner = topbar('root', W.plate('sunday')) + body(h1q('Your week', 'आपका हफ़्ता'), obj, share) + dock(out_btn('Look again', 'दोबारा देखें')) + tabbar('week')
    return phone(world, inner, f'{W.title} Sunday, the week', cls, art, ac)

def sunday_look(world, cls=''):
    W = WORLDS[world]
    qid = uid('h')
    pair = ''
    for w, p, q in W.twin_pair():
        sen, shi = (named(world, x) for x in spoken(w, p))
        pair += (f'<div class="pi"><span class="face" style="background-image:url({face(world, w)})" aria-hidden="true"></span><span class="nm" aria-hidden="true" data-hi="{nm(world, w)[1]}">{nm(world, w)[0]}</span>'
                 f'{stats(p)}{tx("span", sen, shi, "vh")}{tx("span", f"“{q[0]}”", f"“{q[1]}”", "quote")}</div>')
    chips = ''.join(chip(en, hi, 'is-selected' if i == 0 else '') for i, (en, hi) in enumerate([('Words', 'शब्द'), ('Person', 'व्यक्ति'), ('Nothing', 'कुछ नहीं')]))
    inner = (topbar('step', W.plate('look')) + body(h1q('What was different?', 'क्या अलग था?', qid), byline(world, *W.twin['speaker']),
             f'<div class="pairinfo">{pair}</div>', f'<div class="chips" role="radiogroup" aria-labelledby="{qid}">{chips}</div>',
             f'<button class="textbtn" type="button">{ic("pencil")}{tx("span", "Write a note", "नोट लिखें")}</button>')
             + dock(main('Pick an answer', 'एक जवाब चुनें', 'Save answer', 'जवाब सहेजें', 'is-live')))
    art, ac = W.art('look')
    return phone(world, inner, f'{W.title} Sunday, look again', 'js-chips ' + cls, art, ac)

def road_rows(world, part):
    """Board rows (rank, road name, practice, class) for 'friends', 'top' or 'near', from the world's road names."""
    you = None if part == 'top' else 2
    return [(r, n, p, 'is-you' if i == you else '') for i, ((r, p), n) in enumerate(zip(BOARD_FIGS[part], WORLDS[world].roads[part]))]

def lrows(world, rows, pressed=None):
    out = ''
    for r, n, p, c in rows:
        you = f'<span class="youword">{tx("span", "You", "आप")}</span>' if c else ''
        rk = WORLDS[world].rank(r)
        en = f'Rank {r}, {n}, practice {p}' + (', you' if c else '')
        hi = f'रैंक {r}, {n}, अभ्यास {p}' + (', आप' if c else '')
        pop = '' if c else ' aria-haspopup="menu"'
        pr = ' is-pressed' if pressed == n else ''
        out += f'<li><button class="lrow {c}{pr}" type="button"{pop}{al(en, hi)}><span aria-hidden="true" style="display:contents">{rk}<span class="rd">{n}{you}</span><span class="pr">{p}</span></span></button></li>'
    return out

def seg(active):
    f, e = ('true', 'false') if active == 'friends' else ('false', 'true')
    tf = ic('tick') if active == 'friends' else ''
    te = ic('tick') if active == 'everyone' else ''
    return (f'<div class="seg" role="tablist"{al("Board", "बोर्ड")}><button type="button" role="tab" aria-selected="{f}">{tf}{tx("span", "Friends", "दोस्त")}</button>'
            f'<button type="button" role="tab" aria-selected="{e}">{te}{tx("span", "Everyone", "सब")}</button></div>')

def board(world, view='friends', menu=False, cls=''):
    W = WORLDS[world]
    friend = W.roads['friends'][1]
    if view == 'friends':
        rows = lrows(world, road_rows(world, 'friends'), pressed=friend if menu else None)
        top = ''
    else:
        rows = lrows(world, road_rows(world, 'top')) + '<li class="gapdots" aria-hidden="true">· · ·</li>' + lrows(world, road_rows(world, 'near'))
        top = tx('p', 'Top 9% by practice', 'अभ्यास में टॉप 9%', 'band')
    lst = W.board_list(rows)
    plate = W.plate('board')
    m = ''
    if menu:
        m = (f'<div class="scrim" aria-hidden="true"></div><div class="menu" role="menu" style="top:330px"{al(friend, friend)}>'
             f'<button class="item" type="button" role="menuitem">{ic("friend")}{tx("span", "Add as a friend", "दोस्त बनाएँ")}</button></div>')
    inner = topbar('root', plate) + body(tx('h1', 'Board', 'बोर्ड', 'vh'), seg(view), top, lst) + tabbar('board')
    art, ac = W.art('board')
    ph = phone(world, inner, f'{W.title} board, {view}', cls, art, ac)
    return ph[:-6] + m + ph[-6:] if menu else ph

def board_toast(world):
    t = f'<div class="toast over-tabs" role="status"><span class="t">{tx("span", "Friend added.", "दोस्त जुड़ गया।")}<button class="textbtn" type="button">{tx("span", "Undo", "वापस लें")}</button></span></div>'
    ph = board(world, 'friends')
    return ph[:-6] + t + ph[-6:]

# ---------- overlays ----------
def howline(hid):
    return tx('p', 'Pick someone, send them, and at the end see what you chose.', 'किसी को चुनें, उन्हें भेजें, और आख़िर में देखें आपने क्या चुना।', 'howline', f' id="{hid}"')


def sound_row():
    """The one sound switch, music and effects, in the "?" sheet (owner, 23 Oct 2026: "Sound should also go in the ? menu")."""
    return (f'<div class="setlist sndsec"><button class="setrow sndrow" type="button" role="switch" aria-checked="true">{ic("speaker")}'
            f'{tx("span", "Sound", "आवाज़")}<span class="sw" aria-hidden="true">{ic("tick")}</span></button></div>')


def help_sheet(world):
    """The "?" sheet as a screen carries it, hidden until "?" is tapped: one line of how to play, the languages, then
    sound (owner, 23 Oct 2026: "I prefer C")."""
    hid = uid('sh')
    grab = (f'<div class="grab"><span class="spacer"></span><button class="handle" type="button"{al("Drag to close", "बंद करने के लिए खींचें")}><i></i></button>'
            f'<button class="close" type="button"{al("Close", "बंद करें")}>{ic("close")}</button></div>')
    return (f'<div class="scrim" aria-hidden="true" hidden></div><div class="sheet helpsheet" role="dialog" aria-modal="true" aria-labelledby="{hid}" hidden>'
            f'{WORLDS[world].sheet_dress(1)}{grab}{howline(hid)}{lang_list()}{sound_row()}</div>')


# ---------- Privacy and Delete all in the "?" sheet (F-111, F-112; SC-44, SC-49), 24 Oct 2026 ----------
# The sheet keeps option C (how to play, the languages, sound) and gains one link, Privacy. Its level says what stays
# on this phone, what is sent (nothing, until the Board) and what is kept nowhere, and holds Delete all, which asks
# once in the one dialog. After it, one line; installed, how to take the icon off the home screen. Hindi: drafts.
PRIVACY_DEFS = ((('On this phone', 'इस फ़ोन पर'), ('Your birth date, your answers, the language and sound.', 'आपकी जन्म तारीख़, आपके जवाब, भाषा और आवाज़।')),
                (('Sent anywhere', 'कहीं भेजा गया'), ('Nothing leaves this phone.', 'इस फ़ोन से कुछ बाहर नहीं जाता।')),
                (('Kept nowhere', 'कहीं नहीं रखा जाता'), ('How long you take, or what you type.', 'आप कितना समय लेते हैं, या क्या लिखते हैं।')))
DELETE_Q = ('Delete all your days and notes?', 'अपने सारे दिन और नोट मिटाएँ?')   # F-112's one wording


def privacy_phone(world, level='link'):
    """The "?" sheet over a step: 'link' (the sheet with Privacy), 'privacy' (its level), 'dialog' (Delete all asked),
    'deleted' (the line after it)."""
    under = step_twin(world)
    hid = uid('pv')
    back = BACK.replace('ibtn', 'close')
    grab = lambda first: (f'<div class="grab">{"<span class=spacer></span>" if first else back}<button class="handle" type="button"{al("Drag to close", "बंद करने के लिए खींचें")}><i></i></button>'
                          f'<button class="close" type="button"{al("Close", "बंद करें")}>{ic("close")}</button></div>')
    link = f'<div class="sheetlinks"><button type="button">{tx("span", "Privacy", "प्राइवेसी")}{ic("arrow")}</button></div>'
    if level == 'link':
        content = f'{grab(True)}{howline(hid)}{lang_list()}{sound_row()}{link}'
    elif level == 'deleted':
        content = (f'{grab(True)}{tx("h2", "Deleted.", "मिट गया।", "", f" id={hid}")}'
                   f'{tx("p", "To remove Retake from your home screen, press and hold its icon.", "होम स्क्रीन से रीटेक हटाने के लिए, उसके आइकन को दबाकर रखें।", "letter")}')
    else:
        defs = ''.join(f'<div><dt>{tx("span", *t)}</dt><dd>{tx("span", *d)}</dd></div>' for t, d in PRIVACY_DEFS)
        content = (f'{grab(False)}{tx("h2", "Privacy", "प्राइवेसी", "", f" id={hid}")}<dl class="defs">{defs}</dl>'
                   f'<div class="sheetlinks"><button type="button" class="is-danger">{tx("span", "Delete all", "सब मिटाएँ")}{ic("alert")}</button></div>')
    sh = f'<div class="scrim" aria-hidden="true"></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="{hid}">{WORLDS[world].sheet_dress(1)}{content}</div>'
    if level == 'dialog':
        did = uid('dl')
        sh += (f'<div class="scrim" aria-hidden="true"></div><div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="{did}">{tx("h2", *DELETE_Q, "", f" id={did}")}'
               f'<div class="acts"><button type="button" class="textbtn on-paper">{tx("span", "Keep", "रखें")}</button>'
               f'<button type="button" class="textbtn on-paper is-danger">{ic("alert")}{tx("span", "Delete all", "सब मिटाएँ")}</button></div></div>')
    return under[:-6] + sh + under[-6:]


def sheet_phone(world, layer=1):
    under = step_twin(world)
    hid = f'sh{world}{layer}'
    grab = f'<div class="grab">{"<span class=spacer></span>" if layer in (1, 5) else BACK.replace("ibtn", "close")}<button class="handle" type="button"{al("Drag to close", "बंद करने के लिए खींचें")}><i></i></button><button class="close" type="button"{al("Close", "बंद करें")}>{ic("close")}</button></div>'
    if layer in (1, 5):   # 5: the same sheet with eight languages, to show the chips wrap as languages are added
        more = (('mr', 'मराठी'), ('bn', 'বাংলা'), ('ta', 'தமிழ்'), ('te', 'తెలుగు'), ('gu', 'ગુજરાતી')) if layer == 5 else ()
        content = (f'{howline(hid)}{lang_list(more)}{sound_row()}'
                   f'<div class="sheetlinks"><button type="button">{tx("span", "Settings", "सेटिंग्स")}{ic("arrow")}</button><button type="button">{tx("span", "Your numbers", "आपके नंबर")}{ic("arrow")}</button><button type="button">{tx("span", "About", "परिचय")}{ic("arrow")}</button></div>')
    elif layer == 2:
        content = (f'{tx("h2", "Your numbers", "आपके नंबर", "", f" id={hid}")}'
                   f'<dl class="defs"><div><dt>{tx("span", "Consistency", "एक-सा फ़ैसला")}</dt><dd>{tx("span", "Picks that agree.", "मेल खाते फ़ैसले।")}</dd></div>'
                   f'<div><dt>{tx("span", "Lean", "झुकाव")}</dt><dd>{tx("span", "How far you tip.", "कितना झुकते हैं।")}</dd></div>'
                   f'<div><dt>{tx("span", "Practice", "अभ्यास")}</dt><dd>{tx("span", "Grows with play.", "खेलने से बढ़ता।")}</dd></div></dl>')
    elif layer == 4:
        sw = lambda icon, en, hi, on: (f'<button class="setrow" type="button" role="switch" aria-checked="{"true" if on else "false"}">{ic(icon)}{tx("span", en, hi)}'
                                       f'<span class="sw" aria-hidden="true">{ic("tick")}</span></button>')
        content = (f'{tx("h2", "Settings", "सेटिंग्स", "", f" id={hid}")}'
                   f'<div class="setlist">{sw("music", "Music", "म्यूज़िक", True)}{sw("speaker", "Sounds", "साउंड", True)}{sw("vibrate", "Vibration", "वाइब्रेशन", True)}{sw("bell", "Reminders", "रिमाइंडर", False)}</div>'
                   f'<div class="sheetlinks"><button type="button">{tx("span", "Road name", "रोड नेम")}{ic("arrow")}</button><button type="button">{tx("span", "Privacy", "प्राइवेसी")}{ic("arrow")}</button></div>')
    else:
        content = (f'{tx("h2", "About", "परिचय", "", f" id={hid}")}{tx("p", "One puzzle a day, in two worlds.", "हर दिन एक पहेली, दो दुनियाओं में।", "letter")}'
                   f'<p class="credit">Made by The Equal Lens</p>')
    sh = f'<div class="scrim" aria-hidden="true"></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="{hid}">{WORLDS[world].sheet_dress(layer)}{grab}{content}</div>'
    return under[:-6] + sh + under[-6:]

# ---------- specimens ----------
def frame(world, inner, cls=''):
    return f'<div class="frame world {WORLDS[world].cls} {cls}">{inner}</div>'

def spec_tiles(world):
    states = [('rest', ''), ('hover (web)', 'is-hover'), ('pressed', 'is-pressed'), ('selected', 'is-selected'), ('held (two-tap assign)', 'is-armed'), ('focus', 'is-focus'), ('committing', 'is-selected is-committing'), ('revisited, locked', 'is-selected is-revisited')]
    out = '<div class="pg-states">'
    W = WORLDS[world]
    first = W.twin['pair'][0]
    for lab, st in states:
        t = tile(world, *W.twin['people'][first], st, serial=W.serial(first))
        out += f'<div class="pg-state" style="width:200px"><small>{lab}</small>{frame(world, t, "pad-tick")}</div>'
    r = row(world, 'arjun', stats([('bat', '41')]), 'is-refused', 'checkbox', label=('Arjun, batting average 41', 'अर्जुन, बैटिंग औसत 41'))
    out += f'<div class="pg-state" style="width:340px"><small>refused (team day, three already picked)</small>{frame(world, r + "<div style=height:8px></div>" + "<span class=refusal role=status>" + ic("alert") + tx("span", "Team is full", "टीम पूरी है") + "</span>", "pad-tick")}</div>'
    return out + '</div>'

def spec_buttons(world):
    s = [('not ready', main('Pick 2 more', '2 और चुनें')), ('live', main('', '', named(world, 'Send Kamla'), named(world, 'कमला को भेजें'), 'is-live')), ('live, hover (web)', main('', '', named(world, 'Send Kamla'), named(world, 'कमला को भेजें'), 'is-live', 'is-hover')),
         ('live, pressed', main('', '', named(world, 'Send Kamla'), named(world, 'कमला को भेजें'), 'is-live', 'is-pressed')), ('live, focus', main('', '', named(world, 'Send Kamla'), named(world, 'कमला को भेजें'), 'is-live', 'is-focus')),
         ('committing (260 ms, no new words)', main('', '', named(world, 'Send Kamla'), named(world, 'कमला को भेजें'), 'is-live', 'is-committing')),
         ('outside a puzzle', out_btn('Play', 'खेलें')), ('outside, hover (web)', out_btn('Play', 'खेलें', extra='is-hover')), ('outside, pressed', out_btn('Play', 'खेलें', extra='is-pressed')),
         ('share, copied (until the next tap)', out_btn('Copied', 'कॉपी हो गया', ic('tick')))]
    out = '<div class="pg-states">' + ''.join(f'<div class="pg-state" style="width:280px"><small>{l}</small>{frame(world, b)}</div>' for l, b in s)
    sec = (f'<div class="pg-row"><button class="textbtn" type="button">{ic("pencil")}{tx("span", "Write a note", "नोट लिखें")}</button>'
           f'<button class="textbtn is-hover" type="button">{tx("span", "Hover", "होवर")}</button>'
           f'<button class="textbtn is-pressed" type="button">{tx("span", "Try again", "फिर कोशिश करें")}</button>'
           f'<button class="textbtn is-danger" type="button">{ic("alert")}{tx("span", "Start today again", "आज फिर से शुरू करें")}</button></div>')
    out += f'<div class="pg-state" style="width:360px"><small>secondary: rest, pressed, destructive (marked, never filled)</small>{frame(world, sec)}</div>'
    ib = (f'<div class="pg-row"><button class="ibtn" type="button"{al("Back", "वापस")}>{ic("back")}</button><button class="ibtn is-pressed" type="button"{al("Back", "वापस")}>{ic("back")}</button>'
          f'<button class="ibtn is-hover" type="button"{al("How to play", "कैसे खेलें")}>{ic("help")}</button>'
          f'<button class="ibtn is-focus" type="button"{al("How to play", "कैसे खेलें")}>{ic("help")}</button></div>')
    out += f'<div class="pg-state" style="width:280px"><small>icon button: rest, pressed, hover, focus</small>{frame(world, ib)}</div>'
    return out + '</div>'

def spec_chips(world):
    s = [('rest', chip(*RULE_SKILL, '', 'tool')), ('hover (web)', chip(*RULE_SKILL, 'is-hover', 'tool')), ('pressed', chip(*RULE_SKILL, 'is-pressed', 'tool')), ('selected', chip(*RULE_SKILL, 'is-selected', 'tool')),
         ('focus', chip(*RULE_SKILL, 'is-focus', 'tool')), ('word', chip('proud', 'घमंडी')), ('none', chip('None of these', 'इनमें से कोई नहीं')),
         ('crowd guess, picked', '<div class="chips is-grid5" style="width:300px">' + ''.join(chip(f'{v}%', f'{v}%', 'is-selected' if v == 40 else '') for v in range(10, 60, 10)) + '</div>')]
    out = '<div class="pg-states">' + ''.join(f'<div class="pg-state"><small>{l}</small>{frame(world, b)}</div>' for l, b in s)
    glyph = WORLDS[world].check_glyph
    pool = f'<div class="pool" role="img"{al("2 checks left", "2 जाँच बाकी")}>{ic(glyph, fill=True)}{ic(glyph, fill=True)}<span class="spent">{ic(glyph)}</span></div>'
    out += f'<div class="pg-state"><small>check pool: 2 left, 1 spent (not a control)</small>{frame(world, pool)}</div>'
    return out + '</div>'

def spec_slots(world):
    s = [('empty', slot('Lamps', world=world, job_hi='दीये')), ('hover (web)', slot('Lamps', 'is-hover', world=world, job_hi='दीये')), ('target lit', slot('Lamps', 'is-target', world=world, job_hi='दीये')), ('focus', slot('Lamps', 'is-focus', world=world, job_hi='दीये')),
         ('filled', slot('Lamps', 'is-filled', 'kamla', world, job_hi='दीये')), ('pressed', slot('Lamps', 'is-filled is-pressed', 'kamla', world, job_hi='दीये')),
         ('refused', slot('Lamps', 'is-filled is-refused', 'kamla', world, ('Lamps is full', 'दीये भर गए'), job_hi='दीये')), ('revisited, locked', slot('Lamps', 'is-filled is-revisited', 'kamla', world, job_hi='दीये'))]
    return '<div class="pg-states">' + ''.join(f'<div class="pg-state" style="width:230px"><small>{l}</small>{frame(world, b)}</div>' for l, b in s) + '</div>'

def spec_info(world):
    T = WORLDS[world].twin
    v = voice(world, 'salim', 'Salim chacha', 'सलीम चाचा', 'Anita may leave after the wedding.', 'शादी के बाद अनीता छोड़ सकती है।')
    by = byline(world, *T['speaker'])
    mk = spines(['played', 'forgiven', 'played', 'notplayed', 'today', 'todo', 'todo'], letters=True)
    month = '<div class="monthstrip" aria-hidden="true">' + ''.join(f'<i class="{c}"></i>' for c in (['', '', 'forgiven', '', '', '', '', '', 'notplayed', '', '', '', '', '', '', '', '', '', 'forgiven', '', '', '', '', '', '', '', '', ''])) + '</div>'
    wk = f'{month}<div style="height:8px"></div>{tx("span", "Best: 12 days", "सबसे लंबी: 12 दिन", "best")}'
    return ('<div class="pg-states">'
            f'<div class="pg-state" style="width:340px"><small>voice: a named speaker in a balloon on the ground</small>{frame(world, v)}</div>'
            f'<div class="pg-state" style="width:340px"><small>byline: who said the lines on the cards</small>{frame(world, by)}</div>'
            f'<div class="pg-state" style="width:340px"><small>one shared key; the icons repeat on every number</small>{frame(world, statkey(T["keys"]) + "<div style=height:8px></div>" + stats(WORLDS[world].twin_pair()[0][1]))}</div>'
            f'<div class="pg-state" style="width:340px"><small>week marks: played, off, played, not played, today, not yet</small>{frame(world, mk)}</div>'
            f'<div class="pg-state" style="width:340px"><small>Week tab: the month strip and the best streak</small>{frame(world, wk)}</div>'
            f'<div class="pg-state" style="width:390px"><small>cover top bar: the day count, language, help</small>{frame(world, topbar("cover"), "flush")}</div>'
            f'<div class="pg-state" style="width:390px"><small>step top bar: back, the day plate, help</small>{frame(world, topbar("step", WORLDS[world].plate("default")), "flush")}</div>'
            f'<div class="pg-state" style="width:390px"><small>tab bar, Today active</small>{frame(world, tabbar("today"), "flush")}</div>'
            '</div>')

def spec_overlays(world):
    tst = (f'<div class="pg-stack"><div class="toast is-static" role="status"><span class="t">{tx("span", "Tuesday off. Streak kept.", "मंगलवार छुट्टी। स्ट्रीक बनी रही।")}</span></div>'
           f'<div class="toast is-static" role="status"><span class="t">{tx("span", "Copied. Paste anywhere.", "कॉपी हो गया। कहीं भी चिपकाएँ।")}</span></div>'
           f'<div class="toast is-static" role="status"><span class="t">{tx("span", "Friend added.", "दोस्त जुड़ गया।")}<button class="textbtn" type="button">{tx("span", "Undo", "वापस लें")}</button></span></div></div>')
    def field(st, val=''):
        i = uid('n')
        cls = {'focus': ' class="is-focus"', 'error': ' class="is-error"'}.get(st, '')
        hint = (f'<small id="{i}h">{ic("alert")}{tx("span", "Too long. Keep it under 500 letters.", "बहुत लंबा। 500 अक्षर से कम रखें।")}</small>' if st == 'error'
                else f'<small id="{i}h">{tx("span", "Stays on this phone, never sent", "इसी फ़ोन पर रहता है, कभी भेजा नहीं जाता")}</small>')
        inv = ' aria-invalid="true"' if st == 'error' else ''
        return f'<div class="field"><label for="{i}">{tx("span", "Your note", "आपका नोट")}</label><textarea id="{i}"{cls}{inv} aria-describedby="{i}h">{val}</textarea>{hint}</div>'
    return ('<div class="pg-states">' + f'<div class="pg-state" style="width:340px"><small>toast: at most 4 words; Undo is a 48 target</small>{frame(world, tst)}</div>'
            + ''.join(f'<div class="pg-state" style="width:320px"><small>note field: {l}</small>{frame(world, field(st, v))}</div>'
                      for l, st, v in [('rest', '', ''), ('focus', 'focus', ''), ('filled', '', 'Two drivers had the same record.'), ('error', 'error', 'Two drivers had the same record...')]) + '</div>')

def spec_states(world):
    empty = f'<div class="statemsg">{tx("p", "No friends yet", "अभी कोई दोस्त नहीं")}<button class="textbtn" type="button">{tx("span", "Add by road name", "रोड नेम से जोड़ें")}</button></div>'
    off = f'<div class="statemsg">{tx("p", "Today did not load. Your signal dropped.", "आज की पहेली नहीं खुली। सिग्नल चला गया।")}<button class="textbtn" type="button">{tx("span", "Try again", "फिर कोशिश करें")}</button></div>'
    later = f'<div class="statemsg"><p role="status">{ic("tick")}{tx("span", "Saved. It sends when you are back online.", "सहेजा गया। ऑनलाइन होते ही जाएगा।")}</p></div>'
    newphone = f'<div class="statemsg">{tx("p", "New phone? Your road name brings your days back.", "नया फ़ोन? रोड नेम से आपके दिन वापस आ जाते हैं।")}<button class="textbtn" type="button">{tx("span", "Enter road name", "रोड नेम लिखें")}</button></div>'
    err = f'<div class="statemsg"><p role="alert">{ic("alert")}{tx("span", "Storage full. Free some space, then try again.", "जगह भर गई। थोड़ी जगह ख़ाली करें, फिर कोशिश करें।")}</p></div>'
    miss = f'<ul class="ctxlist plate"><li class="ctx"><i class="is-missing" aria-hidden="true">{ic("person")}</i><span class="nm">{nm(world, "pammi")[0]}</span></li></ul>'
    return '<div class="pg-states">' + ''.join(f'<div class="pg-state" style="width:280px"><small>{l}</small>{frame(world, b)}</div>' for l, b in [('empty', empty), ('offline, nothing saved', off), ('offline, answer kept', later), ('new phone', newphone), ('error, in place', err), ('portrait missing', miss)]) + '</div>'

def spec_extras(world):
    ms = f'<div class="milestone" role="img"{al("7 days in a row", "लगातार 7 दिन")}><span aria-hidden="true">7<br>{tx("small", "days", "दिन")}</span></div>'
    return (f'<div class="pg-states"><div class="pg-state" style="width:280px"><small>share card: number, road name, steps, streak; never the score or lean</small>{WORLDS[world].share_card()}</div>'
            f'<div class="pg-state" style="width:220px"><small>milestone stamp (still under reduced motion)</small>{frame(world, ms)}</div></div>')

# ---------- day objects: anatomy, tokens, states, accessibility ----------
def obj_card(world, title, pic, anatomy, tokens, states, a11y):
    return (f'<div class="pg-spec"><h4>{title}</h4><div class="pg-two"><div>{frame(world, pic)}</div><dl>'
            f'<dt>Anatomy</dt><dd>{anatomy}</dd><dt>Tokens</dt><dd>{tokens}</dd><dt>States</dt><dd>{states}</dd><dt>Access</dt><dd>{a11y}</dd></dl></div></div>')

def objects():
    out = ''
    for W in SEL:
        cards = ''.join(obj_card(W.id, *c) for c in W.objects())
        if cards:
            out += f'<h3 class="pg-h3">{W.title}</h3><div class="pg-stack">{cards}</div>'
    return out

# ---------- your choices ----------
def ab_item(title, why, opts):
    figs_ = ''.join(f'<figure class="pg-fig">{pic}<figcaption><b>{k}. {lab}{"<span class=rec>default</span>" if d else ""}</b></figcaption></figure>' for k, lab, pic, d in opts)
    return f'<div class="pg-spec"><h4>{title}</h4><p class="pg-rule">{why}</p><div class="pg-ab">{figs_}</div></div>'

def thumb(ph):
    return ph.replace('class="phone', 'class="phone is-thumb', 1)

# Open questions shared by every world, drawn in the page's first world WA (or its second, WB), each with its place
# in the list. A world adds its own questions through choices(); all are drawn in order of place.
CHOICES = [
    (1, lambda: ab_item('Where the day plate sits (a rule change)', 'The rulebook says the top bar holds only back and "?". Putting the plate in the bar keeps every step the same height and carries the world into the first view.',
        [('A', 'In the bar, as its title', thumb(step_twin(WB.id)), True), ('B', 'Under the bar, as its own band', thumb(step_twin(WB.id).replace('<div class="topbar">', '<div class="topbar is-bare">', 1)), False)])),
    (2, lambda: ab_item('Small phones (a rule change)', 'Four people with their lines cannot fit 360 x 640 without scrolling. The rule asks for no scroll.',
        [('A', 'Scroll once, with a cue', thumb(step_twin(WA.id, cls='is-small')), True), ('B', 'Three people on small phones', '<p class="pg-note">Small phones get 3-person sets only. The twin pair stays; one other person is cut.</p>', False)])),
    (3, lambda: ab_item('Who says the loaded lines', 'Each set gets one named local voice with a portrait. You can rename them.',
        [('A', 'A named voice per set', frame(WA.id, byline(WA.id, *WA.twin['speaker']) + '<div style="width:180px;margin-top:12px">' + tile(WA.id, *WA.twin_pair()[0]) + '</div>'), True),
         ('B', 'No speaker', frame(WA.id, '<div style="width:180px">' + tile(WA.id, *WA.twin_pair()[0]) + '</div>'), False)])),
    (4, lambda: ab_item('The twin wording', 'The equal pair differs only by one loaded word. A later day swaps the words between them.',
        [('A', '"{}" and "{}"'.format(*WA.twin['words']), frame(WA.id, '<div class="tiles" data-n="2">' + ''.join(tile(WA.id, *p) for p in WA.twin_pair()) + '</div>'), True),
         ('B', 'The return day, words swapped', frame(WA.id, '<div class="tiles" data-n="2">' + ''.join(tile(WA.id, w, p, q) for (w, p, _), q in zip(WA.twin_pair(), WA.twin['swapped'])) + '</div>'), False)])),
    (5, lambda: ab_item('Text over the paintings', 'Text needs a plate or a tint to read over a painting.',
        [('A', 'Small plates that hug the text', thumb(step_twin(WA.id)), True), ('B', 'A dark band across the screen', thumb(step_twin(WA.id).replace(f'class="art {WA.art_cls}"', f'class="art {WA.art_cls} band-demo"', 1)), False)])),
    (6, lambda: ab_item('Button lettering', 'Hindi has no capitals, and the display face is hard to read small.',
        [('A', 'Plain sentence case in Hind', frame(WA.id, main('', '', named(WA.id, 'Send Kamla'), named(WA.id, 'कमला को भेजें'), 'is-live')), True),
         ('B', 'Display capitals', frame(WA.id, main('', '', named(WA.id, 'Send Kamla').upper(), named(WA.id, 'कमला को भेजें'), 'is-live').replace('class="main', f'style="font:900 1.125rem/1 {WA.display_face or "Hind"},Hind" class="main', 1)), False)])),
    (9, lambda: ab_item('Which practice number players see', 'Today it was 7 on the result, 41 on Sunday and 150 on the Board.',
        [('A', 'The running total everywhere', frame(WA.id, '<div class="figs c2"><div class="fig"><span>Practice</span><b>41</b></div><div class="fig"><span>Lean</span><b>12 <small>of 100</small></b></div></div>'), True),
         ('B', "Today's points on the result", frame(WA.id, '<div class="figs c2"><div class="fig"><span>Practice</span><b>+7</b></div><div class="fig"><span>Lean</span><b>12 <small>of 100</small></b></div></div>'), False)])),
    (12, lambda: ab_item('How open the game is about what it hides', 'The game never shows which way you lean, and never says which days test you.',
        [('A', 'Never named', frame(WA.id, '<div class="howto">' + f'<div>{ic("tap")}<span>Pick someone</span></div><div>{ic("confirm")}<span>Send them</span></div><div>{ic("score")}<span>See your score</span></div></div>', 'on-paper'), True),
         ('B', 'Said once in "?"', frame(WA.id, '<p class="letter">Some days repeat a record with new words. Your lean shows its size, never its side.</p>', 'on-paper'), False)])),
    (13, lambda: ab_item("Sunday's shape", 'Sunday shows the week, the lean, one look-again pair and a note.',
        [('A', 'Two short screens', '<div class="pg-pair">' + thumb(sunday_week(WA.id)) + thumb(sunday_look(WA.id)) + '</div>', True),
         ('B', 'One long screen', thumb(sunday_long()), False)])),
    (14, lambda: ab_item('Hindi words still to test', 'Draft words, to try with 5 Hindi-first players before fixing them.',
        [('A', 'एक-सा फ़ैसला, झुकाव, अभ्यास', frame(WA.id, '<div class="figs" lang="hi"><div class="fig"><span>एक-सा फ़ैसला</span><b>90</b></div><div class="fig"><span>अभ्यास</span><b>41</b></div><div class="fig"><span>झुकाव</span><b>12 <small>/ 100</small></b></div></div>'), True),
         ('B', 'Loanwords: कंसिस्टेंसी, लीन, प्रैक्टिस', frame(WA.id, '<div class="figs" lang="hi"><div class="fig"><span>कंसिस्टेंसी</span><b>90</b></div><div class="fig"><span>प्रैक्टिस</span><b>41</b></div><div class="fig"><span>लीन</span><b>12 <small>/ 100</small></b></div></div>'), False)])),
]

def choices():
    items = CHOICES + [c for W in SEL for c in W.choices()]
    return ''.join(draw() for _, draw in sorted(items, key=lambda c: c[0]))

def sunday_long():
    a = sunday_week(WA.id)
    b = sunday_look(WA.id)
    body_a = a.split('<div class="scr-body ">')[1].split('</div><div class="dock">')[0]
    body_b = b.split('<div class="scr-body ">')[1].split('</div><div class="dock">')[0]
    return a.replace(body_a, body_a + body_b.replace('<h1', '<h2').replace('</h1>', '</h2>'), 1).replace('class="phone', 'class="phone is-long', 1)

# ---------- the registered worlds ----------
class Lugdi(World):
    id = 'lugdi'
    name = ('Lugdi', 'लुगदी')
    voice = ('Each day is the next issue of a 1970s Hindi pulp novel.', 'हर दिन सत्तर के दशक के एक हिंदी लुगदी उपन्यास का अगला अंक है।')
    palette = [('lugdi-ground', '#1B0B2E', 'Night violet ground'), ('lugdi-paper', '#EFE7D4', 'Newsprint: every card starts here'), ('lugdi-ink', '#17110F', 'Text on paper, 15.2:1'),
               ('lugdi-title', '#FFF3DC', 'Cover lettering, 16.9:1'), ('lugdi-red', '#E4002B', 'Print offset, stamps and rings, never text'), ('lugdi-muted', '#4A3B57', 'Not-ready fill, paper text 8.3:1')]
    fonts = ['Sarpanch:wght@900']
    display_face = 'Sarpanch'
    type_row = ('ts-display', 'Ghat Ka Sauda', 'घाट का सौदा', 'Sarpanch 900, 45, the cover title only. Hindi 1.3')
    shapes = {'radii': '0 paper and sheets, 4 chips and slots, round', 'spent': 'Red rubber stamp', 'depth': 'Ink rules. The red print offset under the live button only'}
    card_word = 'newsprint panels'
    scenes = {'ghat': 'pulp-s-ghat', 'diwali': 'pulp-s-diwali', 'money': 'pulp-s-money', 'cricket': 'pulp-s-cricket', 'night': 'pulp-s-night', 'court': 'pulp-s-court'}
    moments = {'twin': 'ghat', 'rule': 'diwali', 'jobs': 'diwali', 'checks': 'money', 'team': 'cricket', 'sort': 'cricket', 'words': 'night', 'crowd': 'ghat',
               'look': 'ghat', 'board': 'court', 'cover': 'ghat', 'cover_hard': 'court', 'result': 'ghat', 'sunday': 'court', 'change': 'ghat', 'month': 'court',
               'chapter': 'ghat'}
    art_cls = 'veil'
    face_prefix = 'pulp'
    plates = {'default': ('Ghat Series', 'घाट सीरीज़'), 'board': ('Bestsellers', 'बेस्टसेलर'), 'chapter': None}
    take_plate = ('Kasara Ghat', 'कसारा घाट')   # chapter 2's road, 1977
    places = ('Ghat Series', 'Kasara Ghat')
    week = ['diwali', 'money', 'ghat', 'cricket', 'night', 'court']
    signature = 'the result reprints the cover, red ink, then black, then paper white.'
    notes = {'hero': 'Wednesday, issue 214', 'twin.wait': 'The button says what is missing.', 'twin.pick': 'The button names what happens.',
             'rule': 'The chips carry the key: their icons match the numbers.', 'jobs': 'Velu is held; the lit slot takes him.',
             'checks': 'Spent checks are red stamps.', 'team': 'The team sheet; two of three picked.', 'sort': "Kusum aunty's column on the paper stack.",
             'words': "A reader's letter with one blank.", 'crowd': "The readers' poll; nothing set until you pick.",
             'result': 'The score in the issue roundel; the figures on a newsprint slip.', 'sunday': 'Six days as six covers; Share is the other action.',
             'look': 'The equal pair on paper; tap an answer.', 'board.friends': 'It opens on Friends.',
             'board.everyone': 'Your band, the top 3, then two above and two below you.', 'board.menu': 'A tap on a row opens one action.',
             'sheet.help': 'One line of how to play, the languages as chips, sound as a switch; the handle centred.', 'sheet.more': 'More languages wrap onto a second line.', 'sheet.numbers': 'Three plain lines; the trick is never named.',
             'sheet.settings': 'Music and Sounds start on; each switches off here, with no line of explanation. The whole row is the switch.',
             'hi.step': 'Every string and spoken name in Hindi.', 'hi.cover': 'The title in Devanagari.',
             'big.step': 'One column; the body scrolls with a cue.', 'big.cover': 'Nothing clipped or overlapping.',
             'small.step': 'Scrolls once, with a cue (see "Your choices").',
             'resp.step': 'The ghat fills the screen; the cards sit on their side in the open sky.',
             'resp.cover': 'A full-screen pulp cover; the title and Play on the open side. The rail holds the tabs.',
             'resp.result': 'The score roundel and the figures on the open side of the painting.',
             'resp.sunday': 'The week and the look-again pair side by side over the painting. On a phone these are two screens.'}
    shows = {'board_more': [('board', {'menu': True}, 'Row menu', 'board.menu')],
             'sheet_info': [('sheet', {'layer': 2}, 'Your numbers', 'sheet.numbers')],
             'small_more': [('cover', {'cls': 'is-small'}, '360 x 640, {w} cover', 'small.cover')]}

    def cover_top(self, hard, line, level, nxt, kept):
        title, issue, day = ((('Adalat Ki Raat', 'अदालत की रात'), '215', ('Thursday', 'गुरुवार')) if hard else
                             (('Ghat Ka Sauda', 'घाट का सौदा'), '214', ('Wednesday', 'बुधवार')))
        return (f'<div class="masthead">{tx("span", "Ghat Series", "घाट सीरीज़")}{tx("span", day[0], day[1])}</div>' + kept +
                f'<div class="roundel" role="img"{al("Issue " + issue, "अंक " + issue)}><span aria-hidden="true">{issue}</span></div>'
                '<div class="coverstack">' + tx('h1', title[0], title[1], 'pulp-title') + '<div class="plate hug">' + ('' if nxt or not line else tx('p', line[0], line[1], 'coverline')) + tx('span', level[0], level[1], 'level') + nxt + '</div></div>')

    chapter = {'n': 2, 'area': ('Safety and justice', 'सुरक्षा और न्याय'), 'year': '1977',
               'line': ('Night runs, and reports of being followed.', 'रात के फेरे, और पीछा किए जाने की रिपोर्टें।')}

    def chapter_top(self, b):
        # a part of the pulp novel: the masthead names the First take and the part, the area is the printed title
        return (f'<div class="masthead">{tx("span", "First take", "फ़र्स्ट टेक")}{tx("span", *b["of"])}</div>'
                '<div class="coverstack">' + tx('h1', *b['area'], 'pulp-title') + '<div class="plate hug chapplate">' + b['marks']
                + tx('p', *b['line'], 'coverline') + tx('span', *b['when'], 'level') + '</div></div>')

    def app_meta(self, kind, line=None, level=None):
        if kind == 'step':
            return lugdi_mast()
        return (lugdi_mast() + '<div class="coverstack">' + tx('h1', 'Ghat Ka Sauda', 'घाट का सौदा', 'pulp-title') +
                '<div class="plate hug">' + tx('p', line[0], line[1], 'coverline') + tx('span', level[0], level[1], 'level') + '</div></div>')

    def result_parts(self, score, figs_, week, line, end=' at-end'):
        rnd = f'<div class="roundel is-score">{tx("span", "Score", "स्कोर", "lab")}<h1><span class="vh">Score </span>{score}</h1></div>'
        return rnd, f'<div class="slip on-paper{end}">{figs_}{week}{tx("p", line[0], line[1], "letter")}</div>'

    def share_card(self):
        return (f'<div class="sharecard world {self.cls}"><div class="art" style="background-image:url({self.scene("ghat")})"></div><div class="sc-in"><span class="level">Ghat Series · No. 214</span>'
                f'<span class="pulp-title sm">{self.road_you}</span><span class="sc-marks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span class="sc-line">Day 6</span></div></div>')

    def objects(self):
        w = self.id
        return [('Poster cover', thumb(cover(w)),
                 'Masthead strip, issue roundel, the painting full bleed, the title printed on it, a small plate for the line and level.', 'paper, ink, title, red; Sarpanch 900 45; Hind; radius 0 and full',
                 'play, continue, see your score, first visit, hard day, loading', 'Title is the h1. Roundel is an image named "Issue 214". Painting hidden from screen readers.'),
                ('Plates and caption boxes', h1q(*self.twin['q']) + '<div style="height:8px"></div>' + byline(w, *self.twin['speaker']),
                 'A deep plate hugging its text, with a thin title-coloured inner rule, like a pulp caption box.', 'ground-deep at 92%, title rule at 45%', 'one state; never tappable', 'Text on a plate is at least 7:1 against its darkest and lightest pixels.'),
                ('Newsprint page (letters, bestsellers, jobs, poll)', self.letter_obj(),
                 'Paper with a 2.5 px ink frame, a head rule with the issue number as decoration, rows or a letter inside.', 'paper, ink, tex-newsprint; radius 0', 'blank: empty, target, filled; row: rest, pressed, you', 'Head and issue number hidden from screen readers; the blank is named "blank".'),
                ('The end of the day and the roundel', f'<div class="pg-row"><div class="roundel is-score" style="zoom:.7">{tx("span", "Score", "स्कोर", "lab")}<h1>86</h1></div>' + tx('p', 'Next issue tomorrow', 'अगला अंक कल', 'nextline') + '</div>',
                 'The score set in the issue roundel; one line for tomorrow.', 'title, red, ink; Score 36', 'result; milestone stamp', 'The score is the result screen h1.')]

    def choices(self):
        w = self.id
        return [(7, lambda: ab_item('The red print edge on the live button', 'The rulebook allows one red edge under the live button in Lugdi, like misaligned print. A design review says it looks like a trendy web button, not print.',
                    [('A', 'Keep the red print edge', frame(w, main('', '', named(w, 'Send Saroj'), named(w, 'सरोज को भेजें'), 'is-live')), True),
                     ('B', 'A flat yellow button', frame(w, main('', '', named(w, 'Send Saroj'), named(w, 'सरोज को भेजें'), 'is-live').replace('class="main', 'style="box-shadow:none" class="main', 1)), False)])),
                (8, lambda: ab_item('The last line of the day', '"Issue 214 is out" can sound like cricket and says nothing about tomorrow.',
                    [('A', 'Next issue tomorrow', frame(w, tx('p', 'Next issue tomorrow', 'अगला अंक कल', 'nextline')), True), ('B', 'Issue 214 is out', frame(w, '<p class="nextline">Issue 214 is out.</p>'), False),
                     ('C', '"The End" band', frame(w, '<span class="pulp-title sm">The End</span>'), False)]))]


class Station(World):
    id = 'station'
    name = ('Station', 'स्टेशन')
    voice = ('Each day is printed on Indian Railways enamel boards, tickets and charts.', 'हर दिन भारतीय रेल के इनेमल बोर्ड, टिकट और चार्ट पर छपा है।')
    palette = [('station-ground', '#181A1B', 'Platform black'), ('station-ticket', '#E9DFC4', 'Ticket card stock'), ('station-enamel-white', '#F4F1E8', 'White enamel, ink 16.6:1'),
               ('station-cobalt', '#13308F', 'Enamel cobalt: bands, stamps, rules'), ('station-flap', '#262626', 'Split-flap tiles, white 13.4:1'), ('station-muted', '#3A3D40', 'Not-ready fill, ticket text 8.2:1')]
    type_row = ('ts-board', 'Nashik', 'नाशिक', 'Hind 700, 36, board names only. Hindi 1.3')
    shapes = {'radii': '0 plates, 4 tickets, chips and sheets, round', 'spent': 'A hole through the ticket', 'depth': 'Enamel plate and ticket card rasters; flat'}
    card_word = 'Edmondson tickets'
    scenes = {'platform': 'station-s-platform', 'counter': 'station-s-counter'}
    moments = {'twin': 'platform', 'rule': 'counter', 'jobs': 'counter', 'checks': 'counter', 'team': 'platform', 'sort': 'counter', 'words': 'platform', 'crowd': 'platform',
               'look': 'platform', 'board': 'counter', 'cover': 'platform', 'cover_hard': 'counter', 'result': 'platform', 'sunday': 'counter', 'change': 'platform', 'month': 'counter',
               'chapter': 'platform'}
    art_cls = 'print'
    face_prefix = 'enamel'
    plates = {'default': ('Nashik', 'नाशिक'), 'rule': ('Howrah', 'हावड़ा'), 'jobs': ('Howrah', 'हावड़ा'), 'checks': ('Kolkata', 'कोलकाता'), 'team': ('Churchgate', 'चर्चगेट'),
              'sort': ('Pune', 'पुणे'), 'words': ('Pune', 'पुणे'), 'sunday': ('Platform 3', 'प्लेटफ़ॉर्म 3'), 'board': ('Departures', 'प्रस्थान'), 'chapter': None}
    take_plate = ('Manmad', 'मनमाड')   # chapter 1's junction, 1971, named on its title card's board
    places = ('Nashik', 'Howrah', 'Kolkata', 'Churchgate', 'Pune', 'Platform 3', 'Manmad')
    next_line = ('Next train tomorrow', 'अगली गाड़ी कल')
    # the railway story (O15, said yes 22 Oct 2026): loco pilots for the night train to Nashik. Drafts for the owner and a
    # native Hindi speaker; listed in knowledge/content/world-voices.md
    stat_keys = {'st-line': (None, ('years', 'साल'), ('years on the line', 'लाइन पर साल')),
                 'st-signal': (None,
                               ('missed', 'चूके'), ('signals missed', 'चूके सिग्नल'))}
    twin = {'q': ('Who drives to Nashik tonight?', 'रात की नाशिक गाड़ी पर किसे भेजें?'),
            'speaker': ('anita', 'Gurpreet, station master', 'गुरप्रीत, स्टेशन मास्टर'), 'keys': ['st-line', 'st-signal'],
            'people': [('kamla', [('st-line', '12'), ('st-signal', '0')], ('Stubborn at every red signal.', 'हर लाल सिग्नल पर ज़िद्दी।')),
                       ('vikram', [('st-line', '26'), ('st-signal', '2')], ('Old hand, slow with new engines.', 'पुराने उस्ताद, नए इंजन पर धीमे।')),
                       ('raju', [('st-line', '12'), ('st-signal', '0')], ('Firm at every red signal.', 'हर लाल सिग्नल पर सख़्त।')),
                       ('meena', [('st-line', '3'), ('st-signal', '0')], ('New on the line, very keen.', 'लाइन पर नई, बड़ी लगन वाली।'))],
            'pair': (0, 2), 'words': ('Stubborn', 'Firm'),
            'swapped': (('Firm at every red signal.', 'हर लाल सिग्नल पर सख़्त।'), ('Stubborn at every red signal.', 'हर लाल सिग्नल पर ज़िद्दी।'))}
    cover_line = ('Last train out before the rain.', 'बारिश से पहले की आख़िरी गाड़ी।')
    hard_line = ('Today, at a railway police post.', 'आज, रेलवे पुलिस चौकी पर।')
    roads = {'friends': ('Itarsi Ki Chai', 'Manmad Ki Patri', 'Kalyan Ki Seeti', 'Jhansi Ka Platform'),
             'top': ('Hari Batti', 'Pehli Seeti', 'Raat Ki Rail'),
             'near': ('Manmad Ki Patri', 'Wardha Ka Kanta', 'Kalyan Ki Seeti', 'Jhansi Ka Platform', 'Katni Ki Lalten')}
    share_label = ('Train 214', 'गाड़ी 214')
    check_glyph = 'ticket'
    sort = (('Pin this on the notice board?', 'क्या यह सूचना-पट पर लगे?'), ('Gurpreet laughs too loud at the counter.', 'गुरप्रीत काउंटर पर बहुत ज़ोर से हँसती है।'), ('Pin', 'लगाएँ'))
    words = [('brave', 'बहादुर'), ('reckless', 'लापरवाह'), ('strange', 'अजीब'), ('None of these', 'इनमें से कोई नहीं')]
    signature = 'figures arrive on split-flap tiles.'
    notes = {'hero': 'The same day, the same places', 'twin.pick': 'The same skeleton to the pixel.', 'twin.commit': '260 ms: the button stays down, the others dim and lock.',
             'rule': 'Same parts in Station dress.', 'jobs': 'Jobs are berths on the reservation chart.',
             'checks': 'Spent checks are holes through the ticket.', 'team': 'Departure rows with flap numbers.', 'sort': 'The notice board stack.',
             'words': 'A luggage tag with one blank.', 'crowd': 'Ten stops on the route map.',
             'result': 'The ticket stamped; the score on flap tiles.', 'sunday': 'The PNR slip: punched when played.', 'look': 'Same parts.',
             'board.friends': 'Departures.', 'board.everyone': 'Same rows on flap tiles.', 'board.toast': 'Undo stays at least 5 s, above the tabs.',
             'sheet.help': 'Enamel white with the cobalt band.', 'sheet.about': 'The one place with the small credit.',
             'sheet.settings': 'The same switches in enamel. On is the knob moved right with a tick, never colour alone.',
             'hi.step': 'Same places, same sizes.', 'hi.cover': 'The board already carries both scripts.', 'big.step': 'Same rule.',
             'resp.step': 'The platform fills the screen; the tickets sit over the far end of it.',
             'resp.cover': 'The platform at full width; the enamel board and Play on the open side.',
             'resp.result': 'The stamped ticket and the score on flap tiles over the platform.',
             'resp.board': 'Friends and Everyone side by side over the platform; the switch is only needed on narrow screens.',
             'resp.tablet': 'The platform behind; tickets gathered low.'}
    shows = {'twin': [('twin', {'sel': 'raju'}, '{w}, picked', 'twin.pick'), ('twin', {'sel': 'raju', 'committing': True}, '{w}, committing', 'twin.commit')],
             'assign': [('rule', {}, '{w}, rule', 'rule'), ('jobs', {}, '{w}, the chart', 'jobs')],
             'board_more': [('toast', {}, 'Friend added', 'board.toast')],
             'sheet_info': [('sheet', {'layer': 3}, 'About', 'sheet.about')],
             'small_more': [('result', {'cls': 'is-small'}, '360 x 640, {w} result', 'small.result')]}

    def serial(self, i):
        return f'0{2140 + i}'

    def cover_top(self, hard, line, level, nxt, kept):
        board, sub = ((('कोलकाता', 'Kolkata'), ('Platform 5 · Thursday', 'प्लेटफ़ॉर्म 5 · गुरुवार')) if hard else
                      (('नाशिक', 'Nashik'), ('Platform 3 · Wednesday', 'प्लेटफ़ॉर्म 3 · बुधवार')))
        return (kept + '<div class="coverstack"><div class="nameboard"><span class="bn" lang="hi">' + board[0] + '</span><h1 class="bs">' + board[1] + '</h1>' + tx('span', sub[0], sub[1], 'bm') + '</div>'
                '<div class="plate hug"><div class="pg-row">' + tx('span', 'Train', 'गाड़ी', 'level') + '<span class="vh">214</span>' + flaps('214') + '</div>' +
                ('' if nxt or not line else tx('p', line[0], line[1], 'coverline')) + tx('span', level[0], level[1], 'level') + nxt + '</div></div>')

    chapter = {'n': 1, 'area': ('Work', 'काम'), 'year': '1971',
               'line': ('The new engines, and complaints of bullying in the shed.', 'नए इंजन, और शेड में बदसलूकी की शिकायतें।')}

    def chapter_top(self, b):
        # the enamel board names the chapter's junction, as the cover's names Nashik; the ticket below holds the chapter
        return ('<div class="coverstack"><div class="nameboard"><span class="bn" lang="hi">मनमाड</span><span class="bs">Manmad</span>'
                + tx('span', 'Junction', 'जंक्शन', 'bm') + '</div><div class="plate hug chapplate">' + b['marks'] + tx('span', *b['of'], 'level')
                + tx('h1', *b['area'], 'chap-h') + tx('p', *b['line'], 'coverline') + tx('span', *b['when'], 'level') + '</div></div>')

    def app_meta(self, kind, line=None, level=None):
        if kind == 'step':
            return '<div class="push"></div>' + board_big() + train_plate()
        return '<div class="coverstack">' + board_big(h1=True) + train_plate(tx('p', line[0], line[1], 'coverline') + tx('span', level[0], level[1], 'level')) + '</div>'

    def jobs_obj(self, states):
        return ('<div class="chart"><div class="chead" aria-hidden="true"><span>No. 12810</span><span>A1</span></div>' +
                ''.join(f'<div class="berth">{tx("b", j[0], j[1])}{slot("", st, who, self.id, label=(j[0] + ", " + (NM[who][0] if who else "empty")))}</div>' for j, (st, who) in zip(JOBS, states)) + '</div>')

    def checks(self, p_eq, p_other):
        w = self.id
        rws = (row(w, 'anita', stats(p_eq), holes=2, serial='02160', role=None, label=spoken('anita', p_eq, ', checked twice', ', दो बार जाँचा'))
               + row(w, 'raju', stats(p_eq), serial='02161', role=None, label=spoken('raju', p_eq))
               + row(w, 'pammi', stats(p_other), serial='02162', role=None, label=spoken('pammi', p_other)))
        pool = f'<div class="pool plate" role="img"{al("1 check left", "1 जाँच बाकी")}>{ic("ticket", fill=True)}<span class="spent">{ic("ticket")}</span><span class="spent">{ic("ticket")}</span></div>'
        return rws, pool

    def team_side(self, v):
        return flaps(v)

    def letter_obj(self):
        return (f'<div class="tag"><p class="letter"{NOCOUNT}>{tx("span", "“Kiran is the loco pilot on the night train. Passengers call her", "“किरण रात की गाड़ी की लोको पायलट है। यात्री उसे")} '
                f'<span class="blank" role="img"{al("blank", "ख़ाली जगह")}>&nbsp;</span>{tx("span", ".”", "कहते हैं।”")}</p>' + byline(self.id, 'salim', 'Francis, guard', 'फ़्रांसिस, गार्ड') + '</div>')

    def crowd_obj(self, qid):
        stops = ''.join(f'<button class="stop" type="button" role="radio" aria-checked="false"><i>{ic("tick")}</i>{v}%</button>' for v in range(10, 101, 10))
        return f'<div class="route-map" role="radiogroup" aria-labelledby="{qid}">{stops}</div>'

    def result_parts(self, score, figs_, week, line, end=' at-end'):
        tk = (f'<div class="bigticket" aria-hidden="true"><span class="fine">{tx("span", "No.", "क्र.")} 02142</span><div class="route">{tx("span", "Nashik", "नाशिक")}</div>'
              f'<span class="fine">{tx("span", "Loco pilot Sunil", "लोको पायलट सुनील")}</span><span class="ticket-stamp">{tx("span", "Arrived", "पहुँची")}</span></div>')
        return tk, (f'<div class="plate{end}">{tx("span", "Score", "स्कोर", "level")}<h1 class="score"><span class="vh">Score {score}</span><span class="flaphouse">{flaps(score)}</span></h1>{figs_}'
                    f'{week}{tx("p", line[0], line[1], "coverline")}</div>')

    def dayobj(self, state, key, letter, stamp):
        return f'<span class="dayobj is-ticket {state}">{stamp}{letter}</span>'

    def week_obj(self, view, days):
        holes = '<div class="holes" aria-hidden="true">' + '<i></i>' * 14 + '</div>'
        if view == 'day1':
            return f'<div class="slip on-paper lockpage">{holes}{days}</div>'
        figs_ = (f'<div class="figs c2"><div class="fig">{tx("span", "Practice", "अभ्यास")}<span class="flaphouse sm">{flaps("41")}</span></div>'
                 f'<div class="fig">{tx("span", "Lean", "झुकाव")}<span class="flaphouse sm">{flaps("12")}</span></div></div>') if view == 'sunday' else ''
        return f'<div class="slip on-paper">{holes}<span class="serial" aria-hidden="true">PNR 214 3108</span>{days}{figs_}</div>'

    def month_obj(self, lean):
        return (f'<div class="bigticket" style="padding-bottom:16px"><span class="fine" aria-hidden="true">{tx("span", "Monthly season ticket", "मासिक सीज़न टिकट")} · No. 0218</span>'
                f'<div class="route">{tx("span", "October", "अक्टूबर")}</div>'
                f'<div style="height:10px"></div>{lean}</div>')

    def rank(self, r):
        return flaps(r.replace(',', '')[-4:])

    def board_list(self, rows):
        return f'<div class="departures"><ol class="list">{rows}</ol></div>'

    def board_panels(self, friends, everyone):
        fr = f'<div class="departures"><div class="dephead">{tx("span", "Friends", "दोस्त")}</div><ol class="list">{friends}</ol></div>'
        ev = f'<div class="departures board-everyone"><div class="dephead">{tx("span", "Everyone · Top 9%", "सब · टॉप 9%")}</div><ol class="list">{everyone}</ol></div>'
        return fr, ev

    def share_card(self):
        return (f'<div class="sharecard world {self.cls}"><div class="bigticket">{tx("span", *self.share_label, "fine")}<div class="route">{self.road_you}</div>'
                f'<span class="sc-marks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>{tx("span", "Day 6", "दिन 6", "fine")}</div></div>')

    def objects(self):
        w = self.id
        return [('Enamel name board', '<div class="nameboard"><span class="bn" lang="hi">नाशिक</span><span class="bs">Nashik</span><span class="bm">Platform 3 · Wednesday</span></div>',
                 'The enamel plate raster (chipped edges, bolts, gloss) with live type on top: Hindi, English, then the platform line.', 'plate-enamel.webp; enamel white on cobalt; Hind 700 36', 'cover board; top-bar plate (one line)', 'English name is the cover h1; the Hindi line is lang-marked.'),
                ('Edmondson ticket (person card)', '<div style="width:180px">' + tile(w, *self.twin_pair()[0], serial=self.serial(self.twin['pair'][0])) + '</div>',
                 'Card stock with a printed blue band across the top, a serial beside the name, the portrait, numbers and the line.', 'plate-ticket.webp; ink; radius 4', 'rest, pressed, selected, held, focus, committing, revisited', 'One stop: name and numbers spoken, the line as its description.'),
                ('Punched ticket row (checks)', row(w, 'anita', stats([('ledger', '9'), ('pause', '2')]), holes=2, serial='02160', role=None, label=('Gurpreet, checked twice', 'गुरप्रीत, दो बार जाँचा')),
                 'A wide ticket; each spent check is a hole through the card at the right edge.', 'plate-ticket.webp; holes by mask', '0, 1 or 2 holes', 'The count is spoken: "checked twice".'),
                ('Split-flap row', '<div class="departures"><ol class="list">' + lrows(w, road_rows(w, 'near')[1:4]) + '</ol></div>',
                 'Flap tiles with the seam behind the numeral, a road name and practice.', 'flap, flap-hi, seam, enamel; Hind 700', 'rest, pressed, you; flips are instant under reduced motion', 'One stop per row; rank, name and practice in one name.'),
                ('PNR slip (Sunday)', '<div class="slip on-paper"><div class="holes" aria-hidden="true">' + '<i></i>' * 14 + '</div>' + dayobjs(w) + '</div>',
                 'Ticket paper with perforation holes, six day tickets: punched when played, stamped "off" when forgiven.', 'paper, ground for holes, accent stamp', 'played, off, not played', 'The strip is one image with a spoken summary; PNR digits are decoration.'),
                ('Reservation chart (assign)', self.jobs_obj(JOB_STATES),
                 'A header strip, then one berth per job with its slot; ruled like chart paper.', 'enamel, accent rules; radius 4', 'slot: empty, target, filled, refused, revisited', 'Each slot is named "Job, person" or "Job, empty".'),
                ('Luggage tag (words)', self.letter_obj(),
                 'A tag with a clipped corner and an eyelet; the sentence with one blank; the speaker under it.', 'paper, ink, accent eyelet', 'blank: empty, filled', 'The blank is named "blank".'),
                ('Route map (crowd guess)', self.crowd_obj('objq'),
                 'Ten stops on a blue line; each stop is one guess.', 'enamel, accent line, pick yellow when chosen', 'rest, picked', 'A radio group named by the question.')]

    def choices(self):
        w = self.id
        return [(10, lambda: ab_item('Station board colour', 'Yellow now means only your pick. Real station boards are often yellow; both are drawn from the same enamel plate.',
                    [('A', 'Blue enamel', frame(w, '<div class="nameboard"><span class="bn" lang="hi">नाशिक</span><span class="bs">Nashik</span><span class="bm">Platform 3</span></div>'), True),
                     ('B', 'Classic yellow', frame(w, '<div class="nameboard is-yellow"><span class="bn" lang="hi">नाशिक</span><span class="bs">Nashik</span><span class="bm">Platform 3</span></div>'), False)])),
                (11, lambda: ab_item('A third script on Station boards', 'Real boards carry the local script too. You chose to show only the language picked.',
                    [('A', 'English and Hindi', frame(w, '<div class="nameboard"><span class="bn" lang="hi">अहमदाबाद</span><span class="bs">Ahmedabad</span></div>'), True),
                     ('B', 'City script as part of the picture', frame(w, '<div class="nameboard"><span class="bn" lang="gu">અમદાવાદ</span><span class="bs" lang="hi">अहमदाबाद</span><span class="bs">Ahmedabad</span></div>'), False)])),
                (15, lambda: ab_item('Station plates: always a station', 'Every Station plate is a real station name; the day\'s theme lives in the question and the voice.',
                    [('A', 'Station names (Kolkata, Churchgate)', frame(w, topbar('step', ('Kolkata', 'कोलकाता')), 'flush'), True), ('B', 'Themes (Chit Fund, Night Match)', frame(w, topbar('step', ('Chit Fund', 'चिट फ़ंड')), 'flush'), False)]))]

    def signature_demo(self):
        return frame(self.id, '<div class="pg-row"><span class="js-flap flaphouse">' + flaps("86") + '</span><button class="textbtn" type="button" data-flap>Flip</button></div>')


# What each library section draws for a world: kind -> [(screen, kwargs, title, note key)]. '{w}' in a title is the
# world's name; the note is the world's notes[note key]. A world replaces any kind through its own shows.
SHOWS = {
    'twin': [('twin', {}, '{w}, not ready', 'twin.wait'), ('twin', {'sel': 'kamla'}, '{w}, picked', 'twin.pick')],
    'assign': [('rule', {}, '{w}, rule', 'rule'), ('jobs', {}, '{w}, jobs', 'jobs')],
    'checks': [('checks', {}, '{w}', 'checks')], 'team': [('team', {}, '{w}', 'team')], 'sort': [('sort', {}, '{w}', 'sort')],
    'words': [('words', {}, '{w}', 'words')], 'crowd': [('crowd', {}, '{w}', 'crowd')],
    'result': [('result', {}, '{w} result', 'result')], 'sunday': [('sunday', {}, '{w} Sunday, the week', 'sunday')],
    'look': [('look', {}, '{w} Sunday, look again', 'look')],
    'board': [('board', {}, '{w} Board, Friends', 'board.friends'), ('board', {'view': 'everyone'}, '{w} Board, Everyone', 'board.everyone')],
    'board_more': [('board', {'menu': True}, '{w}, row menu', 'board.menu'), ('toast', {}, '{w}, friend added', 'board.toast')],
    'sheet_help': [('sheet', {'layer': 1}, '"?" sheet, {w}', 'sheet.help'), ('sheet', {'layer': 5}, '"?" sheet with eight languages, {w}', 'sheet.more')],
    'sheet_info': [('sheet', {'layer': 2}, 'Your numbers, {w}', 'sheet.numbers'), ('sheet', {'layer': 3}, 'About, {w}', 'sheet.about')],
    'sheet_settings': [('sheet', {'layer': 4}, 'Settings, {w}', 'sheet.settings')],
    'hi_step': [('twin', {'lang': 'hi'}, 'Hindi, {w} step', 'hi.step')], 'hi_cover': [('cover', {'lang': 'hi'}, 'Hindi, {w} cover', 'hi.cover')],
    'big_step': [('twin', {'cls': 'is-200'}, '200%, {w} step', 'big.step')], 'big_cover': [('cover', {'cls': 'is-200'}, '200%, {w} cover', 'big.cover')],
    'big_result': [('result', {'cls': 'is-200'}, '200%, {w} result', 'big.result')], 'big_sunday': [('sunday', {'cls': 'is-200'}, '200%, {w} Sunday', 'big.sunday')],
    'big_board': [('board', {'view': 'everyone', 'cls': 'is-200'}, '200%, {w} board', 'big.board')],
    'small_step': [('twin', {'cls': 'is-small'}, '360 x 640, {w} step', 'small.step')],
    'small_more': [('cover', {'cls': 'is-small'}, '360 x 640, {w} cover', 'small.cover'), ('result', {'cls': 'is-small'}, '360 x 640, {w} result', 'small.result')],
}
SCREENS = {'twin': step_twin, 'rule': step_rule, 'jobs': step_jobs, 'checks': step_checks, 'team': step_team, 'sort': step_sort, 'words': step_words,
           'crowd': step_crowd, 'cover': cover, 'chapter': chapter_card, 'result': result, 'sunday': sunday_week, 'look': sunday_look, 'board': board, 'toast': board_toast, 'sheet': sheet_phone}

WORLDS = {}

def story_faults(w):
    """The content rules a world's story must keep, as a list of what is broken (empty when it holds)."""
    t, r, bad = w.twin, w.roads, []
    ppl = t['people']
    who = [p[0] for p in ppl]
    pairs = [tuple(p[1]) for p in ppl]
    if not 3 <= len(ppl) <= 5:
        bad.append('3 to 5 people')
    if len(set(who)) != len(who) or any(x not in NM for x in who + [t['speaker'][0]]):
        bad.append('people from the eight, each once')
    if t['speaker'][0] in who:
        bad.append('a speaker who is not on the cards')
    if any(k not in KEY for k in t['keys']) or any([k for k, v in p] != list(t['keys']) for p in pairs):
        bad.append('every number under a known key, in the key order')
    a, b = t['pair']
    if a == b or pairs[a] != pairs[b] or pairs.count(pairs[a]) != 2 or len(set(pairs)) != len(pairs) - 1:
        bad.append('one hidden pair whose numbers match exactly, every other record different')
    (la, ha), (lb, hb) = ppl[a][2], ppl[b][2]
    w0, w1 = t['words']
    if la.replace(w0, w1, 1) != lb or t['swapped'][0][0] != lb or t['swapped'][1][0] != la:
        bad.append('the pair\'s lines differing by the one loaded word, and the swapped lines matching them')
    texts = [t['q'], t['speaker'][1:], w.cover_line, w.hard_line, w.next_line] + [p[2] for p in ppl] + list(t['swapped'])
    if any(not en or not hi for en, hi in texts):
        bad.append('every string in English and Hindi')
    if (len(r['friends']), len(r['top']), len(r['near'])) != (4, 3, 5) or (r['near'][0], r['near'][2], r['near'][3]) != tuple(r['friends'][1:]):
        bad.append('4 friends, 3 at the top and 5 near you, the friends near you named alike')
    return bad

def register(w):
    w = w() if isinstance(w, type) else w
    if not isinstance(w, World):
        raise SystemExit(f'{w!r} is not a World: subclass lib.World')
    need = [k for k in ('id', 'name', 'palette', 'scenes', 'moments', 'face_prefix', 'plates') if not getattr(w, k)]
    if need or 'default' not in w.plates:
        raise SystemExit(f'world {w.id or "?"} is missing: {", ".join(need) or "plates[default]"}')
    lost = [m for m in MOMENTS if (w.moments.get(m) or w.moments.get('default')) not in w.scenes]
    if lost:
        raise SystemExit(f'world {w.id}: these moments name no scene in scenes: {", ".join(lost)}')
    for k, (icon, label, said) in w.stat_keys.items():
        if icon:
            IC.setdefault(k, icon)
        KEY.setdefault(k, (label[0], label[1], said[0], said[1]))
    broken = story_faults(w)
    if broken:
        raise SystemExit(f'world {w.id}: its story breaks the content rules: {"; ".join(broken)}')
    WORLDS[w.id] = w
    PLACES.update(w.places)
    return w

register(Lugdi())
register(Station())

# Optional world modules: worlds/<id>.py defining WORLD (a World subclass or instance), appended in this order,
# then any other module by name. Each module gets one global, lib: this file. A missing module is simply absent.
EXTRA_WORLDS = ('jadugar', 'cricket', 'rukavat')
WORLD_DIR = Path(__file__).parent / 'worlds'

def load_worlds():
    found = sorted(p.stem for p in WORLD_DIR.glob('*.py') if not p.stem.startswith('_')) if WORLD_DIR.is_dir() else []
    sys.dont_write_bytecode = True
    for wid in [w for w in EXTRA_WORLDS if w in found] + [w for w in found if w not in EXTRA_WORLDS]:
        spec = importlib.util.spec_from_file_location(f'world_{wid}', WORLD_DIR / f'{wid}.py')
        mod = importlib.util.module_from_spec(spec)
        mod.lib = sys.modules[__name__]
        spec.loader.exec_module(mod)
        w = getattr(mod, 'WORLD', None)
        if w is None:
            print(f'worlds/{wid}.py defines no WORLD; left out')
            continue
        w = w() if isinstance(w, type) else w
        if getattr(w, 'id', None) != wid:
            raise SystemExit(f'worlds/{wid}.py registers the id {getattr(w, "id", None)!r}; it must be {wid!r}')
        w.module = f'worlds/{wid}.py'
        register(w)

load_worlds()

# LIB_WORLDS picks the worlds the sections draw, in its order; WA and WB are the pair the story sections are told in.
_want = [s.strip() for s in os.environ.get('LIB_WORLDS', '').split(',') if s.strip()]
for _w in _want:
    if _w not in WORLDS:
        print(f'LIB_WORLDS: no world {_w!r} is registered; left out')
SEL = [WORLDS[w] for w in dict.fromkeys(_want) if w in WORLDS] or list(WORLDS.values())
WA = SEL[0]
WB = SEL[1] if len(SEL) > 1 else SEL[0]
OUT = os.environ.get('LIB_OUT', '').strip() or 'index'
NUM = {1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven', 12: 'twelve'}
ALLW = {1: 'one world', 2: 'both worlds'}.get(len(SEL), f'all {NUM.get(len(SEL), len(SEL))} worlds')

def each(fn):
    return ''.join(fn(W.id) for W in SEL)

TOK = [('pick', '#FFD23F', 'Only your pick and its live confirm'), ('pick-ink', '#17110F', 'Text on yellow, 12.9:1')] + [t for W in SEL for t in W.palette]
swatches = ''.join(f'<div class="sw"><i style="background:{h}"></i><div><b>{n}</b>{h}<br>{u}</div></div>' for n, h, u in TOK)
TYPE = [(f'Display, {W.title}',) + tuple(W.type_row) for W in SEL if W.type_row] + [
        ('Score', 'ts-score', '86', '86', 'Hind 700, 36, tabular, one per result. Hindi 1.4'),
        ('Headline', 'ts-headline', *WA.twin['q'], 'Hind 700, 24: the question and compared numbers. Hindi 1.6'),
        ('Title', 'ts-title', named(WA.id, 'Send Kamla'), named(WA.id, 'कमला को भेजें'), 'Hind 700, 16: names, buttons, plates. Hindi 1.7'),
        ('Body', 'ts-body', *(f'“{s}”' for s in WA.twin_pair()[1][2]), 'Hind 500, 16: lines people say. Hindi 1.7'),
        ('Label', 'ts-label', *(' · '.join(KEY[k][i] for k in WA.twin['keys']) for i in (0, 1)), 'Hind 700, 14: keys, plates, tabs. Hindi 1.65')]
type_rows = ''.join(f'<tr><th scope="row">{n}<br><span class="pg-note">{note}</span></th><td class="ts-cell"><div class="{c}">{en}</div><div class="{c}" lang="hi">{hi}</div></td></tr>' for n, c, en, hi, note in TYPE)
SPACE = ''.join(f'<div class="sp-row"><span>{v}</span><i style="width:{v}px"></i></div>' for v in [2, 4, 8, 12, 16, 24, 32, 48])

def fig(ph, title, note):
    return f'<figure class="pg-fig">{ph}<figcaption class="pg-cap"><b>{title}</b><span>{note}</span></figcaption></figure>'

def grid(items):
    return '<div class="pg-grid">' + ''.join(fig(p, t, n) for p, t, n in items) + '</div>'

def shown(*kinds):
    """Every selected world's entries for each kind in turn: kind by kind, world by world."""
    return [entry for k in kinds for W in SEL for entry in W.show(k)]

MECH = [(t, shown(k)) for t, k in [('Twin pick', 'twin'), ('Assign: pick a rule, then fill the jobs', 'assign'), ('Checks', 'checks'), ('Team', 'team'),
                                  ('Quick sort', 'sort'), ('Words', 'words'), ('Crowd guess', 'crowd')]]
ENDS = shown('result', 'sunday', 'look', 'board', 'board_more')
COVERS = []
for W in SEL:
    w, T = W.id, W.title
    COVERS += [(cover(w), f'{T} cover', 'The home. Play.'), (cover(w, 'continue'), f'{T}, mid-puzzle', 'Continue.'), (cover(w, 'done'), f'{T}, after today', 'See your score; when the next one comes, with no countdown.'),
               (cover(w, first=True), f'{T}, first visit', 'No streak until the first result says "Day 1".'), (cover(w, hard=True), f'{T}, a hard day', 'The cover names the setting plainly before Play.'),
               (cover(w, kept=True), f'{T}, a forgiven day', 'Said in place under the day count, until Play.'), (cover(w, loading=True), f'{T}, loading', 'The ground and the title first; the painting follows.'),
               (cover(w, dialog=True), f'{T}, the one dialog', 'Only for deleting everything.'),
               (birth_phone(w, 'filled'), f'{T}, first visit: the birth date', 'Three number fields; the date in words under them, so a slip in the year shows. It stays on the phone.'),
               (birth_phone(w, 'error'), f'{T}, the birth date: not a real date', 'One line in place, the digits kept.'),
               (notyet_phone(w), f'{T}, not yet 18', 'The day count, worked out on the phone; "Wrong date?" once.'),
               (chapter_card(w), f'{T}, First take chapter title card', "The chapter's place as five marks, the area, its setting and the year; Start.")]
SHEETS = shown('sheet_help', 'sheet_info', 'sheet_settings')
SHEETS += [(privacy_phone(SEL[0].id, lv), t, n) for lv, t, n in (
    ('link', 'The "?" sheet with Privacy', 'Option C keeps its three parts and gains one link.'),
    ('privacy', 'Privacy', 'What stays on this phone, what is sent (nothing yet) and what is kept nowhere; Delete all.'),
    ('dialog', 'Delete all, asked once', 'The one dialog, in F-112\'s words.'),
    ('deleted', 'After Delete all', 'One line; installed, how to take the icon off the home screen. Then the birth date again.'))]
ACCESS = shown('hi_step', 'hi_cover', 'big_step', 'big_cover', 'big_result', 'big_sunday', 'big_board', 'small_step', 'small_more')

# ---------- the report over time ----------
def week_day1(world):
    W = WORLDS[world]
    first = W.dayobj('played', W.moment('cover'), tx('b', 'M', 'सो'), '')
    rest = ''.join(W.dayobj('notplayed', None, tx('b', d, dh), '') for d, dh in DAYS[1:6])
    obj = W.week_obj('day1', f'<div class="daygrid" role="img"{al("This week: 1 played", "यह हफ़्ता: 1 खेला")}>{first}<span class="dim" style="display:contents">{rest}</span></div>')
    note = tx('p', 'Your first week shows here on Sunday.', 'आपका पहला हफ़्ता रविवार को यहाँ दिखेगा।', 'nextline')
    inner = topbar('root', W.plate('sunday')) + body(h1q('Your week', 'आपका हफ़्ता'), obj, note) + tabbar('week')
    art, ac = W.art('sunday')
    return phone(world, inner, f'{W.title} Week tab, day 1', '', art, ac)

def sunday_report(world, weeks=None, line=None, cls='', h1=('Your week', 'आपका हफ़्ता')):
    W = WORLDS[world]
    share = '' if weeks else f'<button class="textbtn" type="button">{ic("share")}{tx("span", "Share", "शेयर करें")}</button>'
    obj = W.week_obj('weeks' if weeks else 'report', dayobjs(world))
    plate = W.plate('sunday')
    art, ac = W.art('sunday')
    lr = ''
    if weeks:
        stubs = ''.join(f'<span class="wk {c}"><span>{i + 1}</span><b>{v}</b></span>' for i, (v, c) in enumerate(weeks))
        en = 'Lean by week, of 100: ' + ', '.join(v for v, c in weeks)
        lr = (f'<div class="plate hug">{tx("span", "Lean, of 100", "झुकाव, 100 में से", "level")}<div class="leanrow" role="img"{al(en, en)}>{stubs}</div>' +
              (tx('p', line[0], line[1], 'coverline') if line else '') + '</div>')
    inner = topbar('root', plate) + body(h1q(*h1), obj, lr, share) + dock(out_btn('Look again', 'दोबारा देखें')) + tabbar('week')
    return phone(world, inner, f'{W.title} Sunday report', cls, art, ac)

def storytop(n, i):
    bars = ''.join(f'<i class="{"on" if k <= i else ""}"></i>' for k in range(n))
    return (f'<div class="topbar"><span class="spacer"></span><div class="storybar" style="flex:1" role="img"{al(f"Card {i + 1} of {n}", f"कार्ड {i + 1}, {n} में से")}>{bars}</div>'
            f'<button class="ibtn" type="button"{al("Close", "बंद करें")}>{ic("close")}</button></div>')

def month_card(world, i):
    W = WORLDS[world]
    weeks = [('12', 'is-base'), ('10', 'is-base'), ('9', ''), ('8', 'is-now')]
    if i == 0:
        stubs = ''.join(f'<span class="wk {c}">{tx("span", "Week " + str(k + 1), "हफ़्ता " + str(k + 1))}<b>{v}</b></span>' for k, (v, c) in enumerate(weeks))
        obj = W.month_obj(f'<div class="leanrow" role="img"{al("Lean by week, of 100: 12, 10, 9, 8", "झुकाव, हर हफ़्ता: 12, 10, 9, 8")}>{stubs}</div>')
        body_ = body(h1q('Your month', 'आपका महीना'), obj, f'<div class="plate hug">{tx("p", "Lower for 2 weeks. A change needs 3.", "2 हफ़्ते कम रहा। बदलाव को 3 चाहिए।", "bigline")}</div>', cls='')
        btn = out_btn('Next', 'आगे')
    elif i == 1:
        obj = (f'<div class="plate"><p class="bigline">{tx("span", "You played 24 of 28 days.", "आपने 28 में से 24 दिन खेला।")}</p>'
               f'<div class="figs c2"><div class="fig">{tx("span", "Practice", "अभ्यास")}<b>162</b></div><div class="fig">{tx("span", "Best streak", "सबसे लंबी स्ट्रीक")}<b>12</b></div></div></div>')
        body_ = body(h1q('Your month', 'आपका महीना'), obj, cls='')
        btn = out_btn('Next', 'आगे')
    else:
        qid = uid('h')
        chips = ''.join(chip(en, hi) for en, hi in [('Words', 'शब्द'), ('Checks', 'जाँच'), ('Picks', 'किसे भेजा'), ('Not sure', 'पता नहीं')])
        body_ = body(h1q('What did you notice?', 'आपने क्या देखा?', qid), f'<div class="chips is-stack at-end" role="radiogroup" aria-labelledby="{qid}">{chips}</div>',
                     f'<button class="textbtn" type="button">{ic("pencil")}{tx("span", "Write a note", "नोट लिखें")}</button>', cls='')
        btn = main('Done', 'हो गया', 'Done', 'हो गया', 'is-wait')
    inner = storytop(3, i) + body_ + dock(btn)
    art, ac = W.art('month')
    return phone(world, inner, f'{W.title} month recap, card {i + 1}', 'js-chips' if i == 2 else '', art, ac)

def change_card(world, i, higher=False):
    W = WORLDS[world]
    art, ac = W.art('change')
    if i == 0:
        weeks = [('12', 'is-base'), ('10', 'is-base'), ('16', ''), ('15', ''), ('17', 'is-now')] if higher else [('12', 'is-base'), ('10', 'is-base'), ('7', ''), ('6', ''), ('6', 'is-now')]
        stubs = ''.join(f'<span class="wk {c}">{tx("span", "Wk " + str(k + 1), "ह " + str(k + 1))}<b>{v}</b></span>' for k, (v, c) in enumerate(weeks))
        line = ('Your lean has stayed higher for 3 weeks.', 'आपका झुकाव 3 हफ़्ते से ज़्यादा रहा है।') if higher else ('Your lean has stayed lower for 3 weeks.', 'आपका झुकाव 3 हफ़्ते से कम रहा है।')
        stamp = f'<div class="changestamp" role="img"{al("3 weeks", "3 हफ़्ते")}><span aria-hidden="true"><b>3</b>{tx("span", "weeks running", "हफ़्ते लगातार")}</span></div>'
        en = 'Lean by week, of 100: ' + ', '.join(v for v, c in weeks)
        body_ = body(stamp, f'<div class="plate">{tx("h1", line[0], line[1], "bigline")}{tx("span", "Lean, of 100", "झुकाव, 100 में से", "level")}<div class="leanrow" role="img"{al(en, en)}>{stubs}</div></div>', cls='is-cover')
        btn = out_btn('Next', 'आगे')
    elif i == 1:
        if higher:
            txt = (('Harder puzzles can do this.', 'कठिन पहेलियाँ ऐसा कर सकती हैं।'), ('Look again on Sunday. No one else sees this.', 'रविवार को फिर से देखें। यह कोई और नहीं देखता।'))
            lvl = ''
        else:
            txt = (('Puzzles get harder from Monday.', 'सोमवार से पहेलियाँ कठिन होंगी।'), ('Harder puzzles may raise your lean again. That is normal.', 'कठिन पहेलियों से झुकाव फिर बढ़ सकता है। यह सामान्य है।'))
            lvl = f'<span class="levelup">{tx("span", "Level 4 of 16", "लेवल 4/16", "level")}</span>'
        body_ = body(f'<div class="plate at-end">{tx("h1", txt[0][0], txt[0][1], "bigline")}{lvl}{tx("p", txt[1][0], txt[1][1], "coverline")}</div>', cls='is-cover')
        btn = out_btn('Next', 'आगे')
    elif i == 2:
        qid = uid('h')
        chips = ''.join(chip(en, hi) for en, hi in [('Slowing down', 'धीरे सोचना'), ('Checking records', 'रिकॉर्ड देखना'), ('Noticing words', 'शब्द देखना'), ('Not sure', 'पता नहीं')])
        body_ = body(h1q('What helped?', 'किससे मदद मिली?', qid), f'<div class="chips is-stack at-end" role="radiogroup" aria-labelledby="{qid}">{chips}</div>',
                     f'<button class="textbtn" type="button">{ic("pencil")}{tx("span", "Write a note", "नोट लिखें")}</button>')
        btn = main('Pick one', 'एक चुनें', 'Save', 'सहेजें', 'is-wait')
    else:
        qid = uid('h')
        chips = ''.join(chip(en, hi) for en, hi in [('Spoke up', 'कुछ कहा'), ('Saw it', 'देखा'), ('Not yet', 'अभी नहीं')])
        body_ = body(h1q('Did this come up?', 'क्या ऐसा कभी हुआ?', qid), f'<div class="chips is-stack at-end" role="radiogroup" aria-labelledby="{qid}">{chips}</div>',
                     tx('p', 'This phone only.', 'सिर्फ़ इस फ़ोन पर।', 'nextline'))
        btn = main('Pick one', 'एक चुनें', 'Done', 'हो गया', 'is-wait')
    n = 2 if higher else 4
    inner = storytop(n, i) + body_ + dock(btn)
    return phone(world, inner, f'{W.title} change, card {i + 1}' + (' (higher)' if higher else ''), 'js-chips' if i >= 2 else '', art, ac)

# ---------- web and PWA ----------
def icon_svg(kind):
    if kind == 'ticket':
        return ('<svg class="appicon" viewBox="0 0 96 96" aria-hidden="true"><rect width="96" height="96" fill="#1B0B2E"/><rect x="14" y="24" width="68" height="48" rx="4" fill="#E9DFC4"/>'
                '<rect x="14" y="24" width="68" height="11" rx="2" fill="#13308F"/><circle cx="14" cy="54" r="6" fill="#1B0B2E"/><circle cx="82" cy="54" r="6" fill="#1B0B2E"/>'
                '<g transform="rotate(-12 50 54)"><circle cx="50" cy="54" r="14" fill="none" stroke="#E4002B" stroke-width="3.5"/><rect x="42" y="47.5" width="16" height="4" fill="#E4002B"/><rect x="42" y="56.5" width="16" height="4" fill="#E4002B"/></g></svg>')
    if kind == 'roundel':
        return ('<svg class="appicon" viewBox="0 0 96 96" aria-hidden="true"><rect width="96" height="96" fill="#1B0B2E"/><circle cx="48" cy="48" r="30" fill="#FFF3DC" stroke="#E4002B" stroke-width="6"/>'
                '<rect x="35" y="38" width="28" height="7" fill="#E4002B"/><rect x="35" y="53" width="28" height="7" fill="#E4002B"/><rect x="33" y="36" width="28" height="7" fill="#17110F"/><rect x="33" y="51" width="28" height="7" fill="#17110F"/></svg>')
    return ('<svg class="appicon" viewBox="0 0 96 96" aria-hidden="true"><polygon points="0,0 96,0 0,96" fill="#1B0B2E"/><polygon points="96,0 96,96 0,96" fill="#13308F"/>'
            '<path d="M96 10 L10 96" stroke="#F4F1E8" stroke-width="3"/><circle cx="48" cy="48" r="15" fill="#EFE7D4" stroke="#17110F" stroke-width="2"/><circle cx="48" cy="48" r="6" fill="#E4002B"/></svg>')

def homescreen(label):
    blanks = '<span class="hi"><span class="blank"></span><span>&nbsp;</span></span>' * 3
    return f'<div class="homescreen" aria-hidden="true">{blanks}<span class="hi">{icon_svg("ticket")}<span>{label}</span></span></div>'

def install_sheet(world, ios=False):
    base = cover(world, 'done')
    hid = uid('ins')
    if ios:
        steps = (f'<div class="howto"><div>{ic("sharei")}{tx("span", "Tap Share", "शेयर दबाएँ")}</div><div>{ic("addsq")}{tx("span", "Add to Home Screen", "होम स्क्रीन पर जोड़ें")}</div><div>{icon_svg("ticket")}{tx("span", "Open from here", "यहीं से खोलें")}</div></div>')
        content = f'{tx("h2", "Put it on your home screen", "इसे होम स्क्रीन पर रखें", "", f" id={hid}")}{steps}<div style="height:12px"></div><button class="textbtn on-paper" type="button">{tx("span", "Not now", "अभी नहीं")}</button>'
    else:
        content = (f'{tx("h2", "Play from your home screen", "होम स्क्रीन से खेलें", "", f" id={hid}")}{tx("p", "It opens offline, like an app.", "यह बिना इंटरनेट भी खुलता है, ऐप की तरह।", "letter")}'
                   f'<div class="installcard"><button class="main is-out" type="button">{ic("install")}{tx("span", "Install", "इंस्टॉल करें")}</button><button class="textbtn on-paper" type="button">{tx("span", "Not now", "अभी नहीं")}</button></div>')
    sh = (f'<div class="scrim" aria-hidden="true"></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="{hid}"><div class="grab"><span class="spacer"></span><button class="handle" type="button"{al("Drag to close", "बंद करने के लिए खींचें")}><i></i></button>'
          f'<button class="close" type="button"{al("Close", "बंद करें")}>{ic("close")}</button></div>{content}</div>')
    return base[:-6] + sh + base[-6:]

def splash_phone(world):
    inner = f'<div class="splash">{icon_svg("ticket")}<span>Retake</span></div>'
    return phone(world, inner, 'Launch screen of the installed app')


# The story sections (install, the report over time, screen sizes, choices) are told in two worlds, WA and WB.
WEB = (
    ''
    + '<h3 class="pg-h3">Installing on a phone (shown once, after the third day)</h3>'
    + '<div class="pg-grid">' + fig(install_sheet(WA.id), 'Android', 'One sheet, once. "Not now" is as plain as Install.') + fig(install_sheet(WB.id, ios=True), 'iPhone', 'iPhone has no install button, so the sheet shows the two taps.') + fig(splash_phone(WA.id), 'Opening the installed app', 'The ground colour and the icon, for a moment.') + '</div>'
    + '<h3 class="pg-h3">App icon and home-screen name</h3>'
    + '<div class="pg-spec"><h4>Icon options (one icon for both worlds)</h4><p class="pg-rule">The icon cannot change weekly, so it carries both worlds. No Equal Lens logo: The Equal Lens stays a small credit in About.</p><div class="pg-row" style="gap:32px">'
    + f'<span class="iconopt">{icon_svg("ticket")}<span>A. The day\'s ticket<span class="rec">default</span></span></span><span class="iconopt">{icon_svg("roundel")}<span>B. The issue roundel</span></span><span class="iconopt">{icon_svg("split")}<span>C. Two worlds, one punch</span></span></div></div>'
    + '<div class="pg-two" style="margin-top:16px"><div class="pg-spec"><h4>The name under the icon</h4><p class="pg-rule">The game is called Retake. Six letters stay whole under the icon on every phone.</p><div class="pg-row" style="gap:24px">'
    + homescreen('Retake') + '</div><p class="pg-note">The same name on the home screen, link previews, share cards and the store. In the stores the title is "Retake: a daily fairness puzzle".</p></div>'
    + '<div class="pg-spec"><h4>Reminder notification (only if the player turns it on)</h4><p class="pg-rule">At most 8 words, names only the day\'s object. On iPhone, reminders work only once the app is installed.</p>'
    + f'<div class="notif">{icon_svg("ticket")}<span><b>Retake</b>Tonight: one seat left at the Tatkal counter</span></div></div></div>'
)
REPORT = (
    '<p class="pg-p">The report never says which way a player leans. Early numbers are pulled towards zero, so day one is never harsh. A change counts only when the lean stays below the first two weeks by more than its normal wobble, three Sundays running. The exact line comes from the research (RSE-164), not from design. It is a change in the game\'s picks, never a claim about the person.</p>'
    + '<h3 class="pg-h3">After 1 game</h3><div class="pg-grid">' + fig(result(WA.id, day1=True), 'Day 1 result', 'Every number shows, with one line, once: they settle over the first week.') + fig(week_day1(WA.id), 'Day 1, the Week tab', 'The week waits for Sunday.') + '</div>'
    + '<h3 class="pg-h3">After 7 games: the first Sunday</h3><div class="pg-grid">' + fig(sunday_report(WA.id), 'Your week', 'Six days, three numbers, Share.') + fig(sunday_look(WA.id), 'Look again', 'The equal pair. Tap what was different.') + '</div>'
    + '<h3 class="pg-h3">After 14 games: the second Sunday</h3><div class="pg-grid">' + fig(sunday_report(WB.id, weeks=[('12', 'is-base'), ('10', 'is-now')], line=('Too early.', 'अभी जल्दी।')), 'Your week, with week by week', 'Two numbers side by side. No arrows, no colours, no verdict.') + '</div>'
    + '<h3 class="pg-h3">After a month: a short recap</h3><div class="pg-grid">' + ''.join(fig(month_card(WB.id, i), t, n) for i, t, n in [(0, 'Your month', 'Lower two weeks running is not yet a change, and it says so.'), (1, 'How you played', 'Days and practice, never a rank.'), (2, 'What you noticed', 'One tap, a note if you want.')]) + '</div>'
    + '<h3 class="pg-h3">When a real change shows</h3><div class="pg-grid">' + ''.join(fig(change_card(WA.id, i), t, n) for i, t, n in [(0, 'Three weeks lower', 'The first two weeks are the baseline.'), (1, 'Then it gets harder', 'No victory lap: harder puzzles, and an honest warning.'), (2, 'What helped?', 'The player names their own strategy.'), (3, 'In life', 'Private and optional. Never scored, never shared.')]) + '</div>'
    + '<h3 class="pg-h3">If it goes the other way</h3><div class="pg-grid">' + ''.join(fig(change_card(WB.id, i, True), t, n) for i, t, n in [(0, 'Three weeks higher', 'The same calm words.'), (1, 'Why it can happen', 'No blame, and no one else sees it.')]) + '</div>'
)

# ---------- responsive app shell: one markup for every format ----------
def app(world, kind, art, play, tab='today', play_cls='', js=''):
    rail = '' if kind == 'step' else tabbar(tab).replace('class="tabbar"', 'class="rail"', 1)
    tb = '' if kind == 'step' else tabbar(tab)
    return (f'<div class="app world {WORLDS[world].cls} is-{kind} {js}"><div class="shell">{rail}<section class="page-art">{art}</section>'
            f'<section class="page-play {play_cls}">{play}</section>{tb}</div></div>')

def art_img(world, moment):
    W = WORLDS[world]
    base = W.scenes[W.moment(moment)]
    here_ = os.path.dirname(os.path.abspath(__file__))
    large = f'{A}{base}-l.webp' if os.path.exists(os.path.join(here_, A, base + '-l.webp')) else f'{A}{base}.webp'
    wide = f'{A}{base}-w.webp' if os.path.exists(os.path.join(here_, A, base + '-w.webp')) else large
    return f'<div class="art-img" style="background-image:url({A}{base}.webp);--art-p:url({large});--art-w:url({wide})" aria-hidden="true"></div>'

def board_big(h1=False):
    tag = 'h1' if h1 else 'span'
    return (f'<div class="nameboard"><span class="bn" lang="hi">नाशिक</span><{tag} class="bs">Nashik</{tag}>{tx("span", "Platform 3 · Wednesday", "प्लेटफ़ॉर्म 3 · बुधवार", "bm")}</div>')

def train_plate(extra=''):
    return (f'<div class="plate hug"><div class="pg-row">{tx("span", "Train", "गाड़ी", "level")}<span class="vh">214</span>{flaps("214")}</div>{extra}</div>')

def lugdi_mast():
    return (f'<div class="masthead">{tx("span", "Ghat Series · No. 214", "घाट सीरीज़ · अंक 214")}{tx("span", "Wednesday", "बुधवार")}</div>'
            f'<div class="roundel" role="img"{al("Issue 214", "अंक 214")}><span aria-hidden="true">214</span></div>')

def app_step(world, sel=None, hover=None):
    W = WORLDS[world]
    T = W.twin
    qid = uid('h')
    tl = ''
    for i, (w, p, q) in enumerate(T['people']):
        st = ('is-selected' if w == sel else '') + (' is-hover' if w == hover else '')
        tl += tile(world, w, p, q, st, serial=W.serial(i))
    btn = main('Pick one', 'किसी एक को चुनें', 'Send {n}', '{n} को भेजें', 'is-live' if sel else 'is-wait', n=nm(world, sel) if sel else None)
    meta = W.app_meta('step')
    art = art_img(world, 'twin') + f'<div class="art-meta">{meta}</div>'
    play = (topbar('step', W.plate('twin')) + body(h1q(*T['q'], qid),
            f'<div class="credits">{byline(world, *T["speaker"])}{statkey(T["keys"])}</div>',
            f'<div class="tiles" data-n="{len(T["people"])}" role="radiogroup" aria-labelledby="{qid}">{tl}</div>') + dock(btn))
    return app(world, 'step', art, play, js='js-pick')

def app_cover(world):
    line, lvl = WORLDS[world].cover_line, ('Level 3 of 6', 'लेवल 3/6')
    meta = topbar('cover') + WORLDS[world].app_meta('cover', line, lvl)
    art = art_img(world, 'cover') + f'<div class="art-meta">{meta}</div>'
    return app(world, 'cover', art, dock(out_btn('Play', 'खेलें')), play_cls='is-overlay')

def app_result(world):
    W = WORLDS[world]
    week = spines(['played', 'forgiven', 'today', 'todo', 'todo', 'todo', 'todo'])
    top, panel = W.result_parts('86', figsx('90', '41', '12'), week, W.next_line, '')
    meta = topbar('step', W.plate('result')) + top
    art = art_img(world, 'result') + f'<div class="art-meta">{meta}</div>'
    play = body(panel) + dock(out_btn('Share', 'शेयर करें', ic('share')))
    return app(world, 'result', art, play, play_cls='is-overlay')

def app_sunday(world):
    qid = uid('h')
    pair = ''
    for w, p, q in WORLDS[world].twin_pair():
        sen, shi = (named(world, x) for x in spoken(w, p))
        pair += (f'<div class="pi"><span class="face" style="background-image:url({face(world, w)})" aria-hidden="true"></span><span class="nm" aria-hidden="true" data-hi="{nm(world, w)[1]}">{nm(world, w)[0]}</span>'
                 f'{stats(p)}{tx("span", sen, shi, "vh")}{tx("span", f"“{q[0]}”", f"“{q[1]}”", "quote")}</div>')
    chips = ''.join(chip(en, hi, 'is-selected' if i == 0 else '') for i, (en, hi) in enumerate([('Words', 'शब्द'), ('Person', 'व्यक्ति'), ('Nothing', 'कुछ नहीं')]))
    W = WORLDS[world]
    obj = W.week_obj('sunday', dayobjs(world))
    meta = (topbar('root', W.plate('sunday')) + h1q('Your week', 'आपका हफ़्ता') + obj +
            f'<button class="textbtn" type="button">{ic("share")}{tx("span", "Share", "शेयर करें")}</button>')
    art = art_img(world, 'sunday') + f'<div class="art-meta">{meta}</div>'
    play = (body(tx('h2', 'What was different?', 'क्या अलग था?', 'q', f' id="{qid}"'), byline(world, *W.twin['speaker']),
                 f'<div class="pairinfo">{pair}</div>', f'<div class="chips" role="radiogroup" aria-labelledby="{qid}">{chips}</div>',
                 f'<button class="textbtn" type="button">{ic("pencil")}{tx("span", "Write a note", "नोट लिखें")}</button>')
            + dock(main('Pick an answer', 'एक जवाब चुनें', 'Save answer', 'जवाब सहेजें', 'is-live')))
    return app(world, 'sunday', art, play, tab='week', play_cls='is-overlay', js='js-chips')

def app_board(world):
    W = WORLDS[world]
    fr, ev = W.board_panels(lrows(world, road_rows(world, 'friends')), lrows(world, road_rows(world, 'top')) + '<li class="gapdots" aria-hidden="true">· · ·</li>' + lrows(world, road_rows(world, 'near')))
    meta = topbar('root', W.plate('board')) + tx('h1', 'Board', 'बोर्ड', 'vh') + seg('friends') + fr
    art = art_img(world, 'board') + f'<div class="art-meta">{meta}</div>'
    play = body(ev)
    return app(world, 'board', art, play, tab='board', play_cls='is-overlay')

def device(inner, w, h, s, label, cap='', kind='', tbar=None):
    cls = 'device' + (' is-phone' if kind == 'phone' else '') + (' has-tbar' if tbar else '')
    tb = f'<div class="tbar" style="background:{tbar[1]}">{tbar[0]}<span><i></i><i></i><i></i></span></div>' if tbar else ''
    return (f'<figure class="devfig"><div class="devwrap" style="--w:{w}px;--h:{h}px;--s:{s}"><div class="{cls}" role="group" aria-label="{label}">{tb}{inner}</div></div>'
            f'<figcaption><b>{label}.</b> {cap}</figcaption></figure>')

FORMATS = [(390, 844, .42, 'Phone, 390 x 844', 'phone', 'The portrait painting behind the game; tabs at the bottom.'),
           (844, 390, .42, 'Phone on its side, 844 x 390', 'phone', 'The wide painting; the game in a column on the right. Short, so the cards scroll once.'),
           (820, 1180, .3, 'Tablet upright, 820 x 1180', '', 'The larger portrait painting; the game gathered low so the top of the picture stays clear.'),
           (1180, 820, .3, 'Tablet on its side, 1180 x 820', '', 'The wide painting, the game on its open side.'),
           (1440, 810, .3, 'Laptop, 1440 x 810', '', 'The wide painting at full width.'),
           (1920, 1080, .23, 'Desktop, 1920 x 1080', '', 'The painting fills the screen; the game column stops growing at 760.')]

RESP = (
    '<p class="pg-p">One page, built once, that rearranges itself by the space it gets, and the painting fills the screen at every size. Phones and upright tablets use the portrait painting. Anything wider than tall uses a wide painting composed with its subject on the left, and the game sits in a column over the open right side, on a soft dark fade, never a blur. The cards turn on their side when there is room, and the tabs become a rail.</p>'
    '<h3 class="pg-h3">Try it: drag the corner</h3><p class="pg-rule">This frame is live. Drag its bottom-right corner from phone width to laptop width and watch the same page change layout. Tap a driver: it works at every size.</p>'
    f'<div class="livewrap">{app_step(WA.id)}</div>'
    '<h3 class="pg-h3">The same step in six formats</h3><div class="devrow">'
    + ''.join(device(app_step(WA.id), w, h, sc, lab, cap, kind) for w, h, sc, lab, kind, cap in FORMATS) + '</div>'
    '<h3 class="pg-h3">Laptop, 1440 x 810: every screen over the full painting</h3><div class="devrow">'
    + device(app_step(WA.id, hover='kamla'), 1440, 810, .62, f'{WA.title} step, a pointer over {nm(WA.id, "kamla")[0]}', WA.note('resp.step'))
    + device(app_step(WB.id, sel='raju'), 1440, 810, .62, f'{WB.title} step, {nm(WB.id, "raju")[0]} picked', WB.note('resp.step'))
    + device(app_cover(WA.id), 1440, 810, .62, f'{WA.title} cover', WA.note('resp.cover'))
    + device(app_cover(WB.id), 1440, 810, .62, f'{WB.title} cover', WB.note('resp.cover'))
    + device(app_result(WA.id), 1440, 810, .62, f'{WA.title} result', WA.note('resp.result'))
    + device(app_result(WB.id), 1440, 810, .62, f'{WB.title} result', WB.note('resp.result'))
    + device(app_sunday(WA.id), 1440, 810, .62, f'{WA.title} Sunday', WA.note('resp.sunday'))
    + device(app_board(WB.id), 1440, 810, .62, f'{WB.title} board', WB.note('resp.board'))
    + '</div><h3 class="pg-h3">Other sizes worth checking</h3><div class="devrow">'
    + device(app_step(WA.id), 1280, 650, .5, 'Short laptop window, 1280 x 650', 'A 13-inch laptop with the browser bar: the whole step still fits.')
    + device(app_cover(WA.id), 1920, 1080, .45, 'Desktop, 1920 x 1080', 'The painting fills even a big screen; the game column keeps a readable width.')
    + device(app_step(WB.id), 820, 1180, .42, f'Tablet upright, {WB.title}', WB.note('resp.tablet'))
    + device(app_result(WA.id), 1280, 800, .5, 'Installed app window', 'Its own window, the title bar in the world colour.', tbar=('Retake', WA.ground))
    + '</div>'
)

SVGF = ('<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="protan"><feColorMatrix type="matrix" values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0"/></filter>'
        '<filter id="deutan"><feColorMatrix type="matrix" values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0"/></filter></svg>')

# ---------- page parts that follow the registry ----------
def font_link():
    # Hind and Khand come from fonts.css (tools/fonts.py: the same Google files, metrics re-balanced so text sits in the middle)
    fams = list(dict.fromkeys(['Sarpanch:wght@900'] + [f for W in SEL for f in W.fonts if not f.startswith('Khand')]))  # Sarpanch also sets this page's own title
    return 'https://fonts.googleapis.com/css2?' + '&'.join(f'family={f}' for f in fams) + '&display=swap'

def world_css():
    return ''.join(f'\n<link rel="stylesheet" href="worlds/{W.id}.css">' for W in SEL if (WORLD_DIR / f'{W.id}.css').exists())

def hero():
    return '\n'.join(fig(step_twin(W.id), f'{W.title} week', W.note('hero')) for W in ([WA] if WB is WA else [WA, WB]))

def worlds_section():
    if not any(W.module for W in SEL):
        return ''
    cards = ''
    for W in WORLDS.values():
        sw = ''.join(f'<i style="background:{h}"></i>' for n, h, u in W.palette)
        said = ', '.join(f'{n} {h}' for n, h, u in W.palette)
        cards += (f'<article class="pg-world"><div class="pg-world-art" style="background-image:url({W.scene(W.moment("cover"))})" aria-hidden="true"></div>'
                  f'<div class="pg-world-in"><h3>{W.title} <span lang="hi">{W.name[1]}</span></h3><p>{W.voice[0]}</p><p lang="hi">{W.voice[1]}</p>'
                  f'<div class="pg-world-sw" role="img" aria-label="Palette: {escape(said)}">{sw}</div></div></article>')
    return (f'<section id="worlds" class="pg-sec"><h2 class="pg-h2">The worlds</h2><p class="pg-p">{str(NUM.get(len(WORLDS), len(WORLDS))).capitalize()} printed worlds over one skeleton. '
            f'Each brings its own paintings, objects and palette; the pick yellow and the focus ring are shared.</p><div class="pg-worlds">{cards}</div></section>')

SHAPE_ROWS = [('Radii (3 each)', 'radii'), ('Chosen', 'Yellow, a 3 px ink frame, a paper ring and a 36 px tick on paper'), ('Held (two-tap)', 'Lifted 6 px, a second ink ring and an arrow mark'),
              ('Spent check', 'spent'), ('Depth', 'depth'), ('Only dashed thing', 'An empty slot'),
              ('Tappable looks (5)', 'Main button, person card (tile or row), chip, slot, secondary text button. Top bar, tab bar and the board switch are navigation.')]

def shapes_table():
    out = '<tr><th></th>' + ''.join(f'<th>{W.title}</th>' for W in SEL) + '</tr>'
    for lab, v in SHAPE_ROWS:
        cells = ''.join(f'<td>{W.shapes.get(v, "")}</td>' for W in SEL) if v in ('radii', 'spent', 'depth') else f'<td colspan="{len(SEL)}">{v}</td>'
        out += f'<tr><td>{lab}</td>{cells}</tr>'
    return out

def signature():
    said = [f'{W.title}: {W.signature}' for W in SEL if W.signature]
    return ' '.join(said + [f'Under reduced motion {"both are" if len(said) == 2 else "it is" if len(said) == 1 else "all are"} instant.'])

def pairs_json():
    rows = [[W.id, *p] for W in SEL for p in W.contrast]
    data = json.dumps(rows, ensure_ascii=False).replace('</', '<\\/')
    return f'<script type="application/json" class="pg-pairs">{data}</script>' if rows else ''

FACES = list(dict.fromkeys(W.display_face for W in SEL if W.display_face))
TYPE_HEAD = f'Type: {NUM[1 + len(FACES)]} face{"s" if FACES else ""}, {NUM[len(TYPE)]} styles, two weights'
TYPE_NOTE = ''.join(f'{W.display_face} for the {W.title} cover title only. ' for W in SEL if W.display_face)
LEDE = f'{NUM[len(SEL)]} printed worlds that switch every week' if len(SEL) > 1 else 'one printed world'
CARDS = ', '.join(f'{W.card_word} in {W.title}' for W in SEL if W.card_word)
NAV_WORLDS = '<a href="#worlds">Worlds</a>' if any(W.module for W in SEL) else ''
# The First take's parts are drawn by demo.py from the First take itself (`python3 demo.py sketch` writes the fragment);
# run it before this file so the library shows them as the demo plays them.
_ft = Path(__file__).parent / 'parts-first-take.html'
FIRST_TAKE = _ft.read_text(encoding='utf-8') if _ft.exists() else ''

html = f'''<meta charset="utf-8">
<title>Retake Library</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="{font_link()}">
<link rel="stylesheet" href="fonts.css">
<link rel="stylesheet" href="library.css">{world_css()}
{SVGF}
<div class="page">
<h1 class="pg-h1">Retake design system</h1>
<p class="pg-lede">Round three. One game in {LEDE}. Every part has one meaning and is drawn in every state, in {ALLW}. Tap the people and buttons in the phones: they work.</p>
<div class="pg-controls"><span class="pg-langs" role="group" aria-label="Language of every phone"><button class="pg-tog" type="button" data-page-lang="mix" aria-pressed="true">Hinglish</button><button class="pg-tog" type="button" data-page-lang="hi" aria-pressed="false">Hindi</button><button class="pg-tog" type="button" data-page-lang="en" aria-pressed="false">English</button></span><button class="pg-tog" type="button" data-tog="grey" aria-pressed="false">Greyscale</button><button class="pg-tog" type="button" data-tog="protan" aria-pressed="false">Red-blind</button><button class="pg-tog" type="button" data-tog="deutan" aria-pressed="false">Green-blind</button><button class="pg-tog" type="button" data-tog="rm" aria-pressed="false">Reduced motion</button></div>
<nav class="pg-nav" aria-label="Sections"><a href="#skeleton">Skeleton</a>{NAV_WORLDS}<a href="#tokens">Colour</a><a href="#type">Type</a><a href="#space">Space</a><a href="#components">Components</a><a href="#objects">Day objects</a><a href="#mechanics">Mechanics</a><a href="#ends">Results and tabs</a><a href="#covers">Covers</a><a href="#report">Report over time</a><a href="#first-take">First take</a><a href="#responsive">Screen sizes</a><a href="#web">Install</a><a href="#access">Hindi and access</a><a href="#choices">Your choices</a><a href="#motion">Motion</a></nav>

<section id="skeleton" class="pg-hero" aria-label="The same day in {'one world' if WB is WA else 'both worlds'}">
{hero()}
<div><h2 class="pg-h3 first">One skeleton under {ALLW}</h2>
<ol class="anno"><li><span class="n">1</span><div><b>Top bar</b><span>Back, the day's plate as the bar's title, help. The cover alone has the day count and the language.</span></div></li>
<li><span class="n">2</span><div><b>The question</b><span>The screen's heading, at 104 px on every step in {ALLW}.</span></div></li>
<li><span class="n">3</span><div><b>Who said it, and the key</b><span>One named voice for the lines on the cards. One key; its icons repeat on every number.</span></div></li>
<li><span class="n">4</span><div><b>3 to 5 people</b><span>Identical before the choice: {CARDS}. Two of them have the same record in mirrored words.</span></div></li>
<li><span class="n">5</span><div><b>One main button</b><span>Pinned at 748 px. It waits with what is missing, then turns yellow and names what happens.</span></div></li></ol>
<p class="pg-note">The painting stays whole behind {WA.title}. Text sits on small plates that hug it, never a band across the screen.</p></div>
</section>
{worlds_section()}
<section id="tokens" class="pg-sec"><h2 class="pg-h2">Colour: one meaning each</h2>
<p class="pg-p">Yellow means only "you picked this" and the live button that confirms it. Text is only ink or paper. The table is computed live from the tokens.</p>
<div class="swatches">{swatches}</div>
<div class="pg-scroll"><table class="pg-table" id="contrast"><thead><tr><th>Pair</th><th>Ratio</th><th>Needs</th><th>Result</th></tr></thead><tbody></tbody></table></div>{pairs_json()}</section>

<section id="type" class="pg-sec"><h2 class="pg-h2">{TYPE_HEAD}</h2>
<p class="pg-p">{TYPE_NOTE}Hind for every word that is read, in both scripts. At most four styles on one screen, nothing under 14 px, and only 500 for lines people say.</p>
<div class="pg-scroll"><table class="pg-table">{type_rows}</table></div></section>

<section id="space" class="pg-sec"><h2 class="pg-h2">Space, shape and depth</h2>
<div class="pg-two"><div class="pg-spec"><h4>Spacing scale</h4><p class="pg-rule">These values only. 8 inside a group, 12 between targets, 16 to 24 between groups.</p><div class="sp">{SPACE}</div></div>
<div class="pg-spec"><h4>Shapes and depth</h4><div class="pg-scroll"><table class="pg-table">{shapes_table()}</table></div></div></div></section>

<section id="components" class="pg-sec"><h2 class="pg-h2">Components, every state, {ALLW}</h2>
<h3 class="pg-h3">Person card</h3><p class="pg-rule">One control, one stop. A pick changes only the fill, the frame and the mark; the size never changes.</p>{each(spec_tiles)}
<h3 class="pg-h3">Main, secondary and icon buttons</h3><p class="pg-rule">Live is yellow on puzzle steps only. Outside a puzzle the main button is paper or white enamel.</p>{each(spec_buttons)}
<h3 class="pg-h3">Chips and the check pool</h3>{each(spec_chips)}
<h3 class="pg-h3">Slots</h3><p class="pg-rule">Dashed means "empty, put someone here". A refusal shakes once and says why.</p>{each(spec_slots)}
<h3 class="pg-h3">Information parts</h3><p class="pg-rule">Never tappable, never yellow. The lean is a number with no side, bar or tilt.</p>{each(spec_info)}
<h3 class="pg-h3">Toast and note</h3>{each(spec_overlays)}
<h3 class="pg-h3">Share card and milestone</h3>{each(spec_extras)}
<h3 class="pg-h3">Empty, offline and error</h3>{each(spec_states)}
</section>

<section id="objects" class="pg-sec"><h2 class="pg-h2">Day objects</h2><p class="pg-p">Each mechanic happens on a real object of its world. The objects change; the skeleton under them does not.</p>{objects()}</section>

<section id="mechanics" class="pg-sec"><h2 class="pg-h2">Every mechanic, {ALLW}</h2><p class="pg-p">Sample content. Hindi strings are drafts for a native speaker.</p>
{"".join(f'<h3 class="pg-h3">{t}</h3>' + grid(items) for t, items in MECH)}</section>

<section id="ends" class="pg-sec"><h2 class="pg-h2">Results, Sunday and the Board</h2>{grid(ENDS)}</section>

<section id="covers" class="pg-sec"><h2 class="pg-h2">Cover states, sheets and the dialog</h2>{grid(COVERS)}<h3 class="pg-h3">The "?" sheet</h3>{grid(SHEETS)}</section>

<section id="report" class="pg-sec"><h2 class="pg-h2">The report over time</h2>{REPORT}</section>

<section id="first-take" class="pg-sec"><h2 class="pg-h2">The First take</h2><p class="pg-p">The parts the First take adds, drawn from the First take itself (demo.py): the opening cutscene, notes on the cards in each world's paperwork with the progress marker, and the result that closes each chapter.</p>{FIRST_TAKE}</section>

<section id="responsive" class="pg-sec"><h2 class="pg-h2">Every screen size</h2>{RESP}</section>

<section id="web" class="pg-sec"><h2 class="pg-h2">Installed as an app</h2>{WEB}</section>

<section id="access" class="pg-sec"><h2 class="pg-h2">Hindi, large text and small phones</h2>{grid(ACCESS)}</section>

<section id="choices" class="pg-sec"><h2 class="pg-h2">Your choices</h2><p class="pg-p">Each open question drawn both ways. The default stands until you choose. The first two would change a rule in the rulebook.</p>
<div class="pg-stack">{choices()}</div></section>

<section id="motion" class="pg-sec"><h2 class="pg-h2">Motion</h2>
<div class="pg-two"><div class="pg-spec"><h4>Timings</h4><table class="pg-table"><tr><td>Press feedback</td><td>within 100 ms</td></tr><tr><td>Pick</td><td>160 ms, cubic-bezier(0.2, 0, 0, 1)</td></tr><tr><td>Colour change</td><td>160 ms</td></tr><tr><td>Committing</td><td>260 ms, then the next step</td></tr><tr><td>Sheet in, out</td><td>420 ms decelerate, 260 ms accelerate</td></tr><tr><td>Result reveal</td><td>420 and 680 ms beats, done by 1100 ms; a tap skips it</td></tr><tr><td>The steps</td><td>100, 160, 260, 420, 680, 1100 ms: each 1.618 times the last</td></tr></table></div>
<div class="pg-spec"><h4>Signature moves</h4><p class="pg-rule">{signature()}</p>
{each(lambda w: WORLDS[w].signature_demo())}</div></div></section>
<p class="pg-p">Icons: <a href="https://phosphoricons.com">Phosphor Icons</a> (MIT licence, copyright 2023 Phosphor Icons); the cricket bat and stumps drawn to match.</p>
</div>
<script src="library.js"></script>
'''
here = Path(__file__).parent
shell = '<!doctype html>\n<html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>\n' + html + '\n</body></html>\n'
# demo.py imports this file for its screens; only running it writes the library
if __name__ == '__main__':
    if OUT == 'index':
        (here / 'index.html').write_text(html)
        (here / 'preview.html').write_text(shell)
        written = ['index.html', 'preview.html']
    else:
        if not OUT.replace('-', '').replace('_', '').isalnum():
            raise SystemExit(f'LIB_OUT must be a plain file name without .html, not {OUT!r}')
        (here / f'{OUT}.html').write_text(shell)
        written = [f'{OUT}.html']
    print('written', len(html), 'chars;', ', '.join(written), 'with', ', '.join(W.id for W in SEL))
