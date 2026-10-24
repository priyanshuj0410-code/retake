"""Rukavat (रुकावट): the 1980s family TV. The rooftop antenna with a kite caught in it, the teak cabinet with its
sliding shutters, the Sunday film and the arguments over who watches what, and the announcer's card,
"Rukavat ke liye khed hai". Never the real broadcaster's name or logo; colour bars live only inside paintings.

Loaded by library.py with one injected global, lib (knowledge/architecture/world-modules.md). The dress is in
worlds/rukavat.css, every selector under .w-rukavat.

Three things the interface does not offer, added from here and named rukavat_* or rk-* so nothing else is touched:
- lib.SCREENS gains rukavat_split (the new kind of puzzle, Split), rukavat_cut (the interruption card) and
  rukavat_chapter (the starter's chapter title card), so `shows` can place them in the library's sections.
- lib.IC gains 'rk-knob', the channel knob, so the check pool and the spent checks can use ic().
"""

tx, al, ic, NM = lib.tx, lib.al, lib.ic, lib.NM

lib.IC.setdefault('rk-knob', '<circle cx="12" cy="12" r="9.5"/><path d="M12 12V5" stroke-width="3"/>')

# ---------- the day's broadcast: the title card on the cover, the slot on every plate ----------
TITLES = {False: (('Dadi Ki Kursi', 'दादी की कुर्सी'), ('Wednesday · 9 pm', 'बुधवार · रात 9 बजे')),
          True: (('Faisla', 'फ़ैसला'), ('Thursday · 9 pm', 'गुरुवार · रात 9 बजे'))}
CUT = ('We regret the interruption', 'रुकावट के लिए खेद है')

# ---------- the family's own story (O15): drafts for the owner and a native Hindi speaker, listed in
# knowledge/content/world-voices.md. Who drives Dadi to the doctor; Dadi says the lines. ----------
STAT_KEYS = {'rk-scrape': (None,
                           ('scrapes', 'खरोंचें'), ('scrapes', 'खरोंचें'))}
TWIN = {'q': ('Who drives Dadi to the clinic?', 'दादी को डॉक्टर तक कौन ले जाए?'),
        'speaker': ('meena', 'Dadi', 'दादी'), 'keys': ['wheel', 'rk-scrape'],
        'people': [('kamla', [('wheel', '8'), ('rk-scrape', '1')], ('Drives slowly, very nervous.', 'धीमी ड्राइविंग, बहुत नर्वस।')),
                   ('arjun', [('wheel', '20'), ('rk-scrape', '3')], ('Knows every short cut, drives fast.', 'हर शॉर्टकट जानते हैं, तेज़ चलाते हैं।')),
                   ('raju', [('wheel', '8'), ('rk-scrape', '1')], ('Drives slowly, very careful.', 'धीमी ड्राइविंग, बहुत सावधान।')),
                   ('pammi', [('wheel', '2'), ('rk-scrape', '0')], ('Just got a licence, keen to go.', 'अभी लाइसेंस मिला, जाने को तैयार।'))],
        'pair': (0, 2), 'words': ('nervous', 'careful'),
        'swapped': (('Drives slowly, very careful.', 'धीमी ड्राइविंग, बहुत सावधान।'), ('Drives slowly, very nervous.', 'धीमी ड्राइविंग, बहुत नर्वस।'))}
COVER_LINE = ('After the news, the family film.', 'समाचार के बाद, परिवार की फ़िल्म।')
HARD_LINE = ("Today, in a lawyer's office.", 'आज, एक वकील के दफ़्तर में।')
# the Board's road names are Sunday programmes, all invented
ROADS = {'friends': ('Geet Ki Shaam', 'Bachchon Ka Ghanta', 'Sunday Ki Picture', 'Kheti Ki Baat'),
         'top': ('Raat Ka Natak', 'Nau Baje Ki Khabar', 'Dopahar Ka Serial'),
         'near': ('Bachchon Ka Ghanta', 'Subah Ka Cartoon', 'Sunday Ki Picture', 'Kheti Ki Baat', 'Mausam Ka Haal')}
