import type { ReactNode } from 'react'
import './notice.css'

/** A plain label that something is sample data or a draft, or a short status line. */
export function Notice(props: { children: ReactNode; live?: boolean }) {
  return (
    <p className="notice" role={props.live ? 'status' : undefined}>
      {props.children}
    </p>
  )
}
