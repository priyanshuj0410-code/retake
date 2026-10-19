import type { ReactNode } from 'react'
import './link.css'

export function Link({ href, download, children }: { href: string; download?: string; children: ReactNode }) {
  return (
    <a className="link" href={href} download={download}>
      {children}
    </a>
  )
}
