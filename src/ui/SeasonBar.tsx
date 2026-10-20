import './seasonbar.css'

export interface SeasonProgress {
  /** How much of the season is done, 0 to 1. */
  value: number
  /** Where each chapter after the first starts, 0 to 1: the ticks. */
  ticks: number[]
  /** The same in words, for a screen reader: "Chapter 2 of 5, The complaint: a third of the season done". */
  label: string
}

/**
 * The season's one progress bar in the sticky header (EVAL-10, owner): a thin line filled to
 * how much of the season is done, with a tick where each chapter starts. It replaces the
 * chapter circles and the card dots of EVAL-8 (the circles live on the chapter-end screen as
 * the `SeasonMap`). Progress only: no countdown, no motion, nothing interactive.
 */
export function SeasonBar({ value, ticks, label }: SeasonProgress) {
  const pc = (x: number) => `${Math.round(Math.min(1, Math.max(0, x)) * 1000) / 10}%`
  return (
    <div className="seasonbar" role="img" aria-label={label}>
      <span className="seasonbar__fill" style={{ width: pc(value) }} />
      {ticks.map((t) => (
        <span className="seasonbar__tick" key={t} style={{ left: pc(t) }} />
      ))}
    </div>
  )
}
