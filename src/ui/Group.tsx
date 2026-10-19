import type { ReactNode } from 'react'
import './group.css'

/**
 * A named section of a page whose parts are spaced on the page's flow (one rule pitch in the note
 * register): a heading, its text, each label with its field, the button, and any notice, none of
 * them touching.
 */
export function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="group" aria-label={label}>
      {children}
    </section>
  )
}
