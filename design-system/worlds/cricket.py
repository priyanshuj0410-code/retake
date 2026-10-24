"""Cricket (क्रिकेट): the old stadium under floodlights. The hand-hung scoreboard, the scorecard and the commentator.

A world module for design-system/library.py (knowledge/architecture/world-modules.md). Red and green never carry
meaning here: every state is a shape (a filled or hollow ball, a ring, a tick), so the world reads the same to a
colour-blind player. Khand sets the cover title and the scoreboard numerals; Hind sets every word that is read.
The metal finish (O14) is brushed aluminium and steel, drawn in worlds/cricket.css over two procedural rasters
(assets/cricket-alu.webp, assets/cricket-steel.webp; their sidecars carry the generator)."""

tx, al, ic = lib.tx, lib.al, lib.ic
NM = lib.NM

# The library's icon set has no ball, and the checks are balls in an over: register one before any page is drawn.
lib.IC.setdefault('ball', '<circle cx="12" cy="12" r="8.5"/><path d="M8.7 4.2c2.1 4.3 2.1 11.3 0 15.6M15.3 4.2c-2.1 4.3-2.1 11.3 0 15.6"/>')

TITLE = ('Purana Maidan', 'पुराना मैदान')

# ---------- the old ground's own story (O15): drafts for the owner and a native Hindi speaker, listed in
# knowledge/content/world-voices.md. Who goes out as captain today; the coach says the lines. ----------
STAT_KEYS = {'cr-match': (None, ('matches', 'मैच'), ('matches played', 'खेले मैच')),
             'cr-win': (None,
                        ('wins', 'जीत'), ('matches won', 'जीते मैच'))}
TWIN = {'q': ('Who do you send as captain?', 'कप्तान बनाकर किसे भेजें?'),
        'speaker': ('meena', 'Shirin, coach', 'शीरीं, कोच'), 'keys': ['cr-match', 'cr-win'],
        'people': [('kamla', [('cr-match', '40'), ('cr-win', '22')], ('Bossy with the bowlers.', 'गेंदबाज़ों के साथ दबंग।')),
                   ('salim', [('cr-match', '64'), ('cr-win', '30')], ('Safe hands, slow to change plans.', 'भरोसेमंद, पर प्लान बदलने में धीमे।')),
                   ('raju', [('cr-match', '40'), ('cr-win', '22')], ('Assertive with the bowlers.', 'गेंदबाज़ों के साथ दमदार।')),
                   ('anita', [('cr-match', '12'), ('cr-win', '8')], ('New to the side, reads the pitch well.', 'टीम में नई, पिच अच्छी पढ़ती हैं।'))],
        'pair': (0, 2), 'words': ('Bossy', 'Assertive'),
        'swapped': (('Assertive with the bowlers.', 'गेंदबाज़ों के साथ दमदार।'), ('Bossy with the bowlers.', 'गेंदबाज़ों के साथ दबंग।'))}
COVER_LINE = ('One innings at the old ground.', 'पुराने मैदान पर एक पारी।')
HARD_LINE = ('Today, at the team hostel.', 'आज, टीम के हॉस्टल में।')
# the Board's road names are grounds, all invented
ROADS = {'friends': ('Neem Wala Maidan', 'Taalab Ground', 'Kachchi Pitch', 'Gali Number Chaar'),
         'top': ('Nadi Kinara Maidan', 'Lal Mitti Ground', 'Purani Mill Ground'),
         'near': ('Taalab Ground', 'Bargad Ka Maidan', 'Kachchi Pitch', 'Gali Number Chaar', 'Chhat Wali Pitch')}
POSITIONS = [('Slip', 'स्लिप'), ('Cover', 'कवर'), ('Mid-on', 'मिड-ऑन')]
# the batting order: Agnes and Hari share an average (the hidden pair); the tray order mixes them with the others
POOL = [('raju', '38'), ('anita', '44'), ('kamla', '38'), ('vikram', '31')]
PLACED = [('anita', '44'), ('kamla', '38'), ('raju', '38'), ('vikram', '31')]


