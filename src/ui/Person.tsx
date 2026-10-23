import type { ReactNode } from 'react'
import { Portrait } from './Portrait'
import './person.css'
import './hidden.css'

export interface PersonView {
  id: string
  name: string
  art: boolean
  record?: string
  quote?: string
  stats?: { n: string; label: string }[]
}

/**
 * One person, as information or as an option. Every option in a set is drawn by this one
 * component with the same tone, size and behaviour, so no answer looks or acts different from
 * another. It never receives a gender.
 */
export function Person(props: {
  person: PersonView
  skin: 'lugdi' | 'station'
  role?: 'radio' | 'checkbox' | 'button' | 'none'
  checked?: boolean
  disabled?: boolean
  onPress?: () => void
  layout?: 'tile' | 'row'
  mark?: string
  markEmpty?: boolean
  aside?: ReactNode
  label?: string
  portrait?: 's' | 'm' | 'l' | 'fill'
  /** Numbers only; the set's legend names them once. */
  bare?: boolean
  /** The next thing to tap. */
  pulse?: boolean
}) {
  const p = props.person
  const layout = props.layout ?? 'row'
  const inner = (
    <>
      <Portrait
        id={p.id}
        name={p.name}
        art={p.art}
        skin={props.skin}
        size={props.portrait ?? (layout === 'tile' ? 'fill' : 'm')}
      />
      <span className="person__body">
        <span className="person__name">{p.name}</span>
        {p.record ? <span className="person__record">{p.record}</span> : null}
        {p.stats ? (
          <span className="person__stats">
            {p.stats.map((s) => (
              <span className="person__stat" key={s.label}>
                <span className="person__n">{s.n}</span>
                {props.bare ? null : <span className="person__label">{s.label}</span>}
              </span>
            ))}
          </span>
        ) : null}
        {p.quote ? <span className="person__quote">{p.quote}</span> : null}
      </span>
      {props.aside ? <span className="person__aside">{props.aside}</span> : null}
      {props.mark !== undefined ? (
        <span className="person__mark" data-empty={props.markEmpty ? 'true' : 'false'}>
          {props.mark}
        </span>
      ) : null}
      {props.bare && p.stats ? (
        <span className="vh">{p.stats.map((s) => `${s.label} ${s.n}`).join(', ')}</span>
      ) : null}
    </>
  )
  const role = props.role ?? 'none'
  if (role === 'none')
    return (
      <div className="person" data-layout={layout}>
        {inner}
      </div>
    )
  return (
    <button
      type="button"
      className="person"
      data-layout={layout}
      data-next={props.pulse ? 'true' : 'false'}
      role={role === 'button' ? undefined : role}
      aria-checked={role === 'button' ? undefined : !!props.checked}
      aria-pressed={role === 'button' && props.checked !== undefined ? props.checked : undefined}
      aria-disabled={props.disabled ? 'true' : undefined}
      aria-label={props.label}
      onClick={() => {
        if (!props.disabled) props.onPress?.()
      }}
    >
      {inner}
    </button>
  )
}
