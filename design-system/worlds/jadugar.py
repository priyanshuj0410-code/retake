"""Jadugar (जादूगर): the travelling jadoo show that comes to a small Indian town for one night.

Kerosene lamps, a painted moon backdrop, a cot that floats, a rope that climbs into the sky. The magician's voice is
"Dekhiye, dekhiye!". People are playing cards (portrait, name, the numbers in a row, the line); places are the
magician's boxes and baskets; a check is a card turned face down; the score is the show bill, filled in after the
show; the big moment is the reveal, a crimson cloth pulled off the bill (still under reduced motion). The day plate is
a show ticket stub. The starter's chapter here is trust, and the new kind of puzzle drawn here first is Believe: 3 to 5
people tell what happened, two of them the same story, and the player picks whom to believe, then confirms.

The metal finish (O14) is brass and gilt, under one light high on the left: gilt-edged playing cards, one gilt rule inside
each bill, spun-brass corner caps on the boxes, a punched hole ringed in brass on the ticket stub, a twisted gilt cord on
the banner; soft light shadows under physical objects, every other frame a hairline, and no glass.

Styles: worlds/jadugar.css, everything under .w-jadugar. Interface gaps worked around here (no library file changed):
the two new screens (Believe and the chapter title card) are added to lib.SCREENS under jadugar_* names so `shows` can
draw them, and the face-down card glyph for the check pool is added to lib.IC as 'jdcard'."""

tx, al, ic, NM = lib.tx, lib.al, lib.ic, lib.NM

# one check in the pool: a playing card with a diamond on its back (the library's icon set has no card)
lib.IC.setdefault('jdcard', '<rect x="5.5" y="2.5" width="13" height="19" rx="2"/><path d="M12 7.5l3 4.5-3 4.5-3-4.5z"/>')

TROUPE = ('Chandni Mandal', 'चाँदनी मंडल')
SHOW = ('Show 214', 'शो 214')

# ---------- the show's own story (O15): drafts for the owner and a native Hindi speaker, listed in
# knowledge/content/world-voices.md. Who closes tonight's show, among the troupe; the magician says the lines. ----------
STAT_KEYS = {'jd-stage': (None, ('years', 'साल'), ('years on stage', 'मंच पर साल')),
             'jd-missed': (None, ('missed', 'छूटे'), ('shows missed', 'छूटे शो'))}
TWIN = {'q': ('Who closes the show tonight?', 'आज रात आख़िरी खेल में किसे भेजें?'),
        'speaker': ('salim', 'Kader, magician', 'क़ादर, जादूगर'), 'keys': ['jd-stage', 'jd-missed'],
        'people': [('kamla', [('jd-stage', '9'), ('jd-missed', '1')], ('Great on stage, but moody.', 'मंच पर कमाल, पर मूडी।')),
                   ('arjun', [('jd-stage', '15'), ('jd-missed', '4')], ('Crowd favourite, often late.', 'भीड़ के चहेते, अक्सर लेट।')),
                   ('raju', [('jd-stage', '9'), ('jd-missed', '1')], ('Great on stage, but intense.', 'मंच पर कमाल, पर जुनूनी।')),
                   ('anita', [('jd-stage', '3'), ('jd-missed', '0')], ('New, still learning the rope trick.', 'नई हैं, रस्सी वाला खेल सीख रही हैं।'))],
        'pair': (0, 2), 'words': ('moody', 'intense'),
        'swapped': (('Great on stage, but intense.', 'मंच पर कमाल, पर जुनूनी।'), ('Great on stage, but moody.', 'मंच पर कमाल, पर मूडी।'))}
COVER_LINE = ('One night only. The cot flies.', 'सिर्फ़ एक रात। खाट उड़ेगी।')
HARD_LINE = ('Today, at a wedding.', 'आज, एक शादी में।')
# the Board's road names are show names, all invented
ROADS = {'friends': ('Gayab Kabootar', 'Hawa Mein Gulab', 'Rassi Ka Jadoo', 'Khaali Topi'),
         'top': ('Udta Qaleen', 'Jaadui Lalten', 'Paani Mein Aag'),
         'near': ('Hawa Mein Gulab', 'Chamakti Chadar', 'Rassi Ka Jadoo', 'Khaali Topi', 'Baksa Number Teen')}

