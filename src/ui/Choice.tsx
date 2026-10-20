import { useId } from 'react'
import './choice.css'

/* The checked row carries a class as well as :checked, because :has() is missing on the old
   Android browsers the evaluator has to run on. */
const rowClass = (checked: boolean) =>
  checked ? 'choice__option choice__option--checked' : 'choice__option'

/** The question, and under it its Hinglish in the "English with Hinglish help" mode (EVAL-10). */
function Legend({ legend, heading, help }: { legend: string; heading?: boolean; help?: string }) {
  return (
    <legend className="choice__legend">
      {heading ? <h1 className="choice__heading">{legend}</h1> : legend}
      {help ? (
        <span className="choice__help" lang="hi-Latn">
          {help}
        </span>
      ) : null}
    </legend>
  )
}

export interface Option {
  id: string
  text: string
  /** The option in Hinglish under it, in the help mode (EVAL-10). */
  help?: string
}

/** An option's words, with its Hinglish under it in the help mode. */
function OptionText({ o }: { o: Option }) {
  return (
    <span className="choice__text">
      {o.text}
      {o.help ? (
        <span className="choice__help" lang="hi-Latn">
          {o.help}
        </span>
      ) : null}
    </span>
  )
}

/** One answer from a list: native radio inputs, so keyboards and screen readers work as they do everywhere. */
export function Choice({
  legend,
  heading,
  help,
  options,
  value,
  onChange,
}: {
  legend: string
  /** The question is the screen's heading: the legend holds the page's h1. */
  heading?: boolean
  /** The question in Hinglish under it (EVAL-10's help mode). */
  help?: string
  options: Option[]
  value: string | null
  onChange: (id: string) => void
}) {
  const name = useId()
  return (
    <fieldset className="choice">
      <Legend legend={legend} heading={heading} help={help} />
      <div className="choice__rows">
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
            <OptionText o={o} />
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/** Any number of answers: native checkboxes. Shares Choice's stylesheet. */
export function Checks({
  legend,
  heading,
  help,
  hint,
  options,
  value,
  onChange,
}: {
  legend: string
  heading?: boolean
  help?: string
  hint?: string
  options: Option[]
  value: string[]
  onChange: (ids: string[]) => void
}) {
  return (
    <fieldset className="choice">
      <Legend legend={legend} heading={heading} help={help} />
      {hint ? <span className="choice__text">{hint}</span> : null}
      <div className="choice__rows">
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
            <OptionText o={o} />
          </label>
        ))}
      </div>
    </fieldset>
  )
}
