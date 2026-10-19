import type { ReactNode } from 'react'
import './text.css'

export function Text({
  kind,
  children,
  id,
  lang,
}: {
  kind?: 'lead' | 'small' | 'muted' | 'strong'
  children: ReactNode
  id?: string
  lang?: string
}) {
  return (
    <p className={kind ? `text text--${kind}` : 'text'} id={id} lang={lang}>
      {children}
    </p>
  )
}

export function Heading({ children, level = 2 }: { children: ReactNode; level?: 2 | 3 }) {
  return level === 3 ? (
    <h3 className="heading heading--sub">{children}</h3>
  ) : (
    <h2 className="heading">{children}</h2>
  )
}
