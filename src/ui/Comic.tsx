import type { ReactNode } from 'react'
import { PanelArt, type ArtKey } from './PanelArt'
import { Portrait } from './Portrait'
import type { Look } from './portraitArt'
import { useSvgId } from './svgId'
import './comic.css'

/**
 * The comic register's pieces (knowledge/design.md, section 4c). They appear on the game
 * surface only; out of fiction there are no panels, captions or stamps.
 */

/** A panel: an ink-ruled box, tinted or paper. */
export function Panel({
  tone = 'tint',
  children,
}: {
  tone?: 'tint' | 'paper'
  children: ReactNode
}) {
  return <div className={tone === 'tint' ? 'panel' : 'panel panel--paper'}>{children}</div>
}

/** A narration caption: the yellow box with an offset ink shadow. */
export function Caption({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p className="caption" id={id}>
      {children}
    </p>
  )
}

/** A round stamp (a rank, a share), tilted a little; empty it is a dashed ring with nothing in it. */
export function Stamp({ children }: { children?: ReactNode }) {
  return (
    <span className={children === undefined ? 'stamp stamp--empty' : 'stamp'} aria-hidden="true">
      {children}
    </span>
  )
}

/** An episode or scene opener: the violet splash panel with a halftone ground and the screen's h1. */
export function Splash({
  kicker,
  title,
  body,
  describedBy,
}: {
  kicker?: string
  title: string
  body?: string
  /** Ids of what the heading should be read with (the consequence panel above). */
  describedBy?: string
}) {
  const id = useSvgId()
  return (
    <div className="splash">
      <svg className="splash__dots" aria-hidden="true" focusable="false">
        <defs>
          <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="2" className="splash__dot" fillOpacity="0.16" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
      {kicker ? <p className="splash__kicker">{kicker}</p> : null}
      <h1 className="splash__title" aria-describedby={describedBy}>
        {title}
      </h1>
      {body ? <p className="splash__body">{body}</p> : null}
    </div>
  )
}

/**
 * What came of the last decision: a small panel, deliberately smaller than the new scene, with
 * the face of whoever led it (or none) and the answer restated in small type.
 */
export function Then({
  id,
  text,
  answer,
  look,
  label,
}: {
  id?: string
  text: string
  answer?: string
  look?: Look
  label?: string
}) {
  return (
    <div className="then" id={id}>
      {look ? <Portrait look={look} label={label ?? ''} size="then" eager /> : null}
      <span className="then__words">
        <span className="then__text">{text}</span>
        {answer ? <span className="then__answer">{answer}</span> : null}
      </span>
    </div>
  )
}

/** A story interlude as a strip of two or three panels, each a drawn scene with its caption. */
export function Strip({
  panels,
  label,
}: {
  panels: { art: ArtKey; text: string }[]
  label: string
}) {
  return (
    <div className="strip" role="group" aria-label={label}>
      {panels.map((p, i) => (
        <figure
          key={p.text}
          className={
            i === 0 || panels.length === 2 ? 'strip__panel strip__panel--wide' : 'strip__panel'
          }
        >
          <figcaption className="caption strip__caption">{p.text}</figcaption>
          <PanelArt art={p.art} />
        </figure>
      ))}
    </div>
  )
}

export interface CastTile {
  look: Look
  label: string
  inset?: Look
  name: string
  lines: string[]
}

/**
 * The cast in panels: the week-one mascot sheet (`sheet`, four across), the reveal and the
 * season's end (`reveal`, two across on phones and four from 600 px), each face over a yellow
 * caption with the name and its lines.
 */
export function CastGrid({
  items,
  label,
  kind,
}: {
  items: CastTile[]
  label: string
  kind: 'sheet' | 'reveal'
}) {
  return (
    <ul className={`castgrid castgrid--${kind}`} aria-label={label}>
      {items.map((it, i) => (
        <li className="castgrid__tile" key={it.name}>
          <Portrait look={it.look} label={it.label} inset={it.inset} eager={i < 4} />
          <p className="castgrid__caption">
            <span className="castgrid__name">{it.name}</span>
            {it.lines.map((l, i) => (
              <span className="castgrid__line" key={`${i}-${l}`}>
                {l}
              </span>
            ))}
          </p>
        </li>
      ))}
    </ul>
  )
}
