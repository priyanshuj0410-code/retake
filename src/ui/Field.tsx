import { useId, type ReactNode } from 'react'
import './field.css'

/** A labelled text box with its action beside it (finding a friend by road name). */
export function Field(props: {
  label: string
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  action: ReactNode
}) {
  const id = useId()
  return (
    <form
      className="field"
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        props.onSubmit()
      }}
    >
      <label className="field__label" htmlFor={id}>
        {props.label}
      </label>
      <div className="field__row">
        <input
          id={id}
          className="field__input"
          type="search"
          autoComplete="off"
          spellCheck={false}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        />
        {props.action}
      </div>
    </form>
  )
}

/** The private Sunday note: saved on this phone only, and never read by the scoring. */
export function NoteBox(props: { label: string; hint: string; value: string; onChange: (v: string) => void }) {
  const id = useId()
  const hint = useId()
  return (
    <div className="notebox">
      <label className="field__label" htmlFor={id}>
        {props.label}
      </label>
      <textarea
        id={id}
        className="notebox__input"
        rows={3}
        maxLength={280}
        aria-describedby={hint}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
      <p className="notebox__hint" id={hint}>
        {props.hint}
      </p>
    </div>
  )
}
