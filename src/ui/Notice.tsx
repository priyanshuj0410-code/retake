import type { ReactNode } from 'react'
import './notice.css'

export function Notice({
  kind = 'info',
  id,
  children,
}: {
  kind?: 'info' | 'error' | 'ok'
  /** For a Field's aria-describedby. */
  id?: string
  children: ReactNode
}) {
  return (
    <p
      id={id}
      className={kind === 'info' ? 'notice' : `notice notice--${kind}`}
      role={kind === 'error' ? 'alert' : 'status'}
    >
      {children}
    </p>
  )
}
