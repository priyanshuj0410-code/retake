import { useId } from 'react'
import './choice.css'

/* The checked row carries a class as well as :checked, because :has() is missing on the old
   Android browsers the evaluator has to run on. */
const rowClass = (checked: boolean) =>
  checked ? 'choice__option choice__option--checked' : 'choice__option'

export interface Option {
  id: string
  text: string
}

/** One answer from a list: native radio inputs, so keyboards and screen readers work as they do everywhere. */
export function Choice({
  legend,
  heading,
  options,
  value,
  onChange,
}: {
  legend: string
  /** The question is the screen's heading: the legend holds the page's h1. */
  heading?: boolean
  options: Option[]
  value: string | null
  onChange: (id: string) => void
}) {
  const name = useId()
  return (
    <fieldset className="choice">
      <legend className="choice__legend">
        {heading ? <h1 className="choice__heading">{legend}</h1> : legend}
      </legend>
      {options.map((o) => (
        <label className={rowClass(value === o.id)} key={o.id}>
          <input
            className="choice__input"
            type="radio"
            name={name}
            value={o.id}
            checked={value === o.id}
            onChange={() => onChange(o.id)}
          />
          <span className="choice__text">{o.text}</span>
        </label>
      ))}
    </fieldset>
  )
}

/** Any number of answers: native checkboxes. Shares Choice's stylesheet. */
export function Checks({
  legend,
  heading,
  hint,
  options,
  value,
  onChange,
}: {
  legend: string
  heading?: boolean
  hint?: string
  options: Option[]
  value: string[]
  onChange: (ids: string[]) => void
}) {
  return (
    <fieldset className="choice">
      <legend className="choice__legend">
        {heading ? <h1 className="choice__heading">{legend}</h1> : legend}
      </legend>
      {hint ? <span className="choice__text">{hint}</span> : null}
      {options.map((o) => (
        <label className={rowClass(value.includes(o.id))} key={o.id}>
          <input
            className="choice__input"
            type="checkbox"
            checked={value.includes(o.id)}
            onChange={(e) =>
              onChange(e.target.checked ? [...value, o.id] : value.filter((x) => x !== o.id))
            }
          />
          <span className="choice__text">{o.text}</span>
        </label>
      ))}
    </fieldset>
  )
}
