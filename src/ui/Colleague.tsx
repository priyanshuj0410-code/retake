import { Portrait } from './Portrait'
import type { Look } from './portraitArt'
import './colleague.css'

export interface ColleagueView {
  look: Look
  /** Words for a screen reader: "woman, darker skin tone, glasses" or "panda". */
  figureLabel: string
  /** The mascot of the first decisions, kept as a small inset in the corner after the reveal. */
  inset?: Look
  name: string
  cues: string[]
  description?: string
  /** The description in Hinglish, under it, for "English with Hinglish help" (EVAL-10). */
  descriptionHelp?: string
}

/**
 * One colleague: a portrait panel, the name and its cue lines, and this job's description
 * (17 px or more, EVAL-10), and its Hinglish under it in the help mode. `cell` puts
 * the panel on top (the ranking and pick cards), `row` puts a 72 px face beside the words (the
 * split). All spans, so it can sit inside a button.
 */
export function Colleague({
  c,
  layout = 'cell',
  eager,
}: {
  c: ColleagueView
  /** `split`: a row on phones, the face on top from 600 px, where a split's cards are three across (EVAL-10). */
  layout?: 'cell' | 'row' | 'split'
  /** Load a generated image at once (the first cards, above the fold). */
  eager?: boolean
}) {
  return (
    <span
      className={
        layout === 'cell'
          ? 'colleague'
          : layout === 'split'
            ? 'colleague colleague--row colleague--split'
            : 'colleague colleague--row'
      }
    >
      {layout === 'cell' ? (
        <span className="colleague__face">
          <Portrait look={c.look} label={c.figureLabel} inset={c.inset} eager={eager} />
        </span>
      ) : (
        <Portrait look={c.look} label={c.figureLabel} inset={c.inset} size="row" eager={eager} />
      )}
      <span className="colleague__who">
        <span className="colleague__name">{c.name}</span>
        {c.cues.map((q) => (
          <span className="colleague__cue" key={q}>
            {q}
          </span>
        ))}
        {c.description ? <span className="colleague__desc">{c.description}</span> : null}
        {c.descriptionHelp ? (
          <span className="colleague__help" lang="hi-Latn">
            {c.descriptionHelp}
          </span>
        ) : null}
      </span>
    </span>
  )
}
