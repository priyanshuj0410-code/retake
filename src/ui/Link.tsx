import type { ReactNode } from 'react'
import './link.css'

export function Link({
  href,
  download,
  label,
  children,
}: {
  href: string
  download?: string
  /** The full spoken name, where the visible words are short ("Open the full report: ..."). */
  label?: string
  children: ReactNode
}) {
  return (
    <a className="link" href={href} download={download} aria-label={label}>
      {children}
    </a>
  )
}
