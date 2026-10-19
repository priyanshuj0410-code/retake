import type { ReactNode } from 'react'
import './button.css'

export function Button({
  kind = 'primary',
  onClick,
  disabled,
  children,
  type = 'button',
}: {
  kind?: 'primary' | 'secondary' | 'quiet'
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