def hung(s):
    return '<span class="cr-hps" aria-hidden="true">' + ''.join(f'<i>{c}</i>' for c in s) + '</span>'


def nameboard(title=TITLE, tag='h1', day=('Wednesday', 'बुधवार'), num='214'):
    meta = f'<div class="cr-meta">{hung(num)}{tx("span", day[0], day[1])}</div>' if day else ''
    return f'<div class="cr-namebd">{tx(tag, title[0], title[1], "cr-title")}{meta}</div>'


def scoreboard(score):
    digits = ''.join(f'<i class="cr-hp" style="--i:{k}">{c}</i>' for k, c in enumerate(score))
    return (f'<div class="cr-score">{tx("span", "Score", "स्कोर", "cr-lab")}'
            f'<h1 class="score cr-hung"><span class="vh">Score {score}</span><span class="cr-digits" aria-hidden="true">{digits}</span></h1>'
            f'<div class="cr-third" aria-hidden="true">{tx("span", "Decision pending", "फ़ैसला बाक़ी")}'
            '<span class="cr-lamps"><i></i><i></i><i></i></span></div></div>')


# ---------- the batting order: the rank column (R-RANK-1), filled from the top; a placed player tapped returns ----------
def order_slot(world, i, who=None, target=False, latest=False):
    n = str(i + 1)
    if who:
        w, v = who
        en, hi = (lib.named(world, x) for x in lib.spoken(w, [('bat', v)]))
        inner = (f'<span class="who"><i style="background-image:url({lib.face(world, w)})"></i>{tx("span", lib.nm(world, w)[0], lib.nm(world, w)[1])}</span>'
                 f'{lib.stats([("bat", v)])}<span class="stick">{ic("tick")}</span>')
        lt = ' is-latest' if latest else ''
        return (f'<li><button class="slot cr-pos is-filled{lt}" type="button" data-n="{n}" data-who="{w}"{al(n + ", " + en, n + ", " + hi)}>'
                f'<b class="cr-no" aria-hidden="true">{n}</b>{inner}</button></li>')
    st = ' is-target' if target else ''
    return f'<li><button class="slot cr-pos{st}" type="button" data-n="{n}"{al(n + ", empty", n + ", ख़ाली")}><b class="cr-no" aria-hidden="true">{n}</b></button></li>'


def order_row(world, w, v, placed=False):
    en, hi = (lib.named(world, x) for x in lib.spoken(w, [('bat', v)]))
    hid = ' hidden' if placed else ''
    return (f'<button class="row cr-mini" type="button"{hid}{al(en, hi)} data-en="{lib.nm(world, w)[0]}" data-hi-name="{lib.nm(world, w)[1]}" data-who="{w}">'
            f'<span class="face" style="background-image:url({lib.face(world, w)})" aria-hidden="true"></span>'
            f'<span class="who" aria-hidden="true"><span class="nm" data-hi="{lib.nm(world, w)[1]}">{lib.nm(world, w)[0]}</span>{lib.stats([("bat", v)])}</span></button>')


def step_order(world, placed=0, lang=None, cls=''):
    W = lib.WORLDS[world]
    qid = lib.uid('h')
    col = PLACED[:placed]
    slots = ''.join(order_slot(world, i, col[i] if i < placed else None, i == placed, i == placed - 1) for i in range(4))
    tray = ''.join(order_row(world, w, v, (w, v) in col) for w, v in POOL)
    left = 4 - placed
    btn = lib.main(f'Place {left} more', f'{left} और रखें', 'Lock the order', 'क्रम पक्का करें', 'is-wait' if left else 'is-live')
    inner = (lib.topbar('step', W.plate('team')) + lib.body(lib.h1q('Who opens the batting?', 'ओपनिंग कौन करे?', qid), lib.statkey(['bat']),
             f'<ol class="cr-order" aria-labelledby="{qid}">{slots}</ol>', f'<div class="cr-tray at-end" role="group"{al("Players", "खिलाड़ी")}>{tray}</div>')
             + lib.dock(btn))
    art, ac = W.art('team')
    state = {0: 'at rest', 4: 'all placed'}.get(placed, f'{placed} placed')
    return lib.phone(world, inner, f'{W.title} batting order, {state}', 'js-order ' + cls, art, ac, lang)


