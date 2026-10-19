import { Portrait } from './Portrait'
import './colleague.css'

export interface ColleagueView {
  figure: string
  /** Words for a screen reader: "woman, darker skin tone" or "panda". */
  figureLabel: string
  /** The week-one mascot, kept small beside the person after the reveal. */
  badge?: string
  name: string
  cues: string[]
  description?: string
}

/** One colleague of the season's fixed cast: a large portrait, the name and its cue lines, and this job's notes. */
export function Colleague({ c }: { c: ColleagueView }) {
  return (
    <span className="colleague">
      <Portrait figure={c.figure} label={c.figureLabel} badge={c.badge} />
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
