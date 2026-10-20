import type { ReactNode } from 'react'
import './iconlist.css'

export type NoteIconKind =
  'lens' | 'cast' | 'result' | 'descriptions' | 'chapters' | 'saved' | 'noname' | 'code'

/* Small line icons from the comic art kit, drawn for the note register (EVAL-10): ink lines on
   the paper, a tan fill where a shape needs one. None depicts a cue: no face, no skin, no
   religious or regional symbol (the cast is three blank silhouettes). */
const PATHS: Record<NoteIconKind, ReactNode> = {
  lens: (
    <>
      <circle cx="10" cy="10" r="6" className="icon__fill" />
      <path d="M14.5 14.5 L21 21" />
    </>
  ),
  cast: (
    <>
      <circle cx="6" cy="9" r="2.6" className="icon__fill" />
      <circle cx="12" cy="7.5" r="2.8" className="icon__fill" />
      <circle cx="18" cy="9" r="2.6" className="icon__fill" />
      <path d="M2 19 C2 14.5 10 14.5 10 19 M8 18 C8 12.5 16 12.5 16 18 M14 19 C14 14.5 22 14.5 22 19" />
    </>
  ),
  result: (
    <>
      <rect x="3" y="5" width="18" height="14" className="icon__fill" />
      <path d="M6 13 L18 13 M12 10.5 L12 15.5" />
      <circle cx="9" cy="13" r="1.8" className="icon__dot" />
    </>
  ),
  descriptions: (
    <>
      <rect x="4" y="3" width="16" height="18" className="icon__fill" />
      <path d="M7 8 L17 8 M7 12 L17 12 M7 16 L13 16" />
    </>
  ),
  chapters: (
    <>
      <rect x="3" y="6" width="12" height="14" className="icon__fill" />
      <path d="M7 6 L7 3 L19 3 L19 17 L15 17" />
    </>
  ),
  saved: (
    <>
      <path d="M6 3 L18 3 L18 21 L12 16 L6 21 Z" className="icon__fill" />
    </>
  ),
  noname: (
    <>
      <rect x="3" y="7" width="18" height="11" className="icon__fill" />
      <path d="M6 11 L14 11 M6 14 L11 14 M3 20 L21 5" />
    </>
  ),
  code: (
    <>
      <circle cx="8" cy="12" r="4" className="icon__fill" />
      <path d="M12 12 L21 12 M18 12 L18 15 M21 12 L21 15" />
    </>
  ),
}

export interface IconRow {
  icon: NoteIconKind
  text: string
  /** The Hinglish under it, smaller, in the "English with Hinglish help" mode. */
  help?: string
}

/**
 * Tight rows of a small drawn icon and one line of text (EVAL-10's merged "Before you start"
 * screen): the four registered sentences, then the practical points. A list, so a screen reader
 * hears the count; the icons are decorative.
 */
export function IconList({ items, label }: { items: IconRow[]; label?: string }) {
  return (
    <ul className="iconlist" aria-label={label}>
      {items.map((it) => (
        <li className="iconlist__row" key={it.text}>
          <svg className="iconlist__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            {PATHS[it.icon]}
          </svg>
          <span className="iconlist__text">
            {it.text}
            {it.help ? (
              <span className="iconlist__help" lang="hi-Latn">
                {it.help}
              </span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  )
}
