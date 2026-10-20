import type { ReactNode } from 'react'
import './button.css'

export function Button({
  kind = 'primary',
  onClick,
  disabled,
  children,
  type = 'button',
}: {
  /** `nav`: Back, a small link-like control at the top left of a screen (EVAL-10). */
  kind?: 'primary' | 'secondary' | 'quiet' | 'nav'
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
  type?: 'button' | 'submit'
}) {
  return (
    <button type={type} className={`button button--${kind}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
