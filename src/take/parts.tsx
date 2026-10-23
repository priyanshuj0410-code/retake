import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { TAKE, type Bi, type Lang, type Paint, type Step } from './data'
import { T, say, useLabel, useLang } from './lang'
import { Svg } from './Svg'
import { useSound } from './sound'

// The library's frame and shared parts (library.py app, topbar, dock, main; first_take.py voice, byline, statkey,
// stats, progress), drawn with the same markup and class names, so library.css dresses them unchanged.

const HOW: Bi = ['Pick someone, send them, and at the end see what you chose.', 'किसी को चुनें, उन्हें भेजें, और आख़िर में देखें आपने क्या चुना।']

/** Every screen in the library's responsive app frame (library.py app, library.css "the app frame for every screen"):
 * the painting fills the screen in .page-art at every size, and the screen's topbar, body and dock sit in .page-play,
 * which is the whole screen on a phone and a column on the right when the screen is wider than tall. The "?" sheet
 * and the update toast rise inside the column, so the painting stays whole. */
export function AppFrame(props: {
  world: string
  kind: 'step' | 'cover' | 'cut' | 'result'
  cls?: string
  label: string
  art?: Paint | null
  stage?: ReactNode
  children: ReactNode
  help: boolean
  onHelp: (open: boolean) => void
}) {
  const lang = useLang()
  const art = props.art
  return (
    <div
      className={`app world ${TAKE.worlds[props.world]?.cls ?? props.world} is-${props.kind} ${props.cls ?? ''}`}
      role="group"
      aria-label={props.label}
      data-cur={lang}
      data-mode={lang}
      lang={lang === 'hi' ? 'hi' : 'en'}
    >
      <div className="shell">
        <section className="page-art" aria-hidden="true">
          {art ? (
            <div
              className={`art art-img ${art.cls}`}
              // the larger and wide paintings lie over the phone's, which is always cached: offline before a big
              // screen has drawn them, the phone's painting shows instead of none
              style={{
                backgroundImage: `url(${art.base})`,
                ['--art-p' as string]: `url(${art.p}), url(${art.base})`,
                ['--art-w' as string]: `url(${art.w}), url(${art.base})`,
              }}
            />
          ) : null}
          {props.stage}
        </section>
        <section className="page-play">
          {props.children}
          {props.help ? <HelpSheet world={props.world} onClose={() => props.onHelp(false)} /> : <UpdateToast />}
        </section>
      </div>
    </div>
  )
}

export function HelpButton({ onHelp }: { onHelp: (open: boolean) => void }) {
  const label = useLabel()
  return (
    <button className="ibtn" type="button" data-help aria-label={label(['How to play', 'कैसे खेलें'])} onClick={() => onHelp(true)}>
      <Svg name="help" />
    </button>
  )
}

export function Topbar({ plate, onHelp }: { plate?: Bi | null; onHelp: (open: boolean) => void }) {
  const lang = useLang()
  return (
    <div className="topbar">
      <span className="spacer" />
      {plate ? (
        // a world's plate can carry its own markup (Cricket's "<i>Day</i><b>6</b>"), from the library's export
        <span className="dayplate" lang={lang === 'hi' ? 'hi' : undefined}>
          <span dangerouslySetInnerHTML={{ __html: say(lang, plate) }} />
        </span>
      ) : (
        <span className="spacer" />
      )}
      <HelpButton onHelp={onHelp} />
    </div>
  )
}

/** Privacy's actions, given by the app: Delete all wipes the phone at once; the sheet then shows one line, and closing
 * it starts again from a first visit. */
export const PrivacyContext = createContext<{ deleteAll: () => void; restart: () => void }>({ deleteAll: () => {}, restart: () => {} })

const PRIVACY: [Bi, Bi][] = [
  [['On this phone', 'इस फ़ोन पर'], ['Your birth date, your answers, the language and sound.', 'आपकी जन्म तारीख़, आपके जवाब, भाषा और आवाज़।']],
  [['Sent anywhere', 'कहीं भेजा गया'], ['Nothing leaves this phone.', 'इस फ़ोन से कुछ बाहर नहीं जाता।']],
  [['Kept nowhere', 'कहीं नहीं रखा जाता'], ['How long you take, or what you type.', 'आप कितना समय लेते हैं, या क्या लिखते हैं।']],
]

/** The "?" sheet (owner, 23 Oct 2026, option C): one line of how to play, the languages, then sound; and one link,
 * Privacy (F-111), whose level holds Delete all (F-112), asked once in the one dialog (library.py privacy_phone). */
