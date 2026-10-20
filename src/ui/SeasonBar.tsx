import './seasonbar.css'

export interface SeasonProgress {
  /** How much of the season is done, 0 to 1. */
  value: number
  /** Where each chapter after the first (and the finale) starts, 0 to 1. */
  ticks: number[]
  /** The same in words, for a screen reader: "Chapter 2 of 5 · The complaint: 30 per cent of the season done". */
  label: string
}

/**
 * The season's one progress bar in the sticky header (EVAL-10, owner; checked against
 * Duolingo's lesson header, Cal AI's and Finch's questionnaire bars in Lazyweb): a thin rounded
 * track in a tint with the done part in the accent, split into one segment per chapter and the
 * finale by small gaps, never tall ticks. Progress only: no countdown, no motion, nothing
 * interactive.
 */
export function SeasonBar({ value, ticks, label }: SeasonProgress) {
  const edges = [0, ...ticks, 1]
  const pc = (x: number) => `${Math.round(Math.min(1, Math.max(0, x)) * 1000) / 10}%`
  return (
    <div className="seasonbar" role="img" aria-label={label}>
      {edges.slice(1).map((end, i) => {
        const start = edges[i]
        const span = end - start
        return (
          <span className="seasonbar__seg" key={start} style={{ flexGrow: span }}>
            <span
              className="seasonbar__fill"
              style={{ width: pc(span > 0 ? (value - start) / span : 0) }}
            />
          </span>
        )
      })}
    </div>
  )
}