SLIDE = f'{lib.A}sunday-cut-slide.webp'   # painted by art/rukavat_slide.py, 960 x 720, the Hindi line lettered on it
SLIDE_EN = f'{lib.A}sunday-cut-slide-en.webp'   # the same slide lettered in English, for the English-only mode


def titlecard(hard=False, tag='h1'):
    t, slot_ = TITLES[hard]
    return ('<div class="rk-titlecard">' + tx(tag, t[0], t[1], 'rk-title', ' data-count="0"')
            + tx('span', slot_[0], slot_[1], 'rk-slot', ' data-count="0"') + '</div>')


def cutcard(en=None):
    """The interruption itself: the announcer's slide with the Hindi line lettered on it, in both languages, and in
    English the line under it on a teal caption (empty in Hindi, so it hides)."""
    en = CUT[0] if en is None else en
    eng = f'<span class="rk-cut-en" data-hi="">{en}</span>' if en else ''
    return (f'<div class="rk-cutcard" aria-hidden="true"><img class="rk-slide is-hi" src="{SLIDE}" alt="" width="960" height="720">'
            f'<img class="rk-slide is-en" src="{SLIDE_EN}" alt="" width="960" height="720">{eng}</div>')


def signoff(score):
    return (f'<div class="rk-signoff">{tx("span", "Good night", "शुभ रात्रि", "rk-gn")}{tx("span", "Score", "स्कोर", "level")}'
            f'<h1 class="score"><span class="vh">Score </span>{score}</h1></div>')


def card(inner, cls=''):
    """Every Rukavat object is a cream programme card: a teal band with an orange rule along the top, one hairline, a soft shadow."""
    return f'<div class="rk-card on-paper {cls}">{inner}</div>'


# ---------- Split: the new kind of puzzle, drawn here first ----------
CHORES = [('Sweeping', 'झाड़ू'), ('Laundry', 'कपड़े'), ('Cooking', 'खाना'), ('Dishes', 'बर्तन'), ('Shopping', 'बाज़ार'), ('TV', 'टीवी')]
FAMILY = [('kamla', [('clock', '5'), ('tool', '4')]), ('raju', [('clock', '5'), ('tool', '4')]), ('pammi', [('clock', '2'), ('tool', '3')])]
SPLIT = {'rest': ({}, None),
         'held': ({'Laundry': 'kamla', 'Cooking': 'kamla'}, 'Sweeping'),
         'filled': ({'Sweeping': 'raju', 'Laundry': 'kamla', 'Cooking': 'kamla', 'Dishes': 'raju', 'Shopping': 'pammi', 'TV': 'pammi'}, None)}


def chore_slot(world, job, who=None, held=False):
    en, hi = job
    W = lib.WORLDS[world]
    if who:
        st, lab = 'is-filled', (f'{en}, {lib.nm(world, who)[0]}', f'{hi}, {lib.nm(world, who)[1]}')
        w = (f'<span class="who"><i style="background-image:url({W.face(who)})"></i>{tx("span", lib.nm(world, who)[0], lib.nm(world, who)[1])}'
             f'<span class="stick">{ic("tick")}</span></span>')
    else:
        st, lab, w = ('is-target', (f'{en}, held', f'{hi}, उठाया हुआ'), '') if held else ('', (f'{en}, empty', f'{hi}, ख़ाली'), '')
    return f'<div class="slotwrap"><button class="slot {st}" type="button"{al(*lab)}>{tx("b", en, hi)}{w}</button></div>'


