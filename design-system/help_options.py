"""Three directions for the "?" sheet, drawn over a Station step, for the owner to choose before any is built (owner,
23 Oct 2026: "The ? needs a proper design... this is looking very sad... not tasteful"). The sheet holds how to play,
the languages and sound.

A, guide card: the world's paper under an enamel title plate; the steps as big numerals; the languages as three tiles.
B, world object: the steps as stops on a railway route; the languages as platform tickets, the chosen one punched;
   sound as an On and Off switch.
C, quiet: one line of how to play, the languages and sound as compact chips; the sheet half as tall.

Build:  python3 design-system/help_options.py   (writes help-options.html)
"""
from pathlib import Path

import library as L

HERE = Path(__file__).parent
STEPS = [('Pick someone', 'किसी को चुनें'), ('Send them', 'उन्हें भेजें'), ('See what you chose', 'देखें आपने क्या चुना')]


def grab():
    return (f'<div class="grab"><span class="spacer"></span><button class="handle" type="button"{L.al("Drag to close", "बंद करने के लिए खींचें")}><i></i></button>'
            f'<button class="close" type="button"{L.al("Close", "बंद करें")}>{L.ic("close")}</button></div>')


def option_a():
    steps = ''.join(f'<li><b>{i}</b>{L.tx("span", en, hi)}</li>' for i, (en, hi) in enumerate(STEPS, 1))
    langs = ''.join(f'<button type="button" aria-pressed="{str(k == "mix").lower()}"><b>{n}</b><small>{e}</small></button>' for k, n, e in L.LANGS)
    return (f'<div class="sheet opt-a">{grab()}<div class="oa-title">{L.dayplate("How to play", "कैसे खेलें")}</div>'
            f'<ol class="oa-steps">{steps}</ol>'
            f'<h3>{L.tx("span", "Language", "भाषा")}</h3><div class="oa-langs">{langs}</div>'
            f'<button class="oa-sound" type="button" aria-pressed="true">{L.ic("speaker")}{L.tx("span", "Sound", "आवाज़")}<span class="oa-state">On</span></button></div>')


def option_b():
    stops = ''.join(f'<li><i></i>{L.tx("span", en, hi)}</li>' for en, hi in STEPS)
    tickets = ''.join(f'<button class="ob-ticket" type="button" aria-pressed="{str(k == "mix").lower()}"><b>{n}</b><small>{e}</small><span class="ob-punch"></span></button>'
                      for k, n, e in L.LANGS)
    return (f'<div class="sheet opt-b">{grab()}<div class="ob-title">{L.dayplate("How to play", "कैसे खेलें")}</div>'
            f'<ol class="ob-route">{stops}</ol>'
            f'<h3>{L.tx("span", "Language", "भाषा")}</h3><div class="ob-tickets">{tickets}</div>'
            f'<div class="ob-sound"><span>{L.ic("speaker")}{L.tx("span", "Sound", "आवाज़")}</span>'
            f'<span class="ob-seg"><button type="button" aria-pressed="true">On</button><button type="button" aria-pressed="false">Off</button></span></div></div>')


def option_c():
    langs = ''.join(f'<button type="button" aria-pressed="{str(k == "mix").lower()}">{n}</button>' for k, n, e in L.LANGS)
    return (f'<div class="sheet opt-c">{grab()}'
            f'<p class="oc-how">{L.tx("span", "Pick someone, send them, and at the end see what you chose.", "किसी को चुनें, उन्हें भेजें, और आख़िर में देखें आपने क्या चुना।")}</p>'
            f'<div class="oc-row">{L.ic("language")}<span class="oc-chips">{langs}</span></div>'
            f'<div class="oc-row">{L.ic("speaker")}<span class="oc-chips"><button type="button" aria-pressed="true">Sound on</button><button type="button" aria-pressed="false">Off</button></span></div></div>')


