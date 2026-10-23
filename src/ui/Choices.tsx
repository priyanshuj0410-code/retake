import { useRef } from 'react'
import './choices.css'
import './hidden.css'

/**
 * A set of equal options (rules, responses, languages, road names). Every option has the same
 * plate and behaviour; arrow keys move between them, as in any radio group. `locked` keeps the
 * chosen one showing and the rest inactive.
 */
export function Choices(props: {
  legend: string
  options: { id: string; label: string; lang?: string }[]
  value: string | null
  onChange?: (id: string) => void
  locked?: boolean
  columns?: 1 | 2 | 3
  /** The options say it all; the legend is for screen readers only. */
  quiet?: boolean
}) {
  const list = useRef<HTMLDivElement>(null)
  const move = (i: number) => {
    const n = props.options.length
    const next = props.options[(i + n) % n]
    props.onChange?.(next.id)
    const el = list.current?.querySelectorAll<HTMLButtonElement>('button')[(i + n) % n]
    el?.focus()
  }
  const current = Math.max(
    0,
    props.options.findIndex((o) => o.id === props.value),
  )
  return (
    <fieldset className="choices">
      <legend className={props.quiet ? 'vh' : 'choices__legend'}>{props.legend}</legend>
      <div className="choices__list" role="radiogroup" data-columns={props.columns ?? 1} ref={list} data-options="">
        {props.options.map((o, i) => (
          <button
            type="button"
            key={o.id}
            className="choices__option"
            role="radio"
            data-option=""
            lang={o.lang}
            aria-checked={props.value === o.id}
            aria-disabled={props.locked ? 'true' : undefined}
            tabIndex={i === current ? 0 : -1}
            onClick={() => {
              if (!props.locked) props.onChange?.(o.id)
            }}
            onKeyDown={(e) => {
              if (props.locked) return
              if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault()
                move(i + 1)
              } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault()
                move(i - 1)
              }
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
