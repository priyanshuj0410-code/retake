import { useId } from 'react'
import './choice.css'

export interface Option {
  id: string
  text: string
}

/** One answer from a list: native radio inputs, so keyboards and screen readers work as they do everywhere. */
export function Choice({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string
  options: Option[]
  value: string | null
  onChange: (id: string) => void
}) {
  const name = useId()
  return (
    <fieldset className="choice">
      <legend className="choice__legend">{legend}</legend>
      {options.map((o) => (
        <label className="choice__option" key={o.id}>
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
  hint,
  options,
  value,
  onChange,
}: {
  legend: string
  hint?: string
  options: Option[]
  value: string[]
  onChange: (ids: string[]) => void
}) {
  return (
    <fieldset className="choice">
      <legend className="choice__legend">{legend}</legend>
      {hint ? <span className="choice__text">{hint}</span> : null}
      {options.map((o) => (
        <label className="choice__option" key={o.id}>
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
