import type { ReactNode } from 'react'
import './stack.css'

/** Layout for screens, which never write a class or a style themselves. */
export function Stack(props: { children: ReactNode; gap?: 's' | 'm' | 'l'; label?: string }) {
  return (
    <div className="stack" data-gap={props.gap ?? 'm'} aria-label={props.label} role={props.label ? 'group' : undefined}>
      {props.children}
    </div>
  )
}
export function Cluster(props: { children: ReactNode }) {
  return <div className="cluster">{props.children}</div>
}
export function Split(props: { children: ReactNode }) {
  return <div className="split">{props.children}</div>
}