CSS = '''
body { margin: 0; background: #2A2A2E; font-family: 'Hind', sans-serif; }
main { display: flex; gap: 40px; padding: 32px; align-items: flex-start; }
figure { margin: 0; display: grid; gap: 12px; }
figcaption { color: #EDE6F5; font: 600 17px/1.4 'Hind', sans-serif; max-width: 390px; }
.sheet h3 { margin: 0 0 var(--f8); font: 700 var(--t-label)/1.43 'Hind'; letter-spacing: .06em; text-transform: uppercase; color: color-mix(in srgb, var(--ink) 70%, transparent); }

/* A, guide card */
.opt-a { padding-bottom: var(--f21); }
.oa-title { display: flex; justify-content: center; margin: -8px 0 var(--f21); }
.oa-steps { list-style: none; margin: 0 0 var(--f21); padding: 0 0 var(--f21); display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--f13);
  border-bottom: 1.5px dashed var(--ink); text-align: center; }
.oa-steps b { display: block; font: 700 var(--t-score)/1 'Hind'; color: var(--accent); margin-bottom: var(--f5); }
.oa-steps span { font: 700 var(--t-label)/1.35 'Hind'; }
.oa-langs { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--f8); margin-bottom: var(--f21); }
.oa-langs button { display: grid; gap: 2px; justify-items: center; padding: var(--f13) var(--f5); border: 0; border-radius: var(--r-card);
  background: transparent; box-shadow: inset 0 0 0 1.5px var(--ink); color: var(--ink); cursor: pointer; }
.oa-langs b { font: 700 var(--t-title)/1.3 'Hind'; }
.oa-langs small { font: 500 12px/1.3 'Hind'; color: color-mix(in srgb, currentColor 70%, transparent); text-align: center; }
.oa-langs [aria-pressed="true"] { background: var(--accent); color: var(--enamel); box-shadow: none; }
.oa-sound { width: 100%; min-height: 56px; display: grid; grid-template-columns: 24px 1fr auto; align-items: center; gap: var(--f13); padding: 0 var(--f13);
  border: 0; border-radius: var(--r-card); background: transparent; box-shadow: inset 0 0 0 1.5px var(--ink); color: var(--ink); font: 700 var(--t-title)/1.5 'Hind'; text-align: left; }
.oa-sound svg { width: 24px; height: 24px; }
.oa-state { font: 700 var(--t-label)/1 'Hind'; padding: 8px 13px; border-radius: 9999px; background: var(--accent); color: var(--enamel); }

/* B, world object: a railway route and platform tickets */
.opt-b { padding-bottom: var(--f21); }
.ob-title { display: flex; justify-content: center; margin: -8px 0 var(--f21); }
.ob-route { list-style: none; margin: 0 0 var(--f21); padding: 0; display: grid; grid-template-columns: repeat(3, 1fr); position: relative; text-align: center; }
.ob-route::before { content: ''; position: absolute; top: 11px; left: 16.6%; right: 16.6%; height: 4px; background: var(--accent); }
.ob-route li { display: grid; justify-items: center; gap: var(--f8); position: relative; font: 700 var(--t-label)/1.35 'Hind'; }
.ob-route i { width: 26px; height: 26px; border-radius: 50%; background: var(--enamel); box-shadow: inset 0 0 0 5px var(--accent); }
.ob-route li:last-child i { background: var(--accent); }
.ob-tickets { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--f8); margin-bottom: var(--f21); }
.ob-ticket { position: relative; display: grid; gap: 2px; justify-items: center; padding: 12px 4px 14px; border: solid transparent; border-width: 12px 6px 6px;
  border-image: url(assets/plate-ticket.webp) 92 24 24 24 fill / 12px 6px 6px 6px stretch; background: transparent; color: var(--ink); cursor: pointer; }
.ob-ticket b { font: 700 var(--t-title)/1.3 'Hind'; }
.ob-ticket small { font: 500 12px/1.3 'Hind'; color: color-mix(in srgb, currentColor 70%, transparent); text-align: center; }
.ob-punch { position: absolute; top: -4px; right: 6px; width: 14px; height: 14px; border-radius: 50%; }
.ob-ticket[aria-pressed="true"] .ob-punch { background: #2A2A2E; box-shadow: inset 0 1px 2px rgba(0,0,0,.6); }
.ob-ticket[aria-pressed="true"] { outline: 3px solid var(--accent); outline-offset: 2px; border-radius: 4px; }
.ob-sound { display: flex; align-items: center; justify-content: space-between; padding-top: var(--f13); border-top: 1.5px dashed var(--ink); }
.ob-sound > span:first-child { display: flex; align-items: center; gap: var(--f13); font: 700 var(--t-title)/1.5 'Hind'; }
.ob-sound svg { width: 24px; height: 24px; }
.ob-seg { display: inline-flex; padding: 3px; border-radius: 9999px; box-shadow: inset 0 0 0 1.5px var(--ink); }
.ob-seg button { min-width: 64px; min-height: 42px; border: 0; border-radius: 9999px; background: transparent; color: var(--ink); font: 700 var(--t-label)/1 'Hind'; }
.ob-seg [aria-pressed="true"] { background: var(--accent); color: var(--enamel); }

/* C, quiet */
.oc-how { margin: 0 0 var(--f21); font: 600 var(--t-title)/1.45 'Hind'; }
.oc-row { display: grid; grid-template-columns: 24px 1fr; align-items: center; gap: var(--f13); padding: var(--f13) 0; border-top: 1px solid color-mix(in srgb, var(--ink) 18%, transparent); }
.oc-row > svg { width: 24px; height: 24px; }
.oc-chips { display: flex; flex-wrap: wrap; gap: var(--f8); }
.oc-chips button { min-height: 44px; padding: 0 var(--f13); border: 0; border-radius: 9999px; box-shadow: inset 0 0 0 1.5px var(--ink); background: transparent;
  color: var(--ink); font: 700 var(--t-label)/1 'Hind'; }
.oc-chips [aria-pressed="true"] { background: var(--ink); color: var(--paper); box-shadow: none; }
'''


def build():
    figs = []
    for label, sheet in (('A, guide card', option_a()), ('B, world object', option_b()), ('C, quiet', option_c())):
        under = L.step_twin('station')
        ph = under[:-6] + '<div class="scrim" aria-hidden="true"></div>' + sheet + under[-6:]
        figs.append(f'<figure><figcaption>{label}</figcaption>{ph}</figure>')
    page = (f'<!doctype html><meta charset="utf-8"><title>Help sheet options</title>\n<link rel="stylesheet" href="{L.font_link()}">'
            f'<link rel="stylesheet" href="fonts.css"><link rel="stylesheet" href="library.css">{L.world_css()}<style>{CSS}</style>\n'
            f'<main>{"".join(figs)}</main>')
    (HERE / 'help-options.html').write_text(page, encoding='utf-8')
    print('help-options.html', len(page))


if __name__ == '__main__':
    build()
