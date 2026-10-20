import { useId } from 'react'
import { Then } from './Comic'
import { PanelArt, type ArtKey } from './PanelArt'
import type { Look } from './portraitArt'
import './beat.css'

export interface BeatThen {
  /** "After your last decision:" */
  lead?: string
  text: string
  look?: Look
  label?: string
}

/**
 * The top of a decision page, built as a comic page that flows from the last decision into the
 * next (EVAL-10, owner). It reads top to bottom on a phone, like a webtoon, with gutters
 * between panels of different sizes:
 *   1. what happened: the last decision's consequence with the face of whoever led it (`Then`),
 *      or, on a chapter's first decision, a title panel (the chapter and its opening line);
 *   2. how it unfolds: a small drawn prop panel (`PanelArt`, no faces) beside the scene caption;
 *   3. the decision: the question in a caption box as the screen's h1, in sentence case, with
 *      its Hinglish under it in the help mode. The colleague cards follow as the page's largest
 *      panels, every card the same size, then the action.
 * Focus lands on the h1, which names panels 1 and 2 as its description. Captions are 25 words
 * or fewer (story-check). No heavy asset: the props are inline SVG.
 */
export function Beat({
  then,
  title,
  scene,
  art,
  question,
  help,
}: {
  then?: BeatThen
  /** A chapter's first decision opens with a title panel instead of panel 1. */
  title?: { kicker: string; title: string; body?: string }
  scene?: string
  /** The prop drawn beside the scene (panel 2). */
  art?: ArtKey
  question: string
  /** The question in Hinglish under it, for "English with Hinglish help". */
  help?: string
}) {
  const id = useId()
  const ids = [title || then ? `${id}-t` : '', scene ? `${id}-s` : ''].filter(Boolean).join(' ')
  return (
    <div className="beat">
      {title ? (
        <div className="beat__title" id={`${id}-t`}>
          <p className="beat__kicker">{title.kicker}</p>
          <p className="beat__chapter">{title.title}</p>
          {title.body ? <p className="beat__opening">{title.body}</p> : null}
        </div>
      ) : then ? (
        <Then id={`${id}-t`} {...then} />
      ) : null}
      {scene ? (
        <div className="beat__unfold">
          {art ? (
            <div className="beat__prop">
              <PanelArt art={art} />
            </div>
          ) : null}
          <p className="beat__scene" id={`${id}-s`}>
            {scene}
          </p>
        </div>
      ) : null}
      <div className="beat__ask">
        <h1 className="beat__question" aria-describedby={ids || undefined}>
          {question}
        </h1>
        {help ? (
          <p className="beat__help" lang="hi-Latn">
            {help}
          </p>
        ) : null}
      </div>
    </div>
  )
}
