import type { ReactNode } from 'react'
import './group.css'

/**
 * A named section of a page whose parts are spaced on the page's flow (one rule pitch in the note
 * register): a heading, its text, each label with its field, the button, and any notice, none of
 * them touching. Without a `label` it is only the spacing (a div, no landmark), for a block whose
 * own component already names itself. `screen` marks a group that does its work on screen only
 * (a form, the share card), so it does not print (EVAL-11).
 */
export function Group({
  label,
  screen,
  children,
}: {
  label?: string
  screen?: boolean
  children: ReactNode
}) {
  const className = screen ? 'group group--screen' : 'group'
  return label ? (
    <section className={className} aria-label={label}>
      {children}
    </section>
  ) : (
    <div className={className}>{children}</div>
  )
}
