import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import type { Cover as CoverData, Cut as CutData } from './data'
import { Drawn, T, useLabel } from './lang'
import { HelpButton, Main, Phone } from './parts'
import { useSound } from './sound'

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/** A chapter's title card, drawn by the library (its hard cover, the setting named under the title). */
export function Cover({ c, onNext, help, onHelp }: { c: CoverData; onNext: () => void; help: boolean; onHelp: (o: boolean) => void }) {
  const { sound } = useSound()
  const click = (e: MouseEvent) => {
    const el = e.target as HTMLElement
    if (el.closest('[data-help]')) onHelp(true)
    else if (el.closest('.dock .main')) {
      sound.fx(c.world, 'cover')
      onNext()
    }
  }
  return (
    <div onClick={click} className="take-hold">
      <Phone world={c.world} cls={c.cls.split(' ').slice(1).join(' ')} label="" art={c.art} help={help} onHelp={onHelp}>
        <Drawn html={c.html} className="take-drawn" />
      </Phone>
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
  useEffect(() => setN(0), [c])
  useLayoutEffect(() => {
    const b = body.current
    if (b) requestAnimationFrame(() => b.scrollTo({ top: b.scrollHeight, behavior: reduced() || !n ? 'auto' : 'smooth' }))
  }, [n])
  return (
    <Phone world={now.world} cls="js-cut" label={label(c.label)} help={help} onHelp={onHelp}>
      <div className="cutbar">
        <HelpButton onHelp={onHelp} />
        <button className="textbtn" type="button" onClick={onNext}>
          <T t={['Skip', 'छोड़ें']} />
        </button>
      </div>
      <div className="scr-body cutbody" ref={body}>
        {c.panels.map((p, i) => (
          <figure key={p.id} className={`cutpanel${i === n ? ' is-now' : ''}`} data-world={p.world} hidden={i > n}>
            <img src={p.pic} alt="" width={800} height={600} onClick={next} />
            <T as="figcaption" t={p.cap} className="cap" />
          </figure>
        ))}
      </div>
      <Main t={last ? ['Continue', 'जारी रखें'] : ['Next', 'आगे']} live onGo={next}>
        <span className="cutdots" aria-hidden="true">
          {c.panels.map((p, i) => (
            <i key={p.id} className={i <= n ? 'on' : undefined} />
          ))}
        </span>
      </Main>
    </Phone>
  )
}
