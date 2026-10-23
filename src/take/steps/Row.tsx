import type { ReactNode } from 'react'
import type { Person, Step } from '../data'
import { T, say, useLabel, useLang } from '../lang'
import { Stats, spoken } from '../parts'
import { Svg } from '../Svg'

/** A person as a row (first_take.row): the tick and arm marks, the face, the name, a side (the numbers, and for Split
 * the chores given), a mark (rank's place), and the person's note in the world's paperwork. role null draws a row
 * that is not a choice of its own (Split's family, where a chore is picked first). */
export function Row(props: {
  s: Step
  p: Person
  side?: ReactNode
  mark?: ReactNode
  checked?: boolean
  role?: 'checkbox' | null
  cls?: string
  refused?: boolean
  onClick: () => void
}) {
  const { s, p } = props
  const label = useLabel()
  const lang = useLang()
  const role = props.role === undefined ? 'checkbox' : props.role
  return (
    <button
      className={`row${props.cls ? ` ${props.cls}` : ''}${props.checked ? ' is-selected' : ''}${props.refused ? ' is-refused' : ''}`}
      type="button"
      role={role ?? undefined}
      aria-checked={role ? !!props.checked : undefined}
      aria-label={label(spoken(s, p))}
      data-en={p.en}
      onClick={props.onClick}
    >
      <span className="tick" aria-hidden="true">
        <Svg name="tick" />
      </span>
      <span className="armmark" aria-hidden="true">
        <Svg name="arrow" />
      </span>
      <span className="face" style={{ backgroundImage: `url(${p.face})` }} aria-hidden="true" />
      <span className="who" aria-hidden="true">
        <span className="nm" lang={lang === 'hi' ? 'hi' : undefined}>
          {say(lang, [p.en, p.hi])}
        </span>
      </span>
      <span className="side" aria-hidden="true">
        {props.side ?? <Stats keys={s.keys} vals={p.vals} />}
      </span>
      {props.mark}
      {p.line ? <T t={p.line} className="note" /> : null}
    </button>
  )
}

/** A person placed in a slot (the demo's who()): the small face and the name, with the tick when asked. */
export function Who({ p, tick }: { p: Person; tick?: boolean }) {
  const lang = useLang()
  return (
    <span className="who">
      <i style={{ backgroundImage: `url(${p.face})` }} />
      <span lang={lang === 'hi' ? 'hi' : undefined}>{say(lang, [p.en, p.hi])}</span>
      {tick ? <Stick /> : null}
    </span>
  )
}

/** The tick a filled slot carries. */
export function Stick() {
  return (
    <span className="stick">
      <Svg name="tick" />
    </span>
  )
}

/** A refused tap shakes the row it fell on (library.js refuse), and the shake can play again. */
export const refuseOnce = (set: (name: string | null) => void, name: string) => {
  set(null)
  requestAnimationFrame(() => set(name))
}
