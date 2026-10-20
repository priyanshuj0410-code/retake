import type { ReactNode } from 'react'
import './button.css'

export function Button({
  kind = 'primary',
  onClick,
  disabled,
  children,
  label,
  type = 'button',
}: {
  /** `nav`: Back, a small arrow-and-word control at the top left of a screen (EVAL-10). */
  kind?: 'primary' | 'secondary' | 'quiet' | 'nav'
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
  /** The full spoken name, where the visible word is short ("Back: change your last decision"). */
  label?: string
  type?: 'button' | 'submit'
}) {
  return (
    <button
      type={type}
      className={`button button--${kind}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {kind === 'nav' ? (
        <svg className="button__arrow" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path d="M10 3 L5 8 L10 13" />
        </svg>
      ) : null}
      {children}
    </button>
  )
}