# ---------- Believe: the new kind of puzzle, drawn here first ----------
# Four tellers say what happened; Sarla and Naresh tell the same story (the hidden pair) and match on both numbers (owner,
# 22 Oct: Believe cards keep their numbers). One named voice sets the scene. The magician, Kader, speaks for the world, so he
# is never a card: the teller who was Salim is now Mitali.
BELIEVE_SCENE = ('The ticket money came up short.', 'टिकट के पैसे कम निकले।')
BELIEVE = [('kamla', [('jd-stage', '7'), ('jd-missed', '2')], ('Two men slipped in without tickets.', 'दो आदमी बिना टिकट घुस आए।')),
           ('anita', [('jd-stage', '12'), ('jd-missed', '0')], ('It was counted wrong at the booth.', 'टिकट घर पर गिनती ग़लत हुई।')),
           ('raju', [('jd-stage', '7'), ('jd-missed', '2')], ('Two men slipped in without tickets.', 'दो आदमी बिना टिकट घुस आए।')),
           ('pammi', [('jd-stage', '3'), ('jd-missed', '1')], ('The box was short before the show.', 'शो से पहले ही डिब्बे में पैसे कम थे।'))]


def teller(world, who, pairs, q, state=''):
    """A teller's playing card: the person card, with its two numbers; the account as its one line."""
    en, hi = lib.nm(world, who)
    on = 'true' if 'is-selected' in state else 'false'
    qid = lib.uid('q')
    return (f'<button class="tile jd-teller {state}" type="button" role="radio" aria-checked="{on}"{al(*[lib.named(world, x) for x in lib.spoken(who, pairs)])} aria-describedby="{qid}" data-en="{en}" data-hi-name="{hi}">'
            f'<span class="tick" aria-hidden="true">{ic("tick")}</span><span class="armmark" aria-hidden="true">{ic("arrow")}</span><span class="lockmark" aria-hidden="true">{ic("lock")}</span>'
            f'<span class="face" style="background-image:url({lib.face(world, who)})" aria-hidden="true"></span>'
            f'<span class="nmrow" aria-hidden="true"><span class="nm" data-hi="{hi}">{en}</span></span>{lib.stats(pairs)}'
            + tx('span', f'“{q[0]}”', f'“{q[1]}”', 'quote', f' id="{qid}"') + '</button>')


def step_believe(world, sel=None, cls='', lang=None, committing=False):
    W = lib.WORLDS[world]
    qid = lib.uid('h')
    cards = ''.join(teller(world, w, p, q, ('is-selected' if w == sel else '') + (' is-committing' if committing else '')) for w, p, q in BELIEVE)
    btn = lib.main('Pick one', 'किसी एक को चुनें', 'Believe {n}', '{n} की बात मानें', 'is-live' if sel else 'is-wait', 'is-committing' if committing else '', n=lib.nm(world, sel) if sel else None)
    small = 'is-small' in cls or 'is-200' in cls
    grid = 'tiles jd-tellers is-committing' if committing else 'tiles jd-tellers'
    inner = (lib.topbar('step', W.plate('believe'))
             + lib.body(lib.h1q('Whose story do you believe?', 'आप किसकी बात मानेंगे?', qid),
                        lib.voice(world, 'vikram', 'Gopal, manager', 'गोपाल, मैनेजर', *BELIEVE_SCENE), lib.statkey(['jd-stage', 'jd-missed']),
                        f'<div class="{grid}" data-n="4" role="radiogroup" aria-labelledby="{qid}">{cards}</div>', cls='has-more' if small else '')
             + (lib.more_cue(104) if small else '') + lib.dock(btn))
    return lib.phone(world, inner, f'{W.title} Believe step', 'js-pick ' + cls, W.scene(W.moment('believe')), W.art_cls, lang)


# ---------- the starter: this world's chapter title card (library.chapter_card, Jadugar.chapter_top) ----------
def chapter_card(world, lang=None, cls='', display=False, c=None):
    """Chapter 3 of 5, trust. display sets the area in the cover title's face (the choice under "Lettering")."""
    ph = lib.chapter_card(world, lang, cls, c)
    return ph.replace('class="jd-chapter"', 'class="jd-title"', 1) if display else ph


lib.SCREENS['jadugar_believe'] = step_believe
lib.SCREENS['jadugar_chapter'] = chapter_card


