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
}

/**
 * One colleague: a portrait panel, the name and its cue lines, and this job's notes. `cell` puts
 * the panel on top (the ranking and pick cards), `row` puts a 72 px face beside the words (the
 * split). All spans, so it can sit inside a button.
 */
export function Colleague({
  c,
  layout = 'cell',
  eager,
}: {
  c: ColleagueView
  layout?: 'cell' | 'row'
  /** Load a generated image at once (the first cards, above the fold). */
  eager?: boolean
}) {
  return (
    <span className={layout === 'cell' ? 'colleague' : 'colleague colleague--row'}>
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
      </span>
    </span>
  )
}
