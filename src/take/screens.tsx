import { useLayoutEffect, useRef, useState, type MouseEvent, type SyntheticEvent } from 'react'
import { TAKE, type Cover as CoverData, type Cut as CutData } from './data'
import { Drawn, T, useLabel, useLang } from './lang'
import { AppFrame, HelpButton, Main } from './parts'
import { useSound } from './sound'

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches
/** A panel that cannot load (offline, never cached) leaves its caption, not a broken picture. */
const hide = (e: SyntheticEvent<HTMLImageElement>) => (e.currentTarget.style.visibility = 'hidden')

/** A chapter's title card (SC-91), drawn by the library (library.chapter_card): its place in the five, the area, the
 * setting, the year and about 4 minutes. Come back to from the chapter's first step, its button reads Continue
 * (R-STEP-9); Back goes to the chapter's way in, or is not shown when there is none. */
export function Cover({ c, onNext, onBack, revisit, help, onHelp }: { c: CoverData; onNext: () => void; onBack?: () => void; revisit?: boolean; help: boolean; onHelp: (o: boolean) => void }) {
  const { sound } = useSound()
  const label = useLabel()
  const lang = useLang()
  const hold = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const backBtn = hold.current?.querySelector<HTMLElement>('[data-back]')
    if (backBtn) backBtn.hidden = !onBack
    const span = hold.current?.querySelector<HTMLElement>('.dock .main span[data-hi]')
    if (!span || !revisit) return
    span.dataset.en = 'Continue'
    span.dataset.hi = 'जारी रखें'
    span.textContent = lang === 'hi' ? 'जारी रखें' : 'Continue'
  }, [revisit, lang, onBack])
  const click = (e: MouseEvent) => {
    const el = e.target as HTMLElement
    if (el.closest('[data-help]')) onHelp(true)
    else if (el.closest('[data-back]')) onBack?.()
    else if (el.closest('.dock .main')) {
      sound.fx(c.world, 'cover')
      onNext()
    }
  }
  return (
    <div onClick={click} className="take-hold" ref={hold}>
      <AppFrame world={c.world} kind="cover" cls={c.cls.split(' ').slice(1).join(' ')} label={label(TAKE.worlds[c.world].title)} art={c.art} help={help} onHelp={onHelp}>
        <Drawn html={c.html} className="take-drawn" />
      </AppFrame>
    </div>
  )
}

/** A cutscene: panels arrive one per tap, down the page like a comic strip, and the screen's colours, type and button
 * change world with the newest panel (demo.cutscene, cutShow). Skip leaves it; a tap on the picture moves on too. */
export function Cutscene({ c, onNext, help, onHelp }: { c: CutData; onNext: () => void; help: boolean; onHelp: (o: boolean) => void }) {
  const [n, setN] = useState(0)
  const { sound } = useSound()
  const body = useRef<HTMLDivElement>(null)
  const label = useLabel()
  const last = n === c.panels.length - 1
  const now = c.panels[n]
  const next = () => {
    sound.fx(now.world.replace(/^w-/, ''), 'tab')
    if (last) onNext()
    else setN(n + 1)
  }
  useLayoutEffect(() => {
    const b = body.current
    if (b) requestAnimationFrame(() => b.scrollTo({ top: b.scrollHeight, behavior: reduced() || !n ? 'auto' : 'smooth' }))
  }, [n])
  return (
    <AppFrame
      world={now.world}
      kind="cut"
      cls="js-cut"
      label={label(c.label)}
      help={help}
      onHelp={onHelp}
      stage={
        // the newest panel, large on the open side when the screen is wider than tall (library.css)
        <figure className="cutstage is-now" key={now.id}>
          <img src={now.pic} alt="" width={800} height={600} onClick={next} onError={hide} />
        </figure>
      }
    >
      <div className="cutbar">
        <HelpButton onHelp={onHelp} />
        <button className="textbtn" type="button" onClick={onNext}>
          <T t={['Skip', 'छोड़ें']} />
        </button>
      </div>
      {/* each new panel's caption is read as it comes */}
      <div className="scr-body cutbody" ref={body} aria-live="polite">
        {c.panels.map((p, i) => (
          <figure key={p.id} className={`cutpanel${i === n ? ' is-now' : ''}`} data-world={p.world} hidden={i > n}>
            <img src={p.pic} alt="" width={800} height={600} onClick={next} onError={hide} />
            <T as="figcaption" t={p.cap} className="cap" />
          </figure>
        ))}
      </div>
      {/* the world's own button outside a decision, as the demo draws it (library.py out_btn) */}
      <Main t={last ? ['Continue', 'जारी रखें'] : ['Next', 'आगे']} live out onGo={next}>
        <span className="cutdots" aria-hidden="true">
          {c.panels.map((p, i) => (
            <i key={p.id} className={i <= n ? 'on' : undefined} />
          ))}
        </span>
      </Main>
    </AppFrame>
  )
}
