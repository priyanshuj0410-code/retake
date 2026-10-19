import { useId } from 'react'
import './field.css'

export function Field({
  label,
  value,
  onChange,
  autoComplete = 'off',
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  /** text (codes, upper-cased on phones) or email (the optional stay-in-touch form). */
  type?: 'text' | 'email'
}) {
  const id = useId()
  return (
    <div className="field">
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
        spellCheck={false}
      />
    </div>
  )
}