# ---------- the starter's chapter title card (SC-91): chapter 4 of 5, teams and leaders (Cricket.chapter_top) ----------
def chapter_card(world, lang=None, cls='', c=None):
    return lib.chapter_card(world, lang, cls, c)


lib.SCREENS['cr_order'] = step_order
lib.SCREENS['cr_chapter'] = chapter_card

# Behaviour the library does not carry: the rank column, and the replay of the scoreboard in the motion section.
SCRIPT = r'''<script>
(() => {
  const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const cur = ph => ph.dataset.cur || 'en';
  const label = (el, en, hi, lang) => { el.dataset.enLabel = en; el.dataset.hiLabel = hi; el.setAttribute('aria-label', lang === 'hi' ? hi : en); };
  document.querySelectorAll('.w-cricket.js-order').forEach(ph => {
    const slots = [...ph.querySelectorAll('.cr-pos')];
    const btn = ph.querySelector('.dock .main');
    const sync = () => {
      const lang = cur(ph);
      const open = slots.filter(s => !s.dataset.who);
      slots.forEach(s => s.classList.toggle('is-target', s === open[0]));
      const left = open.length;
      const en = left ? `Place ${left} more` : 'Lock the order';
      const hi = left ? `${left} और रखें` : 'क्रम पक्का करें';
      const span = btn.querySelector('span[data-hi]');
      span.dataset.en = en; span.dataset.hi = hi; span.innerHTML = lang === 'hi' ? hi : en;
      btn.classList.toggle('is-live', !left); btn.classList.toggle('is-wait', !!left);
      if (left) btn.setAttribute('aria-disabled', 'true'); else btn.removeAttribute('aria-disabled');
    };
    const place = row => {
      const slot = slots.find(s => !s.dataset.who);
      if (!slot) return;
      const lang = cur(ph), n = slot.dataset.n, en = row.dataset.en, hi = row.dataset.hiName;
      slot.dataset.who = row.dataset.who;
      slots.forEach(s => s.classList.remove('is-latest'));
      slot.classList.add('is-filled', 'is-latest');
      slot.insertAdjacentHTML('beforeend', `<span class="who"><i style="background-image:${row.querySelector('.face').style.backgroundImage}"></i><span data-en="${en}" data-hi="${hi}"${lang === 'hi' ? ' lang="hi"' : ''}>${lang === 'hi' ? hi : en}</span></span>${row.querySelector('.stats').outerHTML}<span class="stick">${TICK}</span>`);
      label(slot, `${n}, ${row.dataset.enLabel || row.getAttribute('aria-label')}`, `${n}, ${row.dataset.hiLabel}`, lang);
      row.hidden = true;
      const next = [...ph.querySelectorAll('.cr-mini')].find(r => !r.hidden);
      (next || btn).focus({ preventScroll: true });
    };
    const back = slot => {
      const row = ph.querySelector(`.cr-mini[data-who="${slot.dataset.who}"]`);
      delete slot.dataset.who;
      slot.classList.remove('is-filled', 'is-latest');
      slot.querySelectorAll('.who, .stats, .stick').forEach(e => e.remove());
      label(slot, `${slot.dataset.n}, empty`, `${slot.dataset.n}, ख़ाली`, cur(ph));
      if (row) row.hidden = false;
    };
    ph.querySelectorAll('.cr-mini').forEach(r => r.addEventListener('click', () => { place(r); sync(); }));
    slots.forEach(s => s.addEventListener('click', () => { if (s.dataset.who) { back(s); sync(); } }));
  });
  document.querySelectorAll('[data-cr-replay]').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.w-cricket .cr-score').forEach(s => { s.classList.add('cr-reset'); void s.offsetWidth; s.classList.remove('cr-reset'); });
  }));
})();
</script>'''


