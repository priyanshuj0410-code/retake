import type { ReactNode } from 'react'
import './text.css'

export function Text(props: { children: ReactNode; size?: 's' | 'm' | 'l'; lang?: string }) {
  return (
    <p className="text" data-size={props.size ?? 'm'} lang={props.lang}>
      {props.children}
    </p>
  )
}

export function Heading(props: { children: ReactNode; id?: string }) {
  return (
    <h2 className="heading" id={props.id}>
      {props.children}
    </h2>
  )
}

/** The screen's display heading: Sarpanch in Lugdi, Hind bold in Station, accent colour. */
export function Title(props: { children: ReactNode }) {
  return <h1 className="title">{props.children}</h1>
}

export function Link(props: { href: string; children: ReactNode }) {
  return (
    <a className="link" href={props.href}>
      {props.children}
    </a>
  )
}
