import type { ReactNode } from 'react'
import './text.css'

export function Text({ kind, children, id, lang }: { kind?: 'lead' | 'small' | 'muted' | 'strong'; children: ReactNode; id?: string; lang?: string }) {
  return (
    <p className={kind ? `text text--${kind}` : 'text'} id={id} lang={lang}>
      {children}
    </p>
  )
}

export function Heading({ children }: { children: ReactNode }) {
  return <h2 className="heading">{children}</h2>
}