# ---------- the show bill and the cloth ----------
def showbill(score, h1=True):
    """The handbill: the show number printed in the crimson head band (the troupe is already the screen's day plate, so
    it is not said twice), then the score filled in. Over it, the painted cloth (a raster) slides off to the right inside
    the bill's clip; the gathered cloth is left at the edge."""
    tag = 'h1' if h1 else 'p'
    band = tx('span', SHOW[0], SHOW[1], 'jd-billband')
    return (f'<div class="jd-stage"><div class="jd-showbill">{band}'
            f'{tx("span", "Score", "स्कोर", "level")}<{tag} class="score jd-fill">{tx("span", "Score ", "स्कोर ", "vh")}{score}</{tag}>'
            '<span class="jd-cloth" aria-hidden="true"></span><span class="jd-gathered" aria-hidden="true"></span></div></div>')


# The library's script knows nothing of the cloth, so the Motion demo carries its own: "Pull the cloth" replays the
# reveal, and a tap on any show bill skips a reveal still running (the rule: at most 1.2 s, a tap skips it).
PULL_JS = ('<script>document.querySelectorAll("[data-jd-pull]").forEach(function (b) { b.addEventListener("click", function () {'
           ' b.closest(".frame").querySelectorAll(".jd-cloth, .jd-gathered").forEach(function (c) { c.style.animation = "none"; void c.offsetWidth; c.style.animation = ""; }); }); });'
           ' document.querySelectorAll(".w-jadugar .jd-stage").forEach(function (s) { s.addEventListener("click", function () {'
           ' s.querySelectorAll(".jd-cloth, .jd-gathered").forEach(function (c) { c.style.animation = "none"; }); }); });</script>')


