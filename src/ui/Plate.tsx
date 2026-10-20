import type { ReactNode } from 'react'
import './plate.css'

export type Tone = 'sheet' | 'plate' | 'ticket' | 'band' | 'ground'

/** A surface for information (not an option): a cover plate, a white sheet, a ticket. */
export function Plate(props: { children: ReactNode; tone?: Tone; label?: string }) {
  return (
    <section className="plate" data-tone={props.tone ?? 'sheet'} aria-label={props.label}>
      {props.children}
    </section>
  )
}
