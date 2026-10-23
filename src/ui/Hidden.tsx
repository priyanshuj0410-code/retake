import type { ReactNode } from 'react'
import './hidden.css'

/** Words for screen readers only: the name of a group or a state the picture already shows. */
export function Hidden(props: { children: ReactNode; as?: 'span' | 'h1' | 'h2' }) {
  const Tag = props.as ?? 'span'
  return <Tag className="vh">{props.children}</Tag>
}
