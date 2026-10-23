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

/** The "?" sheet (owner, 23 Oct 2026, option C): one line of how to play, the languages, then sound. */
function HelpSheet({ world, onClose }: { world: string; onClose: () => void }) {
  const lang = useLang()
  const label = useLabel()
  const { on, toggle } = useSound()
  const setLang = useSetLang()
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    close.current?.focus()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    addEventListener('keydown', esc)
    return () => removeEventListener('keydown', esc)
  }, [onClose])
  return (
    <>
      <div className="scrim" aria-hidden="true" onClick={onClose} />
      <div className="sheet helpsheet" role="dialog" aria-modal="true" aria-labelledby="howline">
        {TAKE.help[world] ? <div className={TAKE.help[world]} aria-hidden="true" /> : null}
        <div className="grab">
          <span className="spacer" />
          <button className="handle" type="button" aria-label={label(['Drag to close', 'बंद करने के लिए खींचें'])} onClick={onClose}>
            <i />
          </button>
          <button ref={close} className="close" type="button" aria-label={label(['Close', 'बंद करें'])} onClick={onClose}>
            <Svg name="close" />
          </button>
        </div>
        <T as="p" t={HOW} className="howline" id="howline" />
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
      </div>
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