function HelpSheet({ world, onClose }: { world: string; onClose: () => void }) {
  const lang = useLang()
  const label = useLabel()
  const { on, toggle } = useSound()
  const setLang = useSetLang()
  const { deleteAll, restart } = useContext(PrivacyContext)
  const [level, setLevel] = useState<'how' | 'privacy' | 'deleted'>('how')
  const [asking, setAsking] = useState(false)
  const close = useRef<HTMLButtonElement>(null)
  const keep = useRef<HTMLButtonElement>(null)
  const done = level === 'deleted' ? restart : onClose
  useEffect(() => {
    if (asking) keep.current?.focus()
    else close.current?.focus()
  }, [level, asking])
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (asking) setAsking(false)
      else if (level === 'privacy') setLevel('how')
      else done()
    }
    addEventListener('keydown', esc)
    return () => removeEventListener('keydown', esc)
  }, [asking, level, done])
  const installed = matchMedia('(display-mode: standalone)').matches
  return (
    <>
      <div className="scrim" aria-hidden="true" onClick={done} />
      <div className="sheet helpsheet" role="dialog" aria-modal="true" aria-labelledby="sheethead">
        {TAKE.help[world] ? <div className={TAKE.help[world]} aria-hidden="true" /> : null}
        <div className="grab">
          {level === 'privacy' ? (
            <button className="close" type="button" aria-label={label(['Back', 'वापस'])} onClick={() => setLevel('how')}>
              <Svg name="back" />
            </button>
          ) : (
            <span className="spacer" />
          )}
          <button className="handle" type="button" aria-label={label(['Drag to close', 'बंद करने के लिए खींचें'])} onClick={done}>
            <i />
          </button>
          <button ref={close} className="close" type="button" aria-label={label(['Close', 'बंद करें'])} onClick={done}>
            <Svg name="close" />
          </button>
        </div>
        {level === 'how' ? (
          <>
            <T as="p" t={HOW} className="howline" id="sheethead" />
            <div className="langrow">
              <Svg name="language" />
              <div className="langchips" role="group" aria-label={label(['Language', 'भाषा'])}>
                {TAKE.langs.map(([k, n]) => (
                  <button key={k} type="button" aria-pressed={k === lang} data-set-lang={k} lang={k === 'hi' ? 'hi' : undefined} onClick={() => setLang(k)}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="setlist sndsec">
              <button className="setrow sndrow" type="button" role="switch" aria-checked={on} onClick={toggle}>
                <Svg name="speaker" />
                <T t={['Sound', 'आवाज़']} />
                <span className="sw" aria-hidden="true">
                  <Svg name="tick" />
                </span>
              </button>
            </div>
            <div className="sheetlinks">
              <button type="button" onClick={() => setLevel('privacy')}>
                <T t={['Privacy', 'प्राइवेसी']} />
                <Svg name="arrow" />
              </button>
            </div>
          </>
        ) : level === 'privacy' ? (
          <>
            <T as="h2" t={['Privacy', 'प्राइवेसी']} id="sheethead" />
            <dl className="defs">
              {PRIVACY.map(([t, d]) => (
                <div key={t[0]}>
                  <dt>
                    <T t={t} />
                  </dt>
                  <dd>
                    <T t={d} />
                  </dd>
                </div>
              ))}
            </dl>
            <div className="sheetlinks">
              <button type="button" className="is-danger" onClick={() => setAsking(true)}>
                <T t={['Delete all', 'सब मिटाएँ']} />
                <Svg name="alert" />
              </button>
            </div>
          </>
        ) : (
          <>
            <T as="h2" t={['Deleted.', 'मिट गया।']} id="sheethead" />
            {installed ? (
              <T as="p" className="letter" t={['To remove Retake from your home screen, press and hold its icon.', 'होम स्क्रीन से रीटेक हटाने के लिए, उसके आइकन को दबाकर रखें।']} />
            ) : null}
          </>
        )}
      </div>
      {asking ? <div className="scrim" aria-hidden="true" onClick={() => setAsking(false)} /> : null}
      {asking ? (
        <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="deletehead">
          <T as="h2" t={['Delete all your days and notes?', 'अपने सारे दिन और नोट मिटाएँ?']} id="deletehead" />
          <div className="acts">
            <button ref={keep} type="button" className="textbtn on-paper" onClick={() => setAsking(false)}>
              <T t={['Keep', 'रखें']} />
            </button>
            <button
              type="button"
              className="textbtn on-paper is-danger"
              onClick={() => {
                deleteAll()
                setAsking(false)
                setLevel('deleted')
              }}
            >
              <Svg name="alert" />
              <T t={['Delete all', 'सब मिटाएँ']} />
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}

/** A body that runs past the screen says so (library.js moreCue): a fade at its foot and a round "more" cue above
 * the button, both gone once it is scrolled to its end. Watches its own scroll and size. */
export function useMoreCue() {
  const ref = useRef<HTMLDivElement>(null)
  const [cue, setCue] = useState<{ more: boolean; bottom: number }>({ more: false, bottom: 0 })
  useLayoutEffect(() => {
    const body = ref.current
    if (!body) return
    const check = () => {
      const more = body.scrollHeight - body.clientHeight > 2 && body.scrollTop + body.clientHeight < body.scrollHeight - 2
      const dock = body.parentElement?.querySelector<HTMLElement>(':scope > .dock')
      const bottom = (dock?.offsetHeight ?? 0) + 8
      setCue((c) => (c.more === more && c.bottom === bottom ? c : { more, bottom }))
    }
    check()
    body.addEventListener('scroll', check, { passive: true })
    const ro = new ResizeObserver(check)
    ro.observe(body)
    for (const k of body.children) ro.observe(k)
    void document.fonts?.ready.then(check)
    return () => {
      body.removeEventListener('scroll', check)
      ro.disconnect()
    }
  }, [])
  const node = (
    <span className="morecue is-live" style={{ bottom: cue.bottom }} aria-hidden="true" hidden={!cue.more}>
      <Svg name="down" />
    </span>
  )
  return { ref, more: cue.more, node }
}

/** A new version is waiting (src/pwa.ts): the library's toast with one action. Nothing reloads until the player taps
 * Update; the take then resumes on the screen it was on. */
export const UpdateContext = createContext<(() => void) | null>(null)

function UpdateToast() {
  const apply = useContext(UpdateContext)
  if (!apply) return null
  return (
    <div className="toast" role="status">
      <span className="t">
        <T t={['New version ready.', 'नया वर्ज़न तैयार।']} />
        <button className="textbtn" type="button" onClick={apply}>
          <T t={['Update', 'अपडेट']} />
        </button>
      </span>
    </div>
  )
}

// the language setter, given by the app
export const SetLangContext = createContext<(l: Lang) => void>(() => {})
const useSetLang = () => useContext(SetLangContext)

/** The one main button: waiting says what is missing, live names its consequence (R-STEP-4). */
export function Main(props: { t: Bi; live: boolean; onGo: () => void; refuse?: () => void; out?: boolean; children?: ReactNode }) {
  const { t, live, onGo, refuse } = props
  const [refused, setRefused] = useState(0)
  return (
    <div className="dock">
      {props.children}
      <button
        // outside a decision the button is the world's plain way on (library.py out_btn)
        className={`main ${props.out ? 'is-out' : live ? 'is-live' : 'is-wait'}${refused ? ' is-refused' : ''}`}
        key={refused}
        type="button"
        aria-disabled={live ? undefined : true}
        onClick={() => {
          if (live) onGo()
          else {
            refuse?.()
            setRefused((n) => n + 1)
          }
        }}
      >
        <T t={t} />
      </button>
    </div>
  )
}

export function Progress({ chapter, step, steps }: { chapter: number; step: number; steps: number }) {
  const label = useLabel()
  return (
    <div
      className="ftprog"
      role="img"
      aria-label={label([`Chapter ${chapter} of 5, ${step} of ${steps}`, `अध्याय ${chapter}/5, ${step}/${steps}`])}
    >
      {[1, 2, 3, 4, 5].map((k) => (
        <i key={k} style={{ ['--f' as string]: `${k < chapter ? 100 : k === chapter ? Math.round((100 * step) / steps) : 0}%` }} />
      ))}
    </div>
  )
}

export function Question({ s, id }: { s: Step; id: string }) {
  return (
    <div className="qbox">
      <T as="h1" t={s.q} className="q" id={id} />
    </div>
  )
}

/** A spoken line takes the byline's place, the speaker's name on the balloon (first_take.voice). */
export function Voice({ s }: { s: Step }) {
  if (!s.voice)
    return (
      <div className="byline">
        <i style={{ backgroundImage: `url(${s.speakerFace})` }} aria-hidden="true" />
        <T t={s.speaker} data-count="0" />
      </div>
    )
  return (
    <div className="voice">
      <span className="av" style={{ backgroundImage: `url(${s.speakerFace})` }} aria-hidden="true" />
      <div className="balloon" data-count="0">
        <T as="b" t={s.speaker} />
        <T as="p" t={[`“${s.voice[0]}”`, `“${s.voice[1]}”`]} />
      </div>
    </div>
  )
}

export function Statkey({ keys }: { keys: Step['keys'] }) {
  return (
    <div className="statkey" aria-hidden="true">
      {keys.map(([k, en, hi]) => (
        <span key={k + en}>
          <Svg name={k} />
          <T t={[en, hi]} />
        </span>
      ))}
    </div>
  )
}

export function Stats({ keys, vals }: { keys: Step['keys']; vals: string[] }) {
  const cls = vals.length === 1 ? 'stats c1' : vals.length === 2 ? 'stats c2' : 'stats'
  return (
    <span className={cls} aria-hidden="true">
      {vals.map((v, j) => (
        <span className="stat" key={j}>
          <Svg name={keys[j][0]} />
          {v}
        </span>
      ))}
    </span>
  )
}

/** What a screen reader hears for a card: the name and each number with its key (first_take.spoken). */
export const spoken = (s: Step, p: Step['people'][number]): Bi => [
  `${p.en}, ` + p.vals.map((v, j) => `${v} ${s.keys[j][1]}`).join(', '),
  `${p.hi}, ` + p.vals.map((v, j) => `${v} ${s.keys[j][2]}`).join(', '),
]