def step_split(world, state='rest', lang=None, cls=''):
    W = lib.WORLDS[world]
    qid = lib.uid('h')
    done, held = SPLIT[state]
    slots = ''.join(chore_slot(world, c, done.get(c[0]), c[0] == held) for c in CHORES)
    obj = card(f'<div class="rk-slots" role="group" aria-labelledby="{qid}">{slots}</div>', 'rk-sched')
    rows = ''
    for who, p in FAMILY:
        n = sum(1 for v in done.values() if v == who)
        side = lib.stats(p) + '<span class="rk-marks">' + '<i></i>' * n + '</span>'
        lab = [lib.named(world, x) for x in lib.spoken(who, p, f', {n} chores' if n else '', f', {n} काम' if n else '')]
        rows += lib.row(world, who, side, '', None, label=lab)
    left = len(CHORES) - len(done)
    btn = lib.main(f'Share {left} more', f'{left} और बाँटें') if left else lib.main('', '', 'Lock chores', 'पक्का करें', 'is-live')
    inner = (lib.topbar('step', W.plate('split'))
             + lib.body(lib.h1q('Who does what this Sunday?', 'इस रविवार कौन क्या करेगा?', qid),
                        lib.voice(world, 'meena', 'Dadi', 'दादी', 'Rajan is tired. Let him watch his film.', 'राजन थका है। उसे अपनी फ़िल्म देखने दो।'),
                        obj, f'<div class="at-end rk-family">{lib.statkey(["clock", "tool"])}<div class="rows is-compact" role="group" aria-labelledby="{qid}">{rows}</div></div>')
             + lib.dock(btn))
    art, ac = W.art('split')
    return lib.phone(world, inner, f'{W.title} split, {state}', 'rk-split ' + cls, art, ac, lang)


# ---------- the big moment: the slide cuts in on the TV before the result ----------
def step_cut(world, still=False, lang=None, cls=''):
    """The result painting with the slide in its screen; rolling in, or (reduced motion) sitting still."""
    W = lib.WORLDS[world]
    inner = f'<div class="rk-cut{"" if still else " is-rolling"}" role="img"{al(*CUT)}>{cutcard()}</div>'
    return lib.phone(world, inner, f'{W.title} result, the cut' + (', reduced motion' if still else ''), 'rk-cutphone ' + cls,
                     W.scene(W.moment('result')), '', lang)


# ---------- the starter's chapter title card (library.chapter_card, Rukavat.chapter_top) ----------
def step_chapter(world, lang=None, cls='', c=None):
    return lib.chapter_card(world, lang, cls, c)


lib.SCREENS.update({'rukavat_split': step_split, 'rukavat_cut': step_cut, 'rukavat_chapter': step_chapter})


def tv_demo():
    """The signature move, live: open "Play the cut" and the card rolls in, holds, cuts, and the picture warms back up."""
    pic = f'<div class="rk-tv-pic" style="background-image:url({lib.A}sunday-s-tv.webp)">{signoff("86").replace("<h1", "<b").replace("</h1>", "</b>")}</div>'
    return (f'<div class="rk-demo-wrap"><details class="rk-demo"><summary class="textbtn">{tx("span", "Play the cut", "कट चलाएँ")}</summary></details>'
            f'<div class="rk-tv" role="img"{al("The interruption card, then the score", "रुकावट का कार्ड, फिर स्कोर")}>{pic}<div class="rk-cut">{cutcard()}</div></div></div>')