class Cricket(lib.World):
    id = 'cricket'
    name = ('Cricket', 'क्रिकेट')
    voice = ('Each day is a match at the old stadium under floodlights, called by the commentator.', 'हर दिन फ़्लडलाइट में पुराने स्टेडियम का एक मैच है, कमेंटेटर की ज़ुबानी।')
    palette = [('cricket-ground', '#151816', 'Scoreboard black ground'), ('cricket-paper', '#F7F5EE', 'Sight-screen white: every card starts here'),
               ('cricket-ink', '#151816', 'Text on paper, 16.4:1'), ('cricket-chalk', '#EFEDE4', 'Hung plates and the cover title, 15.3:1'),
               ('cricket-green', '#2F5D3A', 'Outfield green: bands and the field, never a meaning'), ('cricket-red', '#B22234', 'Cherry red: the ball and its seam, never text or a meaning'),
               ('cricket-muted', '#3A423D', 'Not-ready fill, paper text 9.5:1')]
    contrast = [('Ink on sight-screen white', '#151816', '#F7F5EE', 7, 'text on paper'), ('Chalk on scoreboard black', '#EFEDE4', '#151816', 7, 'text on plates'),
                ('Chalk on a hung plate', '#EFEDE4', '#222824', 7, 'scoreboard numerals'), ('Chalk on outfield green', '#EFEDE4', '#2F5D3A', 4.5, 'field labels'),
                ('Paper on Cricket muted (not ready)', '#F7F5EE', '#3A423D', 7, 'button text'), ('Chalk edge on scoreboard black', '#EFEDE4', '#151816', 3, 'control edge'),
                ('Cherry red against sight-screen white', '#B22234', '#F7F5EE', 3, 'ball mark'), ('Cherry red on scoreboard black (rimmed)', '#B22234', '#151816', 3, 'needs its chalk ball')]
    fonts = ['Khand:wght@600;700']
    display_face = 'Khand'
    type_row = ('ts-cricket', 'Purana Maidan', 'पुराना मैदान', 'Khand 700, 45, the cover title; Khand 600 on scoreboard numerals only. Hindi 1.3')
    shapes = {'radii': '0 scorecards, plates and boards, 4 chips, slots and buttons, round balls and faces', 'spent': 'A ball bowled: the dot filled in',
              'depth': 'Aluminium plates on two steel nails with a polished edge, boards with a steel edge, one light high on the left; soft light shadows under objects, no offset'}
    card_word = 'scorecards'
    # cricket-s-board is cricket-s-scoreboard re-graded to the stumps and nets palette, with the glow right of the board painted out
    scenes = {'stumps': 'cricket-s-stumps', 'scoreboard': 'cricket-s-board', 'dressing': 'cricket-s-dressing', 'nets': 'cricket-s-nets'}
    moments = {'default': 'nets', 'rule': 'dressing', 'jobs': 'dressing', 'checks': 'dressing', 'words': 'dressing', 'sort': 'scoreboard', 'crowd': 'scoreboard',
               'board': 'scoreboard', 'cover': 'stumps', 'cover_hard': 'scoreboard', 'result': 'scoreboard', 'sunday': 'dressing', 'month': 'dressing',
               'chapter': 'scoreboard'}
    art_cls = 'veil'
    face_prefix = 'cricket-face'   # the cricket-<who> portraits re-graded: darker midtones, capped highlights, a sepia backdrop
    plates = {'default': ('<i>Day</i><b>6</b>', '<i>दिन</i><b>6</b>'), 'board': ('<i>Scoreboard</i>', '<i>स्कोरबोर्ड</i>'),
              'sunday': ('<i>Scorecard</i>', '<i>स्कोरकार्ड</i>'), 'look': ('<i>Scorecard</i>', '<i>स्कोरकार्ड</i>'), 'chapter': None}
    chapter = {'n': 4, 'area': ('Teams and leaders', 'टीम और नेतृत्व'), 'year': '1992',
               'line': ("Sunday's finals, and complaints of violence at home.", 'इतवार के फ़ाइनल, और घरेलू हिंसा की शिकायतें।')}
    chapter_marks = 'cr-marks'
    take_plate = (f'<i>{TITLE[0]}</i>', f'<i>{TITLE[1]}</i>')   # chapter 4's ground, named on its title card's board
    week = ['nets', 'dressing', 'scoreboard', 'stumps', 'nets', 'dressing']
    next_line = ('Play resumes tomorrow', 'खेल कल फिर शुरू होगा')
    stat_keys = STAT_KEYS
    twin = TWIN
    cover_line = COVER_LINE
    hard_line = HARD_LINE
    roads = ROADS
    share_label = (f'{TITLE[0]} · No. 214', f'{TITLE[1]} · अंक 214')
    check_glyph = 'ball'
    sort = (('Say this on air?', 'क्या यह ऑन एयर कहें?'), ('She bowls well, for a girl.', 'लड़की होकर भी अच्छी गेंद डालती है।'), ('Air it', 'कहें'))
    words = [('bossy', 'रौबदार'), ('sharp', 'तेज़'), ('lucky', 'क़िस्मत वाली'), ('None of these', 'इनमें से कोई नहीं')]
    signature = 'the third umpire\'s screen holds "Decision pending" for a beat, then the score drops onto the scoreboard plate by plate.'
    notes = {'hero': 'The same day at the old ground', 'twin.wait': 'Scorecards; the numbers on aluminium plates.', 'twin.pick': 'The pick prints yellow over the scorecard.',
             'rule': 'The same chips, on the dressing-room wall.', 'jobs': 'Jobs are fielding positions on the ground.',
             'checks': 'An over of six balls; a check bowled is filled in.', 'team': 'The team sheet; the averages on hung plates.',
             'order.rest': 'The new kind: one numbered column, filled from the top. Agnes and Hari share an average.',
             'order.part': 'Two in; the next place is lit. A placed player tapped goes back.', 'order.full': 'All four in; the button names what happens.',
             'sort': 'The commentary box: air it or cut it.', 'words': "The commentator's card with one blank.", 'crowd': 'The crowd board; nothing set until you pick.',
             'result': 'The score hung on the scoreboard, the figures on a clipped scorecard.', 'result.pending': 'The big moment: the third umpire\'s screen, in its steel bezel, holds it for a beat.',
             'result.still': 'Reduced motion: a cut straight to the hung score; nothing drops or swings.',
             'sunday': 'Six days as six hung plates; a ball is a day played, a ball struck through a day off.', 'look': 'The equal pair on scorecards.',
             'board.friends': 'Friends on the scoreboard.', 'board.everyone': 'Your band, the top 3, then two above and two below you.',
             'board.menu': 'A tap on a row opens one action.', 'board.toast': 'The toast is a hung plate.',
             'sheet.help': 'Sight-screen white with the outfield band.', 'sheet.numbers': 'Three plain lines.', 'sheet.about': 'The one place with the small credit.',
             'sheet.settings': 'On is the knob moved right with a tick, never colour alone.', 'hi.step': 'Every string and spoken name in Hindi.',
             'hi.cover': 'Khand carries the Devanagari title.', 'hi.order': 'The batting order in Hindi, two in.', 'hi.chapter': 'The chapter card in Hindi.',
             'big.step': 'One column; the body scrolls with a cue.', 'big.cover': 'Nothing clipped or overlapping.', 'small.step': 'Scrolls once, with a cue.',
             'resp.step': 'The nets fill the screen; the scorecards sit on their side.', 'resp.cover': 'The stumps at full width; the name board and Play on the open side.',
             'resp.result': 'The hung score and the scorecard over the painting.', 'resp.sunday': 'The week board and the look-again pair side by side.',
             'resp.board': 'Friends and Everyone on two scoreboards.', 'resp.tablet': 'The nets behind; scorecards gathered low.'}
    shows = {'team': [('team', {}, '{w}', 'team'), ('cr_order', {}, '{w}, the batting order', 'order.rest'),
                      ('cr_order', {'placed': 2}, '{w}, the batting order, two in', 'order.part'), ('cr_order', {'placed': 4}, '{w}, the batting order, all in', 'order.full')],
             'result': [('result', {'cls': 'cr-pending'}, '{w} result, decision pending', 'result.pending'), ('result', {}, '{w} result', 'result'),
                        ('result', {'cls': 'cr-still'}, '{w} result, reduced motion', 'result.still')],
             'hi_step': [('twin', {'lang': 'hi'}, 'Hindi, {w} step', 'hi.step'), ('cr_order', {'placed': 2, 'lang': 'hi'}, 'Hindi, {w} batting order', 'hi.order')],
             'hi_cover': [('cover', {'lang': 'hi'}, 'Hindi, {w} cover', 'hi.cover'), ('cr_chapter', {'lang': 'hi'}, 'Hindi, {w} chapter card', 'hi.chapter')]}

    def chapter_top(self, b):
        # the ground's name board, then the chapter on a plate: the marks, the place, the area, the setting, the year
        plate = ('<div class="plate hug cr-chap">' + b['marks'] + tx('span', *b['of'], 'level') + tx('h1', *b['area'], 'bigline')
                 + tx('p', *b['line'], 'coverline') + tx('span', *b['when'], 'level') + '</div>')
        return nameboard(TITLE, 'p', None) + f'<div class="coverstack">{plate}</div>'

    def cover_top(self, hard, line, level, nxt, kept):
        day, num = (('Thursday', 'गुरुवार'), '215') if hard else (('Wednesday', 'बुधवार'), '214')
        return (kept + nameboard(day=day, num=num) + '<div class="coverstack"><div class="plate hug">'
                + ('' if nxt or not line else tx('p', line[0], line[1], 'coverline')) + tx('span', level[0], level[1], 'level') + nxt + '</div></div>')

    def app_meta(self, kind, line=None, level=None):
        if kind == 'step':
            return ''
        return nameboard() + '<div class="coverstack"><div class="plate hug">' + tx('p', line[0], line[1], 'coverline') + tx('span', level[0], level[1], 'level') + '</div></div>'

    def jobs_obj(self, states):
        return '<div class="cr-field"><div class="slots">' + ''.join(lib.slot(p[0], st, who, self.id, job_hi=p[1]) for p, (st, who) in zip(POSITIONS, states)) + '</div></div>'

    def checks(self, p_eq, p_other):
        w = self.id
        ball = '<span class="stampmark">' + ic('ball') + '</span>'
        rws = (lib.row(w, 'anita', lib.stats(p_eq) + f'<span class="stamps">{ball}{ball}</span>', role=None, label=lib.spoken('anita', p_eq, ', checked twice', ', दो बार जाँचा'))
               + lib.row(w, 'raju', lib.stats(p_eq) + '<span class="stamps"></span>', role=None, label=lib.spoken('raju', p_eq))
               + lib.row(w, 'pammi', lib.stats(p_other) + '<span class="stamps"></span>', role=None, label=lib.spoken('pammi', p_other)))
        bowled = '<span class="spent">' + ic('ball') + '</span>'
        pool = f'<div class="pool cr-over" role="img"{al("4 checks left", "4 जाँच बाकी")}>{bowled * 2}{ic("ball") * 4}</div>'
        return rws, pool

    def letter_obj(self):
        return (f'<div class="paperpage cr-comm"><p class="letter"{lib.NOCOUNT}>{tx("span", "“Gita captains the side. Everyone calls her", "“गीता टीम की कप्तान है। सब उसे")} '
                f'<span class="blank" role="img"{al("blank", "ख़ाली जगह")}>&nbsp;</span>{tx("span", ".”", "कहते हैं।”")}</p>'
                + lib.byline(self.id, 'vikram', 'Tenzing, commentator', 'तेनज़िंग, कमेंटेटर') + '</div>')

    def crowd_obj(self, qid):
        opts = ''.join(f'<button class="chip" type="button" role="radio" aria-checked="false">{v}%<span class="ctick" aria-hidden="true">{ic("tick")}</span></button>' for v in range(10, 101, 10))
        return f'<div class="cr-board cr-crowd"><div class="chips is-grid5" role="radiogroup" aria-labelledby="{qid}">{opts}</div></div>'

    def result_parts(self, score, figs_, week, line, end=' at-end'):
        return scoreboard(score), f'<div class="slip on-paper cr-card{end}">{figs_}{week}{tx("p", line[0], line[1], "letter")}</div>'

    def dayobj(self, state, key, letter, stamp):
        # no stamp word on the plate: a day off is the ball struck through, and the week board's label says which day was off
        return f'<span class="dayobj cr-day {state}"><i class="cr-ball"></i>{letter}</span>'

    def week_obj(self, view, days):
        if view == 'day1':
            return f'<div class="cr-board lockpage">{days}</div>'
        figs_ = lib.figs2() if view == 'sunday' else lib.figsx('88', '41', '12') if view == 'report' else ''
        return f'<div class="cr-board cr-week">{days}{figs_}</div>'

    def month_obj(self, lean):
        return f'<div class="cr-board cr-week">{tx("span", "October", "अक्टूबर", "cr-bhead")}{lean}</div>'

    def rank(self, r):
        return f'<span class="rk cr-rk">{r}</span>'

    def board_list(self, rows):
        return f'<div class="cr-board cr-lb"><ol class="list">{rows}</ol></div>'

    def board_panels(self, friends, everyone):
        fr = f'<div class="cr-board cr-lb">{tx("span", "Friends", "दोस्त", "cr-bhead")}<ol class="list">{friends}</ol></div>'
        ev = f'<div class="cr-board cr-lb board-everyone">{tx("span", "Everyone · Top 9%", "सब · टॉप 9%", "cr-bhead")}<ol class="list">{everyone}</ol></div>'
        return fr, ev

    def share_card(self):
        return (f'<div class="sharecard world {self.cls}"><div class="art" style="background-image:url({self.scene("stumps")})"></div><div class="sc-in">'
                f'{tx("span", *self.share_label, "level")}<span class="sc-line">{self.road_you}</span>'
                f'<span class="sc-marks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>{tx("span", "Day 6", "दिन 6", "sc-line")}</div></div>')

    def sheet_dress(self, layer):
        return '<div class="cr-crease" aria-hidden="true"></div>'

    def objects(self):
        w = self.id
        mid = f'<ol class="cr-order">{order_slot(w, 0, PLACED[0])}{order_slot(w, 1, PLACED[1], latest=True)}{order_slot(w, 2, None, True)}{order_slot(w, 3)}</ol>'
        rws, pool = self.checks([('ledger', '9'), ('pause', '2')], [('ledger', '6'), ('pause', '0')])
        return [('Hand-hung scoreboard (the score)', scoreboard('86'),
                 'A black board with a polished steel edge; one brushed aluminium plate per digit in Khand, each on two steel nails, hung on the painted scoreboard. The third umpire\'s screen, in a brushed steel bezel, covers it for a beat while its three lamps light, then the plates drop in.',
                 'ground, hung #222824 over brushed aluminium, chalk, steel edge; Khand 600 at 1.9 x score (1.3 x at 200%); radius 0', 'decision pending (0 to 600 ms), dropping (one plate each 180 ms), hung; still under reduced motion',
                 'The score is the result h1, "Score 86". The screen and the plates are hidden from screen readers. Reduced motion cuts straight to the hung score.'),
                ('Scorecard (person card)', '<div class="pg-row" style="align-items:flex-start"><div style="width:180px">' + lib.tile(w, *self.twin_pair()[0]) + '</div><div style="width:180px">' + lib.tile(w, *self.twin_pair()[1], 'is-selected') + '</div></div>',
                 'Sight-screen white on a soft shadow, one fine edge and the printed outfield band at the top; the portrait, the name, numbers on aluminium plates, the line. A pick is yellow in a 2 px ink frame.',
                 'paper, hairline, green band, aluminium plates; radius 0', 'rest, pressed, selected, held, focus, committing, revisited', 'One stop: name and numbers spoken, the line as its description.'),
                ('The batting order (the rank column)', mid,
                 'Four numbered places on the scoreboard. Empty is an unhung slot; the next place has a solid chalk frame; the player just placed is yellow, earlier places print on the scorecard.',
                 'slot, aluminium number plate, paper, pick yellow; radius 4', 'empty, next, just placed, placed; a placed player tapped goes back', 'Each place is named "1, Agnes, batting average 38" or "3, empty".'),
                ('The over (checks)', f'{pool}<div style="height:12px"></div><div class="rows">{rws.split("</button>")[0]}</button></div>',
                 'Six balls on an aluminium plate on two steel nails; a check bowled is filled in, one to come is a hollow ring. The row shows the balls bowled at it.',
                 'aluminium plate, chalk; cherry ball on the scorecard', '0 to 6 bowled', 'The over is one image: "4 checks left". The row says "checked twice".'),
                ('The field (assign)', self.jobs_obj(lib.JOB_STATES),
                 'Outfield green with a chalk boundary; one slot per fielding position.', 'green, chalk, slot; radius 4', 'slot: empty, target, filled, refused, revisited',
                 'Each slot is named "Position, person" or "Position, empty".'),
                ("The commentator's card (words)", self.letter_obj(),
                 'A scorecard in a steel clip, with the line and one blank; the commentator under it.', 'paper, hairline, green band, steel clip', 'blank: empty, filled', 'The blank is named "blank".'),
                ('Chapter title card (the starter, chapter 4)', chapter_card(w),
                 'The painting, the world name on a hung board, five balls for the five chapters, the area named plainly, the chapter\'s setting, the year and the length, and Start.',
                 'name board, plate, Khand title; Hind for the rest', 'new, begun (Continue), retake; Hindi; 200%',
                 'The area is the h1. The balls are hidden; "Chapter 4 of 5" says the same in words.')]

    def choices(self):
        w = self.id
        hind = scoreboard('86').replace('class="cr-score"', 'class="cr-score cr-hind"', 1)
        six = f'<div class="pool cr-over" role="img"{al("4 checks left", "4 जाँच बाकी")}>' + ('<span class="spent">' + ic('ball') + '</span>') * 2 + ic('ball') * 4 + '</div>'
        three = f'<div class="pool cr-over" role="img"{al("1 check left", "1 जाँच बाकी")}>' + ('<span class="spent">' + ic('ball') + '</span>') * 2 + ic('ball') + '</div>'
        return [(100, lambda: lib.ab_item('Scoreboard numerals in Khand', 'The world spec puts Khand on the cover title and the scoreboard numerals. The rule allows a display face on the cover title only.',
                    [('A', 'Khand on the numerals', lib.frame(w, scoreboard('86')), True), ('B', 'Hind 700, like Station\'s flaps', lib.frame(w, hind), False)])),
                (101, lambda: lib.ab_item('How many checks in an over', 'An over is six balls. The shared puzzle gives three checks, so a full over doubles them.',
                    [('A', 'Six balls, 4 left', lib.frame(w, six), True), ('B', 'Three balls, the shared count', lib.frame(w, three), False)]))]

    def signature_demo(self):
        return lib.frame(self.id, '<div class="pg-row cr-demo">' + scoreboard('86') + f'<button class="textbtn" type="button" data-cr-replay>{tx("span", "Replay", "फिर से")}</button></div>') + SCRIPT


WORLD = Cricket
