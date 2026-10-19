import { useId } from 'react'
import './field.css'

export function Field({
  label,
  value,
  onChange,
  autoComplete = 'off',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
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
        autoComplete={autoComplete}
        autoCapitalize="characters"
        spellCheck={false}
      />
    </div>
  )
}