class Rukavat(lib.World):
    id = 'rukavat'
    name = ('Rukavat', 'रुकावट')
    voice = ('Each day is an evening in front of the 1980s family TV, until the announcer says "Rukavat ke liye khed hai".',
             'हर दिन अस्सी के दशक के घर के टीवी के सामने एक शाम है, जब तक उद्घोषक न कहे, "रुकावट के लिए खेद है"।')
    palette = [('rukavat-ground', '#2A2F33', 'Screen grey ground'), ('rukavat-paper', '#FBF4E4', 'Cream: every card starts here, ink 14.7:1'),
               ('rukavat-ink', '#2A1F17', 'Text on cream'), ('rukavat-teak', '#6B4429', 'Teak: bezels, the cabinet, not-ready fill (cream 7.7:1)'),
               ('rukavat-teal', '#3E7C7B', 'Teal: bands without words (cream on it only 4.4:1)'),
               ('rukavat-teal-deep', '#275453', 'Name caption teal: cream on it 7.7:1'), ('rukavat-orange', '#E2662B', 'Signal orange: rules, knob clicks, never text')]
    contrast = [('Ink on Rukavat cream', '#2A1F17', '#FBF4E4', 7, 'text on paper'), ('Cream on Rukavat screen grey', '#FBF4E4', '#2A2F33', 4.5, 'text'),
                ('Cream on the deep caption plate', '#FBF4E4', '#1C2023', 7, 'text on plates'), ('Cream on name-caption teal', '#FBF4E4', '#275453', 7, 'caption text'),
                ('Cream on teak (not ready)', '#FBF4E4', '#6B4429', 7, 'button text'), ('Cream on plain teal (never for words)', '#FBF4E4', '#3E7C7B', 7, 'shows why words sit on deep teal'),
                ('Signal orange against screen grey', '#E2662B', '#2A2F33', 3, 'rules and marks'), ('Signal orange against cream', '#E2662B', '#FBF4E4', 3, 'knob clicks, switch on'),
                ('Teal band against cream', '#3E7C7B', '#FBF4E4', 3, 'card band'), ('Cream edge on Rukavat ground', '#FBF4E4', '#2A2F33', 3, 'control edge'),
                ('White focus ring against Rukavat ground', '#FFFFFF', '#2A2F33', 3, 'focus')]
    fonts = ['Rozha+One']
    display_face = 'Rozha One'
    type_row = ('ts-rukavat', 'Dadi Ki Kursi', 'दादी की कुर्सी', 'Rozha One 400, 45, the cover title card only. Hindi 1.3')
    shapes = {'radii': '0 caption bands, 12 screens, cards and controls, round knobs and buttons', 'spent': 'The channel knob, outlined and dim',
              'depth': 'Cream cards with one hairline and a soft shadow, lit from high on the left; every TV screen in a brushed steel trim inside a teak bezel; '
                       'chrome rims on the portrait screens, chrome knobs with a knurled edge'}
    card_word = 'TV name captions'
    scenes = {'roof': 'sunday-s-roof', 'room': 'sunday-s-room', 'tv': 'sunday-s-tv', 'sofa': 'sunday-s-sofa'}
    moments = {'twin': 'sofa', 'rule': 'room', 'jobs': 'room', 'split': 'room', 'checks': 'tv', 'team': 'roof', 'sort': 'tv', 'words': 'sofa',
               'crowd': 'roof', 'look': 'sofa', 'board': 'sofa', 'cover': 'roof', 'cover_hard': 'tv', 'result': 'tv', 'sunday': 'room',
               'change': 'roof', 'month': 'room', 'chapter': 'room', 'default': 'sofa'}
    art_cls = 'veil'
    face_prefix = 'sunday'
    plates = {'default': ('Wednesday · 9 pm', 'बुधवार · रात 9 बजे'), 'result': ('Wednesday · 10 pm', 'बुधवार · रात 10 बजे'),
              'split': ('Sunday · 9 am', 'रविवार · सुबह 9 बजे'), 'sunday': ('Sunday · 4 pm', 'रविवार · शाम 4 बजे'), 'look': ('Sunday · 4 pm', 'रविवार · शाम 4 बजे'),
              'board': ('The sofa', 'सोफ़ा'), 'chapter': ('First take', 'फ़र्स्ट टेक')}
    chapter = {'n': 5, 'area': ('Home and family', 'घर और परिवार'), 'year': '1999',
               'line': ('Family evenings, parents who separate, and a dowry demand.', 'परिवार की शामें, अलग होते माँ-बाप, और दहेज की माँग।')}
    chapter_marks = 'rk-five'
    take_plate = ('First take', 'फ़र्स्ट टेक')   # as on its title card; the day's plates name a weekday and an hour
    places = ('Wednesday · 9 pm', 'Wednesday · 10 pm', 'Sunday · 9 am', 'Sunday · 4 pm', 'The sofa')
    week = ['room', 'tv', 'sofa', 'roof', 'room', 'tv']
    next_line = ('Same time tomorrow', 'कल इसी समय')
    stat_keys = STAT_KEYS
    twin = TWIN
    cover_line = COVER_LINE
    hard_line = HARD_LINE
    roads = ROADS
    share_label = ('Wednesday · 9 pm', 'बुधवार · रात 9 बजे')
    check_glyph = 'rk-knob'
    sort = (('Show this on TV?', 'क्या यह टीवी पर दिखे?'), ('Pooja shouts at the cricket like a boy.', 'पूजा लड़कों की तरह क्रिकेट पर चिल्लाती है।'), ('Show', 'दिखाएँ'))
    signature = 'the interruption card cuts in with its tone, then the picture comes back with the numbers.'
    notes = {'hero': 'Wednesday, the 9 pm slot',
             'twin.wait': 'Name captions: the portrait on a small chrome-rimmed screen, the name on a teal band.', 'twin.pick': 'Yellow prints over the cream; the caption stays.',
             'rule': 'Same parts in Rukavat dress.', 'jobs': 'Jobs are slots in the evening schedule.',
             'split.rest': 'Split, the new kind: tap a chore, then a person. Shampa and Rajan share a record.',
             'split.held': 'Sweeping is held; the next tap on a person gives it to them. Marks, never "2/6".',
             'split.filled': 'Every chore has a face; the button names the consequence.',
             'checks': 'Every check is one chrome channel knob: a cream cap while left, teal once placed.', 'team': 'The rooftop team; two of three picked.',
             'sort': "Dadi's line on the programme card.", 'words': 'A viewer\'s letter with one blank.', 'crowd': "The viewers' poll; nothing set until you pick.",
             'result': 'The picture comes back: the score on the TV, "Good night" on its caption.',
             'result.cut': 'The cut: the slide rolls in on the TV with its tone, 0.6 s, before the result. A tap skips it.',
             'result.still': 'Reduced motion: the slide sits still in the TV, then a hard cut. Nothing rolls.',
             'sunday': 'Six days on six small screens; an off screen is a dot.', 'look': 'The equal pair on cream.',
             'board.friends': 'The sofa: friends in channel order; your name on a caption.', 'board.everyone': 'Your band, the top 3, then two above and two below you.',
             'board.menu': 'A tap on a row opens one action.', 'board.toast': 'The toast is a lower third.',
             'sheet.help': 'Cream with the cabinet\'s teak edge.', 'sheet.numbers': 'Three plain lines.', 'sheet.about': 'The small credit.',
             'sheet.settings': 'On is the knob moved right with a tick; orange fills the track.',
             'hi.step': 'Every string in Hindi; the captions grow, the skeleton does not move.', 'hi.cover': 'The title card in Devanagari, Rozha One.',
             'hi.chapter': 'The chapter card in Hindi.',
             'big.step': 'One column; the body scrolls with a cue.', 'big.cover': 'The title card wraps; nothing clipped.',
             'small.step': 'Scrolls once, with a cue.', 'small.cover': 'The title card still clears Play.',
             'resp.step': 'The sofa fills the screen; the name captions sit in the column.',
             'resp.cover': 'The rooftop antenna at full width; the title card and Play on the open side.',
             'resp.result': 'The score on its small screen over the TV; the figures in the column.',
             'resp.sunday': 'The week and the look-again pair side by side.',
             'resp.board': 'Friends and Everyone side by side over the sofa.', 'resp.tablet': 'The sofa behind; the captions gathered low.'}
    shows = {'assign': [('rule', {}, '{w}, rule', 'rule'), ('jobs', {}, '{w}, jobs', 'jobs'),
                        ('rukavat_split', {}, '{w}, Split at rest', 'split.rest'), ('rukavat_split', {'state': 'held'}, '{w}, Split, a chore held', 'split.held'),
                        ('rukavat_split', {'state': 'filled'}, '{w}, Split filled', 'split.filled')],
             'result': [('rukavat_cut', {}, '{w}, the cut', 'result.cut'), ('rukavat_cut', {'still': True}, '{w}, the cut, reduced motion', 'result.still'),
                        ('result', {}, '{w} result', 'result')],
             'board_more': [('toast', {}, '{w}, friend added', 'board.toast')],
             'sheet_info': [('sheet', {'layer': 2}, 'Your numbers, {w}', 'sheet.numbers')],
             'hi_cover': [('cover', {'lang': 'hi'}, 'Hindi, {w} cover', 'hi.cover'), ('rukavat_chapter', {'lang': 'hi'}, 'Hindi, {w} chapter card', 'hi.chapter')]}

    # ----- cover -----
    def chapter_top(self, b):
        # the television's title card: the place, the five marks, the area, the setting, the year
        return ('<div class="rk-chapter">' + tx('span', *b['of'], 'level') + b['marks'] + tx('h1', *b['area'], 'rk-chap-h')
                + tx('p', *b['line'], 'coverline') + tx('span', *b['when'], 'level') + '</div>')

    def cover_top(self, hard, line, level, nxt, kept):
        return (kept + '<div class="coverstack">' + titlecard(hard) + '<div class="plate hug">'
                + ('' if nxt or not line else tx('p', line[0], line[1], 'coverline')) + tx('span', level[0], level[1], 'level') + nxt + '</div></div>')

    def app_meta(self, kind, line=None, level=None):
        if kind == 'step':
            return ''
        return ('<div class="coverstack">' + titlecard() + '<div class="plate hug">' + tx('p', line[0], line[1], 'coverline')
                + tx('span', level[0], level[1], 'level') + '</div></div>')

    # ----- mechanics -----
    def jobs_obj(self, states):
        return card('<div class="slots">' + ''.join(lib.slot(j[0], st, who, self.id, job_hi=j[1]) for j, (st, who) in zip(lib.JOBS, states)) + '</div>', 'rk-sched')

    def checks(self, p_eq, p_other):
        knob = ic('rk-knob')
        clicks = '<span class="stamps">' + f'<span class="rk-click">{knob}</span>' * 2 + '</span>'
        none = '<span class="stamps"></span>'
        w = self.id
        rws = (lib.row(w, 'anita', lib.stats(p_eq) + clicks, role=None, label=lib.spoken('anita', p_eq, ', checked twice', ', दो बार जाँचा'))
               + lib.row(w, 'raju', lib.stats(p_eq) + none, role=None, label=lib.spoken('raju', p_eq))
               + lib.row(w, 'pammi', lib.stats(p_other) + none, role=None, label=lib.spoken('pammi', p_other)))
        pool = (f'<div class="pool" role="img"{al("1 check left", "1 जाँच बाकी")}><span class="rk-knob">{ic("rk-knob", fill=True)}</span>'
                f'<span class="spent">{knob}</span><span class="spent">{knob}</span></div>')
        return rws, pool

    def letter_obj(self):
        return card(f'<p class="letter"{lib.NOCOUNT}>{tx("span", "“My son wants to teach nursery. My mother says he is too", "“मेरा बेटा नर्सरी में पढ़ाना चाहता है। माँ कहती हैं, इसके लिए वह बहुत")} '
                    f'<span class="blank" role="img"{al("blank", "ख़ाली जगह")}>&nbsp;</span> {tx("span", "for it.”", "है।”")}</p>'
                    + lib.byline(self.id, 'arjun', 'Kunal, Pune', 'कुणाल, पुणे'))

    def crowd_obj(self, qid):
        opts = ''.join(f'<button class="chip" type="button" role="radio" aria-checked="false">{v}%<span class="ctick" aria-hidden="true">{ic("tick")}</span></button>' for v in range(10, 101, 10))
        return card(f'<div class="chips is-grid5" role="radiogroup" aria-labelledby="{qid}">{opts}</div>')

    # ----- result: the good-night card -----
    def result_parts(self, score, figs_, week, line, end=' at-end'):
        return signoff(score), f'<div class="rk-card on-paper rk-panel{end}">{figs_}{week}{tx("p", line[0], line[1], "letter")}</div>'

    # ----- Sunday: six small screens -----
    def dayobj(self, state, key, letter, stamp):
        style = f' style="background-image:url({self.scene(key)})"' if key else ''
        return f'<span class="dayobj rk-set {state}"{style}>{stamp}{letter}</span>'

    def week_obj(self, view, days):
        if view == 'day1':
            return card(days, 'lockpage')
        figs_ = lib.figs2() if view == 'sunday' else lib.figsx('88', '41', '12') if view == 'report' else ''
        return card(days + (f'<div style="height:12px"></div>{figs_}' if figs_ else ''), 'rk-guide')

    def month_obj(self, lean):
        return card(tx('p', 'October', 'अक्टूबर', 'rk-cardhead') + lean)

    # ----- the Board: the sofa, in channel order -----
    def rank(self, r):
        return f'<span class="rk">{r}</span>'

    def board_list(self, rows):
        return card(f'<ol class="list">{rows}</ol>', 'rk-chart')

    def board_panels(self, friends, everyone):
        fr = card(tx('p', 'Friends', 'दोस्त', 'rk-cardhead') + f'<ol class="list">{friends}</ol>', 'rk-chart')
        ev = card(tx('p', 'Everyone · Top 9%', 'सब · टॉप 9%', 'rk-cardhead') + f'<ol class="list">{everyone}</ol>', 'rk-chart board-everyone')
        return fr, ev

    def share_card(self):
        return (f'<div class="sharecard world {self.cls}"><div class="art" style="background-image:url({self.scene("roof")})"></div><div class="sc-in">'
                f'{tx("span", *self.share_label, "level")}<span class="sc-line">{self.road_you}</span>'
                f'<span class="sc-marks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>{tx("span", "Day 6", "दिन 6", "sc-line")}</div></div>')

    def sheet_dress(self, layer):
        return '<div class="rk-cab" aria-hidden="true"></div>'

    # ----- the library's Day objects, choices and motion -----
    def objects(self):
        w = self.id
        split_obj = card('<div class="rk-slots">' + ''.join(chore_slot(w, c, SPLIT['filled'][0].get(c[0])) for c in CHORES) + '</div>', 'rk-sched')
        return [('Broadcast title card (cover)', lib.thumb(lib.cover(w)),
                 'The day\'s programme title in Rozha One on a screen-grey screen in a brushed steel trim and a teak bezel with one soft highlight, the slot under an orange rule; the line and level on a small plate.',
                 'ground, paper, teak, orange; steel and teak textures; Rozha One 400 45; Hind; radius 12', 'play, continue, see your score, first visit, hard day, loading',
                 'The title is the cover h1. The painting is hidden from screen readers.'),
                ('TV name caption (person card)', '<div class="pg-row" style="align-items:flex-start"><div style="width:180px">' + lib.tile(w, *self.twin_pair()[0]) + '</div><div style="width:180px">'
                 + lib.tile(w, *self.twin_pair()[1], 'is-selected') + '</div></div>',
                 'A cream card with one hairline and a soft shadow; the portrait on a small screen in a chrome rim; the name on a lower third, deep teal with an orange rule; numbers and the line below.',
                 'paper, ink, teal-deep, orange, chrome; radius 12', 'rest, pressed, selected, held, focus, committing, revisited',
                 'One stop: name and numbers spoken, the line as its description.'),
                ('Channel knob (checks)', '<div class="pg-stack"><div>' + self.checks([('ledger', '9'), ('pause', '2')], [('ledger', '6'), ('pause', '0')])[1] + '</div>'
                 + lib.row(w, 'anita', lib.stats([('ledger', '9'), ('pause', '2')]) + '<span class="stamps">' + f'<span class="rk-click">{ic("rk-knob")}</span>' * 2 + '</span>',
                           role=None, label=('Deepa, checked twice', 'दीपा, दो बार जाँचा')) + '</div>',
                 'One chrome knob with a knurled edge for every check. In the pool: a cream cap while left, outlined and dim once spent. Placed on a row: the same knob, a teal cap in the orange ring.',
                 'paper, ink, teal-deep, orange ring; knurl texture; ic rk-knob', '0, 1 or 2 on a row; pool 3, 2, 1, 0 left', 'The pool is an image named "1 check left"; a row says "checked twice".'),
                ('The Sunday schedule (Split and jobs)', split_obj,
                 'A programme card: six chore slots in two columns. A filled slot shows the face of who does it; a held chore turns solid.',
                 'paper, ink, teal band, pick yellow when filled; radius 12', 'slot: empty, held, filled', 'Each slot is named "Chore, person", "Chore, held" or "Chore, empty".'),
                ('Interruption card (the big moment)', '<div class="rk-tv is-card" role="img"' + al(*CUT) + '><div class="rk-cut">' + cutcard() + '</div></div>',
                 'The announcer\'s slide, a painted plate with the Hindi line lettered on it, in the TV\'s own screen; the English under it on a teal caption with the orange rule. It arrives with one soft tone, the same every day.',
                 'plate sunday-cut-slide.webp (4:3); teal-deep, paper, orange; Hind 500 14', 'rolling in, held 0.6 s, cut; reduced motion: still, then a hard cut',
                 'An image named by the line; a tap skips it; the tone never changes with the score.'),
                ('Good-night sign-off card (score)', '<div style="display:grid;justify-items:start;gap:16px;padding:8px">' + signoff('86').replace('<h1', '<b').replace('</h1>', '</b>')
                 + tx('p', 'Same time tomorrow', 'कल इसी समय', 'nextline') + '</div>',
                 'The closing picture on a screen: the score, then "Good night" on a teal caption with the orange rule. On the result it sits in the painted TV.', 'ground-deep, paper, teal-deep, orange; Score 47',
                 'result; day 1', 'The score is the result screen h1.'),
                ('The week on six screens (Sunday)', self.week_obj('sunday', lib.dayobjs(w)),
                 'Six small screens, Monday to Saturday, each showing its day\'s painting; the day on a lower third; a forgiven day greyed with "off"; an unplayed day is a switched-off screen with its dot.',
                 'teak case with a steel line, teal-deep, paper; radius 12', 'played, off, not played', 'The strip is one image with a spoken summary.'),
                ('Chapter title card (First take, chapter 5 of 5)', step_chapter(w),
                 'Back, the plate "First take", "?"; the room painting; a screen-grey card with the place in five marks, the area of life, the chapter\'s setting, the year and the length; Start outside a puzzle.',
                 'ground-deep, paper, orange, teak; Hind 700 36', 'start; begun (Continue); not loaded; a retake', 'The area is the h1; the five marks repeat the words and are hidden.'),
                ('The sofa (Board rows)', self.board_list(lib.lrows(w, lib.road_rows(w, 'friends'))),
                 'A programme card; each rank in a round channel button with a chrome rim, the road name, practice; the you row framed, its name on a teal caption.', 'paper, ink, teal-deep, orange, chrome; radius 12 and round',
                 'rest, pressed, you', 'One stop per row; rank, name and practice in one name.')]

    def choices(self):
        w = self.id
        return [(100, lambda: lib.ab_item('The English line on the interruption card', 'The rules ban "sorry" on screen. The line is a quote from 1980s television, and the announcer said "khed hai": we regret.',
                     [('A', 'We regret the interruption', lib.frame(w, '<div class="rk-tv is-card">' + '<div class="rk-cut">' + cutcard() + '</div></div>'), True),
                      ('B', 'Sorry for the interruption', lib.frame(w, '<div class="rk-tv is-card">' + '<div class="rk-cut">' + cutcard('Sorry for the interruption') + '</div></div>'), False),
                      ('C', 'Hindi only, in both languages', lib.frame(w, '<div class="rk-tv is-card">' + '<div class="rk-cut">' + cutcard('') + '</div></div>'), False)])),
                (101, lambda: lib.ab_item('The face on the chapter title card', 'Rozha One is kept to the cover title. The chapter card is also a title card, so it could carry it too.',
                     [('A', 'Hind 700', lib.frame(w, '<div class="rk-chapter" style="margin:8px">' + tx('h2', 'Home and family', 'घर और परिवार', 'rk-chap-h') + '</div>'), True),
                      ('B', 'Rozha One', lib.frame(w, '<div class="rk-chapter" style="margin:8px">' + tx('h2', 'Home and family', 'घर और परिवार', 'rk-chap-h rk-title') + '</div>'), False)])),
                (102, lambda: lib.ab_item('The name of the Board in Rukavat', 'The world\'s places are the family sofa and the slots in the schedule. "Viewers\' choice" says what a ranking is.',
                     [('A', 'The sofa', lib.frame(w, lib.topbar('root', ('The sofa', 'सोफ़ा')), 'flush'), True),
                      ('B', "Viewers' choice", lib.frame(w, lib.topbar('root', ("Viewers' choice", 'दर्शकों की पसंद')), 'flush'), False)]))]

    def signature_demo(self):
        return lib.frame(self.id, tv_demo())


WORLD = Rukavat