class Jadugar(lib.World):
    id = 'jadugar'
    name = ('Jadugar', 'जादूगर')
    voice = ('Dekhiye, dekhiye! Each day is one night of a travelling jadoo show in a small town.',
             'देखिए, देखिए! हर दिन किसी छोटे शहर में आए जादू के शो की एक रात है।')
    palette = [('jadugar-night', '#1A1F4A', 'Night ground'), ('jadugar-card', '#FBF5E8', 'Card stock: every card and bill starts here'),
               ('jadugar-ink', '#17110F', 'Text on card, 17.2:1'), ('jadugar-crimson', '#9E1B32', 'Curtain crimson: the cloth, card backs, Play; card text on it 7.3:1, never bare on the night'),
               ('jadugar-gold', '#B08A3E', 'Old gold: gilt edges and rules only, 4.9:1 on the night'), ('jadugar-emerald', '#1F6B4F', 'Emerald felt: the card table, in a gilt edge'),
               ('jadugar-muted', '#4A4E80', 'Not-ready fill, card text 7.2:1'),
               ('jadugar-showgold', '#F2D27A', 'Show-bill gold: the cover title only, lettered on the crimson banner')]
    contrast = [('Ink on Jadugar card', '#17110F', '#FBF5E8', 7, 'text on paper'), ('Card on Jadugar night', '#FBF5E8', '#1A1F4A', 4.5, 'text'),
                ('Card on curtain crimson', '#FBF5E8', '#9E1B32', 7, 'button and banner text'), ('Card on Jadugar muted (not ready)', '#FBF5E8', '#4A4E80', 7, 'button text'),
                ('Card on emerald felt', '#FBF5E8', '#1F6B4F', 4.5, 'text on the card table'), ('Old gold against the night', '#B08A3E', '#1A1F4A', 3, 'frames and the active tab'),
                ('Crimson against Jadugar card', '#9E1B32', '#FBF5E8', 3, 'card backs and stamps'), ('Curtain crimson on the night (gilt-edged)', '#9E1B32', '#1A1F4A', 3, 'needs its gilt edge'),
                ('Soft label on Jadugar deep night', '#C9CBE6', '#10132E', 4.5, 'resting tab labels'), ('White focus ring against Jadugar night', '#FFFFFF', '#1A1F4A', 3, 'focus'),
                ('Ink focus ring against Jadugar card', '#17110F', '#FBF5E8', 3, 'focus'),
                ('Show gold on the banner\'s lightest velvet', '#F2D27A', '#A3203A', 3, 'the cover title, large')]
    fonts = ['Yatra+One']
    display_face = 'Yatra One'
    type_row = ('ts-jadugar', 'Udti Khaat', 'उड़ती खाट', 'Yatra One 400, 45, the cover title only. Hindi 1.3')
    shapes = {'radii': '0 bills, plates, banners, sheets and the small face-down cards; 8 cards, chips and slots; round',
              'spent': 'A card turned face down on the row',
              'depth': 'Brass and gilt under one light high on the left: gilt-edged cards, one gilt rule in each bill, spun-brass caps on the boxes; soft shadows (6 to 14%) under cards, bills, boxes and plates; the cloth, boxes and basket are painted plates'}
    card_word = 'playing cards'
    scenes = {'cot': 'jadugar-s-cot', 'rope': 'jadugar-s-rope', 'trunk': 'jadugar-s-trunk', 'rickshaw': 'jadugar-s-rickshaw', 'booth': 'jadugar-s-booth'}
    moments = {'default': 'cot', 'twin': 'rope', 'rule': 'trunk', 'jobs': 'trunk', 'checks': 'booth', 'team': 'rickshaw', 'sort': 'rickshaw',
               'words': 'booth', 'crowd': 'cot', 'look': 'rope', 'board': 'booth', 'cover': 'cot', 'cover_hard': 'trunk', 'result': 'cot',
               'sunday': 'rickshaw', 'change': 'rope', 'month': 'trunk', 'believe': 'booth', 'chapter': 'rope'}
    art_cls = 'veil'
    face_prefix = 'jadugar'
    plates = {'default': TROUPE, 'board': ('Front row', 'पहली क़तार')}
    chapter = {'n': 3, 'area': ('Trust', 'भरोसा'), 'year': '1984',
               'line': ('Show nights, and harassment reports backstage.', 'शो की रातें, और परदे के पीछे छेड़छाड़ की शिकायतें।')}
    chapter_marks = 'jd-marks'
    places = (TROUPE[0],)
    week = ['rope', 'trunk', 'booth', 'rickshaw', 'cot', 'rope']
    next_line = ('Next show tomorrow', 'अगला शो कल')
    stat_keys = STAT_KEYS
    twin = TWIN
    cover_line = COVER_LINE
    hard_line = HARD_LINE
    roads = ROADS
    share_label = (f'{TROUPE[0]} · {SHOW[0]}', f'{TROUPE[1]} · {SHOW[1]}')
    check_glyph = 'jdcard'
    sort = (('Announce this from the rickshaw?', 'क्या रिक्शे से इसका ऐलान हो?'),
            ('Rabia wants to be the jadugar. Girls only hold the cloth.', 'राबिया जादूगर बनना चाहती है। लड़कियाँ तो बस कपड़ा पकड़ती हैं।'),
            ('Announce', 'ऐलान करें'))
    words = [('careful', 'सावधान'), ('bossy', 'दबंग'), ('stingy', 'कंजूस'), ('None of these', 'इनमें से कोई नहीं')]
    signature = 'the result pulls a crimson cloth off the show bill.'
    notes = {'hero': 'One night of the show',
             'twin.wait': 'The same skeleton, dressed as playing cards; the button says what is missing.',
             'twin.pick': 'The pick prints yellow over the card.',
             'believe.wait': 'Believe, the new kind, drawn here first: four accounts, two of them the same story. Gopal sets the scene.',
             'believe.pick': 'Pick, then confirm: the button names whom you believe.',
             'rule': 'The rule chips on the night, under a gilt plate.', 'jobs': 'The jobs are the magician\'s boxes and a basket; Cyrus is held.',
             'checks': 'A check is a card turned face down on the row; one card is left in the pool.',
             'team': 'The team on playing cards laid on their side.', 'sort': 'Pushpa aunty\'s line, to be called out from the rickshaw or cut.',
             'words': 'A note pinned in the booth, with one blank.', 'crowd': 'Pick a card: ten guesses dealt on the felt.',
             'result': 'The reveal, caught half way: the crimson cloth comes off the show bill in under 1.2 s; a tap skips it.',
             'result.still': 'Reduced motion: no pull, the cloth already drawn back. The same end picture as the moving one.',
             'sunday': 'The week is a hand of six cards on the felt: face up when played, face down for the day off.',
             'look': 'The equal pair on card stock.', 'board.friends': 'The front row: your friends on the show\'s bill.',
             'board.everyone': 'Your band, the top 3, then two above and two below you.', 'board.menu': 'A tap on a row opens one action.',
             'board.toast': 'Undo stays at least 5 s, above the tabs.',
             'sheet.help': 'The "?" sheet hangs under a curtain valance; solid card stock, no frame.',
             'sheet.numbers': 'Three plain lines; the trick is never named.', 'sheet.about': 'The one place with the small credit.',
             'sheet.settings': 'On is crimson with the knob moved right and a tick, never colour alone.',
             'hi.step': 'Every string and spoken name in Hindi.', 'hi.believe': 'Believe in Hindi, Sarla picked.',
             'hi.cover': 'Yatra One carries the title in Devanagari.', 'hi.chapter': 'The chapter title card in Hindi.',
             'big.step': 'One column of cards with upright portraits; the cue\'s fade falls on a picture, never on words.',
             'big.believe': 'Four accounts at 200%, one column, upright portraits, a cue.',
             'big.cover': 'Nothing clipped or overlapping.', 'big.chapter': 'The chapter card at 200%.', 'big.result': 'The bill and the slip stack.',
             'big.sunday': 'Three cards to a row.', 'big.board': 'Rows grow; nothing truncates.',
             'small.step': 'Scrolls once, with a cue.', 'small.believe': 'Scrolls once, with a cue.',
             'small.cover': 'The cover at 360 x 640.', 'small.result': 'The bill and slip at 360 x 640.',
             'resp.step': 'The rope trick fills the screen; the cards sit on their side over the night.',
             'resp.cover': 'The floating cot at full width; the banner, the title and Play on the open side.',
             'resp.result': 'The show bill over the stage; the slip in the column.',
             'resp.sunday': 'The hand of six on the felt over the painting; the look-again pair in the column.',
             'resp.board': 'Friends and Everyone side by side; the switch is only needed on narrow screens.',
             'resp.tablet': 'The rope trick behind; the cards gathered low.'}
    shows = {'twin': [('twin', {}, '{w}, not ready', 'twin.wait'), ('twin', {'sel': 'kamla'}, '{w}, picked', 'twin.pick'),
                      ('jadugar_believe', {}, '{w}, Believe, not ready', 'believe.wait'), ('jadugar_believe', {'sel': 'kamla'}, '{w}, Believe, picked', 'believe.pick')],
             'result': [('result', {'cls': 'jd-mid'}, '{w} result, the reveal', 'result'), ('result', {'cls': 'jd-still'}, '{w} result, still', 'result.still')],
             'hi_step': [('twin', {'lang': 'hi'}, 'Hindi, {w} step', 'hi.step'), ('jadugar_believe', {'lang': 'hi', 'sel': 'kamla'}, 'Hindi, {w} Believe', 'hi.believe')],
             'hi_cover': [('cover', {'lang': 'hi'}, 'Hindi, {w} cover', 'hi.cover'), ('jadugar_chapter', {'lang': 'hi'}, 'Hindi, {w} chapter title card', 'hi.chapter')],
             'big_step': [('twin', {'cls': 'is-200'}, '200%, {w} step', 'big.step'), ('jadugar_believe', {'cls': 'is-200'}, '200%, {w} Believe', 'big.believe')],
             'big_cover': [('cover', {'cls': 'is-200'}, '200%, {w} cover', 'big.cover'), ('jadugar_chapter', {'cls': 'is-200'}, '200%, {w} chapter title card', 'big.chapter')],
             'small_step': [('twin', {'cls': 'is-small'}, '360 x 640, {w} step', 'small.step'), ('jadugar_believe', {'cls': 'is-small'}, '360 x 640, {w} Believe', 'small.believe')]}

    def chapter_top(self, b):
        # Full screen, no tabs. The five chapter cards (the finished ones face up), the area as the h1, the setting under
        # it, then one level line (no kicker above the heading)
        return ('<div class="coverstack"><div class="plate hug jd-chapterplate">' + b['marks'] + tx('h1', *b['area'], 'jd-chapter')
                + tx('p', *b['line'], 'coverline') + tx('span', f"{b['of'][0]} · {b['when'][0]}", f"{b['of'][1]} · {b['when'][1]}", 'level') + '</div></div>')

    def cover_top(self, hard, line, level, nxt, kept):
        """The mast names the troupe and the show number; the title hangs on the crimson banner."""
        title, show = ((('Sandook Ka Raaz', 'संदूक का राज़'), ('Show 215', 'शो 215')) if hard else (('Udti Khaat', 'उड़ती खाट'), SHOW))
        return (f'<div class="jd-mast">{tx("span", TROUPE[0], TROUPE[1])}{tx("span", show[0], show[1])}</div>' + kept
                + '<div class="coverstack"><div class="jd-banner">' + tx('h1', title[0], title[1], 'jd-title') + '</div><div class="plate hug">'
                + ('' if nxt or not line else tx('p', line[0], line[1], 'coverline')) + tx('span', level[0], level[1], 'level') + nxt + '</div></div>')

    def app_meta(self, kind, line=None, level=None):
        if kind == 'step':
            return ''
        return (f'<div class="jd-mast">{tx("span", TROUPE[0], TROUPE[1])}{tx("span", SHOW[0], SHOW[1])}</div>'
                '<div class="coverstack"><div class="jd-banner">' + tx('h1', 'Udti Khaat', 'उड़ती खाट', 'jd-title') + '</div><div class="plate hug">'
                + tx('p', line[0], line[1], 'coverline') + tx('span', level[0], level[1], 'level') + '</div></div>')

    def jobs_obj(self, states):
        kinds = ('box', 'basket', 'box')
        return ('<div class="jd-boxes">' + ''.join(f'<div class="jd-box is-{k}">{lib.slot(j[0], st, who, self.id, job_hi=j[1])}</div>'
                                                   for k, j, (st, who) in zip(kinds, lib.JOBS, states)) + '</div>')

    def checks(self, p_eq, p_other):
        w = self.id
        down = '<span class="jd-downs"><i class="jd-back"></i><i class="jd-back"></i></span>'
        none = '<span class="jd-downs"></span>'
        rws = (lib.row(w, 'anita', lib.stats(p_eq) + down, role=None, label=lib.spoken('anita', p_eq, ', checked twice', ', दो बार जाँचा'))
               + lib.row(w, 'raju', lib.stats(p_eq) + none, role=None, label=lib.spoken('raju', p_eq))
               + lib.row(w, 'pammi', lib.stats(p_other) + none, role=None, label=lib.spoken('pammi', p_other)))
        pool = f'<div class="pool jd-pool" role="img"{al("1 check left", "1 जाँच बाकी")}><i class="jd-back"></i><i class="jd-back is-spent"></i><i class="jd-back is-spent"></i></div>'
        return rws, pool

    def letter_obj(self):
        return (f'<div class="jd-bill is-note"><p class="letter"{lib.NOCOUNT}>{tx("span", "“Pushpa keeps the ticket money. The troupe calls her", "“टिकट के पैसे पुष्पा रखती है। मंडली उसे")} '
                f'<span class="blank" role="img"{al("blank", "ख़ाली जगह")}>&nbsp;</span>{tx("span", ".”", " कहती है।”")}</p>'
                + lib.byline(self.id, 'arjun', 'Cyrus, drummer', 'साइरस, ढोलवाला') + '</div>')

    def crowd_obj(self, qid):
        cards = ''.join(f'<button class="chip" type="button" role="radio" aria-checked="false">{v}%<span class="ctick" aria-hidden="true">{ic("tick")}</span></button>' for v in range(10, 101, 10))
        return f'<div class="jd-felt"><div class="chips is-grid5" role="radiogroup" aria-labelledby="{qid}">{cards}</div></div>'

    def result_parts(self, score, figs_, week, line, end=' at-end'):
        return showbill(score), f'<div class="slip on-paper{end}">{figs_}{week}{tx("p", line[0], line[1], "letter")}</div>'

    def dayobj(self, state, key, letter, stamp):
        style = f' style="background-image:url({self.scene(key)})"' if key and state != 'forgiven' else ''
        return f'<span class="dayobj jd-day {state}"{style}>{stamp}{letter}</span>'

    def week_obj(self, view, days):
        if view == 'day1':
            return f'<div class="jd-felt jd-hand lockpage">{days}</div>'
        figs_ = lib.figs2() if view == 'sunday' else lib.figsx('88', '41', '12') if view == 'report' else ''
        return f'<div class="jd-felt jd-hand">{days}{figs_}</div>'

    def month_obj(self, lean):
        return (f'<div class="jd-bill"><div class="jd-billhead">{tx("span", "October", "अक्टूबर")}<span class="serial">No. 218</span></div>{lean}</div>')

    def rank(self, r):
        return f'<span class="rk jd-rank">{r}</span>'

    def board_list(self, rows):
        return f'<div class="jd-bill is-list"><ol class="list">{rows}</ol></div>'

    def board_panels(self, friends, everyone):
        fr = f'<div class="jd-bill is-list"><div class="jd-billhead">{tx("span", "Friends", "दोस्त")}<span class="serial">No. 214</span></div><ol class="list">{friends}</ol></div>'
        ev = (f'<div class="jd-bill is-list board-everyone"><div class="jd-billhead">{tx("span", "Everyone", "सब")}{tx("span", "Top 9%", "टॉप 9%")}</div>'
              f'<ol class="list">{everyone}</ol></div>')
        return fr, ev

    def share_card(self):
        return (f'<div class="sharecard world {self.cls}"><div class="art" style="background-image:url({self.scene("cot")})"></div><div class="sc-in">'
                f'{tx("span", *self.share_label, "level")}<span class="sc-line">{self.road_you}</span>'
                f'<span class="sc-marks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>{tx("span", "Day 6", "दिन 6", "sc-line")}</div></div>')

    def sheet_dress(self, layer):
        return '<div class="jd-valance" aria-hidden="true"></div>'

    def objects(self):
        w = self.id
        a, b = self.twin_pair()
        cards = ('<div class="pg-row" style="align-items:flex-start"><div style="width:180px">' + lib.tile(w, *a) + '</div>'
                 '<div style="width:180px">' + lib.tile(w, *b, 'is-selected') + '</div></div>')
        bills = ''.join(f'<div class="jd-demo {c}">{showbill("86", h1=False)}</div>' for c in ('jd-covered', 'jd-mid', 'jd-still'))
        rws, pool = self.checks([('ledger', '9'), ('pause', '2')], [('ledger', '6'), ('pause', '0')])
        tellers = ('<div class="pg-row" style="align-items:flex-start"><div style="width:180px">' + teller(w, 'kamla', BELIEVE[0][1], BELIEVE[0][2]) + '</div>'
                   '<div style="width:180px">' + teller(w, 'raju', BELIEVE[2][1], BELIEVE[2][2]) + '</div></div>')
        return [('Playing card (person card)', cards,
                 'Gilt-edged linen card stock: one gilt hairline at the card\'s edge, bright where it faces the light, and a soft shadow under it. The numbers stand in the top-left corner as the card\'s index, rank over suit: each number over its icon, printed in ink; the portrait, set a little into the card, beside them; the name; the line in Body, its opening quote hung in the margin.',
                 'card stock, ink, gilt; radius 8; Headline numerals; Body line', 'rest, hover, pressed, picked (yellow printed over the card, a 2 px ink frame, lifted a little further, a paper tick on the portrait), held, focus, committing, revisited',
                 'One stop per card: name and numbers spoken, the line as its description. The numbers are hidden from the screen reader; the spoken name carries them.'),
                ('Show ticket stub (day plate)', lib.topbar('step', self.plate('default')),
                 'Card stock that hugs the troupe\'s name, in Label ink. The stub end carries one crimson diamond pip and a row of perforations; the far end is punched through, the hole ringed in brass; a notch in each short edge. At 200% the stub fills the bar and the hole is left out, so the name stays on one line.',
                 'card stock, ink, crimson pip, brass ring; radius 0; the notches and the hole by mask',
                 'one state; never tappable', 'The plate is the bar\'s title text; the perforations, notches and punched hole are paint.'),
                ('The show bill and the cloth (result)', f'<div class="pg-row" style="align-items:flex-start">{bills}</div>',
                 'A handbill on card stock, centred under the cot\'s spotlight: the show number printed in card white on the crimson head band, a hairline edge with one gilt rule 6 px inside it, on a soft shadow, then the score filled in on a ruled line. A painted crimson velvet cloth with a gold fringe covers it and slides off to the right inside the bill\'s edge; the same cloth is left bunched and tied back at the right edge.',
                 'card stock, ink, crimson, gold; painted cloth plates; Score 36; radius 0', 'covered, half way, drawn back (also the still state: only the gathered cloth)',
                 'The score is the result screen\'s h1 and is in the page from the start; the cloth is paint, hidden from screen readers. At most 1.2 s, a tap skips it, and reduced motion shows only the gathered cloth, with no movement.'),
                ('Cards turned face down (checks)', pool + '<div style="height:12px"></div><div class="rows">' + rws + '</div>',
                 'Each spent check is a small gilt-edged card laid face down on the row, a margin of card stock round its crimson back with a gold lattice. The pool holds what is left; spent cards leave a gold outline.',
                 'crimson, gold, card; radius 0 at this size', '0, 1 or 2 cards on a row; pool: left, spent', 'The count is spoken on the row ("checked twice") and the pool is one image, "1 check left".'),
                ('Boxes and baskets (jobs)', self.jobs_obj(lib.JOB_STATES),
                 'Each job is a magician\'s box (painted crimson lacquer, one fine gilt trim line, spun-brass corner caps with a domed rivet, lit from the top left) or a woven cane basket, both painted 9-slice frames on a soft shadow, and its slot is the opening you put someone into.',
                 'painted frame plates, the shared slot; radius 0 boxes, 8 slots', 'slot: empty, target, filled, refused, revisited', 'Each slot is named "Job, person" or "Job, empty"; the box is paint.'),
                ('Pick a card (crowd guess)', self.crowd_obj('objq_jd'),
                 'Ten guesses dealt as gilt-edged cards on the emerald felt, which sits a little sunk in one gilt edge so it holds on the night.', 'felt, gilt, card, ink; pick yellow when chosen',
                 'rest, pressed, picked', 'A radio group named by the question.'),
                ('The hand of six (Sunday)', self.week_obj('sunday', lib.dayobjs(w)),
                 'The week as six gilt-edged cards on the felt: face up showing the night\'s painting when played, face down with "off" for the forgiven day, an outline when not played. The figures sit under the hand in card white.',
                 'felt, gilt, card, crimson back', 'played, off, not played', 'The hand is one image with a spoken summary; the figures are text.'),
                ('Believe: the tellers (new kind)', tellers,
                 'A teller is the person card: portrait, name, the two numbers (years on stage, shows missed) and the account as the line. Two tellers tell the same story and match on both numbers; the others differ. One named voice sets the scene above them.',
                 'as the person card; Body line', 'rest, picked, committing', 'One stop per teller: the name and both numbers spoken, the account as its description. The main button says "Believe Sarla".'),
                ('Chapter title card (the starter)', lib.thumb(chapter_card(w)),
                 'The rope trick full bleed; at the foot, a gilt plate with five chapter cards (two face up, this one face down, two to come), the area named plainly, the chapter\'s setting under it, then one line, "Chapter 3 of 5 · 1984 · About 4 minutes"; Start in the dock. No tabs.',
                 'night plate, gilt edge, card, crimson back; Hind 700 36 for the area', 'first time (Start), begun (Continue), no signal, a retake',
                 'The area is the screen\'s h1; the five cards are paint and the "Chapter 3 of 5" line is read.')]

    def choices(self):
        w = self.id
        return [(100, lambda: lib.ab_item("The magician's call", 'The world speaks as the magician, "Dekhiye, dekhiye!". The rules keep exclamations for a real win, so for now the call is only on the world card.',
                    [('A', 'Only on the world card', lib.frame(w, f'<div class="jd-demo jd-still">{showbill("86", h1=False)}</div>'), True),
                     ('B', 'Called once as the cloth comes off', lib.frame(w, f'<div class="jd-demo jd-mid">{showbill("86", h1=False)}</div><div style="height:12px"></div>' + tx('p', 'Dekhiye, dekhiye!', 'देखिए, देखिए!', 'nextline')), False)])),
                (101, lambda: lib.ab_item('Lettering on the chapter title card', 'The display face is kept for the cover title. The chapter card is a title card too, so it could carry it.',
                    [('A', 'Hind, like every other word', lib.thumb(chapter_card(w)), True), ('B', 'Yatra One, like the cover title', lib.thumb(chapter_card(w, display=True)), False)])),
                (102, lambda: lib.ab_item('The button outside a puzzle', 'Play, Share and Start are the curtain itself: crimson velvet in one gilt edge. A card-white button would match the people cards instead.',
                    [('A', 'Curtain crimson, gilt edge', lib.frame(w, lib.out_btn('Play', 'खेलें')), True), ('B', 'Card white, gilt edge', lib.frame(w, lib.out_btn('Play', 'खेलें', extra='jd-cream')), False)]))]

    def signature_demo(self):
        return lib.frame(self.id, f'<div class="pg-row"><div class="jd-demo">{showbill("86", h1=False)}</div>'
                                  '<button class="textbtn" type="button" data-jd-pull>Pull the cloth</button></div>' + PULL_JS)


WORLD = Jadugar
