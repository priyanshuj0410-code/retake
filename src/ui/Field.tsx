import { useId } from 'react'
import './field.css'

/**
 * A labelled text input. `invalid` marks it aria-invalid and points it, by
 * aria-describedby, at the message that says why (`errorId`, a Notice's id); `onEnter` lets the
 * Enter key do what the page's button does.
 */
export function Field({
  label,
  value,
  onChange,
  autoComplete = 'off',
  type = 'text',
  invalid = false,
  errorId,
  onEnter,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  /** text (codes, upper-cased on phones) or email (the optional stay-in-touch form). */
  type?: 'text' | 'email'
  invalid?: boolean
  errorId?: string
  onEnter?: () => void
}) {
  const id = useId()
  return (
    /* A one-field form: Enter submits it natively, with no key handler (the no-timers rule
       forbids keystroke capture). */
    <form
      className="field"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        onEnter?.()
      }}
    >
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="field__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        autoComplete={autoComplete}
        autoCapitalize={type === 'email' ? 'none' : 'characters'}
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
        aria-invalid={invalid || undefined}
        aria-describedby={invalid && errorId ? errorId : undefined}
      />
    </form>
  )
}
